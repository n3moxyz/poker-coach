import { cn, parseCard, isRedSuit, SUIT_SYMBOLS } from '@/lib/utils';

interface PlayingCardProps {
  card: string; // e.g., "Ah", "Kd", "10c", "2s"
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PlayingCard({ card, size = 'md', className }: PlayingCardProps) {
  const { rank, suit } = parseCard(card);
  const isRed = isRedSuit(suit);
  const suitSymbol = SUIT_SYMBOLS[suit] || suit;

  const sizeClasses = {
    sm: 'w-10 h-14',
    md: 'w-12 h-16',
    lg: 'w-16 h-22',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const centerSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-md shadow-card overflow-hidden relative',
        'font-mono font-bold select-none flex-shrink-0',
        isRed ? 'text-card-red' : 'text-card-black',
        sizeClasses[size],
        className
      )}
    >
      {/* Top left rank and suit */}
      <div className={cn('absolute top-0.5 left-1 leading-tight', textSizes[size])}>
        <div className="leading-none">{rank}</div>
        <div className="leading-none -mt-0.5">{suitSymbol}</div>
      </div>
      {/* Center suit */}
      <div className={cn('absolute inset-0 flex items-center justify-center', centerSizes[size])}>
        {suitSymbol}
      </div>
      {/* Bottom right rank and suit (rotated) */}
      <div className={cn('absolute bottom-0.5 right-1 leading-tight rotate-180', textSizes[size])}>
        <div className="leading-none">{rank}</div>
        <div className="leading-none -mt-0.5">{suitSymbol}</div>
      </div>
    </div>
  );
}

// Card back component
export function CardBack({ size = 'md', className }: Omit<PlayingCardProps, 'card'>) {
  const sizeClasses = {
    sm: 'w-10 h-14',
    md: 'w-14 h-20',
    lg: 'w-20 h-28',
  };

  return (
    <div
      className={cn(
        'rounded-lg shadow-card',
        'bg-gradient-to-br from-blue-800 to-blue-900',
        'border-2 border-blue-700',
        sizeClasses[size],
        className
      )}
    >
      <div className="w-full h-full bg-card-pattern rounded-md" />
    </div>
  );
}

// Hand display component
interface HandDisplayProps {
  cards: string[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  overlap?: boolean;
}

export function HandDisplay({ cards, size = 'md', className, overlap = false }: HandDisplayProps) {
  return (
    <div
      className={cn(
        'flex',
        overlap ? '-space-x-4' : 'gap-1',
        className
      )}
    >
      {cards.map((card, index) => (
        <PlayingCard
          key={index}
          card={card}
          size={size}
          className={overlap ? 'hover:translate-y-[-4px] transition-transform' : ''}
        />
      ))}
    </div>
  );
}
