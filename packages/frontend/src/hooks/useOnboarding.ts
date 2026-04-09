import { useState, useCallback } from 'react';

const STORAGE_KEY = 'poker-coach-onboarding';

interface OnboardingState {
  firstHandTooltips: boolean;
}

function getOnboardingState(): OnboardingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { firstHandTooltips: false };
  } catch {
    return { firstHandTooltips: false };
  }
}

function markComplete(key: keyof OnboardingState) {
  const state = getOnboardingState();
  state[key] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useFirstHandTooltips() {
  const [dismissed, setDismissed] = useState(() => getOnboardingState().firstHandTooltips);

  const dismiss = useCallback(() => {
    setDismissed(true);
    markComplete('firstHandTooltips');
  }, []);

  return { showTooltips: !dismissed, dismiss };
}
