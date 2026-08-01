/**
 * KODEX-∞ · SIGNAL BLOOM · paneles
 *
 * Todo lo que respira en la lámina menos el campo de transmisión, que tiene su
 * propio runtime WebGL2.
 *
 * Misma ley que en COSMOLOGY CORE, y por la misma razón: **se anima lo que es
 * medición y se dibuja una vez lo que es muestra.** Tickean la forma de onda,
 * el espectro, la coherencia y la energía — son lecturas. Los cuatro estados en
 * miniatura, los recortes de textura, los sellos, los glifos y el tile se
 * dibujan una sola vez.
 *
 * Los sellos rotan, que es lo que pide el plano, pero rotan por CSS: girar una
 * imagen ya dibujada no cuesta nada, y redibujar cuatro árboles por cuadro
 * costaría más que el hero entero.
 */

type Bus = { activo: boolean; low: number; mid: number; high: number };

const TAU = Math.PI * 2;

function audio(t: number): Bus {
  const b = (window as any).__kxAudio as Bus | undefined;
  if (b?.activo) return b;
  return {
    activo: false,
    low: 0.5 + Math.sin(t * 0.7) * 0.3,
    mid: 0.5 + Math.sin(t * 1.3 + 1.7) * 0.25,
    high: 0.5 + Math.sin(t * 2.1 + 3.1) * 0.2,
  };
}

function azar(s: number): () => number {
  let x = s || 1;
  return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; };
}

function ctxDe(cv: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = cv.getBoundingClientRect();
  if (r.width > 0) {
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
  }
  return cv.getContext("2d");
}

const color = (el: HTMLElement, def: string) =>
  getComputedStyle(el).getPropertyValue("--c").trim() || def;

/* ── Muestras: una vez ─────────────────────────────────────────────────── */

/**
 * El mandala en miniatura de cada estado.
 *
 * Usa el MISMO umbral que el shader del hero, así que la miniatura de IDLE
 * (0.80) se ve rala y la de BLOOM (0.30) llena — que es exactamente lo que el
 * póster muestra. Si la miniatura no obedeciera al umbral sería una ilustración
 * del estado en vez del estado.
 */
function mini(cv: HTMLCanvasElement, th: number, col: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height, cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.46;
  ctx.clearRect(0, 0, w, h);

  const FOLDS = 12;
  const r = azar(Math.round(th * 1000));
  // Cuanto más bajo el umbral, más ramas florecen: la relación es la misma que
  // en el shader — `max(n - THRESHOLD, 0)`.
  const ramas = Math.round(3 + (0.85 - th) * 14);

  ctx.strokeStyle = col;
  ctx.lineWidth = 1;
  for (let f = 0; f < FOLDS; f++) {
    const base = (f / FOLDS) * TAU;
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < ramas; i++) {
      const a = base + (r() - 0.5) * 0.42;
      const l = R * (0.25 + r() * 0.75);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(
        cx + Math.cos(a) * l * 0.5 + (r() - 0.5) * 8,
        cy + Math.sin(a) * l * 0.5 + (r() - 0.5) * 8,
        cx + Math.cos(a) * l, cy + Math.sin(a) * l,
      );
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.4);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.4, col);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.4, 0, TAU);
  ctx.fill();
}

/** Panel 03 · los cuatro recortes de textura, cada uno con su material. */
function textura(cv: HTMLCanvasElement, i: number, col: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height;
  const r = azar(i * 7919 + 3);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#07070d";
  ctx.fillRect(0, 0, w, h);

  if (i === 0) {
    // BITMAP NOISE: puntos de un bit, densidad radial.
    for (let k = 0; k < 2600; k++) {
      const x = r() * w, y = r() * h;
      const d = Math.hypot(x - w / 2, y - h / 2) / (w * 0.5);
      if (r() > d * 0.9) { ctx.fillStyle = r() > 0.6 ? col : "#fff"; ctx.fillRect(x, y, 1.4, 1.4); }
    }
  } else if (i === 1) {
    // PIXEL SORT: filas arrastradas en horizontal.
    for (let y = 0; y < h; y += 2) {
      const largo = r() * w * 0.8;
      const x0 = r() * (w - largo);
      ctx.fillStyle = r() > 0.5 ? col : "#9000FF";
      ctx.globalAlpha = 0.3 + r() * 0.6;
      ctx.fillRect(x0, y, largo, 1.6);
    }
    ctx.globalAlpha = 1;
  } else if (i === 2) {
    // GLITCH MODE: bloques desplazados con separación de canal.
    for (let k = 0; k < 60; k++) {
      const y = r() * h, hh = 1 + r() * 5, x = r() * w * 0.4, ww = r() * w * 0.6;
      ctx.fillStyle = [col, "#FF00FF", "#00C5FF"][Math.floor(r() * 3)];
      ctx.globalAlpha = 0.35 + r() * 0.5;
      ctx.fillRect(x, y, ww, hh);
    }
    ctx.globalAlpha = 1;
  } else {
    // CRT SCANLINES: el mismo mandala visto tras las líneas del tubo.
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.3, col);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.42, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1.4);
  }
}

