/**
 * KODEX-∞ · MUSEO · runtime
 *
 * Dos trabajos: filtrar el índice sin recargar, y dibujar el organismo de las
 * celdas que todavía no tienen obra.
 *
 * El organismo de celda se dibuja en Canvas 2D y no en WebGL a propósito. Un
 * índice puede tener cientos de celdas, y cientos de contextos WebGL no
 * existen: los navegadores limitan a unos ~16 y el resto queda negro. Canvas
 * 2D escala, y a este tamaño la diferencia no se ve.
 *
 * Cada celda se dibuja UNA vez. Un índice de doscientas celdas animándose
 * sería doscientos bucles compitiendo; lo que tiene que sentirse vivo es el
 * volumen cuando se abre, no la lista.
 */

const REDUCIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ARCHIVE_CONVERGENCE_STYLE_ID = "kdx-archive-reference-convergence";

/** Ruido determinista: la misma semilla dibuja siempre el mismo organismo. */
function azar(semilla: number): () => number {
  let s = semilla || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * Un organismo por celda: anillos concéntricos deformados y nodos.
 *
 * Es el mismo lenguaje del vórtice — espiral, trazas, nodos — reducido a lo
 * que se lee a 140px. Con más detalle a este tamaño queda una mancha.
 */
function dibujar(cv: HTMLCanvasElement, semilla: number): void {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const r = azar(semilla);
  const { width: w, height: h } = cv;
  const cx = w / 2;
  const cy = h / 2;

  ctx.fillStyle = "#050507";
  ctx.fillRect(0, 0, w, h);

  const brazos = 5 + Math.floor(r() * 9);
  const anillos = 4 + Math.floor(r() * 6);
  const giro = r() * Math.PI * 2;

  ctx.strokeStyle = "rgba(232,229,222,0.5)";
  ctx.lineWidth = 1;
  for (let a = 0; a < anillos; a++) {
    const rad = (a + 1) / (anillos + 1) * (w * 0.46);
    ctx.beginPath();
    for (let i = 0; i <= brazos * 8; i++) {
      const t = (i / (brazos * 8)) * Math.PI * 2;
      const d = rad * (1 + Math.sin(t * brazos + giro + a) * 0.14);
      const x = cx + Math.cos(t) * d;
      const y = cy + Math.sin(t) * d;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.globalAlpha = 0.22 + (a / anillos) * 0.5;
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(232,229,222,0.85)";
  for (let i = 0; i < brazos; i++) {
    const t = giro + (i / brazos) * Math.PI * 2;
    const d = w * 0.2 + r() * w * 0.24;
    ctx.fillRect(cx + Math.cos(t) * d - 1.5, cy + Math.sin(t) * d - 1.5, 3, 3);
  }
}

function asegurarJerarquiaVisualArchive(): void {
  if (document.getElementById(ARCHIVE_CONVERGENCE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = ARCHIVE_CONVERGENCE_STYLE_ID;
  style.textContent = `
    .kx-os-scene--archive .kx-os-stage {
      display: block !important;
      position: relative !important;
    }

    .kx-os-scene--archive .kx-os-stage__art {
      position: absolute !important;
      inset: calc(58px + env(safe-area-inset-top)) clamp(18px,3vw,48px)
        calc(70px + env(safe-area-inset-bottom)) clamp(18px,3vw,48px) !important;
      width: auto !important;
      height: auto !important;
      max-width: none !important;
      max-height: none !important;
      margin: 0 !important;
      border-color: transparent !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .kx-os-scene--archive .kx-os-stage__art::before {
      opacity: .3 !important;
    }

    .kx-os-scene--archive .kx-os-stage__copy {
      position: absolute !important;
      left: clamp(18px,3.2vw,54px) !important;
      bottom: calc(74px + env(safe-area-inset-bottom)) !important;
      z-index: 7 !important;
      width: min(31rem,34vw) !important;
      max-width: none !important;
      padding: 0 !important;
      pointer-events: none;
      text-shadow: 0 1px 22px rgba(0,0,0,.94);
    }

    .kx-os-scene--archive .kx-os-stage__copy > .kx-os-stage__kicker {
      margin: 0 0 7px !important;
      font-size: .58rem !important;
      letter-spacing: .24em !important;
      opacity: .5;
    }

    .kx-os-scene--archive .kx-os-stage__copy > h1 {
      max-width: 13ch !important;
      margin: 0 !important;
      font-size: clamp(1.55rem,2.65vw,3.2rem) !important;
      line-height: .94 !important;
      opacity: .72;
      text-wrap: balance;
    }

    .kx-os-scene--archive .kx-specimen-readout {
      margin-top: 9px !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      pointer-events: auto;
    }

    .kx-os-scene--archive .kx-specimen-readout::before {
      display: none !important;
    }

    .kx-os-scene--archive .kx-specimen-readout .kx-os-stage__sub {
      margin: 0 0 3px !important;
      font-size: .56rem !important;
      opacity: .48;
    }

    .kx-os-scene--archive .kx-specimen-readout h2 {
      margin: 0 !important;
      font-size: clamp(1rem,1.4vw,1.5rem) !important;
      line-height: 1 !important;
      opacity: .76;
    }

    .kx-os-scene--archive .kx-specimen-readout .kx-os-primary {
      width: auto !important;
      min-width: 44px;
      min-height: 44px !important;
      margin-top: 5px !important;
      padding: 8px 0 !important;
      border: 0 !important;
      background: transparent !important;
      color: rgba(230,230,230,.68) !important;
      box-shadow: none !important;
      font-size: .58rem !important;
      letter-spacing: .2em !important;
    }

    .kx-os-scene--archive .kx-specimen-readout .kx-os-primary:hover,
    .kx-os-scene--archive .kx-specimen-readout .kx-os-primary:focus-visible {
      color: #fff !important;
      outline: 1px solid rgba(197,138,50,.6);
      outline-offset: 4px;
    }

    @media (max-width: 900px) {
      /* Mobile is one continuous camera, not a 47svh artwork panel followed by
         a second page-like copy panel. Keep the governed memory chamber alive
         behind identity/action and let copy enter as a lower temporal layer. */
      .kx-os-scene--archive .kx-os-stage.kx-os-stage .kx-os-stage__art {
        top: calc(54px + env(safe-area-inset-top)) !important;
        right: 12px !important;
        bottom: calc(64px + env(safe-area-inset-bottom)) !important;
        left: 12px !important;
        height: auto !important;
        min-height: 0 !important;
      }

      .kx-os-scene--archive .kx-os-stage__copy {
        top: auto !important;
        right: 18px !important;
        bottom: calc(78px + env(safe-area-inset-bottom)) !important;
        left: 18px !important;
        width: min(18rem, 74vw) !important;
        max-width: none !important;
        display: grid;
        align-content: end;
        row-gap: 2px;
        overflow: visible;
        padding: 14px 12px 8px 0 !important;
        background: linear-gradient(90deg, rgba(2,2,2,.86), rgba(2,2,2,.48) 72%, transparent) !important;
      }

      .kx-os-scene--archive .kx-os-stage__copy > .kx-os-stage__kicker {
        margin-bottom: 4px !important;
        font-size: .5rem !important;
        letter-spacing: .18em !important;
      }

      .kx-os-scene--archive .kx-os-stage__copy > h1 {
        max-width: 11ch !important;
        font-size: clamp(1.22rem,5.4vw,1.72rem) !important;
        line-height: .94 !important;
        opacity: .72;
      }

      .kx-os-scene--archive .kx-specimen-readout {
        margin-top: 3px !important;
      }

      .kx-os-scene--archive .kx-specimen-readout h2 {
        font-size: clamp(.86rem,3.7vw,1.08rem) !important;
      }

      .kx-os-scene--archive .kx-specimen-readout .kx-os-primary {
        min-height: 44px !important;
        margin-top: 1px !important;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .kx-os-scene--archive .kx-os-stage__art,
      .kx-os-scene--archive .kx-os-stage__copy,
      .kx-os-scene--archive [data-kdx-museo] {
        animation: none !important;
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function aplicarConvergenciaArchive(): void {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-museo]");
  const scene = raiz?.closest<HTMLElement>(".kx-os-scene--archive");
  if (!raiz || !scene) return;

  asegurarJerarquiaVisualArchive();
  raiz.style.setProperty("display", "grid", "important");

  const art = raiz.closest<HTMLElement>(".kx-os-stage__art");
  const hero = art?.querySelector<HTMLElement>(".kx-archive-hero-specimen");
  if (art) {
    art.style.setProperty("isolation", "isolate");
  }
  if (hero) {
    hero.style.setProperty("position", "absolute");
    hero.style.setProperty("inset", "clamp(18px, 6%, 42px)");
    hero.style.setProperty("width", "calc(100% - clamp(36px, 12%, 84px))");
    hero.style.setProperty("height", "calc(100% - clamp(36px, 12%, 84px))");
    hero.style.setProperty("object-fit", "contain");
    hero.style.setProperty("padding", "0");
    hero.style.setProperty("z-index", "1");
  }
  raiz.style.setProperty("position", "absolute");
  raiz.style.setProperty("inset", "0");
  raiz.style.setProperty("width", "100%");
  raiz.style.setProperty("height", "100%");
  raiz.style.setProperty("z-index", "2");

  raiz.querySelector<HTMLElement>(".kdx-museo__relation-head")?.classList.add("visually-hidden");
  for (const meta of raiz.querySelectorAll<HTMLElement>(".kdx-museo__node-copy small")) {
    meta.classList.add("visually-hidden");
  }
  for (const trace of raiz.querySelectorAll<HTMLElement>(".kdx-museo__trace")) {
    trace.style.opacity = "0.2";
  }

  const readout = scene.querySelector<HTMLElement>("[data-kdx-archive]");
  const dossier = readout?.querySelector<HTMLElement>("dl");
  dossier?.setAttribute("hidden", "");
  dossier?.style.setProperty("display", "none", "important");
}

aplicarConvergenciaArchive();

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-museo]");
  if (!raiz || (raiz as any).__kdxMuseo) return;
  (raiz as any).__kdxMuseo = true;

  aplicarConvergenciaArchive();

  const pendientes = raiz.querySelectorAll<HTMLCanvasElement>("[data-kdx-museo-organismo]");
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        const cv = e.target as HTMLCanvasElement;
        dibujar(cv, Number(cv.dataset.semilla ?? 1));
        io.unobserve(cv);
      }
    },
    { rootMargin: "200px" },
  );
  for (const cv of pendientes) io.observe(cv);

  const input = raiz.querySelector<HTMLInputElement>("[data-kdx-museo-buscar]");
  const items = [...raiz.querySelectorAll<HTMLElement>("[data-kdx-museo-item]")];
  const cuenta = raiz.querySelector<HTMLElement>("[data-kdx-museo-cuenta]");
  const vacio = raiz.querySelector<HTMLElement>("[data-kdx-museo-vacio]");

  const filtrar = () => {
    const q = (input?.value ?? "").trim().toLowerCase();
    let visibles = 0;
    for (const li of items) {
      const ok = !q || (li.dataset.busca ?? "").includes(q);
      li.hidden = !ok;
      if (ok) visibles++;
    }
    if (cuenta) cuenta.textContent = String(visibles);
    if (vacio) vacio.hidden = visibles > 0;
  };

  input?.addEventListener("input", filtrar);
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && input.value) { input.value = ""; filtrar(); }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
