// Rule-based instant coaching feedback for player decisions

import { type Card, handStrength } from './poker';

export type FeedbackGrade = 'Good' | 'Okay' | 'Mistake';

export interface CoachingFeedback {
  grade: FeedbackGrade;
  message: string;
  detail?: string;
  phase?: 'preflop' | 'flop' | 'turn' | 'river';
  playerAction?: string; // What the user did (e.g. "fold", "raise to $20")
}

export interface PlayerAction {
  action: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
  amount: number;
}

export interface CoachingContext {
  holeCards: Card[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  playerBet: number; // Player's current bet this round
  chips: number;
  phase: 'preflop' | 'flop' | 'turn' | 'river';
  position: 'early' | 'middle' | 'late' | 'blind';
  bigBlind: number;
  numPlayers: number;
}

/** Evaluate a player's action and provide coaching feedback */
export function evaluateAction(action: PlayerAction, ctx: CoachingContext): CoachingFeedback {
  const strength = handStrength(ctx.holeCards, ctx.communityCards);
  const toCall = ctx.currentBet - ctx.playerBet;
  const potOdds = toCall > 0 ? toCall / (ctx.pot + toCall) : 0;

  if (ctx.phase === 'preflop') {
    return evaluatePreflop(action, ctx, strength);
  }

  return evaluatePostflop(action, ctx, strength, toCall, potOdds);
}

function evaluatePreflop(action: PlayerAction, ctx: CoachingContext, strength: number): CoachingFeedback {
  const posThreshold = getPositionThreshold(ctx.position);
  const shouldPlay = strength >= posThreshold;

  if (action.action === 'fold') {
    if (shouldPlay) {
      return {
        grade: 'Mistake',
        message: `This hand is strong enough to play from ${ctx.position} position.`,
        detail: `Hand strength: ${(strength * 100).toFixed(0)}%. You need about ${(posThreshold * 100).toFixed(0)}% to open from here.`,
      };
    }
    return { grade: 'Good', message: 'Good fold. This hand is too weak for this position.' };
  }

  if (action.action === 'call' || action.action === 'check') {
    if (!shouldPlay) {
      return {
        grade: 'Mistake',
        message: `This hand is too weak to play from ${ctx.position} position.`,
        detail: 'Consider folding marginal hands, especially out of position.',
      };
    }
    if (strength > 0.7) {
      return {
        grade: 'Okay',
        message: 'This hand is strong enough to raise for value preflop.',
        detail: 'Raising builds the pot and narrows opponents\' ranges.',
      };
    }
    return { grade: 'Good', message: 'Reasonable call with this hand.' };
  }

  if (action.action === 'raise' || action.action === 'all-in') {
    if (!shouldPlay) {
      return {
        grade: 'Mistake',
        message: 'This hand is too weak to raise from this position.',
        detail: `You need about ${(posThreshold * 100).toFixed(0)}% hand strength to open here.`,
      };
    }
    const raiseAmount = action.amount - ctx.currentBet;
    return evaluateBetSizing(raiseAmount, ctx, strength, 'raise');
  }

  return { grade: 'Okay', message: 'Reasonable play.' };
}

function evaluatePostflop(
  action: PlayerAction, ctx: CoachingContext, strength: number, toCall: number, potOdds: number
): CoachingFeedback {
  if (action.action === 'fold') {
    if (toCall === 0) {
      return { grade: 'Mistake', message: 'No need to fold when you can check for free!' };
    }
    if (strength > potOdds + 0.1) {
      return {
        grade: 'Mistake',
        message: 'You have the right pot odds to continue here.',
        detail: `Pot odds: ${(potOdds * 100).toFixed(0)}%, Hand strength: ~${(strength * 100).toFixed(0)}%.`,
      };
    }
    if (strength < 0.2) {
      return { grade: 'Good', message: 'Smart fold with a weak hand against a bet.' };
    }
    return { grade: 'Okay', message: 'Folding is defensible here, but you might be giving up too easily.' };
  }

  if (action.action === 'check') {
    if (strength > 0.7 && ctx.position === 'late') {
      return {
        grade: 'Okay',
        message: 'You have a strong hand -- consider betting for value.',
        detail: 'Checking strong hands in position can work, but you miss value.',
      };
    }
    return { grade: 'Good', message: 'Checking is fine here.' };
  }

  if (action.action === 'call') {
    if (strength < potOdds - 0.1) {
      return {
        grade: 'Mistake',
        message: 'The pot odds don\'t justify this call.',
        detail: `You need ~${(potOdds * 100).toFixed(0)}% equity but have ~${(strength * 100).toFixed(0)}%.`,
      };
    }
    if (strength > 0.75 && toCall < ctx.pot * 0.5) {
      return {
        grade: 'Okay',
        message: 'With this strong hand, consider raising instead of just calling.',
        detail: 'Raising builds the pot when you likely have the best hand.',
      };
    }
    return { grade: 'Good', message: 'Good call with the right odds.' };
  }

  if (action.action === 'raise' || action.action === 'all-in') {
    if (strength < 0.25) {
      // Could be a bluff - acceptable sometimes
      return {
        grade: 'Okay',
        message: 'Aggressive play! Make sure you have a plan if called.',
        detail: 'Bluffing works best in position with a scary board.',
      };
    }
    const raiseAmount = action.amount - ctx.currentBet;
    return evaluateBetSizing(raiseAmount, ctx, strength, 'bet');
  }

  return { grade: 'Okay', message: 'Reasonable play.' };
}

function evaluateBetSizing(
  amount: number, ctx: CoachingContext, strength: number, type: 'raise' | 'bet'
): CoachingFeedback {
  const potRatio = amount / Math.max(ctx.pot, 1);

  if (potRatio < 0.25 && amount > 0) {
    return {
      grade: 'Okay',
      message: `Your ${type} is quite small relative to the pot.`,
      detail: 'Small bets give opponents great odds to draw against you.',
    };
  }
  if (potRatio > 2) {
    if (strength > 0.8) {
      return { grade: 'Okay', message: 'Large bet -- you might scare everyone away.' };
    }
    return {
      grade: 'Mistake',
      message: `Over-betting the pot with a ${strength < 0.4 ? 'weak' : 'medium'} hand is risky.`,
      detail: 'Bet 50-100% of the pot for most situations.',
    };
  }
  if (potRatio >= 0.4 && potRatio <= 1.0) {
    return { grade: 'Good', message: `Good ${type} sizing.` };
  }

  return { grade: 'Okay', message: `${type === 'raise' ? 'Raise' : 'Bet'} is reasonable.` };
}

/** Position-based minimum hand strength to play preflop */
function getPositionThreshold(position: CoachingContext['position']): number {
  switch (position) {
    case 'early': return 0.55;
    case 'middle': return 0.45;
    case 'late': return 0.35;
    case 'blind': return 0.40;
  }
}

/** Calculate overall hand grade for summary */
export function calculateHandGrade(feedbacks: CoachingFeedback[]): { grade: FeedbackGrade; score: number } {
  if (feedbacks.length === 0) return { grade: 'Okay', score: 50 };

  const scores = feedbacks.map((f) => {
    switch (f.grade) {
      case 'Good': return 100;
      case 'Okay': return 60;
      case 'Mistake': return 20;
    }
  });

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  let grade: FeedbackGrade;
  if (avg >= 75) grade = 'Good';
  else if (avg >= 45) grade = 'Okay';
  else grade = 'Mistake';

  return { grade, score: Math.round(avg) };
}
