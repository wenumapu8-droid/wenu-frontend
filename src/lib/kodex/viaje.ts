/**
 * KODEX-∞ · EL VIAJE
 *
 * Las siete escenas, con su organismo, su acción única y su frase, tal como
 * las declara el spec fundacional.
 *
 * **Una acción por escena.** No es una restricción de diseño: es lo que
 * convierte el recorrido en un rito y no en un menú. Dos botones en una escena
 * obligan a elegir, y elegir saca al visitante de la escena para ponerlo frente
 * a una decisión administrativa.
 *
 * El viaje es un **loop ∞**: RETURN vuelve a THRESHOLD. Por eso `siguiente` es
 * módulo y no tiene caso especial — el archivo no termina, se recorre.
 */

export type EstadoEscena = "ACTIVE" | "PROCESSING" | "ARCHIVING" | "COMPLETE";

export type Escena = {
  n: string;
  id: string;
  titulo: string;
  /** Qué organismo corre detrás. Se construyen en FASE 2. */
  organismo: string;
  /** Token de color del organismo. */
  color: string;
  /** La acción única de la escena. */
  accion: string;
  /** La frase. Va en inglés como en el spec: es la voz del archivo. */
  frase: string;
  /** Qué reporta el chrome mientras esta escena está activa. */
  estado: EstadoEscena;
  /** Gesto dominante, del motion bible. Manda el tiempo de la escena. */
  gesto: "scan" | "pulse" | "orbit" | "reveal" | "descend" | "return";
};

export const VIAJE: Escena[] = [
  {
    n: "00", id: "threshold", titulo: "THRESHOLD",
    organismo: "threshold-portal", color: "var(--kdx-01-threshold)",
    accion: "ENTER",
    frase: "access the archive beyond the surface",
    estado: "ACTIVE", gesto: "pulse",
  },
  {
    n: "01", id: "prologue", titulo: "PROLOGUE",
    organismo: "observation-eye", color: "var(--kdx-02-eye)",
    accion: "BEGIN OBSERVATION",
    frase: "the archive is watching. you are the signal",
    estado: "PROCESSING", gesto: "scan",
  },
  {
    n: "02", id: "descent", titulo: "DESCENT",
    organismo: "descent-tunnel", color: "var(--kdx-03-descent)",
    accion: "DESCEND",
    frase: "descend into the pattern",
    estado: "PROCESSING", gesto: "descend",
  },
  {
    n: "03", id: "archive", titulo: "ARCHIVE",
    organismo: "archive-tree", color: "var(--kdx-04-tree)",
    accion: "OPEN ARCHIVE",
    frase: "the archive dreams in code",
    estado: "ARCHIVING", gesto: "reveal",
  },
  {
    n: "04", id: "machine", titulo: "MACHINE",
    organismo: "ritual-device", color: "var(--kdx-06-ritual)",
    accion: "GENERATE SIGNAL",
    frase: "patterns become predictions",
    estado: "PROCESSING", gesto: "pulse",
  },
  {
    n: "05", id: "cosmology", titulo: "COSMOLOGY",
    organismo: "cosmology-core", color: "var(--kdx-07-cosmology)",
    accion: "REVEAL CONNECTION",
    frase: "we are patterns in the cosmos",
    estado: "ACTIVE", gesto: "orbit",
  },
  {
    n: "06", id: "return", titulo: "RETURN",
    organismo: "archive-tree", color: "var(--kdx-tinta)",
    accion: "RETURN",
    frase: "return to carry the pattern",
    estado: "COMPLETE", gesto: "return",
  },
];

/** El siguiente. Módulo, porque el viaje es un loop y no una lista. */
export const siguiente = (i: number) => (i + 1) % VIAJE.length;
export const anterior = (i: number) => (i - 1 + VIAJE.length) % VIAJE.length;
