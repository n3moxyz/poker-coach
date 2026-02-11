// Core poker game engine: deck, hand evaluation, hand comparison

import { enhancedHandStrength } from './handAnalysis';

export type Suit = 'h' | 'd' | 'c' | 's';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export enum HandRank {
  HIGH_CARD = 0,
  ONE_PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  FIVE_HIGH_STRAIGHT = 4, // Wheel: A-2-3-4-5
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10,
}

export interface HandResult {
  rank: HandRank;
  name: string;
  cards: Card[]; // Best 5-card hand
  kickers: number[]; // Numeric values for tie-breaking, highest first
}

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['h', 'd', 'c', 's'];

const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

const HAND_NAMES: Record<HandRank, string> = {
  [HandRank.HIGH_CARD]: 'High Card',
  [HandRank.ONE_PAIR]: 'One Pair',
  [HandRank.TWO_PAIR]: 'Two Pair',
  [HandRank.THREE_OF_A_KIND]: 'Three of a Kind',
  [HandRank.FIVE_HIGH_STRAIGHT]: 'Straight (Wheel)',
  [HandRank.STRAIGHT]: 'Straight',
  [HandRank.FLUSH]: 'Flush',
  [HandRank.FULL_HOUSE]: 'Full House',
  [HandRank.FOUR_OF_A_KIND]: 'Four of a Kind',
  [HandRank.STRAIGHT_FLUSH]: 'Straight Flush',
  [HandRank.ROYAL_FLUSH]: 'Royal Flush',
};

// --- Card utilities ---

export function cardToString(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function stringToCard(s: string): Card {
  const suit = s.slice(-1) as Suit;
  const rank = s.slice(0, -1) as Rank;
  return { rank, suit };
}

export function rankValue(rank: Rank): number {
  return RANK_VALUE[rank];
}

// --- Deck ---

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], count: number): { dealt: Card[]; remaining: Card[] } {
  return {
    dealt: deck.slice(0, count),
    remaining: deck.slice(count),
  };
}

// --- Hand evaluation ---

/** Get all 5-card combinations from an array of cards */
function getCombinations(cards: Card[]): Card[][] {
  const result: Card[][] = [];
  const n = cards.length;
  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 1; j < n - 3; j++) {
      for (let k = j + 1; k < n - 2; k++) {
        for (let l = k + 1; l < n - 1; l++) {
          for (let m = l + 1; m < n; m++) {
            result.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
          }
        }
      }
    }
  }
  return result;
}

