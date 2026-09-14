export const KDX_RENDERER_CONTRACT_VERSION = 'kdx-renderer-contract-v0.1.0';

const REQUIRED_METHODS = Object.freeze(['applyPlan', 'applySignals', 'start', 'stop']);
const OPTIONAL_METHODS = Object.freeze(['setState', 'renderOnce', 'snapshot']);

export function assertKdxRenderer(renderer) {
  if (!renderer || typeof renderer !== 'object') {
    throw new TypeError('KDX renderer must be an object.');
  }
  const missing = REQUIRED_METHODS.filter((name) => typeof renderer[name] !== 'function');
  if (missing.length) {
    throw new TypeError(`KDX renderer is missing required methods: ${missing.join(', ')}`);
  }
  return renderer;
}

export function describeKdxRenderer(renderer) {
  assertKdxRenderer(renderer);
  return Object.freeze({
    version: KDX_RENDERER_CONTRACT_VERSION,
    required: REQUIRED_METHODS,
    optional: Object.freeze(OPTIONAL_METHODS.filter((name) => typeof renderer[name] === 'function')),
    kind: String(renderer.kind || renderer.constructor?.name || 'anonymous-renderer'),
  });
}
