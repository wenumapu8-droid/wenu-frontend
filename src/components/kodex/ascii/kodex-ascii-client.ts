/**
 * KODEX-∞ · ASCII · runtime
 *
 * Monta el AsciiRenderer del kit y le pone las tres cosas que el kit no
 * necesitaba como demo suelto y sí necesita dentro de una página:
 *
 * 1. No dibujar fuera de pantalla. El demo tenía un lienzo por página; acá hay
 *    varios y el deck es largo. Sin esto, cada escena que uno deja atrás sigue
 *    quemando cuadros.
 *
 * 2. Con prefers-reduced-motion, un cuadro y basta. El motor ya congela el
 *    tiempo en 0.65, pero seguía redibujando lo mismo treinta veces por
 *    segundo para siempre: mismo resultado en pantalla, ventilador encendido.
 *
 * 3. Paleta de la lámina. El kit trae la suya por escena — que en observe y
 *    descent coincide con el acento — pero MACHINE es cian y su escena
 *    generativa venía en verde agua.
 */
import { AsciiRenderer } from "../../../kodex/ascii/engine/AsciiRenderer.js";
import { SCENES } from "../../../kodex/ascii/scenes/index.js";

type SceneName = keyof typeof SCENES;

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

class KodexAscii {
  private readonly root: HTMLElement;
  private readonly renderer: any;
  private observer: IntersectionObserver | null = null;
  private running = false;

  constructor(root: HTMLElement) {
    this.root = root;
    const canvas = root.querySelector<HTMLCanvasElement>("[data-kdx-ascii-canvas]");
    if (!canvas) throw new Error("KODEX ascii: falta el canvas.");

    const name = (root.dataset.scene ?? "observe") as SceneName;
    const scene = SCENES[name] ?? SCENES.observe;
    const palette = root.dataset.palette?.split(",").map((c) => c.trim()).filter(Boolean);

    this.renderer = new AsciiRenderer(canvas, {
      scene,
      glyphSet: root.dataset.glyphs ?? "kodex",
      // La celda chica es lo que hace legible la trama; en móvil el motor ya
      // la sube solo, así que acá basta con pedir el perfil bueno.
      profile: matchMedia("(max-width: 700px)").matches ? "balanced" : "full",
      fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
      palette: palette && palette.length >= 2 ? palette : undefined,
    });

    root.dataset.kdxAsciiState = "ready";

    if (REDUCED) {
      // Un solo cuadro: el motor congela el tiempo, así que el segundo sería
      // idéntico al primero.
      this.renderer.start();
      requestAnimationFrame(() => this.renderer.stop());
    } else {
      this.watch();
    }

    (root as any).__kdxAscii = this;
  }

  /** Corre sólo mientras la pieza está a la vista. */
  private watch(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible === this.running) return;
        this.running = visible;
        if (visible) this.renderer.start();
        else this.renderer.stop();
      },
      { rootMargin: "160px" },
    );
    this.observer.observe(this.root);

    // Una pestaña en segundo plano no debe seguir generando señal.
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.renderer.stop();
      else if (this.running) this.renderer.start();
    });
  }

  /** Nueva semilla: el mismo campo, otra realización. */
  randomize(): void {
    this.renderer.randomize();
  }

  debug(): Record<string, unknown> {
    return {
      escena: this.root.dataset.scene,
      alfabeto: this.root.dataset.glyphs,
      corriendo: this.running,
      fps: this.renderer.fps,
      columnas: this.renderer.columns,
      filas: this.renderer.rows,
    };
  }
}

const mount = () => {
  for (const el of document.querySelectorAll<HTMLElement>("[data-kdx-ascii]")) {
    if ((el as any).__kdxAscii) continue;
    try {
      new KodexAscii(el);
    } catch (error) {
      // Sin Canvas 2D la lámina se queda con su marco: es una pieza, no la
      // estructura, y fallar en silencio es preferible a romper la escena.
      el.dataset.kdxAsciiState = "unavailable";
      console.warn("[kodex-ascii]", error);
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
document.addEventListener("astro:page-load", mount);
