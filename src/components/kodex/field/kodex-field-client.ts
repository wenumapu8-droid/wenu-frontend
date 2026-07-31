/**
 * KODEX-∞ · FIELD
 *
 * Monta los shaders del Open Visual Lab y los presets de KodeLife como campo
 * vivo detrás de cada lámina: el portal de THRESHOLD, la estructura imposible
 * de DESCENT, la órbita de ARCHIVE.
 *
 * Tres cosas que este runtime resuelve y que no son obvias:
 *
 * 1. Los presets de KodeLife vienen en `#version 330 core` — OpenGL de
 *    escritorio. WebGL2 exige `#version 300 es` y una declaración de precisión.
 *    Se traducen al vuelo en vez de mantener dos copias de cada shader que
 *    después divergen.
 *
 * 2. Varios usan `u_previousFrame` para el feedback temporal, que es lo que
 *    hace que los rastros se acumulen. Eso exige dos framebuffers alternados:
 *    leer del anterior mientras se escribe en el otro. Sin esto el shader
 *    compila pero el efecto no aparece nunca.
 *
 * 3. Los uniforms difieren entre familias (u_audio vec3 contra
 *    u_audioLow/Mid/High). Se envían todos; `getUniformLocation` devuelve null
 *    para los que el shader no declara y asignar sobre null es un no-op seguro.
 */

import { perfilKodex } from "../../../lib/kodex/perf";
import { estadoEscena, montarEstadoEscena } from "../../../lib/kodex/estado";

const VERT = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/**
 * Etapa de grado que se le añade a todo preset.
 *
 * Los presets vienen de KodeLife y traen su propia paleta: el ácido sale verde
 * azulado, el corredor sale blanco de estudio. Puestos crudos detrás de una
 * lámina, cada uno arrastra la página a su color y el KODEX deja de ser un
 * sistema para volverse una galería de fondos ajenos.
 *
 * Aquí el preset deja de decidir el color: aporta la estructura -- dónde hay
 * luz, cómo se mueve -- y esa luminancia se remapea sobre la rampa de la
 * lámina (negro, acento, blanco en los altos). Es el mismo criterio del
 * artefacto, que lee la obra y la reescribe en la trama.
 *
 * Además unifica el brillo. Cada preset trataba u_intensity a su manera:
 * liquid-acid lo multiplica al final, impossible-structure lo declara y nunca
 * lo usa -- por eso el corredor salía a brillo completo por más que se bajara
 * el prop. Ahora u_intensity va en 1.0 para todos y el brillo lo fija esta
 * etapa, que es el único lugar donde se controla.
 */
