/**
 * KODEX-∞ · SPECIMEN SKULL · paneles
 *
 * Misma ley que en los capítulos anteriores: **se anima lo que es medición y se
 * dibuja una vez lo que es muestra.** Tickean el mapa de densidad ósea, el
 * espectro y las lecturas del panel 04 — son instrumentos. El sello del árbol y
 * los cuatro overlays de anatomía se dibujan una sola vez.
 */

type Bus = { activo: boolean; low: number; mid: number; high: number };
const TAU = Math.PI * 2;

function audio(t: number): Bus {
  const ka = (window as any).__kodexAudio;
  if (ka && typeof ka.energy === "function") {
    const e = ka.energy();
    if (typeof e === "number" && e > 0) return { activo: true, low: e, mid: e * 0.85, high: e * 0.7 };
  }
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
  if (r.width > 0) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  return cv.getContext("2d");
}

/** El sello del árbol: el mismo que recurre en THRESHOLD y SIGNAL BLOOM. */
function arbol(cv: HTMLCanvasElement, col: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height, cx = w / 2;
  ctx.clearRect(0, 0, w, h);
  const r = azar(9173);
  ctx.strokeStyle = col;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, h / 2, Math.min(w, h) * 0.46, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 1;
  const rama = (x: number, y: number, a: number, l: number, p: number) => {
    if (p === 0 || l < 1.2) return;
    const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    ctx.globalAlpha = 0.35 + p * 0.13;
    ctx.lineWidth = Math.max(0.5, p * 0.45);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    rama(x2, y2, a - 0.44 - r() * 0.14, l * 0.72, p - 1);
    rama(x2, y2, a + 0.44 + r() * 0.14, l * 0.72, p - 1);
  };
  rama(cx, h * 0.76, -Math.PI / 2, h * 0.12, 5);
  ctx.globalAlpha = 1;
}

/**
 * Los cuatro overlays de anatomía.
 *
 * Cada uno es el mismo contorno de cráneo con UNA zona encendida: frontal,
 * orbital, nasal, jaw. Que sea el mismo contorno importa — son vistas del mismo
 * espécimen, y cuatro siluetas distintas serían cuatro especímenes.
 */
