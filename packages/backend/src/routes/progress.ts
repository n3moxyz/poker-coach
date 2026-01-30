import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { calculateXp, hasAnsweredToday, updateUserXp, getLevelFromXp } from '../services/xpService.js';
import { updateStreak, getStreak } from '../services/streakService.js';
import { checkAndAwardAchievements } from '../services/achievementService.js';
import { ensureUserExists } from '../services/userService.js';
import prisma from '../lib/prisma.js';

const router = Router();

const MASTERY_THRESHOLD = 80; // 80% accuracy required
const MASTERY_MIN_QUESTIONS = 20;
const RECENT_WEIGHT = 0.6; // 60% weight on last 10 answers
const OVERALL_WEIGHT = 0.4; // 40% weight on overall accuracy

// Get user's overall progress
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;

    // Ensure user exists before creating related records
    await ensureUserExists(userId);

    // Get or create user stats
    let stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await prisma.userStats.create({
        data: { userId },
      });
    }

    // Fetch streak, module progress, and module count in parallel
    const [streak, moduleProgress, totalModules] = await Promise.all([
      getStreak(prisma, userId),
      prisma.userProgress.findMany({
        where: { userId },
        include: { module: true },
      }),
      prisma.module.count(),
    ]);

    const masteredCount = moduleProgress.filter((p) => p.status === 'MASTERED').length;

    res.json({
      stats: {
        totalXp: stats.totalXp,
        level: stats.level,
        xpToNextLevel: Math.floor(100 * Math.pow(stats.level + 1, 1.5)) - stats.totalXp,
        totalQuestions: stats.totalQuestions,
        totalCorrect: stats.totalCorrect,
        accuracy:
          stats.totalQuestions > 0
            ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
            : 0,
      },
      streak: {
        current: streak.currentStreak,
        longest: streak.longestStreak,
        freezes: streak.streakFreezes,
        isActiveToday: streak.isActiveToday,
      },
      modules: {
        total: totalModules,
        mastered: masteredCount,
        inProgress: moduleProgress.filter((p) => p.status === 'IN_PROGRESS').length,
      },
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Submit an answer
router.post('/answer', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const { questionId, answer, timeSpent } = req.body;

    if (!questionId || answer === undefined) {
      res.status(400).json({ error: 'questionId and answer are required' });
      return;
    }

    // Ensure user exists first (required for foreign key constraints)
    await ensureUserExists(userId);

    // Run remaining queries in parallel for speed
    const [question, answeredToday, streakUpdate] = await Promise.all([
      prisma.question.findUnique({
        where: { id: questionId },
        include: { module: true },
      }),
      hasAnsweredToday(prisma, userId),
      updateStreak(prisma, userId),
    ]);

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    // Check if answer is correct
    const isCorrect = answer.toString().toLowerCase() === question.correctAnswer.toLowerCase();

    // Check if first answer today
    const isFirstToday = !answeredToday;

    // Calculate XP earned (only for correct answers)
    let xpResult = { totalXp: 0, breakdown: { base: 0, difficultyBonus: 0, streakBonus: 0, dailyBonus: 0 } };
    if (isCorrect) {
      xpResult = calculateXp({
        difficulty: question.difficulty,
        currentStreak: streakUpdate.currentStreak,
        isFirstToday,
        baseXp: question.xpValue,
      });
    }

    // Use transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Record the answer
      await tx.userAnswer.create({
        data: {
          userId,
          questionId,
          answer: answer.toString(),
          isCorrect,
          xpEarned: xpResult.totalXp,
          timeSpent,
        },
      });

      // Update user stats
      await tx.userStats.upsert({
        where: { userId },
        create: {
          userId,
          totalXp: xpResult.totalXp,
          level: 1,
          totalQuestions: 1,
          totalCorrect: isCorrect ? 1 : 0,
        },
        update: {
          totalXp: { increment: xpResult.totalXp },
          totalQuestions: { increment: 1 },
          totalCorrect: { increment: isCorrect ? 1 : 0 },
        },
      });

      // Get existing progress to check current status
      const existingProgress = await tx.userProgress.findUnique({
        where: {
          userId_moduleId: { userId, moduleId: question.moduleId },
        },
      });

      // Only set status to IN_PROGRESS if not already MASTERED
      const progressStatus = existingProgress?.status === 'MASTERED'
        ? 'MASTERED'
        : 'IN_PROGRESS';

      // Update module progress
      const progress = await tx.userProgress.upsert({
        where: {
          userId_moduleId: { userId, moduleId: question.moduleId },
        },
        create: {
          userId,
          moduleId: question.moduleId,
          status: 'IN_PROGRESS',
          correctAnswers: isCorrect ? 1 : 0,
          totalAnswers: 1,
          currentStreak: isCorrect ? 1 : 0,
          recentAnswers: JSON.stringify([isCorrect]),
        },
        update: {
          status: progressStatus,
          correctAnswers: { increment: isCorrect ? 1 : 0 },
          totalAnswers: { increment: 1 },
          currentStreak: isCorrect ? { increment: 1 } : 0,
        },
      });

      // Update recent answers array (keep last 10)
      let recentAnswers: boolean[] = [];
      try {
        recentAnswers = JSON.parse(progress.recentAnswers as string);
      } catch {
        recentAnswers = [];
      }
      recentAnswers.push(isCorrect);
      if (recentAnswers.length > 10) {
        recentAnswers = recentAnswers.slice(-10);
      }

      // Calculate weighted mastery score
      const overallAccuracy = progress.totalAnswers > 0
        ? (progress.correctAnswers / progress.totalAnswers) * 100
        : 0;
      const recentAccuracy = recentAnswers.length > 0
        ? (recentAnswers.filter(Boolean).length / recentAnswers.length) * 100
        : 0;
      const masteryScore = (overallAccuracy * OVERALL_WEIGHT) + (recentAccuracy * RECENT_WEIGHT);

      // Check for mastery
      const achievedMastery =
        progress.totalAnswers >= MASTERY_MIN_QUESTIONS &&
        masteryScore >= MASTERY_THRESHOLD &&
        progress.status !== 'MASTERED';

      const newStatus = achievedMastery ? 'MASTERED' : progress.status;

      // Update mastery score and recent answers
      await tx.userProgress.update({
        where: { id: progress.id },
        data: {
          masteryScore,
          recentAnswers: JSON.stringify(recentAnswers),
          status: newStatus,
        },
      });

      // If mastered, award bonus XP
      if (achievedMastery) {
        await tx.userStats.update({
          where: { userId },
          data: {
            totalXp: { increment: question.module.masteryXpBonus },
          },
        });
      }

      return {
        progress,
        masteryScore,
        achievedMastery,
        masteryBonus: achievedMastery ? question.module.masteryXpBonus : 0,
      };
    });

    // Get updated stats for level calculation (include in same query batch)
    const updatedStats = await prisma.userStats.findUnique({
      where: { userId },
    });

    const currentTotalXp = (updatedStats?.totalXp || 0) + result.masteryBonus;
    const newLevel = getLevelFromXp(currentTotalXp);
    const leveledUp = newLevel > (updatedStats?.level || 1);

    // Update level if needed (don't await - not critical for response)
    if (leveledUp) {
      prisma.userStats.update({
        where: { userId },
        data: { level: newLevel },
      }).catch(err => console.error('Failed to update level:', err));
    }

    // Check for achievements in background (don't block response)
    // Users will see new achievements on achievements page or next answer
    checkAndAwardAchievements(prisma, userId).catch(err =>
      console.error('Failed to check achievements:', err)
    );

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      xp: {
        earned: xpResult.totalXp,
        breakdown: xpResult.breakdown,
        masteryBonus: result.masteryBonus,
        total: currentTotalXp,
      },
      streak: {
        current: streakUpdate.currentStreak,
        freezeUsed: streakUpdate.freezeUsed,
        newFreezeEarned: streakUpdate.newFreezeEarned,
      },
      moduleProgress: {
        masteryScore: result.masteryScore,
        achievedMastery: result.achievedMastery,
        questionsAnswered: result.progress.totalAnswers + 1,
        questionsToMastery: Math.max(0, MASTERY_MIN_QUESTIONS - (result.progress.totalAnswers + 1)),
      },
      levelUp: leveledUp ? { newLevel } : null,
      achievements: [], // Achievements processed in background
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Complete a practice session
router.post('/complete-session', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const { moduleSlug, correctCount, totalCount } = req.body;

    console.log('Complete session called:', { moduleSlug, correctCount, totalCount });

    if (!moduleSlug || correctCount === undefined || totalCount === undefined) {
      res.status(400).json({ error: 'moduleSlug, correctCount, and totalCount are required' });
      return;
    }

    // Get the module
    const module = await prisma.module.findUnique({
      where: { slug: moduleSlug },
    });

    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    // Get current progress
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId: { userId, moduleId: module.id },
      },
    });

    if (!progress) {
      res.status(404).json({ error: 'No progress found for this module' });
      return;
    }

    // Don't downgrade from MASTERED
    if (progress.status === 'MASTERED') {
      res.json({ status: 'MASTERED', message: 'Already mastered' });
      return;
    }

    // Calculate session accuracy
    const sessionAccuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    // Determine new status based on session performance
    // COMPLETED if >=50% correct, otherwise stays IN_PROGRESS
    let newStatus = progress.status;
    if (sessionAccuracy >= 50) {
      newStatus = 'COMPLETED';
    }

    // Update progress
    await prisma.userProgress.update({
      where: { id: progress.id },
      data: { status: newStatus },
    });

    console.log('Session completed:', { moduleSlug, oldStatus: progress.status, newStatus, sessionAccuracy });

    res.json({
      status: newStatus,
      sessionAccuracy: Math.round(sessionAccuracy),
      correctCount,
      totalCount,
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

export default router;
