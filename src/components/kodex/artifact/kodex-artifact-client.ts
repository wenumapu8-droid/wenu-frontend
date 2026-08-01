import vertexSource from "../../../kodex/shaders/fullscreen.vert.glsl?raw";
import fragmentSource from "../../../kodex/shaders/artifact.frag.glsl?raw";

/**
 * KODEX-∞ · ARTIFACT
 *
 * Renderiza una obra (mandala / rosetón / árbol / patrón mapuche) tratada como
 * artefacto archivado: pixelado, dither Bayer, scanlines, glow y chroma mínimo.
 *
 * Sustituye el anchor vectorial anterior, que se leía "cargado y abstracto".
 * Acá la obra es el foco y el tratamiento la envuelve.
 *
 * Decisiones que no son cosméticas:
 *  · Si WebGL no está o la textura falla, se deja ver la <img> de respaldo.
 *    Una lámina sin su pieza no es una lámina.
 *  · Con prefers-reduced-motion queda quieta: es una pieza con flicker.
 *  · Fuera del viewport se detiene el loop. Son siete escenas; si todas
 *    animaran a la vez, el equipo del visitante lo pagaría.
 */

type ArtifactOptions = {
  pixelSize: number;
  dither: number;
  scanlines: number;
  glow: number;
  chroma: number;
  flicker: number;
  lumaFloor: number;
  lumaCeil: number;
  tint: number;
};

