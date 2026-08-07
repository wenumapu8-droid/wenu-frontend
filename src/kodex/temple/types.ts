export type KodexTempleState =
  | "DORMANT"
  | "AWARE"
  | "ACTIVE"
  | "MUTATED"
  | "RESONANT";

export type KodexTemplePalette = {
  void: string;
  shadow: string;
  structure: string;
  signal: string;
  spectral: string;
  memory: string;
  white: string;
};

export type KodexTempleStateProfile = {
  state: KodexTempleState;
  description: string;
  architectureEnergy: number;
  candleEnergy: number;
  spectralEnergy: number;
  depth: number;
  organismScale: number;
  memoryVisibility: number;
};

export type KodexTempleAction = {
  id: string;
  label: string;
  description: string;
  nextState?: KodexTempleState;
  emits?: string;
};

export type KodexTempleRecipe = {
  id: string;
  title: string;
  subtitle: string;
  nodeCoordinate: string;
  organismPreset: string;
  organismFallback: string;
  organismLabel: string;
  organismDescription: string;
  palette: KodexTemplePalette;
  stateProfiles: Record<KodexTempleState, KodexTempleStateProfile>;
  actions: KodexTempleAction[];
  architecture: {
    archLayers: number;
    domeLayers: number;
    candleCount: number;
    memoryLights: number;
  };
  provenance: {
    visualStatus: "ORIGINAL_KODEX_TRANSLATION" | "REFERENCE_TRANSLATION";
    culturalRule: string;
    epistemicStatus: "CANONICAL" | "SPECULATIVE" | "EXPERIMENTAL";
  };
};
