/**
 * MP-11 · el motor de organismos usa lo que mide.
 *
 * El hallazgo de la auditoria KOD-42 era literal: `BaseOrganismRuntime` ya
 * juntaba `averageFrameMs` y `droppedFrameEstimate`, los publicaba en
 * `getMetrics()` y NUNCA llamaba a `setQuality` con ellos. La calidad la fijaba
 * `matchMedia("(max-width: 767px)")` una vez, en el constructor, y no se movia
 * mas. Se medía de verdad y se decidía por adivinanza.
 *
 * Estas pruebas montan un reloj y un `requestAnimationFrame` falsos --
 * deterministas, sin navegador -- y bombean el bucle a mano para afirmar que la
 * medicion ahora manda.
 *
 * Correr (Node 24, type-stripping nativo):
 *   node --test src/kodex/organism-engine/BaseOrganismRuntime.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

/*
 * El repo importa sin extension porque lo resuelve Vite. Node no. El hook va
 * embebido como data: URL para no dejar un archivo suelto en el arbol.
 */
register(`data:text/javascript,${encodeURIComponent(`
export async function resolve(specifier, context, nextResolve) {
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
/* Reloj, rAF y matchMedia falsos                                      */
/* ------------------------------------------------------------------ */

let clock = 0;
let wallNow = 0;
let renderCostMs = 0;
let reducedMotionMatches = false;
let narrowMatches = false;

const rafQueue: Array<(t: number) => void> = [];

Object.defineProperty(globalThis, "performance", {
  configurable: true,
  writable: true,
  value: { now: () => clock },
});

(globalThis as Record<string, unknown>).requestAnimationFrame = (cb: (t: number) => void) => {
  rafQueue.push(cb);
  return rafQueue.length;
};
(globalThis as Record<string, unknown>).cancelAnimationFrame = () => {};
(globalThis as Record<string, unknown>).matchMedia = (query: string) => ({
  matches: query.includes("prefers-reduced-motion") ? reducedMotionMatches : narrowMatches,
  addEventListener() {},
  removeEventListener() {},
});

function resetClock(): void {
  clock = 0;
  wallNow = 0;
  rafQueue.length = 0;
  reducedMotionMatches = false;
  narrowMatches = false;
}

/** Un cuadro: avanza la pared, despacha lo encolado, cobra el costo de render. */
function pump(intervalMs: number, costMs: number): void {
  wallNow += intervalMs;
  clock = wallNow;
  renderCostMs = costMs;
  const pending = rafQueue.splice(0, rafQueue.length);
  for (const cb of pending) cb(wallNow);
}

function run(runtime: { start(): void }, frames: number, intervalMs: number, costMs: number): void {
  for (let i = 0; i < frames; i += 1) pump(intervalMs, costMs);
}

/* ------------------------------------------------------------------ */

const { BaseOrganismRuntime } = await import("./BaseOrganismRuntime.ts");
const { QUALITY_THRESHOLDS } = await import("../../lib/kodex/quality.ts");
type OrganismPreset = import("./types.ts").OrganismPreset;
type OrganismQuality = import("./types.ts").OrganismQuality;

function presetWith(
  desktopTier: OrganismQuality,
  targetFps: 24 | 30 | 45 | 60 = 60,
): OrganismPreset {
  return {
    id: "test-organism",
    version: "1.0.0",
    family: "FIELD",
    renderMode: "SHADER",
    status: "EXPERIMENTAL",
    concept: { entity: "test", primaryVerb: "test", spatialLogic: "PLANAR" },
    assets: { fallback: "" },
    behaviors: ["BREATHE"],
    controls: {
      signal: 0, memory: 0, entropy: 0, cohesion: 0, depth: 0,
      growth: 0, convergence: 0, observability: 0, transition: 0,
    },
    interaction: { pointer: "NONE", primaryAction: "none", audioReactive: false },
    memory: { writes: [] },
    transition: { enter: "NONE", exit: "NONE", durationMs: 0 },
    accessibility: { label: "test", reducedMotion: "STATIC", noWebGL: "TEXTUAL" },
    performance: { mobileTier: "LOW", desktopTier, maxDpr: 2, targetFps },
  };
}

class FakeRuntime extends BaseOrganismRuntime {
  qualityChanges: OrganismQuality[] = [];

  constructor(preset: OrganismPreset) {
    super({} as HTMLCanvasElement, preset);
  }

  async load(): Promise<void> {}
  mount(): void {}
  destroyResources(): void {}

  render(): void {
    // El costo de dibujar se simula moviendo el reloj: es exactamente lo que
    // `renderMs` mide en la clase real.
    clock += renderCostMs;
  }

  protected onQualityChange(level: OrganismQuality): void {
    this.qualityChanges.push(level);
  }

  get tier(): OrganismQuality {
    return this.getMetrics().quality;
  }
}

/* ------------------------------------------------------------------ */

test("cuadros lentos sostenidos bajan la calidad del organismo", () => {
  resetClock();
  const r = new FakeRuntime(presetWith("HIGH"));
  assert.equal(r.tier, "HIGH", "la adivinanza del preset sigue dando el arranque");
  assert.equal(r.getMetrics().qualitySource, "guess");

  r.start();
  // 40 ms entre cuadros con 35 ms de render: el equipo no llega.
  run(r, 400, 40, 35);

  assert.equal(r.tier, "LOW");
  assert.equal(r.getMetrics().qualitySource, "measured", "ahora manda la medicion");
  assert.ok(r.qualityChanges.length > 0, "onQualityChange debe haberse disparado");
  assert.ok(r.getMetrics().averageFrameMs > 0, "las muestras que antes se tiraban existen");
});

test("cuadros holgados sostenidos recuperan la calidad", () => {
  resetClock();
  const r = new FakeRuntime(presetWith("LOW"));
  assert.equal(r.tier, "LOW");

  r.start();
  run(r, 900, 1000 / 60, 4);

  assert.equal(r.tier, "HIGH");
  assert.deepEqual(r.qualityChanges, ["MEDIUM", "HIGH"], "sube de a un peldaño");
  assert.equal(r.getMetrics().qualitySource, "measured");
});

test("el jitter normal no mueve la calidad del organismo", () => {
  resetClock();
  const r = new FakeRuntime(presetWith("MEDIUM"));
  r.start();

  let seed = 7;
  for (let i = 0; i < 3000; i += 1) {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    const wobble = (seed / 4294967296) * 8 - 4; // +/- 4 ms
    pump(1000 / 60, 14 + wobble);
  }

  assert.deepEqual(r.qualityChanges, [], "ni un solo cambio por ruido");
  assert.equal(r.tier, "MEDIUM");
});

test("un preset estrangulado a 30 fps no se auto-degrada por estar estrangulado", () => {
  resetClock();
  // Antes de MP-11 esto no existia; el riesgo aparece al empezar a medir. Un
  // organismo a 30 fps gasta ~33 ms por cuadro POR DISEÑO. Si los umbrales se
  // compararan contra 60 fps, cada preset de 30 fps se degradaria solo.
  const r = new FakeRuntime(presetWith("MEDIUM", 30));
  r.start();
  // 24 ms de render dentro de un presupuesto de 33.3 ms: holgado. Ese mismo
  // 24 medido contra 16.7 ms (60 fps) daria 1.44x y ordenaria BAJAR. Los dos
  // presupuestos mandan en sentidos opuestos, asi que el resultado dice contra
  // cual se esta comparando.
  run(r, 900, 1000 / 30, 24);

  assert.equal(r.tier, "HIGH", "contra el presupuesto de 60 fps esto habria bajado a LOW");
  assert.ok(
    !r.qualityChanges.includes("LOW"),
    `no debe degradarse; cambios observados: ${JSON.stringify(r.qualityChanges)}`,
  );
});

test("prefers-reduced-motion fija el techo aunque los cuadros sean excelentes", () => {
  resetClock();
  reducedMotionMatches = true;
  const r = new FakeRuntime(presetWith("HIGH"));
  r.start();
  run(r, 2000, 1000 / 60, 2);

  assert.equal(r.tier, "LOW");
  assert.equal(r.getMetrics().qualitySource, "reduced-motion");
});

test("setMotion('REDUCED') tambien fija el techo, sin esperar ninguna ventana", () => {
  resetClock();
  const r = new FakeRuntime(presetWith("HIGH"));
  r.start();
  run(r, 900, 1000 / 60, 4);
  assert.equal(r.tier, "HIGH");

  r.setMotion("REDUCED");
  run(r, 1, 1000 / 60, 4);
  assert.equal(r.tier, "LOW");
});

test("un setQuality externo lo adopta el gobernador en vez de pelearse con el", () => {
  resetClock();
  const r = new FakeRuntime(presetWith("HIGH"));
  r.start();
  run(r, 900, 1000 / 60, 4);
  assert.equal(r.tier, "HIGH");

  // Un control de depuracion baja el nivel a mano.
  r.setQuality("LOW");
  assert.equal(r.tier, "LOW");
  // Durante el enfriamiento nadie lo revierte de inmediato.
  run(r, QUALITY_THRESHOLDS.cooldownSamples, 1000 / 60, 4);
  assert.equal(r.tier, "LOW", "el enfriamiento protege el cambio manual");
});

test("FALLBACK detiene el bucle y la medicion no lo saca de ahi", () => {
  resetClock();
  const r = new FakeRuntime(presetWith("HIGH"));
  r.start();
  r.setQuality("FALLBACK");
  run(r, 2000, 1000 / 60, 2);

  assert.equal(r.tier, "FALLBACK");
  assert.equal(r.getMetrics().running, false);
});
