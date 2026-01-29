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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://pokercoach.vercel.app',
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
