/**
 * KODEX-∞ · MOTOR DE MEMORIA
 *
 * `src/kodex/return/memory.js` ya guarda el recorrido y deriva el specimen de RETURN.
 * Funciona y no se toca: este módulo lo ENVUELVE y le agrega lo que le falta para que
 * la memoria pueda alterar escenas futuras, que es la tesis técnica del proyecto.
 *
 * La diferencia es la que marca el blueprint (§B): no basta con registrar que alguien
 * pasó por una escena. Hay que registrar la TRANSICIÓN — de qué estado a qué estado,
 * cuánto tardó, cuántas veces volvió. Una visita no es un evento de memoria; un cambio
 * de estado sí.
 *
 *     nodo observado · umbral de permanencia alcanzado · símbolo activado
 *     ruta elegida · anomalía disparada · retorno
 *
 * Nadie consume este módulo todavía. Es aditivo: convive con `return/memory.js` sin
 * competir por la misma clave de almacenamiento.
 */

const EVENTS_KEY = 'kdx-memory-events';
const ROUTES_KEY = 'kdx-memory-routes';
const MAX_EVENTS = 256;

export type MemoryEventKind =
  | 'node.observed'
  | 'dwell.threshold'
  | 'symbol.activated'
  | 'route.chosen'
  | 'anomaly.triggered'
  | 'state.transition'
  | 'return';

export interface MemoryEvent {
  kind: MemoryEventKind;
  /** Nodo al que pertenece el evento (KDX-*), si aplica. */
  nodeId?: string;
  /** Escena o ruta donde ocurrió. */
  scene?: string;
  /** Estado anterior y resultante. Lo que convierte una visita en una transición. */
  priorState?: string;
  resultingState?: string;
  /** Segundos de permanencia asociados al evento. */
  dwell?: number;
  /** Cuántas veces se había visitado esta escena antes de este evento. */
  returnCount?: number;
  at: number;
}

export interface RouteMemory {
  visits: number;
  lastAt: number;
  /** Último estado con el que se abandonó la escena. */
  lastState?: string;
  /** Permanencia total acumulada, en segundos. */
  totalDwell: number;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado: la escena debe seguir funcionando igual */
  }
}

/** Registra un evento de memoria. Recorta al tope para no crecer sin límite. */
export function recordEvent(event: Omit<MemoryEvent, 'at'>): void {
  if (typeof localStorage === 'undefined') return;
  const events = readJSON<MemoryEvent[]>(EVENTS_KEY, []);
  events.push({ ...event, at: Date.now() });
  while (events.length > MAX_EVENTS) events.shift();
  writeJSON(EVENTS_KEY, events);
}

export function readEvents(): MemoryEvent[] {
  if (typeof localStorage === 'undefined') return [];
  return readJSON<MemoryEvent[]>(EVENTS_KEY, []);
}

/**
 * Marca la entrada a una escena y devuelve lo que KODEX recuerda de ella.
 * El `returnCount` devuelto es el de ANTES de esta visita: en la primera es 0,
 * que es justamente lo que una escena necesita para saber si es un retorno.
 */
export function enterScene(scene: string): RouteMemory {
  if (typeof localStorage === 'undefined') {
    return { visits: 0, lastAt: 0, totalDwell: 0 };
  }
  const routes = readJSON<Record<string, RouteMemory>>(ROUTES_KEY, {});
  const prior = routes[scene] ?? { visits: 0, lastAt: 0, totalDwell: 0 };

  if (prior.visits > 0) {
    recordEvent({ kind: 'return', scene, returnCount: prior.visits });
  }
  routes[scene] = { ...prior, visits: prior.visits + 1, lastAt: Date.now() };
  writeJSON(ROUTES_KEY, routes);
  return prior;
}

/** Cierra la visita: acumula permanencia y guarda el estado con el que se salió. */
export function leaveScene(scene: string, dwell: number, lastState?: string): void {
  if (typeof localStorage === 'undefined') return;
  const routes = readJSON<Record<string, RouteMemory>>(ROUTES_KEY, {});
  const current = routes[scene] ?? { visits: 1, lastAt: Date.now(), totalDwell: 0 };
  routes[scene] = {
    ...current,
    totalDwell: current.totalDwell + Math.max(0, dwell),
    lastState: lastState ?? current.lastState,
  };
  writeJSON(ROUTES_KEY, routes);
}

/**
 * Peso de memoria de una escena, 0..1. Es lo que el bus de señales inyecta para que
 * una escena pueda mutar según lo vivido, sin que cada una invente su propia fórmula.
 *
 * Deliberadamente burdo y acotado: retornos y permanencia saturan rápido. No pretende
 * medir interés ni estado del visitante — solo cuánto ha pasado por acá.
 */
export function memoryWeight(scene: string): number {
  if (typeof localStorage === 'undefined') return 0;
  const routes = readJSON<Record<string, RouteMemory>>(ROUTES_KEY, {});
  const r = routes[scene];
  if (!r) return 0;
  const byVisits = Math.min(r.visits / 5, 1);
  const byDwell = Math.min(r.totalDwell / 120, 1);
  return Math.min(byVisits * 0.6 + byDwell * 0.4, 1);
}

/** Borra la memoria. El visitante debe poder deshacer su rastro. */
export function forget(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(ROUTES_KEY);
  } catch {
    /* nada que hacer */
  }
}
