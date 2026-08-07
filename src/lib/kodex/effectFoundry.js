export const EFFECT_FOUNDRY_VERSION = '0.1.0';

export const EFFECT_STATUSES = [
  'CONCEPT',
  'GENERATED',
  'SELECTED',
  'TRANSLATED',
  'TESTED',
  'IMPLEMENTED',
  'DEPRECATED',
];

export const EFFECT_FAMILIES = ['SIGNAL', 'MEMORY', 'MATTER', 'SPACE', 'MUTATION', 'RETURN'];

export const RUNTIME_PARAMETER_MAP = Object.freeze({
  'pointer.x': 'distortion',
  'pointer.y': 'density',
  signalStrength: 'bloom',
  focus: 'threshold',
  anomaly: 'glitchAmount',
  time: 'phase',
  nodeCount: 'particleCount',
  latency: 'smear',
  sceneState: 'paletteMode',
});

const p = (key, label, min, max, step, value) => ({ key, label, min, max, step, value });

export const KODEX_EFFECTS = Object.freeze([
  {
    id: 'KDX-FX-001',
    slug: 'ascii-signal-bloom',
    name: 'ASCII Signal Bloom',
    family: 'SIGNAL',
    status: 'IMPLEMENTED',
    scenes: ['ARCHIVE', 'MACHINE', 'COSMOLOGY'],
    purpose: 'Convert a readable silhouette into a sparse luminous transmission made of glyphs, edge signal and coded bloom.',
    implementation: 'Canvas 2D sampling renderer integrated in COSMOLOGY. Production upgrade target: glyph-atlas shader + bloom pass.',
    fallback: 'PNG sequence / MP4 loop',
    priority: 1,
    parameters: [
      p('density', 'Cell density', 6, 28, 1, 13),
      p('threshold', 'Threshold', 0.05, 0.95, 0.01, 0.25),
      p('bloom', 'Bloom', 0, 2.5, 0.05, 1.15),
      p('glitchAmount', 'Signal scatter', 0, 1, 0.01, 0.18),
    ],
  },
  {
    id: 'KDX-FX-002',
    slug: 'cross-stitch-field',
    name: 'Cross-Stitch Field',
    family: 'SIGNAL',
    status: 'IMPLEMENTED',
    scenes: ['PROLOGUE', 'ARCHIVE', 'RETURN'],
    purpose: 'Translate image information into a computational embroidery field built from luminous crosses on a strict grid.',
    implementation: 'Canvas 2D sampled cross-grid renderer integrated in PROLOGUE. Production upgrade target: instanced quads or SDF cross shader.',
    fallback: 'PNG / SVG-like static grid',
    priority: 1,
    parameters: [
      p('density', 'Cell size', 5, 26, 1, 11),
      p('threshold', 'Threshold', 0.05, 0.95, 0.01, 0.2),
      p('bloom', 'Glow', 0, 2.5, 0.05, 0.75),
      p('phase', 'Grid phase', 0, 1, 0.01, 0.2),
    ],
  },
  {
    id: 'KDX-FX-003',
    slug: 'halftone-mutation',
    name: 'Halftone Mutation',
    family: 'MUTATION',
    status: 'IMPLEMENTED',
    scenes: ['DESCENT', 'ARCHIVE', 'MACHINE'],
    purpose: 'Break an image into print-like halftone matter whose dot scale and local displacement behave like a living mutation.',
    implementation: 'Canvas 2D sampled-circle renderer integrated in DESCENT. Production upgrade target: procedural halftone fragment shader.',
    fallback: 'PNG / MP4 loop',
    priority: 1,
    parameters: [
      p('density', 'Dot spacing', 5, 24, 1, 10),
      p('threshold', 'Threshold', 0.01, 0.9, 0.01, 0.12),
      p('distortion', 'Mutation', 0, 1, 0.01, 0.24),
      p('phase', 'Phase', 0, 1, 0.01, 0.15),
    ],
  },
  {
    id: 'KDX-FX-004',
    slug: 'liquid-mercury-skin',
    name: 'Liquid Mercury Skin',
    family: 'MATTER',
    status: 'IMPLEMENTED',
    scenes: ['MACHINE', 'COSMOLOGY'],
    purpose: 'Rebuild form as reflective metallic matter with compressed tonal bands, luminous ridges and fluid specular response.',
    implementation: 'Canvas 2D luminance/edge renderer integrated in MACHINE. Production upgrade target: normal reconstruction + reflective shading shader.',
    fallback: 'Pre-rendered MP4 / WebM',
    priority: 2,
    parameters: [
      p('threshold', 'Metal threshold', 0.05, 0.95, 0.01, 0.38),
      p('bloom', 'Specular bloom', 0, 2.5, 0.05, 0.9),
      p('distortion', 'Fluidity', 0, 1, 0.01, 0.18),
      p('smear', 'Surface smear', 0, 1, 0.01, 0.22),
    ],
  },
  {
    id: 'KDX-FX-005',
    slug: 'memory-decay-mesh',
    name: 'Memory Decay Mesh',
    family: 'MEMORY',
    status: 'IMPLEMENTED',
    scenes: ['ARCHIVE', 'RETURN'],
    purpose: 'Represent memory as a partially retained mesh: some cells persist, others drift, disappear or return as ghost data.',
    implementation: 'Canvas 2D deterministic cell-loss renderer integrated in ARCHIVE. Production upgrade target: feedback texture + temporal decay shader.',
    fallback: 'PNG sequence / MP4 loop',
    priority: 1,
    parameters: [
      p('density', 'Mesh cell', 6, 28, 1, 12),
      p('threshold', 'Retention', 0.05, 0.95, 0.01, 0.38),
      p('glitchAmount', 'Decay', 0, 1, 0.01, 0.34),
      p('smear', 'Ghost memory', 0, 1, 0.01, 0.28),
    ],
  },
  {
    id: 'KDX-FX-006',
    slug: 'minus-infinity-dissolution',
    name: '−∞ Dissolution',
    family: 'RETURN',
    status: 'IMPLEMENTED',
    scenes: ['DESCENT', 'RETURN'],
    purpose: 'Dissolve visible matter toward an unbounded pre-form state, then allow the same field to reconstruct under reversed phase.',
    implementation: 'Canvas 2D deterministic dissolution renderer integrated in RETURN. Production upgrade target: noise-field threshold + feedback/reconstruction shader.',
    fallback: 'MP4 / WebM loop with static final frame',
    priority: 1,
    parameters: [
      p('phase', 'Dissolution', 0, 1, 0.005, 0.35),
      p('distortion', 'Field warp', 0, 1, 0.01, 0.25),
      p('bloom', 'Residual signal', 0, 2.5, 0.05, 0.7),
      p('glitchAmount', 'Fragmentation', 0, 1, 0.01, 0.28),
    ],
  },
]);

export const effectById = (id) => KODEX_EFFECTS.find((effect) => effect.id === id) || null;
