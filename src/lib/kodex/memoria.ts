/**
 * KODEX−∞ · LA MEMORIA TIPADA
 *
 * El blueprint dice qué NO alcanza, que es lo que importa acá:
 *
 *     "Do not store only page visits. Record meaningful transitions…
 *      Memory must modify later scenes in small but perceivable ways."
 *
 * y  "The archive must remember transformations, not only navigation."
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ESTE MÓDULO NO TIENE ALMACÉN PROPIO, Y ES A PROPÓSITO
 *
 * `src/kodex/return/memory.js` ya guarda el recorrido bajo la clave
 * `kx-journey`, y RETURN ya deriva de ahí la firma del visitante con
 * `readSpecimen()` — que es exactamente el `route_signature_created` que la
 * biblia le pide a esa escena. Funciona.
 *
 * Lo que le falta es lo que agrega este archivo: eventos TIPADOS, con `node_id`
 * y con nombre canónico (`threshold_crossed`, no `view`). O sea que lo de allá
 * registra por dónde pasaste, y lo de acá registra qué te pasó.
 *
 * Abrir una segunda clave habría sido el sexto almacén del proyecto. El propio
 * `KodexRecuerda.astro` lo dejó anotado tras pisar el mismo palo:
 *
 *     "es la quinta vez en este proyecto que construyo algo que ya existía, y
 *      el patrón es siempre el mismo: escribir antes de auditar."
 *
 * Así que se escribe en `kx-journey`, en un campo nuevo `eventos`, sin tocar
 * `views`, `effects`, `signal` ni `cycle`. `readSpecimen()` sigue leyendo lo
 * suyo intacto.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * PRIVACIDAD, que acá no es adorno. La biblia la cierra por escrito: "no
 * fingerprinting, emotion inference, spiritual scoring, health inference or
 * hidden microphone activation." En consecuencia:
 *
 *   · no hay identificador de visitante, ninguno — la memoria es del navegador;
 *   · `detail` sólo admite números acotados a 0..1, así que no hay por dónde
 *     colar texto escrito por la persona;
 *   · nada sale de la máquina: no hay red en este archivo;
 *   · hay tope de 400 eventos, porque un registro que crece sin límite termina
 *     siendo un perfil aunque nadie lo haya querido.
 */

import type { MemoryEvent } from "./contratos";

/** La misma clave que usa `src/kodex/return/memory.js`. No se abre otra. */
const CLAVE = "kx-journey";
const TOPE = 400;

/** El registro de `memory.js`, más el campo que agrega este módulo. */
interface Recorrido {
  started?: number;
  views?: string[];
  effects?: string[];
  signal?: number;
  cycle?: number;
  last?: number;
  /** Lo nuevo. Ausente en registros escritos antes de esto. */
  eventos?: MemoryEvent[];
}

/* SSG: esto se construye en Node, donde no hay `localStorage`. Sin la guarda, el
   build revienta antes de servir una sola página. */
const hayAlmacen = (): boolean => {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false; // localStorage tira si el navegador bloquea el almacenamiento
  }
};

function leer(): Recorrido {
  if (!hayAlmacen()) return {};
  try {
    return (JSON.parse(localStorage.getItem(CLAVE) || "null") as Recorrido) || {};
  } catch {
    return {};
  }
}

function escribir(r: Recorrido): void {
  if (!hayAlmacen()) return;
  try {
    if (r.eventos && r.eventos.length > TOPE) r.eventos = r.eventos.slice(-TOPE);
    r.last = Date.now();
    localStorage.setItem(CLAVE, JSON.stringify(r));
  } catch {
    /* Cuota llena o modo privado. La escena tiene que seguir andando: perder
       memoria degrada la experiencia, romperla la termina. */
  }
}

/** Recorta cada número a 0..1 con tres decimales. Nada de valores sin límite. */
function acotar(d: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(d)) {
    if (!Number.isFinite(v)) continue;
    out[k] = Math.round(Math.min(1, Math.max(0, v)) * 1000) / 1000;
  }
  return out;
}

