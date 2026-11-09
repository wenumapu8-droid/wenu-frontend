// KODEX−∞ · minimal semantic-memory vocabulary for explicit journey commits.
// Computational/artistic labels only; no biological, psychological or spiritual inference.

export const KDX_CONCEPTS = Object.freeze({
  SIGNAL: { id: 'CX-001', label: 'SIGNAL' },
  MATTER: { id: 'CX-002', label: 'MATTER' },
  MEMORY: { id: 'CX-003', label: 'MEMORY' },
  OBSERVER: { id: 'CX-004', label: 'OBSERVER' },
  RETURN: { id: 'CX-005', label: 'RETURN' },
});

export function canonicalConceptKey(value) {
  const key = String(value || '').trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(KDX_CONCEPTS, key) ? key : null;
}

export function edgeKey(a, b) {
  const ka = canonicalConceptKey(a);
  const kb = canonicalConceptKey(b);
  if (!ka || !kb || ka === kb) return null;
  return [ka, kb].sort().join('::');
}
