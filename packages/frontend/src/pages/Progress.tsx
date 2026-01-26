import { BarChart3, Target, Trophy, Flame, Clock } from 'lucide-react';
import { useStats } from '@/hooks/useApi';
import { cn, formatXp, formatTimeAgo, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Progress() {
  const { data, isLoading, error } = useStats();

  if (isLoading) {
    return <ProgressSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <p className="text-red-400">Failed to load stats. Please try again.</p>
      </div>
    );
  }

  const { overview, streak, modules, recentAnswers } = data;

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey and see how far you've come.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Total XP"
          value={formatXp(overview.totalXp)}
          color="text-gold"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Level"
          value={overview.level}
          color="text-blue-400"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Accuracy"
          value={`${overview.overallAccuracy}%`}
          color="text-green-400"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Best Streak"
          value={`${streak.longest} days`}
          color="text-orange-400"
        />
      </div>

      {/* Streak info */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Streak Status
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-background-tertiary">
            <div className="text-2xl font-bold text-orange-400">
              {streak.current}
            </div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-background-tertiary">
            <div className="text-2xl font-bold text-gold">{streak.longest}</div>
            <div className="text-sm text-muted-foreground">Longest Streak</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-background-tertiary">
            <div className="text-2xl font-bold text-blue-400">
              {streak.freezes}
            </div>
            <div className="text-sm text-muted-foreground">Streak Freezes</div>
          </div>
        </div>
      </div>

      {/* Questions stats */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Questions Answered
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-background-tertiary">
            <div className="text-3xl font-bold text-white">
              {overview.totalQuestions}
            </div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </div>
          <div className="p-4 rounded-lg bg-background-tertiary">
            <div className="text-3xl font-bold text-green-400">
              {overview.totalCorrect}
            </div>
            <div className="text-sm text-muted-foreground">Correct Answers</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="progress-bar h-4">
              <div
                className="progress-bar-fill"
                style={{ width: `${overview.overallAccuracy}%` }}
              />
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            {overview.overallAccuracy}% accuracy
          </div>
        </div>
      </div>

      {/* Module progress */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Module Progress
        </h2>
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.moduleSlug} className="p-4 rounded-lg bg-background-tertiary">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">
                    {module.moduleName}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs',
                      getStatusColor(module.status)
                    )}
                  >
                    {getStatusLabel(module.status)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {module.accuracy}% accuracy
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="progress-bar h-2">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        module.status === 'MASTERED'
                          ? 'bg-gold'
                          : 'bg-gradient-to-r from-felt-light to-blue-500'
                      )}
                      style={{ width: `${module.masteryScore}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {Math.round(module.masteryScore)}%
                </span>
              </div>
              <div className="text-xs text-muted mt-2">
                {module.correctAnswers}/{module.totalAnswers} correct
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {recentAnswers.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recentAnswers.map((answer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-background-tertiary"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      answer.isCorrect ? 'bg-green-400' : 'bg-red-400'
                    )}
                  />
                  <div>
                    <div className="text-sm text-white">{answer.moduleName}</div>
                    <div className="text-xs text-muted-foreground">
                      {answer.questionType.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {answer.xpEarned > 0 && (
                    <div className="text-sm text-gold">+{answer.xpEarned} XP</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(answer.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="card">
      <div className={cn('mb-2', color)}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="md:ml-64 pb-20 md:pb-6 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-48 bg-background-secondary rounded mb-2" />
        <div className="h-4 w-72 bg-background-secondary rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24" />
        ))}
      </div>
      <div className="card h-32 mb-6" />
      <div className="card h-48 mb-6" />
      <div className="card h-64" />
    </div>
  );
}
