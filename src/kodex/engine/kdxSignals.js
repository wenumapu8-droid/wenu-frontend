const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export const KDX_SIGNAL_FRAME_VERSION = 'kdx-signal-frame-v0.1.0';
export const KDX_SIGNAL_CHANNELS = Object.freeze([
  'pointer', 'touch', 'audio', 'keyboard', 'activation', 'time',
]);

const freeze = (value) => Object.freeze(value);

function point(input = {}, { pressure = false } = {}) {
  const value = {
    x: clamp(input.x, -1, 1),
    y: clamp(input.y, -1, 1),
    velocity: clamp(input.velocity, 0, 1),
    active: Boolean(input.active),
  };
  if (pressure) value.pressure = clamp(input.pressure, 0, 1);
  return freeze(value);
}

function audio(input = {}) {
  return freeze({
    level: clamp(input.level, 0, 1),
    low: clamp(input.low, 0, 1),
    mid: clamp(input.mid, 0, 1),
    high: clamp(input.high, 0, 1),
    active: Boolean(input.active),
  });
}

function keyboard(input = {}) {
  return freeze({
    active: Boolean(input.active),
    lastKey: input.lastKey == null ? null : String(input.lastKey).slice(0, 64),
  });
}

function activation(input = {}) {
  const level = clamp(input.level, 0, 1);
  return freeze({ level, active: Boolean(input.active) || level > 0 });
}

function time(input = {}) {
  return freeze({
    deltaMs: Math.max(0, Number(input.deltaMs) || 0),
    elapsedMs: Math.max(0, Number(input.elapsedMs) || 0),
  });
}

export function createSignalFrame(input = {}, meta = {}) {
  const sequence = Math.max(0, Math.floor(Number(meta.sequence) || 0));
  const timestamp = Math.max(0, Number(meta.timestamp) || 0);
  return freeze({
    version: KDX_SIGNAL_FRAME_VERSION,
    sequence,
    timestamp,
    pointer: point(input.pointer),
    touch: point(input.touch, { pressure: true }),
    audio: audio(input.audio),
    keyboard: keyboard(input.keyboard),
    activation: activation(input.activation),
    time: time(input.time),
  });
}

export class KdxSignalBus {
  constructor({ clock } = {}) {
    this.clock = clock || (() => globalThis.performance?.now?.() ?? Date.now());
    this.sequence = 0;
    this.channels = Object.fromEntries(KDX_SIGNAL_CHANNELS.map((key) => [key, {}]));
  }

  update(channel, value = {}) {
    if (!KDX_SIGNAL_CHANNELS.includes(channel)) {
      throw new TypeError(`Unknown KDX signal channel: ${channel}`);
    }
    this.channels[channel] = { ...this.channels[channel], ...(value || {}) };
    return this;
  }

  frame(extra = {}) {
    this.sequence += 1;
    const timestamp = Number(this.clock()) || 0;
    return createSignalFrame({ ...this.channels, ...(extra || {}) }, {
      sequence: this.sequence,
      timestamp,
    });
  }

  reset() {
    this.sequence = 0;
    this.channels = Object.fromEntries(KDX_SIGNAL_CHANNELS.map((key) => [key, {}]));
    return this;
  }
}
