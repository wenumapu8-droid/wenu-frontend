import { AsciiRenderer } from '../../ascii/engine/AsciiRenderer.js';
import { resolveHoloCoreSpecimen } from '../registry.js';

export class AsciiFieldAdapter {
  constructor(canvas, { specimenId = 'orbital-city', profile = 'balanced', reducedMotion } = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError('AsciiFieldAdapter requires a canvas element.');
    }

    this.canvas = canvas;
    this.specimen = resolveHoloCoreSpecimen(specimenId);
    this.reducedMotion = reducedMotion ?? matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer = new AsciiRenderer(canvas, {
      scene: this.specimen.scene,
      profile,
      glyphSet: 'kodex',
      palette: this.specimen.palette,
    });
    this.renderer.reducedMotion = this.reducedMotion;
    this.mode = 'ascii-field';
    this.canvas.dataset.rendererMode = this.mode;
    this.canvas.dataset.temporalContract = 'closed_24s_loop';
    this.canvas.dataset.seamlessLoopClaim = 'true';
    this.canvas.dataset.specimen = this.specimen.id;
    this.freezeTimer = 0;
  }

  start() {
    if (this.reducedMotion) {
      this.renderer.start();
      this.freezeTimer = window.setTimeout(() => this.renderer.stop(), 170);
      return;
    }
    this.renderer.start();
  }

  stop() {
    if (this.freezeTimer) window.clearTimeout(this.freezeTimer);
    this.freezeTimer = 0;
    this.renderer.stop();
  }

  destroy() {
    this.stop();
    this.renderer.destroy();
  }
}
