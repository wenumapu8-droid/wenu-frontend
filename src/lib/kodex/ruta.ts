/**
 * KODEX−∞ · MOTOR DE RUTA — el descenso hacia dentro
 *
 * EL PEDIDO DEL CREADOR, textual (2026-08-20):
 *   "hasta ahora uno va hacia el lado y necesitamos que vaya hacia dentro, y
 *    que las 7 escenas se ramifiquen y encontremos más y más en cada una hasta
 *    encontrar al medio el corazón"
 *   "el viaje sea distinto según las decisiones, los clicks — esta es la
 *    máquina del KODEX"
 *   "de una lámina tengas después 3 nuevas sub-láminas"
 *
 * LA ESPECIFICACIÓN CANÓNICA es `27-DEEP-NAVIGATION.txt` (Drive, 2026-08-14,
 * autoría creativa de Ocín). De ahí salen, literales, las reglas duras:
 *   §17 "Do not choose the next node with pure randomness and do not always
 *        expose the same menu" — el puntaje de candidatos de abajo es ese.
 *   §19 "2–5 route candidates maximum in a junction" — por eso 3, no 12.
 *   §22 "no random route roulette" — nada acá tira un dado ciego.
 *
 * NADA SE BORRA. El pasillo de siete escenas sigue existiendo y sigue andando
 * igual; el creador pidió transformar, no reemplazar. Lo que este módulo agrega
 * es la tercera dimensión que faltaba: la profundidad.
 *
 * PURO A PROPÓSITO: sin DOM, sin fetch, sin reloj. Entra estado, sale ruta.
 * Así el mismo motor corre en el build para verificarse y en el navegador para
 * personalizar, y así se puede medir en vez de creerle.
 */

/** Un nodo tal como lo emite `tejer-ramas.mjs` desde el grafo tipado. */
export type NodoRama = {
  id: string;
  titulo: string;
  estrato: string | null;
  estatus: 'CANONICAL' | 'VERIFIED' | 'INFERRED' | 'SPECULATIVE' | 'NEEDS_CONFIRMATION';
  grado: number;
  href: string;
  /** el título es su propio hash: espécimen todavía sin nombrar */
  sinNombre?: boolean;
};

export type Corpus = {
  nodos: NodoRama[];
  /** id → ids vecinos, ya resueltos desde las 728 aristas tipadas */
  vecinos: Record<string, string[]>;
  /** id → índice en `nodos`, para no barrer 1.427 en cada paso */
  indice: Record<string, number>;
};

/** El estado del viaje. Es el JOURNEY del statechart de §4 del documento. */
export type Viaje = {
  escena: string;          // i … vi — la escena por cuya boca se entró
  profundidad: number;     // 0 en la superficie
  aqui: string | null;     // nodo actual
  visitados: string[];     // el rastro, en orden
  firma: number;           // firma de ruta: distingue a una persona de otra
  /** de memoria.ts — no se recalcula acá, se recibe */
  memoria: { archiveDepth: number; routeDiversity: number; returnCount: number };
};

export type Puerta = {
  nodo: NodoRama;
  /** por qué esta puerta y no otra — se muestra, no se esconde */
  razon: string;
  puntaje: number;
  /** 0…1, qué tan cerca del corazón queda al cruzarla */
  cercania: number;
  /** el carácter de la puerta — ver `bifurcar` */
  papel?: 'HILO' | 'PUENTE' | 'HALLAZGO';
};

/* ── geometría del descenso ────────────────────────────────────────────────
   El ángulo áureo es cómo ramifica una planta: cada hoja nueva a 137.507° de
   la anterior es el único ángulo que nunca repite alineación, y por eso una
   piña o un girasol llenan su disco sin dejar hueco ni superponer. El creador
   pidió "una ramificación algorítmica inspirada en la naturaleza, en la
   geometría sagrada del universo" — esto es esa geometría haciendo trabajo
   real: es la función que elige puertas, no un adorno dibujado encima.
   (Regla de canon: la matemática nunca es decorativa.) */
