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

const RENDER_TIER_DPR = Object.freeze({ HIGH: 1.5, MID: 1.25, LOW: 1.0, STATIC: 0.85 });
const WORLD_PHASES = new Set(['E00', 'T01', 'M11', 'R10']);
const SOURCE_MODES = new Set(['flow', 'spiral', 'blacksun']);
const RUNTIME_EFFECTS = new Set(['mirror', 'distort', 'color']);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const dampingAlpha = (lambda, dt) => 1 - Math.exp(-lambda * dt);

export class KodexWorld {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.onTelemetry = opts.onTelemetry || (() => {});
    this.getAudio = opts.getAudio || (() => 0);
    this.seed = opts.seed ?? Math.random();
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderTier = String(opts.renderTier || 'HIGH').toUpperCase();
    if (!RENDER_TIER_DPR[this.renderTier]) this.renderTier = 'HIGH';
    this.requestedMaxDpr = opts.maxDpr ?? 1.5;
    this.maxDpr = Math.min(this.requestedMaxDpr, RENDER_TIER_DPR[this.renderTier]);
    this.dpr = Math.min(this.maxDpr, window.devicePixelRatio || 1);
    this.state = { time: 0, mouse: [0, 0], targetMouse: [0, 0], vel: 0, signal: 0, targetSignal: 0 };
    this.raf = 0; this.running = false;
    this._fps = 0; this._frames = 0; this._acc = 0; this._last = 0;
    // effect chain — off by default (Phase-1 look until the lab turns them on)
    this.effects = [
      { name: 'mirror', on: false, params: { u_seg: 6, u_angle: 0, u_mix: 1 } },
      { name: 'distort', on: false, params: { u_amt: 0.18, u_mode: 0 } },
      { name: 'color', on: false, params: { u_mode: 0, u_amt: 0.85 } },
    ];
    this.recipeEffects = null;
    this.recipeDecay = 0.90;
    this.decay = this.recipeDecay;
    this.sourceMode = 'flow'; // 'flow' (luminous threads) | 'spiral' | 'blacksun'
    this.tint = [0.85, 0.72, 0.35]; // per-work field colour
    this.planId = null;
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
  // Existing state vocabulary remains authoritative. Recipe/lab labels map onto these phases.
  setState(phase) {
    const V = {
      E00: { decayDelta: 0.02, colorMode: 0, colorEnvelope: 0.0, distEnvelope: 0.0, mirror: false, sig: false }, // excavation / dormant
      T01: { decayDelta: 0.00, colorMode: 0, colorEnvelope: 0.55, distEnvelope: 1.0, mirror: false, sig: false }, // transmutation / aware
      M11: { decayDelta: -0.02, colorMode: 1, colorEnvelope: 1.0, distEnvelope: 0.0, mirror: true, sig: true }, // manifestation / open
      R10: { decayDelta: 0.04, colorMode: 2, colorEnvelope: 0.60, distEnvelope: 0.0, mirror: false, sig: false }, // return
    }[phase];
    if (!V) return;
    this.phase = phase;
    this.decay = clamp(this.recipeDecay + V.decayDelta, 0.78, 0.975);

    const configured = this.recipeEffects || {};
    const col = this.getEffect('color');
    const configuredColor = configured.color;
    col.on = V.colorEnvelope > 0 && (configuredColor?.on ?? true);
    col.params.u_mode = configuredColor?.params?.u_mode ?? V.colorMode;
    col.params.u_amt = configuredColor
      ? clamp((configuredColor.params?.u_amt ?? 0.85) * V.colorEnvelope, 0, 1)
      : ({ E00: 0, T01: 0.45, M11: 0.85, R10: 0.5 }[phase] ?? 0);

    const dis = this.getEffect('distort');
    const configuredDistort = configured.distort;
    dis.on = V.distEnvelope > 0 && (configuredDistort?.on ?? true);
    dis.params.u_amt = configuredDistort
      ? clamp((configuredDistort.params?.u_amt ?? 0.14) * V.distEnvelope, 0, 0.5)
      : (phase === 'T01' ? 0.14 : dis.params.u_amt);
    if (configuredDistort?.params?.u_mode !== undefined) dis.params.u_mode = configuredDistort.params.u_mode;

    const mir = this.getEffect('mirror');
    const configuredMirror = configured.mirror;
    mir.on = V.mirror && (configuredMirror?.on ?? true);
    if (configuredMirror?.params) Object.assign(mir.params, configuredMirror.params);

    this.setSignal(V.sig);
    if ((this.reduce || this.renderTier === 'STATIC') && this.artwork) this.renderOnce();
  }
  toggle(name, on) { const e = this.effects.find((x) => x.name === name); if (e) e.on = on === undefined ? !e.on : on; }
  setParam(name, key, val) { const e = this.effects.find((x) => x.name === name); if (e) e.params[key] = val; }
  getEffect(name) { return this.effects.find((x) => x.name === name); }
  setSeed(v) { this.seed = clamp(Number(v) || 0, 0, 1); }
  setSourceMode(m) { if (SOURCE_MODES.has(m)) this.sourceMode = m; }
  setTint(rgb) { if (Array.isArray(rgb) && rgb.length === 3) this.tint = rgb.map((value) => clamp(Number(value) || 0, 0, 1)); }
  setRenderTier(tier) {
    const next = String(tier || '').toUpperCase();
    if (!RENDER_TIER_DPR[next]) return false;
    this.renderTier = next;
    this.maxDpr = Math.min(this.requestedMaxDpr, RENDER_TIER_DPR[next]);
    this.dpr = Math.min(this.maxDpr, window.devicePixelRatio || 1);
    if (this.gl) this._resize();
    return true;
  }

