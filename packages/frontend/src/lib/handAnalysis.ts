// Draw detection, board texture analysis, and enhanced equity estimation

import { type Card, HandRank, evaluateHand, rankValue } from './poker';
import { getHandTier, getTierEquity } from './preflopRanges';

// --- Draw Detection ---

export interface DrawInfo {
  flushDraw: boolean;
  backdoorFlush: boolean;
  oesd: boolean; // Open-ended straight draw
  gutshot: boolean;
  backdoorStraight: boolean;
  overcardCount: number;
  totalOuts: number;
}

/** Detect all draws in the player's combined hand + board */
export function detectDraws(holeCards: Card[], boardCards: Card[]): DrawInfo {
  if (boardCards.length === 0) {
    return { flushDraw: false, backdoorFlush: false, oesd: false, gutshot: false, backdoorStraight: false, overcardCount: 0, totalOuts: 0 };
  }

  const allCards = [...holeCards, ...boardCards];
  let totalOuts = 0;

  // Flush draws — count suits across all cards, but require at least one hole card in the suit
  const suitCounts: Record<string, number> = {};
  const holeSuits = new Set(holeCards.map((c) => c.suit));
  for (const card of allCards) {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  }

  let flushDraw = false;
  let backdoorFlush = false;

  for (const [suit, count] of Object.entries(suitCounts)) {
    if (!holeSuits.has(suit as Card['suit'])) continue; // Need a hole card in the suit
    if (count === 4) {
      flushDraw = true;
      totalOuts += 9;
    } else if (count === 3 && boardCards.length <= 3) {
      backdoorFlush = true;
      totalOuts += 1.5; // Approximate runner-runner outs
    }
  }

  // Straight draws — work with unique values
  const allValues = allCards.map((c) => rankValue(c.rank));
  const holeValues = holeCards.map((c) => rankValue(c.rank));
  const uniqueVals = [...new Set(allValues)].sort((a, b) => a - b);

  // Add low ace for wheel draws
  if (uniqueVals.includes(14)) {
    uniqueVals.unshift(1);
  }

  const { oesd, gutshot, backdoorStraight } = detectStraightDraws(uniqueVals, holeValues, boardCards.length);

  if (oesd) totalOuts += 8;
  else if (gutshot) totalOuts += 4;
  if (backdoorStraight) totalOuts += 1.5;

  // Overcards — hole cards higher than all board cards
  const maxBoardVal = Math.max(...boardCards.map((c) => rankValue(c.rank)));
  let overcardCount = 0;
  for (const hv of holeValues) {
    if (hv > maxBoardVal) overcardCount++;
  }
  totalOuts += overcardCount * 3;

  // Don't double-count: if we already have a made hand (pair+), overcards are less relevant
  const allCardsForEval = [...holeCards, ...boardCards];
  if (allCardsForEval.length >= 5) {
    const result = evaluateHand(allCardsForEval);
    if (result.rank >= HandRank.ONE_PAIR) {
      totalOuts -= overcardCount * 3; // Remove overcard outs for made hands
      overcardCount = 0;
    }
  }

  return { flushDraw, backdoorFlush, oesd, gutshot, backdoorStraight, overcardCount, totalOuts };
}

function detectStraightDraws(
  uniqueVals: number[],
  holeValues: number[],
  boardLength: number,
): { oesd: boolean; gutshot: boolean; backdoorStraight: boolean } {
  let oesd = false;
  let gutshot = false;
  let backdoorStraight = false;

  // Slide a 5-card window over unique values
  for (let i = 0; i <= uniqueVals.length - 3; i++) {
    // Check windows of 5 consecutive values
    const windowEnd = uniqueVals[i] + 4;
    const inWindow = uniqueVals.filter((v) => v >= uniqueVals[i] && v <= windowEnd);

    // Need at least one hole card participating
    const holeInWindow = holeValues.some((hv) => {
      const effectiveHv = hv === 14 ? [14, 1] : [hv];
      return effectiveHv.some((v) => v >= uniqueVals[i] && v <= windowEnd);
    });
    if (!holeInWindow) continue;

    if (inWindow.length === 4) {
      // 4 of 5 in a row — is it open-ended or gutshot?
      const gaps = [];
      for (let v = uniqueVals[i]; v <= windowEnd; v++) {
        if (!inWindow.includes(v)) gaps.push(v);
      }

      if (gaps.length === 1) {
        const gap = gaps[0];
        // OESD: gap is at either end of the window
        if (gap === uniqueVals[i] || gap === windowEnd) {
          oesd = true;
        } else {
          gutshot = true;
        }
      }
    } else if (inWindow.length === 3 && boardLength <= 3) {
      // Backdoor straight: 3 of 5 consecutive on flop
      backdoorStraight = true;
    }
  }

  // OESD supersedes gutshot
  if (oesd) gutshot = false;

  return { oesd, gutshot, backdoorStraight };
}

// --- Board Texture Analysis ---

export type Suitedness = 'monotone' | 'two-tone' | 'rainbow';
export type Wetness = 'dry' | 'medium' | 'wet';

export interface BoardTexture {
  suitedness: Suitedness;
  isPaired: boolean;
  isConnected: boolean;
  highCard: number;
  wetness: Wetness;
}

