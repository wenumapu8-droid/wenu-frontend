/**
 * KODEX-∞ · LOS CUATRO ESTADOS DEL ARCHIVO
 *
 *     E00 EXCAVATION → T01 TRANSMUTATION → M11 MANIFESTATION → R10 RETURN
 *
 * Vienen del prototipo aprobado y del motor de audio, que ya los conocía por
 * nombre desde antes de que existiera esta página.
 *
 * **No compiten con la máquina de escena.** Son dos ejes distintos y por eso
 * conviven:
 *
 *  · `estado.ts` mide **cuánto está el visitante**: idle → aware → locked →
 *    active. Avanza solo, con la presencia, y no se ve. Es involuntario.
 *  · Esto mide **en qué fase está el archivo**. No avanza solo: lo mueve el
 *    visitante, a propósito, y se ve. Es una decisión.
 *
 * Uno es el pulso; el otro es la perilla. Un instrumento tiene los dos, y
 * confundirlos era la tentación fácil: habría dado una sola escala que ni
 * reacciona bien ni se toca bien.
 *
 * El valor que sale de acá alimenta `u_state` del shader y el preset del
 * audio. La imagen y el sonido cambian con el MISMO número — es la definición
 * de instrumento que el concepto del proyecto pide.
 */

export type ClaveArchivo = "E00" | "T01" | "M11" | "R10";

type Fase = {
  clave: ClaveArchivo;
  nombre: string;
  /** Lo que ve el shader: 0..1. */
  valor: number;
};

/** El orden es el recorrido del archivo, no una escala de intensidad. */
export const FASES: Fase[] = [
  { clave: "E00", nombre: "EXCAVATION",    valor: 0.15 },
  { clave: "T01", nombre: "TRANSMUTATION", valor: 0.50 },
  { clave: "M11", nombre: "MANIFESTATION", valor: 0.90 },
  // RETURN no es "menos" que MANIFESTATION: es después. Que su valor baje
  // dice que el archivo se asienta, no que retrocede.
  { clave: "R10", nombre: "RETURN",        valor: 0.35 },
];

type Escucha = (fase: Fase) => void;

class Archivo {
  private indice = 0;
  /** El valor persigue al de la fase: cambiar de estado es una transición. */
  private suave = FASES[0].valor;
  private readonly escuchas = new Set<Escucha>();
  private raf = 0;

  constructor() {
    this.correr();
  }

  get fase(): Fase { return FASES[this.indice]; }
  /** Suavizado, para el shader. Saltar de golpe se lee como un corte. */
  get valor(): number { return this.suave; }

  private correr(): void {
    const paso = () => {
      this.suave += (this.fase.valor - this.suave) * 0.03;
      (window as unknown as { __kdxArchivoValor?: number }).__kdxArchivoValor = this.suave;
      this.raf = requestAnimationFrame(paso);
    };
    this.raf = requestAnimationFrame(paso);
  }

  avanzar(): void {
    this.indice = (this.indice + 1) % FASES.length;
    this.aplicar();
  }

  ir(clave: ClaveArchivo): void {
    const i = FASES.findIndex((f) => f.clave === clave);
    if (i < 0 || i === this.indice) return;
    this.indice = i;
    this.aplicar();
  }

  private aplicar(): void {
    const f = this.fase;
    document.documentElement.dataset.kdxArchive = f.clave;
    (window as unknown as { __kdxArchivo?: Fase }).__kdxArchivo = f;

    for (const el of document.querySelectorAll("[data-kdx-archive-name]")) {
      el.textContent = `${f.nombre} · ${f.clave}`;
    }

    // El motor de audio ya conoce estos nombres: cambia de frecuencias con la
    // fase. Por eso imagen y sonido se mueven juntos sin coordinarlos.
    const audio = (window as unknown as { __kxSetState?: (k: string) => void }).__kxSetState;
    audio?.(f.clave);

    for (const g of this.escuchas) g(f);
  }

  suscribir(g: Escucha): () => void {
    this.escuchas.add(g);
    g(this.fase);
    return () => this.escuchas.delete(g);
  }
}

let archivo: Archivo | null = null;

export function estadoArchivo(): Archivo {
  if (!archivo) archivo = new Archivo();
  return archivo;
}

export function montarEstadoArchivo(): void {
  const a = estadoArchivo();
  for (const b of document.querySelectorAll<HTMLElement>("[data-kdx-archive-shift]")) {
    if ((b as any).__kdxArchivo) continue;
    (b as any).__kdxArchivo = true;
    b.addEventListener("click", () => a.avanzar());
  }
}