const GRADE = `
uniform float u_kdxGain;
uniform float u_kdxGrade;
uniform float u_kdxFloor;
uniform float u_kdxDetail;
uniform float u_kdxTime;
uniform vec3  u_kdxTint;
uniform vec3  u_kdxSpark;
uniform vec2  u_kdxRes;

void kdxFieldSource();

float kdxHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  kdxFieldSource();
  vec3 src = fragColor.rgb;
  float l = dot(src, vec3(0.2126, 0.7152, 0.0722));

  // Piso de luminancia. No todos los presets se parecen: el portal y el
  // fractal son casi todo negro con estructura brillante, mientras el ácido
  // llena el cuadro entero a media luz. Bajar la ganancia al ácido lo apaga
  // sin devolverle el negro; hundir el piso sí: lo medio se va a cero y sólo
  // queda el nervio del patrón, que es lo que se puede tener detrás de texto.
  float lRaw = l;
  l = smoothstep(u_kdxFloor, 1.0, l);
  // El resto del preset que sobrevive al grado se hunde igual, o el color
  // original vuelve a subir el brillo por el costado.
  src *= l / max(lRaw, 0.001);

  // HEBRA. En la referencia -- el vortice de Motherboard -- no hay manchas:
  // hay filamentos finos. Una curva de potencia hunde los medios y deja subir
  // solo lo que ya era cresta, asi que la misma estructura del preset se lee
  // como hebra en vez de como nube. Es la diferencia entre un degradado con
  // color y algo que parece dibujado con luz.
  l = pow(l, mix(1.0, 2.6, u_kdxDetail));
  // La curva se lleva la mayor parte de la energia: sin devolverla, afinar la
  // hebra equivale a apagar el campo. Se compensa aqui y no subiendo la
  // ganancia de la lamina, que tambien levantaria el fondo que se acaba de
  // hundir.
  l = min(1.0, l * mix(1.0, 2.6, u_kdxDetail));

  // Rampa de la lámina: el acento toma el cuerpo medio y sólo los altos llegan
  // a blanco, que es lo que mantiene el campo por debajo del texto.
  vec3 ramp = u_kdxTint * smoothstep(0.02, 0.62, l);
  // Segundo tono en las crestas. La referencia no es monocroma: sobre el azul
  // hay puntos cian, ambar y blancos, y ese chispeo es lo que la hace leer
  // como holograma y no como filtro de color. El acento sigue mandando en el
  // cuerpo; el segundo tono aparece solo donde ya habia brillo.
  ramp = mix(ramp, u_kdxSpark, smoothstep(0.52, 0.94, l) * u_kdxDetail * 0.8);
  // El blanco entra tarde y a propósito. Con un umbral más bajo el núcleo del
  // portal se abría en un velo pálido sobre el artefacto y apagaba la trama:
  // aquí sólo el filamento más caliente llega a blanco.
  ramp += vec3(smoothstep(0.86, 1.0, l)) * 0.7;
  vec3 color = mix(src, ramp, u_kdxGrade);

  // NODOS. La referencia esta sembrada de puntos que titilan sobre las hebras,
  // como una red vista de lejos. Se siembran en una grilla fija -- no por
  // pixel, o serian ruido -- y solo prenden donde la hebra ya pasa: un punto
  // en el vacio no seria un nodo, seria suciedad.
  vec2 cell = floor(gl_FragCoord.xy / 7.0);
  float seed = kdxHash(cell);
  // Cada nodo late a su propio ritmo y con su propia fase.
  float beat = 0.5 + 0.5 * sin(u_kdxTime * (0.6 + seed * 2.4) + seed * 31.4);
  float node = step(0.968, seed + beat * 0.05) * smoothstep(0.22, 0.6, l);
  color += mix(u_kdxSpark, vec3(1.0), 0.45) * node * beat * u_kdxDetail * 1.5;

  // Viñeta: el campo se apaga hacia los bordes, donde viven los paneles de
  // datos y la navegación. Sin esto el fondo compite justo donde hay que leer.
  vec2 p = gl_FragCoord.xy / u_kdxRes - 0.5;
  float vig = 1.0 - smoothstep(0.30, 0.86, length(p * vec2(1.0, 1.25)));

  fragColor = vec4(color * u_kdxGain * mix(0.28, 1.0, vig), 1.0);
}
`;

