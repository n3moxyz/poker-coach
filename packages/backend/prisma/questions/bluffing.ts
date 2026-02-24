export const bluffingQuestions = [
  // ============================================================
  // BLUFF_SPOT — Identify good vs bad spots to bluff (~10 questions)
  // ============================================================

  // Q1: BLUFF_SPOT — Opponent checks river heads-up (easy)
  {
    type: 'BLUFF_SPOT',
    difficulty: 1,
    content: {
      situation:
        'You are heads-up on the river with Ace-high (no pair). Your opponent checks to you.',
      question: 'Is this a good spot to bluff?',
      options: [
        'Yes - opponent showed weakness by checking',
        'No - you should check back and hope Ace-high wins',
        'Yes - but only bet the minimum',
      ],
    },
    correctAnswer: 'Yes - opponent showed weakness by checking',
    explanation:
      'When an opponent checks the river heads-up, they are often giving up with a weak hand. A bet here can fold out small pairs and other hands that beat your Ace-high. This is a classic bluff opportunity.',
    xpValue: 10,
  },

  // Q2: BLUFF_SPOT — Multiway pot (easy)
  {
    type: 'BLUFF_SPOT',
    difficulty: 1,
    content: {
      situation:
        'You missed your flush draw on the river. There are 3 other players still in the hand.',
      question: 'Should you bluff here?',
      options: [
        'No - too many opponents to fold out',
        'Yes - a big bet will scare everyone',
        'Yes - but only if you are in position',
      ],
    },
    correctAnswer: 'No - too many opponents to fold out',
    explanation:
      'Bluffing into multiple opponents is one of the most common beginner mistakes. You need ALL of them to fold for a bluff to work. The more players in the pot, the more likely someone has a real hand.',
    xpValue: 10,
  },

  // Q3: BLUFF_SPOT — Calling station opponent (easy)
  {
    type: 'BLUFF_SPOT',
    difficulty: 1,
    content: {
      situation:
        'You have no pair on the river. Your opponent is a calling station who calls with any pair.',
      question: 'Should you bluff this opponent?',
      options: [
        'No - calling stations do not fold enough for bluffs to work',
        'Yes - a large overbet will get them to fold',
        'Yes - bluff small to keep the risk low',
      ],
    },
    correctAnswer: 'No - calling stations do not fold enough for bluffs to work',
    explanation:
      'Bluffs only profit when opponents fold. Calling stations call too often, so bluffs lose money against them. Against these players, only bet when you have a real hand.',
    xpValue: 10,
  },

  // Q4: BLUFF_SPOT — Scare card arrives (medium)
  {
    type: 'BLUFF_SPOT',
    difficulty: 2,
    content: {
      situation:
        'You raised preflop from the button. The flop is K-7-2 rainbow. Both opponents check to you.',
      question: 'Is this a good spot to continuation bet as a bluff?',
      options: [
        'Yes - you raised preflop and this dry board favors your range',
        'No - you should check since you missed the flop',
        'Yes - but only bet if you have at least a gutshot',
      ],
    },
    correctAnswer: 'Yes - you raised preflop and this dry board favors your range',
    explanation:
      'As the preflop raiser, opponents expect you to have big cards. A King-high dry board hits the raiser range (AK, KQ, KJ) more than the caller range. A continuation bet here tells a consistent story.',
    xpValue: 15,
  },

  // Q5: BLUFF_SPOT — Position advantage (medium)
  {
    type: 'BLUFF_SPOT',
    difficulty: 2,
    content: {
      question: 'In which position is bluffing generally most effective?',
      options: [
        'In position (acting last) - you have the most information',
        'Out of position (acting first) - you can set the tone',
        'Position does not matter for bluffing',
      ],
    },
    correctAnswer: 'In position (acting last) - you have the most information',
    explanation:
      'Acting last lets you see what opponents do before you decide. If they check, they showed weakness. If they bet, you can fold cheaply. Bluffing in position is far more effective because you have more information.',
    xpValue: 15,
  },

  // Q6: BLUFF_SPOT — Flush-completing river (medium)
  {
    type: 'BLUFF_SPOT',
    difficulty: 2,
    content: {
      situation:
        'The river puts a third heart on the board. You do not have a heart, but your opponent has been checking the whole way.',
      question: 'Is this a good spot to represent the flush with a bluff?',
      options: [
        'Yes - the scare card gives you a credible bluff story',
        'No - your opponent might have been trapping with a flush draw',
        'No - you should never bluff when draws complete',
      ],
    },
    correctAnswer: 'Yes - the scare card gives you a credible bluff story',
    explanation:
      'Scare cards that complete draws are excellent bluff cards. Your opponent will worry you have the flush. Since they have been passive, they likely do not have a strong hand and can be pressured to fold.',
    xpValue: 15,
  },

  // Q7: BLUFF_SPOT — Opponent is all-in (medium)
  {
    type: 'BLUFF_SPOT',
    difficulty: 2,
    content: {
      situation:
        'Your opponent just went all-in on the flop. You have a gutshot straight draw with no pair.',
      question: 'Can you bluff here?',
      options: [
        'No - you cannot bluff an all-in player because they cannot fold',
        'Yes - raise their all-in to show strength',
        'Yes - a big call acts as a bluff',
      ],
    },
    correctAnswer: 'No - you cannot bluff an all-in player because they cannot fold',
    explanation:
      'Bluffing requires fold equity, meaning your opponent must be able to fold. An all-in player has committed all their chips and will see the showdown no matter what. You can only call or fold.',
    xpValue: 15,
  },

  // Q8: BLUFF_SPOT — Blocker concept (hard)
  {
    type: 'BLUFF_SPOT',
    difficulty: 3,
    content: {
      situation:
        'The river is A-K-Q-8-3 with no flush possible. You hold A-4 offsuit (pair of Aces with bad kicker). Opponent checks.',
      question: 'Why might this be a bad hand to bluff with?',
      options: [
        'You already have a decent hand - bet for value instead',
        'Your Ace blocks opponent from having Aces, making them more likely to fold anyway',
        'You should always bluff with the worst hand in your range',
      ],
    },
    correctAnswer: 'You already have a decent hand - bet for value instead',
    explanation:
      'With a pair of Aces, you have showdown value. Bluffing turns a potential winner into a loser if they call. Bet for thin value or check back. Save bluffs for hands with zero showdown value.',
    xpValue: 20,
  },

  // Q9: BLUFF_SPOT — Opponent type selection (hard)
  {
    type: 'BLUFF_SPOT',
    difficulty: 3,
    content: {
      question: 'Which opponent type is the best target for a bluff?',
      options: [
        'A tight player who folds to aggression',
        'A calling station who calls with any pair',
        'An aggressive player who might re-raise you',
      ],
    },
    correctAnswer: 'A tight player who folds to aggression',
    explanation:
      'Tight players fold the most, which is exactly what you need for a bluff to work. Calling stations never fold (terrible to bluff). Aggressive players might re-raise, turning your bluff into an expensive mistake.',
    xpValue: 20,
  },

  // Q10: BLUFF_SPOT — Blocker bluff (hard)
  {
    type: 'BLUFF_SPOT',
    difficulty: 3,
    content: {
      situation:
        'The board is 9h-8h-2c-5h-Jh (four hearts). You hold Ah-3d (Ace of hearts but no flush). Opponent checks the river.',
      question: 'Why is this a particularly good bluff spot?',
      options: [
        'You block the nut flush - opponent is less likely to have it',
        'Four hearts on board means everyone is scared',
        'The Jack on the river changes nothing',
      ],
    },
    correctAnswer: 'You block the nut flush - opponent is less likely to have it',
    explanation:
      'Holding the Ace of hearts means your opponent cannot have the nut flush (Ace-high flush). This is called a "blocker." Since you reduce the chance they have the best hand, they are more likely to fold when you bet big.',
    xpValue: 20,
  },

  // ============================================================
  // STORY_CONSISTENT — Does the betting line tell a consistent story? (~10 questions)
  // ============================================================

  // Q11: STORY_CONSISTENT — Classic strong line (easy)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 1,
    content: {
      line: 'Opponent raises preflop, bets the flop, bets the turn, and bets the river.',
      question: 'Does this betting line tell a consistent story?',
      options: [
        'Yes - this is consistent with a strong hand throughout',
        'No - real strong hands slow down at some point',
        'Suspicious - they are betting too much',
      ],
    },
    correctAnswer: 'Yes - this is consistent with a strong hand throughout',
    explanation:
      'Raising preflop then betting every street (known as triple-barreling) tells the story of a strong hand that wants to build the pot. This is a straightforward, consistent line. Respect it unless you have a strong hand yourself.',
    xpValue: 10,
  },

  // Q12: STORY_CONSISTENT — Check-check-shove (easy)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 1,
    content: {
      line: 'Opponent checks the flop, checks the turn, then shoves all-in on the river.',
      question: 'Does this story make sense for a strong hand?',
      options: [
        'Suspicious - why wait until the river to bet everything?',
        'Yes - they were trapping the whole time',
        'Yes - the river must have completed their draw',
      ],
    },
    correctAnswer: 'Suspicious - why wait until the river to bet everything?',
    explanation:
      'Checking twice then shoving the river is an inconsistent story. Strong hands usually bet at least one earlier street to build the pot. This line is often a bluff or a weak hand desperately trying to win.',
    xpValue: 10,
  },

  // Q13: STORY_CONSISTENT — Min-bet on river (easy)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 1,
    content: {
      line: 'Opponent bets the minimum on the river into a large pot.',
      question: 'What does a min-bet on the river usually mean?',
      options: [
        'Weak hand wanting a cheap showdown',
        'Very strong hand trying to induce a raise',
        'A calculated bluff',
      ],
    },
    correctAnswer: 'Weak hand wanting a cheap showdown',
    explanation:
      'Min-bets into big pots are almost always weak. The player wants to "buy" a cheap showdown without committing serious chips. Strong hands bet bigger to extract value. This is one of the most reliable tells in poker.',
    xpValue: 10,
  },

  // Q14: STORY_CONSISTENT — Preflop raiser checks scary board (medium)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 2,
    content: {
      line: 'Opponent raises preflop, then checks a flop of 7-8-9 with two clubs.',
      question: 'What does this likely mean about their hand?',
      options: [
        'They probably have overcards (like AK or AQ) that missed this board',
        'They are slow-playing a set',
        'They always check when they hit the flop',
      ],
    },
    correctAnswer:
      'They probably have overcards (like AK or AQ) that missed this board',
    explanation:
      'When the preflop raiser checks a coordinated board, it usually means they missed. A flop like 7-8-9 with flush draws is dangerous, and big pairs or overcards often check to control the pot size.',
    xpValue: 15,
  },

  // Q15: STORY_CONSISTENT — Check-raise on flop (medium)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 2,
    content: {
      line: 'Opponent checks the flop, you bet, then they raise you.',
      question: 'What does a check-raise usually represent?',
      options: [
        'A very strong hand or a semi-bluff with a draw',
        'A weak hand trying to see a free card',
        'They accidentally clicked the wrong button',
      ],
    },
    correctAnswer: 'A very strong hand or a semi-bluff with a draw',
    explanation:
      'Check-raising is a polarized play. It typically means either a very strong hand (sets, two pair) looking to build the pot, or a semi-bluff with a big draw. It rarely represents a medium-strength hand.',
    xpValue: 15,
  },

  // Q16: STORY_CONSISTENT — Passive then suddenly aggressive (medium)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 2,
    content: {
      line: 'Opponent calls preflop, calls the flop bet, calls the turn bet, then raises the river.',
      question: 'A player who calls three streets then raises the river usually has:',
      options: [
        'A very strong hand they were slow-playing',
        'A bluff trying to steal at the last moment',
        'A medium-strength hand testing the waters',
      ],
    },
    correctAnswer: 'A very strong hand they were slow-playing',
    explanation:
      'When a passive player suddenly turns aggressive on the river, they almost always have a monster. They were calling to keep you betting, then raised for maximum value at the end. This is one of the strongest tells in poker.',
    xpValue: 15,
  },

  // Q17: STORY_CONSISTENT — Donk bet (medium)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 2,
    content: {
      situation:
        'You raised preflop and opponent called. On the flop, your opponent bets into you (a donk bet) instead of checking.',
      question: 'What does a donk bet usually indicate?',
      options: [
        'Often a weak or medium hand trying to take control',
        'Always a very strong hand',
        'Always a bluff',
      ],
    },
    correctAnswer: 'Often a weak or medium hand trying to take control',
    explanation:
      'A donk bet (leading into the preflop raiser) is usually a sign of a medium-strength hand. The player is "blocking" to prevent you from betting bigger. Strong hands typically check to the raiser to set up a check-raise.',
    xpValue: 15,
  },

  // Q18: STORY_CONSISTENT — Bet-bet-check (hard)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 3,
    content: {
      line: 'Opponent raises preflop, bets the flop, bets the turn, then checks the river on a blank card.',
      question: 'What does giving up on the river after betting two streets suggest?',
      options: [
        'They were likely bluffing or semi-bluffing and gave up',
        'They have a strong hand and are trapping',
        'They always check the river for pot control',
      ],
    },
    correctAnswer: 'They were likely bluffing or semi-bluffing and gave up',
    explanation:
      'A player with a real strong hand would keep betting the river for value. Betting two streets then checking the river often means they were on a draw that missed, or they were bluffing and lost their nerve. Consider betting here.',
    xpValue: 20,
  },

  // Q19: STORY_CONSISTENT — Overbet shove on river (hard)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 3,
    content: {
      line: 'On a board of K-Q-7-3-2 with no flush possible, opponent shoves 3x the pot on the river.',
      question: 'What does an overbet shove on a dry board usually mean?',
      options: [
        'Polarized - either a monster or a bluff, rarely in between',
        'Always the nuts - fold everything except the best hands',
        'Always a bluff - nobody overbets with real hands',
      ],
    },
    correctAnswer:
      'Polarized - either a monster or a bluff, rarely in between',
    explanation:
      'Massive overbets are polarized plays. The bettor either has the nuts and wants maximum value, or has nothing and wants maximum fold equity. Medium-strength hands bet smaller to get called. Use your reads to decide.',
    xpValue: 20,
  },

  // Q20: STORY_CONSISTENT — Inconsistent sizing (hard)
  {
    type: 'STORY_CONSISTENT',
    difficulty: 3,
    content: {
      line: 'Opponent bets small on the flop, small on the turn, then suddenly bets pot on the river.',
      question: 'What might the sudden increase in bet size on the river suggest?',
      options: [
        'They likely improved on the river or are bluffing with a large size',
        'They always save their big bets for the river',
        'The river card was irrelevant to their decision',
      ],
    },
    correctAnswer:
      'They likely improved on the river or are bluffing with a large size',
    explanation:
      'Inconsistent bet sizing is a major tell. Small-small-big usually means the river changed something. Either they made their hand (a completing draw) or they are bluffing because the river looks scary. Pay attention to what the river card was.',
    xpValue: 20,
  },

  // ============================================================
  // VALUE_OR_BLUFF — Is a bet for value or a bluff? (~8 questions)
  // ============================================================

  // Q21: VALUE_OR_BLUFF — Small river bet (easy)
  {
    type: 'VALUE_OR_BLUFF',
    difficulty: 1,
    content: {
      situation:
        'Opponent bets 1/3 pot on the river after betting flop and turn.',
      question: 'Is this small river bet more likely for value or a bluff?',
      options: [
        'Likely value - small bets want to get called',
        'Likely a bluff - they are trying to steal cheaply',
        'Cannot determine from bet size alone',
      ],
    },
    correctAnswer: 'Likely value - small bets want to get called',
    explanation:
      'Small river bets are usually value bets. The player wants to be called by worse hands. Bluffs generally use larger sizes to pressure opponents into folding. A small bet says "please call me."',
    xpValue: 10,
  },

  // Q22: VALUE_OR_BLUFF — Bet into multiple opponents (easy)
  {
    type: 'VALUE_OR_BLUFF',
    difficulty: 1,
    content: {
      situation:
        'With 3 players to the river, one player bets 3/4 pot.',
      question: 'Is betting into multiple opponents usually value or a bluff?',
      options: [
        'Usually value - too risky to bluff into multiple players',
        'Usually a bluff - they want everyone to fold',
        'Equally likely to be either',
      ],
    },
    correctAnswer: 'Usually value - too risky to bluff into multiple players',
    explanation:
      'Betting into multiple opponents is almost always for value. You need ALL opponents to fold for a bluff to work, and the more players there are, the less likely that happens. Multiway bets mean real hands.',
    xpValue: 10,
  },

  // Q23: VALUE_OR_BLUFF — Large overbet (medium)
  {
    type: 'VALUE_OR_BLUFF',
    difficulty: 2,
    content: {
      situation:
        'On the river, opponent bets 2x the pot. The board has a possible flush and straight.',
      question: 'What does an overbet on a wet river board usually mean?',
      options: [
        'Polarized - either the nuts or a bluff',
        'Always the nuts - they want to get paid off',
        'Always a bluff - value hands bet smaller',
      ],
    },
    correctAnswer: 'Polarized - either the nuts or a bluff',
    explanation:
      'Large overbets are "polarized" - they represent either the best possible hand or nothing. Medium-strength hands bet smaller to get called. Think about what hands make sense in their range before deciding.',
    xpValue: 15,
  },

  // Q24: VALUE_OR_BLUFF — Passive player suddenly bets big (medium)
  {
    type: 'VALUE_OR_BLUFF',
    difficulty: 2,
    content: {
      situation:
        'A passive player who has been checking and calling all game suddenly bets pot on the river when a flush completes.',
      question: 'Is this likely value or a bluff?',
      options: [
        'Likely value - passive players rarely bluff big',
        'Likely a bluff - they are using the scare card',
        'Could be either - need more information',
      ],
    },
    correctAnswer: 'Likely value - passive players rarely bluff big',
    explanation:
      'When passive players wake up with a big bet, believe them. They almost always have what they are representing. Passive players do not suddenly become aggressive without a real hand. This is one of the most reliable patterns.',
    xpValue: 15,
  },

  // Q25: VALUE_OR_BLUFF — Semi-bluff with a draw (medium)
  {
    type: 'VALUE_OR_BLUFF',
    difficulty: 2,
    content: {
      situation:
        'On the flop, you have a flush draw (9 outs). You bet 3/4 pot.',
      question: 'What type of bet is this?',
      options: [
        'Semi-bluff - you can win by folding opponents out or by hitting your draw',
        'Pure bluff - you have nothing right now',
        'Value bet - flush draws are strong hands',
      ],
    },
    correctAnswer:
      'Semi-bluff - you can win by folding opponents out or by hitting your draw',
    explanation:
      'A semi-bluff is a bet with a drawing hand. You have two ways to win: opponents fold now, or you improve to the best hand. Semi-bluffs are much better than pure bluffs because you have backup equity when called.',
    xpValue: 15,
  },

  // Q26: VALUE_OR_BLUFF — Check-raise on the river (hard)
  {
    type: 'VALUE_OR_BLUFF',
    difficulty: 3,
    content: {
      situation:
        'On the river, you bet and your opponent check-raises you. The board is K-J-8-4-2 rainbow.',
      question: 'Is a river check-raise on a dry board usually value or a bluff?',
      options: [
        'Usually a very strong hand - sets, two pair, or a slow-played monster',
        'Usually a bluff - they are trying to push you off your hand',
        'Equally likely to be either',
      ],
    },
    correctAnswer:
      'Usually a very strong hand - sets, two pair, or a slow-played monster',
    explanation:
      'River check-raises on dry boards are heavily weighted toward value. There are very few natural bluffs on a rainbow board with no draws. Most players only check-raise the river with hands they are confident are best.',
    xpValue: 20,
  },

  // Q27: VALUE_OR_BLUFF — Delayed c-bet (hard)
  {
    type: 'VALUE_OR_BLUFF',
    difficulty: 3,
    content: {
      situation:
        'Opponent raised preflop, checked the flop on a board of Q-7-2, then bets 2/3 pot on the turn when a King appears.',
      question: 'Is this delayed bet more likely for value or a bluff?',
      options: [
        'Could be either - they might have AK that improved or a missed hand using the scare card',
        'Definitely value - they hit the King',
        'Definitely a bluff - real hands bet the flop',
      ],
    },
    correctAnswer:
      'Could be either - they might have AK that improved or a missed hand using the scare card',
    explanation:
      'A delayed c-bet (checking flop, betting turn) is ambiguous. AK would check the flop and bet when the King arrives. But hands like AJ or A10 might use the King as a scare card to bluff. This is a tough spot that requires reading the full story.',
    xpValue: 20,
  },

  // Q28: VALUE_OR_BLUFF — Probe bet (hard)
  {
    type: 'VALUE_OR_BLUFF',
    difficulty: 3,
    content: {
      situation:
        'The preflop raiser checks the flop. You bet the turn and they call. On the river, they lead out with a half-pot bet.',
      question:
        'When the preflop raiser suddenly leads the river after being passive, what does it usually mean?',
      options: [
        'Usually value - they connected and are now comfortable betting',
        'Usually a bluff - they want to take back control',
        'It means nothing - random bet',
      ],
    },
    correctAnswer:
      'Usually value - they connected and are now comfortable betting',
    explanation:
      'When a player who could have continuation bet the flop chooses to check, then suddenly leads the river, they usually hit something. The river card likely improved their hand, and now they are betting for value. Be cautious.',
    xpValue: 20,
  },

  // ============================================================
  // BLUFF_FREQUENCY — How often to bluff, balance concepts (~7 questions)
  // ============================================================

  // Q29: BLUFF_FREQUENCY — Beginner bluff rate (easy)
  {
    type: 'BLUFF_FREQUENCY',
    difficulty: 1,
    content: {
      question: 'As a beginner, how often should you be bluffing?',
      options: [
        'Rarely - focus mostly on betting for value',
        'About half the time - keep opponents guessing',
        'Never - bluffing is too risky for beginners',
      ],
    },
    correctAnswer: 'Rarely - focus mostly on betting for value',
    explanation:
      'Beginners should bluff sparingly. Most of your profit comes from value betting (betting with good hands and getting called by worse). As you improve, you can add more bluffs to your game.',
    xpValue: 10,
  },

  // Q30: BLUFF_FREQUENCY — Semi-bluff vs pure bluff (easy)
  {
    type: 'BLUFF_FREQUENCY',
    difficulty: 1,
    content: {
      question: 'Which type of bluff is better to use when you are learning?',
      options: [
        'Semi-bluffs with drawing hands - you have backup if called',
        'Pure bluffs with nothing - maximum pressure',
        'Both are equally effective',
      ],
    },
    correctAnswer: 'Semi-bluffs with drawing hands - you have backup if called',
    explanation:
      'Semi-bluffs (bluffing with a draw like a flush draw or straight draw) are safer than pure bluffs. If your opponent calls, you still have outs to improve. Pure bluffs with no equity are riskier and should be used less often.',
    xpValue: 10,
  },

  // Q31: BLUFF_FREQUENCY — River bluff ratio (medium)
  {
    type: 'BLUFF_FREQUENCY',
    difficulty: 2,
    content: {
      question:
        'In balanced play, roughly how many bluffs should you have for every 2 value bets on the river?',
      options: [
        'About 1 bluff per 2 value bets',
        'Equal number of bluffs and value bets',
        'About 3 bluffs per 2 value bets',
      ],
    },
    correctAnswer: 'About 1 bluff per 2 value bets',
    explanation:
      'In game-theory-optimal (GTO) play, you want roughly 1 bluff for every 2 value bets on the river. This makes your opponent indifferent between calling and folding. You do not need to be exact - just understand that value bets should outnumber bluffs.',
    xpValue: 15,
  },

  // Q32: BLUFF_FREQUENCY — Best hands to bluff with (medium)
  {
    type: 'BLUFF_FREQUENCY',
    difficulty: 2,
    content: {
      question: 'When choosing which hands to bluff with, which is the best choice?',
      options: [
        'Hands just below your value range that have blockers to strong hands',
        'Your absolute worst hands with no equity at all',
        'Your medium-strength hands that could win at showdown',
      ],
    },
    correctAnswer:
      'Hands just below your value range that have blockers to strong hands',
    explanation:
      'The best bluffs are hands that block your opponent from having strong holdings. For example, having the Ace of hearts when a flush is possible blocks the nut flush. Also, avoid bluffing with medium hands that have showdown value - those should just check.',
    xpValue: 15,
  },

  // Q33: BLUFF_FREQUENCY — Adjusting bluff frequency (medium)
  {
    type: 'BLUFF_FREQUENCY',
    difficulty: 2,
    content: {
      situation:
        'You notice your opponent folds to river bets about 70% of the time.',
      question: 'How should you adjust your bluffing frequency?',
      options: [
        'Bluff more often - they are folding too much',
        'Bluff less often - they might be trapping',
        'Keep your frequency the same - stay balanced',
      ],
    },
    correctAnswer: 'Bluff more often - they are folding too much',
    explanation:
      'If an opponent folds too often, bluffing becomes very profitable. You exploit them by bluffing more. Against players who call too much, you bluff less and value bet more. Adjusting to your opponent is a key skill.',
    xpValue: 15,
  },

  // Q34: BLUFF_FREQUENCY — Board texture and bluff frequency (hard)
  {
    type: 'BLUFF_FREQUENCY',
    difficulty: 3,
    content: {
      question:
        'On which type of board should you bluff more frequently as the preflop raiser?',
      options: [
        'Dry boards (like K-7-2 rainbow) that favor your raising range',
        'Wet boards (like J-10-9 with two hearts) with many draws',
        'Paired boards (like 8-8-3) where trips are unlikely',
      ],
    },
    correctAnswer:
      'Dry boards (like K-7-2 rainbow) that favor your raising range',
    explanation:
      'Dry boards with high cards favor the preflop raiser. Your opponents expect you to have big cards, so your bluffs are more credible. On wet boards with many draws, opponents are more likely to have connected and will call more often.',
    xpValue: 20,
  },

  // Q35: BLUFF_FREQUENCY — Multi-street bluff planning (hard)
  {
    type: 'BLUFF_FREQUENCY',
    difficulty: 3,
    content: {
      situation:
        'You bluffed the flop with a flush draw. The turn is a blank. You are deciding whether to keep bluffing.',
      question: 'What is the key consideration for continuing a multi-street bluff?',
      options: [
        'Whether your story is still credible and you have enough equity or fold equity',
        'Whether you have already invested too much to stop now',
        'Always fire a second barrel when the first one did not work',
      ],
    },
    correctAnswer:
      'Whether your story is still credible and you have enough equity or fold equity',
    explanation:
      'Multi-street bluffs need a plan. Ask: does my story still make sense? Do I have equity if called? Will my opponent fold often enough? Do not just keep betting because you started - that is how you lose big pots. Each street is a new decision.',
    xpValue: 20,
  },
];