const PHI = (1 + Math.sqrt(5)) / 2;
const AUREO = 1 / (PHI * PHI); // 0.381966… — la vuelta de oro, normalizada a 1

/** Siete escenas, siete profundidades: el corazón está en el fondo del siete. */
export const PROFUNDIDAD_CORAZON = 7;

/** Cuántas puertas ofrece una bifurcación. §19: entre 2 y 5. El creador: 3. */
export const PUERTAS = 3;

/** Mezclador entero — determinista, sin estado, sin Math.random. */
function mezclar(n: number): number {
  let h = n >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15; h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Firma estable de un texto — para sembrar sin depender del orden del corpus. */
export function firmar(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ── el puntaje de candidatos — §17 del documento, término por término ─────
   Cada sumando de abajo está nombrado como en el documento del creador. No se
   inventó ninguno y no se calló ninguno: los que todavía no tienen dato real
   en el grafo valen 0 y se dicen, en vez de rellenarse con un número lindo. */
function puntuar(c: NodoRama, v: Viaje, corpus: Corpus, k: number): { p: number; razon: string } {
  const aqui = v.aqui ? corpus.nodos[corpus.indice[v.aqui]] : null;
  const vecino = v.aqui ? (corpus.vecinos[v.aqui] || []).includes(c.id) : false;
  const visto = v.visitados.includes(c.id);

  /* semanticAffinity — una arista tipada del grafo es la afinidad más fuerte
     que existe acá: alguien la escribió, no la dedujo una máquina. */
  const afinidad = vecino ? 1 : (aqui && aqui.estrato && aqui.estrato === c.estrato ? 0.55 : 0);

  /* curatorWeight — el grado es curaduría acumulada: cuántas veces este nodo
     fue puesto en relación con otro a mano. */
  const curador = Math.min(1, c.grado / 9);

  /* narrativeCompatibility — a más hondo, más se pide que el nodo esté
     sostenido. En la superficie se puede especular; en el corazón no. */
  const hondura = v.profundidad / PROFUNDIDAD_CORAZON;
  const sostenido = c.estatus === 'CANONICAL' ? 1 : c.estatus === 'VERIFIED' ? 0.8
    : c.estatus === 'INFERRED' ? 0.45 : c.estatus === 'SPECULATIVE' ? 0.25 : 0.1;
  const narrativa = 0.4 + hondura * (sostenido - 0.4);

  /* memoryResonance — quien ya bajó hondo antes recibe puertas más raras;
     quien recién llega recibe puertas más firmes. El archivo se abre de a poco. */
  const resonancia = Math.min(1, v.memoria.archiveDepth / 12) * (1 - curador) * 0.6
    + Math.min(1, v.memoria.routeDiversity / 8) * 0.4;

  /* novelty / recentExposure / repetition — §17 los pide con signo opuesto. */
  const novedad = visto ? 0 : 1;
  const repeticion = visto ? 0.9 : 0;

  /* crossFieldBridge — cruzar de estrato es un puente, y el documento lo
     premia; pero premiarlo siempre haría el viaje errático, así que se premia
     más cuanto más diversa venía ya la ruta. */
  const puente = aqui && c.estrato && aqui.estrato !== c.estrato
    ? 0.3 + Math.min(0.4, v.memoria.routeDiversity / 20) : 0;

  /* cognitiveLoad — cerca del corazón, un nodo con veinte relaciones abre más
     de lo que cierra. Se penaliza sólo en lo hondo. */
  const carga = hondura * curador * 0.5;

  /* unsupportedClaimRisk — regla de canon dura: la ficción del Codex Estelar
     nunca se ofrece como si fuera el registro documentado. No se prohíbe la
     puerta; se le baja el puntaje y se le pone la etiqueta encima. */
  const riesgo = c.estatus === 'SPECULATIVE' ? 0.35 + hondura * 0.4 : 0;

  /* controlledRandomness — §17: variable entre visitas, nunca ruleta. El
     desvío sale del ángulo áureo aplicado a (persona, escena, hondura, puerta),
     así que es reproducible: la misma persona en la misma rama ve lo mismo, y
     otra persona ve otra cosa. */
  const giro = ((v.firma * AUREO + v.profundidad * AUREO + k * AUREO) % 1);
  const desvio = ((mezclar(firmar(c.id) ^ Math.floor(giro * 0xffffff)) / 0xffffffff) - 0.5) * 0.5;

  /* El peso del curador CAE con la hondura y el de la novedad SUBE: la
     superficie muestra lo trabajado, el fondo muestra lo que nadie miró. Es la
     misma idea que ya estaba en el hub de estratos — "each access, a new
     layer" — expresada como pendiente en vez de como frase. */
  const p = afinidad * 1.6 + curador * (0.9 - hondura * 0.6) + narrativa * 0.8
    + resonancia * 0.6 + novedad * (0.4 + hondura * 0.9) + puente + desvio
    - repeticion - carga - riesgo;

  /* La razón que se le muestra a la persona: el término que más pesó. Es
     honestidad de interfaz — la puerta dice por qué apareció. */
  const razon = vecino ? 'RELATED IN THE GRAPH'
    : puente > 0.3 ? 'CROSSES INTO ANOTHER STRATUM'
    : afinidad > 0 ? 'SAME STRATUM'
    : curador > 0.5 ? 'HEAVILY CURATED'
    : resonancia > 0.5 ? 'YOUR ROUTE OPENED THIS'
    : 'UNVISITED';

  return { p, razon };
}

/**
 * Las puertas de una bifurcación.
 *
 * Se puntúa una MUESTRA del corpus, no las 1.427: la muestra se toma con el
 * ángulo áureo desde la firma de la persona, que es exactamente la propiedad
 * de la filotaxis — recorrer un anillo sin repetir posición ni dejar hueco.
 * Así el costo es constante y la cobertura sigue siendo pareja.
 */
export function bifurcar(v: Viaje, corpus: Corpus): Puerta[] {
  const N = corpus.nodos.length;
  if (!N) return [];

  const cand = new Map<string, NodoRama>();

  /* Primero los vecinos reales: si el nodo actual tiene relaciones escritas,
     el descenso las sigue. Esto es lo que hace que el viaje sea el KODEX y no
     un paseo por una lista. */
  for (const id of (v.aqui ? corpus.vecinos[v.aqui] || [] : [])) {
    const n = corpus.nodos[corpus.indice[id]];
    if (n) cand.set(id, n);
  }

  /* Después la espiral. La muestra CRECE con la hondura: arriba el archivo se
     ofrece curado y estrecho, abajo se abre. Con muestra fija de 48 se medían
     173 de 1.427 nodos alcanzables en 200 viajes — el archivo quedaba casi
     todo fuera del alcance, que es justo lo contrario de un archivo vivo. */
  const muestra = 48 + v.profundidad * 96;
  const base = (v.firma % 0xffff) / 0xffff;
  for (let k = 0; k < muestra; k++) {
    const t = (base + (v.profundidad + 1) * AUREO + k * AUREO) % 1;
    const n = corpus.nodos[Math.floor(t * N) % N];
    if (n) cand.set(n.id, n);
  }

  /* Exclusión dura de lo ya pisado EN ESTE descenso: la penalización de §17
     ("repetition") alcanza entre visitas, pero dentro de una misma bajada no
     se puede descender adonde uno ya está — se midió y pasaba: una ruta volvía
     dos veces al mismo nodo y el viaje dejaba de ir hacia dentro. */
  const libres = [...cand.values()]
    .filter((n) => n.id !== v.aqui && !v.visitados.includes(n.id))
    .map((n, k) => { const { p, razon } = puntuar(n, v, corpus, k);
      return { nodo: n, razon, puntaje: p, cercania: (v.profundidad + 1) / PROFUNDIDAD_CORAZON }; })
    .sort((a, b) => b.puntaje - a.puntaje);

  /* ── las tres puertas tienen CARÁCTER distinto ──────────────────────────
     Medido: con puntaje puro las tres salían siempre del mismo grupo de 118
     nodos curados — 121 de 1.427 alcanzables en 200 viajes. Los otros 1.309 no
     tienen relación escrita ni estrato, así que nunca podían ganar y el
     archivo entero quedaba fuera del descenso.

     La corrección no es subir un número: es que una bifurcación con tres
     puertas equivalentes no es una decisión. §17 pide que la ruta se sienta
     descubierta; §20 pide que la junction dé agencia. Entonces cada puerta
     ocupa un papel y la persona elige entre TRES COSAS DISTINTAS:

       HILO     seguir la relación escrita — el KODEX que alguien ya tejió
       PUENTE   cruzar de estrato — el salto que abre campo
       HALLAZGO lo que nadie miró todavía — el archivo crudo

     El papel también decide qué se puede prometer: HALLAZGO no afirma
     relación, porque no la hay. Nada se resuelve en silencio. */
  const aqui = v.aqui ? corpus.nodos[corpus.indice[v.aqui]] : null;
  /* `!!` y no truthiness suelta: `v.aqui` es `string | null`, así que sin la
     doble negación el predicado devuelve `string | boolean | null` y no
     `boolean`. Funcionaba —`Array.find` evalúa por veracidad— pero el tipo
     mentía sobre el contrato. Lo encontró `tsc --strict`, no el navegador. */
  const esHilo = (p: Puerta) => !!v.aqui && (corpus.vecinos[v.aqui] || []).includes(p.nodo.id);
  const esPuente = (p: Puerta) => !!(aqui?.estrato && p.nodo.estrato && aqui.estrato !== p.nodo.estrato)
    || (!aqui?.estrato && !!p.nodo.estrato);
  const esHallazgo = (p: Puerta) => !p.nodo.estrato && p.nodo.grado === 0;

  const papeles: Array<[NonNullable<Puerta['papel']>, (p: Puerta) => boolean]> = [
    ['HILO', esHilo], ['PUENTE', esPuente], ['HALLAZGO', esHallazgo],
  ];
  const elegidas: Puerta[] = [];
  const tomados = new Set<string>();
  for (const [papel, prueba] of papeles) {
    const p = libres.find((x) => !tomados.has(x.nodo.id) && prueba(x));
    if (p) { tomados.add(p.nodo.id); elegidas.push({ ...p, papel }); }
  }
  /* Si un papel no tiene candidato — pasa cerca del corazón, cuando el rastro
     ya consumió los vecinos — se completa por puntaje y se dice cuál es. */
  for (const p of libres) {
    if (elegidas.length >= PUERTAS) break;
    if (tomados.has(p.nodo.id)) continue;
    tomados.add(p.nodo.id);
    elegidas.push({ ...p, papel: esHilo(p) ? 'HILO' : esPuente(p) ? 'PUENTE' : 'HALLAZGO' });
  }
  return elegidas.slice(0, PUERTAS);
}

/** ¿Este paso llega al corazón? Séptimo nivel: el fondo. */
export function enElCorazon(v: Viaje): boolean {
  return v.profundidad >= PROFUNDIDAD_CORAZON;
}

/**
 * La firma de ruta: lo que hace que dos personas no vean el mismo KODEX.
 * Se arma del recorrido real, así que cambia con cada decisión — que es
 * literalmente lo que pidió el creador ("según las decisiones, los clicks").
 */
export function firmaDeRuta(escena: string, visitados: string[], retornos: number): number {
  return firmar(`${escena}/${visitados.join('>')}/${retornos}`);
}
