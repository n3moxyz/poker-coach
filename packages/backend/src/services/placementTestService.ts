import { PrismaClient } from '@prisma/client';

// Score to starting level mapping (updated for 10-module curriculum)
// Module unlock XP: 0, 75, 150, 250, 375, 525, 700, 900, 1125, 1375
const PLACEMENT_LEVELS = [
  { minScore: 0, maxScore: 2, level: 'Beginner', xp: 0, modulesUnlocked: 1 },
  { minScore: 3, maxScore: 4, level: 'Knows Basics', xp: 150, modulesUnlocked: 3 },
  { minScore: 5, maxScore: 6, level: 'Intermediate', xp: 375, modulesUnlocked: 5 },
  { minScore: 7, maxScore: 8, level: 'Advanced', xp: 700, modulesUnlocked: 7 },
  { minScore: 9, maxScore: 10, level: 'Expert', xp: 1125, modulesUnlocked: 9 },
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

  // Use transaction with extended timeout for consistency
  await prisma.$transaction(
    async (tx) => {
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

      // Unlock modules based on placement (batch with Promise.all)
      const moduleUnlockPromises = modules
        .slice(0, placement.modulesUnlocked)
        .map((module) =>
          tx.userProgress.upsert({
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
          })
        );
      await Promise.all(moduleUnlockPromises);

      // Record placement test answers (batch with createMany)
      await tx.userAnswer.createMany({
        data: answers.map((answer) => ({
          userId,
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect: answer.isCorrect,
          xpEarned: 0, // No XP for placement test answers
        })),
      });
    },
    {
      maxWait: 10000, // 10 seconds max wait to acquire connection
      timeout: 30000, // 30 seconds timeout for transaction
    }
  );

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

// Special marker for skipped questions
const SKIPPED_MARKER = '__SKIPPED__';

export interface PlacementTestResultsData {
  score: number;
  totalQuestions: number;
  level: string;
  completedAt: Date;
  answers: Array<{
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    isSkipped: boolean;
    correctAnswer: string;
    explanation: string | null;
    questionText: string | null;
    moduleName: string;
  }>;
}

export async function getPlacementTestResults(
  prisma: PrismaClient,
  userId: string
): Promise<PlacementTestResultsData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      placementTestCompleted: true,
      placementTestScore: true,
      updatedAt: true,
    },
  });

  if (!user || !user.placementTestCompleted) {
    return null;
  }

  // Get all placement test answers for this user
  const answers = await prisma.userAnswer.findMany({
    where: {
      userId,
      question: {
        isPlacementTest: true,
      },
    },
    include: {
      question: {
        include: {
          module: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const score = user.placementTestScore || 0;
  const placement = calculateStartingLevel(score);

  return {
    score,
    totalQuestions: answers.length,
    level: placement.level,
    completedAt: user.updatedAt,
    answers: answers.map((a) => {
      const content = a.question.content as Record<string, unknown> | undefined;
      return {
        questionId: a.questionId,
        userAnswer: a.answer,
        isCorrect: a.isCorrect,
        isSkipped: a.answer === SKIPPED_MARKER,
        correctAnswer: a.question.correctAnswer,
        explanation: a.question.explanation,
        questionText: content?.question as string | null,
        moduleName: a.question.module.name,
      };
    }),
  };
}

export async function resetPlacementTest(
  prisma: PrismaClient,
  userId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Delete all placement test answers for this user
    await tx.userAnswer.deleteMany({
      where: {
        userId,
        question: {
          isPlacementTest: true,
        },
      },
    });

    // Reset user's placement test status
    await tx.user.update({
      where: { id: userId },
      data: {
        placementTestCompleted: false,
        placementTestScore: null,
      },
    });
  });
}
