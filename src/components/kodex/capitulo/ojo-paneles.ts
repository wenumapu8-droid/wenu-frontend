/**
 * KODEX-∞ · OBSERVATION EYE · paneles
 *
 * Misma ley: se anima lo que es MEDICIÓN, se dibuja una vez lo que es MUESTRA.
 * Tickean la óptica, las formas de onda, el espectro y el log — que además
 * corre en streaming, porque un registro de observación quieto no está
 * observando nada. Los ojos en miniatura y los seis recortes de tratamiento se
 * dibujan una sola vez.
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
 * El ojo en miniatura de cada estado.
 *
 * LOCK contrae la pupila, IDLE la dilata y atenúa: la miniatura obedece al
 * estado igual que el hero. Si no lo hiciera sería una ilustración del estado
 * en vez del estado.
 */
function miniOjo(cv: HTMLCanvasElement, estado: string, col: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height, cx = w / 2, cy = h / 2;
  const R = Math.min(w, h) * 0.44;
  ctx.clearRect(0, 0, w, h);
  const r = azar(estado.length * 977 + 11);

  const pup = estado === "LOCK" ? 0.2 : estado === "IDLE" ? 0.4 : 0.28;
  const at = estado === "IDLE" ? 0.42 : 1;

  // Fibras del iris.
  ctx.strokeStyle = col;
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * TAU + r() * 0.1;
    ctx.globalAlpha = (0.25 + r() * 0.45) * at;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * R * pup, cy + Math.sin(a) * R * pup);
    ctx.lineTo(cx + Math.cos(a) * R * (0.8 + r() * 0.2), cy + Math.sin(a) * R * (0.8 + r() * 0.2));
    ctx.stroke();
  }
  ctx.globalAlpha = at;
  ctx.strokeStyle = col;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.fillStyle = "#06040c";
  ctx.beginPath(); ctx.arc(cx, cy, R * pup, 0, TAU); ctx.fill();
  ctx.strokeStyle = "#22D3EE";
  ctx.beginPath(); ctx.arc(cx, cy, R * pup, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Panel 05 · los seis recortes de tratamiento sobre el mismo fragmento. */
function trato(cv: HTMLCanvasElement, i: number, violeta: string, cyan: string): void {
  const ctx = ctxDe(cv);
  if (!ctx) return;
  const w = cv.width, h = cv.height, cx = w / 2, cy = h / 2;
  const r = azar(i * 6421 + 17);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#08060f";
  ctx.fillRect(0, 0, w, h);

  // El mismo fragmento de iris en los seis: cambia el tratamiento, no la fuente.
  const iris = (alpha: number, color: string) => {
    ctx.strokeStyle = color;
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * TAU;
      ctx.globalAlpha = alpha * (0.3 + r() * 0.6);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * w * 0.1, cy + Math.sin(a) * w * 0.1);
      ctx.lineTo(cx + Math.cos(a) * w * 0.42, cy + Math.sin(a) * w * 0.42);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  if (i === 0) {
    // HALFTONE: puntos de tamaño variable en rejilla.
    for (let y = 2; y < h; y += 4) for (let x = 2; x < w; x += 4) {
      const d = Math.hypot(x - cx, y - cy) / (w * 0.5);
      const s = Math.max(0, 1 - d) * 2;
      if (s <= 0.05) continue;
      ctx.fillStyle = violeta;
      ctx.beginPath(); ctx.arc(x, y, s * 1.6, 0, TAU); ctx.fill();
    }
  } else if (i === 1) {
    // NEON ENERGY: el iris con halo.
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5);
    g.addColorStop(0, cyan); g.addColorStop(0.4, violeta); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.5; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, w * 0.5, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1; iris(0.9, "#ffffff");
  } else if (i === 2) {
    // PIXEL SORT: filas arrastradas.
    iris(0.6, violeta);
    for (let y = 0; y < h; y += 2) {
      if (r() > 0.5) continue;
      const largo = r() * w * 0.7, x0 = r() * (w - largo);
      ctx.fillStyle = r() > 0.5 ? violeta : cyan;
      ctx.globalAlpha = 0.3 + r() * 0.5;
      ctx.fillRect(x0, y, largo, 1.5);
    }
    ctx.globalAlpha = 1;
  } else if (i === 3) {
    // GLITCH MAP: bloques con canal separado.
    iris(0.4, violeta);
    for (let k = 0; k < 28; k++) {
      ctx.fillStyle = [violeta, cyan, "#FF2A2A"][Math.floor(r() * 3)];
      ctx.globalAlpha = 0.3 + r() * 0.5;
      ctx.fillRect(r() * w * 0.5, r() * h, r() * w * 0.5, 1 + r() * 4);
    }
    ctx.globalAlpha = 1;
  } else if (i === 4) {
    // SCANLINE.
    iris(0.75, cyan);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1.4);
  } else {
    // BITMAP NOISE: un bit por punto.
    for (let k = 0; k < 1400; k++) {
      const x = r() * w, y = r() * h;
      const d = Math.hypot(x - cx, y - cy) / (w * 0.5);
      if (r() > d * 0.95) { ctx.fillStyle = r() > 0.5 ? violeta : "#ffffff"; ctx.fillRect(x, y, 1.3, 1.3); }
    }
  }
}

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-capitulo-ojo]");
  if (!raiz || (raiz as any).__kdxOjoPan) return;
  (raiz as any).__kdxOjoPan = true;

  const cs = getComputedStyle(raiz);
  const violeta = cs.getPropertyValue("--acc").trim() || "#A855F7";
  const cyan = cs.getPropertyValue("--apoyo").trim() || "#22D3EE";

  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      const cv = e.target as HTMLCanvasElement;
      if (cv.dataset.kdxOjoMini) {
        const li = cv.closest("li") as HTMLElement | null;
        miniOjo(cv, cv.dataset.kdxOjoMini, li ? (getComputedStyle(li).getPropertyValue("--c").trim() || violeta) : violeta);
      } else if (cv.dataset.kdxOjoTrato !== undefined) {
        trato(cv, Number(cv.dataset.kdxOjoTrato), violeta, cyan);
      }
      io.unobserve(cv);
    }
  }, { rootMargin: "150px" });
  for (const cv of raiz.querySelectorAll<HTMLCanvasElement>("[data-kdx-ojo-mini],[data-kdx-ojo-trato]")) io.observe(cv);

  const wave = raiz.querySelector<HTMLCanvasElement>("[data-kdx-ojo-wave]");
  const spec = raiz.querySelector<HTMLCanvasElement>("[data-kdx-ojo-spec]");
  const ctxW = wave && ctxDe(wave);
  const ctxS = spec && ctxDe(spec);
  const ondas = [...raiz.querySelectorAll<HTMLCanvasElement>("[data-kdx-ojo-onda]")]
    .map((cv) => ({ cv, ctx: ctxDe(cv), n: cv.dataset.kdxOjoOnda || "" }));
  const optica = [...raiz.querySelectorAll<HTMLElement>("[data-kdx-optica]")]
    .filter((e) => e.dataset.kdxOptica);
  const tiempos = [...raiz.querySelectorAll<HTMLTimeElement>("[data-kdx-logs] time")];

  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let visible = true;
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(raiz);

  const cuadro = () => {
    if (visible) {
      const t = quieto ? 0 : (performance.now() - t0) / 1000;
      const a = audio(t);

      for (const el of optica) {
        const base = parseFloat(el.dataset.kdxOptica!);
        const amp = parseFloat(el.dataset.amp || "0");
        const dec = (el.dataset.kdxOptica!.split(".")[1] || "").length;
        el.textContent = `${(base + Math.sin(t * 0.5 + base) * amp * (0.4 + a.mid * 0.6)).toFixed(dec)}${el.dataset.u || ""}`;
      }

      // El log corre: cada entrada lleva una hora real, escalonada hacia atrás.
      // Un registro de observación con la hora congelada no está observando.
      const ahora = new Date();
      tiempos.forEach((el, i) => {
        const d = new Date(ahora.getTime() - i * 7000);
        const p = (n: number) => String(n).padStart(2, "0");
        el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
      });

      if (ctxW && wave) {
        const w = wave.width, h = wave.height;
        ctxW.clearRect(0, 0, w, h);
        ctxW.strokeStyle = violeta; ctxW.lineWidth = 1;
        ctxW.beginPath();
        for (let x = 0; x < w; x++) {
          const p = x / w;
          const v = Math.sin(p * 31 * TAU + t * 3.4) * (0.3 + a.low * 0.5)
                  + Math.sin(p * 71 * TAU - t * 6) * 0.18 * a.high;
          const y = h / 2 + v * h * 0.42;
          x ? ctxW.lineTo(x, y) : ctxW.moveTo(x, y);
        }
        ctxW.stroke();
      }

      if (ctxS && spec) {
        const w = spec.width, h = spec.height, n = 48;
        ctxS.clearRect(0, 0, w, h);
        for (let i = 0; i < n; i++) {
          const p = i / n;
          // Pico en 612.4 nm — el dato del plano — que en esta escala cae
          // alrededor del 62% del ancho.
          const pico = Math.exp(-Math.pow((p - 0.62) * 7, 2));
          const banda = (p < 0.35 ? a.low : p < 0.7 ? a.mid : a.high);
          const v = (pico * 0.7 + banda * 0.4) * (0.55 + 0.45 * Math.abs(Math.sin(i * 2.7 + t * 2)));
          ctxS.fillStyle = p > 0.55 && p < 0.7 ? cyan : violeta;
          ctxS.globalAlpha = 0.35 + v * 0.6;
          ctxS.fillRect((i / n) * w, h - v * h, w / n - 1, v * h);
        }
        ctxS.globalAlpha = 1;
      }

      // Las tres conductas: BLINK cae y vuelve, SCAN barre, PULSE respira.
      ondas.forEach(({ cv, ctx, n }) => {
        if (!ctx) return;
        const w = cv.width, h = cv.height;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = violeta; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const p = x / w;
          let v = 0;
          if (n === "BLINK") {
            // Un valle brusco: el párpado.
            const c = (p + t * 0.25) % 1;
            v = -Math.exp(-Math.pow((c - 0.5) * 26, 2)) * 0.9;
          } else if (n === "SCAN") {
            v = ((p * 3 + t * 0.5) % 1 - 0.5) * 0.9;
          } else {
            v = Math.sin(p * TAU * 3 + t * 2.4) * (0.4 + a.low * 0.5);
          }
          const y = h / 2 + v * h * 0.42;
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
