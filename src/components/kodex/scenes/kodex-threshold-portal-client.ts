import { KdxThresholdPortalRuntime } from '../../../kodex/threshold-portal/runtime/KdxThresholdPortalRuntime.js';
import { THRESHOLD_PORTAL_CONFIG } from '../../../kodex/threshold-portal/config.js';

const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));

const STATE_ORDER = ['DORMANT', 'AWARE', 'OPEN'];

const KICKER = {
  DORMANT: '00 · THRESHOLD / ENTRANCE PROTOCOL',
  AWARE: '01 · PRESENCE DETECTED',
  OPEN: '02 · PORTAL ACTIVE',
} as const;

const TITLE = {
  DORMANT: 'THE SYSTEM\nAWAITS.',
  AWARE: 'SCANNING...\nSIGNAL PRESENT',
  OPEN: 'THRESHOLD\nBREACHED',
} as const;

class KdxThresholdPortalController {
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly controls: HTMLElement | null;
  private readonly debugNode: HTMLOutputElement | null;
  private readonly stateChip: HTMLElement | null;
  private readonly kicker: HTMLElement | null;
  private readonly title: HTMLElement | null;
  private readonly copy: HTMLElement | null;
  private readonly primary: HTMLButtonElement | null;
  private readonly progressNodes: HTMLElement[];
  private readonly seedReadout: HTMLElement | null;
  private readonly elapsedReadout: HTMLElement | null;
  private readonly dataRow: HTMLElement | null;
  private runtime: KdxThresholdPortalRuntime | null = null;
  private raf = 0;
  private lastInteraction = 0;
  private idleTimer = 0;
  private reducedMotion = false;
  private breathe = 0;
  private pulse = 0;
  private pointerActive = false;

  constructor(root: HTMLElement) {
    this.root = root;
    const canvas = root.querySelector<HTMLCanvasElement>('[data-kdx-canvas]');
    if (!canvas) throw new Error('Threshold Portal canvas not found');
    this.canvas = canvas;
    this.controls = root.querySelector('[data-kdx-controls]');
    this.debugNode = root.querySelector('[data-kdx-debug]');
    this.stateChip = root.querySelector('[data-kdx-state]');
    this.kicker = root.querySelector('.kdx-kicker');
    this.title = root.querySelector('.kdx-title');
    this.copy = root.querySelector('.kdx-copy');
    this.primary = root.querySelector('[data-kdx-primary]');
    this.progressNodes = Array.from(root.querySelectorAll('.kdx-progress__node'));
    this.seedReadout = root.querySelector('[data-kdx-seed]');
    this.elapsedReadout = root.querySelector('[data-kdx-elapsed]');
    this.dataRow = root.querySelector('.kdx-data-row');
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.init();
  }

  private async init(): Promise<void> {
    this.canvas.width = this.canvas.clientWidth || window.innerWidth;
    this.canvas.height = this.canvas.clientHeight || window.innerHeight;

    this.runtime = new KdxThresholdPortalRuntime(this.canvas);
    try {
      await this.runtime.load();
    } catch (error) {
      console.error('ThresholdPortal load error:', error);
      this.root.dataset.webgl = 'fallback';
      return;
    }
    this.bindControls();
    this.bindLifecycle();
    this.runtime.start();
    this.startAnimationLoop();
  }

