/**
 * KODEX-∞ · Lector tipado de los Scene Contracts.
 *
 * POR QUE EXISTE (2026-08-29):
 * Los siete `.yaml` en `src/content/scenes/` son la ESPECIFICACION congelada
 * el 2026-08-29 tras la pasada Hi-Fi. Antes de este modulo eran documentacion
 * pura: nada del build ni del runtime los leia, asi que si el copy del
 * `[folio].astro` divergia del `canonical_copy` del yaml nada gritaba.
 *
 * Este modulo pone los contratos al alcance del build:
 *
 *   const c = await contratoDeFolio('i');
 *   c?.data.canonical_copy.title  // "OBSERVATION BEGINS BEFORE RECOGNITION."
 *
 * El schema vive en `src/content.config.ts` (coleccion `scenes`), donde Astro
 * lo valida al `astro build`. Aca solo expongo accesos utiles.
 *
 * LO QUE NO HACE:
 * - No cablea automaticamente los contratos al render (esa integracion la
 *   dueña quien posea `[folio].astro` en su rama, no este modulo).
 * - No infiere valores ausentes: si el yaml dice NEEDS_CONFIRMATION o el
 *   contrato no declara un campo, devuelve exactamente eso. Regla del
 *   proyecto: un dato sin fuente es peor que un dato ausente.
 */
import { getCollection, getEntry } from 'astro:content';

/**
 * Slug de folio en la URL -> position numerico esperado en el yaml.
 * THRESHOLD vive en la portada (/kodex/) no en un folio.
 */
export const FOLIO_A_POSITION: Record<string, string> = {
  i: '01 / 06',    // PROLOGUE
  ii: '02 / 06',   // DESCENT
  iii: '03 / 06',  // ARCHIVE
  iv: '04 / 06',   // MACHINE
  v: '05 / 06',    // COSMOLOGY
  vi: '06 / 06',   // RETURN
};

/**
 * Los siete contratos, en orden 00..06. Astro valida el schema al build,
 * asi que si esto compila los siete cumplen los campos requeridos.
 */
export async function todosLosContratosDeEscena() {
  const all = await getCollection('scenes');
  return all.sort((a, b) => a.data.position.localeCompare(b.data.position));
}

/**
 * Contrato de una escena por id de coleccion (ej. 'scene.01-prologue').
 * `getEntry` es la forma canonica de Astro; devuelve `undefined` si no existe.
 */
export async function contratoPorEntryId(entryId: string) {
  return getEntry('scenes', entryId);
}

/**
 * Contrato de una escena por slug de folio ('i'..'vi').
 * THRESHOLD ('/kodex/') no es un folio y no tiene entrada; devuelve
 * `undefined` para el resto.
 */
export async function contratoDeFolio(folio: string) {
  const buscada = FOLIO_A_POSITION[folio];
  if (!buscada) return undefined;
  const all = await getCollection('scenes');
  return all.find((s) => s.data.position === buscada);
}

/**
 * Contrato de THRESHOLD (portada). Es la escena 00 y no vive en `folio/`.
 */
export async function contratoDelUmbral() {
  const all = await getCollection('scenes');
  return all.find((s) => s.data.position === '00 / 06');
}

/**
 * Copy canonico por folio -- ATAJO para lo que la mayoria de las escenas
 * necesitan. Si el contrato no existe o no declara subtitle/cta, devuelve
 * el hueco explicito (`undefined`), no un fallback inventado.
 */
export async function copyDeFolio(folio: string) {
  const c = await contratoDeFolio(folio);
  if (!c) return undefined;
  return {
    title: c.data.canonical_copy.title,
    subtitle: c.data.canonical_copy.subtitle,
    cta: c.data.cta?.label,
    source: c.data.canonical_copy.source,
  };
}

/**
 * Los KDX-IMG del atlas que este contrato declara cablear.
 * Vacio (no `undefined`) si el contrato no declara ninguno todavia.
 */
export async function conceptosDelAtlasDeFolio(folio: string): Promise<string[]> {
  const c = await contratoDeFolio(folio);
  return c?.data.atlas_concepts ?? [];
}
