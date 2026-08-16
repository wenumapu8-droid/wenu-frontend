/**
 * KODEX-∞ · t01-08 SIGNAL BLOOM · generadores de la columna izquierda
 *
 * La lámina entera es UNA forma vista en cuatro momentos: un organismo que
 * ramifica desde un núcleo. IDLE lo muestra como árbol (un tronco y su reflejo
 * de raíces), BLOOM como estrella de doce troncos, DISPERSE como la misma
 * estrella rota en motas. Por eso hay un solo `ramificar()` y no cuatro dibujos:
 * lo que cambia entre estados son parámetros medidos, no geometría distinta.
 *
 * Todo determinista con `rng`: el banco compara píxel a píxel y con azar real
 * dos capturas de la misma página dan puntajes distintos.
 */
import { rng, p2 } from "../kit/rng";

export type Trazo = { d: string; w: number; o: number };
export type Mota = { x: number; y: number; r: number; o: number };

export interface RamaCfg {
  /** troncos que salen del núcleo */
  troncos: number;
  /** ángulo del primer tronco, en grados */
  giro?: number;
  /** longitud del tronco */
  largo: number;
  /** niveles de bifurcación */
  niveles: number;
  /** cuánto se acorta cada nivel */
  merma?: number;
  /** apertura de la bifurcación, en grados */
  abre?: number;
  /** desvío aleatorio por rama, en grados */
  ruido?: number;
  /** grosor del tronco */
  grosor?: number;
  /** opacidad del tronco */
  op?: number;
  /** ramas por bifurcación */
  hijas?: number;
  /** achata el conjunto en vertical */
  achate?: number;
}

/**
 * Ramificación recursiva. Devuelve segmentos rectos y no curvas: en la
 * referencia las ramas son quebradas, y una curva de Bézier las suaviza hasta
 * que el organismo parece un logo.
 */
export function ramificar(cx: number, cy: number, cfg: RamaCfg, semilla: number): Trazo[] {
  const {
    troncos, giro = -90, largo, niveles, merma = 0.72, abre = 26,
    ruido = 14, grosor = 1.1, op = 0.9, hijas = 2, achate = 1,
  } = cfg;
  const r = rng(semilla);
  const out: Trazo[] = [];

  const paso = (x: number, y: number, ang: number, len: number, nivel: number, w: number, o: number) => {
    const a = (ang * Math.PI) / 180;
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len * achate;
    out.push({ d: `M${p2(x)} ${p2(y)}L${p2(x2)} ${p2(y2)}`, w: p2(w), o: p2(o) });
    if (nivel >= niveles) return;
    const n = hijas + (r() < 0.24 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const spread = abre * (i - (n - 1) / 2) * (n > 1 ? 2 / (n - 1) : 0);
      paso(
        x2, y2,
        ang + spread + (r() - 0.5) * ruido,
        len * merma * (0.82 + r() * 0.36),
        nivel + 1,
        Math.max(0.24, w * 0.7),
        o * (0.78 + r() * 0.2),
      );
    }
  };

  for (let i = 0; i < troncos; i++) {
    const ang = giro + (360 / troncos) * i + (r() - 0.5) * ruido * 0.5;
    paso(cx, cy, ang, largo * (0.82 + r() * 0.36), 1, grosor, op);
  }
  return out;
}

/** Motas: el polvo que rodea al organismo y que la referencia tiene en todos los estados. */
export function motas(
  cx: number, cy: number, n: number, rmin: number, rmax: number,
  semilla: number, achate = 1, gamma = 1,
): Mota[] {
  const r = rng(semilla);
  return Array.from({ length: n }, () => {
    const t = Math.pow(r(), gamma);
    const rad = rmin + (rmax - rmin) * t;
    const a = r() * Math.PI * 2;
    return {
      x: p2(cx + Math.cos(a) * rad),
      y: p2(cy + Math.sin(a) * rad * achate),
      r: p2(0.35 + r() * 0.9),
      o: p2(0.2 + r() * 0.75),
    };
  });
}

/**
 * Polvo repartido por TODA la caja, sin centro.
 *
 * Los cuatro recortes de la referencia llegan con materia hasta el filo del
 * marco (luma media 7-12 en los bordes) y las nubes radiales se apagan mucho
 * antes. Sin esta capa plana los recortes quedan con viñeta y el perfil por
 * columnas cae a 2 donde la referencia todavía mide 9.
 */
export function polvo(w: number, h: number, n: number, semilla: number, rmax = 1.1): Mota[] {
  const r = rng(semilla);
  return Array.from({ length: n }, () => ({
    x: p2(r() * w),
    y: p2(r() * h),
    r: p2(0.3 + r() * rmax),
    o: p2(0.12 + Math.pow(r(), 1.3) * 0.7),
  }));
}

/** Anillos en progresión geométrica, con el brillo irregular que pide el kit. */
export function anillos(n: number, rmax: number, razon: number, semilla: number) {
  const r = rng(semilla);
  return Array.from({ length: n }, (_, i) => ({
    r: p2(rmax * Math.pow(razon, i)),
    o: p2(0.14 + r() * 0.5),
    w: p2(0.3 + (r() < 0.24 ? 0.45 : 0)),
  }));
}

/** Tiras horizontales: la materia de PIXEL SORT, GLITCH MODE y la onda rota. */
export type Tira = { x: number; y: number; w: number; h: number; o: number; c?: string };
export function tiras(
  w: number, h: number, n: number, semilla: number,
  opts: { minW?: number; maxW?: number; alto?: number; sesgo?: number; filas?: number; colores?: string[] } = {},
): Tira[] {
  const { minW = 4, maxW = 46, alto = 1.4, sesgo = 0.5, filas = 0, colores } = opts;
  const r = rng(semilla);
  return Array.from({ length: n }, () => {
    const bw = minW + Math.pow(r(), 1.7) * (maxW - minW);
    // Concentradas hacia la banda central: la referencia deja los bordes casi
    // limpios y amontona la rotura en el medio.
    const t = (r() + r() + r()) / 3;
    // Con `filas` las tiras se pegan a un pentagrama de renglones fijos. Sin
    // eso el material se reparte parejo y pierde las franjas negras anchas que
    // son la mitad del carácter del recorte.
    // Mitad de las tiras se reparte plana y mitad se agolpa en el centro: sólo
    // con la triangular el recorte queda con viñeta y los bordes en negro,
    // que es justo lo que la referencia NO tiene.
    const tt = r() < 0.5 ? r() : t;
    const y = filas
      ? (Math.round(tt * (filas - 1)) / (filas - 1)) * (h - 2) + 1
      : (tt * 0.86 + 0.07) * h;
    const x = Math.pow(r(), sesgo < 0.5 ? 1.6 : 1) * (w - bw);
    return {
      x: p2(x), y: p2(y), w: p2(bw),
      h: p2(alto * (0.6 + r() * 1.5)),
      o: p2(0.14 + Math.pow(r(), 1.4) * 0.86),
      c: colores ? colores[(r() * colores.length) | 0] : undefined,
    };
  });
}

/** Serie de amplitudes con envolvente: la onda de WAVEFORM decae hacia la derecha. */
export function envolvente(n: number, semilla: number, picos: number[]): number[] {
  const r = rng(semilla);
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    let env = 0.12;
    for (const p of picos) env += Math.exp(-(((t - p) / 0.055) ** 2)) * 0.9;
    env *= Math.exp(-t * 2.1);
    env += 0.05;
    return Math.min(1, env * (0.35 + r() * 0.9));
  });
}
