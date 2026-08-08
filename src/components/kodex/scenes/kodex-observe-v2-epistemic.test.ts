/**
 * MP-8 — Prueba de pasaporte epistemico para OBSERVE V2.
 *
 * La falta que se corrige: la escena mostraba valores inventados (SIGNAL 24%,
 * CONFIDENCE LOW, CHECKSUM VERIFIED...) al lado de valores realmente medidos
 * (fps, frame time), sin nada que los distinguiera. El canon lo prohibe:
 *
 *   - "Prohibited pseudo-metrics: unless derived from real, declared inputs,
 *      canonical interfaces must not show values such as [...]"
 *   - "Atmospheric response is allowed only when labeled ATMOSPHERE"
 *   - "Atmospheric elements must never impersonate data"
 *
 * Esta prueba afirma dos cosas, en los dos momentos en que la escena existe:
 *
 *   1. EN EL MARCADO (antes de que corra JS): toda lectura esta clasificada
 *      con `data-kdx-epistemic`, y toda lectura atmosferica lleva la palabra
 *      ATMOSPHERE como texto real. Se resuelve por ancestros con un tokenizador
 *      de etiquetas, no por cercania de lineas.
 *
 *   2. EN EJECUCION: el cliente reescribe cada lectura conservando su clase,
 *      y le pone `aria-label` para que la distincion tambien llegue a quien no
 *      ve la pantalla. Ademas: ninguna lectura atmosferica queda sin marca, y
 *      ninguna lectura medida queda marcada como atmosferica.
 *
 * Correr con (Node 24, type-stripping nativo):
 *   node --test src/components/kodex/scenes/kodex-observe-v2-epistemic.test.ts
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { register } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));

/* Mismo hook de resolucion que la prueba de ciclo de vida: `*.glsl?raw` y
 * imports relativos sin extension. Embebido para no dejar archivos sueltos. */
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
/* Inventario de lecturas                                              */
/*                                                                     */
/* Cada gancho `data-` que la escena usa para escribir un valor visible, */
/* con la clase que le corresponde. Si alguien anade una lectura nueva  */
/* y no la clasifica, la prueba de cobertura de abajo la caza.          */
/* ------------------------------------------------------------------ */

type Epistemic = 'measured' | 'state' | 'atmosphere';

