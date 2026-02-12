// Rule-based instant coaching feedback for player decisions

import { type Card, handStrength, evaluateHand, stringToCard } from './poker';
import { type HandRecord, type HandAction } from '@/stores/gameStore';
import { getHandTier, isOpenableFromPosition, getTierLabel, HandTier } from './preflopRanges';
import { detectDraws, analyzeBoardTexture, type DrawInfo } from './handAnalysis';

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
  const tier = getHandTier(ctx.holeCards[0], ctx.holeCards[1]);
  const tierName = getTierLabel(tier);
  const shouldPlay = isOpenableFromPosition(ctx.holeCards[0], ctx.holeCards[1], ctx.position);

  if (action.action === 'fold') {
    if (shouldPlay) {
      return {
        grade: 'Mistake',
        message: `You folded a ${tierName} hand from ${ctx.position} position — this is a mistake.`,
        detail: `Optimal: Open-raise here. ${tierName} hands should be played from ${ctx.position} in a ${ctx.numPlayers}-player game.`,
      };
    }
    return {
      grade: 'Good',
      message: `Good fold. This ${tierName} hand is too weak for ${ctx.position} position.`,
      detail: `Correct play. Folding ${tierName} hands from this position saves chips long-term.`,
    };
  }

  if (action.action === 'call' || action.action === 'check') {
    if (!shouldPlay) {
      return {
        grade: 'Mistake',
        message: `You called with a ${tierName} hand from ${ctx.position} — too loose.`,
        detail: `Optimal: Fold. Only open Premium and Strong hands from ${ctx.position} position.`,
      };
    }
    if (tier <= HandTier.STRONG) {
      return {
        grade: 'Okay',
        message: `You just called with a ${tierName} hand — leaving value on the table.`,
        detail: `Optimal: Raise for value. With a ${tierName} hand, raising builds the pot and narrows the field.`,
      };
    }
    return {
      grade: 'Good',
      message: `Good call with a ${tierName} hand from ${ctx.position} position.`,
      detail: `Correct play. Calling keeps the pot small while seeing a flop at a good price.`,
    };
  }

  if (action.action === 'raise' || action.action === 'all-in') {
    if (!shouldPlay) {
      return {
        grade: 'Mistake',
        message: `You raised a ${tierName} hand from ${ctx.position} — too aggressive.`,
        detail: `Optimal: Fold. Save raises for at least Playable hands or better positions.`,
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
  const draws = detectDraws(ctx.holeCards, ctx.communityCards);
  const texture = analyzeBoardTexture(ctx.communityCards);
  const hasSignificantDraw = draws.flushDraw || draws.oesd;
  const drawDesc = describeDraws(draws);

  if (action.action === 'fold') {
    if (toCall === 0) {
      return {
        grade: 'Mistake',
        message: 'You folded when you could check for free — giving up equity for nothing.',
        detail: 'Optimal: Always check when no one has bet. You might improve on the next card at zero cost.',
      };
    }
    if (hasSignificantDraw && strength > potOdds) {
      return {
        grade: 'Mistake',
        message: `You folded with ${drawDesc} (${draws.totalOuts.toFixed(0)} outs) — the pot odds justified continuing.`,
        detail: `Optimal: Call $${toCall}. With ${draws.totalOuts.toFixed(0)} outs (~${(strength * 100).toFixed(0)}% equity), you're getting the right price at ${(potOdds * 100).toFixed(0)}% pot odds.`,
      };
    }
    if (strength > potOdds + 0.1) {
      return {
        grade: 'Mistake',
        message: `You folded with ~${(strength * 100).toFixed(0)}% equity — you were getting the right price to continue.`,
        detail: `Optimal: Call $${toCall}. The pot is $${ctx.pot} with pot odds of ${(potOdds * 100).toFixed(0)}%, and your equity exceeds that.`,
      };
    }
    if (strength < 0.2 && !hasSignificantDraw) {
      return {
        grade: 'Good',
        message: `Good fold with a weak hand (~${(strength * 100).toFixed(0)}% equity) against a bet.`,
        detail: `Correct play. You need ~${(potOdds * 100).toFixed(0)}% equity to call profitably, and your hand falls short.`,
      };
    }
    return {
      grade: 'Okay',
      message: `You folded with ~${(strength * 100).toFixed(0)}% equity — borderline decision.`,
      detail: `A call could be justified at ${(potOdds * 100).toFixed(0)}% pot odds, but folding is defensible depending on your read.`,
    };
  }

  if (action.action === 'check') {
    if (strength > 0.7 && ctx.position === 'late') {
      return {
        grade: 'Okay',
        message: `You checked a strong hand (~${(strength * 100).toFixed(0)}% equity) in late position — missing value.`,
        detail: texture.wetness === 'wet'
          ? 'Optimal: Bet 60-75% pot. On this wet board, bet to deny draws and build the pot.'
          : 'Optimal: Bet 50-65% pot for value. Trapping risks giving free cards.',
      };
    }
    if (strength > 0.7) {
      return {
        grade: 'Good',
        message: `Good check with a strong hand (~${(strength * 100).toFixed(0)}%) from ${ctx.position} position.`,
        detail: `Correct play. Out of position, checking lets you trap or see what opponents do first.`,
      };
    }
    return {
      grade: 'Good',
      message: `Good check with ~${(strength * 100).toFixed(0)}% equity.`,
      detail: ctx.position === 'late'
        ? 'Correct play. Checking in position controls the pot with a marginal hand.'
        : 'Correct play. Checking out of position avoids bloating the pot.',
    };
  }

  if (action.action === 'call') {
    if (hasSignificantDraw && strength >= potOdds) {
      return {
        grade: 'Good',
        message: `Good call with ${drawDesc} (${draws.totalOuts.toFixed(0)} outs) — correct pot odds.`,
        detail: `Correct play. ~${(strength * 100).toFixed(0)}% equity at ${(potOdds * 100).toFixed(0)}% pot odds is a profitable call.`,
      };
    }
    if (strength < potOdds - 0.1) {
      return {
        grade: 'Mistake',
        message: `You called with only ~${(strength * 100).toFixed(0)}% equity — not enough for the price.`,
        detail: `Optimal: Fold. You need ~${(potOdds * 100).toFixed(0)}% equity to call $${toCall} into a $${ctx.pot} pot.`,
      };
    }
    if (strength > 0.75 && toCall < ctx.pot * 0.5) {
      return {
        grade: 'Okay',
        message: `You flat-called with ~${(strength * 100).toFixed(0)}% equity — leaving value on the table.`,
        detail: `Optimal: Raise to 2.5-3x the bet. Extract more value from weaker hands and protect against draws.`,
      };
    }
    return {
      grade: 'Good',
      message: `Good call with ~${(strength * 100).toFixed(0)}% equity.`,
      detail: `Correct play. Pot odds of ${(potOdds * 100).toFixed(0)}% are favorable for your hand strength.`,
    };
  }

  if (action.action === 'raise' || action.action === 'all-in') {
    if (hasSignificantDraw && strength < 0.5) {
      return {
        grade: 'Good',
        message: `Nice semi-bluff with ${drawDesc} (${draws.totalOuts.toFixed(0)} outs).`,
        detail: `Correct play. You have fold equity plus ~${draws.totalOuts.toFixed(0)} outs if called — two ways to win.`,
      };
    }
    if (strength < 0.25) {
      return {
        grade: 'Okay',
        message: `You bluffed with a weak hand (~${(strength * 100).toFixed(0)}% equity).`,
        detail: texture.wetness === 'dry'
          ? 'This can work on dry boards where opponents fold more. Make sure your story is consistent.'
          : 'Risky on wet boards — opponents often have draws or made hands they won\'t fold.',
      };
    }
    const raiseAmount = action.amount - ctx.currentBet;
    const sizing = evaluateBetSizing(raiseAmount, ctx, strength, 'bet');

    if (sizing.grade === 'Good' && texture.wetness === 'wet') {
      sizing.detail = 'Correct sizing. On this wet board, larger bets deny draws and charge opponents.';
    } else if (sizing.grade === 'Good' && texture.wetness === 'dry') {
      sizing.detail = 'Correct sizing. On this dry board, smaller bets work since draws are unlikely.';
    }

    return sizing;
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
      message: `Your ${type} of $${amount} is too small (${(potRatio * 100).toFixed(0)}% pot) — gives opponents cheap draws.`,
      detail: `Optimal: ${type === 'raise' ? 'Raise' : 'Bet'} 50-75% pot for value, or 33-50% as a bluff.`,
    };
  }
  if (potRatio > 2) {
    if (strength > 0.8) {
      return {
        grade: 'Okay',
        message: `Large overbet (${(potRatio * 100).toFixed(0)}% pot) — you might scare everyone away and miss value.`,
        detail: `Optimal: Bet 60-100% pot with strong hands to extract maximum value.`,
      };
    }
    return {
      grade: 'Mistake',
      message: `Overbet (${(potRatio * 100).toFixed(0)}% pot) with a ${strength < 0.4 ? 'weak' : 'medium'} hand — risking too much.`,
      detail: `Optimal: Bet 50-100% pot. Overbets should be reserved for very strong hands or well-timed bluffs.`,
    };
  }
  if (potRatio >= 0.4 && potRatio <= 1.0) {
    return {
      grade: 'Good',
      message: `Good ${type} sizing — $${amount} is ${(potRatio * 100).toFixed(0)}% of the pot.`,
      detail: strength > 0.6
        ? 'Correct play. This size charges draws and builds the pot with the best hand.'
        : 'Correct play. Good size that applies pressure and charges draws.',
    };
  }

  return {
    grade: 'Okay',
    message: `${type === 'raise' ? 'Raise' : 'Bet'} of $${amount} (${(potRatio * 100).toFixed(0)}% pot) is reasonable.`,
  };
}

/** Describe active draws in human-readable form */
function describeDraws(draws: DrawInfo): string {
  const parts: string[] = [];
  if (draws.flushDraw) parts.push('a flush draw');
  if (draws.oesd) parts.push('an open-ended straight draw');
  if (draws.gutshot) parts.push('a gutshot straight draw');
  if (draws.backdoorFlush) parts.push('a backdoor flush draw');
  if (parts.length === 0) return 'draws';
  return parts.join(' and ');
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

    const { grade, analysis, lesson } = analyzeStreetActions(
      phase, humanActions, strength, humanHandName, record, won, humanCards, boardAtStreet
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

  // Coach note — hand-specific
  const coachNote = generateCoachNote(overallGrade, won, humanHandName, winnerHandName, lessons);

  return { overallGrade, streetAnalysis, keyLessons: lessons, coachNote };
}

function analyzeStreetActions(
  phase: string,
  humanActions: HandAction[],
  strength: number,
  handName: string,
  record: HandRecord,
  _won: boolean,
  humanCards: Card[],
  boardCards: Card[],
): { grade: string; analysis: string; lesson: string | null } {
  const mainAction = humanActions[humanActions.length - 1]; // Last human action on this street
  const action = mainAction.action;

  // Count opponents still in the hand at this phase
  const foldedBefore = new Set<string>();
  for (const a of record.actions) {
    if (a.phase === phase) break;
    if (a.action === 'fold') foldedBefore.add(a.playerId);
  }
  const activePlayers = record.players.filter((p) => !foldedBefore.has(p.id)).length;

  const strengthPct = (strength * 100).toFixed(0);

  if (phase === 'preflop') {
    return analyzePreflopStreet(action, humanCards, activePlayers);
  }

  return analyzePostflopStreet(phase, action, strength, strengthPct, handName, humanCards, boardCards);
}

function analyzePreflopStreet(
  action: string, humanCards: Card[], activePlayers: number,
): { grade: string; analysis: string; lesson: string | null } {
  const tier = getHandTier(humanCards[0], humanCards[1]);
  const tierName = getTierLabel(tier);

  if (action === 'fold') {
    if (tier <= HandTier.PLAYABLE) {
      return {
        grade: 'D',
        analysis: `You folded a ${tierName} hand preflop. With ${activePlayers} players at the table, this hand has enough equity to see a flop.`,
        lesson: `Don't fold ${tierName} hands preflop — at minimum, call to see a flop and reassess.`,
      };
    }
    return {
      grade: 'A',
      analysis: `Good discipline folding a ${tierName} hand preflop. Against ${activePlayers} players, playing marginal hands out of position is a long-term losing strategy.`,
      lesson: null,
    };
  }

  if (action === 'call' || action === 'check') {
    if (tier <= HandTier.STRONG) {
      return {
        grade: 'B',
        analysis: `You flat-called with a ${tierName} hand. While not a mistake, raising would build the pot and isolate weaker hands. Flat-calling invites multiway pots where your edge shrinks.`,
        lesson: `With ${tierName} hands preflop, raise to build the pot and narrow the field. Flat-calling lets too many players see the flop cheaply.`,
      };
    }
    return {
      grade: 'A',
      analysis: `Solid call preflop with a ${tierName} hand. You entered the pot at a reasonable price to see the flop.`,
      lesson: null,
    };
  }

  if (action === 'raise' || action === 'all-in') {
    if (tier >= HandTier.MARGINAL) {
      return {
        grade: 'D',
        analysis: `You raised with a ${tierName} hand. This is a risky bluff preflop — if called, you'll often be dominated and face tough decisions post-flop.`,
        lesson: 'Preflop raises should usually be with Playable hands or better. Save bluffs for post-flop where you have more information.',
      };
    }
    if (tier <= HandTier.STRONG) {
      return {
        grade: 'A',
        analysis: `Excellent raise with a ${tierName} hand. Raising preflop with ${tierName} hands builds the pot, narrows the field, and takes the initiative.`,
        lesson: null,
      };
    }
    return {
      grade: 'B',
      analysis: `Reasonable raise with a ${tierName} hand. Position and table dynamics matter here — this works well in late position to steal blinds.`,
      lesson: null,
    };
  }

  return { grade: 'C', analysis: 'Standard play.', lesson: null };
}

function analyzePostflopStreet(
  phase: string, action: string, strength: number, strengthPct: string,
  handName: string, humanCards: Card[], boardCards: Card[],
): { grade: string; analysis: string; lesson: string | null } {
  const streetName = phase.charAt(0).toUpperCase() + phase.slice(1);
  const handDesc = handName ? ` (${handName})` : '';

  // Draw and texture info for richer commentary
  const draws = boardCards.length >= 3 ? detectDraws(humanCards, boardCards) : null;
  const texture = boardCards.length >= 3 ? analyzeBoardTexture(boardCards) : null;
  const hasDraws = draws && (draws.flushDraw || draws.oesd || draws.gutshot);
  const drawContext = draws && hasDraws
    ? ` You had ${describeDrawsForAnalysis(draws)}.`
    : '';
  const textureContext = texture
    ? ` On this ${texture.wetness} ${streetName.toLowerCase()} board,`
    : '';

  if (action === 'fold') {
    if (hasDraws && draws && draws.totalOuts >= 8) {
      return {
        grade: 'D',
        analysis: `You folded on the ${streetName} with a draw (${draws.totalOuts.toFixed(0)} outs)${handDesc}.${drawContext} Consider pot odds before folding draws — you may have been priced in.`,
        lesson: `On the ${streetName}, don't fold strong draws without checking pot odds. ${draws.totalOuts.toFixed(0)} outs gives you significant equity.`,
      };
    }
    if (strength > 0.5) {
      return {
        grade: 'D',
        analysis: `You folded on the ${streetName} with ${strengthPct}% equity${handDesc}.${textureContext} this was a strong enough hand to continue.`,
        lesson: `On the ${streetName}, don't fold hands with significant equity. Calculate pot odds before making fold decisions.`,
      };
    }
    if (strength > 0.3) {
      return {
        grade: 'C',
        analysis: `You folded on the ${streetName} with moderate equity (${strengthPct}%)${handDesc}.${drawContext} This is borderline — it depends on the opponent's bet size and your read.`,
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
        analysis: `You checked a strong hand (${strengthPct}% equity)${handDesc} on the ${streetName}.${textureContext} ${texture?.wetness === 'wet' ? 'betting is important to deny draws.' : 'this could work as a trap, but you risk giving free cards.'}`,
        lesson: `When you have a strong hand on the ${streetName}, consider betting for value to build the pot — especially against multiple opponents.`,
      };
    }
    return {
      grade: 'A',
      analysis: `Checking on the ${streetName} with ${strengthPct}% equity${handDesc} is fine.${drawContext}`,
      lesson: null,
    };
  }

  if (action === 'call') {
    if (hasDraws && draws && strength >= 0.3) {
      return {
        grade: 'A',
        analysis: `Good call on the ${streetName} with ${strengthPct}% equity${handDesc}.${drawContext} The pot odds support chasing your draw.`,
        lesson: null,
      };
    }
    if (strength < 0.25) {
      return {
        grade: 'D',
        analysis: `You called on the ${streetName} with only ${strengthPct}% equity${handDesc}. The pot odds likely didn't justify this call.`,
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
    if (hasDraws && draws && strength < 0.5) {
      return {
        grade: 'B',
        analysis: `Semi-bluff on the ${streetName}${handDesc}.${drawContext} This is aggressive but gives you two ways to win — fold equity plus draw equity.`,
        lesson: null,
      };
    }
    if (strength > 0.6) {
      return {
        grade: 'A',
        analysis: `Strong bet/raise on the ${streetName} with ${strengthPct}% equity${handDesc}.${textureContext} this builds the pot when you likely have the best hand.`,
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
      analysis: `You bet/raised on the ${streetName} with weak equity (${strengthPct}%)${handDesc}.${textureContext} ${texture?.wetness === 'dry' ? 'bluffing on dry boards can work since opponents fold more.' : 'bluffing on wet boards is risky since opponents often have draws.'}`,
      lesson: 'Bluffs are most effective on dry boards and in position. Make sure your story is consistent with a strong hand.',
    };
  }

  return { grade: 'C', analysis: `Standard play on the ${streetName}.`, lesson: null };
}

function describeDrawsForAnalysis(draws: DrawInfo): string {
  const parts: string[] = [];
  if (draws.flushDraw) parts.push('a flush draw (9 outs)');
  if (draws.oesd) parts.push('an open-ended straight draw (8 outs)');
  if (draws.gutshot) parts.push('a gutshot (4 outs)');
  if (draws.backdoorFlush) parts.push('a backdoor flush draw');
  if (parts.length === 0) return 'draws';
  const desc = parts.join(' and ');
  // Show combined total only when multiple draws are present
  if (parts.length > 1) {
    return `${desc} (~${draws.totalOuts.toFixed(0)} outs combined)`;
  }
  return desc;
}

function generateCoachNote(grade: string, won: boolean, humanHand: string, winnerHand: string, lessons: string[]): string {
  // Build a hand-specific note by combining grade feedback with hand context
  const handContext = humanHand
    ? (won
      ? `You won with ${humanHand}.`
      : winnerHand
        ? `Your ${humanHand} lost to ${winnerHand}.`
        : `You had ${humanHand}.`)
    : '';

  if (grade === 'A') {
    return won
      ? `${handContext} Excellent decisions throughout — you maximized value from this spot.`
      : `${handContext} Strong play despite the result. Good decisions profit long-term even when individual hands don't go your way.`;
  }
  if (grade === 'B') {
    const lessonHint = lessons.length > 0 && lessons[0].length < 100 ? ` ${lessons[0]}` : '';
    return `${handContext} Solid play with room to optimize.${lessonHint}`;
  }
  if (grade === 'C') {
    return `${handContext} Some marginal spots — review the flagged decisions above. Pot odds and position should guide most choices.`;
  }
  return `${handContext} A few costly mistakes here. Focus on folding weak hands preflop and respecting pot odds post-flop.`;
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