/**
 * El ciclo en curso, 1-based.
 *
 * `memory.js` guarda `cycle` 0-based y su `readSpecimen()` lo lee como
 * `max(1, cycle + 1)`. Se respeta esa convención en vez de imponer otra: dos
 * lecturas distintas del mismo número es cómo empiezan los desfases.
 */
export function ciclo(): number {
  return Math.max(1, (leer().cycle ?? 0) + 1);
}

/** Anota una transición. Devuelve el evento ya sellado. */
export function recordar(
  type: string,
  node_id: string,
  detail?: Record<string, number>,
): MemoryEvent {
  const r = leer();
  const ev: MemoryEvent = {
    type,
    node_id,
    at: Date.now(),
    cycle: Math.max(1, (r.cycle ?? 0) + 1),
    ...(detail ? { detail: acotar(detail) } : {}),
  };
  r.eventos = [...(r.eventos ?? []), ev];
  escribir(r);
  return ev;
}

export function eventos(): readonly MemoryEvent[] {
  return leer().eventos ?? [];
}

/** ¿Ocurrió esto alguna vez? Es la pregunta que altera una escena al volver. */
export function ocurrio(type: string): boolean {
  return (leer().eventos ?? []).some((e) => e.type === type);
}

export function veces(type: string): number {
  return (leer().eventos ?? []).filter((e) => e.type === type).length;
}

/**
 * Abre un ciclo nuevo. Lo llama RETURN: "Return creates a new initial
 * condition", no un reinicio.
 *
 * Incrementa el mismo `cycle` que ya lee `readSpecimen()`, para que la firma del
 * visitante y estos eventos cuenten la misma vuelta.
 */
export function nuevoCiclo(): number {
  const r = leer();
  r.cycle = (r.cycle ?? 0) + 1;
  escribir(r);
  return r.cycle + 1;
}

/**
 * Los derivados que la biblia nombra por su nombre como entradas de mutación
 * del Signal Temple:
 *
 *     archiveDepth   → densidad de columnas
 *     routeDiversity → ramificación de corredores
 *     returnCount    → conexiones de raíz y techo
 *
 * Salen normalizados a 0..1 para entrar al bus sin conversión. Cuentan tanto los
 * eventos tipados como el recorrido que ya guardaba `memory.js`: ignorar lo
 * viejo haría que un visitante con historia apareciera vacío.
 *
 * Las constantes de saturación (40, 12, 8) son ELEGIDAS, no medidas — todavía no
 * hay visitas reales de las que sacarlas. Están acá con nombre para poder
 * ajustarlas cuando las haya, en vez de escondidas dentro de una fórmula.
 */
export function derivados(): {
  archiveDepth: number;
  routeDiversity: number;
  returnCount: number;
} {
  const r = leer();
  const evs = r.eventos ?? [];
  const vistas = r.views ?? [];
  const nodos = new Set<string>([...evs.map((e) => e.node_id), ...vistas]);
  const vueltas = (r.cycle ?? 0) + evs.filter((e) => e.type.endsWith("_returned")).length;
  return {
    archiveDepth: Math.min(1, (evs.length + vistas.length) / 40),
    routeDiversity: Math.min(1, nodos.size / 12),
    returnCount: Math.min(1, vueltas / 8),
  };
}

/**
 * Cuánto recuerda el sistema, en un número 0..1. Es la señal `memory` del bus:
 * lo que permite que la puerta se vea distinta la segunda vez sin que cada
 * escena tenga que leer el registro entero.
 */
export function pesoDeMemoria(): number {
  const d = derivados();
  return Math.min(1, (d.archiveDepth + d.routeDiversity + d.returnCount) / 2.2);
}

/** Borra todo. El visitante tiene que poder irse sin dejar nada. */
export function olvidar(): void {
  if (!hayAlmacen()) return;
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* nada que hacer */
  }
}
