/**
 * El portal no puede inventar audio.
 *
 * Con el sonido apagado la lámina respira igual que siempre, pero ese
 * movimiento ya no entra por `setBass` -- un canal que dice "graves medidos" --
 * sino por `setIdleAnimation`, que dice lo que es: animación generada. Esta
 * prueba fija esa separación en tres afirmaciones:
 *
 *   1. sin sonido, `setBass` NO se llama ni una vez, y el canal medido queda
 *      declarado ausente (`clearBass`), no relleno con un cero disfrazado;
 *   2. con sonido, `setBass` recibe la salida del analizador tal cual, sin
 *      sumarle ni escalarle nada, y el ornamento se apaga;
 *   3. el número que llega al shader es idéntico al de antes del cambio, así
 *      que para el visitante la lámina silenciosa se ve exactamente igual.
 *
 * No hay navegador ni runner en este repo: se monta un DOM y un WebGL2 falsos,
 * como en `kodex-observe-v2-client.test.ts`, y se bombea requestAnimationFrame
 * a mano. `performance.now` se fija para poder comparar la envolvente contra la
 * fórmula original, número contra número.
 *
 * Correr con (Node 24, type-stripping nativo):
 *   node --test src/components/kodex/portal/kodex-portal-client.test.ts
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

/* Hook de resolucion: `*.frag|vert?raw` -> texto, e imports sin extension -> `.ts`. */
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (/\\?raw$/.test(specifier)) {
    return { url: 'data:text/javascript,export default "";', shortCircuit: true };
  }
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (specifier.startsWith('.') && !/\\.[cm]?[jt]s$/.test(specifier)) {
      return nextResolve(specifier + '.ts', context);
    }
    throw error;
  }
}
`)}`);

/* ------------------------------------------------------------------ */
/* Reloj fijo                                                          */
/* ------------------------------------------------------------------ */

let nowMs = 0;
(globalThis as any).performance = { now: () => nowMs };

/* ------------------------------------------------------------------ */
/* WebGL2 falso: todo no-op, salvo lo que el runtime interroga          */
/* ------------------------------------------------------------------ */

const GL_CONST: Record<string, number> = {
  VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
  ACTIVE_UNIFORMS: 5, ARRAY_BUFFER: 6, STATIC_DRAW: 7, TEXTURE_2D: 8,
  FRAMEBUFFER: 9, COLOR_ATTACHMENT0: 10, RGBA: 11, UNSIGNED_BYTE: 12,
  LINEAR: 13, CLAMP_TO_EDGE: 14, TEXTURE_MIN_FILTER: 15, TEXTURE_MAG_FILTER: 16,
  TEXTURE_WRAP_S: 17, TEXTURE_WRAP_T: 18, FLOAT: 19, TRIANGLES: 20, TEXTURE0: 33984,
  UNPACK_FLIP_Y_WEBGL: 37440,
};

/** Cada `uniform1f(u_bass, v)` queda anotado: es lo que ve el shader. */
const uBass: number[] = [];

function makeGl() {
  const base: Record<string, unknown> = {
    ...GL_CONST,
    createShader: () => ({}), createProgram: () => ({}), createBuffer: () => ({}),
    createTexture: () => ({}), createFramebuffer: () => ({}),
    getShaderParameter: () => true,
    getProgramParameter: (_p: unknown, pname: number) => (pname === GL_CONST.LINK_STATUS ? true : 1),
    getActiveUniform: () => ({ name: 'u_bass' }),
    getUniformLocation: () => 'u_bass',
    uniform1f: (loc: string, value: number) => { if (loc === 'u_bass') uBass.push(value); },
  };
  return new Proxy(base, {
    get: (target, prop: string) => (prop in target ? target[prop] : () => undefined),
  });
}

/* ------------------------------------------------------------------ */
/* DOM falso                                                           */
/* ------------------------------------------------------------------ */

function makeEl(name: string): any {
  const cache = new Map<string, any>();
  return {
    name,
    dataset: {},
    style: { setProperty: () => undefined },
    clientWidth: 800,
    clientHeight: 600,
    width: 0,
    height: 0,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    getContext: () => makeGl(),
    querySelector(sel: string) {
      if (!cache.has(sel)) cache.set(sel, makeEl(`${name}${sel}`));
      return cache.get(sel);
    },
    querySelectorAll: () => [],
  };
}

let rafSeq = 0;
const rafPending = new Map<number, (t: number) => void>();

/** Callbacks de IntersectionObserver, para simular "el portal entró en pantalla". */
const ioCallbacks: ((entries: unknown[]) => void)[] = [];

const portalRoot = makeEl('portal');
portalRoot.dataset.artwork = '/img/fake.png';
portalRoot.dataset.seed = '0.382';

