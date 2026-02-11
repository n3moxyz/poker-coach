// Tier-based preflop hand lookup by position

import { type Card, rankValue } from './poker';

export enum HandTier {
  PREMIUM = 0,
  STRONG = 1,
  PLAYABLE = 2,
  MARGINAL = 3,
  TRASH = 4,
}

const TIER_LABELS: Record<HandTier, string> = {
  [HandTier.PREMIUM]: 'Premium',
  [HandTier.STRONG]: 'Strong',
  [HandTier.PLAYABLE]: 'Playable',
  [HandTier.MARGINAL]: 'Marginal',
  [HandTier.TRASH]: 'Trash',
};

export function getTierLabel(tier: HandTier): string {
  return TIER_LABELS[tier];
}

// 169 canonical hands mapped to tiers
// Premium: AA, KK, QQ, AKs
// Strong: JJ, TT, 99, AKo, AQs, AJs, KQs
// Playable: 88, 77, 66, ATs, A9s, KJs, KTs, QJs, JTs, AQo
// Marginal: 55, 44, 33, 22, A8s-A2s, K9s, Q9s, J9s, T9s, 98s, 87s, 76s, 65s, KJo, QJo, JTo
// Trash: everything else

const PREMIUM_HANDS = new Set([
  'AA', 'KK', 'QQ', 'AKs',
]);

const STRONG_HANDS = new Set([
  'JJ', 'TT', '99', 'AKo', 'AQs', 'AJs', 'KQs',
]);

const PLAYABLE_HANDS = new Set([
  '88', '77', '66', 'ATs', 'A9s', 'KJs', 'KTs', 'QJs', 'JTs', 'AQo',
]);

const MARGINAL_HANDS = new Set([
  '55', '44', '33', '22',
  'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
  'K9s', 'Q9s', 'J9s', 'T9s', '98s', '87s', '76s', '65s',
  'KJo', 'QJo', 'JTo',
]);

type Position = 'early' | 'middle' | 'late' | 'blind';

// Which tiers are openable from each position
const POSITION_TIERS: Record<Position, Set<HandTier>> = {
  early: new Set([HandTier.PREMIUM, HandTier.STRONG]),
  middle: new Set([HandTier.PREMIUM, HandTier.STRONG, HandTier.PLAYABLE]),
  late: new Set([HandTier.PREMIUM, HandTier.STRONG, HandTier.PLAYABLE, HandTier.MARGINAL]),
  blind: new Set([HandTier.PREMIUM, HandTier.STRONG, HandTier.PLAYABLE]),
};

/** Convert two hole cards to canonical shorthand (e.g. "AKs", "QQ", "T9o") */
function toCanonical(card1: Card, card2: Card): string {
  const v1 = rankValue(card1.rank);
  const v2 = rankValue(card2.rank);

  // Ensure high card first
  const high = v1 >= v2 ? card1 : card2;
  const low = v1 >= v2 ? card2 : card1;

  const rankChar = (card: Card): string => {
    if (card.rank === '10') return 'T';
    return card.rank;
  };

  const highR = rankChar(high);
  const lowR = rankChar(low);

  if (high.rank === low.rank) {
    return `${highR}${lowR}`; // Pair: "AA"
  }

  const suited = high.suit === low.suit;
  return `${highR}${lowR}${suited ? 's' : 'o'}`;
}

/** Get the tier of a preflop hand */
export function getHandTier(card1: Card, card2: Card): HandTier {
  const canonical = toCanonical(card1, card2);

  if (PREMIUM_HANDS.has(canonical)) return HandTier.PREMIUM;
  if (STRONG_HANDS.has(canonical)) return HandTier.STRONG;
  if (PLAYABLE_HANDS.has(canonical)) return HandTier.PLAYABLE;
  if (MARGINAL_HANDS.has(canonical)) return HandTier.MARGINAL;
  return HandTier.TRASH;
}

/** Check if a hand is openable from a given position */
export function isOpenableFromPosition(
  card1: Card,
  card2: Card,
  position: Position,
): boolean {
  const tier = getHandTier(card1, card2);
  return POSITION_TIERS[position].has(tier);
}

/** Get the equity estimate for a tier (used in preflop strength) */
export function getTierEquity(tier: HandTier): number {
  switch (tier) {
    case HandTier.PREMIUM: return 0.85;
    case HandTier.STRONG: return 0.65;
    case HandTier.PLAYABLE: return 0.48;
    case HandTier.MARGINAL: return 0.33;
    case HandTier.TRASH: return 0.18;
  }
}
