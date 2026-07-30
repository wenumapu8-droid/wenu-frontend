// KODEX−∞ · analytics — thin wrapper on GA4 gtag (KODEX-BUILD.md §8).
// Fires the funnel events: kdx_enter · scene_view · next/previous_scene ·
// index_open · artwork_open/complete · generator_start/complete ·
// commission_open/submit · edition_open · outbound_* · restart_journey.
// Silent no-op when GA4 not configured (PUBLIC_GA_ID unset).

export function kdx(name, params = {}) {
  const payload = { event_category: 'kodex', page_path: location.pathname, ...params };
  try { if (window.gtag) window.gtag('event', name, payload); } catch (_) {}
  try { window.dispatchEvent(new CustomEvent('kdx:' + name, { detail: payload })); } catch (_) {}
}

export function bootKdx(sceneCode) {
  if (window.__kdxBooted) return; window.__kdxBooted = true;
  kdx('kdx_enter', { landing: !document.referrer });
  if (sceneCode) kdx('scene_view', { scene: sceneCode });
}
