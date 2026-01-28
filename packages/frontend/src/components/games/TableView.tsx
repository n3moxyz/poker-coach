import { cn } from '@/lib/utils';
import PlayingCard, { HandDisplay } from './PlayingCard';

interface Player {
  seat: number;
  name: string;
  cards: string[];
}

interface TableViewProps {
  board: string[];
  players: Player[];
  selectedPlayer?: string;
  onSelectPlayer?: (playerName: string) => void;
  disabled?: boolean;
  showResult?: boolean;
  correctAnswer?: string;
  className?: string;
}

export default function TableView({
  board,
  players,
  selectedPlayer,
  onSelectPlayer,
  disabled = false,
  showResult = false,
  correctAnswer,
  className,
}: TableViewProps) {
  // Position players around the table (for 3 players)
  const playerPositions: Record<number, { top?: string; bottom?: string; left?: string; right?: string }> = {
    1: { bottom: '0', left: '50%' },
    2: { top: '10%', left: '5%' },
    3: { top: '10%', right: '5%' },
  };

  const getPlayerState = (playerName: string) => {
    if (!showResult) {
      if (selectedPlayer === playerName) return 'selected';
      return 'default';
    }
    // Show result mode
    const isCorrect = correctAnswer === playerName;
    const isSelected = selectedPlayer === playerName;
    if (isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'incorrect';
    return 'default';
  };

  const stateStyles = {
    default: 'border-gray-700 bg-gray-800/50',
    selected: 'border-gold bg-gold/10 ring-2 ring-gold/50',
    correct: 'border-green-500 bg-green-500/10 ring-2 ring-green-500/50',
    incorrect: 'border-red-500 bg-red-500/10 ring-2 ring-red-500/50',
  };

  return (
    <div className={cn('relative w-full max-w-2xl mx-auto', className)}>
      {/* Poker Table */}
      <div className="relative aspect-[16/10] bg-gradient-to-b from-felt-green to-felt-dark rounded-[50%] border-8 border-felt-border shadow-2xl">
        {/* Table Rim */}
        <div className="absolute inset-0 rounded-[50%] border-4 border-felt-rim opacity-50" />

        {/* Community Cards - Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex gap-1 sm:gap-2">
            {board.map((card, index) => (
              <PlayingCard key={index} card={card} size="sm" />
            ))}
          </div>
        </div>

        {/* Players */}
        {players.map((player) => {
          const position = playerPositions[player.seat] || {};
          const state = getPlayerState(player.name);
          const isClickable = !disabled && onSelectPlayer;

          return (
            <button
              key={player.seat}
              onClick={() => isClickable && onSelectPlayer?.(player.name)}
              disabled={disabled}
              className={cn(
                'absolute transform',
                position.bottom === '0' ? '-translate-x-1/2 translate-y-1/2' : '',
                position.top === '10%' && position.left === '5%' ? '' : '',
                position.top === '10%' && position.right === '5%' ? '' : '',
                'transition-all duration-200',
                isClickable && !disabled && 'hover:scale-105 cursor-pointer',
                disabled && 'cursor-default'
              )}
              style={{
                top: position.top,
                bottom: position.bottom,
                left: position.left,
                right: position.right,
                transform: position.bottom === '0'
                  ? 'translateX(-50%) translateY(50%)'
                  : undefined,
              }}
            >
              <div
                className={cn(
                  'flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg border-2 transition-colors',
                  stateStyles[state]
                )}
              >
                {/* Player Cards */}
                <HandDisplay cards={player.cards} size="sm" />

                {/* Player Name */}
                <span className={cn(
                  'text-xs sm:text-sm font-medium px-2 py-0.5 rounded',
                  state === 'correct' && 'text-green-400',
                  state === 'incorrect' && 'text-red-400',
                  state === 'selected' && 'text-gold',
                  state === 'default' && 'text-gray-300'
                )}>
                  {player.name}
                  {state === 'correct' && ' ✓'}
                  {state === 'incorrect' && ' ✗'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
