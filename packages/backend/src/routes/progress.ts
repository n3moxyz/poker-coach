import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';
import { calculateXp, hasAnsweredToday, updateUserXp, getLevelFromXp } from '../services/xpService.js';
import { updateStreak, getStreak } from '../services/streakService.js';
import { checkAndAwardAchievements } from '../services/achievementService.js';
import { ensureUserExists } from '../services/userService.js';

const router = Router();
const prisma = new PrismaClient();

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

    const streak = await getStreak(prisma, userId);

    // Get module progress
    const moduleProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: { module: true },
    });

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
        total: await prisma.module.count(),
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

    // Ensure user exists before creating records
    await ensureUserExists(userId);

    // Get the question with correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { module: true },
    });

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    // Check if answer is correct
    const isCorrect = answer.toString().toLowerCase() === question.correctAnswer.toLowerCase();

    // Check if first answer today
    const isFirstToday = !(await hasAnsweredToday(prisma, userId));

    // Update streak
    const streakUpdate = await updateStreak(prisma, userId);

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

    // Get updated stats for level calculation
    const updatedStats = await prisma.userStats.findUnique({
      where: { userId },
    });

    const newLevel = getLevelFromXp(updatedStats?.totalXp || 0);
    const leveledUp = newLevel > (updatedStats?.level || 1);

    if (leveledUp) {
      await prisma.userStats.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    // Check for new achievements
    const newAchievements = await checkAndAwardAchievements(prisma, userId);

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      xp: {
        earned: xpResult.totalXp,
        breakdown: xpResult.breakdown,
        masteryBonus: result.masteryBonus,
        total: (updatedStats?.totalXp || 0) + result.masteryBonus,
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
      achievements: newAchievements.map((a) => ({
        name: a.name,
        description: a.description,
        rarity: a.rarity,
        xpReward: a.xpReward,
        iconEmoji: a.iconEmoji,
      })),
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
