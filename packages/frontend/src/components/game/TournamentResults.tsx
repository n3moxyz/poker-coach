import { cn } from '@/lib/utils';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Medal from 'lucide-react/dist/esm/icons/medal';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

interface TournamentResultsProps {
  placement: number;
  totalPlayers: number;
  totalHandsPlayed: number;
  blindLevelReached: number;
  averageGrade: string;
  sessionXpEarned: number;
  eliminatedPlayers: string[];
  onNewTournament: () => void;
  onBackToMenu: () => void;
}

const PLACEMENT_STYLES: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: '1st Place', color: 'text-gold', bg: 'bg-gold/10 border-gold/40' },
  2: { label: '2nd Place', color: 'text-gray-300', bg: 'bg-gray-500/10 border-gray-400/30' },
  3: { label: '3rd Place', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
};

export default function TournamentResults({
  placement,
  totalPlayers,
  totalHandsPlayed,
  blindLevelReached,
  averageGrade,
  sessionXpEarned,
  eliminatedPlayers,
  onNewTournament,
  onBackToMenu,
}: TournamentResultsProps) {
  const style = PLACEMENT_STYLES[placement] || {
    label: `${placement}th Place`,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Placement */}
      <div className={cn('card border-2 text-center py-8', style.bg)}>
        {placement === 1 ? (
          <Trophy className={cn('w-16 h-16 mx-auto mb-3', style.color)} />
        ) : (
          <Medal className={cn('w-16 h-16 mx-auto mb-3', style.color)} />
        )}
        <h1 className={cn('text-3xl font-bold mb-1', style.color)}>{style.label}</h1>
        <p className="text-muted-foreground text-sm">
          Out of {totalPlayers} players
        </p>
      </div>

      {/* Stats */}
      <div className="card space-y-3">
        <h3 className="text-white font-semibold">Tournament Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Hands Played" value={String(totalHandsPlayed)} />
          <StatItem label="Blind Level" value={`Level ${blindLevelReached + 1}`} />
          <StatItem label="Avg Grade" value={averageGrade} />
          <StatItem label="XP Earned" value={`+${sessionXpEarned}`} highlight />
        </div>
      </div>

      {/* Elimination Order */}
      {eliminatedPlayers.length > 0 && (
        <div className="card space-y-2">
          <h3 className="text-white font-semibold text-sm">Elimination Order</h3>
          <div className="space-y-1">
            {eliminatedPlayers.map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-6">{i + 1}.</span>
                <span className="text-gray-300">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onNewTournament}
          className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Tournament
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

function StatItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-background-tertiary rounded-lg p-3 text-center">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={cn('text-lg font-bold', highlight ? 'text-gold' : 'text-white')}>{value}</div>
    </div>
  );
}
