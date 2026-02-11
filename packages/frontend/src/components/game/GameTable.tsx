import { cn } from '@/lib/utils';
import { type PlayerState, type GamePhase, type HandAction } from '@/stores/gameStore';
import PlayingCard, { CardBack } from '@/components/games/PlayingCard';
import { type Card, cardToString } from '@/lib/poker';

interface GameTableProps {
  players: PlayerState[];
  communityCards: Card[];
  pot: number;
  dealerIndex: number;
  activePlayerIndex: number;
  phase: GamePhase;
  handActions: HandAction[];
}

// Calculate player positions around an oval table
function getPlayerPosition(index: number, total: number): { x: number; y: number } {
  // Place human at bottom center, others distributed clockwise
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: 50 + 40 * Math.cos(angle),
    y: 50 + 35 * Math.sin(angle),
  };
}

// Derive per-player last action in current phase
function getPlayerLastActions(handActions: HandAction[], phase: GamePhase): Record<string, string> {
  const actions: Record<string, string> = {};
  for (const a of handActions) {
    if (a.phase !== phase || a.action === 'post-blind') continue;
    switch (a.action) {
      case 'fold': actions[a.playerId] = 'Fold'; break;
      case 'check': actions[a.playerId] = 'Check'; break;
      case 'call': actions[a.playerId] = `Call $${a.amount}`; break;
      case 'raise': actions[a.playerId] = `Raise $${a.amount}`; break;
      case 'all-in': actions[a.playerId] = `All-In $${a.amount}`; break;
    }
  }
  return actions;
}

export default function GameTable({
  players,
  communityCards,
  pot,
  dealerIndex,
  activePlayerIndex,
  phase,
  handActions,
}: GameTableProps) {
  const showdown = phase === 'showdown';
  const lastActions = getPlayerLastActions(handActions, phase);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="pt-4 pb-4">
        {/* Poker Table */}
        <div className="relative aspect-[16/10] bg-gradient-to-b from-felt-green to-felt-dark rounded-[50%] border-8 border-felt-border shadow-2xl">
          <div className="absolute inset-0 rounded-[50%] border-4 border-felt-rim opacity-50" />

          {/* Pot Display */}
          {pot > 0 && (
            <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-10">
              <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-1.5 border border-gold/30">
                <span className="text-gold font-bold text-sm">Pot: ${pot}</span>
              </div>
            </div>
          )}

          {/* Community Cards */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex gap-1.5">
              {communityCards.map((card, i) => (
                <PlayingCard key={i} card={cardToString(card)} size="sm" />
              ))}
              {/* Placeholder slots for upcoming cards */}
              {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-10 h-14 rounded-md border border-white/10 bg-white/5"
                />
              ))}
            </div>
          </div>

          {/* Players */}
          {players.map((player, idx) => {
            const pos = getPlayerPosition(idx, players.length);
            const isActive = idx === activePlayerIndex && phase !== 'showdown' && phase !== 'setup';
            const isDealer = idx === dealerIndex;
            const isSB = idx === (dealerIndex + 1) % players.length;
            const isBB = idx === (dealerIndex + 2) % players.length;

            return (
              <div
                key={player.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <PlayerSeat
                  player={player}
                  isActive={isActive}
                  isDealer={isDealer}
                  isSB={isSB}
                  isBB={isBB}
                  showCards={player.isHuman || showdown}
                  lastAction={lastActions[player.id]}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface PlayerSeatProps {
  player: PlayerState;
  isActive: boolean;
  isDealer: boolean;
  isSB: boolean;
  isBB: boolean;
  showCards: boolean;
  lastAction?: string;
}

function PlayerSeat({ player, isActive, isDealer, isSB, isBB, showCards, lastAction }: PlayerSeatProps) {
  const { hasFolded, isAllIn } = player;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all min-w-[80px]',
        hasFolded && 'opacity-40',
        isActive
          ? 'border-gold bg-gold/10 ring-2 ring-gold/40 scale-105'
          : 'border-gray-700 bg-gray-900/80',
        isAllIn && !hasFolded && 'border-red-500 bg-red-500/10'
      )}
    >
      {/* Cards */}
      <div className="flex gap-0.5">
        {player.cards.length > 0 ? (
          showCards ? (
            player.cards.map((card, i) => (
              <PlayingCard key={i} card={cardToString(card)} size="sm" />
            ))
          ) : (
            <>
              <CardBack size="sm" />
              <CardBack size="sm" />
            </>
          )
        ) : null}
      </div>

      {/* Name + Chips */}
      <div className="text-center">
        <div className="flex items-center gap-1">
          {isDealer && (
            <span className="bg-gold text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              D
            </span>
          )}
          {isSB && !isDealer && (
            <span className="bg-blue-500/80 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              SB
            </span>
          )}
          {isBB && (
            <span className="bg-purple-500/80 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              BB
            </span>
          )}
          <span
            className={cn(
              'text-xs font-medium truncate max-w-[70px]',
              isActive ? 'text-gold' : 'text-gray-300',
              hasFolded && 'line-through text-gray-500'
            )}
          >
            {player.isHuman ? 'You' : player.name}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          ${player.chips}
        </div>
      </div>

      {/* Current bet indicator */}
      {player.currentBet > 0 && !hasFolded && (
        <div className="text-[10px] text-gold font-medium bg-gold/10 px-1.5 py-0.5 rounded">
          ${player.currentBet}
        </div>
      )}

      {/* Last action indicator */}
      {lastAction && !hasFolded && !isAllIn && (
        <div className="text-[9px] text-blue-400 font-medium animate-in fade-in duration-300">
          {lastAction}
        </div>
      )}

      {/* All-in badge */}
      {isAllIn && !hasFolded && (
        <div className="text-[9px] text-red-400 font-bold uppercase">All-In</div>
      )}

      {/* Folded badge */}
      {hasFolded && (
        <div className="text-[9px] text-gray-500 font-bold uppercase">Fold</div>
      )}
    </div>
  );
}
