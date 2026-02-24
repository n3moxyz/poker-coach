import { useMemo, Fragment } from 'react';
import { cn } from '@/lib/utils';
import { type HandRecord, type HandAction } from '@/stores/gameStore';
import { type FeedbackGrade, generateHandAnalysis } from '@/lib/coaching';
import { useStreetEquities } from '@/hooks/useEquity';
import PlayingCard from '@/components/games/PlayingCard';
import EquityBar from './EquityBar';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

interface HandSummaryProps {
  record: HandRecord;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  xpEarned?: number | null;
  sessionContext?: string;
  isSignedIn?: boolean;
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

export default function HandSummary({ record, onPlayAgain, onBackToMenu, xpEarned, sessionContext, isSignedIn }: HandSummaryProps) {
  const humanPlayer = record.players.find((p) => p.id === 'human');
  const won = record.winners.includes('You');
  const chipDelta = humanPlayer?.chipDelta || 0;

  // Auto-generate retrospective analysis (instant, no API)
  const analysis = useMemo(() => generateHandAnalysis(record), [record]);

  // Monte Carlo equity per street (runs in Web Worker)
  const numOpponents = record.players.length - 1;
  const { equities: streetEquities, isComputing: equityComputing } = useStreetEquities(
    humanPlayer?.cards,
    record.communityCards,
    numOpponents,
    !!humanPlayer?.cards?.length
  );

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
      {/* Session Context */}
      {sessionContext && (
        <div className="text-sm text-muted-foreground text-center">{sessionContext}</div>
      )}

      {/* Overall Grade */}
      <div className={cn(
        'card border-2 text-center',
        GRADE_COLORS[record.grade.grade as FeedbackGrade]
      )}>
        <div className="text-sm text-muted-foreground mb-1">Overall Grade</div>
        <div className="text-3xl font-bold">{record.grade.score}/100</div>
        <div className="text-sm font-semibold uppercase mt-1">{record.grade.grade}</div>
        <div className="mt-2 pt-2 border-t border-white/10">
          {xpEarned != null && xpEarned > 0 ? (
            <span className="text-sm font-bold text-gold">
              +{xpEarned} XP earned
            </span>
          ) : isSignedIn === false ? (
            <span className="text-xs text-muted-foreground">
              Sign in to earn XP!
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              No XP earned this time, try again!
            </span>
          )}
        </div>
      </div>

      {/* Hand Review — timeline + inline coaching */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Hand Review</h3>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className={cn('text-sm font-bold', ANALYSIS_GRADE_COLORS[analysis.overallGrade] || 'text-purple-400')}>
              {analysis.overallGrade}
            </span>
          </div>
        </div>

        {phases.map((phase, pi) => {
          const priorPhases = phases.slice(0, pi + 1);
          const potAtStreet = record.actions
            .filter((a) => priorPhases.includes(a.phase as string))
            .reduce((sum, a) => sum + a.amount, 0);

          // Match analysis and feedbacks for this street
          const streetAnalysis = analysis.streetAnalysis.find((sa) => sa.street === phase);
          const streetFeedbacks = record.feedbacks.filter((fb) => fb.phase === phase);

          const equity = streetEquities[phase as keyof typeof streetEquities] ?? null;

          return (
            <StreetSection
              key={phase}
              phase={phase}
              actions={actionsByPhase[phase]}
              board={boardByStreet[phase]}
              playerCards={playerCardsMap}
              potSize={potAtStreet}
              streetAnalysis={streetAnalysis}
              streetFeedbacks={streetFeedbacks}
              equity={equity}
              equityComputing={equityComputing}
            />
          );
        })}

        {/* Showdown — compact one-liner */}
        <div className="text-sm pl-3 border-l-2 border-gold/40 py-1">
          <span className="text-gold font-semibold">{record.winners.join(' & ')}</span>
          <span className="text-muted-foreground"> won ${record.pot} pot</span>
        </div>

        {/* Coach's takeaway — combined lessons + note */}
        {(analysis.keyLessons.length > 0 || analysis.coachNote) && (
          <p className="text-sm text-purple-300 italic border-t border-border pt-3 leading-relaxed">
            {analysis.coachNote || analysis.keyLessons[0]}
          </p>
        )}
      </div>

      {/* Result — moved below commentary to focus on learning */}
      <div className={cn(
        'card text-center',
        won ? 'felt-bg border-gold/30' : 'border-red-500/20'
      )}>
        <Trophy className={cn('w-8 h-8 mx-auto mb-2', won ? 'text-gold' : 'text-gray-500')} />
        <h2 className={cn('text-xl font-bold mb-1', won ? 'text-gold' : 'text-red-400')}>
          {won ? 'You Won!' : 'You Lost'}
        </h2>
        <div className={cn('text-sm font-semibold', chipDelta >= 0 ? 'text-green-400' : 'text-red-400')}>
          {chipDelta >= 0 ? '+' : ''}{chipDelta} chips
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Pot: ${record.pot}
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

interface StreetSectionProps {
  phase: string;
  actions: HandAction[];
  board?: StreetBoard;
  playerCards: Record<string, string[]>;
  potSize: number;
  streetAnalysis?: { grade: string; analysis: string };
  streetFeedbacks: { grade: FeedbackGrade; message: string; detail?: string; playerAction?: string }[];
  equity: number | null;
  equityComputing: boolean;
}

function StreetSection({ phase, actions, board, playerCards, potSize, streetAnalysis, streetFeedbacks, equity, equityComputing }: StreetSectionProps) {
  return (
    <div>
      {/* Street header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-semibold text-gold uppercase">
          {PHASE_LABELS[phase] || phase}
        </span>
        {board && board.cards.length > 0 && (
          <div className="flex gap-0.5">
            {board.cards.map((card, i) => (
              <Fragment key={i}>
                <PlayingCard
                  card={card}
                  size="xs"
                  className={cn('sm:hidden', i < board.newCardIndex ? 'opacity-40' : 'ring-1 ring-gold/50')}
                />
                <PlayingCard
                  card={card}
                  size="sm"
                  className={cn('hidden sm:block', i < board.newCardIndex ? 'opacity-40' : 'ring-1 ring-gold/50')}
                />
              </Fragment>
            ))}
          </div>
        )}
        <span className="text-[10px] text-muted-foreground ml-auto">
          Pot: ${potSize}
        </span>
      </div>

      {/* Equity bar */}
      {(equity != null || equityComputing) && (
        <div className="mb-2">
          <EquityBar equity={equity} isComputing={equityComputing} label="Your Equity" />
        </div>
      )}

      {/* Actions */}
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

        {/* Inline coaching — verdict + optimal play */}
        {streetAnalysis && (
          <div className={cn(
            'mt-2 text-xs sm:text-sm p-2 rounded border',
            streetFeedbacks.length > 0
              ? GRADE_COLORS[streetFeedbacks[0].grade]
              : 'border-purple-500/20 bg-purple-500/5 text-gray-400'
          )}>
            <div className="flex items-start gap-2">
              <span className={cn('font-bold shrink-0', ANALYSIS_GRADE_COLORS[streetAnalysis.grade] || 'text-purple-400')}>
                {streetAnalysis.grade}
              </span>
              <div className="space-y-1.5">
                {/* What the player did + verdict */}
                <p className="text-white leading-relaxed">
                  {streetAnalysis.analysis}
                </p>
                {/* Optimal play recommendation */}
                {streetFeedbacks.length > 0 && streetFeedbacks[0].detail && (
                  <p className="text-gray-500 leading-relaxed">
                    {streetFeedbacks[0].detail}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
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

interface StreetBoard {
  cards: string[];
  newCardIndex: number; // index where the new card(s) start — for highlighting
}

function getBoardByStreet(communityCards: string[]): Record<string, StreetBoard> {
  const board: Record<string, StreetBoard> = {};
  if (communityCards.length >= 3) {
    board.flop = { cards: communityCards.slice(0, 3), newCardIndex: 0 };
  }
  if (communityCards.length >= 4) {
    board.turn = { cards: communityCards.slice(0, 4), newCardIndex: 3 };
  }
  if (communityCards.length >= 5) {
    board.river = { cards: communityCards.slice(0, 5), newCardIndex: 4 };
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
