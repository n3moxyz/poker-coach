import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Target, Trophy, TrendingUp } from 'lucide-react';
import { useProgress, useModules } from '@/hooks/useApi';
import { cn, formatXp, getLevelProgress, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Dashboard() {
  const { data: progress, isLoading: progressLoading } = useProgress();
  const { data: modulesData, isLoading: modulesLoading } = useModules();

  if (progressLoading || modulesLoading) {
    return <DashboardSkeleton />;
  }

  const activeModule = modulesData?.modules.find(
    (m) => m.status === 'IN_PROGRESS' || m.status === 'UNLOCKED'
  );

  return (
    <div className="md:ml-64 space-y-6 pb-20 md:pb-6">
      {/* Welcome section */}
      <div className="card felt-bg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              Keep up the great work on your poker journey.
            </p>
          </div>
          {progress?.streak.current && progress.streak.current > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30">
              <Flame className="w-6 h-6 text-orange-400 animate-fire" />
              <div>
                <div className="text-orange-400 font-bold">
                  {progress.streak.current} Day Streak
                </div>
                <div className="text-xs text-orange-400/70">
                  {progress.streak.freezes} freezes available
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Level"
          value={progress?.stats.level || 1}
          subValue={`${formatXp(progress?.stats.xpToNextLevel || 0)} XP to next`}
          color="text-gold"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Total XP"
          value={formatXp(progress?.stats.totalXp || 0)}
          subValue={`${progress?.stats.totalQuestions || 0} questions`}
          color="text-blue-400"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Mastered"
          value={`${progress?.modules.mastered || 0}/${progress?.modules.total || 5}`}
          subValue="modules"
          color="text-purple-400"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Accuracy"
          value={`${progress?.stats.accuracy || 0}%`}
          subValue={`${progress?.stats.totalCorrect || 0} correct`}
          color="text-green-400"
        />
      </div>

      {/* Level progress */}
      {progress && (
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Level {progress.stats.level} Progress
            </span>
            <span className="text-sm text-gold">
              {formatXp(progress.stats.totalXp)} XP
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${getLevelProgress(progress.stats.totalXp, progress.stats.level)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Continue learning */}
      {activeModule && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Continue Learning
          </h2>
          <Link
            to={`/modules/${activeModule.slug}`}
            className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary border border-border hover:border-border-light transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{activeModule.iconEmoji}</span>
              <div>
                <h3 className="font-medium text-white group-hover:text-gold transition-colors">
                  {activeModule.name}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={getStatusColor(activeModule.status)}>
                    {getStatusLabel(activeModule.status)}
                  </span>
                  {activeModule.progress && (
                    <>
                      <span className="text-muted">·</span>
                      <span className="text-muted-foreground">
                        {Math.round(activeModule.progress.masteryScore)}% mastery
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
          </Link>
        </div>
      )}

      {/* Module progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Modules</h2>
          <Link
            to="/modules"
            className="text-sm text-gold hover:text-gold-light transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {modulesData?.modules.slice(0, 3).map((module) => (
            <div
              key={module.id}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg',
                module.status === 'LOCKED'
                  ? 'opacity-50'
                  : 'hover:bg-background-tertiary transition-colors'
              )}
            >
              <span className="text-2xl">{module.iconEmoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">
                  {module.name}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={getStatusColor(module.status)}>
                    {getStatusLabel(module.status)}
                  </span>
                </div>
              </div>
              {module.progress && (
                <div className="w-16 text-right">
                  <div className={cn(
                    "text-sm font-semibold",
                    module.status === 'MASTERED' ? "text-gold" : "text-white"
                  )}>
                    {module.status === 'MASTERED' ? '✓' : `${Math.round(module.progress.masteryScore)}%`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {module.status === 'MASTERED' ? 'Mastered' : 'accuracy'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/modules" className="btn-primary text-center py-4">
          Start Practice
        </Link>
        <Link to="/progress" className="btn-secondary text-center py-4">
          View Stats
        </Link>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue: string;
  color: string;
}

const StatCard = memo(function StatCard({ icon, label, value, subValue, color }: StatCardProps) {
  return (
    <div className="card">
      <div className={cn('mb-2', color)}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xs text-muted">{subValue}</div>
    </div>
  );
});

function DashboardSkeleton() {
  return (
    <div className="md:ml-64 space-y-6 pb-20 md:pb-6 animate-pulse">
      <div className="card felt-bg h-24" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-28" />
        ))}
      </div>
      <div className="card h-16" />
      <div className="card h-40" />
    </div>
  );
}
