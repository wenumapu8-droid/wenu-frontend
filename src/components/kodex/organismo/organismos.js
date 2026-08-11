/**
 * KODEX-∞ · REGISTRO DE ORGANISMOS
 *
 * Los organismos ya existían: `portal.js`, `centro.js`, `izq.js` y
 * `floracion.js`, extraídos de las láminas que los produjeron. Lo que no
 * existía era una forma de montarlos fuera de su lámina — y por eso las 1.427
 * páginas del corpus no podían tener uno, aunque 118 de ellas **ya nombran** el
 * organismo que les corresponde en su campo `resonancias`.
 *
 * Esto no reescribe ningún organismo. Los adapta: cada uno tiene su propia
 * firma —`(ctx, W, H)`, `(ctx, ox, oy, w, h, opc)`, `(ctx, {cx, cy, R, …})`— y
 * normalizarlas acá es más barato y menos riesgoso que unificarlas allá, donde
 * cada número está calibrado contra una referencia medida.
 *
 * Cada organismo se dibuja a su tamaño nativo y se escala al lienzo. Los
 * tamaños nativos NO son arbitrarios: son las cajas medidas de sus láminas, y
 * cambiarlos rompe la calibración.
 *
 * Honestidad sobre el movimiento: sólo `signal-bloom` tiene máquina de estados
 * propia (IDLE → BUILD → BLOOM → DISPERSE) y por eso es el único que respira de
 * verdad. Los otros tres son pintados estáticos. Montarlos igual da un héroe
 * procedural en vez de un bitmap, que ya es lo que pide el canon, pero decir
 * que «viven» sería mentir. Cuando se les escriba su ciclo, entran acá sin
 * tocar nada más.
 */

export const ORGANISMOS = {
  "signal-bloom": {
    titulo: "SIGNAL BLOOM",
    nativo: [661, 491],
    vive: true,
    async cargar() {
      return await import("../lamina/t01-08/floracion.js");
    },
    pintar(m, ctx, W, H, fase, semilla) {
      // La fase recorre el ciclo del organismo. Los umbrales son suyos, no míos.
      const ciclo = ["IDLE", "BUILD", "BLOOM", "BLOOM", "DISPERSE"];
      const estado = ciclo[Math.floor(fase * ciclo.length) % ciclo.length];
      ctx.clearRect(0, 0, W, H);
      m.pintarFloracion(ctx, {
        cx: W / 2,
        cy: H / 2,
        R: Math.min(W, H) * 0.44,
        semilla,
        detalle: 1,
        estado,
        alfa: 0.37,
      });
    },
  },

  "threshold-portal": {
    titulo: "THRESHOLD PORTAL",
    nativo: [738, 597],
    vive: false,
    async cargar() {
      return await import("../lamina/t01-01/portal.js");
    },
    pintar(m, ctx, W, H) {
      ctx.clearRect(0, 0, W, H);
      m.pintarPortal(ctx, W, H);
    },
  },

  "archive-tree": {
    titulo: "ARCHIVE TREE",
    nativo: [575, 390],
    vive: false,
    async cargar() {
      return await import("../lamina/t01-04/centro.js");
    },
    pintar(m, ctx, W, H) {
      ctx.clearRect(0, 0, W, H);
      m.pintarArbol(ctx, W, H);
    },
  },

  "ritual-device": {
    titulo: "RITUAL DEVICE",
    nativo: [520, 470],
    vive: false,
    async cargar() {
      return await import("../lamina/t01-06/izq.js");
    },
    pintar(m, ctx, W, H) {
      ctx.clearRect(0, 0, W, H);
      m.pintarDispositivo(ctx, 0, 0, W, H);
    },
  },
};

/**
 * Elige el organismo de un volumen a partir de sus `resonancias`.
 *
 * Sin invento: si el volumen no nombra ninguno que exista, devuelve null y la
 * página no monta nada. Un organismo asignado a dedo sería asignar canon, y eso
 * lo decide el creador.
 */
export function organismoDe(resonancias) {
  if (!Array.isArray(resonancias)) return null;
  for (const r of resonancias) {
    if (r in ORGANISMOS) return r;
  }
  return null;
}
