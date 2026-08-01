const root = document.querySelector("[data-kdx-impossible]");
const canvas = root?.querySelector("canvas");
const cta = root?.querySelector("[data-kdx-activate]");
const micButton = root?.querySelector("[data-kdx-mic]");
const stateLabel = root?.querySelector("[data-kdx-state]");
const fpsLabel = root?.querySelector("[data-kdx-fps]");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("KDX_IMPOSSIBLE_STRUCTURE: canvas not found.");
}

const gl = canvas.getContext("webgl2", {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  preserveDrawingBuffer: false,
  powerPreference: "high-performance",
});

if (!gl) {
  root?.classList.add("is-fallback");
  throw new Error("WebGL2 is not available.");
}

const shaderBase = "../shaders";
const [vertexSource, fragmentSource] = await Promise.all([
  fetch(`${shaderBase}/fullscreen.vert.glsl`).then((r) => r.text()),
  fetch(`${shaderBase}/impossible-structure.frag.glsl`).then((r) => r.text()),
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
  if (!program) throw new Error("Unable to create WebGL program.");

  const vertex = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "Unknown program link error.";
    gl.deleteProgram(program);
    throw new Error(log);
  }

  return program;
}

const program = createProgram();
gl.useProgram(program);

const positions = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
  -1,  1,
   1, -1,
   1,  1,
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const uniforms = Object.fromEntries(
  [
    "u_time", "u_delta", "u_resolution", "u_pointer",
    "u_audioLow", "u_audioMid", "u_audioHigh",
    "u_state", "u_progress", "u_intensity", "u_seed",
    "u_reducedMotion", "u_quality",
  ].map((name) => [name, gl.getUniformLocation(program, name)])
);

const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointer = matchMedia("(pointer: coarse)").matches;
const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
const lowPower = coarsePointer || lowMemory;

const state = {
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
  frames: 0,
  fpsStartedAt: performance.now(),
};

function setVisualState(nextState) {
  state.visualState = nextState;
  if (stateLabel) {
    stateLabel.textContent =
      nextState < 0.5 ? "DORMANT" :
      nextState < 1.5 ? "AWARE" :
      "OPEN";
  }
  root?.setAttribute("data-state", String(nextState));
}

function resize() {
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
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(canvas);
resize();

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  state.targetPointer[0] = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  state.targetPointer[1] = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));

  if (state.visualState < 1) setVisualState(1);
}

canvas.addEventListener("pointermove", updatePointer, { passive: true });
canvas.addEventListener("pointerdown", updatePointer, { passive: true });

canvas.addEventListener("pointerleave", () => {
  state.targetPointer = [0.5, 0.5];
});

reducedMotionQuery.addEventListener("change", (event) => {
  state.reducedMotion = event.matches ? 1 : 0;
});

async function enableMicrophone() {
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
}

micButton?.addEventListener("click", () => {
  enableMicrophone().catch((error) => {
    console.warn("KDX microphone unavailable:", error);
  });
});

function updateAudio(time) {
  if (state.analyser && state.frequencyData) {
    state.analyser.getByteFrequencyData(state.frequencyData);

    const average = (from, to) => {
      let sum = 0;
      const upper = Math.min(to, state.frequencyData.length);
      for (let index = from; index < upper; index += 1) {
        sum += state.frequencyData[index];
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
}

function activate() {
  if (state.visualState >= 2) return;

  setVisualState(2);
  state.openingAt = performance.now();
  state.progress = 0;

  document.dispatchEvent(
    new CustomEvent("kodex:impossible-open", {
      detail: { concept: "KDX_IMPOSSIBLE_STRUCTURE", index: 2 },
    })
  );
}

cta?.addEventListener("click", activate);

function render(now) {
  if (!state.running) return;

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

  requestAnimationFrame(render);
}

document.addEventListener("visibilitychange", () => {
  state.running = !document.hidden;
  if (state.running) {
    state.previousAt = performance.now();
    requestAnimationFrame(render);
  }
});

setVisualState(0);
requestAnimationFrame(render);

window.addEventListener("pagehide", () => {
  state.running = false;
  resizeObserver.disconnect();
  state.stream?.getTracks().forEach((track) => track.stop());
  state.audioContext?.close().catch(() => undefined);
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
}, { once: true });
