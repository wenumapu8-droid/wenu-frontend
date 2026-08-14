export const MANIFESTATION_ENGINE_VERSION = 'manifestation-state-v0.1.0';

export const MANIFESTATION_PHASES = Object.freeze([
  'POTENTIAL', 'SIGNAL', 'INTERFERENCE', 'TRANSFORMING', 'REALIZED', 'TRACE',
]);

export const MANIFESTATION_BLOCKER_TYPES = Object.freeze([
  'DEPENDENCY', 'MISSING_EVIDENCE', 'RIGHTS_GATE', 'CULTURAL_GATE',
  'UNRESOLVED_RELATION', 'RUNTIME_GATE', 'CREATOR_ACCEPTANCE',
  'SOURCE_MISSING', 'CONTRADICTION',
]);

export const MANIFESTATION_VISUAL_MAP = Object.freeze({
  POTENTIAL: 'source-chamber',
  SIGNAL: 'signal-core',
  INTERFERENCE: 'interference-portal',
  TRANSFORMING: 'signal-vortex',
  REALIZED: 'living-organism',
  TRACE: 'memory-tree',
});

const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));
const clean = value => String(value || '').trim();

function normalizePhase(value) {
  const phase = clean(value).toUpperCase();
  return MANIFESTATION_PHASES.includes(phase) ? phase : 'POTENTIAL';
}

function normalizeBlocker(input = {}) {
  const type = clean(input.type).toUpperCase();
  const id = clean(input.id);
  if (!MANIFESTATION_BLOCKER_TYPES.includes(type)) throw new TypeError(`Unsupported blocker type: ${type || '(empty)'}`);
  if (!id) throw new TypeError('Blocker requires a stable id.');
  return Object.freeze({
    id,
    type,
    label: clean(input.label) || id,
    severity: clamp01(input.severity ?? 1),
    sourceRef: clean(input.sourceRef) || null,
    resolved: Boolean(input.resolved),
  });
}

function normalizeBlockers(values = []) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const blocker = normalizeBlocker(value);
    if (seen.has(blocker.id)) continue;
    seen.add(blocker.id);
    out.push(blocker);
  }
  return out;
}

export function summarizeInterference(blockersInput = []) {
  const blockers = normalizeBlockers(blockersInput);
  const unresolved = blockers.filter(blocker => !blocker.resolved);
  const causalLoad = unresolved.length
    ? Number((unresolved.reduce((sum, blocker) => sum + blocker.severity, 0) / unresolved.length).toFixed(4))
    : 0;
  return Object.freeze({
    blockerCount: blockers.length,
    unresolvedCount: unresolved.length,
    resolvedCount: blockers.length - unresolved.length,
    causalLoad,
    blocked: unresolved.length > 0,
    unresolvedIds: Object.freeze(unresolved.map(blocker => blocker.id)),
  });
}

export function createManifestationState(input = {}) {
  const phase = normalizePhase(input.phase);
  return {
    version: MANIFESTATION_ENGINE_VERSION,
    intentId: clean(input.intentId) || null,
    intent: clean(input.intent) || null,
    nodeId: clean(input.nodeId) || null,
    phase,
    signalEmitted: Boolean(input.signalEmitted),
    blockers: normalizeBlockers(input.blockers || []),
    startedAt: Number.isFinite(input.startedAt) ? input.startedAt : null,
    realizedAt: Number.isFinite(input.realizedAt) ? input.realizedAt : null,
    trace: Array.isArray(input.trace) ? [...input.trace] : [],
    visualSpecimenId: MANIFESTATION_VISUAL_MAP[phase],
  };
}

function derive(stateInput) {
  const state = createManifestationState(stateInput);
  return { ...state, interference: summarizeInterference(state.blockers) };
}

function addTrace(state, kind, detail = {}) {
  return [...state.trace, Object.freeze({ kind, phase: state.phase, ...detail })];
}

