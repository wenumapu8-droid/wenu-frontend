/**
 * KODEX-∞ · KDX CORE v1.0
 *
 * El MOTOR CENTRAL COMPARTIDO del plano maestro, tal como lo declara:
 *
 *     WebGL2 / GLSL / Multipass / Audio Reactive / Feedback
 *     Estados: DORMANT → AWARE → ACTIVE → OPEN
 *
 *     ENTRADAS GLOBALES
 *     · Tiempo   · Puntero / Touch   · Audio (Low / Mid / High)
 *     · Estado / Progreso            · Texturas / Máscaras
 *
 * Un solo motor para los ocho organismos y los ocho tratamientos. La razón no
 * es el ahorro de código: es que **un organismo y su tratamiento tienen que
 * compartir tiempo, audio y estado exactos**. Con dos runtimes conviviendo,
 * el dither late medio cuadro después que el mandala y la lámina entera se
 * siente desarmada, sin que se pueda señalar qué está mal.
 *
 * Tres decisiones que vale explicar:
 *
 *  · **El feedback es ping-pong de dos texturas, no una.** Leer y escribir la
 *    misma textura en un mismo pase es comportamiento indefinido; se ve como
 *    parpadeo aleatorio y se diagnostica pésimo. Dos buffers y se alternan.
 *  · **Los pases son `RGBA16F` cuando la GPU lo permite.** La cadena suma luz
 *    (varios tratamientos son ADD/SCREEN) y en 8 bits el blanco se satura al
 *    tercer pase. Si la extensión no está, se cae a 8 bits y se anota — no se
 *    falla en silencio, que es como se pierden las tardes.
 *  · **El estado es una máquina, no un número suelto.** Avanza sola con la
 *    presencia y no retrocede por un cuadro flojo: una escena que oscila entre
 *    AWARE y ACTIVE parpadea y se lee rota.
 */

import { armarPase, fxPorId, type Tratamiento } from "./fx-suite";

/** Los cuatro estados universales del plano. */
export type Estado = "DORMANT" | "AWARE" | "ACTIVE" | "OPEN";
const ORDEN: Estado[] = ["DORMANT", "AWARE", "ACTIVE", "OPEN"];

export type PasoFx = { id: string; mix?: number; params?: Record<string, number> };

export type OpcionesCore = {
  /** El organismo: fragment shader fuente. Recibe las entradas globales. */
  organismo: string;
  /** La cadena de tratamientos, en orden. Vacía = el organismo va crudo. */
  cadena?: PasoFx[];
  /** Semilla del organismo, para que dos instancias no sean idénticas. */
  seed?: number;
  /** Texturas / máscaras: entrada global del plano. */
  texturas?: Record<string, string>;
};

type Bus = { activo: boolean; low: number; mid: number; high: number };

/**
 * Lee el bus de audio del sistema, con la precedencia acordada.
 *
 * El tercer escalón — respiración sintética — no es relleno: un motor que se
 * congela porque el visitante no encendió el audio se lee como roto, no como
 * silencioso.
 */
