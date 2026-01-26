import { memo } from 'react';
import { Medal, Crown, Trophy, TrendingUp } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useApi';
import { cn, formatXp } from '@/lib/utils';

export default function Leaderboard() {
  const { data, isLoading, error } = useLeaderboard(20);

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <p className="text-red-400">Failed to load leaderboard. Please try again.</p>
      </div>
    );
  }

  const { leaderboard, currentUser, totalPlayers } = data;

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank among {totalPlayers} poker learners.
        </p>
      </div>

      {/* Current user stats */}
      {currentUser && (
        <div className="card felt-bg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Your Rank</div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-gold">
                  #{currentUser.rank}
                </span>
                <div>
                  <div className="text-white font-medium">
                    Level {currentUser.level}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatXp(currentUser.totalXp)} XP
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  Top {100 - currentUser.percentile}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Better than {currentUser.percentile}% of players
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd place */}
          <div className="card text-center pt-8">
            <RankBadge rank={2} />
            <div className="w-12 h-12 rounded-full bg-gray-400/20 mx-auto mb-2 flex items-center justify-center">
              {leaderboard[1].avatarUrl ? (
                <img
                  src={leaderboard[1].avatarUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xl">🎴</span>
              )}
            </div>
            <div
              className={cn(
                'font-medium truncate px-2',
                leaderboard[1].isCurrentUser ? 'text-gold' : 'text-white'
              )}
            >
              {leaderboard[1].name}
            </div>
            <div className="text-sm text-gray-400">
              {formatXp(leaderboard[1].totalXp)} XP
            </div>
          </div>

          {/* 1st place */}
          <div className="card text-center bg-gold/10 border-gold/30">
            <Crown className="w-8 h-8 text-gold mx-auto mb-2" />
            <div className="w-16 h-16 rounded-full bg-gold/20 mx-auto mb-2 flex items-center justify-center ring-4 ring-gold/30">
              {leaderboard[0].avatarUrl ? (
                <img
                  src={leaderboard[0].avatarUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl">🎴</span>
              )}
            </div>
            <div
              className={cn(
                'font-semibold truncate px-2',
                leaderboard[0].isCurrentUser ? 'text-gold' : 'text-white'
              )}
            >
              {leaderboard[0].name}
            </div>
            <div className="text-sm text-gold">
              {formatXp(leaderboard[0].totalXp)} XP
            </div>
            <div className="text-xs text-gold/70">Level {leaderboard[0].level}</div>
          </div>

          {/* 3rd place */}
          <div className="card text-center pt-8">
            <RankBadge rank={3} />
            <div className="w-12 h-12 rounded-full bg-orange-700/20 mx-auto mb-2 flex items-center justify-center">
              {leaderboard[2].avatarUrl ? (
                <img
                  src={leaderboard[2].avatarUrl}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xl">🎴</span>
              )}
            </div>
            <div
              className={cn(
                'font-medium truncate px-2',
                leaderboard[2].isCurrentUser ? 'text-gold' : 'text-white'
              )}
            >
              {leaderboard[2].name}
            </div>
            <div className="text-sm text-orange-700">
              {formatXp(leaderboard[2].totalXp)} XP
            </div>
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold" />
          Rankings
        </h2>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <LeaderboardEntry key={entry.userId} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LeaderboardEntryData {
  userId: string;
  rank: number;
  name: string;
  level: number;
  totalXp: number;
  avatarUrl: string | null;
  isCurrentUser: boolean;
}

const LeaderboardEntry = memo(function LeaderboardEntry({ entry }: { entry: LeaderboardEntryData }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg transition-colors',
        entry.isCurrentUser
          ? 'bg-gold/10 border border-gold/30'
          : 'bg-background-tertiary hover:bg-background-secondary'
      )}
    >
      {/* Rank */}
      <div className="w-8 text-center">
        {entry.rank <= 3 ? (
          <RankBadge rank={entry.rank} small />
        ) : (
          <span className="text-muted-foreground font-mono">
            #{entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0">
        {entry.avatarUrl ? (
          <img
            src={entry.avatarUrl}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>🎴</span>
        )}
      </div>

      {/* Name and level */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'font-medium truncate',
            entry.isCurrentUser ? 'text-gold' : 'text-white'
          )}
        >
          {entry.name}
          {entry.isCurrentUser && (
            <span className="ml-2 text-xs text-gold/70">(You)</span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Level {entry.level}
        </div>
      </div>

      {/* XP */}
      <div className="text-right">
        <div className="font-medium text-gold">
          {formatXp(entry.totalXp)}
        </div>
        <div className="text-xs text-muted-foreground">XP</div>
      </div>
    </div>
  );
});

function RankBadge({ rank, small = false }: { rank: number; small?: boolean }) {
  const badges = {
    1: { icon: Crown, color: 'text-gold', bg: 'bg-gold/20' },
    2: { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-400/20' },
    3: { icon: Medal, color: 'text-orange-700', bg: 'bg-orange-700/20' },
  };

  const badge = badges[rank as keyof typeof badges];
  if (!badge) return null;

  const Icon = badge.icon;

  if (small) {
    return <Icon className={cn('w-5 h-5', badge.color)} />;
  }

  return (
    <div
      className={cn(
        'w-8 h-8 rounded-full mx-auto flex items-center justify-center',
        badge.bg
      )}
    >
      <Icon className={cn('w-5 h-5', badge.color)} />
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="md:ml-64 pb-20 md:pb-6 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-40 bg-background-secondary rounded mb-2" />
        <div className="h-4 w-56 bg-background-secondary rounded" />
      </div>
      <div className="card felt-bg h-28 mb-6" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card h-40" />
        ))}
      </div>
      <div className="card">
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-background-tertiary rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