  // Stateless adapter point: ManifestationRecipe compiles elsewhere; KodexWorld only
  // consumes legal existing-runtime parameters. No route, memory, canon or state authority is added here.
  applyPlan(plan = {}) {
    if (!plan || typeof plan !== 'object' || !plan.plan_id || !plan.runtime) throw new TypeError('KodexWorld.applyPlan requires a compiled manifestation plan.');
    const runtime = plan.runtime;
    if (!WORLD_PHASES.has(runtime.initialPhase)) throw new TypeError(`Unsupported KodexWorld phase: ${runtime.initialPhase}`);
    if (!SOURCE_MODES.has(runtime.sourceMode)) throw new TypeError(`Unsupported KodexWorld source mode: ${runtime.sourceMode}`);
    if (!this.setRenderTier(runtime.renderTier || 'HIGH')) throw new TypeError(`Unsupported KodexWorld render tier: ${runtime.renderTier}`);

    this.planId = plan.plan_id;
    this.setSeed(runtime.seed);
    this.setSourceMode(runtime.sourceMode);
    this.setTint(runtime.tint);
    this.recipeDecay = clamp(Number(runtime.decay) || 0.9, 0.78, 0.975);

    const configured = {};
    for (const effect of runtime.effects || []) {
      if (!RUNTIME_EFFECTS.has(effect.name)) throw new TypeError(`Unsupported KodexWorld runtime effect: ${effect.name}`);
      configured[effect.name] = { on: effect.on !== false, params: { ...(effect.params || {}) } };
      const target = this.getEffect(effect.name);
      target.on = effect.on !== false;
      Object.assign(target.params, effect.params || {});
    }
    this.recipeEffects = configured;
    this.setState(runtime.initialPhase);
    return this;
  }

  _drawQuad() { const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.buf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  _pass(prog, tex, fbo, setU) {
    const gl = this.gl; gl.bindFramebuffer(gl.FRAMEBUFFER, fbo ? fbo.fb : null); gl.viewport(0, 0, this.W, this.H);
    gl.useProgram(prog.pr); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); if (prog.u.u_tex) gl.uniform1i(prog.u.u_tex, 0);
    setU && setU(prog.u); this._drawQuad();
  }

  _render(now) {
    const gl = this.gl, s = this.state;
    const frameMs = this._last ? Math.min(50, Math.max(0, now - this._last)) : 16;
    const dt = frameMs / 1000;
    s.time += dt;

    // Frame-rate-independent damping. Lambdas preserve approximately the previous
    // 60 Hz feel while keeping response duration stable on 30/60/120 Hz displays.
    const mouseAlpha = dampingAlpha(3.71, dt);
    const signalAlpha = dampingAlpha(3.08, dt);
    s.mouse[0] += (s.targetMouse[0] - s.mouse[0]) * mouseAlpha;
    s.mouse[1] += (s.targetMouse[1] - s.mouse[1]) * mouseAlpha;
    s.vel *= Math.exp(-5.0 * dt);
    s.signal += (s.targetSignal - s.signal) * signalAlpha;
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
      gl.uniform1f(u.u_decay, clamp(this.decay + audio * 0.06, 0.78, 0.99)); gl.uniform1f(u.u_audio, audio);
      gl.uniform1i(u.u_scene, 0);
    });
    // composite → screen
    this._pass(this.progs.composite, this.fbB.tex, null, (u) => {
      gl.uniform2f(u.u_res, this.W, this.H); gl.uniform1f(u.u_time, s.time); gl.uniform1f(u.u_audio, audio);
    });
    const tmp = this.fbA; this.fbA = this.fbB; this.fbB = tmp;

    // telemetry (measured) + governor
    this._frames++; this._acc += frameMs; this._last = now;
    if (this._acc >= 500) {
      this._fps = Math.round(this._frames / (this._acc / 1000)); this._frames = 0; this._acc = 0;
      if (this.renderTier !== 'STATIC') {
        if (this._fps < 40 && this.dpr > 0.75) { this.dpr = Math.max(0.75, this.dpr - 0.15); this._resize(); }
        else if (this._fps > 58 && this.dpr < this.maxDpr) { this.dpr = Math.min(this.maxDpr, this.dpr + 0.1); this._resize(); }
      }
      const on = this.effects.filter((e) => e.on).map((e) => e.name);
      this.onTelemetry({
        fps: this._fps,
        res: this.W + '×' + this.H,
        state: this.phase || 'E00',
        passes: passes + 1,
        chain: on.length ? on.join('+') : 'source',
        seed: this.seedHex(),
        audio,
        renderTier: this.renderTier,
        planId: this.planId,
        reducedMotion: this.reduce,
      });
    }
  }
  seedHex() { return '0x' + Math.floor(this.seed * 65535).toString(16).toUpperCase().padStart(4, '0'); }

  renderOnce() {
    if (this.failed || !this.gl) return;
    this._render(performance.now());
  }

  exportPNG() {
    // render one guaranteed frame then read the canvas
    this.renderOnce();
    return this.canvas.toDataURL('image/png');
  }

  start() {
    if (this.failed || this.running) return;
    this.running = true;
    const loop = (now) => { if (!this.running) return; this._render(now); this.raf = requestAnimationFrame(loop); };
    if (this.reduce || this.renderTier === 'STATIC') { this.renderOnce(); return; }
    this.raf = requestAnimationFrame(loop);
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf); }
}
