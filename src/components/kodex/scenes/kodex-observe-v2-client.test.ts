/**
 * Prueba de ciclo de vida para KdxObserveV2Runtime.
 *
 * No hay navegador ni runner en este repo: se monta un DOM y un WebGL2
 * falsos, minimos pero con contabilidad, para poder afirmar cuatro cosas:
 *   1. cada addEventListener tiene su removeEventListener,
 *   2. cada objeto GL creado se borra y el contexto se suelta,
 *   3. `visibilitychange` no resucita un runtime detenido ni destruido,
 *   4. el comportamiento montado (parar al ocultar, reanudar al volver) sigue igual.
 *
 * El loop no se comprueba leyendo una bandera sino bombeando requestAnimationFrame:
 * si tras ejecutar los callbacks pendientes se reencola otro, el loop esta vivo.
 *
 * Correr con (Node 24, type-stripping nativo):
 *   node --test src/components/kodex/scenes/kodex-observe-v2-client.test.ts
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

/*
 * Hook de resolucion: hace las dos cosas que hace Vite y Node no.
 *   1. `*.glsl?raw` -> modulo de texto,
 *   2. imports relativos sin extension -> `.ts`.
 * Va embebido como data: URL para no dejar un archivo suelto en el repo.
 */
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
  if (specifier.includes('.glsl?raw')) {
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
/* Contabilidad de listeners                                           */
/* ------------------------------------------------------------------ */

type Entry = { target: string; type: string; fn: unknown };
const live: Entry[] = [];
let totalAdds = 0;

function listenerBag(targetName: string) {
  return {
    addEventListener(type: string, fn: unknown) {
      totalAdds += 1;
      live.push({ target: targetName, type, fn });
    },
    removeEventListener(type: string, fn: unknown) {
      const i = live.findIndex((e) => e.target === targetName && e.type === type && e.fn === fn);
      if (i >= 0) live.splice(i, 1);
    },
  };
}

/**
 * Listeners que un runtime dejo sueltos.
 * Excluye `astro:before-swap`: ese es del modulo, no de la instancia, se
 * registra una sola vez y debe sobrevivir a las navegaciones justamente para
 * poder desmontar. Se comprueba aparte en `swapHooks()`.
 */
const leaks = () => live.filter((e) => e.type !== 'astro:before-swap').map((e) => `${e.target}:${e.type}`);
const swapHooks = () => live.filter((e) => e.type === 'astro:before-swap').length;

/* ------------------------------------------------------------------ */
/* WebGL2 falso con contabilidad de objetos                            */
/* ------------------------------------------------------------------ */

type GlObj = { kind: string; id: number; deleted: boolean };
const glObjects: GlObj[] = [];
let glId = 0;
let contextLost = false;

const GL_CONST: Record<string, number> = {
  VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
  ACTIVE_UNIFORMS: 5, ARRAY_BUFFER: 6, STATIC_DRAW: 7, TEXTURE_2D: 8,
  FRAMEBUFFER: 9, COLOR_ATTACHMENT0: 10, RGBA: 11, UNSIGNED_BYTE: 12,
  LINEAR: 13, CLAMP_TO_EDGE: 14, TEXTURE_MIN_FILTER: 15, TEXTURE_MAG_FILTER: 16,
  TEXTURE_WRAP_S: 17, TEXTURE_WRAP_T: 18, FLOAT: 19, TRIANGLES: 20, TEXTURE0: 33984,
};

function make(kind: string): GlObj {
  const obj = { kind, id: (glId += 1), deleted: false };
  glObjects.push(obj);
  return obj;
}

function del(kind: string, obj: GlObj | null) {
  if (!obj) return;
  assert.equal(obj.kind, kind, `delete${kind} recibio un ${obj.kind}`);
  assert.equal(obj.deleted, false, `${kind} #${obj.id} borrado dos veces`);
  obj.deleted = true;
}

const undeleted = () => glObjects.filter((o) => !o.deleted).map((o) => `${o.kind}#${o.id}`);

function makeGl() {
  const base: Record<string, unknown> = {
    ...GL_CONST,
    createShader: () => make('Shader'),
    createProgram: () => make('Program'),
    createBuffer: () => make('Buffer'),
    createTexture: () => make('Texture'),
    createFramebuffer: () => make('Framebuffer'),
    deleteShader: (o: GlObj) => del('Shader', o),
    deleteProgram: (o: GlObj) => del('Program', o),
    deleteBuffer: (o: GlObj) => del('Buffer', o),
    deleteTexture: (o: GlObj) => del('Texture', o),
    deleteFramebuffer: (o: GlObj) => del('Framebuffer', o),
    getShaderParameter: () => true,
    getProgramParameter: (_p: unknown, pname: number) =>
      (pname === GL_CONST.LINK_STATUS ? true : 0), // 0 uniformes activos
    getActiveUniform: () => null,
    getUniformLocation: () => ({}),
    getExtension: (name: string) =>
      (name === 'WEBGL_lose_context' ? { loseContext: () => { contextLost = true; } } : null),
  };
  // Cualquier otro metodo GL (bind*, uniform*, draw*, ...) es un no-op.
  return new Proxy(base, {
    get(target, prop: string) {
      if (prop in target) return target[prop];
      return () => undefined;
    },
  });
}

/* ------------------------------------------------------------------ */
/* DOM falso                                                           */
/* ------------------------------------------------------------------ */

function makeEl(name: string): any {
  const cache = new Map<string, any>();
  return {
    ...listenerBag(name),
    dataset: {},
    hidden: false,
    textContent: '',
    style: { setProperty: () => undefined },
    classList: { add: () => undefined, remove: () => undefined, toggle: () => undefined },
    setAttribute: () => undefined,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    clientWidth: 800,
    clientHeight: 600,
    width: 0,
    height: 0,
    getContext: () => makeGl(),
    querySelector(sel: string) {
      if (!cache.has(sel)) cache.set(sel, makeEl(`${name}${sel}`));
      return cache.get(sel);
    },
    querySelectorAll: () => [makeEl('bar'), makeEl('bar'), makeEl('bar')],
  };
}

let rafSeq = 0;
const rafPending = new Map<number, (t: number) => void>();

const root = makeEl('root');
const doc: any = {
  ...listenerBag('document'),
  hidden: false,
  documentElement: { scrollHeight: 2000 },
  querySelectorAll: () => [root],
};
const win: any = {
  ...listenerBag('window'),
  location: { search: '', href: '' },
  devicePixelRatio: 1,
  innerHeight: 900,
  matchMedia: () => ({ matches: false }),
  setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) as unknown as number,
  clearTimeout: (id: number) => clearTimeout(id as never),
};

