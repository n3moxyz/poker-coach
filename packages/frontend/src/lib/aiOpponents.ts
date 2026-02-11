// AI opponent decision engine for Easy/Medium/Hard difficulties

import { type Card, handStrength } from './poker';
import { detectDraws, analyzeBoardTexture } from './handAnalysis';

export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type AIStyle = 'tight-passive' | 'tight-aggressive' | 'loose-passive' | 'loose-aggressive';

export interface AIPlayer {
  id: string;
  name: string;
  difficulty: AIDifficulty;
  style: AIStyle;
  avatar: string; // Emoji
}

export interface AIDecision {
  action: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
  amount: number; // 0 for fold/check, call amount for call, raise-to amount for raise
  reasoning: string; // For coaching panel
}

export interface GameContext {
  holeCards: Card[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  playerBet: number; // This AI player's current bet in the round
  chips: number;
  phase: 'preflop' | 'flop' | 'turn' | 'river';
  position: 'early' | 'middle' | 'late' | 'blind';
  numPlayers: number; // Active (non-folded) players
  isFirstAction: boolean; // First to act in this round
  bigBlind: number;
}

// Simple first names shared across all difficulties
const AI_NAMES = [
  { name: 'Steve', avatar: '😎' },
  { name: 'Betty', avatar: '⚖️' },
  { name: 'Chris', avatar: '💰' },
  { name: 'Dave', avatar: '🪨' },
  { name: 'Emma', avatar: '🧮' },
];

const AI_NAME_POOL: Record<AIDifficulty, { name: string; avatar: string }[]> = {
  easy: AI_NAMES,
  medium: AI_NAMES,
  hard: AI_NAMES,
};

const STYLE_LABELS: Record<AIStyle, string> = {
  'tight-passive': 'Tight',
  'tight-aggressive': 'Aggressive',
  'loose-passive': 'Passive',
  'loose-aggressive': 'Loose',
};

/** Get a human-readable label for an AI style */
export function getStyleLabel(style: AIStyle): string {
  return STYLE_LABELS[style];
}

const STYLES_BY_DIFFICULTY: Record<AIDifficulty, AIStyle[]> = {
  easy: ['loose-passive', 'tight-passive'],
  medium: ['tight-aggressive', 'tight-passive', 'loose-aggressive'],
  hard: ['tight-aggressive', 'loose-aggressive'],
};

/** Generate AI players for a game */
export function generateAIPlayers(count: number, difficulty: AIDifficulty): AIPlayer[] {
  const pool = [...AI_NAME_POOL[difficulty]];
  const styles = STYLES_BY_DIFFICULTY[difficulty];
  const players: AIPlayer[] = [];

  for (let i = 0; i < count; i++) {
    const nameIdx = i % pool.length;
    const styleIdx = i % styles.length;
    players.push({
      id: `ai-${i + 1}`,
      name: pool[nameIdx].name,
      difficulty,
      style: styles[styleIdx],
      avatar: pool[nameIdx].avatar,
    });
  }

  return players;
}

/** Main AI decision function */
export function makeAIDecision(ctx: GameContext, player: AIPlayer): AIDecision {
  const strength = handStrength(ctx.holeCards, ctx.communityCards);
  const toCall = ctx.currentBet - ctx.playerBet;
  const potOdds = toCall > 0 ? toCall / (ctx.pot + toCall) : 0;

  switch (player.difficulty) {
    case 'easy':
      return easyDecision(ctx, strength, toCall, potOdds);
    case 'medium':
      return mediumDecision(ctx, player, strength, toCall, potOdds);
    case 'hard':
      return hardDecision(ctx, player, strength, toCall, potOdds);
  }
}

function easyDecision(ctx: GameContext, strength: number, toCall: number, _potOdds: number): AIDecision {
  // Easy AI: predictable, never bluffs, calls too much
  if (toCall === 0) {
    // No bet to face
    if (strength > 0.7) {
      const raiseAmt = Math.min(ctx.pot, ctx.chips);
      return { action: 'raise', amount: ctx.currentBet + raiseAmt, reasoning: 'Strong hand, making a bet' };
    }
    return { action: 'check', amount: 0, reasoning: 'Nothing to call, checking' };
  }

  // Facing a bet
  if (strength < 0.3) {
    return { action: 'fold', amount: 0, reasoning: 'Weak hand, folding' };
  }
  if (strength > 0.75) {
    const raiseAmt = Math.min(ctx.pot, ctx.chips - toCall);
    if (raiseAmt > ctx.bigBlind * 2) {
      return { action: 'raise', amount: ctx.currentBet + raiseAmt, reasoning: 'Strong hand, raising' };
    }
  }
  // Calls too much -- that's the easy AI trait
  return { action: 'call', amount: ctx.currentBet, reasoning: 'Calling to see what happens' };
}

function mediumDecision(
  ctx: GameContext, player: AIPlayer, strength: number, toCall: number, potOdds: number
): AIDecision {
  const isAggressive = player.style.includes('aggressive');
  const positionBonus = ctx.position === 'late' ? 0.1 : ctx.position === 'blind' ? -0.05 : 0;
  const adjusted = strength + positionBonus;

  // C-bet: 60% of the time when first to act on flop
  if (ctx.phase === 'flop' && ctx.isFirstAction && Math.random() < 0.6) {
    const betSize = Math.floor(ctx.pot * 0.6);
    if (betSize > 0 && betSize <= ctx.chips) {
      return { action: 'raise', amount: ctx.currentBet + betSize, reasoning: 'Continuation bet on the flop' };
    }
  }

  if (toCall === 0) {
    if (adjusted > 0.6 && isAggressive) {
      const betSize = Math.floor(ctx.pot * (0.5 + Math.random() * 0.3));
      return { action: 'raise', amount: ctx.currentBet + Math.min(betSize, ctx.chips), reasoning: 'Betting for value' };
    }
    if (adjusted > 0.5) {
      const betSize = Math.floor(ctx.pot * 0.4);
      return { action: 'raise', amount: ctx.currentBet + Math.min(betSize, ctx.chips), reasoning: 'Making a probe bet' };
    }
    return { action: 'check', amount: 0, reasoning: 'Checking in position' };
  }

  // Facing a bet
  if (adjusted < 0.25) {
    return { action: 'fold', amount: 0, reasoning: 'Hand too weak to continue' };
  }
  if (adjusted > 0.7 && isAggressive) {
    const raiseSize = Math.floor(ctx.pot * 0.75);
    return { action: 'raise', amount: ctx.currentBet + Math.min(raiseSize, ctx.chips), reasoning: 'Raising with a strong hand' };
  }
  if (adjusted > potOdds) {
    return { action: 'call', amount: ctx.currentBet, reasoning: 'Pot odds justify a call' };
  }

  return { action: 'fold', amount: 0, reasoning: 'Not getting the right price' };
}

function hardDecision(
  ctx: GameContext, _player: AIPlayer, strength: number, toCall: number, potOdds: number
): AIDecision {
  const positionBonus = ctx.position === 'late' ? 0.12 : ctx.position === 'middle' ? 0.05 : -0.03;
  const adjusted = strength + positionBonus;
  const stackToPot = ctx.chips / Math.max(ctx.pot, 1);

  // Board texture and draw detection for smarter play
  const texture = ctx.communityCards.length >= 3 ? analyzeBoardTexture(ctx.communityCards) : null;
  const draws = ctx.communityCards.length >= 3 ? detectDraws(ctx.holeCards, ctx.communityCards) : null;
  const hasSignificantDraw = draws && (draws.flushDraw || draws.oesd);

  // Texture-based bet sizing: bigger on wet boards, smaller on dry
  const sizingFactor = texture
    ? (texture.wetness === 'wet' ? 0.75 : texture.wetness === 'dry' ? 0.55 : 0.65)
    : 0.65;

  // Bluff more on dry boards (opponents fold more), less on wet boards
  const bluffRate = texture
    ? (texture.wetness === 'dry' ? 0.30 : texture.wetness === 'wet' ? 0.15 : 0.25)
    : 0.25;
  const shouldBluff = adjusted < 0.35 && Math.random() < bluffRate && ctx.phase !== 'preflop';

  // Semi-bluff: bet/raise with draws for fold equity + draw equity
  const shouldSemiBluff = hasSignificantDraw && adjusted < 0.5 && ctx.phase !== 'preflop' && ctx.phase !== 'river';

  if (toCall === 0) {
    // Semi-bluff with strong draws
    if (shouldSemiBluff) {
      const betSize = Math.floor(ctx.pot * sizingFactor);
      return { action: 'raise', amount: ctx.currentBet + Math.min(betSize, ctx.chips), reasoning: 'Semi-bluff with a draw' };
    }
    if (shouldBluff) {
      const bluffSize = Math.floor(ctx.pot * 0.55);
      return { action: 'raise', amount: ctx.currentBet + Math.min(bluffSize, ctx.chips), reasoning: 'Balanced bluff' };
    }
    if (adjusted > 0.55) {
      const betSize = Math.floor(ctx.pot * sizingFactor);
      return { action: 'raise', amount: ctx.currentBet + Math.min(betSize, ctx.chips), reasoning: 'Value bet with strong holding' };
    }
    if (adjusted > 0.35 && ctx.position === 'late') {
      const betSize = Math.floor(ctx.pot * 0.4);
      return { action: 'raise', amount: ctx.currentBet + Math.min(betSize, ctx.chips), reasoning: 'Position bet in late position' };
    }
    return { action: 'check', amount: 0, reasoning: 'Checking to control pot size' };
  }

  // Facing a bet

  // All-in with monsters when short-stacked
  if (adjusted > 0.85 && stackToPot < 3) {
    return { action: 'all-in', amount: ctx.chips + ctx.playerBet, reasoning: 'All-in with a monster hand' };
  }

  if (adjusted > 0.7) {
    // Mix between raise and call for balance
    if (Math.random() < 0.6) {
      const raiseSize = Math.floor(ctx.pot * sizingFactor);
      return { action: 'raise', amount: ctx.currentBet + Math.min(raiseSize, ctx.chips), reasoning: 'Raising for value' };
    }
    return { action: 'call', amount: ctx.currentBet, reasoning: 'Slow-playing a strong hand' };
  }

  // Semi-bluff raise with draws when facing a bet
  if (shouldSemiBluff && Math.random() < 0.4) {
    const raiseSize = Math.floor(ctx.pot * sizingFactor);
    return { action: 'raise', amount: ctx.currentBet + Math.min(raiseSize, ctx.chips), reasoning: 'Semi-bluff raise with a draw' };
  }

  // Call with draws when getting the right price
  if (hasSignificantDraw && adjusted > potOdds) {
    return { action: 'call', amount: ctx.currentBet, reasoning: 'Calling with draw equity' };
  }

  if (adjusted > potOdds + 0.05) {
    return { action: 'call', amount: ctx.currentBet, reasoning: 'Getting correct odds to call' };
  }

  // Occasional hero call
  if (adjusted > 0.3 && Math.random() < 0.15) {
    return { action: 'call', amount: ctx.currentBet, reasoning: 'Making a read-based call' };
  }

  return { action: 'fold', amount: 0, reasoning: 'Disciplined fold' };
}

/** Get position category based on seat and dealer index */
export function getPosition(seatIndex: number, dealerIndex: number, totalPlayers: number): GameContext['position'] {
  const relative = (seatIndex - dealerIndex + totalPlayers) % totalPlayers;
  if (relative <= 2) return 'blind'; // SB, BB, UTG
  if (relative <= Math.floor(totalPlayers / 2)) return 'early';
  if (relative <= Math.floor(totalPlayers * 0.75)) return 'middle';
  return 'late';
}
