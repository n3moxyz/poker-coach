export const handRankingsQuestions = [
  // ============================================================
  // HAND_COMPARE questions (30 total)
  // ============================================================

  // --- EASY HAND_COMPARE (10) ---

  // Q1: Royal Flush vs Straight Flush (existing)
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['As', 'Ks', 'Qs', 'Js', '10s'], name: 'Royal Flush' },
      hand2: { cards: ['9h', '8h', '7h', '6h', '5h'], name: 'Straight Flush' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'A Royal Flush (A-K-Q-J-10 of the same suit) is the highest possible hand in poker, beating all other hands including a Straight Flush.',
    xpValue: 10,
  },

  // Q2: Four of a Kind vs Full House (existing)
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['Kh', 'Kd', 'Kc', 'Ks', '3h'], name: 'Four of a Kind' },
      hand2: { cards: ['Ah', 'Ad', 'Ac', 'Qh', 'Qd'], name: 'Full House' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Four of a Kind (four cards of the same rank) beats a Full House (three of a kind plus a pair). Quads are the third-highest hand.',
    xpValue: 10,
  },

  // Q3: Straight Flush vs Four of a Kind (existing)
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['7d', '8d', '9d', '10d', 'Jd'], name: 'Straight Flush' },
      hand2: { cards: ['Ah', 'Ad', 'Ac', 'As', 'Kh'], name: 'Four of a Kind' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'A Straight Flush (five consecutive cards of the same suit) beats Four of a Kind. It is the second-highest hand after Royal Flush.',
    xpValue: 10,
  },

  // Q4: Full House vs Flush
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['Jh', 'Jd', 'Jc', '4s', '4h'], name: 'Full House' },
      hand2: { cards: ['Ac', 'Kc', '9c', '6c', '3c'], name: 'Flush' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'A Full House beats a Flush. Even though a Flush has five suited cards including an Ace, the Full House ranks higher in the hand hierarchy.',
    xpValue: 10,
  },

  // Q5: Two Pair vs One Pair
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['8h', '8d', '5s', '5c', 'Kh'], name: 'Two Pair' },
      hand2: { cards: ['Ah', 'Ad', 'Kc', 'Qs', '9h'], name: 'One Pair' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Two Pair always beats One Pair. Even though One Pair of Aces is a high pair, having two separate pairs outranks it in the hand rankings.',
    xpValue: 10,
  },

  // Q6: One Pair vs High Card
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['3h', '3d', '7s', '9c', 'Jh'], name: 'One Pair' },
      hand2: { cards: ['Ah', 'Kd', 'Qs', 'Jc', '9d'], name: 'High Card' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Even a small pair (Threes) beats any High Card hand. One Pair is the second-lowest ranking, but it still beats having no pair at all.',
    xpValue: 10,
  },

  // Q7: Straight vs Three of a Kind
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['5c', '6d', '7h', '8s', '9c'], name: 'Straight' },
      hand2: { cards: ['Ah', 'Ad', 'Ac', '8h', '3s'], name: 'Three of a Kind' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'A Straight (five consecutive cards) beats Three of a Kind. Even though three Aces looks impressive, the Straight ranks one spot higher.',
    xpValue: 10,
  },

  // Q8: Flush vs Full House (hand2 wins)
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['Kd', 'Jd', '8d', '5d', '2d'], name: 'Flush' },
      hand2: { cards: ['10h', '10d', '10c', '6s', '6h'], name: 'Full House' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand2',
    explanation:
      'A Full House beats a Flush. Remember the order: Straight < Flush < Full House. The Full House is two ranks above the Straight.',
    xpValue: 10,
  },

  // Q9: Three of a Kind vs Two Pair (hand2 loses)
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['Ah', 'Ad', 'Kh', 'Kd', '7s'], name: 'Two Pair' },
      hand2: { cards: ['6c', '6d', '6h', 'Qs', '9c'], name: 'Three of a Kind' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand2',
    explanation:
      'Three of a Kind beats Two Pair. This surprises many beginners because Two Pair has more paired cards, but trips rank higher.',
    xpValue: 10,
  },

  // Q10: High Card vs High Card (A-high vs K-high)
  {
    type: 'HAND_COMPARE',
    difficulty: 1,
    content: {
      hand1: { cards: ['Ah', '10d', '7s', '4c', '2h'], name: 'Ace-high' },
      hand2: { cards: ['Kd', 'Qs', '9h', '6c', '3d'], name: 'King-high' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'When both players have High Card (no pair), the highest card determines the winner. Ace beats King, so Ace-high wins.',
    xpValue: 10,
  },

  // --- MEDIUM HAND_COMPARE (12) ---

  // Q11: Flush vs Straight (existing)
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Ah', 'Kh', '3h', '7h', '9h'], name: 'Flush' },
      hand2: { cards: ['5c', '6d', '7s', '8h', '9c'], name: 'Straight' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'A Flush (five cards of the same suit) beats a Straight (five consecutive cards). The Flush is ranked 5th, Straight is 6th.',
    xpValue: 15,
  },

  // Q12: Three of a Kind vs Two Pair (existing)
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Qh', 'Qd', 'Qc', '5s', '8h'], name: 'Three of a Kind' },
      hand2: { cards: ['Ah', 'Ad', 'Ks', 'Kd', '3c'], name: 'Two Pair' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Three of a Kind beats Two Pair. Even though Two Pair has more paired cards, trips rank higher.',
    xpValue: 15,
  },

  // Q13: Ace-high Straight vs Wheel (existing)
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Ah', 'Kc', 'Qd', 'Js', '10h'], name: 'Ace-high Straight' },
      hand2: { cards: ['5h', '4c', '3d', '2s', 'Ac'], name: 'Wheel (5-high Straight)' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'The Ace-high straight (Broadway) beats the 5-high straight (Wheel). In the Wheel, the Ace counts as low (A-2-3-4-5), making it the lowest possible straight.',
    xpValue: 15,
  },

  // Q14: Higher pair vs lower pair
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Kh', 'Kd', '9s', '6c', '3h'], name: 'Pair of Kings' },
      hand2: { cards: ['Qh', 'Qd', 'As', 'Jc', '10h'], name: 'Pair of Queens' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'When both players have One Pair, the higher pair wins. Kings beat Queens regardless of the other cards (kickers).',
    xpValue: 15,
  },

  // Q15: Same pair, different kicker
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Ah', 'Jd', 'Js', '7c', '3h'], name: 'Pair of Jacks, Ace kicker' },
      hand2: { cards: ['Kh', 'Jh', 'Jc', '8d', '4s'], name: 'Pair of Jacks, King kicker' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Both players have a pair of Jacks, so the kicker (highest remaining card) decides. An Ace kicker beats a King kicker.',
    xpValue: 15,
  },

  // Q16: Two Pair vs Two Pair (higher top pair wins)
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Ah', 'Ad', '3s', '3c', '9h'], name: 'Aces and Threes' },
      hand2: { cards: ['Kh', 'Kd', 'Qc', 'Qs', '8d'], name: 'Kings and Queens' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'When comparing Two Pair, the highest pair is compared first. Aces beat Kings, so Aces and Threes beats Kings and Queens, even though Kings and Queens has a higher second pair.',
    xpValue: 15,
  },

  // Q17: Straight vs Flush (hand2 wins)
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['10h', 'Jc', 'Qd', 'Ks', 'Ah'], name: 'Ace-high Straight' },
      hand2: { cards: ['2s', '5s', '8s', 'Js', 'Qs'], name: 'Queen-high Flush' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand2',
    explanation:
      'A Flush always beats a Straight, even the best Straight (Broadway). The five suited cards outrank five consecutive cards of different suits.',
    xpValue: 15,
  },

  // Q18: Wheel Straight vs Three of a Kind (Straight wins)
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Ah', '2c', '3d', '4s', '5h'], name: 'Wheel (5-high Straight)' },
      hand2: { cards: ['10h', '10d', '10c', 'Ks', '7h'], name: 'Three of a Kind' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Even the lowest Straight (the Wheel: A-2-3-4-5) beats Three of a Kind. A Straight is one rank higher than trips.',
    xpValue: 15,
  },

  // Q19: Higher straight vs lower straight
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['9h', '10c', 'Jd', 'Qs', 'Kh'], name: 'King-high Straight' },
      hand2: { cards: ['6d', '7h', '8c', '9s', '10d'], name: '10-high Straight' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'When both players have a Straight, the one ending in the higher card wins. King-high (9 through K) beats 10-high (6 through 10).',
    xpValue: 15,
  },

  // Q20: Same Two Pair, kicker decides
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Qh', 'Qd', '7s', '7c', 'Ah'], name: 'Queens and Sevens, Ace kicker' },
      hand2: { cards: ['Qc', 'Qs', '7h', '7d', '9c'], name: 'Queens and Sevens, Nine kicker' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Both players have Queens and Sevens (same Two Pair). The fifth card (kicker) decides the winner. An Ace kicker beats a Nine kicker.',
    xpValue: 15,
  },

  // Q21: One Pair vs Two Pair (hand2 wins)
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Ah', 'Ad', 'Kc', 'Qs', '10h'], name: 'Pair of Aces' },
      hand2: { cards: ['5h', '5d', '3c', '3s', '9h'], name: 'Fives and Threes' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand2',
    explanation:
      'Two Pair always beats One Pair, even when the single pair is Aces. Having two separate pairs is a stronger hand category than any single pair.',
    xpValue: 15,
  },

  // Q22: Higher Three of a Kind vs lower
  {
    type: 'HAND_COMPARE',
    difficulty: 2,
    content: {
      hand1: { cards: ['Jh', 'Jd', 'Jc', 'Ah', '9s'], name: 'Three Jacks' },
      hand2: { cards: ['8h', '8d', '8c', 'Ac', 'Ks'], name: 'Three Eights' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'When both players have Three of a Kind, the higher-ranked trips win. Three Jacks beats Three Eights, regardless of kickers.',
    xpValue: 15,
  },

  // --- HARD HAND_COMPARE (8) ---

  // Q23: Ace-high Flush vs King-high Flush (existing)
  {
    type: 'HAND_COMPARE',
    difficulty: 3,
    content: {
      hand1: { cards: ['Ah', 'Kh', 'Qh', 'Jh', '2h'], name: 'Ace-high Flush' },
      hand2: { cards: ['Kd', 'Qd', 'Jd', '10d', '9d'], name: 'King-high Flush' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'When comparing Flushes, the highest card determines the winner. Ace-high beats King-high, even though the King-high Flush has stronger lower cards.',
    xpValue: 20,
  },

  // Q24: Nines Full vs Eights Full (existing)
  {
    type: 'HAND_COMPARE',
    difficulty: 3,
    content: {
      hand1: { cards: ['9h', '9d', '9c', '5s', '5h'], name: 'Nines Full of Fives' },
      hand2: { cards: ['8h', '8d', '8c', 'As', 'Ad'], name: 'Eights Full of Aces' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'In Full Houses, the three-of-a-kind part determines the winner. Nines beat Eights, regardless of the pair. The Ace pair does not help.',
    xpValue: 20,
  },

  // Q25: Higher Four of a Kind vs lower
  {
    type: 'HAND_COMPARE',
    difficulty: 3,
    content: {
      hand1: { cards: ['Jh', 'Jd', 'Jc', 'Js', '2h'], name: 'Four Jacks' },
      hand2: { cards: ['10h', '10d', '10c', '10s', 'Ac'], name: 'Four Tens' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'When both players have Four of a Kind, the higher-ranked quad wins. Four Jacks beats Four Tens. The Ace kicker on the Tens does not matter.',
    xpValue: 20,
  },

  // Q26: Higher Straight Flush vs lower
  {
    type: 'HAND_COMPARE',
    difficulty: 3,
    content: {
      hand1: { cards: ['10c', 'Jc', 'Qc', 'Kc', 'Ac'], name: 'Royal Flush' },
      hand2: { cards: ['9s', '10s', 'Js', 'Qs', 'Ks'], name: 'King-high Straight Flush' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'A Royal Flush is simply the highest Straight Flush (10-J-Q-K-A of one suit). It beats all other Straight Flushes, including a King-high one.',
    xpValue: 20,
  },

  // Q27: Flush comparison where second card decides
  {
    type: 'HAND_COMPARE',
    difficulty: 3,
    content: {
      hand1: { cards: ['As', 'Qs', '8s', '5s', '3s'], name: 'Ace-Queen-high Flush' },
      hand2: { cards: ['Ac', 'Jc', '10c', '9c', '7c'], name: 'Ace-Jack-high Flush' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Both Flushes have an Ace, so we compare the second card. Queen beats Jack, so the Ace-Queen Flush wins. You go down the cards one by one until someone is higher.',
    xpValue: 20,
  },

  // Q28: Two Pair vs Two Pair - same top pair, second pair decides
  {
    type: 'HAND_COMPARE',
    difficulty: 3,
    content: {
      hand1: { cards: ['Ah', 'Ad', '10s', '10c', '5h'], name: 'Aces and Tens' },
      hand2: { cards: ['Ac', 'As', '6h', '6d', 'Kc'], name: 'Aces and Sixes' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Both have Aces as the top pair, so the second pair decides. Tens beat Sixes. The King kicker on hand2 is irrelevant because the second pair already broke the tie.',
    xpValue: 20,
  },

  // Q29: High Card - goes to third card
  {
    type: 'HAND_COMPARE',
    difficulty: 3,
    content: {
      hand1: { cards: ['Ah', 'Kd', 'Qs', '8c', '4h'], name: 'A-K-Q-8-4' },
      hand2: { cards: ['Ac', 'Kh', 'Jd', '10s', '9c'], name: 'A-K-J-10-9' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Both have Ace-King high. The third card breaks the tie: Queen beats Jack. Even though hand2 has stronger fourth and fifth cards, the comparison stops as soon as one card is higher.',
    xpValue: 20,
  },

  // Q30: Same pair, kicker goes to second kicker
  {
    type: 'HAND_COMPARE',
    difficulty: 3,
    content: {
      hand1: { cards: ['10h', '10d', 'As', 'Jc', '4h'], name: 'Pair of Tens (A-J kickers)' },
      hand2: { cards: ['10c', '10s', 'Ah', '9d', '8c'], name: 'Pair of Tens (A-9 kickers)' },
      question: 'Which hand wins?',
    },
    correctAnswer: 'hand1',
    explanation:
      'Both have a pair of Tens with an Ace as the first kicker. The second kicker decides: Jack beats Nine. In poker, kickers can go as deep as the fifth card.',
    xpValue: 20,
  },

  // ============================================================
  // HAND_RANK questions (20 total)
  // ============================================================

  // --- EASY HAND_RANK (5) ---

  // Q31: Identify Full House (existing)
  {
    type: 'HAND_RANK',
    difficulty: 1,
    content: {
      hand: { cards: ['Ah', 'Ad', 'Ac', 'Kh', 'Kd'] },
      question: 'What is this hand called?',
      options: ['Full House', 'Three of a Kind', 'Two Pair'],
    },
    correctAnswer: 'Full House',
    explanation:
      'A Full House is three cards of one rank plus two cards of another rank (a pair). This hand has three Aces and two Kings - a powerful Full House.',
    xpValue: 10,
  },

  // Q32: Identify High Card (existing)
  {
    type: 'HAND_RANK',
    difficulty: 1,
    content: {
      hand: { cards: ['2c', '5d', '8h', 'Js', 'Ad'] },
      question: 'What is this hand called?',
      options: ['High Card', 'One Pair', 'Straight'],
    },
    correctAnswer: 'High Card',
    explanation:
      'When you have no pair, straight, flush, or other combination, you have High Card. Your hand strength is determined by your highest card (Ace in this case).',
    xpValue: 10,
  },

  // Q33: Identify One Pair
  {
    type: 'HAND_RANK',
    difficulty: 1,
    content: {
      hand: { cards: ['Kh', 'Kd', '9s', '6c', '2h'] },
      question: 'What is this hand called?',
      options: ['One Pair', 'Two Pair', 'High Card'],
    },
    correctAnswer: 'One Pair',
    explanation:
      'One Pair means exactly two cards of the same rank. Here you have two Kings. The other three cards are all different ranks, so it is just One Pair.',
    xpValue: 10,
  },

  // Q34: Identify Two Pair
  {
    type: 'HAND_RANK',
    difficulty: 1,
    content: {
      hand: { cards: ['Jh', 'Jd', '7s', '7c', 'Ah'] },
      question: 'What is this hand called?',
      options: ['Two Pair', 'Full House', 'One Pair'],
    },
    correctAnswer: 'Two Pair',
    explanation:
      'Two Pair means you have two separate pairs - here, Jacks and Sevens. A Full House would require three of one rank, not just two pairs.',
    xpValue: 10,
  },

  // Q35: Identify Three of a Kind
  {
    type: 'HAND_RANK',
    difficulty: 1,
    content: {
      hand: { cards: ['8h', '8d', '8c', 'Ks', '4h'] },
      question: 'What is this hand called?',
      options: ['Three of a Kind', 'Full House', 'One Pair'],
    },
    correctAnswer: 'Three of a Kind',
    explanation:
      'Three of a Kind (also called "trips" or "a set") means three cards of the same rank. Here you have three Eights. Since the other two cards are not a pair, it is not a Full House.',
    xpValue: 10,
  },

  // --- MEDIUM HAND_RANK (9) ---

  // Q36: Identify Straight
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['4h', '5c', '6d', '7s', '8h'] },
      question: 'What is this hand called?',
      options: ['Straight', 'Flush', 'High Card'],
    },
    correctAnswer: 'Straight',
    explanation:
      'A Straight is five cards in consecutive order (4-5-6-7-8). The suits do not matter for a Straight - they just need to be sequential.',
    xpValue: 15,
  },

  // Q37: Identify Flush
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['3d', '7d', '10d', 'Jd', 'Ad'] },
      question: 'What is this hand called?',
      options: ['Flush', 'Straight', 'Full House'],
    },
    correctAnswer: 'Flush',
    explanation:
      'A Flush is five cards of the same suit (all diamonds here). They do not need to be in order. If they were also in sequence, it would be a Straight Flush.',
    xpValue: 15,
  },

  // Q38: Identify Straight Flush
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['3c', '4c', '5c', '6c', '7c'] },
      question: 'What is this hand called?',
      options: ['Straight Flush', 'Flush', 'Straight'],
    },
    correctAnswer: 'Straight Flush',
    explanation:
      'A Straight Flush combines a Straight and a Flush: five consecutive cards of the same suit. It is the second-best hand in poker (only a Royal Flush is higher).',
    xpValue: 15,
  },

  // Q39: Identify Four of a Kind
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['Qh', 'Qd', 'Qc', 'Qs', '5h'] },
      question: 'What is this hand called?',
      options: ['Four of a Kind', 'Full House', 'Three of a Kind'],
    },
    correctAnswer: 'Four of a Kind',
    explanation:
      'Four of a Kind (also called "quads") means all four cards of the same rank. Here you have all four Queens. This is the third-best hand in poker.',
    xpValue: 15,
  },

  // Q40: Tricky - Is this a Straight? (no, gap)
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['4h', '5d', '6s', '7c', '9h'] },
      question: 'What is this hand called?',
      options: ['High Card', 'Straight', 'One Pair'],
    },
    correctAnswer: 'High Card',
    explanation:
      'This is NOT a Straight. The cards go 4-5-6-7 then skip to 9 (missing the 8). All five cards must be consecutive with no gaps. Without a pair or other combination, this is just High Card.',
    xpValue: 15,
  },

  // Q41: Tricky - Full House or Three of a Kind?
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['6h', '6d', '6c', 'Ks', 'Kd'] },
      question: 'What is this hand called?',
      options: ['Full House', 'Three of a Kind', 'Two Pair'],
    },
    correctAnswer: 'Full House',
    explanation:
      'Three Sixes plus a pair of Kings makes a Full House. A Full House always has exactly three of one rank and two of another. If those Kings were different ranks, it would be Three of a Kind.',
    xpValue: 15,
  },

  // Q42: Identify the Wheel
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['Ac', '2d', '3h', '4s', '5c'] },
      question: 'What is this hand called?',
      options: ['Straight (the Wheel)', 'High Card', 'One Pair'],
    },
    correctAnswer: 'Straight (the Wheel)',
    explanation:
      'A-2-3-4-5 is a valid Straight called "the Wheel." The Ace plays low here, making it the lowest possible Straight. This is a special rule many beginners miss.',
    xpValue: 15,
  },

  // Q43: Tricky - Flush or Straight Flush?
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['2h', '4h', '6h', '8h', '10h'] },
      question: 'What is this hand called?',
      options: ['Flush', 'Straight Flush', 'Straight'],
    },
    correctAnswer: 'Flush',
    explanation:
      'All five cards are hearts (Flush), but they are NOT consecutive (2-4-6-8-10 skips every other card). For a Straight Flush, the cards must be both suited AND in sequence.',
    xpValue: 15,
  },

  // Q44: Near-miss Straight (wrap-around does not count)
  {
    type: 'HAND_RANK',
    difficulty: 2,
    content: {
      hand: { cards: ['Qs', 'Kd', 'Ah', '2c', '3s'] },
      question: 'What is this hand called?',
      options: ['High Card', 'Straight', 'One Pair'],
    },
    correctAnswer: 'High Card',
    explanation:
      'Q-K-A-2-3 is NOT a valid Straight. In poker, straights cannot wrap around. The Ace can be high (10-J-Q-K-A) or low (A-2-3-4-5), but not both in the same hand.',
    xpValue: 15,
  },

  // --- HARD HAND_RANK (6) ---

  // Q45: Subtle - Royal Flush identification
  {
    type: 'HAND_RANK',
    difficulty: 3,
    content: {
      hand: { cards: ['10d', 'Jd', 'Qd', 'Kd', 'Ad'] },
      question: 'What is the specific name for this hand?',
      options: ['Royal Flush', 'Straight Flush', 'Flush'],
    },
    correctAnswer: 'Royal Flush',
    explanation:
      'A Royal Flush is the Ace-high Straight Flush: 10-J-Q-K-A all of the same suit. It is technically a Straight Flush, but it has its own special name as the best possible hand in poker.',
    xpValue: 20,
  },

  // Q46: Tricky - Two Pair or Full House?
  {
    type: 'HAND_RANK',
    difficulty: 3,
    content: {
      hand: { cards: ['Ah', 'Ad', 'Kh', 'Kd', 'As'] },
      question: 'What is this hand called?',
      options: ['Full House', 'Two Pair', 'Three of a Kind'],
    },
    correctAnswer: 'Full House',
    explanation:
      'Look carefully: there are three Aces (Ah, Ad, As) and two Kings (Kh, Kd). This is a Full House (Aces full of Kings), not Two Pair. Count the cards of each rank carefully.',
    xpValue: 20,
  },

  // Q47: One Pair where it looks like High Card
  {
    type: 'HAND_RANK',
    difficulty: 3,
    content: {
      hand: { cards: ['2h', '5d', '9s', 'Kc', '9h'] },
      question: 'What is this hand called?',
      options: ['One Pair', 'High Card', 'Two Pair'],
    },
    correctAnswer: 'One Pair',
    explanation:
      'The two Nines (9s and 9h) form a pair, even though they are not next to each other in the listing. Always check all five cards for pairs, even when they appear spread apart.',
    xpValue: 20,
  },

  // Q48: Is A-2-3-4-5 suited a Straight Flush or just a Straight?
  {
    type: 'HAND_RANK',
    difficulty: 3,
    content: {
      hand: { cards: ['As', '2s', '3s', '4s', '5s'] },
      question: 'What is this hand called?',
      options: ['Straight Flush', 'Flush', 'Straight'],
    },
    correctAnswer: 'Straight Flush',
    explanation:
      'A-2-3-4-5 all in spades is a Straight Flush (the lowest one, called a "steel wheel"). The Ace plays low to make the Straight, and all cards share a suit, so it qualifies as a Straight Flush.',
    xpValue: 20,
  },

  // Q49: Tricky - Full House where pair is higher than trips
  {
    type: 'HAND_RANK',
    difficulty: 3,
    content: {
      hand: { cards: ['3h', '3d', '3c', 'Ah', 'Ad'] },
      question: 'What is this hand called?',
      options: ['Full House', 'Three of a Kind', 'Two Pair'],
    },
    correctAnswer: 'Full House',
    explanation:
      'Three Threes and two Aces is still a Full House (Threes full of Aces). The pair being higher-ranked than the trips does not change the hand name. It would lose to a higher Full House like Fours full of anything.',
    xpValue: 20,
  },

  // Q50: Disguised Two Pair
  {
    type: 'HAND_RANK',
    difficulty: 3,
    content: {
      hand: { cards: ['4c', 'Qd', '4d', '9h', 'Qh'] },
      question: 'What is this hand called?',
      options: ['Two Pair', 'One Pair', 'Full House'],
    },
    correctAnswer: 'Two Pair',
    explanation:
      'There are two Fours (4c, 4d) and two Queens (Qd, Qh). That makes Two Pair: Queens and Fours. For a Full House you would need three of one rank, which this hand does not have.',
    xpValue: 20,
  },
];
