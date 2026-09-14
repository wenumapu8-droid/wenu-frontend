const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export function normalizePointerCoordinates(clientX, clientY, rect) {
  const width = Math.max(1, Number(rect?.width) || 1);
  const height = Math.max(1, Number(rect?.height) || 1);
  const left = Number(rect?.left) || 0;
  const top = Number(rect?.top) || 0;
  return Object.freeze({
    x: clamp(((Number(clientX) - left) / width) * 2 - 1, -1, 1),
    y: clamp(-(((Number(clientY) - top) / height) * 2 - 1), -1, 1),
  });
}

export function mountPointerSignalAdapter({ surface, bus } = {}) {
  if (!surface?.addEventListener || !bus?.update) throw new TypeError('Pointer adapter requires surface + KdxSignalBus.');
  let previous = { x: 0, y: 0 };

  const move = (event) => {
    const next = normalizePointerCoordinates(event.clientX, event.clientY, surface.getBoundingClientRect?.());
    const velocity = Math.min(1, Math.hypot(next.x - previous.x, next.y - previous.y) * 3);
    previous = next;
    bus.update('pointer', { ...next, velocity, active: true });
  };
  const leave = () => bus.update('pointer', { active: false, velocity: 0 });
  const down = () => bus.update('activation', { active: true, level: 1 });
  const up = () => bus.update('activation', { active: false, level: 0 });

  surface.addEventListener('pointermove', move, { passive: true });
  surface.addEventListener('pointerleave', leave, { passive: true });
  surface.addEventListener('pointerdown', down, { passive: true });
  surface.addEventListener('pointerup', up, { passive: true });

  return () => {
    surface.removeEventListener('pointermove', move);
    surface.removeEventListener('pointerleave', leave);
    surface.removeEventListener('pointerdown', down);
    surface.removeEventListener('pointerup', up);
  };
}

export function mountTouchSignalAdapter({ surface, bus } = {}) {
  if (!surface?.addEventListener || !bus?.update) throw new TypeError('Touch adapter requires surface + KdxSignalBus.');
  const sample = (event, active) => {
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    if (!touch) {
      bus.update('touch', { active: false, pressure: 0 });
      return;
    }
    const point = normalizePointerCoordinates(touch.clientX, touch.clientY, surface.getBoundingClientRect?.());
    bus.update('touch', {
      ...point,
      active,
      pressure: clamp(touch.force ?? (active ? 1 : 0), 0, 1),
    });
  };
  const start = (event) => sample(event, true);
  const move = (event) => sample(event, true);
  const end = (event) => sample(event, false);

  surface.addEventListener('touchstart', start, { passive: true });
  surface.addEventListener('touchmove', move, { passive: true });
  surface.addEventListener('touchend', end, { passive: true });
  surface.addEventListener('touchcancel', end, { passive: true });

  return () => {
    surface.removeEventListener('touchstart', start);
    surface.removeEventListener('touchmove', move);
    surface.removeEventListener('touchend', end);
    surface.removeEventListener('touchcancel', end);
  };
}

export function mountKeyboardSignalAdapter({ target, bus } = {}) {
  if (!target?.addEventListener || !bus?.update) throw new TypeError('Keyboard adapter requires target + KdxSignalBus.');
  const down = (event) => bus.update('keyboard', { active: true, lastKey: event.key || null });
  const up = (event) => bus.update('keyboard', { active: false, lastKey: event.key || null });
  target.addEventListener('keydown', down);
  target.addEventListener('keyup', up);
  return () => {
    target.removeEventListener('keydown', down);
    target.removeEventListener('keyup', up);
  };
}

export function createAudioSignalAdapter({ bus } = {}) {
  if (!bus?.update) throw new TypeError('Audio adapter requires KdxSignalBus.');
  return Object.freeze({
    push(sample = {}) {
      const level = clamp(sample.level, 0, 1);
      bus.update('audio', {
        active: sample.active ?? level > 0,
        level,
        low: clamp(sample.low ?? level, 0, 1),
        mid: clamp(sample.mid ?? level, 0, 1),
        high: clamp(sample.high ?? level, 0, 1),
      });
    },
    clear() {
      bus.update('audio', { active: false, level: 0, low: 0, mid: 0, high: 0 });
    },
  });
}
