/**
 * KODEX-∞ · RITUAL DE TRANSICIÓN · runtime
 *
 * Colapsar, navegar, recomponer. Los tres tiempos del preset
 * MOTION_12_STATE_TRANSITION.
 *
 * El colapso base son bandas horizontales que se cierran hacia el centro, como
 * una pantalla que pierde sincronía y se recoge. El corredor de apertura usa
 * el MISMO runtime con un perfil de profundidad acotado: THRESHOLD→PROLOGUE y
 * PROLOGUE→DESCENT se leen como entrada hacia dentro, no como cambio de página.
 * No hay un segundo motor, router ni estado; sólo cambia la presentación del
 * ritual existente y la navegación sigue siendo la autoridad.
 */
import { estadoEscena, montarEstadoEscena } from "../../../lib/kodex/estado";
import { montarRueda } from "../../../lib/kodex/scroll";

const REDUCIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;
type RitualProfile = "bands" | "depth";

/** Cuánto dura, leído de la gramática con respaldo dentro del rango del preset. */
function duracion(): number {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--kdx-m-state-transition")
    .trim();
  const n = Number.parseFloat(v);
  if (Number.isFinite(n) && n > 0) return v.endsWith("ms") ? n : n * 1000;
  return 1400;
}

function normalizarRuta(pathname: string): string {
  if (pathname === "/kodex") return "/kodex/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

/**
 * El primer corredor necesita una sola lectura espacial: entrar hacia dentro.
 * Se mantiene deliberadamente acotado; el resto de KODEX conserva el ritual
 * base hasta que evidencia visual justifique otro perfil.
 */
function perfilEntre(origen: string, destino: string): RitualProfile {
  const from = normalizarRuta(origen);
  const to = normalizarRuta(destino);
  if (
    (from === "/kodex/" && to === "/kodex/folio/i/") ||
    (from === "/kodex/folio/i/" && to === "/kodex/folio/ii/")
  ) {
    return "depth";
  }
  return "bands";
}

function perfilValido(value: string | null): RitualProfile {
  return value === "depth" ? "depth" : "bands";
}

class Ritual {
  private readonly raiz: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private corriendo = false;
  private perfil: RitualProfile = "bands";

  constructor(raiz: HTMLElement) {
    this.raiz = raiz;
    this.canvas = raiz.querySelector("[data-kdx-ritual-canvas]") as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext("2d") ?? null;
    this.medir();
    addEventListener("resize", () => this.medir(), { passive: true });
  }

  usarPerfil(perfil: RitualProfile): void {
    this.perfil = perfil;
    this.raiz.dataset.perfil = perfil;
  }

  private medir(): void {
    if (!this.canvas) return;
    // Media resolución a propósito: el ritual ocurre durante navegación y no
    // debe competir con el siguiente frame por presupuesto de GPU/main thread.
    const d = Math.min(devicePixelRatio || 1, 1.5) * 0.5;
    this.canvas.width = Math.max(2, Math.round(innerWidth * d));
    this.canvas.height = Math.max(2, Math.round(innerHeight * d));
  }

  /** Perfil base: pérdida de sincronía / cierre por bandas. */
  private pintarBandas(t: number, accent: string): void {
    const { ctx, canvas } = this;
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    const bandas = 22;
    const alto = h / bandas;
    for (let i = 0; i < bandas; i++) {
      const dist = Math.abs(i - (bandas - 1) / 2) / ((bandas - 1) / 2);
      const retraso = dist * 0.45;
      const local = Math.max(0, Math.min(1, (t - retraso) / (1 - retraso || 1)));
      if (local <= 0) continue;
      const ancho = (w / 2) * local;
      ctx.fillStyle = "#050507";
      ctx.fillRect(0, i * alto, ancho, alto + 1);
      ctx.fillRect(w - ancho, i * alto, ancho, alto + 1);
      if (local < 0.98) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(ancho - 2, i * alto, 2, alto + 1);
        ctx.fillRect(w - ancho, i * alto, 2, alto + 1);
        ctx.globalAlpha = 1;
      }
    }
  }

  /**
   * Perfil de profundidad del opening. No deforma la obra ni captura pixels:
   * construye una cámara/túnel encima de la escena mientras el fondo converge
   * a negro para que la navegación ocurra en un frame cubierto.
   */
  private pintarProfundidad(t: number, accent: string): void {
    const { ctx, canvas } = this;
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    const k = Math.max(0, Math.min(1, t));
    const cx = w * 0.5;
    const cy = h * 0.5;
    const maxR = Math.hypot(w, h) * 0.58;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = `rgba(5,5,7,${Math.pow(k, 1.35)})`;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    // Anillos de profundidad: nacen cerca del centro y atraviesan la cámara.
    // La elipse preserva el carácter de portal sin exigir un círculo perfecto.
    const rings = 10;
    for (let i = 0; i < rings; i++) {
      const phase = (i / rings + k * 1.18) % 1;
      const eased = phase * phase;
      const rx = Math.max(2, maxR * eased);
      const ry = Math.max(2, rx * 0.58);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = Math.max(0, (1 - phase) * 0.34 * (0.8 + k * 0.2));
      ctx.lineWidth = 0.7 + phase * 2.8;
      ctx.stroke();
    }

    // Trazas radiales subordinadas: sugieren velocidad/profundidad sin crear
    // una nueva gramática de contenido ni competir con la imagen de origen.
    const rays = 16;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + k * 0.22;
      const inner = maxR * (0.025 + 0.045 * k);
      const outer = maxR * (0.2 + 0.72 * k);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner * 0.58);
      ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer * 0.58);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.05 + k * 0.16;
      ctx.lineWidth = 0.7 + k * 0.8;
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  private pintar(t: number, accent: string): void {
    if (this.perfil === "depth") this.pintarProfundidad(t, accent);
    else this.pintarBandas(t, accent);
  }

  private acento(): string {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--kdx-scene-accent")
      .trim();
    return v || "#FF3833";
  }

  /** Anima de `desde` a `hasta` y resuelve al terminar. */
  private animar(desde: number, hasta: number, ms: number): Promise<void> {
    return new Promise((listo) => {
      if (REDUCIDO || !this.ctx) {
        setTimeout(listo, Math.min(240, ms));
        return;
      }
      const accent = this.acento();
      const t0 = performance.now();
      const paso = (ahora: number) => {
        const k = Math.min(1, (ahora - t0) / ms);
        const e = 1 - Math.pow(1 - k, 3);
        this.pintar(desde + (hasta - desde) * e, accent);
        if (k < 1) requestAnimationFrame(paso);
        else listo();
      };
      requestAnimationFrame(paso);
    });
  }

  /** El ritual completo: colapsa y recién entonces navega. */
  async ir(url: string): Promise<void> {
    if (this.corriendo || !url) return;
    this.corriendo = true;

    const destino = new URL(url, location.href);
    const perfil = perfilEntre(location.pathname, destino.pathname);
    this.usarPerfil(perfil);
    try {
      sessionStorage.setItem("kdx-ritual-pending", "1");
      sessionStorage.setItem("kdx-ritual-profile", perfil);
    } catch (_) {}

    // Antes de colapsar, la escena se abre. Es el momento en que el portal, el
    // campo y el sonido se van juntos -- un solo estado, tres capas.
    estadoEscena().ir("transitionOut");

    const ms = duracion();
    this.raiz.style.setProperty("--kdx-ritual-ms", `${ms}ms`);
    this.raiz.dataset.activo = "";
    this.raiz.dataset.fase = "colapso";

    // La navegación va en `finally`: si el dibujo del ritual falla, el enlace
    // conserva su función y el visitante igual llega al destino explícito.
    try {
      await this.animar(0, 1, ms * 0.62);
    } finally {
      location.href = destino.href;
    }
  }

  /** Al llegar: el mismo gesto al revés, para que se lea como continuación. */
  async recomponer(): Promise<void> {
    if (REDUCIDO) return;
    const ms = duracion();
    this.raiz.dataset.activo = "";
    this.raiz.dataset.fase = "recomposicion";
    this.pintar(1, this.acento());
    await this.animar(1, 0, ms * 0.5);
    delete this.raiz.dataset.activo;
    delete this.raiz.dataset.fase;
    delete this.raiz.dataset.perfil;
  }
}

