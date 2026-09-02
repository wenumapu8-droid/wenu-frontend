/**
 * KODEX−∞ · VISUAL JOURNEY — el ruteo autoral de cada visual.
 *
 * POR QUE EXISTE (2026-09-01):
 * El Integration OS declaraba `04_ASSET_ROUTING.yaml` como el unico de sus
 * seis archivos de autoridad que faltaba, y SENTINEL.md explicaba por que:
 * "requiere autoria por asset y no se puede [inferir]". El 01-09 Ocin lo
 * escribio a mano en el atlas de Drive, hoja VISUAL_JOURNEY: 119 entradas
 * que ubican cada visual en el recorrido y, sobre todo, ENTRE los umbrales.
 *
 * Este modulo es el puente, igual que `atlas.ts` lo fue para los conceptos.
 * Verificado antes de escribirlo: `grep -rl "VISUAL_JOURNEY" src/ scripts/`
 * devolvia CERO. Otra vez, autoria completa que el codigo no conocia.
 *
 * LO QUE CAMBIA:
 * Antes una imagen significaba "es de KODEX, usala en una escena". Ahora
 * cada entrada declara su POSICION, su ROL, su FUNCION NARRATIVA, que hay
 * que PRESERVAR, y —lo mas importante— que esta PROHIBIDO hacer con ella.
 * Un craneo es SPECIMEN: no puede volver a reemplazar el universo ARCHIVE.
 *
 * LO QUE NO HACE:
 * No infiere. Si una fila no declara `wiring_target`, no se le inventa uno.
 * No decide que imagen gana: eso es `provenance_gate` mas decision autoral.
 */
import data from '../../data/kodex-visual-journey.json' with { type: 'json' };

export interface EntradaJourney {
  /** Lugar en el recorrido, ej. '00.BKS', '03.65'. NO es unico: 15 posiciones agrupan varios assets. */
  pos: string;
  /** Umbral o tramo, ej. 'THRESHOLD — MACRO ANCHOR', 'PROLOGUE → DESCENT — ENTRY'. */
  phase: string;
  from: string;
  to: string;
  asset: string;
  /** MCK · HIFI · OCIN_COLLAGE · KDX-CAN_FAMILY · USER_RUNTIME_CAPTURE */
  corpus: string;
  role: string;
  narrative_function: string;
  visual_status: string;
  family: string;
  /** Que hay que conservar si se monta. Criterio de no-regresion. */
  preserve: string;
  /** Prohibiciones explicitas. Leer SIEMPRE antes de montar. */
  do_not_use_as: string;
  /** 'NONE' o la condicion que hay que cumplir antes de usarla. */
  provenance_gate: string;
  wiring_target: string;
  map_status: string;
  source_lookup: string;
  notes: string;
}

const ENTRADAS = (data as { entradas: EntradaJourney[] }).entradas;

/** Las 119 entradas, en el orden del recorrido tal como las escribio el autor. */
export function recorridoVisual(): EntradaJourney[] {
  return ENTRADAS;
}

/** Entradas cuya `phase` empieza por el umbral dado, ej. 'PROLOGUE'. */
export function tramosDe(umbral: string): EntradaJourney[] {
  const u = umbral.toUpperCase();
  return ENTRADAS.filter((e) => e.phase.toUpperCase().startsWith(u));
}

/** Todo lo que entra o sale de un umbral, incluidos los tramos ENTRE dos. */
export function alrededorDe(umbral: string): EntradaJourney[] {
  const u = umbral.toUpperCase();
  return ENTRADAS.filter((e) => e.from.toUpperCase() === u || e.to.toUpperCase() === u);
}

/**
 * Las referencias de no-regresion: lo que ya funcionaba y no se puede perder.
 * `USER_BKS_REFERENCE` son capturas del runtime que el creador prefirio por
 * encima del estado actual. No son mandato de composicion final.
 */
export function referenciasBKS(): EntradaJourney[] {
  return ENTRADAS.filter((e) => e.visual_status.includes('BKS'));
}

/** Entradas con una compuerta de procedencia distinta de NONE. No montar sin resolverla. */
export function conCompuerta(): EntradaJourney[] {
  return ENTRADAS.filter((e) => e.provenance_gate && e.provenance_gate.toUpperCase() !== 'NONE');
}

/**
 * REGLA DURA del DISCOVERY_GAPS (2026-09-01): ningun agente elige una imagen
 * porque diga CANON_ASSET. Esta funcion responde "¿puedo montar esto aca?"
 * y devuelve el motivo cuando la respuesta es no.
 */
export function puedeMontarse(asset: string, destino: string): { ok: boolean; razon: string } {
  const e = ENTRADAS.find((x) => x.asset === asset);
  if (!e) return { ok: false, razon: `'${asset}' no esta en VISUAL_JOURNEY: sin rol declarado, no se monta.` };
  if (e.provenance_gate && e.provenance_gate.toUpperCase() !== 'NONE') {
    return { ok: false, razon: `compuerta de procedencia sin resolver: ${e.provenance_gate}` };
  }
  if (e.wiring_target && !e.wiring_target.toUpperCase().includes(destino.toUpperCase())) {
    return { ok: false, razon: `su destino declarado es '${e.wiring_target}', no '${destino}'. ${e.do_not_use_as}` };
  }
  return { ok: true, razon: `preservar: ${e.preserve}` };
}

/** Cuentas honestas del recorrido, con fuente. */
export function coberturaDelRecorrido() {
  const por = (f: (e: EntradaJourney) => string) =>
    ENTRADAS.reduce<Record<string, number>>((a, e) => { const k = f(e); if (k) a[k] = (a[k] || 0) + 1; return a; }, {});
  return {
    entradas: ENTRADAS.length,
    posiciones: new Set(ENTRADAS.map((e) => e.pos)).size,
    porCorpus: por((e) => e.corpus),
    porMapStatus: por((e) => e.map_status),
    bks: referenciasBKS().length,
    conCompuerta: conCompuerta().length,
    /** Cuantas declaran destino de cableado. Sin esto no se puede montar. */
    conDestino: ENTRADAS.filter((e) => e.wiring_target).length,
  };
}
