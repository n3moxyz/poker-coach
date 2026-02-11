import { useState } from 'react';
import Users from 'lucide-react/dist/esm/icons/users';
import Coins from 'lucide-react/dist/esm/icons/coins';
import Brain from 'lucide-react/dist/esm/icons/brain';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Minus from 'lucide-react/dist/esm/icons/minus';
import Plus from 'lucide-react/dist/esm/icons/plus';
import { cn } from '@/lib/utils';
import { type AIDifficulty } from '@/lib/aiOpponents';
import { type GameConfig } from '@/stores/gameStore';

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

export default function GameSetup({ config, onUpdateConfig, onStart }: GameSetupProps) {
  const [customBlinds, setCustomBlinds] = useState(false);
  const [customSb, setCustomSb] = useState(config.smallBlind);
  const [customBb, setCustomBb] = useState(config.bigBlind);

  const currentStackBb = Math.round(config.startingChips / config.bigBlind);
  const isPresetStack = STACK_PRESETS.some((p) => p.multiplier === currentStackBb);

  const handleBlindPreset = (small: number, big: number) => {
    setCustomBlinds(false);
    // Auto-update stack to maintain the same bb multiple
    onUpdateConfig({
      smallBlind: small,
      bigBlind: big,
      startingChips: currentStackBb * big,
    });
  };

  const handleCustomBlindsApply = () => {
    if (customSb > 0 && customBb > 0 && customBb >= customSb) {
      onUpdateConfig({
        smallBlind: customSb,
        bigBlind: customBb,
        startingChips: currentStackBb * customBb,
      });
    }
  };

  const handleStackPreset = (multiplier: number) => {
    onUpdateConfig({ startingChips: multiplier * config.bigBlind });
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Play vs AI</h1>
        <p className="text-muted-foreground">Set up your table and start playing</p>
      </div>

      {/* Player Count */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">Players</h2>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => onUpdateConfig({ playerCount: Math.max(2, config.playerCount - 1) })}
            disabled={config.playerCount <= 2}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-background-tertiary border border-border text-muted-foreground hover:text-white hover:border-gold/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-3xl font-bold text-gold w-12 text-center">
            {config.playerCount}
          </span>
          <button
            onClick={() => onUpdateConfig({ playerCount: Math.min(8, config.playerCount + 1) })}
            disabled={config.playerCount >= 8}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-background-tertiary border border-border text-muted-foreground hover:text-white hover:border-gold/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          You + {config.playerCount - 1} AI opponent{config.playerCount > 2 ? 's' : ''}
        </p>
      </div>

      {/* Blinds */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Coins className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">Blinds</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
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

      {/* Stack Size */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Layers className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">Stack Size</h2>
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

      {/* Difficulty */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 text-gold" />
          <h2 className="font-semibold">AI Difficulty</h2>
        </div>
        <div className="space-y-3">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff.value}
              onClick={() => onUpdateConfig({ difficulty: diff.value })}
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
      <button
        onClick={onStart}
        className="w-full py-5 text-xl font-bold rounded-xl bg-gradient-to-r from-gold/90 to-yellow-500/90 text-black shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 tracking-wide"
      >
        Deal Me In
      </button>
    </div>
  );
}
