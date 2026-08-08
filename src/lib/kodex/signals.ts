/**
 * KODEX-∞ · BUS DE SEÑALES
 *
 * El problema que resuelve: hoy cada escena calcula su propio pointer, su propio dwell
 * y su propio tiempo. `observe-v2-client` tiene su `performance.now`, el portal tiene el
 * suyo, el audio otro. Coinciden por casualidad, igual que coincidían las fases antes de
 * `estado.ts`. Cuando una escena quiere reaccionar a lo que pasó en otra, no puede.
 *
 * Acá las señales son una sola superficie normalizada que leen visual, audio y UI.
 *
 * Nadie consume este módulo todavía. Es aditivo a propósito: se introduce primero,
 * se migra escena por escena después.
 *
 * Contrato (09_KODEX_PRODUCTION_BLUEPRINT §D): las señales son NORMALIZADAS.
 * pointer en 0..1, velocity en 0..1, dwell en segundos, el resto acotado y documentado.
 */

import { prefersReducedMotion } from './reduced-motion.js';

export interface KodexSignals {
  /** Puntero normalizado al viewport. 0..1. Centro = 0.5. */
  pointerX: number;
  pointerY: number;
  /** Magnitud de velocidad del puntero, normalizada y saturada a 1. */
  velocity: number;
  /** Segundos que el puntero lleva esencialmente quieto. Se reinicia al moverse. */
  dwell: number;
  /** La ventana tiene foco. Sin foco, las escenas deberían aquietarse. */
  focus: boolean;
  /** Segundos desde que arrancó el bus. Monótono. */
  time: number;
  /** Visitas previas registradas para esta ruta. 0 en la primera. */
  returnCount: number;
  /** Peso de memoria acumulada para la ruta actual. 0..1, saturado. */
  memoryWeight: number;
  /** El visitante pidió menos movimiento. Las escenas deben respetarlo. */
  reducedMotion: boolean;
}

const DWELL_EPSILON = 0.004; // movimiento por debajo de esto cuenta como quietud
const VELOCITY_SCALE = 12;   // divisor para saturar velocity a ~1 en gesto rápido

export interface SignalBus {
  get(): Readonly<KodexSignals>;
  subscribe(fn: (s: Readonly<KodexSignals>) => void): () => void;
  /** Inyecta valores derivados de la memoria. La memoria no se calcula acá. */
  setMemory(returnCount: number, memoryWeight: number): void;
  destroy(): void;
}

/**
 * Crea el bus. Debe existir UNO por documento.
 *
 * No arranca ningún requestAnimationFrame propio: el tiempo y el dwell se actualizan
 * cuando alguien llama `get()`. Así el bus no compite con el rAF de las escenas ni
 * mantiene vivo un loop cuando la pestaña está oculta.
 */
export function createSignalBus(target: Window | null = typeof window !== 'undefined' ? window : null): SignalBus {
  const signals: KodexSignals = {
    pointerX: 0.5,
    pointerY: 0.5,
    velocity: 0,
    dwell: 0,
    focus: true,
    time: 0,
    returnCount: 0,
    memoryWeight: 0,
    reducedMotion: false,
  };

  const listeners = new Set<(s: Readonly<KodexSignals>) => void>();
  const started = now();
  let lastMoveAt = started;
  let lastX = 0.5;
  let lastY = 0.5;

  function now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  function emit() {
    for (const fn of listeners) fn(signals);
  }

  function onPointer(event: PointerEvent | MouseEvent) {
    const w = target?.innerWidth || 1;
    const h = target?.innerHeight || 1;
    const x = clamp01(event.clientX / w);
    const y = clamp01(event.clientY / h);
    const t = now();
    const dt = Math.max(t - lastMoveAt, 1) / 1000;
    const dist = Math.hypot(x - lastX, y - lastY);

    signals.pointerX = x;
    signals.pointerY = y;
    signals.velocity = clamp01((dist / dt) / VELOCITY_SCALE);

    if (dist > DWELL_EPSILON) {
      lastMoveAt = t;
      signals.dwell = 0;
    }
    lastX = x;
    lastY = y;
    emit();
  }

  function onFocus() {
    signals.focus = true;
    emit();
  }

  function onBlur() {
    signals.focus = false;
    // Sin foco no hay gesto: el dwell no debe seguir acumulando "atención".
    lastMoveAt = now();
    signals.dwell = 0;
    emit();
  }

  if (target) {
    signals.reducedMotion = prefersReducedMotion();
    target.addEventListener('pointermove', onPointer as EventListener, { passive: true });
    target.addEventListener('focus', onFocus);
    target.addEventListener('blur', onBlur);
  }

  return {
    get() {
      const t = now();
      signals.time = (t - started) / 1000;
      signals.dwell = signals.focus ? (t - lastMoveAt) / 1000 : 0;
      return signals;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    setMemory(returnCount, memoryWeight) {
      signals.returnCount = Math.max(0, Math.floor(returnCount));
      signals.memoryWeight = clamp01(memoryWeight);
      emit();
    },
    destroy() {
      if (target) {
        target.removeEventListener('pointermove', onPointer as EventListener);
        target.removeEventListener('focus', onFocus);
        target.removeEventListener('blur', onBlur);
      }
      listeners.clear();
    },
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
