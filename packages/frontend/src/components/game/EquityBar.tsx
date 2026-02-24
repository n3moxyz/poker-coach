import { cn } from '@/lib/utils';

interface EquityBarProps {
  equity: number | null;
  isComputing?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

function getBarColor(equity: number): string {
  if (equity < 0.25) return 'bg-red-500';
  if (equity < 0.45) return 'bg-orange-500';
  if (equity < 0.55) return 'bg-yellow-500';
  if (equity < 0.75) return 'bg-green-500';
  return 'bg-emerald-400';
}

export default function EquityBar({ equity, isComputing, label, size = 'sm' }: EquityBarProps) {
  const barHeight = size === 'md' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
          {equity != null && (
            <span className="text-[10px] font-bold text-white">{Math.round(equity * 100)}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-white/5 overflow-hidden', barHeight)}>
        {isComputing && equity == null ? (
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
        ) : equity != null ? (
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              getBarColor(equity)
            )}
            style={{ width: `${Math.round(equity * 100)}%` }}
          />
        ) : null}
      </div>
    </div>
  );
}
