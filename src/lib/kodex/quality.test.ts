/**
 * MP-11 · pruebas del modelo único de calidad.
 *
 * Lo que hay que demostrar, y que antes nadie demostraba:
 *   1. un tiempo de cuadro malo SOSTENIDO baja el nivel,
 *   2. uno bueno SOSTENIDO lo devuelve,
 *   3. el ruido solo NO cambia de nivel,
 *   4. `prefers-reduced-motion` fija el peldaño pase lo que pase con la medición,
 *   5. la traducción entre los tres vocabularios es reversible,
 *   6. la adivinanza compartida reproduce `resolveProfile()` de OBSERVE V2
 *      sobre toda la matriz -- si no, la escena habría cambiado de arranque.
 *
 * Correr (Node 24, type-stripping nativo):
 *   node --test src/lib/kodex/quality.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  MEASURED_FLOOR,
  PERFILES,
  QUALITY_LADDER,
  QUALITY_THRESHOLDS as T,
  QualityGovernor,
  REDUCED_MOTION_TIER,
  guessPerfilFromViewport,
  guessTierFromDevice,
  guessTierFromPreset,
  perfilToTier,
  tierToPerfil,
  type Perfil,
  type QualityTier,
} from "./quality.ts";

const TARGET = 1000 / 60;

/** Alimenta n muestras y devuelve la lista de cambios de peldaño observados. */
function feed(g: QualityGovernor, n: number, ms: () => number): QualityTier[] {
  const changes: QualityTier[] = [];
  for (let i = 0; i < n; i += 1) {
    const next = g.sample(ms());
    if (next) changes.push(next);
  }
  return changes;
}

const flat = (v: number) => () => v;

/** Un generador determinista, para que "ruido" signifique lo mismo en cada corrida. */
function noise(center: number, amplitude: number, seed = 1): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return center + ((s / 4294967296) * 2 - 1) * amplitude;
  };
}

const fresh = (over: Partial<ConstructorParameters<typeof QualityGovernor>[0]> = {}) =>
  new QualityGovernor({ initialTier: "HIGH", targetFrameMs: TARGET, ...over });

/* ------------------------------------------------------------------ */
/* 1. Sostenido malo baja                                             */
/* ------------------------------------------------------------------ */

test("un tiempo de cuadro malo sostenido baja el nivel", () => {
  const g = fresh();
  // 26 ms sostenidos: por encima de degradeRatio (22 ms) y por debajo de
  // collapseRatio (40 ms) -- debe bajar UN peldaño, no desplomarse.
  const changes = feed(g, 600, flat(26));
  assert.equal(changes[0], "MEDIUM", "el primer cambio debe ser un solo peldaño");
  assert.equal(g.tier, "LOW", "sostenido sigue bajando hasta el piso medible");
  assert.equal(g.read().source, "measured");
});

test("la bajada no ocurre antes de que se confirme", () => {
  const g = fresh();
  // Una sola ventana de acuerdo no alcanza: hacen falta `confirmDown`.
  const justUnder = T.warmupSamples + T.minSamples + T.evalEvery * (T.confirmDown - 1) - 1;
  feed(g, justUnder, flat(26));
  assert.equal(g.tier, "HIGH", "una ventana sola no puede bajar el nivel");
});

test("un tiempo de cuadro catastrofico va directo al piso medible, no de a un peldaño", () => {
  const g = fresh();
  const changes = feed(g, 400, flat(70)); // ~14 fps
  assert.equal(changes[0], MEASURED_FLOOR, "el primer cambio ya debe ser el piso");
});

test("la medicion nunca entra en FALLBACK: seria un viaje de ida", () => {
  const g = fresh();
  feed(g, 3000, flat(95));
  assert.equal(g.tier, MEASURED_FLOOR);
  assert.notEqual(g.tier, "FALLBACK");
});

/* ------------------------------------------------------------------ */
/* 2. Sostenido bueno sube                                            */
/* ------------------------------------------------------------------ */

test("un tiempo de cuadro bueno sostenido devuelve el nivel", () => {
  const g = fresh({ initialTier: "LOW" });
  const changes = feed(g, 900, flat(6));
  assert.deepEqual(changes, ["MEDIUM", "HIGH"], "sube de a un peldaño, en orden");
  assert.equal(g.tier, "HIGH");
  assert.equal(g.read().source, "measured");
});

