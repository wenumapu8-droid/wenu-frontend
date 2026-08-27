/**
 * KODEX−∞ · opening depth continuity
 *
 * Extends the existing transition ritual; it does not own navigation, routing,
 * JourneyState, or scene state. It only preserves a perceptual anchor/residue
 * across the already-authoritative PROLOGUE → DESCENT ritual.
 */

const RESIDUE_KEY = 'kdx-depth-residue-v1';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

type Residue = {
  kind: 'observation-eye';
  accent: string;
  x: number;
  y: number;
  state: string;
};

function normalizar(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function isPrologueDescent(anchor: HTMLAnchorElement): boolean {
  const from = normalizar(location.pathname);
  const to = normalizar(new URL(anchor.href, location.href).pathname);
  return from === '/kodex/folio/i/' && to === '/kodex/folio/ii/';
}

function accent(): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--kdx-scene-accent')
    .trim() || '#B27CFF';
}

function animateTowardAxis(el: Element, cx: number, cy: number, amount: number, ms: number): void {
  const node = el as HTMLElement;
  const r = node.getBoundingClientRect();
  const dx = cx - (r.left + r.width / 2);
  const dy = cy - (r.top + r.height / 2);
  node.animate([
    { transform: 'translate3d(0,0,0) scale(1)', opacity: 1, filter: 'blur(0px)' },
    {
      transform: `translate3d(${dx * amount}px,${dy * amount}px,0) scale(${1 - amount * 0.42})`,
      opacity: 0.08,
      filter: 'blur(2px)',
    },
  ], { duration: ms, easing: 'cubic-bezier(.62,.02,.86,.4)', fill: 'forwards' });
}

/**
 * Presentation-only continuity glyph. It deliberately reuses the Observation
 * Eye vocabulary (elliptical iris, pupil, concentric acquisition rings and
 * radial signal rays) instead of substituting the generic depth tunnel as the
 * perceptual anchor. No source pixels, route state or semantic memory live here.
 */
function createEyeBridge(residue: Residue, phase: 'source' | 'arrival'): HTMLElement {
  const x = Math.max(0, Math.min(1, residue.x)) * 100;
  const y = Math.max(0, Math.min(1, residue.y)) * 100;
  const bridge = document.createElement('span');
  bridge.setAttribute('data-kdx-depth-eye-bridge', phase);
  bridge.setAttribute('data-kdx-depth-eye-state', residue.state);
  Object.assign(bridge.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: '2147483000',
    overflow: 'hidden',
    background: `radial-gradient(ellipse at ${x}% ${y}%, color-mix(in srgb, ${residue.accent} 11%, transparent) 0%, rgba(5,4,10,.78) 34%, #050507 76%)`,
  });

  const eye = document.createElement('span');
  Object.assign(eye.style, {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: 'clamp(150px, 27vmin, 340px)',
    height: 'clamp(104px, 18vmin, 228px)',
    transform: 'translate(-50%,-50%)',
    borderRadius: '52% 48% 52% 48% / 48% 52% 48% 52%',
    border: `1px solid color-mix(in srgb, ${residue.accent} 82%, white)`,
    boxShadow: `0 0 26px color-mix(in srgb, ${residue.accent} 58%, transparent), inset 0 0 28px color-mix(in srgb, ${residue.accent} 32%, transparent)`,
    opacity: '0.94',
  });

  for (let i = 0; i < 4; i += 1) {
    const ring = document.createElement('span');
    const inset = 12 + i * 11;
    Object.assign(ring.style, {
      position: 'absolute',
      inset: `${inset}%`,
      borderRadius: '50%',
      border: `1px solid color-mix(in srgb, ${residue.accent} ${72 - i * 11}%, transparent)`,
      boxShadow: i === 3 ? `0 0 30px color-mix(in srgb, ${residue.accent} 52%, transparent)` : 'none',
    });
    eye.appendChild(ring);
  }

  const pupil = document.createElement('span');
  Object.assign(pupil.style, {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 'clamp(13px, 2.2vmin, 28px)',
    height: 'clamp(13px, 2.2vmin, 28px)',
    transform: 'translate(-50%,-50%)',
    borderRadius: '50%',
    background: '#050507',
    border: `1px solid ${residue.accent}`,
    boxShadow: `0 0 38px 9px color-mix(in srgb, ${residue.accent} 62%, transparent)`,
  });
  eye.appendChild(pupil);

  const rays = document.createElement('span');
  Object.assign(rays.style, {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: 'min(72vmin, 720px)',
    height: 'min(72vmin, 720px)',
    transform: 'translate(-50%,-50%)',
    borderRadius: '50%',
    background: `repeating-conic-gradient(from 0deg, color-mix(in srgb, ${residue.accent} 32%, transparent) 0deg 0.35deg, transparent 0.35deg 10deg)`,
    opacity: '0.34',
    WebkitMaskImage: 'radial-gradient(circle, transparent 0 18%, #000 28% 74%, transparent 82%)',
    maskImage: 'radial-gradient(circle, transparent 0 18%, #000 28% 74%, transparent 82%)',
  });

  bridge.appendChild(rays);
  bridge.appendChild(eye);
  document.body.appendChild(bridge);
  return bridge;
}

