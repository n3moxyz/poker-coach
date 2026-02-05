/**
 * Module Status Service
 *
 * Centralized logic for calculating module status based on user progress.
 * This prevents divergence between different parts of the codebase.
 */

export type ModuleStatus = 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

const COMPLETION_ACCURACY = 70;
const MASTERY_ACCURACY = 80;

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
 * Status rules (based on raw accuracy = correctAnswers/totalAnswers):
 * - LOCKED: User doesn't have enough XP to access
 * - UNLOCKED: Available but no progress yet
 * - IN_PROGRESS: Started but < 70% accuracy
 * - COMPLETED: 70-79% accuracy
 * - MASTERED: 80%+ accuracy
 */
export function calculateModuleStatus({
  userProgress,
  isUnlocked,
}: CalculateStatusParams): ModuleStatus {
  if (!userProgress) {
    return isUnlocked ? 'UNLOCKED' : 'LOCKED';
  }

  if (userProgress.totalAnswers > 0) {
    const accuracy = (userProgress.correctAnswers / userProgress.totalAnswers) * 100;
    if (accuracy >= MASTERY_ACCURACY) {
      return 'MASTERED';
    }
    if (accuracy >= COMPLETION_ACCURACY) {
      return 'COMPLETED';
    }
    return 'IN_PROGRESS';
  }

  return 'UNLOCKED';
}

/**
 * Calculate status for display in module detail view.
 * Same logic as calculateModuleStatus - based purely on raw accuracy.
 */
export function calculateProgressStatus(
  _currentStatus: string,
  correctAnswers: number,
  totalAnswers: number
): ModuleStatus {
  if (totalAnswers > 0) {
    const accuracy = (correctAnswers / totalAnswers) * 100;
    if (accuracy >= MASTERY_ACCURACY) {
      return 'MASTERED';
    }
    if (accuracy >= COMPLETION_ACCURACY) {
      return 'COMPLETED';
    }
    return 'IN_PROGRESS';
  }

  return 'UNLOCKED';
}
