/**
 * KODEX-∞ · SERIE UNIVERSE · GEOMETRÍA COMPARTIDA
 *
 * Las cinco láminas de la serie (u01, u02, u04, u07, u09) traían copiadas las
 * mismas cuatro o cinco funciones de dibujo, palabra por palabra, en diez
 * archivos. Acá viven una sola vez.
 *
 * Todo es determinista: ni un `Math.random()`. Las tramas de puntos y los
 * glifos de riel son listas explícitas en cada lámina y las estrellas salen de
 * `rayos`, que es una función pura de sus argumentos.
 */

/** Estrella de n rayos desde el centro: el glifo que más se repite en los rieles. */
export const rayos = (cx: number, cy: number, r: number, n: number, fase = 0): string =>
  Array.from({ length: n }, (_, i) => {
    const a = fase + (i * Math.PI * 2) / n;
    return `M${cx} ${cy}L${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join("");

/**
 * Lemniscata de exhibición (curva de Gerono):
 *      x = a·cos t          y = (b/2)·sen 2t
 *
 * Se traza como UNA curva cerrada que se cruza a sí misma en el centro, y va
 * contorneada, no rellena. Dos anillos elípticos con `fill-rule="evenodd"` NO
 * sirven: dan dos circunferencias con una costura vertical en el medio, y el ∞
 * del póster cruza en diagonal, que es lo que una paramétrica sí produce.
 *
 * `a` es el semieje horizontal de la línea media y `b` la altura total de esa
 * misma línea media: al ancho y alto de tinta medidos hay que descontarles el
 * grosor del trazo antes de pasarlos acá.
 */
export const lemniscata = (cx: number, cy: number, a: number, b: number, pasos = 96): string =>
  Array.from({ length: pasos }, (_, i) => {
    const t = (i / pasos) * Math.PI * 2;
    const x = (cx + a * Math.cos(t)).toFixed(2);
    const y = (cy + (b / 2) * Math.sin(2 * t)).toFixed(2);
    return `${i ? "L" : "M"}${x} ${y}`;
  }).join("") + "Z";

/** Rombo hueco por ancho y alto (el de los separadores de la cabecera). */
export const rombo = (cx: number, cy: number, w: number, h: number): string =>
  `M${cx} ${cy - h / 2}L${cx + w / 2} ${cy}L${cx} ${cy + h / 2}L${cx - w / 2} ${cy}Z`;

/** Rombo hueco por semidiagonal (el de los cierres de regla del pie). */
export const romboR = (cx: number, cy: number, r: number): string =>
  `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;

/** Hexágono de punta arriba: 6 vértices desde −90°, uno cada 60°. Devuelve `points`. */
export const hexPuntos = (cx: number, cy: number, R: number): string =>
  Array.from({ length: 6 }, (_, k) => {
    const a = ((-90 + k * 60) * Math.PI) / 180;
    return `${(cx + R * Math.cos(a)).toFixed(2)},${(cy + R * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

/** Cruz de puntería simple: dos trazos que se cortan. */
export const cruz = (cx: number, cy: number, r: number): string =>
  `M${cx} ${cy - r}V${cy + r}M${cx - r} ${cy}H${cx + r}`;

/** Escuadra en L de las esquinas de caja. */
export const esquinaL = (x: number, y: number, sx: number, sy: number, l = 9): string =>
  `M${x + sx * l} ${y}H${x}V${y + sy * l}`;

/**
 * Flecha de doble punta. Las cabezas son dos trazos abiertos, no triángulos
 * rellenos: en la referencia se ven las dos patas por separado.
 */
export const flechaDoble = (x0: number, x1: number, y: number, c = 5.5): string =>
  `M${x0} ${y}H${x1}` +
  `M${x0 + c} ${y - c * 0.62}L${x0} ${y}L${x0 + c} ${y + c * 0.62}` +
  `M${x1 - c} ${y - c * 0.62}L${x1} ${y}L${x1 - c} ${y + c * 0.62}`;

/**
 * Estrella de la marca KODEX (la «rosa» del sello hexagonal), paramétrica.
 *
 * Tres familias, porque en la referencia los ocho brazos NO son iguales — y esa
 * desigualdad es lo que la separa de un asterisco tipográfico:
 *   · las cuatro DIAGONALES son trazo grueso con un cuadradito en la punta;
 *   · el eje VERTICAL va cortado — tramo, hueco, punto, punta;
 *   · el eje HORIZONTAL es más largo y lleva tres travesaños graduados;
 *   · entre medio, ocho pelos cortos a 22,5°.
 */
export interface RosaCfg {
  nucleo: number;
  largoH: number;
  largoV: number;
  largoD: number;
  ejeCorto: number;
  puntaOff: number;
  suelto: number;
  travesanos: [number, number][];
  pelo: [number, number];
  puntaLado: number;
  nucleoR: number;
  sueltoR: number;
}

/** Constantes de u02 / u04 / u07 / u09 — idénticas en los cuatro. */
export const ROSA_STD: RosaCfg = {
  nucleo: 3.4,
  largoH: 19,
  largoV: 17,
  largoD: 16.5,
  ejeCorto: 10.5,
  puntaOff: 1.6,
  suelto: 13.5,
  travesanos: [[7, 3.2], [11.5, 2.6], [15.5, 2]],
  pelo: [4.2, 9.4],
  puntaLado: 2.3,
  nucleoR: 2.6,
  sueltoR: 0.9,
};

/**
 * Constantes de u01. NO son un escalado uniforme de las anteriores —el núcleo
 * sube 0,1 y los travesaños se corren de otra manera— así que van aparte en vez
 * de forzarse a un factor común que no existe.
 */
export const ROSA_U01: RosaCfg = {
  nucleo: 3.5,
  largoH: 20,
  largoV: 18,
  largoD: 17,
  ejeCorto: 11,
  puntaOff: 1.7,
  suelto: 14,
  travesanos: [[7.3, 3.3], [12, 2.7], [16.2, 2.1]],
  pelo: [4.4, 9.8],
  puntaLado: 2.4,
  nucleoR: 2.7,
  sueltoR: 0.95,
};

export interface RosaBrazo {
  eje: boolean;
  horiz: boolean;
  d: string;
  punta: [number, number];
  travesanos: string[];
  suelto: [number, number] | null;
}

export interface Rosa {
  brazos: RosaBrazo[];
  pelos: string[];
  nucleoR: number;
  puntaLado: number;
  sueltoR: number;
}

/**
 * `k` escala la rosa entera (u09 la usa a 0,78 para el sello de la firma).
 * `sueltoR` puede pisarse porque en la referencia el punto suelto del eje
 * vertical no encoge con el resto: mide lo mismo en los dos sellos de u09.
 */
export function rosa(cx: number, cy: number, k = 1, cfg: RosaCfg = ROSA_STD, sueltoR?: number): Rosa {
  const pol = (r: number, a: number): [number, number] => [
    cx + r * Math.cos((a * Math.PI) / 180),
    cy + r * Math.sin((a * Math.PI) / 180),
  ];

  const brazos: RosaBrazo[] = Array.from({ length: 8 }, (_, i) => {
    const a = i * 45;
    const eje = i % 2 === 0;
    const horiz = a === 0 || a === 180;
    const largo = (eje ? (horiz ? cfg.largoH : cfg.largoV) : cfg.largoD) * k;
    const [x1, y1] = pol(cfg.nucleo * k, a);
    const [x2, y2] = pol(eje && !horiz ? cfg.ejeCorto * k : largo, a);
    const [px, py] = pol(largo + cfg.puntaOff * k, a);
    return {
      eje,
      horiz,
      d: `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`,
      punta: [px, py] as [number, number],
      travesanos: horiz
        ? cfg.travesanos.map(([r, h]) => {
            const [tx, ty] = pol(r * k, a);
            return `M${tx.toFixed(2)} ${(ty - h * k).toFixed(2)}L${tx.toFixed(2)} ${(ty + h * k).toFixed(2)}`;
          })
        : [],
      suelto: eje && !horiz ? pol(cfg.suelto * k, a) : null,
    };
  });

  const pelos = Array.from({ length: 8 }, (_, i) => {
    const a = 22.5 + i * 45;
    const [x1, y1] = pol(cfg.pelo[0] * k, a);
    const [x2, y2] = pol(cfg.pelo[1] * k, a);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`;
  });

  return {
    brazos,
    pelos,
    nucleoR: cfg.nucleoR * k,
    puntaLado: cfg.puntaLado * k,
    sueltoR: sueltoR ?? cfg.sueltoR * k,
  };
}
