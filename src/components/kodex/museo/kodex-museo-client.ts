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

/**
 * ARCHIVE reference-first convergence.
 *
 * El stylesheet heredado todavía contiene una regla `display:none !important`
 * para `.kx-os-stage__museo`. Además, la primera versión de este refine
 * aplicaba la quieting visual sólo dentro de `DOMContentLoaded`, lo que dejaba
 * una ventana donde el frame inicial podía mostrar el panel/grid/header viejo
 * antes de esconderlo.
 *
 * Este paso no cambia datos, rutas, graph, memoria ni artwork: aplica la misma
 * decisión de jerarquía inmediatamente cuando el módulo se evalúa, cuando el
 * markup del componente ya existe, y antes del trabajo diferido del índice.
 */
function aplicarConvergenciaArchive(): void {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-museo]");
  const scene = raiz?.closest<HTMLElement>(".kx-os-scene--archive");
  if (!raiz || !scene) return;

  raiz.style.setProperty("display", "grid", "important");

  // El espécimen y el territorio relacional ya viven dentro de la misma
  // figura. Forzarlos al mismo plano evita que el grid heredado los coloque en
  // filas implícitas y recorte el museo fuera del first-view. No se crea otro
  // graph: sólo se corrige el stacking de los elementos existentes.
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

  // El dossier completo ya existe detrás de OPEN SPECIMEN. Repetir
  // CLASS/YEAR/METHOD/STATUS en el first-view hacía que ARCHIVE volviera a
  // leerse como panel antes que como memoria espacial. Se oculta sólo esa
  // copia redundante; el botón y el drawer siguen siendo la vía explícita.
  // El atributo `hidden` solo no basta aquí porque el CSS heredado del readout
  // fuerza su `dl` a display:grid. La prioridad explícita garantiza que el
  // first-view respete el wireframe sin tocar el contenido del dossier.
  const readout = scene.querySelector<HTMLElement>("[data-kdx-archive]");
  const dossier = readout?.querySelector<HTMLElement>("dl");
  dossier?.setAttribute("hidden", "");
  dossier?.style.setProperty("display", "none", "important");
}

// El <script> del componente está después del markup; aplicar ahora evita que
// la jerarquía de ARCHIVE dependa de esperar DOMContentLoaded.
aplicarConvergenciaArchive();

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-museo]");
  if (!raiz || (raiz as any).__kdxMuseo) return;
  (raiz as any).__kdxMuseo = true;

  // Astro puede reemplazar el documento en navegación cliente. Reaplicar la
  // misma convergencia es idempotente y mantiene el first-view consistente.
  aplicarConvergenciaArchive();

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
