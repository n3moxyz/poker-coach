const API_URL = import.meta.env.VITE_API_URL || '/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data.error || 'Request failed', data);
  }

  return response.json();
}

// Type definitions
export interface Module {
  id: string;
  slug: string;
  name: string;
  description: string;
  difficulty: number;
  orderIndex: number;
  unlockRequirement: number;
  iconEmoji: string;
  questionCount: number;
  status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';
  isUnlocked: boolean;
  progress: {
    correctAnswers: number;
    totalAnswers: number;
    masteryScore: number;
    currentStreak: number;
    uniqueQuestionsCorrect?: number;
  } | null;
}

export interface Question {
  id: string;
  type: string;
  difficulty: number;
  content: Record<string, unknown>;
  xpValue: number;
  correctAnswer?: string;
  explanation?: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  xp: {
    earned: number;
    breakdown: {
      base: number;
      difficultyBonus: number;
      streakBonus: number;
      dailyBonus: number;
    };
    masteryBonus: number;
    total: number;
  };
  streak: {
    current: number;
    freezeUsed: boolean;
    newFreezeEarned: boolean;
  };
  moduleProgress: {
    masteryScore: number;
    achievedMastery: boolean;
    questionsAnswered: number;
    questionsToMastery: number;
  };
  levelUp: { newLevel: number } | null;
  achievements: Array<{
    name: string;
    description: string;
    rarity: string;
    xpReward: number;
    iconEmoji: string;
  }>;
}

export interface UserProgress {
  stats: {
    totalXp: number;
    level: number;
    xpToNextLevel: number;
    totalQuestions: number;
    totalCorrect: number;
    accuracy: number;
  };
  streak: {
    current: number;
    longest: number;
    freezes: number;
    isActiveToday: boolean;
  };
  modules: {
    total: number;
    mastered: number;
    inProgress: number;
  };
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  xpReward: number;
  iconEmoji: string;
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  isCurrentUser: boolean;
}

export interface PlacementQuestion {
  id: string;
  type: string;
  difficulty: number;
  content: Record<string, unknown>;
  moduleName: string;
}

export interface PlacementResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  level: string;
  xpGranted: number;
  modulesUnlocked: number;
}

export interface PlacementAnswerFeedback {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  questionText?: string; // The question that was asked
}

export interface PlacementTestResults {
  score: number;
  totalQuestions: number;
  level: string;
  completedAt: string;
  answers: Array<{
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    isSkipped: boolean;
    correctAnswer: string;
    explanation: string | null;
    questionText: string | null;
    moduleName: string;
  }>;
}

// Game mode types
export interface GameHandResult {
  handId: string;
  xpEarned: number;
  breakdown: {
    base: number;
    difficulty: number;
    grade: number;
    streak: number;
    daily: number;
  };
  streak: {
    current: number;
    freezeUsed: boolean;
    newFreezeEarned: boolean;
  };
  levelUp: { newLevel: number } | null;
  achievements: Array<{
    name: string;
    description: string;
    rarity: string;
    xpReward: number;
    iconEmoji: string;
  }>;
}

export interface GameHistoryEntry {
  id: string;
  playerCount: number;
  difficulty: string;
  result: string;
  chipsDelta: number;
  xpEarned: number;
  overallGrade: string | null;
  duration: number | null;
  createdAt: string;
}

export interface GameHandDetail {
  id: string;
  playerCount: number;
  difficulty: string;
  smallBlind: number;
  bigBlind: number;
  handHistory: unknown;
  result: string;
  chipsDelta: number;
  xpEarned: number;
  overallGrade: string | null;
  duration: number | null;
  createdAt: string;
}

export interface GameStats {
  handsPlayed: number;
  handsWon: number;
  winRate: number;
  avgGrade: string;
  totalXpFromHands: number;
  bestGrade: string;
}

export interface GameCoaching {
  grade: string;
  analysis: string;
  optimalPlay: string;
  concepts: string[];
}

export interface HandSummary {
  overallGrade: string;
  streetAnalysis: Array<{
    street: string;
    grade: string;
    analysis: string;
  }>;
  keyLessons: string[];
  coachNote: string;
}

