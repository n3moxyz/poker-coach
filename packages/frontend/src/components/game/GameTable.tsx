import { cn } from '@/lib/utils';
import { type PlayerState, type GamePhase, type HandAction } from '@/stores/gameStore';
import PlayingCard, { CardBack } from '@/components/games/PlayingCard';
import { type Card, cardToString } from '@/lib/poker';

interface TournamentInfo {
  blindLevel: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  handsUntilNextLevel: number;
  playersRemaining: number;
}

interface GameTableProps {
  players: PlayerState[];
  communityCards: Card[];
  pot: number;
  dealerIndex: number;
  activePlayerIndex: number;
  phase: GamePhase;
  handActions: HandAction[];
  isReplay?: boolean;
  tournamentInfo?: TournamentInfo;
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
  isReplay,
  tournamentInfo,
}: GameTableProps) {
  const showdown = phase === 'showdown';
  const lastActions = getPlayerLastActions(handActions, phase);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Tournament info banner */}
      {tournamentInfo && (
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground bg-background-tertiary/50 rounded-lg px-3 py-1.5 mb-1">
          <span className="text-gold font-medium">Level {tournamentInfo.blindLevel + 1}</span>
          <span>${tournamentInfo.smallBlind}/${tournamentInfo.bigBlind}</span>
          {tournamentInfo.ante > 0 && <span>Ante ${tournamentInfo.ante}</span>}
          <span>{tournamentInfo.handsUntilNextLevel} hands to next</span>
          <span>{tournamentInfo.playersRemaining} players</span>
        </div>
      )}
      <div className="pt-4 pb-4">
        {/* Poker Table */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-gradient-to-b from-felt-green to-felt-dark rounded-[50%] border-4 sm:border-8 border-felt-border shadow-2xl">
          <div className="absolute inset-0 rounded-[50%] border-2 sm:border-4 border-felt-rim opacity-50" />

          {/* Community Cards + Pot (pot directly below cards) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 sm:gap-1.5">
            <div className="flex gap-1 sm:gap-1.5">
              {communityCards.map((card, i) => (
                <PlayingCard key={i} card={cardToString(card)} size="xs" className="sm:hidden" />
              ))}
              {communityCards.map((card, i) => (
                <PlayingCard key={`sm-${i}`} card={cardToString(card)} size="sm" className="hidden sm:block" />
              ))}
              {/* Placeholder slots for upcoming cards */}
              {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-7 h-10 sm:w-10 sm:h-14 rounded-md border border-white/10 bg-white/5"
                />
              ))}
            </div>
            {pot > 0 && (
              <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 sm:px-4 py-0.5 sm:py-1 border border-gold/30">
                <span className="text-gold font-bold text-xs sm:text-sm">Pot: ${pot}</span>
              </div>
            )}
          </div>

          {/* Players */}
          {players.map((player, idx) => {
            const pos = getPlayerPosition(idx, players.length);
            const isActive = !isReplay && idx === activePlayerIndex && phase !== 'showdown' && phase !== 'setup';
            const isDealer = idx === dealerIndex;
            const isSB = idx === (dealerIndex + 1) % players.length;
            const isBB = idx === (dealerIndex + 2) % players.length;

            return (
              <div
                key={player.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="relative">
                  <PositionBadge isDealer={isDealer} isSB={isSB} isBB={isBB} />
                  <PlayerSeat
                    player={player}
                    isActive={isActive}
                    showCards={player.isHuman || showdown || !!isReplay}
                  />
                </div>
              </div>
            );
          })}

          {/* Action labels — positioned on the felt between player and board center */}
          {players.map((player, idx) => {
            const pos = getPlayerPosition(idx, players.length);
            const actionLabel = lastActions[player.id];
            const hasAction = actionLabel || player.hasFolded || player.isAllIn || (player.currentBet > 0 && !player.hasFolded);
            if (!hasAction) return null;

            // Position a fixed distance from player toward center (50,50)
            const dx = 50 - pos.x;
            const dy = 50 - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const fixedOffset = 14;
            const actionX = pos.x + (dx / dist) * fixedOffset;
            const actionY = pos.y + (dy / dist) * fixedOffset;

            return (
              <div
                key={`action-${player.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-[15] pointer-events-none flex flex-col items-center"
                style={{ left: `${actionX}%`, top: `${actionY}%` }}
              >
                {player.currentBet > 0 && !player.hasFolded && (
                  <div className="text-[10px] text-gold font-semibold bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-gold/30 whitespace-nowrap">
                    ${player.currentBet}
                  </div>
                )}
                {actionLabel && !player.hasFolded && !player.isAllIn && (
                  <div className="text-[9px] sm:text-[10px] text-cyan-400 font-medium italic whitespace-nowrap animate-in fade-in duration-300">
                    {actionLabel}
                  </div>
                )}
                {player.isAllIn && !player.hasFolded && (
                  <div className="text-[9px] sm:text-[10px] text-red-400 font-bold uppercase whitespace-nowrap">All-In</div>
                )}
                {player.hasFolded && (
                  <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase whitespace-nowrap">Fold</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Position badge (D / SB / BB) floating at top-left corner of player card */
function PositionBadge({ isDealer, isSB, isBB }: { isDealer: boolean; isSB: boolean; isBB: boolean }) {
  const badge = isDealer
    ? { label: 'D', cls: 'bg-gold text-black' }
    : isSB
      ? { label: 'SB', cls: 'bg-orange-500 text-white' }
      : isBB
        ? { label: 'BB', cls: 'bg-purple-500 text-white' }
        : null;

  if (!badge) return null;

  return (
    <span className={cn(
      'absolute -top-2 -left-2 z-30 text-[9px] font-bold rounded-full px-1.5 h-4 flex items-center justify-center leading-none shadow-md',
      badge.cls
    )}>
      {badge.label}
    </span>
  );
}

interface PlayerSeatProps {
  player: PlayerState;
  isActive: boolean;
  showCards: boolean;
}

function PlayerSeat({ player, isActive, showCards }: PlayerSeatProps) {
  const { hasFolded, isAllIn } = player;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-lg border-2 transition-all min-w-[60px] sm:min-w-[80px]',
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
            <>
              {player.cards.map((card, i) => (
                <PlayingCard key={i} card={cardToString(card)} size="xs" className="sm:hidden" />
              ))}
              {player.cards.map((card, i) => (
                <PlayingCard key={`sm-${i}`} card={cardToString(card)} size="sm" className="hidden sm:block" />
              ))}
            </>
          ) : (
            <>
              <CardBack size="xs" className="sm:hidden" />
              <CardBack size="xs" className="sm:hidden" />
              <CardBack size="sm" className="hidden sm:block" />
              <CardBack size="sm" className="hidden sm:block" />
            </>
          )
        ) : null}
      </div>

      {/* Name + Stack */}
      <div className="text-center">
        <span
          className={cn(
            'text-[10px] sm:text-xs font-medium truncate max-w-[50px] sm:max-w-[70px] block',
            isActive ? 'text-gold' : 'text-gray-300',
            hasFolded && 'line-through text-gray-500'
          )}
        >
          {player.isHuman ? 'You' : player.name}
        </span>
        <div className="text-[8px] sm:text-[10px] text-muted-foreground">
          ${player.chips}
        </div>
      </div>
    </div>
  );
}
