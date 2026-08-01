/**
 * KODEX-∞ · OBSERVATION EYE · runtime
 *
 * Runtime WebGL2 propio, por el mismo motivo que en los capítulos anteriores:
 * la paleta del plano es exacta y la etapa GRADE del motor de campos la
 * reescribiría con el acento de la escena.
 *
 * Dos cosas que el ojo hace y los otros heroes no:
 *
 *  · **Mira.** El puntero corre la mirada. Es la entidad observadora del
 *    archivo; que siga a quien la mira no es un adorno, es su función.
 *  · **Parpadea.** El panel 02 lo pide con nombre — BLINK, cierre rápido y
 *    glitch al reabrir. Va por reloj y a intervalos irregulares: un parpadeo
 *    metronómico se lee como animación, uno irregular se lee como vivo.
 */

import frag from "../../../kodex/shaders/capitulo/observation-eye.frag?raw";

type Bus = { activo: boolean; low: number; mid: number; high: number };

export const ESTADOS_EYE = ["LOCK", "TRACK", "IDLE"] as const;

const VERT = `#version 300 es
precision highp float;
const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }`;

function hexAVec(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function audio(t: number): Bus {
  const ka = (window as any).__kodexAudio;
  if (ka && typeof ka.energy === "function") {
    const e = ka.energy();
    if (typeof e === "number" && e > 0) return { activo: true, low: e, mid: e * 0.85, high: e * 0.7 };
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

export class ObservationEye {
  private readonly cv: HTMLCanvasElement;
  private readonly raiz: HTMLElement;
  private gl: WebGL2RenderingContext | null = null;
  private prog: WebGLProgram | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private t0 = performance.now();
  private reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  private idx = 0;
  private val = 0;
  private tCambio = performance.now();
  private manual = false;
  private puntero = { x: 0.5, y: 0.5 };

  /** Próximo parpadeo, en segundos desde el arranque. */
  private proxBlink = 2.4;
  private blink = 0;

  private readonly violeta: [number, number, number];
  private readonly cyan: [number, number, number];
  private readonly rojo: [number, number, number];

  constructor(raiz: HTMLElement) {
    this.raiz = raiz;
    this.cv = raiz.querySelector("canvas")!;
    this.violeta = hexAVec(raiz.dataset.violeta || "#A855F7");
    this.cyan = hexAVec(raiz.dataset.cyan || "#22D3EE");
    this.rojo = hexAVec(raiz.dataset.rojo || "#FF2A2A");

    if (!this.iniciar()) { raiz.dataset.kdxOjoError = "sin webgl2"; return; }

    // Enlace profundo: `?estado=TRACK`. Sirve para compartir un estado y para
    // poder fotografiar la escena fuera de su primer segundo de vida — Chrome
    // headless escribe la captura al cargar, no después de esperar.
    const pedido = new URLSearchParams(location.search).get("estado")?.toUpperCase();
    const i = pedido ? (ESTADOS_EYE as readonly string[]).indexOf(pedido) : -1;
    if (i >= 0) { this.idx = i; this.val = i; this.manual = true; }

    this.medir();
    new ResizeObserver(() => this.medir()).observe(raiz);

    raiz.addEventListener("pointermove", (e) => {
      const r = this.cv.getBoundingClientRect();
      this.puntero = { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
    });
    raiz.addEventListener("pointerleave", () => { this.puntero = { x: 0.5, y: 0.5 }; });

    for (const b of document.querySelectorAll<HTMLButtonElement>("[data-kdx-ojo-estado]")) {
      b.addEventListener("click", () => {
        const k = (ESTADOS_EYE as readonly string[]).indexOf(b.dataset.kdxOjoEstado || "");
        if (k < 0) return;
        this.manual = !(this.manual && this.idx === k);
        this.idx = k;
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
    const gl = this.cv.getContext("webgl2", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) return false;
    this.gl = gl;
    const compilar = (tipo: number, src: string) => {
      const sh = gl.createShader(tipo)!;
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        this.raiz.dataset.kdxOjoError = (gl.getShaderInfoLog(sh) || "").slice(0, 180);
        return null;
      }
      return sh;
    };
    const vs = compilar(gl.VERTEX_SHADER, VERT);
    const fs = compilar(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return false;
    const p = gl.createProgram()!;
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      this.raiz.dataset.kdxOjoError = (gl.getProgramInfoLog(p) || "").slice(0, 180);
      return false;
    }
    this.prog = p; gl.useProgram(p);
    for (const n of ["u_time", "u_res", "u_pointer", "u_low", "u_mid", "u_high",
                     "u_estado", "u_blink", "u_reduced", "u_violeta", "u_cyan", "u_rojo"]) {
      this.u[n] = gl.getUniformLocation(p, n);
    }
    return true;
  }

  private medir(): void {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = this.raiz.getBoundingClientRect();
    this.cv.width = Math.max(1, Math.round(r.width * dpr));
    this.cv.height = Math.max(1, Math.round(r.height * dpr));
    this.gl?.viewport(0, 0, this.cv.width, this.cv.height);
  }

  private marcar(): void {
    const id = ESTADOS_EYE[this.idx];
    this.raiz.dataset.estado = id;
    for (const b of document.querySelectorAll<HTMLElement>("[data-kdx-ojo-estado]")) {
      b.setAttribute("aria-pressed", String(b.dataset.kdxOjoEstado === id));
    }
    const rot = document.querySelector<HTMLElement>("[data-kdx-ojo-rot]");
    if (rot) rot.textContent = this.manual ? `${id} · FIJO` : id;
  }

  private arrancar(): void { if (!this.raf) this.raf = requestAnimationFrame(this.cuadro); }
  private parar(): void { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }

  private readonly cuadro = (): void => {
    this.raf = 0;
    const gl = this.gl;
    if (!gl || !this.prog) return;

    const ahora = performance.now();
    const t = this.reducido ? 3.0 : (ahora - this.t0) / 1000;
    const a = audio(t);

    if (!this.manual && !this.reducido && ahora - this.tCambio > 5200) {
      this.idx = (this.idx + 1) % ESTADOS_EYE.length;
      this.tCambio = ahora;
      this.marcar();
    }
    this.val += (this.idx - this.val) * 0.045;

    // BLINK: cierre rápido, apertura un poco más lenta, a intervalos
    // irregulares. Metronómico se leería como animación.
    if (!this.reducido) {
      const d = t - this.proxBlink;
      if (d > 0 && d < 0.22) {
        // Curva del parpadeo: baja y sube dentro de la ventana.
        this.blink = Math.sin((d / 0.22) * Math.PI);
      } else {
        this.blink = 0;
        if (d >= 0.22) this.proxBlink = t + 2.6 + (t * 7919 % 5);
      }
    }

    gl.useProgram(this.prog);
    gl.uniform1f(this.u.u_time!, t);
    gl.uniform2f(this.u.u_res!, this.cv.width, this.cv.height);
    gl.uniform2f(this.u.u_pointer!, this.puntero.x, this.puntero.y);
    gl.uniform1f(this.u.u_low!, a.low);
    gl.uniform1f(this.u.u_mid!, a.mid);
    gl.uniform1f(this.u.u_high!, a.high);
    gl.uniform1f(this.u.u_estado!, this.val);
    gl.uniform1f(this.u.u_blink!, this.blink);
    gl.uniform1f(this.u.u_reduced!, this.reducido ? 1 : 0);
    gl.uniform3fv(this.u.u_violeta!, this.violeta);
    gl.uniform3fv(this.u.u_cyan!, this.cyan);
    gl.uniform3fv(this.u.u_rojo!, this.rojo);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (this.reducido) return;
    this.raf = requestAnimationFrame(this.cuadro);
  };
}

const montar = () => {
  for (const raiz of document.querySelectorAll<HTMLElement>("[data-kdx-ojo]")) {
    if ((raiz as any).__kdxOjo) continue;
    (raiz as any).__kdxOjo = new ObservationEye(raiz);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else { montar(); }
document.addEventListener("astro:page-load", montar);
