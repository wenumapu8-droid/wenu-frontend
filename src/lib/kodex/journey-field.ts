/**
 * KODEX−∞ · JOURNEY FIELD MAP · datos y geometría
 *
 * Traduce el Mapa de Flujo (INICIO −∞ → UMBRAL → corrientes → KODEX−∞ →
 * FIN +∞) a corrientes deterministas. Nada de Math.random(): mismo seed,
 * mismo campo, siempre — igual que el kit de lámina, y por la misma razón:
 * sin eso no hay forma de verificar que un cambio visual es un cambio y no
 * ruido.
 *
 * "Cada decisión emite una frecuencia. El KODEX responde. El corazón
 * sincroniza." — eso es literalmente el SignalBus: proximity/dwell suben,
 * el campo responde, no hay estado oculto en el DOM.
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

export interface CorrientePunto {
  x: number;
  y: number;
}

export interface Corriente {
  id: string;
  /** Puntos de control de una curva cúbica, INICIO → FIN. */
  puntos: CorrientePunto[];
  /** 0..1, para variar velocidad/fase de la partícula sin generar más azar en runtime. */
  fase: number;
  /** Glifo opcional a mitad de camino: DESPERTAR, CLARIDAD, INTEGRAR… del Mapa de Flujo. */
  glifo?: string;
  /** Nodo con etiqueta técnica, en 0..1 a lo largo de la curva. */
  nodo?: { t: number; label: string };
}

const GLIFOS = [
  "EXPANSIÓN",
  "EXPERIMENTACIÓN",
  "RESOLUCIÓN",
  "INTEGRACIÓN",
  "CONVERGENCIA",
  "ELEVACIÓN",
  "CLARIDAD",
  "DESPERTAR",
];

const ESTADOS_VIAJE = [
  "CAOS INICIAL",
  "EXPLORACIÓN",
  "CLARIDAD EMERGENTE",
  "UNIFICACIÓN",
  "DESPERTAR",
];

/**
 * Genera N corrientes deterministas para un viewBox dado.
 * INICIO −∞ vive en x≈0.06, FIN +∞ en x≈0.94; el corazón en x≈0.5.
 * Cada corriente serpentea entre esas dos anclas sin cruzar el corazón —
 * lo rodea, porque el corazón es un atractor, no una parada de paso.
 */
export function generarCorrientes(seed: number, cantidad = 13): Corriente[] {
  const rnd = rng(seed);
  const corrientes: Corriente[] = [];

  for (let i = 0; i < cantidad; i++) {
    const carril = i / (cantidad - 1); // 0..1, distribuye las corrientes en altura
    const yBase = 0.14 + carril * 0.72;
    const curvatura = (rnd() - 0.5) * 0.22;
    const ladoCorazon = yBase < 0.5 ? -1 : 1; // arriba o abajo del corazón

    const puntos: CorrientePunto[] = [
      { x: 0.06, y: yBase + (rnd() - 0.5) * 0.04 }, // INICIO −∞
      { x: 0.22, y: yBase + curvatura }, // tras el UMBRAL
      { x: 0.38, y: yBase + curvatura * 0.6 },
      // se aparta del corazón, nunca lo atraviesa
      { x: 0.5, y: yBase + ladoCorazon * (0.06 + rnd() * 0.05) },
      { x: 0.62, y: yBase + curvatura * 0.6 },
      { x: 0.78, y: yBase - curvatura * 0.3 },
      { x: 0.94, y: 0.5 + (yBase - 0.5) * 0.28 }, // converge hacia FIN +∞
    ];

    const corriente: Corriente = {
      id: `corriente-${i.toString().padStart(2, "0")}`,
      puntos,
      fase: rnd(),
    };

    if (rnd() < 0.55) {
      corriente.glifo = GLIFOS[Math.floor(rnd() * GLIFOS.length)];
    }
    if (rnd() < 0.4) {
      corriente.nodo = {
        t: 0.3 + rnd() * 0.4,
        label: ESTADOS_VIAJE[Math.floor(rnd() * ESTADOS_VIAJE.length)],
      };
    }

    corrientes.push(corriente);
  }

  return corrientes;
}

/** Catmull-Rom → cúbicas de Bézier, para que la corriente no tenga vértices. */
export function trazarPath(puntos: CorrientePunto[], w: number, h: number): string {
  const pts = puntos.map((p) => ({ x: p.x * w, y: p.y * h }));
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Punto sobre la curva en t∈0..1, para animar la partícula sin depender del navegador. */
export function puntoEnPath(puntos: CorrientePunto[], t: number): CorrientePunto {
  const n = puntos.length - 1;
  const seg = Math.min(n - 1, Math.floor(t * n));
  const localT = t * n - seg;
  const a = puntos[seg];
  const b = puntos[seg + 1];
  return { x: a.x + (b.x - a.x) * localT, y: a.y + (b.y - a.y) * localT };
}
