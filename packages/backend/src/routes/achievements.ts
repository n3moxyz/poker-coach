import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUserAchievements } from '../services/achievementService.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Get all achievements with user's unlock status
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;

    const { unlocked, locked } = await getUserAchievements(prisma, userId);

    // Group by category
    const byCategory = {
      unlocked: groupByCategory(unlocked),
      locked: groupByCategory(locked),
    };

    // Calculate totals
    const total = unlocked.length + locked.length;
    const unlockedCount = unlocked.length;

    res.json({
      summary: {
        total,
        unlocked: unlockedCount,
        percentage: total > 0 ? Math.round((unlockedCount / total) * 100) : 0,
      },
      achievements: {
        unlocked: unlocked.map((a) => ({
          id: a.id,
          slug: a.slug,
          name: a.name,
          description: a.description,
          category: a.category,
          rarity: a.rarity,
          xpReward: a.xpReward,
          iconEmoji: a.iconEmoji,
          unlockedAt: a.unlockedAt,
        })),
        locked: locked.map((a) => ({
          id: a.id,
          slug: a.slug,
          name: a.name,
          description: a.description,
          category: a.category,
          rarity: a.rarity,
          xpReward: a.xpReward,
          iconEmoji: a.iconEmoji,
        })),
      },
      byCategory,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

function groupByCategory<T extends { category: string }>(items: T[]): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export default router;
