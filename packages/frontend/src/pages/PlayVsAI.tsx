import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useGameStore, BLIND_SCHEDULE } from '@/stores/gameStore';
import { useCompleteHand } from '@/hooks/useGame';
import GameSetup from '@/components/game/GameSetup';
import GameTable from '@/components/game/GameTable';
import ActionBar from '@/components/game/ActionBar';
import CoachingPanel from '@/components/game/CoachingPanel';
import HandSummary from '@/components/game/HandSummary';
import RebuyModal from '@/components/game/RebuyModal';
import TournamentResults from '@/components/game/TournamentResults';
import { evaluateHand } from '@/lib/poker';
import { isSoundEnabled, toggleSound } from '@/lib/sounds';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import ClipboardList from 'lucide-react/dist/esm/icons/clipboard-list';
import { cn } from '@/lib/utils';

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
    totalHandsPlayed,
    sessionXpEarned,
    rebuyCount,
    needsRebuy,
    currentBlindLevel,
    handsAtCurrentLevel,
    eliminatedPlayers,
    tournamentFinished,
    tournamentPlacement,
    updateConfig,
    startGame,
    playerFold,
    playerFoldAndSkip,
    playerCheck,
    playerCall,
    playerRaise,
    playerAllIn,
    newHand,
    resetGame,
    addSessionXp,
    doRebuy,
  } = useGameStore();

  const { isSignedIn } = useAuth();
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [lastXpEarned, setLastXpEarned] = useState<number | null>(null);
  const [showCompactResult, setShowCompactResult] = useState(false);
  const [foldChoice, setFoldChoice] = useState<'pending' | null>(null);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeHand = useCompleteHand();
  const xpSubmittedRef = useRef<string | null>(null);

  // Reset fold choice on phase change
  useEffect(() => {
    setFoldChoice(null);
  }, [phase]);

  // Submit hand for XP when showdown is reached
  useEffect(() => {
    if (phase !== 'showdown') {
      xpSubmittedRef.current = null;
      setLastXpEarned(null);
      return;
    }

    const lastHand = handHistory[handHistory.length - 1];
    if (!lastHand || xpSubmittedRef.current === lastHand.id) return;
    xpSubmittedRef.current = lastHand.id;

    const humanPlayer = lastHand.players.find((p) => p.id === 'human');
    // Convert coaching grade (Good/Okay/Mistake) → letter grade (A/B/C/D/F) for backend
    const score = lastHand.grade.score;
    const letterGrade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : score >= 30 ? 'D' : 'F';

    completeHand.mutate(
      {
        playerCount: config.playerCount,
        difficulty: config.difficulty.toUpperCase(),
        smallBlind: config.smallBlind,
        bigBlind: config.bigBlind,
        handHistory: lastHand,
        result: lastHand.winners.includes('You') ? 'WON' : 'LOST',
        chipsDelta: humanPlayer?.chipDelta || 0,
        overallGrade: letterGrade,
      },
      {
        onSuccess: (data) => {
          setLastXpEarned(data.xpEarned);
          addSessionXp(data.xpEarned);
        },
      }
    );
  }, [phase, handHistory]);

  // Handle auto-advance when review is off
  useEffect(() => {
    if (phase !== 'showdown' || config.showHandReview || tournamentFinished || needsRebuy) {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
      setShowCompactResult(false);
      return;
    }

    setShowCompactResult(true);
    autoAdvanceTimer.current = setTimeout(() => {
      advanceToNextHand();
      setShowCompactResult(false);
    }, 3000);

    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, [phase, config.showHandReview, tournamentFinished, needsRebuy]);

  function advanceToNextHand() {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    useGameStore.setState((s) => ({
      dealerIndex: (s.dealerIndex + 1) % s.players.length,
    }));
    newHand();
  }

  function handleToggleReview() {
    updateConfig({ showHandReview: !config.showHandReview });
  }

  // Build session context string
  function getSessionContext(): string {
    const handNum = `Hand #${totalHandsPlayed}`;
    if (config.gameMode === 'hand-by-hand') return handNum;

    if (config.gameMode === 'cash-game') {
      const humanPlayer = players.find((p) => p.isHuman);
      const sessionPL = humanPlayer
        ? humanPlayer.chips - config.startingChips + (rebuyCount * config.startingChips)
        : 0;
      const plStr = sessionPL >= 0 ? `+$${sessionPL}` : `-$${Math.abs(sessionPL)}`;
      return `${handNum} | Session P/L: ${plStr}${rebuyCount > 0 ? ` | Rebuys: ${rebuyCount}` : ''}`;
    }

    // Tournament
    const level = currentBlindLevel + 1;
    const blindInfo = BLIND_SCHEDULE[Math.min(currentBlindLevel, BLIND_SCHEDULE.length - 1)];
    const remaining = players.filter((p) => p.chips > 0).length;
    return `${handNum} | Level ${level} ($${blindInfo.smallBlind}/$${blindInfo.bigBlind}) | ${remaining} players left`;
  }

  // Average grade across all hands this session
  function getAverageGrade(): string {
    if (handHistory.length === 0) return '-';
    const total = handHistory.reduce((sum, h) => sum + h.grade.score, 0);
    const avg = total / handHistory.length;
    if (avg >= 80) return 'A';
    if (avg >= 60) return 'B';
    if (avg >= 40) return 'C';
    if (avg >= 20) return 'D';
    return 'F';
  }

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

  // Tournament finished
  if (tournamentFinished && tournamentPlacement !== null) {
    return (
      <div className="md:ml-64 pb-20 md:pb-6">
        <TournamentResults
          placement={tournamentPlacement}
          totalPlayers={config.playerCount}
          totalHandsPlayed={totalHandsPlayed}
          blindLevelReached={currentBlindLevel}
          averageGrade={getAverageGrade()}
          sessionXpEarned={sessionXpEarned}
          eliminatedPlayers={eliminatedPlayers}
          onNewTournament={() => {
            resetGame();
            // Pre-select tournament mode
            updateConfig({ gameMode: 'tournament' });
          }}
          onBackToMenu={resetGame}
        />
      </div>
    );
  }

  // Rebuy modal (cash game)
  if (needsRebuy) {
    return (
      <div className="md:ml-64 pb-20 md:pb-6">
        <RebuyModal
          startingChips={config.startingChips}
          rebuyCount={rebuyCount}
          totalHandsPlayed={totalHandsPlayed}
          sessionXpEarned={sessionXpEarned}
          onRebuy={doRebuy}
          onCashOut={resetGame}
        />
      </div>
    );
  }

  if (phase === 'showdown') {
    const lastHand = handHistory[handHistory.length - 1];

    // Compact result strip (review OFF)
    if (showCompactResult && lastHand) {
      const humanPlayer = lastHand.players.find((p) => p.id === 'human');
      const won = lastHand.winners.includes('You');
      const chipDelta = humanPlayer?.chipDelta || 0;

      return (
        <div className="md:ml-64 pb-20 md:pb-6 space-y-4">
          <button
            onClick={() => {
              setShowCompactResult(false);
              advanceToNextHand();
            }}
            className="w-full card border-2 border-border py-4 flex items-center justify-center gap-4 hover:border-gold/30 transition-colors cursor-pointer"
          >
            <span className={cn(
              'text-sm font-bold px-2 py-0.5 rounded',
              lastHand.grade.grade === 'Good' ? 'bg-green-500/20 text-green-400' :
              lastHand.grade.grade === 'Okay' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            )}>
              {lastHand.grade.score}/100
            </span>
            <span className={cn('font-semibold', won ? 'text-gold' : 'text-red-400')}>
              {won ? 'Won' : 'Lost'}
            </span>
            <span className={cn('text-sm', chipDelta >= 0 ? 'text-green-400' : 'text-red-400')}>
              {chipDelta >= 0 ? '+' : ''}{chipDelta} chips
            </span>
            {lastXpEarned != null && lastXpEarned > 0 && (
              <span className="text-xs font-bold text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                +{lastXpEarned} XP
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-2">Click or wait...</span>
          </button>
        </div>
      );
    }

    // Full hand summary (review ON)
    if (lastHand) {
      return (
        <div className="md:ml-64 pb-20 md:pb-6">
          <HandSummary
            record={lastHand}
            xpEarned={lastXpEarned}
            sessionContext={getSessionContext()}
            onPlayAgain={advanceToNextHand}
            onBackToMenu={resetGame}
            isSignedIn={!!isSignedIn}
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

  // Build tournament info for GameTable
  const tournamentInfo = config.gameMode === 'tournament' ? {
    blindLevel: currentBlindLevel,
    smallBlind: config.smallBlind,
    bigBlind: config.bigBlind,
    ante: BLIND_SCHEDULE[Math.min(currentBlindLevel, BLIND_SCHEDULE.length - 1)]?.ante || 0,
    handsUntilNextLevel: config.handsPerLevel - handsAtCurrentLevel,
    playersRemaining: players.filter((p) => p.chips > 0).length,
  } : undefined;

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
          <span>Hand #{totalHandsPlayed}</span>
          {isProcessingAI && (
            <span className="animate-pulse text-yellow-400">AI thinking...</span>
          )}
          <button
            onClick={handleToggleReview}
            className={cn(
              'p-1 rounded hover:bg-white/10 transition-colors',
              config.showHandReview ? 'text-gold' : 'text-gray-600'
            )}
            title={config.showHandReview ? 'Hand review ON' : 'Hand review OFF'}
          >
            <ClipboardList className="w-4 h-4" />
          </button>
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
        tournamentInfo={tournamentInfo}
      />

      {/* Coaching feedback — shows all feedbacks, latest highlighted */}
      <CoachingPanel feedbacks={feedbacks} />

      {/* Action Bar */}
      {isHumanTurn && humanPlayer && !foldChoice && (
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
          onFold={() => setFoldChoice('pending')}
          onCheck={playerCheck}
          onCall={playerCall}
          onRaise={playerRaise}
          onAllIn={playerAllIn}
        />
      )}

      {/* Fold choice prompt */}
      {foldChoice === 'pending' && (
        <div className="flex items-center justify-center gap-3 py-3">
          <span className="text-sm text-muted-foreground">You folded.</span>
          <button
            onClick={() => {
              setFoldChoice(null);
              playerFold();
            }}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Watch hand play out
          </button>
          <button
            onClick={() => {
              setFoldChoice(null);
              playerFoldAndSkip();
            }}
            className="btn-primary px-4 py-2 text-sm"
          >
            Skip to review
          </button>
        </div>
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
