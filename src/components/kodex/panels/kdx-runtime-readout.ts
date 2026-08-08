/**
 * KODEX−∞ · LECTURA DE TIEMPO DE EJECUCION
 *
 * Lo unico que esta hoja puede afirmar como MEDIDO. Todo lo demas en la lamina
 * es CANON (manifiesto / motor, verificable en el repo) o AUTHORED (texto de
 * autor), y va marcado como tal en el sitio.
 *
 * Este archivo NO inventa nada. Cada valor sale de preguntarle al navegador o
 * de leer un atributo que el portal ya escribe por su cuenta:
 *
 *   RENDERER   se intenta crear un contexto webgl2 de prueba y se lee
 *              UNMASKED_RENDERER_WEBGL si el navegador lo expone. Si el portal
 *              declaro `unavailable`, se dice FALLBACK · IMG y punto.
 *   MOTION     matchMedia('(prefers-reduced-motion: reduce)')
 *   VIEWPORT   innerWidth x innerHeight
 *   DPR        devicePixelRatio
 *   STATE      data-kdx-portal-phase, que escribe el propio portal.
 *
 * Es de solo lectura sobre el portal: observa, no lo dirige.
 */

type Hook =
  | 'renderer'
  | 'motion'
  | 'viewport'
  | 'dpr'
  | 'state'
  | 'gpu'
  | 'canvas';

const write = (hook: Hook, value: string) => {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-kdxp-hook="${hook}"]`)) {
    if (el.textContent !== value) el.textContent = value;
  }
};

/** Contexto de prueba, descartado enseguida. No toca el portal. */
function probeRenderer(): { api: string; gpu: string } {
  try {
    const c = document.createElement('canvas');
    const gl2 = c.getContext('webgl2');
    if (gl2) {
      const dbg = gl2.getExtension('WEBGL_debug_renderer_info');
      const gpu = dbg ? String(gl2.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : gl2.getParameter(gl2.VERSION);
      return { api: 'WEBGL2', gpu: String(gpu) };
    }
    const gl1 = c.getContext('webgl');
    if (gl1) return { api: 'WEBGL1', gpu: 'NO WEBGL2' };
  } catch {
    /* un navegador que niega el contexto es un dato, no un error */
  }
  return { api: 'NONE', gpu: 'UNAVAILABLE' };
}

function shorten(gpu: string): string {
  // Las cadenas de GPU traen parentesis largos. Se recorta sin reescribir.
  const m = gpu.match(/\(([^)]+)\)\s*$/);
  const s = (m ? m[1] : gpu).trim();
  return s.length > 26 ? `${s.slice(0, 25)}…` : s.toUpperCase();
}

function mount() {
  const portal = document.querySelector<HTMLElement>('[data-kdx-portal]');
  const probe = probeRenderer();

  const paintRenderer = () => {
    const st = portal?.dataset.kdxPortalState;
    if (st === 'unavailable') {
      write('renderer', 'FALLBACK · IMG');
      write('gpu', 'PORTAL NOT MOUNTED');
      return;
    }
    write('renderer', st === 'ready' ? `${probe.api} · LIVE` : probe.api);
    write('gpu', shorten(probe.gpu));
  };

  const paintMotion = () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    write('motion', reduce ? 'REDUCED' : 'FULL');
  };

  const paintViewport = () => {
    write('viewport', `${innerWidth} × ${innerHeight}`);
    write('dpr', devicePixelRatio.toFixed(2));
    const c = portal?.querySelector<HTMLCanvasElement>('canvas');
    write('canvas', c && c.width
      ? `${c.width} × ${c.height} @${devicePixelRatio.toFixed(2)}`
      : 'NOT ALLOCATED');
  };

  const paintState = () => {
    // Antes de que el portal declare una fase, la fase es la del canon: el
    // organismo arranca DORMANT. No se adivina: es su valor por defecto
    // declarado en src/kodex/threshold-portal/config.js.
    write('state', portal?.dataset.kdxPortalPhase ?? 'DORMANT');
  };

  /* El estado vigente se marca EN la lista, no en una leyenda aparte. Es la
     regla del poster: el activo lleva el acento, los demas quedan en gris. */
  const markState = () => {
    const phase = portal?.dataset.kdxPortalPhase ?? 'DORMANT';
    for (const el of document.querySelectorAll<HTMLElement>('[data-kdxp-state]')) {
      el.dataset.active = String(el.dataset.kdxpState === phase);
    }
  };

  /* Lo mismo para el eje del archivo. Su nombre lo escribe el propio modulo
     del archivo en [data-kdx-archive-name]; aca solo se lee. */
  const nameEl = document.querySelector<HTMLElement>('[data-kdx-archive-name]');
  const markPhase = () => {
    const txt = nameEl?.textContent ?? '';
    for (const el of document.querySelectorAll<HTMLElement>('[data-kdxp-phase]')) {
      el.dataset.active = String(!!el.dataset.kdxpPhase && txt.includes(el.dataset.kdxpPhase));
    }
  };

  const paintAll = () => {
    paintRenderer(); paintMotion(); paintViewport(); paintState(); markState(); markPhase();
  };
  paintAll();

  if (portal) {
    new MutationObserver(() => { paintRenderer(); paintState(); paintViewport(); markState(); })
      .observe(portal, { attributes: true, attributeFilter: ['data-kdx-portal-state', 'data-kdx-portal-phase'] });
  }
  if (nameEl) {
    new MutationObserver(markPhase).observe(nameEl, { childList: true, characterData: true, subtree: true });
  }

  /* ------------------------------------------------------------------------
     El gesto de la hoja en telefono.

     `data-kdx-tool="girar"` hace que la rueda y el arrastre vertical giren el
     mandala en vez de scrollear: src/lib/kodex/scroll.ts llama preventDefault
     en `wheel` y `touchmove`. Su unica valvula de escape es
     `[data-kdx-scrollable]` -- si el gesto nace dentro de uno, la rueda vuelve
     a ser la rueda.

     En escritorio la hoja entra entera y el giro es la herramienta correcta.
     En telefono la hoja mide ~2400px y NO poder scrollearla la deja
     inutilizable. Asi que la valvula se abre solo abajo de 900px.

     El canje es explicito y se elige a proposito: en telefono el dedo scrollea
     la hoja y no gira el portal. Una hoja que no se puede recorrer no es una
     hoja.
     ------------------------------------------------------------------------ */
  const board = document.querySelector<HTMLElement>('.kdxp-board');
  const phone = matchMedia('(max-width: 900px)');
  const syncScrollTool = () => {
    if (!board) return;
    if (phone.matches) board.setAttribute('data-kdx-scrollable', '');
    else board.removeAttribute('data-kdx-scrollable');
  };
  syncScrollTool();
  phone.addEventListener('change', syncScrollTool);

  let t = 0;
  addEventListener('resize', () => {
    clearTimeout(t);
    t = window.setTimeout(paintViewport, 160);
  }, { passive: true });

  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', paintMotion);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
document.addEventListener('astro:page-load', mount);
