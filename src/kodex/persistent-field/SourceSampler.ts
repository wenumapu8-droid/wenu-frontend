/**
 * KODEX-∞ · MUESTREADOR DE MATERIA AUTORAL
 * P1 del MASTER UNBLOCK MAP (78) · 2026-08-30
 *
 * ────────────────────────────────────────────────────────────────────────
 * LA TESIS
 *
 * "Una obra no debería simplemente aparecer como imagen de fondo.
 *  Debe convertirse en MATERIAL COMPUTACIONAL."
 *
 *   OCÍN ARTWORK
 *        ↓  silueta · simetría · centro · bordes · densidad · dirección
 *        ↓  textura · máscara · profundidad · partículas · vectores
 *   KODEX MORPHOGENESIS
 *
 * La diferencia con poner la obra de fondo es que acá la obra DECIDE cómo
 * se comporta el campo: dónde hay masa, dónde hay borde, hacia dónde fluye.
 * El mismo trazo puede tener genealogía —trazo → filamento → raíz → nervio
 * → red— porque lo que viaja entre escenas no es el pixel: es la estructura
 * que este módulo extrae de él.
 *
 * ────────────────────────────────────────────────────────────────────────
 * POR QUÉ ESTO Y NO UN SHADER NUEVO
 *
 * El master map prohíbe abrir renderers nuevos. Esto no dibuja: MUESTREA.
 * Produce buffers que los renderers existentes consumen como moduladores.
 * Corre una vez por obra, en CPU, sobre un canvas fuera de pantalla.
 *
 * ────────────────────────────────────────────────────────────────────────
 * DERECHOS
 *
 * Solo muestrea obra YA PUBLICADA en el repo (`/kodex-content/obra/**`).
 * El OCÍN_MASTER_ART_REGISTRY declara 0 de 25 aprobadas para uso público:
 * esas NO se tocan acá. Este módulo no publica nada nuevo — lee lo que el
 * sitio ya sirve.
 */

export interface MateriaAutoral {
  /** Ruta de la obra muestreada. Trazabilidad: siempre se sabe de qué es. */
  fuente: string;
  ancho: number;
  alto: number;
  /** Luminancia 0..1 por pixel. Es la MASA: dónde la obra tiene materia. */
  masa: Float32Array;
  /** Magnitud de gradiente 0..1. Son los BORDES: dónde la obra decide. */
  borde: Float32Array;
  /** Dirección del gradiente en radianes. Es el FLUJO: hacia dónde va. */
  flujo: Float32Array;
  /** Centro de masa normalizado 0..1. La obra tiene su propio centro. */
  centro: { x: number; y: number };
  /** Simetría bilateral 0..1 medida, no asumida. */
  simetria: number;
  /** Densidad media: cuánta materia hay en total. */
  densidad: number;
}

/** Resolución del muestreo. Suficiente para modular un campo, barato de sacar. */
const N = 128;

/**
 * Convierte una obra en materia. Idempotente y cacheado por ruta: la misma
 * obra no se vuelve a muestrear aunque la pidan siete escenas.
 */
const cache = new Map<string, Promise<MateriaAutoral>>();

export function muestrear(url: string): Promise<MateriaAutoral> {
  const hit = cache.get(url);
  if (hit) return hit;

  const p = (async (): Promise<MateriaAutoral> => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = url;
    await img.decode();

    const cv = document.createElement('canvas');
    cv.width = N;
    cv.height = N;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('sin contexto 2d para muestrear');
    ctx.drawImage(img, 0, 0, N, N);
    const px = ctx.getImageData(0, 0, N, N).data;

    const masa = new Float32Array(N * N);
    const borde = new Float32Array(N * N);
    const flujo = new Float32Array(N * N);

    /* MASA: luminancia perceptual, no promedio ingenuo. El ojo pesa el
       verde mucho más que el azul; usar el promedio aplanaría justo los
       contrastes que en la obra de Ocín llevan la estructura. */
    let suma = 0;
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      const l = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
      masa[j] = l;
      suma += l;
    }
    const densidad = suma / masa.length;

    /* BORDE y FLUJO: Sobel. El borde dice dónde la obra decide algo; el
       flujo dice hacia dónde. Juntos son el campo vectorial que después
       advecta partículas -- por eso el movimiento hereda la forma en vez
       de ser ruido encima de una imagen. */
    let bmax = 0;
    for (let y = 1; y < N - 1; y++) {
      for (let x = 1; x < N - 1; x++) {
        const i = y * N + x;
        const gx =
          -masa[i - N - 1] - 2 * masa[i - 1] - masa[i + N - 1] +
           masa[i - N + 1] + 2 * masa[i + 1] + masa[i + N + 1];
        const gy =
          -masa[i - N - 1] - 2 * masa[i - N] - masa[i - N + 1] +
           masa[i + N - 1] + 2 * masa[i + N] + masa[i + N + 1];
        const m = Math.hypot(gx, gy);
        borde[i] = m;
        flujo[i] = Math.atan2(gy, gx);
        if (m > bmax) bmax = m;
      }
    }
    if (bmax > 0) for (let i = 0; i < borde.length; i++) borde[i] /= bmax;

    /* CENTRO DE MASA: la obra tiene su propio centro y casi nunca es el
       centro geométrico. Anclar el campo ahí es lo que hace que el
       organismo se sienta parte de la obra y no puesto encima. */
    let sx = 0, sy = 0, sm = 0;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const m = masa[y * N + x];
        sx += x * m; sy += y * m; sm += m;
      }
    }
    const centro = sm > 0
      ? { x: sx / sm / (N - 1), y: sy / sm / (N - 1) }
      : { x: 0.5, y: 0.5 };

    /* SIMETRÍA BILATERAL medida, no asumida. La obra de Ocín suele ser
       especular, pero afirmarlo sin medirlo sería inventar un dato. */
    let dif = 0;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N / 2; x++) {
        dif += Math.abs(masa[y * N + x] - masa[y * N + (N - 1 - x)]);
      }
    }
    const simetria = 1 - Math.min(1, dif / ((N * N) / 2));

    return { fuente: url, ancho: N, alto: N, masa, borde, flujo, centro, simetria, densidad };
  })();

  cache.set(url, p);
  return p;
}

/**
 * La obra que le toca a cada atractor. Solo obra YA publicada en el repo.
 * La asignación definitiva es curaduría del creador; esto es el arranque
 * verificable, no una decisión estética cerrada.
 */
export const OBRA_POR_ATRACTOR: Record<string, string> = {
  THRESHOLD: '/kodex-content/obra/banner.jpg',
  PROLOGUE:  '/kodex-content/obra/fractal.jpg',
  DESCENT:   '/kodex-content/obra/molecular.jpg',
  ARCHIVE:   '/kodex-content/obra/negativo.jpg',
  MACHINE:   '/kodex-content/obra/molecular.jpg',
  COSMOLOGY: '/kodex-content/obra/fractal.jpg',
  RETURN:    '/kodex-content/obra/negativo.jpg',
};
