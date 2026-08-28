export const GESTURE_TIMELINE_VERSION = 'gesture-timeline-v0.1.0';

// Canon reference: 38_KODEX_GESTURE_TIMELINE_NAVIGATION, section 5 (phase model).
// This bounded slice only needs the pre-commit portion of the five-phase
// model (DORMANT/AWARE/OPEN); TRANSFORMING/THRESHOLD belong to a future
// crossing-animation slice and are intentionally not implemented here.
export const GESTURE_PHASE_BOUNDS = Object.freeze({
  DORMANT: 0,
  AWARE: 0.15,
  OPEN: 0.45,
});

export const GESTURE_PHASES = Object.freeze(['dormant', 'aware', 'open']);

export function clampSceneProgress(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

// Canonical rule (doc 38, section 9): gesture may REVEAL routes but must
// never CHOOSE one. This resolver only maps progress -> a named phase; it
// never selects, filters or scores routes.
export function resolveGesturePhase(progress) {
  const clamped = clampSceneProgress(progress);
  if (clamped >= GESTURE_PHASE_BOUNDS.OPEN) return 'open';
  if (clamped >= GESTURE_PHASE_BOUNDS.AWARE) return 'aware';
  return 'dormant';
}

// Doc 38 section 11: raw wheel/touch deltas are ephemeral presentation
// state, not semantic memory, and should not drive the same reducer as
// route/history state. This accumulator stays local to the plate.
export function accumulateSceneProgress(currentProgress, rawDelta, { sensitivity = 0.0026 } = {}) {
  if (typeof rawDelta !== 'number' || Number.isNaN(rawDelta)) return clampSceneProgress(currentProgress);
  return clampSceneProgress(currentProgress + rawDelta * sensitivity);
}

// Doc 38 section 15 / Deep Navigation Engine section 14 (accessibility):
// reduced motion must reach the same semantic end-state without requiring
// simulated travel, so a reduced-motion visitor starts already OPEN.
export function initialSceneProgress({ reducedMotion = false } = {}) {
  return reducedMotion ? 1 : 0;
}
