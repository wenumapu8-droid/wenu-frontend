import { thresholdPortalAdapter } from "./adapters/ThresholdPortalAdapter";
import { thresholdPortalPreset } from "./presets";
import type {
  OrganismAdapterFactory,
  OrganismPreset,
  OrganismRuntime,
} from "./types";

class OrganismRegistry {
  private readonly presets = new Map<string, OrganismPreset>();
  private readonly adapters = new Map<string, OrganismAdapterFactory>();

  registerPreset(preset: OrganismPreset): this {
    if (this.presets.has(preset.id)) {
      throw new Error(`KODEX organism preset already registered: ${preset.id}`);
    }
    this.presets.set(preset.id, preset);
    return this;
  }

  registerAdapter(adapter: OrganismAdapterFactory): this {
    const key = adapter.family;
    if (this.adapters.has(key)) {
      throw new Error(`KODEX organism adapter already registered: ${key}`);
    }
    this.adapters.set(key, adapter);
    return this;
  }

  getPreset(id: string): OrganismPreset {
    const preset = this.presets.get(id);
    if (!preset) throw new Error(`Unknown KODEX organism preset: ${id}`);
    return preset;
  }

  create(canvas: HTMLCanvasElement, presetId: string): OrganismRuntime {
    const preset = this.getPreset(presetId);
    const adapter = this.adapters.get(preset.family);

    if (!adapter) {
      throw new Error(
        `No adapter registered for ${preset.family}. Preset ${preset.id} remains specification-only.`,
      );
    }

    if (!adapter.supportedModes.includes(preset.renderMode)) {
      throw new Error(
        `Adapter ${adapter.family} does not support ${preset.renderMode} for preset ${preset.id}.`,
      );
    }

    return adapter.create(canvas, preset);
  }

  list(): OrganismPreset[] {
    return [...this.presets.values()];
  }
}

export const organismRegistry = new OrganismRegistry()
  .registerAdapter(thresholdPortalAdapter)
  .registerPreset(thresholdPortalPreset);

export { OrganismRegistry };
