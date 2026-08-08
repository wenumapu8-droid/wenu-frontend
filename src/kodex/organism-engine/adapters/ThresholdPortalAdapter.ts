// Existing verified implementation lineage. This adapter deliberately wraps it
// instead of duplicating the three-pass WebGL runtime.
import { KdxThresholdPortalRuntime, THRESHOLD_PORTAL_MOTION } from "../../threshold-portal/index.js";
import type {
  OrganismAdapterFactory,
  OrganismInput,
  OrganismLifecycle,
  OrganismMetrics,
  OrganismMotion,
  OrganismPreset,
  OrganismQuality,
  OrganismRuntime,
} from "../types";
import { guessTierFromPreset } from "../../../lib/kodex/quality";

const STATE_MAP: Record<OrganismLifecycle, "DORMANT" | "AWARE" | "OPEN"> = {
  DORMANT: "DORMANT",
  AWARE: "AWARE",
  ENGAGED: "AWARE",
  OPEN: "OPEN",
  INTEGRATING: "OPEN",
  RETURNING: "OPEN",
  COMPLETE: "DORMANT",
};

const QUALITY_MAP: Record<OrganismQuality, "HIGH" | "MEDIUM" | "LOW"> = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
  FALLBACK: "LOW",
};

class ThresholdPortalOrganismRuntime implements OrganismRuntime {
  readonly preset: OrganismPreset;

  private readonly runtime: KdxThresholdPortalRuntime;
  private lifecycle: OrganismLifecycle = "DORMANT";
  private quality: OrganismQuality;
  private motion: OrganismMotion = "FULL";
  private running = false;
  private input: OrganismInput = {
    pointer: { x: 0, y: 0, active: false },
    primaryAction: 0,
    secondaryAction: 0,
    navigationAxis: { x: 0, y: 0 },
    audio: { low: 0, mid: 0, high: 0, active: false },
  };

  constructor(canvas: HTMLCanvasElement, preset: OrganismPreset) {
    this.preset = preset;
    // Misma adivinanza de arranque que el resto del motor, ahora con nombre.
    // Este adaptador NO adapta por medición: el bucle vive dentro de
    // `KdxThresholdPortalRuntime` (JS) y no expone un punto por cuadro desde
    // acá. Ver la nota en `src/lib/kodex/quality.ts`.
    this.quality = guessTierFromPreset(preset.performance, matchMedia("(max-width: 767px)").matches);

    this.runtime = new KdxThresholdPortalRuntime(canvas, {
      artworkUrl: preset.assets.source,
      seed: seedFromId(preset.id),
      qualityLevel: QUALITY_MAP[this.quality],
      // The universal host already normalizes pointer input and owns WebGL
      // loss/restoration. Disable the legacy global/context listeners here so
      // FIELD has one lifecycle owner instead of two competing handlers.
      bindGlobalPointer: false,
      manageContextLifecycle: false,
    });
  }

  async load(): Promise<void> {
    if (!this.preset.assets.source) {
      throw new Error(`Organism ${this.preset.id} requires assets.source.`);
    }
    await this.runtime.load();
  }

  mount(): void {
    this.runtime.setState(STATE_MAP[this.lifecycle]);
    this.runtime.setQualityLevel(QUALITY_MAP[this.quality]);
    this.applyMotion();
  }

  enter(): void {
    this.setLifecycle("AWARE");
  }

  start(): void {
    if (this.motion === "OFF" || this.quality === "FALLBACK") return;
    this.running = true;
    this.runtime.start();
  }

  stop(): void {
    this.running = false;
    this.runtime.stop();
  }

  setInput(next: Partial<OrganismInput>): void {
    this.input = {
      ...this.input,
      ...next,
      pointer: next.pointer ? { ...this.input.pointer, ...next.pointer } : this.input.pointer,
      navigationAxis: next.navigationAxis
        ? { ...this.input.navigationAxis, ...next.navigationAxis }
        : this.input.navigationAxis,
      audio: next.audio ? { ...this.input.audio, ...next.audio } : this.input.audio,
    };

    this.runtime.setPointer(this.input.pointer.x, this.input.pointer.y);
    const low = this.input.audio.active
      ? this.input.audio.low
      : 0.2 + Math.sin(performance.now() / 1800) * 0.1;
    this.runtime.setBass(low);
  }

  setLifecycle(state: OrganismLifecycle): void {
    this.lifecycle = state;
    this.runtime.setState(STATE_MAP[state]);
  }

  setQuality(level: OrganismQuality): void {
    this.quality = level;
    this.runtime.setQualityLevel(QUALITY_MAP[level]);
    if (level === "FALLBACK") this.stop();
  }

  setMotion(mode: OrganismMotion): void {
    this.motion = mode;
    this.applyMotion();
    if (mode === "OFF") this.stop();
  }

  getMetrics(): OrganismMetrics {
    const legacy = this.runtime.getMetrics();
    return {
      running: this.running,
      family: this.preset.family,
      renderMode: this.preset.renderMode,
      quality: this.quality,
      motion: this.motion,
      lifecycle: this.lifecycle,
      frames: 0,
      averageFrameMs: Number(legacy.frameTime ?? 0),
      droppedFrameEstimate: Number(legacy.longFrames ?? 0),
      // Este adaptador no adapta: el nivel sigue siendo el del preset.
      qualitySource: "guess",
    };
  }

  exit(): void {
    this.setLifecycle("RETURNING");
    this.stop();
  }

  destroy(): void {
    this.stop();
    this.runtime.dispose();
  }

  private applyMotion(): void {
    if (this.motion === "REDUCED") {
      this.runtime.setMotionMode(THRESHOLD_PORTAL_MOTION.REDUCED);
      this.runtime.renderOnce();
      return;
    }

    if (this.motion === "OFF") {
      this.runtime.setMotionMode(THRESHOLD_PORTAL_MOTION.PAUSED);
      this.runtime.renderOnce();
      return;
    }

    this.runtime.setMotionMode(THRESHOLD_PORTAL_MOTION.LIVE);
  }
}

export const thresholdPortalAdapter: OrganismAdapterFactory = {
  family: "FIELD",
  supportedModes: ["IMAGE_FIELD", "SHADER"],
  create(canvas, preset) {
    return new ThresholdPortalOrganismRuntime(canvas, preset);
  },
};

function seedFromId(id: string): number {
  let hash = 2166136261;
  for (const character of id) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}
