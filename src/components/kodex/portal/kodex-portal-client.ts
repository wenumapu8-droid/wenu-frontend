/**
 * KODEX-∞ · PORTAL · runtime
 *
 * Cablea el motor de tres pasadas a la página. El motor ya estaba escrito; lo
 * que faltaba era esto: quién le da los graves, quién le pasa el puntero y
 * quién decide en qué estado está.
 *
 * El estado es UN valor para las dos cosas. Cuando el portal pasa a AWARE, el
 * shader se abre y el audio cambia con él -- no son dos animaciones que
 * coinciden, es el mismo número leído dos veces. Esa es la diferencia entre un
 * sitio con sonido y un instrumento.
 */
import {
  KdxThresholdPortalRuntime,
  THRESHOLD_PORTAL_MOTION,
} from "../../../kodex/threshold-portal/index.js";
import { perfilKodex } from "../../../lib/kodex/perf";
import { estadoEscena, montarEstadoEscena, type Estado } from "../../../lib/kodex/estado";
import { montarRueda } from "../../../lib/kodex/scroll";
import { montarEstadoArchivo } from "../../../lib/kodex/archivo";

/**
 * Las fases del portal dejan de ser suyas: son el estado de la escena leido
 * en el idioma del shader. La Receta Madre pide UNA maquina de estados por
 * escena, no una por capa.
 */
const FASE: Record<Estado, "DORMANT" | "AWARE" | "OPEN"> = {
  idle: "DORMANT",
  aware: "AWARE",
  locked: "AWARE",
  active: "OPEN",
  transitionOut: "OPEN",
};

/** El runtime nombra sus niveles en mayusculas; el perfil, en minuscula. */
const NIVEL = { "full": "HIGH", "balanced": "MEDIUM", "low-power": "LOW" } as const;

type BusDeAudio = { activo: boolean; low: number; mid: number; high: number };

const REDUCIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;

class KodexPortal {
  private readonly root: HTMLElement;
  private readonly runtime: any;
  private observer: IntersectionObserver | null = null;
  private visible = false;
  private raf = 0;
  private fase: "DORMANT" | "AWARE" | "OPEN" = "DORMANT";

  private constructor(root: HTMLElement, runtime: any) {
    this.root = root;
    this.runtime = runtime;
    root.dataset.kdxPortalState = "ready";

    if (REDUCIDO) {
      // Con movimiento reducido el portal queda como lámina: una sola pasada,
      // sin feedback y sin bucle. Sigue siendo la obra tratada, que es lo que
      // tiene que decir; lo que se va es el latido.
      this.runtime.setMotionMode(THRESHOLD_PORTAL_MOTION.REDUCED);
      this.runtime.renderOnce();
    } else {
      this.mirar();
      this.seguirPuntero();
    }

    // El portal sigue al perfil en vivo: si el equipo no da, baja de nivel sin
    // recargar y sin perder la obra. Se sacrifica resolucion, nunca la pieza.
    perfilKodex().suscribir((p) => this.runtime.setQualityLevel(NIVEL[p]));
    estadoEscena().suscribir((e) => this.pasarA(FASE[e]));

    (root as any).__kdxPortal = this;
  }

  static async montar(root: HTMLElement): Promise<KodexPortal> {
    const canvas = root.querySelector<HTMLCanvasElement>("[data-kdx-portal-canvas]");
    if (!canvas) throw new Error("KODEX portal: falta el canvas.");
    const runtime = new KdxThresholdPortalRuntime(canvas, {
      artworkUrl: root.dataset.artwork,
      seed: Number(root.dataset.seed ?? 0.382),
    });
    await runtime.load();
    return new KodexPortal(root, runtime);
  }

  /** Fuera de pantalla no dibuja. Son siete escenas; no pueden correr todas. */
  private mirar(): void {
    this.observer = new IntersectionObserver(
      (entradas) => {
        const dentro = entradas.some((e) => e.isIntersecting);
        if (dentro === this.visible) return;
        this.visible = dentro;
        if (dentro) {
          this.runtime.start();
          this.alimentar();
        } else {
          this.runtime.stop();
          cancelAnimationFrame(this.raf);
          this.raf = 0;
        }
      },
      { rootMargin: "120px" },
    );
    this.observer.observe(this.root);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.runtime.stop();
      else if (this.visible) this.runtime.start();
    });
  }

  /**
   * Los graves, por cuadro.
   *
   * Se lee el bus que publica el motor de audio. Si el visitante no encendió el
   * sonido, el bus dice `activo: false` y el portal respira solo, con su
   * envolvente lenta: la lámina no puede quedarse quieta esperando permiso.
   */
  private alimentar(): void {
    const paso = () => {
      if (!this.visible) return;
      const bus = (window as unknown as { __kxAudio?: BusDeAudio }).__kxAudio;
      if (bus?.activo) {
        this.runtime.setBass(bus.low);
        // Con sonido, el portal despierta solo: pasa a AWARE cuando la música
        // tiene cuerpo. No hace falta que nadie lo toque.
        // El sonido ya no decide la fase: la decide la maquina de estados.
        // Lo que el sonido mueve es el brillo, no el estado.
      } else {
        const t = performance.now() / 1000;
        this.runtime.setBass(0.22 + Math.sin(t * 0.55) * 0.16);
      }
      this.raf = requestAnimationFrame(paso);
    };
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(paso);
  }

  /**
   * El puntero sesga el portal y abre el filtro del sonido.
   *
   * Se escucha en la ventana y no en el lienzo: el portal es el fondo de la
   * lámina y hay paneles encima, así que un listener local sólo respondería
   * cuando el puntero cae justo en el hueco entre bloques.
   */
  private seguirPuntero(): void {
    addEventListener(
      "pointermove",
      (e) => {
        const x = (e.clientX / innerWidth) * 2 - 1;
        const y = (e.clientY / innerHeight) * 2 - 1;
        this.runtime.setPointer(x, -y);
      },
      { passive: true },
    );
  }

  private pasarA(fase: "DORMANT" | "AWARE" | "OPEN"): void {
    if (this.fase === fase) return;
    this.fase = fase;
    this.runtime.setState(fase);
    this.root.dataset.kdxPortalPhase = fase;
  }

  debug(): Record<string, unknown> {
    return {
      fase: this.fase,
      visible: this.visible,
      metricas: this.runtime.getMetrics(),
    };
  }
}

const montar = () => {
  for (const el of document.querySelectorAll<HTMLElement>("[data-kdx-portal]")) {
    if ((el as any).__kdxPortal) continue;
    KodexPortal.montar(el).catch((error) => {
      // Sin WebGL o sin la obra, queda la imagen del noscript. Una lámina sin
      // su pieza no es una lámina, pero tampoco puede ser una pantalla rota.
      el.dataset.kdxPortalState = "unavailable";
      console.warn("[kodex-portal]", error);
    });
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
montarEstadoEscena();
montarRueda();
montarEstadoArchivo();
document.addEventListener("astro:page-load", () => {
  montarEstadoEscena(); montarRueda(); montarEstadoArchivo();
});
