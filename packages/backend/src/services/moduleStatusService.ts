/**
 * Module Status Service
 *
 * Centralized logic for calculating module status based on user progress.
 * This prevents divergence between different parts of the codebase.
 */

export type ModuleStatus = 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

// Minimum questions needed for COMPLETED status
const MIN_QUESTIONS_FOR_COMPLETION = 20;
const COMPLETION_ACCURACY = 70;

interface UserProgress {
  status: string;
  correctAnswers: number;
  totalAnswers: number;
}

interface CalculateStatusParams {
  userProgress: UserProgress | null | undefined;
  isUnlocked: boolean;
}

/**
 * Calculate the dynamic status for a module based on user progress.
 *
 * Status rules:
 * - LOCKED: User doesn't have enough XP to access
 * - UNLOCKED: Available but no progress yet
 * - IN_PROGRESS: Started, but either < 20 questions OR < 70% accuracy
 * - COMPLETED: 20+ questions AND >= 70% accuracy
 * - MASTERED: Stored as MASTERED (80%+ over 20+ questions, calculated elsewhere)
 */
export function calculateModuleStatus({
  userProgress,
  isUnlocked,
}: CalculateStatusParams): ModuleStatus {
  if (!userProgress) {
    return isUnlocked ? 'UNLOCKED' : 'LOCKED';
  }

  // Keep MASTERED status (80%+ over 20+ questions)
  if (userProgress.status === 'MASTERED') {
    return 'MASTERED';
  }

  if (userProgress.totalAnswers > 0) {
    const accuracy = (userProgress.correctAnswers / userProgress.totalAnswers) * 100;
    // Need both minimum questions AND good accuracy for COMPLETED
    if (userProgress.totalAnswers >= MIN_QUESTIONS_FOR_COMPLETION && accuracy >= COMPLETION_ACCURACY) {
      return 'COMPLETED';
    }
    // Any progress but not meeting completion requirements = IN_PROGRESS
    return 'IN_PROGRESS';
  }

  return 'UNLOCKED';
}

/**
 * Calculate status for display in module detail view.
 * Similar to calculateModuleStatus but works with existing progress record.
 */
export function calculateProgressStatus(
  currentStatus: string,
  correctAnswers: number,
  totalAnswers: number
): ModuleStatus {
  // Don't downgrade from MASTERED
  if (currentStatus === 'MASTERED') {
    return 'MASTERED';
  }

  if (totalAnswers > 0) {
    const accuracy = (correctAnswers / totalAnswers) * 100;
    // Need both minimum questions AND good accuracy for COMPLETED
    if (totalAnswers >= MIN_QUESTIONS_FOR_COMPLETION && accuracy >= COMPLETION_ACCURACY) {
      return 'COMPLETED';
    }
    return 'IN_PROGRESS';
  }

  return currentStatus as ModuleStatus;
}
