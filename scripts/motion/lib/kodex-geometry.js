/**
 * Geometría de KODEX, compartida entre escenas.
 *
 * Dos motores, los dos declarados en los preset.json de public/kodex-… :
 *   · membrana  — SPATIAL_DISTORTION_ENGINE / domain_warp + topology_collapse
 *   · teseracto — el artefacto imposible: 4 dimensiones proyectadas dos veces
 */
import { clamp, lerp } from '../scene-kit.js';

/* ══ TESERACTO ══════════════════════════════════════════════════════════ */

export const VERTS4 = Array.from({ length: 16 }, (_, i) =>
  [(i & 1 ? 1 : -1), (i & 2 ? 1 : -1), (i & 4 ? 1 : -1), (i & 8 ? 1 : -1)]);

/** Dos vértices son adyacentes si difieren en exactamente una coordenada. */
export const EDGES4 = (() => {
  const e = [];
  for (let a = 0; a < 16; a++) {
    for (let b = a + 1; b < 16; b++) {
      const d = a ^ b;
      if ((d & (d - 1)) === 0) e.push([a, b]);
    }
  }
  return e;
})();

/** Rota en un plano coordenado. En 4D los giros ocurren en planos, no en ejes. */
function rot(p, i, j, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const a = p[i], b = p[j];
  p[i] = a * c - b * s;
  p[j] = a * s + b * c;
}

/**
 * Proyecta los 16 vértices: 4D→3D por w, 3D→2D por z.
 *
 * `dw` no debe bajar de √2 ≈ 1.414: es el |w| máximo de un vértice rotado. Por
 * debajo, el plano de proyección cruza el objeto, el guard contra infinito se
 * dispara y la sombra colapsa en una astilla.
 */
export function projectTesseract(A, dw) {
  const out = [];
  for (const v of VERTS4) {
    const p = v.slice();
    rot(p, 0, 3, A.xw);
    rot(p, 1, 2, A.yz);
    rot(p, 0, 1, A.xy);
    rot(p, 2, 3, A.zw);
    const k4 = 1 / Math.max(0.17, dw - p[3]);
    const x3 = p[0] * k4, y3 = p[1] * k4, z3 = p[2] * k4;
    const k3 = 1 / Math.max(0.30, 3.1 - z3);
    out.push({ x: x3 * k3, y: y3 * k3, depth: z3 });
  }
  return out;
}

/**
 * Escala para que el objeto ocupe `target` px, pase lo que pase con el ángulo.
 *
 * Normaliza por la media cuadrática de los radios y no por el máximo: un único
 * vértice fugado —en un ángulo casi de canto— encogería el cuerpo entero a una
 * astilla. El techo evita que nada se vaya demasiado lejos, pero se deja flojo
 * a propósito: en los ~5-10% de frames casi de canto, la astilla cruza el
 * cuadro y lee como estela en vez de como error.
 */
export function fitScale(P, target, cap = 1400) {
  let maxR = 1e-4, sum2 = 0;
  for (const v of P) {
    const r2 = v.x * v.x + v.y * v.y;
    sum2 += r2;
    maxR = Math.max(maxR, Math.sqrt(r2));
  }
  const rms = Math.sqrt(sum2 / P.length);
  return Math.min(target / Math.max(1e-4, 0.3 * maxR + 0.7 * rms * 2.1), cap / maxR);
}