function beginPrologueCrossing(anchor: HTMLAnchorElement): void {
  const root = document.querySelector<HTMLElement>('[data-kdx-observacion]');
  if (!root || root.hasAttribute('data-kdx-depth-crossing')) return;

  const r = anchor.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const residue: Residue = {
    kind: 'observation-eye',
    accent: accent(),
    x: innerWidth ? cx / innerWidth : 0.5,
    y: innerHeight ? cy / innerHeight : 0.5,
    state: root.dataset.kdxObs || 'LOCK',
  };

  try { sessionStorage.setItem(RESIDUE_KEY, JSON.stringify(residue)); } catch (_) {}
  root.setAttribute('data-kdx-depth-crossing', '');

  // Keep the SAME eye above the generic depth ritual during the source-side
  // collapse. This is the perceptual continuity layer the old implementation
  // lacked: the tunnel may move underneath, but it cannot replace the anchor.
  const sourceBridge = createEyeBridge(residue, 'source');
  const sourceEye = sourceBridge.lastElementChild as HTMLElement | null;
  const sourceRays = sourceBridge.firstElementChild as HTMLElement | null;

  if (REDUCED) {
    sourceBridge.animate([{ opacity: 0 }, { opacity: 0.96 }], { duration: 80, easing: 'linear', fill: 'both' });
    sourceEye?.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.12)' }], { duration: 180, easing: 'linear', fill: 'forwards' });
    root.animate([{ opacity: 1 }, { opacity: 0.32 }], { duration: 180, easing: 'linear', fill: 'forwards' });
    return;
  }

  sourceBridge.animate([
    { opacity: 0.04 },
    { opacity: 0.72, offset: 0.35 },
    { opacity: 0.98 },
  ], { duration: 820, easing: 'cubic-bezier(.62,.02,.86,.4)', fill: 'both' });
  sourceEye?.animate([
    { transform: 'translate(-50%,-50%) scale(.92)', opacity: 0.9 },
    { transform: 'translate(-50%,-50%) scale(1.9)', opacity: 1, offset: 0.52 },
    { transform: 'translate(-50%,-50%) scale(3.85)', opacity: 0.84 },
  ], { duration: 860, easing: 'cubic-bezier(.62,.02,.86,.4)', fill: 'forwards' });
  sourceRays?.animate([
    { transform: 'translate(-50%,-50%) scale(.88) rotate(0deg)', opacity: 0.18 },
    { transform: 'translate(-50%,-50%) scale(2.2) rotate(7deg)', opacity: 0.42 },
  ], { duration: 860, easing: 'cubic-bezier(.62,.02,.86,.4)', fill: 'forwards' });

  const ms = 720;
  const field = root.querySelector<HTMLElement>('.kx-prologue__campo');
  field?.animate([
    { transform: 'scale(1)', filter: 'blur(0px) contrast(1)', opacity: 1 },
    { transform: 'scale(1.34)', filter: 'blur(1.5px) contrast(1.18)', opacity: 0.42 },
  ], { duration: ms, easing: 'cubic-bezier(.62,.02,.86,.4)', fill: 'forwards' });

  for (const selector of [
    '.kx-prologue__titulo',
    '.kx-prologue__type',
    '.kx-prologue__estado',
    '.kx-prologue__wave',
    '.kx-prologue__inspect',
  ]) {
    const el = root.querySelector(selector);
    if (el) animateTowardAxis(el, cx, cy, 0.56, ms);
  }
}

