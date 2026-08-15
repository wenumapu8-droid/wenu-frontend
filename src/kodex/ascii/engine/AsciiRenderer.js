import { getGlyphSet } from "../config/glyph-sets.js";
import { PALETTES, samplePalette } from "../config/palettes.js";
import { clamp } from "./math.js";

const RGX_SIGNAL_FLOORS = Object.freeze({
  "holocore-signal-vortex-rgx": 0.36,
  "holocore-skull-archive-rgx": 0.34,
  "holocore-source-chamber-rgx": 0.32,
});

const RGX_SAMPLE_STRIDES = Object.freeze({
  "holocore-signal-vortex-rgx": 2,
  "holocore-skull-archive-rgx": 2,
  "holocore-source-chamber-rgx": 2,
});

function rgxCellIsActive(sceneId, x, y) {
  // Exact topology is the SVG scaffold. These masks only reject raster cells
  // outside each procedural signal envelope before expensive scene.field work.
  if (sceneId === "holocore-signal-vortex-rgx") {
    return x * x + y * y <= 0.90 * 0.90;
  }
  if (sceneId === "holocore-skull-archive-rgx") {
    const dx = x / 0.48;
    const dy = (y + 0.04) / 0.62;
    return dx * dx + dy * dy <= 1;
  }
  if (sceneId === "holocore-source-chamber-rgx") {
    const sphere = x * x + (y + 0.14) * (y + 0.14) <= 0.56 * 0.56;
    const horizon = Math.abs(y - 0.56) <= 0.055;
    return sphere || horizon;
  }
  return true;
}

export class AsciiRenderer {
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError("AsciiRenderer necesita un elemento <canvas>.");
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!this.ctx) throw new Error("No se pudo crear el contexto Canvas 2D.");

    this.scene = options.scene;
    this.palette = Array.isArray(options.palette) && options.palette.length >= 2
      ? options.palette
      : null;
    this.glyphSetName = options.glyphSet ?? "kodex";
    this.glyphs = getGlyphSet(this.glyphSetName);
    this.fontFamily = options.fontFamily ?? '"Share Tech Mono", monospace';
    this.profile = options.profile ?? "balanced";
    this.ditherStrength = clamp(options.ditherStrength ?? 1, 0, 1);
    const rgxFloor = RGX_SIGNAL_FLOORS[this.scene?.id] ?? 0.22;
    this.minDrawValue = clamp(options.minDrawValue ?? (this.profile === "rgx" ? rgxFloor : 0), 0, 1);
    this.sampleStride = Math.max(1, Math.round(options.sampleStride ?? (this.profile === "rgx" ? (RGX_SAMPLE_STRIDES[this.scene?.id] ?? 1) : 1)));
    this.seed = Math.random() * 100;
    this.pointer = { x: 0.5, y: 0.5, active: false };
    this.width = 0;
    this.height = 0;
    this.columns = 0;
    this.rows = 0;
    this.cellWidth = 11;
    this.cellHeight = 15;
    this.running = false;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lastFrame = 0;
    this.frameInterval = 1000 / 30;
    this.fps = 0;
    this.frameSamples = [];

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.bindPointer();
    this.applyProfile(this.profile);
    this.resize();
  }

  applyProfile(profile) {
    this.profile = profile;
    const mobile = matchMedia("(max-width: 700px)").matches;
    const map = {
      rgx: mobile ? { cell: 7, fps: 22, aspect: 1.25 } : { cell: 6, fps: 24, aspect: 1.25 },
      full: mobile ? { cell: 9, fps: 30, aspect: 1.35 } : { cell: 10, fps: 36, aspect: 1.35 },
      balanced: mobile ? { cell: 11, fps: 26, aspect: 1.35 } : { cell: 12, fps: 30, aspect: 1.35 },
      low: mobile ? { cell: 14, fps: 18, aspect: 1.35 } : { cell: 15, fps: 20, aspect: 1.35 },
    };
    const selected = map[profile] ?? map.balanced;
    this.cellWidth = selected.cell;
    this.cellHeight = Math.round(selected.cell * selected.aspect);
    this.frameInterval = 1000 / selected.fps;
    this.resize();
  }

  bindPointer() {
    const update = event => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = clamp((event.clientX - rect.left) / Math.max(rect.width, 1));
      this.pointer.y = clamp((event.clientY - rect.top) / Math.max(rect.height, 1));
      this.pointer.active = true;
    };
    this.canvas.addEventListener("pointermove", update, { passive: true });
    this.canvas.addEventListener("pointerdown", update, { passive: true });
    this.canvas.addEventListener("pointerleave", () => { this.pointer.active = false; });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width || window.innerWidth);
    this.height = Math.max(1, rect.height || window.innerHeight);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.textBaseline = "top";
    this.ctx.font = `${this.cellHeight}px ${this.fontFamily}`;
    this.columns = Math.ceil(this.width / this.cellWidth);
    this.rows = Math.ceil(this.height / this.cellHeight);
  }

  setScene(scene) { this.scene = scene; }
  setGlyphSet(name) { this.glyphSetName = name; this.glyphs = getGlyphSet(name); }
  randomize() { this.seed = Math.random() * 1000; }
  start() { if (!this.running) { this.running = true; requestAnimationFrame(time => this.render(time)); } }
  stop() { this.running = false; }
  destroy() { this.stop(); this.resizeObserver.disconnect(); }

  render(milliseconds) {
    if (!this.running) return;
    requestAnimationFrame(time => this.render(time));
    if (milliseconds - this.lastFrame < this.frameInterval) return;
    const delta = milliseconds - this.lastFrame;
    this.lastFrame = milliseconds;
    this.trackFps(delta);

    const t = this.reducedMotion ? 0.65 : milliseconds * 0.001;
    const palette = this.palette ?? PALETTES[this.scene?.id] ?? PALETTES.observe;
    const ctx = this.ctx;
    ctx.fillStyle = palette[0];
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.font = `${this.cellHeight}px ${this.fontFamily}`;

    for (let row = 0; row < this.rows; row += 1) {
      const y = (row / Math.max(this.rows - 1, 1)) * 2 - 1;
      for (let column = 0; column < this.columns; column += 1) {
        if (this.sampleStride > 1 && ((row + column) % this.sampleStride) !== 0) continue;
        const x = (column / Math.max(this.columns - 1, 1)) * 2 - 1;
        if (this.profile === "rgx" && !rgxCellIsActive(this.scene?.id, x, y)) continue;
        let value = this.scene.field(x, y, t, this.pointer, this.seed);
        const ordered = (((column & 1) + ((row & 1) << 1)) / 12 - 0.10) * this.ditherStrength;
        value = clamp(value + ordered);
        if (value < this.minDrawValue) continue;
        const glyphIndex = Math.floor(value * (this.glyphs.length - 1));
        const glyph = this.glyphs[glyphIndex] ?? " ";
        if (glyph === " ") continue;
        ctx.globalAlpha = 0.18 + value * 0.85;
        ctx.fillStyle = samplePalette(palette, value);
        ctx.fillText(glyph, column * this.cellWidth, row * this.cellHeight);
      }
    }
    ctx.globalAlpha = 1;
  }

  trackFps(delta) {
    if (delta <= 0) return;
    this.frameSamples.push(1000 / delta);
    if (this.frameSamples.length > 20) this.frameSamples.shift();
    this.fps = Math.round(this.frameSamples.reduce((sum, value) => sum + value, 0) / this.frameSamples.length);
  }
}
