const VERTEX_SHADER_URL = "../shaders/fullscreen.vert.glsl";
const FRAGMENT_SHADER_URL = "../shaders/observe.frag.glsl";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

class KodexObserveRuntime {
  constructor(root) {
    this.root = root;
    this.canvas = root.querySelector("[data-kdx-canvas]");
    this.primaryAction = root.querySelector("[data-kdx-primary]");
    this.messageNode = root.querySelector("[data-kdx-message]");
    this.debugNode = root.querySelector("[data-kdx-debug]");

    this.gl = null;
    this.program = null;
    this.locations = {};
    this.startTime = performance.now();
    this.lastFrame = this.startTime;
    this.raf = 0;
    this.state = 0;
    this.stateTarget = 0;
    this.pointer = { x: 0.5, y: 0.5 };
    this.pointerTarget = { x: 0.5, y: 0.5 };
    this.audio = { low: 0, mid: 0, high: 0 };
    this.externalAudio = false;
    this.isVisible = true;
    this.frameCount = 0;
    this.fps = 60;
    this.lastFpsSample = performance.now();
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lowPower = matchMedia("(max-width: 760px)").matches;
    this.seed = 0.731;

    this.messages = [
      "OBSERVER LOOP ACTIVE · RELATIONAL FIELD LOCKED",
      "MEMORY HOST DETECTED · SOURCE UNRESOLVED",
      "SEÑAL RELACIONAL · ACCESS NON-LINEAR",
      "PATTERN BEFORE IDENTITY · ARCHIVE AWARE",
    ];
    this.messageIndex = 0;
  }

  async init() {
    const gl = this.canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: this.lowPower ? "low-power" : "high-performance",
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      this.root.classList.add("is-webgl-fallback");
      throw new Error("WebGL is not available in this browser.");
    }

    this.gl = gl;

    const [vertexSource, fragmentSource] = await Promise.all([
      fetch(VERTEX_SHADER_URL).then((response) => response.text()),
      fetch(FRAGMENT_SHADER_URL).then((response) => response.text()),
    ]);

    this.program = this.createProgram(vertexSource, fragmentSource);
    gl.useProgram(this.program);

