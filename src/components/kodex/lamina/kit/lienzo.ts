/**
 * KODEX-∞ · EL LIENZO
 *
 * El ciclo de vida de un canvas de lámina, una sola vez.
 *
 * Por qué existe. Contando funciones repetidas dentro de las láminas aparecen
 * `arrancar` 16 veces, `congelar` 14, `azar` 14, `parar` 12, `tinta` 11,
 * `registrar` 11, `pintarFondo` y `pintarVivo` 10 cada una. No es vocabulario de
 * dibujo: es el MOTOR, reescrito entero en cada lámina. Son unas setenta líneas
 * por lámina y dieciséis láminas — más de mil líneas de lo mismo.
 *
 * Y hay un caso que lo resume: `kit/rng.ts` ya trae `mulberry32`, y quince
 * archivos escriben su propio `azar` con el mismo algoritmo copiado a mano.
 *
 * Lo que esta pieza resuelve, y que cada lámina venía resolviendo por su cuenta:
 *
 *   · bucle por FASE y no por tiempo — `t` creciente produce una costura al dar
 *     la vuelta, y el banco lo mide;
 *   · el CONTRATO DE CONGELADO, que es lo que permite medir una lámina animada:
 *     Playwright con `animations:"disabled"` congela WAAPI pero no un canvas con
 *     rAF, así que hay que exponer un sumidero. Está redeclarado en 22 archivos;
 *   · no dibujar fuera de pantalla ni con la pestaña oculta;
 *   · `prefers-reduced-motion`, que alarga el período en vez de apagar;
 *   · DPR acotado a 2, porque a 3 el coste sube al doble sin que se note.
 *
 * Uso:
 *
 *   import { montarLienzo, contexto } from '../kit/lienzo';
 *
 *   const { g, W, H } = contexto(canvas);
 *   montarLienzo({
 *     raiz,
 *     cuadro: (fase) => pintarVivo(g, fase),
 *     inicial: () => pintarFondo(gFondo),
 *   });
 *
 * `cuadro` recibe la fase en [0,1). Nunca recibe un tiempo absoluto: eso es lo
 * que garantiza que el bucle cierre sin salto.
 */

export type Cuadro = (fase: number) => void;

export interface OpcionesLienzo {
  /** Elemento que se observa para saber si la lámina está en pantalla. */
  raiz: Element;
  /** Se llama en cada cuadro con la fase en [0,1). */
  cuadro: Cuadro;
  /** Se llama una vez antes de arrancar: el fondo, que no se repinta. */
  inicial?: () => void;
  /** Duración del ciclo completo, en ms. */
  periodo?: number;
  /** Duración con `prefers-reduced-motion`. No se apaga: se alarga. */
  periodoReducido?: number;
}

export interface Lienzo {
  arrancar: () => void;
  parar: () => void;
  /** Congela en la fase correspondiente a `t` segundos. Lo usa el banco. */
  congelar: (t?: number) => void;
}

declare global {
  interface Window {
    __kdxRegisterFreeze?: (fn: (t?: number) => void) => void;
    __kdxFreeze?: (t?: number) => void;
    __kdxSumideros?: Array<(t?: number) => void>;
  }
}

/** Contexto 2D con DPR ya aplicado. Devuelve el tamaño en píxeles CSS. */
export function contexto(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth || canvas.width;
  const H = canvas.clientHeight || canvas.height;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const g = canvas.getContext("2d")!;
  g.scale(dpr, dpr);
  return { g, W, H, dpr };
}

/** `rgba()` a partir de un color en la forma "r,g,b" y una opacidad. */
export const tinta = (c: string, a: number) => `rgba(${c},${a})`;

export function montarLienzo({
  raiz,
  cuadro,
  inicial,
  periodo = 12000,
  periodoReducido = 42000,
}: OpcionesLienzo): Lienzo {
  inicial?.();

  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PERIODO = reducido ? periodoReducido : periodo;
  const faseDe = (ms: number) => {
    const f = (ms / PERIODO) % 1;
    return f < 0 ? f + 1 : f;
  };
  cuadro(0);

  let corriendo = 0;
  let detenido = true;
  let congelado = false;
  let visible = false;

  const parar = () => {
    detenido = true;
    if (corriendo) cancelAnimationFrame(corriendo);
    corriendo = 0;
  };

  const arrancar = () => {
    if (corriendo || congelado || !visible || document.hidden) return;
    detenido = false;
    const t0 = performance.now();
    const paso = (ahora: number) => {
      if (detenido) return;
      cuadro(faseDe(ahora - t0));
      corriendo = requestAnimationFrame(paso);
    };
    corriendo = requestAnimationFrame(paso);
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (es) => {
        visible = es.some((e) => e.isIntersecting);
        visible ? arrancar() : parar();
      },
      { threshold: 0 },
    ).observe(raiz);
  } else {
    visible = true;
    arrancar();
  }
  document.addEventListener("visibilitychange", () => {
    document.hidden ? parar() : arrancar();
  });

  /* El contrato de congelado. Cada lienzo deja su sumidero en una bolsa
     compartida y el primero que llega publica el registrador; los que vienen
     después se registran contra él. El reintento por rAF existe porque el orden
     de carga de los módulos de una lámina no está garantizado. */
  const sumidero = (t: number = 0) => {
    congelado = true;
    parar();
    cuadro(faseDe(typeof t === "number" ? t * 1000 : 0));
  };
  const bolsa = (window.__kdxSumideros = window.__kdxSumideros || []);
  bolsa.push(sumidero);
  const propio = (fn: (t?: number) => void) => bolsa.push(fn);
  const congelar = (t: number = 0) => {
    for (const fn of bolsa.slice()) fn(t);
    document.documentElement.dataset.kdxFrozen = "1";
  };
  let intentos = 0;
  const registrar = () => {
    const reg = window.__kdxRegisterFreeze;
    if (typeof reg === "function" && reg !== propio) {
      reg(sumidero);
      return;
    }
    if (typeof reg !== "function") window.__kdxRegisterFreeze = propio;
    if (typeof window.__kdxFreeze !== "function") window.__kdxFreeze = congelar;
    if (intentos++ < 120) requestAnimationFrame(registrar);
  };
  registrar();

  return { arrancar, parar, congelar };
}
