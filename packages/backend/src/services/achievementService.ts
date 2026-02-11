import { PrismaClient, Achievement } from '@prisma/client';

interface AchievementCondition {
  type: string;
  value: number | string;
  moduleSlug?: string; // For module-specific achievements
}

interface UserContext {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestions: number;
  totalCorrect: number;
  masteredModules: string[];
  // Game stats
  handsPlayed: number;
  handsWon: number;
  bestGrade: string | null;
  consecutiveAGrades: number;
  consecutiveWins: number;
  hasHardWin: boolean;
}

function checkCondition(condition: AchievementCondition, context: UserContext): boolean {
  switch (condition.type) {
    case 'streak':
      return context.longestStreak >= (condition.value as number);
    case 'xp':
      return context.totalXp >= (condition.value as number);
    case 'questions':
      return context.totalQuestions >= (condition.value as number);
    case 'correct':
      return context.totalCorrect >= (condition.value as number);
    case 'level':
      return context.level >= (condition.value as number);
    case 'mastery':
      if (condition.moduleSlug) {
        return context.masteredModules.includes(condition.moduleSlug);
      }
      return context.masteredModules.length >= (condition.value as number);
    case 'hands_played':
      return context.handsPlayed >= (condition.value as number);
    case 'hands_won':
      return context.handsWon >= (condition.value as number);
    case 'best_grade':
      return context.bestGrade === condition.value;
    case 'consecutive_a_grades':
      return context.consecutiveAGrades >= (condition.value as number);
    case 'consecutive_wins':
      return context.consecutiveWins >= (condition.value as number);
    case 'hard_win':
      return context.hasHardWin;
    default:
      return false;
  }
}

export async function checkAndAwardAchievements(
  prisma: PrismaClient,
  userId: string
): Promise<Achievement[]> {
  // Get user's current state
  const [stats, streak, progress, existingAchievements, recentHands] = await Promise.all([
    prisma.userStats.findUnique({ where: { userId } }),
    prisma.userStreak.findUnique({ where: { userId } }),
    prisma.userProgress.findMany({
      where: { userId, status: 'MASTERED' },
      include: { module: true },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    prisma.pokerHand.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: { result: true, overallGrade: true, difficulty: true },
    }),
  ]);

  // Calculate game stats from recent hands
  const handsPlayed = recentHands.length;
  const handsWon = recentHands.filter((h) => h.result === 'WON').length;
  const hasHardWin = recentHands.some(
    (h) => h.difficulty === 'HARD' && h.result === 'WON'
  );
  const bestGrade = recentHands.find((h) => h.overallGrade === 'A')
    ? 'A'
    : null;

  // Count consecutive A grades from most recent
  let consecutiveAGrades = 0;
  for (const hand of recentHands) {
    if (hand.overallGrade === 'A') {
      consecutiveAGrades++;
    } else if (hand.overallGrade) {
      break;
    }
  }

  // Count consecutive wins from most recent
  let consecutiveWins = 0;
  for (const hand of recentHands) {
    if (hand.result === 'WON') {
      consecutiveWins++;
    } else {
      break;
    }
  }

  const context: UserContext = {
    totalXp: stats?.totalXp || 0,
    level: stats?.level || 1,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    totalQuestions: stats?.totalQuestions || 0,
    totalCorrect: stats?.totalCorrect || 0,
    masteredModules: progress.map((p) => p.module.slug),
    handsPlayed,
    handsWon,
    bestGrade,
    consecutiveAGrades,
    consecutiveWins,
    hasHardWin,
  };

  const existingIds = new Set(existingAchievements.map((a) => a.achievementId));

  // Get all achievements
  const allAchievements = await prisma.achievement.findMany();

  const newlyUnlocked: Achievement[] = [];

  for (const achievement of allAchievements) {
    if (existingIds.has(achievement.id)) {
      continue; // Already unlocked
    }

    const condition = achievement.condition as unknown as AchievementCondition;
    if (checkCondition(condition, context)) {
      // Award achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award XP bonus
      if (achievement.xpReward > 0) {
        await prisma.userStats.update({
          where: { userId },
          data: {
            totalXp: { increment: achievement.xpReward },
          },
        });
      }

      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

export async function getUserAchievements(
  prisma: PrismaClient,
  userId: string
): Promise<{
  unlocked: (Achievement & { unlockedAt: Date })[];
  locked: Achievement[];
}> {
  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { xpReward: 'asc' }],
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    }),
  ]);

  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  const unlocked: (Achievement & { unlockedAt: Date })[] = [];
  const locked: Achievement[] = [];

  for (const achievement of allAchievements) {
    const unlockedAt = unlockedMap.get(achievement.id);
    if (unlockedAt) {
      unlocked.push({ ...achievement, unlockedAt });
    } else {
      locked.push(achievement);
    }
  }

  return { unlocked, locked };
}
