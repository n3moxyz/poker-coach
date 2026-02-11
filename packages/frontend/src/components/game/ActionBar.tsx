import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import Minus from 'lucide-react/dist/esm/icons/minus';
import Plus from 'lucide-react/dist/esm/icons/plus';

interface ActionBarProps {
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  callAmount: number;
  minRaise: number;
  maxRaise: number;
  currentBet: number;
  pot: number;
  disabled: boolean;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onAllIn: () => void;
}

export default function ActionBar({
  canCheck,
  canCall,
  canRaise,
  callAmount,
  minRaise,
  maxRaise,
  currentBet,
  pot,
  disabled,
  onFold,
  onCheck,
  onCall,
  onRaise,
  onAllIn,
}: ActionBarProps) {
  const isBet = currentBet === 0;
  const raiseLabel = isBet ? 'Bet' : 'Raise';
  const [raiseAmount, setRaiseAmount] = useState(minRaise);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const step = 1;

  // Reset raise amount when minRaise changes
  useEffect(() => {
    setRaiseAmount(minRaise);
    setShowRaiseSlider(false);
    setIsEditingAmount(false);
  }, [minRaise]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingAmount && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingAmount]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case 'f':
          onFold();
          break;
        case 'c':
          if (canCheck) onCheck();
          else if (canCall) onCall();
          break;
        case 'r':
          if (canRaise) setShowRaiseSlider((s) => !s);
          break;
        case 'enter':
          if (showRaiseSlider && canRaise) {
            onRaise(raiseAmount);
            setShowRaiseSlider(false);
          }
          break;
        case 'escape':
          setShowRaiseSlider(false);
          break;
      }
    },
    [disabled, canCheck, canCall, canRaise, onFold, onCheck, onCall, onRaise, raiseAmount, showRaiseSlider]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleRaiseConfirm = () => {
    if (raiseAmount >= maxRaise) {
      onAllIn();
    } else {
      onRaise(raiseAmount);
    }
    setShowRaiseSlider(false);
  };

  const adjustAmount = (delta: number) => {
    const newVal = Math.min(maxRaise, Math.max(minRaise, raiseAmount + delta));
    setRaiseAmount(newVal);
  };

  const startEditing = () => {
    setEditValue(String(raiseAmount));
    setIsEditingAmount(true);
  };

  const commitEdit = () => {
    const val = Number(editValue);
    const clamped = Math.min(maxRaise, Math.max(minRaise, val || minRaise));
    setRaiseAmount(clamped);
    setIsEditingAmount(false);
  };

  // Preset raise amounts (pot-relative sizing)
  const potAfterCall = pot + callAmount;
  const potSizeRaises = [
    { label: 'Min', amount: minRaise },
    { label: '1/2 Pot', amount: Math.max(minRaise, Math.floor(currentBet + potAfterCall * 0.5)) },
    { label: 'Pot', amount: Math.max(minRaise, Math.floor(currentBet + potAfterCall)) },
    { label: 'All-In', amount: maxRaise },
  ].filter((p) => p.amount <= maxRaise);

  return (
    <div className="space-y-3">
      {/* Raise slider */}
      {showRaiseSlider && canRaise && (
        <div className="card bg-background-secondary space-y-3">
          {/* Slider row: "Raise to:" [slider] [-] $X [+] */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{raiseLabel} to:</span>
            <input
              type="range"
              min={minRaise}
              max={maxRaise}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="flex-1 accent-gold"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => adjustAmount(-step)}
                className="w-7 h-7 flex items-center justify-center rounded bg-background-tertiary border border-border text-muted-foreground hover:text-white hover:border-gold/50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {isEditingAmount ? (
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitEdit();
                    }
                    if (e.key === 'Escape') {
                      setIsEditingAmount(false);
                    }
                  }}
                  className="w-14 bg-background-tertiary border border-gold/50 rounded px-1 py-0.5 text-gold text-sm text-center font-bold"
                />
              ) : (
                <button
                  onClick={startEditing}
                  className="text-lg font-bold text-gold min-w-[3rem] text-center cursor-text hover:underline"
                >
                  ${raiseAmount}
                </button>
              )}

              <button
                onClick={() => adjustAmount(step)}
                className="w-7 h-7 flex items-center justify-center rounded bg-background-tertiary border border-border text-muted-foreground hover:text-white hover:border-gold/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex gap-2">
            {potSizeRaises.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setRaiseAmount(preset.amount)}
                className={cn(
                  'flex-1 py-1.5 text-xs rounded border transition-colors',
                  raiseAmount === preset.amount
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border bg-background-tertiary text-muted-foreground hover:text-white'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRaiseConfirm}
            className="w-full btn-primary py-2 font-medium"
          >
            {raiseLabel} to ${raiseAmount} [Enter]
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {/* Fold */}
        <button
          onClick={onFold}
          disabled={disabled}
          className={cn(
            'flex-1 py-3 rounded-lg font-semibold transition-all border-2',
            'bg-red-500/10 border-red-500/30 text-red-400',
            'hover:bg-red-500/20 hover:border-red-500/50',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
        >
          Fold
          <span className="block text-[10px] opacity-60">[F]</span>
        </button>

        {/* Check or Call */}
        {canCheck ? (
          <button
            onClick={onCheck}
            disabled={disabled}
            className={cn(
              'flex-1 py-3 rounded-lg font-semibold transition-all border-2',
              'bg-blue-500/10 border-blue-500/30 text-blue-400',
              'hover:bg-blue-500/20 hover:border-blue-500/50',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            Check
            <span className="block text-[10px] opacity-60">[C]</span>
          </button>
        ) : canCall ? (
          <button
            onClick={onCall}
            disabled={disabled}
            className={cn(
              'flex-1 py-3 rounded-lg font-semibold transition-all border-2',
              'bg-blue-500/10 border-blue-500/30 text-blue-400',
              'hover:bg-blue-500/20 hover:border-blue-500/50',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            Call ${callAmount}
            <span className="block text-[10px] opacity-60">[C]</span>
          </button>
        ) : null}

        {/* Raise */}
        {canRaise && (
          <button
            onClick={() => setShowRaiseSlider((s) => !s)}
            disabled={disabled}
            className={cn(
              'flex-1 py-3 rounded-lg font-semibold transition-all border-2',
              showRaiseSlider
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-green-500/10 border-green-500/30 text-green-400',
              'hover:bg-green-500/20 hover:border-green-500/50',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {raiseLabel}
            <span className="block text-[10px] opacity-60">[R]</span>
          </button>
        )}
      </div>
    </div>
  );
}