const doc: any = {
  readyState: 'complete',
  hidden: false,
  documentElement: { dataset: {}, scrollHeight: 2000, style: { setProperty: () => undefined } },
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  querySelector: () => null,
  querySelectorAll: (sel: string) => (sel === '[data-kdx-portal]' ? [portalRoot] : []),
};

const win: any = {
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  location: { search: '', href: '' },
  devicePixelRatio: 1,
  innerWidth: 1440,
  innerHeight: 900,
  matchMedia: () => ({ matches: false, addEventListener: () => undefined }),
};

const g = globalThis as any;
g.window = win;
g.document = doc;
g.location = win.location;
// Node ya trae `navigator` como getter: hay que redefinir la propiedad.
Object.defineProperty(g, 'navigator', {
  value: { hardwareConcurrency: 8, deviceMemory: 8 },
  configurable: true,
});
g.matchMedia = win.matchMedia;
g.innerWidth = win.innerWidth;
g.innerHeight = win.innerHeight;
g.addEventListener = () => undefined;
g.removeEventListener = () => undefined;
g.requestAnimationFrame = (cb: (t: number) => void) => {
  const id = (rafSeq += 1);
  rafPending.set(id, cb);
  return id;
};
g.cancelAnimationFrame = (id: number) => rafPending.delete(id);
g.IntersectionObserver = class {
  constructor(cb: (entries: unknown[]) => void) { ioCallbacks.push(cb); }
  observe() {}
  disconnect() {}
};
g.Image = class {
  crossOrigin = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(_value: string) { setImmediate(() => this.onload?.()); }
};

/* ------------------------------------------------------------------ */
/* Espias sobre el runtime real                                        */
/* ------------------------------------------------------------------ */

const { KdxThresholdPortalRuntime } = await import('../../../kodex/threshold-portal/index.js');

type Call = { metodo: string; args: number[] };
const calls: Call[] = [];

for (const metodo of ['setBass', 'clearBass', 'setIdleAnimation'] as const) {
  const original = (KdxThresholdPortalRuntime.prototype as any)[metodo];
  (KdxThresholdPortalRuntime.prototype as any)[metodo] = function (...args: number[]) {
    calls.push({ metodo, args });
    return original.apply(this, args);
  };
}

/* Importar el cliente monta el portal sobre el DOM falso. */
await import('./kodex-portal-client.ts');
await new Promise((r) => setImmediate(r)); // deja resolver load() (artwork)

const runtime: any = (portalRoot as any).__kdxPortal?.runtime;
assert.ok(runtime, 'el portal deberia haber montado sobre el root falso');

/** Entra en pantalla: arranca el loop del runtime y el bucle de alimentación. */
ioCallbacks.forEach((cb) => cb([{ isIntersecting: true }]));

function pumpFrames(n: number, msPorCuadro = 16.6667): void {
  for (let i = 0; i < n; i += 1) {
    nowMs += msPorCuadro;
    const cbs = [...rafPending.values()];
    rafPending.clear();
    cbs.forEach((cb) => cb(nowMs));
  }
}

const desde = () => calls.length;
const nuevas = (marca: number) => calls.slice(marca);

/** La fórmula EXACTA que estaba antes en el `else` de `alimentar()`. */
const formulaOriginal = (ms: number) => 0.22 + Math.sin((ms / 1000) * 0.55) * 0.16;

/**
 * Presupuesto de render por cuadro, tal como era antes del cambio: uno del loop
 * del runtime y uno del setter que cambió de valor. `_render` escribe `u_bass`
 * dos veces (pasada source y pasada composite), de ahí el factor.
 */
const RENDERS_POR_CUADRO = 2;
const ESCRITURAS_POR_RENDER = 2;

/* ------------------------------------------------------------------ */
/* Pruebas                                                             */
/* ------------------------------------------------------------------ */

test('sin sonido: setBass no se llama, el movimiento entra por idleAnimation', () => {
  win.__kxAudio = undefined;
  const marca = desde();
  uBass.length = 0;

  pumpFrames(6);
  const hechas = nuevas(marca);

  assert.equal(
    hechas.filter((c) => c.metodo === 'setBass').length,
    0,
    `setBass no debe recibir NADA sin señal; recibió: ${JSON.stringify(hechas.filter((c) => c.metodo === 'setBass'))}`,
  );
  assert.equal(hechas.filter((c) => c.metodo === 'clearBass').length, 6, 'la ausencia se declara cada cuadro');

  const idle = hechas.filter((c) => c.metodo === 'setIdleAnimation').map((c) => c.args[0]);
  assert.equal(idle.length, 6, 'la envolvente de reposo corre cuadro a cuadro');
  assert.ok(new Set(idle).size > 1, 'la lámina se mueve: la envolvente cambia entre cuadros');
});

