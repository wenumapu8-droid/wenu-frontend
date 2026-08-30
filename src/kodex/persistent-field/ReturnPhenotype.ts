/**
 * KODEX-∞ · FENOTIPO DE RETORNO
 * P2 + P3 del MASTER UNBLOCK MAP (78) · 2026-08-30
 *
 * ────────────────────────────────────────────────────────────────────────
 * POR QUÉ RETURN ES LA PRUEBA MÁS IMPORTANTE
 *
 * Es la única escena que obliga al runtime a DEMOSTRAR que KODEX recuerda.
 * Las otras seis pueden fingir memoria con una animación; RETURN no, porque
 * su forma tiene que ser distinta según por dónde pasaste.
 *
 *   SOURCE ──journey──▸ SOURCE′
 *
 * La regla dura del master map:
 *   "Debe consumir datos REALES, no telemetría falsa."
 *
 * Acá los datos reales son los que el campo ya venía acumulando sin que
 * nadie los mirara: ruta de atractores, ciclo, residuo por régimen, seed.
 *
 * ────────────────────────────────────────────────────────────────────────
 * LAS DOS PROPIEDADES QUE HAY QUE PROBAR
 *
 *   1. DETERMINISMO   mismo JourneyState + mismo seed → mismo fenotipo.
 *                     Sin esto, "memoria" es indistinguible de azar.
 *   2. DIVERGENCIA    otra trayectoria → otra forma de retorno.
 *                     Sin esto, la memoria no tiene consecuencia.
 *
 * Las dos son verificables y hay tests que las verifican. Un RETURN que se
 * ve bonito pero da lo mismo con cualquier ruta no pasó el gate: es un
 * experimento, no producto.
 *
 * ────────────────────────────────────────────────────────────────────────
 * P3 · THRESHOLD′
 *
 * El fenotipo de retorno no muere al salir de RETURN: se convierte en la
 * semilla del próximo comienzo. THRESHOLD₁ no es THRESHOLD₀ otra vez --
 * arranca desde SOURCE′. Eso es lo que hace el ciclo:
 *
 *   THRESHOLD₀ → … → RETURN₀ → THRESHOLD₁ → … → RETURN₁ → THRESHOLD₂
 *
 * No un slideshow circular: una espiral con memoria.
 */

import type { Atractor, EstadoCampo } from './PersistentField';

export interface Fenotipo {
  /** Firma legible de la ruta. Misma ruta → misma firma. */
  firma: string;
  /** Semilla derivada: journey + seed. Determinista. */
  semilla: number;
  /** Cuántos regímenes distintos se visitaron. Amplitud del viaje. */
  amplitud: number;
  /** Vueltas completas al ciclo. Profundidad del viaje. */
  ciclo: number;
  /** Peso de cada régimen en la forma final, normalizado. Suman 1. */
  herencia: Record<Atractor, number>;
  /** Régimen dominante: el que más marcó el recorrido. */
  dominante: Atractor | null;
  /** Torsión 0..1 — cuánto se desvió la ruta del orden canónico. */
  torsion: number;
}

/* FNV-1a. Determinista, sin dependencias, estable entre sesiones. Es la
   misma función que ya usa el checksum del chasis: una sola forma de
   derivar identidad en todo el proyecto. */
function fnv(txt: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < txt.length; i++) {
    h ^= txt.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

const ORDEN: Atractor[] = [
  'THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN',
];

/**
 * Deriva el fenotipo de retorno del estado REAL del campo.
 * Función pura: mismo estado → mismo resultado, siempre.
 */
export function derivarFenotipo(e: EstadoCampo): Fenotipo {
  const ruta = e.ruta;
  const firma = ruta.map((a) => (a === 'THRESHOLD' ? 'T' : a[0])).join('') + '·' + e.ciclo;

  /* La semilla mezcla ruta Y seed de sesión: dos visitantes con la misma
     ruta obtienen formas emparentadas pero no idénticas. El viaje manda
     sobre la forma; la sesión aporta su variación. */
  const semilla = fnv(firma + ':' + e.seed);

  /* HERENCIA: cuánto de cada régimen sobrevive en la forma final. Se cuenta
     la visita Y el residuo -- pasar por una escena deja huella aunque no te
     hayas quedado. */
  const bruto = Object.fromEntries(ORDEN.map((a) => [a, 0])) as Record<Atractor, number>;
  for (const a of ruta) bruto[a] += 1;
  for (const a of ORDEN) bruto[a] += (e.residuo[a] || 0) * 0.5;

  const total = ORDEN.reduce((s, a) => s + bruto[a], 0) || 1;
  const herencia = Object.fromEntries(
    ORDEN.map((a) => [a, bruto[a] / total]),
  ) as Record<Atractor, number>;

  let dominante: Atractor | null = null;
  let max = 0;
  for (const a of ORDEN) if (herencia[a] > max) { max = herencia[a]; dominante = a; }

  const amplitud = new Set(ruta).size;

  /* TORSIÓN: cuántos saltos de la ruta rompieron el orden canónico. Un
     visitante que fue derecho tiene torsión 0; uno que saltó de ARCHIVE a
     RETURN y volvió, la tiene alta. La forma del retorno lo refleja. */
  let saltos = 0;
  for (let i = 1; i < ruta.length; i++) {
    const d = ORDEN.indexOf(ruta[i]) - ORDEN.indexOf(ruta[i - 1]);
    if (d !== 1) saltos++;
  }
  const torsion = ruta.length > 1 ? Math.min(1, saltos / (ruta.length - 1)) : 0;

  return { firma, semilla, amplitud, ciclo: e.ciclo, herencia, dominante, torsion };
}

/**
 * P3 · SOURCE′ → el próximo THRESHOLD.
 *
 * Convierte el fenotipo de retorno en la semilla del próximo ciclo. No
 * reinicia: hereda. Por eso THRESHOLD₁ arranca distinto de THRESHOLD₀.
 */
export function semillaDelProximoUmbral(f: Fenotipo): number {
  return fnv(f.firma + '→T′:' + f.semilla + ':' + f.ciclo);
}

const CLAVE = 'kdx-fenotipo';

/** Persiste el fenotipo para que el próximo THRESHOLD lo encuentre. */
export function sellar(f: Fenotipo): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({
      firma: f.firma,
      semilla: semillaDelProximoUmbral(f),
      ciclo: f.ciclo,
      dominante: f.dominante,
      torsion: f.torsion,
    }));
  } catch { /* sin sessionStorage el ciclo sigue, sin herencia */ }
}

export interface Herencia {
  firma: string; semilla: number; ciclo: number;
  dominante: Atractor | null; torsion: number;
}

/** Lee lo que dejó el RETURN anterior. null en la primera visita. */
export function herenciaPrevia(): Herencia | null {
  try {
    const raw = sessionStorage.getItem(CLAVE);
    return raw ? (JSON.parse(raw) as Herencia) : null;
  } catch {
    return null;
  }
}
