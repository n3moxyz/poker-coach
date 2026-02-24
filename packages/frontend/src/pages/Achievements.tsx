import { memo } from 'react';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Target from 'lucide-react/dist/esm/icons/target';
import Flame from 'lucide-react/dist/esm/icons/flame';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import { useAchievements, useStats } from '@/hooks/useApi';
import { cn, formatXp, getRarityColor, formatTimeAgo } from '@/lib/utils';

export default function Achievements() {
  const { data: achievementData, isLoading: achievementsLoading } = useAchievements();
  const { data: statsData, isLoading: statsLoading } = useStats();

  if (achievementsLoading || statsLoading) {
    return <AchievementsSkeleton />;
  }

  if (!achievementData) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <p className="text-red-400">Failed to load achievements. Please try again.</p>
      </div>
    );
  }

  const { summary, achievements } = achievementData;

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock achievements.
        </p>
      </div>

      {/* Quick stats */}
      {statsData && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <MiniStat icon={<TrendingUp className="w-4 h-4" />} label="Level" value={statsData.overview.level} color="text-gold" />
          <MiniStat icon={<Target className="w-4 h-4" />} label="XP" value={formatXp(statsData.overview.totalXp)} color="text-blue-400" />
          <MiniStat icon={<Target className="w-4 h-4" />} label="Accuracy" value={`${statsData.overview.overallAccuracy}%`} color="text-green-400" />
          <MiniStat icon={<Flame className="w-4 h-4" />} label="Streak" value={`${statsData.streak.current}d`} color="text-orange-400" />
        </div>
      )}

      {/* Achievement summary */}
      <div className="card felt-bg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center">
              <Trophy className="w-7 h-7 text-gold" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {summary.unlocked}/{summary.total}
              </div>
              <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gold">{summary.percentage}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="progress-bar h-2">
            <div
              className="progress-bar-fill"
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Unlocked achievements */}
      {achievements.unlocked.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            Unlocked ({achievements.unlocked.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
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
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Locked ({achievements.locked.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {achievements.locked.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="card flex flex-col items-center justify-center py-4 px-2">
      <div className={cn('mb-2', color)}>{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
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

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center text-xl',
            unlocked ? 'bg-gold/20' : 'bg-background-tertiary grayscale'
          )}
        >
          {achievement.iconEmoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold text-sm',
              unlocked ? 'text-white' : 'text-muted-foreground'
            )}
          >
            {achievement.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {achievement.description}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <span
              className={cn(
                'px-1.5 py-0.5 rounded',
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

        {!unlocked && (
          <Lock className="w-4 h-4 text-muted flex-shrink-0" />
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
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-20" />
        ))}
      </div>
      <div className="card felt-bg h-28 mb-6" />
      <div className="grid md:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-28" />
        ))}
      </div>
    </div>
  );
}
