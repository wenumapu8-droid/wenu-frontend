import test from 'node:test';
import assert from 'node:assert/strict';

import {
  KdxEngineCore,
  KdxSignalBus,
  KDX_EXPERIENCE_PRESETS,
  KodexWorldRendererAdapter,
  createSignalFrame,
  describeKdxRenderer,
} from '../src/kodex/engine/index.js';

test('SignalFrame clamps channels and is immutable', () => {
  const frame = createSignalFrame({
    pointer: { x: 4, y: -3, velocity: 2, active: true },
    audio: { level: 1.5, low: -1, mid: 0.5, high: 2, active: true },
    activation: { level: 0.8 },
  }, { sequence: 7, timestamp: 42 });

  assert.equal(frame.sequence, 7);
  assert.equal(frame.timestamp, 42);
  assert.deepEqual(frame.pointer, { x: 1, y: -1, velocity: 1, active: true });
  assert.equal(frame.audio.level, 1);
  assert.equal(frame.audio.low, 0);
  assert.equal(frame.audio.high, 1);
  assert.equal(frame.activation.active, true);
  assert.equal(Object.isFrozen(frame), true);
  assert.equal(Object.isFrozen(frame.audio), true);
});

test('KdxSignalBus produces monotonic frames with injectable clock', () => {
  let now = 100;
  const bus = new KdxSignalBus({ clock: () => now });
  bus.update('pointer', { x: 0.25, y: -0.5, active: true });
  const first = bus.frame();
  now = 125;
  const second = bus.frame();
  assert.equal(first.sequence, 1);
  assert.equal(second.sequence, 2);
  assert.equal(second.timestamp, 125);
  assert.equal(second.pointer.x, 0.25);
});

test('renderer contract fails closed when methods are missing', () => {
  assert.throws(() => describeKdxRenderer({ applyPlan() {} }), /missing required methods/);
});

test('KodexWorldRendererAdapter translates SignalFrame without requiring DOM input', () => {
  const world = {
    state: { targetMouse: [0, 0], vel: 0 },
    getAudio: () => 0.2,
    applyPlan(plan) { this.planId = plan.plan_id; },
    setPointerNormalized(x, y, velocity) { this.pointer = [x, y, velocity]; },
    setSignal(value) { this.signal = value; },
    setState(value) { this.phase = value; },
    start() { this.started = true; },
    stop() { this.started = false; },
    renderOnce() { this.rendered = true; },
  };
  const adapter = new KodexWorldRendererAdapter(world);
  adapter.applyPlan(KDX_EXPERIENCE_PRESETS.SIGNAL_FIELD.rendererPlan);
  adapter.applySignals(createSignalFrame({
    pointer: { x: 0.4, y: -0.2, velocity: 0.7, active: true },
    audio: { level: 0.9, active: true },
    activation: { level: 1, active: true },
  }));
  assert.deepEqual(world.pointer, [0.4, -0.2, 0.7]);
  assert.equal(world.signal, true);
  assert.equal(world.getAudio(), 0.9);
  assert.equal(world.planId, 'KDX-DEMO-SIGNAL-FIELD-001');
});

test('one KdxEngineCore can execute three distinct experience presets through one renderer contract', () => {
  const plans = [];
  const frames = [];
  const renderer = {
    kind: 'TEST_RENDERER',
    applyPlan(plan) { plans.push(plan.plan_id); },
    applySignals(frame) { frames.push(frame.sequence); },
    start() {},
    stop() {},
  };
  const bus = new KdxSignalBus({ clock: () => 500 });
  const engine = new KdxEngineCore({ renderer, signalBus: bus });

  for (const spec of Object.values(KDX_EXPERIENCE_PRESETS)) {
    engine.loadExperience(spec);
    engine.updateSignal('pointer', { x: 0.1, y: -0.1, active: true });
    engine.frame();
  }

  assert.deepEqual(plans, [
    'KDX-DEMO-THRESHOLD-001',
    'KDX-DEMO-SIGNAL-FIELD-001',
    'KDX-DEMO-AUDIO-ORGANISM-001',
  ]);
  assert.deepEqual(frames, [1, 2, 3]);
  assert.equal(engine.snapshot().experienceId, 'AUDIO_ORGANISM');
});

test('memory writes are explicit and never happen from signal frames', () => {
  const commits = [];
  const renderer = { applyPlan() {}, applySignals() {}, start() {}, stop() {} };
  const memoryAdapter = { commit(event) { commits.push(event.id); return { accepted: true }; } };
  const engine = new KdxEngineCore({ renderer, memoryAdapter, signalBus: new KdxSignalBus({ clock: () => 1 }) });
  engine.loadExperience(KDX_EXPERIENCE_PRESETS.THRESHOLD);
  engine.frame();
  assert.deepEqual(commits, []);
  assert.throws(() => engine.commitMemory({ id: 'x' }), /explicitCommit/);
  engine.commitMemory({ id: 'x', explicitCommit: true });
  assert.deepEqual(commits, ['x']);
});
