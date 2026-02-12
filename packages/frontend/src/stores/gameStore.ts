// Zustand game state machine for Play vs AI

import { create } from 'zustand';
import {
  type Card,
  createDeck,
  shuffleDeck,
  dealCards,
  evaluateHand,
  determineWinners,
  cardToString,
} from '@/lib/poker';
import {
  type AIDifficulty,
  type AIPlayer,
  generateAIPlayers,
  makeAIDecision,
  getPosition,
  getStyleLabel,
} from '@/lib/aiOpponents';
import { type CoachingFeedback, evaluateAction, calculateHandGrade } from '@/lib/coaching';
import { sounds } from '@/lib/sounds';

export type GamePhase = 'setup' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'summary';
export type GameMode = 'hand-by-hand' | 'cash-game' | 'tournament';

export interface BlindLevel {
  smallBlind: number;
  bigBlind: number;
  ante: number;
}

export const BLIND_SCHEDULE: BlindLevel[] = [
  { smallBlind: 1, bigBlind: 2, ante: 0 },
  { smallBlind: 2, bigBlind: 4, ante: 0 },
  { smallBlind: 3, bigBlind: 6, ante: 1 },
  { smallBlind: 5, bigBlind: 10, ante: 1 },
  { smallBlind: 8, bigBlind: 16, ante: 2 },
  { smallBlind: 12, bigBlind: 24, ante: 3 },
  { smallBlind: 20, bigBlind: 40, ante: 5 },
  { smallBlind: 30, bigBlind: 60, ante: 8 },
  { smallBlind: 50, bigBlind: 100, ante: 10 },
  { smallBlind: 75, bigBlind: 150, ante: 15 },
];

export const TOURNAMENT_SPEEDS: Record<string, { label: string; handsPerLevel: number }> = {
  fast: { label: 'Fast', handsPerLevel: 5 },
  normal: { label: 'Normal', handsPerLevel: 8 },
  slow: { label: 'Slow', handsPerLevel: 12 },
};

export interface HandAction {
  playerId: string;
  playerName: string;
  action: 'fold' | 'check' | 'call' | 'raise' | 'all-in' | 'post-blind';
  amount: number;
  phase: GamePhase;
  timestamp: number;
}

export interface PlayerState {
  id: string;
  name: string;
  chips: number;
  cards: Card[];
  currentBet: number;
  hasFolded: boolean;
  isAllIn: boolean;
  isHuman: boolean;
  aiProfile?: AIPlayer;
}

export interface HandRecord {
  id: string;
  actions: HandAction[];
  communityCards: string[];
  players: { id: string; name: string; cards: string[]; chipDelta: number; aiStyle?: string }[];
  winners: string[];
  pot: number;
  feedbacks: CoachingFeedback[];
  grade: { grade: string; score: number };
  timestamp: number;
}

export interface GameConfig {
  playerCount: number;
  smallBlind: number;
  bigBlind: number;
  startingChips: number;
  difficulty: AIDifficulty;
  gameMode: GameMode;
  showHandReview: boolean;
  rebuyEnabled: boolean;
  blindSchedule: BlindLevel[];
  handsPerLevel: number;
}

interface GameState {
  // Config
  config: GameConfig;
  phase: GamePhase;

  // Table state
  players: PlayerState[];
  communityCards: Card[];
  deck: Card[];
  pot: number;
  currentBet: number;
  activePlayerIndex: number;
  dealerIndex: number;
  lastRaiseIndex: number;
  actedThisRound: Set<string>;
  handStartChips: Record<string, number>;

  // History
  handActions: HandAction[];
  handHistory: HandRecord[];
  feedbacks: CoachingFeedback[];
  latestFeedback: CoachingFeedback | null;

  // Tournament tracking
  currentBlindLevel: number;
  handsAtCurrentLevel: number;
  eliminatedPlayers: string[];
  tournamentFinished: boolean;
  tournamentPlacement: number | null;

  // Session tracking (all modes)
  totalHandsPlayed: number;
  rebuyCount: number;
  sessionXpEarned: number;
  needsRebuy: boolean;

  // UI state
  isProcessingAI: boolean;

  // Actions
  updateConfig: (config: Partial<GameConfig>) => void;
  startGame: () => void;
  playerFold: () => void;
  playerFoldAndSkip: () => void;
  playerCheck: () => void;
  playerCall: () => void;
  playerRaise: (amount: number) => void;
  playerAllIn: () => void;
  newHand: () => void;
  resetGame: () => void;
  addSessionXp: (xp: number) => void;
  doRebuy: () => void;

