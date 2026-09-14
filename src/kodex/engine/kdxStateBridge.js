export const KDX_SCENE_STATE_TO_WORLD_PHASE = Object.freeze({
  idle: 'E00',
  aware: 'T01',
  locked: 'T01',
  active: 'M11',
  transitionOut: 'R10',
});

export function sceneStateToWorldPhase(state) {
  const key = String(state || '').trim();
  return KDX_SCENE_STATE_TO_WORLD_PHASE[key] || null;
}

/**
 * Stateless adapter only. It does not own scene state and does not advance it.
 * The existing scene state machine remains authoritative; this bridge merely
 * translates an observed state into the existing KodexWorld phase vocabulary.
 */
export function createKdxSceneStateBridge() {
  return Object.freeze({
    reduce(event = {}) {
      if (event.type !== 'SCENE_STATE') return Object.freeze({ accepted: false, reason: 'UNSUPPORTED_EVENT' });
      const rendererPhase = sceneStateToWorldPhase(event.state);
      if (!rendererPhase) return Object.freeze({ accepted: false, reason: 'UNKNOWN_SCENE_STATE' });
      return Object.freeze({
        accepted: true,
        sceneState: event.state,
        rendererPhase,
        ownsState: false,
      });
    },
  });
}
