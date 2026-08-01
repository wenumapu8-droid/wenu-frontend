/**
 * KODEX-∞ · TRANSMISSION FIELD · runtime
 *
 * El hero de SIGNAL BLOOM: un runtime WebGL2 propio, mínimo, para este shader.
 *
 * Por qué no usa el motor de campos del sistema, que ya existe y funciona: ese
 * motor inyecta una etapa GRADE que recolorea la salida con el acento de la
 * escena. Acá **la paleta la manda el plano y es exacta** — #FF00FF, #9000FF,
 * #00C5FF, #FF2A2A —, así que pasarla por el grade sería perderla. Un runtime
 * de cien líneas es más barato que pelearle al que hay.
 *
 * El ciclo de los cuatro estados es la interacción del capítulo. Corre solo en
 * loop, y el visitante puede tomarlo: al elegir un estado a mano el ciclo se
 * detiene ahí hasta que pida volver. Un instrumento que ignora la mano no es
 * un instrumento.
 */

import frag from "../../../kodex/shaders/capitulo/transmission-field.frag?raw";

type Bus = { activo: boolean; low: number; mid: number; high: number };

/** Los cuatro estados con el umbral que declara el panel 06. */
export const ESTADOS_BLOOM = [
  { id: "IDLE",     threshold: 0.80, glitch: 0.0,  dur: 4200 },
  { id: "BUILD",    threshold: 0.55, glitch: 0.0,  dur: 3600 },
  { id: "BLOOM",    threshold: 0.30, glitch: 0.05, dur: 5200 },
  { id: "DISPERSE", threshold: 0.75, glitch: 1.0,  dur: 3000 },
] as const;

const VERT = `#version 300 es
precision highp float;
const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }`;

