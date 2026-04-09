import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  SignIn,
  useAuth,
  useUser,
} from '@clerk/clerk-react';
import { useSyncUser, usePlacementTestStatus } from '@/hooks/useApi';
import AppShell from '@/components/AppShell';
import Dashboard from '@/pages/Dashboard';
import ModuleList from '@/pages/ModuleList';
import ModuleDetail from '@/pages/ModuleDetail';
import Achievements from '@/pages/Achievements';
import Leaderboard from '@/pages/Leaderboard';
import PlacementTest from '@/pages/PlacementTest';

const PlayVsAI = React.lazy(() => import('@/pages/PlayVsAI'));
const PracticeSession = React.lazy(() => import('@/pages/PracticeSession'));
import GameHistory from '@/pages/GameHistory';
import RangeMatrix from '@/pages/RangeMatrix';

function AuthenticatedApp() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const syncUser = useSyncUser();
  const [needsPlacementTest, setNeedsPlacementTest] = useState<boolean | null>(null);
  const [syncAttempted, setSyncAttempted] = useState(false);
  // Fallback query for placement test status - only enabled after sync attempted and didn't set status
  const placementStatus = usePlacementTestStatus(syncAttempted && needsPlacementTest === null);

  // Sync user on sign-in and check placement test status
  useEffect(() => {
    const doSync = async () => {
      // Wait for Clerk to be fully loaded before syncing
      if (isLoaded && isSignedIn && user && !syncAttempted && !syncUser.isPending) {
        setSyncAttempted(true);
        try {
          const result = await syncUser.mutateAsync();
          console.log('Sync result:', result);
          setNeedsPlacementTest(result.needsPlacementTest);
        } catch (error) {
          console.error('Sync failed:', error);
          // Don't set needsPlacementTest here - let the status query handle it
        }
      }
    };
    doSync();
  }, [isLoaded, isSignedIn, user?.id, syncAttempted, syncUser.isPending]);

  // If sync failed but status query succeeded, use that
  useEffect(() => {
    if (syncAttempted && needsPlacementTest === null && placementStatus.data) {
      setNeedsPlacementTest(placementStatus.data.needsPlacementTest);
    }
  }, [syncAttempted, needsPlacementTest, placementStatus.data]);

  // Show loading while Clerk loads, syncing, or fetching status
  const isLoading = !isLoaded || !syncAttempted || syncUser.isPending ||
    (needsPlacementTest === null && placementStatus.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gold text-xl">Loading...</div>
      </div>
    );
  }

  // If we still don't know after all queries, default to needing test (new user)
  const shouldShowPlacementTest = needsPlacementTest ?? true;

  // Redirect to placement test if needed (unless already there)
  if (shouldShowPlacementTest && location.pathname !== '/placement-test') {
    return <Navigate to="/placement-test" replace />;
  }

  // Placement test page renders without AppShell
  if (location.pathname === '/placement-test') {
    return (
      <Routes>
        <Route path="/placement-test" element={<PlacementTest />} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/modules" element={<ModuleList />} />
        <Route path="/modules/:slug" element={<ModuleDetail />} />
        <Route path="/practice/:slug" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>}><PracticeSession /></Suspense>} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/play" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>}><PlayVsAI /></Suspense>} />
        <Route path="/play/history" element={<GameHistory />} />
        <Route path="/ranges" element={<RangeMatrix />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function SignInPage() {
  return (
    <div className="signin-bg min-h-screen flex flex-col items-center px-4 pt-[12vh] sm:pt-[18vh]">
      {/* Radial glow behind form */}
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center pt-[20vh]">
        <div className="w-[480px] h-[480px] rounded-full bg-gold/[0.04] blur-[100px]" />
      </div>

      <div className="relative z-10 mb-6 text-center">
        <h1 className="text-5xl font-display font-bold text-white mb-3 tracking-tight">
          <span className="text-gold">Poker</span> Coach
        </h1>
        <p className="text-lg text-[#b0b8c1]">
          Master Texas Hold'em with gamified lessons
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-background-secondary border border-border shadow-xl !rounded-2xl overflow-hidden',
              headerTitle: 'text-white',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton:
                'bg-background-tertiary border-border hover:bg-felt text-white',
              formFieldLabel: 'text-[#9ca3af] text-xs uppercase tracking-wider font-medium',
              formFieldInput:
                'bg-background-tertiary border-border text-white !rounded-xl focus:border-gold/50 focus:ring-1 focus:ring-gold/30',
              formButtonPrimary:
                'bg-gradient-to-b from-gold to-gold-dark text-black font-semibold !rounded-xl shadow-md shadow-gold/20 hover:from-gold-light hover:to-gold hover:shadow-lg hover:shadow-gold/30 !text-sm',
              footerActionLink: 'text-gold hover:text-gold-light',
              footer: 'bg-transparent border-t-0 !pt-2',
              footerAction: '!border-t-0',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-gold',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground',
            },
          }}
          routing="hash"
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <SignedOut>
        <SignInPage />
      </SignedOut>
      <SignedIn>
        <AuthenticatedApp />
      </SignedIn>
    </>
  );
}
