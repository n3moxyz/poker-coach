import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateUserXp } from '../services/xpService.js';
import { updateStreak } from '../services/streakService.js';
import { checkAndAwardAchievements } from '../services/achievementService.js';
import { ensureUserExists } from '../services/userService.js';
import {
  calculateGameXp,
  hasPlayedToday,
  getGameStats,
  getHandHistory,
} from '../services/gameService.js';
import { analyzeStreet, generateHandSummary } from '../services/coachingService.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Complete a hand and award XP
router.post('/complete-hand', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const {
      playerCount,
      difficulty,
      smallBlind,
      bigBlind,
      handHistory,
      result,
      chipsDelta,
      overallGrade,
      duration,
    } = req.body;

    if (!playerCount || !difficulty || !handHistory || !result) {
      res.status(400).json({
        error: 'playerCount, difficulty, handHistory, and result are required',
      });
      return;
    }

    await ensureUserExists(userId);

    // Check if first game activity today (for daily bonus)
    const [playedToday, streakUpdate] = await Promise.all([
      hasPlayedToday(prisma, userId),
      updateStreak(prisma, userId),
    ]);

    const isFirstToday = !playedToday;

    // Calculate XP
    const xpResult = calculateGameXp(
      difficulty,
      overallGrade || 'C',
      isFirstToday,
      streakUpdate.currentStreak
    );

    // Save hand + update XP in parallel
    const [hand, xpUpdate] = await Promise.all([
      prisma.pokerHand.create({
        data: {
          userId,
          playerCount,
          difficulty,
          smallBlind: smallBlind || 1,
          bigBlind: bigBlind || 2,
          handHistory,
          result,
          chipsDelta: chipsDelta || 0,
          xpEarned: xpResult.xp,
          overallGrade: overallGrade || null,
          duration: duration || null,
        },
      }),
      updateUserXp(prisma, userId, xpResult.xp),
    ]);

    // Check achievements in background
    checkAndAwardAchievements(prisma, userId).catch((err) =>
      console.error('Failed to check achievements:', err)
    );

    res.json({
      handId: hand.id,
      xpEarned: xpResult.xp,
      breakdown: xpResult.breakdown,
      streak: {
        current: streakUpdate.currentStreak,
        freezeUsed: streakUpdate.freezeUsed,
        newFreezeEarned: streakUpdate.newFreezeEarned,
      },
      levelUp: xpUpdate.leveledUp ? { newLevel: xpUpdate.level } : null,
      achievements: [], // Processed in background
    });
  } catch (error) {
    console.error('Error completing hand:', error);
    res.status(500).json({ error: 'Failed to complete hand' });
  }
});

// Get game history
router.get('/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const { hands, total } = await getHandHistory(prisma, userId, limit, offset);

    res.json({ hands, total, limit, offset });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});

// Get game stats
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const stats = await getGameStats(prisma, userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ error: 'Failed to fetch game stats' });
  }
});

// Per-street coaching analysis
router.post('/coach', requireAuth, async (req: Request, res: Response) => {
  try {
    const { handHistory, street, playerAction, playerCards, communityCards, potSize, position, quality } = req.body;

    if (!handHistory || !street || !playerAction) {
      res.status(400).json({
        error: 'handHistory, street, and playerAction are required',
      });
      return;
    }

    const result = await analyzeStreet(
      { handHistory, street, playerAction, playerCards, communityCards, potSize, position },
      quality === 'sharp' ? 'sharp' : 'standard'
    );

    if (!result) {
      // Fallback when LLM unavailable
      res.json({
        grade: 'B',
        analysis: 'Coaching analysis is currently unavailable. Keep practicing!',
        optimalPlay: playerAction,
        concepts: [],
      });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error getting coaching:', error);
    res.status(500).json({ error: 'Failed to get coaching' });
  }
});

// End-of-hand summary
router.post('/hand-summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const { handHistory, quality } = req.body;

    if (!handHistory) {
      res.status(400).json({ error: 'handHistory is required' });
      return;
    }

    const result = await generateHandSummary(
      handHistory,
      quality === 'sharp' ? 'sharp' : 'standard'
    );

    if (!result) {
      // Fallback when LLM unavailable
      res.json({
        overallGrade: 'B',
        streetAnalysis: [],
        keyLessons: ['Coaching summary is currently unavailable.'],
        coachNote: 'Keep practicing! Your hands are being recorded for review.',
      });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error('Error generating hand summary:', error);
    res.status(500).json({ error: 'Failed to generate hand summary' });
  }
});

export default router;
