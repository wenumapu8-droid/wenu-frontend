import vertexSource from "./shaders/fullscreen.vert.glsl?raw";
import fragmentSource from "./shaders/observe.frag.glsl?raw";

type SceneState = "dormant" | "aware" | "open";

type AudioBands = {
  low: number;
  mid: number;
  high: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

class KodexObserveController {
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();
  private readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private readonly lowPower = matchMedia("(max-width: 760px)").matches;
  private readonly pointer = { x: 0.5, y: 0.5 };
  private readonly pointerTarget = { x: 0.5, y: 0.5 };
  private audio: AudioBands = { low: 0, mid: 0, high: 0 };
  private state = 0;
  private stateTarget = 0;
  private startTime = performance.now();
  private lastFrame = this.startTime;
  private raf = 0;
  private visible = true;

  constructor(root: HTMLElement) {
    this.root = root;
    const canvas = root.querySelector<HTMLCanvasElement>("[data-kdx-canvas]");
    if (!canvas) throw new Error("KODEX Observe canvas was not found.");
    this.canvas = canvas;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: this.lowPower ? "low-power" : "high-performance",
    });
    if (!gl) throw new Error("WebGL is unavailable.");
    this.gl = gl;

    this.program = this.createProgram(vertexSource, fragmentSource);
    this.prepareGeometry();
    this.prepareUniforms();
    this.bindEvents();
    this.resize();
    this.raf = requestAnimationFrame(this.render);
  }

  public setAudioBands(bands: AudioBands): void {
    this.audio = {
      low: clamp(bands.low, 0, 1),
      mid: clamp(bands.mid, 0, 1),
      high: clamp(bands.high, 0, 1),
    };
  }

  public setState(nextState: SceneState): void {
    const values: Record<SceneState, number> = { dormant: 0, aware: 1, open: 2 };
    this.stateTarget = values[nextState];
    this.root.dataset.state = nextState;
  }

  public destroy(): void {
    cancelAnimationFrame(this.raf);
    this.gl.deleteProgram(this.program);
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error("Unable to allocate shader.");
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
  }

  private createProgram(vertex: string, fragment: string): WebGLProgram {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertex);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragment);
    const program = this.gl.createProgram();
    if (!program) throw new Error("Unable to allocate WebGL program.");
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${this.gl.getProgramInfoLog(program)}`);
    }
    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);
    return program;
  }

  private prepareGeometry(): void {
    this.gl.useProgram(this.program);
    const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      this.gl.STATIC_DRAW,
    );
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }

  private prepareUniforms(): void {
    [
      "time",
      "resolution",
      "pointer",
      "audioLow",
      "audioMid",
      "audioHigh",
      "state",
      "reducedMotion",
      "seed",
    ].forEach((name) => {
      this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    });
  }

  private bindEvents(): void {
    const primary = this.root.querySelector<HTMLButtonElement>("[data-kdx-primary]");

    this.canvas.addEventListener("pointermove", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerTarget.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      this.pointerTarget.y = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
      if (this.stateTarget < 1) this.setState("aware");
    }, { passive: true });

    this.canvas.addEventListener("pointerleave", () => {
      this.pointerTarget.x = 0.5;
      this.pointerTarget.y = 0.5;
    }, { passive: true });

    primary?.addEventListener("click", () => {
      this.setState("open");
      this.root.dispatchEvent(new CustomEvent("kodex:observe", { bubbles: true }));
      window.setTimeout(() => this.setState("aware"), 1500);
    });

    window.addEventListener("resize", () => this.resize(), { passive: true });
    document.addEventListener("visibilitychange", () => {
      this.visible = document.visibilityState === "visible";
      if (this.visible && !this.raf) this.raf = requestAnimationFrame(this.render);
    });
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, this.lowPower ? 1.35 : 2);
    const width = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (width === this.canvas.width && height === this.canvas.height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  private uniform1f(name: string, value: number): void {
    this.gl.uniform1f(this.uniforms.get(name) ?? null, value);
  }

  private render = (now: number): void => {
    this.raf = 0;
    if (!this.visible) return;

    this.resize();
    const elapsed = (now - this.startTime) / 1000;
    const delta = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    const smoothing = 1 - Math.pow(0.0001, delta);

    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * smoothing;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * smoothing;
    this.state += (this.stateTarget - this.state) * smoothing;

    if (this.audio.low === 0 && this.audio.mid === 0 && this.audio.high === 0) {
      this.audio.low = 0.12 + 0.07 * (0.5 + 0.5 * Math.sin(elapsed * 1.2));
      this.audio.mid = 0.08 + 0.04 * (0.5 + 0.5 * Math.sin(elapsed * 2.1 + 1.4));
      this.audio.high = 0.04 + 0.04 * (0.5 + 0.5 * Math.sin(elapsed * 5.0 + 0.6));
    }

    this.gl.useProgram(this.program);
    this.uniform1f("time", elapsed);
    this.gl.uniform2f(this.uniforms.get("resolution") ?? null, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(this.uniforms.get("pointer") ?? null, this.pointer.x, this.pointer.y);
    this.uniform1f("audioLow", this.audio.low);
    this.uniform1f("audioMid", this.audio.mid);
    this.uniform1f("audioHigh", this.audio.high);
    this.uniform1f("state", this.state);
    this.uniform1f("reducedMotion", this.reducedMotion ? 1 : 0);
    this.uniform1f("seed", 0.731);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    this.raf = requestAnimationFrame(this.render);
  };
}

const controllers = new WeakMap<HTMLElement, KodexObserveController>();

export function mountKodexObserveScenes(): void {
  document.querySelectorAll<HTMLElement>("[data-kdx-observe]").forEach((root) => {
    if (controllers.has(root)) return;
    try {
      controllers.set(root, new KodexObserveController(root));
    } catch (error) {
      console.error(error);
      root.dataset.webgl = "fallback";
    }
  });
}