const READOUTS: { hook: string; label: string; epistemic: Epistemic; why: string }[] = [
  // Compuestas desde el enum de modo o desde senos. No miden nada.
  { hook: 'data-kdx-signal-readout', label: 'SIGNAL', epistemic: 'atmosphere', why: 'interpolado de targets[mode] + seno de respiracion' },
  { hook: 'data-kdx-focus-readout', label: 'FOCUS', epistemic: 'atmosphere', why: 'interpolado de targets[mode]' },
  { hook: 'data-kdx-anomaly-readout', label: 'ANOMALY', epistemic: 'atmosphere', why: 'interpolado de targets[mode] + seno' },
  { hook: 'data-kdx-node-readout', label: 'NODES', epistemic: 'atmosphere', why: 'interpolado de targets[mode].nodes' },
  { hook: 'data-kdx-latency-readout', label: 'LATENCY', epistemic: 'atmosphere', why: 'targets[mode].latency, no es una latencia medida' },
  { hook: 'data-kdx-latency-inline', label: 'LATENCY (riel)', epistemic: 'atmosphere', why: 'mismo valor compuesto' },
  { hook: 'data-kdx-checksum-readout', label: 'CHECKSUM', epistemic: 'atmosphere', why: 'targets[mode].checksum, no se calcula ningun digest' },
  { hook: 'data-kdx-checksum-foot', label: 'CHECKSUM (pie)', epistemic: 'atmosphere', why: 'mismo valor compuesto' },
  { hook: 'data-kdx-checksum-chip', label: 'CHECKSUM (chip)', epistemic: 'atmosphere', why: 'mismo valor compuesto' },
  { hook: 'data-kdx-source-readout', label: 'SOURCE', epistemic: 'atmosphere', why: 'derivado del enum de modo' },
  { hook: 'data-kdx-acquisition-readout', label: 'ACQUISITION', epistemic: 'atmosphere', why: 'derivado del enum de modo' },
  { hook: 'data-kdx-confidence-readout', label: 'CONFIDENCE', epistemic: 'atmosphere', why: 'derivado del enum de modo; es una afirmacion epistemica' },
  { hook: 'data-kdx-signal-tag', label: 'SIGNAL TAG', epistemic: 'atmosphere', why: 'CORE/NODES compuestos' },
  { hook: 'data-kdx-telemetry-copy', label: 'TELEMETRY COPY', epistemic: 'atmosphere', why: 'FOCUS/ANOMALY/CHECKSUM compuestos' },
  { hook: 'data-kdx-right-rail-a', label: 'RIEL SOURCE', epistemic: 'atmosphere', why: 'derivado del enum de modo' },
  { hook: 'data-kdx-right-rail-c', label: 'RIEL FIELD', epistemic: 'atmosphere', why: 'checksum compuesto' },

  // El modo real de la interfaz. Cierto, pero no mide nada fuera de si.
  { hook: 'data-kdx-status-chip', label: 'STATUS', epistemic: 'state', why: 'el modo actual de la escena' },
  { hook: 'data-kdx-right-rail-b', label: 'RIEL MODE', epistemic: 'state', why: 'el modo actual de la escena' },

  // Cronometrado de verdad en este navegador, o hecho real del runtime.
  { hook: 'data-kdx-fps-readout', label: 'FRAME RATE', epistemic: 'measured', why: 'measureMetrics(): 1000 / frame time promedio' },
  { hook: 'data-kdx-frametime-readout', label: 'FRAME TIME', epistemic: 'measured', why: 'measureMetrics(): promedio del buffer de deltas' },
  { hook: 'data-kdx-window-readout', label: 'SAMPLE WINDOW', epistemic: 'measured', why: 'suma real del buffer de muestras, en segundos reales' },
  { hook: 'data-kdx-metric-chip', label: 'METRIC CHIP', epistemic: 'measured', why: 'webglActive, passCount y fps reales' },
  { hook: 'data-kdx-profile-chip', label: 'PROFILE', epistemic: 'measured', why: 'el perfil de calidad realmente en uso' },
  { hook: 'data-kdx-right-rail-d', label: 'RIEL RENDER', epistemic: 'measured', why: 'ruta de render real (WebGL o fallback)' },
];

const MARK: Record<Epistemic, string> = { measured: 'MEASURED', state: 'STATE', atmosphere: 'ATMOSPHERE' };

/* ------------------------------------------------------------------ */
/* 1. Auditoria del marcado servido                                    */
/* ------------------------------------------------------------------ */

const ASTRO = readFileSync(join(HERE, 'KodexObserveV2Scene.astro'), 'utf8');

type Node = { tag: string; attrs: string; open: number; close: number; parent: Node | null };

/**
 * Tokenizador de etiquetas minimo. No es un parser de HTML: solo necesita
 * saber, para un gancho dado, que ancestros lo envuelven, y eso se resuelve
 * con una pila de etiquetas abiertas. Basta para este archivo.
 */
function parseTags(src: string): Node[] {
  const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'area', 'base', 'col']);
  const nodes: Node[] = [];
  const stack: Node[] = [];
  const re = /<(\/?)([A-Za-z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [full, slash, tag, attrs, selfClose] = m;
    if (slash) {
      const i = stack.map((n) => n.tag).lastIndexOf(tag);
      if (i >= 0) {
        stack[i].close = m.index + full.length;
        stack.length = i;
      }
      continue;
    }
    const node: Node = {
      tag,
      attrs,
      open: m.index,
      close: m.index + full.length,
      parent: stack[stack.length - 1] ?? null,
    };
    nodes.push(node);
    if (!selfClose && !VOID.has(tag.toLowerCase())) stack.push(node);
  }
  return nodes;
}

const NODES = parseTags(ASTRO);

