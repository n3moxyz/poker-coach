import { memo } from 'react';
import { Trophy, Lock } from 'lucide-react';
import { useAchievements } from '@/hooks/useApi';
import { cn, formatXp, getRarityColor, formatTimeAgo } from '@/lib/utils';

export default function Achievements() {
  const { data, isLoading, error } = useAchievements();

  if (isLoading) {
    return <AchievementsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <p className="text-red-400">Failed to load achievements. Please try again.</p>
      </div>
    );
  }

  const { summary, achievements } = data;

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Unlock achievements by practicing and improving your poker skills.
        </p>
      </div>

      {/* Summary */}
      <div className="card felt-bg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-gold" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {summary.unlocked}/{summary.total}
              </div>
              <div className="text-muted-foreground">Achievements Unlocked</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold">{summary.percentage}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="progress-bar h-3">
            <div
              className="progress-bar-fill"
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unlocked achievements */}
      {achievements.unlocked.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            Unlocked ({achievements.unlocked.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.unlocked.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked achievements */}
      {achievements.locked.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Locked ({achievements.locked.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.locked.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AchievementCardProps {
  achievement: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    rarity: string;
    xpReward: number;
    iconEmoji: string;
    unlockedAt?: Date;
  };
  unlocked?: boolean;
}

const AchievementCard = memo(function AchievementCard({ achievement, unlocked = false }: AchievementCardProps) {
  const rarityColors = getRarityColor(achievement.rarity);

  return (
    <div
      className={cn(
        'achievement-badge',
        unlocked ? 'unlocked' : 'locked',
        achievement.rarity.toLowerCase()
      )}
    >
      {/* Rarity indicator */}
      <div
        className={cn(
          'absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium',
          rarityColors,
          'bg-current/10'
        )}
      >
        {achievement.rarity}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            unlocked ? 'bg-gold/20' : 'bg-background-tertiary grayscale'
          )}
        >
          {achievement.iconEmoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold',
              unlocked ? 'text-white' : 'text-muted-foreground'
            )}
          >
            {achievement.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span
              className={cn(
                'px-2 py-0.5 rounded',
                getCategoryColor(achievement.category)
              )}
            >
              {achievement.category}
            </span>
            <span className={unlocked ? 'text-gold' : 'text-muted'}>
              +{formatXp(achievement.xpReward)} XP
            </span>
            {unlocked && achievement.unlockedAt && (
              <span className="text-muted-foreground">
                {formatTimeAgo(achievement.unlockedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Lock icon for locked achievements */}
        {!unlocked && (
          <Lock className="w-5 h-5 text-muted flex-shrink-0" />
        )}
      </div>
    </div>
  );
});

function getCategoryColor(category: string): string {
  switch (category.toUpperCase()) {
    case 'PROGRESS':
      return 'bg-blue-500/20 text-blue-400';
    case 'STREAK':
      return 'bg-orange-500/20 text-orange-400';
    case 'MASTERY':
      return 'bg-purple-500/20 text-purple-400';
    case 'SPECIAL':
      return 'bg-gold/20 text-gold';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

function AchievementsSkeleton() {
  return (
    <div className="md:ml-64 pb-20 md:pb-6 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-40 bg-background-secondary rounded mb-2" />
        <div className="h-4 w-72 bg-background-secondary rounded" />
      </div>
      <div className="card felt-bg h-32 mb-6" />
      <div className="mb-8">
        <div className="h-6 w-32 bg-background-secondary rounded mb-4" />
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-32" />
          ))}
        </div>
      </div>
    </div>
  );
}
