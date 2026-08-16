import fullscreenVert from '../../../kodex/observe-v2/shaders/fullscreen.vert.glsl?raw';
import sourceFrag from '../../../kodex/observe-v2/shaders/source.frag.glsl?raw';
import displaceFrag from '../../../kodex/observe-v2/shaders/displace.frag.glsl?raw';
import thresholdFrag from '../../../kodex/observe-v2/shaders/threshold.frag.glsl?raw';
import chromaFrag from '../../../kodex/observe-v2/shaders/chroma.frag.glsl?raw';
import feedbackFrag from '../../../kodex/observe-v2/shaders/feedback.frag.glsl?raw';
import crtFrag from '../../../kodex/observe-v2/shaders/crt.frag.glsl?raw';
import {
  KDX_OBSERVE_V2_PROFILES,
  OBSERVE_MODE_INDEX,
  OBSERVE_V2_COPY,
  OBSERVE_V2_PROFILE_SCALE,
  type KdxObserveV2Profile,
  type KdxObserveV2State,
  type ObserveChecksum,
  type ObserveSceneState,
} from '../../../kodex/observe-v2/config';

type UniformMap = Record<string, WebGLUniformLocation | null>;
type Fbo = { fb: WebGLFramebuffer | null; tex: WebGLTexture | null; width: number; height: number };
type ProgramDef = { program: WebGLProgram; uniforms: UniformMap; shaders: WebGLShader[] };

type Metrics = {
  fps: number;
  averageFrameTime: number;
  droppedFrames: number;
  profile: KdxObserveV2Profile;
  webglActive: boolean;
  fallbackActive: boolean;
  passCount: number;
  state: KdxObserveV2State;
  renderFps: number;
  refreshRateEstimate: number;
};

type DomRefs = {
  canvas: HTMLCanvasElement;
  fallback: HTMLElement | null;
  statusChip: HTMLElement | null;
  profileChip: HTMLElement | null;
  checksumChip: HTMLElement | null;
  stateCopy: HTMLElement | null;
  hiddenMessage: HTMLElement | null;
  protocolCopy: HTMLElement | null;
  dossierCopy: HTMLElement | null;
  dossierCopyBlock: HTMLElement | null;
  signalTag: HTMLElement | null;
  telemetryCopy: HTMLElement | null;
  metricChip: HTMLElement | null;
  sceneCode: HTMLElement | null;
  sourceReadout: HTMLElement | null;
  acquisitionReadout: HTMLElement | null;
  confidenceReadout: HTMLElement | null;
  windowReadout: HTMLElement | null;
  primaryCta: HTMLButtonElement | null;
  secondaryCta: HTMLButtonElement | null;
  debug: HTMLElement | null;
  debugText: HTMLElement | null;
  latencyInline: HTMLElement | null;
  signalReadout: HTMLElement | null;
  focusReadout: HTMLElement | null;
  anomalyReadout: HTMLElement | null;
  nodeReadout: HTMLElement | null;
  latencyReadout: HTMLElement | null;
  checksumReadout: HTMLElement | null;
  checksumFoot: HTMLElement | null;
  rightRailA: HTMLElement | null;
  rightRailB: HTMLElement | null;
  rightRailC: HTMLElement | null;
  rightRailD: HTMLElement | null;
  waveformBars: HTMLElement[];
  signalBars: HTMLElement[];
  nodes: HTMLElement[];
};

const MODE_ORDER: KdxObserveV2State[] = ['idle', 'aware', 'locked', 'observing'];