/** AUTH SEAL: el mismo árbol, cuatro señales. */
function sello(cv: HTMLCanvasElement, col: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height, cx = w / 2;
  ctx.clearRect(0, 0, w, h);
  const r = azar(9173);

  ctx.strokeStyle = col;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  for (const k of [0.94, 0.8]) {
    ctx.beginPath();
    ctx.arc(cx, h / 2, (Math.min(w, h) / 2) * k, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // El árbol es EL MISMO en los cuatro: misma semilla. Lo que cambia es la
  // señal — el color. Cuatro árboles distintos serían cuatro sellos, no uno
  // autenticado cuatro veces.
  const rama = (x: number, y: number, a: number, l: number, p: number) => {
    if (p === 0 || l < 1.5) return;
    const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.35 + p * 0.13;
    ctx.lineWidth = Math.max(0.5, p * 0.5);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    rama(x2, y2, a - 0.44 - r() * 0.14, l * 0.72, p - 1);
    rama(x2, y2, a + 0.44 + r() * 0.14, l * 0.72, p - 1);
  };
  rama(cx, h * 0.78, -Math.PI / 2, h * 0.13, 5);
  ctx.globalAlpha = 1;
}

/** Un glifo de la biblioteca. Determinista: el glifo 7 es siempre el glifo 7. */
function glifo(cv: HTMLCanvasElement, i: number, col: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height, cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.34;
  const r = azar(i * 1571 + 11);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = i % 5 === 0 ? col : "rgba(232,229,222,0.62)";
  ctx.lineWidth = 1;

  const n = 3 + Math.floor(r() * 5);
  ctx.beginPath();
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * TAU - Math.PI / 2;
    const rad = R * (k % 2 === 0 ? 1 : 0.55 + r() * 0.3);
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
    k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  if (r() > 0.45) {
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.3, 0, TAU);
    ctx.stroke();
  }
}

/** El tile 9:16 del panel 08. */
function tile(cv: HTMLCanvasElement, col: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height;
  ctx.clearRect(0, 0, w, h);
  mini(cv, 0.32, col);
}

/* ── Montaje ───────────────────────────────────────────────────────────── */

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-capitulo-bloom]");
  if (!raiz || (raiz as any).__kdxBloomPan) return;
  (raiz as any).__kdxBloomPan = true;

  const acc = getComputedStyle(raiz).getPropertyValue("--acc").trim() || "#FF00FF";

  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      const cv = e.target as HTMLCanvasElement;
      const padre = cv.closest("li") as HTMLElement | null;
      const c = padre ? color(padre, acc) : acc;
      if (cv.dataset.kdxMini) mini(cv, Number(cv.dataset.th || 0.5), c);
      else if (cv.dataset.kdxTextura !== undefined) textura(cv, Number(cv.dataset.kdxTextura), c);
      else if (cv.dataset.kdxSello !== undefined) sello(cv, c);
      else if (cv.dataset.kdxGlifo !== undefined) glifo(cv, Number(cv.dataset.kdxGlifo), acc);
      else if (cv.dataset.kdxTile !== undefined) tile(cv, acc);
      else if (cv.dataset.kdxAncla) glifo(cv, 3, acc);
      io.unobserve(cv);
    }
  }, { rootMargin: "150px" });

  for (const cv of raiz.querySelectorAll<HTMLCanvasElement>(
    "[data-kdx-mini],[data-kdx-textura],[data-kdx-sello],[data-kdx-glifo],[data-kdx-tile],[data-kdx-ancla]",
  )) io.observe(cv);

  // Vivos.
  const wave = raiz.querySelector<HTMLCanvasElement>("[data-kdx-wave]");
  const spec = raiz.querySelector<HTMLCanvasElement>("[data-kdx-spec]");
  const ondas = [...raiz.querySelectorAll<HTMLCanvasElement>("[data-kdx-onda]")];
  const ctxW = wave && ctxDe(wave);
  const ctxS = spec && ctxDe(spec);
  const ctxO = ondas.map((cv) => ({ cv, ctx: ctxDe(cv), col: color(cv.closest("li")!, acc) }));

  const coh = [...raiz.querySelectorAll<HTMLElement>("[data-kdx-coherencia],[data-kdx-coherencia2]")];
  const ene = [...raiz.querySelectorAll<HTMLElement>("[data-kdx-energia],[data-kdx-energia2]")];
  const status = raiz.querySelector<HTMLElement>("[data-kdx-status]");

  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let visible = true;
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(raiz);

  const cuadro = () => {
    if (visible) {
      const t = quieto ? 0 : (performance.now() - t0) / 1000;
      const a = audio(t);

      // Coherencia 0.72 y energía 87.2% del plano, respirando alrededor de su
      // valor. No saltan: son lecturas de un sistema estable.
      const c = 0.72 + Math.sin(t * 0.43) * 0.03 + (a.mid - 0.5) * 0.04;
      const e = 87.2 + Math.sin(t * 0.6) * 1.6 + (a.low - 0.5) * 4;
      for (const el of coh) el.textContent = c.toFixed(2);
      for (const el of ene) el.textContent = `${e.toFixed(1)}%`;
      if (status) status.textContent = a.activo ? "ACTIVE" : "ACTIVE / LOCKED";

      // WAVEFORM: 13.37 Hz, la frecuencia que declara el plano.
      if (ctxW && wave) {
        const w = wave.width, h = wave.height;
        ctxW.clearRect(0, 0, w, h);
        ctxW.strokeStyle = acc;
        ctxW.lineWidth = 1;
        ctxW.beginPath();
        for (let x = 0; x < w; x++) {
          const p = x / w;
          const v = Math.sin(p * 13.37 * TAU + t * 3) * (0.3 + a.low * 0.6)
                  + Math.sin(p * 41 * TAU - t * 5) * 0.15 * a.high;
          const y = h / 2 + v * h * 0.42;
          x ? ctxW.lineTo(x, y) : ctxW.moveTo(x, y);
        }
        ctxW.stroke();
      }

      // SPECTRAL: barras por banda.
      if (ctxS && spec) {
        const w = spec.width, h = spec.height, n = 56;
        ctxS.clearRect(0, 0, w, h);
        for (let i = 0; i < n; i++) {
          const p = i / n;
          const banda = p < 0.25 ? a.low : p < 0.65 ? a.mid : a.high;
          const v = banda * (0.4 + 0.6 * Math.abs(Math.sin(i * 2.1 + t * 2.6)));
          ctxS.fillStyle = p < 0.33 ? "#FF00FF" : p < 0.66 ? "#9000FF" : "#00C5FF";
          ctxS.globalAlpha = 0.4 + v * 0.6;
          ctxS.fillRect((i / n) * w, h - v * h, w / n - 1, v * h);
        }
        ctxS.globalAlpha = 1;
      }

      // Las cuatro ondas del panel 02: cada nota de movimiento con su forma.
      ctxO.forEach(({ cv, ctx, col }, k) => {
        if (!ctx) return;
        const w = cv.width, h = cv.height;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const p = x / w;
          let v = 0;
          // PULSE late, TRANSMIT sale, GLITCH salta, RETURN decae. La forma
          // dice la nota; una misma onda en los cuatro no diría nada.
          if (k === 0) v = Math.sin(p * TAU * 3 + t * 4) * Math.exp(-Math.abs(Math.sin(p * TAU * 1.5)) * 2) * a.low * 2;
          else if (k === 1) v = Math.sin(p * TAU * 9 - t * 6) * (1 - p) * 0.8;
          else if (k === 2) v = (Math.round(Math.sin(p * 40 + t * 9) * 2) / 2) * 0.7;
          else v = Math.sin(p * TAU * 5 - t * 2) * Math.exp(-p * 3) * 0.9;
          const y = h / 2 + v * h * 0.4;
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      });
    }
    requestAnimationFrame(cuadro);
  };
  requestAnimationFrame(cuadro);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
