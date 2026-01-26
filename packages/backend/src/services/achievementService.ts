import { PrismaClient, Achievement } from '@prisma/client';

interface AchievementCondition {
  type: 'streak' | 'xp' | 'questions' | 'correct' | 'mastery' | 'level';
  value: number;
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
}

function checkCondition(condition: AchievementCondition, context: UserContext): boolean {
  switch (condition.type) {
    case 'streak':
      return context.longestStreak >= condition.value;
    case 'xp':
      return context.totalXp >= condition.value;
    case 'questions':
      return context.totalQuestions >= condition.value;
    case 'correct':
      return context.totalCorrect >= condition.value;
    case 'level':
      return context.level >= condition.value;
    case 'mastery':
      if (condition.moduleSlug) {
        return context.masteredModules.includes(condition.moduleSlug);
      }
      return context.masteredModules.length >= condition.value;
    default:
      return false;
  }
}

export async function checkAndAwardAchievements(
  prisma: PrismaClient,
  userId: string
): Promise<Achievement[]> {
  // Get user's current state
  const [stats, streak, progress, existingAchievements] = await Promise.all([
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
  ]);

  const context: UserContext = {
    totalXp: stats?.totalXp || 0,
    level: stats?.level || 1,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    totalQuestions: stats?.totalQuestions || 0,
    totalCorrect: stats?.totalCorrect || 0,
    masteredModules: progress.map((p) => p.module.slug),
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
