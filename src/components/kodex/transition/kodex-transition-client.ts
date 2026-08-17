/**
 * KODEX-∞ · RITUAL DE TRANSICIÓN · runtime
 *
 * Colapsar, navegar, recomponer. Los tres tiempos del preset
 * MOTION_12_STATE_TRANSITION.
 *
 * KOD-74 keeps one shared ritual/runtime and varies only the spatial grammar
 * for two evidence-backed boundaries. Route, state, memory and navigation
 * authority remain unchanged.
 */
import { estadoEscena, montarEstadoEscena } from "../../../lib/kodex/estado";
import { montarRueda } from "../../../lib/kodex/scroll";

const REDUCIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;

type VarianteRitual = "default" | "descent" | "cosmology";

const RUTA_PROLOGUE = "/kodex/folio/i/";
const RUTA_DESCENT = "/kodex/folio/ii/";
const RUTA_MACHINE = "/kodex/folio/iv/";
const RUTA_COSMOLOGY = "/kodex/folio/v/";

function rutaCanonica(pathname: string): string {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

/**
 * Small bounded mapping from an already-selected corridor boundary to the
 * presentation variant of the existing ritual. This never chooses a route.
 */
function resolverVariante(desde: string, hasta: string): VarianteRitual {
  const from = rutaCanonica(desde);
  const to = rutaCanonica(hasta);
  if (from === RUTA_PROLOGUE && to === RUTA_DESCENT) return "descent";
  if (from === RUTA_MACHINE && to === RUTA_COSMOLOGY) return "cosmology";
  return "default";
}

/** Cuánto dura, leído de la gramática con respaldo dentro del rango del preset. */
function duracion(): number {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--kdx-m-state-transition")
    .trim();
  const n = Number.parseFloat(v);
  if (Number.isFinite(n) && n > 0) return v.endsWith("ms") ? n : n * 1000;
  return 1400;
}

class Ritual {
  private readonly raiz: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private corriendo = false;
  private variante: VarianteRitual = "default";

  constructor(raiz: HTMLElement) {
    this.raiz = raiz;
    this.canvas = raiz.querySelector("[data-kdx-ritual-canvas]") as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext("2d") ?? null;
    this.aplicarVariante("default");
    this.medir();
    addEventListener("resize", () => this.medir(), { passive: true });
  }

  private aplicarVariante(variante: VarianteRitual): void {
    this.variante = variante;
    this.raiz.dataset.variante = variante;
  }

  private medir(): void {
    if (!this.canvas) return;
    // Media resolución a propósito: este canvas sólo define masa/ritual.
    const d = Math.min(devicePixelRatio || 1, 1.5) * 0.5;
    this.canvas.width = Math.max(2, Math.round(innerWidth * d));
    this.canvas.height = Math.max(2, Math.round(innerHeight * d));
  }

  /** Ritual base: bandas horizontales del sistema existente. */
  private pintarDefault(t: number, accent: string): void {
    const { ctx, canvas } = this;
    if (!ctx) return;
    const { width: w, height: h } = canvas;
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
   * PROLOGUE → DESCENT: the target is revealed as descending strata, not as
   * another aperture. Black rises to close the source; on recomposition the
   * same staggered curtain falls away, revealing the target from top to bottom.
   */
  private pintarDescenso(t: number, accent: string): void {
    const { ctx, canvas } = this;
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    const columnas = 18;
    const ancho = w / columnas;
    for (let i = 0; i < columnas; i++) {
      const centro = Math.abs(i - (columnas - 1) / 2) / ((columnas - 1) / 2);
      const retraso = centro * 0.22 + (i % 3) * 0.025;
      const local = Math.max(0, Math.min(1, (t - retraso) / (1 - retraso || 1)));
      if (local <= 0) continue;
      const alto = h * local;
      const y = h - alto;
      ctx.fillStyle = "#050507";
      ctx.fillRect(i * ancho, y, ancho + 1, alto + 1);
      if (local < 0.985) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.72;
        ctx.fillRect(i * ancho, Math.max(0, y - 1), ancho + 1, 2);
        ctx.globalAlpha = 1;
      }
    }
  }

  /**
   * MACHINE → COSMOLOGY: computation contracts to one point, then the target
   * field expands from that same point. One arrival, not ritual + second reveal.
   */
  private pintarCosmologia(t: number, accent: string): void {
    const { ctx, canvas } = this;
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const maxR = Math.hypot(w, h) * 0.56;
    const radioVisible = maxR * (1 - t);

    ctx.fillStyle = "#050507";
    ctx.fillRect(0, 0, w, h);

    if (radioVisible > 0.5) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, cy, radioVisible, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (radioVisible > 2 && radioVisible < maxR * 0.985) {
      ctx.save();
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.72;
      ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.004);
      ctx.beginPath();
      ctx.arc(cx, cy, radioVisible, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Dibuja el colapso o la recomposición.
   * @param t 0..1 · en colapso avanza hacia 1; en recomposición, hacia 0.
   */
  private pintar(t: number, accent: string): void {
    const { ctx, canvas } = this;
    if (!ctx) return;
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.variante === "descent") {
      this.pintarDescenso(t, accent);
      return;
    }
    if (this.variante === "cosmology") {
      this.pintarCosmologia(t, accent);
      return;
    }
    this.pintarDefault(t, accent);
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

    let destino: URL;
    try {
      destino = new URL(url, location.href);
    } catch (_) {
      destino = new URL(location.href);
    }
    const variante = resolverVariante(location.pathname, destino.pathname);
    this.aplicarVariante(variante);
    try {
      sessionStorage.setItem("kdx-ritual-pending", "1");
      sessionStorage.setItem("kdx-ritual-variant", variante);
    } catch (_) {}

    // Antes de colapsar, la escena se abre. Es el momento en que el portal, el
    // campo y el sonido se van juntos -- un solo estado, tres capas.
    estadoEscena().ir("transitionOut");

    const ms = duracion();
    this.raiz.style.setProperty("--kdx-ritual-ms", `${ms}ms`);
    this.raiz.dataset.activo = "";
    this.raiz.dataset.fase = "colapso";

    try {
      await this.animar(0, 1, ms * 0.62);
    } finally {
      location.href = url;
    }
  }

  /** Al llegar: el mismo gesto al revés, para que se lea como continuación. */
  async recomponer(variante: VarianteRitual = "default"): Promise<void> {
    this.aplicarVariante(variante);
    if (REDUCIDO) return;
    const ms = duracion();
    this.raiz.dataset.activo = "";
    this.raiz.dataset.fase = "recomposicion";
    this.pintar(1, this.acento());
    await this.animar(1, 0, ms * 0.5);
    delete this.raiz.dataset.activo;
    delete this.raiz.dataset.fase;
    this.aplicarVariante("default");
  }
}

let ritual: Ritual | null = null;

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-ritual]");
  if (!raiz) return;
  montarEstadoEscena();
  montarRueda();
  ritual = new Ritual(raiz);

  // El motor sólo entrega el destino. El ritual deriva la variante desde la
  // frontera origen→destino; elegir la ruta sigue perteneciendo al deck/router.
  (window as unknown as { __kdxRitual?: (u: string) => void }).__kdxRitual = (u) => {
    void ritual?.ir(u);
  };

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
  let variantePendiente: VarianteRitual = "default";
  try {
    pendiente = sessionStorage.getItem("kdx-ritual-pending") === "1";
    const almacenada = sessionStorage.getItem("kdx-ritual-variant");
    if (almacenada === "descent" || almacenada === "cosmology") variantePendiente = almacenada;
    if (pendiente) sessionStorage.removeItem("kdx-ritual-pending");
    sessionStorage.removeItem("kdx-ritual-variant");
  } catch (_) {}
  if (pendiente) void ritual.recomponer(variantePendiente);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
