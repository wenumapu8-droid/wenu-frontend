export class KodexWorldRendererAdapter {
  constructor(world) {
    if (!world || typeof world.applyPlan !== 'function') {
      throw new TypeError('KodexWorldRendererAdapter requires a KodexWorld-compatible instance.');
    }
    this.kind = 'KODEX_WORLD_WEBGL2';
    this.world = world;
    this.frameAudioActive = false;
    this.frameAudioLevel = 0;
    this.originalGetAudio = typeof world.getAudio === 'function' ? world.getAudio.bind(world) : () => 0;
    world.getAudio = () => (this.frameAudioActive ? this.frameAudioLevel : this.originalGetAudio());
  }

  applyPlan(plan) {
    this.world.applyPlan(plan);
    return this;
  }

  applySignals(frame) {
    if (!frame || typeof frame !== 'object') return this;
    const primary = frame.touch?.active ? frame.touch : frame.pointer;
    if (primary) {
      if (typeof this.world.setPointerNormalized === 'function') {
        this.world.setPointerNormalized(primary.x, primary.y, primary.velocity || 0);
      } else if (this.world.state) {
        this.world.state.targetMouse = [Number(primary.x) || 0, Number(primary.y) || 0];
        this.world.state.vel = Math.max(0, Math.min(1, Number(primary.velocity) || 0));
      }
    }

    if (frame.activation && typeof this.world.setSignal === 'function') {
      this.world.setSignal(frame.activation.active || frame.activation.level >= 0.5);
    }

    this.frameAudioActive = Boolean(frame.audio?.active);
    this.frameAudioLevel = Math.max(0, Math.min(1, Number(frame.audio?.level) || 0));
    return this;
  }

  setState(phase) {
    if (typeof this.world.setState === 'function') this.world.setState(phase);
    return this;
  }

  start() {
    this.world.start();
    return this;
  }

  stop() {
    this.world.stop();
    return this;
  }

  renderOnce() {
    this.world.renderOnce?.();
    return this;
  }

  snapshot() {
    return Object.freeze({
      kind: this.kind,
      phase: this.world.phase || null,
      planId: this.world.planId || null,
      renderTier: this.world.renderTier || null,
      sourceMode: this.world.sourceMode || null,
      audioFromSignalFrame: this.frameAudioActive,
    });
  }
}
