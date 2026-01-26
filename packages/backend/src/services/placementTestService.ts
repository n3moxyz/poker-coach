import { PrismaClient } from '@prisma/client';

// Score to starting level mapping
const PLACEMENT_LEVELS = [
  { minScore: 0, maxScore: 3, level: 'Beginner', xp: 0, modulesUnlocked: 1 },
  { minScore: 4, maxScore: 5, level: 'Knows Basics', xp: 100, modulesUnlocked: 2 },
  { minScore: 6, maxScore: 7, level: 'Intermediate', xp: 250, modulesUnlocked: 3 },
  { minScore: 8, maxScore: 9, level: 'Advanced', xp: 450, modulesUnlocked: 4 },
  { minScore: 10, maxScore: 10, level: 'Expert', xp: 700, modulesUnlocked: 5 },
];

export interface PlacementResult {
  score: number;
  totalQuestions: number;
  level: string;
  xpGranted: number;
  modulesUnlocked: number;
}

export async function getPlacementQuestions(prisma: PrismaClient) {
  // Get all placement test questions
  const questions = await prisma.question.findMany({
    where: {
      isPlacementTest: true,
    },
    select: {
      id: true,
      type: true,
      difficulty: true,
      content: true,
      xpValue: true,
      module: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
    orderBy: [
      { difficulty: 'asc' },
      { moduleId: 'asc' },
    ],
  });

  return questions;
}

export function calculateStartingLevel(score: number): {
  level: string;
  xp: number;
  modulesUnlocked: number;
} {
  const placement = PLACEMENT_LEVELS.find(
    (p) => score >= p.minScore && score <= p.maxScore
  );

  if (!placement) {
    // Default to beginner if no match
    return { level: 'Beginner', xp: 0, modulesUnlocked: 1 };
  }

  return {
    level: placement.level,
    xp: placement.xp,
    modulesUnlocked: placement.modulesUnlocked,
  };
}

export async function applyPlacementResults(
  prisma: PrismaClient,
  userId: string,
  score: number,
  answers: Array<{ questionId: string; answer: string; isCorrect: boolean }>
): Promise<PlacementResult> {
  const placement = calculateStartingLevel(score);

  // Get all modules ordered by unlock requirement
  const modules = await prisma.module.findMany({
    orderBy: { orderIndex: 'asc' },
  });

  // Use transaction for consistency
  await prisma.$transaction(async (tx) => {
    // Update user with placement test results
    await tx.user.update({
      where: { id: userId },
      data: {
        placementTestCompleted: true,
        placementTestScore: score,
      },
    });

    // Update or create user stats with starting XP
    await tx.userStats.upsert({
      where: { userId },
      create: {
        userId,
        totalXp: placement.xp,
        level: 1,
      },
      update: {
        totalXp: placement.xp,
      },
    });

    // Unlock modules based on placement
    for (let i = 0; i < placement.modulesUnlocked && i < modules.length; i++) {
      const module = modules[i];
      await tx.userProgress.upsert({
        where: {
          userId_moduleId: { userId, moduleId: module.id },
        },
        create: {
          userId,
          moduleId: module.id,
          status: 'UNLOCKED',
        },
        update: {
          status: 'UNLOCKED',
        },
      });
    }

    // Record placement test answers (without XP, for tracking only)
    for (const answer of answers) {
      await tx.userAnswer.create({
        data: {
          userId,
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect: answer.isCorrect,
          xpEarned: 0, // No XP for placement test answers
        },
      });
    }
  });

  return {
    score,
    totalQuestions: answers.length,
    level: placement.level,
    xpGranted: placement.xp,
    modulesUnlocked: placement.modulesUnlocked,
  };
}

export async function skipPlacementTest(
  prisma: PrismaClient,
  userId: string
): Promise<PlacementResult> {
  // Skipping = treat as beginner (score 0)
  const placement = calculateStartingLevel(0);

  // Get first module
  const firstModule = await prisma.module.findFirst({
    orderBy: { orderIndex: 'asc' },
  });

  await prisma.$transaction(async (tx) => {
    // Mark placement test as completed with score 0
    await tx.user.update({
      where: { id: userId },
      data: {
        placementTestCompleted: true,
        placementTestScore: 0,
      },
    });

    // Ensure user stats exist
    await tx.userStats.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Ensure first module is unlocked
    if (firstModule) {
      await tx.userProgress.upsert({
        where: {
          userId_moduleId: { userId, moduleId: firstModule.id },
        },
        create: {
          userId,
          moduleId: firstModule.id,
          status: 'UNLOCKED',
        },
        update: {},
      });
    }
  });

  return {
    score: 0,
    totalQuestions: 0,
    level: placement.level,
    xpGranted: 0,
    modulesUnlocked: 1,
  };
}

export async function needsPlacementTest(
  prisma: PrismaClient,
  userId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { placementTestCompleted: true },
  });

  return user ? !user.placementTestCompleted : true;
}
