import { Fragment, useState } from 'react';
import Info from 'lucide-react/dist/esm/icons/info';
import { cn } from '@/lib/utils';
import {
  GRID,
  RANKS,
  TIER_COLORS,
  POSITION_LABELS,
  isOpenable,
  type Position,
  type CellData,
} from '@/lib/rangeData';
import { HandTier } from '@/lib/preflopRanges';

const POSITIONS: Position[] = ['early', 'middle', 'late', 'blind'];

export default function RangeMatrix() {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1 font-display tracking-tight">Preflop Ranges</h1>
        <p className="text-sm text-muted-foreground">
          All 169 starting hands by tier. Select a position to see which hands to open.
        </p>
      </div>

      {/* Position selector */}
      <div className="flex gap-2 mb-4">
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => setSelectedPosition(selectedPosition === pos ? null : pos)}
            className={cn(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
              selectedPosition === pos
                ? 'bg-gold text-background'
                : 'bg-background-secondary text-muted-foreground hover:text-white hover:bg-background-tertiary'
            )}
          >
            {POSITION_LABELS[pos]}
          </button>
        ))}
      </div>

      {/* Hovered cell info */}
      <div className="h-8 mb-2 flex items-center gap-2 text-sm">
        {hoveredCell ? (
          <>
            <span className="text-white font-medium">{hoveredCell.label}</span>
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-medium',
              TIER_COLORS[hoveredCell.tier].bg,
              TIER_COLORS[hoveredCell.tier].text,
            )}>
              {TIER_COLORS[hoveredCell.tier].label}
            </span>
            <span className="text-muted-foreground">
              {hoveredCell.pair ? 'Pair' : hoveredCell.suited ? 'Suited' : 'Offsuit'}
            </span>
            {selectedPosition && (
              <span className={cn(
                'text-xs font-medium',
                isOpenable(hoveredCell.tier, selectedPosition) ? 'text-green-400' : 'text-red-400'
              )}>
                {isOpenable(hoveredCell.tier, selectedPosition) ? 'Open' : 'Fold'}
              </span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground flex items-center gap-1">
            <Info className="w-4 h-4" />
            Hover or tap a cell for details
          </span>
        )}
      </div>

      {/* 13x13 Grid */}
      <div className="overflow-x-auto">
        <div className="inline-grid grid-cols-[auto_repeat(13,1fr)] gap-px min-w-[340px] w-full max-w-[600px]">
          {/* Header row */}
          <div />
          {RANKS.map((rank) => (
            <div
              key={`h-${rank}`}
              className="text-center text-[10px] sm:text-xs text-muted-foreground font-medium py-1"
            >
              {rank}
            </div>
          ))}

          {/* Grid rows */}
          {GRID.map((row, rowIdx) => (
            <Fragment key={`row-${rowIdx}`}>
              {/* Row label */}
              <div
                className="flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground font-medium pr-1"
              >
                {RANKS[rowIdx]}
              </div>

              {/* Cells */}
              {row.map((cell, colIdx) => {
                const dimmed = selectedPosition && !isOpenable(cell.tier, selectedPosition);
                const tierStyle = TIER_COLORS[cell.tier];

                return (
                  <button
                    key={`${rowIdx}-${colIdx}`}
                    className={cn(
                      'aspect-square min-h-[28px] sm:min-h-0 flex items-center justify-center rounded-[3px] sm:rounded text-[8px] sm:text-[11px] font-medium transition-all cursor-pointer border border-transparent',
                      tierStyle.bg,
                      tierStyle.text,
                      dimmed && 'opacity-15',
                      !dimmed && 'hover:ring-1 hover:ring-gold hover:z-10',
                      cell.pair && 'ring-1 ring-white/20',
                    )}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onFocus={() => setHoveredCell(cell)}
                    onBlur={() => setHoveredCell(null)}
                  >
                    {cell.label}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 rounded-xl bg-background-secondary border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Legend</h3>
        <div className="flex flex-wrap gap-3 text-sm mb-3">
          {([HandTier.PREMIUM, HandTier.STRONG, HandTier.PLAYABLE, HandTier.MARGINAL, HandTier.TRASH] as const).map(
            (tier) => (
              <div key={tier} className="flex items-center gap-1.5">
                <div className={cn('w-4 h-4 rounded', TIER_COLORS[tier].bg)} />
                <span className="text-muted-foreground">{TIER_COLORS[tier].label}</span>
              </div>
            ),
          )}
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Upper-right = suited hands (e.g. AKs) | Diagonal = pairs | Lower-left = offsuit (e.g. AKo)</p>
          {selectedPosition && (
            <p>
              Dimmed hands are folds from <span className="text-gold">{POSITION_LABELS[selectedPosition]}</span> position.
            </p>
          )}
        </div>
      </div>

      {/* Position guide */}
      <div className="mt-4 p-4 rounded-xl bg-background-secondary border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Position Guide</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-white font-medium">Early</span>
            <span className="text-muted-foreground"> — Premium + Strong</span>
          </div>
          <div>
            <span className="text-white font-medium">Middle</span>
            <span className="text-muted-foreground"> — + Playable</span>
          </div>
          <div>
            <span className="text-white font-medium">Late</span>
            <span className="text-muted-foreground"> — + Marginal</span>
          </div>
          <div>
            <span className="text-white font-medium">Blind</span>
            <span className="text-muted-foreground"> — Premium to Playable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
