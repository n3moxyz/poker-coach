export const positionQuestions = [
  // ============================================================
  // POSITION_ID (8 questions) - Identify position names and abbreviations
  // ============================================================

  // 1 - Easy
  {
    type: 'POSITION_ID',
    difficulty: 1,
    content: {
      question: 'What does the abbreviation "BTN" stand for in poker?',
      options: ['Button', 'Big Blind', 'Bet Now'],
    },
    correctAnswer: 'Button',
    explanation:
      'BTN stands for Button, also known as the dealer position. The Button is the most profitable seat because you act last on every post-flop street.',
    xpValue: 10,
  },
  // 2 - Easy
  {
    type: 'POSITION_ID',
    difficulty: 1,
    content: {
      position: 'SB',
      question: 'What does SB stand for?',
      options: [
        'Small Blind',
        'Side Bet',
        'Second Button',
      ],
    },
    correctAnswer: 'Small Blind',
    explanation:
      'SB stands for Small Blind. This player sits directly left of the Button and posts a forced bet equal to half the big blind before cards are dealt.',
    xpValue: 10,
  },
  // 3 - Easy
  {
    type: 'POSITION_ID',
    difficulty: 1,
    content: {
      position: 'BB',
      question: 'What does BB stand for?',
      options: [
        'Big Blind',
        'Big Bet',
        'Back Button',
      ],
    },
    correctAnswer: 'Big Blind',
    explanation:
      'BB stands for Big Blind. This player sits left of the Small Blind and posts the full forced bet. The big blind sets the minimum bet size for the hand.',
    xpValue: 10,
  },
  // 4 - Easy
  {
    type: 'POSITION_ID',
    difficulty: 1,
    content: {
      position: 'UTG',
      question: 'What does UTG stand for?',
      options: [
        'Under the Gun',
        'Upper Table Group',
        'Until the Game',
      ],
    },
    correctAnswer: 'Under the Gun',
    explanation:
      'UTG stands for Under the Gun. This is the player directly left of the Big Blind who acts first before the flop. The name reflects the pressure of acting first with no information.',
    xpValue: 10,
  },
  // 5 - Easy
  {
    type: 'POSITION_ID',
    difficulty: 1,
    content: {
      position: 'CO',
      question: 'What does CO stand for?',
      options: [
        'Cutoff',
        'Call Option',
        'Check Out',
      ],
    },
    correctAnswer: 'Cutoff',
    explanation:
      'CO stands for Cutoff. This player sits directly to the right of the Button. The name comes from their ability to "cut off" the Button from stealing the blinds by raising first.',
    xpValue: 10,
  },
  // 6 - Easy
  {
    type: 'POSITION_ID',
    difficulty: 1,
    content: {
      position: 'MP',
      question: 'What does MP stand for?',
      options: [
        'Middle Position',
        'Main Player',
        'Maximum Pot',
      ],
    },
    correctAnswer: 'Middle Position',
    explanation:
      'MP stands for Middle Position. These seats are between early position (UTG) and late position (CO, BTN). Middle position players have some information but still face several opponents behind them.',
    xpValue: 10,
  },
  // 7 - Easy
  {
    type: 'POSITION_ID',
    difficulty: 1,
    content: {
      position: 'HJ',
      question: 'What does HJ stand for in a 9-max game?',
      options: [
        'Hijack',
        'High Jack',
        'Half Join',
      ],
    },
    correctAnswer: 'Hijack',
    explanation:
      'HJ stands for Hijack, the seat to the right of the Cutoff in 9-max games. Like the Cutoff, it can "hijack" the steal attempt from later positions by raising first.',
    xpValue: 10,
  },
  // 8 - Easy
  {
    type: 'POSITION_ID',
    difficulty: 1,
    content: {
      question: 'Which positions are collectively called "the blinds"?',
      options: [
        'Small Blind and Big Blind',
        'UTG and MP',
        'Cutoff and Button',
      ],
    },
    correctAnswer: 'Small Blind and Big Blind',
    explanation:
      'The blinds refer to the Small Blind (SB) and Big Blind (BB). These two positions must post forced bets before seeing their cards, which is why they are called "blind" bets.',
    xpValue: 10,
  },

  // ============================================================
  // POSITION_ADVANTAGE (8 questions) - Why certain positions are better
  // ============================================================

  // 9 - Easy
  {
    type: 'POSITION_ADVANTAGE',
    difficulty: 1,
    content: {
      question: 'Why is acting last considered an advantage in poker?',
      options: [
        'You see what everyone else does first',
        'You get better cards',
        'You pay smaller blinds',
      ],
    },
    correctAnswer: 'You see what everyone else does first',
    explanation:
      'Acting last lets you see every other player check, bet, or raise before you decide. This information advantage helps you make better decisions and is the core reason position matters.',
    xpValue: 10,
  },
  // 10 - Easy
  {
    type: 'POSITION_ADVANTAGE',
    difficulty: 1,
    content: {
      question: 'Which single position is generally considered the best at the table?',
      options: [
        'Button (BTN)',
        'Big Blind (BB)',
        'Under the Gun (UTG)',
      ],
    },
    correctAnswer: 'Button (BTN)',
    explanation:
      'The Button is the best position because you act last on every post-flop street (flop, turn, and river). This gives you maximum information before every decision.',
    xpValue: 10,
  },
  // 11 - Medium
  {
    type: 'POSITION_ADVANTAGE',
    difficulty: 2,
    content: {
      question: 'Which position is the worst for post-flop play?',
      options: [
        'Small Blind (SB)',
        'Button (BTN)',
        'Cutoff (CO)',
      ],
    },
    correctAnswer: 'Small Blind (SB)',
    explanation:
      'The Small Blind acts first on every post-flop street, meaning every other player gets to react to your action. Combined with the forced blind bet, SB is the least profitable seat.',
    xpValue: 15,
  },
  // 12 - Medium
  {
    type: 'POSITION_ADVANTAGE',
    difficulty: 2,
    content: {
      question: 'Why is UTG considered the worst preflop position?',
      options: [
        'You act first with the most players left behind you',
        'You have to post a blind',
        'You get fewer cards to choose from',
      ],
    },
    correctAnswer: 'You act first with the most players left behind you',
    explanation:
      'UTG acts first preflop with every other player still to act. The more players behind you, the higher the chance someone has a strong hand, so you need a stronger hand to play.',
    xpValue: 15,
  },
  // 13 - Medium
  {
    type: 'POSITION_ADVANTAGE',
    difficulty: 2,
    content: {
      question: 'What advantage does the Big Blind have preflop that no other position has?',
      options: [
        'Already has money invested and acts last preflop',
        'Gets to see extra cards',
        'Can choose the flop cards',
      ],
    },
    correctAnswer: 'Already has money invested and acts last preflop',
    explanation:
      'The Big Blind acts last preflop and already has a full blind invested. This means they close the action and get a discount to see flops, making it correct to defend with many hands.',
    xpValue: 15,
  },
  // 14 - Medium
  {
    type: 'POSITION_ADVANTAGE',
    difficulty: 2,
    content: {
      question: 'Why is the Cutoff considered the second-best position?',
      options: [
        'Only the Button acts after you post-flop',
        'You can see the flop for free',
        'You post a smaller blind than SB',
      ],
    },
    correctAnswer: 'Only the Button acts after you post-flop',
    explanation:
      'In the Cutoff, only the Button has position on you after the flop. If the Button folds preflop, you effectively become the Button for that hand and act last on all streets.',
    xpValue: 15,
  },
  // 15 - Hard
  {
    type: 'POSITION_ADVANTAGE',
    difficulty: 3,
    content: {
      question: 'What is "positional advantage" most useful for?',
      options: [
        'Controlling pot size and extracting value',
        'Getting dealt better starting hands',
        'Avoiding paying blinds',
      ],
    },
    correctAnswer: 'Controlling pot size and extracting value',
    explanation:
      'Position lets you control the pot. With a strong hand, you can build the pot. With a marginal hand, you can keep it small. With nothing, you can take a free card. This flexibility is what makes position so powerful.',
    xpValue: 20,
  },
  // 16 - Hard
  {
    type: 'POSITION_ADVANTAGE',
    difficulty: 3,
    content: {
      question: 'In a heads-up pot, you have position on your opponent. They check the flop. What can you do that they cannot?',
      options: [
        'Bet or check behind to see a free card',
        'Look at the turn card before deciding',
        'Change your hole cards',
      ],
    },
    correctAnswer: 'Bet or check behind to see a free card',
    explanation:
      'When your opponent checks and you are last to act, you can bet for value or as a bluff, or you can check behind to see the next card for free. The out-of-position player cannot take a free card when they check because you might still bet.',
    xpValue: 20,
  },

  // ============================================================
  // POSITION_ORDER (8 questions) - Order of positions, acting order
  // ============================================================

  // 17 - Easy
  {
    type: 'POSITION_ORDER',
    difficulty: 1,
    content: {
      question: 'In what order do positions act preflop?',
      options: [
        'UTG, MP, HJ, CO, BTN, SB, BB',
        'SB, BB, UTG, MP, HJ, CO, BTN',
        'BTN, SB, BB, UTG, MP, HJ, CO',
      ],
    },
    correctAnswer: 'UTG, MP, HJ, CO, BTN, SB, BB',
    explanation:
      'Preflop, action starts with UTG (left of the Big Blind) and moves clockwise around the table. The blinds act last preflop because they already have forced money in.',
    xpValue: 10,
  },
  // 18 - Easy
  {
    type: 'POSITION_ORDER',
    difficulty: 1,
    content: {
      question: 'After the flop, who acts first?',
      options: [
        'The first active player left of the Button',
        'The Button',
        'Under the Gun',
      ],
    },
    correctAnswer: 'The first active player left of the Button',
    explanation:
      'Post-flop, action always starts with the first remaining player to the left of the Button. This is usually the Small Blind if they are still in the hand, then the Big Blind, and so on.',
    xpValue: 10,
  },
  // 19 - Medium
  {
    type: 'POSITION_ORDER',
    difficulty: 2,
    content: {
      question: 'How does the acting order change from preflop to post-flop?',
      options: [
        'Blinds go from acting last to acting first',
        'Nothing changes',
        'The Button acts first post-flop',
      ],
    },
    correctAnswer: 'Blinds go from acting last to acting first',
    explanation:
      'Preflop, the blinds act last (BB closes the action). Post-flop, the blinds act first (SB or BB leads). This switch is why being in the blinds is so costly despite acting last preflop.',
    xpValue: 15,
  },
  // 20 - Medium
  {
    type: 'POSITION_ORDER',
    difficulty: 2,
    content: {
      question: 'At a 6-max table, what are the six positions in clockwise order starting from the dealer?',
      options: [
        'BTN, SB, BB, UTG, MP, CO',
        'SB, BB, UTG, MP, CO, BTN',
        'UTG, MP, CO, BTN, SB, BB',
      ],
    },
    correctAnswer: 'BTN, SB, BB, UTG, MP, CO',
    explanation:
      'In a 6-max game, the positions clockwise from the dealer are: Button, Small Blind, Big Blind, Under the Gun, Middle Position, and Cutoff. Note that 6-max does not have a Hijack seat.',
    xpValue: 15,
  },
  // 21 - Medium
  {
    type: 'POSITION_ORDER',
    difficulty: 2,
    content: {
      question: 'If the Small Blind folds preflop, who acts first on the flop?',
      options: [
        'The Big Blind',
        'The Button',
        'Under the Gun',
      ],
    },
    correctAnswer: 'The Big Blind',
    explanation:
      'Post-flop action starts with the first active player left of the Button. If the SB folded, that is the Big Blind. The Button always acts last post-flop.',
    xpValue: 15,
  },
  // 22 - Hard
  {
    type: 'POSITION_ORDER',
    difficulty: 3,
    content: {
      question: 'In a 9-max game, which positions are considered "early position"?',
      options: [
        'UTG, UTG+1, UTG+2',
        'SB and BB',
        'CO and BTN',
      ],
    },
    correctAnswer: 'UTG, UTG+1, UTG+2',
    explanation:
      'In a full-ring (9-max) game, early position includes UTG, UTG+1, and UTG+2 (the first three players to act preflop). These positions need the tightest ranges because so many players are left to act.',
    xpValue: 20,
  },
  // 23 - Hard
  {
    type: 'POSITION_ORDER',
    difficulty: 3,
    content: {
      question: 'Which positions are considered "late position"?',
      options: [
        'Cutoff and Button',
        'Small Blind and Big Blind',
        'Hijack and Middle Position',
      ],
    },
    correctAnswer: 'Cutoff and Button',
    explanation:
      'Late position refers to the Cutoff and Button. These are the last to act preflop (before the blinds) and have the best post-flop position. They can play the widest ranges profitably.',
    xpValue: 20,
  },
  // 24 - Hard
  {
    type: 'POSITION_ORDER',
    difficulty: 3,
    content: {
      question: 'The dealer button moves one seat clockwise after each hand. Why does this matter?',
      options: [
        'It ensures every player takes turns in every position',
        'It decides who gets dealt cards first',
        'It has no strategic impact',
      ],
    },
    correctAnswer: 'It ensures every player takes turns in every position',
    explanation:
      'Moving the button guarantees fairness. Every player rotates through every position, spending equal time in good positions (BTN, CO) and bad ones (SB, BB, UTG). Over time, position luck evens out.',
    xpValue: 20,
  },

  // ============================================================
  // POSITION_STRATEGY (11 questions) - How position affects play decisions
  // ============================================================

  // 25 - Medium
  {
    type: 'POSITION_STRATEGY',
    difficulty: 2,
    content: {
      position: 'UTG',
      question: 'Why should you play tighter from UTG?',
      options: [
        'Many players act after you, increasing the chance someone has a strong hand',
        'The cards are worse in early position',
        'The blinds are larger from UTG',
      ],
    },
    correctAnswer: 'Many players act after you, increasing the chance someone has a strong hand',
    explanation:
      'From UTG, up to 8 players still act after you. The more players left, the more likely one has a premium hand. Play only strong hands to avoid being dominated.',
    xpValue: 15,
  },
  // 26 - Medium
  {
    type: 'POSITION_STRATEGY',
    difficulty: 2,
    content: {
      position: 'BTN',
      question: 'Why can you play more hands from the Button?',
      options: [
        'You have position post-flop, so weaker hands become profitable',
        'The Button gets dealt better cards',
        'Other players play worse against the Button',
      ],
    },
    correctAnswer: 'You have position post-flop, so weaker hands become profitable',
    explanation:
      'The Button acts last post-flop, letting you control pot size, bluff more effectively, and extract extra value. This positional edge makes marginal hands profitable that would be losing from early position.',
    xpValue: 15,
  },
  // 27 - Medium
  {
    type: 'POSITION_STRATEGY',
    difficulty: 2,
    content: {
      situation: 'Everyone folds to you on the Button.',
      question: 'What should your default action be with a wide range of hands?',
      options: [
        'Raise to steal the blinds',
        'Limp to see a cheap flop',
        'Fold unless you have a premium hand',
      ],
    },
    correctAnswer: 'Raise to steal the blinds',
    explanation:
      'When folded to on the Button, raising to steal the blinds is very profitable. You only have two players to get through, and you will have position if called. This is called a "steal" or "open raise".',
    xpValue: 15,
  },
  // 28 - Medium
  {
    type: 'POSITION_STRATEGY',
    difficulty: 2,
    content: {
      position: 'BB',
      situation: 'The Button raises, Small Blind folds. You are in the Big Blind.',
      question: 'Should you defend (call) with a wider range than usual?',
      options: [
        'Yes - you already have money invested and close the action',
        'No - always fold without a premium hand',
        'No - re-raise or fold, never call',
      ],
    },
    correctAnswer: 'Yes - you already have money invested and close the action',
    explanation:
      'In the Big Blind you already have a full blind invested, giving you a discount. Against a likely wide Button raise, you should defend with many hands. However, you will be out of position post-flop, so do not overdo it.',
    xpValue: 15,
  },
  // 29 - Hard
  {
    type: 'POSITION_STRATEGY',
    difficulty: 3,
    content: {
      position: 'CO',
      situation: 'Everyone folds to you in the Cutoff.',
      question: 'What is the term for raising to take down the blinds from late position?',
      options: [
        'A steal raise',
        'A value raise',
        'A slow play',
      ],
    },
    correctAnswer: 'A steal raise',
    explanation:
      'Raising from late position (CO or BTN) when folded to you is called a "steal." You are trying to win the blinds without a fight. The Cutoff is the earliest position where steal raises become standard.',
    xpValue: 20,
  },
  // 30 - Hard
  {
    type: 'POSITION_STRATEGY',
    difficulty: 3,
    content: {
      position: 'SB',
      situation: 'Everyone folds to you in the Small Blind.',
      question: 'Why should you raise rather than just complete (limp) from the SB?',
      options: [
        'Limping gives the BB a free look with position on you',
        'The rules require a raise',
        'Limping forfeits your blind',
      ],
    },
    correctAnswer: 'Limping gives the BB a free look with position on you',
    explanation:
      'If you just complete, the Big Blind sees a flop cheaply with position on you for the rest of the hand. Raising puts pressure on them and can win the pot immediately. Playing out of position after limping is a recipe for losing chips.',
    xpValue: 20,
  },
  // 31 - Hard
  {
    type: 'POSITION_STRATEGY',
    difficulty: 3,
    content: {
      position: 'BB',
      situation: 'The Cutoff raises. The Button folds. The Small Blind folds.',
      question: 'You have a medium-strength hand in the BB. What is a 3-bet from this spot primarily trying to do?',
      options: [
        'Take the pot preflop or gain initiative despite being out of position',
        'Build a huge pot to go all-in',
        'Trap the opponent into calling',
      ],
    },
    correctAnswer: 'Take the pot preflop or gain initiative despite being out of position',
    explanation:
      'A 3-bet from the Big Blind aims to win the pot immediately or take the lead in the hand. Since you will be out of position post-flop, winning preflop is ideal. If called, being the aggressor helps offset your positional disadvantage.',
    xpValue: 20,
  },
  // 32 - Medium
  {
    type: 'POSITION_STRATEGY',
    difficulty: 2,
    content: {
      question: 'A player in early position raises. You are in middle position with a marginal hand. What should you consider?',
      options: [
        'There are still several players behind you who could have a strong hand',
        'You should always call because you have position on the raiser',
        'Position does not matter after someone raises',
      ],
    },
    correctAnswer: 'There are still several players behind you who could have a strong hand',
    explanation:
      'When facing an early position raise from middle position, you must worry about players behind you who could 3-bet. With a marginal hand and players left to act, folding is often correct.',
    xpValue: 15,
  },
  // 33 - Hard
  {
    type: 'POSITION_STRATEGY',
    difficulty: 3,
    content: {
      situation: 'You are on the Button in a 3-way pot. Both opponents check the flop to you.',
      question: 'What advantage do you have in this spot?',
      options: [
        'You can bet to win the pot or check for a free card',
        'You are guaranteed to win the hand',
        'You can see the turn before deciding',
      ],
    },
    correctAnswer: 'You can bet to win the pot or check for a free card',
    explanation:
      'When both opponents check to you on the Button, you can bet as a bluff or for value, or check behind to see the turn for free. Out-of-position players cannot take a free card when they check because someone after them might bet.',
    xpValue: 20,
  },
  // 34 - Hard
  {
    type: 'POSITION_STRATEGY',
    difficulty: 3,
    content: {
      question: 'In a multiway pot (3+ players), why is position even more important?',
      options: [
        'More opponents means more information to gather before you act',
        'You get more cards in multiway pots',
        'The blinds are split between more players',
      ],
    },
    correctAnswer: 'More opponents means more information to gather before you act',
    explanation:
      'In multiway pots, being last to act lets you see what every opponent does before deciding. If one player bets and another raises, you know the pot is contested and can fold weak hands. Out of position, you would have to guess.',
    xpValue: 20,
  },
  // 35 - Medium
  {
    type: 'POSITION_STRATEGY',
    difficulty: 2,
    content: {
      question: 'Which of these is the best general rule about position and starting hand selection?',
      options: [
        'Play fewer hands from early position, more from late position',
        'Play the same hands from every position',
        'Play more hands from early position because you act first',
      ],
    },
    correctAnswer: 'Play fewer hands from early position, more from late position',
    explanation:
      'The later your position, the wider your profitable range. From UTG, stick to strong hands. From the Button, you can play many more hands because positional advantage makes up for weaker starting cards.',
    xpValue: 15,
  },
];
