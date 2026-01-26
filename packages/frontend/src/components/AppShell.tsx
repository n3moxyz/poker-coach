import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import {
  Home,
  BookOpen,
  BarChart3,
  Trophy,
  Medal,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProgress } from '@/hooks/useApi';

interface AppShellProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/modules', icon: BookOpen, label: 'Modules' },
  { path: '/progress', icon: BarChart3, label: 'Progress' },
  { path: '/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/leaderboard', icon: Medal, label: 'Leaderboard' },
];

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { data: progress } = useProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <span className="font-bold text-xl">
              <span className="text-gold">Poker</span> Coach
            </span>
          </Link>

          {/* Stats badges */}
          <div className="hidden md:flex items-center gap-4">
            {progress && (
              <>
                <div className="xp-badge">
                  <span>⭐</span>
                  <span>{progress.stats.totalXp.toLocaleString()} XP</span>
                </div>
                {progress.streak.current > 0 && (
                  <div className="streak-badge">
                    <Flame className="w-4 h-4 animate-fire" />
                    <span>{progress.streak.current} day streak</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* User button */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
              },
            }}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">{children}</main>

      {/* Bottom navigation (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-gold'
                    : 'text-muted-foreground hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side navigation (desktop) */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-background/50 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                  isActive
                    ? 'bg-felt text-white border border-border-light'
                    : 'text-muted-foreground hover:bg-background-secondary hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick stats on sidebar */}
        {progress && (
          <div className="mt-8 p-4 rounded-xl bg-background-secondary border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Your Progress
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level</span>
                <span className="text-gold font-medium">
                  {progress.stats.level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modules Mastered</span>
                <span className="text-white">
                  {progress.modules.mastered}/{progress.modules.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="text-white">{progress.stats.accuracy}%</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Desktop main content offset */}
      <div className="hidden md:block w-64" />
    </div>
  );
}
