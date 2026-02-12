import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import GameSetup from '@/components/game/GameSetup';
import GameTable from '@/components/game/GameTable';
import ActionBar from '@/components/game/ActionBar';
import CoachingPanel from '@/components/game/CoachingPanel';
import HandSummary from '@/components/game/HandSummary';
import { evaluateHand } from '@/lib/poker';
import { isSoundEnabled, toggleSound } from '@/lib/sounds';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x';
import LogOut from 'lucide-react/dist/esm/icons/log-out';

export default function PlayVsAI() {
  const {
    phase,
    config,
    players,
    communityCards,
    pot,
    currentBet,
    dealerIndex,
    activePlayerIndex,
    feedbacks,
    handActions,
    isProcessingAI,
    handHistory,
    updateConfig,
    startGame,
    playerFold,
    playerCheck,
    playerCall,
    playerRaise,
    playerAllIn,
    newHand,
    resetGame,
  } = useGameStore();

  const [soundOn, setSoundOn] = useState(isSoundEnabled);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't reset on unmount -- user might navigate back
    };
  }, []);

  if (phase === 'setup') {
    return (
      <div className="md:ml-64 pb-20 md:pb-6">
        <GameSetup
          config={config}
          onUpdateConfig={updateConfig}
          onStart={startGame}
        />
      </div>
    );
  }

  if (phase === 'showdown') {
    const lastHand = handHistory[handHistory.length - 1];
    if (lastHand) {
      return (
        <div className="md:ml-64 pb-20 md:pb-6">
          <HandSummary
            record={lastHand}
            onPlayAgain={() => {
              // Rotate dealer
              useGameStore.setState((s) => ({
                dealerIndex: (s.dealerIndex + 1) % s.players.length,
              }));
              newHand();
            }}
            onBackToMenu={resetGame}
          />
        </div>
      );
    }
  }

  // Game is active (preflop/flop/turn/river)
  const humanPlayer = players.find((p) => p.isHuman);
  const isHumanTurn = humanPlayer && players[activePlayerIndex]?.isHuman && !isProcessingAI;
  const toCall = humanPlayer ? currentBet - humanPlayer.currentBet : 0;
  const canCheck = isHumanTurn && toCall === 0;
  const canCall = isHumanTurn && toCall > 0;
  const minRaise = currentBet + config.bigBlind;
  const maxRaise = humanPlayer ? humanPlayer.currentBet + humanPlayer.chips : 0;
  const canRaise = isHumanTurn && humanPlayer && humanPlayer.chips > toCall;

  // Evaluate human hand for display
  const humanHandName = getHumanHandName(humanPlayer, communityCards);

  return (
    <div className="md:ml-64 pb-20 md:pb-6 space-y-4">
      {/* Phase indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <PhaseIndicator phase={phase} />
          {humanHandName && (
            <span className="text-sm text-gold">{humanHandName}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Hand #{handHistory.length + 1}</span>
          {isProcessingAI && (
            <span className="animate-pulse text-yellow-400">AI thinking...</span>
          )}
          <button
            onClick={() => setSoundOn(toggleSound())}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            title={soundOn ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundOn
              ? <Volume2 className="w-4 h-4 text-gray-400" />
              : <VolumeX className="w-4 h-4 text-gray-600" />
            }
          </button>
          <button
            onClick={resetGame}
            className="p-1 rounded hover:bg-red-500/20 transition-colors"
            title="Exit to setup"
          >
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Game Table */}
      <GameTable
        players={players}
        communityCards={communityCards}
        pot={pot}
        dealerIndex={dealerIndex}
        activePlayerIndex={activePlayerIndex}
        phase={phase}
        handActions={handActions}
      />

      {/* Coaching feedback — shows all feedbacks, latest highlighted */}
      <CoachingPanel feedbacks={feedbacks} />

      {/* Action Bar */}
      {isHumanTurn && humanPlayer && (
        <ActionBar
          canCheck={!!canCheck}
          canCall={!!canCall}
          canRaise={!!canRaise}
          callAmount={toCall}
          minRaise={minRaise}
          maxRaise={maxRaise}
          currentBet={currentBet}
          pot={pot}
          disabled={!isHumanTurn}
          onFold={playerFold}
          onCheck={playerCheck}
          onCall={playerCall}
          onRaise={playerRaise}
          onAllIn={playerAllIn}
        />
      )}

      {/* Waiting indicator when it's not human's turn */}
      {!isHumanTurn && phase !== 'showdown' && phase !== 'summary' && (
        <div className="text-center py-4">
          <div className="text-muted-foreground text-sm animate-pulse">
            {isProcessingAI
              ? `${players[activePlayerIndex]?.name || 'AI'} is thinking...`
              : 'Waiting...'}
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: string }) {
  const phases = ['preflop', 'flop', 'turn', 'river'];
  const currentIdx = phases.indexOf(phase);

  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center gap-1">
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              i === currentIdx
                ? 'bg-gold/20 text-gold border border-gold/30'
                : i < currentIdx
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-background-tertiary text-muted-foreground'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </div>
          {i < phases.length - 1 && (
            <div className={`w-2 h-0.5 ${i < currentIdx ? 'bg-green-500' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function getHumanHandName(
  humanPlayer: { cards: { rank: string; suit: string }[] } | undefined,
  communityCards: { rank: string; suit: string }[]
): string | null {
  if (!humanPlayer || humanPlayer.cards.length < 2 || communityCards.length < 3) return null;

  try {
    const allCards = [...humanPlayer.cards, ...communityCards] as any;
    const result = evaluateHand(allCards);
    return result.name;
  } catch {
    return null;
  }
}
