/**
 * KODEX-∞ · QUÉ SE PUEDE AFIRMAR Y QUÉ TODAVÍA NO
 *
 * Dos marcas visibles, ninguna de las cuales esconde nada:
 *
 *   1. SEÑAL NO RESUELTA — una afirmación de significado sin fuente citada se muestra
 *      como estado sin resolver, no como hecho y tampoco como página en blanco.
 *   2. LECTURA DEL AUTOR — una arista que cruza del registro documentado al de ficción
 *      se muestra como analogía suya, nunca como afirmación sobre la práctica referida.
 *
 * POR QUÉ MARCAR Y NO BLOQUEAR
 * ----------------------------
 * Porque es lo que el proyecto ya decidió, en sus propias palabras.
 *
 * `canon/KODEX_EPISTEMIC_STANDARD.md` (kodex-minus-infinity), «Failure behavior»:
 *     visual_behavior: preserve_empty_or_unresolved_state
 *     next_action: identify_primary_source_or_human_review
 *     «Absence is a valid informational state. It must not be filled for aesthetic balance.»
 * Y para la clase UNKNOWN: «visible absence, never silently filled».
 *
 * `COWORK-BRIDGE.md:773`: «MANTENER [review] hasta verificar contra Canio & Pozo 2015.
 * NO publicar como hecho; el flag [review] ES el salvaguarda».
 * `COWORK-BRIDGE.md:670`: «si dudas, marcar review, NO inventar».
 *
 * El canon reserva BLOCKED para privacidad no pública, derechos sin despejar y
 * `culturalStatus: AUTHORIZATION_REQUIRED`. Una cita que falta no está en esa lista, y
 * `REVIEW_REQUIRED` no bloquea en ninguna parte del código. Esconder material de raíz
 * mapuche por falta de cita habría sido una regla nueva, inventada acá, más dura que la
 * del propio autor — y borrar una cultura de una obra hecha en relación con ella no es
 * un error neutro.
 *
 * QUÉ SE MARCA Y QUÉ NO
 * ---------------------
 * Se marca la AFIRMACIÓN DE SIGNIFICADO: decir qué significa una ceremonia o un símbolo.
 * Eso requiere fuente o autoridad para decirlo.
 *
 * No se marcan la presencia, la referencia, la influencia ni el homenaje: el título, el
 * id, los símbolos y las relaciones siguen enteros. El nodo conserva su lugar en el grafo.
 *
 * SE RESUELVE CON DATO
 * --------------------
 * `culturalStatus` lo escribe `scripts/build-kodex-nodes.py` desde el Visual Atlas, no a
 * mano. En cuanto el nodo reciba una fuente citada, la señal se apaga sola: ni una línea
 * de código que tocar, ni una lista de slugs que mantener.
 *
 * JS plano y sin imports a propósito, para que `node --test` lo ejercite directo. Este
 * repo no tiene compilador de TypeScript instalado ni script `test`.
 */

/** Estatus culturales que exigen cuidado explícito. Los escribe el generador. */
export const SENSITIVE_CULTURAL_STATUS = Object.freeze([
  'REVIEW_REQUIRED',
  'AUTHORIZATION_REQUIRED',
]);

/**
 * Marca de la arista que cruza registros.
 *
 * El proyecto separa dos registros que «NUNCA se mezclan»: lo documentado (mapuche citado
 * a Canio & Pozo, ciencia, oficio) y la ficción de autor. Ver `KODEX-BIBLE.md:92` (regla
 * Hidden Sky) y `COWORK-HANDOFF.md:16`. La regla de aislamiento en
 * `public/kodex-content/sources/wenu-mapu.md:45` admite un solo puente entre registros:
 * «solo conceptual vía Jung (arquetipos), nunca presentando lo mapuche como parte de la
 * ficción».
 *
 * Esta frase es ese puente dicho en voz alta: la arista existe, es de él, y no habla por
 * la ceremonia.
 */
export const AUTHOR_READING_NOTE =
  'Lectura del autor. Analogía que él propone; no es una afirmación sobre la práctica cultural referida.';

/** La validez con que el autor marcó esas aristas en `authored-edges.json`. */
export const AUTHOR_READING_VALIDITY = 'NEEDS_CULTURAL_REVIEW';

/**
 * ¿El nodo declara raíz cultural / sensibilidad?
 * @param {{ epistemic?: { culturalStatus?: string } }} node
 */
export function isCulturallySensitive(node) {
  return SENSITIVE_CULTURAL_STATUS.includes(
    node?.epistemic?.culturalStatus ?? 'STANDARD',
  );
}

/**
 * ¿Hay al menos una fuente citada?
 *
 * No se juzga la calidad de la fuente por su `type`: es texto libre —hoy hay cuatro
 * valores distintos en todo el corpus— y clasificar «ficha de museo» contra «etnografía»
 * emparejando texto sería adivinar. Quien decide si una fuente alcanza es el autor, no
 * esta función.
 *
 * @param {{ sources?: Array<object> }} node
 */
export function hasCitedSource(node) {
  return Array.isArray(node?.sources) && node.sources.length > 0;
}

/**
 * ¿Las afirmaciones de significado de este nodo están sin resolver?
 * Raíz cultural declarada + ninguna fuente citada.
 * @param {object} node
 */
export function hasUnresolvedClaims(node) {
  return isCulturallySensitive(node) && !hasCitedSource(node);
}

/**
 * ¿Hay que marcar esta relación como lectura del autor?
 * @param {{ validity?: string }} relation
 */
export function isAuthorReading(relation) {
  return relation?.validity === AUTHOR_READING_VALIDITY;
}
