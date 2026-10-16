/**
 * scene-kit — lo compartido entre escenas de motion.
 *
 * Lo importante que vive acá: motion blur real. Se renderizan N sub-frames
 * dentro del obturador de cada frame y se promedian. Es lo que separa un
 * desplazamiento rápido que lee como "pro" de uno que lee como plantilla:
 * el ojo espera arrastre, y texto veloz perfectamente nítido lo delata.
 */

/* ── paleta: espejo de src/styles/tokens.css ────────────────────────────── */
export const OBSIDIAN = '#0a0a0a';
export const CHARCOAL = '#121212';
export const BONE     = '#f0ede8';
export const SAND     = '#9a948a';
export const SILVER   = '#b8b4aa';
export const BRONZE   = '#6a4a28';
export const EMBER    = '#c9a84c';

/* ── interpolación ──────────────────────────────────────────────────────── */
export const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
/** progreso 0→1 de t dentro de la ventana [a,b] */
export const span = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, x) => a + (b - a) * x;
export const easeOutExpo    = (x) => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
export const easeOutCubic   = (x) => 1 - Math.pow(1 - x, 3);
export const easeOutQuint   = (x) => 1 - Math.pow(1 - x, 5);
export const easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

/** PRNG determinista — mismo seed, mismo ruido, siempre. */
export function mulberry32(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let z = Math.imul(seed ^ seed >>> 15, 1 | seed);
    z = z + Math.imul(z ^ z >>> 7, 61 | z) ^ z;
    return ((z ^ z >>> 14) >>> 0) / 4294967296;
  };
}

/* ── grano de película: tiles pregenerados que ciclan a 12fps ───────────── */
const GRAIN_TILES = 8, GRAIN_SIZE = 256;
const grainTiles = Array.from({ length: GRAIN_TILES }, (_, i) => {
  const off = new OffscreenCanvas(GRAIN_SIZE, GRAIN_SIZE);
  const g = off.getContext('2d');
  const img = g.createImageData(GRAIN_SIZE, GRAIN_SIZE);
  const rnd = mulberry32(1337 + i * 977);
  for (let p = 0; p < img.data.length; p += 4) {
    const v = (rnd() * 255) | 0;
    img.data[p] = img.data[p + 1] = img.data[p + 2] = v;
    img.data[p + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return off;
});

/** Grano sobre todo lo demás. Va DESPUÉS del motion blur: el grano no se arrastra. */
export function applyGrain(ctx, t, amount = 0.038) {
  const tile = grainTiles[Math.floor(t * 12) % GRAIN_TILES];
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(tile, 'repeat');
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

/* ── tipografía ─────────────────────────────────────────────────────────── */

/**
 * Texto que sube desde abajo detrás de una ventana recortada.
 * `opacity` es un multiplicador explícito: ctx.globalAlpha NO es multiplicativo
 * —asignarlo dentro de un save() reemplaza el alpha del padre en vez de
 * componerlo— así que un fade exterior tiene que entrar por parámetro.
 */
export function revealText(ctx, text, x, y, font, color, p, opts = {}) {
  if (p <= 0) return;
  const { letterSpacing = '0px', align = 'center', lineH = 120, opacity = 1 } = opts;
  if (opacity <= 0) return;
  const e = easeOutExpo(p);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 4000, y - lineH * 0.86, 8000, lineH * 1.12);
  ctx.clip();
  ctx.font = font;
  ctx.letterSpacing = letterSpacing;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.globalAlpha = clamp(e * 1.15) * opacity;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y + lerp(lineH * 0.9, 0, e));
  ctx.restore();
}

/** Texto letra por letra, con stagger. */
export function staggerText(ctx, text, x, y, font, color, t, start, step, opts = {}) {
  const { letterSpacing = '0px', rise = 26, opacity = 1 } = opts;
  if (opacity <= 0) return;
  ctx.save();
  ctx.font = font;
  ctx.letterSpacing = letterSpacing;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const chars = [...text];
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  let cx = x - widths.reduce((a, b) => a + b, 0) / 2;
  chars.forEach((ch, i) => {
    const p = easeOutCubic(span(t, start + i * step, start + i * step + 0.42));
    ctx.globalAlpha = p * opacity;
    ctx.fillStyle = color;
    ctx.fillText(ch, cx, y + lerp(rise, 0, p));
    cx += widths[i];
  });
  ctx.restore();
}

/* ── montaje ────────────────────────────────────────────────────────────── */

/**
 * Conecta una escena al renderer.
 *
 * @param {object}   cfg
 * @param {number}   cfg.width/height  lienzo de diseño (todo se compone acá)
 * @param {number}   cfg.duration/fps
 * @param {function} cfg.draw          (ctx, t) => void, en coordenadas de diseño
 * @param {number}   [cfg.grain=0.038] 0 lo desactiva
 * @param {number}   [cfg.shutter=0.55] fracción del frame que el obturador
 *                   está abierto. 0.5 ≈ 180°, lo estándar en cine.
 */
export function mountScene(cfg) {
  const { width: DW, height: DH, duration, fps, draw, grain = 0.038, shutter = 0.55 } = cfg;

  // El renderer pide sub-samples por query string: ?mblur=3
  const samples = Math.max(1, Number(new URL(location.href).searchParams.get('mblur') || 1));

  const cv = document.getElementById('c') ?? document.body.appendChild(document.createElement('canvas'));
  cv.id = 'c';
  const ctx = cv.getContext('2d', { alpha: false });

  let off = null, offCtx = null, scale = 1;

  const resize = (w, h) => {
    cv.width = w; cv.height = h;
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    scale = Math.min(w / DW, h / DH);
    if (samples > 1) {
      off = new OffscreenCanvas(w, h);
      offCtx = off.getContext('2d', { alpha: false });
    }
  };
  resize(DW, DH);

  const paint = (c, t) => {
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.scale(scale, scale);
    draw(c, t);
    c.restore();
  };

  window.SCENE = { duration, fps, width: DW, height: DH };
  window.resizeScene = resize;
  window.renderFrame = (t) => {
    if (samples === 1) {
      paint(ctx, t);
    } else {
      // Media progresiva: dibujar la muestra j con alpha 1/(j+1) deja en el
      // canvas el promedio exacto de las j+1 muestras.
      for (let j = 0; j < samples; j++) {
        paint(offCtx, t + (j / samples) * (shutter / fps));
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1 / (j + 1);
        ctx.drawImage(off, 0, 0);
      }
      ctx.globalAlpha = 1;
    }
    if (grain > 0) applyGrain(ctx, t, grain);
  };
}

/** Exponé renderFrame recién después de esto, o los primeros frames usan fallback. */
export async function waitForFonts(specs) {
  await Promise.all(specs.map((s) => document.fonts.load(s)));
  await document.fonts.ready;
}
