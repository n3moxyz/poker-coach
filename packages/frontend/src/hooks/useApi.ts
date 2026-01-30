import { useAuth, useUser } from '@clerk/clerk-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type AnswerResult } from '@/lib/api';

// Hook to get authenticated API token
export function useApiToken() {
  const { getToken } = useAuth();
  return async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return token;
  };
}

// Modules hooks
export function useModules() {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const token = await getToken();
      return api.getModules(token);
    },
  });
}

export function useModule(slug: string) {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['module', slug],
    queryFn: async () => {
      const token = await getToken();
      return api.getModule(token, slug);
    },
    enabled: !!slug,
  });
}

export function useQuestions(slug: string, count = 10) {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['questions', slug, count],
    queryFn: async () => {
      const token = await getToken();
      return api.getQuestions(token, slug, count);
    },
    enabled: !!slug,
    staleTime: Infinity, // Keep questions fresh during session, refetch on new session
    gcTime: 0, // Don't cache between sessions
  });
}

// Progress hooks
export function useProgress() {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const token = await getToken();
      return api.getProgress(token);
    },
  });
}

export function useSubmitAnswer() {
  const getToken = useApiToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      answer,
      timeSpent,
    }: {
      questionId: string;
      answer: string;
      timeSpent?: number;
    }) => {
      const token = await getToken();
      return api.submitAnswer(token, questionId, answer, timeSpent);
    },
    onSuccess: (data: AnswerResult) => {
      // Batch invalidate only essential queries after answer
      // Progress updates are reflected in the response, so defer refetch
      queryClient.invalidateQueries({ queryKey: ['progress'], refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: ['stats'], refetchType: 'none' });

      // Only invalidate modules if mastery achieved (status changed)
      if (data.moduleProgress.achievedMastery) {
        queryClient.invalidateQueries({ queryKey: ['modules'] });
      }

      // If level up or achievement, invalidate achievements
      if (data.levelUp || data.achievements.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      }
    },
  });
}

export function useCompleteSession() {
  const getToken = useApiToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      moduleSlug,
      correctCount,
      totalCount,
    }: {
      moduleSlug: string;
      correctCount: number;
      totalCount: number;
    }) => {
      const token = await getToken();
      return api.completeSession(token, moduleSlug, correctCount, totalCount);
    },
    onSuccess: () => {
      // Invalidate modules to reflect new status
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

// Stats hooks
export function useStats() {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const token = await getToken();
      return api.getStats(token);
    },
  });
}

export function useLeaderboard(limit = 10) {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const token = await getToken();
      return api.getLeaderboard(token, limit);
    },
  });
}

// Achievements hooks
export function useAchievements() {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const token = await getToken();
      return api.getAchievements(token);
    },
  });
}

// User sync hook (called on sign-in)
export function useSyncUser() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token || !user) throw new Error('Not authenticated');

      return api.syncUser(token, {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || undefined,
        avatarUrl: user.imageUrl || undefined,
      });
    },
    onSuccess: (data) => {
      // Invalidate user-specific queries after sync
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      // Update placement test status
      queryClient.setQueryData(['placementTestStatus'], {
        needsPlacementTest: data.needsPlacementTest,
      });
    },
  });
}

// Placement Test hooks
export function usePlacementQuestions() {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['placementQuestions'],
    queryFn: async () => {
      const token = await getToken();
      return api.getPlacementQuestions(token);
    },
    staleTime: 0, // Always refetch on mount
    gcTime: 0, // Don't cache between sessions
    retry: false, // Don't retry on error (e.g., "already completed")
    refetchOnMount: 'always', // Always fetch fresh data when component mounts
  });
}

export function useSubmitPlacementTest() {
  const getToken = useApiToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: Array<{ questionId: string; answer: string }>) => {
      const token = await getToken();
      return api.submitPlacementTest(token, answers);
    },
    onSuccess: () => {
      // Invalidate all relevant queries after placement test
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['placementTestStatus'] });
      queryClient.setQueryData(['placementTestStatus'], {
        needsPlacementTest: false,
      });
    },
  });
}

export function useSkipPlacementTest() {
  const getToken = useApiToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return api.skipPlacementTest(token);
    },
    onSuccess: () => {
      // Invalidate all relevant queries after skipping
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['placementTestStatus'] });
      queryClient.setQueryData(['placementTestStatus'], {
        needsPlacementTest: false,
      });
    },
  });
}

export function usePlacementTestStatus() {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['placementTestStatus'],
    queryFn: async () => {
      const token = await getToken();
      return api.getPlacementTestStatus(token);
    },
    staleTime: 0, // Always refetch on mount
    refetchOnMount: 'always', // Always fetch fresh status
  });
}

export function usePlacementTestResults() {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['placementTestResults'],
    queryFn: async () => {
      const token = await getToken();
      return api.getPlacementTestResults(token);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useResetPlacementTest() {
  const getToken = useApiToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return api.resetPlacementTest(token);
    },
    onSuccess: () => {
      // Invalidate relevant queries after reset
      queryClient.invalidateQueries({ queryKey: ['placementTestStatus'] });
      queryClient.invalidateQueries({ queryKey: ['placementTestResults'] });
      queryClient.setQueryData(['placementTestStatus'], {
        needsPlacementTest: true,
      });
    },
  });
}
