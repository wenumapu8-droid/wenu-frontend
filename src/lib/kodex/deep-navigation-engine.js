/**
 * KODEX−∞ · DEEP NAVIGATION ENGINE
 *
 * Deterministic runtime primitives for inward / recursive navigation.
 * No DOM, storage, raw pointer/gaze telemetry, biometrics, engagement scoring,
 * psychological profiling, or auto-navigation belongs in this module.
 */

export const KODEX_LENS_ORDER = Object.freeze([
  'MICROSCOPE', 'MAGNIFIER', 'NAKED_EYE', 'SYSTEM',
  'TELEPHOTO', 'SATELLITE', 'TELESCOPE', 'META',
]);

export const KODEX_LENSES = Object.freeze({
  MICROSCOPE: Object.freeze({ key: 'MICROSCOPE', rank: 0, scale: 'SUBSTRUCTURE', question: 'What is this made of?' }),
  MAGNIFIER: Object.freeze({ key: 'MAGNIFIER', rank: 1, scale: 'DETAIL', question: 'What detail becomes legible?' }),
  NAKED_EYE: Object.freeze({ key: 'NAKED_EYE', rank: 2, scale: 'OBJECT', question: 'What is the whole thing?' }),
  SYSTEM: Object.freeze({ key: 'SYSTEM', rank: 3, scale: 'SYSTEM', question: 'What does it interact with?' }),
  TELEPHOTO: Object.freeze({ key: 'TELEPHOTO', rank: 4, scale: 'RELATION', question: 'Which distant relation matters?' }),
  SATELLITE: Object.freeze({ key: 'SATELLITE', rank: 5, scale: 'TERRITORY', question: 'What larger pattern contains it?' }),
  TELESCOPE: Object.freeze({ key: 'TELESCOPE', rank: 6, scale: 'COSMOS', question: 'What large-scale field is it part of?' }),
  META: Object.freeze({ key: 'META', rank: 7, scale: 'OBSERVER_ROUTE', question: 'How has the act of observing shaped this route?' }),
});

export const OBSERVER_MODES = Object.freeze([
  'NEUTRAL', 'ANALYTIC', 'SYSTEMS', 'POETIC', 'ARCHIVAL', 'SPECULATIVE',
]);

export const ROUTE_ROLES = Object.freeze([
  'CONTINUITY', 'BRIDGE', 'ECHO', 'SERENDIPITY',
]);

const SCORE_WEIGHTS = Object.freeze({
  semanticAffinity: 0.23,
  narrativeCompatibility: 0.18,
  curatorWeight: 0.13,
  memoryResonance: 0.12,
  novelty: 0.12,
  crossFieldBridge: 0.08,
  unresolvedQuestion: 0.07,
  lensAffinity: 0.04,
  controlledRandomness: 0.03,
});

const SCORE_PENALTIES = Object.freeze({
  recentExposure: 0.20,
  repetition: 0.16,
  cognitiveLoad: 0.12,
  needsConfirmation: 0.18,
  unknownRights: 0.30,
  culturalReview: 0.30,
});

export const ROUTE_ALGORITHM_PROFILE = Object.freeze({
  version: 'route-slate-v1.1.0',
  status: 'HYPOTHESIS',
  weights: SCORE_WEIGHTS,
  penalties: SCORE_PENALTIES,
  roleOrder: ROUTE_ROLES,
});

export const DEEP_NAVIGATION_POLICY = Object.freeze({
  minChoices: 2,
  maxChoices: 5,
  defaultChoices: 4,
  recentWindow: 8,
  maxPerPrimaryField: 2,
  autoNavigate: false,
  prohibitedObjectives: Object.freeze([
    'time-on-site', 'compulsion', 'activity-score', 'spiritual-score', 'psychological-profile',
  ]),
});

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

