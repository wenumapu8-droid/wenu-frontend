type UniformMap = Record<string, WebGLUniformLocation | null>;

interface RippleRuntime {
  startedAt: number;
  previousAt: number;
  pointer: [number, number];
  previousPointer: [number, number];
  targetPointer: [number, number];
  pointerVelocity: [number, number];
  visualState: number;
  progress: number;
  openingAt: number;
  impactStartedAt: number;
  impactOrigin: [number, number];
  reducedMotion: number;
  quality: number;
  audioLow: number;
  audioMid: number;
  audioHigh: number;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  frequencyData: Uint8Array<ArrayBuffer> | null;
  stream: MediaStream | null;
  running: boolean;
  frames: number;
  fpsStartedAt: number;
}

export function mountKodexRippleFloor(root: HTMLElement): () => void {
  const canvasElement = root.querySelector<HTMLCanvasElement>("canvas");
  if (!canvasElement) {
    throw new Error("KDX_RIPPLE_FLOOR: canvas not found.");
  }

  const glContext = canvasElement.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });

  if (!glContext) {
    root.classList.add("is-fallback");
    return () => undefined;
  }

  const canvas: HTMLCanvasElement = canvasElement;
  const gl: WebGL2RenderingContext = glContext;

  const shaderBase = root.dataset.shaderBase || "/assets/kodex/shaders";
  const cta = root.querySelector<HTMLButtonElement>("[data-kdx-activate]");
  const micButton = root.querySelector<HTMLButtonElement>("[data-kdx-mic]");
  const stateLabel = root.querySelector<HTMLElement>("[data-kdx-state]");
  const fpsLabel = root.querySelector<HTMLElement>("[data-kdx-fps]");

  const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = matchMedia("(pointer: coarse)").matches;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowPower = coarsePointer || (typeof deviceMemory === "number" && deviceMemory <= 4);

  let destroyed = false;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let frameHandle = 0;
  let renderFrame: FrameRequestCallback | null = null;

  const runtime: RippleRuntime = {
    startedAt: performance.now(),
    previousAt: performance.now(),
    pointer: [0.5, 0.62],
    previousPointer: [0.5, 0.62],
    targetPointer: [0.5, 0.62],
    pointerVelocity: [0, 0],
    visualState: 0,
    progress: 0,
    openingAt: 0,
    impactStartedAt: -1,
    impactOrigin: [0.5, 0.62],
    reducedMotion: reducedMotionQuery.matches ? 1 : 0,
    quality: lowPower ? 0.46 : 0.94,
    audioLow: 0,
    audioMid: 0,
    audioHigh: 0,
    audioContext: null,
    analyser: null,
    frequencyData: null,
    stream: null,
    running: true,
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

  const createProgram = (
    vertexSource: string,
    fragmentSource: string,
  ): WebGLProgram => {
    const nextProgram = gl.createProgram();
    if (!nextProgram) throw new Error("Unable to create program.");

    const vertex = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    gl.attachShader(nextProgram, vertex);
    gl.attachShader(nextProgram, fragment);
    gl.linkProgram(nextProgram);

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(nextProgram) || "Unknown link error.";
      gl.deleteProgram(nextProgram);
      throw new Error(log);
    }

    return nextProgram;
  };

  const setVisualState = (value: number): void => {
    runtime.visualState = value;
    const label = value < 0.5 ? "DORMANT" : value < 1.5 ? "AWARE" : "OPEN";

    if (stateLabel) stateLabel.textContent = label;
    root.dataset.state = String(value);
  };

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, lowPower ? 1.3 : 1.85);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const pointerToNormalized = (event: PointerEvent): [number, number] => {
    const rect = canvas.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height)),
    ];
  };

  const updatePointer = (event: PointerEvent): void => {
    runtime.targetPointer = pointerToNormalized(event);
    if (runtime.visualState < 1) setVisualState(1);
  };

  const triggerImpact = (event: PointerEvent): void => {
    runtime.targetPointer = pointerToNormalized(event);
    runtime.impactOrigin = [...runtime.targetPointer];
    runtime.impactStartedAt = performance.now();

    if (runtime.visualState < 1) setVisualState(1);
  };

  const resetPointer = (): void => {
    runtime.targetPointer = [0.5, 0.62];
  };

  const enableMicrophone = async (): Promise<void> => {
    if (!navigator.mediaDevices?.getUserMedia) return;

    if (runtime.audioContext) {
      await runtime.audioContext.resume();
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();

    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.84;
    source.connect(analyser);

    runtime.stream = stream;
    runtime.audioContext = context;
    runtime.analyser = analyser;
    runtime.frequencyData = new Uint8Array(analyser.frequencyBinCount);

    micButton?.classList.add("is-active");
    micButton?.setAttribute("aria-pressed", "true");
  };

  const updateAudio = (time: number): void => {
    const analyser = runtime.analyser;
    const frequencyData = runtime.frequencyData;

    if (analyser && frequencyData) {
      analyser.getByteFrequencyData(frequencyData);

      const average = (from: number, to: number): number => {
        let sum = 0;
        const upper = Math.min(to, frequencyData.length);

        for (let index = from; index < upper; index += 1) {
          sum += frequencyData[index];
        }

        return sum / Math.max(1, upper - from) / 255;
      };

      runtime.audioLow += (average(1, 18) - runtime.audioLow) * 0.14;
      runtime.audioMid += (average(18, 90) - runtime.audioMid) * 0.12;
      runtime.audioHigh += (average(90, 260) - runtime.audioHigh) * 0.10;
    } else {
      runtime.audioLow = 0.075 + Math.sin(time * 0.73) * 0.025;
      runtime.audioMid = 0.040 + Math.sin(time * 1.21 + 1.4) * 0.016;
      runtime.audioHigh = 0.025 + Math.sin(time * 2.37 + 0.5) * 0.010;
    }
  };

  const activate = (): void => {
    if (runtime.visualState >= 2) return;

    setVisualState(2);
    runtime.openingAt = performance.now();
    runtime.progress = 0;
    runtime.impactOrigin = [0.5, 0.58];
    runtime.impactStartedAt = performance.now();

    document.dispatchEvent(
      new CustomEvent("kodex:ripple-open", {
        detail: {
          concept: "KDX_RIPPLE_FLOOR",
          index: 4,
        },
      }),
    );
  };

  const handleMicClick = (): void => {
    enableMicrophone().catch((error: unknown) => {
      console.warn("KDX microphone unavailable:", error);
    });
  };

  const handleReducedMotion = (event: MediaQueryListEvent): void => {
    runtime.reducedMotion = event.matches ? 1 : 0;
  };

  const handleVisibility = (): void => {
    runtime.running = !document.hidden;
    if (runtime.running && renderFrame) {
      runtime.previousAt = performance.now();
      frameHandle = requestAnimationFrame(renderFrame);
    }
  };

  canvas.addEventListener("pointermove", updatePointer, { passive: true });
  canvas.addEventListener("pointerdown", triggerImpact, { passive: true });
  canvas.addEventListener("pointerleave", resetPointer);
  cta?.addEventListener("click", activate);
  micButton?.addEventListener("click", handleMicClick);
  reducedMotionQuery.addEventListener("change", handleReducedMotion);
  document.addEventListener("visibilitychange", handleVisibility);

  const init = async (): Promise<void> => {
    const [vertexSource, fragmentSource] = await Promise.all([
      fetch(`${shaderBase}/fullscreen.vert.glsl`).then((response) => {
        if (!response.ok) throw new Error(`Vertex shader HTTP ${response.status}`);
        return response.text();
      }),
      fetch(`${shaderBase}/ripple-floor.frag.glsl`).then((response) => {
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

    const uniformNames = [
      "u_time", "u_delta", "u_resolution",
      "u_pointer", "u_pointerVelocity",
      "u_audioLow", "u_audioMid", "u_audioHigh",
      "u_state", "u_progress", "u_intensity",
      "u_seed", "u_reducedMotion", "u_quality",
      "u_impactAge", "u_impactOrigin",
    ];

    const uniforms: UniformMap = Object.fromEntries(
      uniformNames.map((name) => [name, gl.getUniformLocation(program!, name)]),
    );

    renderFrame = (now: number): void => {
      if (destroyed || !runtime.running || !program) return;

      resize();

      const elapsed = (now - runtime.startedAt) / 1000;
      const delta = Math.min((now - runtime.previousAt) / 1000, 0.1);
      runtime.previousAt = now;

      runtime.previousPointer[0] = runtime.pointer[0];
      runtime.previousPointer[1] = runtime.pointer[1];

      runtime.pointer[0] +=
        (runtime.targetPointer[0] - runtime.pointer[0]) * 0.09;
      runtime.pointer[1] +=
        (runtime.targetPointer[1] - runtime.pointer[1]) * 0.09;

      runtime.pointerVelocity[0] +=
        (
          runtime.pointer[0] -
          runtime.previousPointer[0] -
          runtime.pointerVelocity[0]
        ) * 0.22;

      runtime.pointerVelocity[1] +=
        (
          runtime.pointer[1] -
          runtime.previousPointer[1] -
          runtime.pointerVelocity[1]
        ) * 0.22;

      if (runtime.visualState >= 2 && runtime.openingAt > 0) {
        const raw = Math.min(1, (now - runtime.openingAt) / 1900);
        runtime.progress = raw * raw * (3 - 2 * raw);
      }

      const impactAge = runtime.impactStartedAt < 0
        ? -1
        : (now - runtime.impactStartedAt) / 1000;

      updateAudio(elapsed);

      gl.useProgram(program);
      gl.uniform1f(uniforms.u_time, elapsed);
      gl.uniform1f(uniforms.u_delta, delta);
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.u_pointer, runtime.pointer[0], runtime.pointer[1]);
      gl.uniform2f(
        uniforms.u_pointerVelocity,
        runtime.pointerVelocity[0],
        runtime.pointerVelocity[1],
      );
      gl.uniform1f(uniforms.u_audioLow, runtime.audioLow);
      gl.uniform1f(uniforms.u_audioMid, runtime.audioMid);
      gl.uniform1f(uniforms.u_audioHigh, runtime.audioHigh);
      gl.uniform1f(uniforms.u_state, runtime.visualState);
      gl.uniform1f(uniforms.u_progress, runtime.progress);
      gl.uniform1f(uniforms.u_intensity, 1);
      gl.uniform1f(uniforms.u_seed, 0.618);
      gl.uniform1f(uniforms.u_reducedMotion, runtime.reducedMotion);
      gl.uniform1f(uniforms.u_quality, runtime.quality);
      gl.uniform1f(uniforms.u_impactAge, impactAge);
      gl.uniform2f(
        uniforms.u_impactOrigin,
        runtime.impactOrigin[0],
        runtime.impactOrigin[1],
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      runtime.frames += 1;
      if (now - runtime.fpsStartedAt >= 1000) {
        const fps = Math.round(
          (runtime.frames * 1000) / (now - runtime.fpsStartedAt),
        );
        if (fpsLabel) fpsLabel.textContent = String(fps);
        runtime.frames = 0;
        runtime.fpsStartedAt = now;
      }

      frameHandle = requestAnimationFrame(renderFrame!);
    };

    setVisualState(0);
    frameHandle = requestAnimationFrame(renderFrame);
  };

  init().catch((error: unknown) => {
    console.error("KDX_RIPPLE_FLOOR:", error);
    root.classList.add("is-fallback");
  });

  return () => {
    destroyed = true;
    runtime.running = false;
    cancelAnimationFrame(frameHandle);
    resizeObserver.disconnect();
    runtime.stream?.getTracks().forEach((track) => track.stop());
    runtime.audioContext?.close().catch(() => undefined);

    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);

    canvas.removeEventListener("pointermove", updatePointer);
    canvas.removeEventListener("pointerdown", triggerImpact);
    canvas.removeEventListener("pointerleave", resetPointer);
    cta?.removeEventListener("click", activate);
    micButton?.removeEventListener("click", handleMicClick);
    reducedMotionQuery.removeEventListener("change", handleReducedMotion);
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}
