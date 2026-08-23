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
      // La deformación por brazo es lo que evita que sea un círculo: cada
      // anillo respira con la simetría del volumen.
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

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-museo]");
  if (!raiz || (raiz as any).__kdxMuseo) return;
  (raiz as any).__kdxMuseo = true;

  /*
   * ARCHIVE relation-first convergence.
   *
   * The current poster-era stylesheet still contains a legacy rule that hides
   * `.kx-os-stage__museo` with `display:none !important`. That rule predates
   * the bounded relation field added to this component and was silently
   * defeating the current 08E/reference-first intent in the live folio.
   *
   * Keep the old stylesheet untouched for historical layouts, but on the
   * actual ARCHIVE scene restore this already-mounted component explicitly.
   * This is presentation-only: no route, graph, memory, provenance, artwork
   * bytes or semantic relation data are changed.
   */
  if (raiz.closest(".kx-os-scene--archive")) {
    raiz.style.setProperty("display", "grid", "important");

    /*
     * Reference-first quieting pass.
     * ARCHIVE must read artwork/specimen first and relation territory second,
     * not as another HUD panel. Keep the same nine real records and semantic
     * links, but remove first-view dashboard cues: frame/grid, visible system
     * header/count, and secondary per-node metadata. Hidden copy stays in the
     * accessibility tree, so this changes hierarchy rather than information.
     */
    const relation = raiz.querySelector<HTMLElement>(".kdx-museo__relation");
    relation?.style.setProperty("border-color", "transparent");
    relation?.style.setProperty(
      "background",
      "radial-gradient(circle at 50% 48%, color-mix(in srgb, var(--acc, #A7FF00) 7%, transparent), transparent 38%)",
      "important",
    );

    raiz.querySelector<HTMLElement>(".kdx-museo__relation-head")?.classList.add("visually-hidden");
    for (const meta of raiz.querySelectorAll<HTMLElement>(".kdx-museo__node-copy small")) {
      meta.classList.add("visually-hidden");
    }
    for (const trace of raiz.querySelectorAll<HTMLElement>(".kdx-museo__trace")) {
      trace.style.opacity = "0.2";
    }
  }

  // Los organismos, una sola vez y sólo cuando la celda se acerca a pantalla.
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

  // Filtro. En el cliente y sin recargar: un índice que navega para filtrar
  // deja de ser un índice.
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
  // Escape limpia: si la búsqueda no se puede deshacer rápido, el visitante
  // queda encerrado en su propio filtro.
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
