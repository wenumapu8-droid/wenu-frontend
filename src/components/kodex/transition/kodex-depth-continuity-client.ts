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

  if (REDUCED) {
    root.animate([{ opacity: 1 }, { opacity: 0.45 }], { duration: 180, easing: 'linear', fill: 'forwards' });
    return;
  }

  const ms = 720;
  const field = root.querySelector<HTMLElement>('.kx-prologue__campo');
  field?.animate([
    { transform: 'scale(1)', filter: 'blur(0px) contrast(1)', opacity: 1 },
    { transform: 'scale(1.34)', filter: 'blur(1.5px) contrast(1.18)', opacity: 0.58 },
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
    pulse.animate([{ opacity: 0.72 }, { opacity: 0 }], { duration: 180, easing: 'linear', fill: 'forwards' })
      .finished.finally(() => pulse.remove());
    copy?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'linear' });
    return;
  }

  world?.animate([
    { transform: 'scale(1.42)', transformOrigin: `${cx} ${cy}`, filter: 'blur(8px)', opacity: 0.28 },
    { transform: 'scale(1)', transformOrigin: `${cx} ${cy}`, filter: 'blur(0px)', opacity: 1 },
  ], { duration: 860, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'both' });

  copy?.animate([
    { transform: 'scale(.82)', transformOrigin: `${cx} ${cy}`, opacity: 0 },
    { transform: 'scale(1)', transformOrigin: `${cx} ${cy}`, opacity: 1 },
  ], { duration: 680, delay: 120, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'both' });

  pulse.animate([
    { transform: 'scale(.4)', opacity: 0.82 },
    { transform: 'scale(24)', opacity: 0 },
  ], { duration: 760, easing: 'cubic-bezier(.16,.78,.28,1)', fill: 'forwards' })
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
