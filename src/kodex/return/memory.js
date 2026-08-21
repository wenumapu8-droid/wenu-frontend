// KODEX −∞ · MemoryStore — the visitor's journey, recorded across the session.
// Lightweight (localStorage). Any KODEX page can record; the RETURN sequence
// reads it to build the visitor's unique specimen. Honest: if empty → curated.

const KEY = 'kx-journey';

/**
 * LA MEMORIA NO ESCRIBE ANTES DE QUE EL HUÉSPED ELIJA.
 *
 * Regla del creador para esta rebanada: "sin memory mutation pasiva". El
 * archivo recuerda a quien entra, no a quien todavía está mirando la puerta.
 * Medido antes de esto: abrir /kodex/ y no tocar nada escribía cinco veces --
 * cuatro `kx-journey` y un `kx-signal` -- con el velo todavía puesto.
 *
 * Mientras la página declare `data-kdx-espera-eleccion` en <html>, los eventos
 * se encolan en vez de escribirse. Al elegir -- y elegir es un acto explícito,
 * TAP TO ENTER o CONTINUE IN SILENCE -- se libera y se vuelca lo que había.
 * No se pierde nada: se pospone hasta que hay consentimiento.
 */
const esperando = () =>
  typeof document !== 'undefined' &&
  document.documentElement.hasAttribute('data-kdx-espera-eleccion');

let encolados = [];

export function liberarMemoria() {
  if (typeof document !== 'undefined') {
    document.documentElement.removeAttribute('data-kdx-espera-eleccion');
  }
  const pendientes = encolados;
  encolados = [];
  for (const ev of pendientes) record(ev);
}

const readRaw = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') || null; } catch (e) { return null; }
};
const writeRaw = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };

// record an event: { type:'view'|'effect'|'signal', work?, effect?, on? }
/**
 * DOS MÓDULOS ESCRIBEN LA MISMA CLAVE CON FORMAS DISTINTAS.
 *
 * `kx-journey` la comparten este archivo -- que guarda `{views, effects,
 * signal, cycle}` -- y el motor de descenso, que guarda `{eventos:[…]}`. No es
 * un almacén paralelo, y esa decisión fue correcta: una sola clave. Lo que
 * faltaba era que cada lector tolerara lo que el otro escribe.
 *
 * Sin esto se rompe de verdad, y en la puerta: `j.views` sale `undefined`,
 * `j.views.length` lanza, y el velo del umbral se queda puesto para siempre --
 * el visitante elige, no pasa nada, y no hay forma de entrar. Medido en el
 * banco de verificación con la pila completa; el clic quedaba muerto.
 *
 * La forma canónica no se decide acá de prestado. Se normaliza para no romper,
 * se conserva TODO lo que el otro módulo escribió, y la unificación se acuerda
 * con quien lleva el descenso. Ningún agente resuelve un conflicto en silencio.
 */
function normalizar(j) {
  if (!j || typeof j !== 'object') return { started: Date.now(), views: [], effects: [], signal: 0, cycle: 0 };
  if (!Array.isArray(j.views)) j.views = [];
  if (!Array.isArray(j.effects)) j.effects = [];
  if (typeof j.signal !== 'number') j.signal = 0;
  if (typeof j.cycle !== 'number') j.cycle = 0;
  if (typeof j.started !== 'number') j.started = Date.now();
  return j;   // `eventos` y cualquier otra cosa que haya escrito el otro módulo se conserva
}

export function record(ev) {
  if (esperando()) {
    // 16 basta: si alguien mira la puerta un rato largo no queremos crecer sin
    // techo, y lo que importa es que el primer paso quede registrado.
    if (encolados.length < 16) encolados.push(ev);
    return;
  }
  const j = normalizar(readRaw());
  if (ev.type === 'view' && ev.work) { if (j.views[j.views.length - 1] !== ev.work) j.views.push(ev.work); if (j.views.length > 64) j.views.shift(); }
  else if (ev.type === 'effect' && ev.effect) { j.effects.push(ev.effect); if (j.effects.length > 128) j.effects.shift(); }
  else if (ev.type === 'signal') { j.signal += 1; }
  else if (ev.type === 'cycle') { j.cycle += 1; }
  j.last = Date.now();
  writeRaw(j);
}

// derive the specimen from the journey (or a curated fallback)
export function readSpecimen(fallbackSeed) {
  const bruto = readRaw();
  const j = bruto ? normalizar(bruto) : null;
  const curated = !j || (j.views.length === 0 && j.effects.length === 0);
  const seedStr = (j && j.views.join('') + j.effects.join('')) || String(fallbackSeed || 'CURATED');
  let s = 0; for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) >>> 0;
  const seedHex = '0x' + ((s >>> 8) & 0xffffff).toString(16).toUpperCase().padStart(6, '0');
  const uniqEff = j ? [...new Set(j.effects)] : [];
  const memory = j ? (j.views.length + j.effects.length + j.signal) : 0;
  const cycle = j ? Math.max(1, j.cycle + 1) : 1;
  const chirality = (s & 1) ? 1 : -1;
  const signal = j ? Math.min(1, (j.signal * 0.34) + (j.effects.length * 0.04)) : 0.25;
  // family from the most-visited theme (disco/tribe/achroma) or curated
  const lastWork = j && j.views.length ? j.views[j.views.length - 1] : '';
  const fam = /disco|D0/i.test(lastWork) ? 'DIS' : /013|tribe/i.test(lastWork) ? 'TRB' : 'ACH';
  const chir = chirality > 0 ? 'R' : 'L';
  const state = 'R10';
  const code = `KDX-${fam}-C${String(cycle).padStart(2, '0')}-${state}-${chir}-${seedHex.slice(2)}`;
  return {
    curated, seed: s, seedHex, code, cycle, chirality, memory, signal,
    visualChain: uniqEff, works: j ? j.views : [],
    lastWork: lastWork || '/img/kodex/works/bw-06.jpg',
  };
}
