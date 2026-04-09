import { useEffect } from 'react';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import LogOut from 'lucide-react/dist/esm/icons/log-out';

interface RebuyModalProps {
  startingChips: number;
  rebuyCount: number;
  totalHandsPlayed: number;
  sessionXpEarned: number;
  onRebuy: () => void;
  onCashOut: () => void;
}

export default function RebuyModal({
  startingChips,
  rebuyCount,
  totalHandsPlayed,
  sessionXpEarned,
  onRebuy,
  onCashOut,
}: RebuyModalProps) {
  // Focus trap and Escape key handling
  useEffect(() => {
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) return;
    const focusableEls = modal.querySelectorAll(
      'button, input, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableEls[0] as HTMLElement;
    const lastEl = focusableEls[focusableEls.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCashOut(); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) { e.preventDefault(); lastEl?.focus(); }
      } else {
        if (document.activeElement === lastEl) { e.preventDefault(); firstEl?.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstEl?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCashOut]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rebuy-title"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="card max-w-sm w-full space-y-5 border-2 border-red-500/30">
        <div className="text-center space-y-2">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 id="rebuy-title" className="text-xl font-bold text-white">You're Out of Chips!</h2>
          <p className="text-sm text-muted-foreground">
            {rebuyCount > 0
              ? `You've rebuilt ${rebuyCount} time${rebuyCount > 1 ? 's' : ''} this session.`
              : `${totalHandsPlayed} hands played this session.`}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRebuy}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Rebuy for ${startingChips}
          </button>
          <button
            onClick={onCashOut}
            className="w-full btn-secondary py-3 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cash Out
          </button>
        </div>

        {sessionXpEarned > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Session XP earned: +{sessionXpEarned}
          </p>
        )}
      </div>
    </div>
  );
}
