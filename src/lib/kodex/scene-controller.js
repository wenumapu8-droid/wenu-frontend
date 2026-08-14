import { KODEX_RUNTIME } from './motion-config.js';
import { prefersReducedMotion } from './reduced-motion.js';
import { getSceneDefinition, resolveSceneId } from './scene-registry.js';
import { recommendNextScene } from './experience-engine.js';

export function detectLowPowerMode() {
  const narrow = window.innerWidth <= KODEX_RUNTIME.lowPowerBreakpoint;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const saveData = navigator.connection?.saveData === true;
  const lowThreads = typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4;
  return narrow || coarse || saveData || lowThreads;
}

export function createSceneController(root) {
  const initialElementId = root.querySelector('.kx-slide.kx-active')?.id || '';
  let activeScene = resolveSceneId({
    pathname: location.pathname,
    hash: location.hash,
    elementId: initialElementId,
  }) || 'threshold';
  let reduced = prefersReducedMotion();
  let lowPower = detectLowPowerMode();
  let visible = document.visibilityState === 'visible';
  let dwellReached = false;
  const sessionHistory = [activeScene];
  const listeners = new Set();

  const recommendation = () => recommendNextScene({
    currentScene: activeScene,
    history: sessionHistory,
    seed: `${location.pathname}:${sessionHistory.join('>')}`,
    allowOrbitals: false,
  });

  const state = () => ({
    activeScene,
    definition: getSceneDefinition(activeScene),
    reduced,
    lowPower,
    visible,
    paused: reduced || !visible,
    dwellReached,
    recommendation: recommendation(),
  });

  const notify = () => {
    const next = state();
    const definition = next.definition;
    root.dataset.kdxActiveScene = next.activeScene;
    root.dataset.kdxSceneId = definition?.id || 'KDX-SCN-UNKNOWN';
    root.dataset.kdxSceneRole = definition?.role || 'unknown';
    root.dataset.kdxSceneDensity = String(definition?.density ?? '');
    root.dataset.kdxReduced = String(next.reduced);
    root.dataset.kdxLowPower = String(next.lowPower);
    root.dataset.kdxPaused = String(next.paused);
    root.dataset.kdxDwellReached = String(next.dwellReached);
    root.dataset.kdxRecommendedNext = next.recommendation.selected?.key || '';

    root.querySelectorAll('.kx-slide').forEach((slide) => {
      const slideScene = resolveSceneId({
        pathname: location.pathname,
        hash: `#${slide.id}`,
        elementId: slide.id,
      });
      slide.dataset.kdxSceneActive = String(slideScene === next.activeScene);
    });

    window.dispatchEvent(new CustomEvent('kdx:scene-state', { detail: next }));
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
  const onDwell = (event) => {
    if (event?.detail?.path && event.detail.path !== location.pathname) return;
    dwellReached = true;
    notify();
  };

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize, { passive: true });
  media.addEventListener('change', onMedia);
  window.addEventListener('kdx:scene-dwell', onDwell);

  const syncActiveScene = () => {
    const deckActive = root.querySelector('.kx-slide.kx-active')?.id || '';
    const resolved = resolveSceneId({
      pathname: location.pathname,
      hash: location.hash,
      elementId: deckActive,
    }) || activeScene;

    if (resolved !== activeScene) {
      activeScene = resolved;
      dwellReached = false;
      if (sessionHistory[sessionHistory.length - 1] !== resolved) sessionHistory.push(resolved);
      if (sessionHistory.length > 64) sessionHistory.shift();
    }
    notify();
  };

  const mo = new MutationObserver(syncActiveScene);
  root.querySelectorAll('.kx-slide').forEach((slide) => {
    mo.observe(slide, { attributes: true, attributeFilter: ['class'] });
  });
  window.addEventListener('hashchange', syncActiveScene);
  notify();

  return {
    getState: state,
    getDefinition: () => getSceneDefinition(activeScene),
    getRecommendation: recommendation,
    getSessionHistory: () => [...sessionHistory],
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
      window.removeEventListener('kdx:scene-dwell', onDwell);
      media.removeEventListener('change', onMedia);
      mo.disconnect();
      listeners.clear();
    },
  };
}
