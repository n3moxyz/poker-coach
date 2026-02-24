import { PrismaClient } from '@prisma/client';
import { handRankingsQuestions } from './questions/hand-rankings';
import { boardReadingQuestions } from './questions/board-reading';
import { handFlowQuestions } from './questions/hand-flow';
import { positionQuestions } from './questions/position';
import { preflopQuestions } from './questions/preflop';
import { bettingBasicsQuestions } from './questions/betting-basics';
import { flopPlayQuestions } from './questions/flop-play';
import { potOddsQuestions } from './questions/pot-odds';
import { bluffingQuestions } from './questions/bluffing';
import { mentalGameQuestions } from './questions/mental-game';

const prisma = new PrismaClient();

// Minimum question count before triggering re-seed (old pool had ~91)
const QUESTION_POOL_THRESHOLD = 200;

async function main() {
  console.log('🌱 Seeding database...');

  const existingUsers = await prisma.user.count();
  const existingModules = await prisma.module.count();
  const existingQuestions = await prisma.question.count();

  // Case 1: Existing DB with small question pool → re-seed questions only
  if (existingModules > 0 && existingQuestions < QUESTION_POOL_THRESHOLD) {
    console.log(`📦 Found ${existingQuestions} questions (below ${QUESTION_POOL_THRESHOLD}). Expanding question pool...`);
    await reseedQuestions();
    await seedGameAchievements();
    console.log('🎰 Question pool expansion complete!');
    return;
  }

  // Case 2: Fully seeded DB → skip
  if (existingUsers > 0 && existingModules > 0) {
    console.log(`⏭️  Skipping seed - database already has ${existingUsers} users, ${existingModules} modules, ${existingQuestions} questions`);
    console.log('   To force reseed, run: npx prisma migrate reset');
    // Still check game achievements (they use upsert pattern)
    await seedGameAchievements();
    return;
  }

  // Case 3: Fresh database → full seed
  console.log('📦 Fresh database detected, running full seed...');

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

  // Seed all questions from imported question files
  await seedAllQuestions(modules);

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: { slug: 'first-answer', name: 'First Steps', description: 'Answer your first question', category: 'PROGRESS', rarity: 'COMMON', xpReward: 25, iconEmoji: '👣', condition: { type: 'questions', value: 1 } },
    }),
    prisma.achievement.create({
      data: { slug: 'hundred-questions', name: 'Century Club', description: 'Answer 100 questions', category: 'PROGRESS', rarity: 'RARE', xpReward: 100, iconEmoji: '💯', condition: { type: 'questions', value: 100 } },
    }),
    prisma.achievement.create({
      data: { slug: 'five-hundred-questions', name: 'Dedicated Student', description: 'Answer 500 questions', category: 'PROGRESS', rarity: 'EPIC', xpReward: 250, iconEmoji: '📚', condition: { type: 'questions', value: 500 } },
    }),
    prisma.achievement.create({
      data: { slug: 'streak-3', name: 'Getting Warm', description: 'Reach a 3-day streak', category: 'STREAK', rarity: 'COMMON', xpReward: 30, iconEmoji: '🔥', condition: { type: 'streak', value: 3 } },
    }),
    prisma.achievement.create({
      data: { slug: 'streak-7', name: 'Week Warrior', description: 'Reach a 7-day streak', category: 'STREAK', rarity: 'RARE', xpReward: 75, iconEmoji: '🗓️', condition: { type: 'streak', value: 7 } },
    }),
    prisma.achievement.create({
      data: { slug: 'streak-30', name: 'Monthly Master', description: 'Reach a 30-day streak', category: 'STREAK', rarity: 'EPIC', xpReward: 300, iconEmoji: '🏆', condition: { type: 'streak', value: 30 } },
    }),
    prisma.achievement.create({
      data: { slug: 'streak-100', name: 'Legendary Grinder', description: 'Reach a 100-day streak', category: 'STREAK', rarity: 'LEGENDARY', xpReward: 1000, iconEmoji: '👑', condition: { type: 'streak', value: 100 } },
    }),
    prisma.achievement.create({
      data: { slug: 'first-mastery', name: 'Module Master', description: 'Master your first module', category: 'MASTERY', rarity: 'RARE', xpReward: 100, iconEmoji: '⭐', condition: { type: 'mastery', value: 1 } },
    }),
    prisma.achievement.create({
      data: { slug: 'all-mastered', name: 'Poker Professor', description: 'Master all 10 modules', category: 'MASTERY', rarity: 'LEGENDARY', xpReward: 1000, iconEmoji: '🎓', condition: { type: 'mastery', value: 10 } },
    }),
    prisma.achievement.create({
      data: { slug: 'level-5', name: 'Rising Star', description: 'Reach level 5', category: 'PROGRESS', rarity: 'COMMON', xpReward: 50, iconEmoji: '⬆️', condition: { type: 'level', value: 5 } },
    }),
    prisma.achievement.create({
      data: { slug: 'level-10', name: 'Experienced Player', description: 'Reach level 10', category: 'PROGRESS', rarity: 'RARE', xpReward: 150, iconEmoji: '🌟', condition: { type: 'level', value: 10 } },
    }),
    prisma.achievement.create({
      data: { slug: 'level-25', name: 'Poker Veteran', description: 'Reach level 25', category: 'PROGRESS', rarity: 'EPIC', xpReward: 400, iconEmoji: '💪', condition: { type: 'level', value: 25 } },
    }),
    prisma.achievement.create({
      data: { slug: 'xp-1000', name: 'First Thousand', description: 'Earn 1,000 total XP', category: 'PROGRESS', rarity: 'COMMON', xpReward: 50, iconEmoji: '💰', condition: { type: 'xp', value: 1000 } },
    }),
    prisma.achievement.create({
      data: { slug: 'xp-10000', name: 'XP Millionaire', description: 'Earn 10,000 total XP', category: 'PROGRESS', rarity: 'EPIC', xpReward: 250, iconEmoji: '💎', condition: { type: 'xp', value: 10000 } },
    }),
  ]);

  console.log(`✅ Created ${achievements.length} achievements`);

  await seedGameAchievements();

  console.log('🎰 Seeding complete!');
}

