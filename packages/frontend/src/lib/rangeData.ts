import { HandTier } from './preflopRanges';

export type Position = 'early' | 'middle' | 'late' | 'blind';

// The 13 ranks from A (high) to 2 (low)
export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

export interface CellData {
  label: string; // e.g. "AKs", "QQ", "T9o"
  tier: HandTier;
  suited: boolean; // upper-right triangle
  offsuit: boolean; // lower-left triangle
  pair: boolean; // diagonal
}

/** Build the canonical hand label for grid position [row][col] */
function getHandLabel(row: number, col: number): string {
  if (row === col) return `${RANKS[row]}${RANKS[col]}`; // pair
  if (col > row) return `${RANKS[row]}${RANKS[col]}s`; // suited (upper-right)
  return `${RANKS[col]}${RANKS[row]}o`; // offsuit (lower-left), high card first
}

// Hand-to-tier mapping using the same sets from preflopRanges.ts
const TIER_MAP: Record<string, HandTier> = {};

// Premium
for (const h of ['AA', 'KK', 'QQ', 'AKs']) TIER_MAP[h] = HandTier.PREMIUM;

// Strong
for (const h of ['JJ', 'TT', '99', 'AKo', 'AQs', 'AJs', 'KQs']) TIER_MAP[h] = HandTier.STRONG;

// Playable
for (const h of ['88', '77', '66', 'ATs', 'A9s', 'KJs', 'KTs', 'QJs', 'JTs', 'AQo']) {
  TIER_MAP[h] = HandTier.PLAYABLE;
}

// Marginal
for (const h of [
  '55', '44', '33', '22',
  'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'K9s', 'Q9s', 'J9s', 'T9s', '98s', '87s', '76s', '65s',
  'KJo', 'QJo', 'JTo',
]) {
  TIER_MAP[h] = HandTier.MARGINAL;
}

function getTier(label: string): HandTier {
  return TIER_MAP[label] ?? HandTier.TRASH;
}

/** Full 13x13 grid of cell data */
export const GRID: CellData[][] = RANKS.map((_, row) =>
  RANKS.map((_, col) => {
    const label = getHandLabel(row, col);
    return {
      label,
      tier: getTier(label),
      suited: col > row,
      offsuit: col < row,
      pair: row === col,
    };
  }),
);

/** Which tiers are openable from each position */
const POSITION_TIERS: Record<Position, Set<HandTier>> = {
  early: new Set([HandTier.PREMIUM, HandTier.STRONG]),
  middle: new Set([HandTier.PREMIUM, HandTier.STRONG, HandTier.PLAYABLE]),
  late: new Set([HandTier.PREMIUM, HandTier.STRONG, HandTier.PLAYABLE, HandTier.MARGINAL]),
  blind: new Set([HandTier.PREMIUM, HandTier.STRONG, HandTier.PLAYABLE]),
};

export function isOpenable(tier: HandTier, position: Position): boolean {
  return POSITION_TIERS[position].has(tier);
}

export const TIER_COLORS: Record<HandTier, { bg: string; text: string; label: string }> = {
  [HandTier.PREMIUM]: { bg: 'bg-yellow-500/80', text: 'text-yellow-900', label: 'Premium' },
  [HandTier.STRONG]: { bg: 'bg-green-500/70', text: 'text-green-950', label: 'Strong' },
  [HandTier.PLAYABLE]: { bg: 'bg-blue-500/60', text: 'text-blue-950', label: 'Playable' },
  [HandTier.MARGINAL]: { bg: 'bg-amber-400/50', text: 'text-amber-950', label: 'Marginal' },
  [HandTier.TRASH]: { bg: 'bg-gray-700/40', text: 'text-gray-400', label: 'Trash' },
};

export const POSITION_LABELS: Record<Position, string> = {
  early: 'Early',
  middle: 'Middle',
  late: 'Late',
  blind: 'Blind',
};
