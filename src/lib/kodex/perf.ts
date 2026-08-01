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
 */

export type Perfil = "full" | "balanced" | "low-power";

const ORDEN: Perfil[] = ["full", "balanced", "low-power"];

/** Presupuesto de cuadro, en milisegundos, antes de bajar un escalón. */
const TECHO_MS = 22; // ~45 fps
/** Por debajo de esto no hay negociación: se va directo al perfil mínimo. */
const PISO_MS = 40; // ~25 fps

type Escucha = (perfil: Perfil) => void;

class PerfilKodex {
  private actual: Perfil;
  private readonly escuchas = new Set<Escucha>();
  private muestras: number[] = [];
  private ultimo = 0;
  private raf = 0;
  private fijado = false;

  constructor() {
    this.actual = this.adivinar();
    this.publicar();
    if (!this.fijado) this.medir();
  }

  /**
   * Punto de partida. Deliberadamente conservador: es preferible arrancar en
   * BALANCED y subir tras medir, que arrancar en FULL y que los primeros
   * segundos -- justo la primera impresión de la lámina -- se arrastren.
   */
  private adivinar(): Perfil {
    const forzado = new URLSearchParams(location.search).get("quality");
    if (forzado && (ORDEN as string[]).includes(forzado)) {
      this.fijado = true;
      return forzado as Perfil;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "low-power";

    const nucleos = navigator.hardwareConcurrency ?? 4;
    const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    // Una pantalla chica casi siempre es un equipo chico, y además hay menos
    // píxeles que llenar: el mismo shader cuesta bastante menos.
    const angosto = matchMedia("(max-width: 900px)").matches;

    if (nucleos <= 4 || memoria <= 4) return angosto ? "low-power" : "balanced";
    if (nucleos >= 8 && memoria >= 8) return "full";
    return "balanced";
  }

  /**
   * Mide los primeros cuadros y ajusta. Se toma la MEDIANA y no el promedio:
   * el arranque siempre trae dos o tres cuadros lentos por compilación de
   * shaders y carga de texturas, y un promedio los deja pesando de más.
   */
  private medir(): void {
    const paso = (t: number) => {
      if (this.ultimo) this.muestras.push(t - this.ultimo);
      this.ultimo = t;

      if (this.muestras.length < 70) {
        this.raf = requestAnimationFrame(paso);
        return;
      }
      // Se descartan los primeros: son el costo de encender, no el de correr.
      const utiles = this.muestras.slice(20).sort((a, b) => a - b);
      const mediana = utiles[Math.floor(utiles.length / 2)];

      if (mediana > PISO_MS) this.mover("low-power");
      else if (mediana > TECHO_MS) this.bajar();
      // Subir sólo si sobra margen de verdad. Ir y venir entre perfiles se ve
      // peor que quedarse un escalón abajo.
      else if (mediana < TECHO_MS * 0.55) this.subir();

      this.muestras = [];
      this.ultimo = 0;
    };
    this.raf = requestAnimationFrame(paso);
  }

  private bajar(): void {
    const i = ORDEN.indexOf(this.actual);
    if (i < ORDEN.length - 1) this.mover(ORDEN[i + 1]);
  }

  private subir(): void {
    const i = ORDEN.indexOf(this.actual);
    if (i > 0) this.mover(ORDEN[i - 1]);
  }

  private mover(p: Perfil): void {
    if (p === this.actual || this.fijado) return;
    this.actual = p;
    this.publicar();
    for (const f of this.escuchas) f(p);
  }

  private publicar(): void {
    // En el <html> para que el CSS también pueda reaccionar sin JS de por
    // medio: apagar un blur o una sombra cara es una regla, no un componente.
    document.documentElement.dataset.kdxQuality = this.actual;
    (window as unknown as { __kdxQuality?: Perfil }).__kdxQuality = this.actual;
  }

  get perfil(): Perfil {
    return this.actual;
  }

  /** Se notifica al suscribirse con el valor vigente, no sólo en los cambios. */
  suscribir(f: Escucha): () => void {
    this.escuchas.add(f);
    f(this.actual);
    return () => this.escuchas.delete(f);
  }

  /** Escala del lienzo. En equipos lentos el costo está en los píxeles. */
  get escala(): number {
    if (this.actual === "low-power") return 0.6;
    if (this.actual === "balanced") return 0.85;
    return 1;
  }

  /** El rastro temporal cuesta una pasada y un par de texturas más. */
  get feedback(): boolean {
    return this.actual !== "low-power";
  }
}

let instancia: PerfilKodex | null = null;

export function perfilKodex(): PerfilKodex {
  if (!instancia) instancia = new PerfilKodex();
  return instancia;
}
