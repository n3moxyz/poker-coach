import { useEffect, useCallback, useRef } from 'react';

type HotkeyCallback = () => void;
type HotkeyConfig = {
  key: string;
  callback: HotkeyCallback;
  enabled?: boolean;
  // Modifiers
  ctrl?: boolean;
  meta?: boolean; // Cmd on Mac
  shift?: boolean;
  alt?: boolean;
};

/**
 * Hook for registering keyboard shortcuts
 * Following Vercel React best practices for event listener management
 */
export function useHotkeys(hotkeys: HotkeyConfig[]) {
  // Store callbacks in ref to avoid re-registering listeners
  const callbacksRef = useRef<Map<string, HotkeyConfig>>(new Map());

  // Update callbacks ref when hotkeys change
  useEffect(() => {
    callbacksRef.current.clear();
    hotkeys.forEach((config) => {
      if (config.enabled !== false) {
        const keyId = getKeyId(config);
        callbacksRef.current.set(keyId, config);
      }
    });
  }, [hotkeys]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Build key identifier from event
      const keyId = getKeyIdFromEvent(e);
      const config = callbacksRef.current.get(keyId);

      if (config) {
        e.preventDefault();
        config.callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

function getKeyId(config: HotkeyConfig): string {
  const parts: string[] = [];
  if (config.ctrl) parts.push('ctrl');
  if (config.meta) parts.push('meta');
  if (config.shift) parts.push('shift');
  if (config.alt) parts.push('alt');
  parts.push(config.key.toLowerCase());
  return parts.join('+');
}

function getKeyIdFromEvent(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('ctrl');
  if (e.metaKey) parts.push('meta');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');
  parts.push(e.key.toLowerCase());
  return parts.join('+');
}

/**
 * Simplified hook for single hotkey
 */
export function useHotkey(
  key: string,
  callback: HotkeyCallback,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, enabled]);
}
