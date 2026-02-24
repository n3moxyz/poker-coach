/**
 * Monte Carlo equity engine — self-contained hand evaluation for Web Worker use.
 * Inlines minimal card/eval logic from poker.ts to avoid circular ESM imports.
 */

// --- Inlined types & constants ---

type Suit = 'h' | 'd' | 'c' | 's';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
  rank: Rank;
  suit: Suit;
}

const enum HandRank {
  HIGH_CARD = 0,
  ONE_PAIR = 1,
  TWO_PAIR = 2,
  THREE_OF_A_KIND = 3,
  FIVE_HIGH_STRAIGHT = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10,
}

interface HandResult {
  rank: HandRank;
  kickers: number[];
}

const RANK_VALUE: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS: Suit[] = ['h', 'd', 'c', 's'];

// --- Card helpers ---

function parseCard(s: string): Card {
  const suit = s.slice(-1) as Suit;
  const rank = s.slice(0, -1) as Rank;
  return { rank, suit };
}

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`;
}

// --- Full 52-card deck ---

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

// --- 5-card evaluator (inlined from poker.ts) ---

function evaluate5(cards: Card[]): HandResult {
  const values = cards.map((c) => RANK_VALUE[c.rank]).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);

  const isFlush = suits[0] === suits[1] && suits[1] === suits[2] && suits[2] === suits[3] && suits[3] === suits[4];

  let isStraight = false;
  let isWheel = false;
  const unique = [...new Set(values)].sort((a, b) => b - a);

  if (unique.length === 5) {
    if (unique[0] - unique[4] === 4) {
      isStraight = true;
    }
    if (unique[0] === 14 && unique[1] === 5 && unique[2] === 4 && unique[3] === 3 && unique[4] === 2) {
      isStraight = true;
      isWheel = true;
    }
  }

  const counts: Record<number, number> = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }
  const countEntries = Object.entries(counts)
    .map(([val, cnt]) => ({ val: Number(val), cnt: Number(cnt) }))
    .sort((a, b) => b.cnt - a.cnt || b.val - a.val);

  if (isFlush && isStraight) {
    if (!isWheel && values[0] === 14 && values[1] === 13) {
      return { rank: HandRank.ROYAL_FLUSH, kickers: values };
    }
    if (isWheel) {
      return { rank: HandRank.STRAIGHT_FLUSH, kickers: [5, 4, 3, 2, 1] };
    }
    return { rank: HandRank.STRAIGHT_FLUSH, kickers: values };
  }

  if (countEntries[0].cnt === 4) {
    return { rank: HandRank.FOUR_OF_A_KIND, kickers: [countEntries[0].val, countEntries[1].val] };
  }

  if (countEntries[0].cnt === 3 && countEntries[1].cnt === 2) {
    return { rank: HandRank.FULL_HOUSE, kickers: [countEntries[0].val, countEntries[1].val] };
  }

  if (isFlush) {
    return { rank: HandRank.FLUSH, kickers: values };
  }

  if (isStraight) {
    if (isWheel) {
      return { rank: HandRank.FIVE_HIGH_STRAIGHT, kickers: [5, 4, 3, 2, 1] };
    }
    return { rank: HandRank.STRAIGHT, kickers: values };
  }

  if (countEntries[0].cnt === 3) {
    const tripVal = countEntries[0].val;
    const rest = countEntries.slice(1).map((e) => e.val).sort((a, b) => b - a);
    return { rank: HandRank.THREE_OF_A_KIND, kickers: [tripVal, ...rest] };
  }

  if (countEntries[0].cnt === 2 && countEntries[1].cnt === 2) {
    const highPair = Math.max(countEntries[0].val, countEntries[1].val);
    const lowPair = Math.min(countEntries[0].val, countEntries[1].val);
    return { rank: HandRank.TWO_PAIR, kickers: [highPair, lowPair, countEntries[2].val] };
  }

  if (countEntries[0].cnt === 2) {
    const pairVal = countEntries[0].val;
    const rest = countEntries.slice(1).map((e) => e.val).sort((a, b) => b - a);
    return { rank: HandRank.ONE_PAIR, kickers: [pairVal, ...rest] };
  }

  return { rank: HandRank.HIGH_CARD, kickers: values };
}

// --- Best-of-21 combos for 7 cards ---

function evaluateBest(cards: Card[]): HandResult {
  if (cards.length === 5) return evaluate5(cards);

  const n = cards.length;
  let best: HandResult | null = null;

  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 1; j < n - 3; j++) {
      for (let k = j + 1; k < n - 2; k++) {
        for (let l = k + 1; l < n - 1; l++) {
          for (let m = l + 1; m < n; m++) {
            const result = evaluate5([cards[i], cards[j], cards[k], cards[l], cards[m]]);
            if (!best || compareHands(result, best) > 0) {
              best = result;
            }
          }
        }
      }
    }
  }

  return best!;
}

function compareHands(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.kickers.length, b.kickers.length); i++) {
    if (a.kickers[i] !== b.kickers[i]) return a.kickers[i] - b.kickers[i];
  }
  return 0;
}

// --- Monte Carlo simulation ---

export interface SimulationRequest {
  heroCards: string[];
  communityCards: string[];
  numOpponents: number;
  iterations: number;
}

/**
 * Run a Monte Carlo equity simulation.
 * Returns equity as a number between 0 and 1.
 */
export function simulate(
  heroCards: string[],
  communityCards: string[],
  numOpponents: number,
  iterations: number
): number {
  const heroParsed = heroCards.map(parseCard);
  const boardParsed = communityCards.map(parseCard);

  // Build known card set for fast lookup
  const knownSet = new Set<string>();
  for (const c of heroCards) knownSet.add(c);
  for (const c of communityCards) knownSet.add(c);

  // Build stub deck (52 minus known)
  const stubDeck: Card[] = [];
  for (const card of buildDeck()) {
    if (!knownSet.has(cardKey(card))) {
      stubDeck.push(card);
    }
  }

  const boardNeeded = 5 - boardParsed.length;
  const cardsNeeded = boardNeeded + numOpponents * 2;

  let wins = 0;

  for (let iter = 0; iter < iterations; iter++) {
    // Partial Fisher-Yates: only shuffle the first `cardsNeeded` positions
    const deck = stubDeck.slice(); // shallow copy
    for (let i = 0; i < cardsNeeded && i < deck.length; i++) {
      const j = i + Math.floor(Math.random() * (deck.length - i));
      const tmp = deck[i];
      deck[i] = deck[j];
      deck[j] = tmp;
    }

    // Complete the board
    let idx = 0;
    const fullBoard = [...boardParsed];
    for (let b = 0; b < boardNeeded; b++) {
      fullBoard.push(deck[idx++]);
    }

    // Evaluate hero
    const heroHand = evaluateBest([...heroParsed, ...fullBoard]);

    // Evaluate opponents and find best
    let heroWins = true;
    let tieCount = 1; // hero starts as 1

    for (let opp = 0; opp < numOpponents; opp++) {
      const oppCards = [deck[idx++], deck[idx++]];
      const oppHand = evaluateBest([...oppCards, ...fullBoard]);
      const cmp = compareHands(heroHand, oppHand);
      if (cmp < 0) {
        heroWins = false;
        break;
      } else if (cmp === 0) {
        tieCount++;
      }
    }

    if (heroWins) {
      wins += 1 / tieCount;
    }
  }

  return wins / iterations;
}