    const positionLocation = gl.getAttribLocation(this.program, "a_position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

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
      this.locations[name] = gl.getUniformLocation(this.program, name);
    });

    this.bindEvents();
    this.resize();
    this.messageTimer = window.setInterval(() => this.rotateMessage(), 4600);
    this.raf = requestAnimationFrame((now) => this.render(now));

    window.kodexObserve = {
      setAudioBands: (low = 0, mid = 0, high = 0) => {
        this.externalAudio = true;
        this.audio.low = clamp(low, 0, 1);
        this.audio.mid = clamp(mid, 0, 1);
        this.audio.high = clamp(high, 0, 1);
      },
      setState: (nextState) => this.setState(nextState),
      destroy: () => this.destroy(),
    };
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compile error:\n${info}`);
    }

    return shader;
  }

  createProgram(vertexSource, fragmentSource) {
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
    const program = this.gl.createProgram();

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      this.gl.deleteProgram(program);
      throw new Error(`Program link error:\n${info}`);
    }

    this.gl.deleteShader(vertexShader);
    this.gl.deleteShader(fragmentShader);
    return program;
  }

  bindEvents() {
    this.onResize = () => this.resize();
    this.onVisibility = () => {
      this.isVisible = document.visibilityState === "visible";
      if (this.isVisible && !this.raf) {
        this.lastFrame = performance.now();
        this.raf = requestAnimationFrame((now) => this.render(now));
      }
    };

    this.onPointerMove = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointerTarget.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      this.pointerTarget.y = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
      if (this.stateTarget < 1) this.setState(1);
    };

    this.onPointerLeave = () => {
      this.pointerTarget.x = 0.5;
      this.pointerTarget.y = 0.5;
    };

    this.onPrimaryAction = () => {
      this.setState(2);
      this.root.dispatchEvent(new CustomEvent("kodex:observe", { bubbles: true }));
      window.setTimeout(() => this.setState(1), 1500);
    };

    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    this.canvas.addEventListener("pointermove", this.onPointerMove, { passive: true });
    this.canvas.addEventListener("pointerdown", this.onPointerMove, { passive: true });
    this.canvas.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    this.primaryAction?.addEventListener("click", this.onPrimaryAction);
  }

  setState(nextState) {
    const map = { dormant: 0, aware: 1, open: 2 };
    const resolved = typeof nextState === "string" ? map[nextState] : nextState;
    this.stateTarget = clamp(Number(resolved) || 0, 0, 2);
    this.root.dataset.state = ["dormant", "aware", "open"][Math.round(this.stateTarget)];
  }

  rotateMessage() {
    this.messageIndex = (this.messageIndex + 1) % this.messages.length;
    if (this.messageNode) this.messageNode.textContent = this.messages[this.messageIndex];
  }

  resize() {
    const dprCap = this.lowPower ? 1.35 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const width = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * dpr));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
    }
  }

  updateAudio(elapsed) {
    if (this.externalAudio) return;
    const idle = this.state > 0.25 ? 1 : 0.55;
    this.audio.low = 0.12 + 0.08 * (0.5 + 0.5 * Math.sin(elapsed * 1.2)) * idle;
    this.audio.mid = 0.08 + 0.05 * (0.5 + 0.5 * Math.sin(elapsed * 2.1 + 1.4)) * idle;
    this.audio.high = 0.04 + 0.05 * (0.5 + 0.5 * Math.sin(elapsed * 5.0 + 0.6)) * idle;
  }

  render(now) {
    this.raf = 0;
    if (!this.isVisible) return;

    this.resize();

    const elapsed = (now - this.startTime) / 1000;
    const delta = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    const smoothing = 1 - Math.pow(0.0001, delta);
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * smoothing;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * smoothing;
    this.state += (this.stateTarget - this.state) * smoothing;
    this.updateAudio(elapsed);

    const gl = this.gl;
    gl.useProgram(this.program);
    gl.uniform1f(this.locations.time, elapsed);
    gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.locations.pointer, this.pointer.x, this.pointer.y);
    gl.uniform1f(this.locations.audioLow, this.audio.low);
    gl.uniform1f(this.locations.audioMid, this.audio.mid);
    gl.uniform1f(this.locations.audioHigh, this.audio.high);
    gl.uniform1f(this.locations.state, this.state);
    gl.uniform1f(this.locations.reducedMotion, this.reducedMotion ? 1 : 0);
    gl.uniform1f(this.locations.seed, this.seed);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.frameCount += 1;
    if (now - this.lastFpsSample >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsSample));
      this.frameCount = 0;
      this.lastFpsSample = now;
      if (this.debugNode) {
        this.debugNode.innerHTML = [
          `FPS ${this.fps}`,
          `STATE ${this.state.toFixed(2)}`,
          `DPR ${(this.canvas.width / this.canvas.clientWidth).toFixed(2)}`,
          `CANVAS ${this.canvas.width}×${this.canvas.height}`,
          `MOTION ${this.reducedMotion ? "REDUCED" : "FULL"}`,
        ].join("<br>");
      }
    }

    this.raf = requestAnimationFrame((nextNow) => this.render(nextNow));
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    clearInterval(this.messageTimer);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerdown", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.primaryAction?.removeEventListener("click", this.onPrimaryAction);
    this.gl?.deleteProgram(this.program);
  }
}

const root = document.querySelector("[data-kdx-observe]");
if (root) {
  const runtime = new KodexObserveRuntime(root);
  runtime.init().catch((error) => {
    console.error(error);
    const message = root.querySelector("[data-kdx-message]");
    if (message) message.textContent = "WEBGL FALLBACK ACTIVE · STATIC SIGNAL";
  });

  const debugEnabled = new URLSearchParams(location.search).get("debug") === "1";
  root.querySelector("[data-kdx-debug]")?.classList.toggle("is-visible", debugEnabled);
}
