import { PrismaClient } from '@prisma/client';

const BASE_XP = 10;

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS: Record<number, number> = {
  1: 1.0, // Easy
  2: 1.5, // Medium
  3: 2.0, // Hard
};

// Streak multipliers
function getStreakMultiplier(streak: number): number {
  if (streak >= 25) return 2.5;
  if (streak >= 10) return 2.0;
  if (streak >= 5) return 1.5;
  if (streak >= 3) return 1.2;
  return 1.0;
}

// Daily first question bonus
const DAILY_FIRST_BONUS = 25;

// Level thresholds: Level N requires 100 * N^1.5 XP total
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1;
  while (getXpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

interface XpCalculationParams {
  difficulty: number;
  currentStreak: number;
  isFirstToday: boolean;
  baseXp?: number;
}

export function calculateXp(params: XpCalculationParams): {
  totalXp: number;
  breakdown: {
    base: number;
    difficultyBonus: number;
    streakBonus: number;
    dailyBonus: number;
  };
} {
  const { difficulty, currentStreak, isFirstToday, baseXp = BASE_XP } = params;

  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const streakMultiplier = getStreakMultiplier(currentStreak);

  // Calculate base with difficulty
  const baseWithDifficulty = Math.round(baseXp * difficultyMultiplier);

  // Apply streak to the difficulty-adjusted base
  const withStreak = Math.round(baseWithDifficulty * streakMultiplier);

  // Add daily bonus if applicable
  const dailyBonus = isFirstToday ? DAILY_FIRST_BONUS : 0;

  const totalXp = withStreak + dailyBonus;

  return {
    totalXp,
    breakdown: {
      base: baseXp,
      difficultyBonus: baseWithDifficulty - baseXp,
      streakBonus: withStreak - baseWithDifficulty,
      dailyBonus,
    },
  };
}

// Check if the user has already answered a question today
export async function hasAnsweredToday(
  prisma: PrismaClient,
  userId: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const answer = await prisma.userAnswer.findFirst({
    where: {
      userId,
      createdAt: {
        gte: today,
      },
    },
  });

  return !!answer;
}

// Update user's total XP and level
export async function updateUserXp(
  prisma: PrismaClient,
  userId: string,
  xpToAdd: number
): Promise<{ totalXp: number; level: number; leveledUp: boolean }> {
  const stats = await prisma.userStats.upsert({
    where: { userId },
    create: {
      userId,
      totalXp: xpToAdd,
      level: 1,
    },
    update: {
      totalXp: {
        increment: xpToAdd,
      },
    },
  });

  const newLevel = getLevelFromXp(stats.totalXp);
  const leveledUp = newLevel > stats.level;

  if (leveledUp) {
    await prisma.userStats.update({
      where: { userId },
      data: { level: newLevel },
    });
  }

  return {
    totalXp: stats.totalXp,
    level: leveledUp ? newLevel : stats.level,
    leveledUp,
  };
}
