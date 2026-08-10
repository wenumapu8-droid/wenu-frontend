/**
 * KODEX-∞ · t01-01 · RETÍCULA TIPOGRÁFICA DEL BLOQUE
 *
 * Dos constantes de la mono que resuelva la máquina y una regla de anclaje. No
 * están supuestas: salen de medirlas en el navegador con
 * scripts/lamina/_t0101_probe.mjs, que es lo que evita el error que costó una
 * vuelta entera acá — dar por buena una versal de 0,727 em cuando la fuente da
 * 0,740, y una cima de 0,119 em cuando da 0,190.
 *
 * Por qué el texto va en <text> con textLength y no en <span> con scaleX: a
 * estos cuerpos Chromium redondea el avance de la mono al píxel entero. Medido
 * en el pie, "VISUAL DEVELOPMENT BOARD v1.0" pedía 201 px de tinta y con span
 * daba 214 —siete por ciento largo— porque 6,62 px de avance rasterizan como 7.
 * textLength no depende del avance: fija el ancho total y reparte el sobrante.
 *
 * Medido en la referencia (altura de versal en filas de tinta):
 *
 *   pieza                          versal
 *   título rojo de panel                9
 *   subtítulo gris de panel             8
 *   tabla de metadatos del encabezado   9
 *   etiquetas de los chips              7
 *   hexadecimales de la paleta          8
 *   línea de versión del pie            8
 */

/** Avance de carácter de la mono del sistema, en em. Medido, no supuesto. */
export const AVANCE = 0.60206;
/** Altura de versal de la mono del sistema, en em. Medido, no supuesto. */
export const VERSAL = 0.74;

/** Cuerpo en px que clava una altura de versal medida en px. */
export const cuerpo = (versal: number) => +(versal / VERSAL).toFixed(3);

/**
 * Atributos de un <text> anclado por el primer píxel de tinta y por la cima de
 * su versal, que son las dos cosas que se pueden medir en un PNG.
 *
 * `tinta` es el ancho de tinta medido en la referencia, de primer a último
 * píxel encendido. El avance total pide algo más que eso —el último glifo deja
 * su apoyo derecho fuera de la tinta— y ese "algo más" está calibrado en +1 px
 * salvo donde se midió otro valor. Anclar por el ancho de tinta y no por el
 * avance es lo que permite verificar cada rótulo contra el original con un
 * barrido de columnas.
 */
export function rotulo(x: number, cimaVersal: number, versal: number, avanceTotal: number) {
  return {
    /* 0,9 px es el apoyo izquierdo de una versal de esta mono a estos cuerpos:
       la distancia del borde del avance al primer píxel de tinta. */
    x: +(x - 0.9).toFixed(2),
    y: +(cimaVersal + versal).toFixed(2),
    textLength: +avanceTotal.toFixed(2),
    lengthAdjust: "spacing" as const,
    "font-size": cuerpo(versal),
  };
}
