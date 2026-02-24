import { useState, useMemo } from 'react';
import Users from 'lucide-react/dist/esm/icons/users';
import Coins from 'lucide-react/dist/esm/icons/coins';
import Brain from 'lucide-react/dist/esm/icons/brain';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Minus from 'lucide-react/dist/esm/icons/minus';
import Plus from 'lucide-react/dist/esm/icons/plus';
import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';
import Zap from 'lucide-react/dist/esm/icons/zap';
import { cn } from '@/lib/utils';
import { type AIDifficulty } from '@/lib/aiOpponents';
import { type GameConfig, type GameMode, BLIND_SCHEDULE, TOURNAMENT_SPEEDS } from '@/stores/gameStore';
import { COMMON_SPOTS, CATEGORY_STYLES } from '@/lib/commonSpots';

interface GameSetupProps {
  config: GameConfig;
  onUpdateConfig: (config: Partial<GameConfig>) => void;
  onStart: () => void;
}

const BLIND_PRESETS = [
  { label: '$1/$2', small: 1, big: 2 },
  { label: '$2/$5', small: 2, big: 5 },
  { label: '$5/$10', small: 5, big: 10 },
];

const STACK_PRESETS = [
  { label: '50bb', multiplier: 50 },
  { label: '100bb', multiplier: 100 },
  { label: '200bb', multiplier: 200 },
];

const DIFFICULTIES: { value: AIDifficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Predictable, never bluffs', color: 'text-green-400 border-green-500/30 bg-green-500/10' },
  { value: 'medium', label: 'Medium', desc: 'Position-aware, c-bets', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
  { value: 'hard', label: 'Hard', desc: 'Balanced, tricky', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
];

const MODE_OPTIONS: { value: GameMode; label: string; desc: string; note?: string; icon: 'book' | 'coins' | 'trophy' }[] = [
  { value: 'hand-by-hand', label: 'Practice', desc: 'Learn one hand at a time', note: 'Recommended for beginners', icon: 'book' },
  { value: 'cash-game', label: 'Cash Game', desc: 'Continuous stacks, rebuys', note: 'Focus on chip management', icon: 'coins' },
  { value: 'tournament', label: 'Tournament', desc: 'Blinds increase, last wins', note: 'Test your endurance', icon: 'trophy' },
];

const SPEED_OPTIONS = Object.entries(TOURNAMENT_SPEEDS).map(([key, val]) => ({
  value: key,
  label: val.label,
  handsPerLevel: val.handsPerLevel,
}));

function ModeIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case 'book': return <BookOpen className={className} />;
    case 'coins': return <Coins className={className} />;
    case 'trophy': return <Trophy className={className} />;
    default: return null;
  }
}