// API functions
export const api = {
  // User sync
  syncUser: (token: string, data: { userId: string; email: string; name?: string; avatarUrl?: string }) =>
    fetchApi<{ user: unknown; needsPlacementTest: boolean }>('/users/sync', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  // Modules
  getModules: (token: string) =>
    fetchApi<{ modules: Module[]; totalXp: number }>('/modules', { token }),

  getModule: (token: string, slug: string) =>
    fetchApi<{
      module: Module & { masteryXpBonus: number; questionTypes: Array<{ type: string; count: number }> };
      progress: { status: string; correctAnswers: number; totalAnswers: number; masteryScore: number; currentStreak: number; uniqueQuestionsCorrect?: number };
    }>(`/modules/${slug}`, { token }),

  getQuestions: (token: string, slug: string, count = 10) =>
    fetchApi<{ moduleId: string; moduleName: string; questions: Question[] }>(
      `/modules/${slug}/questions?count=${count}`,
      { token }
    ),

  // Progress
  getProgress: (token: string) => fetchApi<UserProgress>('/progress', { token }),

  submitAnswer: (token: string, questionId: string, answer: string, timeSpent?: number) =>
    fetchApi<AnswerResult>('/progress/answer', {
      method: 'POST',
      token,
      body: JSON.stringify({ questionId, answer, timeSpent }),
    }),

  completeSession: (token: string, moduleSlug: string, correctCount: number, totalCount: number) =>
    fetchApi<{ status: string; sessionAccuracy: number; correctCount: number; totalCount: number }>(
      '/progress/complete-session',
      {
        method: 'POST',
        token,
        body: JSON.stringify({ moduleSlug, correctCount, totalCount }),
      }
    ),

  // Stats
  getStats: (token: string) =>
    fetchApi<{
      overview: { totalXp: number; level: number; totalQuestions: number; totalCorrect: number; overallAccuracy: number };
      streak: { current: number; longest: number; freezes: number };
      modules: Array<{ moduleSlug: string; moduleName: string; status: string; correctAnswers: number; totalAnswers: number; accuracy: number; masteryScore: number }>;
      recentAnswers: Array<{ questionType: string; moduleName: string; isCorrect: boolean; xpEarned: number; createdAt: string }>;
    }>('/stats', { token }),

  getLeaderboard: (token: string, limit = 10) =>
    fetchApi<{
      leaderboard: LeaderboardEntry[];
      currentUser: { rank: number; totalXp: number; level: number; percentile: number } | null;
      totalPlayers: number;
    }>(`/stats/leaderboard?limit=${limit}`, { token }),

  // Achievements
  getAchievements: (token: string) =>
    fetchApi<{
      summary: { total: number; unlocked: number; percentage: number };
      achievements: { unlocked: Achievement[]; locked: Achievement[] };
      byCategory: { unlocked: Record<string, Achievement[]>; locked: Record<string, Achievement[]> };
    }>('/achievements', { token }),

  // Placement Test
  getPlacementQuestions: (token: string) =>
    fetchApi<{ totalQuestions: number; questions: PlacementQuestion[] }>(
      '/placement-test/questions',
      { token }
    ),

  submitPlacementTest: (token: string, answers: Array<{ questionId: string; answer: string }>) =>
    fetchApi<{
      success: boolean;
      result: PlacementResult;
      answers: PlacementAnswerFeedback[];
    }>('/placement-test/submit', {
      method: 'POST',
      token,
      body: JSON.stringify({ answers }),
    }),

  skipPlacementTest: (token: string) =>
    fetchApi<{ success: boolean; result: PlacementResult }>('/placement-test/skip', {
      method: 'POST',
      token,
    }),

  getPlacementTestStatus: (token: string) =>
    fetchApi<{ needsPlacementTest: boolean }>('/placement-test/status', { token }),

  getPlacementTestResults: (token: string) =>
    fetchApi<PlacementTestResults>('/placement-test/results', { token }),

  resetPlacementTest: (token: string) =>
    fetchApi<{ success: boolean; message: string }>('/placement-test/reset', {
      method: 'POST',
      token,
    }),

  // Game mode
  completeHand: (
    token: string,
    data: {
      playerCount: number;
      difficulty: string;
      smallBlind: number;
      bigBlind: number;
      handHistory: unknown;
      result: string;
      chipsDelta: number;
      overallGrade?: string;
      duration?: number;
    }
  ) =>
    fetchApi<GameHandResult>('/game/complete-hand', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  getHandDetail: (token: string, handId: string) =>
    fetchApi<GameHandDetail>(`/game/hand/${handId}`, { token }),

  getGameHistory: (token: string, limit = 20, offset = 0) =>
    fetchApi<{ hands: GameHistoryEntry[]; total: number; limit: number; offset: number }>(
      `/game/history?limit=${limit}&offset=${offset}`,
      { token }
    ),

  getGameStats: (token: string) =>
    fetchApi<GameStats>('/game/stats', { token }),

  getCoaching: (
    token: string,
    data: { handHistory: unknown; street: string; playerAction: string }
  ) =>
    fetchApi<GameCoaching>('/game/coach', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    }),

  getHandSummary: (token: string, handHistory: unknown, quality: 'standard' | 'sharp' = 'sharp') =>
    fetchApi<HandSummary>('/game/hand-summary', {
      method: 'POST',
      token,
      body: JSON.stringify({ handHistory, quality }),
    }),
};

export { ApiError };
