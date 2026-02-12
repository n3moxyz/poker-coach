import { useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import History from 'lucide-react/dist/esm/icons/history';
import Gamepad2 from 'lucide-react/dist/esm/icons/gamepad-2';
import PlayCircle from 'lucide-react/dist/esm/icons/play-circle';
import { cn } from '@/lib/utils';
import { useGameHistory, useHandDetail } from '@/hooks/useApi';
import { type GameHistoryEntry } from '@/lib/api';
import { type HandRecord } from '@/stores/gameStore';
import HandReplayModal from '@/components/game/HandReplayModal';

const PAGE_SIZE = 20;

const RESULT_STYLES: Record<string, { text: string; bg: string }> = {
  WON: { text: 'text-green-400', bg: 'bg-green-500/10' },
  LOST: { text: 'text-red-400', bg: 'bg-red-500/10' },
  SPLIT: { text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  FOLDED: { text: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const GRADE_STYLES: Record<string, string> = {
  A: 'text-gold bg-gold/10 border-gold/30',
  B: 'text-green-400 bg-green-500/10 border-green-500/30',
  C: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  D: 'text-red-400 bg-red-500/10 border-red-500/30',
  F: 'text-red-600 bg-red-600/10 border-red-600/30',
};

const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-green-400' },
  medium: { label: 'Medium', color: 'text-yellow-400' },
  hard: { label: 'Hard', color: 'text-red-400' },
};

export default function GameHistory() {
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useGameHistory(PAGE_SIZE, offset);
  const [replayHandId, setReplayHandId] = useState<string | null>(null);
  const { data: handDetail } = useHandDetail(replayHandId);

  const hands = data?.hands || [];
  const total = data?.total || 0;
  const hasMore = offset + PAGE_SIZE < total;

  // Convert API handHistory JSON to HandRecord for the replayer
  const replayRecord = handDetail?.handHistory
    ? (handDetail.handHistory as HandRecord)
    : null;

  return (
    <div className="md:ml-64 pb-20 md:pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/play"
            className="p-2 rounded-lg hover:bg-background-secondary text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Hand History</h1>
            <p className="text-sm text-muted-foreground">
              {total} hand{total !== 1 ? 's' : ''} played
            </p>
          </div>
        </div>
        <Link
          to="/play"
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <Gamepad2 className="w-4 h-4" />
          Play
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-20" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && hands.length === 0 && (
        <div className="card text-center py-12">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No hands played yet</h2>
          <p className="text-muted-foreground mb-6">
            Play your first hand against AI opponents to see your history here.
          </p>
          <Link to="/play" className="btn-primary px-6 py-3">
            Start Playing
          </Link>
        </div>
      )}

      {/* Hand list */}
      {!isLoading && hands.length > 0 && (
        <div className="space-y-2">
          {hands.map((hand) => (
            <HandRow key={hand.id} hand={hand} onReplay={() => setReplayHandId(hand.id)} />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setOffset((o) => o + PAGE_SIZE)}
            className="btn-secondary px-6 py-2"
          >
            Load More
          </button>
        </div>
      )}

      {/* Replay Modal */}
      {replayRecord && replayHandId && (
        <HandReplayModal
          record={replayRecord}
          onClose={() => setReplayHandId(null)}
        />
      )}
    </div>
  );
}

function HandRow({ hand, onReplay }: { hand: GameHistoryEntry; onReplay: () => void }) {
  const resultStyle = RESULT_STYLES[hand.result] || RESULT_STYLES.FOLDED;
  const gradeStyle = hand.overallGrade ? GRADE_STYLES[hand.overallGrade] || '' : '';
  const diff = DIFFICULTY_LABELS[hand.difficulty] || { label: hand.difficulty, color: 'text-gray-400' };

  const date = new Date(hand.createdAt);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="card flex items-center gap-4">
      {/* Date */}
      <div className="text-center min-w-[60px]">
        <div className="text-sm text-white">{dateStr}</div>
        <div className="text-xs text-muted-foreground">{timeStr}</div>
      </div>

      {/* Difficulty */}
      <div className={cn('text-xs font-medium min-w-[50px]', diff.color)}>
        {diff.label}
      </div>

      {/* Result */}
      <div className={cn('px-2 py-1 rounded text-xs font-bold uppercase', resultStyle.text, resultStyle.bg)}>
        {hand.result}
      </div>

      {/* Grade */}
      {hand.overallGrade && (
        <div className={cn('px-2 py-1 rounded border text-xs font-bold', gradeStyle)}>
          {hand.overallGrade}
        </div>
      )}

      {/* Chip delta */}
      <div className="flex-1 text-right">
        <span className={cn(
          'text-sm font-semibold',
          hand.chipsDelta > 0 ? 'text-green-400' : hand.chipsDelta < 0 ? 'text-red-400' : 'text-gray-400'
        )}>
          {hand.chipsDelta > 0 ? '+' : ''}{hand.chipsDelta}
        </span>
        <span className="text-xs text-muted-foreground ml-1">chips</span>
      </div>

      {/* XP earned */}
      <div className="text-right min-w-[60px]">
        <span className="text-xs text-gold font-medium">+{hand.xpEarned} XP</span>
      </div>

      {/* Replay button */}
      <button
        onClick={onReplay}
        className="p-2 rounded-lg hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors"
        title="Replay hand"
      >
        <PlayCircle className="w-5 h-5" />
      </button>
    </div>
  );
}