const rgbOf = (c) => Array.isArray(c)
  ? c
  : [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const mixc = (a, b, x) => { const A = rgbOf(a), B = rgbOf(b); return A.map((v, i) => lerp(v, B[i], clamp(x))); };
export const cssc = (c, a = 1) => `rgba(${rgbOf(c).map((v) => Math.round(v)).join(',')},${a})`;

/** Dibuja el armazón. Llamarla con desvíos distintos da aberración cromática. */
export function drawWire(ctx, P, o) {
  const { cx, cy, scale, far, near, tint, boost = 0, dx = 0, comp = null, alpha = 1, reveal = 1 } = o;
  ctx.save();
  if (comp) ctx.globalCompositeOperation = comp;
  ctx.lineCap = 'round';

  const n = Math.ceil(EDGES4.length * clamp(reveal));
  for (let i = 0; i < n; i++) {
    const [a, b] = EDGES4[i];
    const A = P[a], B = P[b];
    const d = (A.depth + B.depth) / 2;
    const prox = clamp((d + 0.8) / 1.9);
    const col = mixc(mixc(far, near, prox), tint, boost);
    const al = (0.14 + 0.62 * prox) * (0.55 + 0.45 * boost) * alpha;

    ctx.beginPath();
    ctx.moveTo(cx + A.x * scale + dx, cy + A.y * scale);
    ctx.lineTo(cx + B.x * scale + dx, cy + B.y * scale);
    ctx.strokeStyle = cssc(col, al * 0.3);
    ctx.lineWidth = 5.5 * (0.5 + prox);
    ctx.stroke();
    ctx.strokeStyle = cssc(col, al);
    ctx.lineWidth = 1.2 + 1.3 * prox;
    ctx.stroke();
  }

  if (reveal >= 1) {
    for (const v of P) {
      const prox = clamp((v.depth + 0.8) / 1.9);
      ctx.fillStyle = cssc(mixc('#DFF7FF', tint, boost), (0.25 + 0.6 * prox) * alpha);
      ctx.beginPath();
      ctx.arc(cx + v.x * scale + dx, cy + v.y * scale, 1.6 + 4.2 * prox, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* ══ MEMBRANA ═══════════════════════════════════════════════════════════ */

/**
 * Domain warp: deformar el espacio y volver a deformar el resultado. Un solo
 * pase da ondas de libro de texto; el segundo produce el pliegue orgánico.
 */
export function warpField(x, y, t, amp) {
  const qx = Math.sin(x * 0.0061 + t * 0.55) + 0.5 * Math.cos(y * 0.0043 - t * 0.41);
  const qy = Math.cos(x * 0.0038 - t * 0.33) + 0.5 * Math.sin(y * 0.0072 + t * 0.62);
  return amp * (
    Math.sin(x * 0.0047 + qx * 1.9 + t * 0.70) * 0.62 +
    Math.cos(y * 0.0055 + qy * 1.6 - t * 0.48) * 0.38
  );
}

/** Abre un hueco empujando los puntos hacia afuera: sqrt(d²+R²) manda 0 → R
 *  y deja intacto lo lejano, así que no se amontonan en el borde. */
export function apertureMap(px, py, cx, cy, R) {
  if (R <= 0.5) return [px, py];
  const vx = px - cx, vy = py - cy;
  const d = Math.hypot(vx, vy) || 1e-4;
  const nd = Math.sqrt(d * d + R * R);
  return [cx + vx / d * nd, cy + vy / d * nd];
}

/** Membrana de scanlines sobre todo el cuadro, con hueco opcional. */
export function drawMembrane(ctx, o) {
  const { W, H, t, amp, color, hot = '#FF1427', alpha = 1,
          cx = W / 2, cy = H / 2, R = 0, stepY = 23, stepX = 15, fadeFrom = cy, fadeSpan = 1250,
          // `bleed`: cuánto se extiende la malla fuera del cuadro. Si la escena
          // la encoge con ctx.scale, el borde rectangular de la propia malla
          // entra en campo. Dibujar más ancho de lo visible lo evita.
          bleed = 120 } = o;
  ctx.save();
  ctx.lineWidth = 1;
  for (let y = -bleed; y < H + bleed; y += stepY) {
    ctx.beginPath();
    let pen = false, nearest = 1e9;
    for (let x = -bleed; x <= W + bleed; x += stepX) {
      const dy = warpField(x, y, t, amp);
      // Un punto que caía DENTRO del hueco no se estira hasta el borde: se
      // omite. Si no, el segmento que une los dos lados lo cruza como cuerda.
      if (R > 0.5 && Math.hypot(x - cx, y + dy - cy) < R) { pen = false; continue; }
      const [X, Y] = apertureMap(x, y + dy, cx, cy, R);
      nearest = Math.min(nearest, Math.hypot(X - cx, Y - cy));
      if (!pen) { ctx.moveTo(X, Y); pen = true; } else { ctx.lineTo(X, Y); }
    }
    const heat = R > 0.5 ? Math.pow(clamp(1 - (nearest - R) / 230), 2.1) : 0;
    const fade = clamp(1 - Math.abs(y - fadeFrom) / fadeSpan);
    ctx.globalAlpha = (0.12 + 0.46 * fade) * alpha;
    ctx.strokeStyle = cssc(heat > 0.01 ? mixc(color, hot, heat) : color);
    ctx.stroke();
  }
  ctx.restore();
}
