const TAU = Math.PI * 2;

export const LOW_RES_RASTER_DEFAULTS = Object.freeze({
  width: 320,
  height: 240,
  fps: 15,
  loopMs: 24_000,
  seed: 0x4b4458,
});

export const RASTER_SIGNAL_PALETTE = Object.freeze([
  '#05030b',
  '#17102f',
  '#432b72',
  '#9b58c9',
  '#7de9ff',
  '#f2f0ff',
]);

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function phaseAt(milliseconds, loopMs = LOW_RES_RASTER_DEFAULTS.loopMs) {
  const wrapped = ((milliseconds % loopMs) + loopMs) % loopMs;
  return (wrapped / loopMs) * TAU;
}

export function makeRasterStars({
  count = 148,
  width = LOW_RES_RASTER_DEFAULTS.width,
  height = LOW_RES_RASTER_DEFAULTS.height,
  seed = LOW_RES_RASTER_DEFAULTS.seed,
} = {}) {
  const random = lcg(seed);
  return Array.from({ length: count }, (_, index) => ({
    x: Math.floor(random() * width),
    y: Math.floor(random() * height),
    depth: 0.15 + random() * 0.85,
    phase: random() * TAU,
    size: index % 19 === 0 ? 2 : 1,
  }));
}

export function rasterSignalState(milliseconds, pointer = { x: 0.5, y: 0.5, active: false }) {
  const phase = phaseAt(milliseconds);
  const pointerX = pointer.active ? (clamp01(pointer.x) - 0.5) * 0.09 : 0;
  const pointerY = pointer.active ? (clamp01(pointer.y) - 0.5) * 0.07 : 0;
  return Object.freeze({
    phase,
    pointerX,
    pointerY,
    objectYaw: phase + pointerX,
    objectPitch: Math.sin(phase * 2) * 0.16 + pointerY,
    ringRadius: 41 + Math.sin(phase * 3) * 3,
    rasterPhase: (Math.sin(phase) * 0.5 + 0.5),
    paletteIndex: Math.floor((((phase / TAU) * 6) % 6 + 6) % 6),
    scanY: Math.floor((Math.sin(phase - Math.PI / 2) * 0.5 + 0.5) * 239),
  });
}

function projectVertex(vertex, yaw, pitch, centerX, centerY, scale) {
  const [x0, y0, z0] = vertex;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);

  const x1 = x0 * cy - z0 * sy;
  const z1 = x0 * sy + z0 * cy;
  const y1 = y0 * cp - z1 * sp;
  const z2 = y0 * sp + z1 * cp;
  const perspective = 1 / (1.55 + z2 * 0.28);

  return [
    Math.round(centerX + x1 * scale * perspective),
    Math.round(centerY + y1 * scale * perspective),
    z2,
  ];
}

const OCTA_VERTICES = Object.freeze([
  [0, -1.15, 0],
  [1, 0, 0],
  [0, 0, 1],
  [-1, 0, 0],
  [0, 0, -1],
  [0, 1.15, 0],
]);

const OCTA_EDGES = Object.freeze([
  [0, 1], [0, 2], [0, 3], [0, 4],
  [5, 1], [5, 2], [5, 3], [5, 4],
  [1, 2], [2, 3], [3, 4], [4, 1],
]);