function overlay(cv: HTMLCanvasElement, i: number, col: string, apoyo: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height, cx = w / 2, cy = h * 0.46;
  const s = Math.min(w, h) * 0.34;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(232,229,222,0.34)";
  ctx.lineWidth = 1;
  // Bóveda.
  ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.18, s * 0.62, s * 0.7, 0, 0, TAU); ctx.stroke();
  // Mandíbula.
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy + s * 0.4);
  ctx.quadraticCurveTo(cx, cy + s * 1.15, cx + s * 0.42, cy + s * 0.4);
  ctx.stroke();
  // Órbitas y nariz.
  for (const dx of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + dx * s * 0.27, cy - s * 0.04, s * 0.17, s * 0.16, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.24, s * 0.08, s * 0.13, 0, 0, TAU); ctx.stroke();

  // La zona encendida de este overlay.
  const zonas: [number, number, number][] = [
    [cx, cy - s * 0.62, s * 0.34],       // FRONTAL
    [cx - s * 0.27, cy - s * 0.04, s * 0.25], // ORBITAL
    [cx, cy + s * 0.24, s * 0.2],        // NASAL
    [cx, cy + s * 0.72, s * 0.3],        // JAW
  ];
  const [zx, zy, zr] = zonas[i % 4];
  const g = ctx.createRadialGradient(zx, zy, 0, zx, zy, zr);
  g.addColorStop(0, col);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(zx, zy, zr, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = apoyo;
  ctx.beginPath(); ctx.arc(zx, zy, zr * 0.42, 0, TAU); ctx.stroke();
}

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-capitulo-skull]");
  if (!raiz || (raiz as any).__kdxSkullPan) return;
  (raiz as any).__kdxSkullPan = true;

  const cs = getComputedStyle(raiz);
  const acc = cs.getPropertyValue("--acc").trim() || "#FF2A2A";
  const apoyo = cs.getPropertyValue("--apoyo").trim() || "#00C5FF";

  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      const cv = e.target as HTMLCanvasElement;
      if (cv.dataset.kdxSkArbol !== undefined) arbol(cv, acc);
      else if (cv.dataset.kdxSkNodo !== undefined) overlay(cv, Number(cv.dataset.kdxSkNodo), acc, apoyo);
      io.unobserve(cv);
    }
  }, { rootMargin: "150px" });
  for (const cv of raiz.querySelectorAll<HTMLCanvasElement>("[data-kdx-sk-arbol],[data-kdx-sk-nodo]")) io.observe(cv);

  const dens = raiz.querySelector<HTMLCanvasElement>("[data-kdx-sk-densidad]");
  const esp = raiz.querySelector<HTMLCanvasElement>("[data-kdx-sk-espectro]");
  const ctxD = dens && ctxDe(dens);
  const ctxE = esp && ctxDe(esp);
  const lock = raiz.querySelector<HTMLElement>("[data-kdx-sk-lock]");
  const lecturas = [...raiz.querySelectorAll<HTMLElement>("[data-kdx-sk-lectura]")]
    .filter((e) => e.dataset.kdxSkLectura);
  const anats = [...raiz.querySelectorAll<HTMLElement>("[data-kdx-sk-anat]")];

  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let visible = true;
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(raiz);

  const cuadro = () => {
    if (visible) {
      const t = quieto ? 0 : (performance.now() - t0) / 1000;
      const a = audio(t);

      if (lock) lock.textContent = `${(97.6 + (a.low - 0.5) * 1.4).toFixed(1)}%`;

      for (const el of lecturas) {
        const base = parseFloat(el.dataset.kdxSkLectura!);
        const amp = parseFloat(el.dataset.amp || "0");
        const dec = (el.dataset.kdxSkLectura!.split(".")[1] || "").length;
        const v = base + Math.sin(t * 0.7 + base) * amp * (0.4 + a.mid * 0.6);
        el.textContent = `${v.toFixed(dec)}${el.dataset.u || ""}`;
      }
      for (const el of anats) {
        const base = parseFloat(el.dataset.kdxSkAnat!);
        el.textContent = `${(base + Math.sin(t * 1.1 + base) * 0.6 * (0.4 + a.high)).toFixed(1)}%`;
      }

      // BONE DENSITY MAP: barras densas, perfil de hueso.
      if (ctxD && dens) {
        const w = dens.width, h = dens.height, n = 84;
        ctxD.clearRect(0, 0, w, h);
        for (let i = 0; i < n; i++) {
          const p = i / n;
          // Perfil: más denso en el centro (bóveda) que en los extremos.
          const perfil = Math.exp(-Math.pow((p - 0.5) * 2.6, 2));
          const v = perfil * (0.55 + 0.45 * Math.abs(Math.sin(i * 3.1 + t * 1.8))) * (0.6 + a.low * 0.6);
          ctxD.fillStyle = acc;
          ctxD.globalAlpha = 0.35 + v * 0.6;
          ctxD.fillRect((i / n) * w, h - v * h, w / n - 1, v * h);
        }
        ctxD.globalAlpha = 1;
      }

      // SIGNAL SPECTRUM: traza continua en cyan.
      if (ctxE && esp) {
        const w = esp.width, h = esp.height;
        ctxE.clearRect(0, 0, w, h);
        ctxE.strokeStyle = apoyo;
        ctxE.lineWidth = 1;
        ctxE.beginPath();
        for (let x = 0; x < w; x++) {
          const p = x / w;
          const v = Math.sin(p * 47 * TAU + t * 4) * (0.25 + a.mid * 0.5)
                  + Math.sin(p * 13 * TAU - t * 2.4) * 0.28 * a.high;
          const y = h / 2 + v * h * 0.42;
          x ? ctxE.lineTo(x, y) : ctxE.moveTo(x, y);
        }
        ctxE.stroke();
      }
    }
    requestAnimationFrame(cuadro);
  };
  requestAnimationFrame(cuadro);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else { montar(); }
document.addEventListener("astro:page-load", montar);
