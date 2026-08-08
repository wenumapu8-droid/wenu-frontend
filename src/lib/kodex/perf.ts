/**
 * KODEX-∞ · PERFIL DE RENDIMIENTO
 *
 * La receta madre fija tres perfiles -- FULL, BALANCED, LOW-POWER -- y una
 * regla que decide qué se sacrifica: "si hace falta, se reduce complejidad del
 * shader, NUNCA la identidad ni la composición".
 *
 * Eso importa acá: KODEX corre tres capas WebGL por lámina y hay equipos
 * reales que no las aguantan -- un iMac de 2015 es exactamente el caso. Sin
 * esto, en esa máquina la lámina no se degrada: se arrastra, y una escena a
 * seis cuadros por segundo no dice lo que la escena quiere decir.
 *
 * NO se adivina el hardware. Se adivina una vez para arrancar en algo
 * razonable y después se MIDE: el perfil real sale de cuánto tarda de verdad
 * cada cuadro en este equipo, con esta lámina, ahora. Un equipo potente con
 * cuarenta pestañas abiertas rinde como uno viejo, y ningún dato de fábrica lo
 * sabe.
 *
 * Qué cambió (MP-11)
 * ------------------
 * La política dejó de vivir acá: ahora está en `./quality`, compartida con el
 * motor de organismos y con OBSERVE V2, que hasta hoy decidían lo mismo por su
 * cuenta y con criterios distintos. Este archivo quedó como lo que siempre
 * debió ser: el puente entre el navegador y el gobernador — leer medios,
 * bombear `requestAnimationFrame`, publicar en el `<html>`.
 *
 * Y se corrigió un defecto: el bucle de medición se apagaba después de la
 * PRIMERA evaluación (~70 cuadros). Medía una vez y no volvía a mirar. Ahora
 * mide mientras la pestaña esté visible, con amortiguamiento para que eso no
 * se convierta en un nivel que parpadea.
 */

import {
  QualityGovernor,
  guessTierFromDevice,
  perfilToTier,
  tierToPerfil,
  type Perfil,
  type QualityReading,
} from "./quality";

export type { Perfil };

const ES_PERFIL = (v: string): v is Perfil =>
  v === "full" || v === "balanced" || v === "low-power";

type Escucha = (perfil: Perfil) => void;

class PerfilKodex {
  private readonly gobernador: QualityGovernor;
  private readonly escuchas = new Set<Escucha>();
  private publicado: Perfil;
  private ultimo = 0;
  private raf = 0;

  constructor() {
    const forzadoRaw = new URLSearchParams(location.search).get("quality");
    const forzado = forzadoRaw && ES_PERFIL(forzadoRaw) ? forzadoRaw : null;
    const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.gobernador = new QualityGovernor({
      initialTier: guessTierFromDevice({
        reducedMotion: reducido,
        cores: navigator.hardwareConcurrency ?? undefined,
        memoryGb: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
        narrow: matchMedia("(max-width: 900px)").matches,
      }),
      reducedMotion: reducido,
      forcedTier: forzado ? perfilToTier(forzado) : null,
    });

    this.publicado = tierToPerfil(this.gobernador.tier);
    this.publicar();
    this.escucharMovimientoReducido();
    this.medir();
  }

  /**
   * `prefers-reduced-motion` puede cambiar con la pestaña abierta -- en macOS
   * es un interruptor del sistema. Antes esto se leía una sola vez al arrancar.
   */
  private escucharMovimientoReducido(): void {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const alCambiar = () => {
      this.gobernador.setReducedMotion(mq.matches);
      this.sincronizar();
    };
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", alCambiar);
  }

  /**
   * Un `requestAnimationFrame` sin estrangular: el delta entre cuadros ES el
   * costo del cuadro. El gobernador se encarga del calentamiento, de la
   * mediana y de la histéresis; acá no se decide nada.
   */
  private medir(): void {
    const paso = (t: number) => {
      if (this.ultimo) {
        // Un salto grande casi nunca es la lámina: es la pestaña que estuvo
        // oculta. Se descarta en vez de contaminar la ventana.
        const delta = t - this.ultimo;
        if (delta < 400) this.gobernador.sample(delta);
      }
      this.ultimo = t;
      this.sincronizar();
      this.raf = requestAnimationFrame(paso);
    };
    this.raf = requestAnimationFrame(paso);
  }

  private sincronizar(): void {
    const perfil = tierToPerfil(this.gobernador.tier);
    if (perfil === this.publicado) return;
    this.publicado = perfil;
    this.publicar();
    for (const f of this.escuchas) f(perfil);
  }

  private publicar(): void {
    // En el <html> para que el CSS también pueda reaccionar sin JS de por
    // medio: apagar un blur o una sombra cara es una regla, no un componente.
    document.documentElement.dataset.kdxQuality = this.publicado;
    (window as unknown as { __kdxQuality?: Perfil }).__kdxQuality = this.publicado;
  }

  get perfil(): Perfil {
    return this.publicado;
  }

  /**
   * Lectura cruda del gobernador: incluye `source`, que dice si el nivel viene
   * de una medición, de una adivinanza o de accesibilidad. Cualquier panel que
   * muestre el perfil debe mostrar también eso -- un valor medido y un valor
   * adivinado no son la misma clase de dato y no se presentan igual.
   */
  get lectura(): QualityReading {
    return this.gobernador.read();
  }

  /** Se notifica al suscribirse con el valor vigente, no sólo en los cambios. */
  suscribir(f: Escucha): () => void {
    this.escuchas.add(f);
    f(this.publicado);
    return () => this.escuchas.delete(f);
  }

  detener(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** Escala del lienzo. En equipos lentos el costo está en los píxeles. */
  get escala(): number {
    if (this.publicado === "low-power") return 0.6;
    if (this.publicado === "balanced") return 0.85;
    return 1;
  }

  /** El rastro temporal cuesta una pasada y un par de texturas más. */
  get feedback(): boolean {
    return this.publicado !== "low-power";
  }
}

let instancia: PerfilKodex | null = null;

export function perfilKodex(): PerfilKodex {
  if (!instancia) instancia = new PerfilKodex();
  return instancia;
}