function leerAudio(t: number): Bus {
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

const VERT = `#version 300 es
precision highp float;
out vec2 v_uv;
const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
void main() {
  vec2 p = P[gl_VertexID];
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

/** Un destino de render: textura + framebuffer. */
type Objetivo = { fb: WebGLFramebuffer; tex: WebGLTexture };

export class KdxCore {
  readonly raiz: HTMLElement;
  private readonly cv: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;

  private progOrganismo: WebGLProgram | null = null;
  private pases: { prog: WebGLProgram; fx: Tratamiento; mix: number }[] = [];

  /** Ping-pong de la cadena. */
  private ping: Objetivo | null = null;
  private pong: Objetivo | null = null;
  /** Historia para MEMORY FEEDBACK: el cuadro anterior, completo. */
  private memoria: Objetivo | null = null;
  private memoriaB: Objetivo | null = null;

  private texturas = new Map<string, WebGLTexture>();
  private raf = 0;
  private t0 = performance.now();
  private reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  private puntero = { x: 0.5, y: 0.5 };
  private estado: Estado = "DORMANT";
  private progreso = 0;
  private presencia = 0;

  private flotante = true;
  private readonly seed: number;

  constructor(raiz: HTMLElement, private readonly opts: OpcionesCore) {
    this.raiz = raiz;
    this.cv = raiz.querySelector("canvas") ?? document.createElement("canvas");
    if (!this.cv.parentElement) raiz.appendChild(this.cv);
    this.seed = opts.seed ?? 1;

    if (!this.iniciar()) return;

    this.medir();
    new ResizeObserver(() => this.medir()).observe(raiz);

    raiz.addEventListener("pointermove", (e) => {
      const r = this.cv.getBoundingClientRect();
      this.puntero = { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
      // Tocar es presencia: el visitante llegó.
      this.presencia = Math.min(1, this.presencia + 0.06);
    });
    raiz.addEventListener("pointerleave", () => { this.puntero = { x: 0.5, y: 0.5 }; });

    new IntersectionObserver((es) => {
      for (const e of es) e.isIntersecting ? this.arrancar() : this.parar();
    }, { rootMargin: "120px" }).observe(raiz);
  }

  /* ── Arranque ────────────────────────────────────────────────────────── */

  private iniciar(): boolean {
    const gl = this.cv.getContext("webgl2", {
      alpha: false, antialias: false, depth: false, powerPreference: "low-power",
    });
    if (!gl) { this.fallo("sin webgl2"); return false; }
    this.gl = gl;

    // Coma flotante en los buffers intermedios. Si no está, se sigue en 8 bits
    // y queda ANOTADO: la cadena satura antes, y saberlo evita perseguir un
    // "se ve lavado" que no está en ningún shader.
    this.flotante = !!gl.getExtension("EXT_color_buffer_float");
    if (!this.flotante) this.raiz.dataset.kdxCoreNota = "sin float buffers · 8 bits";

    this.progOrganismo = this.programa(this.opts.organismo);
    if (!this.progOrganismo) return false;

    for (const paso of this.opts.cadena ?? []) {
      const fx = fxPorId(paso.id);
      if (!fx) { console.warn(`[kdx-core] tratamiento desconocido: ${paso.id}`); continue; }
      const prog = this.programa(armarPase(fx, paso.params));
      if (prog) this.pases.push({ prog, fx, mix: paso.mix ?? 1 });
    }

    for (const [nombre, url] of Object.entries(this.opts.texturas ?? {})) this.cargarTextura(nombre, url);
    return true;
  }

  private fallo(msg: string): void {
    // El motivo va al DOM. Diagnosticar "no se ve nada" a ciegas ya costó
    // demasiadas horas en este proyecto.
    this.raiz.dataset.kdxCoreError = msg.slice(0, 200);
  }

  private programa(fragSrc: string): WebGLProgram | null {
    const gl = this.gl!;
    const compilar = (tipo: number, src: string) => {
      const sh = gl.createShader(tipo)!;
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        this.fallo(gl.getShaderInfoLog(sh) || "shader no compila");
        return null;
      }
      return sh;
    };
    const vs = compilar(gl.VERTEX_SHADER, VERT);
    const fs = compilar(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      this.fallo(gl.getProgramInfoLog(p) || "programa no linkea");
      return null;
    }
    return p;
  }

  private objetivo(w: number, h: number): Objetivo {
    const gl = this.gl!;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    const interno = this.flotante ? gl.RGBA16F : gl.RGBA8;
    const tipo = this.flotante ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, 0, interno, w, h, 0, gl.RGBA, tipo, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fb, tex };
  }

  private medir(): void {
    const gl = this.gl;
    if (!gl) return;
    // DPR tope 1.5: la cadena multipass paga cada píxel varias veces, y el
    // equipo con el que se revisa esto es lento.
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = this.raiz.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (w === this.cv.width && h === this.cv.height) return;
    this.cv.width = w; this.cv.height = h;

    for (const o of [this.ping, this.pong, this.memoria, this.memoriaB]) {
      if (o) { gl.deleteFramebuffer(o.fb); gl.deleteTexture(o.tex); }
    }
    this.ping = this.objetivo(w, h);
    this.pong = this.objetivo(w, h);
    this.memoria = this.objetivo(w, h);
    this.memoriaB = this.objetivo(w, h);
    gl.viewport(0, 0, w, h);
  }

  private cargarTextura(nombre: string, url: string): void {
    const gl = this.gl!;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    this.texturas.set(nombre, tex);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.raiz.dataset.kdxCoreTex = nombre;
    };
    // Una textura que no carga no debe dejar la lámina negra: el organismo
    // sigue con el negro de 1×1 y la escena existe igual.
    img.onerror = () => { this.raiz.dataset.kdxCoreNota = `textura ${nombre} no cargó`; };
    img.src = url;
  }

  /* ── Estado ──────────────────────────────────────────────────────────── */

  /**
   * La máquina universal: DORMANT → AWARE → ACTIVE → OPEN.
   *
   * Avanza con la presencia y **no retrocede**. Una escena que oscila entre
   * dos estados parpadea, y un parpadeo sin causa se lee como falla.
   */
  private avanzarEstado(dt: number): void {
    this.presencia = Math.max(0, this.presencia - dt * 0.12);
    const i = ORDEN.indexOf(this.estado);
    const umbral = [0.02, 0.25, 0.6, 1.01][i];
    if (i < 3 && (this.presencia > umbral || this.progreso > umbral)) {
      this.estado = ORDEN[i + 1];
      this.raiz.dataset.kdxEstado = this.estado;
    }
    this.progreso = Math.min(1, this.progreso + dt * 0.05);
  }

  /** Fuerza un estado. Lo usan las escenas que tienen su propio guion. */
  public irA(e: Estado): void {
    this.estado = e;
    this.raiz.dataset.kdxEstado = e;
  }

  /* ── Loop ────────────────────────────────────────────────────────────── */

  private arrancar(): void { if (!this.raf && this.gl) this.raf = requestAnimationFrame(this.cuadro); }
  private parar(): void { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }

  private uniformesGlobales(prog: WebGLProgram, t: number, a: Bus): void {
    const gl = this.gl!;
    const u = (n: string) => gl.getUniformLocation(prog, n);
    gl.uniform1f(u("u_time"), t);
    gl.uniform2f(u("u_res"), this.cv.width, this.cv.height);
    gl.uniform2f(u("u_pointer"), this.puntero.x, this.puntero.y);
    gl.uniform1f(u("u_low"), a.low);
    gl.uniform1f(u("u_mid"), a.mid);
    gl.uniform1f(u("u_high"), a.high);
    gl.uniform1f(u("u_estado"), ORDEN.indexOf(this.estado));
    gl.uniform1f(u("u_progreso"), this.progreso);
    gl.uniform1f(u("u_reduced"), this.reducido ? 1 : 0);
    gl.uniform1f(u("u_seed"), this.seed);
  }

  private readonly cuadro = (): void => {
    this.raf = 0;
    const gl = this.gl;
    if (!gl || !this.progOrganismo || !this.ping || !this.pong || !this.memoria || !this.memoriaB) return;

    const t = this.reducido ? 4.0 : (performance.now() - this.t0) / 1000;
    const a = leerAudio(t);
    this.avanzarEstado(this.reducido ? 0 : 1 / 60);

    const hayCadena = this.pases.length > 0;

    // ── Pase 0 · el organismo ──────────────────────────────────────────
    gl.bindFramebuffer(gl.FRAMEBUFFER, hayCadena ? this.ping.fb : null);
    gl.viewport(0, 0, this.cv.width, this.cv.height);
    gl.useProgram(this.progOrganismo);
    this.uniformesGlobales(this.progOrganismo, t, a);
    let unidad = 0;
    for (const [nombre, tex] of this.texturas) {
      gl.activeTexture(gl.TEXTURE0 + unidad);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(gl.getUniformLocation(this.progOrganismo, `u_${nombre}`), unidad);
      unidad++;
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // ── Cadena de tratamientos ─────────────────────────────────────────
    let src = this.ping;
    let dst = this.pong;
    for (let i = 0; i < this.pases.length; i++) {
      const { prog, mix } = this.pases[i];
      const ultimo = i === this.pases.length - 1;
      gl.bindFramebuffer(gl.FRAMEBUFFER, ultimo ? null : dst.fb);
      gl.useProgram(prog);
      this.uniformesGlobales(prog, t, a);
      gl.uniform1f(gl.getUniformLocation(prog, "u_mix"), mix);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(gl.getUniformLocation(prog, "u_src"), 0);
      // El cuadro anterior COMPLETO, para MEMORY FEEDBACK. Va en su propia
      // unidad y en su propio par de buffers: mezclarlo con el ping-pong de
      // la cadena haría que el feedback se coma pases intermedios.
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.memoria.tex);
      gl.uniform1i(gl.getUniformLocation(prog, "u_prev"), 1);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!ultimo) { const tmp = src; src = dst; dst = tmp; }
    }

    // ── Memoria: se guarda el resultado para el próximo cuadro ──────────
    // Ping-pong también acá. Leer y escribir la misma textura en un pase es
    // comportamiento indefinido y se ve como parpadeo aleatorio.
    if (hayCadena) {
      const tmp = this.memoria; this.memoria = this.memoriaB; this.memoriaB = tmp;
    }

    if (this.reducido) return;
    this.raf = requestAnimationFrame(this.cuadro);
  };

  public dispose(): void {
    this.parar();
    const gl = this.gl;
    if (!gl) return;
    for (const o of [this.ping, this.pong, this.memoria, this.memoriaB]) {
      if (o) { gl.deleteFramebuffer(o.fb); gl.deleteTexture(o.tex); }
    }
  }
}
