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
    onSuccess: () => {
      // Invalidate user-specific queries after sync
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}