test('sin sonido: el canal medido queda ausente, no en "cero medido"', () => {
  assert.equal(runtime.state.bass, 0);
  assert.equal(runtime.state.bassMedido, false, 'no hay analizador: nada que declarar como medido');
  assert.equal(runtime.getMetrics().bassMedido, false, 'las métricas dicen la verdad río abajo');
  assert.ok(runtime.getMetrics().idleAnimation > 0, 'y el ornamento se reporta por separado');
});

test('sin sonido: el visitante ve exactamente lo mismo que antes del cambio', () => {
  // Dos cosas tienen que coincidir con el código viejo para que los píxeles no
  // cambien: el VALOR que llega al uniform, cuadro a cuadro, y el NÚMERO de
  // renders por cuadro -- cada render acumula una pasada de feedback, así que
  // renderizar de más alargaría la estela.
  const marca = desde();

  for (let i = 0; i < 5; i += 1) {
    const anterior = formulaOriginal(nowMs); // lo que el loop del runtime va a repintar
    uBass.length = 0;
    pumpFrames(1);
    // Orden dentro del cuadro, igual que antes: primero repinta el loop con el
    // valor del cuadro anterior, después `paso()` escribe el nuevo y repinta.
    assert.equal(uBass.length, RENDERS_POR_CUADRO * ESCRITURAS_POR_RENDER,
      `cuadro ${i}: el portal debe seguir renderizando ${RENDERS_POR_CUADRO} veces por cuadro`);
    assert.deepEqual([...new Set(uBass)], [anterior, formulaOriginal(nowMs)],
      `cuadro ${i}: el uniform recibe la envolvente original y nada más`);
  }

  const idle = nuevas(marca).filter((c) => c.metodo === 'setIdleAnimation').map((c) => c.args[0]);
  assert.equal(idle.length, 5, 'la envolvente se escribe una vez por cuadro');
});

test('con sonido: setBass recibe la salida del analizador sin tocar', () => {
  win.__kxAudio = { activo: true, low: 0.731, mid: 0.4, high: 0.2 };
  pumpFrames(1); // cuadro de transición: aquí el ornamento se apaga
  const marca = desde();
  uBass.length = 0;

  pumpFrames(4);
  const hechas = nuevas(marca);

  assert.deepEqual(
    hechas.filter((c) => c.metodo === 'setBass').map((c) => c.args[0]),
    [0.731, 0.731, 0.731, 0.731],
    'sin sumas, sin escalas, sin envolvente encima',
  );
  assert.equal(hechas.filter((c) => c.metodo === 'clearBass').length, 0, 'hay señal: no se declara ausencia');
  assert.deepEqual(
    hechas.filter((c) => c.metodo === 'setIdleAnimation').map((c) => c.args[0]),
    [0, 0, 0, 0],
    'con señal real el ornamento se apaga',
  );

  assert.equal(runtime.state.bass, 0.731);
  assert.equal(runtime.state.bassMedido, true);
  assert.deepEqual([...new Set(uBass)], [0.731], 'el shader ve la medición y nada más');
  assert.equal(uBass.length, 4 * RENDERS_POR_CUADRO * ESCRITURAS_POR_RENDER,
    'con sonido el presupuesto de render por cuadro tampoco cambia');
});

test('al apagar el sonido no queda un grave viejo colándose en el reposo', () => {
  win.__kxAudio = { activo: false, low: 0.731, mid: 0.4, high: 0.2 };
  const marca = desde();

  pumpFrames(1); // cuadro de transición
  assert.equal(runtime.state.bass, 0, 'el 0.731 medido no puede sobrevivir al silencio');
  assert.equal(runtime.state.bassMedido, false);

  const anterior = formulaOriginal(nowMs);
  uBass.length = 0;
  pumpFrames(1);
  assert.deepEqual([...new Set(uBass)], [anterior, formulaOriginal(nowMs)],
    'ya en régimen, el desplazamiento es la envolvente sola: ningún grave viejo colado');
  assert.equal(nuevas(marca).filter((c) => c.metodo === 'setBass').length, 0);
});

test('nada en el cliente del portal escribe un valor generado en setBass', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('./kodex-portal-client.ts', import.meta.url), 'utf8');
  const llamadas = [...src.matchAll(/\bsetBass\(([^)]*)\)/g)].map((m) => m[1]);
  assert.deepEqual(llamadas, ['bus.low'], 'setBass sólo puede transportar el bus del analizador');

  // Toda función generadora del archivo tiene que vivir en el canal ornamental.
  const generadoras = src
    .split('\n')
    .filter((l) => /Math\.(sin|cos|random)/.test(l));
  assert.deepEqual(generadoras.map((l) => l.trim()), ['0.22 + Math.sin(segundos * 0.55) * 0.16;'],
    'el único seno del portal es la envolvente de reposo, y está declarada como tal');
});