// Slug → question array mapping
const MODULE_QUESTIONS: Record<string, typeof handRankingsQuestions> = {
  'hand-rankings': handRankingsQuestions,
  'board-reading': boardReadingQuestions,
  'hand-flow': handFlowQuestions,
  'position': positionQuestions,
  'preflop': preflopQuestions,
  'betting-basics': bettingBasicsQuestions,
  'flop-play': flopPlayQuestions,
  'pot-odds': potOddsQuestions,
  'bluffing': bluffingQuestions,
  'mental-game': mentalGameQuestions,
};

async function seedAllQuestions(modules: { id: string; slug: string }[]) {
  let totalQuestions = 0;

  for (const mod of modules) {
    const questions = MODULE_QUESTIONS[mod.slug];
    if (!questions || questions.length === 0) continue;

    await prisma.question.createMany({
      data: questions.map((q) => ({
        ...q,
        moduleId: mod.id,
        content: q.content,
      })),
    });
    totalQuestions += questions.length;
  }

  // Placement test questions (stay inline — tightly coupled to module refs)
  const getModuleId = (slug: string) => modules.find((m) => m.slug === slug)!.id;

  const placementTestQuestions = [
    {
      moduleId: getModuleId('hand-rankings'),
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
    {
      moduleId: getModuleId('hand-rankings'),
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
    {
      moduleId: getModuleId('position'),
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
    {
      moduleId: getModuleId('position'),
      type: 'POSITION_ORDER',
      difficulty: 2,
      content: {
        question: 'Who acts first before the flop (pre-flop)?',
        options: ['Under the Gun (UTG)', 'The Button', 'Small Blind'],
      },
      correctAnswer: 'Under the Gun (UTG)',
      explanation: 'Pre-flop, the player Under the Gun (directly left of the Big Blind) acts first. The blinds act last pre-flop.',
      xpValue: 15,
      isPlacementTest: true,
    },
    {
      moduleId: getModuleId('pot-odds'),
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
    {
      moduleId: getModuleId('pot-odds'),
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
    {
      moduleId: getModuleId('preflop'),
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
    {
      moduleId: getModuleId('preflop'),
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
    {
      moduleId: getModuleId('bluffing'),
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
    {
      moduleId: getModuleId('mental-game'),
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

  await prisma.question.createMany({ data: placementTestQuestions });
  totalQuestions += placementTestQuestions.length;

  console.log(`✅ Created ${totalQuestions} questions (${totalQuestions - placementTestQuestions.length} module + ${placementTestQuestions.length} placement test)`);
}

async function reseedQuestions() {
  // Delete existing non-placement-test questions only
  // Keep user answers intact — they reference question IDs but old questions are being replaced
  // UserAnswer has onDelete: Cascade from Question, so we need to handle this carefully
  console.log('🗑️  Clearing old questions...');

  // Delete user answers first (they reference old question IDs)
  await prisma.userAnswer.deleteMany();
  // Delete all questions (both regular and placement test)
  await prisma.question.deleteMany();

  console.log('📝 Re-seeding expanded question pool...');

  const modules = await prisma.module.findMany();
  await seedAllQuestions(modules);
}

async function seedGameAchievements() {
  const gameAchievements = [
    { slug: 'first-hand', name: 'First Hand', description: 'Play your first hand vs AI', category: 'GAME', rarity: 'COMMON', xpReward: 25, iconEmoji: '🎲', condition: { type: 'hands_played', value: 1 } },
    { slug: 'card-shark', name: 'Card Shark', description: 'Play 50 hands vs AI', category: 'GAME', rarity: 'RARE', xpReward: 100, iconEmoji: '🦈', condition: { type: 'hands_played', value: 50 } },
    { slug: 'high-roller', name: 'High Roller', description: 'Play 200 hands vs AI', category: 'GAME', rarity: 'EPIC', xpReward: 250, iconEmoji: '🎰', condition: { type: 'hands_played', value: 200 } },
    { slug: 'a-plus-student', name: 'A+ Student', description: 'Get a grade A on a hand', category: 'GAME', rarity: 'RARE', xpReward: 75, iconEmoji: '📝', condition: { type: 'best_grade', value: 'A' } },
    { slug: 'straight-as', name: "Straight A's", description: 'Get 5 grade A hands in a row', category: 'GAME', rarity: 'EPIC', xpReward: 200, iconEmoji: '🌟', condition: { type: 'consecutive_a_grades', value: 5 } },
    { slug: 'shark-slayer', name: 'Shark Slayer', description: 'Win a hand on Hard difficulty', category: 'GAME', rarity: 'RARE', xpReward: 100, iconEmoji: '⚔️', condition: { type: 'hard_win', value: 1 } },
    { slug: 'table-captain', name: 'Table Captain', description: 'Win 10 hands in a row', category: 'GAME', rarity: 'LEGENDARY', xpReward: 500, iconEmoji: '👑', condition: { type: 'consecutive_wins', value: 10 } },
  ];

  let created = 0;
  for (const achievement of gameAchievements) {
    const existing = await prisma.achievement.findUnique({
      where: { slug: achievement.slug },
    });
    if (!existing) {
      await prisma.achievement.create({ data: achievement });
      created++;
    }
  }
  console.log(`✅ Game achievements: ${created} created, ${gameAchievements.length - created} already existed`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
