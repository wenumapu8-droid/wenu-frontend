export type OrganismFamily =
  | "FIELD"
  | "VORTEX"
  | "ORBITAL"
  | "GROWTH"
  | "SPECIMEN"
  | "TERRAIN";

export type RenderMode =
  | "SHADER"
  | "IMAGE_FIELD"
  | "DEPTH_STACK"
  | "PARTICLES"
  | "SVG"
  | "GLB"
  | "LAYERED_PLANES";

export type OrganismLifecycle =
  | "DORMANT"
  | "AWARE"
  | "ENGAGED"
  | "OPEN"
  | "INTEGRATING"
  | "RETURNING"
  | "COMPLETE";

export type OrganismQuality = "HIGH" | "MEDIUM" | "LOW" | "FALLBACK";
export type OrganismMotion = "FULL" | "REDUCED" | "OFF";

export type OrganismBehavior =
  | "BREATHE"
  | "ROTATE"
  | "PULSE"
  | "ORBIT"
  | "PRECESS"
  | "GROW"
  | "ROOT"
  | "BRANCH"
  | "REVEAL"
  | "SCAN"
  | "SHIMMER"
  | "GLITCH"
  | "PARALLAX"
  | "COLLAPSE"
  | "RADIATE"
  | "FEEDBACK"
  | "DISPLACE"
  | "DISSOLVE"
  | "REASSEMBLE";

export type TransitionKind =
  | "NONE"
  | "CONVERGE"
  | "DISSOLVE"
  | "ORBITAL_HANDOFF"
  | "GROWTH_TRANSFER"
  | "SCAN_REWRITE"
  | "FEEDBACK_RECURSION"
  | "SECTION_COLLAPSE"
  | "REASSEMBLE";

export interface OrganismAssets {
  source?: string;
  fallback: string;
  alpha?: string;
  height?: string;
  normal?: string;
  emission?: string;
  model?: string;
  spriteSequence?: string[];
  sourceId?: string;
  rightsStatus?: "CLEARED" | "INTERNAL_ONLY" | "REVIEW_REQUIRED" | "UNKNOWN";
}

export interface SemanticControls {
  signal: number;
  memory: number;
  entropy: number;
  cohesion: number;
  depth: number;
  growth: number;
  convergence: number;
  observability: number;
  transition: number;
}

export interface OrganismPreset {
  id: string;
  version: string;
  family: OrganismFamily;
  renderMode: RenderMode;
  status: "REFERENCE" | "EXPERIMENTAL" | "PROTOTYPE" | "IMPLEMENTED" | "TESTED" | "DEPRECATED";
  concept: {
    entity: string;
    primaryVerb: string;
    spatialLogic:
      | "PLANAR"
      | "RADIAL"
      | "AXIAL"
      | "ORBITAL"
      | "BRANCHING"
      | "RECURSIVE"
      | "VOLUMETRIC"
      | "TOPOGRAPHIC"
      | "SECTIONAL";
    statement?: string;
  };
  assets: OrganismAssets;
  behaviors: OrganismBehavior[];
  controls: SemanticControls;
  interaction: {
    pointer: "NONE" | "PARALLAX" | "ORIENT" | "DISTORT" | "ATTRACT" | "REVEAL";
    primaryAction: string;
    secondaryAction?: string;
    audioReactive: boolean;
    keyboardEquivalent?: string;
    touchEquivalent?: string;
  };
  memory: {
    writes: string[];
    reads?: string[];
  };
  transition: {
    enter: TransitionKind;
    exit: TransitionKind;
    durationMs: number;
  };
  accessibility: {
    label: string;
    description?: string;
    reducedMotion: "STATIC" | "STATIC_PULSE" | "STEPPED" | "SVG" | "CANVAS_LOW_MOTION";
    noWebGL: "STATIC_IMAGE" | "STATIC_SVG" | "CANVAS" | "TEXTUAL";
  };
  performance: {
    mobileTier: OrganismQuality;
    desktopTier: OrganismQuality;
    maxDpr: number;
    particleBudget?: number;
    feedbackPasses?: number;
    targetFps: 24 | 30 | 45 | 60;
  };
}

export interface OrganismInput {
  pointer: { x: number; y: number; active: boolean };
  primaryAction: number;
  secondaryAction: number;
  navigationAxis: { x: number; y: number };
  audio: { low: number; mid: number; high: number; active: boolean };
}

export interface OrganismFrame {
  now: number;
  delta: number;
  elapsed: number;
  input: OrganismInput;
}

export interface OrganismMetrics {
  running: boolean;
  family: OrganismFamily;
  renderMode: RenderMode;
  quality: OrganismQuality;
  motion: OrganismMotion;
  lifecycle: OrganismLifecycle;
  frames: number;
  averageFrameMs: number;
  droppedFrameEstimate: number;
}

export interface OrganismRuntime {
  readonly preset: OrganismPreset;
  load(): Promise<void>;
  mount(): void;
  enter(): Promise<void> | void;
  start(): void;
  stop(): void;
  setInput(input: Partial<OrganismInput>): void;
  setLifecycle(state: OrganismLifecycle): void;
  setQuality(level: OrganismQuality): void;
  setMotion(mode: OrganismMotion): void;
  getMetrics(): OrganismMetrics;
  exit(): Promise<void> | void;
  destroy(): Promise<void> | void;
}

export interface OrganismAdapterFactory {
  readonly family: OrganismFamily;
  readonly supportedModes: RenderMode[];
  create(canvas: HTMLCanvasElement, preset: OrganismPreset): OrganismRuntime;
}