test("subir cuesta mas confirmaciones que bajar", () => {
  assert.ok(T.confirmUp > T.confirmDown, "la asimetria es deliberada");

  const subiendo = fresh({ initialTier: "LOW" });
  const enoughToDrop = T.warmupSamples + T.minSamples + T.evalEvery * (T.confirmDown - 1);
  feed(subiendo, enoughToDrop, flat(6));
  assert.equal(subiendo.tier, "LOW", "lo que basta para bajar no basta para subir");
});

test("no se sube por encima del techo del preset una vez alcanzado HIGH", () => {
  const g = fresh({ initialTier: "HIGH" });
  feed(g, 900, flat(4));
  assert.equal(g.tier, "HIGH", "HIGH es el mejor peldaño: no hay a donde subir");
});

/* ------------------------------------------------------------------ */
/* 3. El ruido solo no cambia nada                                    */
/* ------------------------------------------------------------------ */

test("el jitter normal alrededor del presupuesto no mueve el nivel", () => {
  const g = fresh({ initialTier: "MEDIUM" });
  // 16.7 ms +/- 4 ms: un equipo sano. Cruza ninguno de los dos bordes en mediana.
  const changes = feed(g, 4000, noise(16.7, 4));
  assert.deepEqual(changes, [], "el ruido no debe producir ni un solo cambio");
  assert.equal(g.tier, "MEDIUM");
});

test("picos aislados sobre el umbral no bajan el nivel", () => {
  const g = fresh({ initialTier: "HIGH" });
  let i = 0;
  // Un cuadro de 90 ms cada 20: un GC, una textura que sube. La mediana no se
  // entera, y ese es el punto de usar mediana y no promedio.
  const changes = feed(g, 4000, () => (i++ % 20 === 0 ? 90 : 10));
  assert.deepEqual(changes, []);
  assert.equal(g.tier, "HIGH");
});

test("se usa la mediana y no el promedio, y la diferencia cambia la decision", () => {
  const g = fresh({ initialTier: "MEDIUM" });
  let i = 0;
  // 12 ms de base con un pico de 300 ms cada 20 cuadros. Sobre una ventana de
  // 60 muestras el PROMEDIO da 26.4 ms (por encima del umbral de bajada) y la
  // MEDIANA da 12 ms (por debajo del de subida). Los dos estimadores mandan
  // hacia lados opuestos, asi que el resultado dice cual se esta usando.
  feed(g, 2000, () => (i++ % 20 === 0 ? 300 : 12));
  assert.equal(g.tier, "HIGH", "con promedio esto habria terminado en LOW");
});

test("los cuadros de calentamiento no entran en la ventana", () => {
  // El descarte tiene que EXISTIR y ser suficiente: compilar tres shaders y
  // subir sus texturas se come mas de un puñado de cuadros.
  assert.ok(T.warmupSamples >= 20, `calentamiento insuficiente: ${T.warmupSamples}`);

  const g = fresh({ initialTier: "HIGH" });
  // Compilar shaders y subir texturas cuesta cuadros carisimos que no describen
  // el costo de correr. Se descartan, no se promedian.
  feed(g, T.warmupSamples, flat(400));
  assert.equal(g.read().samples, 0, "ni una muestra de encendido guardada");
  feed(g, 1, flat(16));
  assert.equal(g.read().samples, 1, "recien la siguiente cuenta");
});

test("un voto de bajada no sobrevive a una ventana normal", () => {
  // Ventanas chicas y sin enfriamiento para poder aislar exactamente tres
  // evaluaciones: mala, normal, mala. Con `confirmDown: 2`, si el voto de la
  // primera sobreviviera a la segunda, la tercera bajaria el nivel.
  const g = new QualityGovernor({
    initialTier: "HIGH",
    targetFrameMs: TARGET,
    thresholds: {
      warmupSamples: 0, windowSize: 10, minSamples: 10, evalEvery: 10,
      cooldownSamples: 0, confirmDown: 2,
    },
  });
  const changes = [
    ...feed(g, 10, flat(26)),   // evaluacion 1: vota bajar
    ...feed(g, 10, flat(16.7)), // evaluacion 2: banda muerta
    ...feed(g, 10, flat(26)),   // evaluacion 3: vota bajar (de nuevo desde cero)
  ];
  assert.deepEqual(changes, [], "los votos no se acumulan salteados");
  assert.equal(g.tier, "HIGH");
});

