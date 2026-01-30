import { useEffect, useState } from 'react';
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
import PracticeSession from '@/pages/PracticeSession';
import Progress from '@/pages/Progress';
import Achievements from '@/pages/Achievements';
import Leaderboard from '@/pages/Leaderboard';
import PlacementTest from '@/pages/PlacementTest';

function AuthenticatedApp() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();
  const syncUser = useSyncUser();
  // Fallback query for placement test status (used if sync fails)
  const placementStatus = usePlacementTestStatus();
  const [needsPlacementTest, setNeedsPlacementTest] = useState<boolean | null>(null);
  const [syncAttempted, setSyncAttempted] = useState(false);

  // Sync user on sign-in and check placement test status
  useEffect(() => {
    const doSync = async () => {
      if (isSignedIn && user && !syncAttempted && !syncUser.isPending) {
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
  }, [isSignedIn, user?.id, syncAttempted, syncUser.isPending]);

  // If sync failed but status query succeeded, use that
  useEffect(() => {
    if (syncAttempted && needsPlacementTest === null && placementStatus.data) {
      setNeedsPlacementTest(placementStatus.data.needsPlacementTest);
    }
  }, [syncAttempted, needsPlacementTest, placementStatus.data]);

  // Show loading while syncing or fetching status
  const isLoading = !syncAttempted || syncUser.isPending ||
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
        <Route path="/practice/:slug" element={<PracticeSession />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="text-gold">Poker</span> Coach
        </h1>
        <p className="text-muted-foreground">
          Master Texas Hold'em with gamified lessons
        </p>
      </div>
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-background-secondary border border-border shadow-xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton:
                'bg-background-tertiary border-border hover:bg-felt text-white',
              formFieldLabel: 'text-muted-foreground',
              formFieldInput:
                'bg-background-tertiary border-border text-white',
              footerActionLink: 'text-gold hover:text-gold-light',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-gold',
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
