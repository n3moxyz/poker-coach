import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.userAnswer.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userStreak.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.user.deleteMany();
  await prisma.question.deleteMany();
  await prisma.module.deleteMany();
  await prisma.achievement.deleteMany();

  // Create modules - 10 module curriculum
  const modules = await Promise.all([
    // Module 1: Hand Rankings (Heads-Up)
    prisma.module.create({
      data: {
        slug: 'hand-rankings',
        name: 'Hand Rankings',
        description: 'Learn the 10 poker hand rankings from high card to royal flush. Compare two hands and pick the winner.',
        difficulty: 1,
        orderIndex: 1,
        unlockRequirement: 0,
        iconEmoji: '🃏',
        masteryXpBonus: 500,
      },
    }),
    // Module 2: Board Reading (Multi-Way) - Extension of Module 1
    prisma.module.create({
      data: {
        slug: 'board-reading',
        name: 'Board Reading',
        description: 'Read real showdowns with community cards and multiple players. Find the winner from 7-card hands.',
        difficulty: 1,
        orderIndex: 2,
        unlockRequirement: 75,
        iconEmoji: '🧠',
        masteryXpBonus: 500,
      },
    }),
    // Module 3: How a Poker Hand Works
    prisma.module.create({
      data: {
        slug: 'hand-flow',
        name: 'How a Hand Works',
        description: 'Learn the flow of a poker hand: blinds, betting rounds, and available actions at each street.',
        difficulty: 1,
        orderIndex: 3,
        unlockRequirement: 150,
        iconEmoji: '🔄',
        masteryXpBonus: 500,
      },
    }),
    // Module 4: Table Position
    prisma.module.create({
      data: {
        slug: 'position',
        name: 'Table Position',
        description: 'Understand why acting later gives you power. Learn the 9 positions and their strategic value.',
        difficulty: 1,
        orderIndex: 4,
        unlockRequirement: 250,
        iconEmoji: '🪑',
        masteryXpBonus: 500,
      },
    }),
    // Module 5: Starting Hands & Preflop
    prisma.module.create({
      data: {
        slug: 'preflop',
        name: 'Starting Hands',
        description: 'Master play/fold discipline. Learn which hands to play from each position.',
        difficulty: 2,
        orderIndex: 5,
        unlockRequirement: 375,
        iconEmoji: '🎴',
        masteryXpBonus: 600,
      },
    }),
    // Module 6: Betting Basics
    prisma.module.create({
      data: {
        slug: 'betting-basics',
        name: 'Betting Basics',
        description: 'Understand why we bet: value, bluffs, and protection. Every bet needs a reason.',
        difficulty: 2,
        orderIndex: 6,
        unlockRequirement: 525,
        iconEmoji: '💰',
        masteryXpBonus: 600,
      },
    }),
    // Module 7: Flop Play
    prisma.module.create({
      data: {
        slug: 'flop-play',
        name: 'Flop Play',
        description: 'Categorize your hand strength on the flop. Learn when to bet, check, or fold postflop.',
        difficulty: 2,
        orderIndex: 7,
        unlockRequirement: 700,
        iconEmoji: '🌊',
        masteryXpBonus: 600,
      },
    }),
    // Module 8: Outs & Pot Odds
    prisma.module.create({
      data: {
        slug: 'pot-odds',
        name: 'Outs & Pot Odds',
        description: 'Count your outs, calculate pot odds, and make mathematically correct calls.',
        difficulty: 2,
        orderIndex: 8,
        unlockRequirement: 900,
        iconEmoji: '🧮',
        masteryXpBonus: 600,
      },
    }),
    // Module 9: Bluffing & Reading
    prisma.module.create({
      data: {
        slug: 'bluffing',
        name: 'Bluffing & Reading',
        description: 'Learn when to bluff and how to read betting patterns. Does the story make sense?',
        difficulty: 3,
        orderIndex: 9,
        unlockRequirement: 1125,
        iconEmoji: '😏',
        masteryXpBonus: 750,
      },
    }),
    // Module 10: Mental Game & First Games
    prisma.module.create({
      data: {
        slug: 'mental-game',
        name: 'Mental Game',
        description: 'Avoid common mistakes, manage tilt, and prepare for your first real money games.',
        difficulty: 3,
        orderIndex: 10,
        unlockRequirement: 1375,
        iconEmoji: '🧘',
        masteryXpBonus: 750,
      },
    }),
  ]);

  console.log(`✅ Created ${modules.length} modules`);

  // Create questions for Hand Rankings module
  const handRankingsModule = modules.find((m) => m.slug === 'hand-rankings')!;

  const handRankingQuestions = [
    {
      type: 'HAND_COMPARE',
      difficulty: 1,
      content: {
        hand1: { cards: ['As', 'Ks', 'Qs', 'Js', '10s'], name: 'Royal Flush' },
        hand2: { cards: ['9h', '8h', '7h', '6h', '5h'], name: 'Straight Flush' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'A Royal Flush (A-K-Q-J-10 of the same suit) is the highest possible hand in poker, beating all other hands including a Straight Flush.',
      xpValue: 10,
    },
    {
      type: 'HAND_COMPARE',
      difficulty: 1,
      content: {
        hand1: { cards: ['Kh', 'Kd', 'Kc', 'Ks', '3h'], name: 'Four of a Kind' },
        hand2: { cards: ['Ah', 'Ad', 'Ac', 'Qh', 'Qd'], name: 'Full House' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'Four of a Kind (four cards of the same rank) beats a Full House (three of a kind plus a pair). Quads are the third-highest hand.',
      xpValue: 10,
    },
    {
      type: 'HAND_COMPARE',
      difficulty: 1,
      content: {
        hand1: { cards: ['7d', '8d', '9d', '10d', 'Jd'], name: 'Straight Flush' },
        hand2: { cards: ['Ah', 'Ad', 'Ac', 'As', 'Kh'], name: 'Four of a Kind' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'A Straight Flush (five consecutive cards of the same suit) beats Four of a Kind. Its the second-highest hand after Royal Flush.',
      xpValue: 10,
    },
    {
      type: 'HAND_COMPARE',
      difficulty: 2,
      content: {
        hand1: { cards: ['Ah', 'Kh', '3h', '7h', '9h'], name: 'Flush' },
        hand2: { cards: ['5c', '6d', '7h', '8s', '9c'], name: 'Straight' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'A Flush (five cards of the same suit) beats a Straight (five consecutive cards). The Flush is ranked 5th, Straight is 6th.',
      xpValue: 15,
    },
    {
      type: 'HAND_COMPARE',
      difficulty: 2,
      content: {
        hand1: { cards: ['Qh', 'Qd', 'Qc', '5s', '8h'], name: 'Three of a Kind' },
        hand2: { cards: ['Ah', 'Ad', 'Ks', 'Kd', '3c'], name: 'Two Pair' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'Three of a Kind beats Two Pair. Even though Two Pair has more paired cards, trips rank higher.',
      xpValue: 15,
    },
    {
      type: 'HAND_RANK',
      difficulty: 1,
      content: {
        hand: { cards: ['Ah', 'Ad', 'Ac', 'Kh', 'Kd'] },
        question: 'What is this hand called?',
        options: ['Full House', 'Three of a Kind', 'Two Pair'],
      },
      correctAnswer: 'Full House',
      explanation: 'A Full House is three cards of one rank plus two cards of another rank (a pair). This hand has three Aces and two Kings.',
      xpValue: 10,
    },
    {
      type: 'HAND_RANK',
      difficulty: 1,
      content: {
        hand: { cards: ['2c', '5d', '8h', 'Js', 'Ad'] },
        question: 'What is this hand called?',
        options: ['High Card', 'One Pair', 'Straight'],
      },
      correctAnswer: 'High Card',
      explanation: 'When you have no pair, straight, flush, or other combination, you have High Card. Your hand strength is determined by your highest card (Ace in this case).',
      xpValue: 10,
    },
    {
      type: 'HAND_COMPARE',
      difficulty: 2,
      content: {
        hand1: { cards: ['Ah', 'Kc', 'Qd', 'Js', '10h'], name: 'Ace-high Straight' },
        hand2: { cards: ['5h', '4c', '3d', '2s', 'Ah'], name: 'Wheel (5-high Straight)' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'The Ace-high straight (Broadway) beats the 5-high straight (Wheel). In the Wheel, the Ace counts as low (A-2-3-4-5).',
      xpValue: 15,
    },
    {
      type: 'HAND_COMPARE',
      difficulty: 3,
      content: {
        hand1: { cards: ['Ah', 'Kh', 'Qh', 'Jh', '2h'], name: 'Ace-high Flush' },
        hand2: { cards: ['Kd', 'Qd', 'Jd', '10d', '9d'], name: 'King-high Flush' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'When comparing Flushes, the highest card determines the winner. Ace-high beats King-high.',
      xpValue: 20,
    },
    {
      type: 'HAND_COMPARE',
      difficulty: 3,
      content: {
        hand1: { cards: ['9h', '9d', '9c', '5s', '5h'], name: 'Nines Full of Fives' },
        hand2: { cards: ['8h', '8d', '8c', 'As', 'Ad'], name: 'Eights Full of Aces' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'In Full Houses, the three-of-a-kind determines the winner. Nines beat Eights, regardless of the pair.',
      xpValue: 20,
    },
  ];

  await prisma.question.createMany({
    data: handRankingQuestions.map((q) => ({
      ...q,
      moduleId: handRankingsModule.id,
      content: q.content,
    })),
  });

  // Create questions for Board Reading module (Module 2)
  const boardReadingModule = modules.find((m) => m.slug === 'board-reading')!;

  const boardReadingQuestions = [
    {
      type: 'MULTIWAY_SHOWDOWN',
      difficulty: 1,
      content: {
        board: ['Ah', 'Kd', '7c', '3s', '2h'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['As', 'Qc'] },
          { seat: 2, name: 'Player 2', cards: ['Kh', 'Ks'] },
          { seat: 3, name: 'Player 3', cards: ['7h', '7d'] },
        ],
        question: 'Who wins this showdown?',
      },
      correctAnswer: 'Player 2',
      explanation: 'Player 2 has three Kings (trip Kings). Player 3 has three 7s (trip 7s). Player 1 only has a pair of Aces. Three Kings beats three 7s.',
      xpValue: 15,
    },
    {
      type: 'MULTIWAY_SHOWDOWN',
      difficulty: 1,
      content: {
        board: ['Qh', 'Jd', '10c', '5s', '2h'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['Ah', 'Kc'] },
          { seat: 2, name: 'Player 2', cards: ['9h', '8s'] },
          { seat: 3, name: 'Player 3', cards: ['Qd', 'Qs'] },
        ],
        question: 'Who wins this showdown?',
      },
      correctAnswer: 'Player 1',
      explanation: 'Player 1 has a Broadway straight (A-K-Q-J-10). Player 3 has three Queens. A straight beats three of a kind.',
      xpValue: 15,
    },
    {
      type: 'MULTIWAY_SHOWDOWN',
      difficulty: 2,
      content: {
        board: ['Kh', 'Kd', '8c', '8s', '3h'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['Ac', 'Qc'] },
          { seat: 2, name: 'Player 2', cards: ['Ah', 'Jh'] },
          { seat: 3, name: 'Player 3', cards: ['Ad', '10d'] },
        ],
        question: 'Who wins this showdown?',
      },
      correctAnswer: 'Player 1',
      explanation: 'All three players have two pair (Kings and 8s from the board). The kicker decides: Player 1 has Queen kicker, beating Jack and 10.',
      xpValue: 15,
    },
    {
      type: 'SPLIT_POT',
      difficulty: 2,
      content: {
        board: ['As', 'Ks', 'Qs', 'Js', '10s'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['2h', '3h'] },
          { seat: 2, name: 'Player 2', cards: ['9d', '8d'] },
          { seat: 3, name: 'Player 3', cards: ['5c', '4c'] },
        ],
        question: 'Does the pot split?',
        options: ['Yes - split between all', 'No - Player 1 wins', 'No - Player 2 wins'],
      },
      correctAnswer: 'Yes - split between all',
      explanation: 'The board shows a Royal Flush (A-K-Q-J-10 of spades). No player can beat the board, so all players tie and split the pot.',
      xpValue: 15,
    },
    {
      type: 'SPLIT_POT',
      difficulty: 2,
      content: {
        board: ['Ah', 'Kh', 'Qd', 'Jc', '10s'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['9h', '8h'] },
          { seat: 2, name: 'Player 2', cards: ['2d', '3d'] },
        ],
        question: 'Does the pot split?',
        options: ['Yes - the board plays', 'No - Player 1 wins', 'No - Player 2 wins'],
      },
      correctAnswer: 'Yes - the board plays',
      explanation: 'The board is A-K-Q-J-10 (Broadway straight). Neither player can improve on this - they both play the board and split.',
      xpValue: 15,
    },
    {
      type: 'MULTIWAY_SHOWDOWN',
      difficulty: 2,
      content: {
        board: ['9h', '8h', '7h', '2c', '2d'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['Ah', 'Kh'] },
          { seat: 2, name: 'Player 2', cards: ['10h', '6h'] },
          { seat: 3, name: 'Player 3', cards: ['Jh', '5s'] },
        ],
        question: 'Who wins this showdown?',
      },
      correctAnswer: 'Player 2',
      explanation: 'Player 2 has a straight flush (10-9-8-7-6 of hearts). Player 1 has an Ace-high flush. Player 3 has a Jack-high flush. Straight flush beats all.',
      xpValue: 20,
    },
    {
      type: 'MULTIWAY_SHOWDOWN',
      difficulty: 3,
      content: {
        board: ['Jh', 'Jd', '5c', '5s', 'Kh'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['Js', '10c'] },
          { seat: 2, name: 'Player 2', cards: ['5h', '5d'] },
          { seat: 3, name: 'Player 3', cards: ['Kd', 'Ks'] },
        ],
        question: 'Who wins this showdown?',
      },
      correctAnswer: 'Player 2',
      explanation: 'Player 2 has four 5s (quads). Player 1 has Jacks full of 5s. Player 3 has Kings full of Jacks. Four of a kind beats all full houses.',
      xpValue: 20,
    },
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
        options: ['Yes - three-way split', 'No - Player 1 wins', 'Yes - split between P1 and P2'],
      },
      correctAnswer: 'Yes - three-way split',
      explanation: 'The board is Aces full of Kings (A-A-A-K-K). No player can use their hole cards to improve, so all three play the board and split.',
      xpValue: 20,
    },
    {
      type: 'MULTIWAY_SHOWDOWN',
      difficulty: 1,
      content: {
        board: ['9c', '9d', '4h', '4s', 'Kh'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['Kd', 'Qc'] },
          { seat: 2, name: 'Player 2', cards: ['As', 'Ah'] },
          { seat: 3, name: 'Player 3', cards: ['Jh', '10h'] },
        ],
        question: 'Who wins this showdown?',
      },
      correctAnswer: 'Player 2',
      explanation: 'Player 2 has two pair: Aces and 9s (A-A-9-9-K). Player 1 has two pair: Kings and 9s (K-K-9-9-4). Aces up beats Kings up. Player 3 only has two pair 9s and 4s with King kicker.',
      xpValue: 15,
    },
    {
      type: 'MULTIWAY_SHOWDOWN',
      difficulty: 2,
      content: {
        board: ['7h', '7d', '7c', '2s', '5h'],
        players: [
          { seat: 1, name: 'Player 1', cards: ['As', 'Kd'] },
          { seat: 2, name: 'Player 2', cards: ['Ac', 'Qh'] },
          { seat: 3, name: 'Player 3', cards: ['Ad', 'Jc'] },
        ],
        question: 'Who wins this showdown?',
      },
      correctAnswer: 'Player 1',
      explanation: 'All players have trip 7s from the board. The kickers decide: Player 1 has A-K, Player 2 has A-Q, Player 3 has A-J. Ace-King kicker wins.',
      xpValue: 15,
    },
  ];

  await prisma.question.createMany({
    data: boardReadingQuestions.map((q) => ({
      ...q,
      moduleId: boardReadingModule.id,
      content: q.content,
    })),
  });

  // Create questions for Hand Flow module (Module 3)
  const handFlowModule = modules.find((m) => m.slug === 'hand-flow')!;

  const handFlowQuestions = [
    {
      type: 'ACTION_AVAILABLE',
      difficulty: 1,
      content: {
        situation: 'You are first to act preflop. No one has bet yet.',
        question: 'What actions are available to you?',
        options: ['Fold, Call, or Raise', 'Fold or Raise (no one to call)', 'Check or Bet'],
      },
      correctAnswer: 'Fold or Raise (no one to call)',
      explanation: 'Preflop as first to act, you can fold or raise. You cannot "call" because there is no bet to call - just the blinds.',
      xpValue: 10,
    },
    {
      type: 'ACTION_AVAILABLE',
      difficulty: 1,
      content: {
        situation: 'You are on the flop. Everyone checks to you.',
        question: 'What actions are available?',
        options: ['Check or Bet', 'Fold, Call, or Raise', 'Only Bet'],
      },
      correctAnswer: 'Check or Bet',
      explanation: 'When no one has bet, you can check (pass action) or bet. You cannot fold or call when there is nothing to call.',
      xpValue: 10,
    },
    {
      type: 'STREET_ORDER',
      difficulty: 1,
      content: {
        question: 'In what order are the community cards dealt?',
        options: ['Preflop → Flop (3) → Turn (1) → River (1)', 'Preflop → Turn → Flop → River', 'All 5 cards at once'],
      },
      correctAnswer: 'Preflop → Flop (3) → Turn (1) → River (1)',
      explanation: 'First comes preflop (no community cards), then the Flop (3 cards), Turn (1 card), and River (1 card). Total: 5 community cards.',
      xpValue: 10,
    },
    {
      type: 'BLIND_STRUCTURE',
      difficulty: 1,
      content: {
        question: 'What is the purpose of the blinds?',
        options: ['Force action - create a pot to fight for', 'Penalize late players', 'Determine the dealer'],
      },
      correctAnswer: 'Force action - create a pot to fight for',
      explanation: 'Blinds are forced bets that ensure theres always something to win. Without them, players could wait forever for premium hands.',
      xpValue: 10,
    },
    {
      type: 'ACTION_AVAILABLE',
      difficulty: 2,
      content: {
        situation: 'Opponent bets on the river. You are last to act.',
        question: 'What are your options?',
        options: ['Fold, Call, or Raise', 'Only Call or Fold', 'Check or Raise'],
      },
      correctAnswer: 'Fold, Call, or Raise',
      explanation: 'Facing a bet, you can always fold (give up), call (match the bet), or raise (increase the bet). All three options are available.',
      xpValue: 15,
    },
    {
      type: 'TURN_ORDER',
      difficulty: 2,
      content: {
        question: 'After the flop, who acts first?',
        options: ['First active player left of the button', 'The button', 'The big blind always'],
      },
      correctAnswer: 'First active player left of the button',
      explanation: 'Postflop, action starts with the first active player to the left of the button. This is usually the small blind if still in the hand.',
      xpValue: 15,
    },
    {
      type: 'ACTION_AVAILABLE',
      difficulty: 2,
      content: {
        situation: 'You bet, opponent raises. Action is back to you.',
        question: 'What can you do?',
        options: ['Fold, Call, or Re-raise', 'Only Call', 'Check or Call'],
      },
      correctAnswer: 'Fold, Call, or Re-raise',
      explanation: 'When facing a raise, you have three options: fold (give up), call (match the raise), or re-raise (raise again).',
      xpValue: 15,
    },
    {
      type: 'STREET_ORDER',
      difficulty: 2,
      content: {
        question: 'On which street(s) can you still draw to improve your hand?',
        options: ['Flop and Turn only', 'All streets including River', 'Only preflop'],
      },
      correctAnswer: 'Flop and Turn only',
      explanation: 'You can improve on the Turn (after flop) and River (after turn). Once all 5 community cards are out, no more cards come.',
      xpValue: 15,
    },
    {
      type: 'BLIND_STRUCTURE',
      difficulty: 1,
      content: {
        question: 'In a $1/$2 No Limit game, what does "$1/$2" refer to?',
        options: ['Small blind is $1, big blind is $2', 'Minimum bet is $1, maximum is $2', 'Ante is $1, bring-in is $2'],
      },
      correctAnswer: 'Small blind is $1, big blind is $2',
      explanation: 'The stakes notation shows the blind sizes. In $1/$2, the small blind posts $1 and the big blind posts $2. The minimum raise is typically the big blind amount.',
      xpValue: 10,
    },
    {
      type: 'TURN_ORDER',
      difficulty: 1,
      content: {
        question: 'Preflop, who acts first?',
        options: ['Player left of big blind (UTG)', 'Small blind', 'The button'],
      },
      correctAnswer: 'Player left of big blind (UTG)',
      explanation: 'Preflop action starts with the player to the left of the big blind, called Under The Gun (UTG). The blinds act last preflop since they already have forced bets in.',
      xpValue: 10,
    },
  ];

  await prisma.question.createMany({
    data: handFlowQuestions.map((q) => ({
      ...q,
      moduleId: handFlowModule.id,
      content: q.content,
    })),
  });

  // Create questions for Position module
  const positionModule = modules.find((m) => m.slug === 'position')!;

  const positionQuestions = [
    {
      type: 'POSITION_ID',
      difficulty: 1,
      content: {
        question: 'What does the abbreviation "BTN" stand for in poker?',
        options: ['Button', 'Big Blind', 'Cutoff'],
      },
      correctAnswer: 'Button',
      explanation: 'The Button (BTN) is the best position at the table. You act last on every street after the flop, giving you maximum information.',
      xpValue: 10,
    },
    {
      type: 'POSITION_ID',
      difficulty: 1,
      content: {
        position: 'CO',
        question: 'What does CO stand for?',
        options: ['Cutoff', 'Call Off', 'Check Option'],
      },
      correctAnswer: 'Cutoff',
      explanation: 'The Cutoff is the position directly to the right of the Button. Its the second-best position and can often "cut off" the Button by raising.',
      xpValue: 10,
    },
    {
      type: 'POSITION_ADVANTAGE',
      difficulty: 2,
      content: {
        question: 'Which position has the biggest advantage post-flop?',
        options: ['Button', 'Big Blind', 'Under the Gun'],
      },
      correctAnswer: 'Button',
      explanation: 'The Button acts last on every post-flop street (flop, turn, river), allowing them to see all other players actions before deciding.',
      xpValue: 15,
    },
    {
      type: 'POSITION_ID',
      difficulty: 1,
      content: {
        position: 'UTG',
        question: 'What does UTG stand for?',
        options: ['Under the Gun', 'Upper Table', 'Under the Ground'],
      },
      correctAnswer: 'Under the Gun',
      explanation: 'Under the Gun is the first player to act pre-flop (to the left of the Big Blind). Its the worst position because you have no information.',
      xpValue: 10,
    },
    {
      type: 'POSITION_ORDER',
      difficulty: 2,
      content: {
        question: 'In what order do positions act pre-flop?',
        options: [
          'UTG → MP → CO → BTN → SB → BB',
          'SB → BB → UTG → MP → CO → BTN',
          'BTN → SB → BB → UTG → MP → CO',
        ],
      },
      correctAnswer: 'UTG → MP → CO → BTN → SB → BB',
      explanation: 'Pre-flop, action starts with UTG (left of BB) and moves clockwise. The blinds act last pre-flop but first on later streets.',
      xpValue: 15,
    },
    {
      type: 'POSITION_STRATEGY',
      difficulty: 2,
      content: {
        question: 'Why should you play tighter from early position?',
        options: [
          'More players can act after you',
          'You have more chips',
          'The blinds are smaller',
        ],
      },
      correctAnswer: 'More players can act after you',
      explanation: 'In early position, many players act after you. This increases the chance someone has a strong hand, so you need stronger hands to continue.',
      xpValue: 15,
    },
    {
      type: 'POSITION_ID',
      difficulty: 1,
      content: {
        position: 'SB',
        question: 'What is the Small Blind?',
        options: [
          'Half the big blind, left of button',
          'The biggest blind amount',
          'The dealer position',
        ],
      },
      correctAnswer: 'Half the big blind, left of button',
      explanation: 'The Small Blind posts half the minimum bet and sits directly left of the Button. They act first on all post-flop streets.',
      xpValue: 10,
    },
    {
      type: 'POSITION_STRATEGY',
      difficulty: 3,
      content: {
        question: 'From the Button, you can profitably play which range?',
        options: [
          'Widest range of all positions',
          'Only premium hands',
          'Same as UTG',
        ],
      },
      correctAnswer: 'Widest range of all positions',
      explanation: 'The Button can play the widest range because positional advantage compensates for weaker starting hands. You see everyone else act first.',
      xpValue: 20,
    },
  ];

  await prisma.question.createMany({
    data: positionQuestions.map((q) => ({
      ...q,
      moduleId: positionModule.id,
      content: q.content,
    })),
  });

  // Create questions for Pot Odds module
  const potOddsModule = modules.find((m) => m.slug === 'pot-odds')!;

  const potOddsQuestions = [
    {
      type: 'ODDS_CALC',
      difficulty: 2,
      content: {
        pot: 100,
        bet: 50,
        question: 'The pot is $100. Your opponent bets $50. What pot odds are you getting?',
        options: ['3:1', '2:1', '4:1'],
      },
      correctAnswer: '3:1',
      explanation: 'Pot odds = (Pot + Bet) : Bet = ($100 + $50) : $50 = $150 : $50 = 3:1. You risk $50 to win $150.',
      xpValue: 15,
    },
    {
      type: 'ODDS_CALC',
      difficulty: 2,
      content: {
        pot: 80,
        bet: 40,
        question: 'Pot is $80, opponent bets $40. What percentage do you need to call?',
        options: ['33%', '25%', '50%'],
      },
      correctAnswer: '33%',
      explanation: 'Break-even % = Bet / (Pot + Bet + Call) = $40 / ($80 + $40 + $40) = $40 / $160 = 25%... Wait, let me recalculate. Required equity = Call / (Pot + Call) = $40 / $120 = 33%.',
      xpValue: 15,
    },
    {
      type: 'OUTS_COUNT',
      difficulty: 2,
      content: {
        hand: ['Ah', 'Kh'],
        board: ['2h', '7h', 'Jc', '3s'],
        draw: 'Flush draw',
        question: 'How many outs do you have to make a flush?',
        options: ['9', '8', '13'],
      },
      correctAnswer: '9',
      explanation: 'There are 13 hearts in the deck. You see 4 (2 in hand + 2 on board), leaving 9 unseen hearts as your outs.',
      xpValue: 15,
    },
    {
      type: 'ODDS_CONVERT',
      difficulty: 3,
      content: {
        odds: '4:1',
        question: 'Convert 4:1 odds to a percentage.',
        options: ['20%', '25%', '33%'],
      },
      correctAnswer: '20%',
      explanation: '4:1 means you win once every 5 times (1 win + 4 losses = 5 total). 1/5 = 20%.',
      xpValue: 20,
    },
    {
      type: 'DECISION',
      difficulty: 2,
      content: {
        situation: 'You have a flush draw (9 outs). Pot is $100, opponent bets $25.',
        question: 'Should you call?',
        options: ['Yes - pot odds are good', 'No - not enough equity', 'Need more information'],
      },
      correctAnswer: 'Yes - pot odds are good',
      explanation: 'Pot odds: $125:$25 = 5:1 (need 17%). Flush draw with 9 outs ≈ 18% on one card, 35% with two cards to come. Great call!',
      xpValue: 15,
    },
    {
      type: 'OUTS_COUNT',
      difficulty: 2,
      content: {
        hand: ['9c', '8c'],
        board: ['7d', '6h', 'Ks', '2c'],
        draw: 'Open-ended straight draw',
        question: 'How many outs for a straight?',
        options: ['8', '4', '6'],
      },
      correctAnswer: '8',
      explanation: 'An open-ended straight draw (9-8-7-6) can hit on either end. Any 10 (4 cards) or any 5 (4 cards) completes it. Total: 8 outs.',
      xpValue: 15,
    },
    {
      type: 'RULE_OF',
      difficulty: 3,
      content: {
        question: 'The "Rule of 4" helps you estimate equity by...',
        options: [
          'Multiplying outs by 4 with two cards to come',
          'Dividing pot by 4',
          'Calling only 1/4 pot bets',
        ],
      },
      correctAnswer: 'Multiplying outs by 4 with two cards to come',
      explanation: 'Rule of 4: Multiply outs by 4 for turn + river equity. Rule of 2: Multiply by 2 for one card. 9 outs × 4 = ~36% (actual: 35%).',
      xpValue: 20,
    },
  ];

  await prisma.question.createMany({
    data: potOddsQuestions.map((q) => ({
      ...q,
      moduleId: potOddsModule.id,
      content: q.content,
    })),
  });

  // Create questions for Preflop module
  const preflopModule = modules.find((m) => m.slug === 'preflop')!;

  const preflopQuestions = [
    // PLAY_FOLD questions - simple binary decisions with buttons
    {
      type: 'PLAY_FOLD',
      difficulty: 1,
      content: {
        hand: ['As', 'Ah'],
        position: 'Any',
        question: 'Pocket Aces - Play or Fold?',
      },
      correctAnswer: 'Play',
      explanation: 'Pocket Aces is the best starting hand in poker. Always play it from any position!',
      xpValue: 10,
    },
    {
      type: 'PLAY_FOLD',
      difficulty: 1,
      content: {
        hand: ['7c', '2d'],
        position: 'UTG',
        question: '72 offsuit from early position - Play or Fold?',
      },
      correctAnswer: 'Fold',
      explanation: '72 offsuit is the worst starting hand in poker. Always fold it (except maybe defending BB for free).',
      xpValue: 10,
    },
    {
      type: 'PLAY_FOLD',
      difficulty: 1,
      content: {
        hand: ['Kh', 'Ks'],
        position: 'Any',
        question: 'Pocket Kings - Play or Fold?',
      },
      correctAnswer: 'Play',
      explanation: 'Pocket Kings is the second-best starting hand. Always play it aggressively!',
      xpValue: 10,
    },
    {
      type: 'PLAY_FOLD',
      difficulty: 2,
      content: {
        hand: ['9s', '8s'],
        position: 'BTN',
        question: '98 suited on the Button - Play or Fold?',
      },
      correctAnswer: 'Play',
      explanation: 'Suited connectors like 98s play great on the Button. You have position and can hit straights, flushes, and two pairs.',
      xpValue: 15,
    },
    {
      type: 'PLAY_FOLD',
      difficulty: 2,
      content: {
        hand: ['Jc', '4d'],
        position: 'UTG',
        question: 'J4 offsuit from UTG - Play or Fold?',
      },
      correctAnswer: 'Fold',
      explanation: 'J4 offsuit is a weak hand with poor playability. From early position, this is an easy fold.',
      xpValue: 15,
    },
    {
      type: 'PLAY_FOLD',
      difficulty: 2,
      content: {
        hand: ['Ah', '5h'],
        position: 'CO',
        question: 'A5 suited from Cutoff - Play or Fold?',
      },
      correctAnswer: 'Play',
      explanation: 'Suited Aces have good playability - flush potential, wheel straight potential. From late position, this is a raise.',
      xpValue: 15,
    },
    {
      type: 'PLAY_FOLD',
      difficulty: 3,
      content: {
        hand: ['Kd', '9c'],
        position: 'UTG',
        question: 'K9 offsuit from UTG - Play or Fold?',
      },
      correctAnswer: 'Fold',
      explanation: 'K9 offsuit looks decent but plays poorly from early position. You will often be dominated by better Kings.',
      xpValue: 20,
    },
    // Original PREFLOP questions
    {
      type: 'PREFLOP',
      difficulty: 2,
      content: {
        hand: ['Ah', 'Kh'],
        position: 'UTG',
        action: 'First to act',
        question: 'What should you do with AKs from UTG?',
        options: ['Raise', 'Limp', 'Fold'],
      },
      correctAnswer: 'Raise',
      explanation: 'AKs (Ace-King suited) is a premium hand you should raise from any position. From UTG, raise to around 2.5-3x the big blind.',
      xpValue: 15,
    },
    {
      type: 'PREFLOP',
      difficulty: 2,
      content: {
        hand: ['7c', '2d'],
        position: 'UTG',
        action: 'First to act',
        question: 'What should you do with 72o from UTG?',
        options: ['Fold', 'Raise', 'Limp'],
      },
      correctAnswer: 'Fold',
      explanation: '72 offsuit is statistically the worst starting hand in poker. Fold it from every position (unless youre defending the big blind in an unraised pot).',
      xpValue: 15,
    },
    {
      type: 'PREFLOP',
      difficulty: 2,
      content: {
        hand: ['Jd', '10d'],
        position: 'BTN',
        action: 'Folded to you',
        question: 'What should you do with JTs on the Button when folded to?',
        options: ['Raise', 'Fold', 'Limp'],
      },
      correctAnswer: 'Raise',
      explanation: 'JTs (Jack-Ten suited) is a strong hand on the Button. With position and a playable hand, raise to steal the blinds or play post-flop.',
      xpValue: 15,
    },
    {
      type: 'PREFLOP',
      difficulty: 3,
      content: {
        hand: ['Ks', 'Qc'],
        position: 'CO',
        action: 'UTG raised 3x',
        question: 'UTG raises. What do you do with KQo in the Cutoff?',
        options: ['Call', 'Fold', 'Raise (3-bet)'],
      },
      correctAnswer: 'Call',
      explanation: 'KQo is strong but not premium. Against an UTG raise (tight range), calling is best. 3-betting risks being dominated by AK/AQ or facing a 4-bet.',
      xpValue: 20,
    },
    {
      type: 'HAND_CATEGORY',
      difficulty: 1,
      content: {
        question: 'Which hands are considered "premium" pre-flop?',
        options: ['AA, KK, QQ, AK', 'Any pair', 'Any suited cards'],
      },
      correctAnswer: 'AA, KK, QQ, AK',
      explanation: 'Premium hands are the top ~3% of starting hands: pocket Aces, Kings, Queens, and Ace-King. These should almost always be raised.',
      xpValue: 10,
    },
    {
      type: 'PREFLOP',
      difficulty: 3,
      content: {
        hand: ['6s', '5s'],
        position: 'BTN',
        action: 'MP raised, CO called',
        question: 'With 65s on BTN, facing a raise and call, what should you do?',
        options: ['Call', 'Fold', 'Raise'],
      },
      correctAnswer: 'Call',
      explanation: 'Suited connectors like 65s play well in multiway pots with position. You can hit straights, flushes, and two-pairs. The implied odds are excellent.',
      xpValue: 20,
    },
    {
      type: 'PREFLOP',
      difficulty: 2,
      content: {
        hand: ['As', '5s'],
        position: 'SB',
        action: 'Folded to you',
        question: 'In the Small Blind, folded to you, what do you do with A5s?',
        options: ['Raise', 'Complete (limp)', 'Fold'],
      },
      correctAnswer: 'Raise',
      explanation: 'A5s is a raising hand heads-up vs the Big Blind. Raising puts pressure on them and you have a decent hand with straight and flush potential.',
      xpValue: 15,
    },
  ];

  await prisma.question.createMany({
    data: preflopQuestions.map((q) => ({
      ...q,
      moduleId: preflopModule.id,
      content: q.content,
    })),
  });

  // Create questions for Betting Basics module (Module 6)
  const bettingBasicsModule = modules.find((m) => m.slug === 'betting-basics')!;

  const bettingBasicsQuestions = [
    {
      type: 'BET_INTENT',
      difficulty: 1,
      content: {
        situation: 'You have top pair with the best kicker on a dry board. You bet.',
        question: 'Why are you betting?',
        options: ['Value - get called by worse hands', 'Bluff - make better hands fold', 'Protection - deny free cards'],
      },
      correctAnswer: 'Value - get called by worse hands',
      explanation: 'With a strong hand (top pair, top kicker), you bet for value. You want opponents with weaker hands to call.',
      xpValue: 10,
    },
    {
      type: 'BET_INTENT',
      difficulty: 1,
      content: {
        situation: 'You completely missed the flop with Ace-high. The board is K-7-2. You bet anyway.',
        question: 'Why are you betting?',
        options: ['Bluff - make better hands fold', 'Value - get called by worse', 'Protection - deny draws'],
      },
      correctAnswer: 'Bluff - make better hands fold',
      explanation: 'With no pair (just Ace-high), you are bluffing. You hope hands like small pairs or other missed hands will fold.',
      xpValue: 10,
    },
    {
      type: 'BET_INTENT',
      difficulty: 2,
      content: {
        situation: 'You have a medium pair on a wet board with flush and straight draws possible. You bet.',
        question: 'Why are you betting?',
        options: ['Protection - deny equity to draws', 'Pure bluff', 'To see where you stand'],
      },
      correctAnswer: 'Protection - deny equity to draws',
      explanation: 'With a vulnerable hand on a draw-heavy board, betting for protection makes opponents pay to chase draws instead of seeing free cards.',
      xpValue: 15,
    },
    {
      type: 'BET_INTENT',
      difficulty: 2,
      content: {
        situation: 'River comes, no draws completed. You have top two pair. You bet big.',
        question: 'This bet is primarily for...',
        options: ['Value', 'Bluff', 'Information'],
      },
      correctAnswer: 'Value',
      explanation: 'On the river with a strong made hand and no scary cards, you bet for value to extract maximum chips from worse hands.',
      xpValue: 15,
    },
    {
      type: 'BET_INTENT',
      difficulty: 2,
      content: {
        situation: 'You raised preflop, called. Flop comes A-K-Q. You continuation bet with 7-7.',
        question: 'What is your primary reason for betting?',
        options: ['Bluff - this board hits your range', 'Value - pocket pair is strong', 'Protection'],
      },
      correctAnswer: 'Bluff - this board hits your range',
      explanation: 'On A-K-Q, your 77 is weak. But as the preflop raiser, this board "hits your range" - opponents expect you to have AK, AQ, etc. Your bet leverages that perception.',
      xpValue: 15,
    },
    {
      type: 'BET_RESPONSE',
      difficulty: 2,
      content: {
        situation: 'You bet for value with top pair. Opponent raises you.',
        question: 'What does their raise likely mean?',
        options: ['They have a very strong hand or a bluff', 'They are confused', 'They want information'],
      },
      correctAnswer: 'They have a very strong hand or a bluff',
      explanation: 'A raise typically means strength (two pair+, set) or a bluff. Against most players, raises are weighted toward strong hands.',
      xpValue: 15,
    },
    {
      type: 'BET_INTENT',
      difficulty: 3,
      content: {
        situation: 'You have a flush draw on the flop. Instead of calling, you raise.',
        question: 'This is called a...',
        options: ['Semi-bluff', 'Pure value bet', 'Blocking bet'],
      },
      correctAnswer: 'Semi-bluff',
      explanation: 'A semi-bluff is a bet/raise with a drawing hand. You can win if they fold now, or improve to the best hand if called.',
      xpValue: 20,
    },
    {
      type: 'BET_SIZE',
      difficulty: 3,
      content: {
        question: 'What is a common value bet size on the river?',
        options: ['50-75% of the pot', '10% of the pot', '300% of the pot'],
      },
      correctAnswer: '50-75% of the pot',
      explanation: 'Standard value bets are 50-75% pot - large enough to extract value but not so large that only better hands call.',
      xpValue: 20,
    },
    {
      type: 'BET_INTENT',
      difficulty: 1,
      content: {
        situation: 'You check, opponent bets, you check-raise.',
        question: 'What is a check-raise typically used for?',
        options: ['Build the pot or bluff', 'Slow down the action', 'Get free cards'],
      },
      correctAnswer: 'Build the pot or bluff',
      explanation: 'A check-raise is a strong play used either for value (building the pot with a good hand) or as a bluff to represent strength.',
      xpValue: 10,
    },
    {
      type: 'BET_RESPONSE',
      difficulty: 1,
      content: {
        situation: 'You have a weak hand with no draw potential.',
        question: 'Opponent makes a large bet. What should you typically do?',
        options: ['Fold', 'Call to see what happens', 'Raise as a bluff'],
      },
      correctAnswer: 'Fold',
      explanation: 'With a weak hand and no chance to improve, folding to a large bet is correct. Calling without equity or fold equity is losing money long-term.',
      xpValue: 10,
    },
  ];

  await prisma.question.createMany({
    data: bettingBasicsQuestions.map((q) => ({
      ...q,
      moduleId: bettingBasicsModule.id,
      content: q.content,
    })),
  });

  // Create questions for Flop Play module (Module 7)
  const flopPlayModule = modules.find((m) => m.slug === 'flop-play')!;

  const flopPlayQuestions = [
    {
      type: 'HAND_STRENGTH',
      difficulty: 1,
      content: {
        hand: ['Ah', 'Kd'],
        board: ['As', '7c', '2h'],
        question: 'How strong is your hand?',
        options: ['Strong - Top pair, top kicker', 'Medium - Second pair', 'Weak - No pair'],
      },
      correctAnswer: 'Strong - Top pair, top kicker',
      explanation: 'You have top pair (Aces) with the best possible kicker (King). This is a strong hand on this flop.',
      xpValue: 10,
    },
    {
      type: 'HAND_STRENGTH',
      difficulty: 1,
      content: {
        hand: ['9h', '8h'],
        board: ['Kd', 'Qc', '3s'],
        question: 'How strong is your hand?',
        options: ['Weak - Missed completely', 'Strong - Made hand', 'Medium - Drawing'],
      },
      correctAnswer: 'Weak - Missed completely',
      explanation: 'You have no pair, no draw, just 9-high. This is a very weak hand that missed the flop entirely.',
      xpValue: 10,
    },
    {
      type: 'HAND_STRENGTH',
      difficulty: 2,
      content: {
        hand: ['Jh', '10h'],
        board: ['9h', '8c', '2h'],
        question: 'How strong is your hand?',
        options: ['Draw - Open-ended straight + flush draw', 'Strong - Made straight', 'Weak - No pair'],
      },
      correctAnswer: 'Draw - Open-ended straight + flush draw',
      explanation: 'You have an open-ended straight draw (any Q or 7 makes a straight) plus a flush draw (9 hearts). This is a monster draw!',
      xpValue: 15,
    },
    {
      type: 'BOARD_TEXTURE',
      difficulty: 2,
      content: {
        board: ['Kh', '7c', '2d'],
        question: 'What type of board texture is this?',
        options: ['Dry - Few draws possible', 'Wet - Many draws possible', 'Monotone - Flush possible'],
      },
      correctAnswer: 'Dry - Few draws possible',
      explanation: 'A dry board has no flush draws (three different suits) and no obvious straight draws. K-7-2 rainbow is very dry.',
      xpValue: 15,
    },
    {
      type: 'BOARD_TEXTURE',
      difficulty: 2,
      content: {
        board: ['Jh', '10h', '9c'],
        question: 'What type of board texture is this?',
        options: ['Wet - Straight and flush draws', 'Dry - Few draws', 'Paired - Full house possible'],
      },
      correctAnswer: 'Wet - Straight and flush draws',
      explanation: 'J-10-9 with two hearts is very wet. Many straight draws (QK, Q8, K8, 87) and a flush draw are possible.',
      xpValue: 15,
    },
    {
      type: 'FLOP_ACTION',
      difficulty: 2,
      content: {
        hand: ['Ah', 'Ad'],
        board: ['Kh', 'Qh', 'Jh'],
        situation: 'You have pocket Aces (no heart). Board has three hearts and a straight possible.',
        question: 'What is your best action?',
        options: ['Bet for protection/value', 'Check and give up', 'Go all-in immediately'],
      },
      correctAnswer: 'Bet for protection/value',
      explanation: 'You have an overpair but the board is scary. Bet to charge draws and get value from worse hands. Dont overcommit though.',
      xpValue: 15,
    },
    {
      type: 'HAND_STRENGTH',
      difficulty: 3,
      content: {
        hand: ['7h', '7d'],
        board: ['Ah', 'Kc', 'Qd'],
        question: 'How strong is your hand on this flop?',
        options: ['Weak - Underpair on scary board', 'Medium - Still a pair', 'Strong - Set potential'],
      },
      correctAnswer: 'Weak - Underpair on scary board',
      explanation: 'Pocket 7s on A-K-Q is very weak. Any Ace, King, or Queen beats you. This is a check/fold situation most of the time.',
      xpValue: 20,
    },
    {
      type: 'FLOP_ACTION',
      difficulty: 3,
      content: {
        hand: ['Ks', 'Qd'],
        board: ['Kh', 'Qc', '5s'],
        situation: 'You have top two pair on a relatively safe board.',
        question: 'What is your best approach?',
        options: ['Bet for value - you have a strong hand', 'Check to trap', 'Check and fold to aggression'],
      },
      correctAnswer: 'Bet for value - you have a strong hand',
      explanation: 'Top two pair is very strong. Bet for value to build the pot. Checking risks giving free cards that could hurt you.',
      xpValue: 20,
    },
    {
      type: 'BOARD_TEXTURE',
      difficulty: 1,
      content: {
        board: ['Js', '6h', '2c'],
        question: 'This flop texture is considered:',
        options: ['Dry - few draws possible', 'Wet - many draws possible', 'Paired - someone likely has trips'],
      },
      correctAnswer: 'Dry - few draws possible',
      explanation: 'A rainbow (three different suits) flop with disconnected cards (J-6-2) is very dry. No flush draws and very limited straight draws exist.',
      xpValue: 10,
    },
    {
      type: 'HAND_STRENGTH',
      difficulty: 1,
      content: {
        hand: ['Ah', 'Kh'],
        board: ['Qh', '9h', '3c'],
        question: 'What do you have on this flop?',
        options: ['Flush draw + overcards', 'Made flush', 'Nothing useful'],
      },
      correctAnswer: 'Flush draw + overcards',
      explanation: 'You have the nut flush draw (4 hearts, need one more). Plus Ace-high and King-high are overcards that could also make top pair.',
      xpValue: 10,
    },
  ];

  await prisma.question.createMany({
    data: flopPlayQuestions.map((q) => ({
      ...q,
      moduleId: flopPlayModule.id,
      content: q.content,
    })),
  });

  // Create questions for Bluffing & Reading module (Module 9)
  const bluffingModule = modules.find((m) => m.slug === 'bluffing')!;

  const bluffingQuestions = [
    {
      type: 'STORY_CONSISTENT',
      difficulty: 2,
      content: {
        line: 'Player limps preflop, calls a raise, calls flop and turn bets, then shoves river on a blank.',
        question: 'Does this betting line make sense for a strong hand?',
        options: ['Suspicious - strong hands usually raise earlier', 'Yes - slow playing', 'Cannot tell'],
      },
      correctAnswer: 'Suspicious - strong hands usually raise earlier',
      explanation: 'A strong hand would typically raise at some point. Limping, then just calling everything before shoving is inconsistent - often a bluff or weak turned strong.',
      xpValue: 15,
    },
    {
      type: 'STORY_CONSISTENT',
      difficulty: 2,
      content: {
        line: 'Opponent raises preflop, bets flop, bets turn, then checks river when flush completes.',
        question: 'What does the river check likely mean?',
        options: ['They fear the flush - dont have it', 'They have the nuts', 'They want to check-raise'],
      },
      correctAnswer: 'They fear the flush - dont have it',
      explanation: 'Betting twice then checking when the flush comes usually means they dont have the flush and fear it. A flush would typically bet for value.',
      xpValue: 15,
    },
    {
      type: 'BLUFF_SPOT',
      difficulty: 2,
      content: {
        scenario1: 'Bluff when a scare card comes and youre in position',
        scenario2: 'Bluff when called in three spots on a dry board',
        question: 'Which is a better bluffing opportunity?',
        options: ['Scenario 1 - scare card in position', 'Scenario 2 - multiway on dry board', 'Both are equal'],
      },
      correctAnswer: 'Scenario 1 - scare card in position',
      explanation: 'Bluffing works best in position with a credible story. Scare cards give you that story. Bluffing into multiple opponents rarely works.',
      xpValue: 15,
    },
    {
      type: 'VALUE_OR_BLUFF',
      difficulty: 2,
      content: {
        situation: 'River: Opponent bets small (1/4 pot) after checking flop and turn.',
        question: 'Is this more likely value or a bluff?',
        options: ['Likely value - small size wants a call', 'Likely bluff - blocking bet', 'Could be either equally'],
      },
      correctAnswer: 'Likely value - small size wants a call',
      explanation: 'Small river bets usually want to be called. A bluff typically uses a larger size to apply pressure. This is often a thin value bet.',
      xpValue: 15,
    },
    {
      type: 'STORY_CONSISTENT',
      difficulty: 3,
      content: {
        line: 'Opponent 3-bets preflop, bets all three streets on K-8-2-4-7 rainbow.',
        question: 'What hands make sense for this line?',
        options: ['Strong hands: AA, KK, AK, sets', 'Any two cards', 'Only bluffs'],
      },
      correctAnswer: 'Strong hands: AA, KK, AK, sets',
      explanation: 'This aggressive line on a dry board is consistent with premium pairs and top pair. The story checks out - respect it unless you have evidence otherwise.',
      xpValue: 20,
    },
    {
      type: 'BLUFF_FREQUENCY',
      difficulty: 2,
      content: {
        question: 'As a beginner, how often should you bluff?',
        options: ['Rarely - less than 20% of bets', 'Often - about 50% of bets', 'Never bluff'],
      },
      correctAnswer: 'Rarely - less than 20% of bets',
      explanation: 'Beginners should bluff sparingly. Most of your bets should be for value. Bluff only in clear spots with a good story.',
      xpValue: 15,
    },
    {
      type: 'VALUE_OR_BLUFF',
      difficulty: 3,
      content: {
        situation: 'River brings the 4th heart. Opponent who has been passive suddenly bets pot.',
        question: 'Is this more likely value or a bluff?',
        options: ['Likely value - they made the flush', 'Likely bluff - using the scare card', 'Cannot determine'],
      },
      correctAnswer: 'Likely value - they made the flush',
      explanation: 'When passive players suddenly bet big on a completing draw, they usually have it. Respect the aggression from passive opponents.',
      xpValue: 20,
    },
    {
      type: 'BLUFF_SPOT',
      difficulty: 3,
      content: {
        question: 'Which opponent type is the best to bluff?',
        options: ['Tight player who can fold', 'Calling station who never folds', 'Aggressive player who might re-bluff'],
      },
      correctAnswer: 'Tight player who can fold',
      explanation: 'Bluffs only work when opponents fold. Tight players fold more. Never bluff calling stations - they call with anything.',
      xpValue: 20,
    },
    {
      type: 'STORY_CONSISTENT',
      difficulty: 2,
      content: {
        situation: 'You called preflop, checked the flop, then suddenly bet big on the turn when a flush completes.',
        question: 'Is your betting story consistent with having the flush?',
        options: ['No - you would have bet the flop with a draw', 'Yes - perfectly consistent', 'Depends on stack sizes'],
      },
      correctAnswer: 'No - you would have bet the flop with a draw',
      explanation: 'Most players with flush draws bet or raise the flop. Checking flop then betting when the flush hits looks suspicious - your story doesnt make sense.',
      xpValue: 15,
    },
  ];

  await prisma.question.createMany({
    data: bluffingQuestions.map((q) => ({
      ...q,
      moduleId: bluffingModule.id,
      content: q.content,
    })),
  });

  // Create questions for Mental Game module (Module 10)
  const mentalGameModule = modules.find((m) => m.slug === 'mental-game')!;

  const mentalGameQuestions = [
    {
      type: 'SPOT_MISTAKE',
      difficulty: 1,
      content: {
        scenario: 'Player calls every bet hoping to hit their gutshot straight draw (4 outs).',
        question: 'What is the mistake?',
        options: ['Chasing with bad odds', 'Folding too much', 'Playing too tight'],
      },
      correctAnswer: 'Chasing with bad odds',
      explanation: 'Calling with only 4 outs is usually wrong. The pot odds rarely justify it. This is a common leak - chasing unlikely draws.',
      xpValue: 10,
    },
    {
      type: 'SPOT_MISTAKE',
      difficulty: 1,
      content: {
        scenario: 'Player never folds a pair, even bottom pair with no kicker.',
        question: 'What is the mistake?',
        options: ['Calling too much', 'Folding too much', 'Bluffing too much'],
      },
      correctAnswer: 'Calling too much',
      explanation: 'Weak pairs are often losing. Calling down with bottom pair is a huge leak. Learn to fold marginal hands.',
      xpValue: 10,
    },
    {
      type: 'TILT_RESPONSE',
      difficulty: 2,
      content: {
        situation: 'You just lost a big pot with pocket Aces to a runner-runner flush. You feel angry.',
        question: 'What is the best response?',
        options: ['Take a break - step away for 10 minutes', 'Play aggressive to win it back', 'Move up stakes where they respect raises'],
      },
      correctAnswer: 'Take a break - step away for 10 minutes',
      explanation: 'After a bad beat, emotions affect decisions. Taking a short break prevents costly tilt plays. Never chase losses.',
      xpValue: 15,
    },
    {
      type: 'RESULTS_VS_DECISION',
      difficulty: 2,
      content: {
        situation: 'You made a correct call with the right odds. You lost the hand.',
        question: 'Was this a bad play?',
        options: ['No - good decision, bad result', 'Yes - you lost money', 'Need more information'],
      },
      correctAnswer: 'No - good decision, bad result',
      explanation: 'Results and decision quality are different. A correct decision can lose. Focus on making good decisions - results follow long term.',
      xpValue: 15,
    },
    {
      type: 'SPOT_MISTAKE',
      difficulty: 2,
      content: {
        scenario: 'Player limps with premium hands like AA and KK instead of raising.',
        question: 'What is the mistake?',
        options: ['Not building the pot with strong hands', 'Playing too aggressive', 'Folding too much'],
      },
      correctAnswer: 'Not building the pot with strong hands',
      explanation: 'Premium hands want to build pots. Limping lets too many players in cheaply and hides your hand strength.',
      xpValue: 15,
    },
    {
      type: 'TILT_RESPONSE',
      difficulty: 2,
      content: {
        situation: 'You have been losing for 3 hours. Your bankroll is down 20%.',
        question: 'What should you do?',
        options: ['Stop for the day - you may be tilting', 'Keep playing - you are due for a win', 'Double your bet sizes to recover faster'],
      },
      correctAnswer: 'Stop for the day - you may be tilting',
      explanation: 'Extended losing sessions affect focus. You are never "due" for wins. Stop, rest, and return fresh.',
      xpValue: 15,
    },
    {
      type: 'RESULTS_VS_DECISION',
      difficulty: 3,
      content: {
        situation: 'You bluffed on a bad spot (into a calling station) and they folded. You won the pot.',
        question: 'Was this a good play?',
        options: ['No - bad decision, lucky result', 'Yes - you won money', 'Depends on the amount'],
      },
      correctAnswer: 'No - bad decision, lucky result',
      explanation: 'Winning does not mean you played well. Bluffing a calling station is wrong even when it works. Evaluate your decisions, not just results.',
      xpValue: 20,
    },
    {
      type: 'BANKROLL',
      difficulty: 2,
      content: {
        question: 'What is a safe bankroll for $0.01/$0.02 games (min buy-in $2)?',
        options: ['At least $40-60 (20-30 buy-ins)', 'Just $2 for one buy-in', '$500 minimum'],
      },
      correctAnswer: 'At least $40-60 (20-30 buy-ins)',
      explanation: 'Having 20-30 buy-ins protects against normal variance. Going broke with 1 buy-in is almost certain. Start with proper bankroll management.',
      xpValue: 15,
    },
    {
      type: 'SESSION_MANAGEMENT',
      difficulty: 2,
      content: {
        question: 'Before your first real money session, what should you set?',
        options: ['Stop-loss and time limit', 'Goals to double your money', 'Plans to play all night'],
      },
      correctAnswer: 'Stop-loss and time limit',
      explanation: 'Set a maximum loss limit and session length before playing. This prevents chasing losses and playing when tired.',
      xpValue: 15,
    },
  ];

  await prisma.question.createMany({
    data: mentalGameQuestions.map((q) => ({
      ...q,
      moduleId: mentalGameModule.id,
      content: q.content,
    })),
  });

  console.log('✅ Created questions for all modules');

  // Create placement test questions (10 total, 2 per difficulty tier)
  // These span all modules to assess overall poker knowledge
  const placementTestQuestions = [
    // Easy - Hand Rankings (Module 1)
    {
      moduleId: handRankingsModule.id,
      type: 'HAND_COMPARE',
      difficulty: 1,
      content: {
        hand1: { cards: ['As', 'Ks', 'Qs', 'Js', '10s'], name: 'Royal Flush' },
        hand2: { cards: ['Kd', 'Kh', 'Kc', 'Ks', '7d'], name: 'Four of a Kind' },
        question: 'Which hand wins?',
      },
      correctAnswer: 'hand1',
      explanation: 'A Royal Flush is the best possible hand in poker, beating all other hands including Four of a Kind.',
      xpValue: 10,
      isPlacementTest: true,
    },
    // Easy - Hand Rankings (Module 1)
    {
      moduleId: handRankingsModule.id,
      type: 'HAND_RANK',
      difficulty: 1,
      content: {
        hand: { cards: ['Jh', 'Jd', 'Jc', '8h', '8d'] },
        question: 'What is this hand called?',
        options: ['Full House', 'Three of a Kind', 'Two Pair'],
      },
      correctAnswer: 'Full House',
      explanation: 'A Full House is three cards of one rank plus a pair of another rank. Here we have three Jacks and two Eights.',
      xpValue: 10,
      isPlacementTest: true,
    },
    // Easy - Position (Module 2)
    {
      moduleId: positionModule.id,
      type: 'POSITION_ID',
      difficulty: 1,
      content: {
        position: 'BTN',
        question: 'What position does BTN refer to?',
        options: ['Button', 'Big Blind', 'Bet Now'],
      },
      correctAnswer: 'Button',
      explanation: 'BTN stands for Button - the dealer position. The Button acts last post-flop, making it the most advantageous position.',
      xpValue: 10,
      isPlacementTest: true,
    },
    // Medium - Position (Module 2)
    {
      moduleId: positionModule.id,
      type: 'POSITION_ORDER',
      difficulty: 2,
      content: {
        question: 'Who acts first before the flop (pre-flop)?',
        options: [
          'Under the Gun (UTG)',
          'The Button',
          'Small Blind',
        ],
      },
      correctAnswer: 'Under the Gun (UTG)',
      explanation: 'Pre-flop, the player Under the Gun (directly left of the Big Blind) acts first. The blinds act last pre-flop.',
      xpValue: 15,
      isPlacementTest: true,
    },
    // Medium - Pot Odds (Module 3)
    {
      moduleId: potOddsModule.id,
      type: 'ODDS_CALC',
      difficulty: 2,
      content: {
        pot: 100,
        bet: 50,
        question: 'The pot is $100. Your opponent bets $50. What pot odds are you getting?',
        options: ['3:1', '2:1', '4:1'],
      },
      correctAnswer: '3:1',
      explanation: 'Pot odds = Total pot after bet : Call amount = $150 : $50 = 3:1. You risk $50 to win $150.',
      xpValue: 15,
      isPlacementTest: true,
    },
    // Medium - Pot Odds (Module 3)
    {
      moduleId: potOddsModule.id,
      type: 'OUTS_COUNT',
      difficulty: 2,
      content: {
        hand: ['Qh', 'Jh'],
        board: ['10h', '9h', '2c', '5s'],
        draw: 'Flush draw',
        question: 'How many outs do you have to complete your flush?',
        options: ['9', '8', '13'],
      },
      correctAnswer: '9',
      explanation: 'There are 13 hearts in the deck. You can see 4 hearts (2 in your hand + 2 on board). 13 - 4 = 9 remaining hearts as outs.',
      xpValue: 15,
      isPlacementTest: true,
    },
    // Medium - Preflop (Module 4)
    {
      moduleId: preflopModule.id,
      type: 'HAND_CATEGORY',
      difficulty: 2,
      content: {
        question: 'Which of these starting hands is considered "premium"?',
        options: ['Pocket Aces (AA)', 'Suited Connectors (87s)', 'Small Pairs (22-55)'],
      },
      correctAnswer: 'Pocket Aces (AA)',
      explanation: 'Premium hands are the top starting hands: AA, KK, QQ, and AK. Pocket Aces is the best starting hand in Hold\'em.',
      xpValue: 15,
      isPlacementTest: true,
    },
    // Hard - Preflop (Module 4)
    {
      moduleId: preflopModule.id,
      type: 'PREFLOP',
      difficulty: 3,
      content: {
        hand: ['Ks', 'Qd'],
        position: 'CO',
        action: 'UTG raised 3BB',
        question: 'You have KQo in the Cutoff facing an UTG raise. What\'s the best play?',
        options: ['Call', 'Fold', '3-Bet'],
      },
      correctAnswer: 'Call',
      explanation: 'KQo is strong but not premium. Against a tight UTG raise, calling to see a flop is best. 3-betting risks facing AK or big pairs.',
      xpValue: 20,
      isPlacementTest: true,
    },
    // Hard - Bluffing (Module 9)
    {
      moduleId: bluffingModule.id,
      type: 'VALUE_OR_BLUFF',
      difficulty: 3,
      content: {
        situation: 'You have 9h8h on a board of 7h6c2h (flush draw + open-ended straight draw). Pot is $100. You raise opponents bet.',
        question: 'This raise is primarily a...',
        options: ['Semi-bluff - you can win now or improve', 'Pure value bet', 'Pure bluff'],
      },
      correctAnswer: 'Semi-bluff - you can win now or improve',
      explanation: 'With 15 outs (9 flush + 8 straight - 2 overlap), you have ~54% equity! Raising as a semi-bluff can win immediately or build a big pot when you hit.',
      xpValue: 20,
      isPlacementTest: true,
    },
    // Hard - Mental Game (Module 10)
    {
      moduleId: mentalGameModule.id,
      type: 'RESULTS_VS_DECISION',
      difficulty: 3,
      content: {
        situation: 'You made the mathematically correct call with a flush draw getting 4:1 odds. The river bricked and you lost.',
        question: 'Was this a mistake?',
        options: ['No - correct decision, unlucky result', 'Yes - you should have folded', 'Cannot determine'],
      },
      correctAnswer: 'No - correct decision, unlucky result',
      explanation: 'Good decisions sometimes lose. With 4:1 pot odds and ~35% equity, calling was correct. Focus on decision quality, not short-term results.',
      xpValue: 20,
      isPlacementTest: true,
    },
  ];

  await prisma.question.createMany({
    data: placementTestQuestions,
  });

  console.log(`✅ Created ${placementTestQuestions.length} placement test questions`);

  // Create achievements
  const achievements = await Promise.all([
    // Progress achievements
    prisma.achievement.create({
      data: {
        slug: 'first-answer',
        name: 'First Steps',
        description: 'Answer your first question',
        category: 'PROGRESS',
        rarity: 'COMMON',
        xpReward: 25,
        iconEmoji: '👣',
        condition: { type: 'questions', value: 1 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'hundred-questions',
        name: 'Century Club',
        description: 'Answer 100 questions',
        category: 'PROGRESS',
        rarity: 'RARE',
        xpReward: 100,
        iconEmoji: '💯',
        condition: { type: 'questions', value: 100 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'five-hundred-questions',
        name: 'Dedicated Student',
        description: 'Answer 500 questions',
        category: 'PROGRESS',
        rarity: 'EPIC',
        xpReward: 250,
        iconEmoji: '📚',
        condition: { type: 'questions', value: 500 },
      },
    }),

    // Streak achievements
    prisma.achievement.create({
      data: {
        slug: 'streak-3',
        name: 'Getting Warm',
        description: 'Reach a 3-day streak',
        category: 'STREAK',
        rarity: 'COMMON',
        xpReward: 30,
        iconEmoji: '🔥',
        condition: { type: 'streak', value: 3 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'streak-7',
        name: 'Week Warrior',
        description: 'Reach a 7-day streak',
        category: 'STREAK',
        rarity: 'RARE',
        xpReward: 75,
        iconEmoji: '🗓️',
        condition: { type: 'streak', value: 7 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'streak-30',
        name: 'Monthly Master',
        description: 'Reach a 30-day streak',
        category: 'STREAK',
        rarity: 'EPIC',
        xpReward: 300,
        iconEmoji: '🏆',
        condition: { type: 'streak', value: 30 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'streak-100',
        name: 'Legendary Grinder',
        description: 'Reach a 100-day streak',
        category: 'STREAK',
        rarity: 'LEGENDARY',
        xpReward: 1000,
        iconEmoji: '👑',
        condition: { type: 'streak', value: 100 },
      },
    }),

    // Mastery achievements
    prisma.achievement.create({
      data: {
        slug: 'first-mastery',
        name: 'Module Master',
        description: 'Master your first module',
        category: 'MASTERY',
        rarity: 'RARE',
        xpReward: 100,
        iconEmoji: '⭐',
        condition: { type: 'mastery', value: 1 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'all-mastered',
        name: 'Poker Professor',
        description: 'Master all 10 modules',
        category: 'MASTERY',
        rarity: 'LEGENDARY',
        xpReward: 1000,
        iconEmoji: '🎓',
        condition: { type: 'mastery', value: 10 },
      },
    }),

    // Level achievements
    prisma.achievement.create({
      data: {
        slug: 'level-5',
        name: 'Rising Star',
        description: 'Reach level 5',
        category: 'PROGRESS',
        rarity: 'COMMON',
        xpReward: 50,
        iconEmoji: '⬆️',
        condition: { type: 'level', value: 5 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'level-10',
        name: 'Experienced Player',
        description: 'Reach level 10',
        category: 'PROGRESS',
        rarity: 'RARE',
        xpReward: 150,
        iconEmoji: '🌟',
        condition: { type: 'level', value: 10 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'level-25',
        name: 'Poker Veteran',
        description: 'Reach level 25',
        category: 'PROGRESS',
        rarity: 'EPIC',
        xpReward: 400,
        iconEmoji: '💪',
        condition: { type: 'level', value: 25 },
      },
    }),

    // XP achievements
    prisma.achievement.create({
      data: {
        slug: 'xp-1000',
        name: 'First Thousand',
        description: 'Earn 1,000 total XP',
        category: 'PROGRESS',
        rarity: 'COMMON',
        xpReward: 50,
        iconEmoji: '💰',
        condition: { type: 'xp', value: 1000 },
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'xp-10000',
        name: 'XP Millionaire',
        description: 'Earn 10,000 total XP',
        category: 'PROGRESS',
        rarity: 'EPIC',
        xpReward: 250,
        iconEmoji: '💎',
        condition: { type: 'xp', value: 10000 },
      },
    }),
  ]);

  console.log(`✅ Created ${achievements.length} achievements`);

  console.log('🎰 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
