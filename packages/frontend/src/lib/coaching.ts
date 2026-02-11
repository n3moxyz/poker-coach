// Rule-based instant coaching feedback for player decisions

import { type Card, handStrength, evaluateHand, stringToCard } from './poker';
import { type HandRecord, type HandAction } from '@/stores/gameStore';

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
        message: `This hand is strong enough to play from ${ctx.position} position. Folding here means giving up a profitable spot.`,
        detail: `Your hand strength is ~${(strength * 100).toFixed(0)}%, and you only need ~${(posThreshold * 100).toFixed(0)}% to open from ${ctx.position}. In a ${ctx.numPlayers}-player game, this hand has solid equity preflop.`,
      };
    }
    return {
      grade: 'Good',
      message: `Good fold. This hand is too weak for ${ctx.position} position in a ${ctx.numPlayers}-player game.`,
      detail: `Hand strength ~${(strength * 100).toFixed(0)}% is below the ~${(posThreshold * 100).toFixed(0)}% threshold for this position. Disciplined folds save chips in the long run.`,
    };
  }

  if (action.action === 'call' || action.action === 'check') {
    if (!shouldPlay) {
      return {
        grade: 'Mistake',
        message: `This hand is too weak to play from ${ctx.position} position. You're likely dominated by hands that are raising here.`,
        detail: `Hand strength ~${(strength * 100).toFixed(0)}% is below the ~${(posThreshold * 100).toFixed(0)}% threshold. Playing weak hands out of position leads to tough decisions on later streets.`,
      };
    }
    if (strength > 0.7) {
      return {
        grade: 'Okay',
        message: 'This hand is strong enough to raise for value preflop. Just calling lets weaker hands see the flop cheaply.',
        detail: `With ~${(strength * 100).toFixed(0)}% hand strength, raising builds the pot when you likely have the best hand, and it narrows opponents' ranges so you face fewer players post-flop.`,
      };
    }
    return {
      grade: 'Good',
      message: `Reasonable call with this hand from ${ctx.position} position.`,
      detail: `Hand strength ~${(strength * 100).toFixed(0)}% is playable here. Calling keeps the pot small while seeing a flop.`,
    };
  }

  if (action.action === 'raise' || action.action === 'all-in') {
    if (!shouldPlay) {
      return {
        grade: 'Mistake',
        message: `This hand is too weak to raise from ${ctx.position} position. You're risking chips with poor equity.`,
        detail: `Hand strength ~${(strength * 100).toFixed(0)}% is below the ~${(posThreshold * 100).toFixed(0)}% threshold. If called, you'll often be behind and face tough decisions post-flop.`,
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
      return {
        grade: 'Mistake',
        message: 'No need to fold when you can check for free! You\'re giving up your equity in the pot for nothing.',
        detail: 'When no one has bet, always check instead of folding. You might improve on the next card at zero cost.',
      };
    }
    if (strength > potOdds + 0.1) {
      return {
        grade: 'Mistake',
        message: `You have the right pot odds to continue here. Your hand equity (~${(strength * 100).toFixed(0)}%) exceeds the price you're being asked to pay.`,
        detail: `The pot is $${ctx.pot} and you need to call $${toCall}, giving you pot odds of ${(potOdds * 100).toFixed(0)}%. Since your equity is higher, calling is profitable long-term.`,
      };
    }
    if (strength < 0.2) {
      return {
        grade: 'Good',
        message: `Smart fold with a weak hand (~${(strength * 100).toFixed(0)}% equity) against a bet. No point chasing with poor odds.`,
        detail: `The pot odds required ~${(potOdds * 100).toFixed(0)}% equity, and your hand doesn't come close. Saving chips here is the right play.`,
      };
    }
    return {
      grade: 'Okay',
      message: 'Folding is defensible here, but you might be giving up too easily with some equity left.',
      detail: `Your hand has ~${(strength * 100).toFixed(0)}% equity and the pot odds need ~${(potOdds * 100).toFixed(0)}%. It's close — consider your read on the opponent before folding.`,
    };
  }

  if (action.action === 'check') {
    if (strength > 0.7 && ctx.position === 'late') {
      return {
        grade: 'Okay',
        message: `You have a strong hand (~${(strength * 100).toFixed(0)}% equity) in late position — consider betting for value to build the pot.`,
        detail: 'Checking strong hands in position can work as a trap, but you risk giving free cards and missing value from weaker hands that would call.',
      };
    }
    if (strength > 0.7) {
      return {
        grade: 'Good',
        message: `Checking a strong hand (~${(strength * 100).toFixed(0)}%) from ${ctx.position} position. This can work as a trap play.`,
        detail: 'Out of position with a strong hand, checking lets you see what opponents do before committing more chips.',
      };
    }
    return {
      grade: 'Good',
      message: `Checking is fine here with ~${(strength * 100).toFixed(0)}% equity.`,
      detail: ctx.position === 'late'
        ? 'In position, checking controls the pot size with a marginal hand.'
        : 'Out of position, checking avoids bloating the pot when you\'re unsure where you stand.',
    };
  }

  if (action.action === 'call') {
    if (strength < potOdds - 0.1) {
      return {
        grade: 'Mistake',
        message: `The pot odds don't justify this call. You need ~${(potOdds * 100).toFixed(0)}% equity but only have ~${(strength * 100).toFixed(0)}%.`,
        detail: `Calling $${toCall} into a $${ctx.pot} pot is a losing play when your hand isn't strong enough. Over time, these calls add up to significant chip losses.`,
      };
    }
    if (strength > 0.75 && toCall < ctx.pot * 0.5) {
      return {
        grade: 'Okay',
        message: `With ~${(strength * 100).toFixed(0)}% equity, you likely have the best hand. Consider raising to build the pot instead of flat-calling.`,
        detail: `You're only calling $${toCall} into a $${ctx.pot} pot — raising would extract more value from weaker hands and protect against draws.`,
      };
    }
    return {
      grade: 'Good',
      message: `Good call. Your hand equity (~${(strength * 100).toFixed(0)}%) justifies the price.`,
      detail: `Pot odds of ${(potOdds * 100).toFixed(0)}% are favorable for your hand strength. This is a profitable call.`,
    };
  }

  if (action.action === 'raise' || action.action === 'all-in') {
    if (strength < 0.25) {
      return {
        grade: 'Okay',
        message: `Aggressive play with a weak hand (~${(strength * 100).toFixed(0)}% equity). This could work as a bluff if opponents fold.`,
        detail: `Bluffing works best in position with a scary board. Make sure the story makes sense — would you bet this way with a strong hand too?`,
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
      message: `Your ${type} of $${amount} is quite small (${(potRatio * 100).toFixed(0)}% of the $${ctx.pot} pot). This gives opponents great odds to chase draws.`,
      detail: `Aim for 50-75% of the pot when betting for value, or 33-50% as a bluff. A min-bet rarely accomplishes what you want.`,
    };
  }
  if (potRatio > 2) {
    if (strength > 0.8) {
      return {
        grade: 'Okay',
        message: `Large overbet (${(potRatio * 100).toFixed(0)}% pot) with a strong hand. You might scare everyone away and miss value.`,
        detail: 'With a strong hand, a 60-100% pot bet usually extracts the most value. Save overbets for polarized spots.',
      };
    }
    return {
      grade: 'Mistake',
      message: `Over-betting the pot (${(potRatio * 100).toFixed(0)}%) with a ${strength < 0.4 ? 'weak' : 'medium-strength'} hand risks a lot of chips without enough equity to back it up.`,
      detail: 'Standard bet sizing is 50-100% of the pot. Overbets should be reserved for very strong hands or well-timed bluffs.',
    };
  }
  if (potRatio >= 0.4 && potRatio <= 1.0) {
    return {
      grade: 'Good',
      message: `Good ${type} sizing — $${amount} is ${(potRatio * 100).toFixed(0)}% of the pot. This is the standard range for value bets and bluffs.`,
      detail: strength > 0.6
        ? 'Solid value bet that gives drawing hands a bad price to continue.'
        : 'Good size that can fold out better hands or charge draws correctly.',
    };
  }

  return {
    grade: 'Okay',
    message: `${type === 'raise' ? 'Raise' : 'Bet'} of $${amount} (${(potRatio * 100).toFixed(0)}% pot) is reasonable.`,
  };
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

// ============================================
// Retrospective Hand Analysis (no LLM needed)
// ============================================

export interface HandAnalysis {
  overallGrade: string;
  streetAnalysis: Array<{ street: string; grade: string; analysis: string }>;
  keyLessons: string[];
  coachNote: string;
}

const GRADE_LETTER: Record<string, string> = {
  Good: 'A',
  Okay: 'C',
  Mistake: 'F',
};

/** Generate a comprehensive retrospective analysis of a completed hand */
export function generateHandAnalysis(record: HandRecord): HandAnalysis {
  const human = record.players.find((p) => p.id === 'human');
  if (!human) {
    return { overallGrade: 'C', streetAnalysis: [], keyLessons: [], coachNote: 'No player data available.' };
  }

  const humanCards = human.cards.map((c) => stringToCard(c));
  const board = record.communityCards.map((c) => stringToCard(c));
  const won = record.winners.includes('You');
  const actionsByPhase = groupByPhase(record.actions);
  const phases = Object.keys(actionsByPhase);

  // Evaluate final hand if we reached showdown
  let humanHandName = '';
  let winnerHandName = '';
  if (board.length >= 3) {
    try {
      const humanResult = evaluateHand([...humanCards, ...board]);
      humanHandName = humanResult.name;
    } catch { /* not enough cards */ }

    // Find winner's hand
    const winner = record.players.find((p) => record.winners.includes(p.name) && p.id !== 'human');
    if (winner && winner.cards.length === 2) {
      try {
        const winnerCards = winner.cards.map((c) => stringToCard(c));
        const winnerResult = evaluateHand([...winnerCards, ...board]);
        winnerHandName = winnerResult.name;
      } catch { /* */ }
    }
  }

  // Analyze each street
  const streetAnalysis: HandAnalysis['streetAnalysis'] = [];
  const lessons: string[] = [];

  for (const phase of phases) {
    const actions = actionsByPhase[phase];
    const humanActions = actions.filter((a) => a.playerId === 'human' && a.action !== 'post-blind');
    if (humanActions.length === 0) continue;

    const boardAtStreet = getBoardForPhase(phase, board);
    const strength = handStrength(humanCards, boardAtStreet);
    const streetLabel = phase.charAt(0).toUpperCase() + phase.slice(1);

    const { grade, analysis, lesson } = analyzeStreetActions(
      phase, humanActions, actions, strength, humanHandName, record, won, humanCards, boardAtStreet
    );

    streetAnalysis.push({ street: phase, grade, analysis });
    if (lesson) lessons.push(lesson);
  }

  // Overall grade from per-action feedbacks
  const overallScore = record.grade.score;
  let overallGrade: string;
  if (overallScore >= 85) overallGrade = 'A';
  else if (overallScore >= 70) overallGrade = 'B';
  else if (overallScore >= 50) overallGrade = 'C';
  else if (overallScore >= 30) overallGrade = 'D';
  else overallGrade = 'F';

  // Add general lessons based on the hand outcome
  if (won && humanHandName) {
    lessons.push(`You won with ${humanHandName}. Good hands still need solid play — your decisions determined how much value you extracted.`);
  } else if (!won && winnerHandName && humanHandName) {
    lessons.push(`You lost with ${humanHandName} to the opponent's ${winnerHandName}. Losing doesn't mean you played badly — focus on whether each decision was correct given what you knew.`);
  }

  if (lessons.length === 0) {
    lessons.push('Every hand is a learning opportunity. Review your decisions at each street to build better instincts over time.');
  }

  // Coach note
  const coachNote = generateCoachNote(overallGrade, won, record);

  return { overallGrade, streetAnalysis, keyLessons: lessons, coachNote };
}

function analyzeStreetActions(
  phase: string,
  humanActions: HandAction[],
  allActions: HandAction[],
  strength: number,
  handName: string,
  record: HandRecord,
  won: boolean,
  humanCards: Card[],
  boardCards: Card[],
): { grade: string; analysis: string; lesson: string | null } {
  const mainAction = humanActions[humanActions.length - 1]; // Last human action on this street
  const action = mainAction.action;
  const amount = mainAction.amount;

  // Count opponents still in the hand at this phase
  const foldedBefore = new Set<string>();
  for (const a of record.actions) {
    if (a.phase === phase) break;
    if (a.action === 'fold') foldedBefore.add(a.playerId);
  }
  const activePlayers = record.players.filter((p) => !foldedBefore.has(p.id)).length;

  const strengthPct = (strength * 100).toFixed(0);

  if (phase === 'preflop') {
    return analyzePreflopStreet(action, amount, strength, strengthPct, humanCards, activePlayers);
  }

  return analyzePostflopStreet(phase, action, amount, strength, strengthPct, handName, allActions, activePlayers, record);
}

function analyzePreflopStreet(
  action: string, amount: number, strength: number, strengthPct: string,
  humanCards: Card[], activePlayers: number,
): { grade: string; analysis: string; lesson: string | null } {
  const cardStr = humanCards.map((c) => `${c.rank}${c.suit}`).join('');

  if (action === 'fold') {
    if (strength >= 0.5) {
      return {
        grade: 'D',
        analysis: `You folded a playable hand (${strengthPct}% strength) preflop. With ${activePlayers} players at the table, this hand has enough equity to see a flop.`,
        lesson: `Don't fold hands with ${strengthPct}%+ equity preflop — at minimum, call to see a flop and reassess.`,
      };
    }
    return {
      grade: 'A',
      analysis: `Good discipline folding a weak hand (${strengthPct}% strength) preflop. Against ${activePlayers} players, playing marginal hands out of position is a long-term losing strategy.`,
      lesson: null,
    };
  }

  if (action === 'call' || action === 'check') {
    if (strength > 0.7) {
      return {
        grade: 'B',
        analysis: `You flat-called with a strong hand (${strengthPct}% strength). While not a mistake, raising would build the pot and isolate weaker hands. Flat-calling invites multiway pots where your edge shrinks.`,
        lesson: 'With premium hands preflop, raise to build the pot and narrow the field. Flat-calling lets too many players see the flop cheaply.',
      };
    }
    return {
      grade: 'A',
      analysis: `Solid call preflop with ${strengthPct}% hand strength. You entered the pot at a reasonable price to see the flop.`,
      lesson: null,
    };
  }

  if (action === 'raise' || action === 'all-in') {
    if (strength < 0.35) {
      return {
        grade: 'D',
        analysis: `You raised with a weak hand (${strengthPct}% strength). This is a risky bluff preflop — if called, you'll often be dominated and face tough decisions post-flop.`,
        lesson: 'Preflop raises should usually be with hands that have solid equity. Save bluffs for post-flop where you have more information.',
      };
    }
    if (strength >= 0.6) {
      return {
        grade: 'A',
        analysis: `Excellent raise with a strong hand (${strengthPct}% strength). Raising preflop with premium hands builds the pot, narrows the field, and takes the initiative.`,
        lesson: null,
      };
    }
    return {
      grade: 'B',
      analysis: `Reasonable raise with ${strengthPct}% hand strength. Position and table dynamics matter here — this works well in late position to steal blinds.`,
      lesson: null,
    };
  }

  return { grade: 'C', analysis: 'Standard play.', lesson: null };
}

function analyzePostflopStreet(
  phase: string, action: string, amount: number, strength: number, strengthPct: string,
  handName: string, allActions: HandAction[], activePlayers: number, record: HandRecord,
): { grade: string; analysis: string; lesson: string | null } {
  const streetName = phase.charAt(0).toUpperCase() + phase.slice(1);
  const handDesc = handName ? ` (${handName})` : '';

  // Calculate pot at this street from actions
  const totalBets = allActions
    .filter((a) => a.phase === phase)
    .reduce((sum, a) => sum + a.amount, 0);

  if (action === 'fold') {
    if (strength > 0.5) {
      return {
        grade: 'D',
        analysis: `You folded on the ${streetName} with ${strengthPct}% equity${handDesc}. This was a strong enough hand to continue — the pot was offering you a good price.`,
        lesson: `On the ${streetName}, don't fold hands with significant equity. Calculate pot odds before making fold decisions.`,
      };
    }
    if (strength > 0.3) {
      return {
        grade: 'C',
        analysis: `You folded on the ${streetName} with moderate equity (${strengthPct}%)${handDesc}. This is borderline — it depends on the opponent's bet size and your read.`,
        lesson: `Marginal spots on the ${streetName} are decided by pot odds. If you're getting better than 3:1, calling with ${strengthPct}% equity is often correct.`,
      };
    }
    return {
      grade: 'A',
      analysis: `Smart fold on the ${streetName} with only ${strengthPct}% equity${handDesc}. No point throwing chips at a losing hand.`,
      lesson: null,
    };
  }

  if (action === 'check') {
    if (strength > 0.7) {
      return {
        grade: 'B',
        analysis: `You checked a strong hand (${strengthPct}% equity)${handDesc} on the ${streetName}. This could work as a trap, but you risk giving free cards to drawing hands. With ${activePlayers} opponents, betting for value is usually better.`,
        lesson: `When you have a strong hand on the ${streetName}, consider betting for value to build the pot — especially against multiple opponents.`,
      };
    }
    return {
      grade: 'A',
      analysis: `Checking on the ${streetName} with ${strengthPct}% equity${handDesc} is fine. This keeps the pot controlled and avoids committing chips when you're uncertain.`,
      lesson: null,
    };
  }

  if (action === 'call') {
    if (strength < 0.25) {
      return {
        grade: 'D',
        analysis: `You called on the ${streetName} with only ${strengthPct}% equity${handDesc}. The pot odds likely didn't justify this call. Over time, loose calls like this bleed chips.`,
        lesson: `Before calling on the ${streetName}, compare your equity to the pot odds. You needed more than ${strengthPct}% to profit here.`,
      };
    }
    if (strength > 0.7) {
      return {
        grade: 'B',
        analysis: `You flat-called on the ${streetName} with a strong hand (${strengthPct}%)${handDesc}. While profitable, raising would extract more value from weaker hands and charge draws.`,
        lesson: 'With strong hands, consider raising instead of calling to maximize value and deny free cards.',
      };
    }
    return {
      grade: 'A',
      analysis: `Good call on the ${streetName} with ${strengthPct}% equity${handDesc}. The pot odds support continuing with this hand.`,
      lesson: null,
    };
  }

  if (action === 'raise' || action === 'all-in') {
    if (strength > 0.6) {
      return {
        grade: 'A',
        analysis: `Strong bet/raise on the ${streetName} with ${strengthPct}% equity${handDesc}. This builds the pot when you likely have the best hand and charges draws.`,
        lesson: null,
      };
    }
    if (strength > 0.35) {
      return {
        grade: 'B',
        analysis: `Aggressive play on the ${streetName} with moderate equity (${strengthPct}%)${handDesc}. This can work as a semi-bluff or thin value bet.`,
        lesson: null,
      };
    }
    return {
      grade: 'C',
      analysis: `You bet/raised on the ${streetName} with weak equity (${strengthPct}%)${handDesc}. This is a bluff — it works when opponents fold, but you're risking chips with little backup.`,
      lesson: 'Bluffs are most effective on scary boards and in position. Make sure your story is consistent with a strong hand.',
    };
  }

  return { grade: 'C', analysis: `Standard play on the ${streetName}.`, lesson: null };
}

function generateCoachNote(grade: string, won: boolean, record: HandRecord): string {
  if (grade === 'A') {
    return won
      ? 'Excellent play this hand! You made solid decisions throughout and earned the pot. Keep this up.'
      : 'You played this hand well despite the result. In poker, good decisions don\'t always win — but they always profit long-term. Don\'t let results change your approach.';
  }
  if (grade === 'B') {
    return 'Good play overall with room for optimization. Focus on the spots where you left value on the table — small improvements compound over thousands of hands.';
  }
  if (grade === 'C') {
    return 'Decent play, but some decisions were marginal. Review the spots flagged above and think about what information you had at the time. Pot odds and position should guide most decisions.';
  }
  return 'This hand had some costly mistakes. Focus on the fundamentals: fold weak hands preflop, respect pot odds post-flop, and don\'t invest chips without a clear plan. Every mistake identified is progress.';
}

function groupByPhase(actions: HandAction[]): Record<string, HandAction[]> {
  const grouped: Record<string, HandAction[]> = {};
  for (const action of actions) {
    const phase = action.phase as string;
    if (!grouped[phase]) grouped[phase] = [];
    grouped[phase].push(action);
  }
  return grouped;
}

function getBoardForPhase(phase: string, fullBoard: Card[]): Card[] {
  switch (phase) {
    case 'preflop': return [];
    case 'flop': return fullBoard.slice(0, 3);
    case 'turn': return fullBoard.slice(0, 4);
    case 'river': return fullBoard.slice(0, 5);
    default: return fullBoard;
  }
}
