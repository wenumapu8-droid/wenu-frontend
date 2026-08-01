/**
 * KODEX-∞ · CAPÍTULO · runtime de los paneles
 *
 * Todo lo que respira en la lámina menos el mapa orbital, que tiene el suyo.
 *
 * La ley de dosificación se aplica acá con un criterio explícito: **se anima
 * lo que es medición, se dibuja una vez lo que es estudio.**
 *
 *  · Tickean — telemetría, coordenadas, cartas de señal, espectro. Son
 *    instrumentos: un instrumento quieto está roto.
 *  · Se dibujan UNA vez — estudios de diagrama, glifos de constelación, tile
 *    móvil. Son estudios y arquetipos, no lecturas. Animarlos no agregaría
 *    información y sí quince bucles compitiendo por el mismo cuadro, que en el
 *    iMac 2015 con el que se revisa esto es la diferencia entre fluido y
 *    inservible.
 *
 * Un solo `requestAnimationFrame` para todo lo vivo. Cinco bucles sueltos
 * cuestan cinco veces el trabajo de agenda y se desincronizan entre sí.
 */

type Bus = { activo: boolean; low: number; mid: number; high: number };

const TAU = Math.PI * 2;

function audio(t: number): Bus {
  const b = (window as any).__kxAudio as Bus | undefined;
  if (b?.activo) return b;
  // Sin sonido, respiración sintética: un panel congelado se lee como roto.
  return {
    activo: false,
    low: 0.5 + Math.sin(t * 0.7) * 0.3,
    mid: 0.5 + Math.sin(t * 1.3 + 1.7) * 0.25,
    high: 0.5 + Math.sin(t * 2.1 + 3.1) * 0.2,
  };
}

/** Ruido determinista: el mismo estudio se dibuja siempre igual. */
function azar(semilla: number): () => number {
  let s = semilla || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function ajustar(cv: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = cv.getBoundingClientRect();
  if (r.width > 0) {
    cv.width = Math.round(r.width * dpr);
    cv.height = Math.round(r.height * dpr);
  }
  return cv.getContext("2d");
}

/* ── Lo que se dibuja UNA vez ──────────────────────────────────────────── */

/** Panel 05 · los cuatro estudios de diagrama. */
function estudio(cv: HTMLCanvasElement, i: number, acc: string): void {
  const ctx = ajustar(cv);
  if (!ctx) return;
  const w = cv.width;
  const h = cv.height;
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.38;
  const r = azar(i * 977 + 13);

  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(232,229,222,0.44)";

  if (i === 0) {
    // ORBITAL GEOMETRY: elipses concéntricas con un cuerpo en cada una.
    for (let k = 1; k <= 4; k++) {
      const rr = (R * k) / 4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rr, rr * 0.5, 0, 0, TAU);
      ctx.stroke();
      const a = r() * TAU;
      ctx.fillStyle = k === 2 ? acc : "rgba(232,229,222,0.8)";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.5, 2, 0, TAU);
      ctx.fill();
    }
  } else if (i === 1) {
    // VECTOR WEB: nodos en círculo, todos contra todos.
    const n = 9;
    const p: [number, number][] = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU;
      p.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.82]);
    }
    ctx.strokeStyle = "rgba(232,229,222,0.2)";
    for (let x = 0; x < n; x++) {
      for (let y = x + 1; y < n; y++) {
        ctx.beginPath();
        ctx.moveTo(p[x][0], p[x][1]);
        ctx.lineTo(p[y][0], p[y][1]);
        ctx.stroke();
      }
    }
    ctx.fillStyle = acc;
    for (const [x, y] of p) { ctx.beginPath(); ctx.arc(x, y, 1.7, 0, TAU); ctx.fill(); }
  } else if (i === 2) {
    // NODE STRUCTURE: anillo de nodos y radios al centro.
    const n = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, TAU);
    ctx.stroke();
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      ctx.strokeStyle = "rgba(232,229,222,0.16)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = k % 3 === 0 ? acc : "rgba(232,229,222,0.7)";
      ctx.beginPath();
      ctx.arc(x, y, k % 3 === 0 ? 2.4 : 1.5, 0, TAU);
      ctx.fill();
    }
  } else {
    // GATE ARCHETYPE: el arco del póster.
    const bw = R * 0.62;
    const by = cy + R * 0.72;
    ctx.beginPath();
    ctx.moveTo(cx - bw, by);
    ctx.lineTo(cx - bw, cy - R * 0.1);
    ctx.arc(cx, cy - R * 0.1, bw, Math.PI, 0);
    ctx.lineTo(cx + bw, by);
    ctx.stroke();
    ctx.strokeStyle = "rgba(232,229,222,0.22)";
    for (let k = 1; k < 5; k++) {
      const yy = by - (k / 5) * (by - cy + R * 0.6);
      ctx.beginPath();
      ctx.moveTo(cx - bw, yy);
      ctx.lineTo(cx + bw, yy);
      ctx.stroke();
    }
    ctx.strokeStyle = acc;
    ctx.beginPath();
    ctx.arc(cx, cy - R * 0.1, bw * 0.42, 0, TAU);
    ctx.stroke();
  }
}

