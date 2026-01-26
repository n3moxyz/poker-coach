import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  SignedIn,
  SignedOut,
  SignIn,
  useAuth,
  useUser,
} from '@clerk/clerk-react';
import { useSyncUser } from '@/hooks/useApi';
import AppShell from '@/components/AppShell';
import Dashboard from '@/pages/Dashboard';
import ModuleList from '@/pages/ModuleList';
import ModuleDetail from '@/pages/ModuleDetail';
import PracticeSession from '@/pages/PracticeSession';
import Progress from '@/pages/Progress';
import Achievements from '@/pages/Achievements';
import Leaderboard from '@/pages/Leaderboard';

function AuthenticatedApp() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const syncUser = useSyncUser();

  // Sync user on sign-in
  useEffect(() => {
    if (isSignedIn && user) {
      syncUser.mutate();
    }
  }, [isSignedIn, user?.id]);

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