class KdxObserveV2Runtime {
  root: HTMLElement;
  dom: DomRefs;
  gl: WebGL2RenderingContext | null = null;
  programs: Record<string, ProgramDef> | null = null;
  quad: WebGLBuffer | null = null;
  fbSource: Fbo | null = null;
  fbDisplace: Fbo | null = null;
  fbThreshold: Fbo | null = null;
  fbChroma: Fbo | null = null;
  fbPrev: Fbo | null = null;
  fbNext: Fbo | null = null;
  raf = 0;
  running = false;
  lastNow = 0;
  profile: KdxObserveV2Profile;
  debugEnabled = false;
  reducedMotion = false;
  protocolOpen = false;
  webglActive = false;
  fallbackActive = true;
  pointer = { x: 0, y: 0, vx: 0, vy: 0, activeUntil: 0 };
  sceneState: ObserveSceneState;
  metrics: Metrics;
  frameSamples: number[] = [];
  refreshSamples: number[] = [];
  droppedFrames = 0;
  lastInteraction = 0;
  lockedUntil = 0;
  phase = Math.random() * Math.PI * 2;
  timeouts = new Set<number>();
  forceFallback = false;
  forcedState: KdxObserveV2State | null = null;
  destroyed = false;
  /**
   * Recuerda si el loop estaba corriendo cuando la pestana se oculto.
   * Sin esto, `visibilitychange` resucitaba runtimes detenidos o destruidos.
   */
  resumeOnVisible = false;
  /** Nodos a los que se engancharon listeners: se guardan para poder soltarlos. */
  navPrev: HTMLElement | null = null;
  navNext: HTMLElement | null = null;
  navIndex: HTMLElement | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    const canvas = root.querySelector<HTMLCanvasElement>('[data-kdx-canvas]');
    if (!canvas) throw new Error('OBSERVE V2 canvas missing');
    this.dom = {
      canvas,
      fallback: root.querySelector('[data-kdx-fallback]'),
      statusChip: root.querySelector('[data-kdx-status-chip]'),
      profileChip: root.querySelector('[data-kdx-profile-chip]'),
      checksumChip: root.querySelector('[data-kdx-checksum-chip]'),
      stateCopy: root.querySelector('[data-kdx-state-copy]'),
      hiddenMessage: root.querySelector('[data-kdx-hidden-message]'),
      protocolCopy: root.querySelector('[data-kdx-protocol-copy]'),
      dossierCopy: root.querySelector('[data-kdx-dossier-copy]'),
      dossierCopyBlock: root.querySelector('[data-kdx-dossier-copy-block]'),
      signalTag: root.querySelector('[data-kdx-signal-tag]'),
      telemetryCopy: root.querySelector('[data-kdx-telemetry-copy]'),
      metricChip: root.querySelector('[data-kdx-metric-chip]'),
      sceneCode: root.querySelector('[data-kdx-scene-code]'),
      sourceReadout: root.querySelector('[data-kdx-source-readout]'),
      acquisitionReadout: root.querySelector('[data-kdx-acquisition-readout]'),
      confidenceReadout: root.querySelector('[data-kdx-confidence-readout]'),
      windowReadout: root.querySelector('[data-kdx-window-readout]'),
      primaryCta: root.querySelector<HTMLButtonElement>('[data-kdx-primary]'),
      secondaryCta: root.querySelector<HTMLButtonElement>('[data-kdx-protocol]'),
      debug: root.querySelector('[data-kdx-debug]'),
      debugText: root.querySelector('[data-kdx-debug-text]'),
      latencyInline: root.querySelector('[data-kdx-latency-inline]'),
      signalReadout: root.querySelector('[data-kdx-signal-readout]'),
      focusReadout: root.querySelector('[data-kdx-focus-readout]'),
      anomalyReadout: root.querySelector('[data-kdx-anomaly-readout]'),
      nodeReadout: root.querySelector('[data-kdx-node-readout]'),
      latencyReadout: root.querySelector('[data-kdx-latency-readout]'),
      checksumReadout: root.querySelector('[data-kdx-checksum-readout]'),
      checksumFoot: root.querySelector('[data-kdx-checksum-foot]'),
      rightRailA: root.querySelector('[data-kdx-right-rail-a]'),
      rightRailB: root.querySelector('[data-kdx-right-rail-b]'),
      rightRailC: root.querySelector('[data-kdx-right-rail-c]'),
      rightRailD: root.querySelector('[data-kdx-right-rail-d]'),
      waveformBars: Array.from(root.querySelectorAll<HTMLElement>('[data-kdx-waveform] i')),
      signalBars: Array.from(root.querySelectorAll<HTMLElement>('[data-kdx-signal-bars] i')),
      nodes: Array.from(root.querySelectorAll<HTMLElement>('[data-kdx-node]')),
    };
    const params = new URLSearchParams(window.location.search);
    this.debugEnabled = params.get('debug') === '1';
    this.forceFallback = params.get('fallback') === '1';
    const forcedState = params.get('state');
    this.forcedState = (forcedState && (MODE_ORDER as readonly string[]).includes(forcedState)) ? (forcedState as KdxObserveV2State) : null;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.profile = this.resolveProfile();
    this.sceneState = {
      mode: 'idle',
      signalStrength: 0.24,
      focusLevel: 0.12,
      anomalyLevel: 0.08,
      nodeCount: 2,
      latency: 42,
      checksum: 'latent',
      pointer: { x: 0, y: 0, vx: 0, vy: 0, active: false },
      reducedMotion: this.reducedMotion,
      performanceProfile: this.profile,
    };
    this.metrics = {
      fps: 0,
      averageFrameTime: 16.7,
      droppedFrames: 0,
      profile: this.profile,
      webglActive: false,
      fallbackActive: true,
      passCount: 6,
      state: 'idle',
      renderFps: 0,
      refreshRateEstimate: 0,
    };
  }

  resolveProfile(): KdxObserveV2Profile {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('profile');
    if (forced && (KDX_OBSERVE_V2_PROFILES as readonly string[]).includes(forced)) return forced as KdxObserveV2Profile;
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    const dpr = window.devicePixelRatio || 1;
    if (this.reducedMotion) return 'low-power';
    if (isMobile && dpr > 2) return 'low-power';
    if (isMobile) return 'balanced';
    return dpr > 1.65 ? 'balanced' : 'full';
  }

  async load() {
    if (this.forceFallback) {
      this.webglActive = false;
      this.fallbackActive = true;
      this.root.dataset.webgl = 'fallback';
      this.dom.canvas.classList.remove('is-active');
    } else {
      this.tryInitGl();
    }
    this.bindEvents();
    this.resize();
    if (this.forcedState) this.setMode(this.forcedState);
    this.applySceneState(true);
    return this;
  }

  tryInitGl() {
    try {
      this.initGL();
      this.createPrograms();
      this.createBuffers();
      this.createTargets();
      this.webglActive = true;
      this.fallbackActive = true;
      this.root.dataset.webgl = 'active';
      this.dom.canvas.classList.add('is-active');
    } catch (error) {
      console.warn('OBSERVE V2 WebGL fallback', error);
      this.webglActive = false;
      this.fallbackActive = true;
      this.root.dataset.webgl = 'fallback';
      this.dom.canvas.classList.remove('is-active');
    }
  }

  start() {
    if (this.running || this.destroyed) return;
    this.running = true;
    const loop = (now: number) => {
      if (!this.running) return;
      this.render(now);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.timeouts.forEach((id) => window.clearTimeout(id));
    this.timeouts.clear();
  }

  bindEvents() {
    window.addEventListener('resize', this.onResize, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.root.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.root.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
    this.root.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.navPrev = this.root.querySelector('[data-kdx-prev]');
    this.navNext = this.root.querySelector('[data-kdx-next]');
    this.navIndex = this.root.querySelector('[data-kdx-index]');
    this.navPrev?.addEventListener('click', this.onPrevClick);
    this.navNext?.addEventListener('click', this.onNextClick);
    this.navIndex?.addEventListener('click', this.onIndexClick);
    this.dom.primaryCta?.addEventListener('click', this.onPrimaryClick);
    this.dom.secondaryCta?.addEventListener('click', this.onSecondaryClick);
  }

  /** Espejo exacto de `bindEvents`: cada alta tiene aqui su baja. */
  unbindEvents() {
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.root.removeEventListener('pointermove', this.onPointerMove);
    this.root.removeEventListener('pointerleave', this.onPointerLeave);
    this.root.removeEventListener('touchstart', this.onTouchStart);
    this.navPrev?.removeEventListener('click', this.onPrevClick);
    this.navNext?.removeEventListener('click', this.onNextClick);
    this.navIndex?.removeEventListener('click', this.onIndexClick);
    this.dom.primaryCta?.removeEventListener('click', this.onPrimaryClick);
    this.dom.secondaryCta?.removeEventListener('click', this.onSecondaryClick);
    this.navPrev = null;
    this.navNext = null;
    this.navIndex = null;
  }

  onResize = () => {
    this.resize();
  };

  onVisibilityChange = () => {
    if (document.hidden) {
      this.resumeOnVisible = this.running;
      this.stop();
      return;
    }
    // Solo revive lo que estaba vivo: un runtime destruido o detenido a
    // proposito no vuelve a arrancar por volver a la pestana.
    if (this.destroyed || !this.resumeOnVisible) return;
    this.resumeOnVisible = false;
    this.start();
  };

  onPrevClick = () => {
    this.stepMode(-1);
  };

  onNextClick = () => {
    this.stepMode(1);
  };

  onIndexClick = () => {
    window.location.href = '/kodex/';
  };

  onPrimaryClick = () => {
    this.advancePrimary();
  };

  onSecondaryClick = () => {
    this.protocolOpen = !this.protocolOpen;
    this.root.classList.toggle('is-protocol-open', this.protocolOpen);
    if (this.protocolOpen && this.sceneState.mode === 'idle') this.setMode('aware');
  };

  /**
   * Cierre del ciclo `load -> start/stop -> destroy`.
   * Idempotente: llamarlo dos veces no rompe nada.
   */
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.resumeOnVisible = false;
    this.stop();
    this.unbindEvents();
    this.destroyGl();
    mounted.delete(this.root);
  }

  /** Suelta programas, shaders, buffer y targets, y pierde el contexto. */
  destroyGl() {
    const gl = this.gl;
    if (!gl) return;
    if (this.programs) {
      Object.values(this.programs).forEach(({ program, shaders }) => {
        shaders.forEach((shader) => {
          gl.detachShader(program, shader);
          gl.deleteShader(shader);
        });
        gl.deleteProgram(program);
      });
      this.programs = null;
    }
    if (this.quad) {
      gl.deleteBuffer(this.quad);
      this.quad = null;
    }
    ([
      'fbSource',
      'fbDisplace',
      'fbThreshold',
      'fbChroma',
      'fbPrev',
      'fbNext',
    ] as const).forEach((key) => {
      const target = this[key];
      if (!target) return;
      if (target.tex) gl.deleteTexture(target.tex);
      if (target.fb) gl.deleteFramebuffer(target.fb);
      this[key] = null;
    });
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    this.gl = null;
    this.webglActive = false;
  }

  onPointerMove = (event: PointerEvent) => {
    const rect = this.root.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    this.pointer.vx = x - this.pointer.x;
    this.pointer.vy = y - this.pointer.y;
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.activeUntil = performance.now() + 1400;
    this.lastInteraction = performance.now();
    if (this.sceneState.mode === 'idle') this.setMode('aware');
  };

  onPointerLeave = () => {
    this.pointer.activeUntil = performance.now() + 180;
  };

  onTouchStart = () => {
    this.lastInteraction = performance.now();
    if (this.sceneState.mode === 'idle') this.setMode('aware');
    else if (this.sceneState.mode === 'aware') this.setMode('locked');
  };

  advancePrimary() {
    if (this.sceneState.mode === 'idle') this.setMode('aware');
    else if (this.sceneState.mode === 'aware') this.setMode('locked');
    else if (this.sceneState.mode === 'locked') this.setMode('observing');
    else this.pulseAnomaly(0.2);
  }

  stepMode(direction: 1 | -1) {
    const nextIndex = Math.max(0, Math.min(MODE_ORDER.length - 1, MODE_ORDER.indexOf(this.sceneState.mode) + direction));
    this.setMode(MODE_ORDER[nextIndex]);
  }

  setMode(mode: KdxObserveV2State) {
    this.sceneState.mode = mode;
    this.metrics.state = mode;
    if (mode === 'locked' && this.forcedState !== 'locked') {
      this.lockedUntil = performance.now() + 1000;
      const id = window.setTimeout(() => {
        if (this.sceneState.mode === 'locked') this.setMode('observing');
        this.timeouts.delete(id);
      }, 820);
      this.timeouts.add(id);
    }
    this.applySceneState();
  }

  pulseAnomaly(amount: number) {
    this.sceneState.anomalyLevel = Math.min(1, this.sceneState.anomalyLevel + amount);
  }

  resize() {
    const scale = OBSERVE_V2_PROFILE_SCALE[this.profile];
    const dpr = Math.min(scale.dpr, window.devicePixelRatio || 1, this.profile === 'full' ? 1.5 : 1.2);
    const width = Math.max(1, Math.floor(this.dom.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(this.dom.canvas.clientHeight * dpr));
    this.dom.canvas.width = width;
    this.dom.canvas.height = height;
    if (this.webglActive) {
      [this.fbSource, this.fbDisplace, this.fbThreshold, this.fbChroma, this.fbPrev, this.fbNext]
        .filter(Boolean)
        .forEach((target) => this.sizeTarget(target as Fbo, width, height));
    }
  }

  render(now: number) {
    const deltaMs = this.lastNow ? now - this.lastNow : 16.7;
    this.lastNow = now;
    this.updateState(now, deltaMs);
    if (this.webglActive) this.renderGl(now, deltaMs);
    this.paintTelemetry(now);
    this.measureMetrics(deltaMs);
    this.applySceneState();
  }

  updateState(now: number, deltaMs: number) {
    const delta = Math.min(0.05, deltaMs / 1000);
    const active = this.pointer.activeUntil > now;
    this.sceneState.pointer = { x: this.pointer.x, y: this.pointer.y, vx: this.pointer.vx, vy: this.pointer.vy, active };
    const interaction = Math.min(1, Math.hypot(this.pointer.vx, this.pointer.vy) * 16 + (active ? 0.25 : 0));
    const breathe = (Math.sin(now * 0.0012 + this.phase) + 1) * 0.5;

    if (!this.forcedState && this.sceneState.mode === 'aware' && !active && now - this.lastInteraction > 3200) this.setMode('idle');
    if (!this.forcedState && this.sceneState.mode === 'locked' && now > this.lockedUntil) this.setMode('observing');

    const targets: Record<KdxObserveV2State, { signal: number; focus: number; anomaly: number; nodes: number; latency: number; checksum: ObserveChecksum }> = {
      idle: { signal: 0.24, focus: 0.14, anomaly: 0.08, nodes: 2, latency: 42, checksum: 'latent' },
      aware: { signal: 0.48, focus: 0.42, anomaly: 0.16, nodes: 4, latency: 28, checksum: 'pending' },
      locked: { signal: 0.82, focus: 0.84, anomaly: 0.24, nodes: 6, latency: 18, checksum: 'verified' },
      observing: { signal: 0.72, focus: 0.94, anomaly: 0.34, nodes: 8, latency: 14, checksum: 'verified' },
    };

    const target = targets[this.sceneState.mode];
    const motionFactor = this.reducedMotion ? 0.35 : 1;
    this.sceneState.signalStrength += (target.signal + breathe * 0.08 * motionFactor + interaction * 0.15 - this.sceneState.signalStrength) * 0.08;
    this.sceneState.focusLevel += (target.focus + interaction * 0.12 - this.sceneState.focusLevel) * 0.1;
    this.sceneState.anomalyLevel += (target.anomaly + Math.max(0, Math.sin(now * 0.005)) * 0.08 * (this.sceneState.mode === 'observing' ? 1 : 0.4) - this.sceneState.anomalyLevel) * 0.08;
    this.sceneState.latency += (target.latency + (1 - interaction) * 3 - this.sceneState.latency) * 0.12;
    this.sceneState.nodeCount += (target.nodes - this.sceneState.nodeCount) * 0.12;
    this.sceneState.checksum = target.checksum;

    this.pointer.vx *= this.reducedMotion ? 0.75 : 0.86;
    this.pointer.vy *= this.reducedMotion ? 0.75 : 0.86;

    if (this.reducedMotion) {
      this.sceneState.anomalyLevel = Math.min(this.sceneState.anomalyLevel, target.anomaly + 0.06);
    }
  }

  paintTelemetry(now: number) {
    const wave = this.dom.waveformBars;
    const bars = this.dom.signalBars;
    const signal = this.sceneState.signalStrength;
    const focus = this.sceneState.focusLevel;
    const anomaly = this.sceneState.anomalyLevel;
    wave.forEach((bar, index) => {
      const t = index / Math.max(1, wave.length - 1);
      const wobble = Math.sin(now * 0.006 + t * 9 + signal * 6) * 0.18;
      const value = Math.max(0.16, Math.min(1, 0.18 + signal * 0.4 + focus * (1 - Math.abs(0.5 - t)) * 0.48 + wobble));
      bar.style.setProperty('--bar', value.toFixed(3));
    });
    bars.forEach((bar, index) => {
      const threshold = (index + 1) / bars.length;
      const value = Math.max(0.08, Math.min(1, signal + anomaly * 0.25 - threshold * 0.25));
      bar.style.setProperty('--bar', value.toFixed(3));
      bar.style.setProperty('--active', value > 0.34 ? '1' : '0.2');
    });
    this.dom.nodes.forEach((node, index) => {
      const activeCount = Math.round(this.sceneState.nodeCount);
      const active = index < activeCount;
      node.style.setProperty('--node-active', active ? '1' : '0.2');
      node.style.setProperty('--node-scale', active ? String(0.82 + signal * 0.42) : '0.72');
    });
  }

  measureMetrics(deltaMs: number) {
    this.frameSamples.push(deltaMs);
    this.refreshSamples.push(deltaMs);
    if (this.frameSamples.length > 48) this.frameSamples.shift();
    if (this.refreshSamples.length > 96) this.refreshSamples.shift();
    if (deltaMs > 34) this.droppedFrames += 1;
    const avgFrame = this.frameSamples.reduce((sum, v) => sum + v, 0) / this.frameSamples.length;
    const avgRefresh = this.refreshSamples.reduce((sum, v) => sum + v, 0) / this.refreshSamples.length;
    this.metrics.averageFrameTime = avgFrame;
    this.metrics.renderFps = Math.round(1000 / avgFrame);
    this.metrics.refreshRateEstimate = Math.round(1000 / avgRefresh);
    this.metrics.fps = this.metrics.renderFps;
    this.metrics.droppedFrames = this.droppedFrames;
    this.metrics.profile = this.profile;
    this.metrics.webglActive = this.webglActive;
    this.metrics.fallbackActive = this.fallbackActive;
    this.metrics.passCount = this.webglActive ? 6 : 0;
    this.metrics.state = this.sceneState.mode;
    (window as Window & { KODEX_OBSERVE_METRICS?: Metrics; __KDX_OBSERVE_V2__?: unknown }).KODEX_OBSERVE_METRICS = { ...this.metrics };
    this.root.setAttribute('data-kdx-fps', String(this.metrics.fps));
    this.root.setAttribute('data-kdx-frame-time', this.metrics.averageFrameTime.toFixed(2));
    this.root.setAttribute('data-kdx-dropped', String(this.metrics.droppedFrames));
    this.root.setAttribute('data-kdx-render-fps', String(this.metrics.renderFps));
    this.root.setAttribute('data-kdx-refresh', String(this.metrics.refreshRateEstimate));
    this.root.setAttribute('data-kdx-metrics-json', JSON.stringify(this.metrics));
    (window as Window & { __KDX_OBSERVE_V2__?: unknown }).__KDX_OBSERVE_V2__ = {
      metrics: { ...this.metrics },
      state: this.sceneState.mode,
      scene: { ...this.sceneState },
    };
  }

  applySceneState(force = false) {
    const copy = OBSERVE_V2_COPY[this.sceneState.mode];
    const modeIndex = OBSERVE_MODE_INDEX[this.sceneState.mode];
    this.root.dataset.webgl = this.webglActive ? 'active' : 'fallback';
    this.root.dataset.state = this.sceneState.mode;
    this.root.dataset.checksum = this.sceneState.checksum;
    this.root.setAttribute('data-kdx-scroll-height', String(document.documentElement.scrollHeight));
    this.root.setAttribute('data-kdx-inner-height', String(window.innerHeight));
    this.root.setAttribute('data-kdx-overflow', document.documentElement.scrollHeight > window.innerHeight ? '1' : '0');
    this.root.style.setProperty('--signal-strength', this.sceneState.signalStrength.toFixed(3));
    this.root.style.setProperty('--focus-level', this.sceneState.focusLevel.toFixed(3));
    this.root.style.setProperty('--anomaly-level', this.sceneState.anomalyLevel.toFixed(3));
    this.root.style.setProperty('--node-count', String(Math.round(this.sceneState.nodeCount)));
    this.root.style.setProperty('--latency-ms', `${this.sceneState.latency.toFixed(1)}ms`);
    this.root.style.setProperty('--mode-index', String(modeIndex));
    this.root.classList.toggle('is-protocol-open', this.protocolOpen);
    this.root.classList.toggle('is-webgl-active', this.webglActive);
    this.root.classList.toggle('is-fallback-active', this.fallbackActive);

    if (this.dom.statusChip) this.dom.statusChip.textContent = copy.chip;
    if (this.dom.profileChip) this.dom.profileChip.textContent = `PROFILE · ${this.profile.toUpperCase()}`;
    if (this.dom.checksumChip) this.dom.checksumChip.textContent = `CHECKSUM · ${this.sceneState.checksum.toUpperCase()}`;
    if (this.dom.stateCopy) this.dom.stateCopy.textContent = copy.message;
    if (this.dom.hiddenMessage) this.dom.hiddenMessage.textContent = copy.hidden;
    if (this.dom.protocolCopy) this.dom.protocolCopy.textContent = copy.protocol;
    if (this.dom.dossierCopy) this.dom.dossierCopy.textContent = copy.dossier;
    if (this.dom.dossierCopyBlock) this.dom.dossierCopyBlock.textContent = copy.dossier;
    if (this.dom.primaryCta) this.dom.primaryCta.textContent = copy.cta;
    if (this.dom.signalReadout) this.dom.signalReadout.textContent = `${Math.round(this.sceneState.signalStrength * 100)}%`;
    if (this.dom.focusReadout) this.dom.focusReadout.textContent = `${Math.round(this.sceneState.focusLevel * 100)}%`;
    if (this.dom.anomalyReadout) this.dom.anomalyReadout.textContent = `${Math.round(this.sceneState.anomalyLevel * 100)}%`;
    if (this.dom.nodeReadout) this.dom.nodeReadout.textContent = String(Math.round(this.sceneState.nodeCount)).padStart(2, '0');
    if (this.dom.latencyReadout) this.dom.latencyReadout.textContent = `${Math.round(this.sceneState.latency)}MS`;
    if (this.dom.latencyInline) this.dom.latencyInline.textContent = `${Math.round(this.sceneState.latency)}MS`;
    if (this.dom.checksumReadout) this.dom.checksumReadout.textContent = this.sceneState.checksum.toUpperCase();
    if (this.dom.checksumFoot) this.dom.checksumFoot.textContent = this.sceneState.checksum.toUpperCase();
    if (this.dom.signalTag) this.dom.signalTag.textContent = `MODE ${this.sceneState.mode.toUpperCase()} · CORE ${Math.round(this.sceneState.signalStrength * 100)} · NODES ${Math.round(this.sceneState.nodeCount)}`;
    if (this.dom.telemetryCopy) this.dom.telemetryCopy.textContent = `FOCUS ${Math.round(this.sceneState.focusLevel * 100)} · ANOMALY ${Math.round(this.sceneState.anomalyLevel * 100)} · CHECKSUM ${this.sceneState.checksum.toUpperCase()}`;
    if (this.dom.metricChip) this.dom.metricChip.textContent = `${this.webglActive ? 'WEBGL ACTIVE' : 'SVG FALLBACK'} · PASS ${this.webglActive ? '06' : '00'} · ${this.metrics.fps || 0} FPS`;
    if (this.dom.sourceReadout) this.dom.sourceReadout.textContent = this.sceneState.mode === 'idle' ? 'UNKNOWN' : 'RELATIONAL FIELD';
    if (this.dom.acquisitionReadout) this.dom.acquisitionReadout.textContent = this.sceneState.mode === 'observing' ? 'ACTIVE FEEDBACK' : this.sceneState.mode === 'locked' ? 'TARGET LOCK' : this.sceneState.mode === 'aware' ? 'PRESENCE SWEEP' : 'PASSIVE LISTEN';
    if (this.dom.confidenceReadout) this.dom.confidenceReadout.textContent = this.sceneState.mode === 'observing' ? 'HIGH' : this.sceneState.mode === 'locked' ? 'STABLE' : this.sceneState.mode === 'aware' ? 'RISING' : 'LOW';
    if (this.dom.windowReadout) this.dom.windowReadout.textContent = `${Math.max(0.5, this.metrics.averageFrameTime / 10).toFixed(1).padStart(5, '0')}S`;
    if (this.dom.rightRailA) this.dom.rightRailA.textContent = `SOURCE · ${this.sceneState.mode === 'idle' ? 'UNKNOWN' : 'DETECTED'}`;
    if (this.dom.rightRailB) this.dom.rightRailB.textContent = `MODE · ${this.sceneState.mode.toUpperCase()}`;
    if (this.dom.rightRailC) this.dom.rightRailC.textContent = `FIELD · ${this.sceneState.checksum.toUpperCase()}`;
    if (this.dom.rightRailD) this.dom.rightRailD.textContent = this.webglActive ? 'RENDER · MULTIPASS' : 'RENDER · SVG FALLBACK';
    if ((force || this.debugEnabled) && this.dom.debug) this.dom.debug.hidden = !this.debugEnabled;
    this.updateDebug();
  }

  updateDebug() {
    if (!this.debugEnabled || !this.dom.debugText || !this.dom.debug) return;
    this.dom.debug.hidden = false;
    this.dom.debugText.textContent = [
      `mode=${this.sceneState.mode}`,
      `profile=${this.profile}`,
      `webglActive=${this.webglActive}`,
      `fallbackActive=${this.fallbackActive}`,
      `checksum=${this.sceneState.checksum}`,
      `signal=${this.sceneState.signalStrength.toFixed(3)}`,
      `focus=${this.sceneState.focusLevel.toFixed(3)}`,
      `anomaly=${this.sceneState.anomalyLevel.toFixed(3)}`,
      `nodes=${this.sceneState.nodeCount.toFixed(2)}`,
      `latency=${this.sceneState.latency.toFixed(1)}ms`,
      `fps=${this.metrics.fps}`,
      `avgFrame=${this.metrics.averageFrameTime.toFixed(2)}ms`,
      `refresh≈${this.metrics.refreshRateEstimate}hz`,
      `dropped=${this.metrics.droppedFrames}`,
      `passCount=${this.metrics.passCount}`,
      `pointer=${this.pointer.x.toFixed(2)},${this.pointer.y.toFixed(2)}`,
      `fallbackReason=${this.webglActive ? 'none' : 'webgl-unavailable-or-init-failed'}`,
      `json=${JSON.stringify(this.metrics)}`,
    ].join('\n');
  }

  renderGl(now: number, deltaMs: number) {
    if (!this.gl || !this.programs || !this.fbSource || !this.fbDisplace || !this.fbThreshold || !this.fbChroma || !this.fbPrev || !this.fbNext) return;
    const gl = this.gl;
    const width = this.dom.canvas.width;
    const height = this.dom.canvas.height;
    const delta = Math.min(0.05, deltaMs / 1000);
    const common = {
      u_time: now / 1000,
      u_delta: delta,
      u_resolution: [width, height],
      u_pointer: [this.pointer.x, this.pointer.y],
      u_pointerVelocity: [this.pointer.vx, this.pointer.vy],
      u_audioLow: this.sceneState.signalStrength,
      u_audioMid: this.sceneState.focusLevel,
      u_audioHigh: this.sceneState.anomalyLevel,
      u_state: 0.12 + OBSERVE_MODE_INDEX[this.sceneState.mode] * 0.28,
      u_transition: this.sceneState.focusLevel,
      u_intensity: 0.2 + this.sceneState.signalStrength * 0.88,
      u_seed: 4.137,
      u_feedbackAmount: 0.12 + this.sceneState.focusLevel * 0.34,
      u_scanPosition: 0.22 + this.sceneState.signalStrength * 0.56,
      u_reducedMotion: this.reducedMotion ? 1 : 0,
    };

    this.pass(this.programs.source, this.fbSource, (u) => {
      this.setCommonUniforms(u, common);
      gl.uniform1f(u.u_particleScale, OBSERVE_V2_PROFILE_SCALE[this.profile].particles);
    });
    this.pass(this.programs.displace, this.fbDisplace, (u) => {
      this.bindTexture(u.u_tex, this.fbSource!.tex, 0);
      gl.uniform1f(u.u_time, common.u_time);
      gl.uniform2f(u.u_resolution, width, height);
      gl.uniform2f(u.u_pointer, this.pointer.x, this.pointer.y);
      gl.uniform1f(u.u_audioMid, this.sceneState.focusLevel);
      gl.uniform1f(u.u_intensity, common.u_intensity);
      gl.uniform1f(u.u_reducedMotion, this.reducedMotion ? 1 : 0);
    });
    this.pass(this.programs.threshold, this.fbThreshold, (u) => {
      this.bindTexture(u.u_tex, this.fbDisplace!.tex, 0);
      gl.uniform2f(u.u_resolution, width, height);
      gl.uniform1f(u.u_audioHigh, this.sceneState.anomalyLevel);
      gl.uniform1f(u.u_intensity, common.u_intensity);
    });
    this.pass(this.programs.chroma, this.fbChroma, (u) => {
      this.bindTexture(u.u_tex, this.fbThreshold!.tex, 0);
      gl.uniform2f(u.u_resolution, width, height);
      gl.uniform2f(u.u_pointer, this.pointer.x, this.pointer.y);
      gl.uniform1f(u.u_transition, this.sceneState.focusLevel);
      gl.uniform1f(u.u_audioHigh, this.sceneState.anomalyLevel);
    });
    this.pass(this.programs.feedback, this.fbNext, (u) => {
      this.bindTexture(u.u_scene, this.fbChroma!.tex, 0);
      this.bindTexture(u.u_prev, this.fbPrev!.tex, 1);
      gl.uniform2f(u.u_resolution, width, height);
      gl.uniform2f(u.u_pointerVelocity, this.pointer.vx, this.pointer.vy);
      gl.uniform1f(u.u_feedbackAmount, common.u_feedbackAmount);
      gl.uniform1f(u.u_time, common.u_time);
      gl.uniform1f(u.u_transition, this.sceneState.focusLevel);
      gl.uniform1f(u.u_reducedMotion, this.reducedMotion ? 1 : 0);
    });
    this.pass(this.programs.crt, null, (u) => {
      this.bindTexture(u.u_tex, this.fbNext!.tex, 0);
      gl.uniform2f(u.u_resolution, width, height);
      gl.uniform1f(u.u_time, common.u_time);
      gl.uniform1f(u.u_scanPosition, common.u_scanPosition);
      gl.uniform1f(u.u_intensity, common.u_intensity);
      gl.uniform1f(u.u_reducedMotion, this.reducedMotion ? 1 : 0);
    });
    [this.fbPrev, this.fbNext] = [this.fbNext, this.fbPrev];
  }

  initGL() {
    const gl = this.dom.canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: true,
      powerPreference: this.profile === 'full' ? 'high-performance' : 'default',
    });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;
  }

  createPrograms() {
    this.programs = {
      source: this.createProgram(fullscreenVert, sourceFrag),
      displace: this.createProgram(fullscreenVert, displaceFrag),
      threshold: this.createProgram(fullscreenVert, thresholdFrag),
      chroma: this.createProgram(fullscreenVert, chromaFrag),
      feedback: this.createProgram(fullscreenVert, feedbackFrag),
      crt: this.createProgram(fullscreenVert, crtFrag),
    };
  }

  createBuffers() {
    const gl = this.gl!;
    this.quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  }

  createTargets() {
    this.fbSource = this.createTarget();
    this.fbDisplace = this.createTarget();
    this.fbThreshold = this.createTarget();
    this.fbChroma = this.createTarget();
    this.fbPrev = this.createTarget();
    this.fbNext = this.createTarget();
  }

  createProgram(vertexSource: string, fragmentSource: string): ProgramDef {
    const gl = this.gl!;
    const vertex = this.compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = this.compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error('Program allocation failed');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.bindAttribLocation(program, 0, 'a_position');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed');
    const uniforms: UniformMap = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let index = 0; index < count; index += 1) {
      const info = gl.getActiveUniform(program, index);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms, shaders: [vertex, fragment] };
  }

  compile(type: number, source: string) {
    const gl = this.gl!;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Shader allocation failed');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile failed');
    return shader;
  }

  createTarget(): Fbo {
    const gl = this.gl!;
    const tex = gl.createTexture();
    const fb = gl.createFramebuffer();
    if (!tex || !fb) throw new Error('Framebuffer allocation failed');
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fb, tex, width: 0, height: 0 };
  }

  sizeTarget(target: Fbo, width: number, height: number) {
    if (target.width === width && target.height === height) return;
    const gl = this.gl!;
    target.width = width;
    target.height = height;
    gl.bindTexture(gl.TEXTURE_2D, target.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }

  pass(program: ProgramDef, target: Fbo | null, applyUniforms: (uniforms: UniformMap) => void) {
    const gl = this.gl!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fb : null);
    gl.viewport(0, 0, this.dom.canvas.width, this.dom.canvas.height);
    gl.useProgram(program.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    applyUniforms(program.uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  bindTexture(uniform: WebGLUniformLocation | null | undefined, texture: WebGLTexture | null, unit: number) {
    const gl = this.gl!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (uniform) gl.uniform1i(uniform, unit);
  }

  setCommonUniforms(uniforms: UniformMap, common: Record<string, number | number[]>) {
    const gl = this.gl!;
    const resolution = common.u_resolution as [number, number];
    const pointer = common.u_pointer as [number, number];
    const pointerVelocity = common.u_pointerVelocity as [number, number];
    gl.uniform1f(uniforms.u_time, common.u_time as number);
    gl.uniform1f(uniforms.u_delta, common.u_delta as number);
    gl.uniform2f(uniforms.u_resolution, resolution[0], resolution[1]);
    gl.uniform2f(uniforms.u_pointer, pointer[0], pointer[1]);
    gl.uniform2f(uniforms.u_pointerVelocity, pointerVelocity[0], pointerVelocity[1]);
    gl.uniform1f(uniforms.u_audioLow, common.u_audioLow as number);
    gl.uniform1f(uniforms.u_audioMid, common.u_audioMid as number);
    gl.uniform1f(uniforms.u_audioHigh, common.u_audioHigh as number);
    gl.uniform1f(uniforms.u_state, common.u_state as number);
    gl.uniform1f(uniforms.u_transition, common.u_transition as number);
    gl.uniform1f(uniforms.u_intensity, common.u_intensity as number);
    gl.uniform1f(uniforms.u_seed, common.u_seed as number);
    gl.uniform1f(uniforms.u_feedbackAmount, common.u_feedbackAmount as number);
    gl.uniform1f(uniforms.u_scanPosition, common.u_scanPosition as number);
    gl.uniform1f(uniforms.u_reducedMotion, common.u_reducedMotion as number);
  }
}

const mounted = new WeakMap<HTMLElement, KdxObserveV2Runtime>();

let swapHookInstalled = false;

/** Runtime montado en un root, si lo hay. Para teardown manual, debug y pruebas. */
export function getKodexObserveV2Runtime(root: HTMLElement): KdxObserveV2Runtime | null {
  return mounted.get(root) ?? null;
}

/**
 * Desmonta las escenas vivas del documento actual.
 * Astro reemplaza el elemento en cada navegacion: sin esto el runtime viejo
 * seguia con su loop, sus listeners y su contexto WebGL mientras el nuevo ya
 * habia arrancado.
 */
export function destroyKodexObserveV2Scenes() {
  document.querySelectorAll<HTMLElement>('[data-kdx-observe-v2]').forEach((root) => {
    mounted.get(root)?.destroy();
  });
}

export function mountKodexObserveV2Scenes() {
  if (!swapHookInstalled) {
    swapHookInstalled = true;
    document.addEventListener('astro:before-swap', destroyKodexObserveV2Scenes);
  }
  document.querySelectorAll<HTMLElement>('[data-kdx-observe-v2]').forEach((root) => {
    if (mounted.has(root)) return;
    const runtime = new KdxObserveV2Runtime(root);
    runtime.load().then(() => runtime.start());
    mounted.set(root, runtime);
  });
}
