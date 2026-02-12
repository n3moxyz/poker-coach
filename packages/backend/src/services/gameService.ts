import { PrismaClient } from '@prisma/client';
import { getStreakMultiplier } from './xpService.js';

const GAME_BASE_XP = 15;
const DAILY_FIRST_BONUS = 25;

const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  EASY: 1,
  MEDIUM: 1.5,
  HARD: 2,
};

const GRADE_MULTIPLIERS: Record<string, number> = {
  A: 2,
  B: 1.5,
  C: 1,
  D: 0.75,
  F: 0.5,
};

interface GameXpResult {
  xp: number;
  breakdown: {
    base: number;
    difficulty: number;
    grade: number;
    streak: number;
    daily: number;
  };
}

export function calculateGameXp(
  difficulty: string,
  grade: string,
  isFirstToday: boolean,
  currentStreak: number
): GameXpResult {
  const diffMult = DIFFICULTY_MULTIPLIERS[difficulty] || 1;
  const gradeMult = GRADE_MULTIPLIERS[grade] || 1;

  const baseWithDifficulty = Math.round(GAME_BASE_XP * diffMult);
  const withGrade = Math.round(baseWithDifficulty * gradeMult);
  const streakMult = getStreakMultiplier(currentStreak);
  const withStreak = Math.round(withGrade * streakMult);
  const dailyBonus = isFirstToday ? DAILY_FIRST_BONUS : 0;
  const totalXp = withStreak + dailyBonus;

  return {
    xp: totalXp,
    breakdown: {
      base: GAME_BASE_XP,
      difficulty: baseWithDifficulty - GAME_BASE_XP,
      grade: withGrade - baseWithDifficulty,
      streak: withStreak - withGrade,
      daily: dailyBonus,
    },
  };
}

export async function hasPlayedToday(
  prisma: PrismaClient,
  userId: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hand = await prisma.pokerHand.findFirst({
    where: {
      userId,
      createdAt: { gte: today },
    },
  });

  return !!hand;
}

export async function getGameStats(
  prisma: PrismaClient,
  userId: string
): Promise<{
  handsPlayed: number;
  handsWon: number;
  winRate: number;
  avgGrade: string;
  totalXpFromHands: number;
  bestGrade: string;
}> {
  const hands = await prisma.pokerHand.findMany({
    where: { userId },
    select: {
      result: true,
      overallGrade: true,
      xpEarned: true,
    },
  });

  const handsPlayed = hands.length;
  const handsWon = hands.filter((h) => h.result === 'WON').length;
  const winRate = handsPlayed > 0 ? Math.round((handsWon / handsPlayed) * 100) : 0;

  const gradeOrder = ['A', 'B', 'C', 'D', 'F'];
  const gradedHands = hands.filter((h) => h.overallGrade);
  const totalXpFromHands = hands.reduce((sum, h) => sum + h.xpEarned, 0);

  let avgGrade = '-';
  let bestGrade = '-';

  if (gradedHands.length > 0) {
    const gradeValues = gradedHands.map(
      (h) => gradeOrder.indexOf(h.overallGrade!)
    );
    const avgIndex = Math.round(
      gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length
    );
    avgGrade = gradeOrder[Math.min(avgIndex, gradeOrder.length - 1)];
    bestGrade = gradeOrder[Math.min(...gradeValues)];
  }

  return { handsPlayed, handsWon, winRate, avgGrade, totalXpFromHands, bestGrade };
}

export async function getHandById(
  prisma: PrismaClient,
  userId: string,
  handId: string
) {
  return prisma.pokerHand.findFirst({
    where: { id: handId, userId },
    select: {
      id: true,
      playerCount: true,
      difficulty: true,
      smallBlind: true,
      bigBlind: true,
      handHistory: true,
      result: true,
      chipsDelta: true,
      xpEarned: true,
      overallGrade: true,
      duration: true,
      createdAt: true,
    },
  });
}

export async function getHandHistory(
  prisma: PrismaClient,
  userId: string,
  limit: number,
  offset: number
) {
  const [hands, total] = await Promise.all([
    prisma.pokerHand.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        playerCount: true,
        difficulty: true,
        result: true,
        chipsDelta: true,
        xpEarned: true,
        overallGrade: true,
        duration: true,
        createdAt: true,
      },
    }),
    prisma.pokerHand.count({ where: { userId } }),
  ]);

  return { hands, total };
}