export default function GameSetup({ config, onUpdateConfig, onStart }: GameSetupProps) {
  const [customBlinds, setCustomBlinds] = useState(false);
  const [customSb, setCustomSb] = useState(config.smallBlind);
  const [customBb, setCustomBb] = useState(config.bigBlind);
  const [showBlindSchedule, setShowBlindSchedule] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // Grey-out helpers: determine which config sections are pre-filled by the selected spot
  const selectedSpot = selectedSpotId ? COMMON_SPOTS.find(s => s.id === selectedSpotId) : null;
  const spotConfigKeys = useMemo(
    () => selectedSpot ? new Set(Object.keys(selectedSpot.config)) : new Set<string>(),
    [selectedSpot],
  );
  const isCovered = (...keys: string[]) => selectedSpotId !== null && keys.every(k => spotConfigKeys.has(k));

  // Clear selected spot when user manually changes any setting
  const handleManualConfig = (updates: Partial<GameConfig>) => {
    setSelectedSpotId(null);
    onUpdateConfig(updates);
  };

  const handleSpotSelect = (spotId: string) => {
    if (selectedSpotId === spotId) {
      setSelectedSpotId(null);
      return;
    }
    const spot = COMMON_SPOTS.find((s) => s.id === spotId);
    if (!spot) return;
    setSelectedSpotId(spotId);
    onUpdateConfig(spot.config);
  };

  const currentStackBb = Math.round(config.startingChips / config.bigBlind);
  const isPresetStack = STACK_PRESETS.some((p) => p.multiplier === currentStackBb);
  const isTournament = config.gameMode === 'tournament';
  const isCashGame = config.gameMode === 'cash-game';

  // Tournament min 3 players validation
  const minPlayers = isTournament ? 3 : 2;
  const effectivePlayerCount = Math.max(config.playerCount, minPlayers);

  const handleBlindPreset = (small: number, big: number) => {
    setCustomBlinds(false);
    handleManualConfig({
      smallBlind: small,
      bigBlind: big,
      startingChips: currentStackBb * big,
    });
  };

  const handleCustomBlindsApply = () => {
    if (customSb > 0 && customBb > 0 && customBb >= customSb) {
      handleManualConfig({
        smallBlind: customSb,
        bigBlind: customBb,
        startingChips: currentStackBb * customBb,
      });
    }
  };

  const handleStackPreset = (multiplier: number) => {
    handleManualConfig({ startingChips: multiplier * config.bigBlind });
  };

  const handleModeChange = (mode: GameMode) => {
    const updates: Partial<GameConfig> = { gameMode: mode };
    // Enforce min players for tournament
    if (mode === 'tournament' && config.playerCount < 3) {
      updates.playerCount = 3;
    }
    handleManualConfig(updates);
  };

  const currentSpeed = SPEED_OPTIONS.find((s) => s.handsPerLevel === config.handsPerLevel) || SPEED_OPTIONS[1];

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Play vs AI</h1>
        <p className="text-muted-foreground">Set up your table and start playing</p>
      </div>

      {/* Quick Start — pre-filled scenarios */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Zap className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">Quick Start</h2>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Pick a scenario to auto-fill all settings below, then hit Deal Me In.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {COMMON_SPOTS.map((spot) => {
            const isSelected = selectedSpotId === spot.id;
            const catStyle = CATEGORY_STYLES[spot.category];
            return (
              <button
                key={spot.id}
                onClick={() => handleSpotSelect(spot.id)}
                className={cn(
                  'flex flex-col gap-1.5 p-3 rounded-lg border-2 transition-all text-left',
                  isSelected
                    ? 'border-gold bg-gold/10'
                    : 'border-border bg-background-tertiary hover:border-border-light'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('font-medium text-sm', isSelected ? 'text-gold' : 'text-white')}>
                    {spot.name}
                  </span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0', catStyle.color)}>
                    {catStyle.label}
                  </span>
                </div>
                <span className={cn('text-xs leading-tight', isSelected ? 'text-gold/70' : 'text-muted-foreground')}>
                  {spot.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">or customize manually</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Game Mode */}
      <div className={cn('card space-y-4 transition-opacity duration-300', isCovered('gameMode') && 'opacity-30')}>
        <h2 className="font-semibold text-white">Game Mode</h2>
        <div className="grid grid-cols-3 gap-3">
          {MODE_OPTIONS.map((mode) => {
            const isSelected = config.gameMode === mode.value;
            const isPractice = mode.value === 'hand-by-hand';

            return (
              <div key={mode.value} className="relative group">
                <button
                  onClick={() => handleModeChange(mode.value)}
                  className={cn(
                    'w-full flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-all text-center',
                    isSelected && isPractice && 'border-green-500 bg-green-500/10 text-green-400',
                    isSelected && !isPractice && 'border-gold bg-gold/10 text-gold',
                    !isSelected && 'border-border bg-background-tertiary text-muted-foreground hover:border-border-light hover:text-white'
                  )}
                >
                  <ModeIcon icon={mode.icon} className="w-5 h-5" />
                  <div>
                    <div className="font-medium text-sm">{mode.label}</div>
                    <div className="text-[10px] sm:text-xs opacity-70 leading-tight mt-0.5">{mode.desc}</div>
                  </div>
                </button>
                {/* Hover tooltip for all modes */}
                {mode.note && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
                    <div className="bg-gray-800 text-gray-200 text-[10px] px-2.5 py-1 rounded-md shadow-lg border border-border whitespace-nowrap">
                      {mode.note}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hand Review Toggle */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={config.showHandReview}
            onChange={(e) => handleManualConfig({ showHandReview: e.target.checked })}
            className="w-4 h-4 rounded border-border bg-background-tertiary accent-gold"
          />
          <div>
            <span className="text-sm text-white group-hover:text-gold transition-colors">
              Show hand review after each hand
            </span>
            <p className="text-[10px] text-muted-foreground">You can toggle this during play</p>
          </div>
        </label>
      </div>

      {/* Player Count */}
      <div className={cn('card space-y-4 transition-opacity duration-300', isCovered('playerCount') && 'opacity-30')}>
        <div className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">Players</h2>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleManualConfig({ playerCount: Math.max(minPlayers, config.playerCount - 1) })}
            disabled={effectivePlayerCount <= minPlayers}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-background-tertiary border border-border text-muted-foreground hover:text-white hover:border-gold/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-3xl font-bold text-gold w-12 text-center">
            {effectivePlayerCount}
          </span>
          <button
            onClick={() => handleManualConfig({ playerCount: Math.min(8, config.playerCount + 1) })}
            disabled={config.playerCount >= 8}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-background-tertiary border border-border text-muted-foreground hover:text-white hover:border-gold/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          You + {effectivePlayerCount - 1} AI opponent{effectivePlayerCount > 2 ? 's' : ''}
          {isTournament && effectivePlayerCount < 3 && (
            <span className="text-yellow-400 ml-1">(min 3 for tournament)</span>
          )}
        </p>
      </div>

      {/* Blinds — hidden for tournament (comes from schedule) */}
      {!isTournament && (
        <div className={cn('card space-y-4 transition-opacity duration-300', isCovered('smallBlind', 'bigBlind') && 'opacity-30')}>
          <div className="flex items-center gap-2 text-white">
            <Coins className="w-5 h-5 text-gold" />
            <h2 className="font-semibold">Blinds</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BLIND_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleBlindPreset(preset.small, preset.big)}
                className={cn(
                  'py-3 px-3 rounded-lg border-2 font-medium transition-all text-sm',
                  !customBlinds && config.bigBlind === preset.big && config.smallBlind === preset.small
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border bg-background-tertiary text-muted-foreground hover:border-border-light hover:text-white'
                )}
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setCustomBlinds(true)}
              className={cn(
                'py-3 px-3 rounded-lg border-2 font-medium transition-all text-sm',
                customBlinds
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-background-tertiary text-muted-foreground hover:border-border-light hover:text-white'
              )}
            >
              Custom
            </button>
          </div>

          {customBlinds && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">SB</label>
                <input
                  type="number"
                  min={1}
                  value={customSb}
                  onChange={(e) => setCustomSb(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-background-tertiary border border-border rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">BB</label>
                <input
                  type="number"
                  min={1}
                  value={customBb}
                  onChange={(e) => setCustomBb(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-background-tertiary border border-border rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <button
                onClick={handleCustomBlindsApply}
                className="btn-primary px-4 py-2 text-sm mt-4"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tournament Speed + Blind Schedule */}
      {isTournament && (
        <div className={cn('card space-y-4 transition-opacity duration-300', isCovered('handsPerLevel') && 'opacity-30')}>
          <div className="flex items-center gap-2 text-white">
            <Coins className="w-5 h-5 text-gold" />
            <h2 className="font-semibold">Tournament Speed</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed.value}
                onClick={() => handleManualConfig({ handsPerLevel: speed.handsPerLevel })}
                className={cn(
                  'py-3 px-3 rounded-lg border-2 font-medium transition-all text-sm',
                  config.handsPerLevel === speed.handsPerLevel
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border bg-background-tertiary text-muted-foreground hover:border-border-light hover:text-white'
                )}
              >
                <div>{speed.label}</div>
                <div className="text-[10px] opacity-60">{speed.handsPerLevel} hands/level</div>
              </button>
            ))}
          </div>

          {/* Collapsible blind schedule preview */}
          <button
            onClick={() => setShowBlindSchedule(!showBlindSchedule)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
          >
            {showBlindSchedule ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Blind schedule ({BLIND_SCHEDULE.length} levels)
          </button>

          {showBlindSchedule && (
            <div className="bg-background-tertiary rounded-lg p-3 text-xs">
              <div className="grid grid-cols-4 gap-1 text-muted-foreground font-medium mb-1">
                <span>Level</span><span>SB</span><span>BB</span><span>Ante</span>
              </div>
              {BLIND_SCHEDULE.map((level, i) => (
                <div key={i} className="grid grid-cols-4 gap-1 text-gray-300 py-0.5">
                  <span className="text-muted-foreground">{i + 1}</span>
                  <span>${level.smallBlind}</span>
                  <span>${level.bigBlind}</span>
                  <span>{level.ante > 0 ? `$${level.ante}` : '-'}</span>
                </div>
              ))}
              <p className="text-muted-foreground mt-2">
                ~{BLIND_SCHEDULE.length * (currentSpeed?.handsPerLevel || 8)} hands total
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stack Size */}
      <div className={cn('card space-y-4 transition-opacity duration-300', isCovered('startingChips') && 'opacity-30')}>
        <div className="flex items-center gap-2 text-white">
          <Layers className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">{isTournament ? 'Buy-in' : 'Stack Size'}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {STACK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleStackPreset(preset.multiplier)}
              className={cn(
                'py-3 px-4 rounded-lg border-2 font-medium transition-all',
                currentStackBb === preset.multiplier
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-background-tertiary text-muted-foreground hover:border-border-light hover:text-white'
              )}
            >
              <div>{preset.label}</div>
              <div className="text-xs opacity-60">${preset.multiplier * config.bigBlind}</div>
            </button>
          ))}
        </div>
        {!isPresetStack && (
          <p className="text-xs text-muted-foreground">
            Custom: {currentStackBb}bb (${config.startingChips})
          </p>
        )}
      </div>

      {/* Cash Game Options */}
      {isCashGame && (
        <div className={cn('card space-y-4 transition-opacity duration-300', isCovered('rebuyEnabled') && 'opacity-30')}>
          <h2 className="font-semibold text-white">Cash Game Options</h2>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={config.rebuyEnabled}
              onChange={(e) => handleManualConfig({ rebuyEnabled: e.target.checked })}
              className="w-4 h-4 rounded border-border bg-background-tertiary accent-gold"
            />
            <span className="text-sm text-white group-hover:text-gold transition-colors">
              Allow rebuys when busted
            </span>
          </label>
        </div>
      )}

      {/* Difficulty */}
      <div className={cn('card space-y-4 transition-opacity duration-300', isCovered('difficulty') && 'opacity-30')}>
        <div className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">AI Difficulty</h2>
        </div>
        <div className="space-y-3">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              onClick={() => handleManualConfig({ difficulty: diff.value })}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left',
                config.difficulty === diff.value
                  ? diff.color
                  : 'border-border bg-background-tertiary text-muted-foreground hover:border-border-light'
              )}
            >
              <div className="flex-1">
                <div className="font-medium">{diff.label}</div>
                <div className="text-sm opacity-70">{diff.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      {selectedSpotId && (
        <p className="text-center text-sm text-gold animate-pulse -mb-4">
          Settings ready — hit Deal Me In!
        </p>
      )}
      <button
        onClick={() => {
          // Enforce min players before starting
          if (isTournament && config.playerCount < 3) {
            handleManualConfig({ playerCount: 3 });
          }
          onStart();
        }}
        className={cn(
          'w-full py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-gold/90 to-yellow-500/90 text-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-wide',
          selectedSpotId
            ? 'shadow-gold/40 ring-2 ring-gold/50 ring-offset-2 ring-offset-background'
            : 'shadow-gold/20 hover:shadow-gold/40'
        )}
      >
        Deal Me In
      </button>
    </div>
  );
}