const g = globalThis as any;
g.window = win;
g.document = doc;
g.matchMedia = win.matchMedia;
g.requestAnimationFrame = (cb: (t: number) => void) => {
  const id = (rafSeq += 1);
  rafPending.set(id, cb);
  return id;
};
g.cancelAnimationFrame = (id: number) => rafPending.delete(id);

const mod = await import('./kodex-observe-v2-client.ts');

/** Ejecuta los callbacks de RAF pendientes. Devuelve true si el loop se reencolo. */
function pumpFrame(): boolean {
  const cbs = [...rafPending.values()];
  rafPending.clear();
  cbs.forEach((cb) => cb(performance.now()));
  return rafPending.size > 0;
}

async function mountOne() {
  mod.mountKodexObserveV2Scenes();
  await new Promise((r) => setImmediate(r)); // deja resolver load()
  const runtime = mod.getKodexObserveV2Runtime(root);
  assert.ok(runtime, 'mount deberia dejar un runtime accesible');
  return runtime!;
}

/** Dispara los handlers de visibilitychange que sigan registrados en document. */
function fireVisibility(hidden: boolean) {
  doc.hidden = hidden;
  live
    .filter((e) => e.target === 'document' && e.type === 'visibilitychange')
    .forEach((e) => (e.fn as () => void)());
}

/* ------------------------------------------------------------------ */
/* Pruebas                                                             */
/* ------------------------------------------------------------------ */

let runtime: any;

test('monta: registra los 10 listeners y crea los objetos GL', async () => {
  runtime = await mountOne();
  assert.equal(totalAdds, 11, `esperaba 11 altas (10 de la escena + astro:before-swap), hubo ${totalAdds}`);
  assert.equal(live.filter((e) => e.type === 'visibilitychange').length, 1);
  // 6 programas x (1 program + 2 shaders) + 1 buffer + 6 texturas + 6 framebuffers
  assert.equal(glObjects.length, 6 * 3 + 1 + 6 + 6);
  assert.ok(pumpFrame(), 'el loop deberia estar vivo tras montar');
});

test('comportamiento montado intacto: ocultar para el loop, volver lo reanuda', () => {
  fireVisibility(true);
  assert.equal(pumpFrame(), false, 'ocultar la pestana debe parar el loop');
  fireVisibility(false);
  assert.ok(pumpFrame(), 'volver a la pestana debe reanudar el loop');
});

test('un runtime detenido a proposito NO resucita al volver a la pestana', () => {
  runtime.stop();
  assert.equal(pumpFrame(), false);
  fireVisibility(true);
  fireVisibility(false);
  assert.equal(pumpFrame(), false, 'stop() explicito no debe revivir por visibilitychange');
  runtime.start(); // lo devolvemos a running para la prueba de destroy
  assert.ok(pumpFrame());
});

test('destroy: para el loop, suelta todo listener y borra todo objeto GL', () => {
  runtime.destroy();

  assert.equal(pumpFrame(), false, 'destroy debe parar el loop');
  assert.equal(runtime.timeouts.size, 0, 'destroy debe limpiar los timeouts');
  assert.deepEqual(leaks(), [], `listeners sin soltar: ${leaks().join(', ')}`);
  assert.deepEqual(undeleted(), [], `objetos GL sin borrar: ${undeleted().join(', ')}`);
  assert.ok(contextLost, 'destroy debe pedir WEBGL_lose_context');
  assert.equal(runtime.gl, null);
  assert.equal(runtime.programs, null);
  assert.equal(runtime.quad, null);
  assert.equal(mod.getKodexObserveV2Runtime(root), null, 'destroy debe limpiar el WeakMap');
});

test('un runtime destruido NO resucita al volver a la pestana', () => {
  // El handler ya fue removido del document; lo invocamos a mano para
  // probar tambien la guarda interna.
  runtime.onVisibilityChange();
  assert.equal(pumpFrame(), false, 'un runtime destruido jamas debe volver a arrancar');
  runtime.start();
  assert.equal(pumpFrame(), false, 'start() sobre un runtime destruido debe ser no-op');
});

test('destroy es idempotente y deja el root listo para remontar', async () => {
  runtime.destroy(); // segunda vez: no debe lanzar ni doble-borrar

  const fresh = await mountOne();
  assert.notEqual(fresh, runtime, 'el WeakMap limpio permite un runtime nuevo');
  assert.ok(pumpFrame(), 'el remontaje arranca su propio loop');

  fresh.destroy();
  assert.deepEqual(leaks(), [], 'el remontaje tambien se suelta entero');
  assert.deepEqual(undeleted(), [], 'el remontaje tampoco deja objetos GL');
  assert.equal(swapHooks(), 1, 'el hook de astro:before-swap se registra una sola vez');
});
