export const potOddsQuestions = [
  // ============================================================
  // OUTS_COUNT (10 questions)
  // ============================================================

  // 1 - Easy: Flush draw outs
  {
    type: 'OUTS_COUNT',
    difficulty: 1,
    content: {
      hand: ['Ah', 'Kh'],
      board: ['Qh', '7h', '2c'],
      question: 'You have a flush draw. How many outs do you have to complete the flush?',
      options: ['9 outs', '8 outs', '13 outs'],
    },
    correctAnswer: '9 outs',
    explanation:
      'There are 13 hearts total. You can see 4 hearts (Ah, Kh in your hand + Qh, 7h on board). 13 - 4 = 9 unseen hearts remaining.',
    xpValue: 10,
  },

  // 2 - Easy: Open-ended straight draw outs
  {
    type: 'OUTS_COUNT',
    difficulty: 1,
    content: {
      hand: ['9s', '8d'],
      board: ['7c', '6h', 'Kd'],
      question:
        'You have an open-ended straight draw (9-8-7-6). How many outs do you have?',
      options: ['8 outs', '4 outs', '6 outs'],
    },
    correctAnswer: '8 outs',
    explanation:
      'An open-ended straight draw can be completed on either end. Any 10 (4 cards) or any 5 (4 cards) makes your straight. 4 + 4 = 8 outs.',
    xpValue: 10,
  },

  // 3 - Easy: Gutshot straight draw outs
  {
    type: 'OUTS_COUNT',
    difficulty: 1,
    content: {
      hand: ['Jc', '10d'],
      board: ['8s', '7h', '2c'],
      question:
        'You need a 9 to complete your straight (J-10-9-8-7). How many outs is that?',
      options: ['4 outs', '8 outs', '2 outs'],
    },
    correctAnswer: '4 outs',
    explanation:
      'A gutshot (inside) straight draw needs one specific rank to complete. There are four 9s in the deck, so you have 4 outs.',
    xpValue: 10,
  },

  // 4 - Easy: Overcard outs
  {
    type: 'OUTS_COUNT',
    difficulty: 1,
    content: {
      hand: ['As', 'Kd'],
      board: ['Jc', '7h', '3s'],
      question:
        'You have two overcards (Ace and King). How many outs do you have to make top pair?',
      options: ['6 outs', '3 outs', '8 outs'],
    },
    correctAnswer: '6 outs',
    explanation:
      'You need an Ace or a King to make top pair. There are 3 remaining Aces and 3 remaining Kings in the deck. 3 + 3 = 6 outs.',
    xpValue: 10,
  },

  // 5 - Medium: Flush draw + gutshot combo
  {
    type: 'OUTS_COUNT',
    difficulty: 2,
    content: {
      hand: ['Jh', '10h'],
      board: ['9h', '5h', '7c'],
      question:
        'You have a flush draw and a gutshot straight draw (need an 8 for J-10-9-8-7). How many total outs do you have?',
      options: ['12 outs', '9 outs', '13 outs'],
    },
    correctAnswer: '12 outs',
    explanation:
      'Flush draw = 9 outs (remaining hearts). Gutshot straight draw = 4 eights. But the 8h is already counted in the flush outs. 9 + 4 - 1 overlap = 12 total outs.',
    xpValue: 15,
  },

  // 6 - Medium: Set outs (pocket pair)
  {
    type: 'OUTS_COUNT',
    difficulty: 2,
    content: {
      hand: ['8s', '8c'],
      board: ['Kd', 'Jh', '3s'],
      question:
        'You have pocket 8s on the flop. How many outs do you have to make a set (three of a kind)?',
      options: ['2 outs', '4 outs', '1 out'],
    },
    correctAnswer: '2 outs',
    explanation:
      'With a pocket pair, only 2 cards of that rank remain in the deck. You need one of the 2 remaining 8s (8h or 8d) to make a set.',
    xpValue: 15,
  },

  // 7 - Medium: Two pair to full house outs
  {
    type: 'OUTS_COUNT',
    difficulty: 2,
    content: {
      hand: ['As', 'Kd'],
      board: ['Ac', 'Kh', '6s', '2d'],
      question:
        'You have two pair (Aces and Kings). How many outs do you have to make a full house?',
      options: ['4 outs', '2 outs', '6 outs'],
    },
    correctAnswer: '4 outs',
    explanation:
      'To make a full house, you need the board to pair one of your two pair ranks. There are 2 remaining Aces and 2 remaining Kings. 2 + 2 = 4 outs.',
    xpValue: 15,
  },

  // 8 - Hard: Flush draw + OESD combo draw
  {
    type: 'OUTS_COUNT',
    difficulty: 3,
    content: {
      hand: ['Jd', '10d'],
      board: ['9d', '8c', '2d'],
      question:
        'You have a flush draw AND an open-ended straight draw. How many total outs do you have?',
      options: ['15 outs', '17 outs', '12 outs'],
    },
    correctAnswer: '15 outs',
    explanation:
      'Flush draw = 9 remaining diamonds. OESD = any Q (4) or any 7 (4) = 8 cards. But Qd and 7d are already counted in the flush outs. 9 + 8 - 2 overlap = 15 total outs.',
    xpValue: 20,
  },

  // 9 - Hard: Tainted outs concept
  {
    type: 'OUTS_COUNT',
    difficulty: 3,
    content: {
      hand: ['9h', '8h'],
      board: ['7s', '7d', '6c', 'Kh'],
      question:
        'You have an open-ended straight draw, but the board is paired. How many "clean" outs do you have?',
      options: ['6 outs', '8 outs', '4 outs'],
    },
    correctAnswer: '6 outs',
    explanation:
      'Normally an OESD has 8 outs (four 10s and four 5s). But with a paired board, an opponent holding a 7 already has trips and would make a full house if the board pairs again. Even without that, your straight could lose to a full house. In practice, you should discount about 2 of your 8 outs as "tainted," leaving roughly 6 clean outs.',
    xpValue: 20,
  },

  // ============================================================
  // ODDS_CALC (8 questions)
  // ============================================================

  // 10 - Easy: Simple pot odds ratio
  {
    type: 'ODDS_CALC',
    difficulty: 1,
    content: {
      question:
        'The pot is $100. Your opponent bets $50. What pot odds are you getting?',
      options: ['3:1', '2:1', '4:1'],
    },
    correctAnswer: '3:1',
    explanation:
      'Pot odds = (Pot + Bet) : Call amount = ($100 + $50) : $50 = $150 : $50 = 3:1. You risk $50 to win $150.',
    xpValue: 10,
  },

  // 11 - Easy: Pot odds as percentage
  {
    type: 'ODDS_CALC',
    difficulty: 1,
    content: {
      question:
        'The pot is $60. Your opponent bets $20. What equity do you need to call?',
      options: ['20%', '25%', '33%'],
    },
    correctAnswer: '20%',
    explanation:
      'Equity needed = Call / (Pot + Bet + Call) = $20 / ($60 + $20 + $20) = $20 / $100 = 20%. You only need 20% equity to make this a break-even call.',
    xpValue: 10,
  },

  // 12 - Medium: Larger pot odds calculation
  {
    type: 'ODDS_CALC',
    difficulty: 2,
    content: {
      question:
        'The pot is $200. Your opponent bets $100. What pot odds are you getting?',
      options: ['3:1', '2:1', '4:1'],
    },
    correctAnswer: '3:1',
    explanation:
      'Pot odds = (Pot + Bet) : Call = ($200 + $100) : $100 = $300 : $100 = 3:1. You need about 25% equity to call profitably.',
    xpValue: 15,
  },

  // 13 - Medium: Half-pot bet odds
  {
    type: 'ODDS_CALC',
    difficulty: 2,
    content: {
      question:
        'The pot is $80. Your opponent bets $40 (half pot). What equity do you need to call?',
      options: ['25%', '33%', '40%'],
    },
    correctAnswer: '25%',
    explanation:
      'Call $40 into a pot of $80 + $40 = $120. Equity needed = $40 / ($120 + $40) = $40 / $160 = 25%. A half-pot bet always requires 25% equity.',
    xpValue: 15,
  },

  // 14 - Medium: Full-pot bet odds
  {
    type: 'ODDS_CALC',
    difficulty: 2,
    content: {
      question:
        'The pot is $50. Your opponent bets $50 (full pot). What equity do you need to call?',
      options: ['33%', '25%', '50%'],
    },
    correctAnswer: '33%',
    explanation:
      'Call $50 into pot of $50 + $50 = $100. Equity needed = $50 / ($100 + $50) = $50 / $150 = 33%. A pot-sized bet always requires 33% equity to call.',
    xpValue: 15,
  },

  // 15 - Hard: Overbet odds
  {
    type: 'ODDS_CALC',
    difficulty: 3,
    content: {
      question:
        'The pot is $60. Your opponent bets $120 (double the pot). What equity do you need to call?',
      options: ['40%', '50%', '33%'],
    },
    correctAnswer: '40%',
    explanation:
      'Call $120 into pot of $60 + $120 = $180. Equity needed = $120 / ($180 + $120) = $120 / $300 = 40%. Large overbets require substantial equity to call.',
    xpValue: 20,
  },

  // 16 - Hard: Small bet odds
  {
    type: 'ODDS_CALC',
    difficulty: 3,
    content: {
      question:
        'The pot is $150. Your opponent bets $30 (1/5 pot). What pot odds ratio are you getting?',
      options: ['6:1', '5:1', '4:1'],
    },
    correctAnswer: '6:1',
    explanation:
      'Pot odds = (Pot + Bet) : Call = ($150 + $30) : $30 = $180 : $30 = 6:1. Small bets give excellent odds — you only need about 14% equity.',
    xpValue: 20,
  },

  // 17 - Medium: Recognizing a common spot
  {
    type: 'ODDS_CALC',
    difficulty: 2,
    content: {
      question:
        'Pot is $75. Opponent bets $25 (one-third pot). What are your pot odds?',
      options: ['4:1', '3:1', '5:1'],
    },
    correctAnswer: '4:1',
    explanation:
      'Pot odds = ($75 + $25) : $25 = $100 : $25 = 4:1. A third-pot bet gives you 4:1 odds, requiring only 20% equity to call.',
    xpValue: 15,
  },

  // ============================================================
  // ODDS_CONVERT (7 questions)
  // ============================================================

  // 18 - Easy: Ratio to percentage
  {
    type: 'ODDS_CONVERT',
    difficulty: 1,
    content: {
      question: 'Convert pot odds of 3:1 into a percentage.',
      options: ['25%', '33%', '30%'],
    },
    correctAnswer: '25%',
    explanation:
      '3:1 means for every 1 time you win, you lose 3 times. Total outcomes = 3 + 1 = 4. Win % = 1/4 = 25%.',
    xpValue: 10,
  },

  // 19 - Easy: Simple outs to percentage (one card)
  {
    type: 'ODDS_CONVERT',
    difficulty: 1,
    content: {
      question:
        'You have 9 outs with one card to come. Using the Rule of 2, what is your approximate equity?',
      options: ['18%', '36%', '9%'],
    },
    correctAnswer: '18%',
    explanation:
      'Rule of 2: Multiply outs by 2 for one card to come. 9 outs x 2 = 18%. The actual number is about 19.6%, so this is a good approximation.',
    xpValue: 10,
  },

  // 20 - Medium: 4:1 to percentage
  {
    type: 'ODDS_CONVERT',
    difficulty: 2,
    content: {
      question: 'Convert 4:1 odds to a percentage.',
      options: ['20%', '25%', '40%'],
    },
    correctAnswer: '20%',
    explanation:
      '4:1 means you win 1 out of every 5 attempts (4 losses + 1 win = 5). 1/5 = 20%.',
    xpValue: 15,
  },

  // 21 - Medium: Percentage to ratio
  {
    type: 'ODDS_CONVERT',
    difficulty: 2,
    content: {
      question: 'You need 33% equity to call. What is that as a ratio?',
      options: ['2:1', '3:1', '4:1'],
    },
    correctAnswer: '2:1',
    explanation:
      '33% means you win 1 out of 3 times. For every 1 win there are 2 losses. That\'s 2:1 odds against.',
    xpValue: 15,
  },

  // 22 - Medium: Outs to percentage (two cards)
  {
    type: 'ODDS_CONVERT',
    difficulty: 2,
    content: {
      question:
        'You have 8 outs on the flop (two cards to come). Using the Rule of 4, what is your approximate equity?',
      options: ['32%', '16%', '24%'],
    },
    correctAnswer: '32%',
    explanation:
      'Rule of 4: Multiply outs by 4 for two cards to come. 8 outs x 4 = 32%. Actual equity is about 31.5% — very close!',
    xpValue: 15,
  },

  // 23 - Hard: Convert less common ratio
  {
    type: 'ODDS_CONVERT',
    difficulty: 3,
    content: {
      question: 'Convert 1.5:1 pot odds to a percentage.',
      options: ['40%', '33%', '25%'],
    },
    correctAnswer: '40%',
    explanation:
      '1.5:1 means total parts = 1.5 + 1 = 2.5. Win % = 1 / 2.5 = 40%. Small pot odds ratios mean you need a lot of equity.',
    xpValue: 20,
  },

  // 24 - Hard: Outs to exact percentage
  {
    type: 'ODDS_CONVERT',
    difficulty: 3,
    content: {
      question:
        'You have 15 outs on the flop. Using the Rule of 4, what is your approximate equity with two cards to come?',
      options: ['60%', '30%', '45%'],
    },
    correctAnswer: '60%',
    explanation:
      'Rule of 4: 15 outs x 4 = 60%. Note: the Rule of 4 becomes less accurate above ~12 outs. The actual equity is ~54%, but the Rule of 4 gives a rough estimate.',
    xpValue: 20,
  },

  // ============================================================
  // DECISION (8 questions)
  // ============================================================

  // 25 - Medium: Good call with flush draw
  {
    type: 'DECISION',
    difficulty: 2,
    content: {
      hand: ['Kh', 'Qh'],
      board: ['9h', '4h', '2c'],
      situation:
        'You have a flush draw (9 outs, ~18% with one card). Pot is $100, opponent bets $20.',
      question: 'Should you call?',
      options: [
        'Yes - pot odds are great',
        'No - not enough equity',
        'Only if you have position',
      ],
    },
    correctAnswer: 'Yes - pot odds are great',
    explanation:
      'Pot odds: $20 to call into $120 pot = $20/$140 = 14% needed. You have ~18% equity with the flush draw. 18% > 14%, so this is a profitable call.',
    xpValue: 15,
  },

  // 26 - Medium: Bad call with gutshot
  {
    type: 'DECISION',
    difficulty: 2,
    content: {
      hand: ['Qs', 'Jd'],
      board: ['9c', '7h', '2s'],
      situation:
        'You have a gutshot straight draw (4 outs, ~8% with one card). Pot is $60, opponent bets $40.',
      question: 'Should you call?',
      options: [
        'No - pot odds are too bad',
        'Yes - you might hit',
        'Yes - any draw is worth calling',
      ],
    },
    correctAnswer: 'No - pot odds are too bad',
    explanation:
      'Pot odds: $40 to call into $100 pot = $40/$140 = 29% needed. A gutshot gives only ~8% equity. 8% < 29%, so folding is correct.',
    xpValue: 15,
  },

  // 27 - Medium: Borderline call
  {
    type: 'DECISION',
    difficulty: 2,
    content: {
      hand: ['10h', '9h'],
      board: ['8d', '7c', 'Ks'],
      situation:
        'You have an open-ended straight draw (8 outs, ~16%). Pot is $80, opponent bets $40.',
      question: 'Should you call on the turn?',
      options: [
        'No - just barely not enough odds',
        'Yes - profitable call',
        'Raise instead',
      ],
    },
    correctAnswer: 'No - just barely not enough odds',
    explanation:
      'Pot odds: $40 to call into $120 = $40/$160 = 25% needed. With 8 outs on the turn (one card), equity is ~16%. 16% < 25%. This is a fold without implied odds.',
    xpValue: 15,
  },

  // 28 - Hard: Implied odds save a call
  {
    type: 'DECISION',
    difficulty: 3,
    content: {
      hand: ['6s', '5s'],
      board: ['4d', '3h', 'Kc'],
      situation:
        'You have an OESD (8 outs, ~16% one card). Pot is $40, bet is $20. Opponent has $300 behind.',
      question: 'Should you call considering implied odds?',
      options: [
        'Yes - implied odds make up the difference',
        'No - direct odds are not enough',
        'Only in position',
      ],
    },
    correctAnswer: 'Yes - implied odds make up the difference',
    explanation:
      'Direct pot odds need 25% ($20/$80), you only have ~16%. But with $300 behind, if you hit the straight you can win much more. The extra money expected on future streets makes this call profitable.',
    xpValue: 20,
  },

  // 29 - Hard: Multi-way pot decision
  {
    type: 'DECISION',
    difficulty: 3,
    content: {
      hand: ['Ad', '3d'],
      board: ['Jd', '8d', '5c', '2h'],
      situation:
        'You have a flush draw (9 outs, ~18% one card). Pot is $150 after two players bet $50 each. You must call $50.',
      question: 'Is this a profitable call on the turn?',
      options: [
        'Yes - great pot odds in a multi-way pot',
        'No - too many opponents',
        'Only with the nut flush draw',
      ],
    },
    correctAnswer: 'Yes - great pot odds in a multi-way pot',
    explanation:
      'Pot is $150, call $50. Equity needed = $50 / ($150 + $50) = $50 / $200 = 25%. You have ~18% equity... but you have the nut flush draw (Ad). With the Ace-high flush draw, you almost always win when you hit. The pot odds are actually $50 into a $200 pot = 25%, and 18% is close. Factor in implied odds and this becomes a clear call.',
    xpValue: 20,
  },

  // 30 - Hard: Fold despite having a draw
  {
    type: 'DECISION',
    difficulty: 3,
    content: {
      hand: ['7h', '6h'],
      board: ['Ac', 'Kd', '4s', '9c'],
      situation:
        'You have a gutshot (4 outs, ~8%). Pot is $30, opponent bets $30 (pot-sized).',
      question: 'Should you call with your gutshot on the turn?',
      options: [
        'No - terrible odds for a gutshot',
        'Yes - you could hit',
        'Call and hope for the best',
      ],
    },
    correctAnswer: 'No - terrible odds for a gutshot',
    explanation:
      'Pot odds: $30 into $60 = $30/$90 = 33% needed. Gutshot equity = ~8%. You need 33% but only have 8%. This is a massive fold. Never chase gutshots facing pot-sized bets.',
    xpValue: 20,
  },

  // 31 - Medium: Easy call with big draw
  {
    type: 'DECISION',
    difficulty: 2,
    content: {
      hand: ['Qd', 'Jd'],
      board: ['10d', '9c', '3d'],
      situation:
        'You have a flush draw + open-ended straight draw (15 outs). Pot is $50, opponent bets $25.',
      question: 'Should you call on the flop?',
      options: [
        'Yes - you are actually a favorite to win',
        'No - draws should always fold',
        'Only if you are last to act',
      ],
    },
    correctAnswer: 'Yes - you are actually a favorite to win',
    explanation:
      'With 15 outs and two cards to come, your equity is roughly 54% (Rule of 4: 15 x 4 = 60%, actual is ~54%). You are the favorite! Plus you only need 25% to call ($25 into $75 = $25/$100). This is an easy call or even a raise.',
    xpValue: 15,
  },

  // 32 - Hard: Reverse implied odds
  {
    type: 'DECISION',
    difficulty: 3,
    content: {
      hand: ['Jc', '10c'],
      board: ['Ac', '5c', '2h', '8d'],
      situation:
        'You have a flush draw but it is NOT the nut flush draw (no Ace of clubs). Pot is $100, bet is $25. Opponent is tight-aggressive.',
      question: 'Should you call on the turn?',
      options: [
        'Cautious call - be wary of higher flushes',
        'Easy call - great odds',
        'Fold - non-nut flush draws are worthless',
      ],
    },
    correctAnswer: 'Cautious call - be wary of higher flushes',
    explanation:
      'Pot odds are good ($25/$150 = 17% needed, ~18% equity). However, if a club comes and opponent has Ac-Xc, you lose a big pot. These "reverse implied odds" reduce your effective equity. The call is still okay, but be prepared to fold if the action gets heavy on a club river.',
    xpValue: 20,
  },

  // ============================================================
  // RULE_OF (7 questions)
  // ============================================================

  // 33 - Easy: Rule of 4 basics
  {
    type: 'RULE_OF',
    difficulty: 1,
    content: {
      question:
        'What is the "Rule of 4" used for in poker?',
      options: [
        'Estimating equity by multiplying outs by 4 (two cards to come)',
        'Betting 4 times the big blind preflop',
        'Having at least 4 players at the table',
      ],
    },
    correctAnswer:
      'Estimating equity by multiplying outs by 4 (two cards to come)',
    explanation:
      'The Rule of 4 is a shortcut: multiply your outs by 4 on the flop (two cards to come) to estimate your winning percentage. Example: 9 outs x 4 = ~36%.',
    xpValue: 10,
  },

  // 34 - Easy: Rule of 2 basics
  {
    type: 'RULE_OF',
    difficulty: 1,
    content: {
      question:
        'On the turn (one card to come), how do you quickly estimate your equity?',
      options: [
        'Multiply your outs by 2',
        'Multiply your outs by 4',
        'Divide the pot by your outs',
      ],
    },
    correctAnswer: 'Multiply your outs by 2',
    explanation:
      'The Rule of 2: with one card to come (turn to river), multiply outs by 2. Example: 9 outs x 2 = ~18% chance to hit on the river.',
    xpValue: 10,
  },

  // 35 - Medium: Apply Rule of 4 to flush draw
  {
    type: 'RULE_OF',
    difficulty: 2,
    content: {
      hand: ['Kd', 'Qd'],
      board: ['Jd', '4d', '8c'],
      question:
        'You have a flush draw (9 outs) on the flop. Using the Rule of 4, what is your approximate equity?',
      options: ['36%', '18%', '27%'],
    },
    correctAnswer: '36%',
    explanation:
      'Rule of 4: 9 outs x 4 = 36%. The actual equity is about 35%. With roughly a 1-in-3 chance, you can call many bets profitably.',
    xpValue: 15,
  },

  // 36 - Medium: Apply Rule of 2 to OESD
  {
    type: 'RULE_OF',
    difficulty: 2,
    content: {
      hand: ['10s', '9c'],
      board: ['8h', '7d', 'As', 'Kc'],
      question:
        'You have an open-ended straight draw (8 outs) on the turn. Using the Rule of 2, what is your equity?',
      options: ['16%', '32%', '8%'],
    },
    correctAnswer: '16%',
    explanation:
      'Rule of 2: 8 outs x 2 = 16% on the turn (one card to come). This is close to the actual value of ~17%. You need pot odds better than ~5:1.',
    xpValue: 15,
  },

  // 37 - Medium: When to use Rule of 4 vs Rule of 2
  {
    type: 'RULE_OF',
    difficulty: 2,
    content: {
      question:
        'You face an all-in bet on the flop. Should you use the Rule of 2 or Rule of 4?',
      options: [
        'Rule of 4 - both remaining cards will be dealt',
        'Rule of 2 - always use Rule of 2',
        'Neither - just guess',
      ],
    },
    correctAnswer: 'Rule of 4 - both remaining cards will be dealt',
    explanation:
      'When facing an all-in on the flop, both turn and river will be dealt with no more betting. Use Rule of 4 (outs x 4) since you see two cards. If there is still betting to come, use Rule of 2 per street.',
    xpValue: 15,
  },

  // 38 - Hard: Rule of 4 accuracy limits
  {
    type: 'RULE_OF',
    difficulty: 3,
    content: {
      question:
        'The Rule of 4 becomes less accurate with many outs. With 15 outs, Rule of 4 says 60%. What is the actual equity closer to?',
      options: ['54%', '60%', '45%'],
    },
    correctAnswer: '54%',
    explanation:
      'With 15+ outs, the Rule of 4 overestimates. A more precise formula: (outs x 4) - (outs - 8) for high out counts. 15 x 4 = 60, minus (15-8) = 7, so ~53%. Actual is ~54.1%.',
    xpValue: 20,
  },

  // 39 - Hard: Practical Rule of 2 application
  {
    type: 'RULE_OF',
    difficulty: 3,
    content: {
      hand: ['Ac', '5c'],
      board: ['Kc', '8c', '3d', 'Jh'],
      question:
        'On the turn with the nut flush draw (9 outs), the pot is $80 and opponent bets $40. Using the Rule of 2, is this a call?',
      options: [
        'Yes - 18% equity vs 25% needed, but implied odds help',
        'No - 18% is not enough for any call',
        'Yes - 36% equity easily beats the odds',
      ],
    },
    correctAnswer: 'Yes - 18% equity vs 25% needed, but implied odds help',
    explanation:
      'Rule of 2: 9 x 2 = 18%. Pot odds: $40 / ($80 + $40 + $40) = $40 / $160 = 25%. Direct odds say fold (18% < 25%). But with the nut flush draw, if you hit you can win a lot more on the river (implied odds), making this a profitable call.',
    xpValue: 20,
  },

  // 40 - Hard: Comparing Rule of 2 on turn vs Rule of 4 on flop
  {
    type: 'RULE_OF',
    difficulty: 3,
    content: {
      question:
        'Why should you use Rule of 2 (not Rule of 4) on the flop when facing a normal bet (not all-in)?',
      options: [
        'Because you must survive a turn bet too — you only realize one card of equity at a time',
        'Because Rule of 4 is always wrong',
        'Because there are fewer cards in the deck on the turn',
      ],
    },
    correctAnswer:
      'Because you must survive a turn bet too — you only realize one card of equity at a time',
    explanation:
      'If opponent bets the turn too, you\'d pay twice to see both cards. Rule of 4 assumes you see two free cards. Since you face separate bets per street, use Rule of 2 per card. Only use Rule of 4 when all the money is in (all-in on flop).',
    xpValue: 20,
  },
];