/** Devuelve el nodo que declara el gancho, o null. */
function nodeForHook(hook: string): Node | null {
  return NODES.find((n) => new RegExp(`(^|\\s)${hook}(\\s|=|$)`).test(n.attrs)) ?? null;
}

/** Sube por los ancestros buscando `data-kdx-epistemic`. */
function epistemicOf(node: Node): { value: string; owner: Node } | null {
  for (let n: Node | null = node; n; n = n.parent) {
    const m = /data-kdx-epistemic=["']([a-z]+)["']/.exec(n.attrs);
    if (m) return { value: m[1], owner: n };
  }
  return null;
}

test('marcado: toda lectura declara su clase epistemica', () => {
  const missing: string[] = [];
  const wrong: string[] = [];
  for (const r of READOUTS) {
    const node = nodeForHook(r.hook);
    assert.ok(node, `el gancho ${r.hook} (${r.label}) no existe en el marcado`);
    const found = epistemicOf(node!);
    if (!found) missing.push(`${r.label} <${r.hook}>`);
    else if (found.value !== r.epistemic) wrong.push(`${r.label}: esperaba ${r.epistemic}, marcado ${found.value}`);
  }
  assert.deepEqual(missing, [], `lecturas sin clase epistemica: ${missing.join(', ')}`);
  assert.deepEqual(wrong, [], `lecturas mal clasificadas: ${wrong.join(', ')}`);
});

test('marcado: toda lectura atmosferica lleva la palabra ATMOSPHERE como texto real', () => {
  const unmarked: string[] = [];
  for (const r of READOUTS.filter((x) => x.epistemic === 'atmosphere')) {
    const node = nodeForHook(r.hook)!;
    const owner = epistemicOf(node)!.owner;
    // El texto servido del bloque que declara la clase, sin etiquetas.
    const region = ASTRO.slice(owner.open, owner.close > owner.open ? owner.close : owner.open + 400);
    const text = region.replace(/<[^>]*>/g, ' ');
    if (!text.includes('ATMOSPHERE')) unmarked.push(`${r.label} <${r.hook}>`);
  }
  assert.deepEqual(unmarked, [], `atmosfericas sin marca visible: ${unmarked.join(', ')}`);
});

test('marcado: la marca es texto, no un `content:` de pseudo-elemento', () => {
  const css = readFileSync(join(HERE, 'kodex-observe-v2.css'), 'utf8');
  // Una marca implementada con ::before { content: 'ATMOSPHERE' } se pierde al
  // desactivar el CSS y no siempre llega al arbol de accesibilidad.
  assert.doesNotMatch(css, /content:\s*["'][^"']*ATMOSPHERE/i, 'la marca no puede vivir en `content:`');
  assert.ok(ASTRO.includes('>ATMOSPHERE<'), 'ATMOSPHERE debe existir como nodo de texto en el marcado');
});

test('marcado: la palabra VERIFIED ya no se muestra', () => {
  const text = ASTRO.replace(/<[^>]*>/g, ' ');
  assert.doesNotMatch(text, /\bVERIFIED\b/, 'CHECKSUM: VERIFIED afirma una verificacion que nunca ocurre');
});

/* ------------------------------------------------------------------ */
/* 2. Auditoria en ejecucion                                           */
/* ------------------------------------------------------------------ */

/* DOM falso con contabilidad de atributos: a diferencia del de la prueba de
 * ciclo de vida, este SI recuerda lo que se le escribe, que es justo lo que
 * hay que comprobar. Cada selector devuelve su propio elemento estable. */

const GL_CONST: Record<string, number> = {
  VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
  ACTIVE_UNIFORMS: 5, ARRAY_BUFFER: 6, STATIC_DRAW: 7, TEXTURE_2D: 8,
  FRAMEBUFFER: 9, COLOR_ATTACHMENT0: 10, RGBA: 11, UNSIGNED_BYTE: 12,
  LINEAR: 13, CLAMP_TO_EDGE: 14, TEXTURE_MIN_FILTER: 15, TEXTURE_MAG_FILTER: 16,
  TEXTURE_WRAP_S: 17, TEXTURE_WRAP_T: 18, FLOAT: 19, TRIANGLES: 20, TEXTURE0: 33984,
};

function makeGl() {
  const base: Record<string, unknown> = {
    ...GL_CONST,
    createShader: () => ({}), createProgram: () => ({}), createBuffer: () => ({}),
    createTexture: () => ({}), createFramebuffer: () => ({}),
    getShaderParameter: () => true,
    getProgramParameter: (_p: unknown, pname: number) => (pname === GL_CONST.LINK_STATUS ? true : 0),
    getActiveUniform: () => null,
    getUniformLocation: () => ({}),
    getExtension: () => null,
  };
  return new Proxy(base, { get: (t, p: string) => (p in t ? t[p] : () => undefined) });
}

function makeEl(name: string): any {
  const cache = new Map<string, any>();
  const attrs: Record<string, string> = {};
  return {
    name,
    attrs,
    dataset: {},
    hidden: false,
    textContent: '',
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    style: { setProperty: () => undefined },
    classList: { add: () => undefined, remove: () => undefined, toggle: () => undefined },
    setAttribute: (k: string, v: string) => { attrs[k] = v; },
    getAttribute: (k: string) => attrs[k] ?? null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    clientWidth: 800, clientHeight: 600, width: 0, height: 0,
    getContext: () => makeGl(),
    querySelector(sel: string) {
      if (!cache.has(sel)) cache.set(sel, makeEl(sel));
      return cache.get(sel);
    },
    querySelectorAll: () => [makeEl('bar'), makeEl('bar'), makeEl('bar')],
  };
}

const rafPending = new Map<number, (t: number) => void>();
let rafSeq = 0;
const root = makeEl('root');

const g = globalThis as any;
g.window = {
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  location: { search: '', href: '' },
  devicePixelRatio: 1,
  innerHeight: 900,
  matchMedia: () => ({ matches: false }),
  setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) as unknown as number,
  clearTimeout: (id: number) => clearTimeout(id as never),
};
g.document = {
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
  hidden: false,
  documentElement: { scrollHeight: 2000 },
  querySelectorAll: () => [root],
};
g.matchMedia = g.window.matchMedia;
g.requestAnimationFrame = (cb: (t: number) => void) => { const id = (rafSeq += 1); rafPending.set(id, cb); return id; };
g.cancelAnimationFrame = (id: number) => rafPending.delete(id);

const mod = await import('./kodex-observe-v2-client.ts');

mod.mountKodexObserveV2Scenes();
await new Promise((r) => setImmediate(r));
const runtime = mod.getKodexObserveV2Runtime(root);
assert.ok(runtime, 'la escena deberia montar');

/* Bombea unos frames para que measureMetrics junte muestras reales. */
for (let i = 0; i < 8; i += 1) {
  const cbs = [...rafPending.values()];
  rafPending.clear();
  cbs.forEach((cb) => cb(performance.now() + i * 16.7));
}

const el = (hook: string) => root.querySelector(`[${hook}]`);

test('runtime: el cliente conserva la clase epistemica de cada lectura', () => {
  const bad: string[] = [];
  for (const r of READOUTS) {
    const got = el(r.hook).dataset.kdxEpistemic;
    if (got !== r.epistemic) bad.push(`${r.label}: esperaba ${r.epistemic}, escribio ${got ?? 'nada'}`);
  }
  assert.deepEqual(bad, [], bad.join(' | '));
});

test('runtime: cada lectura expone su clase tambien por aria-label', () => {
  const bad: string[] = [];
  for (const r of READOUTS) {
    const aria = el(r.hook).getAttribute('aria-label');
    if (!aria) { bad.push(`${r.label}: sin aria-label`); continue; }
    const expects = r.epistemic === 'atmosphere' ? /not measured and not detected/ : r.epistemic === 'measured' ? /measured value/ : /interface state/;
    if (!expects.test(aria)) bad.push(`${r.label}: aria-label no declara la clase (${aria})`);
  }
  assert.deepEqual(bad, [], bad.join(' | '));
});

test('runtime: ninguna lectura atmosferica se confunde con una medida', () => {
  const atmosphere = READOUTS.filter((r) => r.epistemic === 'atmosphere');
  const measured = READOUTS.filter((r) => r.epistemic === 'measured');

  // Toda atmosferica queda marcada: o el marcado le pone una marca de texto
  // aparte, o el cliente se la concatena al valor. Nunca ninguna de las dos.
  const bare: string[] = [];
  for (const r of atmosphere) {
    const node = nodeForHook(r.hook)!;
    const owner = epistemicOf(node)!.owner;
    const inMarkup = ASTRO.slice(owner.open, owner.close).replace(/<[^>]*>/g, ' ').includes('ATMOSPHERE');
    const inText = String(el(r.hook).textContent).includes('ATMOSPHERE');
    if (!inMarkup && !inText) bare.push(r.label);
  }
  assert.deepEqual(bare, [], `atmosfericas sin marca en pantalla: ${bare.join(', ')}`);

  // Y ninguna medida se marca como atmosferica.
  const mislabeled = measured.filter((r) => String(el(r.hook).textContent).includes(MARK.atmosphere)).map((r) => r.label);
  assert.deepEqual(mislabeled, [], `medidas marcadas como atmosfera: ${mislabeled.join(', ')}`);
});

test('runtime: las lecturas medidas traen numeros reales del cronometro', () => {
  const fps = String(el('data-kdx-fps-readout').textContent);
  const frameTime = String(el('data-kdx-frametime-readout').textContent);
  const sampleWindow = String(el('data-kdx-window-readout').textContent);

  assert.match(fps, /^\d+FPS$/, `FRAME RATE deberia ser un entero de fps, fue "${fps}"`);
  assert.match(frameTime, /^\d+\.\dMS$/, `FRAME TIME deberia ser ms, fue "${frameTime}"`);
  assert.match(sampleWindow, /^\d+\.\dS$/, `SAMPLE WINDOW deberia ser segundos, fue "${sampleWindow}"`);

  // La ventana es la suma real del buffer, no una constante ni un valor de adorno.
  const seconds = parseFloat(sampleWindow);
  const expected = runtime!.sampleWindowMs() / 1000;
  assert.ok(Math.abs(seconds - expected) < 0.05, `SAMPLE WINDOW (${seconds}s) deberia igualar el buffer real (${expected.toFixed(3)}s)`);
  assert.ok(expected > 0, 'el buffer de muestras deberia tener tiempo real acumulado');
});

test('runtime: el checksum ya no dice VERIFIED en ningun estado', () => {
  // El enum interno (`latent | pending | verified`) vive en observe-v2/config.ts
  // y lo consume el CSS via [data-checksum]; no se toca. Lo que se comprueba es
  // que ninguno de sus tres valores llegue a la pantalla como "VERIFIED".
  const seen: string[] = [];
  for (const value of ['latent', 'pending', 'verified']) {
    runtime!.sceneState.checksum = value;
    runtime!.applySceneState();
    seen.push(String(el('data-kdx-checksum-readout').textContent));
  }
  assert.doesNotMatch(seen.join(','), /VERIFIED/, `el checksum mostro VERIFIED: ${seen.join(', ')}`);
  assert.equal(new Set(seen).size, 3, `los tres estados deben seguir siendo distinguibles: ${seen.join(', ')}`);
  assert.equal(seen[0], 'LATENT');
});

test('resumen: inventario completo de lecturas', () => {
  const rows = READOUTS.map((r) => {
    const cls = r.epistemic.toUpperCase().padEnd(10);
    const marked = r.epistemic === 'atmosphere' ? 'marcada ATMOSPHERE' : `marcada ${MARK[r.epistemic]}`;
    return `  ${r.label.padEnd(18)} ${cls} ${marked}`;
  });
  console.log(`\n  ${READOUTS.length} lecturas clasificadas:\n${rows.join('\n')}\n`);
  assert.equal(READOUTS.filter((r) => r.epistemic === 'atmosphere').length, 16);
  assert.equal(READOUTS.filter((r) => r.epistemic === 'measured').length, 6);
  assert.equal(READOUTS.filter((r) => r.epistemic === 'state').length, 2);
});
