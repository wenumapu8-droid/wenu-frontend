import { mountKodexCrt } from '../../crt/kodex-crt.esm.js';

const REDUCED_OVERRIDES = Object.freeze({
  scanline: 0.12,
  phosphor: 0.1,
  noise: 0,
  flicker: 0,
  bloom: 0.08,
  persistence: 0,
  chromatic: 0.04,
  curvature: 0.002,
  vignette: 0.08,
  bleed: 0.02,
});

export class CrtSurfaceAdapter {
  constructor({ source, container, preset = 'machine', quality, reducedMotion } = {}) {
    if (!(source instanceof HTMLCanvasElement)) {
      throw new TypeError('CrtSurfaceAdapter requires a source canvas.');
    }
    if (!(container instanceof HTMLElement)) {
      throw new TypeError('CrtSurfaceAdapter requires a container element.');
    }

    this.source = source;
    this.container = container;
    this.reducedMotion = reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.freezeTimer = 0;
    this.controller = mountKodexCrt({
      source,
      container,
      preset,
      quality: quality ?? (this.reducedMotion ? 'low-power' : 'balanced'),
      overrides: this.reducedMotion ? REDUCED_OVERRIDES : {},
      autoStart: false,
      metricsKey: '__KODEX_HOLOCORE_CRT_METRICS__',
      className: 'kdx-holocore-renderer__crt',
    });

    this.mode = this.controller?.metrics?.fallbackActive ? 'canvas-fallback' : 'webgl-crt';
    this.container.dataset.surfaceMode = this.mode;
  }

  start() {
    if (!this.controller || this.controller.destroyed) return;
    if (this.reducedMotion) {
      // Render a short deterministic settling window so the WebGL CRT surface
      // contains a real frame, then freeze it. Time-varying noise, flicker and
      // persistence are disabled by REDUCED_OVERRIDES.
      this.controller.start();
      this.freezeTimer = window.setTimeout(() => this.controller?.stop(), 140);
      return;
    }
    this.controller.start();
  }

  stop() {
    if (this.freezeTimer) window.clearTimeout(this.freezeTimer);
    this.freezeTimer = 0;
    this.controller?.stop();
  }

  setSignalState(state) {
    this.controller?.setSignalState(state);
  }

  destroy() {
    this.stop();
    this.controller?.destroy();
    this.container.removeAttribute('data-surface-mode');
  }
}
