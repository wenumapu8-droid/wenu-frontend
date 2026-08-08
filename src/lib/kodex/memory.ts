/**
 * src/lib/kodex/memory.ts — Typed Transition Memory Store.
 * 
 * Records transitions between scene states (priorState -> resultingState, dwell, returnCount).
 * Uses localStorage with a ceiling of 256 events max.
 * Wraps src/kodex/return/memory.js to preserve compatibility with the RETURN sequence.
 */

import { record as recordLegacyMemory, readSpecimen } from '../../kodex/return/memory.js';

export interface MemoryEvent {
  timestamp: number;
  priorState: string;
  resultingState: string;
  dwell: number;        // seconds spent in priorState
  returnCount: number;  // current visit count for this scene
}

const TRANSITIONS_KEY = 'kx-transition-memory';
const MAX_EVENTS_CEILING = 256;

interface SessionActiveState {
  sceneId: string;
  enterTime: number;
}

let activeSession: SessionActiveState | null = null;
let cachedReturnCounts: Record<string, number> | null = null;

function getStoredEvents(): MemoryEvent[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(TRANSITIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveEvents(events: MemoryEvent[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    // Ceiling of 256 events max
    const trimmed = events.length > MAX_EVENTS_CEILING
      ? events.slice(events.length - MAX_EVENTS_CEILING)
      : events;
    localStorage.setItem(TRANSITIONS_KEY, JSON.stringify(trimmed));
  } catch (e) {}
}

export function enterScene(sceneId: string): void {
  const now = Date.now();

  if (activeSession && activeSession.sceneId !== sceneId) {
    leaveScene(sceneId);
  }

  activeSession = {
    sceneId,
    enterTime: now,
  };

  // Legacy memory hook
  try {
    recordLegacyMemory({ type: 'view', work: sceneId });
  } catch (e) {}
}

export function leaveScene(nextSceneId: string = 'idle'): void {
  if (!activeSession) return;

  const now = Date.now();
  const dwellSeconds = Number(((now - activeSession.enterTime) / 1000).toFixed(2));
  const priorState = activeSession.sceneId;

  const events = getStoredEvents();

  // Calculate return count for priorState
  const priorReturnCount = events.filter(e => e.resultingState === priorState).length + 1;

  const newEvent: MemoryEvent = {
    timestamp: now,
    priorState,
    resultingState: nextSceneId,
    dwell: dwellSeconds,
    returnCount: priorReturnCount,
  };

  events.push(newEvent);
  saveEvents(events);

  activeSession = null;
}

/**
 * Derives normalized memory weight (0..1) based on event density and dwell history.
 */
export function memoryWeight(): number {
  const events = getStoredEvents();
  if (events.length === 0) return 0;

  const totalDwell = events.reduce((acc, e) => acc + e.dwell, 0);
  const transitionFactor = Math.min(1, events.length / 50);
  const dwellFactor = Math.min(1, totalDwell / 300);

  const rawWeight = transitionFactor * 0.5 + dwellFactor * 0.5;
  return Number(rawWeight.toFixed(3));
}

export function getEvents(): MemoryEvent[] {
  return getStoredEvents();
}

export function forget(): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(TRANSITIONS_KEY);
      localStorage.removeItem('kx-journey');
    } catch (e) {}
  }
  activeSession = null;
}

export { readSpecimen };
