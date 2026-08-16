/**
 * KODEX-∞ · KIT DE LÁMINA · azar determinista
 *
 * Todo el kit dibuja con esto y nunca con Math.random().
 *
 * No es manía: el banco de fotocopia compara la captura contra la referencia
 * píxel a píxel. Con azar real, dos capturas de la misma página dan puntajes
 * distintos y el equipo termina persiguiendo ruido en vez de converger — que es
 * exactamente el fallo que ya costó caro en este proyecto cuando siete capturas
 * del viaje resultaron ser la misma imagen.
 *
 * mulberry32: 32 bits, rápido, buena distribución para lo que hace falta acá
 * (jitter de vértices, densidad de motas, alturas de barra). No es
 * criptográfico y no tiene por qué serlo.
 */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Serie de n valores en [min,max]. El caso más repetido del kit. */
export function serie(seed: number, n: number, min = 0, max = 1): number[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => min + r() * (max - min));
}

/**
 * Serie con memoria: cada valor se apoya en el anterior.
 *
 * Una serie independiente se ve como ruido blanco — dientes parejos, sin forma.
 * Los instrumentos de las referencias tienen deriva: suben, se sostienen, caen.
 * `inercia` 0 es ruido puro; 0.85 es una señal con cuerpo.
 */
export function serieSuave(seed: number, n: number, inercia = 0.75, min = 0, max = 1): number[] {
  const r = rng(seed);
  const out: number[] = [];
  let v = 0.5;
  for (let i = 0; i < n; i++) {
    v = v * inercia + r() * (1 - inercia);
    out.push(min + v * (max - min));
  }
  return out;
}

/** Redondeo a 2 decimales para que el SVG no salga con 14 dígitos por punto. */
export const p2 = (v: number): number => Math.round(v * 100) / 100;
