const canvas = document.querySelector('#kdx-canvas');
const shell = document.querySelector('.kdx-shell');
const fpsEl = document.querySelector('#fps');
const modeLabelEl = document.querySelector('#mode-label');
const gpuEl = document.querySelector('#gpu');

const modeNames = ['DUAL VANISH', 'RIPPLE FLOOR', 'SPLIT CORRIDOR', 'WRINKLED REALITY'];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const gl = canvas.getContext('webgl2', {
  alpha: false,
  antialias: false,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: false,
});

if (!gl) {
  gpuEl.textContent = 'WEBGL2 · UNAVAILABLE';
  shell.classList.add('is-fallback');
  throw new Error('WebGL2 is required for KODEX Spatial Engine.');
}

const vertexSource = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_position;
out vec2 v_uv;
void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;

const fragmentSource = await fetch('../shaders/spatial.frag.glsl').then((response) => {
  if (!response.ok) throw new Error(`Shader request failed: ${response.status}`);
  return response.text();
});

function compile(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log || 'Unknown shader compilation error');
  }
  return shader;
}

function createProgram(vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Program linking failed');
  }
  return program;
}

const program = createProgram(vertexSource, fragmentSource);
gl.useProgram(program);

const vertices = new Float32Array([-1,-1, 3,-1, -1,3]);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

const uniform = Object.fromEntries([
  'u_time','u_delta','u_resolution','u_pointer','u_audio','u_mode','u_progress',
  'u_intensity','u_reducedMotion','u_seed'
].map((name) => [name, gl.getUniformLocation(program, name)]));

let width = 1;
let height = 1;
let pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
let mode = 0;
let progress = 0.22;
let targetProgress = 0.22;
let audio = { low: 0, mid: 0, high: 0 };
let audioEnabled = false;
let analyser = null;
let frequencyData = null;
let audioContext = null;
let last = performance.now();
let elapsed = 0;
let frames = 0;
let fpsClock = last;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.35 : 1.75);
  width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
  height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}

function setMode(nextMode) {
  mode = (nextMode + modeNames.length) % modeNames.length;
  shell.dataset.mode = String(mode);
  modeLabelEl.textContent = modeNames[mode];
  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.classList.toggle('is-active', Number(button.dataset.mode) === mode);
  });
  targetProgress = mode === 2 ? 0.92 : 0.28;
}

function setPointer(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  pointer.tx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  pointer.ty = Math.min(1, Math.max(0, 1 - (clientY - rect.top) / rect.height));
}

window.addEventListener('pointermove', (event) => setPointer(event.clientX, event.clientY), { passive: true });
window.addEventListener('pointerdown', (event) => {
  setPointer(event.clientX, event.clientY);
  targetProgress = 1;
}, { passive: true });
window.addEventListener('pointerup', () => {
  targetProgress = mode === 2 ? 0.92 : 0.28;
}, { passive: true });
window.addEventListener('resize', resize, { passive: true });

for (const button of document.querySelectorAll('[data-mode]')) {
  button.addEventListener('click', () => setMode(Number(button.dataset.mode)));
}

document.querySelector('[data-action="next"]').addEventListener('click', () => setMode(mode + 1));
document.querySelector('[data-action="activate"]').addEventListener('click', () => {
  targetProgress = targetProgress > 0.8 ? 0.22 : 1;
});

document.querySelector('[data-action="mic"]').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  if (audioEnabled) {
    audioEnabled = false;
    await audioContext?.suspend();
    button.textContent = 'MIC · OFF';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioContext ??= new AudioContext();
    await audioContext.resume();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    audioEnabled = true;
    button.textContent = 'MIC · LIVE';
  } catch (error) {
    button.textContent = 'MIC · BLOCKED';
    console.warn('Microphone unavailable; procedural audio remains active.', error);
  }
});

function averageRange(data, start, end) {
  let sum = 0;
  const safeEnd = Math.min(end, data.length);
  for (let i = start; i < safeEnd; i += 1) sum += data[i];
  return safeEnd > start ? sum / (safeEnd - start) / 255 : 0;
}

function updateAudio(time) {
  let low;
  let mid;
  let high;

  if (audioEnabled && analyser && frequencyData) {
    analyser.getByteFrequencyData(frequencyData);
    low = averageRange(frequencyData, 1, 12);
    mid = averageRange(frequencyData, 12, 70);
    high = averageRange(frequencyData, 70, 180);
  } else {
    low = 0.18 + Math.sin(time * 1.3) * 0.06;
    mid = 0.10 + Math.sin(time * 2.1 + 1.2) * 0.04;
    high = 0.06 + Math.max(0, Math.sin(time * 4.7)) * 0.04;
  }

  audio.low += (low - audio.low) * 0.09;
  audio.mid += (mid - audio.mid) * 0.09;
  audio.high += (high - audio.high) * 0.09;
}

function render(now) {
  resize();
  const delta = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  if (!reducedMotion) elapsed += delta;

  pointer.x += (pointer.tx - pointer.x) * 0.075;
  pointer.y += (pointer.ty - pointer.y) * 0.075;
  progress += (targetProgress - progress) * 0.055;
  updateAudio(elapsed);

  gl.useProgram(program);
  gl.uniform1f(uniform.u_time, elapsed);
  gl.uniform1f(uniform.u_delta, delta);
  gl.uniform2f(uniform.u_resolution, width, height);
  gl.uniform2f(uniform.u_pointer, pointer.x, pointer.y);
  gl.uniform3f(uniform.u_audio, audio.low, audio.mid, audio.high);
  gl.uniform1f(uniform.u_mode, mode);
  gl.uniform1f(uniform.u_progress, progress);
  gl.uniform1f(uniform.u_intensity, 0.82);
  gl.uniform1f(uniform.u_reducedMotion, reducedMotion ? 1 : 0);
  gl.uniform1f(uniform.u_seed, 0.731);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  frames += 1;
  if (now - fpsClock > 650) {
    fpsEl.textContent = `FPS ${Math.round(frames * 1000 / (now - fpsClock))}`;
    frames = 0;
    fpsClock = now;
  }

  requestAnimationFrame(render);
}

setMode(0);
resize();
requestAnimationFrame(render);
