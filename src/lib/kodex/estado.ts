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

/* ───────────────────────────────────────────────────────────────────────────
 * FASES DE LLEGADA — la coreografía temporal
 *
 * MANIFIESTO OPERATIVO del creador (2026-08-20, rango CANON):
 *
 *   "Las piezas no son el problema; la coreografía sí. Tenemos instrumentos
 *    increíbles, pero algunos están tocando todos al mismo tiempo.
 *    Ahora necesitamos dirección:
 *      Silencio · Entrada · Tensión · Revelación · Movimiento
 *      Descubrimiento · Profundidad · Pausa · Transformación · Regreso"
 *
 *   "Nada se explica antes de poder sentirse. Nada se muestra todo a la vez."
 *
 * Y del `08A`: la máquina de escena de arriba es el ancestro pero no distingue
 * ESTABLISH de REVEAL. Esto NO es una segunda máquina: es una capa de fases
 * que se monta sobre la misma instancia, hacia adelante como ella, y que sólo
 * agrega el eje que faltaba — el TIEMPO.
 *
 * Se estampa en `<html data-kdx-fase>` y las capas se revelan por CSS. Ninguna
 * capa decide sola cuándo aparece: obedecen a un valor único, que es lo que
 * este archivo ya venía defendiendo para el espacio y ahora también rige el
 * tiempo.
 */

export type Fase = 'silencio' | 'entrada' | 'revelacion' | 'movimiento' | 'descubrimiento';

/** Los tiempos, en ms desde que la superficie queda lista. */
const COMPAS: Array<[Fase, number]> = [
  ['silencio', 0],        // sólo la obra. El manifiesto: "la imagen domina"
  ['entrada', 700],       // aparece el nombre del concepto
  ['revelacion', 1500],   // el cromo y los datos de la superficie
  ['movimiento', 2400],   // KDX.LIFE empieza a emerger
  ['descubrimiento', 3200], // recién ahora se ofrece salir a otro concepto
];

/**
 * Arranca la coreografía de llegada.
 *
 * `prefers-reduced-motion` NO la desactiva: la comprime. Quien pidió menos
 * movimiento igual merece que las cosas lleguen en orden — lo que no merece es
 * esperar tres segundos por ello.
 */
export function montarFases(raiz: HTMLElement = document.documentElement): () => void {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const escala = quieto ? 0.25 : 1;
  const relojes: number[] = [];

  const poner = (f: Fase) => { raiz.dataset.kdxFase = f; };
  poner('silencio');

  for (const [f, t] of COMPAS) {
    if (t === 0) continue;
    relojes.push(window.setTimeout(() => poner(f), t * escala));
  }

  /* Si el visitante toca antes de tiempo, la coreografía se salta hasta el
     final: la dirección es para quien mira, nunca una traba para quien ya
     decidió. */
  const saltar = () => {
    relojes.forEach(clearTimeout);
    poner('descubrimiento');
  };
  for (const ev of ['pointerdown', 'keydown'] as const) {
    addEventListener(ev, saltar, { once: true, passive: true });
  }

  return () => relojes.forEach(clearTimeout);
}
