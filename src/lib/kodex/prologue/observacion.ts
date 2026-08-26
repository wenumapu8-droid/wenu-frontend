/** KODEX−∞ · PROLOGUE · observation state contract.
 * Bounded port from the verified recovery lane. State is causal: input drives
 * DORMANT → AWARE → LOCK/TRACK; INSPECT is explicit; DESCEND is terminal.
 */
export type Estado = 'DORMANT' | 'AWARE' | 'LOCK' | 'TRACK' | 'INSPECT' | 'DESCEND' | 'IDLE';
export type Pulso = {
  estado: Estado;
  presencia: number;
  foco: number;
  objetivo: { x: number; y: number };
  energia: number;
  locks: number;
  inspecciones: number;
};

type Oyente = (p: Pulso) => void;
const LOCK_MS = 420;
const clamp = (n: number) => Math.max(-1, Math.min(1, n));

export function crearObservacion(raiz: HTMLElement) {
  const pulso: Pulso = {
    estado: 'DORMANT', presencia: 0, foco: 0,
    objetivo: { x: 0, y: 0 }, energia: 0, locks: 0, inspecciones: 0,
  };
  const oyentes: Oyente[] = [];
  let dentro = false;
  let sosteniendo = false;
  let tactil = false;
  let timer: number | null = null;
  let prev: Estado = 'DORMANT';
  let lastX = 0, lastY = 0;

  const allowed: Record<Estado, Estado[]> = {
    DORMANT: ['AWARE', 'IDLE'], IDLE: ['AWARE', 'DORMANT'],
    AWARE: ['LOCK', 'TRACK', 'INSPECT', 'DESCEND', 'IDLE', 'DORMANT'],
    LOCK: ['TRACK', 'AWARE', 'INSPECT', 'DESCEND', 'IDLE'],
    TRACK: ['LOCK', 'AWARE', 'INSPECT', 'DESCEND', 'IDLE'],
    INSPECT: ['AWARE', 'LOCK', 'TRACK', 'DESCEND', 'IDLE'],
    DESCEND: [],
  };
  const emit = () => {
    raiz.dispatchEvent(new CustomEvent('kdx:pulso', { detail: { ...pulso }, bubbles: true }));
    oyentes.forEach((fn) => fn(pulso));
  };
  const setState = (next: Estado) => {
    if (pulso.estado === next || !allowed[pulso.estado].includes(next)) return;
    if (next === 'INSPECT') prev = pulso.estado;
    pulso.estado = next;
    raiz.dataset.kdxObs = next;
    if (next === 'LOCK') { pulso.locks += 1; raiz.setAttribute('data-kdx-abierto', ''); }
    if (next === 'INSPECT') pulso.inspecciones += 1;
    raiz.dispatchEvent(new CustomEvent('kdx:observacion', { detail: { ...pulso }, bubbles: true }));
    emit();
  };
  const normalize = (x: number, y: number) => {
    const r = raiz.getBoundingClientRect();
    return { x: clamp((x - (r.left + r.width / 2)) / Math.max(1, r.width / 2)), y: clamp((y - (r.top + r.height / 2)) / Math.max(1, r.height / 2)) };
  };
  const move = (x: number, y: number) => {
    dentro = true;
    const n = normalize(x, y);
    const dx = n.x - lastX, dy = n.y - lastY;
    lastX = n.x; lastY = n.y;
    pulso.objetivo = n;
    pulso.energia = Math.min(1, pulso.energia * .72 + Math.hypot(dx, dy) * 5.5);
    if (pulso.estado === 'INSPECT' || pulso.estado === 'DESCEND') return;
    if (sosteniendo && (pulso.estado === 'LOCK' || pulso.estado === 'TRACK') && Math.hypot(dx, dy) > .012) setState('TRACK');
    else if (pulso.estado === 'DORMANT' || pulso.estado === 'IDLE') setState('AWARE');
  };
  const down = (x: number, y: number) => {
    sosteniendo = true; move(x, y);
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => { if (sosteniendo) setState('LOCK'); }, LOCK_MS);
  };
  const up = () => {
    sosteniendo = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (pulso.estado !== 'DESCEND' && pulso.estado !== 'INSPECT') setState('AWARE');
  };
  const leave = () => {
    dentro = false; sosteniendo = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (pulso.estado !== 'DESCEND' && pulso.estado !== 'INSPECT') setState('IDLE');
  };

  raiz.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch' || sosteniendo) move(e.clientX, e.clientY); }, { passive: true });
  raiz.addEventListener('pointerdown', (e) => { tactil = e.pointerType === 'touch'; down(e.clientX, e.clientY); });
  raiz.addEventListener('pointerup', up);
  raiz.addEventListener('pointercancel', up);
  raiz.addEventListener('pointerleave', (e) => { if ((e as PointerEvent).pointerType !== 'touch') leave(); });
  document.addEventListener('pointerdown', (e) => { if (tactil && !raiz.contains(e.target as Node)) leave(); }, true);

  raiz.addEventListener('keydown', (e) => {
    const step = .12;
    if (e.key === 'ArrowLeft') pulso.objetivo.x -= step;
    else if (e.key === 'ArrowRight') pulso.objetivo.x += step;
    else if (e.key === 'ArrowUp') pulso.objetivo.y -= step;
    else if (e.key === 'ArrowDown') pulso.objetivo.y += step;
    else if (e.key === ' ' || e.key === 'Enter') { dentro = true; setState('AWARE'); setState('LOCK'); e.preventDefault(); return; }
    else return;
    pulso.objetivo.x = clamp(pulso.objetivo.x); pulso.objetivo.y = clamp(pulso.objetivo.y);
    pulso.energia = Math.min(1, pulso.energia + .3); dentro = true; setState('AWARE'); e.preventDefault(); emit();
  });

  let raf = 0;
  const tick = () => {
    pulso.presencia += ((dentro ? 1 : 0) - pulso.presencia) * .06;
    const focusTarget = pulso.estado === 'DESCEND' ? 1 : pulso.estado === 'INSPECT' ? .72 : (pulso.estado === 'LOCK' || pulso.estado === 'TRACK') ? 1 : dentro ? .34 : 0;
    pulso.foco += (focusTarget - pulso.foco) * .08;
    pulso.energia *= .94;
    if (!dentro && pulso.presencia < .02 && !['DORMANT','INSPECT','DESCEND'].includes(pulso.estado)) setState('DORMANT');
    emit(); raf = requestAnimationFrame(tick);
  };
  raiz.dataset.kdxObs = 'DORMANT'; raf = requestAnimationFrame(tick);

  return {
    pulso,
    inspeccionar() { setState('INSPECT'); },
    cerrarInspeccion() { setState(prev === 'INSPECT' ? 'AWARE' : prev); },
    descender() { setState('DESCEND'); },
    escuchar(fn: Oyente) { oyentes.push(fn); return () => { const i = oyentes.indexOf(fn); if (i >= 0) oyentes.splice(i, 1); }; },
    destruir() { cancelAnimationFrame(raf); },
  };
}
