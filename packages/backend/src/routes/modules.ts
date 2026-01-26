import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { ensureUserExists } from '../services/userService.js';
import { calculateModuleStatus, calculateProgressStatus } from '../services/moduleStatusService.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Get all modules with user progress
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;

    // Get user's total XP for unlock checking
    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });
    const totalXp = stats?.totalXp || 0;

    // Get all modules
    const modules = await prisma.module.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    // Get user's progress for each module
    const progress = await prisma.userProgress.findMany({
      where: { userId },
    });
    const progressMap = new Map(progress.map((p) => [p.moduleId, p]));

    // Combine module data with progress
    const modulesWithProgress = modules.map((module) => {
      const userProgress = progressMap.get(module.id);
      const isUnlocked = totalXp >= module.unlockRequirement;

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
              correctAnswers: userProgress.correctAnswers,
              totalAnswers: userProgress.totalAnswers,
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

    const module = await prisma.module.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    // Check if user can access this module
    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });
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

    // Get or create user progress
    let progress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId: { userId, moduleId: module.id },
      },
    });

    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId,
          moduleId: module.id,
          status: 'UNLOCKED',
        },
      });
    }

    // Get question type distribution
    const questionTypes = await prisma.question.groupBy({
      by: ['type'],
      where: { moduleId: module.id },
      _count: true,
    });

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
        correctAnswers: progress.correctAnswers,
        totalAnswers: progress.totalAnswers,
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

    // Get random questions
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
      ORDER BY RANDOM()
      LIMIT ${count}
    `;

    // Don't include correct answers in response
    res.json({
      moduleId: module.id,
      moduleName: module.name,
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        content: q.content,
        xpValue: q.xpValue,
      })),
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

export default router;
