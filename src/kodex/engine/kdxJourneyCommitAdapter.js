export const KDX_ORGANISM_ACTION_EVENT = 'kodex:organism-action';

function validateAction(action = {}) {
  if (!action.id || !action.presetId || !action.family || !action.action || !Array.isArray(action.memoryWrites)) {
    throw new TypeError('KDX Journey commit requires a complete existing organism-action payload.');
  }
  return action;
}

/**
 * Adapter only: no storage, no reducer, no persistence policy.
 * It forwards explicit commits into the existing `kodex:organism-action`
 * event authority consumed by the current Journey memory bridge.
 */
export function createKdxJourneyCommitAdapter({ dispatch } = {}) {
  if (typeof dispatch !== 'function') throw new TypeError('KDX Journey adapter requires dispatch(detail).');
  return Object.freeze({
    commit(event = {}) {
      if (event.explicitCommit !== true) throw new TypeError('KDX Journey commit requires explicitCommit: true.');
      const action = validateAction(event.action);
      dispatch(action);
      return Object.freeze({ accepted: true, actionId: action.id, writeCount: action.memoryWrites.length });
    },
  });
}

export function createBrowserKdxJourneyCommitAdapter(target = globalThis.document) {
  if (!target?.dispatchEvent) throw new TypeError('Browser KDX Journey adapter requires an EventTarget.');
  if (typeof globalThis.CustomEvent !== 'function') throw new TypeError('CustomEvent is unavailable in this environment.');
  return createKdxJourneyCommitAdapter({
    dispatch(detail) {
      target.dispatchEvent(new CustomEvent(KDX_ORGANISM_ACTION_EVENT, { detail }));
    },
  });
}