  private bindControls(): void {
    const ctlState = this.controls?.querySelector<HTMLSelectElement>('[data-ctl-state]');
    const ctlSeed = this.controls?.querySelector<HTMLInputElement>('[data-ctl-seed]');
    const ctlMotion = this.controls?.querySelector<HTMLSelectElement>('[data-ctl-motion]');
    const ctlQuality = this.controls?.querySelector<HTMLSelectElement>('[data-ctl-quality]');
    const ctlBass = this.controls?.querySelector<HTMLInputElement>('[data-ctl-bass]');
    const ctlCapture = this.controls?.querySelector<HTMLButtonElement>('[data-ctl-capture]');

    ctlState?.addEventListener('change', () => {
      if (!this.runtime) return;
      this.setPortalState(ctlState.value);
    });

    ctlSeed?.addEventListener('input', () => {
      this.runtime?.setSeed(parseFloat(ctlSeed.value) || THRESHOLD_PORTAL_CONFIG.defaultSeed);
    });

    ctlMotion?.addEventListener('change', () => {
      this.runtime?.setMotionMode(ctlMotion.value as any);
    });

    ctlQuality?.addEventListener('change', () => {
      this.runtime?.setQualityLevel(ctlQuality.value as any);
    });

    ctlBass?.addEventListener('input', () => {
      this.runtime?.setBass(parseFloat(ctlBass.value) || 0);
    });

    ctlCapture?.addEventListener('click', () => {
      const dataUrl = this.runtime?.captureFrame();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `kdx-threshold-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    });

    this.root.addEventListener('pointermove', (event) => {
      this.lastInteraction = performance.now();
      this.pointerActive = true;
      const rect = this.root.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      this.runtime?.setPointer(x, y);
      if (this.runtime?.state?.phaseName === 'DORMANT') {
        this.setPortalState('AWARE');
      }
    }, { passive: true });

    this.root.addEventListener('pointerleave', () => {
      this.pointerActive = false;
    }, { passive: true });

    this.root.addEventListener('touchstart', () => {
      this.lastInteraction = performance.now();
      if (this.runtime?.state?.phaseName === 'DORMANT') {
        this.setPortalState('AWARE');
      } else if (this.runtime?.state?.phaseName === 'AWARE') {
        this.setPortalState('OPEN');
      }
    }, { passive: true });

    this.primary?.addEventListener('click', () => {
      if (!this.runtime) return;
      const current = this.runtime.state.phaseName;
      if (current === 'DORMANT') this.setPortalState('AWARE');
      else if (current === 'AWARE') this.setPortalState('OPEN');
      else this.setPortalState('DORMANT');
    });

    const index = this.root.querySelector<HTMLButtonElement>('[data-kodex-index]');
    index?.addEventListener('click', () => {
      window.location.href = '/kodex/';
    });

    const next = this.root.querySelector<HTMLButtonElement>('[data-kodex-next]');
    next?.addEventListener('click', () => {
      window.location.href = '/kodex/folio/i/';
    });
  }

  private bindLifecycle(): void {
    document.addEventListener('visibilitychange', () => {
      if (!this.runtime) return;
      if (document.hidden) {
        this.runtime.stop();
      } else {
        this.runtime.start();
      }
    });
  }

  private setPortalState(name: string): void {
    if (!this.runtime) return;
    this.runtime.setState(name);
    this.root.dataset.state = name;
    this.updateUI();
    this.syncControls();
  }

  private syncControls(): void {
    if (!this.runtime) return;
    const ctlState = this.controls?.querySelector<HTMLSelectElement>('[data-ctl-state]');
    if (ctlState) ctlState.value = this.runtime.state.phaseName;
  }

  private startAnimationLoop(): void {
    const tick = () => {
      if (!this.runtime) return;
      this.updateTelemetry();
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  private updateTelemetry(): void {
    const now = performance.now();
    const m = this.runtime!.getMetrics();

    this.pulse = 0.5 + 0.5 * Math.sin(now * 0.002);
    this.breathe = 0.5 + 0.5 * Math.sin(now * 0.0015 + m.seed * 6.283);

    const sinceInteraction = now - this.lastInteraction;
    if (m.phaseName === 'AWARE' && !this.pointerActive && sinceInteraction > 3000) {
      this.setPortalState('DORMANT');
    }

    const stateIndex = STATE_ORDER.indexOf(m.phaseName);
    this.root.style.setProperty('--portal-state', String(stateIndex));
    this.root.style.setProperty('--portal-breathe', this.breathe.toFixed(3));
    this.root.style.setProperty('--portal-pulse', this.pulse.toFixed(3));
    this.root.style.setProperty('--portal-fps', String(m.fps));
    this.root.style.setProperty('--portal-frame-time', m.frameTime.toFixed(2));
    this.root.style.setProperty('--portal-seed', m.seed.toFixed(3));
    this.root.style.setProperty('--portal-elapsed', (m.elapsedMs / 1000).toFixed(1));
    this.root.style.setProperty('--portal-motion', String(m.motionMode === 'reduced' || m.motionMode === 'low-power' ? 0 : 1));

    if (this.stateChip) {
      this.stateChip.innerHTML = `STATE <b>${m.phaseName}</b>`;
    }
    if (this.seedReadout) {
      this.seedReadout.textContent = m.seed.toFixed(3);
    }
    if (this.elapsedReadout) {
      this.elapsedReadout.textContent = `${(m.elapsedMs / 1000).toFixed(0)}s`;
    }

    this.updateUI();
  }

  private updateUI(): void {
    if (!this.runtime) return;
    const name = this.runtime.state.phaseName as keyof typeof KICKER;
    const stateIndex = STATE_ORDER.indexOf(name);

    if (this.kicker) this.kicker.textContent = KICKER[name] ?? KICKER.DORMANT;
    if (this.title) this.title.innerHTML = (TITLE[name] ?? TITLE.DORMANT).replace('\n', '<br />');

    if (this.primary) {
      const labels: Record<string, string> = {
        DORMANT: 'ENTER THE SYSTEM →',
        AWARE: 'ENGAGE PORTAL →',
        OPEN: 'RETURN ×',
      };
      this.primary.textContent = labels[name] ?? labels.DORMANT;
    }

    this.progressNodes.forEach((node, i) => {
      node.classList.toggle('is-active', i <= stateIndex);
    });

    if (this.dataRow) {
      this.dataRow.style.setProperty('--state-index', String(stateIndex));
    }
  }

  private updateDebug(): void {
    if (!this.debugNode || !this.runtime) return;
    const m = this.runtime.getMetrics();
    this.debugNode.textContent = [
      `state=${m.phaseName}`,
      `fps=${m.fps}`,
      `frameTime=${m.frameTime.toFixed(2)}ms`,
      `seed=${m.seed}`,
      `elapsed=${(m.elapsedMs / 1000).toFixed(2)}s`,
      `drawCalls=${m.drawCalls}`,
      `res=${m.canvasSize}`,
      `breathe=${this.breathe.toFixed(3)}`,
      `pulse=${this.pulse.toFixed(3)}`,
      `pointerActive=${this.pointerActive}`,
      `idle=${((performance.now() - this.lastInteraction) / 1000).toFixed(1)}s`,
    ].join('\n');
  }
}

const controllers = new WeakMap<HTMLElement, KdxThresholdPortalController>();

export function mountKodexThresholdPortal(): void {
  document.querySelectorAll<HTMLElement>('[data-kdx-threshold]').forEach((root) => {
    if (controllers.has(root)) return;
    try {
      const controller = new KdxThresholdPortalController(root);
      controllers.set(root, controller);
    } catch (error) {
      console.error('ThresholdPortal mount error:', error);
      root.dataset.webgl = 'fallback';
    }
  });
}
