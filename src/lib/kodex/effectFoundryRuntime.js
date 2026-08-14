import { effectById } from './effectFoundry.js';

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const hash = (x, y, seed = 0) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
};
const luminance = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

function pixelAt(data, x, y) {
  const xx = Math.max(0, Math.min(data.width - 1, Math.floor(x)));
  const yy = Math.max(0, Math.min(data.height - 1, Math.floor(y)));
  const i = (yy * data.width + xx) * 4;
  return [data.data[i], data.data[i + 1], data.data[i + 2], data.data[i + 3]];
}

function clear(ctx, canvas, bg = '#020304') {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function renderAscii(ctx, canvas, data, v) {
  clear(ctx, canvas);
  const cell = Math.max(5, Math.round(v.density || 13));
  const threshold = v.threshold ?? 0.25;
  const bloom = v.bloom ?? 1;
  const scatter = v.glitchAmount ?? 0.18;
  const glyphs = ['·', '+', '×', '#', '0', '∞', ':', '□'];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${Math.max(6, cell * 0.78)}px monospace`;
  for (let y = cell / 2; y < canvas.height; y += cell) {
    for (let x = cell / 2; x < canvas.width; x += cell) {
      const [r, g, b] = pixelAt(data, x, y);
      const l = luminance(r, g, b);
      if (l < threshold) continue;
      const n = hash(x, y, 1);
      if (n < scatter * 0.18) continue;
      const dx = (hash(x, y, 2) - 0.5) * cell * scatter * 1.7;
      const dy = (hash(x, y, 3) - 0.5) * cell * scatter * 1.7;
      const hot = n > 0.82;
      ctx.fillStyle = hot
        ? `rgba(255,112,67,${clamp(l * 1.2)})`
        : `rgba(${Math.max(90, r)},${Math.max(170, g)},255,${clamp(l * 1.25)})`;
      ctx.shadowColor = hot ? '#ff583b' : '#27c8ff';
      ctx.shadowBlur = cell * 0.75 * bloom;
      ctx.fillText(glyphs[Math.floor(n * glyphs.length) % glyphs.length], x + dx, y + dy);
    }
  }
  ctx.shadowBlur = 0;
}

function renderCrossStitch(ctx, canvas, data, v, time) {
  clear(ctx, canvas);
  const cell = Math.max(5, Math.round(v.density || 11));
  const threshold = v.threshold ?? 0.2;
  const glow = v.bloom ?? 0.75;
  const phase = (v.phase ?? 0) + time;
  ctx.lineCap = 'round';
  for (let y = cell / 2; y < canvas.height; y += cell) {
    for (let x = cell / 2; x < canvas.width; x += cell) {
      const [r, g, b] = pixelAt(data, x, y);
      const l = luminance(r, g, b);
      if (l < threshold) continue;
      const pulse = 0.75 + 0.25 * Math.sin(phase * Math.PI * 2 + x * 0.03 + y * 0.02);
      const a = clamp((l - threshold) / Math.max(0.01, 1 - threshold)) * pulse;
      const s = cell * (0.26 + l * 0.2);
      ctx.strokeStyle = `rgba(${Math.max(70, r)},${Math.max(100, g)},${Math.max(120, b)},${a})`;
      ctx.lineWidth = Math.max(1, cell * 0.11);
      ctx.shadowColor = l > 0.65 ? '#8ceaff' : '#ff7a55';
      ctx.shadowBlur = cell * glow * 0.6;
      ctx.beginPath();
      ctx.moveTo(x - s, y - s);
      ctx.lineTo(x + s, y + s);
      ctx.moveTo(x + s, y - s);
      ctx.lineTo(x - s, y + s);
      ctx.stroke();
    }
  }
  ctx.shadowBlur = 0;
}

function renderHalftone(ctx, canvas, data, v, time) {
  clear(ctx, canvas, '#070608');
  const cell = Math.max(4, Math.round(v.density || 10));
  const threshold = v.threshold ?? 0.12;
  const distortion = v.distortion ?? 0.24;
  const phase = (v.phase ?? 0) + time;
  for (let y = cell / 2; y < canvas.height; y += cell) {
    for (let x = cell / 2; x < canvas.width; x += cell) {
      const [r, g, b] = pixelAt(data, x, y);
      const l = luminance(r, g, b);
      if (l < threshold) continue;
      const jitter = cell * distortion;
      const dx = (hash(x, y, phase * 100) - 0.5) * jitter;
      const dy = (hash(y, x, phase * 81) - 0.5) * jitter;
      const radius = Math.max(0.6, cell * 0.47 * Math.pow(l, 0.72));
      ctx.fillStyle = `rgba(${r},${g},${b},${clamp(0.35 + l * 0.8)})`;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, radius, 0, Math.PI * 2);
      ctx.fill();
      if (l > 0.62 && hash(x, y, 9) > 0.72) {
        ctx.strokeStyle = 'rgba(255,80,55,.65)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
}

function renderMercury(ctx, canvas, data, v) {
  const threshold = v.threshold ?? 0.38;
  const bloom = v.bloom ?? 0.9;
  const fluidity = v.distortion ?? 0.18;
  const smear = v.smear ?? 0.22;
  const result = ctx.createImageData(data.width, data.height);
  const d = data.data;
  const rd = result.data;
  const w = data.width;
  const h = data.height;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const l = luminance(d[i], d[i + 1], d[i + 2]);
      const xr = Math.min(w - 1, x + 2);
      const yd = Math.min(h - 1, y + 2);
      const ir = (y * w + xr) * 4;
      const id = (yd * w + x) * 4;
      const edge = Math.abs(l - luminance(d[ir], d[ir + 1], d[ir + 2]))
        + Math.abs(l - luminance(d[id], d[id + 1], d[id + 2]));
      const band = clamp((l - threshold + fluidity * 0.18) * 2.4);
      const spec = clamp(edge * (3.5 + bloom * 2) + Math.pow(band, 4) * 0.75);
      const metal = Math.round(clamp(0.08 + band * 0.6 + spec * 0.75) * 255);
      rd[i] = Math.min(255, metal + spec * 55);
      rd[i + 1] = Math.min(255, metal + spec * 75);
      rd[i + 2] = Math.min(255, metal + spec * 92);
      rd[i + 3] = 255;
    }
  }
  clear(ctx, canvas);
  ctx.putImageData(result, 0, 0);
  if (smear > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = smear * 0.35;
    ctx.filter = `blur(${Math.max(0.1, smear * 9)}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }
}

function renderMemory(ctx, canvas, data, v, time) {
  clear(ctx, canvas);
  const cell = Math.max(5, Math.round(v.density || 12));
  const retention = v.threshold ?? 0.38;
  const decay = v.glitchAmount ?? 0.34;
  const ghost = v.smear ?? 0.28;
  const phase = time * 10;
  for (let y = 0; y < canvas.height; y += cell) {
    for (let x = 0; x < canvas.width; x += cell) {
      const [r, g, b] = pixelAt(data, x + cell / 2, y + cell / 2);
      const l = luminance(r, g, b);
      if (l < 0.06) continue;
      const n = hash(x / cell, y / cell, Math.floor(phase));
      const keep = clamp(retention + l * 0.7 - decay * n);
      if (hash(x, y, 5) > keep) continue;
      const shift = (hash(x, y, 7) - 0.5) * cell * decay * 2.2;
      ctx.fillStyle = `rgba(${r},${g},${b},${clamp(0.22 + l * 0.85)})`;
      ctx.fillRect(x + shift, y, cell - 1, cell - 1);
      if (ghost > 0.05 && hash(x, y, 11) > 0.58) {
        ctx.fillStyle = `rgba(80,205,255,${ghost * 0.24})`;
        ctx.fillRect(x - shift * 1.6, y + cell * 0.12, cell - 1, cell - 1);
      }
    }
  }
}

function renderDissolution(ctx, canvas, data, v, time) {
  clear(ctx, canvas);
  const phase = clamp((v.phase ?? 0.35) + time * 0.28);
  const warp = v.distortion ?? 0.25;
  const bloom = v.bloom ?? 0.7;
  const fragmentation = v.glitchAmount ?? 0.28;
  const cell = Math.max(3, Math.round(4 + fragmentation * 13));
  const cx = canvas.width * 0.5;
  const cy = canvas.height * 0.5;
  const maxR = Math.hypot(cx, cy);
  for (let y = 0; y < canvas.height; y += cell) {
    for (let x = 0; x < canvas.width; x += cell) {
      const [r, g, b] = pixelAt(data, x + cell / 2, y + cell / 2);
      const l = luminance(r, g, b);
      if (l < 0.04) continue;
      const radial = Math.hypot(x - cx, y - cy) / maxR;
      const n = hash(x / cell, y / cell, 31);
      const dissolveField = phase * 1.15 + radial * 0.12 + n * fragmentation * 0.5;
      if (dissolveField > 0.55 + l * 0.62) continue;
      const angle = Math.atan2(y - cy, x - cx);
      const drift = warp * phase * 48 * (0.25 + n);
      const dx = Math.cos(angle + n * 1.4) * drift;
      const dy = Math.sin(angle + n * 1.4) * drift;
      const alpha = clamp((l + 0.2) * (1 - phase * 0.55));
      ctx.fillStyle = `rgba(${Math.max(r, 40)},${Math.max(g, 80)},${Math.max(b, 110)},${alpha})`;
      ctx.shadowColor = n > 0.76 ? '#ff6c4a' : '#4cdcff';
      ctx.shadowBlur = cell * bloom * 0.6;
      ctx.fillRect(x + dx, y + dy, cell, cell);
    }
  }
  ctx.shadowBlur = 0;
}

export function defaultValues(effectOrId) {
  const effect = typeof effectOrId === 'string' ? effectById(effectOrId) : effectOrId;
  if (!effect) return {};
  return Object.fromEntries(effect.parameters.map((param) => [param.key, param.value]));
}

export function renderKodexEffect({ effectId, canvas, sourceCanvas, values = {}, time = 0 }) {
  const effect = effectById(effectId);
  if (!effect || !canvas || !sourceCanvas) return false;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
  const sourceCtx = sourceCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
  if (!ctx || !sourceCtx || !sourceCanvas.width || !sourceCanvas.height) return false;
  if (canvas.width !== sourceCanvas.width || canvas.height !== sourceCanvas.height) {
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
  }
  const data = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  switch (effect.id) {
    case 'KDX-FX-001': renderAscii(ctx, canvas, data, values); break;
    case 'KDX-FX-002': renderCrossStitch(ctx, canvas, data, values, time); break;
    case 'KDX-FX-003': renderHalftone(ctx, canvas, data, values, time); break;
    case 'KDX-FX-004': renderMercury(ctx, canvas, data, values); break;
    case 'KDX-FX-005': renderMemory(ctx, canvas, data, values, time); break;
    case 'KDX-FX-006': renderDissolution(ctx, canvas, data, values, time); break;
    default: ctx.putImageData(data, 0, 0); break;
  }
  return true;
}

export function drawSeedOrganism(canvas, width = 900, height = 900) {
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = '#020304';
  ctx.fillRect(0, 0, width, height);
  const cx = width * 0.5;
  const cy = height * 0.48;
  ctx.save();
  ctx.translate(cx, cy);
  for (let ring = 7; ring >= 0; ring -= 1) {
    const petals = 7 + ring;
    const radius = Math.min(width, height) * (0.075 + ring * 0.021);
    for (let i = 0; i < petals; i += 1) {
      const a = (i / petals) * Math.PI * 2 + ring * 0.27;
      const x = Math.cos(a) * radius * 0.72;
      const y = Math.sin(a) * radius * 0.72;
      const pr = Math.min(width, height) * (0.03 + ring * 0.003);
      const grad = ctx.createRadialGradient(x - pr * 0.3, y - pr * 0.4, 1, x, y, pr);
      grad.addColorStop(0, ring % 2 ? '#f6fbff' : '#9beaff');
      grad.addColorStop(0.45, ring % 3 ? '#26bce8' : '#ff6f50');
      grad.addColorStop(1, 'rgba(4,9,16,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, pr * 1.25, pr * 0.66, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(width, height) * 0.12);
  core.addColorStop(0, '#ffffff');
  core.addColorStop(0.18, '#7de4ff');
  core.addColorStop(0.5, '#2354ff');
  core.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, Math.min(width, height) * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return canvas;
}

export async function loadImageIntoCanvas(url, canvas, { maxDimension = 1200 } = {}) {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  await image.decode();
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  return { width, height };
}
