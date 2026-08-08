import screenVert from '../shaders/screen.vert?raw';
import sourceFrag from '../shaders/thresholdPortalSource.frag?raw';
import feedbackFrag from '../shaders/thresholdPortalFeedback.frag?raw';
import compositeFrag from '../shaders/thresholdPortalComposite.frag?raw';
import {
  THRESHOLD_PORTAL_CONFIG,
  THRESHOLD_PORTAL_MOTION,
  getThresholdPortalQualityValue,
  getThresholdPortalStateValue,
} from '../config.js';

export class KdxThresholdPortalRuntime {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    this.config = THRESHOLD_PORTAL_CONFIG;
    this.state = {
      seed: options.seed ?? this.config.defaultSeed,
      elapsedMs: options.elapsedMs ?? this.config.defaultElapsedMs,
      // CANAL MEDIDO. Solo entra aqui la salida del analizador de audio. Si no
      // hay analizador corriendo el valor es 0 y `bassMedido` queda en false:
      // ausencia declarada, no un cero que se pueda leer como lectura real.
      bass: options.bass ?? this.config.defaultBass,
      bassMedido: false,
      // CANAL ORNAMENTAL. Envolvente de reposo generada por el sitio. No es una
      // medicion de nada y jamas debe reportarse como tal.
      idleAnimation: options.idleAnimation ?? 0,
      pointer: [0, 0],
      motionMode: options.motionMode ?? this.config.defaultMotionMode,
      qualityLevel: options.qualityLevel ?? this.config.defaultQualityLevel,
      phaseName: options.state ?? this.config.defaultState,
      phaseValue: getThresholdPortalStateValue(options.state ?? this.config.defaultState),
    };
    this.running = false;
    this.raf = 0;
    this.lastNow = 0;
    this.metrics = {
      fps: 0,
      frameTime: 0,
      longFrames: 0,
      drawCalls: 0,
      activeLoops: 0,
      canvasSize: '0x0',
    };
    this.telemetryFrames = 0;
    this.telemetryStart = 0;
  }

  async load() {
    this._initGL();
    await this._loadArtwork(this.options.artworkUrl || this.config.artworkUrl);
    this._resize();
    this._bindEvents();
    this.renderOnce();
    return this;
  }

  start() {
    if (this.running || !this.gl) return;
    this.running = true;
    this.metrics.activeLoops = 1;
    const loop = (now) => {
      if (!this.running) return;
      if (this.state.motionMode !== THRESHOLD_PORTAL_MOTION.PAUSED) {
        const delta = this.lastNow ? now - this.lastNow : 16.6667;
        this.state.elapsedMs += delta;
        this.metrics.frameTime = delta;
        if (delta > 32) this.metrics.longFrames += 1;
      }
      this.lastNow = now;
      this._render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    this.metrics.activeLoops = 0;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  dispose() {
    this.stop();
    if (this._onResize) removeEventListener('resize', this._onResize);
    if (this._onPointerMove) removeEventListener('pointermove', this._onPointerMove);
  }

  setSeed(seed) { this.state.seed = seed; this.renderOnce(); }
  setElapsedMs(elapsedMs) { this.state.elapsedMs = elapsedMs; this.renderOnce(); }
  setState(stateName) {
    this.state.phaseName = stateName;
    this.state.phaseValue = getThresholdPortalStateValue(stateName);
    this.renderOnce();
  }
  setMotionMode(mode) { this.state.motionMode = mode; this.renderOnce(); }
  setQualityLevel(levelName) { this.state.qualityLevel = levelName; this.renderOnce(); }
  /**
   * Graves MEDIDOS. Recibe unicamente la salida del analizador de audio.
   *
   * No pasar por aqui envolventes, senos, rampas ni ningun valor generado: el
   * canal se llama como una medicion y por lo tanto solo puede transportar
   * mediciones. Para animar sin senal esta `setIdleAnimation`.
   */
  setBass(bass) {
    this.state.bass = Math.max(0, Math.min(1, bass));
    this.state.bassMedido = true;
    this.renderOnce();
  }

  /**
   * No hay analizador: el canal medido vuelve a ausente, no a "cero medido".
   *
   * Sale temprano si ya estaba ausente. No es microoptimizacion: cada
   * `renderOnce` acumula una pasada mas de feedback, asi que el numero de
   * renders por cuadro es un parametro visual. Estos dos canales se escriben
   * los dos en cada cuadro y solo uno de ellos cambia; si ambos renderizaran
   * siempre, la estela del portal se alargaria a la mitad de velocidad.
   */
  clearBass() {
    if (!this.state.bassMedido && this.state.bass === 0) return;
    this.state.bass = 0;
    this.state.bassMedido = false;
    this.renderOnce();
  }

  /**
   * Animacion de reposo: movimiento decorativo, generado por el sitio.
   *
   * Existe para que la lamina respire cuando no hay sonido. Es un canal propio
   * justamente para que nadie pueda confundirlo con `bass`: quien lea el estado
   * o las metricas ve dos numeros distintos con dos procedencias distintas.
   */
  setIdleAnimation(value) {
    const next = Math.max(0, Math.min(1, value));
    if (next === this.state.idleAnimation) return; // ver la nota en clearBass
    this.state.idleAnimation = next;
    this.renderOnce();
  }

  /**
   * El unico punto donde los dos canales se suman.
   *
   * El shader expone una sola entrada de desplazamiento (`u_bass`), asi que la
   * medicion y el ornamento acaban compartiendo uniform. La suma se hace aqui,
   * en el ultimo salto, y no antes: aguas arriba los dos valores siguen
   * separados y son distinguibles en `getMetrics()`. Renombrar el uniform a
   * algo neutro (`u_drive`) exige tocar los shaders, que quedan fuera de este
   * paquete.
   */
  _displacement() {
    return Math.max(0, Math.min(1, this.state.bass + this.state.idleAnimation));
  }
  setPointer(x, y) {
    this.state.pointer = [Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))];
    if (!this.running) this.renderOnce();
  }

  renderOnce() {
    if (!this.gl) return;
    this._render();
  }

  captureFrame(type = 'image/png') {
    this.renderOnce();
    return this.canvas.toDataURL(type);
  }

  getMetrics() {
    return {
      ...this.metrics,
      state: this.state.phaseName,
      seed: this.state.seed,
      elapsedMs: this.state.elapsedMs,
      motionMode: this.state.motionMode,
      qualityLevel: this.state.qualityLevel,
      // Los dos canales se reportan por separado y con su procedencia. Un
      // consumidor de metricas nunca debe tener que adivinar si `bass` es una
      // lectura real; si `bassMedido` es false, no hay senal y punto.
      bass: this.state.bass,
      bassMedido: this.state.bassMedido,
      idleAnimation: this.state.idleAnimation,
    };
  }

  _initGL() {
    const gl = this.canvas.getContext('webgl2', {
      antialias: false,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('WebGL2 unavailable for KDX_THRESHOLD_PORTAL_001');
    this.gl = gl;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.buffer = buffer;

    this.programs = {
      source: this._createProgram(screenVert, sourceFrag),
      feedback: this._createProgram(screenVert, feedbackFrag),
      composite: this._createProgram(screenVert, compositeFrag),
    };

    this.fbScene = this._createFbo();
    this.fbPrev = this._createFbo();
    this.fbNext = this._createFbo();
  }

  async _loadArtwork(url) {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    this.artworkTexture = tex;
  }

  _bindEvents() {
    this._onResize = () => {
      this._resize();
      this.renderOnce();
    };
    this._onPointerMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      this.setPointer(x, y);
    };
    addEventListener('resize', this._onResize, { passive: true });
    addEventListener('pointermove', this._onPointerMove, { passive: true });
  }

  _resize() {
    const dprBase = window.devicePixelRatio || 1;
    const scale = getThresholdPortalQualityValue(this.state.qualityLevel);
    const dpr = Math.min(2, dprBase * scale);
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * dpr || window.innerWidth * dpr));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * dpr || window.innerHeight * dpr));
    this.canvas.width = width;
    this.canvas.height = height;
    this.metrics.canvasSize = `${width}x${height}`;
    this._sizeFbo(this.fbScene, width, height);
    this._sizeFbo(this.fbPrev, width, height);
    this._sizeFbo(this.fbNext, width, height);
  }

  _render() {
    const gl = this.gl;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const timeSeconds = this.state.elapsedMs / 1000;
    const qualityValue = getThresholdPortalQualityValue(this.state.qualityLevel);
    const motionValue = this.state.motionMode === THRESHOLD_PORTAL_MOTION.REDUCED ? 0 : this.state.motionMode === THRESHOLD_PORTAL_MOTION.LOW_POWER ? 0.5 : 1;
    const displacement = this._displacement();

    this.metrics.drawCalls = 0;

    this._pass(this.programs.source, this.fbScene, (u) => {
      gl.uniform1i(u.u_tex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.artworkTexture);
      gl.uniform2f(u.u_res, width, height);
      gl.uniform1f(u.u_time, timeSeconds);
      gl.uniform1f(u.u_seed, this.state.seed);
      gl.uniform2f(u.u_pointer, this.state.pointer[0], this.state.pointer[1]);
      gl.uniform1f(u.u_bass, displacement);
      // La fase del archivo manda sobre u_state cuando existe. Es el eje que
      // el visitante mueve a proposito; la fase interna del portal
      // (DORMANT/AWARE/OPEN) queda de respaldo.
      const arch = window.__kdxArchivoValor;
      gl.uniform1f(u.u_state, typeof arch === 'number' ? arch : this.state.phaseValue / 2);
      gl.uniform1f(u.u_quality, qualityValue);
      // Giro de la rueda. Se lee del bus global y no de un setter porque la
      // rueda ya corre su propio bucle con inercia: pasarlo por eventos
      // agregaria una capa de retraso sobre algo que se siente en la mano.
      gl.uniform1f(u.u_wheel, (window.__kdxRueda && window.__kdxRueda.valor) || 0);
      gl.uniform1f(u.u_motion, motionValue);
    });

    this._pass(this.programs.feedback, this.fbNext, (u) => {
      gl.uniform1i(u.u_scene, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.fbScene.tex);
      gl.uniform1i(u.u_prev, 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.fbPrev.tex);
      gl.uniform1f(u.u_decay, this.config.feedback.decay);
      gl.uniform1f(u.u_mix, this.state.motionMode === THRESHOLD_PORTAL_MOTION.REDUCED ? 0.0 : this.config.feedback.mix);
      gl.uniform1f(u.u_time, timeSeconds);
    });

    this._pass(this.programs.composite, null, (u) => {
      gl.uniform1i(u.u_tex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.fbNext.tex);
      gl.uniform2f(u.u_res, width, height);
      gl.uniform1f(u.u_time, timeSeconds);
      gl.uniform1f(u.u_bass, displacement);
      gl.uniform1f(u.u_motion, motionValue);
    });

    [this.fbPrev, this.fbNext] = [this.fbNext, this.fbPrev];
    this._measureFrame();
  }

  _measureFrame() {
    const now = performance.now();
    if (!this.telemetryStart) this.telemetryStart = now;
    this.telemetryFrames += 1;
    const elapsed = now - this.telemetryStart;
    if (elapsed >= 500) {
      this.metrics.fps = Math.round((this.telemetryFrames / elapsed) * 1000);
      this.telemetryFrames = 0;
      this.telemetryStart = now;
    }
  }

  _pass(program, framebuffer, applyUniforms) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer ? framebuffer.fb : null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(program.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    applyUniforms(program.uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.metrics.drawCalls += 1;
  }

  _createProgram(vertexSource, fragmentSource) {
    const gl = this.gl;
    const vertex = this._compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = this._compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'p');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed');
    }
    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let index = 0; index < count; index += 1) {
      const info = gl.getActiveUniform(program, index);
      uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  }

  _compile(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile failed');
    }
    return shader;
  }

  _createFbo() {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fb, tex };
  }

  _sizeFbo(target, width, height) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
}