/** Analyze board texture from community cards */
export function analyzeBoardTexture(boardCards: Card[]): BoardTexture {
  if (boardCards.length === 0) {
    return { suitedness: 'rainbow', isPaired: false, isConnected: false, highCard: 0, wetness: 'dry' };
  }

  // Suitedness
  const suitCounts: Record<string, number> = {};
  for (const card of boardCards) {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  }
  const maxSuitCount = Math.max(...Object.values(suitCounts));

  let suitedness: Suitedness;
  if (maxSuitCount >= 3) suitedness = 'monotone';
  else if (maxSuitCount === 2) suitedness = 'two-tone';
  else suitedness = 'rainbow';

  // Paired board
  const valueCounts: Record<number, number> = {};
  for (const card of boardCards) {
    const v = rankValue(card.rank);
    valueCounts[v] = (valueCounts[v] || 0) + 1;
  }
  const isPaired = Object.values(valueCounts).some((c) => c >= 2);

  // Connected: 3+ cards within a 4-rank span
  const boardValues = boardCards.map((c) => rankValue(c.rank)).sort((a, b) => a - b);
  let isConnected = false;
  for (let i = 0; i < boardValues.length; i++) {
    const low = boardValues[i];
    const inSpan = boardValues.filter((v) => v >= low && v <= low + 4);
    if (inSpan.length >= 3) {
      isConnected = true;
      break;
    }
  }

  // High card
  const highCard = Math.max(...boardValues);

  // Wetness
  let wetness: Wetness;
  if (suitedness === 'monotone' || (suitedness === 'two-tone' && isConnected)) {
    wetness = 'wet';
  } else if (suitedness === 'rainbow' && !isConnected && !isPaired) {
    wetness = 'dry';
  } else {
    wetness = 'medium';
  }

  return { suitedness, isPaired, isConnected, highCard, wetness };
}

// --- Enhanced Equity Estimation ---

export interface EnhancedStrength {
  equity: number;
  madeHandScore: number;
  drawBonus: number;
  draws: DrawInfo;
  texture: BoardTexture;
}

/** Enhanced hand strength combining made hand value + draw equity */
export function enhancedHandStrength(holeCards: Card[], communityCards: Card[]): EnhancedStrength {
  const emptyDraws: DrawInfo = {
    flushDraw: false, backdoorFlush: false, oesd: false, gutshot: false,
    backdoorStraight: false, overcardCount: 0, totalOuts: 0,
  };
  const emptyTexture: BoardTexture = {
    suitedness: 'rainbow', isPaired: false, isConnected: false, highCard: 0, wetness: 'dry',
  };

  // Preflop: use tier-based equity
  if (communityCards.length === 0) {
    const tier = getHandTier(holeCards[0], holeCards[1]);
    const equity = getTierEquity(tier);
    return { equity, madeHandScore: equity, drawBonus: 0, draws: emptyDraws, texture: emptyTexture };
  }

  // Postflop
  const allCards = [...holeCards, ...communityCards];
  const result = evaluateHand(allCards);
  const draws = detectDraws(holeCards, communityCards);
  const texture = analyzeBoardTexture(communityCards);

  // Made hand scoring — map HandRank to realistic equity ranges
  const madeHandScore = scoreMadeHand(result.rank, result.kickers);

  // Draw bonus: totalOuts * outValue * cardsToComeFactor
  const OUT_VALUE = 0.02;
  let cardsToComeFactor: number;
  switch (communityCards.length) {
    case 3: cardsToComeFactor = 2; break; // Flop — 2 cards to come
    case 4: cardsToComeFactor = 1; break; // Turn — 1 card to come
    default: cardsToComeFactor = 0; break; // River — no draws matter
  }
  const drawBonus = draws.totalOuts * OUT_VALUE * cardsToComeFactor;

  const equity = Math.min(0.95, madeHandScore + drawBonus);

  return { equity, madeHandScore, drawBonus, draws, texture };
}

/** Map HandRank to a realistic equity range, interpolating with kicker */
function scoreMadeHand(rank: HandRank, kickers: number[]): number {
  // Equity ranges for each made hand type
  const ranges: Record<number, [number, number]> = {
    [HandRank.HIGH_CARD]: [0.10, 0.20],
    [HandRank.ONE_PAIR]: [0.25, 0.50],
    [HandRank.TWO_PAIR]: [0.55, 0.70],
    [HandRank.THREE_OF_A_KIND]: [0.70, 0.80],
    [HandRank.FIVE_HIGH_STRAIGHT]: [0.78, 0.80],
    [HandRank.STRAIGHT]: [0.80, 0.88],
    [HandRank.FLUSH]: [0.85, 0.92],
    [HandRank.FULL_HOUSE]: [0.93, 0.97],
    [HandRank.FOUR_OF_A_KIND]: [0.98, 0.99],
    [HandRank.STRAIGHT_FLUSH]: [0.99, 1.0],
    [HandRank.ROYAL_FLUSH]: [1.0, 1.0],
  };

  const [low, high] = ranges[rank] || [0.10, 0.20];

  // Interpolate using primary kicker (2-14 → 0-1)
  const primaryKicker = kickers[0] || 7;
  const kickerFraction = (primaryKicker - 2) / 12; // 0 to 1

  return low + (high - low) * kickerFraction;
}
