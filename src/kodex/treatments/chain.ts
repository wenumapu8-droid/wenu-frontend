/**
 * KODEX-∞ · CADENA DE TRATAMIENTOS (TANDA 02)
 *
 * El pliego maestro (reference/canon/t00-pliego-maestro.png) dice, literal:
 *
 *   CAPA DE TRATAMIENTO FINAL
 *   Aplicables en cadena o mezcla (Multipass)
 *   Intensidad, Umbral y Modo configurables
 *
 * Eso es lo que este módulo hace y lo que el repo no tenía: los efectos
 * existían disueltos dentro de escenas concretas — el CRT vivía en observe-v2,
 * el dither incrustado en tres shaders distintos — y por lo tanto no se podían
 * aplicar a otro organismo ni encadenar. Aquí son unidades con parámetros.
 *
 * ARQUITECTURA
 *
 *   textura del organismo
 *     → [tratamiento A] → composite(prev, A, modo, intensidad)
 *     → [tratamiento B] → composite(prev, B, modo, intensidad)
 *     → ... → textura final
 *
 * Dos pasadas por tratamiento en vez de una. Es a propósito: OVERLAY y LUMA no
 * se pueden expresar con gl.blendFunc, así que la mezcla va en un shader. El
 * costo es una pasada fullscreen más por eslabón, que a media resolución no se
 * nota, y a cambio los siete modos del pliego funcionan todos igual.
 *
 * NO reemplaza a KodexField. Se monta encima: KodexField dibuja el organismo,
 * esto lo trata.
 */

import tanda02 from "../../../design-system/tanda-02.json";

export type BlendMode = "NORMAL" | "ADD" | "SCREEN" | "OVERLAY" | "MAX" | "LIGHTEN" | "LUMA";

export interface TreatmentLink {
  /** id de design-system/tanda-02.json — p.ej. "crt-scan" */
  id: string;
  /** Sobrescribe los defaults de la referencia. Lo que no venga, sale del JSON. */
  params?: Record<string, number | boolean | string>;
  /** Si no se da, se usa el primer modo declarado en la referencia. */
  blend?: BlendMode;
  /** Mezcla global del eslabón. 1 = tratamiento puro, 0 = pasa de largo. */
  intensity?: number;
}

const VERT = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/**
 * Composite. `u_mode` es un int y no un define para poder cambiar el modo en
 * caliente sin recompilar — el lab necesita eso para que el control responda.
 */
const COMPOSITE = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform sampler2D u_prev;
uniform sampler2D u_next;
uniform int   u_mode;
uniform float u_amount;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

vec3 overlay(vec3 a, vec3 b) {
  return mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, a));
}

