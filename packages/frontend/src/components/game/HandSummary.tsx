import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { type HandRecord, type HandAction } from '@/stores/gameStore';
import { type FeedbackGrade, generateHandAnalysis } from '@/lib/coaching';
import PlayingCard from '@/components/games/PlayingCard';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

interface HandSummaryProps {
  record: HandRecord;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
  showdown: 'Showdown',
};

const GRADE_COLORS: Record<FeedbackGrade, string> = {
  Good: 'text-green-400 bg-green-500/10 border-green-500/30',
  Okay: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Mistake: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const ANALYSIS_GRADE_COLORS: Record<string, string> = {
  A: 'text-green-400',
  B: 'text-blue-400',
  C: 'text-yellow-400',
  D: 'text-orange-400',
  F: 'text-red-400',
};

export default function HandSummary({ record, onPlayAgain, onBackToMenu }: HandSummaryProps) {
  const humanPlayer = record.players.find((p) => p.id === 'human');
  const won = record.winners.includes('You');
  const chipDelta = humanPlayer?.chipDelta || 0;

  // Auto-generate retrospective analysis (instant, no API)
  const analysis = useMemo(() => generateHandAnalysis(record), [record]);

  // Group actions by phase
  const actionsByPhase = groupActionsByPhase(record.actions);
  const phases = Object.keys(actionsByPhase);

  // Derive community cards per street
  const boardByStreet = getBoardByStreet(record.communityCards);

  // Build a map of player cards by ID for inline display
  const playerCardsMap: Record<string, string[]> = {};
  for (const p of record.players) {
    playerCardsMap[p.id] = p.cards;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Result header */}
      <div className={cn(
        'card text-center',
        won ? 'felt-bg border-gold/30' : 'border-red-500/20'
      )}>
        <Trophy className={cn('w-12 h-12 mx-auto mb-3', won ? 'text-gold' : 'text-gray-500')} />
        <h2 className={cn('text-2xl font-bold mb-1', won ? 'text-gold' : 'text-red-400')}>
          {won ? 'You Won!' : 'You Lost'}
        </h2>
        <div className={cn('text-lg font-semibold', chipDelta >= 0 ? 'text-green-400' : 'text-red-400')}>
          {chipDelta >= 0 ? '+' : ''}{chipDelta} chips
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          Pot: ${record.pot}
        </div>
      </div>

      {/* Overall Grade */}
      <div className={cn(
        'card border-2 text-center',
        GRADE_COLORS[record.grade.grade as FeedbackGrade]
      )}>
        <div className="text-sm text-muted-foreground mb-1">Overall Grade</div>
        <div className="text-3xl font-bold">{record.grade.score}/100</div>
        <div className="text-sm font-semibold mt-1 uppercase">{record.grade.grade}</div>
      </div>

      {/* Street-by-street timeline */}
      <div className="card space-y-4">
        <h3 className="text-white font-semibold">Hand Timeline</h3>
        {phases.map((phase, pi) => {
          // Calculate pot at end of this street (sum of all amounts up to and including this phase)
          const priorPhases = phases.slice(0, pi + 1);
          const potAtStreet = record.actions
            .filter((a) => priorPhases.includes(a.phase as string))
            .reduce((sum, a) => sum + a.amount, 0);

          return (
            <StreetSection
              key={phase}
              phase={phase}
              actions={actionsByPhase[phase]}
              boardCards={boardByStreet[phase] || []}
              playerCards={playerCardsMap}
              potSize={potAtStreet}
            />
          );
        })}

        {/* Showdown — compact one-liner */}
        <div className="text-sm pl-3 border-l-2 border-gold/40 py-1">
          <span className="text-gold font-semibold">{record.winners.join(' & ')}</span>
          <span className="text-muted-foreground"> won ${record.pot} pot</span>
        </div>
      </div>

      {/* Coaching Review — merged coaching notes + hand analysis */}
      <div className="card space-y-4 border-2 border-purple-500/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-white font-semibold">Coaching Review</h3>
        </div>

        {/* Overall analysis grade */}
        <div className="text-center py-1">
          <div className={cn('text-2xl font-bold', ANALYSIS_GRADE_COLORS[analysis.overallGrade] || 'text-purple-400')}>
            {analysis.overallGrade}
          </div>
          <div className="text-xs text-muted-foreground">Overall Grade</div>
        </div>

        {/* Per-street analysis with inline coaching notes */}
        {analysis.streetAnalysis.map((sa) => {
          // Find coaching feedbacks for this street
          const streetFeedbacks = record.feedbacks.filter((fb) => fb.phase === sa.street);

          return (
            <div key={sa.street} className="space-y-2">
              {/* Street header + grade */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gold uppercase">
                  {PHASE_LABELS[sa.street] || sa.street}
                </span>
                <span className={cn('text-xs font-medium', ANALYSIS_GRADE_COLORS[sa.grade] || 'text-purple-400')}>
                  {sa.grade}
                </span>
              </div>

              {/* Retrospective analysis */}
              <div className="p-3 rounded-lg border border-border bg-background-tertiary text-sm">
                <p className="text-gray-300">{sa.analysis}</p>
              </div>

              {/* Per-action coaching notes for this street */}
              {streetFeedbacks.map((fb, i) => (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded-lg border text-sm ml-3',
                    GRADE_COLORS[fb.grade]
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{fb.grade}</span>
                  </div>
                  {fb.playerAction && (
                    <p className="text-xs text-muted-foreground mb-1">
                      You: <span className="text-white">{fb.playerAction}</span>
                    </p>
                  )}
                  <p>{fb.message}</p>
                  {fb.detail && (
                    <p className="text-xs text-muted-foreground mt-1">{fb.detail}</p>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {/* Key Lessons */}
        {analysis.keyLessons.length > 0 && (
          <div className="border-t border-border pt-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Key Lessons</div>
            <ul className="space-y-1.5">
              {analysis.keyLessons.map((lesson, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-purple-400 shrink-0">•</span>
                  {lesson}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coach's note */}
        {analysis.coachNote && (
          <p className="text-sm text-purple-300 italic border-t border-border pt-3">
            {analysis.coachNote}
          </p>
        )}
      </div>

      {/* Player Hands + Styles */}
      <div className="card space-y-3">
        <h3 className="text-white font-semibold">Players</h3>
        <div className="space-y-2">
          {record.players.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-medium truncate',
                    p.id === 'human' ? 'text-white' : 'text-muted-foreground'
                  )}>
                    {p.name}
                  </span>
                  {p.aiStyle && (
                    <span className="text-[10px] text-muted-foreground bg-background-tertiary px-1.5 py-0.5 rounded">
                      {p.aiStyle}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {p.cards.map((card, i) => (
                  <PlayingCard key={i} card={card} size="sm" />
                ))}
              </div>
              <span className={cn(
                'text-xs font-medium w-12 text-right',
                p.chipDelta > 0 ? 'text-green-400' : p.chipDelta < 0 ? 'text-red-400' : 'text-gray-400'
              )}>
                {p.chipDelta > 0 ? '+' : ''}{p.chipDelta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={onPlayAgain}
          className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Play Again
        </button>
        <button
          onClick={onBackToMenu}
          className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2"
        >
          Back to Menu
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StreetSection({ phase, actions, boardCards, playerCards, potSize }: {
  phase: string;
  actions: HandAction[];
  boardCards: string[];
  playerCards: Record<string, string[]>;
  potSize: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-semibold text-gold uppercase">
          {PHASE_LABELS[phase] || phase}
        </span>
        {/* Board cards for this street */}
        {boardCards.length > 0 && (
          <div className="flex gap-0.5">
            {boardCards.map((card, i) => (
              <PlayingCard key={i} card={card} size="sm" />
            ))}
          </div>
        )}
        <span className="text-[10px] text-muted-foreground ml-auto">
          Pot: ${potSize}
        </span>
      </div>
      <div className="space-y-1 pl-3 border-l-2 border-border">
        {actions.map((action, i) => {
          const cards = playerCards[action.playerId];
          const betLabel = action.action === 'raise'
            ? getBetOrRaiseLabel(actions, i)
            : null;

          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={cn(
                'font-medium',
                action.playerId === 'human' ? 'text-white' : 'text-muted-foreground'
              )}>
                {action.playerName}
              </span>
              {cards && cards.length === 2 && action.action !== 'post-blind' && (
                <div className="flex gap-0.5 opacity-40">
                  {cards.map((c, ci) => (
                    <PlayingCard key={ci} card={c} size="xs" />
                  ))}
                </div>
              )}
              <span className={getActionColor(action.action)}>
                {betLabel || formatAction(action)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Determine whether a 'raise' action is actually a "bet" (first aggression) or a "raise" */
function getBetOrRaiseLabel(actions: HandAction[], index: number): string | null {
  const action = actions[index];
  if (action.action !== 'raise') return null;

  const hasPriorBet = actions.slice(0, index).some(
    (a) => a.action === 'raise' || a.action === 'all-in'
  );

  if (action.phase === 'preflop') {
    return `raises $${action.amount}`;
  }

  if (hasPriorBet) {
    return `raises $${action.amount}`;
  }
  return `bets $${action.amount}`;
}

function getBoardByStreet(communityCards: string[]): Record<string, string[]> {
  const board: Record<string, string[]> = {};
  if (communityCards.length >= 3) {
    board.flop = communityCards.slice(0, 3);
  }
  if (communityCards.length >= 4) {
    board.turn = [communityCards[3]];
  }
  if (communityCards.length >= 5) {
    board.river = [communityCards[4]];
  }
  return board;
}

function groupActionsByPhase(actions: HandAction[]): Record<string, HandAction[]> {
  const grouped: Record<string, HandAction[]> = {};
  for (const action of actions) {
    const phase = action.phase as string;
    if (!grouped[phase]) grouped[phase] = [];
    grouped[phase].push(action);
  }
  return grouped;
}

function formatAction(action: HandAction): string {
  switch (action.action) {
    case 'fold': return 'folds';
    case 'check': return 'checks';
    case 'call': return `calls $${action.amount}`;
    case 'raise': return `raises $${action.amount}`;
    case 'all-in': return `all-in $${action.amount}`;
    case 'post-blind': return `posts blind $${action.amount}`;
  }
}

function getActionColor(action: string): string {
  switch (action) {
    case 'fold': return 'text-red-400';
    case 'raise':
    case 'all-in': return 'text-green-400';
    case 'call': return 'text-blue-400';
    default: return 'text-gray-400';
  }
}
