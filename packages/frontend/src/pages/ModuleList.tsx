import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle, PlayCircle, Circle, GraduationCap, ChevronUp, RotateCcw, Loader2, Eye, XCircle, MinusCircle } from 'lucide-react';
import { useModules, usePlacementTestResults, useResetPlacementTest, usePlacementTestStatus } from '@/hooks/useApi';
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
  const { data: placementResults } = usePlacementTestResults();
  const { data: placementStatus } = usePlacementTestStatus();
  const resetPlacementTest = useResetPlacementTest();
  const [showPlacementDetails, setShowPlacementDetails] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Check if user needs to take placement test
  const needsPlacementTest = placementStatus?.needsPlacementTest ?? true;

  const handleRetakePlacementTest = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    try {
      await resetPlacementTest.mutateAsync();
      window.location.href = '/placement-test';
    } catch (error) {
      console.error('Failed to reset placement test:', error);
      setConfirmReset(false);
    }
  };

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
                'module-card flex gap-3 p-3 sm:gap-4 sm:p-4 overflow-hidden',
                isLocked && 'locked',
                isMastered && 'mastered'
              )}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              {/* Module number */}
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background-tertiary flex items-center justify-center">
                <span className="text-sm sm:text-lg font-bold text-muted-foreground">
                  {index + 1}
                </span>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-felt flex items-center justify-center text-2xl sm:text-3xl">
                {module.iconEmoji}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="font-semibold text-white truncate text-sm sm:text-base">
                    {module.name}
                  </h2>
                  <span
                    className={cn(
                      'px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium flex-shrink-0',
                      getDifficultyColor(module.difficulty),
                      'bg-current/10'
                    )}
                  >
                    {getDifficultyLabel(module.difficulty)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                  {module.description}
                </p>
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                  <div className="flex items-center gap-1">
                    <StatusIcon
                      className={cn('w-4 h-4', getStatusColor(module.status))}
                    />
                    <span className={getStatusColor(module.status)}>
                      {getStatusLabel(module.status)}
                    </span>
                  </div>
                  <span className="text-muted hidden sm:inline">·</span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {module.questionCount} questions
                  </span>
                  {isLocked && (
                    <>
                      <span className="text-muted hidden sm:inline">·</span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {formatXp(module.unlockRequirement)} XP
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress or lock */}
              <div className="flex-shrink-0 flex items-center ml-auto">
                {isLocked ? (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background-tertiary flex items-center justify-center">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted" />
                  </div>
                ) : module.progress ? (
                  <div className="flex flex-col items-center justify-center min-w-[40px] sm:min-w-[48px]">
                    {isMastered ? (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                      </div>
                    ) : (
                      <>
                        <span className={cn(
                          "text-base sm:text-lg font-bold",
                          module.progress.uniqueCorrect === module.questionCount ? "text-green-400" : "text-white"
                        )}>
                          {module.progress.uniqueCorrect}/{module.questionCount}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">correct</span>
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Placement Test Section */}
      <div className="mt-8 p-4 rounded-xl bg-background-secondary border border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-medium text-white">Placement Test</h3>
          </div>
          {placementResults && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                Score: <span className="text-green-400 font-medium">{placementResults.score}/{placementResults.totalQuestions}</span>
              </span>
              <span className="text-muted">•</span>
              <span className="text-purple-400 font-medium">{placementResults.level}</span>
            </div>
          )}
        </div>

        {/* Show "Take Test" button if not completed */}
        {needsPlacementTest && !placementResults && (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm mb-4">
              Take the placement test to unlock modules based on your skill level and earn starting XP!
            </p>
            <Link
              to="/placement-test"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-500 text-white hover:bg-purple-400 transition-colors font-medium active:scale-[0.98]"
            >
              <GraduationCap className="w-5 h-5" />
              Take Placement Test
            </Link>
          </div>
        )}

        {/* Show results if completed */}
        {placementResults && (
          <>

          {/* Answer summary bar */}
          <div className="flex gap-0.5 mb-3">
            {placementResults.answers.map((answer, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 h-2 rounded-full',
                  answer.isCorrect
                    ? 'bg-green-500'
                    : answer.isSkipped
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
                title={`Q${i + 1}: ${answer.isCorrect ? 'Correct' : answer.isSkipped ? 'Skipped' : 'Incorrect'}`}
              />
            ))}
          </div>

          {/* Expandable details */}
          {showPlacementDetails && (
            <div className="mb-4 p-3 rounded-lg bg-background-tertiary space-y-2 max-h-64 overflow-y-auto">
              {placementResults.answers.map((answer, i) => (
                <div
                  key={answer.questionId}
                  className={cn(
                    'flex items-center gap-2 text-sm p-2 rounded',
                    answer.isCorrect
                      ? 'bg-green-500/10'
                      : answer.isSkipped
                      ? 'bg-yellow-500/10'
                      : 'bg-red-500/10'
                  )}
                >
                  <span className="w-6 text-muted-foreground">Q{i + 1}</span>
                  {answer.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : answer.isSkipped ? (
                    <MinusCircle className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className="flex-1 text-muted-foreground truncate">
                    {answer.moduleName}
                  </span>
                  {!answer.isCorrect && (
                    <span className="text-xs text-green-400">
                      Ans: {answer.correctAnswer}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowPlacementDetails(!showPlacementDetails)}
              className="flex-1 py-3 px-4 rounded-lg bg-background-tertiary text-muted-foreground hover:text-white hover:bg-background transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {showPlacementDetails ? (
                <>
                  <ChevronUp className="w-5 h-5" />
                  Hide Details
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  View Results
                </>
              )}
            </button>
            <button
              onClick={handleRetakePlacementTest}
              disabled={resetPlacementTest.isPending}
              className={cn(
                'flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98]',
                confirmReset
                  ? 'bg-red-500/20 text-red-400 border border-red-500'
                  : 'bg-background-tertiary text-muted-foreground hover:text-white hover:bg-background'
              )}
            >
              {resetPlacementTest.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : confirmReset ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Click to Confirm
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Retake Test
                </>
              )}
            </button>
          </div>
          {confirmReset && !resetPlacementTest.isPending && (
            <button
              onClick={() => setConfirmReset(false)}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </>
        )}
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
            <Circle className="w-4 h-4 text-cyan-400" />
            <span className="text-muted-foreground">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-blue-400" />
            <span className="text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-muted-foreground">Completed</span>
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
    case 'COMPLETED':
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
