import { useState } from 'react';
import { BarChart3, Target, Trophy, Flame, Clock, GraduationCap, RotateCcw, ChevronDown, ChevronUp, CheckCircle, XCircle, MinusCircle, Loader2 } from 'lucide-react';
import { useStats, usePlacementTestResults, useResetPlacementTest } from '@/hooks/useApi';
import { cn, formatXp, formatTimeAgo, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function Progress() {
  const { data, isLoading, error } = useStats();
  const { data: placementResults } = usePlacementTestResults();
  const resetPlacementTest = useResetPlacementTest();
  const [showPlacementDetails, setShowPlacementDetails] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetPlacementTest = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    try {
      await resetPlacementTest.mutateAsync();
      // Redirect to placement test
      window.location.href = '/placement-test';
    } catch (error) {
      console.error('Failed to reset placement test:', error);
      setConfirmReset(false);
    }
  };

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

      {/* Placement Test Results */}
      {placementResults && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" />
              Placement Test Results
            </h2>
            <button
              onClick={() => setShowPlacementDetails(!showPlacementDetails)}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              {showPlacementDetails ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-background-tertiary">
              <div className="text-2xl font-bold text-green-400">
                {placementResults.score}/{placementResults.totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background-tertiary">
              <div className="text-2xl font-bold text-purple-400">
                {placementResults.level}
              </div>
              <div className="text-sm text-muted-foreground">Starting Level</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background-tertiary">
              <div className="text-2xl font-bold text-muted-foreground">
                {new Date(placementResults.completedAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>

          {/* Answer summary bar */}
          <div className="flex gap-1 mb-3">
            {placementResults.answers.map((answer, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 h-3 rounded-full flex items-center justify-center',
                  answer.isCorrect
                    ? 'bg-green-500'
                    : answer.isSkipped
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                )}
              >
                <span className="text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground flex-wrap gap-2 mb-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              {placementResults.answers.filter((a) => a.isCorrect).length} correct
            </span>
            {placementResults.answers.some((a) => a.isSkipped) && (
              <span className="flex items-center gap-1">
                <MinusCircle className="w-4 h-4 text-yellow-400" />
                {placementResults.answers.filter((a) => a.isSkipped).length} skipped
              </span>
            )}
            {placementResults.answers.some((a) => !a.isCorrect && !a.isSkipped) && (
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-400" />
                {placementResults.answers.filter((a) => !a.isCorrect && !a.isSkipped).length} incorrect
              </span>
            )}
          </div>

          {/* Detailed answers (collapsible) */}
          {showPlacementDetails && (
            <div className="space-y-3 mb-4 border-t border-border pt-4">
              {placementResults.answers.map((answer, i) => (
                <div
                  key={answer.questionId}
                  className={cn(
                    'p-3 rounded-lg border-l-4',
                    answer.isCorrect
                      ? 'border-l-green-500 bg-green-500/5'
                      : answer.isSkipped
                      ? 'border-l-yellow-500 bg-yellow-500/5'
                      : 'border-l-red-500 bg-red-500/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      Q{i + 1} • {answer.moduleName}
                    </span>
                    {answer.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : answer.isSkipped ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                        Skipped
                      </span>
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  {answer.questionText && (
                    <p className="text-sm text-white mb-2">{answer.questionText}</p>
                  )}
                  {!answer.isCorrect && (
                    <div className="text-xs space-y-1">
                      {!answer.isSkipped && (
                        <div className="text-red-400">
                          Your answer: <span className="line-through">{answer.userAnswer}</span>
                        </div>
                      )}
                      <div className="text-green-400">
                        Correct: {answer.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Retake button */}
          <button
            onClick={handleResetPlacementTest}
            disabled={resetPlacementTest.isPending}
            className={cn(
              'w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-all',
              confirmReset
                ? 'bg-red-500/20 text-red-400 border border-red-500'
                : 'bg-background-tertiary text-muted-foreground hover:text-white hover:bg-background-secondary'
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
                Click again to confirm retake (progress will be kept)
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Retake Placement Test
              </>
            )}
          </button>
          {confirmReset && !resetPlacementTest.isPending && (
            <button
              onClick={() => setConfirmReset(false)}
              className="w-full mt-2 py-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}

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
