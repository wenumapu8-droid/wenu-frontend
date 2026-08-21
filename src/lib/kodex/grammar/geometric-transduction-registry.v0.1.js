export const KDX_GEOMETRIC_TRANSDUCTION_PROFILE = Object.freeze({
  version: 'geometric-transduction-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  role: 'SEMANTIC_GEOMETRY_REGISTRY',
  createsParallelRuntime: false,
  mutatesAssemblyOS: false,
  claim: 'Geometry is a formal bridge for translating relation into space, state and transformation; it is not proof of a universal metaphysics.',
});

const primitive = (id, relation, operators, depthTypes, evidenceClass, note) => Object.freeze({
  id,
  relation,
  compatible_operators: Object.freeze(operators),
  compatible_depth_types: Object.freeze(depthTypes),
  evidence_class: evidenceClass,
  note,
});

export const KDX_GEOMETRIC_PRIMITIVES = Object.freeze([
  primitive('POINT_CENTER', 'ORIGIN / FOCUS / POTENTIAL', ['MANIFEST', 'OBSERVE', 'REVEAL'], ['MATERIAL', 'INFORMATION', 'META'], 'FORMAL_MATHEMATICAL', 'Use as origin/focus relation; symbolic readings must remain separately classified.'),
  primitive('AXIS', 'ORIENTATION / POLARITY / ALIGNMENT', ['RELATE', 'DIVERGE', 'CONVERGE', 'OBSERVE'], ['MATERIAL', 'SYSTEMIC', 'EPISTEMIC'], 'FORMAL_MATHEMATICAL', 'Encodes directed relation or polarity; does not imply metaphysical dualism.'),
  primitive('CIRCLE_SPHERE', 'CONTINUITY / BOUNDARY / RADIAL SYMMETRY', ['MANIFEST', 'RELATE', 'RETURN'], ['MATERIAL', 'SYSTEMIC', 'COSMOLOGICAL'], 'FORMAL_MATHEMATICAL', 'Radial symmetry and enclosure are formal properties; unity/infinity readings are symbolic.'),
  primitive('SQUARE_CUBE', 'ORTHOGONAL FRAME / CONTAINMENT', ['MANIFEST', 'RELATE', 'INHERIT'], ['MATERIAL', 'SYSTEMIC'], 'FORMAL_MATHEMATICAL', 'Use for orthogonal frame/containment; solidity/earth symbolism is tradition-specific.'),
  primitive('TRIANGLE_TETRAHEDRAL_CONVERGENCE', 'CONVERGENCE / DIRECTION / APEX', ['CONVERGE', 'APPROACH', 'CROSS'], ['MATERIAL', 'SYSTEMIC'], 'FORMAL_MATHEMATICAL', 'Use for convergent directional geometry; pyramid-energy claims are not encoded.'),
  primitive('SPIRAL_HELIX', 'ITERATIVE TURN / RETURN-WITH-DIFFERENCE', ['APPROACH', 'CROSS', 'MUTATE', 'INHERIT', 'RETURN'], ['LINEAGE', 'MATERIAL', 'COSMOLOGICAL'], 'KODEX_SYMBOLIC', 'KODEX uses spiral/helix as recurrence-with-transformation, not as evidence of a universal sacred constant.'),
  primitive('LATTICE_FIELD', 'DISTRIBUTED RELATION / NEIGHBORHOOD', ['RELATE', 'REVEAL', 'CONVERGE'], ['SYSTEMIC', 'INFORMATION', 'COSMOLOGICAL'], 'FORMAL_MATHEMATICAL', 'Represents distributed relation and adjacency.'),
  primitive('BRANCH_TREE', 'LINEAGE / DIVERGENCE / DESCENDANCE', ['DIVERGE', 'MUTATE', 'INHERIT', 'RECONSTRUCT'], ['LINEAGE', 'SYSTEMIC'], 'KODEX_SYMBOLIC', 'Maps lineage and branching causality; not every natural branching system follows Fibonacci counts.'),
  primitive('TESSELLATION_PACKING', 'PACKING / REPEAT / LOCAL CONSTRAINT', ['RELATE', 'CONVERGE', 'INHERIT'], ['MATERIAL', 'SYSTEMIC'], 'FORMAL_MATHEMATICAL', 'Use for spatial packing and repeat constraints; efficiency claims require domain-specific evidence.'),
  primitive('SYMMETRY_BREAK', 'ORDER → DIFFERENCE / MUTATION', ['MUTATE', 'ERODE', 'DIVERGE', 'INHERIT'], ['MATERIAL', 'LINEAGE', 'SYSTEMIC'], 'KODEX_SYMBOLIC', 'A controlled visual/operator metaphor for mutation and differentiation.'),
  primitive('NODAL_PATTERN', 'MODE / NODE / STANDING-WAVE TRACE', ['REVEAL', 'OBSERVE', 'RELATE', 'MANIFEST'], ['MATERIAL', 'INFORMATION'], 'EMPIRICAL_PHYSICAL', 'Inspired by standing-wave/Chladni-type pattern formation; does not encode 432 Hz superiority claims.'),
  primitive('NESTED_SCALE', 'PART ↔ WHOLE / SCALE TRANSITION', ['APPROACH', 'REVEAL', 'CROSS', 'INHERIT'], ['MATERIAL', 'SYSTEMIC', 'COSMOLOGICAL', 'META'], 'KODEX_SYMBOLIC', 'Supports micro↔macro traversal without claiming exact self-similarity across all natural scales.'),
]);

export const KDX_GEOMETRIC_PRIMITIVE_BY_ID = Object.freeze(Object.fromEntries(
  KDX_GEOMETRIC_PRIMITIVES.map((entry) => [entry.id, entry]),
));

export const KDX_GEOMETRIC_EVIDENCE_CLASSES = Object.freeze([
  'FORMAL_MATHEMATICAL',
  'EMPIRICAL_PHYSICAL',
  'HISTORICAL_SYMBOLIC',
  'KODEX_SYMBOLIC',
  'SPECULATIVE',
]);

export function getGeometricPrimitive(id) {
  return KDX_GEOMETRIC_PRIMITIVE_BY_ID[id] || null;
}
