/**
 * Web Worker wrapper for Monte Carlo equity simulation.
 * Receives EquityRequest messages, runs simulation, posts results back.
 */

import { simulate } from './equityEngine';

export interface EquityRequest {
  type: 'calculate';
  id: string;
  heroCards: string[];
  communityCards: string[];
  numOpponents: number;
  iterations: number;
}

export interface EquityCancelRequest {
  type: 'cancel';
  id: string;
}

export interface EquityResult {
  type: 'result';
  id: string;
  equity: number;
  durationMs: number;
}

type WorkerMessage = EquityRequest | EquityCancelRequest;

let cancelledIds = new Set<string>();

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  if (msg.type === 'cancel') {
    cancelledIds.add(msg.id);
    return;
  }

  if (msg.type === 'calculate') {
    // Check if already cancelled before starting
    if (cancelledIds.has(msg.id)) {
      cancelledIds.delete(msg.id);
      return;
    }

    const start = performance.now();
    const equity = simulate(
      msg.heroCards,
      msg.communityCards,
      msg.numOpponents,
      msg.iterations
    );
    const durationMs = performance.now() - start;

    // Don't post result if cancelled during computation
    if (cancelledIds.has(msg.id)) {
      cancelledIds.delete(msg.id);
      return;
    }

    const result: EquityResult = {
      type: 'result',
      id: msg.id,
      equity,
      durationMs,
    };

    self.postMessage(result);
  }
};
