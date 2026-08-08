/**
 * KODEX-∞ · MODELO ÚNICO DE CALIDAD
 *
 * Hasta acá había tres sistemas que decidían lo mismo sin conocerse:
 *
 *   1. `src/lib/kodex/perf.ts` — medía de verdad, pero medía UNA sola vez y
 *      después apagaba el bucle: adivinaba, corregía a los ~70 cuadros, y no
 *      volvía a mirar nunca más.
 *   2. `OrganismQuality` en el motor de organismos — adivinaba por ancho de
 *      viewport (`max-width: 767px`) y no corregía jamás, pese a que
 *      `BaseOrganismRuntime` YA venía juntando `averageFrameMs` y
 *      `droppedFrameEstimate` y los tiraba a la basura.
 *   3. `resolveProfile()` en OBSERVE V2 — adivinaba por viewport (760px) y
 *      `devicePixelRatio`, y tampoco corregía.
 *
 * Este módulo no inventa una cuarta política: pone a los tres a hablar el
 * mismo idioma y le da a la MEDICIÓN la última palabra.
 *
 * Reglas del modelo, en orden de autoridad:
 *
 *   A. `prefers-reduced-motion` gana siempre. No es una pista de rendimiento,
 *      es una declaración de accesibilidad: ninguna medición buena la revoca.
 *   B. Después manda lo MEDIDO. La adivinanza inicial existe sólo para tener
 *      algo razonable en los primeros segundos.
 *   C. La adivinanza es sólo eso. Se conserva porque arrancar bien importa,
 *      pero deja de mandar apenas hay muestras suficientes.
 *
 * Nada de lo que sale de acá es telemetría de fábrica ni un dato del
 * dispositivo: `medianFrameMs` es tiempo de cuadro medido en esta máquina, en
 * esta lámina, ahora, y `source` dice explícitamente si el nivel vigente viene
 * de una medición, de una adivinanza o de una declaración de accesibilidad.
 * Quien lo muestre debe mostrar también de dónde viene.
 */

/* ------------------------------------------------------------------ */
/* Vocabulario                                                        */
/* ------------------------------------------------------------------ */

/**
 * La escalera canónica, de mejor a peor. Se toma el vocabulario del motor de
 * organismos porque es el único de los tres que es superconjunto: tiene un
 * peldaño (`FALLBACK`, sin animación) que a los otros dos les falta.
 */
export type QualityTier = "HIGH" | "MEDIUM" | "LOW" | "FALLBACK";

export const QUALITY_LADDER: readonly QualityTier[] = ["HIGH", "MEDIUM", "LOW", "FALLBACK"];

/** El vocabulario de `perf.ts` y de OBSERVE V2, que es el mismo. */
export type Perfil = "full" | "balanced" | "low-power";

export const PERFILES: readonly Perfil[] = ["full", "balanced", "low-power"];

/**
 * `FALLBACK` colapsa a `low-power` porque ni `perf.ts` ni OBSERVE V2 tienen un
 * peldaño "sin animación": en OBSERVE V2 eso se decide aparte
 * (`?fallback=1` / no hay WebGL), no por nivel de calidad.
 */
export const TIER_TO_PERFIL: Record<QualityTier, Perfil> = {
  HIGH: "full",
  MEDIUM: "balanced",
  LOW: "low-power",
  FALLBACK: "low-power",
};

export const PERFIL_TO_TIER: Record<Perfil, QualityTier> = {
  full: "HIGH",
  balanced: "MEDIUM",
  "low-power": "LOW",
};

export const tierToPerfil = (t: QualityTier): Perfil => TIER_TO_PERFIL[t];
export const perfilToTier = (p: Perfil): QualityTier => PERFIL_TO_TIER[p];

/** Peldaño que fija `prefers-reduced-motion`. Los tres sistemas ya usaban éste. */
export const REDUCED_MOTION_TIER: QualityTier = "LOW";

