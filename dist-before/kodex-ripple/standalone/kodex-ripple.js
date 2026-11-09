const root = document.querySelector("[data-kdx-ripple]");
const canvas = root?.querySelector("canvas");
const cta = root?.querySelector("[data-kdx-activate]");
const micButton = root?.querySelector("[data-kdx-mic]");
const stateLabel = root?.querySelector("[data-kdx-state]");
const fpsLabel = root?.querySelector("[data-kdx-fps]");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("KDX_RIPPLE_FLOOR: canvas not found.");
}

const gl = canvas.getContext("webgl2", {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: "high-performance",
});

if (!gl) {
  root?.classList.add("is-fallback");
  throw new Error("WebGL2 is not available.");
}

const [vertexSource, fragmentSource] = await Promise.all([
  fetch("../shaders/fullscreen.vert.glsl").then((response) => response.text()),
  fetch("../shaders/ripple-floor.frag.glsl").then((response) => response.text()),
]);

function compileShader(type, source) {
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
}

function createProgram() {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create program.");

  const vertex = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "Unknown link error.";
    gl.deleteProgram(program);
    throw new Error(log);
  }

  return program;
}

const program = createProgram();
gl.useProgram(program);

const positions = new Float32Array([
  -1, -1, 1, -1, -1, 1,
  -1, 1, 1, -1, 1, 1,
]);

const buffer = gl.createBuffer();
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

const uniforms = Object.fromEntries(
  uniformNames.map((name) => [name, gl.getUniformLocation(program, name)])
);

const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointer = matchMedia("(pointer: coarse)").matches;
const lowMemory =
  typeof navigator.deviceMemory === "number" &&
  navigator.deviceMemory <= 4;

const lowPower = coarsePointer || lowMemory;

const runtime = {
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

function setVisualState(value) {
  runtime.visualState = value;
  const label =
    value < 0.5 ? "DORMANT" :
    value < 1.5 ? "AWARE" :
    "OPEN";

  if (stateLabel) stateLabel.textContent = label;
  root?.setAttribute("data-state", String(value));
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, lowPower ? 1.3 : 1.85);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(canvas);
resize();

function pointerToNormalized(event) {
  const rect = canvas.getBoundingClientRect();
  return [
    Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height)),
  ];
}

function updatePointer(event) {
  runtime.targetPointer = pointerToNormalized(event);
  if (runtime.visualState < 1) setVisualState(1);
}

function triggerImpact(event) {
  runtime.targetPointer = pointerToNormalized(event);
  runtime.impactOrigin = [...runtime.targetPointer];
  runtime.impactStartedAt = performance.now();

  if (runtime.visualState < 1) setVisualState(1);
}

canvas.addEventListener("pointermove", updatePointer, { passive: true });
canvas.addEventListener("pointerdown", triggerImpact, { passive: true });
canvas.addEventListener("pointerleave", () => {
  runtime.targetPointer = [0.5, 0.62];
});

async function enableMicrophone() {
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
}

micButton?.addEventListener("click", () => {
  enableMicrophone().catch((error) => {
    console.warn("KDX microphone unavailable:", error);
  });
});

function updateAudio(time) {
  if (runtime.analyser && runtime.frequencyData) {
    runtime.analyser.getByteFrequencyData(runtime.frequencyData);

    const average = (from, to) => {
      let sum = 0;
      const upper = Math.min(to, runtime.frequencyData.length);
      for (let index = from; index < upper; index += 1) {
        sum += runtime.frequencyData[index];
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
}

function activate() {
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
    })
  );
}

cta?.addEventListener("click", activate);

function render(now) {
  if (!runtime.running) return;

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

  const impactAge =
    runtime.impactStartedAt < 0
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
    runtime.pointerVelocity[1]
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
    runtime.impactOrigin[1]
  );

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  runtime.frames += 1;
  if (now - runtime.fpsStartedAt >= 1000) {
    const fps = Math.round(
      (runtime.frames * 1000) / (now - runtime.fpsStartedAt)
    );
    if (fpsLabel) fpsLabel.textContent = String(fps);
    runtime.frames = 0;
    runtime.fpsStartedAt = now;
  }

  requestAnimationFrame(render);
}

document.addEventListener("visibilitychange", () => {
  runtime.running = !document.hidden;
  if (runtime.running) {
    runtime.previousAt = performance.now();
    requestAnimationFrame(render);
  }
});

reducedMotionQuery.addEventListener("change", (event) => {
  runtime.reducedMotion = event.matches ? 1 : 0;
});

setVisualState(0);
requestAnimationFrame(render);

window.addEventListener("pagehide", () => {
  runtime.running = false;
  resizeObserver.disconnect();
  runtime.stream?.getTracks().forEach((track) => track.stop());
  runtime.audioContext?.close().catch(() => undefined);
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
}, { once: true });
