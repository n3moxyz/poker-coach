import { Link } from 'react-router-dom';
import { Lock, CheckCircle, PlayCircle, Circle } from 'lucide-react';
import { useModules } from '@/hooks/useApi';
import {
  cn,
  formatXp,
  getDifficultyLabel,
  getDifficultyColor,
  getStatusColor,
  getStatusLabel,
} from '@/lib/utils';

export default function ModuleList() {
  const { data, isLoading, error } = useModules();

  if (isLoading) {
    return <ModuleListSkeleton />;
  }

  if (error) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <p className="text-red-400">Failed to load modules. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Learning Modules</h1>
        <p className="text-muted-foreground">
          Master each module to unlock the next. You have{' '}
          <span className="text-gold">{formatXp(data?.totalXp || 0)} XP</span>.
        </p>
      </div>

      {/* Module grid */}
      <div className="grid gap-4">
        {data?.modules.map((module, index) => {
          const StatusIcon = getStatusIcon(module.status);
          const isLocked = module.status === 'LOCKED';
          const isMastered = module.status === 'MASTERED';

          return (
            <Link
              key={module.id}
              to={isLocked ? '#' : `/modules/${module.slug}`}
              className={cn(
                'module-card flex gap-4 p-4',
                isLocked && 'locked',
                isMastered && 'mastered'
              )}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              {/* Module number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background-tertiary flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">
                  {index + 1}
                </span>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-felt flex items-center justify-center text-3xl">
                {module.iconEmoji}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-white truncate">
                    {module.name}
                  </h2>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      getDifficultyColor(module.difficulty),
                      'bg-current/10'
                    )}
                  >
                    {getDifficultyLabel(module.difficulty)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {module.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <StatusIcon
                      className={cn('w-4 h-4', getStatusColor(module.status))}
                    />
                    <span className={getStatusColor(module.status)}>
                      {getStatusLabel(module.status)}
                    </span>
                  </div>
                  <span className="text-muted">·</span>
                  <span className="text-muted-foreground">
                    {module.questionCount} questions
                  </span>
                  {isLocked && (
                    <>
                      <span className="text-muted">·</span>
                      <span className="text-muted-foreground">
                        Unlock at {formatXp(module.unlockRequirement)} XP
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress or lock */}
              <div className="flex-shrink-0 flex items-center">
                {isLocked ? (
                  <div className="w-12 h-12 rounded-full bg-background-tertiary flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted" />
                  </div>
                ) : module.progress ? (
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-background-tertiary"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(module.progress.masteryScore / 100) * 125.6} 125.6`}
                        className={isMastered ? 'text-gold' : 'text-felt-light'}
                      />
                    </svg>
                    <span className={cn(
                      "absolute inset-0 flex items-center justify-center text-xs font-bold",
                      isMastered ? "text-gold" : "text-white"
                    )}>
                      {isMastered ? '✓' : `${Math.round(module.progress.masteryScore)}%`}
                    </span>
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 rounded-xl bg-background-secondary border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          How to Master a Module
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Answer at least <span className="text-white font-medium">20 questions</span> with{' '}
          <span className="text-white font-medium">80%+ accuracy</span> to master each module.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-500" />
            <span className="text-muted-foreground">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-green-400" />
            <span className="text-muted-foreground">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-blue-400" />
            <span className="text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gold" />
            <span className="text-muted-foreground">Mastered</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'MASTERED':
      return CheckCircle;
    case 'IN_PROGRESS':
      return PlayCircle;
    case 'UNLOCKED':
      return Circle;
    case 'LOCKED':
    default:
      return Lock;
  }
}

function ModuleListSkeleton() {
  return (
    <div className="md:ml-64 pb-20 md:pb-6 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-48 bg-background-secondary rounded mb-2" />
        <div className="h-4 w-72 bg-background-secondary rounded" />
      </div>
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card h-32" />
        ))}
      </div>
    </div>
  );
}
