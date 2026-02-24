export const preflopQuestions = [
  // ============================================================
  // PLAY_FOLD questions (20 total)
  // ============================================================

  // --- Easy PLAY_FOLD (6) ---
  {
    type: 'PLAY_FOLD',
    difficulty: 1,
    content: {
      hand: ['As', 'Ah'],
      position: 'UTG',
      question: 'You are Under the Gun with pocket Aces. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'Pocket Aces is the best starting hand in poker. Always raise with it from every position.',
    xpValue: 10,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 1,
    content: {
      hand: ['Kd', 'Kc'],
      position: 'MP',
      question: 'You are in Middle Position with pocket Kings. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'Pocket Kings is the second-best starting hand. Always raise from any position.',
    xpValue: 10,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 1,
    content: {
      hand: ['7c', '2d'],
      position: 'UTG',
      question: 'You are Under the Gun with 7-2 offsuit. Play or Fold?',
    },
    correctAnswer: 'Fold',
    explanation:
      '7-2 offsuit is the worst starting hand in poker. The cards are unconnected, unsuited, and too low to make strong hands. Always fold.',
    xpValue: 10,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 1,
    content: {
      hand: ['Qh', 'Qs'],
      position: 'CO',
      question: 'You are in the Cutoff with pocket Queens. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'Pocket Queens is a premium hand. Raise from any position. Only AA and KK are better.',
    xpValue: 10,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 1,
    content: {
      hand: ['8d', '3c'],
      position: 'MP',
      question: 'You are in Middle Position with 8-3 offsuit. Play or Fold?',
    },
    correctAnswer: 'Fold',
    explanation:
      '8-3 offsuit is a trash hand. The cards are too far apart for a straight and not suited for a flush. Fold from every position.',
    xpValue: 10,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 1,
    content: {
      hand: ['Ad', 'Ks'],
      position: 'BTN',
      question: 'You are on the Button with Ace-King suited. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'AKs (Ace-King suited) is a premium hand. It can make the best pair, the best straight, and a nut flush. Always raise.',
    xpValue: 10,
  },

  // --- Medium PLAY_FOLD (8) ---
  {
    type: 'PLAY_FOLD',
    difficulty: 2,
    content: {
      hand: ['9h', '8h'],
      position: 'BTN',
      question: 'You are on the Button with 9-8 suited. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'Suited connectors like 9-8 suited are marginal hands, but they play well from the Button. You have position and can make straights and flushes.',
    xpValue: 15,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 2,
    content: {
      hand: ['9s', '8d'],
      position: 'UTG',
      question: 'You are Under the Gun with 9-8 offsuit. Play or Fold?',
    },
    correctAnswer: 'Fold',
    explanation:
      'While 9-8 suited is playable from late position, the offsuit version is trash from early position. Without the flush potential and with many players behind you, fold.',
    xpValue: 15,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 2,
    content: {
      hand: ['Ah', '5h'],
      position: 'CO',
      question: 'You are in the Cutoff with Ace-5 suited. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'Suited Aces are marginal hands with great potential. From late position, A5s gives you nut flush draws, a wheel straight draw, and fold equity when raising.',
    xpValue: 15,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 2,
    content: {
      hand: ['Jc', '4d'],
      position: 'MP',
      question: 'You are in Middle Position with Jack-4 offsuit. Play or Fold?',
    },
    correctAnswer: 'Fold',
    explanation:
      'J-4 offsuit is a trash hand. The gap between the cards is too wide, they are not suited, and the Jack is easily dominated. Fold from all positions.',
    xpValue: 15,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 2,
    content: {
      hand: ['10h', '10d'],
      position: 'UTG',
      question: 'You are Under the Gun with pocket Tens. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'Pocket Tens is a strong hand that you should raise from any position, including UTG. It is the fifth-best starting hand in poker.',
    xpValue: 15,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 2,
    content: {
      hand: ['Kh', 'Jh'],
      position: 'CO',
      question: 'You are in the Cutoff with King-Jack suited. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'KJs is a playable hand from middle position and later. From the Cutoff, raise to steal the blinds or play a pot in position.',
    xpValue: 15,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 2,
    content: {
      hand: ['6h', '5h'],
      position: 'BTN',
      question: 'You are on the Button with 6-5 suited. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'Small suited connectors like 6-5 suited are marginal but profitable from the Button. They can flop strong draws and hidden monsters.',
    xpValue: 15,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 2,
    content: {
      hand: ['Ac', 'Qd'],
      position: 'MP',
      question: 'You are in Middle Position with Ace-Queen offsuit. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'AQo is a playable hand from middle position. It makes strong top-pair hands and dominates weaker Aces and Queens.',
    xpValue: 15,
  },

  // --- Hard PLAY_FOLD (6) ---
  {
    type: 'PLAY_FOLD',
    difficulty: 3,
    content: {
      hand: ['Kd', '10c'],
      position: 'UTG',
      question: 'You are Under the Gun with King-10 offsuit. Play or Fold?',
    },
    correctAnswer: 'Fold',
    explanation:
      'K10o is a trap hand from early position. It looks decent but is dominated by AK, KQ, and KJ, which are all in a typical UTG range. Fold and wait for a better spot.',
    xpValue: 20,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 3,
    content: {
      hand: ['Kd', '10c'],
      position: 'BTN',
      question: 'You are on the Button with King-10 offsuit. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'The same K10o that is a fold from UTG becomes a raise on the Button. Position changes everything. With only the blinds left to act, you can play a wide range profitably.',
    xpValue: 20,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 3,
    content: {
      hand: ['5s', '5d'],
      position: 'UTG',
      question: 'You are Under the Gun with pocket Fives. Play or Fold?',
    },
    correctAnswer: 'Fold',
    explanation:
      'Small pocket pairs like 55 are marginal. From UTG you need a strong range, and 55 does not qualify. It rarely wins unimproved and you are out of position for the whole hand.',
    xpValue: 20,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 3,
    content: {
      hand: ['Qs', 'Jd'],
      position: 'UTG',
      question: 'You are Under the Gun with Queen-Jack offsuit. Play or Fold?',
    },
    correctAnswer: 'Fold',
    explanation:
      'QJo is a marginal hand that should not be opened from UTG. It is dominated by AQ, AJ, KQ, and even KJ. From late position it would be playable, but not here.',
    xpValue: 20,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 3,
    content: {
      hand: ['As', '9s'],
      position: 'MP',
      question: 'You are in Middle Position with Ace-9 suited. Play or Fold?',
    },
    correctAnswer: 'Play',
    explanation:
      'A9s is a playable hand from middle position. The suited Ace gives you nut flush potential, and it is strong enough to open from MP where Playable-tier hands are in range.',
    xpValue: 20,
  },
  {
    type: 'PLAY_FOLD',
    difficulty: 3,
    content: {
      hand: ['7h', '6h'],
      position: 'UTG',
      question: 'You are Under the Gun with 7-6 suited. Play or Fold?',
    },
    correctAnswer: 'Fold',
    explanation:
      '7-6 suited is a marginal suited connector. While great from late position, it is too speculative for UTG where you need Premium or Strong hands.',
    xpValue: 20,
  },

  // ============================================================
  // PREFLOP questions (12 total)
  // ============================================================

  // --- Easy PREFLOP (3) ---
  {
    type: 'PREFLOP',
    difficulty: 1,
    content: {
      hand: ['Ah', 'Kd'],
      position: 'MP',
      action: 'First to act',
      question: 'You have AK offsuit in Middle Position. No one has entered the pot. What should you do?',
      options: ['Raise', 'Limp', 'Fold'],
    },
    correctAnswer: 'Raise',
    explanation:
      'AKo is a strong hand you should always raise with. Limping lets too many players in cheaply and gives up the initiative.',
    xpValue: 10,
  },
  {
    type: 'PREFLOP',
    difficulty: 1,
    content: {
      question: 'Why is raising generally better than limping (just calling the big blind)?',
      options: [
        'It can win the pot immediately and builds a bigger pot with good hands',
        'It saves you money if you lose',
        'It lets you see more community cards',
      ],
    },
    correctAnswer:
      'It can win the pot immediately and builds a bigger pot with good hands',
    explanation:
      'Raising has two benefits: opponents may fold (you win the blinds uncontested), and when called you build a bigger pot with hands that have an edge.',
    xpValue: 10,
  },
  {
    type: 'PREFLOP',
    difficulty: 1,
    content: {
      question: 'What does it mean when a hand is "suited"?',
      options: [
        'Both cards are the same suit (can make flushes)',
        'Both cards are the same rank',
        'The cards are next to each other in rank',
      ],
    },
    correctAnswer: 'Both cards are the same suit (can make flushes)',
    explanation:
      'Suited means both hole cards share the same suit (e.g., both hearts). This adds flush potential, making suited hands worth more than their offsuit versions.',
    xpValue: 10,
  },

  // --- Medium PREFLOP (5) ---
  {
    type: 'PREFLOP',
    difficulty: 2,
    content: {
      hand: ['Jd', '10d'],
      position: 'BTN',
      action: 'Folded to you',
      question: 'Folded to you on the Button with J-10 suited. What should you do?',
      options: ['Raise', 'Fold', 'Limp'],
    },
    correctAnswer: 'Raise',
    explanation:
      'JTs is a playable hand and the Button is the best position. When folded to you, raise to steal the blinds or play a pot in position.',
    xpValue: 15,
  },
  {
    type: 'PREFLOP',
    difficulty: 2,
    content: {
      hand: ['As', '2s'],
      position: 'UTG',
      action: 'First to act',
      question: 'You have A-2 suited Under the Gun. What should you do?',
      options: ['Fold', 'Raise', 'Limp'],
    },
    correctAnswer: 'Fold',
    explanation:
      'A2s is a marginal hand. While it has nut flush potential, from UTG you need Premium or Strong hands. Save this for late position.',
    xpValue: 15,
  },
  {
    type: 'PREFLOP',
    difficulty: 2,
    content: {
      hand: ['As', '5s'],
      position: 'SB',
      action: 'Folded to you',
      question: 'In the Small Blind, folded to you. You have Ace-5 suited. What should you do?',
      options: ['Raise', 'Complete (limp)', 'Fold'],
    },
    correctAnswer: 'Raise',
    explanation:
      'A5s is a raising hand heads-up versus the Big Blind. Raising applies pressure, and you have flush and wheel straight potential if called.',
    xpValue: 15,
  },
  {
    type: 'PREFLOP',
    difficulty: 2,
    content: {
      question: 'How much should a standard preflop raise be in a No-Limit game?',
      options: ['2.5 to 3 times the big blind', 'Exactly the big blind', 'Always go all-in'],
    },
    correctAnswer: '2.5 to 3 times the big blind',
    explanation:
      'A standard open raise is 2.5x to 3x the big blind. This is large enough to narrow the field but small enough to not risk too much with weaker hands.',
    xpValue: 15,
  },
  {
    type: 'PREFLOP',
    difficulty: 2,
    content: {
      hand: ['8c', '8d'],
      position: 'MP',
      action: 'First to act',
      question: 'You have pocket Eights in Middle Position. What should you do?',
      options: ['Raise', 'Fold', 'Limp'],
    },
    correctAnswer: 'Raise',
    explanation:
      'Pocket Eights is a playable hand from Middle Position. Raise to take the initiative. If you flop a set (third Eight), you can win a big pot.',
    xpValue: 15,
  },

  // --- Hard PREFLOP (4) ---
  {
    type: 'PREFLOP',
    difficulty: 3,
    content: {
      hand: ['Ks', 'Qc'],
      position: 'CO',
      action: 'UTG raised 3x',
      question: 'UTG raises. You have KQ offsuit in the Cutoff. What should you do?',
      options: ['Call', 'Fold', 'Raise (3-bet)'],
    },
    correctAnswer: 'Call',
    explanation:
      'KQo is strong but not premium. Against an UTG raise (typically a tight range), calling to see a flop is safest. 3-betting risks running into AA, KK, or AK.',
    xpValue: 20,
  },
  {
    type: 'PREFLOP',
    difficulty: 3,
    content: {
      hand: ['6s', '5s'],
      position: 'BTN',
      action: 'MP raised, CO called',
      question: 'With 6-5 suited on the Button, facing a raise and a call, what should you do?',
      options: ['Call', 'Fold', 'Raise'],
    },
    correctAnswer: 'Call',
    explanation:
      'Small suited connectors play well in multiway pots with position. You are getting great implied odds to hit a straight, flush, or two pair against two opponents.',
    xpValue: 20,
  },
  {
    type: 'PREFLOP',
    difficulty: 3,
    content: {
      hand: ['Ah', 'Ac'],
      position: 'BTN',
      action: 'UTG raised, MP 3-bet',
      question: 'You have pocket Aces on the Button. UTG raised and MP 3-bet. What should you do?',
      options: ['4-bet (raise again)', 'Just call', 'Fold'],
    },
    correctAnswer: '4-bet (raise again)',
    explanation:
      'With pocket Aces facing a 3-bet, you should always 4-bet. You have the best hand and want to build the pot. Slow-playing Aces is a common beginner mistake.',
    xpValue: 20,
  },
  {
    type: 'PREFLOP',
    difficulty: 3,
    content: {
      hand: ['Ac', 'Jd'],
      position: 'UTG',
      action: 'First to act',
      question: 'You have AJ offsuit Under the Gun. What should you do?',
      options: ['Fold', 'Raise', 'Limp'],
    },
    correctAnswer: 'Fold',
    explanation:
      'AJo is a playable hand from middle position, but from UTG it is not strong enough. You are dominated by AK and AQ, both of which are in typical UTG opening ranges.',
    xpValue: 20,
  },

  // ============================================================
  // HAND_CATEGORY questions (8 total)
  // ============================================================

  // --- Easy HAND_CATEGORY (3) ---
  {
    type: 'HAND_CATEGORY',
    difficulty: 1,
    content: {
      hand: ['As', 'Ad'],
      question: 'How would you categorize this hand?',
      options: ['Premium', 'Strong', 'Playable', 'Marginal'],
    },
    correctAnswer: 'Premium',
    explanation:
      'Pocket Aces is the ultimate premium hand. It is the best starting hand in poker and should be raised from every position.',
    xpValue: 10,
  },
  {
    type: 'HAND_CATEGORY',
    difficulty: 1,
    content: {
      hand: ['9c', '3d'],
      question: 'How would you categorize this hand?',
      options: ['Trash', 'Marginal', 'Playable', 'Strong'],
    },
    correctAnswer: 'Trash',
    explanation:
      '9-3 offsuit is a trash hand. The cards are unconnected, unsuited, and neither is high enough to make a strong pair. Fold from every position.',
    xpValue: 10,
  },
  {
    type: 'HAND_CATEGORY',
    difficulty: 1,
    content: {
      question: 'Which of these starting hands is the strongest?',
      options: ['AA', 'AKs', 'KK'],
    },
    correctAnswer: 'AA',
    explanation:
      'Pocket Aces (AA) is the strongest starting hand, winning roughly 85% heads-up against a random hand. KK is second and AKs is the best non-pair.',
    xpValue: 10,
  },

  // --- Medium HAND_CATEGORY (3) ---
  {
    type: 'HAND_CATEGORY',
    difficulty: 2,
    content: {
      hand: ['Jh', 'Jc'],
      question: 'How would you categorize this hand?',
      options: ['Strong', 'Premium', 'Playable', 'Marginal'],
    },
    correctAnswer: 'Strong',
    explanation:
      'Pocket Jacks is a strong hand. It is very good but not premium because overcards (Queens, Kings, Aces) frequently appear on the flop.',
    xpValue: 15,
  },
  {
    type: 'HAND_CATEGORY',
    difficulty: 2,
    content: {
      hand: ['Qs', 'Js'],
      question: 'How would you categorize this hand?',
      options: ['Playable', 'Strong', 'Premium', 'Marginal'],
    },
    correctAnswer: 'Playable',
    explanation:
      'QJs is a playable hand. It can make strong straights and flushes, but it is not powerful enough to be in the Strong or Premium tier.',
    xpValue: 15,
  },
  {
    type: 'HAND_CATEGORY',
    difficulty: 2,
    content: {
      hand: ['10s', '9s'],
      question: 'How would you categorize this hand?',
      options: ['Marginal', 'Playable', 'Strong', 'Trash'],
    },
    correctAnswer: 'Marginal',
    explanation:
      'T9s is a marginal hand. It is a suited connector with straight and flush potential, making it profitable from late position but too weak for early position.',
    xpValue: 15,
  },

  // --- Hard HAND_CATEGORY (2) ---
  {
    type: 'HAND_CATEGORY',
    difficulty: 3,
    content: {
      hand: ['Ah', 'Qh'],
      question: 'How would you categorize this hand?',
      options: ['Strong', 'Premium', 'Playable', 'Marginal'],
    },
    correctAnswer: 'Strong',
    explanation:
      'AQs is a strong hand, just below premium. It makes top pair with a great kicker and has nut flush potential. Open-raise from any position.',
    xpValue: 20,
  },
  {
    type: 'HAND_CATEGORY',
    difficulty: 3,
    content: {
      hand: ['Kc', 'Jd'],
      question: 'How would you categorize this hand?',
      options: ['Marginal', 'Strong', 'Playable', 'Trash'],
    },
    correctAnswer: 'Marginal',
    explanation:
      'KJo is a marginal hand. It looks appealing with two high cards, but the offsuit nature and the gap between suited and offsuit make it only playable from late position.',
    xpValue: 20,
  },
];
