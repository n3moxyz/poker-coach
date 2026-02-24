export const flopPlayQuestions = [
  // ============================================================
  // HAND_STRENGTH (15 questions)
  // ============================================================

  // HAND_STRENGTH #1 - Easy
  {
    type: 'HAND_STRENGTH',
    difficulty: 1,
    content: {
      hand: ['Ah', 'Kd'],
      board: ['As', '7c', '2h'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Strong - Top pair, top kicker',
        'Medium - Middle pair',
        'Weak - No pair',
      ],
    },
    correctAnswer: 'Strong - Top pair, top kicker',
    explanation:
      'You have a pair of Aces with a King kicker (TPTK). On a dry A-7-2 board, this is a very strong hand that beats almost everything.',
    xpValue: 10,
  },

  // HAND_STRENGTH #2 - Easy
  {
    type: 'HAND_STRENGTH',
    difficulty: 1,
    content: {
      hand: ['Qc', 'Jd'],
      board: ['Qs', '8h', '3c'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Strong - Top pair, good kicker',
        'Weak - No pair',
        'Draw - Flush draw',
      ],
    },
    correctAnswer: 'Strong - Top pair, good kicker',
    explanation:
      'You paired the Queen with a Jack kicker. Top pair with a strong kicker is a good hand on this relatively dry board.',
    xpValue: 10,
  },

  // HAND_STRENGTH #3 - Easy
  {
    type: 'HAND_STRENGTH',
    difficulty: 1,
    content: {
      hand: ['9h', '8c'],
      board: ['Kd', 'Qs', '3h'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Weak - No pair, no draw',
        'Medium - Middle pair',
        'Strong - Two overcards',
      ],
    },
    correctAnswer: 'Weak - No pair, no draw',
    explanation:
      'You have 9-high with no pair and no meaningful draw. Both the King and Queen on the board are higher than your cards. This is a clear miss.',
    xpValue: 10,
  },

  // HAND_STRENGTH #4 - Easy
  {
    type: 'HAND_STRENGTH',
    difficulty: 1,
    content: {
      hand: ['Ah', 'Kh'],
      board: ['Qh', '9h', '3c'],
      question: 'What do you have on this flop?',
      options: [
        'Draw - Nut flush draw with overcards',
        'Strong - Made flush',
        'Weak - Nothing useful',
      ],
    },
    correctAnswer: 'Draw - Nut flush draw with overcards',
    explanation:
      'You have four hearts and need one more for the best possible flush (the nut flush draw). Your Ace and King are also overcards that could pair up.',
    xpValue: 10,
  },

  // HAND_STRENGTH #5 - Medium
  {
    type: 'HAND_STRENGTH',
    difficulty: 2,
    content: {
      hand: ['Jh', '10h'],
      board: ['9h', '8c', '2h'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Draw - Open-ended straight draw + flush draw',
        'Strong - Made straight',
        'Weak - No pair',
      ],
    },
    correctAnswer: 'Draw - Open-ended straight draw + flush draw',
    explanation:
      'You have an open-ended straight draw (any Queen or 7 makes a straight) plus a flush draw (two hearts in hand, two on board). This is a monster draw with roughly 15 outs.',
    xpValue: 15,
  },

  // HAND_STRENGTH #6 - Medium
  {
    type: 'HAND_STRENGTH',
    difficulty: 2,
    content: {
      hand: ['8s', '8d'],
      board: ['8h', 'Kc', '5s'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Monster - Set of Eights',
        'Medium - Middle pair',
        'Strong - Top pair',
      ],
    },
    correctAnswer: 'Monster - Set of Eights',
    explanation:
      'You have three Eights (a set). A set is one of the strongest flop hands because it is disguised -- opponents rarely put you on three of a kind when only one Eight is on the board.',
    xpValue: 15,
  },

  // HAND_STRENGTH #7 - Medium
  {
    type: 'HAND_STRENGTH',
    difficulty: 2,
    content: {
      hand: ['Kc', '4d'],
      board: ['Ks', 'Jh', '9c'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Medium - Top pair, weak kicker',
        'Strong - Top pair, top kicker',
        'Weak - Underpair',
      ],
    },
    correctAnswer: 'Medium - Top pair, weak kicker',
    explanation:
      'You have top pair (Kings), but your 4 kicker is very weak. Better King hands like KQ, KJ, or AK all dominate you. Be cautious with this hand.',
    xpValue: 15,
  },

  // HAND_STRENGTH #8 - Medium
  {
    type: 'HAND_STRENGTH',
    difficulty: 2,
    content: {
      hand: ['10c', '10d'],
      board: ['Js', '6h', '2c'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Medium - Second pair (underpair to the Jack)',
        'Strong - Overpair',
        'Weak - Bottom pair',
      ],
    },
    correctAnswer: 'Medium - Second pair (underpair to the Jack)',
    explanation:
      'Your pocket Tens are below the Jack on the board, making them second pair. You beat hands with smaller pairs or no pair, but any Jack has you beat.',
    xpValue: 15,
  },

  // HAND_STRENGTH #9 - Medium
  {
    type: 'HAND_STRENGTH',
    difficulty: 2,
    content: {
      hand: ['Ac', 'Jc'],
      board: ['Jd', '7s', '4h'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Strong - Top pair, top kicker',
        'Medium - Middle pair',
        'Draw - Gutshot straight draw',
      ],
    },
    correctAnswer: 'Strong - Top pair, top kicker',
    explanation:
      'You have top pair (Jacks) with the best possible kicker (Ace). On this dry board with no flush or straight draws, TPTK is a strong hand you should bet for value.',
    xpValue: 15,
  },

  // HAND_STRENGTH #10 - Hard
  {
    type: 'HAND_STRENGTH',
    difficulty: 3,
    content: {
      hand: ['7h', '7d'],
      board: ['Ah', 'Kc', 'Qd'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Weak - Underpair on a dangerous board',
        'Medium - Still a pair',
        'Strong - Set potential',
      ],
    },
    correctAnswer: 'Weak - Underpair on a dangerous board',
    explanation:
      'Pocket Sevens on A-K-Q is very weak. Three overcards are on the board, and many hands opponents play (any Ace, King, Queen, or JT for a straight) have you crushed.',
    xpValue: 20,
  },

  // HAND_STRENGTH #11 - Hard
  {
    type: 'HAND_STRENGTH',
    difficulty: 3,
    content: {
      hand: ['Qs', 'Jd'],
      board: ['Qc', 'Jh', '5s'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Monster - Two pair (Queens and Jacks)',
        'Strong - Top pair',
        'Medium - Second pair',
      ],
    },
    correctAnswer: 'Monster - Two pair (Queens and Jacks)',
    explanation:
      'You flopped two pair using both hole cards. Two pair is very strong on most boards. The main danger is a set (pocket 5s, pocket Qs, or pocket Js), but those are rare.',
    xpValue: 20,
  },

  // HAND_STRENGTH #12 - Hard
  {
    type: 'HAND_STRENGTH',
    difficulty: 3,
    content: {
      hand: ['6d', '5d'],
      board: ['9d', '7c', '3s'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Draw - Gutshot straight draw',
        'Weak - No pair, no draw',
        'Strong - Open-ended straight draw',
      ],
    },
    correctAnswer: 'Draw - Gutshot straight draw',
    explanation:
      'You need an 8 to make a straight (9-8-7-6-5). A gutshot has only 4 outs, making it weaker than an open-ended draw (8 outs). Be cautious about investing too much with just a gutshot.',
    xpValue: 20,
  },

  // HAND_STRENGTH #13 - Hard
  {
    type: 'HAND_STRENGTH',
    difficulty: 3,
    content: {
      hand: ['As', 'Qh'],
      board: ['Ks', '10s', '4s'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Draw - Nut flush draw plus gutshot',
        'Strong - Pair of Aces',
        'Weak - No pair',
      ],
    },
    correctAnswer: 'Draw - Nut flush draw plus gutshot',
    explanation:
      'You have the nut flush draw (three spades on board, Ace of spades in hand) and a gutshot straight draw (need a Jack for A-K-Q-J-10). This combination gives you roughly 12 outs.',
    xpValue: 20,
  },

  // HAND_STRENGTH #14 - Easy
  {
    type: 'HAND_STRENGTH',
    difficulty: 1,
    content: {
      hand: ['Qd', 'Qc'],
      board: ['Js', '8h', '4d'],
      question: 'How strong is your hand on this flop?',
      options: [
        'Strong - Overpair',
        'Medium - Second pair',
        'Weak - Underpair',
      ],
    },
    correctAnswer: 'Strong - Overpair',
    explanation:
      'Your Queens are higher than every card on the board, making them an overpair. Overpairs are strong hands, similar to top pair with the best kicker.',
    xpValue: 10,
  },

  // HAND_STRENGTH #15 - Medium
  {
    type: 'HAND_STRENGTH',
    difficulty: 2,
    content: {
      hand: ['5c', '4c'],
      board: ['Ac', 'Jc', '7h'],
      question: 'What do you have on this flop?',
      options: [
        'Draw - Flush draw',
        'Weak - Nothing',
        'Strong - Two pair',
      ],
    },
    correctAnswer: 'Draw - Flush draw',
    explanation:
      'You have four clubs (two in hand, two on board) and need one more for a flush. With 9 outs, you have about a 35% chance of making the flush by the river.',
    xpValue: 15,
  },

  // ============================================================
  // BOARD_TEXTURE (12 questions)
  // ============================================================

  // BOARD_TEXTURE #1 - Easy
  {
    type: 'BOARD_TEXTURE',
    difficulty: 1,
    content: {
      board: ['Kh', '7c', '2d'],
      question: 'What type of board texture is this?',
      options: [
        'Dry - Few draws possible',
        'Wet - Many draws possible',
        'Monotone - Flush likely',
      ],
    },
    correctAnswer: 'Dry - Few draws possible',
    explanation:
      'K-7-2 with three different suits (rainbow) and no connected cards is a very dry board. No flush draws and barely any straight draws exist here.',
    xpValue: 10,
  },

  // BOARD_TEXTURE #2 - Easy
  {
    type: 'BOARD_TEXTURE',
    difficulty: 1,
    content: {
      board: ['Js', '6h', '2c'],
      question: 'This flop texture is considered:',
      options: [
        'Dry - Few draws possible',
        'Wet - Many draws possible',
        'Paired - Trips likely',
      ],
    },
    correctAnswer: 'Dry - Few draws possible',
    explanation:
      'Rainbow (three suits) with disconnected cards (J-6-2) is very dry. There are no flush draws and very limited straight draws on this board.',
    xpValue: 10,
  },

  // BOARD_TEXTURE #3 - Easy
  {
    type: 'BOARD_TEXTURE',
    difficulty: 1,
    content: {
      board: ['9s', '9d', '3h'],
      question: 'What type of board texture is this?',
      options: [
        'Paired - Full house and trips possible',
        'Wet - Many draws',
        'Dry - Rainbow and disconnected',
      ],
    },
    correctAnswer: 'Paired - Full house and trips possible',
    explanation:
      'A paired board means someone could have trips (three of a kind) or, less likely, a full house. It also reduces the number of possible combinations of that card opponents can hold.',
    xpValue: 10,
  },

  // BOARD_TEXTURE #4 - Medium
  {
    type: 'BOARD_TEXTURE',
    difficulty: 2,
    content: {
      board: ['Jh', '10h', '9c'],
      question: 'What type of board texture is this?',
      options: [
        'Wet - Straight and flush draws everywhere',
        'Dry - Few draws',
        'Paired - Full house possible',
      ],
    },
    correctAnswer: 'Wet - Straight and flush draws everywhere',
    explanation:
      'J-10-9 with two hearts is extremely wet. Many straight draws (KQ, Q8, K8, 87) and a heart flush draw are possible. Be careful with one-pair hands here.',
    xpValue: 15,
  },

  // BOARD_TEXTURE #5 - Medium
  {
    type: 'BOARD_TEXTURE',
    difficulty: 2,
    content: {
      board: ['Ad', 'Kd', '7d'],
      question: 'What makes this board texture dangerous?',
      options: [
        'Monotone - Any single diamond makes a flush',
        'Paired - Full house possible',
        'Disconnected - No straight draws',
      ],
    },
    correctAnswer: 'Monotone - Any single diamond makes a flush',
    explanation:
      'All three cards are diamonds (monotone board). Anyone holding a single diamond has a flush draw, and someone with two diamonds already has a flush. Proceed with extreme caution without a diamond.',
    xpValue: 15,
  },

  // BOARD_TEXTURE #6 - Medium
  {
    type: 'BOARD_TEXTURE',
    difficulty: 2,
    content: {
      board: ['Ah', 'Kc', 'Qd'],
      question: 'What is notable about this board?',
      options: [
        'Broadway heavy - Straight possible with J-10',
        'Dry - No draws possible',
        'Low board - Favors small pairs',
      ],
    },
    correctAnswer: 'Broadway heavy - Straight possible with J-10',
    explanation:
      'A-K-Q is a broadway-heavy board. Anyone with J-10 already has a straight, and JX or 10X hands have straight draws. Many premium hands connect with this board.',
    xpValue: 15,
  },

  // BOARD_TEXTURE #7 - Medium
  {
    type: 'BOARD_TEXTURE',
    difficulty: 2,
    content: {
      board: ['8c', '7d', '6h'],
      question: 'What type of board texture is this?',
      options: [
        'Connected - Straight draws and made straights likely',
        'Dry - Few draws possible',
        'Monotone - Flush heavy',
      ],
    },
    correctAnswer: 'Connected - Straight draws and made straights likely',
    explanation:
      'Three consecutive cards (8-7-6) mean many straight combos are possible. Anyone with 10-9, 9-5, or 5-4 has a made straight, and hands like 9x, 10x, or 5x have open-ended draws.',
    xpValue: 15,
  },

  // BOARD_TEXTURE #8 - Hard
  {
    type: 'BOARD_TEXTURE',
    difficulty: 3,
    content: {
      board: ['Qs', 'Js', '8c'],
      question: 'Why is this board considered very wet?',
      options: [
        'Two-tone with connected cards: flush and straight draws abound',
        'All high cards: only premium hands connect',
        'Paired board: trips are likely',
      ],
    },
    correctAnswer: 'Two-tone with connected cards: flush and straight draws abound',
    explanation:
      'Two spades create a flush draw, and Q-J-8 is connected enough for many straight draws (K10, 109, 97). When a board is both suited and connected, it is very wet.',
    xpValue: 20,
  },

  // BOARD_TEXTURE #9 - Hard
  {
    type: 'BOARD_TEXTURE',
    difficulty: 3,
    content: {
      board: ['4s', '4h', '9c'],
      question: 'How does a paired board affect your strategy?',
      options: [
        'Fewer combinations of that card exist, so betting for value is safer with overpairs',
        'You should always fold because someone has trips',
        'It means the board is very wet',
      ],
    },
    correctAnswer:
      'Fewer combinations of that card exist, so betting for value is safer with overpairs',
    explanation:
      'A paired board reduces the combos of that card opponents can hold (only one combo of pocket 4s left). Overpairs and top pair are relatively safe to bet for value because trips are unlikely.',
    xpValue: 20,
  },

  // BOARD_TEXTURE #10 - Hard
  {
    type: 'BOARD_TEXTURE',
    difficulty: 3,
    content: {
      board: ['Kh', 'Kd', '5c'],
      question: 'You have Ace-Queen. How does the paired King affect your hand?',
      options: [
        'Your hand is weaker than usual - a King is very likely in opponent ranges',
        'Your hand is very strong - you have a hidden full house',
        'The paired board does not change anything',
      ],
    },
    correctAnswer:
      'Your hand is weaker than usual - a King is very likely in opponent ranges',
    explanation:
      'On K-K-5, many hands in opponent ranges include a King (KQ, KJ, KT, AK). Your Ace-Queen has no pair and is essentially Ace-high here. Be ready to give up facing aggression.',
    xpValue: 20,
  },

  // BOARD_TEXTURE #11 - Easy
  {
    type: 'BOARD_TEXTURE',
    difficulty: 1,
    content: {
      board: ['Ac', '8d', '3s'],
      question: 'Is this board more likely to help the preflop raiser or the caller?',
      options: [
        'The raiser - Aces are common in raising ranges',
        'The caller - Low cards favor callers',
        'Neither - It is completely neutral',
      ],
    },
    correctAnswer: 'The raiser - Aces are common in raising ranges',
    explanation:
      'Boards with an Ace favor the preflop raiser because their range contains more Ace-x hands (AK, AQ, AJ, etc). The caller has fewer Aces in their range.',
    xpValue: 10,
  },

  // BOARD_TEXTURE #12 - Hard
  {
    type: 'BOARD_TEXTURE',
    difficulty: 3,
    content: {
      board: ['7h', '6h', '5d'],
      question: 'What makes this board especially tricky to navigate?',
      options: [
        'Connected and suited: made straights, flush draws, and straight draws all present',
        'It is a dry board with few draws',
        'Only high-card hands are strong here',
      ],
    },
    correctAnswer:
      'Connected and suited: made straights, flush draws, and straight draws all present',
    explanation:
      'This board has a made straight for 9-8 or 4-3, open-ended straight draws for many hands (8x, 9x, 4x), and a heart flush draw. Even overpairs are vulnerable on this texture.',
    xpValue: 20,
  },

  // ============================================================
  // FLOP_ACTION (13 questions)
  // ============================================================

  // FLOP_ACTION #1 - Easy
  {
    type: 'FLOP_ACTION',
    difficulty: 1,
    content: {
      hand: ['As', 'Kc'],
      board: ['Ad', '8h', '3s'],
      situation: 'You raised preflop and got one caller. You are first to act on the flop.',
      question: 'What is your best action?',
      options: [
        'Bet (continuation bet) for value',
        'Check and fold',
        'Check and hope to trap',
      ],
    },
    correctAnswer: 'Bet (continuation bet) for value',
    explanation:
      'With top pair top kicker on a dry board, you should continuation bet for value. You want worse hands like Ax with a weaker kicker, pocket pairs, or draws to call.',
    xpValue: 10,
  },

  // FLOP_ACTION #2 - Easy
  {
    type: 'FLOP_ACTION',
    difficulty: 1,
    content: {
      hand: ['6d', '5c'],
      board: ['Ah', 'Kd', 'Qs'],
      situation:
        'You called from the big blind. Opponent bets two-thirds of the pot.',
      question: 'What should you do?',
      options: [
        'Fold - You missed completely',
        'Call - You might improve',
        'Raise as a bluff',
      ],
    },
    correctAnswer: 'Fold - You missed completely',
    explanation:
      'You have 6-high with no pair and no draw on a board full of high cards. There is no reason to put more money in with this hand. Clean fold.',
    xpValue: 10,
  },

  // FLOP_ACTION #3 - Easy
  {
    type: 'FLOP_ACTION',
    difficulty: 1,
    content: {
      hand: ['Kh', 'Qh'],
      board: ['Kd', 'Qc', '5s'],
      situation: 'You raised preflop. One caller. You act first on the flop.',
      question: 'What is your best approach?',
      options: [
        'Bet for value - Top two pair is very strong',
        'Check to slow play',
        'Check and fold to a bet',
      ],
    },
    correctAnswer: 'Bet for value - Top two pair is very strong',
    explanation:
      'Two pair is a strong hand. Bet for value to build the pot. Slow playing risks giving a free card that could make someone a straight or better.',
    xpValue: 10,
  },

  // FLOP_ACTION #4 - Easy
  {
    type: 'FLOP_ACTION',
    difficulty: 1,
    content: {
      hand: ['Jc', 'Jd'],
      board: ['7s', '4h', '2c'],
      situation:
        'You raised preflop and got one caller. You are in position.',
      question: 'What should you do?',
      options: [
        'Bet for value and protection',
        'Check behind',
        'Go all-in',
      ],
    },
    correctAnswer: 'Bet for value and protection',
    explanation:
      'Pocket Jacks is an overpair on this low board. Bet to get value from worse pairs and overcards, and to protect against hands that could improve (like A5 or 65).',
    xpValue: 10,
  },

  // FLOP_ACTION #5 - Medium
  {
    type: 'FLOP_ACTION',
    difficulty: 2,
    content: {
      hand: ['Ah', 'Ad'],
      board: ['Kh', 'Qh', 'Jc'],
      situation:
        'You have pocket Aces (no heart). Board has two hearts and a possible straight.',
      question: 'What is your best action?',
      options: [
        'Bet for protection and value',
        'Check and give up',
        'Go all-in immediately',
      ],
    },
    correctAnswer: 'Bet for protection and value',
    explanation:
      'You have an overpair but the board is coordinated. Bet to charge draws (flush draws, straight draws) and get value from top pair or second pair hands. Do not slow play on wet boards.',
    xpValue: 15,
  },

  // FLOP_ACTION #6 - Medium
  {
    type: 'FLOP_ACTION',
    difficulty: 2,
    content: {
      hand: ['10s', '9s'],
      board: ['8c', '7d', '2s'],
      situation:
        'You called a preflop raise. Opponent checks to you on the flop.',
      question: 'What should you do with your open-ended straight draw?',
      options: [
        'Bet as a semi-bluff',
        'Check behind and take a free card',
        'Fold',
      ],
    },
    correctAnswer: 'Bet as a semi-bluff',
    explanation:
      'With an open-ended straight draw (any Jack or 6 makes a straight), betting as a semi-bluff is great. You can win if they fold now, or improve to the best hand if called.',
    xpValue: 15,
  },

  // FLOP_ACTION #7 - Medium
  {
    type: 'FLOP_ACTION',
    difficulty: 2,
    content: {
      hand: ['9c', '9s'],
      board: ['Ah', 'Kd', '10c'],
      situation:
        'You called a preflop raise from the button. Opponent bets half the pot.',
      question: 'What should you do with your pocket Nines?',
      options: [
        'Fold - Three overcards make this hand weak',
        'Call - You still have a pair',
        'Raise - You want to build the pot',
      ],
    },
    correctAnswer: 'Fold - Three overcards make this hand weak',
    explanation:
      'Pocket Nines on A-K-10 is an underpair to three overcards. Your opponent likely raised with hands that connect with this board (AK, AQ, KQ, JJ+). Folding saves you money.',
    xpValue: 15,
  },

  // FLOP_ACTION #8 - Medium
  {
    type: 'FLOP_ACTION',
    difficulty: 2,
    content: {
      hand: ['Ac', '8c'],
      board: ['Kc', '5c', '2d'],
      situation:
        'You raised preflop and got called. You are first to act with a flush draw.',
      question: 'What is your best play?',
      options: [
        'Bet as a continuation bet and semi-bluff',
        'Check and give up',
        'Go all-in to maximize fold equity',
      ],
    },
    correctAnswer: 'Bet as a continuation bet and semi-bluff',
    explanation:
      'You have the nut flush draw (9 outs) and raised preflop, so a continuation bet is natural. If called, you still have a strong draw. If they fold, you win immediately.',
    xpValue: 15,
  },

  // FLOP_ACTION #9 - Medium
  {
    type: 'FLOP_ACTION',
    difficulty: 2,
    content: {
      hand: ['Qs', 'Jc'],
      board: ['Qd', '9h', '4c'],
      situation:
        'You raised preflop. Opponent check-raises your continuation bet.',
      question: 'How should you respond with top pair, Jack kicker?',
      options: [
        'Call and re-evaluate on the turn',
        'Fold immediately',
        'Re-raise (3-bet) to put pressure on',
      ],
    },
    correctAnswer: 'Call and re-evaluate on the turn',
    explanation:
      'Top pair with a decent kicker is good but not great when facing a check-raise. Calling to see the turn card and gathering more information is the prudent play. Folding is too tight; re-raising risks committing too many chips.',
    xpValue: 15,
  },

  // FLOP_ACTION #10 - Hard
  {
    type: 'FLOP_ACTION',
    difficulty: 3,
    content: {
      hand: ['6h', '6c'],
      board: ['6d', 'Js', '10h'],
      situation:
        'You called a raise from the big blind and flopped a set. Opponent bets.',
      question: 'What is the optimal play with your set?',
      options: [
        'Raise (check-raise) to build the pot',
        'Just call to keep them betting',
        'Fold because the board is scary',
      ],
    },
    correctAnswer: 'Raise (check-raise) to build the pot',
    explanation:
      'A set is a monster hand. On a connected board (J-10) where draws exist, you want to raise to build the pot while charging draws. Slow playing risks letting opponents draw cheaply.',
    xpValue: 20,
  },

  // FLOP_ACTION #11 - Hard
  {
    type: 'FLOP_ACTION',
    difficulty: 3,
    content: {
      hand: ['Kd', '10d'],
      board: ['Qd', 'Jd', '3h'],
      situation:
        'You called a preflop raise in position. Opponent bets two-thirds pot.',
      question:
        'You have a flush draw and an open-ended straight draw. What do you do?',
      options: [
        'Raise as a semi-bluff with your monster draw',
        'Fold because you do not have a made hand yet',
        'Just call and hope to hit',
      ],
    },
    correctAnswer: 'Raise as a semi-bluff with your monster draw',
    explanation:
      'With a flush draw (9 outs) plus an open-ended straight draw (any Ace or 9, minus overlap, adds more outs), you have roughly 15 outs. Raising as a semi-bluff puts maximum pressure on your opponent while giving you two ways to win.',
    xpValue: 20,
  },

  // FLOP_ACTION #12 - Hard
  {
    type: 'FLOP_ACTION',
    difficulty: 3,
    content: {
      hand: ['Ac', 'Ks'],
      board: ['Jd', '8c', '4h'],
      situation:
        'You raised preflop with AK and missed the flop completely. Two opponents called your preflop raise.',
      question: 'What should you do on this multi-way flop?',
      options: [
        'Check - Bluffing into multiple opponents is risky',
        'Bet big to push everyone out',
        'Go all-in as a bluff',
      ],
    },
    correctAnswer: 'Check - Bluffing into multiple opponents is risky',
    explanation:
      'Continuation bets work best heads-up. Against two callers, at least one likely connected with this board. With just Ace-high and no draw, checking and giving up is the disciplined play.',
    xpValue: 20,
  },

  // FLOP_ACTION #13 - Hard
  {
    type: 'FLOP_ACTION',
    difficulty: 3,
    content: {
      hand: ['8h', '7h'],
      board: ['Kc', 'Ks', '4d'],
      situation:
        'You raised from the button and the big blind called. You are heads-up and in position.',
      question:
        'The board is paired with Kings. Should you continuation bet?',
      options: [
        'Yes - This board is great for your range as the preflop raiser',
        'No - You should never bluff on paired boards',
        'Only if you had a King',
      ],
    },
    correctAnswer:
      'Yes - This board is great for your range as the preflop raiser',
    explanation:
      'Paired King boards strongly favor the preflop raiser because you are more likely to have a King in your range. A continuation bet will often win the pot since the big blind rarely has a King here.',
    xpValue: 20,
  },
];