function hexAVec(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * La energía del campo, con precedencia explícita.
 *
 *  1. `kodexAudio.energy()` — el motor del mundo, que es el que nombra el
 *     plano. Devuelve una energía ya suavizada, no un pico crudo.
 *  2. El bus `__kxAudio` por bandas, cuando corre el otro motor.
 *  3. Respiración sintética.
 *
 * El tercer escalón no es decoración: un campo que se congela porque el
 * visitante no encendió el audio se lee como roto, no como silencioso.
 */
function energia(): number | null {
  const ka = (window as any).__kodexAudio;
  if (ka && typeof ka.energy === "function") {
    const e = ka.energy();
    if (typeof e === "number" && e > 0) return e;
  }
  return null;
}

function audio(t: number): Bus {
  const e = energia();
  if (e !== null) {
    // Una sola energía repartida en tres bandas: el motor del mundo entrega un
    // escalar, y lo honesto es decir que las tres salen de ahí en vez de
    // inventar un espectro que no midió nadie.
    return { activo: true, low: e, mid: e * 0.85, high: e * 0.7 };
  }
  const b = (window as any).__kxAudio as Bus | undefined;
  if (b?.activo) return b;
  return {
    activo: false,
    low: 0.5 + Math.sin(t * 0.7) * 0.3,
    mid: 0.5 + Math.sin(t * 1.3 + 1.7) * 0.25,
    high: 0.5 + Math.sin(t * 2.1 + 3.1) * 0.2,
  };
}

export class TransmissionField {
  private readonly cv: HTMLCanvasElement;
  private readonly raiz: HTMLElement;
  private gl: WebGL2RenderingContext | null = null;
  private prog: WebGLProgram | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private t0 = performance.now();
  private reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Índice del estado actual y avance suavizado hacia él. */
  private idx = 0;
  private val = 0;
  private tCambio = performance.now();
  /** Cuando el visitante elige a mano, el ciclo se detiene. */
  private manual = false;

  private readonly colA: [number, number, number];
  private readonly colB: [number, number, number];
  private readonly colCore: [number, number, number];

  constructor(raiz: HTMLElement) {
    this.raiz = raiz;
    this.cv = raiz.querySelector("canvas")!;
    this.colA = hexAVec(raiz.dataset.colorA || "#9000FF");
    this.colB = hexAVec(raiz.dataset.colorB || "#FF00FF");
    this.colCore = hexAVec(raiz.dataset.colorCore || "#FFFFFF");

    if (!this.iniciar()) {
      // Sin WebGL2 el capítulo no se queda en negro: la clase avisa y el CSS
      // muestra el respaldo. Un hero vacío se lee como roto.
      raiz.dataset.kdxBloomError = "sin webgl2";
      return;
    }

    this.medir();
    new ResizeObserver(() => this.medir()).observe(raiz);

    for (const b of document.querySelectorAll<HTMLButtonElement>("[data-kdx-bloom-estado]")) {
      b.addEventListener("click", () => {
        const i = ESTADOS_BLOOM.findIndex((e) => e.id === b.dataset.kdxBloomEstado);
        if (i < 0) return;
        // Tocar dos veces el estado activo devuelve el ciclo automático.
        this.manual = !(this.manual && this.idx === i);
        this.idx = i;
        this.tCambio = performance.now();
        this.marcar();
      });
    }

    new IntersectionObserver((es) => {
      for (const e of es) e.isIntersecting ? this.arrancar() : this.parar();
    }, { rootMargin: "120px" }).observe(raiz);

    this.marcar();
  }

  private iniciar(): boolean {
    const gl = this.cv.getContext("webgl2", {
      alpha: false, antialias: false, powerPreference: "low-power",
    });
    if (!gl) return false;
    this.gl = gl;

    const compilar = (tipo: number, src: string) => {
      const sh = gl.createShader(tipo)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        // El error se publica en el DOM: "no compila" a ciegas ya costó horas
        // en este proyecto más de una vez.
        this.raiz.dataset.kdxBloomError = (gl.getShaderInfoLog(sh) || "").slice(0, 180);
        return null;
      }
      return sh;
    };

    const vs = compilar(gl.VERTEX_SHADER, VERT);
    const fs = compilar(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return false;

    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      this.raiz.dataset.kdxBloomError = (gl.getProgramInfoLog(p) || "").slice(0, 180);
      return false;
    }
    this.prog = p;
    gl.useProgram(p);

    for (const n of [
      "u_time", "u_res", "u_low", "u_mid", "u_high",
      "u_estado", "u_threshold", "u_glitch", "u_reduced",
      "u_colorA", "u_colorB", "u_colorCore",
    ]) this.u[n] = gl.getUniformLocation(p, n);

    return true;
  }

  private medir(): void {
    // DPR tope 1.5: es un campo de ruido a pantalla completa y el costo sube
    // con el cuadrado. En el equipo lento con el que se revisa esto, 2 se nota.
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = this.raiz.getBoundingClientRect();
    this.cv.width = Math.max(1, Math.round(r.width * dpr));
    this.cv.height = Math.max(1, Math.round(r.height * dpr));
    this.gl?.viewport(0, 0, this.cv.width, this.cv.height);
  }

  private marcar(): void {
    const id = ESTADOS_BLOOM[this.idx].id;
    this.raiz.dataset.estado = id;
    for (const b of document.querySelectorAll<HTMLElement>("[data-kdx-bloom-estado]")) {
      b.setAttribute("aria-pressed", String(b.dataset.kdxBloomEstado === id));
    }
    const rot = document.querySelector<HTMLElement>("[data-kdx-bloom-rot]");
    if (rot) rot.textContent = this.manual ? `${id} · FIJO` : id;
  }

  private arrancar(): void { if (!this.raf) this.raf = requestAnimationFrame(this.cuadro); }
  private parar(): void { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }

  private readonly cuadro = (): void => {
    this.raf = 0;
    const gl = this.gl;
    if (!gl || !this.prog) return;

    const ahora = performance.now();
    const t = this.reducido ? 6.0 : (ahora - this.t0) / 1000;
    const a = audio(t);

    // El ciclo avanza solo, salvo que el visitante lo haya tomado. Con
    // movimiento reducido tampoco cicla: el cambio de estado es movimiento.
    if (!this.manual && !this.reducido) {
      if (ahora - this.tCambio > ESTADOS_BLOOM[this.idx].dur) {
        this.idx = (this.idx + 1) % ESTADOS_BLOOM.length;
        this.tCambio = ahora;
        this.marcar();
      }
    }

    // El estado VIAJA hacia su objetivo. Saltar de 0.80 a 0.30 de un cuadro
    // haría que el mandala aparezca de golpe; la gracia es verlo florecer.
    this.val += (this.idx - this.val) * 0.035;

    // El umbral se interpola entre los dos estados que el viaje está cruzando.
    const i0 = Math.max(0, Math.min(3, Math.floor(this.val)));
    const i1 = Math.max(0, Math.min(3, i0 + 1));
    const f = this.val - i0;
    const th = ESTADOS_BLOOM[i0].threshold * (1 - f) + ESTADOS_BLOOM[i1].threshold * f;
    const gl_ = ESTADOS_BLOOM[i0].glitch * (1 - f) + ESTADOS_BLOOM[i1].glitch * f;

    gl.useProgram(this.prog);
    gl.uniform1f(this.u.u_time!, t);
    gl.uniform2f(this.u.u_res!, this.cv.width, this.cv.height);
    gl.uniform1f(this.u.u_low!, a.low);
    gl.uniform1f(this.u.u_mid!, a.mid);
    gl.uniform1f(this.u.u_high!, a.high);
    gl.uniform1f(this.u.u_estado!, this.val);
    gl.uniform1f(this.u.u_threshold!, th);
    gl.uniform1f(this.u.u_glitch!, gl_);
    gl.uniform1f(this.u.u_reduced!, this.reducido ? 1 : 0);
    gl.uniform3fv(this.u.u_colorA!, this.colA);
    gl.uniform3fv(this.u.u_colorB!, this.colB);
    gl.uniform3fv(this.u.u_colorCore!, this.colCore);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Con movimiento reducido se dibuja UN cuadro y se para: la pieza se ve
    // entera, quieta, y no consume nada.
    if (this.reducido) return;
    this.raf = requestAnimationFrame(this.cuadro);
  };
}

const montar = () => {
  for (const raiz of document.querySelectorAll<HTMLElement>("[data-kdx-bloom]")) {
    if ((raiz as any).__kdxBloom) continue;
    (raiz as any).__kdxBloom = new TransmissionField(raiz);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
