import type {
  OrganismFrame,
  OrganismInput,
  OrganismLifecycle,
  OrganismMetrics,
  OrganismMotion,
  OrganismPreset,
  OrganismQuality,
  OrganismRuntime,
} from "./types";

const EMPTY_INPUT: OrganismInput = {
  pointer: { x: 0, y: 0, active: false },
  primaryAction: 0,
  secondaryAction: 0,
  navigationAxis: { x: 0, y: 0 },
  audio: { low: 0, mid: 0, high: 0, active: false },
};

export abstract class BaseOrganismRuntime implements OrganismRuntime {
  readonly preset: OrganismPreset;

  protected readonly canvas: HTMLCanvasElement;
  protected input: OrganismInput = structuredClone(EMPTY_INPUT);
  protected lifecycle: OrganismLifecycle = "DORMANT";
  protected quality: OrganismQuality;
  protected motion: OrganismMotion = "FULL";

  private raf = 0;
  private running = false;
  private startedAt = 0;
  private previousAt = 0;
  private frameCount = 0;
  private accumulatedFrameMs = 0;
  private droppedFrameEstimate = 0;

  protected constructor(canvas: HTMLCanvasElement, preset: OrganismPreset) {
    this.canvas = canvas;
    this.preset = preset;
    this.quality = matchMedia("(max-width: 767px)").matches
      ? preset.performance.mobileTier
      : preset.performance.desktopTier;
  }

  abstract load(): Promise<void>;
  abstract mount(): void;
  abstract render(frame: OrganismFrame): void;
  abstract destroyResources(): Promise<void> | void;

  enter(): Promise<void> | void {
    this.setLifecycle("AWARE");
  }

  exit(): Promise<void> | void {
    this.setLifecycle("RETURNING");
    this.stop();
  }

  start(): void {
    if (this.running || this.motion === "OFF" || this.quality === "FALLBACK") return;

    this.running = true;
    this.startedAt ||= performance.now();
    this.previousAt = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
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
  }

  setLifecycle(state: OrganismLifecycle): void {
    this.lifecycle = state;
  }

  setQuality(level: OrganismQuality): void {
    this.quality = level;
    this.onQualityChange(level);

    if (level === "FALLBACK") this.stop();
  }

  setMotion(mode: OrganismMotion): void {
    this.motion = mode;
    this.onMotionChange(mode);

    if (mode === "OFF") this.stop();
  }

  getMetrics(): OrganismMetrics {
    return {
      running: this.running,
      family: this.preset.family,
      renderMode: this.preset.renderMode,
      quality: this.quality,
      motion: this.motion,
      lifecycle: this.lifecycle,
      frames: this.frameCount,
      averageFrameMs: this.frameCount ? this.accumulatedFrameMs / this.frameCount : 0,
      droppedFrameEstimate: this.droppedFrameEstimate,
    };
  }

  async destroy(): Promise<void> {
    this.stop();
    await this.destroyResources();
  }

  protected onQualityChange(_level: OrganismQuality): void {}
  protected onMotionChange(_mode: OrganismMotion): void {}

  private tick = (now: number): void => {
    if (!this.running) return;

    const frameMs = Math.min(100, now - this.previousAt);
    const targetFrameMs = 1000 / this.preset.performance.targetFps;
    this.previousAt = now;

    if (frameMs >= targetFrameMs * 1.8) {
      this.droppedFrameEstimate += Math.max(1, Math.round(frameMs / targetFrameMs) - 1);
    }

    this.frameCount += 1;
    this.accumulatedFrameMs += frameMs;

    this.render({
      now,
      delta: frameMs / 1000,
      elapsed: (now - this.startedAt) / 1000,
      input: this.input,
    });

    this.raf = requestAnimationFrame(this.tick);
  };
}
