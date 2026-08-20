/**
 * KODEX−∞ · la raíz de una lámina, resuelta en un solo lugar
 *
 * Conviven DOS convenciones de nombre en las 39 planchas:
 *   `<div class="lam" data-lam="null-knot">`                     (la mayoría)
 *   `<div class="kdx-lam kdx-lam--threshold" data-lamina="…">`   (la serie t01)
 *
 * Y había TRES módulos buscándola cada uno a su manera: `escala.ts` por `.lam`,
 * `movil.ts` por `.lam`, `montar.ts` por `[data-lam]`. Resultado medido al
 * barrer las 39: en las 10 planchas de la serie t01 no se montaba ni la capa de
 * vida, ni el lector móvil, ni el escalado — y una de ellas mide 1672px de
 * ancho sobre una pantalla de 390. No daba error: los tres módulos salían en
 * silencio porque su selector no encontraba nada.
 *
 * Se descubrió recién al barrer las 39 láminas, no al probar cuatro. Por eso
 * existe este archivo: la raíz se resuelve UNA vez y los tres la comparten.
 */

/**
 * Las anclas, EN CASCADA y no en un selector combinado.
 *
 * Esta distinción costó un barrido entero: `querySelector('a, b')` devuelve el
 * primer elemento en ORDEN DE DOCUMENTO que cumpla cualquiera de los dos, no el
 * primero que cumpla `a`. Al unirlas en una sola cadena, `escala.ts` empezó a
 * escalar un elemento distinto del que venía escalando y aparecieron desbordes
 * de hasta 1.245px en 20 de las 39 planchas. Antes de ese cambio no había
 * ninguno.
 *
 * Probando cada ancla por separado, en orden, el comportamiento viejo queda
 * intacto y la serie t01 sólo AGREGA su caso al final.
 */
/*
 * `.kdx-lam` ES AMBIGUA y por eso va last: en la mayoría de las planchas es la
 * clase del `<body>`, y en la serie t01 es la clase del `<div>` de la plancha.
 * Un `querySelector('.kdx-lam')` devuelve el body —viene antes en el
 * documento— y todo lo que se cuelgue de ahí queda mal anclado: la escala, el
 * tríptico, la capa de vida. Se descubrió midiendo la opacidad de la "plancha"
 * y viendo que era la del body.
 *
 * Los ATRIBUTOS no son ambiguos: `data-lam` y `data-lamina` sólo existen en el
 * div de la plancha. Por eso van primero, y el respaldo por clase además
 * descarta `<body>` y `<html>` explícitamente.
 */
const ANCLAS = ['[data-lam]', '[data-lamina]', '.lam', '.kdx-lam'];

export function raizLamina(): HTMLElement | null {
  for (const a of ANCLAS) {
    for (const el of document.querySelectorAll<HTMLElement>(a)) {
      if (el === document.body || el === document.documentElement) continue;
      return el;
    }
  }
  return null;
}

/**
 * El identificador de la lámina, sin inventarlo: sale del atributo que la
 * propia plancha declara. Si no declara ninguno, devuelve null y quien llama
 * decide — nunca se fabrica un id.
 */
export function idLamina(el?: HTMLElement | null): string | null {
  const r = el ?? raizLamina();
  return r?.getAttribute('data-lam') ?? r?.getAttribute('data-lamina') ?? null;
}

/**
 * Las dos planchas trazadas del creador. Regla suya, explícita: no se tocan sin
 * él. Un organismo de señales encima es un cambio visual sobre una obra
 * protegida, así que la capa de vida se abstiene y lo dice, en vez de decidirlo
 * en silencio. El lector móvil y el escalado SÍ se aplican: no alteran la obra,
 * la hacen legible.
 */
export const TRAZADAS = new Set(['t01-05-specimen-skull', 't01-07-cosmology-core']);
