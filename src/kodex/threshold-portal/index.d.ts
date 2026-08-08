export const THRESHOLD_PORTAL_MOTION: Readonly<{
  LIVE: "live";
  PAUSED: "paused";
  REDUCED: "reduced";
  LOW_POWER: "low-power";
}>;

export const THRESHOLD_PORTAL_STATES: Readonly<{
  DORMANT: 0;
  AWARE: 1;
  OPEN: 2;
}>;

export const THRESHOLD_PORTAL_QUALITY: Readonly<{
  HIGH: 1;
  MEDIUM: 0.75;
  LOW: 0.5;
}>;

export interface ThresholdPortalOptions {
  artworkUrl?: string;
  seed?: number;
  elapsedMs?: number;
  bass?: number;
  motionMode?: "live" | "paused" | "reduced" | "low-power";
  qualityLevel?: "HIGH" | "MEDIUM" | "LOW";
  state?: "DORMANT" | "AWARE" | "OPEN";
}

export interface ThresholdPortalMetrics {
  fps: number;
  frameTime: number;
  longFrames: number;
  drawCalls: number;
  activeLoops: number;
  canvasSize: string;
  state: string;
  seed: number;
  elapsedMs: number;
  motionMode: string;
  qualityLevel: string;
}

export class KdxThresholdPortalRuntime {
  constructor(canvas: HTMLCanvasElement, options?: ThresholdPortalOptions);
  load(): Promise<this>;
  start(): void;
  stop(): void;
  dispose(): void;
  setSeed(seed: number): void;
  setElapsedMs(elapsedMs: number): void;
  setState(state: "DORMANT" | "AWARE" | "OPEN"): void;
  setMotionMode(mode: "live" | "paused" | "reduced" | "low-power"): void;
  setQualityLevel(level: "HIGH" | "MEDIUM" | "LOW"): void;
  setBass(bass: number): void;
  setPointer(x: number, y: number): void;
  renderOnce(): void;
  captureFrame(type?: string): string;
  getMetrics(): ThresholdPortalMetrics;
}

export function getThresholdPortalStateValue(state: string): number;
export function getThresholdPortalQualityValue(level: string): number;
