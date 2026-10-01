export const KDX_SOL_MODALITIES = Object.freeze([
  { id: 'TEXT', label: 'LANGUAGE', interactionRole: 'REVEAL' },
  { id: 'IMAGE', label: 'VISUAL', interactionRole: 'REVEAL' },
  { id: 'SOUND', label: 'AUDITORY', interactionRole: 'REVEAL' },
  { id: 'TOUCH', label: 'TACTILE', interactionRole: 'REVEAL' },
  { id: 'MOTION', label: 'DYNAMIC', interactionRole: 'SIMULATE' },
  { id: 'SIMULATION', label: 'RELATIONAL', interactionRole: 'TRACE' },
]);

export const KDX_LATENT_SOL = Object.freeze({
  id: 'KDX-LATENT-SOL',
  label: 'SOL',
  status: 'EXPERIMENTAL',
  epistemicStatus: 'CANONICAL',
  productionStatus: 'PROTOTYPE',
  modalities: KDX_SOL_MODALITIES.map((item) => item.id),
  boundaries: Object.freeze({
    readsConsciousness: false,
    physicalQuantumClaim: false,
    hiddenPsychologicalInference: false,
    sessionOnlyMemory: true,
  }),
});

const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function buildSolContext(input = {}) {
  return {
    x: clamp01(Number(input.x ?? 0.5)),
    y: clamp01(Number(input.y ?? 0.5)),
    holdMs: Math.max(0, Number(input.holdMs ?? 0)),
    velocity: Math.max(0, Number(input.velocity ?? 0)),
    returnCount: Math.max(0, Number(input.returnCount ?? 0)),
    explicitIndex: Math.max(0, Number(input.explicitIndex ?? 0)),
  };
}

export function scoreSolManifestations(rawContext = {}) {
  const context = buildSolContext(rawContext);
  const hold = clamp01(context.holdMs / 1800);
  const motion = clamp01(context.velocity / 1.4);
  const revisit = clamp01(context.returnCount / 6);

  const scores = {
    TEXT: 0.17 + (1 - context.y) * 0.12 + revisit * 0.04,
    IMAGE: 0.18 + context.x * 0.22 + (1 - motion) * 0.05,
    SOUND: 0.13 + hold * 0.26 + context.y * 0.05,
    TOUCH: 0.13 + (1 - context.x) * 0.19 + hold * 0.08,
    MOTION: 0.12 + motion * 0.36 + context.y * 0.06,
    SIMULATION: 0.11 + revisit * 0.22 + Math.abs(context.x - context.y) * 0.08,
  };

  const total = Object.values(scores).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [key, value / total]),
  );
}

export function rankSolManifestations(context = {}) {
  return Object.entries(scoreSolManifestations(context))
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ id, score }));
}

export function chooseSolManifestation(context = {}, excluded = []) {
  const excludedSet = new Set(excluded);
  return rankSolManifestations(context).find((item) => !excludedSet.has(item.id))
    || rankSolManifestations(context)[0];
}

export function projectSolVisualState(modalityId, context = {}) {
  const c = buildSolContext(context);
  const base = {
    particleScale: 1,
    radialPull: 0.58,
    orbit: 0.2,
    pulse: 0.28,
    lineAlpha: 0.16,
  };

  const presets = {
    TEXT: { particleScale: 0.72, radialPull: 0.84, orbit: 0.05, pulse: 0.18, lineAlpha: 0.28 },
    IMAGE: { particleScale: 1.2, radialPull: 0.62, orbit: 0.18, pulse: 0.3, lineAlpha: 0.18 },
    SOUND: { particleScale: 0.92, radialPull: 0.5, orbit: 0.16, pulse: 0.62, lineAlpha: 0.15 },
    TOUCH: { particleScale: 0.86, radialPull: 0.72, orbit: 0.1, pulse: 0.48, lineAlpha: 0.2 },
    MOTION: { particleScale: 1.05, radialPull: 0.42, orbit: 0.72, pulse: 0.35, lineAlpha: 0.13 },
    SIMULATION: { particleScale: 1.08, radialPull: 0.54, orbit: 0.44, pulse: 0.3, lineAlpha: 0.24 },
  };

  const preset = presets[modalityId] || base;
  return {
    ...base,
    ...preset,
    pointerX: c.x,
    pointerY: c.y,
    intensity: clamp01(0.35 + c.holdMs / 2200 + c.velocity * 0.2),
  };
}

export function sanitizeSolMemory(raw) {
  if (!raw || typeof raw !== 'object') return { visitCount: 0, events: [] };
  const events = Array.isArray(raw.events)
    ? raw.events.slice(-24).map((event) => ({
        modalityId: KDX_SOL_MODALITIES.some((item) => item.id === event?.modalityId)
          ? event.modalityId
          : 'TEXT',
        action: ['SELECT', 'HOLD_COMMIT', 'RETURN'].includes(event?.action)
          ? event.action
          : 'SELECT',
        sequenceIndex: Math.max(0, Number(event?.sequenceIndex ?? 0)),
      }))
    : [];

  return {
    visitCount: Math.max(0, Number(raw.visitCount ?? 0)),
    events,
  };
}

export function appendSolMemory(memory, event) {
  const safe = sanitizeSolMemory(memory);
  const nextEvent = {
    modalityId: KDX_SOL_MODALITIES.some((item) => item.id === event?.modalityId)
      ? event.modalityId
      : 'TEXT',
    action: ['SELECT', 'HOLD_COMMIT', 'RETURN'].includes(event?.action)
      ? event.action
      : 'SELECT',
    sequenceIndex: safe.events.length,
  };
  return {
    visitCount: safe.visitCount,
    events: [...safe.events, nextEvent].slice(-24),
  };
}
