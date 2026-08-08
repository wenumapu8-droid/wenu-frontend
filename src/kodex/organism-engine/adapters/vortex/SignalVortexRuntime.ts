import screenVertex from "./shaders/screen.vert?raw";
import signalVortexFragment from "./shaders/signal-vortex.frag?raw";
import { BaseOrganismRuntime } from "../../BaseOrganismRuntime";
import type {
  OrganismFrame,
  OrganismMotion,
  OrganismPreset,
  OrganismQuality,
} from "../../types";

type UniformMap = Record<string, WebGLUniformLocation | null>;

const LIFECYCLE_VALUE = {
  DORMANT: 0,
  AWARE: 0.22,
  ENGAGED: 0.48,
  OPEN: 0.72,
  INTEGRATING: 0.82,
  RETURNING: 0.56,
  COMPLETE: 1,
} as const;

const QUALITY_VALUE: Record<OrganismQuality, number> = {
  HIGH: 1,
  MEDIUM: 0.7,
  LOW: 0.42,
  FALLBACK: 0,
};

export class SignalVortexRuntime extends BaseOrganismRuntime {
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private uniforms: UniformMap = {};
  private resizeObserver: ResizeObserver | null = null;

  constructor(canvas: HTMLCanvasElement, preset: OrganismPreset) {
    super(canvas, preset);
  }

  async load(): Promise<void> {
    const gl = this.canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    if (!gl) throw new Error("WebGL2 unavailable for Signal Vortex.");
    this.gl = gl;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, screenVertex);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, signalVortexFragment);
    const program = gl.createProgram();
    if (!program) throw new Error("Unable to create Signal Vortex program.");

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || "Signal Vortex shader link failed.";
      gl.deleteProgram(program);
      throw new Error(message);
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      throw new Error("Unable to create Signal Vortex geometry buffer.");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    this.program = program;
    this.buffer = buffer;
    this.uniforms = collectUniforms(gl, program);
  }

  mount(): void {
    if (!this.gl || !this.program || !this.buffer) {
      throw new Error("Signal Vortex must load before mount.");
    }

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.resize();
    this.render({
      now: performance.now(),
      delta: 0,
      elapsed: 0,
      input: this.input,
    });
  }

  render(frame: OrganismFrame): void {
    const gl = this.gl;
    const program = this.program;
    const buffer = this.buffer;
    if (!gl || !program || !buffer || this.quality === "FALLBACK") return;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const controls = this.preset.controls;
    const state = LIFECYCLE_VALUE[this.lifecycle];
    const motionValue = this.motion === "FULL" ? 1 : this.motion === "REDUCED" ? 0.08 : 0;

    uniform2f(gl, this.uniforms.u_resolution, this.canvas.width, this.canvas.height);
    uniform2f(gl, this.uniforms.u_pointer, frame.input.pointer.x, frame.input.pointer.y);
    uniform1f(gl, this.uniforms.u_time, frame.elapsed);
    uniform1f(gl, this.uniforms.u_signal, clamp01(controls.signal + frame.input.audio.low * 0.22));
    uniform1f(gl, this.uniforms.u_memory, controls.memory);
    uniform1f(gl, this.uniforms.u_entropy, controls.entropy);
    uniform1f(gl, this.uniforms.u_cohesion, controls.cohesion);
    uniform1f(gl, this.uniforms.u_depth, controls.depth);
    uniform1f(
      gl,
      this.uniforms.u_convergence,
      clamp01(controls.convergence + frame.input.primaryAction * 0.18),
    );
    uniform1f(gl, this.uniforms.u_state, state);
    uniform1f(gl, this.uniforms.u_motion, motionValue);
    uniform1f(gl, this.uniforms.u_quality, QUALITY_VALUE[this.quality]);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  destroyResources(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    const gl = this.gl;
    if (gl) {
      if (this.buffer) gl.deleteBuffer(this.buffer);
      if (this.program) gl.deleteProgram(this.program);
    }

    this.uniforms = {};
    this.buffer = null;
    this.program = null;
    this.gl = null;
  }

  protected onQualityChange(_level: OrganismQuality): void {
    this.resize();
  }

  protected onMotionChange(mode: OrganismMotion): void {
    if (mode === "OFF") return;
    this.render({
      now: performance.now(),
      delta: 0,
      elapsed: 0,
      input: this.input,
    });
  }

  private resize(): void {
    if (!this.gl || this.quality === "FALLBACK") return;

    const qualityScale = QUALITY_VALUE[this.quality];
    const dpr = Math.min(
      this.preset.performance.maxDpr,
      Math.max(0.5, (window.devicePixelRatio || 1) * qualityScale),
    );
    const width = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * dpr));

    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Shader compile failed.";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function collectUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): UniformMap {
  const uniforms: UniformMap = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let index = 0; index < count; index += 1) {
    const info = gl.getActiveUniform(program, index);
    if (!info) continue;
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return uniforms;
}

function uniform1f(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null | undefined,
  value: number,
): void {
  if (location !== undefined && location !== null) gl.uniform1f(location, value);
}

function uniform2f(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null | undefined,
  x: number,
  y: number,
): void {
  if (location !== undefined && location !== null) gl.uniform2f(location, x, y);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
