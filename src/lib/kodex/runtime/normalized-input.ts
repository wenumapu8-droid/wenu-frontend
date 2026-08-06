export type KodexMotionMode = 'full' | 'reduced' | 'off';

export interface KodexInputSnapshot {
  pointer: {
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    active: boolean;
    type: 'mouse' | 'pen' | 'touch' | 'keyboard' | 'none';
  };
  velocity: {
    x: number;
    y: number;
    magnitude: number;
  };
  focusedId: string | null;
  motion: KodexMotionMode;
}

export interface KodexInputControllerOptions {
  damping?: number;
  onFrame?: (snapshot: Readonly<KodexInputSnapshot>) => void;
  onCommit?: (snapshot: Readonly<KodexInputSnapshot>) => void;
}

export interface KodexInputController {
  getSnapshot(): Readonly<KodexInputSnapshot>;
  setMotionMode(mode: KodexMotionMode): void;
  destroy(): void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const normalizePoint = (event: PointerEvent, element: HTMLElement) => {
  const bounds = element.getBoundingClientRect();
  const width = Math.max(bounds.width, 1);
  const height = Math.max(bounds.height, 1);

  return {
    x: clamp(((event.clientX - bounds.left) / width) * 2 - 1, -1, 1),
    y: clamp(((event.clientY - bounds.top) / height) * 2 - 1, -1, 1),
  };
};

const preferredMotionMode = (): KodexMotionMode => {
  if (typeof window === 'undefined') return 'reduced';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'reduced'
    : 'full';
};

export function createKodexInputController(
  element: HTMLElement,
  options: KodexInputControllerOptions = {},
): KodexInputController {
  const damping = clamp(options.damping ?? 0.12, 0.01, 1);

  const snapshot: KodexInputSnapshot = {
    pointer: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      type: 'none',
    },
    velocity: {
      x: 0,
      y: 0,
      magnitude: 0,
    },
    focusedId: null,
    motion: preferredMotionMode(),
  };

  let animationFrame = 0;
  let destroyed = false;

  const emitCommit = () => options.onCommit?.(Object.freeze(structuredClone(snapshot)));

  const onPointerMove = (event: PointerEvent) => {
    const point = normalizePoint(event, element);
    snapshot.pointer.targetX = point.x;
    snapshot.pointer.targetY = point.y;
    snapshot.pointer.active = true;
    snapshot.pointer.type = event.pointerType === 'touch'
      ? 'touch'
      : event.pointerType === 'pen'
        ? 'pen'
        : 'mouse';
  };

  const onPointerLeave = () => {
    snapshot.pointer.targetX = 0;
    snapshot.pointer.targetY = 0;
    snapshot.pointer.active = false;
    snapshot.pointer.type = 'none';
  };

  const onPointerDown = (event: PointerEvent) => {
    onPointerMove(event);
    emitCommit();
  };

  const onFocusIn = (event: FocusEvent) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    snapshot.focusedId = target?.dataset.kdxInteractionId ?? target?.id ?? null;
    snapshot.pointer.type = 'keyboard';
    snapshot.pointer.active = true;
    emitCommit();
  };

  const onFocusOut = () => {
    snapshot.focusedId = null;
    snapshot.pointer.active = false;
    snapshot.pointer.type = 'none';
  };

  const frame = () => {
    if (destroyed) return;

    const previousX = snapshot.pointer.x;
    const previousY = snapshot.pointer.y;
    const effectiveDamping = snapshot.motion === 'full' ? damping : 1;

    snapshot.pointer.x += (snapshot.pointer.targetX - snapshot.pointer.x) * effectiveDamping;
    snapshot.pointer.y += (snapshot.pointer.targetY - snapshot.pointer.y) * effectiveDamping;

    snapshot.velocity.x = snapshot.pointer.x - previousX;
    snapshot.velocity.y = snapshot.pointer.y - previousY;
    snapshot.velocity.magnitude = Math.hypot(
      snapshot.velocity.x,
      snapshot.velocity.y,
    );

    options.onFrame?.(snapshot);
    animationFrame = window.requestAnimationFrame(frame);
  };

  element.addEventListener('pointermove', onPointerMove, { passive: true });
  element.addEventListener('pointerleave', onPointerLeave, { passive: true });
  element.addEventListener('pointerdown', onPointerDown, { passive: true });
  element.addEventListener('focusin', onFocusIn);
  element.addEventListener('focusout', onFocusOut);

  animationFrame = window.requestAnimationFrame(frame);

  return {
    getSnapshot: () => snapshot,
    setMotionMode: (mode) => {
      snapshot.motion = mode;
      if (mode === 'off') {
        snapshot.pointer.x = 0;
        snapshot.pointer.y = 0;
        snapshot.pointer.targetX = 0;
        snapshot.pointer.targetY = 0;
      }
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      window.cancelAnimationFrame(animationFrame);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerleave', onPointerLeave);
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('focusin', onFocusIn);
      element.removeEventListener('focusout', onFocusOut);
    },
  };
}