void main() {
  vec3 a = texture(u_prev, v_uv).rgb;
  vec3 b = texture(u_next, v_uv).rgb;
  vec3 r;
  if      (u_mode == 1) r = a + b;                              // ADD
  else if (u_mode == 2) r = 1.0 - (1.0 - a) * (1.0 - b);        // SCREEN
  else if (u_mode == 3) r = overlay(a, b);                      // OVERLAY
  else if (u_mode == 4) r = max(a, b);                          // MAX
  else if (u_mode == 5) r = max(a, b);                          // LIGHTEN
  else if (u_mode == 6) r = mix(a, b, luma(b));                 // LUMA
  else                  r = b;                                  // NORMAL
  fragColor = vec4(mix(a, clamp(r, 0.0, 1.0), u_amount), 1.0);
}`;

const MODE_INDEX: Record<BlendMode, number> = {
  NORMAL: 0, ADD: 1, SCREEN: 2, OVERLAY: 3, MAX: 4, LIGHTEN: 5, LUMA: 6,
};

/** Importados con ?raw para que Vite los inline: son 8 y son chicos. */
const SOURCES: Record<string, () => Promise<string>> = {
  "crt-scan":        () => import("./shaders/crt-scan.frag?raw").then((m) => m.default),
  "dither-matrix":   () => import("./shaders/dither-matrix.frag?raw").then((m) => m.default),
  "bitmap-noise":    () => import("./shaders/bitmap-noise.frag?raw").then((m) => m.default),
  "feedback-loop":   () => import("./shaders/feedback-loop.frag?raw").then((m) => m.default),
  "thermal-map":     () => import("./shaders/thermal-map.frag?raw").then((m) => m.default),
  "chromatic-split": () => import("./shaders/chromatic-split.frag?raw").then((m) => m.default),
  "glitch-break":    () => import("./shaders/glitch-break.frag?raw").then((m) => m.default),
  "pixel-sort":      () => import("./shaders/pixel-sort.frag?raw").then((m) => m.default),
};

interface Spec {
  id: string;
  titulo: string;
  modos: BlendMode[];
  parametros: Record<string, { default: number | boolean | string }>;
  alias?: string[];
}

const SPECS = new Map<string, Spec>();
for (const t of (tanda02 as { tratamientos: Spec[] }).tratamientos) {
  SPECS.set(t.id, t);
  for (const a of t.alias ?? []) SPECS.set(a, t);
}

export function listTreatments(): Spec[] {
  return (tanda02 as { tratamientos: Spec[] }).tratamientos;
}

/** Defaults de la referencia, resueltos. Es la fuente de verdad de los números. */
export function defaultsFor(id: string): Record<string, number | boolean | string> {
  const spec = SPECS.get(id);
  if (!spec) throw new Error(`KODEX treatments: tratamiento desconocido "${id}"`);
  const out: Record<string, number | boolean | string> = {};
  for (const [k, v] of Object.entries(spec.parametros)) out[k] = v.default;
  return out;
}

interface Target { fb: WebGLFramebuffer; tex: WebGLTexture }

interface Link {
  id: string;
  program: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation | null>;
  params: Record<string, number | boolean | string>;
  mode: number;
  amount: number;
  /** feedback-loop es el único que lee el cuadro anterior. */
  needsHistory: boolean;
}

export class KodexTreatmentChain {
  private readonly gl: WebGL2RenderingContext;
  private links: Link[] = [];
  private targets: Target[] = [];
  private history: Target | null = null;
  private composite!: WebGLProgram;
  private compositeU = new Map<string, WebGLUniformLocation | null>();
  private vao: WebGLVertexArrayObject | null = null;
  private width = 0;
  private height = 0;
  private disposed = false;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.composite = this.build(COMPOSITE);
    for (const n of ["u_prev", "u_next", "u_mode", "u_amount"]) {
      this.compositeU.set(n, gl.getUniformLocation(this.composite, n));
    }
    this.geometry();
  }

  private compile(type: number, src: string): WebGLShader {
    const { gl } = this;
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error(`KODEX treatments: no compila — ${log}`);
    }
    return sh;
  }

  private build(frag: string): WebGLProgram {
    const { gl } = this;
    const p = gl.createProgram()!;
    gl.attachShader(p, this.compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, this.compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(`KODEX treatments: link falló — ${gl.getProgramInfoLog(p)}`);
    }
    return p;
  }

  private geometry(): void {
    const { gl } = this;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.composite, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  private makeTarget(w: number, h: number): Target {
    const { gl } = this;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { fb, tex };
  }

  resize(w: number, h: number): void {
    if (w === this.width && h === this.height) return;
    const { gl } = this;
    for (const t of this.targets) { gl.deleteFramebuffer(t.fb); gl.deleteTexture(t.tex); }
    if (this.history) { gl.deleteFramebuffer(this.history.fb); gl.deleteTexture(this.history.tex); }
    this.width = w;
    this.height = h;
    this.targets = [this.makeTarget(w, h), this.makeTarget(w, h)];
    this.history = this.makeTarget(w, h);
  }

  /**
   * Define la cadena. Los defaults salen de la referencia; `params` solo
   * sobrescribe lo que se quiera mover. Se compila acá y no en cada cuadro.
   */
  async setChain(chain: TreatmentLink[]): Promise<void> {
    const { gl } = this;
    for (const l of this.links) gl.deleteProgram(l.program);
    this.links = [];

    for (const item of chain) {
      const spec = SPECS.get(item.id);
      if (!spec) throw new Error(`KODEX treatments: tratamiento desconocido "${item.id}"`);
      const load = SOURCES[spec.id];
      if (!load) throw new Error(`KODEX treatments: sin shader para "${spec.id}"`);

      const program = this.build(await load());
      const params = { ...defaultsFor(spec.id), ...(item.params ?? {}) };

      const uniforms = new Map<string, WebGLUniformLocation | null>();
      for (const n of ["u_inputTex", "u_previousFrame", "u_resolution", "u_time", "u_delta"]) {
        uniforms.set(n, gl.getUniformLocation(program, n));
      }
      for (const k of Object.keys(params)) {
        uniforms.set(`u_${k}`, gl.getUniformLocation(program, `u_${k}`));
      }

      const blend = item.blend ?? spec.modos[0] ?? "NORMAL";
      this.links.push({
        id: spec.id,
        program,
        uniforms,
        params,
        mode: MODE_INDEX[blend] ?? 0,
        amount: item.intensity ?? 1,
        needsHistory: uniforms.get("u_previousFrame") !== null,
      });
    }
  }

  private setParams(link: Link, time: number, delta: number): void {
    const { gl } = this;
    const u = (n: string) => link.uniforms.get(n) ?? null;
    gl.uniform2f(u("u_resolution"), this.width, this.height);
    gl.uniform1f(u("u_time"), time);
    gl.uniform1f(u("u_delta"), delta);
    for (const [k, v] of Object.entries(link.params)) {
      const loc = u(`u_${k}`);
      if (!loc) continue;
      if (typeof v === "number") {
        gl.uniform1f(loc, v);
      } else if (typeof v === "boolean") {
        gl.uniform1i(loc, v ? 1 : 0);
      } else {
        // Los enumerados de la referencia llegan como texto ("BAYER_8X8",
        // "HORIZONTAL"). Se traducen al int que el shader espera. Si aparece
        // uno nuevo cae en 0, que siempre es el modo por defecto del póster.
        gl.uniform1i(loc, ENUMS[v] ?? 0);
      }
    }
  }

  /**
   * Corre la cadena sobre `source` y devuelve la textura resultante.
   * Si la cadena está vacía devuelve `source` sin copiarla.
   */
  render(source: WebGLTexture, time: number, delta: number): WebGLTexture {
    if (this.disposed || !this.links.length) return source;
    const { gl } = this;

    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, this.width, this.height);
    gl.disable(gl.BLEND);

    let prev = source;
    let write = 0;

    for (const link of this.links) {
      const treated = this.targets[write];
      const out = this.targets[(write + 1) % 2];

      // 1 · el tratamiento, a su propio destino
      gl.bindFramebuffer(gl.FRAMEBUFFER, treated.fb);
      gl.useProgram(link.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, prev);
      gl.uniform1i(link.uniforms.get("u_inputTex") ?? null, 0);
      if (link.needsHistory && this.history) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.history.tex);
        gl.uniform1i(link.uniforms.get("u_previousFrame") ?? null, 1);
      }
      this.setParams(link, time, delta);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // 2 · la mezcla con lo que venía
      gl.bindFramebuffer(gl.FRAMEBUFFER, out.fb);
      gl.useProgram(this.composite);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, prev);
      gl.uniform1i(this.compositeU.get("u_prev") ?? null, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, treated.tex);
      gl.uniform1i(this.compositeU.get("u_next") ?? null, 1);
      gl.uniform1i(this.compositeU.get("u_mode") ?? null, link.mode);
      gl.uniform1f(this.compositeU.get("u_amount") ?? null, link.amount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      prev = out.tex;
      write = (write + 1) % 2;
    }

    // El historial guarda la SALIDA de la cadena, no la entrada: el eco de
    // feedback-loop tiene que acumular lo ya tratado, o el rastro se ve limpio
    // debajo del resto de los efectos y delata que es una capa aparte.
    if (this.history) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.history.fb);
      gl.useProgram(this.composite);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, prev);
      gl.uniform1i(this.compositeU.get("u_prev") ?? null, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, prev);
      gl.uniform1i(this.compositeU.get("u_next") ?? null, 1);
      gl.uniform1i(this.compositeU.get("u_mode") ?? null, 0);
      gl.uniform1f(this.compositeU.get("u_amount") ?? null, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindVertexArray(null);
    return prev;
  }

  dispose(): void {
    const { gl } = this;
    this.disposed = true;
    for (const l of this.links) gl.deleteProgram(l.program);
    for (const t of this.targets) { gl.deleteFramebuffer(t.fb); gl.deleteTexture(t.tex); }
    if (this.history) { gl.deleteFramebuffer(this.history.fb); gl.deleteTexture(this.history.tex); }
    gl.deleteProgram(this.composite);
    this.links = [];
    this.targets = [];
    this.history = null;
  }
}

/** Enumerados declarados en la referencia → índice que espera el shader. */
const ENUMS: Record<string, number> = {
  BAYER: 0, BAYER_8X8: 0, NOISE: 1, HYBRID: 2,
  HORIZONTAL: 0, VERTICAL: 1,
};
