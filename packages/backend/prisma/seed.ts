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

  // Create modules
  const modules = await Promise.all([
    prisma.module.create({
      data: {
        slug: 'hand-rankings',
        name: 'Hand Rankings',
        description: 'Learn the 10 poker hand rankings from high card to royal flush. The foundation of all poker knowledge.',
        difficulty: 1,
        orderIndex: 1,
        unlockRequirement: 0,
        iconEmoji: '🃏',
        masteryXpBonus: 500,
      },
    }),
    prisma.module.create({
      data: {
        slug: 'position',
        name: 'Table Position',
        description: 'Understand the 9 positions at a poker table and why position is power.',
        difficulty: 1,
        orderIndex: 2,
        unlockRequirement: 100,
        iconEmoji: '🪑',
        masteryXpBonus: 500,
      },
    }),
    prisma.module.create({
      data: {
        slug: 'pot-odds',
        name: 'Pot Odds',
        description: 'Calculate pot odds and understand when calling is mathematically correct.',
        difficulty: 2,
        orderIndex: 3,
        unlockRequirement: 250,
        iconEmoji: '🧮',
        masteryXpBonus: 600,
      },
    }),
    prisma.module.create({
      data: {
        slug: 'preflop',
        name: 'Preflop Strategy',
        description: 'Master starting hand selection based on position and table dynamics.',
        difficulty: 2,
        orderIndex: 4,
        unlockRequirement: 450,
        iconEmoji: '🎯',
        masteryXpBonus: 600,
      },
    }),
    prisma.module.create({
      data: {
        slug: 'scenarios',
        name: 'Game Scenarios',
        description: 'Apply your knowledge to real poker situations and decision making.',
        difficulty: 3,
        orderIndex: 5,
        unlockRequirement: 700,
        iconEmoji: '🎭',
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

  // Create questions for Scenarios module
  const scenariosModule = modules.find((m) => m.slug === 'scenarios')!;

  const scenarioQuestions = [
    {
      type: 'SCENARIO',
      difficulty: 3,
      content: {
        setup: 'You have KK on the Button. UTG raises, MP 3-bets. Action is on you.',
        stacks: 'Everyone has 100BB',
        question: 'What is your best play?',
        options: ['4-bet', 'Call', 'Fold'],
      },
      correctAnswer: '4-bet',
      explanation: 'KK is the second-best starting hand. With a raise and 3-bet in front, you should 4-bet for value. You want to build the pot and define your opponents ranges.',
      xpValue: 20,
    },
    {
      type: 'SCENARIO',
      difficulty: 3,
      content: {
        setup: 'You opened AQo from MP, BTN 3-bet, you called. Flop: K-7-2 rainbow. You check, BTN bets 1/2 pot.',
        question: 'What should you do?',
        options: ['Fold', 'Call', 'Raise'],
      },
      correctAnswer: 'Fold',
      explanation: 'You missed the flop completely with AQ on K-7-2. Against a 3-bettor who continuation bets, you have no pair, no draw, and theyre likely to have you beat.',
      xpValue: 20,
    },
    {
      type: 'SCENARIO',
      difficulty: 3,
      content: {
        setup: 'You have JJ in the BB. UTG raises, everyone folds. You call. Flop: A-8-3 rainbow. What do you do?',
        question: 'How should you approach this flop?',
        options: ['Check and evaluate', 'Donk bet for protection', 'Check-raise'],
      },
      correctAnswer: 'Check and evaluate',
      explanation: 'The Ace hits UTGs range hard. Check and see what they do. If they bet, you can often fold - they have AK/AQ/Ax often. Dont build a big pot with a marginal hand.',
      xpValue: 20,
    },
    {
      type: 'SCENARIO',
      difficulty: 3,
      content: {
        setup: 'You have 9h8h. Flop is 7h-6c-2h giving you a flush draw + open-ender. Pot is $50. Opponent bets $50.',
        question: 'What is your best action?',
        options: ['Raise (semi-bluff)', 'Call', 'Fold'],
      },
      correctAnswer: 'Raise (semi-bluff)',
      explanation: 'With a huge draw (15 outs: 9 flush + 8 straight - 2 overlap), you have ~54% equity! Raising as a semi-bluff can win the pot now or build it for when you hit.',
      xpValue: 20,
    },
    {
      type: 'SCENARIO',
      difficulty: 3,
      content: {
        setup: 'Final table of a tournament. You have 15BB in the BB. Button (50BB) goes all-in. SB folds. You have A9o.',
        question: 'What should you do?',
        options: ['Call', 'Fold', 'Ask for time'],
      },
      correctAnswer: 'Call',
      explanation: 'With 15BB, A9o is strong enough to call vs a button all-in. Buttons shoving range is wide, and you have decent equity. Plus youre already invested with the big blind.',
      xpValue: 20,
    },
  ];

  await prisma.question.createMany({
    data: scenarioQuestions.map((q) => ({
      ...q,
      moduleId: scenariosModule.id,
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
    // Hard - Scenarios (Module 5)
    {
      moduleId: scenariosModule.id,
      type: 'SCENARIO',
      difficulty: 3,
      content: {
        setup: 'You have 9h8h on a board of 7h6c2h (flush draw + open-ended straight draw). Pot is $100. Opponent bets $80.',
        question: 'With your combo draw (15 outs), what\'s your best action?',
        options: ['Raise (semi-bluff)', 'Call', 'Fold'],
      },
      correctAnswer: 'Raise (semi-bluff)',
      explanation: 'With 15 outs (9 flush + 8 straight - 2 overlap), you have ~54% equity! Raising as a semi-bluff can win immediately or build a big pot when you hit.',
      xpValue: 20,
      isPlacementTest: true,
    },
    // Hard - Scenarios (Module 5)
    {
      moduleId: scenariosModule.id,
      type: 'SCENARIO',
      difficulty: 3,
      content: {
        setup: 'Tournament: You have 12BB in the Big Blind. Everyone folds to the Button who shoves all-in. Small Blind folds. You have A9o.',
        stacks: 'Button has 25BB',
        question: 'Should you call with A9o?',
        options: ['Call', 'Fold', 'Raise'],
      },
      correctAnswer: 'Call',
      explanation: 'At 12BB with A9o vs a button shove, you have a strong enough hand to call. The Button\'s shoving range is wide, and A9o has good equity against that range.',
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
        description: 'Master all modules',
        category: 'MASTERY',
        rarity: 'LEGENDARY',
        xpReward: 500,
        iconEmoji: '🎓',
        condition: { type: 'mastery', value: 5 },
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
