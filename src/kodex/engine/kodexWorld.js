// KODEX WORLD — engine (Phase 1 + 2).
// One persistent WebGL2 context. Pipeline:
//   SOURCE (artwork → spiral) → EFFECT CHAIN (mirror · distort · color, combinable)
//   → FEEDBACK (real ping-pong) → COMPOSITE (bloom / CRT → screen).
// Every telemetry value is measured. Effects and params are driven live by the lab.
import screenVert from '../shaders/screen.vert?raw';
import spiralFrag from '../shaders/spiralField.frag?raw';
import flowLinesFrag from '../shaders/flowLines.frag?raw';
import blackSunFrag from '../shaders/blackSun.frag?raw';
import mirrorFrag from '../shaders/mirror.frag?raw';
import distortFrag from '../shaders/distort.frag?raw';
import colorFrag from '../shaders/color.frag?raw';
import feedbackFrag from '../shaders/feedback.frag?raw';
import compositeFrag from '../shaders/composite.frag?raw';

export class KodexWorld {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.onTelemetry = opts.onTelemetry || (() => {});
    this.getAudio = opts.getAudio || (() => 0);
    this.seed = opts.seed ?? Math.random();
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.dpr = Math.min(opts.maxDpr ?? 1.5, window.devicePixelRatio || 1);
    this.state = { time: 0, mouse: [0, 0], targetMouse: [0, 0], vel: 0, signal: 0, targetSignal: 0 };
    this.raf = 0; this.running = false;
    this._fps = 0; this._frames = 0; this._acc = 0; this._last = 0;
    // effect chain — off by default (Phase-1 look until the lab turns them on)
    this.effects = [
      { name: 'mirror', on: false, params: { u_seg: 6, u_angle: 0, u_mix: 1 } },
      { name: 'distort', on: false, params: { u_amt: 0.18, u_mode: 0 } },
      { name: 'color', on: false, params: { u_mode: 0, u_amt: 0.85 } },
    ];
    this.decay = 0.90;
    this.sourceMode = 'flow'; // 'flow' (luminous threads) | 'spiral' | 'blacksun'
    this.tint = [0.85, 0.72, 0.35]; // per-work field colour
    this._initGL();
  }

  _initGL() {
    const gl = this.canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    if (!gl) { this.failed = true; this.onTelemetry({ error: 'NO WEBGL2' }); return; }
    this.gl = gl;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.buf = buf;
    this.progs = {
      spiral: this._program(spiralFrag), flow: this._program(flowLinesFrag), blacksun: this._program(blackSunFrag),
      mirror: this._program(mirrorFrag), distort: this._program(distortFrag),
      color: this._program(colorFrag), feedback: this._program(feedbackFrag),
      composite: this._program(compositeFrag),
    };
    this.fbScene = this._makeFBO(); this.fbA = this._makeFBO(); this.fbB = this._makeFBO();
    this.fbC = this._makeFBO(); this.fbD = this._makeFBO();
    this._resize();
    addEventListener('resize', () => this._resize(), { passive: true });
    this._bindInput();
  }
  _compile(type, src) { const gl = this.gl, s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s), src); return null; } return s; }
  _program(frag) {
    const gl = this.gl, vs = this._compile(gl.VERTEX_SHADER, screenVert), fs = this._compile(gl.FRAGMENT_SHADER, frag);
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(pr)); return null; }
    const u = {}, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(pr, i); u[info.name] = gl.getUniformLocation(pr, info.name); }
    return { pr, u };
  }
  _makeFBO() {
    const gl = this.gl, tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fb, tex };
  }
  _sizeFBO(f, w, h) { const gl = this.gl; gl.bindTexture(gl.TEXTURE_2D, f.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null); }
  _resize() {
    const gl = this.gl, W = Math.floor(innerWidth * this.dpr), H = Math.floor(innerHeight * this.dpr);
    this.W = W; this.H = H; this.canvas.width = W; this.canvas.height = H;
    this.canvas.style.width = innerWidth + 'px'; this.canvas.style.height = innerHeight + 'px';
    [this.fbScene, this.fbA, this.fbB, this.fbC, this.fbD].forEach((f) => this._sizeFBO(f, W, H));
  }
  async loadArtwork(url) {
    const gl = this.gl;
    const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = url; });
    if (!this.artwork) this.artwork = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.artwork);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    this.artworkUrl = url;
  }
  setArtwork(url) { return this.loadArtwork(url); }
  _bindInput() {
    let lx = 0, ly = 0;
    const move = (x, y) => { const nx = (x / innerWidth) * 2 - 1, ny = -((y / innerHeight) * 2 - 1); this.state.vel = Math.min(1, Math.hypot(nx - lx, ny - ly) * 3); lx = nx; ly = ny; this.state.targetMouse = [nx, ny]; };
    addEventListener('mousemove', (e) => move(e.clientX, e.clientY), { passive: true });
    addEventListener('touchmove', (e) => { if (e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  }
  setSignal(on) { this.state.targetSignal = on ? 1 : 0; }
  // STATE machine — one phase drives BOTH visuals and (in the page) audio: synchrony.
  setState(phase) {
    const V = {
      E00: { decay: 0.92, color: 0, camt: 0.0, dist: 0.0, mirror: false, sig: false }, // excavation
      T01: { decay: 0.90, color: 0, camt: 0.45, dist: 0.14, mirror: false, sig: false }, // transmutation
      M11: { decay: 0.88, color: 1, camt: 0.85, dist: 0.0, mirror: true, sig: true }, // manifestation
      R10: { decay: 0.94, color: 2, camt: 0.5, dist: 0.0, mirror: false, sig: false }, // return
    }[phase];
    if (!V) return;
    this.phase = phase; this.decay = V.decay;
    const col = this.getEffect('color'); col.on = V.camt > 0; col.params.u_mode = V.color; col.params.u_amt = V.camt;
    const dis = this.getEffect('distort'); dis.on = V.dist > 0; dis.params.u_amt = V.dist || dis.params.u_amt;
    const mir = this.getEffect('mirror'); mir.on = V.mirror;
    this.setSignal(V.sig);
  }
  toggle(name, on) { const e = this.effects.find((x) => x.name === name); if (e) e.on = on === undefined ? !e.on : on; }
  setParam(name, key, val) { const e = this.effects.find((x) => x.name === name); if (e) e.params[key] = val; }
  getEffect(name) { return this.effects.find((x) => x.name === name); }
  setSeed(v) { this.seed = v; }
  setSourceMode(m) { this.sourceMode = m; }
  setTint(rgb) { this.tint = rgb; }

  _drawQuad() { const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  _pass(prog, tex, fbo, setU) {
    const gl = this.gl; gl.bindFramebuffer(gl.FRAMEBUFFER, fbo ? fbo.fb : null); gl.viewport(0, 0, this.W, this.H);
    gl.useProgram(prog.pr); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); if (prog.u.u_tex) gl.uniform1i(prog.u.u_tex, 0);
    setU && setU(prog.u); this._drawQuad();
  }

  _render(now) {
    const gl = this.gl, s = this.state;
    s.time += this._last ? Math.min(0.05, (now - this._last) / 1000) : 0.016;
    s.mouse[0] += (s.targetMouse[0] - s.mouse[0]) * 0.06; s.mouse[1] += (s.targetMouse[1] - s.mouse[1]) * 0.06;
    s.vel *= 0.92; s.signal += (s.targetSignal - s.signal) * 0.05;
    const audio = this.getAudio();

    // SOURCE — flow (luminous threads) · spiral · black sun
    const srcProg = this.progs[this.sourceMode] || this.progs.flow;
    this._pass(srcProg, this.artwork, this.fbScene, (u) => {
      gl.uniform2f(u.u_res, this.W, this.H); gl.uniform1f(u.u_time, s.time);
      gl.uniform2f(u.u_mouse, s.mouse[0], s.mouse[1]);
      if (u.u_vel) gl.uniform1f(u.u_vel, s.vel);
      if (u.u_tint) gl.uniform3f(u.u_tint, this.tint[0], this.tint[1], this.tint[2]);
      gl.uniform1f(u.u_audio, audio); gl.uniform1f(u.u_signal, s.signal); gl.uniform1f(u.u_seed, this.seed);
    });

    // EFFECT CHAIN — ping-pong through enabled nodes
    let readTex = this.fbScene.tex, w = this.fbC, other = this.fbD, passes = 2;
    for (const e of this.effects) {
      if (!e.on) continue;
      const prog = this.progs[e.name], p = e.params;
      this._pass(prog, readTex, w, (u) => {
        if (u.u_res) gl.uniform2f(u.u_res, this.W, this.H);
        if (u.u_time) gl.uniform1f(u.u_time, s.time);
        if (u.u_audio) gl.uniform1f(u.u_audio, audio);
        for (const k in p) if (u[k] !== undefined && u[k] !== null) gl.uniform1f(u[k], p[k]);
      });
      readTex = w.tex; const t = w; w = other; other = t; passes++;
    }

    // FEEDBACK — real ping-pong
    this._pass(this.progs.feedback, readTex, this.fbB, (u) => {
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, this.fbA.tex); gl.uniform1i(u.u_prev, 1);
      gl.uniform1f(u.u_decay, this.decay + audio * 0.06); gl.uniform1f(u.u_audio, audio);
      gl.uniform1i(u.u_scene, 0);
    });
    // composite → screen
    this._pass(this.progs.composite, this.fbB.tex, null, (u) => {
      gl.uniform2f(u.u_res, this.W, this.H); gl.uniform1f(u.u_time, s.time); gl.uniform1f(u.u_audio, audio);
    });
    const tmp = this.fbA; this.fbA = this.fbB; this.fbB = tmp;

    // telemetry (measured) + governor
    this._frames++; this._acc += this._last ? (now - this._last) : 16; this._last = now;
    if (this._acc >= 500) {
      this._fps = Math.round(this._frames / (this._acc / 1000)); this._frames = 0; this._acc = 0;
      if (this._fps < 40 && this.dpr > 0.75) { this.dpr = Math.max(0.75, this.dpr - 0.15); this._resize(); }
      else if (this._fps > 58 && this.dpr < (window.devicePixelRatio || 1)) { this.dpr = Math.min(window.devicePixelRatio || 1, this.dpr + 0.1); this._resize(); }
      const on = this.effects.filter((e) => e.on).map((e) => e.name);
      this.onTelemetry({ fps: this._fps, res: this.W + '×' + this.H, state: this.phase || 'E00', passes: passes + 1, chain: on.length ? on.join('+') : 'source', seed: this.seedHex(), audio });
    }
  }
  seedHex() { return '0x' + Math.floor(this.seed * 65535).toString(16).toUpperCase().padStart(4, '0'); }

  exportPNG() {
    // render one guaranteed frame then read the canvas
    this._render(performance.now());
    return this.canvas.toDataURL('image/png');
  }

  start() { if (this.failed || this.running) return; this.running = true; const loop = (now) => { if (!this.running) return; this._render(now); this.raf = requestAnimationFrame(loop); }; if (this.reduce) { this._render(performance.now()); return; } this.raf = requestAnimationFrame(loop); }
  stop() { this.running = false; cancelAnimationFrame(this.raf); }
}
