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

  // History
  handActions: HandAction[];
  handHistory: HandRecord[];
  feedbacks: CoachingFeedback[];
  latestFeedback: CoachingFeedback | null;

  // UI state
  isProcessingAI: boolean;

  // Actions
  updateConfig: (config: Partial<GameConfig>) => void;
  startGame: () => void;
  playerFold: () => void;
  playerCheck: () => void;
  playerCall: () => void;
  playerRaise: (amount: number) => void;
  playerAllIn: () => void;
  newHand: () => void;
  resetGame: () => void;

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
  handActions: [],
  handHistory: [],
  feedbacks: [],
  latestFeedback: null,
  isProcessingAI: false,

  updateConfig: (partial) => {
    set((s) => ({ config: { ...s.config, ...partial } }));
  },

  startGame: () => {
    const { config } = get();
    const aiPlayers = generateAIPlayers(config.playerCount - 1, config.difficulty);

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
      dealerIndex: 0,
      handHistory: [],
      phase: 'setup', // Will transition via newHand
    });

    // Start first hand
    get().newHand();
  },

  newHand: () => {
    const state = get();
    const { config, players, dealerIndex } = state;

    // Reset player states
    const resetPlayers = players.map((p) => ({
      ...p,
      cards: [] as Card[],
      currentBet: 0,
      hasFolded: false,
      isAllIn: false,
    }));

    // Remove busted players
    const activePlayers = resetPlayers.filter((p) => p.chips > 0);
    if (activePlayers.length < 2) {
      set({ phase: 'summary', players: activePlayers });
      return;
    }

    // Deal cards
    let deck = shuffleDeck(createDeck());
    for (const player of activePlayers) {
      const { dealt, remaining } = dealCards(deck, 2);
      player.cards = dealt;
      deck = remaining;
    }

    // Post blinds
    const sbIdx = (dealerIndex + 1) % activePlayers.length;
    const bbIdx = (dealerIndex + 2) % activePlayers.length;
    const sbPlayer = activePlayers[sbIdx];
    const bbPlayer = activePlayers[bbIdx];

    const sbAmount = Math.min(config.smallBlind, sbPlayer.chips);
    const bbAmount = Math.min(config.bigBlind, bbPlayer.chips);

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

    // First to act: UTG (after BB)
    const utgIdx = (bbIdx + 1) % activePlayers.length;

    set({
      players: activePlayers,
      communityCards: [],
      deck,
      pot: sbAmount + bbAmount,
      currentBet: bbAmount,
      activePlayerIndex: utgIdx,
      lastRaiseIndex: bbIdx,
      actedThisRound: new Set(),
      handActions: blindActions,
      feedbacks: [],
      latestFeedback: null,
      phase: 'preflop',
      isProcessingAI: false,
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
      const record: HandRecord = {
        id: createHandId(),
        actions: handActions,
        communityCards: newCommunity.map(cardToString),
        players: updatedPlayers.map((p) => ({
          id: p.id, name: p.name,
          cards: p.cards.map(cardToString),
          chipDelta: p.id === winner.id ? pot : -(state.players.find((sp) => sp.id === p.id)!.chips - p.chips + (p.id === winner.id ? pot : 0)),
          aiStyle: p.aiProfile ? getStyleLabel(p.aiProfile.style) : undefined,
        })),
        winners: [winner.name],
        pot,
        feedbacks,
        grade,
        timestamp: Date.now(),
      };

      set((s) => ({
        phase: 'showdown',
        communityCards: newCommunity,
        players: updatedPlayers,
        pot: 0,
        handHistory: [...s.handHistory, record],
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
    const startChips = state.players.reduce<Record<string, number>>((acc, p) => {
      acc[p.id] = p.chips;
      return acc;
    }, {});

    const record: HandRecord = {
      id: createHandId(),
      actions: handActions,
      communityCards: newCommunity.map(cardToString),
      players: updatedPlayers.map((p) => ({
        id: p.id, name: p.name,
        cards: p.cards.map(cardToString),
        chipDelta: p.chips - (startChips[p.id] || 0),
        aiStyle: p.aiProfile ? getStyleLabel(p.aiProfile.style) : undefined,
      })),
      winners: winnerIds.map((id) => updatedPlayers.find((p) => p.id === id)!.name),
      pot,
      feedbacks,
      grade,
      timestamp: Date.now(),
    };

    set((s) => ({
      phase: 'showdown',
      communityCards: newCommunity,
      players: updatedPlayers,
      pot: 0,
      handHistory: [...s.handHistory, record],
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
      handActions: [],
      handHistory: [],
      feedbacks: [],
      latestFeedback: null,
      isProcessingAI: false,
    });
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
