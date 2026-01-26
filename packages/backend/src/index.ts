import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import modulesRouter from './routes/modules.js';
import progressRouter from './routes/progress.js';
import achievementsRouter from './routes/achievements.js';
import statsRouter from './routes/stats.js';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// User sync endpoint (called after Clerk auth)
app.post('/api/users/sync', express.json(), async (req, res) => {
  try {
    const { userId, email, name, avatarUrl } = req.body;

    if (!userId || !email) {
      res.status(400).json({ error: 'userId and email are required' });
      return;
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        name,
        avatarUrl,
      },
      update: {
        email,
        name,
        avatarUrl,
      },
    });

    // Ensure user stats exist
    await prisma.userStats.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Ensure user streak exists
    await prisma.userStreak.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Initialize first module as unlocked if no progress exists
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

    res.json({ user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
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
