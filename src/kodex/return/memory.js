// KODEX −∞ · RETURN specimen store.
// This is not the canonical journey model. It only preserves the minimal
// route/effect evidence needed to derive the RETURN visual specimen locally.

const KEY = 'kx-journey';

export const memoryDiagnostics = {
  reads: 0,
  writes: 0,
  readErrors: 0,
  writeErrors: 0,
  lastError: null,
};

const readRaw = () => {
  try {
    memoryDiagnostics.reads += 1;
    return JSON.parse(localStorage.getItem(KEY) || 'null') || null;
  } catch (e) {
    memoryDiagnostics.readErrors += 1;
    memoryDiagnostics.lastError = e;
    return null;
  }
};

const writeRaw = (o) => {
  try {
    memoryDiagnostics.writes += 1;
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch (e) {
    memoryDiagnostics.writeErrors += 1;
    memoryDiagnostics.lastError = e;
  }
};

// Accepted writes are intentionally narrow. Dwell, timestamps and activity
// scores do not belong in this store.
/**
 * LA MEMORIA NO ESCRIBE ANTES DE QUE EL HUÉSPED ELIJA.
 *
 * Regla del creador: "sin memory mutation pasiva". El archivo recuerda a quien
 * entra, no a quien todavía está mirando la puerta. Medido antes de esto: abrir
 * /kodex/ y no tocar nada escribía cinco veces con el velo todavía puesto.
 *
 * Mientras la página declare `data-kdx-espera-eleccion` en <html>, los eventos
 * se encolan en vez de escribirse. Al elegir -- y elegir es un acto explícito,
 * TAP TO ENTER o CONTINUE IN SILENCE -- se libera y se vuelca lo que había. No
 * se pierde nada: se pospone hasta que hay consentimiento.
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

export function record(ev) {
  if (esperando()) {
    // 16 basta: si alguien mira la puerta un rato largo no queremos crecer sin
    // techo, y lo que importa es que el primer paso quede registrado.
    if (encolados.length < 16) encolados.push(ev);
    return;
  }
  const j = readRaw() || { views: [], effects: [], cycle: 0 };
  if (!Array.isArray(j.views)) j.views = [];
  if (!Array.isArray(j.effects)) j.effects = [];
  if (!Number.isSafeInteger(j.cycle) || j.cycle < 0) j.cycle = 0;

  let changed = false;
  if (ev && ev.type === 'view' && ev.work) {
    if (j.views[j.views.length - 1] !== ev.work) {
      j.views.push(ev.work);
      changed = true;
    }
    if (j.views.length > 64) j.views.shift();
  } else if (ev && ev.type === 'effect' && ev.effect) {
    j.effects.push(ev.effect);
    changed = true;
    if (j.effects.length > 128) j.effects.shift();
  } else if (ev && ev.type === 'cycle') {
    j.cycle += 1;
    changed = true;
  }

  if (changed) writeRaw(j);
}

export function readSpecimen(fallbackSeed) {
  const j = readRaw();
  const views = j && Array.isArray(j.views)
    ? j.views.filter((v) => typeof v === 'string' && v.length > 0)
    : [];
  const effects = j && Array.isArray(j.effects)
    ? j.effects.filter((v) => typeof v === 'string' && v.length > 0)
    : [];
  const cycleCount = j && Number.isSafeInteger(j.cycle) && j.cycle >= 0 ? j.cycle : 0;

  const curated = !j || (views.length === 0 && effects.length === 0);
  const seedStr = (views.join('') + effects.join('')) || String(fallbackSeed || 'CURATED');
  let s = 0;
  for (let i = 0; i < seedStr.length; i += 1) {
    s = (s * 31 + seedStr.charCodeAt(i)) >>> 0;
  }

  const seedHex = '0x' + ((s >>> 8) & 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, '0');
  const cycle = j ? Math.max(1, cycleCount + 1) : 1;
  const chirality = (s & 1) ? 1 : -1;
  const signal = ((s >>> 16) & 0xff) / 256;
  const chir = chirality > 0 ? 'R' : 'L';
  const code = `KDX-C${String(cycle).padStart(2, '0')}-R10-${chir}-${seedHex.slice(2)}`;

  return {
    curated,
    seed: s,
    seedHex,
    code,
    cycle,
    chirality,
    signal,
    visualChain: [...new Set(effects)],
    works: views,
    lastWork: (views.length ? views[views.length - 1] : '') || '/img/kodex/works/bw-06.jpg',
  };
}