/**
 * Peor peldaño al que puede llegar la MEDICIÓN por sí sola.
 *
 * `FALLBACK` detiene el bucle de render, y un bucle detenido no produce
 * muestras: sería un viaje de ida del que ninguna medición posterior podría
 * volver. `FALLBACK` queda entonces como decisión explícita (preset, ausencia
 * de WebGL, `?fallback=1`), nunca como conclusión de un promedio.
 */
export const MEASURED_FLOOR: QualityTier = "LOW";

const rung = (t: QualityTier): number => QUALITY_LADDER.indexOf(t);
/** El peor de dos peldaños. Sirve para aplicar topes sin pensar en signos. */
const worse = (a: QualityTier, b: QualityTier): QualityTier => (rung(a) >= rung(b) ? a : b);

/* ------------------------------------------------------------------ */
/* Adivinanzas iniciales — se conservan las dos que ya existían        */
/* ------------------------------------------------------------------ */

/**
 * Dos escenas distintas afinaron dos heurísticas distintas. Unificarlas en una
 * sola cambiaría el primer cuadro de ambas, que es justo lo que este paquete
 * no puede hacer. Se conservan las dos, con su nombre, marcadas como lo que
 * son: adivinanzas de arranque que la medición reemplaza.
 */

export interface DeviceHint {
  reducedMotion: boolean;
  /** `navigator.hardwareConcurrency`. */
  cores?: number;
  /** `navigator.deviceMemory`, en GB. */
  memoryGb?: number;
  /** Resultado de `matchMedia("(max-width: 900px)")`. */
  narrow: boolean;
}

/**
 * La adivinanza histórica de `perf.ts`: núcleos, memoria y ancho.
 * Deliberadamente conservadora — es preferible arrancar en BALANCED y subir,
 * que arrancar en FULL y arrastrarse justo en la primera impresión.
 */
export function guessTierFromDevice(hint: DeviceHint): QualityTier {
  if (hint.reducedMotion) return REDUCED_MOTION_TIER;
  const cores = hint.cores ?? 4;
  const memory = hint.memoryGb ?? 4;
  if (cores <= 4 || memory <= 4) return hint.narrow ? "LOW" : "MEDIUM";
  if (cores >= 8 && memory >= 8) return "HIGH";
  return "MEDIUM";
}

export interface ViewportHint {
  reducedMotion: boolean;
  /** Resultado de `matchMedia("(max-width: 760px)")`. */
  mobile: boolean;
  devicePixelRatio: number;
}

/**
 * La adivinanza histórica de OBSERVE V2 (`resolveProfile`), byte por byte.
 * Existe acá para que la escena pueda adoptarla sin cambiar de comportamiento;
 * hay una prueba que compara ambas sobre toda la matriz.
 */
export function guessPerfilFromViewport(hint: ViewportHint): Perfil {
  if (hint.reducedMotion) return "low-power";
  const dpr = hint.devicePixelRatio || 1;
  if (hint.mobile && dpr > 2) return "low-power";
  if (hint.mobile) return "balanced";
  return dpr > 1.65 ? "balanced" : "full";
}

/** La adivinanza de viewport del motor de organismos: el preset ya trae los dos peldaños. */
export function guessTierFromPreset(
  tiers: { mobileTier: QualityTier; desktopTier: QualityTier },
  mobile: boolean,
): QualityTier {
  return mobile ? tiers.mobileTier : tiers.desktopTier;
}

/* ------------------------------------------------------------------ */
/* Umbrales                                                           */
/* ------------------------------------------------------------------ */

