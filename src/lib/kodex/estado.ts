/**
 * KODEX-∞ · MÁQUINA DE ESTADOS DE ESCENA
 *
 * La Receta Madre §8 fija el ciclo y la razón:
 *
 *     idle → aware → locked → active → transitionOut
 *     "La escena TIENE comportamiento, no loops infinitos decorativos."
 *
 * Y §2 exige que cada escena traiga UNA máquina de estados, no que cada capa
 * invente la suya. Eso es lo que este módulo resuelve: hasta ahora el portal
 * tenía sus fases y el audio su propio encendido, y coincidían por casualidad.
 * Acá el estado es uno solo y todas las capas lo leen.
 *
 * Esa unicidad es el punto del proyecto entero. KODEX es un instrumento, no
 * una página con efectos: cuando la escena pasa a `active`, el shader se abre
 * y el sonido se abre porque es el MISMO valor, no dos animaciones afinadas
 * para parecer simultáneas.
 */

export type Estado = "idle" | "aware" | "locked" | "active" | "transitionOut";

/** Sólo hacia adelante. Una escena no vuelve a no-haber-sido-vista. */
const ORDEN: Estado[] = ["idle", "aware", "locked", "active", "transitionOut"];

type Escucha = (estado: Estado, anterior: Estado) => void;

class MaquinaEscena {
  private estado: Estado = "idle";
  private readonly escuchas = new Set<Escucha>();
  private raiz: HTMLElement | null = null;

  /** Intensidad del estado, 0..1. Es lo que las capas suelen querer. */
  get intensidad(): number {
    return { idle: 0, aware: 0.34, locked: 0.62, active: 1, transitionOut: 0.5 }[this.estado];
  }

  get actual(): Estado {
    return this.estado;
  }

  iniciar(raiz: HTMLElement): void {
    this.raiz = raiz;
    this.publicar("idle");

    // idle → aware: alguien está ahí. Sirve cualquier señal de presencia, y
    // por eso se escuchan varias: hay quien llega con el mouse, quien llega
    // con el teclado y quien llega tocando la pantalla.
    const presente = () => this.ir("aware");
    for (const ev of ["pointermove", "keydown", "touchstart", "scroll"] as const) {
      addEventListener(ev, presente, { passive: true, once: true });
    }

    // aware → locked: el visitante apunta a la acción de la escena. Es el
    // momento en que deja de mirar y empieza a decidir.
    const cta = raiz.querySelector<HTMLElement>(
      ".kx-threshold__cta, .kx-os-primary, [data-kdx-primary]",
    );
    cta?.addEventListener("pointerenter", () => this.ir("locked"), { passive: true });
    cta?.addEventListener("focus", () => this.ir("locked"), { passive: true });

    // locked → active: cruzó. Encender el sonido también cuenta como cruzar,
    // porque en un instrumento sonar ES estar activo.
    cta?.addEventListener("click", () => this.ir("active"), { passive: true });
    document
      .querySelector("[data-sound]")
      ?.addEventListener("click", () => this.ir("active"), { passive: true });

    // active → transitionOut: se va. `pagehide` y no `unload` porque el
    // segundo no dispara de forma confiable en móvil ni con bfcache.
    addEventListener("pagehide", () => this.ir("transitionOut"), { once: true });
    document.addEventListener("astro:before-swap", () => this.ir("transitionOut"), { once: true });
  }

  /** Avanza. Nunca retrocede: pedir un estado anterior no hace nada. */
  ir(siguiente: Estado): void {
    if (ORDEN.indexOf(siguiente) <= ORDEN.indexOf(this.estado)) return;
    const anterior = this.estado;
    this.estado = siguiente;
    this.publicar(anterior);
  }

  private publicar(anterior: Estado): void {
    if (this.raiz) this.raiz.dataset.kdxState = this.estado;
    document.documentElement.dataset.kdxState = this.estado;
    /* Y en el nodo que firma el shell, para que la hoja del instrumento pueda
       combinar estado + superficie en un solo selector. La telemetría baja o
       sube según lo que el sistema sabe del visitante, y eso se decide acá. */
    const shell = document.querySelector<HTMLElement>("[data-kdx-shell]");
    if (shell) shell.dataset.kdxState = this.estado;
    (window as unknown as { __kdxState?: Estado }).__kdxState = this.estado;
    for (const f of this.escuchas) f(this.estado, anterior);
  }

  /** Se notifica al suscribirse: una capa que monta tarde no queda en idle. */
  suscribir(f: Escucha): () => void {
    this.escuchas.add(f);
    f(this.estado, this.estado);
    return () => this.escuchas.delete(f);
  }
}

let maquina: MaquinaEscena | null = null;

export function estadoEscena(): MaquinaEscena {
  if (!maquina) maquina = new MaquinaEscena();
  return maquina;
}

/** Arranca la máquina en la escena de esta página. */
export function montarEstadoEscena(): void {
  const raiz = document.querySelector<HTMLElement>("[data-kx], .kx-threshold, .kx-os-stage");
  if (raiz) estadoEscena().iniciar(raiz);
}
