import { useState } from 'react';
import { cn } from '@/lib/utils';
import { type HandRecord, type HandAction } from '@/stores/gameStore';
import { type FeedbackGrade } from '@/lib/coaching';
import PlayingCard from '@/components/games/PlayingCard';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';

interface HandSummaryProps {
  record: HandRecord;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onRequestAnalysis?: () => Promise<DeepAnalysis | null>;
}

export interface DeepAnalysis {
  overallGrade: string;
  streetAnalysis: Array<{ street: string; grade: string; analysis: string }>;
  keyLessons: string[];
  coachNote: string;
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

export default function HandSummary({ record, onPlayAgain, onBackToMenu, onRequestAnalysis }: HandSummaryProps) {
  const humanPlayer = record.players.find((p) => p.id === 'human');
  const won = record.winners.includes('You');
  const chipDelta = humanPlayer?.chipDelta || 0;

  const [deepAnalysis, setDeepAnalysis] = useState<DeepAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const handleDeepAnalysis = async () => {
    if (!onRequestAnalysis || analysisLoading || deepAnalysis) return;
    setAnalysisLoading(true);
    try {
      const result = await onRequestAnalysis();
      setDeepAnalysis(result);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Group actions by phase
  const actionsByPhase = groupActionsByPhase(record.actions);
  const phases = Object.keys(actionsByPhase);

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
        {phases.map((phase) => (
          <StreetSection
            key={phase}
            phase={phase}
            actions={actionsByPhase[phase]}
          />
        ))}

        {/* Showdown — reveal all hands in timeline */}
        <div>
          <div className="text-xs font-semibold text-gold uppercase mb-2">Showdown</div>
          <div className="space-y-1.5 pl-3 border-l-2 border-border">
            {record.players.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-medium w-14 truncate',
                  p.id === 'human' ? 'text-white' : 'text-muted-foreground'
                )}>
                  {p.name}
                </span>
                <div className="flex gap-0.5">
                  {p.cards.map((card, i) => (
                    <PlayingCard key={i} card={card} size="sm" />
                  ))}
                </div>
                {record.winners.includes(p.name) && (
                  <span className="text-[10px] text-gold font-bold ml-auto">WINNER</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coaching feedback summary */}
      {record.feedbacks.length > 0 && (
        <div className="card space-y-3">
          <h3 className="text-white font-semibold">Coaching Notes</h3>
          {record.feedbacks.map((fb, i) => (
            <div
              key={i}
              className={cn(
                'p-3 rounded-lg border text-sm',
                GRADE_COLORS[fb.grade]
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {fb.phase && (
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                    {PHASE_LABELS[fb.phase] || fb.phase}
                  </span>
                )}
                <span className="font-medium">{fb.grade}</span>
              </div>
              {fb.playerAction && (
                <p className="text-xs text-muted-foreground mb-1">
                  You: <span className="text-white">{fb.playerAction}</span>
                </p>
              )}
              <p>{fb.message}</p>
            </div>
          ))}
        </div>
      )}

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

      {/* AI Deep Analysis */}
      {deepAnalysis ? (
        <div className="card space-y-4 border-2 border-purple-500/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-white font-semibold">Deep Analysis</h3>
            <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded font-medium">
              Claude Opus
            </span>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{deepAnalysis.overallGrade}</div>
            <div className="text-xs text-muted-foreground">Overall Grade</div>
          </div>

          {deepAnalysis.streetAnalysis.map((sa, i) => (
            <div key={i} className="p-3 rounded-lg border border-border bg-background-tertiary text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                  {PHASE_LABELS[sa.street] || sa.street}
                </span>
                <span className="text-purple-400 font-medium">{sa.grade}</span>
              </div>
              <p className="text-gray-300">{sa.analysis}</p>
            </div>
          ))}

          {deepAnalysis.keyLessons.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Key Lessons</div>
              <ul className="space-y-1">
                {deepAnalysis.keyLessons.map((lesson, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-purple-400">•</span>
                    {lesson}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {deepAnalysis.coachNote && (
            <p className="text-sm text-purple-300 italic border-t border-border pt-3">
              {deepAnalysis.coachNote}
            </p>
          )}
        </div>
      ) : onRequestAnalysis ? (
        <button
          onClick={handleDeepAnalysis}
          disabled={analysisLoading}
          className={cn(
            'card w-full flex items-center justify-center gap-2 py-4 border-2 transition-all cursor-pointer',
            analysisLoading
              ? 'border-purple-500/30 opacity-60'
              : 'border-border hover:border-purple-500/30 hover:bg-purple-500/5'
          )}
        >
          {analysisLoading ? (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-400" />
          )}
          <span className="text-sm text-purple-400 font-medium">
            {analysisLoading ? 'Analyzing with Claude Opus...' : 'Get Deep Analysis'}
          </span>
        </button>
      ) : null}

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

function StreetSection({ phase, actions }: {
  phase: string;
  actions: HandAction[];
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-gold uppercase mb-2">
        {PHASE_LABELS[phase] || phase}
      </div>
      <div className="space-y-1 pl-3 border-l-2 border-border">
        {actions.map((action, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className={cn(
              'font-medium',
              action.playerId === 'human' ? 'text-white' : 'text-muted-foreground'
            )}>
              {action.playerName}
            </span>
            <span className={getActionColor(action.action)}>
              {formatAction(action)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
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
