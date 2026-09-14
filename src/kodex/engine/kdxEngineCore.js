import { assertKdxRenderer, describeKdxRenderer } from './kdxRendererContract.js';
import { KdxSignalBus } from './kdxSignals.js';
import { validateKdxExperiencePreset } from './kdxExperiencePresets.js';

export const KDX_ENGINE_PROFILE = Object.freeze({
  version: 'kdx-engine-v0.1.0-slice-01',
  status: 'IMPLEMENTED_CANDIDATE',
  role: 'REUSABLE_RUNTIME_ORCHESTRATOR',
  createsRenderer: false,
  ownsRouteAuthority: false,
  ownsCanon: false,
  implicitMemoryWrites: false,
  autoNavigation: false,
});

export class KdxEngineCore {
  constructor({ renderer, signalBus, stateAdapter = null, memoryAdapter = null, onEvent = null } = {}) {
    this.renderer = assertKdxRenderer(renderer);
    this.rendererContract = describeKdxRenderer(renderer);
    this.signalBus = signalBus || new KdxSignalBus();
    if (typeof this.signalBus.update !== 'function' || typeof this.signalBus.frame !== 'function') {
      throw new TypeError('KDX Engine requires a signal bus with update() and frame().');
    }
    this.stateAdapter = stateAdapter;
    this.memoryAdapter = memoryAdapter;
    this.onEvent = typeof onEvent === 'function' ? onEvent : () => {};
    this.experience = null;
    this.running = false;
    this.lastFrame = null;
  }

  loadExperience(spec) {
    validateKdxExperiencePreset(spec);
    this.renderer.applyPlan(spec.rendererPlan);
    this.experience = spec;
    this.onEvent({ type: 'EXPERIENCE_LOADED', experienceId: spec.id, planId: spec.rendererPlan.plan_id });
    return this;
  }

  updateSignal(channel, value = {}) {
    this.signalBus.update(channel, value);
    return this;
  }

  frame(extra = {}) {
    const signalFrame = this.signalBus.frame(extra);
    this.renderer.applySignals(signalFrame);
    this.lastFrame = signalFrame;
    this.onEvent({ type: 'SIGNAL_FRAME', sequence: signalFrame.sequence, experienceId: this.experience?.id || null });
    return signalFrame;
  }

  dispatchState(event) {
    if (!this.stateAdapter || typeof this.stateAdapter.reduce !== 'function') {
      throw new TypeError('No KDX state adapter is configured.');
    }
    const result = this.stateAdapter.reduce(event, {
      experience: this.experience,
      lastFrame: this.lastFrame,
    });
    if (result?.rendererPhase && typeof this.renderer.setState === 'function') {
      this.renderer.setState(result.rendererPhase);
    }
    this.onEvent({ type: 'STATE_DISPATCH', event, result });
    return result;
  }

  commitMemory(event) {
    if (!event || event.explicitCommit !== true) {
      throw new TypeError('KDX memory writes require explicitCommit: true.');
    }
    if (!this.memoryAdapter || typeof this.memoryAdapter.commit !== 'function') {
      throw new TypeError('No KDX memory adapter is configured.');
    }
    const result = this.memoryAdapter.commit(event, {
      experience: this.experience,
      lastFrame: this.lastFrame,
    });
    this.onEvent({ type: 'MEMORY_COMMIT', event, result });
    return result;
  }

  start() {
    if (this.running) return this;
    this.renderer.start();
    this.running = true;
    this.onEvent({ type: 'ENGINE_START', experienceId: this.experience?.id || null });
    return this;
  }

  stop() {
    if (!this.running) return this;
    this.renderer.stop();
    this.running = false;
    this.onEvent({ type: 'ENGINE_STOP', experienceId: this.experience?.id || null });
    return this;
  }

  renderOnce() {
    if (typeof this.renderer.renderOnce === 'function') this.renderer.renderOnce();
    return this;
  }

  snapshot() {
    return Object.freeze({
      profile: KDX_ENGINE_PROFILE,
      experienceId: this.experience?.id || null,
      planId: this.experience?.rendererPlan?.plan_id || null,
      running: this.running,
      lastSignalSequence: this.lastFrame?.sequence || 0,
      renderer: this.rendererContract,
    });
  }
}
