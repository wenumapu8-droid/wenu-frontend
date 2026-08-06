import type { OrganismPreset } from "./types";

export interface PresetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const ASSET_DEPENDENT_MODES = new Set([
  "IMAGE_FIELD",
  "DEPTH_STACK",
  "PARTICLES",
  "GLB",
  "LAYERED_PLANES",
]);

export function validateOrganismPreset(preset: OrganismPreset): PresetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(preset.id)) {
    errors.push("id must be lower-kebab-case");
  }

  if (!preset.assets.fallback) {
    errors.push("assets.fallback is required");
  }

  if (
    ASSET_DEPENDENT_MODES.has(preset.renderMode) &&
    !preset.assets.source &&
    !preset.assets.model &&
    !preset.assets.spriteSequence?.length
  ) {
    errors.push(`${preset.renderMode} requires assets.source, assets.model or a sprite sequence`);
  }

  if (preset.behaviors.length === 0) {
    errors.push("at least one behavior is required");
  }

  if (!preset.interaction.keyboardEquivalent) {
    errors.push("interaction.keyboardEquivalent is required");
  }

  if (!preset.interaction.touchEquivalent) {
    errors.push("interaction.touchEquivalent is required");
  }

  if (preset.performance.maxDpr < 0.5 || preset.performance.maxDpr > 2) {
    errors.push("performance.maxDpr must be between 0.5 and 2");
  }

  for (const [name, value] of Object.entries(preset.controls)) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      errors.push(`controls.${name} must be a finite number between 0 and 1`);
    }
  }

  if (preset.assets.rightsStatus === "UNKNOWN") {
    warnings.push("asset rights are unknown; do not publish this preset");
  }

  if (preset.assets.rightsStatus === "REVIEW_REQUIRED") {
    warnings.push("asset rights require creator review before public use");
  }

  if (preset.memory.writes.length === 0) {
    warnings.push("preset declares no memory write; confirm that it is atmospheric only");
  }

  if (preset.status === "IMPLEMENTED" || preset.status === "TESTED") {
    if (!preset.assets.sourceId && preset.renderMode !== "SHADER") {
      errors.push(`${preset.status} asset-driven presets require assets.sourceId for provenance`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function assertOrganismPreset(preset: OrganismPreset): void {
  const result = validateOrganismPreset(preset);
  if (!result.valid) {
    throw new Error(`Invalid organism preset ${preset.id}: ${result.errors.join("; ")}`);
  }

  if (import.meta.env.DEV && result.warnings.length) {
    console.warn(`[kodex-organism:${preset.id}]`, ...result.warnings);
  }
}
