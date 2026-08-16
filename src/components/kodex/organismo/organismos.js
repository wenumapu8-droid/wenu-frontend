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
 * Los cuatro tienen ciclo; tres respiran de forma visible. Cada uno con el suyo,
 * que sale de lo que el organismo ES y no de un efecto aplicado por igual:
 *
 *   signal-bloom      IDLE → BUILD → BLOOM → DISPERSE, su máquina propia   12,56 %
 *   archive-tree      crece por profundidad: tronco, horcón, copa           10,03 %
 *   ritual-device     se carga, se abre, resuena y se cierra                 4,83 %
 *   threshold-portal  tensión de membrana — real pero sub-perceptible        0,00 %
 *
 * El porcentaje es cambio medido entre cuadros. El del portal es cero y está
 * dicho: su ciclo funciona pero mueve tinta demasiado tenue para verse. El
 * detalle y qué haría falta están anotados en su entrada.
 *
 * Y ninguno de los cuatro cambió su dibujo calibrado. Los ciclos entran por
 * parámetros opcionales cuyo valor por omisión ES el estado de la lámina, así
 * que las páginas que los calibraron siguen puntuando igual. Medido contra los
 * puntajes versionados, no supuesto.
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
    // `false` medido, no asumido. El ciclo existe y funciona: la fase llega y
    // mueve píxeles —94 % a umbral 0, 0,34 % a umbral 0,02— pero NADA a umbral
    // 0,05. La membrana respira por debajo de lo perceptible.
    //
    // La causa está en el organismo, no en el ciclo: los 44 radios de la malla
    // tienen opacidad 0,05–0,16 y grosor 0,5 px sobre fondo oscuro. Moverlos un
    // 14 % radial no alcanza a cambiar ningún píxel de forma visible, y subir
    // más la amplitud tampoco: ya se probó con 2,5×.
    //
    // Hacerlo visible pide respirar el anillo blanco, que SÍ tiene tinta. Eso
    // es geometría calibrada contra el póster y hay que medirlo contra la
    // referencia antes de tocarlo, no ajustarlo a ojo. Queda anotado como el
    // próximo trabajo de este organismo, con su razón.
    vive: false,
    nativo: [738, 597],
    async cargar() {
      return await import("../lamina/t01-01/portal.js");
    },
    pintar(m, ctx, W, H, fase) {
      ctx.clearRect(0, 0, W, H);
      m.pintarPortal(ctx, W, H, fase);
    },
  },

  "archive-tree": {
    titulo: "ARCHIVE TREE",
    nativo: [575, 390],
    vive: true,
    async cargar() {
      return await import("../lamina/t01-04/centro.js");
    },
    pintar(m, ctx, W, H, fase) {
      /* Crece y se queda. La fase sube de 0,12 a 1 durante los primeros dos
         tercios del ciclo y después el árbol permanece completo: una raíz que
         creciera y se deshiciera en bucle sería un efecto, no un organismo. El
         reinicio ocurre al cerrar la fase, y ahí el árbol vuelve a ser semilla. */
      const t = Math.min(1, fase / 0.66);
      m.pintarArbol(ctx, W, H, 0.12 + t * 0.88);
    },
  },

  "ritual-device": {
    titulo: "RITUAL DEVICE",
    nativo: [520, 470],
    vive: true,
    async cargar() {
      return await import("../lamina/t01-06/izq.js");
    },
    pintar(m, ctx, W, H, fase) {
      /* Este organismo ya venía con su ciclo escrito: `pintarDispositivo`
         acepta `{apertura, pulso, tinte}` desde antes. No hubo que agregarle
         nada — y como la lámina lo llama sin opciones, sus valores por omisión
         (0, 0) son justo el estado calibrado. La calibración se protege sola.

         El ciclo es el del artefacto ceremonial: se carga, se abre, resuena y
         vuelve a cerrarse. La apertura sube y baja con una curva suave para que
         el despiece no dé un tirón al cerrar el bucle. */
      ctx.clearRect(0, 0, W, H);
      const abre = (1 - Math.cos(fase * Math.PI * 2)) / 2;
      const pulso = Math.max(0, Math.sin(fase * Math.PI * 6)) * 0.55 * abre;
      m.pintarDispositivo(ctx, 0, 0, W, H, { apertura: abre * 5.5, pulso, tinte: 0.55 });
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
