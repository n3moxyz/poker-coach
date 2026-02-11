import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import prisma from './lib/prisma.js';
import { requireAuth } from './middleware/auth.js';
import modulesRouter from './routes/modules.js';
import progressRouter from './routes/progress.js';
import achievementsRouter from './routes/achievements.js';
import statsRouter from './routes/stats.js';
import placementTestRouter from './routes/placementTest.js';
import gameRouter from './routes/game.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5000',
  'https://pokercoach.vercel.app',
  'https://pokercoach.cc',
  'https://www.pokercoach.cc',
];

// Add FRONTEND_URL from env if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Allow localhost on any port for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/modules', modulesRouter);
app.use('/api/progress', progressRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/placement-test', placementTestRouter);
app.use('/api/game', gameRouter);

// User sync endpoint - SECURED with Clerk token verification
// userId comes from the verified JWT token, not the request body
app.post('/api/users/sync', requireAuth, async (req, res) => {
  try {
    // Get userId from verified token (set by requireAuth middleware)
    const userId = req.auth!.userId;

    // Get optional profile data from body (email, name, avatarUrl come from Clerk)
    const { email, name, avatarUrl } = req.body;

    // Validate email format if provided
    if (email && typeof email === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }
    }

    // Sanitize string inputs to prevent XSS
    const sanitizedName = typeof name === 'string' ? name.slice(0, 255) : null;
    const sanitizedAvatarUrl = typeof avatarUrl === 'string' && avatarUrl.startsWith('https://')
      ? avatarUrl.slice(0, 2048)
      : null;

    // Upsert user
    const user = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: email || `${userId}@clerk.user`,
        name: sanitizedName,
        avatarUrl: sanitizedAvatarUrl,
      },
      update: {
        ...(email && { email }),
        ...(sanitizedName && { name: sanitizedName }),
        ...(sanitizedAvatarUrl && { avatarUrl: sanitizedAvatarUrl }),
      },
    });

    // Ensure user stats exist (handle race condition with findFirst + create fallback)
    const existingStats = await prisma.userStats.findUnique({ where: { userId } });
    if (!existingStats) {
      try {
        await prisma.userStats.create({ data: { userId } });
      } catch (e: unknown) {
        // Ignore P2002 unique constraint error (record was created by concurrent request)
        if (!(e && typeof e === 'object' && 'code' in e && e.code === 'P2002')) throw e;
      }
    }

    // Ensure user streak exists (handle race condition with findFirst + create fallback)
    const existingStreak = await prisma.userStreak.findUnique({ where: { userId } });
    if (!existingStreak) {
      try {
        await prisma.userStreak.create({ data: { userId } });
      } catch (e: unknown) {
        // Ignore P2002 unique constraint error (record was created by concurrent request)
        if (!(e && typeof e === 'object' && 'code' in e && e.code === 'P2002')) throw e;
      }
    }

    // Check if user needs placement test
    const needsPlacementTest = !user.placementTestCompleted;

    // Only initialize first module if placement test is completed
    // (Placement test handles module unlocking for new users)
    if (user.placementTestCompleted) {
      const existingProgress = await prisma.userProgress.findFirst({
        where: { userId },
      });

      if (!existingProgress) {
        const firstModule = await prisma.module.findFirst({
          where: { unlockRequirement: 0 },
          orderBy: { orderIndex: 'asc' },
        });

        if (firstModule) {
          await prisma.userProgress.create({
            data: {
              userId,
              moduleId: firstModule.id,
              status: 'UNLOCKED',
            },
          });
        }
      }
    }

    res.json({ user, needsPlacementTest });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Data migration endpoint - secured with secret key
// Used to migrate user data from old database to new one
app.post('/api/admin/migrate-user', async (req, res) => {
  try {
    const { secret, userData, statsData, streakData, moduleProgress, achievements } = req.body;

    // Verify secret
    const migrationSecret = process.env.MIGRATION_SECRET;
    if (!migrationSecret || secret !== migrationSecret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    console.log('Starting user migration for:', userData.email);

    // 1. Upsert user
    const user = await prisma.user.upsert({
      where: { id: userData.id },
      update: { email: userData.email, name: userData.name },
      create: { id: userData.id, email: userData.email, name: userData.name },
    });
    console.log('✓ User upserted');

    // 2. Upsert stats
    await prisma.userStats.upsert({
      where: { userId: userData.id },
      update: statsData,
      create: { userId: userData.id, ...statsData },
    });
    console.log('✓ Stats upserted');

    // 3. Upsert streak
    await prisma.userStreak.upsert({
      where: { userId: userData.id },
      update: streakData,
      create: { userId: userData.id, ...streakData },
    });
    console.log('✓ Streak upserted');

    // 4. Upsert module progress
    const progressResults = [];
    for (const mp of moduleProgress) {
      const module = await prisma.module.findUnique({ where: { slug: mp.slug } });
      if (!module) {
        progressResults.push({ slug: mp.slug, status: 'not found' });
        continue;
      }
      await prisma.userProgress.upsert({
        where: { userId_moduleId: { userId: userData.id, moduleId: module.id } },
        update: {
          status: mp.status,
          correctAnswers: mp.correctAnswers,
          totalAnswers: mp.totalAnswers,
          masteryScore: mp.masteryScore,
        },
        create: {
          userId: userData.id,
          moduleId: module.id,
          status: mp.status,
          correctAnswers: mp.correctAnswers,
          totalAnswers: mp.totalAnswers,
          masteryScore: mp.masteryScore,
        },
      });
      progressResults.push({ slug: mp.slug, status: 'ok' });
    }
    console.log('✓ Module progress upserted');

    // 5. Upsert achievements
    const achievementResults = [];
    for (const slug of achievements) {
      const achievement = await prisma.achievement.findUnique({ where: { slug } });
      if (!achievement) {
        achievementResults.push({ slug, status: 'not found' });
        continue;
      }
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: userData.id, achievementId: achievement.id } },
        update: {},
        create: { userId: userData.id, achievementId: achievement.id },
      });
      achievementResults.push({ slug, status: 'ok' });
    }
    console.log('✓ Achievements upserted');

    res.json({
      success: true,
      user: { id: user.id, email: user.email },
      progress: progressResults,
      achievements: achievementResults,
    });
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ error: 'Migration failed', details: String(error) });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎰 Poker Coach API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});