/**
 * Los tres primeros números NO son nuevos: son los que `perf.ts` ya tenía
 * (`TECHO_MS = 22`, `PISO_MS = 40`, subir sólo bajo `TECHO * 0.55 = 12.1`).
 * Se conservan tal cual para no mover el punto de corte de una escena que ya
 * está en producción; lo que se agrega alrededor es el amortiguamiento.
 *
 * Se expresan como fracción del presupuesto de cuadro (`targetFrameMs`) para
 * que sirvan también a un organismo con `targetFps: 30`. A 60 fps
 * (16.67 ms) reproducen exactamente 22 / 40 / 12.1 ms.
 */
export const QUALITY_THRESHOLDS = {
  /** 22 ms a 60 fps (~45 fps). Por encima, el movimiento se lee como tirón. */
  degradeRatio: 22 / (1000 / 60),
  /** 40 ms a 60 fps (~25 fps). Esto no es "un peldaño de más", es inservible. */
  collapseRatio: 40 / (1000 / 60),
  /** 12.1 ms a 60 fps. Ver nota sobre la banda muerta, abajo. */
  upgradeRatio: 12.1 / (1000 / 60),

  /** Cuadros de encendido que se descartan: compilar shaders y subir texturas. */
  warmupSamples: 20,
  /** Tamaño de la ventana móvil sobre la que se saca la mediana. */
  windowSize: 60,
  /** No se decide nada con menos que esto en la ventana. */
  minSamples: 40,
  /** Se evalúa cada tantas muestras, no en cada cuadro. */
  evalEvery: 30,

  /** Ventanas consecutivas de acuerdo necesarias para BAJAR. */
  confirmDown: 2,
  /** Ventanas consecutivas de acuerdo necesarias para SUBIR. */
  confirmUp: 4,

  /** Tras un cambio, muestras que se tiran antes de volver a medir. */
  cooldownSamples: 90,

  /** Bajadas desde el mismo peldaño antes de dejar de intentar volver a él. */
  demotionsBeforeLatch: 2,
} as const;

/**
 * Por qué la banda muerta es asimétrica y ancha
 * ---------------------------------------------
 * Bajar se decide en 1.32× el presupuesto; subir, en 0.726×. Entre esas dos
 * marcas la mediana no cambia nada. Son ~1.8× de separación, y ese ancho es el
 * punto: el jitter normal de tiempo de cuadro en un equipo estable (±3-4 ms
 * sobre 16.7) no alcanza a cruzar los dos bordes, así que el ruido solo no
 * puede hacer oscilar el nivel.
 *
 * No es simétrica a propósito. Subir de peldaño AGREGA trabajo: si se subiera
 * al mismo umbral en que se baja, el nivel nuevo pasaría inmediatamente el
 * umbral de bajada y el sistema quedaría rebotando. Para subir hay que estar
 * ganándole al presupuesto con margen suficiente como para absorber el costo
 * del peldaño de arriba.
 *
 * Y las confirmaciones tampoco son simétricas: 2 ventanas para bajar, 4 para
 * subir. Una bajada equivocada cuesta un poco de fidelidad; una subida
 * equivocada cuesta cuadros, y además se ve — el rebote se lee como una falla,
 * un peldaño de menos no. Ante la duda, el sistema se queda abajo.
 *
 * La mediana, y no el promedio, por la misma razón: un GC o un cuadro perdido
 * mueve mucho un promedio de 60 muestras y no mueve una mediana.
 */

export type QualitySource = "guess" | "measured" | "reduced-motion" | "forced";

export interface QualityReading {
  tier: QualityTier;
  /** De dónde sale el nivel vigente. Obligatorio si esto se muestra en pantalla. */
  source: QualitySource;
  /** Mediana de la ventana, en ms. `null` mientras no haya muestras suficientes. */
  medianFrameMs: number | null;
  /** Muestras útiles acumuladas en la ventana (post-calentamiento). */
  samples: number;
  /** Presupuesto de cuadro contra el que se compara, en ms. */
  targetFrameMs: number;
  /** Mejor peldaño al que el gobernador todavía se permite volver. */
  ceiling: QualityTier;
}

