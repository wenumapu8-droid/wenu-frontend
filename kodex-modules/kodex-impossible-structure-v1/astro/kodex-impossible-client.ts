type KodexUniforms = Record<string, WebGLUniformLocation | null>;

interface EngineState {
  startedAt: number;
  previousAt: number;
  pointer: [number, number];
  targetPointer: [number, number];
  visualState: number;
  progress: number;
  openingAt: number;
  reducedMotion: number;
  quality: number;
  audioLow: number;
  audioMid: number;
  audioHigh: number;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array | null;
  stream: MediaStream | null;
  running: boolean;
  frameHandle: number;
  frames: number;
  fpsStartedAt: number;
}

export function mountKodexImpossibleStructure(root: HTMLElement): () => void {
  const canvas = root.querySelector<HTMLCanvasElement>("canvas");
  if (!canvas) throw new Error("KDX_IMPOSSIBLE_STRUCTURE: canvas not found.");

  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });

  if (!gl) {
    root.classList.add("is-fallback");
    return () => undefined;
  }

  const shaderBase = root.dataset.shaderBase || "/assets/kodex/shaders";
  const cta = root.querySelector<HTMLButtonElement>("[data-kdx-activate]");
  const micButton = root.querySelector<HTMLButtonElement>("[data-kdx-mic]");
  const stateLabel = root.querySelector<HTMLElement>("[data-kdx-state]");
  const fpsLabel = root.querySelector<HTMLElement>("[data-kdx-fps]");

  let destroyed = false;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = matchMedia("(pointer: coarse)").matches;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowPower = coarsePointer || (typeof deviceMemory === "number" && deviceMemory <= 4);

  const state: EngineState = {
    startedAt: performance.now(),
    previousAt: performance.now(),
    pointer: [0.5, 0.5],
    targetPointer: [0.5, 0.5],
    visualState: 0,
    progress: 0,
    openingAt: 0,
    reducedMotion: reducedMotionQuery.matches ? 1 : 0,
    quality: lowPower ? 0.38 : 0.82,
    audioLow: 0,
    audioMid: 0,
    audioHigh: 0,
    audioContext: null,
    analyser: null,
    frequencyData: null,
    stream: null,
    running: true,
    frameHandle: 0,
    frames: 0,
    fpsStartedAt: performance.now(),
  };

  const compileShader = (type: number, source: string): WebGLShader => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Unable to create shader.");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader) || "Unknown shader error.";
      gl.deleteShader(shader);
      throw new Error(log);
    }

    return shader;
  };

  const createProgram = (vertexSource: string, fragmentSource: string): WebGLProgram => {
    const nextProgram = gl.createProgram();
    if (!nextProgram) throw new Error("Unable to create WebGL program.");

    const vertex = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    gl.attachShader(nextProgram, vertex);
    gl.attachShader(nextProgram, fragment);
    gl.linkProgram(nextProgram);

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(nextProgram) || "Unknown program link error.";
      gl.deleteProgram(nextProgram);
      throw new Error(log);
    }

    return nextProgram;
  };

  const setVisualState = (nextState: number): void => {
    state.visualState = nextState;
    if (stateLabel) {
      stateLabel.textContent =
        nextState < 0.5 ? "DORMANT" :
        nextState < 1.5 ? "AWARE" :
        "OPEN";
    }
    root.dataset.state = String(nextState);
  };

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const dprLimit = lowPower ? 1.25 : 1.75;
    const dpr = Math.min(devicePixelRatio || 1, dprLimit);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const updatePointer = (event: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    state.targetPointer = [
      Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height)),
    ];
    if (state.visualState < 1) setVisualState(1);
  };

  const updateAudio = (time: number): void => {
    if (state.analyser && state.frequencyData) {
      state.analyser.getByteFrequencyData(state.frequencyData);

      const average = (from: number, to: number): number => {
        let sum = 0;
        const upper = Math.min(to, state.frequencyData!.length);
        for (let index = from; index < upper; index += 1) {
          sum += state.frequencyData![index];
        }
        return sum / Math.max(1, upper - from) / 255;
      };

      state.audioLow += (average(1, 20) - state.audioLow) * 0.14;
      state.audioMid += (average(20, 92) - state.audioMid) * 0.12;
      state.audioHigh += (average(92, 260) - state.audioHigh) * 0.10;
    } else {
      state.audioLow = 0.08 + Math.sin(time * 0.72) * 0.025;
      state.audioMid = 0.04 + Math.sin(time * 1.13 + 1.2) * 0.018;
      state.audioHigh = 0.025 + Math.sin(time * 2.41 + 0.3) * 0.010;
    }
  };

  const enableMicrophone = async (): Promise<void> => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    if (state.audioContext) {
      await state.audioContext.resume();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.82;
    source.connect(analyser);

    state.stream = stream;
    state.audioContext = audioContext;
    state.analyser = analyser;
    state.frequencyData = new Uint8Array(analyser.frequencyBinCount);

    micButton?.classList.add("is-active");
    micButton?.setAttribute("aria-pressed", "true");
  };

  const activate = (): void => {
    if (state.visualState >= 2) return;
    setVisualState(2);
    state.openingAt = performance.now();
    state.progress = 0;

    document.dispatchEvent(
      new CustomEvent("kodex:impossible-open", {
        detail: { concept: "KDX_IMPOSSIBLE_STRUCTURE", index: 2 },
      }),
    );
  };

  const init = async (): Promise<void> => {
    const [vertexSource, fragmentSource] = await Promise.all([
      fetch(`${shaderBase}/fullscreen.vert.glsl`).then((response) => {
        if (!response.ok) throw new Error(`Vertex shader HTTP ${response.status}`);
        return response.text();
      }),
      fetch(`${shaderBase}/impossible-structure.frag.glsl`).then((response) => {
        if (!response.ok) throw new Error(`Fragment shader HTTP ${response.status}`);
        return response.text();
      }),
    ]);

    if (destroyed) return;

    program = createProgram(vertexSource, fragmentSource);
    gl.useProgram(program);

    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const names = [
      "u_time", "u_delta", "u_resolution", "u_pointer",
      "u_audioLow", "u_audioMid", "u_audioHigh",
      "u_state", "u_progress", "u_intensity", "u_seed",
      "u_reducedMotion", "u_quality",
    ];

    const uniforms: KodexUniforms = Object.fromEntries(
      names.map((name) => [name, gl.getUniformLocation(program!, name)]),
    );

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const render = (now: number): void => {
      if (destroyed || !state.running || !program) return;

      resize();

      const elapsed = (now - state.startedAt) / 1000;
      const delta = Math.min((now - state.previousAt) / 1000, 0.1);
      state.previousAt = now;

      state.pointer[0] += (state.targetPointer[0] - state.pointer[0]) * 0.08;
      state.pointer[1] += (state.targetPointer[1] - state.pointer[1]) * 0.08;

      if (state.visualState >= 2 && state.openingAt > 0) {
        const raw = Math.min(1, (now - state.openingAt) / 1850);
        state.progress = raw * raw * (3 - 2 * raw);
      }

      updateAudio(elapsed);

      gl.useProgram(program);
      gl.uniform1f(uniforms.u_time, elapsed);
      gl.uniform1f(uniforms.u_delta, delta);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.u_pointer, state.pointer[0], state.pointer[1]);
      gl.uniform1f(uniforms.u_audioLow, state.audioLow);
      gl.uniform1f(uniforms.u_audioMid, state.audioMid);
      gl.uniform1f(uniforms.u_audioHigh, state.audioHigh);
      gl.uniform1f(uniforms.u_state, state.visualState);
      gl.uniform1f(uniforms.u_progress, state.progress);
      gl.uniform1f(uniforms.u_intensity, 1);
      gl.uniform1f(uniforms.u_seed, 0.731);
      gl.uniform1f(uniforms.u_reducedMotion, state.reducedMotion);
      gl.uniform1f(uniforms.u_quality, state.quality);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      state.frames += 1;
      if (now - state.fpsStartedAt >= 1000) {
        const fps = Math.round((state.frames * 1000) / (now - state.fpsStartedAt));
        if (fpsLabel) fpsLabel.textContent = String(fps);
        state.frames = 0;
        state.fpsStartedAt = now;
      }

      state.frameHandle = requestAnimationFrame(render);
    };

    state.frameHandle = requestAnimationFrame(render);
  };

  const onVisibility = (): void => {
    state.running = !document.hidden;
    if (state.running) {
      state.previousAt = performance.now();
      state.frameHandle = requestAnimationFrame(() => undefined);
    }
  };

  const onReducedMotion = (event: MediaQueryListEvent): void => {
    state.reducedMotion = event.matches ? 1 : 0;
  };

  canvas.addEventListener("pointermove", updatePointer, { passive: true });
  canvas.addEventListener("pointerdown", updatePointer, { passive: true });
  canvas.addEventListener("pointerleave", () => {
    state.targetPointer = [0.5, 0.5];
  });
  cta?.addEventListener("click", activate);
  micButton?.addEventListener("click", () => {
    enableMicrophone().catch((error) => console.warn("KDX microphone unavailable:", error));
  });
  document.addEventListener("visibilitychange", onVisibility);
  reducedMotionQuery.addEventListener("change", onReducedMotion);

  init().catch((error) => {
    console.error("KDX_IMPOSSIBLE_STRUCTURE:", error);
    root.classList.add("is-fallback");
  });

  return () => {
    destroyed = true;
    cancelAnimationFrame(state.frameHandle);
    resizeObserver?.disconnect();
    state.stream?.getTracks().forEach((track) => track.stop());
    state.audioContext?.close().catch(() => undefined);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    canvas.removeEventListener("pointermove", updatePointer);
    canvas.removeEventListener("pointerdown", updatePointer);
    cta?.removeEventListener("click", activate);
    document.removeEventListener("visibilitychange", onVisibility);
    reducedMotionQuery.removeEventListener("change", onReducedMotion);
  };
}
