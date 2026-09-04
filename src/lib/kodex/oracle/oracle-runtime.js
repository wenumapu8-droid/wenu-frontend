import { oracleCue } from './oracle-script.js';

export const ORACLE_STATES = Object.freeze([
  'DORMANT',
  'AWARE',
  'ADDRESS',
  'REVEAL',
  'WITNESS',
  'ANOMALY',
  'RETURN',
]);

const ALLOWED_EVENTS = new Set(['EXPLICIT_ENTER', 'SCENE_DWELL']);

/**
 * Pure, bounded resolver. It does not read/write storage, navigate, score,
 * infer personal meaning, or promote epistemic status.
 */
export function resolveOracleCue({ scene, event, visitorEntered = false } = {}) {
  if (!scene || !ALLOWED_EVENTS.has(event)) return null;
  if (event === 'SCENE_DWELL' && !visitorEntered) return null;
  return oracleCue(scene, event);
}

export function oracleStateForCue(cue) {
  return cue?.state && ORACLE_STATES.includes(cue.state) ? cue.state : 'DORMANT';
}

export function oracleContextSnapshot({ scene, visitorEntered = false, routeEvidence = [] } = {}) {
  return Object.freeze({
    scene: String(scene || 'unknown'),
    visitorEntered: Boolean(visitorEntered),
    recordedRouteCount: Array.isArray(routeEvidence) ? routeEvidence.filter(Boolean).length : 0,
  });
}