export function reduceManifestationState(stateInput = {}, event = {}) {
  const state = derive(stateInput);
  const type = clean(event.type).toUpperCase();

  if (type === 'DECLARE_INTENT') {
    const intentId = clean(event.intentId);
    const intent = clean(event.intent);
    if (!intentId || !intent) return state;
    const next = {
      ...state,
      intentId,
      intent,
      nodeId: clean(event.nodeId) || state.nodeId,
      phase: 'POTENTIAL',
      signalEmitted: false,
      blockers: [],
      startedAt: Number.isFinite(event.at) ? event.at : null,
      realizedAt: null,
    };
    next.trace = addTrace(next, 'DECLARE_INTENT', { intentId });
    return derive(next);
  }

  if (type === 'EMIT_SIGNAL') {
    if (!state.intentId) return state;
    const next = { ...state, signalEmitted: true, phase: state.interference.blocked ? 'INTERFERENCE' : 'SIGNAL' };
    next.trace = addTrace(next, 'EMIT_SIGNAL');
    return derive(next);
  }

  if (type === 'ADD_BLOCKER') {
    const blocker = normalizeBlocker(event.blocker);
    const next = {
      ...state,
      blockers: [...state.blockers.filter(item => item.id !== blocker.id), blocker],
      phase: state.signalEmitted ? 'INTERFERENCE' : 'POTENTIAL',
    };
    next.trace = addTrace(next, 'ADD_BLOCKER', { blockerId: blocker.id, blockerType: blocker.type });
    return derive(next);
  }

  if (type === 'RESOLVE_BLOCKER') {
    const blockerId = clean(event.blockerId);
    if (!blockerId) return state;
    const blockers = state.blockers.map(blocker => blocker.id === blockerId ? Object.freeze({ ...blocker, resolved: true }) : blocker);
    const interference = summarizeInterference(blockers);
    const next = { ...state, blockers, phase: interference.blocked ? 'INTERFERENCE' : (state.signalEmitted ? 'SIGNAL' : 'POTENTIAL') };
    next.trace = addTrace(next, 'RESOLVE_BLOCKER', { blockerId });
    return derive(next);
  }

  if (type === 'BEGIN_TRANSFORMATION') {
    if (!state.intentId || !state.signalEmitted || state.interference.blocked) return state;
    const next = { ...state, phase: 'TRANSFORMING' };
    next.trace = addTrace(next, 'BEGIN_TRANSFORMATION');
    return derive(next);
  }

  if (type === 'REALIZE') {
    if (state.phase !== 'TRANSFORMING' || state.interference.blocked) return state;
    const at = Number.isFinite(event.at) ? event.at : null;
    const elapsed = Number.isFinite(state.startedAt) && Number.isFinite(at) ? Math.max(0, Math.round(at - state.startedAt)) : null;
    const next = { ...state, phase: 'REALIZED', realizedAt: at };
    next.trace = addTrace(next, 'REALIZE', { observedElapsedMs: elapsed });
    return derive(next);
  }

  if (type === 'WRITE_TRACE') {
    if (!['REALIZED', 'TRACE'].includes(state.phase)) return state;
    const next = { ...state, phase: 'TRACE' };
    next.trace = addTrace(next, 'WRITE_TRACE', {
      routeSignature: clean(event.routeSignature) || null,
      memoryRef: clean(event.memoryRef) || null,
    });
    return derive(next);
  }

  if (type === 'RESET') return derive({ nodeId: state.nodeId });
  return state;
}

export function buildManifestationView(stateInput = {}) {
  const state = derive(stateInput);
  return Object.freeze({
    version: state.version,
    intentId: state.intentId,
    nodeId: state.nodeId,
    phase: state.phase,
    visualSpecimenId: MANIFESTATION_VISUAL_MAP[state.phase],
    blockerCount: state.interference.blockerCount,
    unresolvedBlockerCount: state.interference.unresolvedCount,
    causalLoad: state.interference.causalLoad,
    blocked: state.interference.blocked,
    canTransform: Boolean(state.intentId && state.signalEmitted && !state.interference.blocked),
    realized: state.phase === 'REALIZED' || state.phase === 'TRACE',
    traced: state.phase === 'TRACE',
  });
}
