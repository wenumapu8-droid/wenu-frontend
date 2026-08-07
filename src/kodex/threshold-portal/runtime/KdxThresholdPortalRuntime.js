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
      bass: options.bass ?? this.config.defaultBass,
      pointer: [0, 0],
      motionMode: options.motionMode ?? this.config.defaultMotionMode,
      qualityLevel: options.qualityLevel ?? this.config.defaultQualityLevel,
      phaseName: options.state ?? this.config.defaultState,
      phaseValue: getThresholdPortalStateValue(options.state ?? this.config.defaultState),
    };
    this.running = false;
    this.disposed = false;
    this.contextLost = false;
    this.raf = 0;
    this.lastNow = 0;
    this.metrics = {
      fps: 0,
      frameTime: 0,
      longFrames: 0,
      drawCalls: 0,
      activeLoops: 0,
      canvasSize: '0x0',
      resourceCount: 0,
      contextLost: false,
    };
    this.telemetryFrames = 0;
    this.telemetryStart = 0;
  }

  async load() {
    if (this.disposed) throw new Error('KDX_THRESHOLD_PORTAL_001 runtime is disposed');
    this._initGL();
    await this._loadArtwork(this.options.artworkUrl || this.config.artworkUrl);
    this._resize();
    this._bindEvents();
    this.renderOnce();
    return this;
  }

  start() {
    if (this.running || !this.gl || this.disposed || this.contextLost) return;
    this.running = true;
    this.metrics.activeLoops = 1;
    const loop = (now) => {
      if (!this.running || this.disposed || this.contextLost) return;
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
    this.lastNow = 0;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this._unbindEvents();

    const gl = this.gl;
    if (!gl) return;

    // Unbind owned state before deletion. The runtime never forces context loss:
    // the browser/host may legitimately share the WebGL context lifecycle.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null);

    if (this.artworkTexture) gl.deleteTexture(this.artworkTexture);
    this.artworkTexture = null;

    this._deleteFbo(this.fbScene);
    this._deleteFbo(this.fbPrev);
    this._deleteFbo(this.fbNext);
    this.fbScene = null;
    this.fbPrev = null;
    this.fbNext = null;

    if (this.programs) {
      Object.values(this.programs).forEach((entry) => {
        if (entry?.program) gl.deleteProgram(entry.program);
      });
    }
    this.programs = null;

    if (this.buffer) gl.deleteBuffer(this.buffer);
    this.buffer = null;

    this.metrics.resourceCount = 0;
    this.gl = null;
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
  setBass(bass) { this.state.bass = Math.max(0, Math.min(1, bass)); this.renderOnce(); }
  setPointer(x, y) {
    this.state.pointer = [Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y))];
    if (!this.running) this.renderOnce();
  }

  renderOnce() {
    if (!this.gl || this.disposed || this.contextLost) return;
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
      disposed: this.disposed,
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
    if (!buffer) throw new Error('Unable to allocate KDX threshold portal vertex buffer');
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
    this._refreshResourceCount();
  }

  async _loadArtwork(url) {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    if (this.disposed || !this.gl) return;
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error('Unable to allocate KDX threshold portal artwork texture');
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    this.artworkTexture = tex;
    this._refreshResourceCount();
  }

  _bindEvents() {
    // Universal-host remounts can call load more than once during Astro
    // transitions; keep global listeners strictly one-per-runtime.
    this._unbindEvents();

    this._onResize = () => {
      if (this.disposed || this.contextLost) return;
      this._resize();
      this.renderOnce();
    };
    this._onPointerMove = (event) => {
      if (this.disposed || this.contextLost) return;
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      this.setPointer(x, y);
    };
    this._onContextLost = (event) => {
      event.preventDefault();
      this.contextLost = true;
      this.metrics.contextLost = true;
      this.stop();
      this.options.onContextLost?.();
    };
    this._onContextRestored = () => {
      // WebGL resources are invalid after restoration. Recreate the runtime
      // from the same semantic state rather than attempting to reuse handles.
      if (this.disposed) return;
      this.contextLost = false;
      this.metrics.contextLost = false;
      this.options.onContextRestored?.();
      this._restoreContext().catch((error) => {
        this.contextLost = true;
        this.metrics.contextLost = true;
        this.options.onError?.(error);
      });
    };

    addEventListener('resize', this._onResize, { passive: true });
    addEventListener('pointermove', this._onPointerMove, { passive: true });
    this.canvas.addEventListener('webglcontextlost', this._onContextLost, false);
    this.canvas.addEventListener('webglcontextrestored', this._onContextRestored, false);
  }

  _unbindEvents() {
    if (this._onResize) removeEventListener('resize', this._onResize);
    if (this._onPointerMove) removeEventListener('pointermove', this._onPointerMove);
    if (this._onContextLost) this.canvas.removeEventListener('webglcontextlost', this._onContextLost, false);
    if (this._onContextRestored) this.canvas.removeEventListener('webglcontextrestored', this._onContextRestored, false);
    this._onResize = null;
    this._onPointerMove = null;
    this._onContextLost = null;
    this._onContextRestored = null;
  }

  async _restoreContext() {
    const shouldRestart = this.options.autoStartOnRestore === true || this.running;
    this._releaseGpuHandles(false);
    this._initGL();
    await this._loadArtwork(this.options.artworkUrl || this.config.artworkUrl);
    this._resize();
    this.renderOnce();
    if (shouldRestart) this.start();
  }

  _releaseGpuHandles(markDisposed = false) {
    const gl = this.gl;
    if (gl) {
      if (this.artworkTexture) gl.deleteTexture(this.artworkTexture);
      this._deleteFbo(this.fbScene);
      this._deleteFbo(this.fbPrev);
      this._deleteFbo(this.fbNext);
      if (this.programs) {
        Object.values(this.programs).forEach((entry) => {
          if (entry?.program) gl.deleteProgram(entry.program);
        });
      }
      if (this.buffer) gl.deleteBuffer(this.buffer);
    }
    this.artworkTexture = null;
    this.fbScene = null;
    this.fbPrev = null;
    this.fbNext = null;
    this.programs = null;
    this.buffer = null;
    this.metrics.resourceCount = 0;
    if (markDisposed) this.gl = null;
  }

  _refreshResourceCount() {
    let count = 0;
    if (this.buffer) count += 1;
    if (this.artworkTexture) count += 1;
    if (this.programs) count += Object.values(this.programs).filter((entry) => entry?.program).length;
    [this.fbScene, this.fbPrev, this.fbNext].forEach((target) => {
      if (target?.fb) count += 1;
      if (target?.tex) count += 1;
    });
    this.metrics.resourceCount = count;
  }

  _resize() {
    if (!this.gl || this.disposed || this.contextLost) return;
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
    if (!gl || this.disposed || this.contextLost || !this.programs || !this.fbScene || !this.fbPrev || !this.fbNext) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const timeSeconds = this.state.elapsedMs / 1000;
    const qualityValue = getThresholdPortalQualityValue(this.state.qualityLevel);
    const motionValue = this.state.motionMode === THRESHOLD_PORTAL_MOTION.REDUCED ? 0 : this.state.motionMode === THRESHOLD_PORTAL_MOTION.LOW_POWER ? 0.5 : 1;

    this.metrics.drawCalls = 0;

    this._pass(this.programs.source, this.fbScene, (u) => {
      gl.uniform1i(u.u_tex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.artworkTexture);
      gl.uniform2f(u.u_res, width, height);
      gl.uniform1f(u.u_time, timeSeconds);
      gl.uniform1f(u.u_seed, this.state.seed);
      gl.uniform2f(u.u_pointer, this.state.pointer[0], this.state.pointer[1]);
      gl.uniform1f(u.u_bass, this.state.bass);
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
      gl.uniform1f(u.u_bass, this.state.bass);
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
    if (!program) {
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      throw new Error('Unable to allocate KDX threshold portal shader program');
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'p');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || 'Shader link failed';
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      throw new Error(message);
    }

    // Linked programs retain compiled shader binaries; the standalone shader
    // objects can be detached and deleted immediately instead of leaking until
    // context teardown.
    gl.detachShader(program, vertex);
    gl.detachShader(program, fragment);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);

    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let index = 0; index < count; index += 1) {
      const info = gl.getActiveUniform(program, index);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  }

  _compile(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Unable to allocate KDX threshold portal shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || 'Shader compile failed';
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  _createFbo() {
    const gl = this.gl;
    const tex = gl.createTexture();
    const fb = gl.createFramebuffer();
    if (!tex || !fb) {
      if (tex) gl.deleteTexture(tex);
      if (fb) gl.deleteFramebuffer(fb);
      throw new Error('Unable to allocate KDX threshold portal framebuffer');
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fb, tex };
  }

  _deleteFbo(target) {
    if (!target || !this.gl) return;
    if (target.fb) this.gl.deleteFramebuffer(target.fb);
    if (target.tex) this.gl.deleteTexture(target.tex);
  }

  _sizeFbo(target, width, height) {
    const gl = this.gl;
    if (!target) return;
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
}
