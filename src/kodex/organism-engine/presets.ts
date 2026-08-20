import type {
  OrganismFamily,
  OrganismPreset,
  RenderMode,
  SemanticControls,
} from "./types";

const controls = (overrides: Partial<SemanticControls> = {}): SemanticControls => ({
  signal: 0.5,
  memory: 0.3,
  entropy: 0.15,
  cohesion: 0.75,
  depth: 0.5,
  growth: 0,
  convergence: 0.35,
  observability: 0.6,
  transition: 0,
  ...overrides,
});

interface PresetFactoryInput {
  id: string;
  source?: string;
  fallback: string;
  label: string;
  sourceId?: string;
}

const base = (
  input: PresetFactoryInput,
  family: OrganismFamily,
  renderMode: RenderMode,
): Omit<OrganismPreset, "concept" | "behaviors" | "controls"> => ({
  id: input.id,
  version: "0.1.0",
  family,
  renderMode,
  status: "EXPERIMENTAL",
  assets: {
    source: input.source,
    fallback: input.fallback,
    sourceId: input.sourceId,
    rightsStatus: input.sourceId ? "REVIEW_REQUIRED" : "UNKNOWN",
  },
  interaction: {
    pointer: "PARALLAX",
    primaryAction: "ACTIVATE",
    audioReactive: false,
    keyboardEquivalent: "Enter or Space",
    touchEquivalent: "Tap",
  },
  memory: { writes: [] },
  transition: {
    enter: "CONVERGE",
    exit: "DISSOLVE",
    durationMs: 1400,
  },
  accessibility: {
    label: input.label,
    reducedMotion: "STATIC_PULSE",
    noWebGL: "STATIC_IMAGE",
  },
  performance: {
    mobileTier: "MEDIUM",
    desktopTier: "HIGH",
    maxDpr: 1.5,
    feedbackPasses: 1,
    targetFps: 45,
  },
});

export const createFieldPreset = (input: PresetFactoryInput): OrganismPreset => ({
  ...base(input, "FIELD", "IMAGE_FIELD"),
  concept: {
    entity: "PORTAL_FIELD",
    primaryVerb: "OPEN",
    spatialLogic: "RADIAL",
    statement: "The source image becomes a recursive spatial field.",
  },
  behaviors: ["BREATHE", "ROTATE", "FEEDBACK", "PARALLAX", "REVEAL"],
  controls: controls({ signal: 0.72, memory: 0.58, depth: 0.68, convergence: 0.42 }),
  memory: { writes: ["FIELD_ACTIVATED"] },
  transition: { enter: "CONVERGE", exit: "FEEDBACK_RECURSION", durationMs: 1600 },
});

export const createVortexPreset = (input: PresetFactoryInput): OrganismPreset => ({
  ...base(input, "VORTEX", "SHADER"),
  concept: {
    entity: "SIGNAL_VORTEX",
    primaryVerb: "CONVERGE",
    spatialLogic: "RECURSIVE",
    statement: "Signal follows a rotating field toward a visible attractor.",
  },
  behaviors: ["ROTATE", "COLLAPSE", "FEEDBACK", "RADIATE", "PARALLAX"],
  controls: controls({ signal: 0.8, memory: 0.72, entropy: 0.38, convergence: 0.86, depth: 0.82 }),
  interaction: {
    ...base(input, "VORTEX", "SHADER").interaction,
    pointer: "ATTRACT",
    primaryAction: "INCREASE_CONVERGENCE",
  },
  memory: { writes: ["VORTEX_OBSERVED"] },
  transition: { enter: "FEEDBACK_RECURSION", exit: "CONVERGE", durationMs: 1800 },
});

export const createOrbitalPreset = (input: PresetFactoryInput): OrganismPreset => ({
  ...base(input, "ORBITAL", "LAYERED_PLANES"),
  concept: {
    entity: "COSMOLOGY_SYSTEM",
    primaryVerb: "ORBIT",
    spatialLogic: "ORBITAL",
  },
  behaviors: ["ORBIT", "PRECESS", "PULSE", "PARALLAX"],
  controls: controls({ signal: 0.58, memory: 0.4, cohesion: 0.88, depth: 0.72, observability: 0.78 }),
  memory: { writes: ["ORBITAL_RELATION_OBSERVED"] },
  transition: { enter: "ORBITAL_HANDOFF", exit: "ORBITAL_HANDOFF", durationMs: 1700 },
});

export const createGrowthPreset = (input: PresetFactoryInput): OrganismPreset => ({
  ...base(input, "GROWTH", "SVG"),
  concept: {
    entity: "MEMORY_TREE",
    primaryVerb: "GERMINATE",
    spatialLogic: "BRANCHING",
  },
  behaviors: ["GROW", "ROOT", "BRANCH", "RADIATE", "REVEAL"],
  controls: controls({ signal: 0.46, memory: 0.82, cohesion: 0.84, growth: 0.05, depth: 0.44 }),
  memory: { writes: ["SEED_PLANTED", "GROWTH_STAGE_ADVANCED"] },
  transition: { enter: "GROWTH_TRANSFER", exit: "DISSOLVE", durationMs: 2200 },
  performance: {
    ...base(input, "GROWTH", "SVG").performance,
    mobileTier: "HIGH",
    feedbackPasses: 0,
    targetFps: 30,
  },
  accessibility: {
    ...base(input, "GROWTH", "SVG").accessibility,
    reducedMotion: "STEPPED",
    noWebGL: "STATIC_SVG",
  },
});

export const createSpecimenPreset = (input: PresetFactoryInput): OrganismPreset => ({
  ...base(input, "SPECIMEN", "GLB"),
  concept: {
    entity: "ARCHIVE_SPECIMEN",
    primaryVerb: "SCAN",
    spatialLogic: "AXIAL",
  },
  behaviors: ["ROTATE", "SCAN", "REVEAL", "PULSE"],
  controls: controls({ signal: 0.66, memory: 0.32, cohesion: 0.92, depth: 0.74, observability: 0.9 }),
  interaction: {
    ...base(input, "SPECIMEN", "GLB").interaction,
    pointer: "ORIENT",
    primaryAction: "CHANGE_TREATMENT_MODE",
  },
  memory: { writes: ["SPECIMEN_LAYER_REVEALED"] },
  transition: { enter: "SCAN_REWRITE", exit: "DISSOLVE", durationMs: 1200 },
});

export const createTerrainPreset = (input: PresetFactoryInput): OrganismPreset => ({
  ...base(input, "TERRAIN", "LAYERED_PLANES"),
  concept: {
    entity: "WORLD_CONSTRUCT",
    primaryVerb: "SECTION",
    spatialLogic: "TOPOGRAPHIC",
  },
  behaviors: ["REVEAL", "SCAN", "DISPLACE", "PARALLAX", "REASSEMBLE"],
  controls: controls({ signal: 0.52, memory: 0.46, entropy: 0.24, cohesion: 0.72, depth: 0.86 }),
  memory: { writes: ["TERRAIN_LAYER_ANALYZED"] },
  transition: { enter: "REASSEMBLE", exit: "SECTION_COLLAPSE", durationMs: 1900 },
});

export const thresholdPortalPreset = createFieldPreset({
  id: "threshold-portal",
  source: "/img/kodex/works/mandala-0cin-negativo.png",
  fallback: "/img/kodex/works/mandala-0cin-negativo.png",
  label: "THRESHOLD · portal vivo sobre la obra",
  sourceId: "KODEX_THRESHOLD_MANDALA",
});