test("rachas malas alternadas con rachas buenas no acumulan votos", () => {
  const g = fresh({ initialTier: "HIGH" });
  const changes: QualityTier[] = [];
  // Una ventana mala, una ventana normal, una mala, una normal... nunca dos
  // ventanas malas seguidas, asi que nunca se confirma nada.
  for (let round = 0; round < 40; round += 1) {
    const bad = round % 2 === 0;
    for (let k = 0; k < T.evalEvery; k += 1) {
      const next = g.sample(bad ? 26 : 16.7);
      if (next) changes.push(next);
    }
  }
  assert.deepEqual(changes, [], "los votos se pierden al pasar por la banda muerta");
});

test("la banda muerta entre subir y bajar es ancha a proposito", () => {
  const spread = T.degradeRatio / T.upgradeRatio;
  assert.ok(spread > 1.7, `la separacion entre umbrales quedo en ${spread.toFixed(2)}x`);
  assert.ok(T.upgradeRatio < 1, "subir exige estar por DEBAJO del presupuesto");
  assert.ok(T.degradeRatio > 1, "bajar exige estar por ENCIMA del presupuesto");
});

test("tras un cambio hay enfriamiento: los cuadros de la transicion no cuentan", () => {
  const g = fresh({ initialTier: "HIGH" });
  // Se avanza hasta el PRIMER cambio y ni una muestra mas.
  let steps = 0;
  while (g.sample(26) === null) {
    steps += 1;
    assert.ok(steps < 1000, "el cambio deberia haber ocurrido");
  }
  assert.equal(g.tier, "MEDIUM");
  assert.equal(g.read().samples, 0, "la ventana se vacia al cambiar de peldaño");

  // Durante el enfriamiento no se acumula ni una muestra, por malas que sean.
  const during = feed(g, T.cooldownSamples, flat(26));
  assert.deepEqual(during, [], "no se decide nada durante el enfriamiento");
  assert.equal(g.read().samples, 0, "ni siquiera se guardan");

  // Recien despues del enfriamiento la ventana vuelve a llenarse.
  feed(g, 1, flat(26));
  assert.equal(g.read().samples, 1);
});

test("trinquete: dos bajadas desde el mismo peldaño clausuran ese peldaño", () => {
  const g = fresh({ initialTier: "HIGH" });
  // Ciclo 1: malo -> baja de HIGH; bueno -> vuelve a HIGH.
  feed(g, 200, flat(26));
  assert.equal(g.tier, "MEDIUM");
  feed(g, 900, flat(5));
  assert.equal(g.tier, "HIGH", "la primera recuperacion esta permitida");
  // Ciclo 2: vuelve a fallar en HIGH. Segunda bajada desde HIGH -> se clausura.
  feed(g, 200, flat(26));
  assert.equal(g.tier, "MEDIUM");
  assert.equal(g.read().ceiling, "MEDIUM");
  // Y ya no vuelve, por bueno que se ponga.
  feed(g, 3000, flat(4));
  assert.equal(g.tier, "MEDIUM", "dos fracasos en HIGH bastan: no se intenta una tercera vez");
});

/* ------------------------------------------------------------------ */
/* 4. prefers-reduced-motion gana siempre                             */
/* ------------------------------------------------------------------ */

test("reduced-motion fija el peldaño aunque la medicion sea excelente", () => {
  const g = fresh({ initialTier: "HIGH", reducedMotion: true });
  feed(g, 4000, flat(3)); // ~333 fps
  assert.equal(g.tier, REDUCED_MOTION_TIER);
  assert.equal(g.read().source, "reduced-motion");
});

test("reduced-motion activado a mitad de sesion baja el nivel de inmediato", () => {
  const g = fresh({ initialTier: "HIGH" });
  feed(g, 900, flat(5));
  assert.equal(g.tier, "HIGH");
  g.setReducedMotion(true);
  assert.equal(g.tier, REDUCED_MOTION_TIER, "sin esperar ninguna ventana");
});

test("reduced-motion no impide bajar todavia mas si la medicion es peor", () => {
  const g = fresh({ initialTier: "LOW", reducedMotion: true });
  assert.equal(g.tier, "LOW");
  g.adopt("FALLBACK");
  assert.equal(g.tier, "FALLBACK", "el tope limita la calidad, no obliga a un minimo");
});

test("reduced-motion vence tambien a un nivel forzado por URL", () => {
  const g = fresh({ initialTier: "LOW", reducedMotion: true, forcedTier: "HIGH" });
  assert.equal(g.tier, REDUCED_MOTION_TIER, "accesibilidad no es negociable ni en depuracion");
  assert.equal(g.read().source, "reduced-motion");
});

