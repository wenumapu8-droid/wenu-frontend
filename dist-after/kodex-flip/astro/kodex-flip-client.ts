type UniformMap =
  Record<string, WebGLUniformLocation | null>;

interface RuntimeState {
  startedAt: number;
  previousAt: number;

  pointer: [number, number];
  previousPointer: [number, number];
  targetPointer: [number, number];
  pointerVelocity: [number, number];

  visualState: number;
  progress: number;
  openingAt: number;

  flipProgress: number;
  targetFlipProgress: number;
  flipPulseStartedAt: number;

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

export function mountKodexPerspectiveFlip(
  root: HTMLElement,
): () => void {
  const canvas =
    root.querySelector<HTMLCanvasElement>(
      "canvas",
    );

  if (!canvas) {
    throw new Error(
      "KDX_PERSPECTIVE_FLIP: canvas not found.",
    );
  }

  const gl =
    canvas.getContext("webgl2", {
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

  const shaderBase =
    root.dataset.shaderBase
    || "/assets/kodex/shaders";

  const cta =
    root.querySelector<HTMLButtonElement>(
      "[data-kdx-activate]",
    );

  const micButton =
    root.querySelector<HTMLButtonElement>(
      "[data-kdx-mic]",
    );

  const stateLabel =
    root.querySelector<HTMLElement>(
      "[data-kdx-state]",
    );

  const phaseLabel =
    root.querySelector<HTMLElement>(
      "[data-kdx-phase]",
    );

  const fpsLabel =
    root.querySelector<HTMLElement>(
      "[data-kdx-fps]",
    );

  const reducedMotionQuery =
    matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

  const coarsePointer =
    matchMedia("(pointer: coarse)").matches;

  const deviceMemory =
    (
      navigator as Navigator & {
        deviceMemory?: number;
      }
    ).deviceMemory;

  const lowPower =
    coarsePointer
    || (
      typeof deviceMemory === "number"
      && deviceMemory <= 4
    );

  const runtime: RuntimeState = {
    startedAt: performance.now(),
    previousAt: performance.now(),

    pointer: [0.5, 0.52],
    previousPointer: [0.5, 0.52],
    targetPointer: [0.5, 0.52],
    pointerVelocity: [0, 0],

    visualState: 0,
    progress: 0,
    openingAt: 0,

    flipProgress: 0,
    targetFlipProgress: 0,
    flipPulseStartedAt: -1,

    reducedMotion:
      reducedMotionQuery.matches ? 1 : 0,

    quality:
      lowPower ? 0.38 : 0.86,

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

  let destroyed = false;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;

  const compileShader = (
    type: number,
    source: string,
  ): WebGLShader => {
    const shader =
      gl.createShader(type);

    if (!shader) {
      throw new Error(
        "Unable to create shader.",
      );
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (
      !gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS,
      )
    ) {
      const log =
        gl.getShaderInfoLog(shader)
        || "Unknown shader error.";

      gl.deleteShader(shader);
      throw new Error(log);
    }

    return shader;
  };

  const createProgram = (
    vertexSource: string,
    fragmentSource: string,
  ): WebGLProgram => {
    const nextProgram =
      gl.createProgram();

    if (!nextProgram) {
      throw new Error(
        "Unable to create program.",
      );
    }

    const vertex =
      compileShader(
        gl.VERTEX_SHADER,
        vertexSource,
      );

    const fragment =
      compileShader(
        gl.FRAGMENT_SHADER,
        fragmentSource,
      );

    gl.attachShader(
      nextProgram,
      vertex,
    );

    gl.attachShader(
      nextProgram,
      fragment,
    );

    gl.linkProgram(nextProgram);

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    if (
      !gl.getProgramParameter(
        nextProgram,
        gl.LINK_STATUS,
      )
    ) {
      const log =
        gl.getProgramInfoLog(nextProgram)
        || "Unknown program link error.";

      gl.deleteProgram(nextProgram);
      throw new Error(log);
    }

    return nextProgram;
  };

  const setVisualState = (
    value: number,
  ): void => {
    runtime.visualState = value;

    if (stateLabel) {
      stateLabel.textContent =
        value < 0.5
          ? "DORMANT"
          : value < 1.5
            ? "AWARE"
            : "OPEN";
    }

    root.dataset.state =
      String(value);
  };

  const setPhaseLabel = (): void => {
    if (!phaseLabel) return;

    phaseLabel.textContent =
      runtime.flipProgress < 0.35
        ? "PROJECTION A"
        : runtime.flipProgress > 0.65
          ? "PROJECTION B"
          : "IMPOSSIBLE";
  };

  const resize = (): void => {
    const rect =
      canvas.getBoundingClientRect();

    const dpr =
      Math.min(
        devicePixelRatio || 1,
        lowPower ? 1.18 : 1.64,
      );

    const width =
      Math.max(
        1,
        Math.round(
          rect.width * dpr,
        ),
      );

    const height =
      Math.max(
        1,
        Math.round(
          rect.height * dpr,
        ),
      );

    if (
      canvas.width !== width
      || canvas.height !== height
    ) {
      canvas.width = width;
      canvas.height = height;

      gl.viewport(
        0,
        0,
        width,
        height,
      );
    }
  };

  const resizeObserver =
    new ResizeObserver(resize);

  resizeObserver.observe(canvas);

  const pointerToNormalized = (
    event: PointerEvent,
  ): [number, number] => {
    const rect =
      canvas.getBoundingClientRect();

    return [
      Math.min(
        1,
        Math.max(
          0,
          (
            event.clientX
            - rect.left
          ) / rect.width,
        ),
      ),

      Math.min(
        1,
        Math.max(
          0,
          1
          - (
            event.clientY
            - rect.top
          ) / rect.height,
        ),
      ),
    ];
  };

  const updatePointer = (
    event: PointerEvent,
  ): void => {
    runtime.targetPointer =
      pointerToNormalized(event);

    if (
      runtime.visualState < 1
    ) {
      setVisualState(1);
    }

    if (
      runtime.visualState < 2
    ) {
      runtime.targetFlipProgress =
        runtime.targetPointer[0];
    }
  };

  const triggerFlip = (
    event: PointerEvent,
  ): void => {
    runtime.targetPointer =
      pointerToNormalized(event);

    runtime.targetFlipProgress =
      runtime.flipProgress < 0.5
        ? 1
        : 0;

    runtime.flipPulseStartedAt =
      performance.now();

    if (
      runtime.visualState < 1
    ) {
      setVisualState(1);
    }
  };

  const enableMicrophone =
    async (): Promise<void> => {
      if (
        !navigator.mediaDevices
          ?.getUserMedia
      ) {
        return;
      }

      if (runtime.audioContext) {
        await runtime.audioContext.resume();
        return;
      }

      const stream =
        await navigator.mediaDevices
          .getUserMedia({
            audio: true,
          });

      const context =
        new AudioContext();

      const source =
        context
          .createMediaStreamSource(
            stream,
          );

      const analyser =
        context.createAnalyser();

      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.84;

      source.connect(analyser);

      runtime.stream = stream;
      runtime.audioContext = context;
      runtime.analyser = analyser;
      runtime.frequencyData =
        new Uint8Array(
          analyser.frequencyBinCount,
        );

      micButton?.classList.add(
        "is-active",
      );

      micButton?.setAttribute(
        "aria-pressed",
        "true",
      );
    };

  const updateAudio = (
    time: number,
  ): void => {
    if (
      runtime.analyser
      && runtime.frequencyData
    ) {
      runtime.analyser
        .getByteFrequencyData(
          runtime.frequencyData,
        );

      const average = (
        from: number,
        to: number,
      ): number => {
        let sum = 0;

        const upper =
          Math.min(
            to,
            runtime.frequencyData!.length,
          );

        for (
          let index = from;
          index < upper;
          index += 1
        ) {
          sum +=
            runtime.frequencyData![index];
        }

        return (
          sum
          / Math.max(
              1,
              upper - from,
            )
          / 255
        );
      };

      runtime.audioLow +=
        (
          average(1, 18)
          - runtime.audioLow
        ) * 0.14;

      runtime.audioMid +=
        (
          average(18, 92)
          - runtime.audioMid
        ) * 0.12;

      runtime.audioHigh +=
        (
          average(92, 260)
          - runtime.audioHigh
        ) * 0.10;
    } else {
      runtime.audioLow =
        0.075
        + Math.sin(
            time * 0.71,
          ) * 0.024;

      runtime.audioMid =
        0.040
        + Math.sin(
            time * 1.19 + 1.4,
          ) * 0.016;

      runtime.audioHigh =
        0.025
        + Math.sin(
            time * 2.41 + 0.5,
          ) * 0.010;
    }
  };

  const activate = (): void => {
    if (
      runtime.visualState >= 2
    ) {
      return;
    }

    setVisualState(2);

    runtime.openingAt =
      performance.now();

    runtime.progress = 0;
    runtime.targetFlipProgress = 1;

    runtime.flipPulseStartedAt =
      performance.now();

    document.dispatchEvent(
      new CustomEvent(
        "kodex:perspective-open",
        {
          detail: {
            concept:
              "KDX_PERSPECTIVE_FLIP",

            index: 7,

            projection:
              "B",
          },
        },
      ),
    );
  };

  const onPointerLeave =
    (): void => {
      runtime.targetPointer =
        [0.5, 0.52];
    };

  const onMicClick =
    (): void => {
      enableMicrophone()
        .catch((error) => {
          console.warn(
            "KDX microphone unavailable:",
            error,
          );
        });
    };

  const onReducedMotion = (
    event: MediaQueryListEvent,
  ): void => {
    runtime.reducedMotion =
      event.matches ? 1 : 0;
  };

  const init =
    async (): Promise<void> => {
      const [
        vertexSource,
        fragmentSource,
      ] = await Promise.all([
        fetch(
          `${shaderBase}/fullscreen.vert.glsl`,
        ).then((response) => {
          if (!response.ok) {
            throw new Error(
              `Vertex shader HTTP ${response.status}`,
            );
          }

          return response.text();
        }),

        fetch(
          `${shaderBase}/perspective-flip.frag.glsl`,
        ).then((response) => {
          if (!response.ok) {
            throw new Error(
              `Fragment shader HTTP ${response.status}`,
            );
          }

          return response.text();
        }),
      ]);

      if (destroyed) return;

      program =
        createProgram(
          vertexSource,
          fragmentSource,
        );

      gl.useProgram(program);

      const positions =
        new Float32Array([
          -1, -1,
           1, -1,
          -1,  1,

          -1,  1,
           1, -1,
           1,  1,
        ]);

      buffer = gl.createBuffer();

      gl.bindBuffer(
        gl.ARRAY_BUFFER,
        buffer,
      );

      gl.bufferData(
        gl.ARRAY_BUFFER,
        positions,
        gl.STATIC_DRAW,
      );

      const positionLocation =
        gl.getAttribLocation(
          program,
          "a_position",
        );

      gl.enableVertexAttribArray(
        positionLocation,
      );

      gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0,
      );

      const names = [
        "u_time",
        "u_delta",
        "u_resolution",

        "u_pointer",
        "u_pointerVelocity",

        "u_audioLow",
        "u_audioMid",
        "u_audioHigh",

        "u_state",
        "u_progress",
        "u_flipProgress",
        "u_flipPulseAge",

        "u_intensity",
        "u_seed",
        "u_reducedMotion",
        "u_quality",
      ];

      const uniforms: UniformMap =
        Object.fromEntries(
          names.map((name) => [
            name,
            gl.getUniformLocation(
              program!,
              name,
            ),
          ]),
        );

      const render = (
        now: number,
      ): void => {
        if (
          destroyed
          || !runtime.running
          || !program
        ) {
          return;
        }

        resize();

        const elapsed =
          (
            now - runtime.startedAt
          ) / 1000;

        const delta =
          Math.min(
            (
              now - runtime.previousAt
            ) / 1000,
            0.1,
          );

        runtime.previousAt = now;

        runtime.previousPointer[0] =
          runtime.pointer[0];

        runtime.previousPointer[1] =
          runtime.pointer[1];

        runtime.pointer[0] +=
          (
            runtime.targetPointer[0]
            - runtime.pointer[0]
          ) * 0.082;

        runtime.pointer[1] +=
          (
            runtime.targetPointer[1]
            - runtime.pointer[1]
          ) * 0.082;

        runtime.pointerVelocity[0] +=
          (
            runtime.pointer[0]
            - runtime.previousPointer[0]
            - runtime.pointerVelocity[0]
          ) * 0.22;

        runtime.pointerVelocity[1] +=
          (
            runtime.pointer[1]
            - runtime.previousPointer[1]
            - runtime.pointerVelocity[1]
          ) * 0.22;

        const flipRate =
          runtime.visualState >= 2
            ? 0.045
            : 0.085;

        runtime.flipProgress +=
          (
            runtime.targetFlipProgress
            - runtime.flipProgress
          ) * flipRate;

        setPhaseLabel();

        if (
          runtime.visualState >= 2
          && runtime.openingAt > 0
        ) {
          const raw =
            Math.min(
              1,
              (
                now
                - runtime.openingAt
              ) / 1950,
            );

          runtime.progress =
            raw
            * raw
            * (3 - 2 * raw);
        }

        const flipPulseAge =
          runtime.flipPulseStartedAt < 0
            ? -1
            : (
                now
                - runtime.flipPulseStartedAt
              ) / 1000;

        updateAudio(elapsed);

        gl.useProgram(program);

        gl.uniform1f(
          uniforms.u_time,
          elapsed,
        );

        gl.uniform1f(
          uniforms.u_delta,
          delta,
        );

        gl.uniform2f(
          uniforms.u_resolution,
          canvas.width,
          canvas.height,
        );

        gl.uniform2f(
          uniforms.u_pointer,
          runtime.pointer[0],
          runtime.pointer[1],
        );

        gl.uniform2f(
          uniforms.u_pointerVelocity,
          runtime.pointerVelocity[0],
          runtime.pointerVelocity[1],
        );

        gl.uniform1f(
          uniforms.u_audioLow,
          runtime.audioLow,
        );

        gl.uniform1f(
          uniforms.u_audioMid,
          runtime.audioMid,
        );

        gl.uniform1f(
          uniforms.u_audioHigh,
          runtime.audioHigh,
        );

        gl.uniform1f(
          uniforms.u_state,
          runtime.visualState,
        );

        gl.uniform1f(
          uniforms.u_progress,
          runtime.progress,
        );

        gl.uniform1f(
          uniforms.u_flipProgress,
          runtime.flipProgress,
        );

        gl.uniform1f(
          uniforms.u_flipPulseAge,
          flipPulseAge,
        );

        gl.uniform1f(
          uniforms.u_intensity,
          1,
        );

        gl.uniform1f(
          uniforms.u_seed,
          0.777,
        );

        gl.uniform1f(
          uniforms.u_reducedMotion,
          runtime.reducedMotion,
        );

        gl.uniform1f(
          uniforms.u_quality,
          runtime.quality,
        );

        gl.drawArrays(
          gl.TRIANGLES,
          0,
          6,
        );

        runtime.frames += 1;

        if (
          now - runtime.fpsStartedAt
          >= 1000
        ) {
          const fps =
            Math.round(
              runtime.frames
              * 1000
              / (
                now
                - runtime.fpsStartedAt
              ),
            );

          if (fpsLabel) {
            fpsLabel.textContent =
              String(fps);
          }

          runtime.frames = 0;
          runtime.fpsStartedAt = now;
        }

        runtime.frameHandle =
          requestAnimationFrame(
            render,
          );
      };

      resize();

      runtime.frameHandle =
        requestAnimationFrame(
          render,
        );
    };

  canvas.addEventListener(
    "pointermove",
    updatePointer,
    { passive: true },
  );

  canvas.addEventListener(
    "pointerdown",
    triggerFlip,
    { passive: true },
  );

  canvas.addEventListener(
    "pointerleave",
    onPointerLeave,
  );

  cta?.addEventListener(
    "click",
    activate,
  );

  micButton?.addEventListener(
    "click",
    onMicClick,
  );

  reducedMotionQuery
    .addEventListener(
      "change",
      onReducedMotion,
    );

  setVisualState(0);
  setPhaseLabel();

  init().catch((error) => {
    console.error(
      "KDX_PERSPECTIVE_FLIP:",
      error,
    );

    root.classList.add(
      "is-fallback",
    );
  });

  return () => {
    destroyed = true;
    runtime.running = false;

    cancelAnimationFrame(
      runtime.frameHandle,
    );

    resizeObserver.disconnect();

    runtime.stream
      ?.getTracks()
      .forEach((track) => {
        track.stop();
      });

    runtime.audioContext
      ?.close()
      .catch(() => undefined);

    if (buffer) {
      gl.deleteBuffer(buffer);
    }

    if (program) {
      gl.deleteProgram(program);
    }

    canvas.removeEventListener(
      "pointermove",
      updatePointer,
    );

    canvas.removeEventListener(
      "pointerdown",
      triggerFlip,
    );

    canvas.removeEventListener(
      "pointerleave",
      onPointerLeave,
    );

    cta?.removeEventListener(
      "click",
      activate,
    );

    micButton?.removeEventListener(
      "click",
      onMicClick,
    );

    reducedMotionQuery
      .removeEventListener(
        "change",
        onReducedMotion,
      );
  };
}
