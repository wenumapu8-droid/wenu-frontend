/**
 * KODEX-∞ · ARCHIVE TREE · paneles
 *
 * Misma ley de dosificación de los capítulos anteriores: se anima lo que es
 * MEDICIÓN, se dibuja una vez lo que es MUESTRA.
 *
 * Con una excepción declarada: las cuatro ondas de GROWTH STATES sí se animan,
 * porque el plano las llama "waveform" y una forma de onda quieta es un dibujo
 * de una forma de onda. La cabeza-árbol del dossier, la latiz de nodos y los
 * glifos se dibujan una sola vez.
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

/**
 * La cabeza-árbol del panel 01.
 *
 * Perfil humano con el árbol adentro: es el retrato del espécimen, y el plano
 * lo pone primero porque dice de qué está hecho antes que ninguna medición.
 */
function cabeza(cv: HTMLCanvasElement, verde: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height;
  const U = Math.min(w, h);
  const cx = w * 0.52, cy = h * 0.5;
  ctx.clearRect(0, 0, w, h);
  const r = azar(5501);

  // Perfil: cráneo, frente, nariz, mentón, cuello. Trazo simple y de canto.
  ctx.strokeStyle = "rgba(223,232,220,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + U * 0.08, cy + U * 0.42);
  ctx.lineTo(cx + U * 0.08, cy + U * 0.22);
  ctx.bezierCurveTo(cx + U * 0.3, cy + U * 0.15, cx + U * 0.32, cy - U * 0.3, cx + U * 0.02, cy - U * 0.36);
  ctx.bezierCurveTo(cx - U * 0.28, cy - U * 0.4, cx - U * 0.34, cy - U * 0.05, cx - U * 0.26, cy + U * 0.06);
  ctx.lineTo(cx - U * 0.31, cy + U * 0.14);
  ctx.lineTo(cx - U * 0.24, cy + U * 0.16);
  ctx.lineTo(cx - U * 0.245, cy + U * 0.25);
  ctx.lineTo(cx - U * 0.14, cy + U * 0.29);
  ctx.lineTo(cx - U * 0.15, cy + U * 0.42);
  ctx.stroke();

  // El árbol adentro.
  const rama = (x: number, y: number, a: number, l: number, p: number) => {
    if (p === 0 || l < 1) return;
    const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l;
    ctx.strokeStyle = verde;
    ctx.globalAlpha = 0.3 + p * 0.12;
    ctx.lineWidth = Math.max(0.5, p * 0.42);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    rama(x2, y2, a - 0.46 - r() * 0.16, l * 0.72, p - 1);
    rama(x2, y2, a + 0.46 + r() * 0.16, l * 0.72, p - 1);
  };
  rama(cx - U * 0.04, cy + U * 0.2, -Math.PI / 2, U * 0.1, 5);
  // Raíces dentro del cuello: el mismo organismo, hacia abajo.
  rama(cx - U * 0.04, cy + U * 0.2, Math.PI / 2, U * 0.05, 3);
  ctx.globalAlpha = 1;
}

/**
 * La latiz de nodos del panel 05.
 *
 * 12.842 sub-nodos es el dato del plano; dibujarlos todos sería una mancha y
 * costaría una eternidad. Se dibuja una MUESTRA con la misma densidad relativa
 * — el panel dice HIGH — y el número exacto vive en la tabla, que es donde un
 * número exacto se lee.
 */
function latiz(cv: HTMLCanvasElement, verde: string, claro: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height;
  ctx.clearRect(0, 0, w, h);
  const r = azar(7717);
  const N = 90;
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    // Densidad mayor hacia el centro: es un cúmulo, no una nube uniforme.
    const a = r() * TAU;
    const rad = Math.pow(r(), 0.65) * Math.min(w, h) * 0.46;
    pts.push([w / 2 + Math.cos(a) * rad * 1.7, h / 2 + Math.sin(a) * rad]);
  }
  ctx.strokeStyle = claro;
  ctx.lineWidth = 1;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d > Math.min(w, h) * 0.16) continue;
      ctx.globalAlpha = 0.06 + (1 - d / (Math.min(w, h) * 0.16)) * 0.16;
      ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  for (const [x, y] of pts) {
    ctx.fillStyle = r() > 0.85 ? "#ffffff" : verde;
    ctx.beginPath(); ctx.arc(x, y, r() > 0.85 ? 1.8 : 1.1, 0, TAU); ctx.fill();
  }
}

