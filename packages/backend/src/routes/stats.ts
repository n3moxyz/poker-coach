import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Get user's detailed statistics
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;

    const [stats, streak, moduleProgress, recentAnswers] = await Promise.all([
      prisma.userStats.findUnique({ where: { userId } }),
      prisma.userStreak.findUnique({ where: { userId } }),
      prisma.userProgress.findMany({
        where: { userId },
        include: { module: true },
      }),
      prisma.userAnswer.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { question: { include: { module: true } } },
      }),
    ]);

    // Calculate accuracy by difficulty
    const byDifficulty = await prisma.userAnswer.groupBy({
      by: ['isCorrect'],
      where: { userId },
      _count: true,
    });

    // Calculate accuracy by module
    const moduleStats = moduleProgress.map((p) => ({
      moduleSlug: p.module.slug,
      moduleName: p.module.name,
      status: p.status,
      correctAnswers: p.correctAnswers,
      totalAnswers: p.totalAnswers,
      accuracy: p.totalAnswers > 0 ? Math.round((p.correctAnswers / p.totalAnswers) * 100) : 0,
      masteryScore: Math.round(p.masteryScore),
    }));

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await prisma.userAnswer.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    res.json({
      overview: {
        totalXp: stats?.totalXp || 0,
        level: stats?.level || 1,
        totalQuestions: stats?.totalQuestions || 0,
        totalCorrect: stats?.totalCorrect || 0,
        overallAccuracy:
          stats && stats.totalQuestions > 0
            ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
            : 0,
      },
      streak: {
        current: streak?.currentStreak || 0,
        longest: streak?.longestStreak || 0,
        freezes: streak?.streakFreezes || 0,
      },
      modules: moduleStats,
      recentAnswers: recentAnswers.slice(0, 10).map((a) => ({
        questionType: a.question.type,
        moduleName: a.question.module.name,
        isCorrect: a.isCorrect,
        xpEarned: a.xpEarned,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    // Get top users by XP
    const topUsers = await prisma.userStats.findMany({
      orderBy: { totalXp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Get current user's rank
    const userStats = await prisma.userStats.findUnique({
      where: { userId },
    });

    let userRank = null;
    if (userStats) {
      const higherRanked = await prisma.userStats.count({
        where: { totalXp: { gt: userStats.totalXp } },
      });
      userRank = higherRanked + 1;
    }

    // Get total players
    const totalPlayers = await prisma.userStats.count();

    res.json({
      leaderboard: topUsers.map((s, index) => ({
        rank: index + 1,
        userId: s.userId,
        name: s.user.name || 'Anonymous',
        avatarUrl: s.user.avatarUrl,
        totalXp: s.totalXp,
        level: s.level,
        isCurrentUser: s.userId === userId,
      })),
      currentUser: userRank
        ? {
            rank: userRank,
            totalXp: userStats?.totalXp || 0,
            level: userStats?.level || 1,
            percentile:
              totalPlayers > 0
                ? Math.round(((totalPlayers - userRank) / totalPlayers) * 100)
                : 0,
          }
        : null,
      totalPlayers,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
