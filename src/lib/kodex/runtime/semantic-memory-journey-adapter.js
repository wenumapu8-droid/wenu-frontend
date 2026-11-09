import {
  KDX_CONCEPTS,
  canonicalConceptKey,
  edgeKey,
} from '../../../kodex/memory/concepts.js';

export const KDX_SEMANTIC_MEMORY_PRESET = 'semantic-memory-v0.1.0';

function stableEventId(value) {
  const id = String(value || '').trim();
  return id || null;
}

/**
 * Translate an explicit semantic concept commit into the existing
 * `kodex:organism-action` contract. This module owns no storage, clocks,
 * salience, decay, dwell scoring or inferred user state.
 */
export function semanticConceptToJourneyAction({ eventId, concept, explicitCommit = false } = {}) {
  if (explicitCommit !== true) return null;
  const id = stableEventId(eventId);
  const key = canonicalConceptKey(concept);
  if (!id || !key) return null;

  const conceptId = KDX_CONCEPTS[key].id;
  return {
    id: `semantic:${id}:${conceptId}`,
    createdAt: 0,
    presetId: KDX_SEMANTIC_MEMORY_PRESET,
    family: 'SEMANTIC_MEMORY',
    action: 'TRACE_CONCEPT',
    memoryWrites: [`concept:${conceptId}:${key}`],
  };
}

/**
 * Associations enter JourneyState only when the relation itself is explicitly
 * committed. Passive co-occurrence, pointer proximity and dwell do not create
 * persisted relations.
 */
export function semanticRelationToJourneyAction({
  eventId,
  from,
  to,
  explicitCommit = false,
} = {}) {
  if (explicitCommit !== true) return null;
  const id = stableEventId(eventId);
  const fromKey = canonicalConceptKey(from);
  const toKey = canonicalConceptKey(to);
  const relation = edgeKey(fromKey, toKey);
  if (!id || !relation || !fromKey || !toKey) return null;

  const [left, right] = relation.split('::');
  const leftId = KDX_CONCEPTS[left].id;
  const rightId = KDX_CONCEPTS[right].id;

  return {
    id: `semantic:${id}:${leftId}:${rightId}`,
    createdAt: 0,
    presetId: KDX_SEMANTIC_MEMORY_PRESET,
    family: 'SEMANTIC_MEMORY',
    action: 'TRACE_RELATION',
    memoryWrites: [`relation:${leftId}:${rightId}`],
  };
}