export function hashSeed(input = '') {
  let h = 2166136261;
  for (const ch of String(input)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(seed) {
  let x = seed || 0x9e3779b9;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) / 0x100000000;
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function boundedList(values, limit) {
  const clean = unique(values);
  return clean.slice(Math.max(0, clean.length - limit));
}

function normalizeLens(lens) {
  return KODEX_LENSES[lens] ? lens : 'NAKED_EYE';
}

function normalizeMode(mode) {
  return OBSERVER_MODES.includes(mode) ? mode : 'NEUTRAL';
}

function normalizeRole(role) {
  const key = String(role || '').toUpperCase();
  return ROUTE_ROLES.includes(key) ? key : null;
}

export function createObserverState(input = {}) {
  return {
    lens: normalizeLens(input.lens),
    mode: normalizeMode(input.mode),
    depth: Math.max(0, Number.isFinite(input.depth) ? Math.floor(input.depth) : 0),
    currentNodeId: input.currentNodeId || null,
    previousNodeId: input.previousNodeId || null,
    currentFields: unique(input.currentFields || []),
    recentNodes: boundedList(input.recentNodes || [], DEEP_NAVIGATION_POLICY.recentWindow),
    visitCounts: { ...(input.visitCounts || {}) },
    fieldVisits: { ...(input.fieldVisits || {}) },
    memorySignals: unique(input.memorySignals || []),
    unresolvedQuestions: unique(input.unresolvedQuestions || []),
    activatedArtworks: unique(input.activatedArtworks || []),
    routeTrace: [...(input.routeTrace || [])],
    routeSignature: String(input.routeSignature || 'KDX-ORIGIN'),
  };
}

export function transitionLens(currentLens, direction) {
  const key = normalizeLens(currentLens);
  const rank = KODEX_LENSES[key].rank;
  if (KODEX_LENSES[direction]) return direction;
  if (direction === 'APPROACH') return KODEX_LENS_ORDER[Math.max(0, rank - 1)];
  if (direction === 'RECEDE') return KODEX_LENS_ORDER[Math.min(KODEX_LENS_ORDER.length - 1, rank + 1)];
  if (direction === 'META') return 'META';
  if (direction === 'RESET') return 'NAKED_EYE';
  return key;
}

function incrementMap(map, key) {
  if (!key) return map;
  return { ...map, [key]: (map[key] || 0) + 1 };
}

export function reduceObserverState(stateInput, event = {}) {
  const state = createObserverState(stateInput);
  const type = String(event.type || '').toUpperCase();

  switch (type) {
    case 'SET_LENS': return { ...state, lens: normalizeLens(event.lens) };
    case 'APPROACH': return { ...state, lens: transitionLens(state.lens, 'APPROACH'), depth: state.depth + 1 };
    case 'RECEDE': return { ...state, lens: transitionLens(state.lens, 'RECEDE'), depth: Math.max(0, state.depth - 1) };
    case 'SET_MODE': return { ...state, mode: normalizeMode(event.mode) };
    case 'VISIT_NODE': {
      const nodeId = event.nodeId || null;
      if (!nodeId) return state;
      const fields = unique(event.fields || []);
      let fieldVisits = { ...state.fieldVisits };
      for (const field of fields) fieldVisits = incrementMap(fieldVisits, field);
      const routeTrace = [...state.routeTrace, { kind: 'VISIT_NODE', nodeId, lens: state.lens, mode: state.mode }];
      const routeSignature = `KDX-${hashSeed(`${state.routeSignature}:${nodeId}:${routeTrace.length}`).toString(36).toUpperCase()}`;
      return {
        ...state,
        previousNodeId: state.currentNodeId,
        currentNodeId: nodeId,
        currentFields: fields,
        recentNodes: boundedList([...state.recentNodes, nodeId], DEEP_NAVIGATION_POLICY.recentWindow),
        visitCounts: incrementMap(state.visitCounts, nodeId),
        fieldVisits,
        routeTrace,
        routeSignature,
      };
    }
    case 'CHOOSE_ROUTE':
      if (!event.nodeId) return state;
      return {
        ...state,
        memorySignals: unique([...state.memorySignals, `route:${event.nodeId}`]),
        routeTrace: [...state.routeTrace, { kind: 'CHOOSE_ROUTE', nodeId: event.nodeId, role: normalizeRole(event.role) }],
      };
    case 'ACTIVATE_ART':
      if (!event.artworkId) return state;
      return {
        ...state,
        activatedArtworks: unique([...state.activatedArtworks, event.artworkId]),
        memorySignals: unique([...state.memorySignals, `art:${event.artworkId}`]),
        routeTrace: [...state.routeTrace, { kind: 'ACTIVATE_ART', artworkId: event.artworkId }],
      };
    case 'OPEN_QUESTION':
      if (!event.questionId) return state;
      return { ...state, unresolvedQuestions: unique([...state.unresolvedQuestions, event.questionId]) };
    case 'RESOLVE_QUESTION':
      if (!event.questionId) return state;
      return {
        ...state,
        unresolvedQuestions: state.unresolvedQuestions.filter((id) => id !== event.questionId),
        memorySignals: unique([...state.memorySignals, `resolved:${event.questionId}`]),
      };
    default: return state;
  }
}

function representationDistance(a, b) {
  return Math.abs(KODEX_LENSES[normalizeLens(a)].rank - KODEX_LENSES[normalizeLens(b)].rank);
}

export function resolveNodeRepresentation(node, observerInput = {}) {
  const observer = createObserverState(observerInput);
  const representations = Array.isArray(node?.representations) ? node.representations : [];
  if (!representations.length) {
    return { nodeId: node?.id || null, requestedLens: observer.lens, representation: null, fallbackDistance: null, exact: false };
  }
  const eligible = representations
    .filter((item) => !item.mode || item.mode === observer.mode || item.mode === 'ANY')
    .map((item) => ({ ...item, lens: normalizeLens(item.lens), _distance: representationDistance(item.lens, observer.lens) }))
    .sort((a, b) => a._distance - b._distance || KODEX_LENSES[a.lens].rank - KODEX_LENSES[b.lens].rank);
  const chosen = eligible[0] || null;
  return {
    nodeId: node?.id || null,
    requestedLens: observer.lens,
    representation: chosen ? Object.fromEntries(Object.entries(chosen).filter(([key]) => key !== '_distance')) : null,
    fallbackDistance: chosen?._distance ?? null,
    exact: chosen?._distance === 0,
  };
}

function memoryRequirementSatisfied(requirement, observer) {
  if (!requirement) return true;
  if (observer.memorySignals.includes(requirement)) return true;
  if (requirement.startsWith('visited:')) return (observer.visitCounts[requirement.slice(8)] || 0) > 0;
  if (requirement.startsWith('field:')) return (observer.fieldVisits[requirement.slice(6)] || 0) > 0;
  if (requirement.startsWith('art:')) return observer.activatedArtworks.includes(requirement.slice(4));
  return false;
}

function hardGate(candidate, observer, options) {
  const reasons = [];
  if (!candidate?.id) reasons.push('missing-id');
  if (candidate?.runtimeNavigable === false) reasons.push('not-runtime-navigable');
  if (candidate?.id && candidate.id === observer.currentNodeId) reasons.push('self-route');
  if (candidate?.epistemicStatus === 'DEPRECATED') reasons.push('deprecated');
  if (candidate?.rightsStatus === 'BLOCKED') reasons.push('rights-blocked');
  if (candidate?.culturalStatus === 'AUTHORIZATION_REQUIRED') reasons.push('cultural-authorization-required');
  if (options.publicMode) {
    if (candidate?.rightsStatus && candidate.rightsStatus !== 'CLEAR') reasons.push('rights-not-clear');
    if (candidate?.culturalStatus === 'REVIEW_REQUIRED') reasons.push('cultural-review-required');
    if (candidate?.epistemicStatus === 'NEEDS_CONFIRMATION' && !options.allowNeedsConfirmation) reasons.push('needs-confirmation');
  }
  for (const requirement of candidate?.requiredMemory || []) {
    if (!memoryRequirementSatisfied(requirement, observer)) reasons.push(`missing-memory:${requirement}`);
  }
  for (const blocker of candidate?.blockedIf || []) {
    if (memoryRequirementSatisfied(blocker, observer)) reasons.push(`blocked-by-memory:${blocker}`);
  }
  if (Number.isFinite(candidate?.minDepth) && observer.depth < candidate.minDepth) reasons.push('depth-too-shallow');
  if (Number.isFinite(candidate?.maxDepth) && observer.depth > candidate.maxDepth) reasons.push('depth-too-deep');
  return reasons;
}

function overlapScore(a = [], b = []) {
  const left = unique(a);
  const right = new Set(unique(b));
  if (!left.length || !right.size) return 0;
  return left.filter((value) => right.has(value)).length / Math.max(left.length, right.size);
}

function candidateMemoryResonance(candidate, observer) {
  const tags = unique(candidate.memoryTags || []);
  if (!tags.length) return 0;
  return clamp01(Math.max(
    overlapScore(tags, observer.memorySignals),
    overlapScore(tags, observer.activatedArtworks.map((id) => `art:${id}`)),
  ));
}

function candidateCrossField(candidate, observer) {
  const fields = unique(candidate.fields || []);
  if (!fields.length) return 0;
  if (observer.currentFields.length) {
    const overlap = overlapScore(fields, observer.currentFields);
    if (overlap === 0) return 1;
    if (overlap < 1) return 0.6;
    return 0;
  }
  const seen = fields.filter((field) => (observer.fieldVisits[field] || 0) > 0).length;
  if (seen === 0 && Object.keys(observer.fieldVisits).length > 0) return 1;
  if (seen < fields.length) return 0.6;
  return 0;
}

function candidateUnresolvedQuestion(candidate, observer) {
  return overlapScore(candidate.questionIds || [], observer.unresolvedQuestions);
}

function candidateLensAffinity(candidate, observer) {
  const affinity = unique(candidate.lensAffinity || []);
  if (!affinity.length) return 0.5;
  return affinity.includes(observer.lens) ? 1 : 0;
}

function epistemicPenalty(candidate, options) {
  if (candidate.epistemicStatus === 'NEEDS_CONFIRMATION') return options.allowNeedsConfirmation ? SCORE_PENALTIES.needsConfirmation : 1;
  return 0;
}

function rightsPenalty(candidate, options) {
  if (!candidate.rightsStatus || candidate.rightsStatus === 'CLEAR') return 0;
  return options.publicMode ? 1 : SCORE_PENALTIES.unknownRights;
}

function culturalPenalty(candidate, options) {
  if (!candidate.culturalStatus || candidate.culturalStatus === 'STANDARD') return 0;
  if (candidate.culturalStatus === 'AUTHORIZATION_REQUIRED') return 1;
  return options.publicMode ? 1 : SCORE_PENALTIES.culturalReview;
}

export function scoreRouteCandidate(candidate, observerInput = {}, optionsInput = {}) {
  const observer = createObserverState(observerInput);
  const options = { seed: 'KODEX', publicMode: true, allowNeedsConfirmation: false, ...optionsInput };
  const gateReasons = hardGate(candidate, observer, options);
  if (gateReasons.length) return { id: candidate?.id || null, eligible: false, score: 0, gateReasons, components: null };

  const visits = observer.visitCounts[candidate.id] || 0;
  const recent = observer.recentNodes.includes(candidate.id) ? 1 : 0;
  const semanticAffinity = clamp01(candidate.semanticAffinity ?? candidate.weight ?? 0.5);
  const narrativeCompatibility = clamp01(candidate.narrativeCompatibility ?? 0.5);
  const curatorWeight = clamp01(candidate.curatorWeight ?? 0.5);
  const memoryResonance = candidateMemoryResonance(candidate, observer);
  const novelty = visits === 0 ? 1 : Math.max(0, 0.55 - visits * 0.18);
  const crossFieldBridge = candidateCrossField(candidate, observer);
  const unresolvedQuestion = candidateUnresolvedQuestion(candidate, observer);
  const lensAffinity = candidateLensAffinity(candidate, observer);
  const controlledRandomness = unit(hashSeed(`${options.seed}:${observer.routeSignature}:${observer.currentNodeId}:${candidate.id}`));
  const cognitiveLoad = clamp01(candidate.cognitiveLoad ?? 0.5);
  const repetition = clamp01(visits / 3);
  const unsupportedClaimRisk = clamp01(
    epistemicPenalty(candidate, options) + rightsPenalty(candidate, options) + culturalPenalty(candidate, options),
  );

  const positive = semanticAffinity * SCORE_WEIGHTS.semanticAffinity
    + narrativeCompatibility * SCORE_WEIGHTS.narrativeCompatibility
    + curatorWeight * SCORE_WEIGHTS.curatorWeight
    + memoryResonance * SCORE_WEIGHTS.memoryResonance
    + novelty * SCORE_WEIGHTS.novelty
    + crossFieldBridge * SCORE_WEIGHTS.crossFieldBridge
    + unresolvedQuestion * SCORE_WEIGHTS.unresolvedQuestion
    + lensAffinity * SCORE_WEIGHTS.lensAffinity
    + controlledRandomness * SCORE_WEIGHTS.controlledRandomness;

  const negative = recent * SCORE_PENALTIES.recentExposure
    + repetition * SCORE_PENALTIES.repetition
    + cognitiveLoad * SCORE_PENALTIES.cognitiveLoad
    + unsupportedClaimRisk;

  return {
    id: candidate.id,
    eligible: true,
    score: Number(clamp01(positive - negative).toFixed(4)),
    gateReasons: [],
    components: {
      semanticAffinity, narrativeCompatibility, curatorWeight, memoryResonance,
      novelty, crossFieldBridge, unresolvedQuestion, lensAffinity,
      controlledRandomness: Number(controlledRandomness.toFixed(4)),
      recentExposure: recent, repetition, cognitiveLoad, unsupportedClaimRisk,
    },
  };
}

function primaryField(candidate) {
  return unique(candidate?.fields || [])[0] || '__UNCLASSIFIED__';
}

function explicitRoles(candidate) {
  return unique(candidate?.routeRoles || []).map(normalizeRole).filter(Boolean);
}

function roleUtility(role, scored, candidate, observer) {
  const explicit = explicitRoles(candidate);
  if (explicit.includes(role)) return 3 + scored.score;
  const c = scored.components || {};
  const currentOverlap = overlapScore(candidate?.fields || [], observer.currentFields);
  switch (role) {
    case 'CONTINUITY':
      return currentOverlap > 0 ? 1.2 + c.semanticAffinity + c.narrativeCompatibility * 0.5 : -1;
    case 'BRIDGE':
      return c.crossFieldBridge > 0 ? 1 + c.crossFieldBridge + c.narrativeCompatibility * 0.5 : -1;
    case 'ECHO':
      return (c.memoryResonance > 0 || c.repetition > 0)
        ? 1 + c.memoryResonance + Math.min(0.35, c.repetition * 0.35)
        : -1;
    case 'SERENDIPITY':
      return c.novelty > 0.8 && c.recentExposure === 0
        ? 0.8 + c.novelty * 0.6 + c.controlledRandomness * 0.4
        : -1;
    default: return -1;
  }
}

function canAdd(item, selected, candidateById, fieldCounts, maxPerPrimaryField) {
  if (selected.some((entry) => entry.id === item.id)) return false;
  const field = primaryField(candidateById.get(item.id));
  return (fieldCounts.get(field) || 0) < maxPerPrimaryField;
}

function addSelection(item, role, selected, candidateById, fieldCounts) {
  const candidate = candidateById.get(item.id);
  const field = primaryField(candidate);
  selected.push({ ...item, role });
  fieldCounts.set(field, (fieldCounts.get(field) || 0) + 1);
}

/**
 * Composes a small route slate with explicit semantic functions.
 * Roles are descriptive/navigation functions, never behavioral targets.
 * Safety gates run before this function; a role can never resurrect an excluded node.
 */
export function composeRouteSlate({ ranked = [], candidateById, observer, maxChoices, maxPerPrimaryField }) {
  const selected = [];
  const fieldCounts = new Map();
  const roleDiagnostics = {};

  for (const role of ROUTE_ROLES) {
    if (selected.length >= maxChoices) break;
    const eligible = ranked
      .filter((item) => canAdd(item, selected, candidateById, fieldCounts, maxPerPrimaryField))
      .map((item) => ({ item, utility: roleUtility(role, item, candidateById.get(item.id), observer) }))
      .filter(({ utility }) => utility >= 0)
      .sort((a, b) => b.utility - a.utility || b.item.score - a.item.score || String(a.item.id).localeCompare(String(b.item.id)));
    roleDiagnostics[role] = eligible.length;
    if (eligible.length) addSelection(eligible[0].item, role, selected, candidateById, fieldCounts);
  }

  for (const item of ranked) {
    if (selected.length >= maxChoices) break;
    if (!canAdd(item, selected, candidateById, fieldCounts, maxPerPrimaryField)) continue;
    const candidate = candidateById.get(item.id);
    const fallbackRole = ROUTE_ROLES
      .map((role) => ({ role, utility: roleUtility(role, item, candidate, observer) }))
      .sort((a, b) => b.utility - a.utility)[0];
    addSelection(item, fallbackRole?.utility >= 0 ? fallbackRole.role : 'CONTINUITY', selected, candidateById, fieldCounts);
  }

  // If the field cap prevents a viable minimum, fill from already-safe ranked nodes.
  for (const item of ranked) {
    if (selected.length >= Math.min(maxChoices, DEEP_NAVIGATION_POLICY.minChoices)) break;
    if (selected.some((entry) => entry.id === item.id)) continue;
    addSelection(item, 'CONTINUITY', selected, candidateById, fieldCounts);
  }

  return {
    selected,
    roleDiagnostics,
    presentRoles: unique(selected.map((item) => item.role)),
    missingRoles: ROUTE_ROLES.filter((role) => !selected.some((item) => item.role === role)),
  };
}

export function buildRouteFrame({ candidates = [], observer: observerInput = {}, options: optionsInput = {} } = {}) {
  const observer = createObserverState(observerInput);
  const options = {
    seed: 'KODEX',
    publicMode: true,
    allowNeedsConfirmation: false,
    maxChoices: DEEP_NAVIGATION_POLICY.defaultChoices,
    maxPerPrimaryField: DEEP_NAVIGATION_POLICY.maxPerPrimaryField,
    ...optionsInput,
  };
  options.maxChoices = Math.max(
    DEEP_NAVIGATION_POLICY.minChoices,
    Math.min(DEEP_NAVIGATION_POLICY.maxChoices, Math.floor(options.maxChoices)),
  );

  const candidateById = new Map(candidates.filter((item) => item?.id).map((item) => [item.id, item]));
  const allScores = candidates.map((candidate) => scoreRouteCandidate(candidate, observer, options));
  const excluded = allScores.filter((item) => !item.eligible);
  const ranked = allScores
    .filter((item) => item.eligible)
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
  const slate = composeRouteSlate({
    ranked,
    candidateById,
    observer,
    maxChoices: options.maxChoices,
    maxPerPrimaryField: options.maxPerPrimaryField,
  });

  return {
    observer,
    lens: KODEX_LENSES[observer.lens],
    selected: slate.selected,
    ranked,
    excluded,
    slate: {
      algorithmVersion: ROUTE_ALGORITHM_PROFILE.version,
      status: ROUTE_ALGORITHM_PROFILE.status,
      presentRoles: slate.presentRoles,
      missingRoles: slate.missingRoles,
      roleDiagnostics: slate.roleDiagnostics,
      insufficientSafeChoices: ranked.length < DEEP_NAVIGATION_POLICY.minChoices,
    },
    autoNavigate: false,
    policy: DEEP_NAVIGATION_POLICY,
    objective: 'meaningful-discovery-with-agency',
  };
}
