import { useState, useEffect, useRef, useMemo } from 'react';
import type { EquityResult } from '@/lib/equity.worker';

let requestId = 0;
function nextId(): string {
  return `eq-${++requestId}`;
}

function createWorker(): Worker {
  return new Worker(
    new URL('../lib/equity.worker.ts', import.meta.url),
    { type: 'module' }
  );
}

/**
 * Single equity calculation. Recalculates when inputs change.
 */
export function useEquity(
  heroCards: string[] | undefined,
  communityCards: string[] | undefined,
  numOpponents: number,
  enabled = true
): { equity: number | null; isComputing: boolean } {
  const [equity, setEquity] = useState<number | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const currentIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !heroCards || heroCards.length !== 2 || numOpponents < 1) {
      setEquity(null);
      setIsComputing(false);
      return;
    }

    // Lazily create worker
    if (!workerRef.current) {
      workerRef.current = createWorker();
      workerRef.current.onmessage = (e: MessageEvent<EquityResult>) => {
        if (e.data.type === 'result' && e.data.id === currentIdRef.current) {
          setEquity(e.data.equity);
          setIsComputing(false);
        }
      };
    }

    // Cancel previous request
    if (currentIdRef.current) {
      workerRef.current.postMessage({ type: 'cancel', id: currentIdRef.current });
    }

    const id = nextId();
    currentIdRef.current = id;
    setIsComputing(true);
    setEquity(null);

    const board = communityCards || [];
    const iterations = board.length === 0 ? 10000 : 7000;

    workerRef.current.postMessage({
      type: 'calculate',
      id,
      heroCards,
      communityCards: board,
      numOpponents,
      iterations,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    heroCards?.[0], heroCards?.[1],
    communityCards?.join(','),
    numOpponents,
  ]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return { equity, isComputing };
}

interface StreetEquities {
  preflop: number | null;
  flop: number | null;
  turn: number | null;
  river: number | null;
}

/**
 * Batch equity computation for all streets (HandSummary use case).
 * Computes equity at preflop, flop, turn, and river board states.
 */
export function useStreetEquities(
  heroCards: string[] | undefined,
  allCommunityCards: string[] | undefined,
  numOpponents: number,
  enabled = true
): { equities: StreetEquities; isComputing: boolean } {
  const [equities, setEquities] = useState<StreetEquities>({
    preflop: null, flop: null, turn: null, river: null,
  });
  const [isComputing, setIsComputing] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef(new Set<string>());
  const batchIdRef = useRef(0);

  // Build the 4 board states
  const boards = useMemo(() => {
    if (!allCommunityCards) return null;
    return {
      preflop: [] as string[],
      flop: allCommunityCards.length >= 3 ? allCommunityCards.slice(0, 3) : null,
      turn: allCommunityCards.length >= 4 ? allCommunityCards.slice(0, 4) : null,
      river: allCommunityCards.length >= 5 ? allCommunityCards.slice(0, 5) : null,
    };
  }, [allCommunityCards?.join(',')]);

  useEffect(() => {
    if (!enabled || !heroCards || heroCards.length !== 2 || !boards || numOpponents < 1) {
      setEquities({ preflop: null, flop: null, turn: null, river: null });
      setIsComputing(false);
      return;
    }

    // Lazily create worker
    if (!workerRef.current) {
      workerRef.current = createWorker();
    }

    // Cancel any pending requests
    for (const id of pendingRef.current) {
      workerRef.current.postMessage({ type: 'cancel', id });
    }
    pendingRef.current.clear();

    const batch = ++batchIdRef.current;
    const results: Partial<StreetEquities> = {};
    const streets = ['preflop', 'flop', 'turn', 'river'] as const;
    const ids = new Map<string, typeof streets[number]>();

    setIsComputing(true);
    setEquities({ preflop: null, flop: null, turn: null, river: null });

    workerRef.current.onmessage = (e: MessageEvent<EquityResult>) => {
      if (e.data.type !== 'result') return;
      const street = ids.get(e.data.id);
      if (!street || batch !== batchIdRef.current) return;

      pendingRef.current.delete(e.data.id);
      results[street] = e.data.equity;

      setEquities((prev) => ({ ...prev, [street]: e.data.equity }));

      if (pendingRef.current.size === 0) {
        setIsComputing(false);
      }
    };

    for (const street of streets) {
      const board = boards[street];
      if (board === null) continue; // hand didn't reach this street

      const id = nextId();
      ids.set(id, street);
      pendingRef.current.add(id);

      const iterations = street === 'preflop' ? 10000 : 7000;

      workerRef.current.postMessage({
        type: 'calculate',
        id,
        heroCards,
        communityCards: board,
        numOpponents,
        iterations,
      });
    }

    if (pendingRef.current.size === 0) {
      setIsComputing(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    heroCards?.[0], heroCards?.[1],
    boards,
    numOpponents,
  ]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return { equities, isComputing };
}
