export const boardReadingQuestions = [
  // ============================================================
  // EASY (Q1-Q12): Clear winner with different hand ranks
  // ============================================================

  // Q1: Flush vs trips (2 players)
  // Board: Jh 8h 4h 3d 2c
  // P1: Ah 9h → flush A-J-9-8-4 hearts
  // P2: Jd Js → trips J-J-J-8-4
  // Flush > trips → P1 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['Jh', '8h', '4h', '3d', '2c'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Ah', '9h'] },
        { seat: 2, name: 'Player 2', cards: ['Jd', 'Js'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'Player 1 has an Ace-high flush in hearts (A-J-9-8-4). Player 2 has three Jacks (J-J-J-8-4). A flush beats three of a kind.',
    xpValue: 15,
  },

  // Q2: Two pair vs one pair (2 players)
  // Board: Kd 9s 5c 5h 2d
  // P1: Kh 7c → two pair K-K-5-5-9
  // P2: As Qh → pair 5-5-A-K-Q
  // Two pair > one pair → P1 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['Kd', '9s', '5c', '5h', '2d'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Kh', '7c'] },
        { seat: 2, name: 'Player 2', cards: ['As', 'Qh'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'Player 1 has two pair: Kings and 5s (K-K-5-5-9). Player 2 only has a pair of 5s with Ace kicker (5-5-A-K-Q). Two pair beats one pair.',
    xpValue: 15,
  },

  // Q3: Straight vs trips (2 players)
  // Board: 10h 9c 8d 3s 2h
  // P1: 10d 10s → trips 10-10-10-9-8
  // P2: Jh 7c → straight J-10-9-8-7
  // Straight > trips → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['10h', '9c', '8d', '3s', '2h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['10d', '10s'] },
        { seat: 2, name: 'Player 2', cards: ['Jh', '7c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has a straight (J-10-9-8-7). Player 1 has three 10s (10-10-10-9-8). A straight beats three of a kind.',
    xpValue: 15,
  },

  // Q4: Full house vs flush (2 players)
  // Board: Qs Qd 7s 4s 2s
  // P1: Qc 7h → full house Q-Q-Q-7-7
  // P2: Ks 9s → flush K-9-7-4-2 spades
  // Full house > flush → P1 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['Qs', 'Qd', '7s', '4s', '2s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Qc', '7h'] },
        { seat: 2, name: 'Player 2', cards: ['Ks', '9s'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'Player 1 has a full house: Queens full of 7s (Q-Q-Q-7-7). Player 2 has a King-high spade flush (K-9-7-4-2). A full house beats a flush.',
    xpValue: 15,
  },

  // Q5: Trips vs two pair vs pair (3 players)
  // Board: Ah 10d 6c 3h 3s
  // P1: 3d 9c → trips 3-3-3-A-10
  // P2: Ac 10h → two pair A-A-10-10-6
  // P3: Kd Qs → pair 3-3-A-K-Q
  // Trips > two pair > one pair → P1 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['Ah', '10d', '6c', '3h', '3s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['3d', '9c'] },
        { seat: 2, name: 'Player 2', cards: ['Ac', '10h'] },
        { seat: 3, name: 'Player 3', cards: ['Kd', 'Qs'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'Player 1 has three 3s (3-3-3-A-10). Player 2 has two pair: Aces and 10s (A-A-10-10-6). Player 3 has a pair of 3s (3-3-A-K-Q). Three of a kind beats two pair.',
    xpValue: 15,
  },

  // Q6: Straight vs two pair (2 players)
  // Board: Jc 10h 9d 4c 2s
  // P1: Jd 10c → two pair J-J-10-10-9
  // P2: Qh 8s → straight Q-J-10-9-8
  // Straight > two pair → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['Jc', '10h', '9d', '4c', '2s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Jd', '10c'] },
        { seat: 2, name: 'Player 2', cards: ['Qh', '8s'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has a straight (Q-J-10-9-8). Player 1 has two pair: Jacks and 10s (J-J-10-10-9). A straight beats two pair.',
    xpValue: 15,
  },

  // Q7: Higher trips vs lower trips (2 players)
  // Board: As 9h 6d 6c 2h
  // P1: 6s Kd → trips 6-6-6-A-K
  // P2: 9d 9c → trips 9-9-9-A-6
  // Higher trips → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['As', '9h', '6d', '6c', '2h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['6s', 'Kd'] },
        { seat: 2, name: 'Player 2', cards: ['9d', '9c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has three 9s (9-9-9-A-6). Player 1 has three 6s (6-6-6-A-K). Higher three of a kind wins — nines beat sixes.',
    xpValue: 15,
  },

  // Q8: Pair vs high card (3 players)
  // Board: Kc Jh 8d 5s 3c
  // P1: Ad Qh → high card A-K-Q-J-8
  // P2: Jd 4c → pair J-J-K-8-5
  // P3: 10h 9s → high card K-J-10-9-8
  // Pair > high card → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['Kc', 'Jh', '8d', '5s', '3c'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Ad', 'Qh'] },
        { seat: 2, name: 'Player 2', cards: ['Jd', '4c'] },
        { seat: 3, name: 'Player 3', cards: ['10h', '9s'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has a pair of Jacks (J-J-K-8-5). Player 1 has Ace-high with no pair (A-K-Q-J-8). Player 3 has King-high with no pair (K-J-10-9-8). One pair beats high card.',
    xpValue: 15,
  },

  // Q9: SPLIT_POT — Board straight, neither can improve (easy)
  // Board: Kd Qc Jh 10s 9d
  // P1: 3h 2c → best hand K-Q-J-10-9
  // P2: 5s 4h → best hand K-Q-J-10-9
  // Neither holds an A for higher straight → split
  {
    type: 'SPLIT_POT',
    difficulty: 1,
    content: {
      board: ['Kd', 'Qc', 'Jh', '10s', '9d'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['3h', '2c'] },
        { seat: 2, name: 'Player 2', cards: ['5s', '4h'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - the board plays',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'Yes - the board plays',
    explanation:
      'The board makes a King-high straight (K-Q-J-10-9). Neither player can improve on it, so both play the board straight and split the pot.',
    xpValue: 15,
  },

  // Q10: SPLIT_POT (not a split) — One player extends the straight (easy)
  // Board: Qh Jd 10c 9s 3h
  // P1: Kc 2d → straight K-Q-J-10-9
  // P2: 8h 5c → straight Q-J-10-9-8
  // P1 has higher straight → no split
  {
    type: 'SPLIT_POT',
    difficulty: 1,
    content: {
      board: ['Qh', 'Jd', '10c', '9s', '3h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Kc', '2d'] },
        { seat: 2, name: 'Player 2', cards: ['8h', '5c'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - both have a straight',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'No - Player 1 wins',
    explanation:
      'Both players make a straight, but Player 1 has a King-high straight (K-Q-J-10-9) while Player 2 has a Queen-high straight (Q-J-10-9-8). The higher straight wins.',
    xpValue: 15,
  },

  // Q11: Trips vs two pair (2 players)
  // Board: Qc 8h 5d 5s 2c
  // P1: Qh 3d → two pair Q-Q-5-5-8
  // P2: 8d 8c → trips 8-8-8-Q-5
  // Trips > two pair → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 1,
    content: {
      board: ['Qc', '8h', '5d', '5s', '2c'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Qh', '3d'] },
        { seat: 2, name: 'Player 2', cards: ['8d', '8c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has three 8s (8-8-8-Q-5). Player 1 has two pair: Queens and 5s (Q-Q-5-5-8). Three of a kind beats two pair.',
    xpValue: 15,
  },

  // Q12: SPLIT_POT — Both pair the Ace, kickers from board (easy)
  // Board: As Kd Qh 7c 3d
  // P1: Ac 2h → pair A-A-K-Q-7
  // P2: Ad 2s → pair A-A-K-Q-7
  // Identical best 5 cards → split
  {
    type: 'SPLIT_POT',
    difficulty: 1,
    content: {
      board: ['As', 'Kd', 'Qh', '7c', '3d'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Ac', '2h'] },
        { seat: 2, name: 'Player 2', cards: ['Ad', '2s'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - same hand',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'Yes - same hand',
    explanation:
      'Both players have a pair of Aces with the same kickers from the board (A-A-K-Q-7). The 2s don\'t play because K, Q, and 7 are all higher. Identical five-card hands split the pot.',
    xpValue: 15,
  },

  // ============================================================
  // MEDIUM (Q13-Q27): Kickers, board plays, flushes, hidden hands
  // ============================================================

  // Q13: Kicker battle — all three have top pair (medium)
  // Board: Ah 10d 7c 4s 2h
  // P1: As Kc → pair A-A-K-10-7
  // P2: Ad Jh → pair A-A-J-10-7
  // P3: Ac 9d → pair A-A-10-9-7
  // P1 wins on King kicker
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['Ah', '10d', '7c', '4s', '2h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['As', 'Kc'] },
        { seat: 2, name: 'Player 2', cards: ['Ad', 'Jh'] },
        { seat: 3, name: 'Player 3', cards: ['Ac', '9d'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'All three players have a pair of Aces. The kicker decides: Player 1 has King (A-A-K-10-7), Player 2 has Jack (A-A-J-10-7), Player 3 has 10 next (A-A-10-9-7). King kicker wins for Player 1.',
    xpValue: 15,
  },

  // Q14: Hidden set beats top pair (medium)
  // Board: Kh Jd 8c 5s 3h
  // P1: As Kd → pair K-K-A-J-8
  // P2: 8h 8d → trips 8-8-8-K-J
  // Trips > pair → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['Kh', 'Jd', '8c', '5s', '3h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['As', 'Kd'] },
        { seat: 2, name: 'Player 2', cards: ['8h', '8d'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has a hidden set of 8s (8-8-8-K-J). Player 1 only has a pair of Kings (K-K-A-J-8). Three of a kind beats one pair. Sets are dangerous because they\'re hard to spot!',
    xpValue: 15,
  },

  // Q15: Flush vs straight on wet board (medium)
  // Board: 9s 8s 7d 6s 2c
  // P1: 10h 5c → straight 10-9-8-7-6
  // P2: Ks 3s → flush K-9-8-6-3 spades
  // Flush > straight → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['9s', '8s', '7d', '6s', '2c'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['10h', '5c'] },
        { seat: 2, name: 'Player 2', cards: ['Ks', '3s'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has a flush in spades (K-9-8-6-3). Player 1 has a straight (10-9-8-7-6). A flush beats a straight, even though straights look strong.',
    xpValue: 15,
  },

  // Q16: SPLIT_POT — Board plays Ace-high (medium)
  // Board: As Kh Qd Jc 9h
  // P1: 7d 4c → best hand A-K-Q-J-9
  // P2: 6h 3s → best hand A-K-Q-J-9
  // Neither can improve → split
  {
    type: 'SPLIT_POT',
    difficulty: 2,
    content: {
      board: ['As', 'Kh', 'Qd', 'Jc', '9h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['7d', '4c'] },
        { seat: 2, name: 'Player 2', cards: ['6h', '3s'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - the board plays',
        'No - Player 1 wins (higher cards)',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'Yes - the board plays',
    explanation:
      'The board is A-K-Q-J-9. Neither player\'s hole cards can beat any of the five board cards, so both play the board and split the pot.',
    xpValue: 15,
  },

  // Q17: Two pair from board, kicker decides (medium)
  // Board: Ks Kd 9h 9c 4d
  // P1: Ah 3c → K-K-9-9-A
  // P2: Qh Jd → K-K-9-9-Q
  // P1 wins on Ace kicker
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['Ks', 'Kd', '9h', '9c', '4d'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Ah', '3c'] },
        { seat: 2, name: 'Player 2', cards: ['Qh', 'Jd'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'Both players have two pair from the board: Kings and 9s. The kicker decides — Player 1 has Ace (K-K-9-9-A) vs Player 2\'s Queen (K-K-9-9-Q). Ace kicker wins.',
    xpValue: 15,
  },

  // Q18: Hidden full house vs two pair (medium)
  // Board: Qd 10h 6c 3s 3d
  // P1: Qh 10c → two pair Q-Q-10-10-6
  // P2: 6s 6h → full house 6-6-6-3-3
  // Full house > two pair → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['Qd', '10h', '6c', '3s', '3d'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Qh', '10c'] },
        { seat: 2, name: 'Player 2', cards: ['6s', '6h'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has a full house: 6s full of 3s (6-6-6-3-3). Player 1 has two pair: Queens and 10s (Q-Q-10-10-6). A full house always beats two pair.',
    xpValue: 15,
  },

  // Q19: SPLIT_POT (not a split) — Both have flush but 5th card differs (medium)
  // Board: Ah Kh Qh 10h 3c
  // P1: 5h 9d → flush A-K-Q-10-5 hearts
  // P2: 4h 8s → flush A-K-Q-10-4 hearts
  // P1's 5h > P2's 4h → P1 wins
  {
    type: 'SPLIT_POT',
    difficulty: 2,
    content: {
      board: ['Ah', 'Kh', 'Qh', '10h', '3c'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['5h', '9d'] },
        { seat: 2, name: 'Player 2', cards: ['4h', '8s'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - same flush',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'No - Player 1 wins',
    explanation:
      'Both make a heart flush using four board hearts plus one from hand. Player 1 has A-K-Q-10-5 of hearts, Player 2 has A-K-Q-10-4 of hearts. The fifth heart decides — 5 beats 4.',
    xpValue: 15,
  },

  // Q20: Pocket pair makes two pair vs overcards with board pair (medium)
  // Board: Jh 7d 7c 4s 2h
  // P1: As Kd → pair 7-7-A-K-J
  // P2: Qc Qd → two pair Q-Q-7-7-J
  // Two pair > one pair → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['Jh', '7d', '7c', '4s', '2h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['As', 'Kd'] },
        { seat: 2, name: 'Player 2', cards: ['Qc', 'Qd'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has two pair: Queens and 7s (Q-Q-7-7-J). Player 1 only has a pair of 7s from the board with A-K kickers (7-7-A-K-J). Two pair beats one pair, even with Ace-King.',
    xpValue: 15,
  },

  // Q21: Three players, same two pair from board, kicker battle (medium)
  // Board: Ah Ad 8c 8s 3h
  // P1: Kc 5d → A-A-8-8-K
  // P2: Qs 7h → A-A-8-8-Q
  // P3: Jd 9c → A-A-8-8-J
  // P1 wins with King kicker
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['Ah', 'Ad', '8c', '8s', '3h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Kc', '5d'] },
        { seat: 2, name: 'Player 2', cards: ['Qs', '7h'] },
        { seat: 3, name: 'Player 3', cards: ['Jd', '9c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'All three have two pair from the board: Aces and 8s. The kicker breaks the tie — Player 1 has King (A-A-8-8-K), Player 2 has Queen (A-A-8-8-Q), Player 3 has Jack (A-A-8-8-J).',
    xpValue: 15,
  },

  // Q22: SPLIT_POT — Same straight, different side cards (medium)
  // Board: 10d 9h 8c 7s 2d
  // P1: Jh 3c → straight J-10-9-8-7
  // P2: Js 4h → straight J-10-9-8-7
  // Same 5-card hand → split
  {
    type: 'SPLIT_POT',
    difficulty: 2,
    content: {
      board: ['10d', '9h', '8c', '7s', '2d'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Jh', '3c'] },
        { seat: 2, name: 'Player 2', cards: ['Js', '4h'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - same straight',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'Yes - same straight',
    explanation:
      'Both players make the same Jack-high straight (J-10-9-8-7). The other hole cards (3 and 4) don\'t matter in a straight — all five cards are set. The pot splits.',
    xpValue: 15,
  },

  // Q23: SPLIT_POT (not a split) — Different straights (medium)
  // Board: 9c 8h 7d 6s 2c
  // P1: 10s 3h → straight 10-9-8-7-6
  // P2: 5d 4h → straight 9-8-7-6-5
  // P1 has higher straight → P1 wins
  {
    type: 'SPLIT_POT',
    difficulty: 2,
    content: {
      board: ['9c', '8h', '7d', '6s', '2c'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['10s', '3h'] },
        { seat: 2, name: 'Player 2', cards: ['5d', '4h'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - both have a straight',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'No - Player 1 wins',
    explanation:
      'Player 1 has a 10-high straight (10-9-8-7-6). Player 2 has a 9-high straight (9-8-7-6-5). Both made straights, but the higher straight wins.',
    xpValue: 15,
  },

  // Q24: Flush over flush — highest card wins (medium)
  // Board: Jd 8d 5d 3c 2h
  // P1: Ad 4d → flush A-J-8-5-4 diamonds
  // P2: Kd Qd → flush K-Q-J-8-5 diamonds
  // A-high > K-high → P1 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['Jd', '8d', '5d', '3c', '2h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Ad', '4d'] },
        { seat: 2, name: 'Player 2', cards: ['Kd', 'Qd'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'Both players have a diamond flush. Player 1 has Ace-high (A-J-8-5-4). Player 2 has King-high (K-Q-J-8-5). The highest card in a flush wins — Ace beats King.',
    xpValue: 15,
  },

  // Q25: SPLIT_POT — Board trips, both play same kickers (medium)
  // Board: 7h 7d 7c 2s 5h
  // P1: As Kd → 7-7-7-A-K
  // P2: Ac Kh → 7-7-7-A-K
  // Same best 5 → split
  {
    type: 'SPLIT_POT',
    difficulty: 2,
    content: {
      board: ['7h', '7d', '7c', '2s', '5h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['As', 'Kd'] },
        { seat: 2, name: 'Player 2', cards: ['Ac', 'Kh'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - same hand',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'Yes - same hand',
    explanation:
      'Both players have trip 7s from the board with A-K kickers (7-7-7-A-K). Suits don\'t matter in hand rankings, so the hands are identical. Split pot.',
    xpValue: 15,
  },

  // Q26: Set over set (medium)
  // Board: Qh 9d 4c 2s 7h
  // P1: 4h 4d → set 4-4-4-Q-9
  // P2: 9s 9c → set 9-9-9-Q-7
  // Higher set → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 2,
    content: {
      board: ['Qh', '9d', '4c', '2s', '7h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['4h', '4d'] },
        { seat: 2, name: 'Player 2', cards: ['9s', '9c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Both players have a hidden set. Player 2 has set of 9s (9-9-9-Q-7). Player 1 has set of 4s (4-4-4-Q-9). The higher set wins — nines over fours.',
    xpValue: 15,
  },

  // Q27: SPLIT_POT — Board pair + same overcard = identical hands (medium)
  // Board: Kc Kd 10h 8s 3d
  // P1: Qh 5c → K-K-Q-10-8
  // P2: Qs 6d → K-K-Q-10-8
  // Same best 5 → split
  {
    type: 'SPLIT_POT',
    difficulty: 2,
    content: {
      board: ['Kc', 'Kd', '10h', '8s', '3d'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Qh', '5c'] },
        { seat: 2, name: 'Player 2', cards: ['Qs', '6d'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - same hand',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'Yes - same hand',
    explanation:
      'Both have a pair of Kings with Queen kicker (K-K-Q-10-8). The 5 and 6 don\'t play because 10 and 8 from the board are higher. Identical five-card hands split.',
    xpValue: 15,
  },

  // ============================================================
  // HARD (Q28-Q40): Counterfeiting, full houses, tricky splits
  // ============================================================

  // Q28: Counterfeiting — pocket pair becomes irrelevant (hard)
  // Board: Kh Kd Jc Js 4h
  // P1: 6d 6c → best hand K-K-J-J-6 (pocket 6s are just a kicker)
  // P2: Ah 3c → best hand K-K-J-J-A (Ace kicker)
  // Board double-paired, counterfeiting P1's pocket 6s → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 3,
    content: {
      board: ['Kh', 'Kd', 'Jc', 'Js', '4h'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['6d', '6c'] },
        { seat: 2, name: 'Player 2', cards: ['Ah', '3c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 1\'s pocket 6s got counterfeited! The board has two pair (Kings and Jacks), which is higher than 6s. Both players play K-K-J-J with a kicker. Player 2\'s Ace kicker (K-K-J-J-A) beats Player 1\'s 6 kicker (K-K-J-J-6).',
    xpValue: 20,
  },

  // Q29: Full house vs flush on paired board (hard)
  // Board: Jh Jd 8h 5h 2c
  // P1: Ah 9h → flush A-J-9-8-5 hearts (5 hearts: Ah,Jh,9h,8h,5h)
  // P2: Jc 8s → full house J-J-J-8-8
  // Full house > flush → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 3,
    content: {
      board: ['Jh', 'Jd', '8h', '5h', '2c'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Ah', '9h'] },
        { seat: 2, name: 'Player 2', cards: ['Jc', '8s'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has a full house: Jacks full of 8s (J-J-J-8-8). Player 1 has an Ace-high flush in hearts (A-J-9-8-5). A full house always beats a flush.',
    xpValue: 20,
  },

  // Q30: Three different straights — highest wins (hard)
  // Board: 10c 9d 8h 7c 3s
  // P1: Jh 2d → straight J-10-9-8-7
  // P2: Qs Js → straight Q-J-10-9-8
  // P3: 6d 5c → straight 10-9-8-7-6
  // P2 has highest straight → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 3,
    content: {
      board: ['10c', '9d', '8h', '7c', '3s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Jh', '2d'] },
        { seat: 2, name: 'Player 2', cards: ['Qs', 'Js'] },
        { seat: 3, name: 'Player 3', cards: ['6d', '5c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'All three have a straight! Player 2 has Q-J-10-9-8 (Queen-high). Player 1 has J-10-9-8-7 (Jack-high). Player 3 has 10-9-8-7-6 (10-high). The highest straight wins.',
    xpValue: 20,
  },

  // Q31: SPLIT_POT — Board full house, no one can improve (hard)
  // Board: Ah Ad Ac Kh Kd
  // P1: Qh Jh → best hand A-A-A-K-K
  // P2: Qs Js → best hand A-A-A-K-K
  // P3: 10c 9c → best hand A-A-A-K-K
  // All play board → three-way split
  {
    type: 'SPLIT_POT',
    difficulty: 3,
    content: {
      board: ['Ah', 'Ad', 'Ac', 'Kh', 'Kd'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Qh', 'Jh'] },
        { seat: 2, name: 'Player 2', cards: ['Qs', 'Js'] },
        { seat: 3, name: 'Player 3', cards: ['10c', '9c'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - three-way split',
        'No - Player 1 wins',
        'Yes - split between P1 and P2 only',
      ],
    },
    correctAnswer: 'Yes - three-way split',
    explanation:
      'The board is Aces full of Kings (A-A-A-K-K). No player can improve on this massive full house. All three play the board and split the pot.',
    xpValue: 20,
  },

  // Q32: Quads vs full house (hard)
  // Board: Qs 8d 8c 3h 3s
  // P1: 8h 5d → full house 8-8-8-Q-3
  // P2: 3d 3c → quads 3-3-3-3-Q
  // Quads > full house → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 3,
    content: {
      board: ['Qs', '8d', '8c', '3h', '3s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['8h', '5d'] },
        { seat: 2, name: 'Player 2', cards: ['3d', '3c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has four 3s (3-3-3-3-Q). Player 1 has a full house: 8s full of 3s (8-8-8-Q-3). Four of a kind beats a full house.',
    xpValue: 20,
  },

  // Q33: Counterfeiting — board double-pairs making pocket pair a kicker (hard)
  // Board: Kh 8d 3c 8s Ks
  // P1: 5h 5c → K-K-8-8-5 (pocket 5s become just a kicker)
  // P2: Ah 2d → K-K-8-8-A (Ace kicker wins)
  // P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 3,
    content: {
      board: ['Kh', '8d', '3c', '8s', 'Ks'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['5h', '5c'] },
        { seat: 2, name: 'Player 2', cards: ['Ah', '2d'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 1\'s pocket 5s got counterfeited! The board paired Kings and 8s, so both players have two pair: Kings and 8s. The kicker decides — Player 2\'s Ace (K-K-8-8-A) beats Player 1\'s 5 (K-K-8-8-5).',
    xpValue: 20,
  },

  // Q34: Full house rank — trips decide, not the pair (hard)
  // Board: Qd Qc 6h 6d 2s
  // P1: 6s 9h → full house 6-6-6-Q-Q
  // P2: Qs 4c → full house Q-Q-Q-6-6
  // Queens full > sixes full → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 3,
    content: {
      board: ['Qd', 'Qc', '6h', '6d', '2s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['6s', '9h'] },
        { seat: 2, name: 'Player 2', cards: ['Qs', '4c'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has Queens full of 6s (Q-Q-Q-6-6). Player 1 has 6s full of Queens (6-6-6-Q-Q). In full houses, the three-of-a-kind rank decides — Queens beat 6s.',
    xpValue: 20,
  },

  // Q35: SPLIT_POT — Both pocket pairs counterfeited, same kicker (hard)
  // Board: Ac Ad 10h 10d 7c
  // P1: 3h 3s → best hand A-A-10-10-7 (3s don't play)
  // P2: 4d 4c → best hand A-A-10-10-7 (4s don't play)
  // Both counterfeited → split
  {
    type: 'SPLIT_POT',
    difficulty: 3,
    content: {
      board: ['Ac', 'Ad', '10h', '10d', '7c'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['3h', '3s'] },
        { seat: 2, name: 'Player 2', cards: ['4d', '4c'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - both counterfeited',
        'No - Player 2 wins (higher pocket pair)',
        'No - Player 1 wins',
      ],
    },
    correctAnswer: 'Yes - both counterfeited',
    explanation:
      'Both pocket pairs got counterfeited! The board has Aces and 10s — both higher than 3s or 4s. Both play A-A-10-10-7, with the 7 as kicker. The pocket pairs are irrelevant. Split pot.',
    xpValue: 20,
  },

  // Q36: Straight flush beats trip Kings (hard)
  // Board: 9h 8h 7h 2c Kd
  // P1: Kh Ks → trip Kings K-K-K-9-8 (only 4 hearts, no flush)
  // P2: 10h 6h → straight flush 10-9-8-7-6 hearts
  // Straight flush > trips → P2 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 3,
    content: {
      board: ['9h', '8h', '7h', '2c', 'Kd'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Kh', 'Ks'] },
        { seat: 2, name: 'Player 2', cards: ['10h', '6h'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 2',
    explanation:
      'Player 2 has a straight flush in hearts (10-9-8-7-6)! Player 1 has three Kings (K-K-K-9-8). A straight flush beats every other hand except a higher straight flush or royal flush.',
    xpValue: 20,
  },

  // Q37: Full house vs full house — trips rank decides (hard)
  // Board: 10h 10d 4c 4s Kh
  // P1: 10c 3d → full house 10-10-10-K-4 (best: use trip 10s + K kicker? No, 10-10-10-4-4)
  //   Actually best 5 from {10h,10d,4c,4s,Kh,10c,3d}: 10-10-10-4-4 or 10-10-10-K-4?
  //   10-10-10-4-4 is a full house. 10-10-10-K-4 is just trips. Full house > trips.
  //   So P1 = 10-10-10-4-4.
  // P2: 4h Ks → full house 4-4-4-K-K
  //   7 cards: {10h,10d,4c,4s,Kh,4h,Ks}. Trip 4s + pair Ks = 4-4-4-K-K.
  // 10-10-10-4-4 > 4-4-4-K-K → P1 wins
  {
    type: 'MULTIWAY_SHOWDOWN',
    difficulty: 3,
    content: {
      board: ['10h', '10d', '4c', '4s', 'Kh'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['10c', '3d'] },
        { seat: 2, name: 'Player 2', cards: ['4h', 'Ks'] },
      ],
      question: 'Who wins this showdown?',
    },
    correctAnswer: 'Player 1',
    explanation:
      'Player 1 has 10s full of 4s (10-10-10-4-4). Player 2 has 4s full of Kings (4-4-4-K-K). In a full house, the three-of-a-kind rank determines the winner — 10s beat 4s regardless of the pair.',
    xpValue: 20,
  },

  // Q38: SPLIT_POT — Board flush, neither holds a relevant spade (hard)
  // Board: As Ks Qs Js 4s
  // P1: 10h 3d → plays board flush A-K-Q-J-4 spades
  // P2: 9c 7d → plays board flush A-K-Q-J-4 spades
  // Neither has a spade to improve → split
  {
    type: 'SPLIT_POT',
    difficulty: 3,
    content: {
      board: ['As', 'Ks', 'Qs', 'Js', '4s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['10h', '3d'] },
        { seat: 2, name: 'Player 2', cards: ['9c', '7d'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - the board plays',
        'No - Player 1 wins (10 kicker)',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'Yes - the board plays',
    explanation:
      'The board has a spade flush (A-K-Q-J-4). Neither player holds a spade higher than 4, so neither can improve. Both play the board flush and split. A non-spade 10 doesn\'t help — you need a spade to improve a flush.',
    xpValue: 20,
  },

  // Q39: SPLIT_POT (not a split) — One player improves board flush to royal (hard)
  // Board: As Ks Qs Js 4s
  // P1: 10s 3d → replaces 4s with 10s → A-K-Q-J-10 spades (royal flush!)
  // P2: 9c 7d → plays board flush A-K-Q-J-4 spades
  // P1 wins with royal flush
  {
    type: 'SPLIT_POT',
    difficulty: 3,
    content: {
      board: ['As', 'Ks', 'Qs', 'Js', '4s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['10s', '3d'] },
        { seat: 2, name: 'Player 2', cards: ['9c', '7d'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - both have a spade flush',
        'No - Player 1 wins',
        'No - Player 2 wins',
      ],
    },
    correctAnswer: 'No - Player 1 wins',
    explanation:
      'Player 1 has a royal flush! Their 10s replaces the 4s for A-K-Q-J-10 of spades. Player 2 has no spade to improve, stuck with A-K-Q-J-4. Always check if a player can swap in a higher suited card.',
    xpValue: 20,
  },

  // Q40: SPLIT_POT (not a split) — Board straight, one player extends it (hard)
  // Board: 10c 9d 8h 7c 6s
  // P1: Jh 2d → straight J-10-9-8-7 (higher than board!)
  // P2: Ac Kd → plays board straight 10-9-8-7-6
  // P1 has higher straight → P1 wins
  {
    type: 'SPLIT_POT',
    difficulty: 3,
    content: {
      board: ['10c', '9d', '8h', '7c', '6s'],
      players: [
        { seat: 1, name: 'Player 1', cards: ['Jh', '2d'] },
        { seat: 2, name: 'Player 2', cards: ['Ac', 'Kd'] },
      ],
      question: 'Does the pot split?',
      options: [
        'Yes - the board has a straight',
        'No - Player 1 wins',
        'No - Player 2 wins (Ace-high)',
      ],
    },
    correctAnswer: 'No - Player 1 wins',
    explanation:
      'The board shows a 10-high straight, but Player 1 has a Jack to make J-10-9-8-7 (higher straight). Player 2\'s Ace and King don\'t connect — they play the board\'s 10-9-8-7-6. Big cards don\'t help if they don\'t fit the straight!',
    xpValue: 20,
  },
];
