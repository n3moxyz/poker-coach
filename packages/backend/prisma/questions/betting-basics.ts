export const bettingBasicsQuestions = [
  // ============================================================
  // BET_INTENT - Why to bet (12 questions)
  // ============================================================

  // Easy (3)
  {
    type: 'BET_INTENT',
    difficulty: 1,
    content: {
      situation: 'You have top pair with the best kicker on a dry flop. Opponent checks to you.',
      question: 'Why should you bet here?',
      options: ['For value - to get called by worse hands', 'To bluff - to make better hands fold', 'To see a free card'],
    },
    correctAnswer: 'For value - to get called by worse hands',
    explanation: 'With top pair, top kicker on a dry board, you have a strong hand. You bet for value because weaker hands like second pair or middle pair may call you.',
    xpValue: 10,
  },
  {
    type: 'BET_INTENT',
    difficulty: 1,
    content: {
      situation: 'You completely missed the flop with Ace-high. The board is K-7-2 rainbow.',
      question: 'If you bet here, what is the reason?',
      options: ['Bluff - to make opponents fold better hands', 'Value - Ace-high is strong', 'Protection - to deny draws'],
    },
    correctAnswer: 'Bluff - to make opponents fold better hands',
    explanation: 'With no pair and just Ace-high, your hand is weak. Betting is a bluff, hoping opponents with small pairs or missed hands will fold.',
    xpValue: 10,
  },
  {
    type: 'BET_INTENT',
    difficulty: 1,
    content: {
      situation: 'You check, opponent bets, and you raise with a strong hand.',
      question: 'What is a check-raise typically used for?',
      options: ['To build the pot with a strong hand or as a bluff', 'To slow down the action', 'To get a free card on the next street'],
    },
    correctAnswer: 'To build the pot with a strong hand or as a bluff',
    explanation: 'A check-raise is a powerful move. You check to let your opponent bet, then raise. It builds a bigger pot when you have a strong hand or represents strength as a bluff.',
    xpValue: 10,
  },

  // Medium (5)
  {
    type: 'BET_INTENT',
    difficulty: 2,
    content: {
      situation: 'You have a medium pair on a board with flush and straight draws possible. Opponent checks to you.',
      question: 'Why should you bet?',
      options: ['Protection - make opponents pay to chase draws', 'Pure bluff - your hand is weak', 'To see where you stand'],
    },
    correctAnswer: 'Protection - make opponents pay to chase draws',
    explanation: 'With a vulnerable made hand on a draw-heavy board, you bet for protection. This forces opponents to pay if they want to chase their draws instead of seeing free cards.',
    xpValue: 15,
  },
  {
    type: 'BET_INTENT',
    difficulty: 2,
    content: {
      situation: 'You raised preflop and got one caller. The flop comes A-K-Q. You have pocket 7s.',
      question: 'You bet the flop. What kind of bet is this?',
      options: ['A continuation bet (c-bet) as a bluff', 'A value bet with a strong pair', 'A protection bet against draws'],
    },
    correctAnswer: 'A continuation bet (c-bet) as a bluff',
    explanation: 'A continuation bet is when you bet the flop after raising preflop. On A-K-Q, your 77 is weak, but as the preflop raiser, this board "hits your range" and opponents expect you to have big cards.',
    xpValue: 15,
  },
  {
    type: 'BET_INTENT',
    difficulty: 2,
    content: {
      situation: 'The river comes and no draws completed. You have top two pair.',
      question: 'You bet big on the river. This bet is primarily for...',
      options: ['Value - to extract chips from worse hands', 'Bluff - to make better hands fold', 'Information - to see what opponent does'],
    },
    correctAnswer: 'Value - to extract chips from worse hands',
    explanation: 'On the river with a strong made hand and no scary cards, you bet for value. The goal is to get called by hands like one pair or weaker two pair.',
    xpValue: 15,
  },
  {
    type: 'BET_INTENT',
    difficulty: 2,
    content: {
      situation: 'You have the nut flush draw on the flop. Instead of just calling, you raise.',
      question: 'This play is called a...',
      options: ['Semi-bluff', 'Pure value raise', 'Blocking bet'],
    },
    correctAnswer: 'Semi-bluff',
    explanation: 'A semi-bluff is when you bet or raise with a drawing hand that can improve. You can win immediately if opponents fold, or hit your flush if they call.',
    xpValue: 15,
  },
  {
    type: 'BET_INTENT',
    difficulty: 2,
    content: {
      situation: 'You raised preflop from the button and got called by the big blind. The flop comes 8-5-2 rainbow.',
      question: 'You bet 60% of the pot. Why?',
      options: ['C-bet - this dry board favors the preflop raiser', 'You must always bet when you raised preflop', 'To find out if they have a pair'],
    },
    correctAnswer: 'C-bet - this dry board favors the preflop raiser',
    explanation: 'Dry, low boards like 8-5-2 favor the preflop raiser because your range has more overpairs (99-AA) and overcards. A continuation bet applies pressure and often wins the pot right away.',
    xpValue: 15,
  },

  // Hard (4)
  {
    type: 'BET_INTENT',
    difficulty: 3,
    content: {
      situation: 'Out of position on the river, you make a small bet of 25% pot with a medium-strength hand.',
      question: 'This is called a...',
      options: ['Blocking bet - to prevent a larger bet from your opponent', 'Value bet - to extract maximum value', 'Bluff - to make them fold'],
    },
    correctAnswer: 'Blocking bet - to prevent a larger bet from your opponent',
    explanation: 'A blocking bet is a small bet designed to control the pot size. By betting small, you discourage your opponent from making a larger bet that would put you in a tough spot.',
    xpValue: 20,
  },
  {
    type: 'BET_INTENT',
    difficulty: 3,
    content: {
      situation: 'You have a gutshot straight draw and a backdoor flush draw on the flop. Opponent checks to you.',
      question: 'Is betting here reasonable?',
      options: ['Yes - semi-bluff with equity and fold equity', 'No - you should only bet with made hands', 'No - you need at least 9 outs to bet'],
    },
    correctAnswer: 'Yes - semi-bluff with equity and fold equity',
    explanation: 'Even with a modest draw, betting can be profitable. You combine fold equity (opponent might fold) with your draw equity. This is a semi-bluff and a key skill in poker.',
    xpValue: 20,
  },
  {
    type: 'BET_INTENT',
    difficulty: 3,
    content: {
      situation: 'You have the second-best possible hand. The board shows four to a flush but you hold the nut flush blocker.',
      question: 'What should you consider about checking here?',
      options: ['Checking is fine - you can call a bet or check-raise', 'You must always bet strong hands', 'Checking is only for weak hands'],
    },
    correctAnswer: 'Checking is fine - you can call a bet or check-raise',
    explanation: 'Not every strong hand needs to bet. Sometimes checking lets your opponent bluff into you or bet worse hands for value. The key principle: every bet should have a clear reason.',
    xpValue: 20,
  },
  {
    type: 'BET_INTENT',
    difficulty: 3,
    content: {
      situation: 'On the river, you have complete air (no pair, no draw). The board is scary with three to a straight and three to a flush.',
      question: 'If you bet big here, what makes this bluff more likely to work?',
      options: ['The scary board gives you a credible story', 'Bigger bets always work as bluffs', 'Bluffs work best on dry boards'],
    },
    correctAnswer: 'The scary board gives you a credible story',
    explanation: 'Bluffs work best when your betting line tells a believable story. A scary board with completed draws makes it credible that you have a flush or straight, giving your opponent a reason to fold.',
    xpValue: 20,
  },

  // ============================================================
  // BET_RESPONSE - How to respond to bets (12 questions)
  // ============================================================

  // Easy (4)
  {
    type: 'BET_RESPONSE',
    difficulty: 1,
    content: {
      situation: 'You have a weak hand with no draw potential. Opponent makes a large bet.',
      question: 'What should you typically do?',
      options: ['Fold - you have no equity', 'Call to see what happens next', 'Raise as a bluff'],
    },
    correctAnswer: 'Fold - you have no equity',
    explanation: 'With a weak hand and no chance to improve, folding to a large bet is correct. Calling without equity is just throwing money away over time.',
    xpValue: 10,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 1,
    content: {
      situation: 'You have a set (three of a kind) on the flop. Opponent bets half the pot.',
      question: 'What is the best response?',
      options: ['Raise for value - you have a very strong hand', 'Fold - the bet means they have something', 'Just call and hope for the best'],
    },
    correctAnswer: 'Raise for value - you have a very strong hand',
    explanation: 'A set is one of the strongest hands on the flop. You should raise to build the pot while your hand is likely best. Letting opponents draw cheaply is a mistake.',
    xpValue: 10,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 1,
    content: {
      situation: 'Opponent bets and you have a flush draw with 9 outs.',
      question: 'What factor determines if you should call?',
      options: ['Pot odds - is the price right for your draw?', 'Always call with any draw', 'Always fold if you do not have a made hand'],
    },
    correctAnswer: 'Pot odds - is the price right for your draw?',
    explanation: 'When you have a draw, compare the pot odds to your chance of hitting. If the pot offers you better odds than your draw probability, calling is mathematically correct.',
    xpValue: 10,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 1,
    content: {
      situation: 'On the river, you have middle pair. Opponent bets the full pot.',
      question: 'What should you usually do?',
      options: ['Fold - a pot-sized bet usually means a strong hand', 'Call - middle pair is decent', 'Raise to find out where you stand'],
    },
    correctAnswer: 'Fold - a pot-sized bet usually means a strong hand',
    explanation: 'Large river bets are weighted toward strong hands. Middle pair is too weak to call a pot-sized bet. Save your chips for better spots.',
    xpValue: 10,
  },

  // Medium (5)
  {
    type: 'BET_RESPONSE',
    difficulty: 2,
    content: {
      situation: 'You have top pair. Opponent bets the flop and you call. On the turn, opponent bets again, bigger this time.',
      question: 'What does their continued aggression likely mean?',
      options: ['They have a strong hand or a big draw', 'They are always bluffing', 'They want to see a free river card'],
    },
    correctAnswer: 'They have a strong hand or a big draw',
    explanation: 'Betting on multiple streets (double-barreling) usually represents real strength or a strong draw. With just top pair, be cautious about continuing.',
    xpValue: 15,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 2,
    content: {
      situation: 'You flop a full house. Opponent bets into you.',
      question: 'What is the best play?',
      options: ['Just call to trap them into betting more on later streets', 'Raise immediately to build the pot', 'Fold to disguise your hand'],
    },
    correctAnswer: 'Just call to trap them into betting more on later streets',
    explanation: 'With a monster hand like a full house, flat-calling (slow-playing) can be best. It keeps weaker hands in the pot and lets your opponent keep betting into you.',
    xpValue: 15,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 2,
    content: {
      situation: 'Opponent raises your bet on the flop. You have top pair, good kicker.',
      question: 'What does a raise of your bet usually mean?',
      options: ['Very strong hand or a bluff - their range is polarized', 'They are confused about what to do', 'They want information about your hand'],
    },
    correctAnswer: 'Very strong hand or a bluff - their range is polarized',
    explanation: 'A raise typically polarizes a player\'s range: they either have a strong hand (two pair+, set) or are bluffing. Against most players at low stakes, raises lean toward real strength.',
    xpValue: 15,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 2,
    content: {
      situation: 'You opened from middle position. The cutoff raises you (3-bets). You have Ace-Jack offsuit.',
      question: 'What should you do facing the 3-bet?',
      options: ['Fold - AJo is not strong enough vs a 3-bet', 'Call and see a flop', 'Re-raise (4-bet) aggressively'],
    },
    correctAnswer: 'Fold - AJo is not strong enough vs a 3-bet',
    explanation: 'Ace-Jack offsuit is a marginal hand facing a 3-bet. You are often dominated by AK and AQ. Folding saves you from playing a tough hand out of position or dominated.',
    xpValue: 15,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 2,
    content: {
      situation: 'You have a flush draw on the flop. Opponent bets small, about one-third of the pot.',
      question: 'Is this a good spot to call?',
      options: ['Yes - the small bet gives you great pot odds for your draw', 'No - you should only call with a made hand', 'No - fold all draws on the flop'],
    },
    correctAnswer: 'Yes - the small bet gives you great pot odds for your draw',
    explanation: 'A one-third pot bet means you need about 20% equity to call. A flush draw has roughly 35% equity with two cards to come, so calling is very profitable.',
    xpValue: 15,
  },

  // Hard (3)
  {
    type: 'BET_RESPONSE',
    difficulty: 3,
    content: {
      situation: 'Opponent check-raises you on a wet flop. You have an overpair (pocket Queens on a J-8-6 two-tone board).',
      question: 'What is the best response?',
      options: ['Call and re-evaluate on the turn', 'Fold immediately - check-raises are always strong', 'Re-raise all-in right away'],
    },
    correctAnswer: 'Call and re-evaluate on the turn',
    explanation: 'An overpair is strong but not invincible. Calling the check-raise keeps you in the hand while controlling the pot. If a scary card comes on the turn, you can reconsider.',
    xpValue: 20,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 3,
    content: {
      situation: 'You opened with Ace-King suited. Opponent 3-bets you to 3x your raise.',
      question: 'What is usually the best response with AKs vs a 3-bet?',
      options: ['4-bet or call - AKs is strong enough to continue', 'Always fold - respect the 3-bet', 'Just call and never 4-bet'],
    },
    correctAnswer: '4-bet or call - AKs is strong enough to continue',
    explanation: 'Ace-King suited is a premium hand. Against most 3-bets, you should either 4-bet for value or call to see a flop with a hand that has excellent playability.',
    xpValue: 20,
  },
  {
    type: 'BET_RESPONSE',
    difficulty: 3,
    content: {
      situation: 'A tight, passive opponent who rarely bets suddenly raises your river bet. You have top pair.',
      question: 'What should you do?',
      options: ['Fold - tight players rarely bluff river raises', 'Call - top pair is too strong to fold', 'Re-raise to find out if they are bluffing'],
    },
    correctAnswer: 'Fold - tight players rarely bluff river raises',
    explanation: 'When a tight, passive player raises on the river, they almost always have a very strong hand. Top pair is not strong enough to call. Adjust to your opponent\'s tendencies.',
    xpValue: 20,
  },

  // ============================================================
  // BET_SIZE - Appropriate bet sizing (11 questions)
  // ============================================================

  // Easy (3)
  {
    type: 'BET_SIZE',
    difficulty: 1,
    content: {
      question: 'What is a standard continuation bet (c-bet) size on the flop?',
      options: ['50-75% of the pot', '10% of the pot', '200% of the pot'],
    },
    correctAnswer: '50-75% of the pot',
    explanation: 'A standard c-bet is 50-75% of the pot. This size applies pressure on opponents while risking a reasonable amount. Too small and they always call; too big and you risk too much on a bluff.',
    xpValue: 10,
  },
  {
    type: 'BET_SIZE',
    difficulty: 1,
    content: {
      question: 'If the pot is $20, which is a reasonable bet size?',
      options: ['$10 to $15', '$1 to $2', '$50 to $60'],
    },
    correctAnswer: '$10 to $15',
    explanation: 'A bet of $10-$15 is 50-75% of the $20 pot, which is a standard and effective size for most situations. It gives opponents bad odds to chase draws while building the pot.',
    xpValue: 10,
  },
  {
    type: 'BET_SIZE',
    difficulty: 1,
    content: {
      question: 'What does "pot-sized bet" mean?',
      options: ['Betting an amount equal to the current pot', 'Betting your entire stack', 'Betting the minimum allowed'],
    },
    correctAnswer: 'Betting an amount equal to the current pot',
    explanation: 'A pot-sized bet means betting the same amount that is already in the pot. If the pot is $50, a pot-sized bet is $50. This is a large bet that puts maximum pressure on opponents.',
    xpValue: 10,
  },

  // Medium (5)
  {
    type: 'BET_SIZE',
    difficulty: 2,
    content: {
      situation: 'You want to value bet the river. The board is dry with no draws completed.',
      question: 'Should you bet bigger or smaller on a dry board?',
      options: ['Smaller - opponents have weaker hands on dry boards', 'Bigger - always bet big for value', 'It does not matter what size you use'],
    },
    correctAnswer: 'Smaller - opponents have weaker hands on dry boards',
    explanation: 'On dry boards, opponents tend to have weaker holdings. A smaller bet (30-50% pot) is more likely to get called by those weaker hands, extracting more value over time.',
    xpValue: 15,
  },
  {
    type: 'BET_SIZE',
    difficulty: 2,
    content: {
      situation: 'You want to value bet the river. The board is wet with a completed flush draw.',
      question: 'Should you bet bigger or smaller on a wet board?',
      options: ['Bigger - opponents have stronger hands and draws hit', 'Smaller - always bet small on scary boards', 'Do not bet on wet boards'],
    },
    correctAnswer: 'Bigger - opponents have stronger hands and draws hit',
    explanation: 'On wet boards where draws completed, opponents who stayed in likely have strong hands. You can bet bigger (65-100% pot) for value because they are more likely to call with their strong holdings.',
    xpValue: 15,
  },
  {
    type: 'BET_SIZE',
    difficulty: 2,
    content: {
      question: 'What is a typical 3-bet size when someone raises before you?',
      options: ['About 3x the original raise', 'The minimum allowed raise', 'Always go all-in'],
    },
    correctAnswer: 'About 3x the original raise',
    explanation: 'A standard 3-bet is about 3 times the original raise. If they raise to $6, a 3-bet to about $18 is typical. Slightly larger when out of position.',
    xpValue: 15,
  },
  {
    type: 'BET_SIZE',
    difficulty: 2,
    content: {
      situation: 'You are bluffing on the river. The pot is $100.',
      question: 'What is the minimum bet size that gives your bluff a reasonable chance of working?',
      options: ['About 50-66% pot ($50-$66)', 'A tiny bet of $5-$10', 'You must always go all-in to bluff'],
    },
    correctAnswer: 'About 50-66% pot ($50-$66)',
    explanation: 'Bluffs need to be large enough that opponents feel real pressure to fold. A bet of 50-66% pot threatens enough of their stack to make them consider folding. Tiny bets are too easy to call.',
    xpValue: 15,
  },
  {
    type: 'BET_SIZE',
    difficulty: 2,
    content: {
      question: 'Your opponent bets $30 into a $60 pot. What pot odds are they giving you?',
      options: ['3:1 (you risk $30 to win $90)', '2:1 (you risk $30 to win $60)', '1:1 (you risk $30 to win $30)'],
    },
    correctAnswer: '3:1 (you risk $30 to win $90)',
    explanation: 'Pot odds = (pot + bet) : your call = ($60 + $30) : $30 = $90 : $30 = 3:1. You risk $30 for a total pot of $120. The smaller the bet relative to the pot, the better odds you get.',
    xpValue: 15,
  },

  // Hard (3)
  {
    type: 'BET_SIZE',
    difficulty: 3,
    content: {
      situation: 'You have the absolute nuts on the river. Your opponent has a large stack.',
      question: 'When might an over-bet (larger than pot) be the right size?',
      options: ['When you have a polarized range and your opponent has a strong hand to call with', 'Over-bets are never correct', 'Only when you are bluffing'],
    },
    correctAnswer: 'When you have a polarized range and your opponent has a strong hand to call with',
    explanation: 'Over-bets work when your range is polarized (very strong or bluff) and your opponent has hands strong enough to call big bets. If they have a second-best hand, they may pay off a larger bet.',
    xpValue: 20,
  },
  {
    type: 'BET_SIZE',
    difficulty: 3,
    content: {
      situation: 'You have 15 big blinds left in a tournament. You pick up a good hand preflop.',
      question: 'What is the best play?',
      options: ['Shove all-in - at this stack depth, all-in is the correct size', 'Raise to 2.5x and play postflop', 'Limp in and see a cheap flop'],
    },
    correctAnswer: 'Shove all-in - at this stack depth, all-in is the correct size',
    explanation: 'With a short stack of 15 big blinds, raising small leaves too much of your stack behind. Going all-in maximizes fold equity and avoids tough postflop decisions with a shallow stack.',
    xpValue: 20,
  },
  {
    type: 'BET_SIZE',
    difficulty: 3,
    content: {
      situation: 'You are the preflop raiser in a $1/$2 game. Three players have limped in before you.',
      question: 'What is a good raise size?',
      options: ['$12-$14 (base raise + extra per limper)', '$4-$6 (standard 2-3x)', '$2 (minimum raise)'],
    },
    correctAnswer: '$12-$14 (base raise + extra per limper)',
    explanation: 'The standard formula is your base raise (e.g., $8 = 4x BB) plus one big blind per limper. With 3 limpers: $8 + $6 = $14. This punishes loose limpers and thins the field.',
    xpValue: 20,
  },
];
