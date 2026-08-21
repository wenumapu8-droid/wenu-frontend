import { KDX_GEOMETRIC_PRIMITIVE_BY_ID } from './geometric-transduction-registry.v0.1.js';

export const KDX_GENERATIVE_GEOMETRY_CROSSWALK_PROFILE = Object.freeze({
  version: 'generative-geometry-crosswalk-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  role: 'GRAMMAR_TO_EXISTING_GEOMETRIC_TRANSDUCTION',
  createsNewPrimitiveIds: false,
  mutatesAssemblyOS: false,
  failClosed: true,
});

export const KDX_GEOMETRY_MAPPING_KINDS = Object.freeze([
  'DIRECT',
  'DERIVED',
  'COMPOSITE',
  'VISUAL_ONLY',
  'UNSUPPORTED',
]);

const entry = (concept, mapping, primitives, patternIds = [], note = '') => Object.freeze({
  concept,
  mapping,
  primitive_ids: Object.freeze(primitives),
  pattern_ids: Object.freeze(patternIds),
  note,
});

// IMPORTANT: primitive_ids below are ONLY IDs already admitted by
// geometric-transduction-registry.v0.1.js. This layer translates the broader
// generative grammar into the existing vocabulary; it never creates a second
// geometry registry.
export const KDX_GENERATIVE_GEOMETRY_CROSSWALK = Object.freeze([
  entry('POINT_CENTER', 'DIRECT', ['POINT_CENTER']),
  entry('AXIS', 'DIRECT', ['AXIS']),
  entry('CIRCLE_ORBIT', 'DERIVED', ['CIRCLE_SPHERE'], [], 'Orbit is a dynamical use of the existing circle/sphere relation.'),
  entry('CONCENTRIC_NESTED', 'COMPOSITE', ['CIRCLE_SPHERE', 'NESTED_SCALE']),
  entry('SPIRAL_HELIX', 'DIRECT', ['SPIRAL_HELIX']),
  entry('LATTICE', 'DIRECT', ['LATTICE_FIELD']),
  entry('TESSELLATION', 'DIRECT', ['TESSELLATION_PACKING']),
  entry('VORONOI_DELAUNAY', 'DERIVED', ['LATTICE_FIELD'], ['VORONOI_DELAUNAY'], 'Voronoi/Delaunay remains a Natural Law pattern, not a new primitive.'),
  entry('NETWORK', 'DERIVED', ['LATTICE_FIELD'], ['ADAPTIVE_TRANSPORT_NETWORK']),
  entry('BRANCH', 'DIRECT', ['BRANCH_TREE']),
  entry('FIELD', 'DERIVED', ['LATTICE_FIELD']),
  entry('TOROIDAL_RETURN', 'COMPOSITE', ['CIRCLE_SPHERE', 'SPIRAL_HELIX'], ['NESTED_RECURSION'], 'KODEX canonical return-loop mapping; not a claim of a universal human energy torus.'),
  entry('SYMMETRY', 'VISUAL_ONLY', ['CIRCLE_SPHERE'], [], 'Runtime radial symmetry may be rendered by the existing mirror shader; this does not add a geometric primitive.'),
  entry('SYMMETRY_BREAK', 'DIRECT', ['SYMMETRY_BREAK'], ['SYMMETRY_BREAKING']),
  entry('ATTRACTOR', 'COMPOSITE', ['POINT_CENTER', 'CIRCLE_SPHERE'], [], 'Dynamical attractor is represented through existing focus/orbit relations.'),
  entry('RECURSION', 'COMPOSITE', ['NESTED_SCALE', 'SPIRAL_HELIX'], ['NESTED_RECURSION']),
]);

export const KDX_GENERATIVE_GEOMETRY_BY_CONCEPT = Object.freeze(Object.fromEntries(
  KDX_GENERATIVE_GEOMETRY_CROSSWALK.map((record) => [record.concept, record]),
));

export class KdxGenerativeGeometryCrosswalkError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxGenerativeGeometryCrosswalkError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

export function resolveGenerativeGeometryConcept(concept) {
  const id = String(concept || '').trim().toUpperCase();
  const record = KDX_GENERATIVE_GEOMETRY_BY_CONCEPT[id];
  if (!record) {
    throw new KdxGenerativeGeometryCrosswalkError(
      'UNKNOWN_GENERATIVE_GEOMETRY',
      `Unsupported generative geometry concept: ${id || '(empty)'}`,
      { concept: id || null },
    );
  }
  if (!KDX_GEOMETRY_MAPPING_KINDS.includes(record.mapping) || record.mapping === 'UNSUPPORTED') {
    throw new KdxGenerativeGeometryCrosswalkError(
      'UNSUPPORTED_GENERATIVE_GEOMETRY',
      `Generative geometry concept is not executable: ${id}`,
      { concept: id, mapping: record.mapping },
    );
  }
  for (const primitiveId of record.primitive_ids) {
    if (!KDX_GEOMETRIC_PRIMITIVE_BY_ID[primitiveId]) {
      throw new KdxGenerativeGeometryCrosswalkError(
        'CROSSWALK_PRIMITIVE_DRIFT',
        `Crosswalk references an unregistered primitive: ${primitiveId}`,
        { concept: id, primitiveId },
      );
    }
  }
  return record;
}

export function resolveGenerativeGeometryConcepts(concepts = []) {
  if (!Array.isArray(concepts) || concepts.length === 0 || concepts.length > 6) {
    throw new KdxGenerativeGeometryCrosswalkError(
      'INVALID_GENERATIVE_GEOMETRY_LIST',
      'geometry_concepts requires 1–6 concepts.',
      { concepts },
    );
  }
  const records = [...new Set(concepts.map((value) => String(value || '').trim().toUpperCase()))]
    .map(resolveGenerativeGeometryConcept);
  const primitiveIds = [...new Set(records.flatMap((record) => record.primitive_ids))];
  const patternIds = [...new Set(records.flatMap((record) => record.pattern_ids))];
  return Object.freeze({
    concepts: Object.freeze(records.map((record) => record.concept)),
    mappings: Object.freeze(records),
    primitive_ids: Object.freeze(primitiveIds),
    implied_pattern_ids: Object.freeze(patternIds),
  });
}