export class LowResRasterRenderer {
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError('LowResRasterRenderer requires a canvas element.');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!this.ctx) throw new Error('LowResRasterRenderer could not create Canvas 2D context.');

    this.width = options.width ?? LOW_RES_RASTER_DEFAULTS.width;
    this.height = options.height ?? LOW_RES_RASTER_DEFAULTS.height;
    this.fps = options.fps ?? LOW_RES_RASTER_DEFAULTS.fps;
    this.loopMs = options.loopMs ?? LOW_RES_RASTER_DEFAULTS.loopMs;
    this.seed = options.seed ?? LOW_RES_RASTER_DEFAULTS.seed;
    this.palette = options.palette ?? RASTER_SIGNAL_PALETTE;
    this.reducedMotion = options.reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.staticPhaseMs = options.staticPhaseMs ?? 8_880;
    this.frameInterval = 1000 / this.fps;
    this.lastFrame = -Infinity;
    this.running = false;
    this.destroyed = false;
    this.raf = 0;
    this.frameCount = 0;
    this.pointer = { x: 0.5, y: 0.5, active: false };
    this.stars = makeRasterStars({ width: this.width, height: this.height, seed: this.seed });

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.dataset.internalResolution = `${this.width}x${this.height}`;
    this.canvas.dataset.visualFps = String(this.fps);
    this.canvas.dataset.rendererKind = 'raster2d-lowres';

    this.bindPointer();
  }

  bindPointer() {
    this.onPointerMove = event => {
      if (this.reducedMotion) return;
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = clamp01((event.clientX - rect.left) / Math.max(1, rect.width));
      this.pointer.y = clamp01((event.clientY - rect.top) / Math.max(1, rect.height));
      this.pointer.active = true;
    };
    this.onPointerLeave = () => { this.pointer.active = false; };
    this.canvas.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.canvas.addEventListener('pointerdown', this.onPointerMove, { passive: true });
    this.canvas.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
  }

  start() {
    if (this.destroyed || this.running) return;
    this.running = true;
    if (this.reducedMotion) {
      this.draw(this.staticPhaseMs);
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(time => this.render(time));
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  render(milliseconds) {
    if (!this.running || this.destroyed) return;
    this.raf = requestAnimationFrame(time => this.render(time));
    if (milliseconds - this.lastFrame < this.frameInterval) return;
    this.lastFrame = milliseconds - ((milliseconds - this.lastFrame) % this.frameInterval);
    this.draw(milliseconds);
  }

  draw(milliseconds) {
    const state = rasterSignalState(milliseconds, this.pointer);
    const ctx = this.ctx;
    const { width, height, palette } = this;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, width, height);

    // Deterministic star field: fixed spatial samples, looped intensity/depth only.
    for (const star of this.stars) {
      const travel = (state.phase / TAU) * 18 * star.depth;
      const x = Math.round((star.x + travel) % width);
      const y = star.y;
      const pulse = Math.sin(state.phase * 2 + star.phase) * 0.5 + 0.5;
      const colorIndex = pulse > 0.74 ? 4 : pulse > 0.38 ? 3 : 2;
      ctx.globalAlpha = 0.18 + star.depth * 0.58;
      ctx.fillStyle = palette[colorIndex];
      ctx.fillRect(x, y, star.size, star.size);
    }
    ctx.globalAlpha = 1;

    const centerX = Math.round(width * (0.5 + state.pointerX * 0.6));
    const centerY = Math.round(height * (0.49 + state.pointerY * 0.5));

    // Raster bars remain secondary; their positions are phase-locked to the exact loop.
    for (let index = 0; index < 5; index += 1) {
      const offset = Math.sin(state.phase * (index % 2 ? 2 : 1) + index * 1.7) * 7;
      const y = Math.round(centerY - 46 + index * 23 + offset);
      const inset = 24 + index * 10;
      ctx.globalAlpha = 0.08 + index * 0.025;
      ctx.fillStyle = palette[(index + state.paletteIndex) % palette.length];
      ctx.fillRect(inset, y, width - inset * 2, 2);
    }
    ctx.globalAlpha = 1;

    // Central synthetic object: common octahedral geometry, not a copied source model.
    const projected = OCTA_VERTICES.map(vertex => projectVertex(
      vertex,
      state.objectYaw,
      state.objectPitch,
      centerX,
      centerY,
      70,
    ));

    ctx.lineWidth = 1;
    for (let index = 0; index < OCTA_EDGES.length; index += 1) {
      const [a, b] = OCTA_EDGES[index];
      const p0 = projected[a];
      const p1 = projected[b];
      const depth = clamp01((p0[2] + p1[2] + 2.4) / 4.8);
      ctx.strokeStyle = depth > 0.57 ? palette[5] : depth > 0.36 ? palette[4] : palette[3];
      ctx.globalAlpha = 0.35 + depth * 0.58;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Concentric signal cage with integer-snapped radii.
    const ringRadii = [state.ringRadius, state.ringRadius + 9, state.ringRadius + 22];
    ringRadii.forEach((radius, index) => {
      ctx.strokeStyle = palette[index === 0 ? 5 : index === 1 ? 4 : 3];
      ctx.globalAlpha = 0.7 - index * 0.18;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, Math.round(radius), Math.round(radius * (0.48 + index * 0.07)), state.objectPitch, 0, TAU);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Local palette-cycle signal markers; deliberately KODEX content, not source typography.
    const markerColor = palette[2 + (state.paletteIndex % 4)];
    ctx.fillStyle = markerColor;
    ctx.font = '8px monospace';
    ctx.fillText('KDX // SIGNAL', 10, 11);
    ctx.fillText(`PH ${String(Math.round((state.phase / TAU) * 999)).padStart(3, '0')}`, 10, height - 12);
    ctx.fillText('320×240 / 15FPS', width - 100, height - 12);

    // One bounded sync line. No rapid flashing; it crosses the frame once per 24 s loop.
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = palette[4];
    ctx.fillRect(0, state.scanY, width, 1);
    ctx.globalAlpha = 1;

    this.frameCount += 1;
    this.canvas.dataset.frameCount = String(this.frameCount);
    this.canvas.dataset.phase = state.phase.toFixed(6);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stop();
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerdown', this.onPointerMove);
    this.canvas.removeEventListener('pointerleave', this.onPointerLeave);
  }
}