/** Evaluate exactly 5 cards */
function evaluate5(cards: Card[]): HandResult {
  const values = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  // Check straight
  let isStraight = false;
  let isWheel = false;
  const unique = [...new Set(values)].sort((a, b) => b - a);

  if (unique.length === 5) {
    if (unique[0] - unique[4] === 4) {
      isStraight = true;
    }
    // Ace-low straight (wheel): A-5-4-3-2
    if (unique[0] === 14 && unique[1] === 5 && unique[2] === 4 && unique[3] === 3 && unique[4] === 2) {
      isStraight = true;
      isWheel = true;
    }
  }

  // Count ranks
  const counts: Record<number, number> = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }
  const countEntries = Object.entries(counts)
    .map(([val, cnt]) => ({ val: Number(val), cnt }))
    .sort((a, b) => b.cnt - a.cnt || b.val - a.val);

  // Determine hand rank
  if (isFlush && isStraight) {
    if (!isWheel && values[0] === 14 && values[1] === 13) {
      return { rank: HandRank.ROYAL_FLUSH, name: HAND_NAMES[HandRank.ROYAL_FLUSH], cards, kickers: values };
    }
    if (isWheel) {
      return { rank: HandRank.STRAIGHT_FLUSH, name: 'Straight Flush (Wheel)', cards, kickers: [5, 4, 3, 2, 1] };
    }
    return { rank: HandRank.STRAIGHT_FLUSH, name: HAND_NAMES[HandRank.STRAIGHT_FLUSH], cards, kickers: values };
  }

  if (countEntries[0].cnt === 4) {
    const quadVal = countEntries[0].val;
    const kicker = countEntries[1].val;
    return { rank: HandRank.FOUR_OF_A_KIND, name: HAND_NAMES[HandRank.FOUR_OF_A_KIND], cards, kickers: [quadVal, kicker] };
  }

  if (countEntries[0].cnt === 3 && countEntries[1].cnt === 2) {
    return { rank: HandRank.FULL_HOUSE, name: HAND_NAMES[HandRank.FULL_HOUSE], cards, kickers: [countEntries[0].val, countEntries[1].val] };
  }

  if (isFlush) {
    return { rank: HandRank.FLUSH, name: HAND_NAMES[HandRank.FLUSH], cards, kickers: values };
  }

  if (isStraight) {
    if (isWheel) {
      return { rank: HandRank.FIVE_HIGH_STRAIGHT, name: HAND_NAMES[HandRank.FIVE_HIGH_STRAIGHT], cards, kickers: [5, 4, 3, 2, 1] };
    }
    return { rank: HandRank.STRAIGHT, name: HAND_NAMES[HandRank.STRAIGHT], cards, kickers: values };
  }

  if (countEntries[0].cnt === 3) {
    const tripVal = countEntries[0].val;
    const kickers = countEntries.slice(1).map((e) => e.val).sort((a, b) => b - a);
    return { rank: HandRank.THREE_OF_A_KIND, name: HAND_NAMES[HandRank.THREE_OF_A_KIND], cards, kickers: [tripVal, ...kickers] };
  }

  if (countEntries[0].cnt === 2 && countEntries[1].cnt === 2) {
    const highPair = Math.max(countEntries[0].val, countEntries[1].val);
    const lowPair = Math.min(countEntries[0].val, countEntries[1].val);
    const kicker = countEntries[2].val;
    return { rank: HandRank.TWO_PAIR, name: HAND_NAMES[HandRank.TWO_PAIR], cards, kickers: [highPair, lowPair, kicker] };
  }

  if (countEntries[0].cnt === 2) {
    const pairVal = countEntries[0].val;
    const kickers = countEntries.slice(1).map((e) => e.val).sort((a, b) => b - a);
    return { rank: HandRank.ONE_PAIR, name: HAND_NAMES[HandRank.ONE_PAIR], cards, kickers: [pairVal, ...kickers] };
  }

  return { rank: HandRank.HIGH_CARD, name: HAND_NAMES[HandRank.HIGH_CARD], cards, kickers: values };
}

/** Evaluate 5-7 cards and return the best 5-card hand */
export function evaluateHand(cards: Card[]): HandResult {
  if (cards.length < 5) throw new Error('Need at least 5 cards to evaluate');
  if (cards.length === 5) return evaluate5(cards);

  const combos = getCombinations(cards);
  let best: HandResult | null = null;

  for (const combo of combos) {
    const result = evaluate5(combo);
    if (!best || compareResults(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

/** Compare two HandResults. Returns positive if a wins, negative if b wins, 0 for tie */
function compareResults(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  // Same rank: compare kickers
  for (let i = 0; i < Math.min(a.kickers.length, b.kickers.length); i++) {
    if (a.kickers[i] !== b.kickers[i]) return a.kickers[i] - b.kickers[i];
  }
  return 0;
}

/** Compare two players' hands. Returns positive if a wins, negative if b wins, 0 for tie */
export function compareHands(a: HandResult, b: HandResult): number {
  return compareResults(a, b);
}

/** Determine winner(s) from multiple evaluated hands. Returns indices of winners (may be >1 for split pot) */
export function determineWinners(hands: HandResult[]): number[] {
  let bestIdx = [0];
  for (let i = 1; i < hands.length; i++) {
    const cmp = compareResults(hands[i], hands[bestIdx[0]]);
    if (cmp > 0) {
      bestIdx = [i];
    } else if (cmp === 0) {
      bestIdx.push(i);
    }
  }
  return bestIdx;
}

/** Calculate hand strength as a heuristic (0-1) for AI and coaching use */
export function handStrength(holeCards: Card[], communityCards: Card[]): number {
  return enhancedHandStrength(holeCards, communityCards).equity;
}

// Re-export for convenience
export { RANKS, SUITS, RANK_VALUE, HAND_NAMES };
