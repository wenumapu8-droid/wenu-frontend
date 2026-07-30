export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createReducedMotionStore() {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = media.matches;
  const listeners = new Set();
  const notify = () => {
    current = media.matches;
    listeners.forEach((listener) => listener(current));
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    listener(current);
    media.addEventListener('change', notify);
    return () => {
      listeners.delete(listener);
      if (!listeners.size) media.removeEventListener('change', notify);
    };
  };
  return {
    get value() { return current; },
    subscribe,
  };
}