const DEFAULTS: ArtifactOptions = {
  pixelSize: 3,
  dither: 0.85,
  scanlines: 0.35,
  glow: 0.5,
  chroma: 0.6,
  flicker: 0.5,
  lumaFloor: 0.12,
  lumaCeil: 1,
  tint: 0.18,
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.trim().replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return [1, 0.15, 0.2];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

class KodexArtifact {
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly uniforms = new Map<string, WebGLUniformLocation | null>();
  private readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private readonly options: ArtifactOptions;
  private readonly accent: [number, number, number];

  /** La medición de salida se hace una sola vez, no por frame. */
  private medida = false;

  // -1 = sin decidir todavia; lo resuelve analyzeArtwork al cargar la obra.
  private lumaKey = -1;
  private texture: WebGLTexture | null = null;
  private textureSize: [number, number] = [1, 1];
  private startTime = performance.now();
  private reveal = 0;
  /** Cuándo empezó el barrido de entrada. El revelado se mide contra esto. */
  private revealDesde = performance.now();
  private raf = 0;
  // Arranca en true a proposito. Si empieza en false y el IntersectionObserver
  // no llega a disparar antes de que cargue la textura, nadie llama a start()
  // y la pieza queda con reveal = 0, es decir invisible, sin ningun error.
  // Costo de equivocarse hacia este lado: unos frames de mas. Hacia el otro:
  // la lamina no muestra su obra.
  private visible = true;
  private disposed = false;

  constructor(root: HTMLElement) {
    this.root = root;

    const canvas = root.querySelector<HTMLCanvasElement>("[data-kdx-artifact-canvas]");
    if (!canvas) throw new Error("KODEX artifact: falta el canvas.");
    this.canvas = canvas;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("KODEX artifact: WebGL no disponible.");
    this.gl = gl;

    this.options = {
      pixelSize: Number(root.dataset.pixelSize ?? DEFAULTS.pixelSize),
      dither: Number(root.dataset.dither ?? DEFAULTS.dither),
      scanlines: Number(root.dataset.scanlines ?? DEFAULTS.scanlines),
      glow: Number(root.dataset.glow ?? DEFAULTS.glow),
      chroma: Number(root.dataset.chroma ?? DEFAULTS.chroma),
      flicker: Number(root.dataset.flicker ?? DEFAULTS.flicker),
      lumaFloor: Number(root.dataset.lumaFloor ?? DEFAULTS.lumaFloor),
      lumaCeil: Number(root.dataset.lumaCeil ?? DEFAULTS.lumaCeil),
      tint: Number(root.dataset.tint ?? DEFAULTS.tint),
    };
    this.accent = hexToRgb(root.dataset.accent ?? "#FF2733");
    // Se puede forzar desde la plantilla cuando la deteccion no acierta.
    if (root.dataset.lumaKey !== undefined) this.lumaKey = Number(root.dataset.lumaKey);

    this.program = this.createProgram();
    this.prepareGeometry();
    this.cacheUniforms();
    this.loadArtwork();
    this.observe();
    this.watchResize();

    this.montarToque();

    // Se expone la instancia para poder inspeccionarla desde la consola. Sin
    // esto, depurar "la pieza no aparece" es adivinar: el shader puede estar
    // perfecto y el problema ser que el loop nunca arrancó.
    (root as HTMLElement & { __kdxArtifact?: KodexArtifact }).__kdxArtifact = this;
  }

  /**
   * El interruptor del tratamiento.
   *
   * En modo fiel la obra se ve como es y el shader queda apagado. Este boton
   * lo enciende. El loop **no arranca hasta que se pide**: mantener un
   * raymarcher corriendo detras de una capa invisible gasta GPU para nada, y
   * en la maquina lenta con la que se revisa este proyecto eso se nota.
   */
  private montarToque(): void {
    const boton = this.root.querySelector<HTMLButtonElement>("[data-kdx-artifact-toggle]");
    if (!boton) return;

    boton.addEventListener("click", () => {
      const tratada = this.root.hasAttribute("data-kdx-tratada");
      if (tratada) {
        this.root.removeAttribute("data-kdx-tratada");
        boton.setAttribute("aria-pressed", "false");
        const rot = boton.querySelector("span");
        if (rot) rot.textContent = "TRATAR SEÑAL";
        this.stop();
      } else {
        this.root.setAttribute("data-kdx-tratada", "");
        boton.setAttribute("aria-pressed", "true");
        const rot = boton.querySelector("span");
        if (rot) rot.textContent = "OBRA FIEL";
        this.start();
      }
    });
  }

  /** Estado interno, para diagnóstico desde la consola. */
  public debug(): Record<string, unknown> {
    return {
      estado: this.root.dataset.kdxArtifactState,
      lumaSalida: this.root.dataset.kdxArtifactLuma,
      pixelesVivos: this.root.dataset.kdxArtifactVivos,
      reveal: this.reveal,
      visible: this.visible,
      loopActivo: this.raf !== 0,
      textura: this.texture !== null,
      textureSize: this.textureSize,
      canvas: [this.canvas.width, this.canvas.height],
      reducedMotion: this.reducedMotion,
      lumaKey: this.lumaKey,
      lumaFloor: this.options.lumaFloor,
      lumaCeil: this.options.lumaCeil,
    };
  }

  // ------------------------------------------------------------------ GL
  private compile(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type);
    if (!shader) throw new Error("KODEX artifact: no se pudo crear el shader.");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`KODEX artifact: shader no compila — ${log}`);
    }
    return shader;
  }

  private createProgram(): WebGLProgram {
    const { gl } = this;
    const program = gl.createProgram();
    if (!program) throw new Error("KODEX artifact: no se pudo crear el programa.");
    const vs = this.compile(gl.VERTEX_SHADER, vertexSource);
    const fs = this.compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`KODEX artifact: link falló — ${gl.getProgramInfoLog(program)}`);
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return program;
  }

  private prepareGeometry(): void {
    const { gl, program } = this;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  }

  private cacheUniforms(): void {
    const names = [
      "artwork", "resolution", "artworkSize", "time", "accent", "pixelSize",
      "ditherAmount", "scanlineAmount", "glowAmount", "chromaAmount",
      "flickerAmount", "reducedMotion", "reveal", "lumaKey", "lumaFloor", "lumaCeil", "tint",
    ];
    for (const name of names) {
      this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    }
  }

  // -------------------------------------------------------------- textura
  private loadArtwork(): void {
    const src = this.root.dataset.artwork;
    if (!src) {
      this.fallback("KODEX artifact: falta data-artwork.");
      return;
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => {
      if (this.disposed) return;
      const { gl } = this;
      // Se decide aquí, no en la plantilla: casi todo el portafolio son JPG
      // opacos sobre negro y pedirle al autor que marque cuál lleva alpha es
      // una fuente de error silenciosa. Si el archivo no tiene transparencia,
      // la silueta se saca del brillo.
      const analisis = this.analyzeArtwork(image);
      if (this.lumaKey < 0) this.lumaKey = analisis?.hasAlpha ? 0 : 1;
      // El piso medido sólo entra si la plantilla no fijó uno a mano: un valor
      // explícito en la lámina es una decisión, no un valor por defecto.
      if (analisis && this.root.dataset.lumaFloor === undefined) {
        this.options.lumaFloor = analisis.floor;
      }
      if (analisis && this.root.dataset.lumaCeil === undefined) {
        this.options.lumaCeil = analisis.ceil;
      }
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // La obra no es potencia de dos: CLAMP + LINEAR es lo único válido en
      // WebGL1 para NPOT. Sin esto la textura sale negra en varios drivers.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      this.texture = texture;
      this.textureSize = [image.naturalWidth, image.naturalHeight];
      this.root.dataset.kdxArtifactState = "ready";
      this.resize();
      // Sin condicion: apenas hay textura hay que dibujar. Si la pieza estuviera
      // fuera de pantalla, el observer la detiene en el frame siguiente.
      this.start();
    };
    image.onerror = () => this.fallback(`KODEX artifact: no se pudo cargar ${src}`);
    image.src = src;
  }

  /**
   * Lee la obra antes de tratarla: si trae transparencia real, y con qué
   * brillo empieza a ser obra en vez de fondo.
   *
   * Se muestrea una miniatura en vez de la imagen completa: con 2048×2048 leer
   * todo el buffer costaría más que el primer frame, y para esto basta.
   *
   * El umbral tiene que salir de cada pieza. Con un valor fijo el recorte
   * funcionaba en la obra clara del archivo y borraba las demás: cinco de las
   * seis láminas son casi negras -- bw-07 tiene luminancia media 0.04 y sólo
   * un 6% de píxeles sobre 0.30 -- así que un piso de 0.12 dejaba la placa
   * vacía. La pieza estaba ahí y el tratamiento se la comía.
   *
   * Se toma el percentil que deja pasar más o menos un tercio del cuadro: en
   * una obra sobre negro ese tercio es la obra. Así el recorte sigue quitando
   * el fondo, que es para lo que existe, sin decidir de antemano qué tan
   * brillante tiene derecho a ser una pieza.
   */
  private analyzeArtwork(image: HTMLImageElement): { hasAlpha: boolean; floor: number; ceil: number } | null {
    try {
      const size = 64;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(image, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      const total = size * size;
      let transparentes = 0;
      const lumas = new Float32Array(total);
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        if (data[i + 3] < 250) transparentes++;
        lumas[p] = (data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722) / 255;
      }

      // Un 4% de píxeles no opacos ya indica recorte intencional. Por debajo
      // de eso puede ser ruido de compresión.
      const hasAlpha = transparentes > total * 0.04;

      lumas.sort();
      const floor = Math.min(0.45, Math.max(0.045, lumas[Math.floor(total * 0.66)]));
      // El techo se toma cerca del máximo, no en el máximo: un solo píxel
      // quemado por la compresión no debe fijar la escala de toda la pieza.
      const ceil = Math.min(1, Math.max(floor + 0.08, lumas[Math.floor(total * 0.99)]));
      return { hasAlpha, floor, ceil };
    } catch {
      // Imagen de otro origen: el canvas queda contaminado y no se puede leer.
      // Se asume opaca, que es el caso más común del portafolio.
      return null;
    }
  }

  /** Deja visible la <img> de respaldo. Mejor la pieza plana que ninguna. */
  private fallback(reason: string): void {
    console.warn(reason);
    this.root.dataset.kdxArtifactState = "fallback";
    this.stop();
  }

  // ------------------------------------------------------------ ciclo
  private observe(): void {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          this.visible = entry.isIntersecting;
          if (this.visible && this.texture) this.start();
          else if (!this.visible) this.stop();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(this.root);
  }

  private watchResize(): void {
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this.canvas);
  }

  private resize(): void {
    const { canvas, gl } = this;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Se limita a 2x: el efecto es de baja resolución por diseño, así que
    // renderizar a 3x en un móvil sería gastar batería para nada.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    if (!this.raf && this.texture) this.draw();
  }

  private start(): void {
    if (this.raf || this.disposed || !this.texture) return;
    // En modo fiel el tratamiento esta apagado hasta que el visitante lo pide:
    // el observador de visibilidad no debe encenderlo por su cuenta.
    if (this.root.classList.contains("kdx-artifact--fiel") && !this.root.hasAttribute("data-kdx-tratada")) return;
    // El reloj del barrido arranca con el loop, no con el constructor: entre
    // uno y otro esta la carga de la obra, y si contara ese tiempo la pieza
    // apareceria de golpe y ya revelada.
    if (this.reveal === 0) this.revealDesde = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private stop(): void {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private readonly frame = (): void => {
    this.raf = 0;
    if (this.disposed) return;
    // El revelado corre incluso con reduced-motion, pero instantáneo: la pieza
    // tiene que aparecer igual, sin el barrido.
    //
    // Va por RELOJ y no por cuenta de frames. Sumar un paso fijo por frame
    // ata la duracion del barrido a la velocidad de la maquina: a 60fps dura
    // un segundo, pero en un equipo lento que da 5fps dura once, y durante
    // todo ese rato la obra esta a medio aparecer porque el shader multiplica
    // el alfa por `reveal`. El equipo con el que se revisa este proyecto es un
    // iMac 2015 — exactamente el caso que rompia.
    const REVELADO_MS = 950;
    this.reveal = this.reducedMotion
      ? 1
      : clamp((performance.now() - this.revealDesde) / REVELADO_MS, 0, 1);
    this.draw();
    // Ya revelada y sin movimiento: no hay nada que animar, se deja quieta.
    if (this.reducedMotion && this.reveal >= 1) return;
    if (this.visible) this.raf = requestAnimationFrame(this.frame);
  };

  private draw(): void {
    const { gl, program, canvas } = this;
    if (!this.texture) return;

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    const u = (name: string) => this.uniforms.get(name) ?? null;
    gl.uniform1i(u("artwork"), 0);
    gl.uniform2f(u("resolution"), canvas.width, canvas.height);
    gl.uniform2f(u("artworkSize"), this.textureSize[0], this.textureSize[1]);
    gl.uniform1f(u("time"), (performance.now() - this.startTime) / 1000);
    gl.uniform3f(u("accent"), this.accent[0], this.accent[1], this.accent[2]);
    // El bloque se define en px CSS: a 2x debe seguir viéndose del mismo tamaño.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    gl.uniform1f(u("pixelSize"), Math.max(1, this.options.pixelSize * dpr));
    gl.uniform1f(u("ditherAmount"), this.options.dither);
    gl.uniform1f(u("scanlineAmount"), this.options.scanlines);
    gl.uniform1f(u("glowAmount"), this.options.glow);
    gl.uniform1f(u("chromaAmount"), this.options.chroma);
    gl.uniform1f(u("flickerAmount"), this.options.flicker);
    gl.uniform1f(u("reducedMotion"), this.reducedMotion ? 1 : 0);
    gl.uniform1f(u("reveal"), this.reveal);
    gl.uniform1f(u("lumaKey"), this.lumaKey < 0 ? 0 : this.lumaKey);
    gl.uniform1f(u("lumaFloor"), this.options.lumaFloor);
    gl.uniform1f(u("lumaCeil"), this.options.lumaCeil);
    gl.uniform1f(u("tint"), this.options.tint);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    this.medirSalida(gl);
  }

  /**
   * Mide UNA vez lo que el shader dejó en el canvas y lo publica en el DOM.
   *
   * "La obra no aparece" ya costó horas varias veces en este proyecto, y
   * siempre por la misma razón: el estado decía `ready` — textura cargada,
   * loop corriendo, canvas con tamaño — y aun así la lámina estaba negra. Ese
   * estado no distingue entre "el shader dibujó negro" y "algo tapa el canvas",
   * que se arreglan en lugares opuestos.
   *
   * Se lee justo después del draw porque sin `preserveDrawingBuffer` el buffer
   * se pierde al terminar el frame. Una sola vez y sobre una rejilla mínima:
   * `readPixels` sincroniza CPU y GPU, y hacerlo por frame costaría más que
   * todo lo que dibuja.
   */
  private medirSalida(gl: WebGL2RenderingContext): void {
    // Recien cuando el barrido de entrada termino. Antes de eso el shader
    // multiplica el alfa por `reveal` y la lamina esta legitimamente vacia:
    // medir ahi contaria una falla que no existe.
    if (this.medida || this.reveal < 1) return;
    this.medida = true;
    try {
      const n = 24;
      const px = new Uint8Array(n * n * 4);
      const w = Math.max(1, Math.floor(this.canvas.width / n));
      const h = Math.max(1, Math.floor(this.canvas.height / n));
      let suma = 0;
      let vivos = 0;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const o = (y * n + x) * 4;
          gl.readPixels(x * w, y * h, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px.subarray(o, o + 4));
          const l = (px[o] * 0.2126 + px[o + 1] * 0.7152 + px[o + 2] * 0.0722) / 255;
          // Alfa incluido: el canvas es transparente por diseño, y un pixel
          // luminoso pero transparente no se ve. Sin esto la medicion mentiria.
          const v = l * (px[o + 3] / 255);
          suma += v;
          if (v > 0.02) vivos++;
        }
      }
      const total = n * n;
      this.root.dataset.kdxArtifactLuma = (suma / total).toFixed(3);
      this.root.dataset.kdxArtifactVivos = ((vivos / total) * 100).toFixed(0) + "%";
    } catch {
      // Medir es diagnóstico: si falla, no debe llevarse la lámina con ella.
      this.root.dataset.kdxArtifactLuma = "n/d";
    }
  }

  public dispose(): void {
    this.disposed = true;
    this.stop();
    if (this.texture) this.gl.deleteTexture(this.texture);
  }
}

const boot = (): void => {
  const roots = document.querySelectorAll<HTMLElement>("[data-kdx-artifact]");
  for (const root of roots) {
    if (root.dataset.kdxArtifactState) continue;
    root.dataset.kdxArtifactState = "loading";
    try {
      new KodexArtifact(root);
    } catch (error) {
      // Nunca romper la lámina por el visual: queda la <img> de respaldo.
      console.warn(error);
      root.dataset.kdxArtifactState = "fallback";
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

export { KodexArtifact };
