const DEFAULT_DENSITY = Object.freeze({
  desktopCellPx: 6,
  mobileCellPx: 7,
  glyphSet: 'micro',
  ditherStrength: 0.34,
});

const profile = ({
  id,
  title,
  motif,
  topology,
  sourceRefs,
  sourceStatus,
  epistemic,
  accent,
  palette,
  params,
}) => Object.freeze({
  id: `${id}-rgx-v1`,
  conceptId: id,
  title,
  motif,
  topology,
  renderMode: 'REFERENCE-GROUNDED MICROGLYPH + VECTOR SCAFFOLD',
  sourceRefs: Object.freeze(sourceRefs),
  sourceStatus,
  epistemicStatus: epistemic,
  loopSeconds: 24,
  accent,
  palette: Object.freeze(palette),
  density: DEFAULT_DENSITY,
  params: Object.freeze(params),
});

/**
 * Reference-grounded HoloCore family.
 *
 * These profiles encode only relative composition/topology extracted from the
 * KODEX Visual Atlas and current creator references. They do not embed source
 * image pixels and must not be interpreted as physical/anatomical simulation
 * data. All coordinates are normalized inside the bounded HoloCore viewport.
 */
export const HOLOCORE_RGX_PROFILES = Object.freeze({
  'orbital-city': profile({
    id: 'orbital-city',
    title: 'ORBITAL CITY',
    motif: 'orbital-stack',
    topology: 'cloud → crown → platforms → habitat ring → service orbit → planetary interface',
    sourceRefs: [
      'CURRENT_CONVERSATION:CIUDAD_AEREA_ORBITAL_REFERENCE',
      'KDX-ROOT-RAW-009',
    ],
    sourceStatus: 'VISUAL_REFERENCE + ANALYZED / MACHINE_REFERENCE',
    epistemic: 'ART / COMP / SPEC',
    accent: '#a06cff',
    palette: ['#020205', '#090711', '#181226', '#34224d', '#7950a8', '#c9a5ff', '#f3edff'],
    params: {
      axisX: 0.5,
      atmosphereY: 0.14,
      rings: [
        [0.255, 0.12, 0.026, 4],
        [0.355, 0.27, 0.055, 8],
        [0.47, 0.23, 0.046, 6],
        [0.61, 0.365, 0.082, 16],
        [0.755, 0.265, 0.052, 8],
        [0.835, 0.135, 0.03, 5],
      ],
      habitatIndex: 3,
      spokes: 16,
      planetY: 0.965,
    },
  }),

  'signal-core': profile({
    id: 'signal-core',
    title: 'SIGNAL CORE',
    motif: 'radial-core',
    topology: 'luminous core inside protective cage + radial code field',
    sourceRefs: ['KDX-ROOT-RAW-009'],
    sourceStatus: 'ANALYZED / MACHINE_REFERENCE',
    epistemic: 'COMP / ART / SPEC',
    accent: '#b7ff4a',
    palette: ['#020503', '#0b1c0b', '#17431d', '#3d7d31', '#9bd94c', '#f3ffe7'],
    params: { coreR: 0.105, cageR: 0.36, bands: 4, spokes: 14, nodes: 18, cageAspect: 0.82 },
  }),

  'interference-portal': profile({
    id: 'interference-portal',
    title: 'INTERFERENCE PORTAL',
    motif: 'portal',
    topology: 'recursive radial ring + containment bands + axial tunnel + six stabilizers',
    sourceRefs: ['KDX-SYSTEM-PORTAL-RING-002'],
    sourceStatus: 'CANON_CANDIDATE',
    epistemic: 'ART / COMP / SYM / SPEC',
    accent: '#64d7ff',
    palette: ['#020408', '#081a26', '#123b50', '#286b83', '#68cce5', '#effcff'],
    params: { apertureR: 0.11, outerR: 0.38, bands: 6, stabilizers: 6, tunnelDepth: 5 },
  }),

  'signal-vortex': profile({
    id: 'signal-vortex',
    title: 'SIGNAL VORTEX',
    motif: 'vortex',
    topology: 'radial convergence + logarithmic-spiral-inspired flow + waveform field',
    sourceRefs: ['KDX-SCREEN-SIGNAL-014', 'KDX-ROOT-RAW-021'],
    sourceStatus: 'SCREEN_CANDIDATE / ANALYZED_VARIANT',
    epistemic: 'COMP / PHI / ART / SPEC',
    accent: '#b47cff',
    palette: ['#020205', '#140b22', '#32204d', '#663c8e', '#b47cff', '#f4ecff'],
    params: { coreR: 0.065, outerR: 0.43, arms: 5, turns: 2.8, rings: 5, nodes: 24 },
  }),

  'dna-ascent': profile({
    id: 'dna-ascent',
    title: 'DNA ASCENT',
    motif: 'helix',
    topology: 'double helix + vertical ascent + repeating rung rhythm',
    sourceRefs: ['KDX-ASTRAL-GATE-03', 'KDX-ASTRAL-003'],
    sourceStatus: 'CANON / CANON_CANDIDATE',
    epistemic: 'BIO / ART / SYM / PHI',
    accent: '#d9b8ff',
    palette: ['#030208', '#17101f', '#38224b', '#765097', '#d9b8ff', '#fff7df'],
    params: { amplitude: 0.22, cycles: 3.2, rungCount: 20, y0: 0.11, y1: 0.9, bodyNodes: 6 },
  }),

  'memory-tree': profile({
    id: 'memory-tree',
    title: 'MEMORY TREE',
    motif: 'tree',
    topology: 'central tree + mirrored roots + archive rings + orbital memory paths',
    sourceRefs: ['KDX-SCREEN-ARCHIVE-015'],
    sourceStatus: 'SCREEN_CANDIDATE',
    epistemic: 'COMP / PHI / ART / SYM / SPEC',
    accent: '#d29b55',
    palette: ['#050301', '#181008', '#3b2812', '#795229', '#d29b55', '#fff0ce'],
    params: { trunkTop: 0.2, trunkBase: 0.58, canopyR: 0.31, branchLevels: 4, archiveRings: 3, rootDepth: 0.32 },
  }),

  'skull-archive': profile({
    id: 'skull-archive',
    title: 'SKULL ARCHIVE',
    motif: 'skull',
    topology: 'frontal cranial plate + circular measurement field + evidence scan',
    sourceRefs: ['KDX-ROOT-RAW-029'],
    sourceStatus: 'ANALYZED',
    epistemic: 'BIO / ART / SPEC',
    accent: '#f0a044',
    palette: ['#060302', '#211007', '#4a2410', '#95501f', '#f0a044', '#fff1d7'],
    params: { cx: 0.5, cy: 0.48, skullRx: 0.22, skullRy: 0.28, eyeDx: 0.085, eyeY: 0.46, jawY: 0.67, scanRings: 4 },
  }),

  'cosmology-orbit': profile({
    id: 'cosmology-orbit',
    title: 'COSMOLOGY ORBIT',
    motif: 'orbit-map',
    topology: 'concentric orbits + radial node system + source anchor + axial cross',
    sourceRefs: ['KDX-SYS-COSMO-ORBIT-001', 'KDX-SCREEN-COSMOLOGY-012'],
    sourceStatus: 'CANON_SYSTEM / SCREEN_CANDIDATE',
    epistemic: 'PHY / MATH / PHI / SYM / ART / SPEC',
    accent: '#ffcf70',
    palette: ['#050402', '#1d1609', '#4a3512', '#8e6728', '#ffcf70', '#fff5d6'],
    params: { rings: [0.11, 0.19, 0.28, 0.37, 0.46], nodes: [4, 6, 8, 10, 12], axialCross: true, sourceR: 0.055 },
  }),

  'field-of-eyes': profile({
    id: 'field-of-eyes',
    title: 'FIELD OF EYES',
    motif: 'eyes',
    topology: 'radial eye lattice + nested circles + reciprocal gaze network',
    sourceRefs: ['KDX-ASTRAL-GATE-02', 'KDX-ASTRAL-006'],
    sourceStatus: 'CANON / CANON_CANDIDATE',
    epistemic: 'ART / PHI / SYM / COMP',
    accent: '#a78cff',
    palette: ['#020206', '#131026', '#2f2852', '#5b4f91', '#a78cff', '#f4efff'],
    params: { rings: [0, 0.17, 0.31, 0.43], counts: [1, 8, 14, 20], eyeRx: 0.035, eyeRy: 0.014, gazeLimit: 0.012 },
  }),

  'heart-chamber': profile({
    id: 'heart-chamber',
    title: 'HEART CHAMBER',
    motif: 'heart',
    topology: 'anatomical-heart motif + concentric instrumentation + central node network',
    sourceRefs: ['KDX-ASTRAL-GATE-05', 'KDX-SCREEN-HEART-000'],
    sourceStatus: 'CANON / SCREEN_CANDIDATE',
    epistemic: 'BIO / ART / PHI / SYM',
    accent: '#d76652',
    palette: ['#060201', '#210806', '#4b1712', '#873428', '#d76652', '#ffe6d8'],
    params: { cx: 0.5, cy: 0.53, scale: 0.29, rings: [0.24, 0.34, 0.43], vesselCount: 5, simulatedPulse: true },
  }),

  'source-chamber': profile({
    id: 'source-chamber',
    title: 'SOURCE CHAMBER',
    motif: 'source',
    topology: 'luminous sphere + radial flower + nested potential field + reflective horizon',
    sourceRefs: ['KDX-ASTRAL-GATE-04', 'KDX-ASTRAL-004'],
    sourceStatus: 'CANON / CANON_CANDIDATE',
    epistemic: 'ART / PHI / SYM / SPEC',
    accent: '#f5df9e',
    palette: ['#040303', '#1d1913', '#4d432e', '#8e7951', '#f5df9e', '#fffdf3'],
    params: { sphereR: 0.23, petals: 12, rings: 5, horizonY: 0.78, treeBranches: 7 },
  }),

  'return-gate': profile({
    id: 'return-gate',
    title: 'RETURN GATE',
    motif: 'return',
    topology: 'concentric portal + axial path + horizon + recursive memory framing',
    sourceRefs: ['KDX-ASTRAL-GATE-06', 'KDX-ASTRAL-005'],
    sourceStatus: 'CANON / CANON_CANDIDATE',
    epistemic: 'ART / PHI / SYM / COMP',
    accent: '#efe4ba',
    palette: ['#030303', '#171613', '#3b382e', '#746d58', '#c9bd96', '#fffbea'],
    params: { gateCx: 0.5, gateCy: 0.45, gateRx: 0.29, gateRy: 0.38, nested: 5, pathWidth: 0.075, horizonY: 0.77, fragments: 18 },
  }),

  'living-organism': profile({
    id: 'living-organism',
    title: 'LIVING ORGANISM',
    motif: 'organism',
    topology: 'bilateral membrane + nested chambers + luminous nodes + root filaments',
    sourceRefs: ['KDX-SCREEN-LIVING-013'],
    sourceStatus: 'SCREEN_CANDIDATE',
    epistemic: 'BIO / COMP / ART / SPEC',
    accent: '#8fff55',
    palette: ['#020402', '#0c1908', '#1d4214', '#417d2b', '#8fff55', '#efffe3'],
    params: { cx: 0.5, cy: 0.5, rx: 0.24, ry: 0.38, chambers: 6, nodes: 14, filaments: 18 },
  }),

  'signal-seed': profile({
    id: 'signal-seed',
    title: 'SIGNAL SEED',
    motif: 'seed',
    topology: 'ovoid seed + cellular compartments + tensile lattice + emergent data cloud',
    sourceRefs: ['KDX-ROOT-RAW-010'],
    sourceStatus: 'ANALYZED / SCREEN_CANDIDATE',
    epistemic: 'COMP / ART / SPEC',
    accent: '#b8ff58',
    palette: ['#020402', '#101b08', '#294616', '#568230', '#b8ff58', '#f5ffe5'],
    params: { cx: 0.5, cy: 0.51, rx: 0.205, ry: 0.34, chambers: 5, lattice: 12, growthNodes: 11 },
  }),
});

export const HOLOCORE_RGX_PROFILE_IDS = Object.freeze(Object.keys(HOLOCORE_RGX_PROFILES));
export const HOLOCORE_RGX_DEFAULT_ID = 'orbital-city';

export function resolveHoloCoreRGXProfile(id) {
  return HOLOCORE_RGX_PROFILES[id] ?? HOLOCORE_RGX_PROFILES[HOLOCORE_RGX_DEFAULT_ID];
}
