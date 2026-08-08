import type { OrganismPreset } from "../types";

/**
 * A minimal preset that satisfies every rule in `validateOrganismPreset`.
 * Tests clone it and break exactly one thing, so a failure names one rule.
 */
export function makePreset(overrides: Partial<OrganismPreset> = {}): OrganismPreset {
  const base: OrganismPreset = {
    id: "test-organism",
    version: "1.0.0",
    family: "FIELD",
    renderMode: "SHADER",
    status: "PROTOTYPE",
    concept: {
      entity: "test entity",
      primaryVerb: "observe",
      spatialLogic: "PLANAR",
    },
    assets: {
      fallback: "/img/kodex/organisms/test-fallback.webp",
    },
    behaviors: ["BREATHE"],
    controls: {
      signal: 0.5,
      memory: 0.5,
      entropy: 0.5,
      cohesion: 0.5,
      depth: 0.5,
      growth: 0.5,
      convergence: 0.5,
      observability: 0.5,
      transition: 0.5,
    },
    interaction: {
      pointer: "NONE",
      primaryAction: "open",
      audioReactive: false,
      keyboardEquivalent: "Enter",
      touchEquivalent: "tap",
    },
    memory: {
      writes: ["test.visited"],
    },
    transition: {
      enter: "NONE",
      exit: "NONE",
      durationMs: 400,
    },
    accessibility: {
      label: "Test organism",
      reducedMotion: "STATIC",
      noWebGL: "STATIC_IMAGE",
    },
    performance: {
      mobileTier: "LOW",
      desktopTier: "HIGH",
      maxDpr: 1.5,
      targetFps: 30,
    },
  };

  return { ...base, ...overrides };
}
