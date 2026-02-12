import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { type HandRecord } from '@/stores/gameStore';
import {
  reconstructReplayState,
  getPhases,
  getFirstIndexForPhase,
} from '@/lib/replayEngine';
import GameTable from './GameTable';
import X from 'lucide-react/dist/esm/icons/x';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Play from 'lucide-react/dist/esm/icons/play';
import Pause from 'lucide-react/dist/esm/icons/pause';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';

interface HandReplayModalProps {
  record: HandRecord;
  onClose: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const ACTION_LABELS: Record<string, string> = {
  fold: 'folds',
  check: 'checks',
  call: 'calls',
  raise: 'raises',
  'all-in': 'goes all-in',
  'post-blind': 'posts blind',
};

export default function HandReplayModal({ record, onClose }: HandReplayModalProps) {
  const [actionIndex, setActionIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalActions = record.actions.length;
  const state = reconstructReplayState(record, actionIndex);
  const phases = getPhases(record.actions);

  // Convert replay state to GameTable-compatible format
  const tablePlayers = state.players.map((p) => ({
    id: p.id,
    name: p.name,
    chips: p.chips,
    cards: p.cards.map((c) => {
      const rank = c.slice(0, -1);
      const suitChar = c.slice(-1);
      const suitMap: Record<string, string> = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
      return { rank, suit: suitMap[suitChar] || suitChar };
    }),
    currentBet: p.currentBet,
    hasFolded: p.hasFolded,
    isAllIn: p.isAllIn,
    isHuman: p.isHuman,
    aiProfile: undefined,
  }));

  const communityCards = state.communityCards.map((c) => {
    const rank = c.slice(0, -1);
    const suitChar = c.slice(-1);
    const suitMap: Record<string, string> = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' };
    return { rank, suit: suitMap[suitChar] || suitChar };
  });

  // Build handActions for GameTable's last-action display (only up to current index)
  const visibleActions = actionIndex >= 0 ? record.actions.slice(0, actionIndex + 1) : [];

  // Current action description
  const currentAction = state.currentAction;
  const actionDesc = currentAction
    ? `${currentAction.playerName} ${ACTION_LABELS[currentAction.action] || currentAction.action}${
        currentAction.amount > 0 && currentAction.action !== 'fold' && currentAction.action !== 'check'
          ? ` $${currentAction.amount}`
          : ''
      }`
    : 'Hand start';

  // Find coaching feedback for the current action (human actions only)
  const currentFeedback = currentAction && currentAction.playerId === 'human'
    ? record.feedbacks.find((fb) => fb.phase === currentAction.phase)
    : null;

  // Auto-play
  useEffect(() => {
    if (isPlaying && actionIndex < totalActions - 1) {
      timerRef.current = setTimeout(() => {
        setActionIndex((i) => i + 1);
      }, 1200);
    } else if (isPlaying && actionIndex >= totalActions - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, actionIndex, totalActions]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setIsPlaying(false);
          setActionIndex((i) => Math.max(-1, i - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setIsPlaying(false);
          setActionIndex((i) => Math.min(totalActions - 1, i + 1));
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case 'Escape':
          onClose();
          break;
      }
    },
    [totalActions, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const goToPhase = (phase: string) => {
    setIsPlaying(false);
    setActionIndex(getFirstIndexForPhase(record.actions, phase));
  };

  const reset = () => {
    setIsPlaying(false);
    setActionIndex(-1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-white">Hand Replay</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-background-secondary text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Table */}
        <div className="px-4 pt-2">
          <GameTable
            players={tablePlayers as any}
            communityCards={communityCards as any}
            pot={state.pot}
            dealerIndex={0}
            activePlayerIndex={-1}
            phase={state.phase}
            handActions={visibleActions}
            isReplay
          />
        </div>

        {/* Street tabs */}
        <div className="flex gap-1 px-4 pt-2">
          {phases.map((phase) => (
            <button
              key={phase}
              onClick={() => goToPhase(phase)}
              className={cn(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                state.phase === phase
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-background-tertiary text-muted-foreground hover:text-white'
              )}
            >
              {PHASE_LABELS[phase] || phase}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsPlaying(false);
                setActionIndex((i) => Math.max(-1, i - 1));
              }}
              disabled={actionIndex <= -1}
              className="p-2 rounded-lg hover:bg-background-secondary text-muted-foreground hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <input
                type="range"
                min={-1}
                max={totalActions - 1}
                value={actionIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setActionIndex(Number(e.target.value));
                }}
                className="w-full accent-gold"
              />
              <div className="text-center text-xs text-muted-foreground mt-1">
                {actionIndex + 2} / {totalActions + 1}
              </div>
            </div>

            <button
              onClick={() => {
                setIsPlaying(false);
                setActionIndex((i) => Math.min(totalActions - 1, i + 1));
              }}
              disabled={actionIndex >= totalActions - 1}
              className="p-2 rounded-lg hover:bg-background-secondary text-muted-foreground hover:text-white transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action description + play controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={reset}
              className="p-2 rounded-lg hover:bg-background-secondary text-muted-foreground hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="flex-1 text-sm text-white">{actionDesc}</div>
          </div>

          {/* Coaching feedback for current human action */}
          {currentFeedback && (
            <div
              className={cn(
                'text-sm p-3 rounded-lg border',
                currentFeedback.grade === 'Good'
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : currentFeedback.grade === 'Mistake'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              )}
            >
              <span className="font-bold text-xs uppercase mr-2">{currentFeedback.grade}</span>
              <span className="text-white">{currentFeedback.message}</span>
              {currentFeedback.detail && (
                <p className="text-gray-500 text-xs mt-1">{currentFeedback.detail}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