/** Un glifo de la biblioteca. Determinista. */
function glifo(cv: HTMLCanvasElement, i: number, verde: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height, cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.32;
  const r = azar(i * 2237 + 5);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = i % 4 === 0 ? verde : "rgba(223,232,220,0.55)";
  ctx.lineWidth = 1;
  const n = 3 + Math.floor(r() * 4);
  ctx.beginPath();
  for (let k = 0; k <= n; k++) {
    const a = (k / n) * TAU - Math.PI / 2;
    const rad = R * (k % 2 === 0 ? 1 : 0.5 + r() * 0.35);
    const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
    k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath(); ctx.stroke();
  if (r() > 0.5) { ctx.beginPath(); ctx.arc(cx, cy, R * 0.28, 0, TAU); ctx.stroke(); }
}

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-capitulo-arbol]");
  if (!raiz || (raiz as any).__kdxArbolPan) return;
  (raiz as any).__kdxArbolPan = true;

  const cs = getComputedStyle(raiz);
  const verde = cs.getPropertyValue("--acc").trim() || "#9DFF3C";
  const claro = cs.getPropertyValue("--apoyo").trim() || "#4FE07A";

  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      const cv = e.target as HTMLCanvasElement;
      if (cv.dataset.kdxCabeza !== undefined) cabeza(cv, verde);
      else if (cv.dataset.kdxLatiz !== undefined) latiz(cv, verde, claro);
      else if (cv.dataset.kdxArbolGlifo !== undefined) glifo(cv, Number(cv.dataset.kdxArbolGlifo), verde);
      io.unobserve(cv);
    }
  }, { rootMargin: "150px" });
  for (const cv of raiz.querySelectorAll<HTMLCanvasElement>("[data-kdx-cabeza],[data-kdx-latiz],[data-kdx-arbol-glifo]")) {
    io.observe(cv);
  }

  const wave = raiz.querySelector<HTMLCanvasElement>("[data-kdx-arbol-wave]");
  const spec = raiz.querySelector<HTMLCanvasElement>("[data-kdx-arbol-spec]");
  const ctxW = wave && ctxDe(wave);
  const ctxS = spec && ctxDe(spec);
  const ondas = [...raiz.querySelectorAll<HTMLCanvasElement>("[data-kdx-crecer-onda]")]
    .map((cv) => ({ cv, ctx: ctxDe(cv) }));
  const estab = raiz.querySelector<HTMLElement>("[data-kdx-arbol-estab]");
  const vitales = [...raiz.querySelectorAll<HTMLElement>("[data-kdx-vital]")];

  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let visible = true;
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(raiz);

  const cuadro = () => {
    if (visible) {
      const t = quieto ? 0 : (performance.now() - t0) / 1000;
      const a = audio(t);

      if (estab) estab.textContent = `${(87.6 + (a.low - 0.5) * 2.2).toFixed(1)}%`;
      for (const el of vitales) {
        const base = parseFloat(el.dataset.kdxVital!);
        const amp = parseFloat(el.dataset.amp || "0");
        const dec = (el.dataset.kdxVital!.split(".")[1] || "").length;
        el.textContent = `${(base + Math.sin(t * 0.6 + base) * amp * (0.4 + a.mid * 0.6)).toFixed(dec)}${el.dataset.u || ""}`;
      }

      if (ctxW && wave) {
        const w = wave.width, h = wave.height;
        ctxW.clearRect(0, 0, w, h);
        ctxW.strokeStyle = verde; ctxW.lineWidth = 1;
        ctxW.beginPath();
        for (let x = 0; x < w; x++) {
          const p = x / w;
          const v = Math.sin(p * 22 * TAU + t * 3) * (0.3 + a.low * 0.55)
                  + Math.sin(p * 61 * TAU - t * 5) * 0.16 * a.high;
          const y = h / 2 + v * h * 0.42;
          x ? ctxW.lineTo(x, y) : ctxW.moveTo(x, y);
        }
        ctxW.stroke();
      }

      if (ctxS && spec) {
        const w = spec.width, h = spec.height, n = 52;
        ctxS.clearRect(0, 0, w, h);
        for (let i = 0; i < n; i++) {
          const p = i / n;
          // Perfil de espectro: cae hacia lo agudo, como una fuente natural.
          const banda = (p < 0.3 ? a.low : p < 0.7 ? a.mid : a.high) * Math.exp(-p * 1.1);
          const v = banda * (0.5 + 0.5 * Math.abs(Math.sin(i * 2.4 + t * 2.2))) * 1.8;
          ctxS.fillStyle = p < 0.5 ? verde : claro;
          ctxS.globalAlpha = 0.35 + v * 0.6;
          ctxS.fillRect((i / n) * w, h - v * h, w / n - 1, v * h);
        }
        ctxS.globalAlpha = 1;
      }

      // Las cuatro ondas de GROWTH STATES. Cada estado tiene la suya: SEED es
      // casi plana, TRANSMIT es densa. La forma dice el estado.
      ondas.forEach(({ cv, ctx }, k) => {
        if (!ctx) return;
        const w = cv.width, h = cv.height;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = verde; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const p = x / w;
          let v = 0;
          if (k === 0) v = Math.sin(p * TAU * 2 + t) * 0.12;
          else if (k === 1) v = Math.sin(p * TAU * 6 + t * 2) * 0.3 * (0.4 + p);
          else if (k === 2) v = Math.sin(p * TAU * 14 + t * 3) * 0.55 * a.mid * 1.6;
          else v = (Math.sin(p * TAU * 26 + t * 5) + Math.sin(p * TAU * 9 - t * 3)) * 0.32 * (0.5 + a.high);
          const y = h / 2 + v * h * 0.44;
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
} else { montar(); }
document.addEventListener("astro:page-load", montar);
