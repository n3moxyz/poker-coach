import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type HandSummary as DeepAnalysis } from '@/lib/api';
import { useApiToken } from './useApi';

export function useCompleteHand() {
  const getToken = useApiToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      playerCount: number;
      difficulty: string;
      smallBlind: number;
      bigBlind: number;
      handHistory: unknown;
      result: string;
      chipsDelta: number;
      overallGrade?: string;
      duration?: number;
    }) => {
      const token = await getToken();
      return api.completeHand(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['gameHistory'] });
      queryClient.invalidateQueries({ queryKey: ['gameStats'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useGameHistory(limit = 20, offset = 0) {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['gameHistory', limit, offset],
    queryFn: async () => {
      const token = await getToken();
      return api.getGameHistory(token, limit, offset);
    },
  });
}

export function useGameStats() {
  const getToken = useApiToken();

  return useQuery({
    queryKey: ['gameStats'],
    queryFn: async () => {
      const token = await getToken();
      return api.getGameStats(token);
    },
  });
}

export function useHandSummary() {
  const getToken = useApiToken();

  return {
    analyze: async (handHistory: unknown): Promise<DeepAnalysis | null> => {
      try {
        const token = await getToken();
        const result = await api.getHandSummary(token, handHistory, 'sharp');
        return result as DeepAnalysis;
      } catch {
        return null;
      }
    },
  };
}