/**
 * Panel 06 · los siete arquetipos.
 *
 * Cada uno es una constelación: nodos unidos por líneas, como en el plano. La
 * forma sale de la semilla, así que THE SEED siempre se ve igual — un
 * arquetipo que cambia de forma en cada visita no es un arquetipo.
 */
function arquetipo(cv: HTMLCanvasElement, i: number, nodos: number, acc: string): void {
  const ctx = ajustar(cv);
  if (!ctx) return;
  const w = cv.width;
  const h = cv.height;
  const r = azar(i * 3301 + 7);
  ctx.clearRect(0, 0, w, h);

  const p: [number, number][] = [];
  for (let k = 0; k < nodos; k++) {
    const a = (k / nodos) * TAU + r() * 0.5;
    const rad = (0.24 + r() * 0.2) * Math.min(w, h);
    p.push([w / 2 + Math.cos(a) * rad, h / 2 + Math.sin(a) * rad]);
  }

  ctx.strokeStyle = "rgba(232,229,222,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  p.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.stroke();

  p.forEach(([x, y], k) => {
    ctx.fillStyle = k === 0 ? acc : "rgba(232,229,222,0.85)";
    ctx.beginPath();
    ctx.arc(x, y, k === 0 ? 2.6 : 1.7, 0, TAU);
    ctx.fill();
  });
}

/** Panel 11 · el tile 9:16: árbol arriba, mapa orbital abajo. */
function tile(cv: HTMLCanvasElement, acc: string): void {
  const ctx = ajustar(cv);
  if (!ctx) return;
  const w = cv.width;
  const h = cv.height;
  ctx.clearRect(0, 0, w, h);
  const r = azar(4211);

  // Árbol: ramas recursivas. Es el motivo del capítulo en versión vertical.
  const rama = (x: number, y: number, ang: number, len: number, prof: number) => {
    if (prof === 0 || len < 2) return;
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    ctx.strokeStyle = `rgba(255,46,126,${0.2 + prof * 0.12})`;
    ctx.lineWidth = Math.max(0.5, prof * 0.4);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    rama(x2, y2, ang - 0.42 - r() * 0.16, len * 0.72, prof - 1);
    rama(x2, y2, ang + 0.42 + r() * 0.16, len * 0.72, prof - 1);
  };
  rama(w / 2, h * 0.46, -Math.PI / 2, h * 0.1, 5);

  // Mapa orbital reducido.
  const cx = w / 2;
  const cy = h * 0.72;
  const R = Math.min(w, h) * 0.2;
  ctx.strokeStyle = "rgba(232,229,222,0.3)";
  ctx.lineWidth = 1;
  for (let k = 1; k <= 3; k++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, (R * k) / 3, ((R * k) / 3) * 0.55, 0, 0, TAU);
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
  g.addColorStop(0, acc);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.5, 0, TAU);
  ctx.fill();
}