function readResidue(): Residue | null {
  try {
    const raw = sessionStorage.getItem(RESIDUE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(RESIDUE_KEY);
    const parsed = JSON.parse(raw) as Partial<Residue>;
    if (parsed.kind !== 'observation-eye') return null;
    return {
      kind: 'observation-eye',
      accent: typeof parsed.accent === 'string' ? parsed.accent : '#B27CFF',
      x: typeof parsed.x === 'number' ? parsed.x : 0.5,
      y: typeof parsed.y === 'number' ? parsed.y : 0.5,
      state: typeof parsed.state === 'string' ? parsed.state : 'LOCK',
    };
  } catch (_) {
    return null;
  }
}

function revealDescentFromResidue(): void {
  if (normalizar(location.pathname) !== '/kodex/folio/ii/') return;
  const residue = readResidue();
  if (!residue) return;

  const scene = document.querySelector<HTMLElement>('.kx-os-scene--descent');
  if (!scene) return;
  scene.dataset.kdxResidue = residue.kind;
  scene.style.setProperty('--kdx-residue-accent', residue.accent);

  const cx = `${Math.max(0, Math.min(1, residue.x)) * 100}%`;
  const cy = `${Math.max(0, Math.min(1, residue.y)) * 100}%`;
  const world = scene.querySelector<HTMLElement>('.kx-os-stage__livefield, .kx-os-stage__field');
  const copy = scene.querySelector<HTMLElement>('.kx-os-stage__copy');

  // Destination-side counterpart of the source bridge: the same violet eye is
  // the first arrival frame, then it dilates into DESCENT while the world is
  // reconstituted behind it. The generic ritual can remain authoritative below.
  const bridge = createEyeBridge(residue, 'arrival');
  const eye = bridge.lastElementChild as HTMLElement | null;
  const rays = bridge.firstElementChild as HTMLElement | null;

  const pulse = document.createElement('span');
  pulse.setAttribute('data-kdx-depth-residue', residue.state);
  Object.assign(pulse.style, {
    position: 'fixed',
    left: cx,
    top: cy,
    width: '12px',
    height: '12px',
    margin: '-6px',
    borderRadius: '50%',
    border: `1px solid ${residue.accent}`,
    boxShadow: `0 0 56px 14px ${residue.accent}`,
    pointerEvents: 'none',
    zIndex: '8',
  });
  scene.appendChild(pulse);

  if (REDUCED) {
    scene.animate([{ opacity: 0.28 }, { opacity: 1 }], { duration: 300, easing: 'linear', fill: 'both' });
    eye?.animate([
      { transform: 'translate(-50%,-50%) scale(1.18)', opacity: 0.92 },
      { transform: 'translate(-50%,-50%) scale(1.34)', opacity: 0 },
    ], { duration: 320, easing: 'linear', fill: 'forwards' });
    rays?.animate([{ opacity: 0.28 }, { opacity: 0 }], { duration: 320, easing: 'linear', fill: 'forwards' });
    bridge.animate([
      { opacity: 0.98 },
      { opacity: 0.82, offset: 0.58 },
      { opacity: 0 },
    ], { duration: 340, easing: 'linear', fill: 'forwards' })
      .finished.finally(() => bridge.remove());
    pulse.animate([{ opacity: 0.72 }, { opacity: 0 }], { duration: 340, easing: 'linear', fill: 'forwards' })
      .finished.finally(() => pulse.remove());
    return;
  }

  // Reconstitute the destination after the remembered eye has occupied the
  // first arrival frame. The eye remains visible through the overlap instead
  // of yielding immediately to a generic ring/tunnel.
  scene.animate([
    { opacity: 0.03, filter: 'blur(7px)' },
    { opacity: 0.2, filter: 'blur(4px)', offset: 0.36 },
    { opacity: 1, filter: 'blur(0px)' },
  ], { duration: 900, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'both' });

  world?.animate([
    { transform: 'scale(1.48)', transformOrigin: `${cx} ${cy}`, filter: 'blur(9px)', opacity: 0.18 },
    { transform: 'scale(1)', transformOrigin: `${cx} ${cy}`, filter: 'blur(0px)', opacity: 1 },
  ], { duration: 980, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'both' });

  copy?.animate([
    { transform: 'scale(.8)', transformOrigin: `${cx} ${cy}`, opacity: 0 },
    { transform: 'scale(1)', transformOrigin: `${cx} ${cy}`, opacity: 1 },
  ], { duration: 620, delay: 360, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'both' });

  eye?.animate([
    { transform: 'translate(-50%,-50%) scale(3.6)', opacity: 0.98 },
    { transform: 'translate(-50%,-50%) scale(2.1)', opacity: 0.94, offset: 0.34 },
    { transform: 'translate(-50%,-50%) scale(.76)', opacity: 0 },
  ], { duration: 920, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'forwards' });

  rays?.animate([
    { transform: 'translate(-50%,-50%) scale(2.2) rotate(7deg)', opacity: 0.42 },
    { transform: 'translate(-50%,-50%) scale(1.1) rotate(13deg)', opacity: 0.2, offset: 0.58 },
    { transform: 'translate(-50%,-50%) scale(.8) rotate(16deg)', opacity: 0 },
  ], { duration: 920, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'forwards' });

  bridge.animate([
    { opacity: 0.98 },
    { opacity: 0.92, offset: 0.34 },
    { opacity: 0.42, offset: 0.7 },
    { opacity: 0 },
  ], { duration: 940, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'forwards' })
    .finished.finally(() => bridge.remove());

  pulse.animate([
    { transform: 'scale(.4)', opacity: 0.82 },
    { transform: 'scale(18)', opacity: 0.34, offset: 0.55 },
    { transform: 'scale(30)', opacity: 0 },
  ], { duration: 920, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'forwards' })
    .finished.finally(() => pulse.remove());
}

function mount(): void {
  document.addEventListener('click', (event) => {
    const anchor = (event.target as HTMLElement | null)?.closest?.('a[data-kdx-puerta]') as HTMLAnchorElement | null;
    if (!anchor || !isPrologueDescent(anchor)) return;
    beginPrologueCrossing(anchor);
  }, { capture: true });

  revealDescentFromResidue();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();
document.addEventListener('astro:page-load', revealDescentFromResidue);
