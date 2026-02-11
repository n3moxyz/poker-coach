import { cn } from '@/lib/utils';
import { type CoachingFeedback, type FeedbackGrade } from '@/lib/coaching';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';

interface CoachingPanelProps {
  feedbacks: CoachingFeedback[];
  className?: string;
}

const GRADE_STYLES: Record<FeedbackGrade, { bg: string; border: string; text: string; label: string }> = {
  Good: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', label: 'Good Play' },
  Okay: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Okay' },
  Mistake: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Mistake' },
};

const PHASE_LABELS: Record<string, string> = {
  preflop: 'Pre-Flop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

export default function CoachingPanel({ feedbacks, className }: CoachingPanelProps) {
  if (feedbacks.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {feedbacks.map((fb, i) => {
        const isLatest = i === feedbacks.length - 1;
        const style = GRADE_STYLES[fb.grade];

        return (
          <div
            key={i}
            className={cn(
              'rounded-xl border-2 p-3 transition-all',
              style.bg, style.border,
              isLatest ? 'animate-in slide-in-from-right-4 duration-300' : 'opacity-50',
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className={cn('w-3.5 h-3.5', style.text)} />
              {fb.phase && (
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {PHASE_LABELS[fb.phase] || fb.phase}
                </span>
              )}
              <span className={cn('text-xs font-bold uppercase', style.text)}>
                {style.label}
              </span>
            </div>

            {/* What the player did + verdict */}
            <p className={cn('text-sm leading-relaxed', isLatest ? 'text-white' : 'text-gray-400')}>
              {fb.message}
            </p>

            {/* Optimal play recommendation */}
            {fb.detail && isLatest && (
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                {fb.detail}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