/** Traduce un preset de escritorio a WebGL2 y le injerta el grado de la lámina. */
const toWebGL2 = (src: string): string => {
  let out = src.replace(/^#version\s+\d+\s+\w+\s*$/m, "#version 300 es");
  if (!/^#version/m.test(out)) out = `#version 300 es\n${out}`;
  if (!/precision\s+\w+\s+float/.test(out)) {
    out = out.replace(/(#version[^\n]*\n)/, "$1precision highp float;\nprecision highp int;\n");
  }
  // El main del preset pasa a ser una etapa interna: sigue escribiendo en
  // fragColor, pero ahora el último en escribir es el grado.
  out = out.replace(/\bvoid\s+main\s*\(\s*(void)?\s*\)/, "void kdxFieldSource()");
  return `${out}\n${GRADE}`;
};

type FieldOptions = {
  intensity: number;
  feedback: number;
  speed: number;
  seed: number;
  /** Cuánto se fuerza la paleta de la lámina. En 0 el preset conserva su color. */
  grade: number;
  /** Luminancia por debajo de la cual el campo se va a negro. */
  floor: number;
  /** Cuánta hebra y cuántos nodos. En 0 el campo vuelve a ser suave. */
  detail: number;
};

/** #rrggbb a rgb lineal-ish. Basta para teñir: no hay que ser colorimétrico. */
const parseTint = (hex: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [1, 0.23, 0.19];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

class KodexField {
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();
  private readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private readonly options: FieldOptions;
  private readonly tint: [number, number, number];
  private readonly spark: [number, number, number];
  private readonly pointer = { x: 0.5, y: 0.5 };
  /** Velocidad del puntero, suavizada. Un salto crudo se lee como glitch. */
  private readonly pointerVel = { x: 0, y: 0 };
  private pointerPrev = { x: 0.5, y: 0.5 };

  /** Par de framebuffers para el feedback: se escribe en uno y se lee del otro. */
  private targets: Array<{ fb: WebGLFramebuffer; tex: WebGLTexture }> = [];
  private current = 0;
  private start = performance.now();
  private last = this.start;
  private raf = 0;
  private visible = true;
  private disposed = false;

  constructor(root: HTMLElement, fragSource: string) {
    this.root = root;
    const canvas = root.querySelector<HTMLCanvasElement>("[data-kdx-field-canvas]");
    if (!canvas) throw new Error("KODEX field: falta el canvas.");
    this.canvas = canvas;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("KODEX field: WebGL2 no disponible.");
    this.gl = gl;

    this.options = {
      intensity: Number(root.dataset.intensity ?? 0.55),
      feedback: Number(root.dataset.feedback ?? 0.35),
      speed: Number(root.dataset.speed ?? 1),
      seed: Number(root.dataset.seed ?? 1),
      grade: Number(root.dataset.grade ?? 0.82),
      floor: Number(root.dataset.floor ?? 0.16),
      detail: Number(root.dataset.detail ?? 0.75),
    };
    this.tint = parseTint(root.dataset.tint ?? "#ff3b30");
    // Segundo tono de las crestas. Por defecto un cian frio, que es el que
    // hace el contraste en la referencia contra el cuerpo calido.
    this.spark = parseTint(root.dataset.spark ?? "#7fe9ff");

    this.program = this.build(VERT, toWebGL2(fragSource));
    this.geometry();
    this.cacheUniforms();
    this.resize();
    this.bind();
    this.root.dataset.kdxFieldState = "ready";
    this.loop();
  }

  private compile(type: number, src: string): WebGLShader {
    const { gl } = this;
    const sh = gl.createShader(type);
    if (!sh) throw new Error("KODEX field: no se pudo crear el shader.");
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error(`KODEX field: no compila — ${log}`);
    }
    return sh;
  }

  private build(vs: string, fs: string): WebGLProgram {
    const { gl } = this;
    const p = gl.createProgram();
    if (!p) throw new Error("KODEX field: no se pudo crear el programa.");
    gl.attachShader(p, this.compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, this.compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(`KODEX field: link falló — ${gl.getProgramInfoLog(p)}`);
    }
    return p;
  }

  private geometry(): void {
    const { gl, program } = this;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  private cacheUniforms(): void {
    // Se piden todos los de ambas familias; los que el shader no declara
    // devuelven null y asignarlos no hace nada.
    const names = [
      "u_time", "u_delta", "u_resolution", "u_pointer", "u_seed",
      "u_feedback", "u_intensity", "u_previousFrame",
      "u_audio", "u_audioLow", "u_audioMid", "u_audioHigh",
      "u_kdxGain", "u_kdxGrade", "u_kdxFloor", "u_kdxDetail", "u_kdxTime",
      "u_kdxTint", "u_kdxSpark", "u_kdxRes",
      // Uniforms estandar de la Receta Madre §7. Se envian aunque el shader
      // actual no los declare: getUniformLocation devuelve null y asignar
      // sobre null es un no-op. El punto es que cualquier shader del lab entre
      // sin adaptaciones, que es lo que hace que "una gramatica, siete
      // productos" sea operable y no una intencion.
      "u_pointerVelocity", "u_scrollProgress", "u_sceneProgress",
      "u_transition", "u_state", "u_devicePixelRatio", "u_reducedMotion",
    ];
    for (const n of names) {
      this.uniforms.set(n, this.gl.getUniformLocation(this.program, n));
    }
  }

  /** Crea (o recrea) el par de destinos de render al tamaño actual. */
  private makeTargets(w: number, h: number): void {
    const { gl } = this;
    for (const t of this.targets) {
      gl.deleteFramebuffer(t.fb);
      gl.deleteTexture(t.tex);
    }
    this.targets = [];
    for (let i = 0; i < 2; i++) {
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
      this.targets.push({ fb, tex });
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private resize(): void {
    const { canvas, gl } = this;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // El campo es atmósfera: se renderiza a media resolución y se deja que el
    // navegador lo escale. Cuesta la mitad y no se nota en un fondo difuso.
    // La escala la fija el perfil de rendimiento: en un equipo lento el costo
    // esta en la cantidad de pixeles, no en la logica del shader. Bajar
    // resolucion conserva la composicion entera, que es lo que la receta madre
    // pide no sacrificar nunca.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6 * perfilKodex().escala;
    const w = Math.max(2, Math.round(rect.width * dpr));
    const h = Math.max(2, Math.round(rect.height * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    this.makeTargets(w, h);
  }

  private bind(): void {
    new ResizeObserver(() => this.resize()).observe(this.canvas);

    new IntersectionObserver((entries) => {
      for (const e of entries) {
        this.visible = e.isIntersecting;
        if (this.visible && !this.raf) this.loop();
        else if (!this.visible && this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
      }
    }, { threshold: 0.01 }).observe(this.root);

    if (!this.reducedMotion) {
      this.root.addEventListener("pointermove", (ev) => {
        const r = this.canvas.getBoundingClientRect();
        this.pointer.x = (ev.clientX - r.left) / r.width;
        this.pointer.y = 1 - (ev.clientY - r.top) / r.height;
      }, { passive: true });
    }
  }

  private readonly loop = (): void => {
    this.raf = 0;
    if (this.disposed) return;
    this.draw();
    // Con reduced-motion se dibuja un solo cuadro y se deja quieto: estos
    // campos son movimiento puro, y dejarlos corriendo sería ignorar la
    // preferencia por completo.
    if (this.reducedMotion) return;
    if (this.visible) this.raf = requestAnimationFrame(this.loop);
  };

  private draw(): void {
    const { gl, program, canvas } = this;
    if (this.targets.length < 2) return;

    const now = performance.now();
    const time = ((now - this.start) / 1000) * this.options.speed;
    const delta = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;

    const read = this.targets[this.current];
    const write = this.targets[1 - this.current];

    gl.useProgram(program);
    const u = (n: string) => this.uniforms.get(n) ?? null;

    gl.uniform1f(u("u_time"), time);
    gl.uniform1f(u("u_delta"), delta);
    gl.uniform2f(u("u_resolution"), canvas.width, canvas.height);
    gl.uniform2f(u("u_pointer"), this.pointer.x, this.pointer.y);

    // §7 · el resto de los uniforms estandar.
    const vx = this.pointer.x - this.pointerPrev.x;
    const vy = this.pointer.y - this.pointerPrev.y;
    // Media movil: la velocidad instantanea salta y produce tirones; suavizada
    // se lee como inercia, que es lo que un instrumento tiene.
    this.pointerVel.x += (vx - this.pointerVel.x) * 0.18;
    this.pointerVel.y += (vy - this.pointerVel.y) * 0.18;
    this.pointerPrev = { x: this.pointer.x, y: this.pointer.y };
    gl.uniform2f(u("u_pointerVelocity"), this.pointerVel.x, this.pointerVel.y);

    const alto = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    gl.uniform1f(u("u_scrollProgress"), Math.min(1, scrollY / alto));

    const est = estadoEscena();
    gl.uniform1f(u("u_sceneProgress"), est.intensidad);
    gl.uniform1f(u("u_state"), est.intensidad);
    gl.uniform1f(u("u_transition"), est.actual === "transitionOut" ? 1 : 0);
    gl.uniform1f(u("u_devicePixelRatio"), devicePixelRatio || 1);
    gl.uniform1f(u("u_reducedMotion"), this.reducedMotion ? 1 : 0);
    gl.uniform1f(u("u_seed"), this.options.seed);
    // Sin la pasada al framebuffer el "cuadro previo" queda congelado. Si la
    // mezcla siguiera encendida, el shader mancharia contra una imagen vieja
    // que ya nadie actualiza -- peor que no tener rastro.
    gl.uniform1f(u("u_feedback"), perfilKodex().feedback ? this.options.feedback : 0);
    // El preset ve intensidad plena: el brillo lo fija la etapa de grado, que
    // es la única que lo aplica igual para todos.
    gl.uniform1f(u("u_intensity"), 1);
    // AUDIO. Cuando el visitante prende el sonido, estas tres bandas son
    // reales: el KODEX sintetiza su propia musica por escena -- ambient en el
    // umbral, dark psy en el descenso, techno en la maquina -- y el motor
    // analiza su propio bus de salida y publica graves, medios y agudos.
    //
    // Es la misma division de tres bandas del espectro de KodeLife, que es
    // contra lo que estos shaders estan escritos. Con el sonido encendido, la
    // imagen y la musica dejan de ser dos cosas que ocurren a la vez y pasan a
    // ser la misma senal mirada de dos maneras.
    //
    // Sin sonido se cae a una envolvente sintetica lenta. Es respaldo, no
    // simulacion: el campo tiene que seguir vivo para quien no prende el audio,
    // pero no se hace pasar por un analisis que no existe.
    const bus = (window as unknown as { __kxAudio?: { activo: boolean; low: number; mid: number; high: number } }).__kxAudio;
    const vivo = bus?.activo === true;
    const low = vivo ? bus!.low : 0.5 + Math.sin(time * 0.7) * 0.3;
    const mid = vivo ? bus!.mid : 0.5 + Math.sin(time * 1.3 + 1.7) * 0.25;
    const high = vivo ? bus!.high : 0.5 + Math.sin(time * 2.1 + 3.1) * 0.2;
    gl.uniform3f(u("u_audio"), low, mid, high);
    gl.uniform1f(u("u_audioLow"), low);
    gl.uniform1f(u("u_audioMid"), mid);
    gl.uniform1f(u("u_audioHigh"), high);

    // MOTION_11_AUDIO_PRESSURE de la gramatica: "low_pressure, mid_distortion,
    // high_spark". Los graves empujan el brillo de toda la red y los agudos
    // encienden los nodos. Con el sonido apagado el multiplicador queda en 1 y
    // el campo se comporta como antes.
    const presion = vivo ? 0.82 + low * 0.55 : 1.0;
    // Los agudos casi no existen hasta que se enciende el SIGNAL: cada escena
    // suena a traves de un filtro pasabajos y el SIGNAL es el que lo abre --
    // MACHINE pasa de 1300 Hz a mas de 3000. Por eso la base es casi neutra y
    // lo que sube es la respuesta: encender el SIGNAL abre la luz en el sonido
    // y, por el mismo camino, enciende los nodos de la red. Una sola palanca
    // para las dos cosas, que es lo que el KODEX viene diciendo.
    const chispa = vivo ? 0.92 + high * 1.6 : 1.0;
    // El estado de la escena entra como presencia del campo: latente cuando
    // nadie llego, pleno cuando la escena esta activa. Es la misma curva que
    // abre el portal y el sonido.
    const presencia = 0.55 + estadoEscena().intensidad * 0.45;
    gl.uniform1f(u("u_kdxGain"), this.options.intensity * presion * presencia);
    gl.uniform1f(u("u_kdxGrade"), this.options.grade);
    gl.uniform1f(u("u_kdxFloor"), this.options.floor);
    gl.uniform1f(u("u_kdxDetail"), (this.reducedMotion ? this.options.detail * 0.5 : this.options.detail) * chispa);
    // Con prefers-reduced-motion los nodos dejan de latir: quedan sembrados,
    // que sigue diciendo lo mismo sin parpadear.
    gl.uniform1f(u("u_kdxTime"), this.reducedMotion ? 0.0 : time);
    gl.uniform3f(u("u_kdxSpark"), this.spark[0], this.spark[1], this.spark[2]);
    gl.uniform3f(u("u_kdxTint"), this.tint[0], this.tint[1], this.tint[2]);
    gl.uniform2f(u("u_kdxRes"), canvas.width, canvas.height);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, read.tex);
    gl.uniform1i(u("u_previousFrame"), 0);

    // Pasada 1: al framebuffer, para que quede disponible como cuadro previo.
    // En LOW-POWER se salta: el rastro temporal cuesta una pasada completa mas
    // dos texturas, y es lo primero que sobra cuando el equipo no da.
    const conRastro = perfilKodex().feedback;
    if (conRastro) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, write.fb);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    // Pasada a pantalla.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.current = 1 - this.current;
  }

  public debug(): Record<string, unknown> {
    return {
      estado: this.root.dataset.kdxFieldState,
      shader: this.root.dataset.field,
      canvas: [this.canvas.width, this.canvas.height],
      loop: this.raf !== 0,
      visible: this.visible,
      reducedMotion: this.reducedMotion,
    };
  }
}

// Los shaders se importan crudos para que Vite los inline: son pocos y chicos,
// y así no hay una petición de red por lámina.
const SHADERS: Record<string, () => Promise<string>> = {
  // Tanda 3 del motor visual: la DISTORSION ESPACIAL. Ocin la llama "la pieza
  // que faltaba" -- no es el estilo, es la logica espacial. Sus uniforms son
  // los estandar del §7, asi que entran a este runtime sin adaptaciones, que
  // era exactamente el punto de haberlos implementado.
  "wrinkled-reality": () => import("../../../kodex/shaders/lab/wrinkled-reality.frag?raw").then((m) => m.default),
  "ripple-floor": () => import("../../../kodex/shaders/lab/ripple-floor.frag?raw").then((m) => m.default),
  "network-vortex": () => import("../../../kodex/shaders/lab/network-vortex.frag?raw").then((m) => m.default),
  "threshold-portal": () => import("../../../kodex/shaders/lab/threshold-portal.frag?raw").then((m) => m.default),
  "archive-orbit": () => import("../../../kodex/shaders/lab/archive-orbit.frag?raw").then((m) => m.default),
  "liquid-acid": () => import("../../../kodex/shaders/lab/liquid-acid.frag?raw").then((m) => m.default),
  "signal-bloom": () => import("../../../kodex/shaders/lab/signal-bloom.frag?raw").then((m) => m.default),
  "mandelbrot-field": () => import("../../../kodex/shaders/lab/mandelbrot-field.frag?raw").then((m) => m.default),
  "impossible-structure": () => import("../../../kodex/shaders/lab/impossible-structure.frag?raw").then((m) => m.default),
  "split-corridor": () => import("../../../kodex/shaders/lab/split-corridor.frag?raw").then((m) => m.default),
};

const boot = async (): Promise<void> => {
  const roots = document.querySelectorAll<HTMLElement>("[data-kdx-field]");
  for (const root of roots) {
    if (root.dataset.kdxFieldState) continue;
    root.dataset.kdxFieldState = "loading";
    const name = root.dataset.field ?? "threshold-portal";
    try {
      const load = SHADERS[name];
      if (!load) throw new Error(`KODEX field: shader desconocido "${name}"`);
      new KodexField(root, await load());
    } catch (error) {
      // Nunca romper la lámina por el fondo: se apaga y queda el campo CSS
      // que ya existía debajo.
      console.warn(error);
      root.dataset.kdxFieldState = "fallback";
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  void boot();
}

export { KodexField };
