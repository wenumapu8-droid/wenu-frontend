/**
 * KODEX-∞ · RITUAL DE TRANSICIÓN · runtime
 *
 * Colapsar, navegar, recomponer. Los tres tiempos del preset
 * MOTION_12_STATE_TRANSITION.
 *
 * El colapso son bandas horizontales que se cierran hacia el centro, como una
 * pantalla que pierde sincronía y se recoge. No es un fundido: un fundido dice
 * "esto terminó" y acá no termina nada -- se pasa a otra lámina del mismo
 * archivo. La recomposición al llegar es el mismo gesto al revés, y por eso la
 * escena siguiente se siente como continuación y no como página nueva.
 */
import { estadoEscena, montarEstadoEscena } from "../../../lib/kodex/estado";
import { montarRueda } from "../../../lib/kodex/scroll";

const REDUCIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  constructor(raiz: HTMLElement) {
    this.raiz = raiz;
    this.canvas = raiz.querySelector("[data-kdx-ritual-canvas]") as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext("2d") ?? null;
    this.medir();
    addEventListener("resize", () => this.medir(), { passive: true });
  }

  private medir(): void {
    if (!this.canvas) return;
    // Media resolución a propósito: las bandas son bloques duros, no dibujo
    // fino, y esto corre justo cuando la página siguiente empieza a cargar.
    const d = Math.min(devicePixelRatio || 1, 1.5) * 0.5;
    this.canvas.width = Math.max(2, Math.round(innerWidth * d));
    this.canvas.height = Math.max(2, Math.round(innerHeight * d));
  }

  /**
   * Dibuja el colapso o la recomposición.
   * @param t 0..1 · en colapso avanza hacia 1; en recomposición, hacia 0.
   */
  private pintar(t: number, accent: string): void {
    const { ctx, canvas } = this;
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    ctx.clearRect(0, 0, w, h);

    // Las bandas no cierran todas a la vez: cada una tiene su propio retraso
    // según su distancia al centro. Cerrando juntas se ve como una persiana;
    // escalonadas se ve como una señal que se pierde.
    const bandas = 22;
    const alto = h / bandas;
    for (let i = 0; i < bandas; i++) {
      const dist = Math.abs(i - (bandas - 1) / 2) / ((bandas - 1) / 2);
      const retraso = dist * 0.45;
      const local = Math.max(0, Math.min(1, (t - retraso) / (1 - retraso || 1)));
      if (local <= 0) continue;
      // Desde los dos lados hacia el centro de la banda.
      const ancho = (w / 2) * local;
      ctx.fillStyle = "#050507";
      ctx.fillRect(0, i * alto, ancho, alto + 1);
      ctx.fillRect(w - ancho, i * alto, ancho, alto + 1);
      // Filo de acento en la cabeza de cada banda: es lo que hace legible el
      // movimiento. Sin él, el negro sobre negro no se ve avanzar.
      if (local < 0.98) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(ancho - 2, i * alto, 2, alto + 1);
        ctx.fillRect(w - ancho, i * alto, 2, alto + 1);
        ctx.globalAlpha = 1;
      }
    }
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
        // Suavizado en la salida: el colapso arranca decidido y se asienta.
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
    try { sessionStorage.setItem("kdx-ritual-pending", "1"); } catch (_) {}

    // Antes de colapsar, la escena se abre. Es el momento en que el portal, el
    // campo y el sonido se van juntos -- un solo estado, tres capas.
    estadoEscena().ir("transitionOut");

    const ms = duracion();
    this.raiz.style.setProperty("--kdx-ritual-ms", `${ms}ms`);
    this.raiz.dataset.activo = "";
    this.raiz.dataset.fase = "colapso";

    // La navegación es una invariante funcional; el ritual es una capa de
    // presentación. requestAnimationFrame puede quedar detenido bajo presión
    // de GPU/CPU, pestañas throttled o runners headless. El deck ya tenía un
    // salvavidas equivalente; los enlaces internos directos no. El watchdog
    // deriva del propio tiempo del preset y evita que una transición visual
    // pueda encerrar al visitante indefinidamente.
    const desde = location.href;
    const watchdog = setTimeout(() => {
      if (location.href === desde) location.href = url;
    }, Math.max(1800, ms * 1.25));

    // La navegación va en `finally`: si el dibujo del colapso lanza -- un
    // contexto perdido, un canvas de cero -- el visitante igual llega. El
    // ritual es la forma; llegar es la función.
    try {
      await this.animar(0, 1, ms * 0.62);
    } finally {
      clearTimeout(watchdog);
      location.href = url;
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
  }
}

let ritual: Ritual | null = null;

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-ritual]");
  if (!raiz) return;
  montarEstadoEscena();
  // La rueda se monta desde acá y no desde el campo: el ritual está en las
  // siete láminas y el campo no. Montarla desde el campo dejaba sin
  // herramienta a las escenas sin organismo -- ARCHIVE y RETURN -- y la regla
  // de "el scroll es una herramienta" no admite excepciones por escena.
  montarRueda();
  ritual = new Ritual(raiz);

  // Se expone para que el motor del deck lo use en vez de su desvanecido.
  (window as unknown as { __kdxRitual?: (u: string) => void }).__kdxRitual = (u) => {
    void ritual?.ir(u);
  };

  // Y se interceptan los enlaces del propio KODEX. Sólo los internos: un
  // enlace que sale del archivo no merece el ritual del archivo.
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (!url.pathname.startsWith("/kodex/")) return;
      if (url.pathname === location.pathname) return;

      // Sólo se toma el control si hay ritual que ejecutarlo. Antes se llamaba
      // a preventDefault() y después se intentaba `ritual?.ir(...)`: si el
      // ritual no había montado -- root ausente, módulo que no cargó, error
      // temprano -- el enlace quedaba MUERTO. El museo entero depende de estos
      // clics, y un enlace que no navega es infinitamente peor que un enlace
      // sin transición.
      if (!ritual) return;
      e.preventDefault();
      void ritual.ir(url.href);
    },
    { capture: true },
  );

  let pendiente = false;
  try {
    pendiente = sessionStorage.getItem("kdx-ritual-pending") === "1";
    if (pendiente) sessionStorage.removeItem("kdx-ritual-pending");
  } catch (_) {}
  if (pendiente) void ritual.recomponer();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
