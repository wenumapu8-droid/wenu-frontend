import vertexShaderSource from '../../observe-v2/shaders/fullscreen.vert.glsl?raw';
import fragmentShaderSource from '../../observe-v2/shaders/source.frag.glsl?raw';

export const WEBGL_SOURCE_SHADER_SPEC = Object.freeze({
  id: 'observe-source-field',
  rendererKind: 'webgl-shader',
  shaderRole: 'SOURCE_GENERATOR',
  sourceVertex: 'src/kodex/observe-v2/shaders/fullscreen.vert.glsl',
  sourceFragment: 'src/kodex/observe-v2/shaders/source.frag.glsl',
  temporalContract: 'AMBIENT_UNCLOSED',
  seamlessLoopClaim: false,
  targetFps: 30,
  dprCap: 1.5,
  reducedMotion: 'STATIC_TIME_FRAME',
  fallback: 'STATIC_CANVAS_RETICLE',
  provenance: 'KODEX_INTERNAL_SHADER_REUSE',
});

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function compileShader(gl, type, source, label) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error(`${label}: unable to create shader`);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || 'unknown compile error';
    gl.deleteShader(shader);
    throw new Error(`${label}: ${log}`);
  }
  return shader;
}

function createProgram(gl) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource, 'HoloCore vertex shader');
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource, 'HoloCore source shader');
  const program = gl.createProgram();
  if (!program) throw new Error('HoloCore WebGL: unable to create program');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || 'unknown link error';
    gl.deleteProgram(program);
    throw new Error(`HoloCore WebGL program: ${log}`);
  }
  return program;
}

function getUniformLocations(gl, program) {
  const names = [
    'u_time',
    'u_delta',
    'u_resolution',
    'u_pointer',
    'u_pointerVelocity',
    'u_audioLow',
    'u_audioMid',
    'u_audioHigh',
    'u_state',
    'u_transition',
    'u_intensity',
    'u_seed',
    'u_feedbackAmount',
    'u_scanPosition',
    'u_reducedMotion',
    'u_particleScale',
  ];
  return Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, name)]));
}

