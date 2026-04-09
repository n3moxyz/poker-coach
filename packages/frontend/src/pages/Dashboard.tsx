import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Flame from 'lucide-react/dist/esm/icons/flame';
import Gamepad2 from 'lucide-react/dist/esm/icons/gamepad-2';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import { useProgress, useModules } from '@/hooks/useApi';
import { useGameStats, useGameHistory } from '@/hooks/useGame';
import {
  cn,
  getLevelProgress,
  getLevelTitle,
  getStatusColor,
  getStatusLabel,
  formatTimeAgo,
} from '@/lib/utils';

export default function Dashboard() {
  const { user } = useUser();
  const { data: progress, isLoading: progressLoading } = useProgress();
  const { data: modulesData, isLoading: modulesLoading } = useModules();
  const { data: gameStats } = useGameStats();
  const { data: gameHistory } = useGameHistory(3, 0);

  if (progressLoading || modulesLoading) {
    return <DashboardSkeleton />;
  }

  const activeModule = modulesData?.modules.find(
    (m) => m.status === 'IN_PROGRESS' || m.status === 'UNLOCKED'
  );

  const level = progress?.stats.level || 1;
  const levelTitle = getLevelTitle(level);
  const levelPercent = progress
    ? getLevelProgress(progress.stats.totalXp, level)
    : 0;

  const firstName = user?.firstName || 'Player';

  return (
    <div className="md:ml-64 space-y-6 pb-20 md:pb-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">
            Good to see you
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {progress?.streak.current && progress.streak.current > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25">
              <Flame className="w-4 h-4 text-orange-400 animate-fire" />
              <span className="text-sm font-semibold text-orange-400">
                {progress.streak.current}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gold">
              Level {level}
              <span className="text-muted-foreground mx-1.5">&middot;</span>
              <span className="text-muted-foreground">{levelTitle}</span>
            </span>
            <div className="w-28 h-1.5 rounded-full bg-background-tertiary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-700"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

      {/* Main grid: 3 cols on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hero course card — spans 2 cols */}
        <div className="lg:col-span-2">
          <HeroCourseCard activeModule={activeModule} progress={progress} />
        </div>

        {/* Session stats — 1 col */}
        <div>
          <SessionStatsCard progress={progress} gameStats={gameStats} />
        </div>

        {/* Play zone — spans 2 cols */}
        <div className="lg:col-span-2">
          <PlayZoneCard gameStats={gameStats} />
        </div>

        {/* Recent hands — 1 col */}
        <div>
          <RecentHandsCard hands={gameHistory?.hands} />
        </div>
      </div>

      {/* Course progress — full width */}
      <CourseProgressList modules={modulesData?.modules} />
    </div>
  );
}

/* ─── Hero Course Card ─── */

interface HeroCourseCardProps {
  activeModule: {
    slug: string;
    name: string;
    iconEmoji: string;
    status: string;
    progress: {
      correctAnswers: number;
      totalAnswers: number;
      masteryScore: number;
    } | null;
  } | undefined;
  progress: {
    stats: { totalXp: number };
  } | undefined;
}

const HeroCourseCard = memo(function HeroCourseCard({
  activeModule,
}: HeroCourseCardProps) {
  if (!activeModule) {
    return (
      <div className="card h-full p-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
          {/* Learn path */}
          <div className="felt-bg rounded-2xl p-6 border border-felt-light/30 flex flex-col justify-between">
            <div>
              <BookOpen className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">
                Learn the Basics
              </h3>
              <p className="text-sm text-muted-foreground">
                Start with Hand Rankings — the foundation of every poker hand.
              </p>
            </div>
            <Link to="/modules" className="btn-secondary mt-4 w-full text-center">
              Start Module 1
            </Link>
          </div>

          {/* Play path */}
          <div className="bg-gold/5 rounded-2xl p-6 border border-gold/20 flex flex-col justify-between">
            <div>
              <Gamepad2 className="w-8 h-8 text-gold mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">
                Hit the Table
              </h3>
              <p className="text-sm text-muted-foreground">
                Jump into a beginner-friendly hand with live coaching on every
                decision.
              </p>
            </div>
            <Link to="/play" className="btn-primary mt-4 w-full text-center">
              Deal Me In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mastery = activeModule.progress?.masteryScore ?? 0;
  const answered = activeModule.progress?.totalAnswers ?? 0;

  return (
    <div className="card felt-bg h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold/80">
            Current Course
          </p>
          <span className="text-xs font-semibold text-emerald-400">
            {Math.round(mastery)}% Complete
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-1">
          {activeModule.name}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {answered} questions answered &middot;{' '}
          <span className={getStatusColor(activeModule.status)}>
            {getStatusLabel(activeModule.status)}
          </span>
        </p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-700"
              style={{ width: `${Math.min(mastery, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <Link
        to={`/modules/${activeModule.slug}`}
        className="btn-primary text-center w-full sm:w-auto sm:self-start"
      >
        Continue Lesson
      </Link>
    </div>
  );
});

/* ─── Session Stats Card ─── */

interface SessionStatsCardProps {
  progress: {
    stats: {
      accuracy: number;
      totalQuestions: number;
      totalCorrect: number;
    };
  } | undefined;
  gameStats: {
    winRate: number;
    handsPlayed: number;
    avgGrade: string;
    handsWon: number;
  } | undefined;
}

const SessionStatsCard = memo(function SessionStatsCard({
  progress,
  gameStats,
}: SessionStatsCardProps) {
  const accuracy = progress?.stats.accuracy ?? 0;
  const winRate = gameStats?.winRate ?? 0;
  const avgGrade = gameStats?.avgGrade ?? '—';
  const handsPlayed = gameStats?.handsPlayed ?? 0;

  return (
    <div className="card h-full">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Session Stats
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatTile value={`${accuracy}%`} label="Accuracy" />
        <StatTile value={`${Math.round(winRate)}%`} label="Win Rate" />
        <StatTile value={avgGrade} label="Avg Grade" />
        <StatTile value={handsPlayed.toString()} label="Hands" />
      </div>
    </div>
  );
});

const StatTile = memo(function StatTile({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-background-tertiary/60 border border-border/50 p-3 text-center">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
});

/* ─── Play Zone Card ─── */

interface PlayZoneCardProps {
  gameStats: {
    winRate: number;
    handsPlayed: number;
    handsWon: number;
    avgGrade: string;
    bestGrade: string;
  } | undefined;
}

const PlayZoneCard = memo(function PlayZoneCard({ gameStats }: PlayZoneCardProps) {
  const hasStats = gameStats && gameStats.handsPlayed > 0;

  return (
    <div className="card bg-gold/5 border-gold/20 h-full flex flex-col">
      {/* CTA row */}
      <Link
        to="/play"
        className="group flex items-center gap-4 mb-4"
      >
        <div className="p-3 rounded-xl bg-gold/15 border border-gold/25 group-hover:bg-gold/25 group-hover:scale-105 transition-all duration-300">
          <Gamepad2 className="w-6 h-6 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gold mb-0.5">
            Ready to Play?
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-gray-300 transition-colors">
            Practice hands against AI with real-time coaching feedback
          </p>
        </div>
        <span className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-gold/15 border border-gold/25 text-gold font-semibold text-sm group-hover:bg-gold/25 transition-colors shrink-0">
          Play Now
        </span>
      </Link>

      {/* Game stats row */}
      <div className="border-t border-border/40 pt-4 mt-auto">
        {hasStats ? (
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{gameStats.handsWon}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Won</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{Math.round(gameStats.winRate)}%</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{gameStats.bestGrade || '—'}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Best</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{gameStats.handsPlayed}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Played</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Play your first hand to start tracking stats
          </p>
        )}
      </div>
    </div>
  );
});

/* ─── Recent Hands Card ─── */

interface RecentHandsCardProps {
  hands: Array<{
    id: string;
    result: string;
    chipsDelta: number;
    overallGrade: string | null;
    createdAt: string;
  }> | undefined;
}

const RecentHandsCard = memo(function RecentHandsCard({
  hands,
}: RecentHandsCardProps) {
  const hasHands = hands && hands.length > 0;

  return (
    <div className="card h-full flex flex-col">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Recent Hands
      </h3>

      {!hasHands ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
          <BarChart3 className="w-8 h-8 text-muted/40 mb-2" />
          <p className="text-sm text-muted-foreground">No hands yet</p>
          <Link
            to="/play"
            className="text-xs text-gold hover:text-gold-light mt-1"
          >
            Play your first hand
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2 flex-1">
            {hands.map((hand) => (
              <div
                key={hand.id}
                className="flex items-center justify-between py-2 px-1 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold w-9',
                      hand.result === 'win'
                        ? 'text-emerald-400'
                        : hand.result === 'loss'
                          ? 'text-red-400'
                          : 'text-muted-foreground'
                    )}
                  >
                    {hand.result === 'win'
                      ? 'Won'
                      : hand.result === 'loss'
                        ? 'Lost'
                        : 'Fold'}
                  </span>
                  <span className="text-xs text-muted">
                    {formatTimeAgo(hand.createdAt)}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-sm font-bold tabular-nums',
                    hand.chipsDelta > 0
                      ? 'text-emerald-400'
                      : hand.chipsDelta < 0
                        ? 'text-red-400'
                        : 'text-muted-foreground'
                  )}
                >
                  {hand.chipsDelta > 0 ? '+' : ''}
                  {hand.chipsDelta}
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/play/history"
            className="text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-light mt-3 self-end"
          >
            View All
          </Link>
        </>
      )}
    </div>
  );
});

/* ─── Course Progress List ─── */

interface CourseProgressListProps {
  modules: Array<{
    id: string;
    slug: string;
    name: string;
    iconEmoji: string;
    status: string;
    progress: {
      masteryScore: number;
    } | null;
  }> | undefined;
}

const CourseProgressList = memo(function CourseProgressList({
  modules,
}: CourseProgressListProps) {
  if (!modules) return null;

  const displayed = modules.slice(0, 5);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Course Progress
        </h2>
        <Link
          to="/modules"
          className="flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold-light transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {displayed.map((mod) => {
          const mastery = mod.progress?.masteryScore ?? 0;
          const isMastered = mod.status === 'MASTERED';
          const isLocked = mod.status === 'LOCKED';

          return (
            <Link
              key={mod.id}
              to={isLocked ? '#' : `/modules/${mod.slug}`}
              className={cn(
                'flex items-center gap-4 p-3 rounded-xl transition-all',
                isLocked
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:bg-background-tertiary/50'
              )}
              onClick={isLocked ? (e) => e.preventDefault() : undefined}
            >
              <span className="text-xl w-8 text-center">{mod.iconEmoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-medium text-white truncate">
                    {mod.name}
                  </h3>
                  <span
                    className={cn(
                      'text-xs font-semibold ml-3 shrink-0',
                      isMastered
                        ? 'text-gold'
                        : isLocked
                          ? 'text-muted'
                          : getStatusColor(mod.status)
                    )}
                  >
                    {isMastered
                      ? 'Mastered'
                      : isLocked
                        ? 'Locked'
                        : `${Math.round(mastery)}%`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-background-tertiary overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isMastered
                        ? 'bg-gold'
                        : 'bg-gradient-to-r from-felt-light to-emerald-500'
                    )}
                    style={{
                      width: `${isMastered ? 100 : Math.min(mastery, 100)}%`,
                    }}
                  />
                </div>
              </div>
              {!isLocked && (
                <ArrowRight className="w-4 h-4 text-muted shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
});

/* ─── Skeleton ─── */

function DashboardSkeleton() {
  return (
    <div className="md:ml-64 space-y-6 pb-20 md:pb-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-end">
        <div>
          <div className="h-3 w-24 bg-background-tertiary rounded mb-2" />
          <div className="h-9 w-48 bg-background-tertiary rounded" />
        </div>
        <div className="h-5 w-40 bg-background-tertiary rounded" />
      </div>
      <div className="h-px bg-border/30" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 h-56 card felt-bg" />
        <div className="h-56 card" />
        <div className="lg:col-span-2 h-24 card" />
        <div className="h-48 card" />
      </div>

      {/* Module list skeleton */}
      <div className="card">
        <div className="h-4 w-32 bg-background-tertiary rounded mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <div className="w-8 h-8 bg-background-tertiary rounded" />
            <div className="flex-1">
              <div className="h-4 w-40 bg-background-tertiary rounded mb-2" />
              <div className="h-1.5 bg-background-tertiary rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
