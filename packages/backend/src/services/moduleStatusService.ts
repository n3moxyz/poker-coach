/**
 * Module Status Service
 *
 * Centralized logic for calculating module status based on user progress.
 * This prevents divergence between different parts of the codebase.
 */

export type ModuleStatus = 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

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
 * - IN_PROGRESS: Started, but <70% accuracy
 * - COMPLETED: >=70% accuracy
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
    // Calculate accuracy
    const accuracy = (userProgress.correctAnswers / userProgress.totalAnswers) * 100;
    // >=70% correct = COMPLETED, <70% = IN_PROGRESS
    return accuracy >= 70 ? 'COMPLETED' : 'IN_PROGRESS';
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
    return accuracy >= 70 ? 'COMPLETED' : 'IN_PROGRESS';
  }

  return currentStatus as ModuleStatus;
}