export interface QualityGovernorOptions {
  /** Adivinanza de arranque. */
  initialTier: QualityTier;
  /** Presupuesto de cuadro. Por defecto 60 fps. */
  targetFrameMs?: number;
  reducedMotion?: boolean;
  /** Nivel forzado por URL/debug. Congela la medición (pero no vence a A). */
  forcedTier?: QualityTier | null;
  thresholds?: Partial<typeof QUALITY_THRESHOLDS>;
}

/* ------------------------------------------------------------------ */
/* El gobernador                                                      */
/* ------------------------------------------------------------------ */

/**
 * Único decisor. No toca el DOM, no lee `window`, no pide `requestAnimationFrame`:
 * recibe milisegundos y devuelve peldaños. Todo lo que depende del navegador
 * vive en quien lo usa (`perf.ts`, `BaseOrganismRuntime`), y por eso esto se
 * puede probar de verdad.
 */
export class QualityGovernor {
  private readonly t: typeof QUALITY_THRESHOLDS;
  private readonly targetFrameMs: number;

  private measured: QualityTier;
  private source: QualitySource;
  private reducedMotion: boolean;
  private forcedTier: QualityTier | null;

  private warmupLeft: number;
  private cooldownLeft = 0;
  private window: number[] = [];
  private sinceEval = 0;
  private lastMedian: number | null = null;

  /** Votos consecutivos en la misma dirección. */
  private downVotes = 0;
  private upVotes = 0;

  /** Mejor peldaño al que todavía se permite volver. Sólo puede empeorar. */
  private ceiling: QualityTier = "HIGH";
  private readonly demotions = new Map<QualityTier, number>();

  constructor(options: QualityGovernorOptions) {
    this.t = { ...QUALITY_THRESHOLDS, ...options.thresholds };
    this.targetFrameMs = options.targetFrameMs ?? 1000 / 60;
    this.reducedMotion = options.reducedMotion ?? false;
    this.forcedTier = options.forcedTier ?? null;
    this.measured = options.initialTier;
    this.source = this.forcedTier ? "forced" : "guess";
    this.warmupLeft = this.t.warmupSamples;
  }

  /**
   * Nivel efectivo. Acá se aplica la regla A: el tope de accesibilidad se
   * impone al final, sobre cualquier cosa que hayan concluido la medición o un
   * `?quality=` de depuración. Una declaración de accesibilidad no la revoca
   * ni un buen tiempo de cuadro ni una bandera de URL.
   */
  get tier(): QualityTier {
    const base = this.forcedTier ?? this.measured;
    return this.reducedMotion ? worse(base, REDUCED_MOTION_TIER) : base;
  }

  read(): QualityReading {
    return {
      tier: this.tier,
      source: this.reducedMotion ? "reduced-motion" : this.forcedTier ? "forced" : this.source,
      medianFrameMs: this.lastMedian,
      samples: this.window.length,
      targetFrameMs: this.targetFrameMs,
      ceiling: this.ceiling,
    };
  }

  setReducedMotion(on: boolean): void {
    this.reducedMotion = on;
  }

  setForcedTier(tier: QualityTier | null): void {
    this.forcedTier = tier;
  }

  /**
   * El host cambió el nivel por su cuenta (preset, control de depuración, un
   * `setQuality` externo). El gobernador lo adopta y reinicia: los tiempos de
   * cuadro inmediatamente posteriores a un cambio describen la transición
   * —reasignar texturas, recompilar— y no el nivel nuevo.
   */
  adopt(tier: QualityTier): void {
    this.measured = tier;
    this.resetAfterChange();
  }

