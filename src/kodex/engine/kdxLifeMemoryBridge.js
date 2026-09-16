const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : 0));

const freeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) freeze(nested);
  return value;
};

export const KDX_LIFE_MEMORY_BRIDGE_VERSION = 'kdx-life-memory-bridge-v0.1.0';
export const KDX_LIFE_MEMORY_AUTHORITY = 'EXTERNAL_READ_ONLY_MEMORY';
export const KDX_LIFE_THRESHOLD_EVENT = 'threshold_crossed';

function normalizeEvent(event = {}) {
  return freeze({
    type: typeof event.type === 'string' ? event.type : '',
    node_id: typeof event.node_id === 'string' ? event.node_id : '',
    at: Math.max(0, Number(event.at) || 0),
    cycle: Math.max(0, Math.floor(Number(event.cycle) || 0)),
  });
}

/**
 * Pure derivation for the FIRST LIVING LOOP proof.
 *
 * This function does not persist, profile, score, infer intent, or invent state.
 * It consumes explicit memory facts produced by the existing KODEX memory
 * authority and derives one small, perceivable downstream consequence.
 */
export function deriveKdxLifeMemoryState({ events = [], memoryWeight = 0 } = {}) {
  const safeEvents = Array.isArray(events) ? events.map(normalizeEvent) : [];
  const thresholdCrosses = safeEvents.filter((event) => event.type === KDX_LIFE_THRESHOLD_EVENT);
  const latestThresholdCross = thresholdCrosses.at(-1) ?? null;
  const weight = clamp01(memoryWeight);
  const remembered = thresholdCrosses.length > 0;

  return freeze({
    version: KDX_LIFE_MEMORY_BRIDGE_VERSION,
    authority: KDX_LIFE_MEMORY_AUTHORITY,
    readOnly: true,
    facts: {
      thresholdCrossed: remembered,
      thresholdCrossCount: thresholdCrosses.length,
      latestThresholdCross,
      memoryWeight: weight,
    },
    consequence: {
      semanticState: remembered ? 'REMEMBERED' : 'DORMANT',
      recallVisible: remembered,
      recallStrength: remembered ? Math.max(0.2, weight) : 0,
    },
  });
}

/**
 * Adapter over the existing memory authority.
 *
 * Expected production wiring after branch convergence:
 *   readEvents       -> memoria.eventos
 *   readMemoryWeight -> memoria.pesoDeMemoria
 *
 * Deliberately exposes no commit/write/reset API. KDX.LIFE is a consumer here,
 * not a second persistence engine.
 */
export function createKdxLifeMemoryBridge({ readEvents, readMemoryWeight } = {}) {
  if (typeof readEvents !== 'function') {
    throw new TypeError('KDX.LIFE memory bridge requires readEvents().');
  }
  if (typeof readMemoryWeight !== 'function') {
    throw new TypeError('KDX.LIFE memory bridge requires readMemoryWeight().');
  }

  return freeze({
    read() {
      return deriveKdxLifeMemoryState({
        events: readEvents(),
        memoryWeight: readMemoryWeight(),
      });
    },
  });
}
