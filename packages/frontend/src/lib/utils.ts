import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format XP with comma separators
export function formatXp(xp: number): string {
  return xp.toLocaleString();
}

// Get difficulty label
export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'Easy';
    case 2:
      return 'Medium';
    case 3:
      return 'Hard';
    default:
      return 'Unknown';
  }
}

// Get difficulty color
export function getDifficultyColor(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return 'text-green-400';
    case 2:
      return 'text-yellow-400';
    case 3:
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

// Get rarity color
export function getRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'common':
      return 'text-gray-400 border-gray-500/30';
    case 'rare':
      return 'text-blue-400 border-blue-500/30';
    case 'epic':
      return 'text-purple-400 border-purple-500/30';
    case 'legendary':
      return 'text-gold border-gold/50';
    default:
      return 'text-gray-400 border-gray-500/30';
  }
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'MASTERED':
      return 'text-gold';
    case 'COMPLETED':
      return 'text-green-400';
    case 'IN_PROGRESS':
      return 'text-blue-400';
    case 'UNLOCKED':
      return 'text-green-400';
    case 'LOCKED':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
}

// Get status label
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'MASTERED':
      return 'Mastered';
    case 'COMPLETED':
      return 'Completed';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'UNLOCKED':
      return 'Ready';
    case 'LOCKED':
      return 'Locked';
    default:
      return status;
  }
}

// Calculate XP needed for level
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Get level progress percentage
export function getLevelProgress(totalXp: number, level: number): number {
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const progress = ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.max(0, Math.min(100, progress));
}

// Format time ago
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}

// Card suit symbols
export const SUIT_SYMBOLS: Record<string, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

// Card rank display
export const RANK_DISPLAY: Record<string, string> = {
  A: 'A',
  K: 'K',
  Q: 'Q',
  J: 'J',
  '10': '10',
  '9': '9',
  '8': '8',
  '7': '7',
  '6': '6',
  '5': '5',
  '4': '4',
  '3': '3',
  '2': '2',
};

// Parse card string (e.g., "Ah" -> { rank: "A", suit: "h" })
export function parseCard(card: string): { rank: string; suit: string } {
  const suit = card.slice(-1).toLowerCase();
  const rank = card.slice(0, -1);
  return { rank, suit };
}

// Check if suit is red
export function isRedSuit(suit: string): boolean {
  return suit === 'h' || suit === 'd';
}
