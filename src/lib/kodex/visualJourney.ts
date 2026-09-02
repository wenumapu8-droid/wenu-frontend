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
 * DE QUE SIRVE UNA IMAGEN · el eje que faltaba (2026-09-01, hallazgo de Ocin).
 *
 * "Una referencia visual no es lo mismo que una pieza fuente de tu arte."
 * Una dice COMO DEBERIA VERSE; la otra ES lo que se muestra. Mezclarlas es
 * como se termina publicando el mockup de una escena en lugar de la escena.
 *
 * El eje ya estaba en los datos sin nombre: el corpus lo separa limpio.
 * Verificado sobre las 119 filas -- los 10 collages son el UNICO corpus cuyo
 * `visual_status` es uniformemente candidato a mostrarse; los 102 restantes
 * son referencia, target o estudio. Aca solo se le pone nombre.
 */
export type TipoDeFuente = 'SOURCE_ART' | 'REFERENCE' | 'ALREADY_WIRED';

export function tipoDeFuente(e: EntradaJourney): TipoDeFuente {
  if (e.corpus === 'OCIN_COLLAGE') return 'SOURCE_ART';
  if (e.corpus === 'KDX-CAN_FAMILY') return 'ALREADY_WIRED';
  return 'REFERENCE';
}

/** Las piezas reales de la obra de Ocin: lo unico que se monta como arte. */
export function arteFuente(): EntradaJourney[] {
  return ENTRADAS.filter((e) => tipoDeFuente(e) === 'SOURCE_ART');
}

/**
 * La biblioteca de lenguaje visual de un destino: como TIENE QUE VERSE, no
 * que se muestra. Este es el uso productivo de los 89 mockups -- son la
 * especificacion del renderer, no su contenido.
 */
export function guiaVisualDe(destino: string): EntradaJourney[] {
  const d = destino.toUpperCase();
  return ENTRADAS.filter(
    (e) => tipoDeFuente(e) === 'REFERENCE' && e.wiring_target.toUpperCase().includes(d),
  );
}

/**
 * REGLA DURA del DISCOVERY_GAPS (2026-09-01): ningun agente elige una imagen
 * porque diga CANON_ASSET. Esta funcion responde "¿puedo montar esto aca?"
 * y devuelve el motivo cuando la respuesta es no.
 */
export function puedeMontarse(asset: string, destino: string): { ok: boolean; razon: string } {
  const e = ENTRADAS.find((x) => x.asset === asset);
  if (!e) return { ok: false, razon: `'${asset}' no esta en VISUAL_JOURNEY: sin rol declarado, no se monta.` };

  /* 2026-09-01 · EL AGUJERO QUE TENIA ESTA FUNCION.
     Hasta hoy devolvia ok:true para un mockup contra THRESHOLD_RENDERER,
     igual que para una obra real: no distinguia "asi deberia verse" de
     "esto es lo que se muestra". Y 71 de los 89 mockups declaran un
     *_RENDERER como destino, asi que el error no era teorico. */
  const tipo = tipoDeFuente(e);
  if (tipo === 'REFERENCE') {
    return {
      ok: false,
      razon: `es REFERENCIA de lenguaje visual (${e.corpus}), no pieza fuente. ` +
        `Guia como construir '${e.wiring_target}'; no se monta como contenido. ` +
        `Preservar al construir: ${e.preserve}`,
    };
  }

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
    porTipoDeFuente: por((e) => tipoDeFuente(e)),
  };
}

/**
 * EL CRITERIO AUTORAL DE UN TARGET · el puente que le faltaba al pass visual.
 *
 * POR QUE EXISTE (2026-09-02):
 * Otra sesion construyo el Visual Convergence Pass -- mide COMPOSITION y
 * MATERIAL entre cada referencia Hi-Fi y su runtime, y saca deltas por
 * dimension en vez de un score global, que es lo correcto.
 *
 * Pero un delta solo dice CUANTO cambio. No dice QUE HABIA QUE CONSERVAR.
 * Eso lo escribio Ocin en VISUAL_JOURNEY, fila por fila, y hasta ahora vivia
 * separado de la medicion. `sym_h_delta -0.57` es un numero; junto a
 * "preservar: dominant organism/field, sparse peripheral system" es una
 * instruccion.
 *
 * Acepta el nombre canonico (KDX_UI_01_PROLOGUE_HIFI.png) o el archivo local
 * del baseline (reference-hifi-01.png): el pass usa el segundo y el mapa el
 * primero, y nadie deberia tener que traducir a mano entre los dos.
 */
export interface CriterioAutoral {
  asset: string;
  pos: string;
  phase: string;
  /** Que hay que conservar. El criterio contra el que se lee el delta. */
  preserve: string;
  /** Que NO puede significar. La trampa que el numero no ve. */
  do_not_use_as: string;
  wiring_target: string;
}

export function criterioDelTarget(ref: string): CriterioAutoral | null {
  /* reference-hifi-NN.png -> KDX_UI_NN_*. El baseline nombra por indice y el
     mapa por titulo; el numero es lo unico estable entre los dos. */
  const local = ref.match(/reference-hifi-(\d{2})/i);
  const buscado = local ? `KDX_UI_${local[1]}_` : ref;

  const e = ENTRADAS.find((x) =>
    local ? x.asset.startsWith(buscado) : x.asset === ref || x.asset.includes(ref),
  );
  if (!e) return null;
  return {
    asset: e.asset,
    pos: e.pos,
    phase: e.phase,
    preserve: e.preserve,
    do_not_use_as: e.do_not_use_as,
    wiring_target: e.wiring_target,
  };
}

/**
 * Lee un delta a la luz del criterio: dice si la dimension que se movio es una
 * de las que el autor pidio preservar. No decide si esta bien o mal -- eso es
 * direccion, y la direccion es de Ocin.
 */
export function dimensionEsCritica(ref: string, dimension: string): boolean {
  const c = criterioDelTarget(ref);
  if (!c) return false;
  const texto = c.preserve.toLowerCase();
  const SINONIMOS: Record<string, string[]> = {
    hero_mass: ['dominant', 'organism', 'hero', 'focal'],
    symmetry: ['symmetry', 'symmetr', 'radial', 'central'],
    void_ratio: ['sparse', 'minimal', 'void', 'empty', 'silence'],
    edge_complexity: ['material', 'texture', 'density', 'detail'],
    texture_entropy: ['material', 'texture', 'richness', 'grain'],
    core_periphery: ['periphery', 'peripheral', 'core', 'hierarchy'],
    aperture: ['aperture', 'eye', 'portal', 'ring', 'gate', 'cavity'],
    palette: ['color', 'palette', 'violet', 'red', 'warmth'],
    depth: ['depth', 'scale', 'layer'],
  };
  const clave = Object.keys(SINONIMOS).find((k) => dimension.toLowerCase().includes(k));
  if (!clave) return false;
  return SINONIMOS[clave].some((w) => texto.includes(w));
}
