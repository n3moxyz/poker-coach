/**
 * Replay engine: derives board + player state at any action index from a HandRecord.
 * Pure functions — no side effects, no store dependency.
 */

import { type HandRecord, type HandAction, type GamePhase } from '@/stores/gameStore';

export interface ReplayPlayerState {
  id: string;
  name: string;
  cards: string[];
  chips: number;
  currentBet: number;
  hasFolded: boolean;
  isAllIn: boolean;
  isHuman: boolean;
  aiStyle?: string;
}

export interface ReplayState {
  players: ReplayPlayerState[];
  communityCards: string[];
  pot: number;
  phase: GamePhase;
  currentAction: HandAction | null;
  actionIndex: number;
  totalActions: number;
}

/**
 * Determine which community cards are visible based on the current phase of the action.
 * preflop = 0 cards, flop = 3, turn = 4, river = 5
 */
function getVisibleBoard(allCards: string[], phase: GamePhase): string[] {
  switch (phase) {
    case 'preflop':
      return [];
    case 'flop':
      return allCards.slice(0, 3);
    case 'turn':
      return allCards.slice(0, 4);
    case 'river':
    case 'showdown':
      return allCards.slice(0, 5);
    default:
      return [];
  }
}

/**
 * Given a HandRecord and an action index, reconstruct the full table state
 * at that point in the hand.
 */
export function reconstructReplayState(
  record: HandRecord,
  actionIndex: number
): ReplayState {
  const totalActions = record.actions.length;
  const clampedIndex = Math.max(-1, Math.min(actionIndex, totalActions - 1));

  // Initialize players from the record
  // We need to figure out starting chips. Since we have chipDelta and final state,
  // we can work backward. But we also have pot and actions to reconstruct forward.
  // Simplest: sum all amounts each player bet, add back chipDelta to get start chips.
  const playerBets: Record<string, number> = {};
  for (const action of record.actions) {
    playerBets[action.playerId] = (playerBets[action.playerId] || 0) + action.amount;
  }

  // Starting chips = final chips + total bets - winnings
  // final chips = startChips - totalBets + winnings
  // startChips = (chipDelta - winnings + totalBets) ... this is circular
  // Better: startChips = -chipDelta + totalBets + startChips...
  // Actually: chipDelta = finalChips - startChips, and finalChips = startChips - totalBets + winnings
  // So: startChips = totalBets - chipDelta + startChips => doesn't help
  //
  // Use: startChips can be estimated as totalBets + max(0, -chipDelta) for losers,
  // or we can just use a reasonable default. The record doesn't store starting chips.
  // Let's infer: for a player, if they lost X (chipDelta = -X), they bet X total and won 0.
  // If they won Y, they bet some and won pot share.
  //
  // Simpler approach: startChips = totalBets - chipDelta  (works for losers: bets - (-loss) = bets + loss = bets + bets = 2*bets... no)
  // Actually chipDelta = (winnings from pot) - (total amount bet)
  // So: startChips doesn't matter for display if we just track relative changes.
  // Let's use a dummy start (e.g., 200) and adjust forward. Or better, we know the pot
  // was the sum of all bets. Let's just track chips as "startChips - bets so far + winnings so far".

  // Approach: assign startChips as totalAmountBet - chipDelta for each player
  // chipDelta = wonFromPot - totalBet => wonFromPot = chipDelta + totalBet
  // startChips: we don't know, but display doesn't need absolute values — we can set
  // startChips = 200 (or derive from record pot). Let's approximate by using
  // totalBet (what they bet) to ensure chips never go negative during replay.
  // Safe default: max bet across all players * 5 or 200, whichever is larger.
  const maxBet = Math.max(...Object.values(playerBets), 1);
  const defaultStart = Math.max(200, maxBet * 3);

  const players: ReplayPlayerState[] = record.players.map((p) => ({
    id: p.id,
    name: p.name,
    cards: p.cards,
    chips: defaultStart,
    currentBet: 0,
    hasFolded: false,
    isAllIn: false,
    isHuman: p.id === 'human',
    aiStyle: p.aiStyle,
  }));

  let pot = 0;
  let currentPhase: GamePhase = 'preflop';

  // Replay actions up to clampedIndex
  for (let i = 0; i <= clampedIndex; i++) {
    const action = record.actions[i];
    const player = players.find((p) => p.id === action.playerId);
    if (!player) continue;

    // Phase transition: collect bets into pot and reset currentBet
    if (action.phase !== currentPhase) {
      // Sweep bets into pot for the phase that just ended
      for (const p of players) {
        p.currentBet = 0;
      }
      currentPhase = action.phase as GamePhase;
    }

    switch (action.action) {
      case 'fold':
        player.hasFolded = true;
        break;
      case 'check':
        break;
      case 'call':
      case 'raise':
      case 'all-in':
      case 'post-blind':
        player.chips -= action.amount;
        player.currentBet += action.amount;
        pot += action.amount;
        if (action.action === 'all-in' || player.chips <= 0) {
          player.isAllIn = true;
          player.chips = Math.max(0, player.chips);
        }
        break;
    }
  }

  const action = clampedIndex >= 0 ? record.actions[clampedIndex] : null;
  const phase = action ? (action.phase as GamePhase) : 'preflop';

  return {
    players,
    communityCards: getVisibleBoard(record.communityCards, phase),
    pot,
    phase,
    currentAction: action,
    actionIndex: clampedIndex,
    totalActions,
  };
}

/** Get the street/phase at a given action index */
export function getPhaseAtIndex(actions: HandAction[], index: number): GamePhase {
  if (index < 0 || actions.length === 0) return 'preflop';
  const clamped = Math.min(index, actions.length - 1);
  return actions[clamped].phase as GamePhase;
}

/** Get the first action index for a given phase */
export function getFirstIndexForPhase(actions: HandAction[], phase: string): number {
  const idx = actions.findIndex((a) => a.phase === phase);
  return idx >= 0 ? idx : 0;
}

/** Get all unique phases in order */
export function getPhases(actions: HandAction[]): string[] {
  const seen = new Set<string>();
  const phases: string[] = [];
  for (const a of actions) {
    if (!seen.has(a.phase as string)) {
      seen.add(a.phase as string);
      phases.push(a.phase as string);
    }
  }
  return phases;
}