  // Internal
  _processAITurn: () => void;
  _advanceToNextPlayer: () => void;
  _advancePhase: () => void;
  _goToShowdown: () => void;
}

const DEFAULT_CONFIG: GameConfig = {
  playerCount: 3,
  smallBlind: 1,
  bigBlind: 2,
  startingChips: 200,
  difficulty: 'easy',
  gameMode: 'hand-by-hand',
  showHandReview: true,
  rebuyEnabled: true,
  blindSchedule: BLIND_SCHEDULE,
  handsPerLevel: 8,
};

function createHandId(): string {
  return `hand-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function getNonFoldedPlayers(players: PlayerState[]): PlayerState[] {
  return players.filter((p) => !p.hasFolded);
}

export const useGameStore = create<GameState>((set, get) => ({
  config: DEFAULT_CONFIG,
  phase: 'setup',
  players: [],
  communityCards: [],
  deck: [],
  pot: 0,
  currentBet: 0,
  activePlayerIndex: 0,
  dealerIndex: 0,
  lastRaiseIndex: -1,
  actedThisRound: new Set(),
  handStartChips: {},
  handActions: [],
  handHistory: [],
  feedbacks: [],
  latestFeedback: null,
  currentBlindLevel: 0,
  handsAtCurrentLevel: 0,
  eliminatedPlayers: [],
  tournamentFinished: false,
  tournamentPlacement: null,
  totalHandsPlayed: 0,
  rebuyCount: 0,
  sessionXpEarned: 0,
  needsRebuy: false,
  isProcessingAI: false,

  updateConfig: (partial) => {
    set((s) => ({ config: { ...s.config, ...partial } }));
  },

  startGame: () => {
    const { config } = get();
    const aiPlayers = generateAIPlayers(config.playerCount - 1, config.difficulty);

    // For tournament, override blinds from schedule
    const effectiveConfig = { ...config };
    if (config.gameMode === 'tournament' && config.blindSchedule.length > 0) {
      effectiveConfig.smallBlind = config.blindSchedule[0].smallBlind;
      effectiveConfig.bigBlind = config.blindSchedule[0].bigBlind;
    }

    const human: PlayerState = {
      id: 'human',
      name: 'You',
      chips: config.startingChips,
      cards: [],
      currentBet: 0,
      hasFolded: false,
      isAllIn: false,
      isHuman: true,
    };

    const ais: PlayerState[] = aiPlayers.map((ai) => ({
      id: ai.id,
      name: ai.name,
      chips: config.startingChips,
      cards: [],
      currentBet: 0,
      hasFolded: false,
      isAllIn: false,
      isHuman: false,
      aiProfile: ai,
    }));

    const players = [human, ...ais];

    set({
      players,
      config: effectiveConfig,
      dealerIndex: 0,
      handHistory: [],
      currentBlindLevel: 0,
      handsAtCurrentLevel: 0,
      eliminatedPlayers: [],
      tournamentFinished: false,
      tournamentPlacement: null,
      totalHandsPlayed: 0,
      rebuyCount: 0,
      sessionXpEarned: 0,
      needsRebuy: false,
      phase: 'setup', // Will transition via newHand
    });

    // Start first hand
    get().newHand();
  },

  newHand: () => {
    const state = get();
    const { config, players, dealerIndex } = state;

    // Hand-by-hand: reset ALL player chips to starting amount
    let basePlayers = players;
    if (config.gameMode === 'hand-by-hand') {
      basePlayers = players.map((p) => ({ ...p, chips: config.startingChips }));
    }

    // Reset player states
    const resetPlayers = basePlayers.map((p) => ({
      ...p,
      cards: [] as Card[],
      currentBet: 0,
      hasFolded: false,
      isAllIn: false,
    }));

    // Handle busted players per mode
    let activePlayers: PlayerState[];
    if (config.gameMode === 'tournament') {
      // Tournament: remove busted players permanently
      activePlayers = resetPlayers.filter((p) => p.chips > 0);
      const human = activePlayers.find((p) => p.isHuman);
      if (!human) {
        // Human busted — set placement
        const placement = activePlayers.length + 1;
        set({ tournamentFinished: true, tournamentPlacement: placement, phase: 'showdown' });
        return;
      }
      if (activePlayers.length <= 1) {
        // Human is last player standing
        set({ tournamentFinished: true, tournamentPlacement: 1, phase: 'showdown', players: activePlayers });
        return;
      }
    } else if (config.gameMode === 'cash-game') {
      // Cash game: check if human busted → need rebuy
      const human = resetPlayers.find((p) => p.isHuman);
      if (human && human.chips <= 0) {
        if (config.rebuyEnabled) {
          set({ needsRebuy: true, phase: 'showdown' });
          return;
        }
        // No rebuys → end session
        set({ phase: 'summary', players: resetPlayers });
        return;
      }
      // Replace busted AI players with fresh ones at starting stack
      activePlayers = resetPlayers.map((p) => {
        if (!p.isHuman && p.chips <= 0) {
          return { ...p, chips: config.startingChips };
        }
        return p;
      });
    } else {
      // Hand-by-hand: all players are active (chips already reset)
      activePlayers = resetPlayers;
    }

    if (activePlayers.length < 2) {
      set({ phase: 'summary', players: activePlayers });
      return;
    }

    // Tournament: advance blind level if needed
    let currentSmallBlind = config.smallBlind;
    let currentBigBlind = config.bigBlind;
    let antePot = 0;
    let newBlindLevel = state.currentBlindLevel;
    let newHandsAtLevel = state.handsAtCurrentLevel;

    if (config.gameMode === 'tournament') {
      newHandsAtLevel += 1;
      if (newHandsAtLevel >= config.handsPerLevel && newBlindLevel < config.blindSchedule.length - 1) {
        newBlindLevel += 1;
        newHandsAtLevel = 0;
      }
      const level = config.blindSchedule[Math.min(newBlindLevel, config.blindSchedule.length - 1)];
      currentSmallBlind = level.smallBlind;
      currentBigBlind = level.bigBlind;

      // Post antes
      if (level.ante > 0) {
        for (const p of activePlayers) {
          const anteAmount = Math.min(level.ante, p.chips);
          p.chips -= anteAmount;
          antePot += anteAmount;
          if (p.chips === 0) p.isAllIn = true;
        }
      }
    }

    // Snapshot chips before any bets for accurate chipDelta at showdown
    const handStartChips = Object.fromEntries(activePlayers.map((p) => [p.id, p.chips]));

    // Deal cards
    let deck = shuffleDeck(createDeck());
    for (const player of activePlayers) {
      const { dealt, remaining } = dealCards(deck, 2);
      player.cards = dealt;
      deck = remaining;
    }

    // Post blinds — heads-up rule: dealer posts SB
    const isHeadsUp = activePlayers.length === 2;
    const sbIdx = isHeadsUp ? dealerIndex % activePlayers.length : (dealerIndex + 1) % activePlayers.length;
    const bbIdx = isHeadsUp ? (dealerIndex + 1) % activePlayers.length : (dealerIndex + 2) % activePlayers.length;
    const sbPlayer = activePlayers[sbIdx];
    const bbPlayer = activePlayers[bbIdx];

    const sbAmount = Math.min(currentSmallBlind, sbPlayer.chips);
    const bbAmount = Math.min(currentBigBlind, bbPlayer.chips);

    sbPlayer.chips -= sbAmount;
    sbPlayer.currentBet = sbAmount;
    if (sbPlayer.chips === 0) sbPlayer.isAllIn = true;

    bbPlayer.chips -= bbAmount;
    bbPlayer.currentBet = bbAmount;
    if (bbPlayer.chips === 0) bbPlayer.isAllIn = true;

    const blindActions: HandAction[] = [
      { playerId: sbPlayer.id, playerName: sbPlayer.name, action: 'post-blind', amount: sbAmount, phase: 'preflop', timestamp: Date.now() },
      { playerId: bbPlayer.id, playerName: bbPlayer.name, action: 'post-blind', amount: bbAmount, phase: 'preflop', timestamp: Date.now() },
    ];

    // Play deal sounds
    sounds.deal();
    setTimeout(() => sounds.deal(), 150);
    setTimeout(() => sounds.blind(), 400);

    // First to act: UTG (after BB) — in heads-up, SB acts first preflop
    const utgIdx = isHeadsUp ? sbIdx : (bbIdx + 1) % activePlayers.length;

    set({
      players: activePlayers,
      communityCards: [],
      deck,
      pot: sbAmount + bbAmount + antePot,
      currentBet: bbAmount,
      activePlayerIndex: utgIdx,
      lastRaiseIndex: bbIdx,
      actedThisRound: new Set(),
      handStartChips,
      handActions: blindActions,
      feedbacks: [],
      latestFeedback: null,
      phase: 'preflop',
      isProcessingAI: false,
      needsRebuy: false,
      totalHandsPlayed: state.totalHandsPlayed + 1,
      currentBlindLevel: newBlindLevel,
      handsAtCurrentLevel: newHandsAtLevel,
      // Update effective blinds for tournament
      ...(config.gameMode === 'tournament' ? {
        config: { ...config, smallBlind: currentSmallBlind, bigBlind: currentBigBlind },
      } : {}),
    });

    // If first player is AI, process their turn
    if (!activePlayers[utgIdx].hasFolded && !activePlayers[utgIdx].isAllIn && !activePlayers[utgIdx].isHuman) {
      setTimeout(() => get()._processAITurn(), 600);
    }
  },

  playerFold: () => {
    const { players, activePlayerIndex, phase } = get();
    const player = players[activePlayerIndex];
    if (!player.isHuman) return;
    sounds.fold();

    const updated = players.map((p, i) =>
      i === activePlayerIndex ? { ...p, hasFolded: true } : p
    );

    const feedback = {
      ...evaluateAction(
        { action: 'fold', amount: 0 },
        buildCoachingCtx(player, get())
      ),
      phase: phase as CoachingFeedback['phase'],
      playerAction: 'fold',
    };

    const action: HandAction = {
      playerId: player.id, playerName: player.name,
      action: 'fold', amount: 0, phase, timestamp: Date.now(),
    };

    set((s) => ({
      players: updated,
      handActions: [...s.handActions, action],
      feedbacks: [...s.feedbacks, feedback],
      latestFeedback: feedback,
    }));

    get()._advanceToNextPlayer();
  },

  playerFoldAndSkip: () => {
    const { players, activePlayerIndex, phase } = get();
    const player = players[activePlayerIndex];
    if (!player.isHuman) return;
    sounds.fold();

    const updated = players.map((p, i) =>
      i === activePlayerIndex ? { ...p, hasFolded: true } : p
    );

    const feedback = {
      ...evaluateAction(
        { action: 'fold', amount: 0 },
        buildCoachingCtx(player, get())
      ),
      phase: phase as CoachingFeedback['phase'],
      playerAction: 'fold',
    };

    const action: HandAction = {
      playerId: player.id, playerName: player.name,
      action: 'fold', amount: 0, phase, timestamp: Date.now(),
    };

    set((s) => ({
      players: updated,
      handActions: [...s.handActions, action],
      feedbacks: [...s.feedbacks, feedback],
      latestFeedback: feedback,
    }));

    // Skip directly to showdown instead of continuing AI turns
    get()._goToShowdown();
  },

  playerCheck: () => {
    const { players, activePlayerIndex, currentBet, phase } = get();
    const player = players[activePlayerIndex];
    if (!player.isHuman || player.currentBet !== currentBet) return;
    sounds.check();

    const feedback = {
      ...evaluateAction(
        { action: 'check', amount: 0 },
        buildCoachingCtx(player, get())
      ),
      phase: phase as CoachingFeedback['phase'],
      playerAction: 'check',
    };

    const action: HandAction = {
      playerId: player.id, playerName: player.name,
      action: 'check', amount: 0, phase, timestamp: Date.now(),
    };

    set((s) => ({
      handActions: [...s.handActions, action],
      feedbacks: [...s.feedbacks, feedback],
      latestFeedback: feedback,
      actedThisRound: new Set([...s.actedThisRound, player.id]),
    }));

    get()._advanceToNextPlayer();
  },

  playerCall: () => {
    const { players, activePlayerIndex, currentBet, phase } = get();
    const player = players[activePlayerIndex];
    if (!player.isHuman) return;
    sounds.call();

    const toCall = Math.min(currentBet - player.currentBet, player.chips);
    const updated = players.map((p, i) => {
      if (i !== activePlayerIndex) return p;
      const newChips = p.chips - toCall;
      return { ...p, chips: newChips, currentBet: p.currentBet + toCall, isAllIn: newChips === 0 };
    });

    const feedback = {
      ...evaluateAction(
        { action: 'call', amount: currentBet },
        buildCoachingCtx(player, get())
      ),
      phase: phase as CoachingFeedback['phase'],
      playerAction: `call $${toCall}`,
    };

    const action: HandAction = {
      playerId: player.id, playerName: player.name,
      action: toCall >= player.chips ? 'all-in' : 'call',
      amount: toCall, phase, timestamp: Date.now(),
    };

    set((s) => ({
      players: updated,
      pot: s.pot + toCall,
      handActions: [...s.handActions, action],
      feedbacks: [...s.feedbacks, feedback],
      latestFeedback: feedback,
      actedThisRound: new Set([...s.actedThisRound, player.id]),
    }));

    get()._advanceToNextPlayer();
  },

  playerRaise: (amount) => {
    const { players, activePlayerIndex, phase } = get();
    const player = players[activePlayerIndex];
    if (!player.isHuman) return;
    sounds.raise();

    const totalBet = amount; // "raise to" amount
    const additional = totalBet - player.currentBet;
    if (additional <= 0 || additional > player.chips) return;

    const updated = players.map((p, i) => {
      if (i !== activePlayerIndex) return p;
      const newChips = p.chips - additional;
      return { ...p, chips: newChips, currentBet: totalBet, isAllIn: newChips === 0 };
    });

    const feedback = {
      ...evaluateAction(
        { action: 'raise', amount: totalBet },
        buildCoachingCtx(player, get())
      ),
      phase: phase as CoachingFeedback['phase'],
      playerAction: `raise to $${totalBet}`,
    };

    const action: HandAction = {
      playerId: player.id, playerName: player.name,
      action: 'raise', amount: additional, phase, timestamp: Date.now(),
    };

    set((s) => ({
      players: updated,
      pot: s.pot + additional,
      currentBet: totalBet,
      lastRaiseIndex: activePlayerIndex,
      handActions: [...s.handActions, action],
      feedbacks: [...s.feedbacks, feedback],
      latestFeedback: feedback,
      actedThisRound: new Set([player.id]), // Reset: everyone else must act again
    }));

    get()._advanceToNextPlayer();
  },

  playerAllIn: () => {
    const { players, activePlayerIndex, currentBet, phase } = get();
    const player = players[activePlayerIndex];
    if (!player.isHuman) return;
    sounds.allIn();

    const allInAmount = player.chips;
    const newBet = player.currentBet + allInAmount;

    const updated = players.map((p, i) => {
      if (i !== activePlayerIndex) return p;
      return { ...p, chips: 0, currentBet: newBet, isAllIn: true };
    });

    const feedback = {
      ...evaluateAction(
        { action: 'all-in', amount: newBet },
        buildCoachingCtx(player, get())
      ),
      phase: phase as CoachingFeedback['phase'],
      playerAction: `all-in $${allInAmount}`,
    };

    const isRaise = newBet > currentBet;
    const action: HandAction = {
      playerId: player.id, playerName: player.name,
      action: 'all-in', amount: allInAmount, phase, timestamp: Date.now(),
    };

    set((s) => ({
      players: updated,
      pot: s.pot + allInAmount,
      currentBet: Math.max(s.currentBet, newBet),
      lastRaiseIndex: isRaise ? activePlayerIndex : s.lastRaiseIndex,
      handActions: [...s.handActions, action],
      feedbacks: [...s.feedbacks, feedback],
      latestFeedback: feedback,
      actedThisRound: isRaise ? new Set([player.id]) : new Set([...s.actedThisRound, player.id]),
    }));

    get()._advanceToNextPlayer();
  },

  _processAITurn: () => {
    const state = get();
    const { players, activePlayerIndex, currentBet, pot, communityCards, phase, dealerIndex } = state;
    const { config } = state;
    const player = players[activePlayerIndex];

    if (!player || player.isHuman || player.hasFolded || player.isAllIn) {
      get()._advanceToNextPlayer();
      return;
    }

    set({ isProcessingAI: true });

    const position = getPosition(activePlayerIndex, dealerIndex, players.length);
    const activePlayers = getNonFoldedPlayers(players);

    const decision = makeAIDecision(
      {
        holeCards: player.cards,
        communityCards,
        pot,
        currentBet,
        playerBet: player.currentBet,
        chips: player.chips,
        phase: phase as 'preflop' | 'flop' | 'turn' | 'river',
        position,
        numPlayers: activePlayers.length,
        isFirstAction: state.actedThisRound.size === 0,
        bigBlind: config.bigBlind,
      },
      player.aiProfile!
    );

    // Apply decision
    const toCall = currentBet - player.currentBet;

    let updatedPlayers = [...players];
    let newPot = pot;
    let newCurrentBet = currentBet;
    let newLastRaise = state.lastRaiseIndex;
    let newActed = new Set(state.actedThisRound);
    let actionRecord: HandAction;

    if (decision.action === 'fold') {
      sounds.fold();
      updatedPlayers = players.map((p, i) =>
        i === activePlayerIndex ? { ...p, hasFolded: true } : p
      );
      actionRecord = { playerId: player.id, playerName: player.name, action: 'fold', amount: 0, phase, timestamp: Date.now() };
    } else if (decision.action === 'check') {
      sounds.check();
      actionRecord = { playerId: player.id, playerName: player.name, action: 'check', amount: 0, phase, timestamp: Date.now() };
      newActed.add(player.id);
    } else if (decision.action === 'call') {
      sounds.call();
      const callAmt = Math.min(toCall, player.chips);
      updatedPlayers = players.map((p, i) => {
        if (i !== activePlayerIndex) return p;
        const nc = p.chips - callAmt;
        return { ...p, chips: nc, currentBet: p.currentBet + callAmt, isAllIn: nc === 0 };
      });
      newPot += callAmt;
      actionRecord = { playerId: player.id, playerName: player.name, action: callAmt >= player.chips ? 'all-in' : 'call', amount: callAmt, phase, timestamp: Date.now() };
      newActed.add(player.id);
    } else if (decision.action === 'all-in') {
      sounds.allIn();
      const allIn = player.chips;
      const nb = player.currentBet + allIn;
      updatedPlayers = players.map((p, i) => {
        if (i !== activePlayerIndex) return p;
        return { ...p, chips: 0, currentBet: nb, isAllIn: true };
      });
      newPot += allIn;
      if (nb > currentBet) {
        newCurrentBet = nb;
        newLastRaise = activePlayerIndex;
        newActed = new Set([player.id]);
      } else {
        newActed.add(player.id);
      }
      actionRecord = { playerId: player.id, playerName: player.name, action: 'all-in', amount: allIn, phase, timestamp: Date.now() };
    } else {
      // raise
      sounds.raise();
      const raiseTotal = Math.min(decision.amount, player.currentBet + player.chips);
      const additional = raiseTotal - player.currentBet;
      const nc = player.chips - additional;
      updatedPlayers = players.map((p, i) => {
        if (i !== activePlayerIndex) return p;
        return { ...p, chips: nc, currentBet: raiseTotal, isAllIn: nc === 0 };
      });
      newPot += additional;
      newCurrentBet = raiseTotal;
      newLastRaise = activePlayerIndex;
      newActed = new Set([player.id]);
      actionRecord = { playerId: player.id, playerName: player.name, action: nc === 0 ? 'all-in' : 'raise', amount: additional, phase, timestamp: Date.now() };
    }

    set({
      players: updatedPlayers,
      pot: newPot,
      currentBet: newCurrentBet,
      lastRaiseIndex: newLastRaise,
      actedThisRound: newActed,
      handActions: [...state.handActions, actionRecord],
      isProcessingAI: false,
    });

    get()._advanceToNextPlayer();
  },

  _advanceToNextPlayer: () => {
    const state = get();
    const { players, activePlayerIndex, actedThisRound } = state;
    const n = players.length;

    // Find next player who can act
    let nextIdx = (activePlayerIndex + 1) % n;
    let checked = 0;

    while (checked < n) {
      const p = players[nextIdx];
      if (!p.hasFolded && !p.isAllIn && !actedThisRound.has(p.id)) {
        break;
      }
      nextIdx = (nextIdx + 1) % n;
      checked++;
    }

    // Check if only one non-folded player remains
    const nonFolded = getNonFoldedPlayers(players);
    if (nonFolded.length <= 1) {
      get()._goToShowdown();
      return;
    }

    // Check if betting round is complete (everyone who can act has acted)
    const canAct = players.filter((p) => !p.hasFolded && !p.isAllIn);
    const allActed = canAct.every((p) => actedThisRound.has(p.id));

    if (allActed || checked >= n) {
      get()._advancePhase();
      return;
    }

    set({ activePlayerIndex: nextIdx });

    // If next player is AI, schedule their turn
    const nextPlayer = players[nextIdx];
    if (nextPlayer && !nextPlayer.isHuman && !nextPlayer.hasFolded && !nextPlayer.isAllIn) {
      const delay = 500 + Math.random() * 1000;
      setTimeout(() => get()._processAITurn(), delay);
    }
  },

  _advancePhase: () => {
    const state = get();
    const { phase, deck, players, communityCards, dealerIndex } = state;

    // Reset betting state for new round
    const resetPlayers = players.map((p) => ({ ...p, currentBet: 0 }));

    const nextPhaseMap: Record<string, GamePhase> = {
      preflop: 'flop',
      flop: 'turn',
      turn: 'river',
      river: 'showdown',
    };

    const nextPhase = nextPhaseMap[phase];
    if (!nextPhase || nextPhase === 'showdown') {
      get()._goToShowdown();
      return;
    }

    // Deal community cards
    let newDeck = deck;
    let newCommunity = [...communityCards];

    sounds.newStreet();

    if (nextPhase === 'flop') {
      const { dealt, remaining } = dealCards(newDeck, 3);
      newCommunity = dealt;
      newDeck = remaining;
      // Flop: 3 card deal sounds
      setTimeout(() => sounds.deal(), 50);
      setTimeout(() => sounds.deal(), 150);
      setTimeout(() => sounds.deal(), 250);
    } else {
      const { dealt, remaining } = dealCards(newDeck, 1);
      newCommunity = [...newCommunity, ...dealt];
      newDeck = remaining;
      setTimeout(() => sounds.deal(), 50);
    }

    // First to act after dealer
    const nonFolded = players.filter((p) => !p.hasFolded && !p.isAllIn);
    if (nonFolded.length === 0) {
      set({ communityCards: newCommunity, deck: newDeck });
      get()._goToShowdown();
      return;
    }

    // Find first active player after dealer
    let firstActIdx = (dealerIndex + 1) % players.length;
    let attempts = 0;
    while (attempts < players.length) {
      const p = players[firstActIdx];
      if (!p.hasFolded && !p.isAllIn) break;
      firstActIdx = (firstActIdx + 1) % players.length;
      attempts++;
    }

    set({
      phase: nextPhase,
      communityCards: newCommunity,
      deck: newDeck,
      players: resetPlayers,
      currentBet: 0,
      activePlayerIndex: firstActIdx,
      lastRaiseIndex: -1,
      actedThisRound: new Set(),
    });

    // If first player is AI, process their turn
    const firstPlayer = resetPlayers[firstActIdx];
    if (firstPlayer && !firstPlayer.isHuman && !firstPlayer.hasFolded && !firstPlayer.isAllIn) {
      setTimeout(() => get()._processAITurn(), 600);
    }
  },

  _goToShowdown: () => {
    const state = get();
    let { players, communityCards, pot, deck, feedbacks, handActions } = state;

    // Deal remaining community cards if needed
    let newCommunity = [...communityCards];
    let newDeck = [...deck];
    while (newCommunity.length < 5) {
      const { dealt, remaining } = dealCards(newDeck, 1);
      newCommunity = [...newCommunity, ...dealt];
      newDeck = remaining;
    }

    const nonFolded = getNonFoldedPlayers(players);

    // If only one player remains, they win
    if (nonFolded.length === 1) {
      const winner = nonFolded[0];
      if (winner.isHuman) sounds.win(); else sounds.lose();
      const updatedPlayers = players.map((p) =>
        p.id === winner.id ? { ...p, chips: p.chips + pot } : p
      );

      const grade = calculateHandGrade(feedbacks);
      const { handStartChips } = state;
      const record: HandRecord = {
        id: createHandId(),
        actions: handActions,
        communityCards: newCommunity.map(cardToString),
        players: updatedPlayers.map((p) => ({
          id: p.id, name: p.name,
          cards: p.cards.map(cardToString),
          chipDelta: updatedPlayers.find((up) => up.id === p.id)!.chips - (handStartChips[p.id] || 0),
          aiStyle: p.aiProfile ? getStyleLabel(p.aiProfile.style) : undefined,
        })),
        winners: [winner.name],
        pot,
        feedbacks,
        grade,
        timestamp: Date.now(),
      };

      // Track eliminated players in tournament mode
      const newlyEliminated = state.config.gameMode === 'tournament'
        ? updatedPlayers.filter((p) => p.chips === 0 && !state.eliminatedPlayers.includes(p.name)).map((p) => p.name)
        : [];

      set((s) => ({
        phase: 'showdown',
        communityCards: newCommunity,
        players: updatedPlayers,
        pot: 0,
        handHistory: [...s.handHistory, record],
        eliminatedPlayers: [...s.eliminatedPlayers, ...newlyEliminated],
      }));
      return;
    }

    // Evaluate all remaining hands
    const hands = nonFolded.map((p) => ({
      player: p,
      result: evaluateHand([...p.cards, ...newCommunity]),
    }));

    const winnerIndices = determineWinners(hands.map((h) => h.result));
    const winnerIds = winnerIndices.map((i) => hands[i].player.id);
    if (winnerIds.includes('human')) sounds.win(); else sounds.lose();
    const share = Math.floor(pot / winnerIds.length);

    const updatedPlayers = players.map((p) => ({
      ...p,
      chips: winnerIds.includes(p.id) ? p.chips + share : p.chips,
    }));

    const grade = calculateHandGrade(feedbacks);
    const { handStartChips } = state;

    const record: HandRecord = {
      id: createHandId(),
      actions: handActions,
      communityCards: newCommunity.map(cardToString),
      players: updatedPlayers.map((p) => ({
        id: p.id, name: p.name,
        cards: p.cards.map(cardToString),
        chipDelta: p.chips - (handStartChips[p.id] || 0),
        aiStyle: p.aiProfile ? getStyleLabel(p.aiProfile.style) : undefined,
      })),
      winners: winnerIds.map((id) => updatedPlayers.find((p) => p.id === id)!.name),
      pot,
      feedbacks,
      grade,
      timestamp: Date.now(),
    };

    // Track eliminated players in tournament mode
    const newlyEliminated = state.config.gameMode === 'tournament'
      ? updatedPlayers.filter((p) => p.chips === 0 && !state.eliminatedPlayers.includes(p.name)).map((p) => p.name)
      : [];

    set((s) => ({
      phase: 'showdown',
      communityCards: newCommunity,
      players: updatedPlayers,
      pot: 0,
      handHistory: [...s.handHistory, record],
      eliminatedPlayers: [...s.eliminatedPlayers, ...newlyEliminated],
    }));
  },

  resetGame: () => {
    set({
      phase: 'setup',
      config: DEFAULT_CONFIG,
      players: [],
      communityCards: [],
      deck: [],
      pot: 0,
      currentBet: 0,
      activePlayerIndex: 0,
      dealerIndex: 0,
      lastRaiseIndex: -1,
      actedThisRound: new Set(),
      handStartChips: {},
      handActions: [],
      handHistory: [],
      feedbacks: [],
      latestFeedback: null,
      isProcessingAI: false,
      currentBlindLevel: 0,
      handsAtCurrentLevel: 0,
      eliminatedPlayers: [],
      tournamentFinished: false,
      tournamentPlacement: null,
      totalHandsPlayed: 0,
      rebuyCount: 0,
      sessionXpEarned: 0,
      needsRebuy: false,
    });
  },

  addSessionXp: (xp: number) => {
    set((s) => ({ sessionXpEarned: s.sessionXpEarned + xp }));
  },

  doRebuy: () => {
    set((s) => {
      const players = s.players.map((p) =>
        p.isHuman ? { ...p, chips: s.config.startingChips } : p
      );
      return { players, needsRebuy: false, rebuyCount: s.rebuyCount + 1 };
    });
    // Rotate dealer and start new hand
    useGameStore.setState((s) => ({
      dealerIndex: (s.dealerIndex + 1) % s.players.length,
    }));
    get().newHand();
  },
}));

function buildCoachingCtx(player: PlayerState, state: GameState) {
  return {
    holeCards: player.cards,
    communityCards: state.communityCards,
    pot: state.pot,
    currentBet: state.currentBet,
    playerBet: player.currentBet,
    chips: player.chips,
    phase: state.phase as 'preflop' | 'flop' | 'turn' | 'river',
    position: getPosition(
      state.players.indexOf(player),
      state.dealerIndex,
      state.players.length
    ),
    bigBlind: state.config.bigBlind,
    numPlayers: getNonFoldedPlayers(state.players).length,
  };
}
