import { PrismaClient } from '@prisma/client';

const MAX_STREAK_FREEZES = 3;
const STREAK_FREEZE_INTERVAL = 7; // Earn a freeze every 7 days

// Check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// Check if date1 is exactly one day before date2
function isYesterday(date1: Date, date2: Date): boolean {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date1, yesterday);
}

interface StreakUpdate {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  streakMaintained: boolean;
  streakLost: boolean;
  freezeUsed: boolean;
  newFreezeEarned: boolean;
}

export async function updateStreak(
  prisma: PrismaClient,
  userId: string
): Promise<StreakUpdate> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get or create user streak
  let streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    // First ever activity
    streak = await prisma.userStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: now,
        streakFreezes: 0,
      },
    });

    return {
      currentStreak: 1,
      longestStreak: 1,
      streakFreezes: 0,
      streakMaintained: true,
      streakLost: false,
      freezeUsed: false,
      newFreezeEarned: false,
    };
  }

  const lastActivity = new Date(streak.lastActivityDate);

  // Already active today - no change
  if (isSameDay(lastActivity, today)) {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      streakFreezes: streak.streakFreezes,
      streakMaintained: true,
      streakLost: false,
      freezeUsed: false,
      newFreezeEarned: false,
    };
  }

  let newStreak = streak.currentStreak;
  let freezeUsed = false;
  let streakLost = false;

  if (isYesterday(lastActivity, today)) {
    // Consecutive day - increment streak
    newStreak = streak.currentStreak + 1;
  } else {
    // Missed day(s)
    const daysMissed = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysMissed === 2 && streak.streakFreezes > 0) {
      // Missed exactly one day and have a freeze
      newStreak = streak.currentStreak + 1;
      freezeUsed = true;
    } else {
      // Streak broken - reset to 1
      newStreak = 1;
      streakLost = streak.currentStreak > 0;
    }
  }

  // Check if new freeze earned (every 7 days)
  const newFreezeEarned =
    newStreak > 0 &&
    newStreak % STREAK_FREEZE_INTERVAL === 0 &&
    streak.streakFreezes < MAX_STREAK_FREEZES;

  // Calculate new values
  const newLongestStreak = Math.max(streak.longestStreak, newStreak);
  let newFreezes = streak.streakFreezes;

  if (freezeUsed) {
    newFreezes--;
  }
  if (newFreezeEarned) {
    newFreezes = Math.min(newFreezes + 1, MAX_STREAK_FREEZES);
  }

  // Update database
  await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: now,
      streakFreezes: newFreezes,
    },
  });

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    streakFreezes: newFreezes,
    streakMaintained: !streakLost,
    streakLost,
    freezeUsed,
    newFreezeEarned,
  };
}

export async function getStreak(
  prisma: PrismaClient,
  userId: string
): Promise<{
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  isActiveToday: boolean;
}> {
  const streak = await prisma.userStreak.findUnique({
    where: { userId },
  });

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakFreezes: 0,
      isActiveToday: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActivity = new Date(streak.lastActivityDate);

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    streakFreezes: streak.streakFreezes,
    isActiveToday: isSameDay(lastActivity, today),
  };
}
