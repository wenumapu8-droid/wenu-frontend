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

/**
 * Cuánto dura la transición NORMAL.
 *
 * El ritual de 1.400 ms era el peaje de cada NEXT. Medido en navegador antes
 * de este cambio: 1.525 ms desde el clic hasta que la página siquiera se
 * descargaba, porque `location.href` se ejecutaba recién después de animar el
 * 62% del colapso. Ocín lo dijo sin rodeos: "la navegación normal NO debe
 * esperar un ritual de ~1.4 s".
 *
 * Así que el ritual deja de ser el peaje y pasa a ser el acontecimiento. Un
 * cambio de escena corriente dura lo que dura un gesto -- 180 a 320 ms -- y el
 * ritual largo se reserva para lo que de verdad es un umbral: entrar a −∞,
 * abrir el archivo, mutar una forma, RETURN. Se pide con `data-kdx-ritual`.
 */
function duracionRapida(): number {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--kdx-m-scene-swap")
    .trim();
  const n = Number.parseFloat(v);
  if (Number.isFinite(n) && n > 0) return v.endsWith("ms") ? n : n * 1000;
  return 260;
}

/**
 * Navegar sin router.
 *
 * Cuando el corredor corre con el router de vistas montado, este camino NO se
 * usa: el router intercepta el enlace antes y el ritual se limita a pintar
 * encima de un viaje que ya empezó. Esto es para las páginas del archivo que
 * no lo montan -- el umbral, las láminas sueltas -- donde una navegación de
 * documento sigue siendo la única forma de llegar.
 *
 * Se intentó resolver esto con `await import("astro:transitions/client")` y no
 * funciona: es un módulo virtual de Vite y un import dinámico con especificador
 * desnudo no se reescribe, así que el navegador lo pide tal cual y muere por
 * CORS. Medido en navegador, no deducido.
 */
function irA(url: string): void {
  location.href = url;
}

/**
 * ¿Está montado el router de vistas? Si lo está, él manda la navegación.
 *
 * Lo declara la página en el propio nodo del ritual. No se deduce del DOM:
 * la primera versión buscaba `[data-astro-transition-persist]` y ese atributo
 * lo lleva el cromo compartido, así que daba verdadero también en el umbral
 * -- donde no hay router -- y ahí los enlaces quedaban sin ritual y sin
 * intercambio. Se detectó en la prueba de humo, no en el build.
 */
function hayRouter(): boolean {
  return document.querySelector("[data-kdx-ritual]")?.hasAttribute("data-kdx-router") ?? false;
}

/** ¿Este destino merece el ritual largo? Lo declara el enlace, no el motor. */
function esUmbral(el: Element | null): boolean {
  const v = el?.getAttribute?.("data-kdx-ritual");
  return v === "largo" || v === "umbral";
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

  /** Sólo el colapso, sin navegar. Es lo que el router necesita: él ya viaja. */
  async colapsar(largo: boolean): Promise<void> {
    const ms = largo ? duracion() : duracionRapida();
    estadoEscena().ir("transitionOut");
    this.raiz.style.setProperty("--kdx-ritual-ms", `${ms}ms`);
    this.raiz.dataset.activo = "";
    this.raiz.dataset.fase = "colapso";
    this.raiz.dataset.modo = largo ? "umbral" : "rapido";
    await this.animar(0, 1, largo ? ms * 0.62 : ms);
  }

  /**
   * Ir a otra escena.
   *
   * Dos modos, y la diferencia no es cosmética:
   *
   *   largo=false (por defecto) — la navegación ARRANCA en el mismo cuadro del
   *     clic y el velo corre ENCIMA de la carga, no antes. El visitante deja de
   *     pagar el tiempo de la animación: lo paga la red, en paralelo.
   *
   *   largo=true — el ritual completo de siempre, intacto, para los umbrales.
   *     Colapsa primero y navega después, porque ahí la espera ES el contenido.
   */
  async ir(url: string, { largo = false }: { largo?: boolean } = {}): Promise<void> {
    if (this.corriendo || !url) return;
    this.corriendo = true;
    try { sessionStorage.setItem("kdx-ritual-pending", largo ? "largo" : "rapido"); } catch (_) {}

    // Antes de colapsar, la escena se abre. Es el momento en que el portal, el
    // campo y el sonido se van juntos -- un solo estado, tres capas.
    estadoEscena().ir("transitionOut");

    const ms = largo ? duracion() : duracionRapida();
    this.raiz.style.setProperty("--kdx-ritual-ms", `${ms}ms`);
    this.raiz.dataset.activo = "";
    this.raiz.dataset.fase = "colapso";
    this.raiz.dataset.modo = largo ? "umbral" : "rapido";

    if (largo) {
      // La navegación va en `finally`: si el dibujo del colapso lanza -- un
      // contexto perdido, un canvas de cero -- el visitante igual llega. El
      // ritual es la forma; llegar es la función.
      (window as unknown as { __kdxNavegando?: boolean }).__kdxNavegando = true;
      try {
        await this.animar(0, 1, ms * 0.62);
      } finally {
        irA(url);
      }
      return;
    }

    // Modo rápido. `irA` no se espera antes de animar: las dos cosas corren
    // juntas y el velo es lo que se ve mientras la escena ya viene en camino.
    // El motor del deck tiene un salvavidas que fuerza la recarga si a los
    // 1,2 s no se navegó. Esta bandera le dice que el viaje está en curso y
    // que no hace falta atropellarlo.
    (window as unknown as { __kdxNavegando?: boolean }).__kdxNavegando = true;
    // Sin router hay que ceder el hilo para que el velo alcance a pintar antes
    // de que el documento se descargue. Un cuadro, no un ritual.
    await this.animar(0, 1, Math.min(ms, 180));
    irA(url);
  }

  /** Al llegar: el mismo gesto al revés, para que se lea como continuación. */
  async recomponer(largo = false): Promise<void> {
    if (REDUCIDO) {
      delete this.raiz.dataset.activo;
      delete this.raiz.dataset.fase;
      this.corriendo = false;
      return;
    }
    const ms = largo ? duracion() : duracionRapida();
    this.raiz.dataset.activo = "";
    this.raiz.dataset.fase = "recomposicion";
    this.pintar(1, this.acento());
    await this.animar(1, 0, largo ? ms * 0.5 : ms * 0.7);
    delete this.raiz.dataset.activo;
    delete this.raiz.dataset.fase;
    delete this.raiz.dataset.modo;
    this.corriendo = false;
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
  (window as unknown as {
    __kdxRitual?: (u: string, o?: { largo?: boolean }) => void;
  }).__kdxRitual = (u, o) => {
    void ritual?.ir(u, o);
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
      // Con el router montado la navegación ya es suya y arranca en el cuadro
      // del clic. Interceptarla acá sólo la volvería a frenar, que es
      // exactamente lo que este cambio vino a sacar.
      if (hayRouter()) return;
      e.preventDefault();
      void ritual.ir(url.href, { largo: esUmbral(a) });
    },
    { capture: true },
  );

  let pendiente: string | null = null;
  try {
    pendiente = sessionStorage.getItem("kdx-ritual-pending");
    // "1" es el valor que escribía la versión anterior. Si alguien cruza el
    // archivo con una pestaña abierta de antes del cambio, se lee como largo.
    if (pendiente) sessionStorage.removeItem("kdx-ritual-pending");
  } catch (_) {}
  if (pendiente) void ritual.recomponer(pendiente !== "rapido");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);