  /**
   * Una muestra de tiempo de cuadro, en ms. Devuelve el peldaño nuevo si acaba
   * de cambiar, o `null` si no cambió nada — que es el caso normal.
   */
  sample(frameMs: number): QualityTier | null {
    if (!Number.isFinite(frameMs) || frameMs <= 0) return null;
    // Un nivel forzado o `FALLBACK` no se negocia: no hay bucle del cual medir.
    if (this.forcedTier || this.measured === "FALLBACK") return null;
    /*
     * Con `prefers-reduced-motion` activo no se mide, y no por prolijidad: el
     * host baja el bucle a 12 fps a propósito, así que todo tiempo de cuadro
     * que llegue acá describe esa decisión y no la capacidad del equipo.
     * Contarlo haría que el trinquete clausurara peldaños por una razón que no
     * es de rendimiento -- apagar y volver a encender el interruptor del
     * sistema degradaría la sesión para siempre.
     */
    if (this.reducedMotion) return null;

    if (this.warmupLeft > 0) {
      this.warmupLeft -= 1;
      return null;
    }
    if (this.cooldownLeft > 0) {
      this.cooldownLeft -= 1;
      return null;
    }

    this.window.push(frameMs);
    if (this.window.length > this.t.windowSize) this.window.shift();
    this.sinceEval += 1;

    if (this.sinceEval < this.t.evalEvery || this.window.length < this.t.minSamples) return null;
    this.sinceEval = 0;

    return this.evaluate();
  }

  private evaluate(): QualityTier | null {
    const median = medianOf(this.window);
    this.lastMedian = median;
    const ratio = median / this.targetFrameMs;

    if (ratio >= this.t.collapseRatio) {
      this.upVotes = 0;
      this.downVotes += 1;
      // Sostenido acá no es "un peldaño de más": se va directo al piso medible
      // en vez de bajar de a uno y tardar varios segundos en llegar igual.
      return this.downVotes >= this.t.confirmDown ? this.applyDown(MEASURED_FLOOR) : null;
    }

    if (ratio >= this.t.degradeRatio) {
      this.upVotes = 0;
      this.downVotes += 1;
      if (this.downVotes < this.t.confirmDown) return null;
      const next = QUALITY_LADDER[Math.min(rung(this.measured) + 1, rung(MEASURED_FLOOR))];
      return this.applyDown(next);
    }

    if (ratio <= this.t.upgradeRatio) {
      this.downVotes = 0;
      this.upVotes += 1;
      if (this.upVotes < this.t.confirmUp) return null;
      const target = QUALITY_LADDER[Math.max(rung(this.measured) - 1, 0)];
      const next = worse(target, this.ceiling);
      if (next === this.measured) {
        // Techo alcanzado: no se sigue contando, no se sigue intentando.
        this.upVotes = 0;
        return null;
      }
      this.measured = next;
      this.source = "measured";
      this.resetAfterChange();
      return next;
    }

    // Banda muerta: la mediana no dice nada. Se pierden los votos acumulados —
    // que es exactamente lo que impide que ventanas malas salteadas, separadas
    // por ventanas normales, sumen hasta cambiar el nivel.
    this.downVotes = 0;
    this.upVotes = 0;
    return null;
  }

  private applyDown(next: QualityTier): QualityTier | null {
    if (next === this.measured) {
      this.downVotes = 0;
      return null;
    }
    const from = this.measured;
    const count = (this.demotions.get(from) ?? 0) + 1;
    this.demotions.set(from, count);
    // Trinquete: si ya se bajó dos veces desde el mismo peldaño, ese peldaño
    // no se vuelve a ofrecer. Dos fracasos son evidencia suficiente, y sin
    // esto quedaría una oscilación lenta que ningún umbral atrapa.
    if (count >= this.t.demotionsBeforeLatch) this.ceiling = worse(this.ceiling, next);

    this.measured = next;
    this.source = "measured";
    this.resetAfterChange();
    return next;
  }

  private resetAfterChange(): void {
    this.window = [];
    this.sinceEval = 0;
    this.downVotes = 0;
    this.upVotes = 0;
    this.cooldownLeft = this.t.cooldownSamples;
  }
}

function medianOf(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
