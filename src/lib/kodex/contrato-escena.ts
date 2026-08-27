/**
 * CONTRATO DE ESCENA · KODEX−∞
 *
 * La gramática vive en `scripts/kodex/contratos-escena.json` como dato. Esto
 * la trae al render para que la escena DECLARE en el DOM qué es, y para que
 * `gate-experiencia.mjs` pueda verificar si esa declaración es verdad.
 *
 * Uso — una línea, sobre la raíz de la escena que ya existe:
 *
 *   ---
 *   import { contratoDe } from '../../../lib/kodex/contrato-escena';
 *   const contrato = contratoDe(folio, { organismo: '.kdx-ojo' });
 *   ---
 *   <section {...contrato}>
 *
 * `organismo` es el único campo que la escena tiene que aportar, porque es lo
 * único que el canon no puede saber: qué nodo concreto del DOM es la obra.
 * Todo lo demás —verbo, dialecto, acento— sale del contrato canónico.
 *
 * El estado lo escribe la máquina de estados en runtime sobre el mismo nodo:
 *
 *   raiz.dataset.kdxEstado = 'lock';
 *
 * NOTA: `data-kdx-escena` NO sirve para esto — ya está tomado por
 * `Descenso.astro`, donde marca el slug de destino del botón de salida.
 */
import contratos from '../../../scripts/kodex/contratos-escena.json';

/** Slug de folio → id de escena canónica. THRESHOLD vive en la portada. */
const POR_FOLIO: Record<string, string> = {
  i: 'PROLOGUE', ii: 'DESCENT', iii: 'ARCHIVE',
  iv: 'MACHINE', v: 'COSMOLOGY', vi: 'RETURN',
};

export interface Contrato {
  id: string;
  verbo: string;
  organismo: string;
  decision: string;
  dialecto: string;
  acento: string;
}

/** El contrato canónico crudo, por id de escena o por slug de folio. */
export function canon(idOFolio: string): Contrato | null {
  const id = POR_FOLIO[idOFolio] ?? idOFolio.toUpperCase();
  const e = contratos.escenas.find((x: any) => x.id === id);
  return e
    ? { id: e.id, verbo: e.verbo, organismo: e.organismo, decision: e.decision, dialecto: e.dialecto, acento: e.acento }
    : null;
}

/**
 * Atributos para esparcir sobre la raíz de la escena.
 *
 * @param idOFolio  'i'…'vi' o 'THRESHOLD'/'PROLOGUE'/…
 * @param opts.organismo  selector CSS del organismo dominante en ESTA escena
 * @param opts.titulo     selector del título cinético, si lo hay
 * @param opts.estado     estado inicial (por defecto 'dormant')
 */
export function contratoDe(
  idOFolio: string,
  opts: { organismo: string; titulo?: string; estado?: string },
): Record<string, string> {
  const c = canon(idOFolio);
  if (!c) throw new Error(`contrato-escena: no hay contrato canónico para "${idOFolio}"`);
  if (!opts?.organismo) throw new Error(`contrato-escena: ${c.id} debe declarar su organismo dominante`);

  return {
    'data-kdx-contrato': c.id,
    'data-kdx-verbo': c.verbo,
    'data-kdx-organismo': opts.organismo,
    'data-kdx-dialecto': c.dialecto,
    'data-kdx-acento': c.acento,
    'data-kdx-estado': opts.estado ?? 'dormant',
    ...(opts.titulo ? { 'data-kdx-titulo': opts.titulo } : {}),
  };
}