/* ── Lo que tickea ─────────────────────────────────────────────────────── */

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-capitulo]");
  if (!raiz || (raiz as any).__kdxCap) return;
  (raiz as any).__kdxCap = true;

  const acc = getComputedStyle(raiz).getPropertyValue("--acc").trim() || "#FF2E7E";

  // Estáticos: una vez, y sólo cuando se acercan a pantalla.
  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      const cv = e.target as HTMLCanvasElement;
      if (cv.dataset.kdxEstudio !== undefined) estudio(cv, Number(cv.dataset.kdxEstudio), acc);
      else if (cv.dataset.kdxArquetipo !== undefined) {
        arquetipo(cv, Number(cv.dataset.kdxArquetipo), Number(cv.dataset.nodos || 5), acc);
      } else if (cv.dataset.kdxTile !== undefined) tile(cv, acc);
      io.unobserve(cv);
    }
  }, { rootMargin: "150px" });
  for (const cv of raiz.querySelectorAll<HTMLCanvasElement>(
    "[data-kdx-estudio],[data-kdx-arquetipo],[data-kdx-tile]",
  )) io.observe(cv);

  // Vivos.
  const bandas = raiz.querySelector<HTMLCanvasElement>("[data-kdx-bandas]");
  const fuerza = raiz.querySelector<HTMLCanvasElement>("[data-kdx-fuerza-onda]");
  const reso = raiz.querySelector<HTMLCanvasElement>("[data-kdx-resonancia]");
  const espectro = raiz.querySelector<HTMLCanvasElement>("[data-kdx-espectro]");
  const ctxB = bandas && ajustar(bandas);
  const ctxF = fuerza && ajustar(fuerza);
  const ctxR = reso && ajustar(reso);
  const ctxE = espectro && ajustar(espectro);

  const coordX = raiz.querySelector<HTMLElement>('[data-kdx-coord="x"]');
  const coordY = raiz.querySelector<HTMLElement>('[data-kdx-coord="y"]');
  const coordZ = raiz.querySelector<HTMLElement>('[data-kdx-coord="z"]');
  const drift = raiz.querySelector<HTMLElement>("[data-kdx-drift]");
  const sync = raiz.querySelector<HTMLElement>("[data-kdx-sync]");
  const fuerzaTxt = raiz.querySelector<HTMLElement>("[data-kdx-fuerza]");
  const teles = [...raiz.querySelectorAll<HTMLElement>("[data-kdx-tele]")]
    .filter((e) => e.dataset.kdxTele);

  // El rótulo de fase del panel 04 sigue al botón activo.
  const rotFase = raiz.querySelector<HTMLElement>("[data-kdx-fase-rot]");
  for (const b of raiz.querySelectorAll<HTMLButtonElement>("[data-kdx-fase]")) {
    b.addEventListener("click", () => {
      if (rotFase) rotFase.textContent = b.dataset.kdxFase!;
    });
  }

  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = performance.now();
  let visible = true;
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); }).observe(raiz);

  const onda = (ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, t: number, f: number, col: string) => {
    const w = cv.width;
    const h = cv.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1;
    const paso = 3;
    for (let x = 0; x < w; x += paso) {
      const n = Math.sin(x * 0.06 + t * f) * Math.sin(x * 0.017 - t * f * 0.6);
      const a = Math.abs(n) * h * 0.46;
      ctx.beginPath();
      ctx.moveTo(x, h / 2 - a);
      ctx.lineTo(x, h / 2 + a);
      ctx.stroke();
    }
  };

  const cuadro = () => {
    if (visible) {
      const t = quieto ? 0 : (performance.now() - t0) / 1000;
      const a = audio(t);

      // Coordenadas: derivan despacio. El plano dice DRIFT 0.00087% — la
      // lectura tiene que moverse en ese orden, no saltar de grado en grado.
      if (coordX) coordX.textContent = `${(Math.sin(t * 0.11) * 0.9).toFixed(3)}° N`;
      if (coordY) coordY.textContent = `${(Math.cos(t * 0.09) * 0.9).toFixed(3)}° E`;
      if (coordZ) coordZ.textContent = `${(Math.sin(t * 0.07 + 1.2) * 0.9).toFixed(3)}° Ω`;
      if (drift) drift.textContent = `${(0.00087 + Math.sin(t * 0.3) * 0.00004).toFixed(5)}%`;
      if (sync) sync.textContent = `${(98.2 + a.mid * 1.2).toFixed(1)}%`;

      const f = 87.6 + (a.low - 0.5) * 7;
      if (fuerzaTxt) fuerzaTxt.textContent = `${f.toFixed(1)}%`;

      for (const el of teles) {
        const base = parseFloat(el.dataset.kdxTele!);
        const amp = parseFloat(el.dataset.amp || "0");
        const dec = (el.dataset.kdxTele!.split(".")[1] || "").length;
        const v = base + Math.sin(t * 0.6 + base) * amp * (0.4 + a.mid * 0.6);
        el.textContent = `${v.toFixed(dec)}${el.dataset.u || ""}`;
      }

      // Panel 07 · bandas de frecuencia. Cinco bandas, del grave al agudo,
      // leyendo el bus real cuando hay sonido.
      if (ctxB && bandas) {
        const w = bandas.width;
        const h = bandas.height;
        ctxB.clearRect(0, 0, w, h);
        const n = 96;
        for (let i = 0; i < n; i++) {
          const p = i / n;
          const banda = p < 0.2 ? a.low : p < 0.6 ? a.mid : a.high;
          const v = banda * (0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + t * 3)));
          const bh = v * h * 0.92;
          ctxB.fillStyle = p < 0.45 ? acc : "#4FC3F7";
          ctxB.globalAlpha = 0.35 + v * 0.6;
          ctxB.fillRect((i / n) * w, (h - bh) / 2, w / n - 1, bh);
        }
        ctxB.globalAlpha = 1;
      }

      if (ctxF && fuerza) onda(ctxF, fuerza, t, 2.2, acc);
      // Ψ 0.618 — la razón áurea del plano manda la frecuencia de esta onda.
      if (ctxR && reso) onda(ctxR, reso, t, 0.618, "#4FC3F7");

      // SPECTRUM READOUT: anillos polares que responden al espectro.
      if (ctxE && espectro) {
        const w = espectro.width;
        const h = espectro.height;
        const cx = w / 2;
        const cy = h / 2;
        ctxE.clearRect(0, 0, w, h);
        const R = Math.min(w, h) * 0.42;
        for (let k = 0; k < 3; k++) {
          const banda = [a.low, a.mid, a.high][k];
          ctxE.strokeStyle = k === 1 ? "#4FC3F7" : acc;
          ctxE.globalAlpha = 0.32 + banda * 0.5;
          ctxE.lineWidth = 1;
          ctxE.beginPath();
          for (let i = 0; i <= 120; i++) {
            const ang = (i / 120) * TAU;
            const d = R * (0.42 + k * 0.2) * (1 + Math.sin(ang * (5 + k * 3) + t * (1 + k)) * banda * 0.22);
            const x = cx + Math.cos(ang) * d;
            const y = cy + Math.sin(ang) * d;
            i ? ctxE.lineTo(x, y) : ctxE.moveTo(x, y);
          }
          ctxE.closePath();
          ctxE.stroke();
        }
        ctxE.globalAlpha = 1;
      }
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