test("mientras reduced-motion esta activo no se mide: el bucle esta estrangulado", () => {
  // Regresion. El host baja a 12 fps bajo `REDUCED`; si esos ~83 ms contaran
  // como muestras, el trinquete clausuraria HIGH y apagar el interruptor del
  // sistema dejaria la sesion degradada para siempre.
  const g = fresh({ initialTier: "HIGH", reducedMotion: true });
  feed(g, 3000, flat(83));
  assert.equal(g.read().ceiling, "HIGH", "no se clausuro ningun peldaño");
  g.setReducedMotion(false);
  assert.equal(g.tier, "HIGH", "al apagar el interruptor se vuelve donde se estaba");
});

test("un nivel forzado congela la medicion", () => {
  const g = fresh({ initialTier: "HIGH", forcedTier: "HIGH" });
  feed(g, 4000, flat(120));
  assert.equal(g.tier, "HIGH");
  assert.equal(g.read().source, "forced");
});

/* ------------------------------------------------------------------ */
/* 5. Vocabulario compartido                                          */
/* ------------------------------------------------------------------ */

test("la traduccion peldaño <-> perfil es reversible en los tres perfiles", () => {
  for (const p of PERFILES) assert.equal(tierToPerfil(perfilToTier(p)), p);
});

test("FALLBACK colapsa a low-power y se documenta como perdida de informacion", () => {
  assert.equal(tierToPerfil("FALLBACK"), "low-power");
  assert.equal(perfilToTier("low-power"), "LOW", "la vuelta no inventa un FALLBACK");
});

test("la escalera va de mejor a peor y contiene los cuatro peldaños", () => {
  assert.deepEqual([...QUALITY_LADDER], ["HIGH", "MEDIUM", "LOW", "FALLBACK"]);
});

test("la adivinanza del preset es la que el motor ya usaba", () => {
  const perf = { mobileTier: "MEDIUM" as QualityTier, desktopTier: "HIGH" as QualityTier };
  assert.equal(guessTierFromPreset(perf, true), "MEDIUM");
  assert.equal(guessTierFromPreset(perf, false), "HIGH");
});

test("la adivinanza por dispositivo reproduce la heuristica historica de perf.ts", () => {
  const base = { reducedMotion: false, narrow: false };
  assert.equal(guessTierFromDevice({ ...base, cores: 12, memoryGb: 16 }), "HIGH");
  assert.equal(guessTierFromDevice({ ...base, cores: 6, memoryGb: 8 }), "MEDIUM");
  assert.equal(guessTierFromDevice({ ...base, cores: 4, memoryGb: 8 }), "MEDIUM");
  assert.equal(guessTierFromDevice({ ...base, narrow: true, cores: 4, memoryGb: 8 }), "LOW");
  assert.equal(guessTierFromDevice({ ...base, reducedMotion: true, cores: 32, memoryGb: 64 }), "LOW");
});

/* ------------------------------------------------------------------ */
/* 6. No regresion de OBSERVE V2                                      */
/* ------------------------------------------------------------------ */

/**
 * Copia literal de `resolveProfile()` tal como esta HOY en
 * `src/components/kodex/scenes/kodex-observe-v2-client.ts` (sin la rama de
 * `?profile=`, que es E/S de URL y no politica). Este oraculo existe porque no
 * se toco ese archivo: otro agente lo tiene tomado. Si la escena adopta
 * `guessPerfilFromViewport`, esta prueba es la garantia de que no cambia nada.
 */
function resolveProfileOracle(reducedMotion: boolean, isMobile: boolean, dpr: number): Perfil {
  if (reducedMotion) return "low-power";
  if (isMobile && dpr > 2) return "low-power";
  if (isMobile) return "balanced";
  return dpr > 1.65 ? "balanced" : "full";
}

test("la adivinanza compartida reproduce resolveProfile() de OBSERVE V2, punto por punto", () => {
  const dprs = [0.75, 1, 1.25, 1.5, 1.65, 1.66, 2, 2.01, 2.5, 3];
  let checked = 0;
  for (const reduced of [false, true]) {
    for (const mobile of [false, true]) {
      for (const dpr of dprs) {
        assert.equal(
          guessPerfilFromViewport({ reducedMotion: reduced, mobile, devicePixelRatio: dpr }),
          resolveProfileOracle(reduced, mobile, dpr),
          `reduced=${reduced} mobile=${mobile} dpr=${dpr}`,
        );
        checked += 1;
      }
    }
  }
  assert.equal(checked, 40);
});

test("las tres escalas de OBSERVE V2 siguen mapeando a los tres peldaños", () => {
  assert.deepEqual(PERFILES.map(perfilToTier), ["HIGH", "MEDIUM", "LOW"]);
});