function drawFallback(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return false;
  const width = Math.max(1, canvas.width);
  const height = Math.max(1, canvas.height);
  const cx = width * 0.5;
  const cy = height * 0.5;
  const scale = Math.min(width, height);

  ctx.fillStyle = '#05030b';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#714db8';
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = Math.max(1, scale * 0.0018);

  for (const radius of [0.16, 0.27, 0.39]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, scale * radius, scale * radius * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = '#71d9e9';
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - scale * 0.36, cy);
  ctx.quadraticCurveTo(cx, cy - scale * 0.2, cx + scale * 0.36, cy);
  ctx.quadraticCurveTo(cx, cy + scale * 0.2, cx - scale * 0.36, cy);
  ctx.stroke();

  ctx.fillStyle = '#d9c9ff';
  ctx.globalAlpha = 0.86;
  ctx.beginPath();
  ctx.arc(cx, cy, scale * 0.042, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = '#7de9ff';
  ctx.fillRect(0, Math.round(cy + scale * 0.18), width, Math.max(1, Math.round(scale * 0.002)));
  ctx.globalAlpha = 1;
  canvas.dataset.fallbackFrame = 'static-reticle';
  return true;
}

export class WebGLSourceShaderRenderer {
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError('WebGLSourceShaderRenderer requires a canvas element.');
    }

    this.canvas = canvas;
    this.reducedMotion = options.reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.targetFps = options.targetFps ?? WEBGL_SOURCE_SHADER_SPEC.targetFps;
    this.frameInterval = 1000 / this.targetFps;
    this.dprCap = options.dprCap ?? WEBGL_SOURCE_SHADER_SPEC.dprCap;
    this.staticTime = options.staticTime ?? 6.75;
    this.seed = options.seed ?? 11.73;
    this.state = options.state ?? 0.78;
    this.transition = options.transition ?? 0.86;
    this.intensity = options.intensity ?? 0.72;
    this.particleScale = options.particleScale ?? 0.68;
    this.pointerTarget = { x: 0, y: 0 };
    this.pointer = { x: 0, y: 0 };
    this.pointerVelocity = { x: 0, y: 0 };
    this.lastPointer = { x: 0, y: 0 };
    this.running = false;
    this.destroyed = false;
    this.lastFrame = 0;
    this.frameCount = 0;
    this.raf = 0;
    this.resizeObserver = null;
    this.mode = 'initializing';

    this.gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });

    if (!this.gl) {
      this.mode = 'canvas-fallback';
      this.resizeCanvasFallback();
      drawFallback(this.canvas);
      this.canvas.dataset.rendererMode = this.mode;
      this.canvas.dataset.temporalContract = WEBGL_SOURCE_SHADER_SPEC.temporalContract;
      return;
    }

    const gl = this.gl;
    this.program = createProgram(gl);
    this.uniforms = getUniformLocations(gl, this.program);
    this.vao = gl.createVertexArray();
    this.buffer = gl.createBuffer();
    if (!this.vao || !this.buffer) throw new Error('HoloCore WebGL: unable to create fullscreen geometry');

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.mode = 'webgl-source';
    this.canvas.dataset.rendererMode = this.mode;
    this.canvas.dataset.temporalContract = WEBGL_SOURCE_SHADER_SPEC.temporalContract;
    this.canvas.dataset.seamlessLoopClaim = 'false';
    this.canvas.dataset.targetFps = String(this.targetFps);

    this.bindPointer();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.resize();
  }

  resizeCanvasFallback() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.canvas.width = Math.max(1, Math.round((rect.width || window.innerWidth) * dpr));
    this.canvas.height = Math.max(1, Math.round((rect.height || window.innerHeight) * dpr));
  }

  resize() {
    if (!this.gl) {
      this.resizeCanvasFallback();
      drawFallback(this.canvas);
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    const width = Math.max(1, Math.round((rect.width || window.innerWidth) * dpr));
    const height = Math.max(1, Math.round((rect.height || window.innerHeight) * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.gl.viewport(0, 0, width, height);
  }

  bindPointer() {
    if (!this.gl) return;
    this.onPointerMove = event => {
      if (this.reducedMotion) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = clamp01((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const y = (1 - clamp01((event.clientY - rect.top) / Math.max(1, rect.height))) * 2 - 1;
      this.pointerTarget.x = x;
      this.pointerTarget.y = y;
    };
    this.onPointerLeave = () => {
      this.pointerTarget.x = 0;
      this.pointerTarget.y = 0;
    };
    this.canvas.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.canvas.addEventListener('pointerdown', this.onPointerMove, { passive: true });
    this.canvas.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
  }

  start() {
    if (this.destroyed || this.running) return;
    if (!this.gl) {
      drawFallback(this.canvas);
      return;
    }
    if (this.reducedMotion) {
      this.renderFrame(this.staticTime, 0);
      return;
    }
    this.running = true;
    this.lastFrame = performance.now();
    this.renderFrame(this.lastFrame * 0.001, 0);
    this.raf = requestAnimationFrame(time => this.render(time));
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  render(milliseconds) {
    if (!this.running || this.destroyed || !this.gl) return;
    this.raf = requestAnimationFrame(time => this.render(time));
    const elapsed = milliseconds - this.lastFrame;
    if (elapsed < this.frameInterval) return;
    const deltaSeconds = Math.min(0.1, elapsed * 0.001);
    this.lastFrame = milliseconds - (elapsed % this.frameInterval);
    this.renderFrame(milliseconds * 0.001, deltaSeconds);
  }

  renderFrame(timeSeconds, deltaSeconds) {
    const gl = this.gl;
    if (!gl || !this.program) return;

    const previousX = this.pointer.x;
    const previousY = this.pointer.y;
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * 0.075;
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * 0.075;
    this.pointerVelocity.x = this.pointer.x - previousX;
    this.pointerVelocity.y = this.pointer.y - previousY;

    const effectiveTime = this.reducedMotion ? this.staticTime : timeSeconds;
    const scanPosition = this.reducedMotion
      ? 0.47
      : 0.5 + Math.sin(effectiveTime * 0.18) * 0.24;

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform1f(this.uniforms.u_time, effectiveTime);
    gl.uniform1f(this.uniforms.u_delta, this.reducedMotion ? 0 : deltaSeconds);
    gl.uniform2f(this.uniforms.u_resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.u_pointer, this.pointer.x, this.pointer.y);
    gl.uniform2f(this.uniforms.u_pointerVelocity, this.pointerVelocity.x, this.pointerVelocity.y);
    gl.uniform1f(this.uniforms.u_audioLow, 0);
    gl.uniform1f(this.uniforms.u_audioMid, 0);
    gl.uniform1f(this.uniforms.u_audioHigh, 0);
    gl.uniform1f(this.uniforms.u_state, this.state);
    gl.uniform1f(this.uniforms.u_transition, this.transition);
    gl.uniform1f(this.uniforms.u_intensity, this.intensity);
    gl.uniform1f(this.uniforms.u_seed, this.seed);
    gl.uniform1f(this.uniforms.u_feedbackAmount, 0);
    gl.uniform1f(this.uniforms.u_scanPosition, scanPosition);
    gl.uniform1f(this.uniforms.u_reducedMotion, this.reducedMotion ? 1 : 0);
    gl.uniform1f(this.uniforms.u_particleScale, this.particleScale);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);

    this.frameCount += 1;
    this.canvas.dataset.frameCount = String(this.frameCount);
    this.canvas.dataset.shaderTime = effectiveTime.toFixed(4);
    this.canvas.dataset.scanPosition = scanPosition.toFixed(4);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stop();
    this.resizeObserver?.disconnect();
    if (this.onPointerMove) {
      this.canvas.removeEventListener('pointermove', this.onPointerMove);
      this.canvas.removeEventListener('pointerdown', this.onPointerMove);
      this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
    }
    if (this.gl) {
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.vao) this.gl.deleteVertexArray(this.vao);
      if (this.program) this.gl.deleteProgram(this.program);
    }
  }
}