let ritual: Ritual | null = null;

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-ritual]");
  if (!raiz) return;
  montarEstadoEscena();
  montarRueda();
  ritual = new Ritual(raiz);

  // Se expone para que el motor del deck lo use en vez de su desvanecido.
  (window as unknown as { __kdxRitual?: (u: string) => void }).__kdxRitual = (u) => {
    void ritual?.ir(u);
  };

  // Intercepta enlaces internos KODEX sin tocar enlaces externos ni modificar
  // historia antes de una elección explícita del visitante.
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (!url.pathname.startsWith("/kodex/")) return;
      if (url.pathname === location.pathname) return;
      if (!ritual) return;
      e.preventDefault();
      void ritual.ir(url.href);
    },
    { capture: true },
  );

  let pendiente = false;
  let perfilPendiente: RitualProfile = "bands";
  try {
    pendiente = sessionStorage.getItem("kdx-ritual-pending") === "1";
    perfilPendiente = perfilValido(sessionStorage.getItem("kdx-ritual-profile"));
    if (pendiente) sessionStorage.removeItem("kdx-ritual-pending");
    sessionStorage.removeItem("kdx-ritual-profile");
  } catch (_) {}
  if (pendiente) {
    ritual.usarPerfil(perfilPendiente);
    void ritual.recomponer();
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
