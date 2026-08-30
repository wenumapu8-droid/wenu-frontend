/**
 * KODEX−∞ · ATLAS — la fuente de verdad de los conceptos.
 *
 * POR QUE EXISTE (2026-08-28):
 * El atlas de conceptos vive en Drive desde el 2026-08-06 con los 40 nodos
 * del viaje especificados uno por uno: concepto, zonas, escena, simbolos,
 * geometria, paleta, composicion, movimiento, INTERACCION, sonido, copy,
 * capa epistemica, procedencia e IMPLEMENTACION tecnica.
 *
 * El codigo nunca lo leyo. Verificado el 28-08: `grep -rl "KDX-IMG" src/`
 * devolvia CERO. Tres semanas de especificacion completa y ni una linea de
 * codigo la conocia. Documentacion y build eran universos paralelos.
 *
 * Este modulo es el puente. Desde aca, un concepto del atlas deja de ser un
 * parrafo en un Drive y pasa a ser algo que una escena puede montar.
 *
 * LO QUE NO HACE:
 * No inventa. Si el atlas no declara una escena para un nodo, `escenas` viene
 * vacio y se queda vacio -- asignarla es curaduria del creador. La regla del
 * proyecto es que un dato sin fuente es peor que un dato ausente.
 *
 * ESTADO: 36 de 40 nodos. Faltan KDX-IMG-021..024, que no aparecen en 07A ni
 * en 07B (probablemente un lote 10 no localizado). 20 nodos traen escena;
 * 32 traen interaccion escrita; 12 traen implementacion tecnica.
 *
 * ADVERTENCIA (2026-08-29): de los 36 declarados, cuatro (017-020) vienen
 * con TITULO nada mas -- el resto de sus columnas esta vacio en el atlas
 * original. `coberturaDelAtlas()` los cuenta como placeholders explicitos
 * para no falsear la metrica. Rellenar sus campos requiere fuente real,
 * no inferencia.
 */
import atlas from '../../data/kodex-atlas.json';

export interface NodoAtlas {
  id: string;
  titulo: string;
  lote: string;
  concepto?: string;
  conceptos_secundarios?: string;
  taxonomia?: string;
  zona_mapa?: string;
  /** Zonas del mapa. Un nodo pertenece a VARIAS a proposito: es el entrelazado. */
  zonas: string[];
  /** Escenas del corredor donde aparece. Vacio = curaduria pendiente, NO inferir. */
  escenas: string[];
  nodos_ids?: string[];
  simbolos?: string[];
  geometria?: string;
  paleta?: string;
  composicion?: string;
  movimiento?: string;
  /** Como responde al visitante. Especificado en el atlas, construible. */
  interaccion?: string;
  sonido?: string;
  copy?: string;
  capa_epistemica?: string;
  procedencia?: string;
  estado?: string;
  /** Enfoque tecnico declarado en el atlas (solo lote 07B). */
  implementacion?: string;
  fuente_url?: string;
}

const NODOS = (atlas as { nodos: NodoAtlas[] }).nodos;

/** Todos los nodos del atlas, ordenados por id. */
export function nodosDelAtlas(): NodoAtlas[] {
  return NODOS;
}

/** Un nodo por su id canonico, ej. 'KDX-IMG-009'. */
export function nodoPorId(id: string): NodoAtlas | undefined {
  return NODOS.find((n) => n.id === id);
}

/**
 * Los nodos que pertenecen a una escena del corredor.
 * Ej: nodosDeEscena('THRESHOLD') -> los conceptos que ese umbral abre.
 *
 * Devuelve solo los que el atlas declara explicitamente. Los 16 nodos sin
 * escena NO se reparten por parecido: quedan fuera hasta que el creador los
 * asigne.
 */
export function nodosDeEscena(escena: string): NodoAtlas[] {
  const e = escena.toUpperCase();
  return NODOS.filter((n) => n.escenas.includes(e));
}

/** Los nodos de una zona del mapa, ej. 'COSMOS', 'CONCIENCIA', 'BESTIARIO'. */
export function nodosDeZona(zona: string): NodoAtlas[] {
  const z = zona.toUpperCase();
  return NODOS.filter((n) => n.zonas.includes(z));
}

/** Todas las zonas declaradas, ordenadas. El mapa de conceptos real. */
export function zonasDelAtlas(): string[] {
  return [...new Set(NODOS.flatMap((n) => n.zonas))].sort();
}

/**
 * Nodos vecinos: los que comparten al menos una zona con este.
 * Es el enlace entre mundos que el atlas declara al dar dos zonas por nodo.
 */
export function vecinosDe(id: string): NodoAtlas[] {
  const n = nodoPorId(id);
  if (!n) return [];
  return NODOS.filter((o) => o.id !== id && o.zonas.some((z) => n.zonas.includes(z)));
}

/**
 * Un nodo esta POBLADO cuando trae algo mas que el titulo. Los placeholders
 * 017-020 solo tienen `id` y `titulo` en el atlas original -- todos los
 * campos autorales (concepto, zonas, escenas, interaccion, etc.) vienen
 * vacios. Contarlos como poblados falsearia el estado real.
 */
function estaPoblado(n: NodoAtlas): boolean {
  return Boolean(
    n.concepto ||
    n.interaccion ||
    (n.zonas && n.zonas.length > 0) ||
    (n.escenas && n.escenas.length > 0) ||
    n.geometria ||
    n.copy,
  );
}

/** Los ids de los placeholders declarados pero sin datos (solo titulo). */
export function placeholdersDelAtlas(): string[] {
  return NODOS.filter((n) => !estaPoblado(n)).map((n) => n.id);
}

/** Cuentas honestas del atlas, para mostrar en pantalla CON fuente. */
export function coberturaDelAtlas() {
  const placeholders = placeholdersDelAtlas();
  return {
    total: NODOS.length,
    esperados: 40,
    faltantes: ['KDX-IMG-021', 'KDX-IMG-022', 'KDX-IMG-023', 'KDX-IMG-024'],
    /** Declarados pero vacios (solo titulo). No inventar datos. */
    placeholders,
    /** Nodos con al menos un campo autoral fuera del titulo. */
    poblados: NODOS.length - placeholders.length,
    conEscena: NODOS.filter((n) => n.escenas.length > 0).length,
    conInteraccion: NODOS.filter((n) => n.interaccion).length,
    conImplementacion: NODOS.filter((n) => n.implementacion).length,
    zonas: zonasDelAtlas().length,
  };
}
