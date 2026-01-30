import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ensureUserExists } from '../services/userService.js';
import { calculateModuleStatus, calculateProgressStatus } from '../services/moduleStatusService.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shuffle options in question content
function shuffleQuestionOptions(content: unknown): unknown {
  if (!content || typeof content !== 'object') return content;
  const c = content as Record<string, unknown>;

  // Shuffle options array if present
  if (Array.isArray(c.options)) {
    return { ...c, options: shuffleArray(c.options) };
  }

  return content;
}

// Get all modules with user progress
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;

    // Fetch all data in parallel for better performance
    const [stats, modules, progress, uniqueCorrectByModule] = await Promise.all([
      // Get user's total XP for unlock checking
      prisma.userStats.findUnique({
        where: { userId },
      }),
      // Get all modules with question counts (excluding placement test questions)
      prisma.module.findMany({
        orderBy: { orderIndex: 'asc' },
        include: {
          _count: {
            select: {
              questions: {
                where: { isPlacementTest: false },
              },
            },
          },
        },
      }),
      // Get user's progress for each module
      prisma.userProgress.findMany({
        where: { userId },
      }),
      // Get count of unique questions answered correctly per module
      prisma.$queryRaw<Array<{ moduleId: string; uniqueCorrect: bigint }>>`
        SELECT q."moduleId", COUNT(DISTINCT ua."questionId") as "uniqueCorrect"
        FROM "UserAnswer" ua
        JOIN "Question" q ON ua."questionId" = q.id
        WHERE ua."userId" = ${userId}
        AND ua."isCorrect" = true
        AND q."isPlacementTest" = false
        GROUP BY q."moduleId"
      `,
    ]);

    const totalXp = stats?.totalXp || 0;
    const progressMap = new Map(progress.map((p) => [p.moduleId, p]));
    const uniqueCorrectMap = new Map(
      uniqueCorrectByModule.map((r) => [r.moduleId, Number(r.uniqueCorrect)])
    );

    // Combine module data with progress
    const modulesWithProgress = modules.map((module) => {
      const userProgress = progressMap.get(module.id);
      const isUnlocked = totalXp >= module.unlockRequirement;
      const uniqueCorrect = uniqueCorrectMap.get(module.id) || 0;

      // Use shared status calculation logic
      const status = calculateModuleStatus({ userProgress, isUnlocked });

      return {
        id: module.id,
        slug: module.slug,
        name: module.name,
        description: module.description,
        difficulty: module.difficulty,
        orderIndex: module.orderIndex,
        unlockRequirement: module.unlockRequirement,
        iconEmoji: module.iconEmoji,
        questionCount: module._count.questions,
        status,
        isUnlocked,
        progress: userProgress
          ? {
              uniqueCorrect,
              totalQuestions: module._count.questions,
              masteryScore: userProgress.masteryScore,
              currentStreak: userProgress.currentStreak,
            }
          : null,
      };
    });

    res.json({ modules: modulesWithProgress, totalXp });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get single module detail
router.get('/:slug', requireAuth, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const userId = req.auth!.userId;

    // Fetch module and stats in parallel
    const [module, stats] = await Promise.all([
      prisma.module.findUnique({
        where: { slug },
        include: {
          _count: {
            select: {
              questions: {
                where: { isPlacementTest: false },
              },
            },
          },
        },
      }),
      prisma.userStats.findUnique({
        where: { userId },
      }),
    ]);

    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    const totalXp = stats?.totalXp || 0;

    if (totalXp < module.unlockRequirement) {
      res.status(403).json({
        error: 'Module locked',
        xpNeeded: module.unlockRequirement - totalXp,
      });
      return;
    }

    // Ensure user exists before creating progress
    await ensureUserExists(userId);

    // Fetch progress, question types, and unique correct count in parallel
    const [existingProgress, questionTypes, uniqueCorrectResult] = await Promise.all([
      prisma.userProgress.findUnique({
        where: {
          userId_moduleId: { userId, moduleId: module.id },
        },
      }),
      prisma.question.groupBy({
        by: ['type'],
        where: { moduleId: module.id, isPlacementTest: false },
        _count: true,
      }),
      prisma.$queryRaw<Array<{ uniqueCorrect: bigint }>>`
        SELECT COUNT(DISTINCT ua."questionId") as "uniqueCorrect"
        FROM "UserAnswer" ua
        JOIN "Question" q ON ua."questionId" = q.id
        WHERE ua."userId" = ${userId}
        AND ua."isCorrect" = true
        AND q."moduleId" = ${module.id}
        AND q."isPlacementTest" = false
      `,
    ]);

    const uniqueCorrect = uniqueCorrectResult[0]?.uniqueCorrect
      ? Number(uniqueCorrectResult[0].uniqueCorrect)
      : 0;

    // Create progress if needed
    let progress = existingProgress;
    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId,
          moduleId: module.id,
          status: 'UNLOCKED',
        },
      });
    }

    // Use shared status calculation logic
    const calculatedStatus = calculateProgressStatus(
      progress.status,
      progress.correctAnswers,
      progress.totalAnswers
    );

    res.json({
      module: {
        id: module.id,
        slug: module.slug,
        name: module.name,
        description: module.description,
        difficulty: module.difficulty,
        iconEmoji: module.iconEmoji,
        masteryXpBonus: module.masteryXpBonus,
        questionCount: module._count.questions,
        questionTypes: questionTypes.map((qt) => ({
          type: qt.type,
          count: qt._count,
        })),
      },
      progress: {
        status: calculatedStatus,
        uniqueCorrect,
        totalQuestions: module._count.questions,
        totalAnswers: progress.totalAnswers, // Keep for mastery progress (needs 20+ answers)
        masteryScore: progress.masteryScore,
        currentStreak: progress.currentStreak,
      },
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Get practice questions for a module
router.get('/:slug/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const count = Math.min(parseInt(req.query.count as string) || 10, 20);
    const userId = req.auth!.userId;

    const module = await prisma.module.findUnique({
      where: { slug },
    });

    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    // Check access
    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });
    const totalXp = stats?.totalXp || 0;

    if (totalXp < module.unlockRequirement) {
      res.status(403).json({ error: 'Module locked' });
      return;
    }

    // Get random questions (excluding placement test questions)
    // Using a raw query for true randomness
    const questions = await prisma.$queryRaw<
      Array<{
        id: string;
        type: string;
        difficulty: number;
        content: unknown;
        xpValue: number;
      }>
    >`
      SELECT id, type, difficulty, content, "xpValue"
      FROM "Question"
      WHERE "moduleId" = ${module.id}
      AND "isPlacementTest" = false
      ORDER BY RANDOM()
      LIMIT ${count}
    `;

    // Don't include correct answers in response
    // Shuffle options to prevent pattern recognition
    res.json({
      moduleId: module.id,
      moduleName: module.name,
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        content: shuffleQuestionOptions(q.content),
        xpValue: q.xpValue,
      })),
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

export default router;
