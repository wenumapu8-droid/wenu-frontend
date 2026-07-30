import { KODEX_RUNTIME } from './motion-config.js';
import { prefersReducedMotion } from './reduced-motion.js';

export function detectLowPowerMode() {
  const narrow = window.innerWidth <= KODEX_RUNTIME.lowPowerBreakpoint;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const saveData = navigator.connection?.saveData === true;
  const lowThreads = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  return narrow || coarse || saveData || lowThreads;
}

export function createSceneController(root) {
  let activeScene = root.querySelector('.kx-slide.kx-active')?.id || 'threshold';
  let reduced = prefersReducedMotion();
  let lowPower = detectLowPowerMode();
  let visible = document.visibilityState === 'visible';
  const listeners = new Set();

  const state = () => ({ activeScene, reduced, lowPower, visible, paused: reduced || !visible });
  const notify = () => {
    const next = state();
    root.dataset.kdxActiveScene = next.activeScene;
    root.dataset.kdxReduced = String(next.reduced);
    root.dataset.kdxLowPower = String(next.lowPower);
    root.dataset.kdxPaused = String(next.paused);
    root.querySelectorAll('.kx-slide').forEach((slide) => {
      slide.dataset.kdxSceneActive = String(slide.id === next.activeScene);
    });
    listeners.forEach((listener) => listener(next));
  };

  const onVisibility = () => {
    visible = document.visibilityState === 'visible';
    notify();
  };
  const onResize = () => {
    lowPower = detectLowPowerMode();
    notify();
  };
  const onMedia = () => {
    reduced = prefersReducedMotion();
    notify();
  };

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize, { passive: true });
  media.addEventListener('change', onMedia);

  const syncActiveScene = () => {
    const deckActive = root.querySelector('.kx-slide.kx-active')?.id;
    activeScene = deckActive || (location.hash ? location.hash.replace('#', '') : 'threshold');
    notify();
  };

  const mo = new MutationObserver(syncActiveScene);
  root.querySelectorAll('.kx-slide').forEach((slide) => mo.observe(slide, { attributes: true, attributeFilter: ['class'] }));
  window.addEventListener('hashchange', syncActiveScene);
  notify();

  return {
    getState: state,
    subscribe(listener) {
      listeners.add(listener);
      listener(state());
      return () => listeners.delete(listener);
    },
    syncActiveScene,
    destroy() {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('hashchange', syncActiveScene);
      media.removeEventListener('change', onMedia);
      mo.disconnect();
      listeners.clear();
    },
  };
}
