import { type GameConfig } from '@/stores/gameStore';

export interface CommonSpot {
  id: string;
  name: string;
  description: string;
  category: 'preflop' | 'postflop' | 'tournament';
  config: Partial<GameConfig>;
}

export const COMMON_SPOTS: CommonSpot[] = [
  // Preflop
  {
    id: 'beginner-friendly',
    name: 'Beginner Friendly',
    description: 'Low pressure, easy opponents',
    category: 'preflop',
    config: {
      playerCount: 3,
      difficulty: 'easy',
      smallBlind: 1,
      bigBlind: 2,
      startingChips: 200,
      gameMode: 'hand-by-hand',
    },
  },
  {
    id: 'heads-up-battle',
    name: 'Heads-Up Battle',
    description: '1v1 challenge — no hiding',
    category: 'preflop',
    config: {
      playerCount: 2,
      difficulty: 'hard',
      smallBlind: 2,
      bigBlind: 5,
      startingChips: 500,
      gameMode: 'cash-game',
    },
  },
  // Postflop
  {
    id: '6-max',
    name: '6-Max Table',
    description: 'Standard online format',
    category: 'postflop',
    config: {
      playerCount: 6,
      difficulty: 'medium',
      smallBlind: 1,
      bigBlind: 2,
      startingChips: 200,
      gameMode: 'hand-by-hand',
    },
  },
  {
    id: 'deep-stack-cash',
    name: 'Deep Stack Cash',
    description: 'Big stacks, big decisions',
    category: 'postflop',
    config: {
      playerCount: 4,
      difficulty: 'medium',
      smallBlind: 2,
      bigBlind: 5,
      startingChips: 1000,
      gameMode: 'cash-game',
    },
  },
  // Tournament
  {
    id: 'push-fold-drill',
    name: 'Push/Fold Drill',
    description: 'Short-stack push or fold decisions',
    category: 'tournament',
    config: {
      playerCount: 6,
      difficulty: 'medium',
      startingChips: 60,
      gameMode: 'tournament',
    },
  },
  {
    id: 'short-stack-tourney',
    name: 'Short Stack Tourney',
    description: 'Late-stage tournament pressure',
    category: 'tournament',
    config: {
      playerCount: 6,
      difficulty: 'hard',
      startingChips: 100,
      gameMode: 'tournament',
    },
  },
];

export const CATEGORY_STYLES: Record<CommonSpot['category'], { label: string; color: string }> = {
  preflop: { label: 'Preflop', color: 'bg-blue-500/20 text-blue-400' },
  postflop: { label: 'Postflop', color: 'bg-green-500/20 text-green-400' },
  tournament: { label: 'Tournament', color: 'bg-purple-500/20 text-purple-400' },
};