/* ---------------------------------------------------------------------------
   EL RITUAL SOBRE EL ROUTER
   ---------------------------------------------------------------------------
   Acá está el cambio de fondo que pidió Ocín. Antes el orden era:

       clic → animar 868 ms → recién ahí empezar a traer la escena

   y ahora es:

       clic → empezar a traer la escena → animar 260 ms ENCIMA de la carga

   El velo dejó de ser un peaje y pasó a ser lo que se ve mientras se viaja.
   La escena siguiente ya viene en camino desde el primer cuadro.

   El ritual largo no se perdió: un enlace que declara `data-kdx-ritual="largo"`
   -- un umbral, no un NEXT -- envuelve el cargador del router y colapsa antes
   de entregar, igual que siempre. La espera ahí ES el contenido.
   ------------------------------------------------------------------------- */
document.addEventListener("astro:before-preparation", (e) => {
  const ev = e as Event & {
    sourceElement?: Element;
    loader: () => Promise<void>;
  };
  if (!ritual) return;
  const largo = esUmbral(ev.sourceElement ?? null);
  try { sessionStorage.setItem("kdx-ritual-pending", largo ? "largo" : "rapido"); } catch (_) {}
  (window as unknown as { __kdxNavegando?: boolean }).__kdxNavegando = true;

  if (largo) {
    const traer = ev.loader;
    ev.loader = async () => {
      await Promise.all([ritual!.colapsar(true), traer()]);
    };
    return;
  }
  // Rápido: el velo se pinta y no se espera. El router sigue su curso.
  //
  // Se probó además una compuerta que encolaba `requestAnimationFrame` durante
  // la preparación, para que los bucles de canvas de la escena que se va no le
  // robaran el hilo a la que llega. Medida, empeoraba: el propio navegador
  // necesita cuadros para su transición de vistas, y negárselos hacía que el
  // intercambio esperara hasta el tope de la compuerta -- 1.027 ms en vez de
  // 578. Se quitó. Queda anotado para que nadie la vuelva a intentar creyendo
  // que es obvia.
  void ritual.colapsar(false);
});

/* Con el router montado la página no se recarga, así que `montar` no vuelve a
   correr desde cero y la recomposición necesita su propio gancho. El ritual
   sobrevive al intercambio -- vive en el cromo persistente -- y acá sólo se le
   pide que se abra otra vez. */
document.addEventListener("astro:after-swap", () => {
  (window as unknown as { __kdxNavegando?: boolean }).__kdxNavegando = false;
  let pendiente: string | null = null;
  try {
    pendiente = sessionStorage.getItem("kdx-ritual-pending");
    if (pendiente) sessionStorage.removeItem("kdx-ritual-pending");
  } catch (_) {}
  if (pendiente && ritual) void ritual.recomponer(pendiente !== "rapido");
});
