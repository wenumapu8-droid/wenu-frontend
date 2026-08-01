/**
 * KODEX-∞ · SPECIMEN SKULL · CRANIAL SCAN · runtime
 *
 * El hero del capítulo: WebGL2 propio, por la misma razón que en SIGNAL BLOOM
 * — la paleta del plano es exacta (rojo + cyan sobre negro, acento verde) y la
 * etapa GRADE del motor de campos la reescribiría con el acento de la escena.
 *
 * Dos ciclos independientes, que es lo que el plano pide:
 *
 *  · **Tratamientos** (panel 03): X-RAY → LINEWORK → BITMAP → THERMAL →
 *    GLITCH. Re-renderizan EL MISMO cráneo; no son cinco dibujos.
 *  · **Protocolos** (panel 05): SCAN → ISOLATE → REVEAL → GLITCH → ARCHIVE.
 *    Es la interacción del visitante.
 *
 * Son ejes distintos a propósito: se puede mirar el mismo protocolo en cinco
 * tratamientos, y ese cruce es la lectura que el póster propone.
 */

import frag from "../../../kodex/shaders/capitulo/cranial-scan.frag?raw";

type Bus = { activo: boolean; low: number; mid: number; high: number };

export const TRATAMIENTOS = ["X-RAY", "LINEWORK", "BITMAP", "THERMAL", "GLITCH"] as const;
export const PROTOCOLOS = ["SCAN", "ISOLATE", "REVEAL", "GLITCH", "ARCHIVE"] as const;

const VERT = `#version 300 es
precision highp float;
const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main() { gl_Position = vec4(P[gl_VertexID], 0.0, 1.0); }`;

function hexAVec(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Ver la nota de precedencia en bloom-client: misma regla, mismo motivo. */
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

export class CranialScan {
  private readonly cv: HTMLCanvasElement;
  private readonly raiz: HTMLElement;
  private gl: WebGL2RenderingContext | null = null;
  private prog: WebGLProgram | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private raf = 0;
  private t0 = performance.now();
  private reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  private modo = 0;
  private modoVal = 0;
  private proto = 0;
  private protoVal = 0;
  private tModo = performance.now();
  private manual = false;

  private readonly rojo: [number, number, number];
  private readonly cyan: [number, number, number];
  private readonly verde: [number, number, number];

  constructor(raiz: HTMLElement) {
    this.raiz = raiz;
    this.cv = raiz.querySelector("canvas")!;
    this.rojo = hexAVec(raiz.dataset.rojo || "#FF2A2A");
    this.cyan = hexAVec(raiz.dataset.cyan || "#00C5FF");
    this.verde = hexAVec(raiz.dataset.verde || "#7FFF3C");

    if (!this.iniciar()) {
      raiz.dataset.kdxSkullError = "sin webgl2";
      return;
    }

    this.medir();
    new ResizeObserver(() => this.medir()).observe(raiz);

    for (const b of document.querySelectorAll<HTMLButtonElement>("[data-kdx-modo]")) {
      b.addEventListener("click", () => {
        const i = TRATAMIENTOS.indexOf(b.dataset.kdxModo as any);
        if (i < 0) return;
        // Tocar dos veces el activo devuelve el ciclo automático.
        this.manual = !(this.manual && this.modo === i);
        this.modo = i;
        this.tModo = performance.now();
        this.marcar();
      });
    }
    for (const b of document.querySelectorAll<HTMLButtonElement>("[data-kdx-proto]")) {
      b.addEventListener("click", () => {
        const i = PROTOCOLOS.indexOf(b.dataset.kdxProto as any);
        if (i >= 0) { this.proto = i; this.marcar(); }
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
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        // El error va al DOM: diagnosticar "no compila" a ciegas ya costó horas.
        this.raiz.dataset.kdxSkullError = (gl.getShaderInfoLog(sh) || "").slice(0, 180);
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
      this.raiz.dataset.kdxSkullError = (gl.getProgramInfoLog(p) || "").slice(0, 180);
      return false;
    }
    this.prog = p;
    gl.useProgram(p);
    for (const n of ["u_time", "u_res", "u_low", "u_mid", "u_high",
                     "u_modo", "u_proto", "u_reduced", "u_rojo", "u_cyan", "u_verde"]) {
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
    const m = TRATAMIENTOS[this.modo];
    const pr = PROTOCOLOS[this.proto];
    this.raiz.dataset.modo = m;
    this.raiz.dataset.proto = pr;
    for (const b of document.querySelectorAll<HTMLElement>("[data-kdx-modo]")) {
      b.setAttribute("aria-pressed", String(b.dataset.kdxModo === m));
    }
    for (const b of document.querySelectorAll<HTMLElement>("[data-kdx-proto]")) {
      b.setAttribute("aria-pressed", String(b.dataset.kdxProto === pr));
    }
    const rm = document.querySelector<HTMLElement>("[data-kdx-modo-rot]");
    if (rm) rm.textContent = this.manual ? `${m} · FIJO` : m;
    const rp = document.querySelector<HTMLElement>("[data-kdx-proto-rot]");
    if (rp) rp.textContent = pr;
  }

  private arrancar(): void { if (!this.raf) this.raf = requestAnimationFrame(this.cuadro); }
  private parar(): void { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }

  private readonly cuadro = (): void => {
    this.raf = 0;
    const gl = this.gl;
    if (!gl || !this.prog) return;

    const ahora = performance.now();
    const t = this.reducido ? 4.0 : (ahora - this.t0) / 1000;
    const a = audio(t);

    if (!this.manual && !this.reducido && ahora - this.tModo > 4600) {
      this.modo = (this.modo + 1) % TRATAMIENTOS.length;
      this.tModo = ahora;
      this.marcar();
    }

    // Los dos ejes VIAJAN hacia su destino. Saltar delata la máquina; viajar se
    // lee como que el instrumento obedece.
    this.modoVal += (this.modo - this.modoVal) * 0.05;
    this.protoVal += (this.proto - this.protoVal) * 0.05;

    gl.useProgram(this.prog);
    gl.uniform1f(this.u.u_time!, t);
    gl.uniform2f(this.u.u_res!, this.cv.width, this.cv.height);
    gl.uniform1f(this.u.u_low!, a.low);
    gl.uniform1f(this.u.u_mid!, a.mid);
    gl.uniform1f(this.u.u_high!, a.high);
    gl.uniform1f(this.u.u_modo!, this.modoVal);
    gl.uniform1f(this.u.u_proto!, this.protoVal);
    gl.uniform1f(this.u.u_reduced!, this.reducido ? 1 : 0);
    gl.uniform3fv(this.u.u_rojo!, this.rojo);
    gl.uniform3fv(this.u.u_cyan!, this.cyan);
    gl.uniform3fv(this.u.u_verde!, this.verde);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (this.reducido) return;
    this.raf = requestAnimationFrame(this.cuadro);
  };
}

const montar = () => {
  for (const raiz of document.querySelectorAll<HTMLElement>("[data-kdx-skull]")) {
    if ((raiz as any).__kdxSkull) continue;
    (raiz as any).__kdxSkull = new CranialScan(raiz);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else { montar(); }
document.addEventListener("astro:page-load", montar);
