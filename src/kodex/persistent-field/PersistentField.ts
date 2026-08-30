/**
 * KODEX-∞ · CAMPO MORFOGENÉTICO PERSISTENTE
 * P0 del MASTER UNBLOCK MAP (78) · 2026-08-30
 *
 * ────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA QUE RESUELVE
 *
 * Hoy `kodex-organism-client.ts:252` hace `this.destroy().then(mountAll)` en
 * cada `astro:page-load`. Es decir: el universo se desmonta y se vuelve a
 * montar para cambiar de escena. Por eso el viaje se siente como un
 * slideshow y no como un organismo -- entre THRESHOLD y PROLOGUE no hay
 * continuidad posible, porque literalmente muere y nace otra cosa.
 *
 * El master map lo dice sin ambigüedad:
 *   "No montar/desmontar el universo para cambiar de escena."
 *   SCENE ≠ PAGE. SCENE = ATTRACTOR.
 *   TRANSITION ≠ CUT. TRANSITION = DEFORMATION WITH INHERITANCE.
 *
 * ────────────────────────────────────────────────────────────────────────
 * QUÉ HACE ESTO
 *
 * Un único campo que vive fuera del ciclo de vida de la página. Las siete
 * escenas dejan de ser destinos y pasan a ser REGÍMENES: cambian los pesos
 * de atractor, no el organismo.
 *
 *   PHENOTYPE(t) → PHENOTYPE(t+Δ) → PHENOTYPE(t+2Δ) → ...
 *
 * Entre ARCHIVE y MACHINE puede haber infinitos estados intermedios, porque
 * es el mismo campo deformándose, no dos páginas distintas.
 *
 * ────────────────────────────────────────────────────────────────────────
 * LO QUE EL CAMPO POSEE (tabla del master map, P0)
 *
 *   contexto      el canvas/WebGL NO se destruye entre escenas
 *   seed          reproducibilidad: mismo seed → mismo fenotipo base
 *   attractors    qué régimen domina ahora, con transición continua
 *   journey       ruta y memoria REAL, no telemetría inventada
 *   residue       las formas anteriores dejan huella
 *   quality       adaptación desktop/mobile/performance
 *
 * ────────────────────────────────────────────────────────────────────────
 * LO QUE NO HACE, A PROPÓSITO
 *
 * No dibuja. No sabe de shaders ni de organismos. Es el campo que PERSISTE;
 * los renderers existentes se enchufan como operadores que lo modulan. Esa
 * separación es lo que evita abrir un renderer nuevo -- que el master map
 * también prohíbe explícitamente.
 */

/** Las siete escenas como ATRACTORES, no como páginas. */
export type Atractor =
  | 'THRESHOLD' | 'PROLOGUE' | 'DESCENT' | 'ARCHIVE'
  | 'MACHINE' | 'COSMOLOGY' | 'RETURN';

export const ATRACTORES: Atractor[] = [
  'THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN',
];

/** Ruta → atractor. El corredor de 7, decision de autoridad del 29-08. */
const POR_RUTA: Array<[RegExp, Atractor]> = [
  [/^\/kodex\/?$/, 'THRESHOLD'],
  [/^\/kodex\/folio\/i\/?$/, 'PROLOGUE'],
  [/^\/kodex\/folio\/ii\/?$/, 'DESCENT'],
  [/^\/kodex\/folio\/iii\/?$/, 'ARCHIVE'],
  [/^\/kodex\/folio\/iv\/?$/, 'MACHINE'],
  [/^\/kodex\/folio\/v\/?$/, 'COSMOLOGY'],
  [/^\/kodex\/folio\/vi\/?$/, 'RETURN'],
];

export function atractorDeRuta(path: string): Atractor | null {
  for (const [re, a] of POR_RUTA) if (re.test(path)) return a;
  return null;
}

export interface EstadoCampo {
  /** Peso de cada atractor, 0..1. Suman ~1. La transición los interpola. */
  pesos: Record<Atractor, number>;
  /** Semilla de sesión. Reproducibilidad: mismo seed → mismo fenotipo base. */
  seed: number;
  /** Atractores visitados, en orden. Es MEMORIA REAL, no un contador. */
  ruta: Atractor[];
  /** Vueltas completas del ciclo. RETURN → THRESHOLD' incrementa. */
  ciclo: number;
  /** Residuo: cuánto de cada régimen anterior sigue presente. */
  residuo: Record<Atractor, number>;
  /** Perfil de calidad, decidido una vez por sesión. */
  calidad: 'FULL' | 'REDUCED' | 'FALLBACK';
}

type Escucha = (e: EstadoCampo) => void;

const CLAVE = 'kdx-campo';
/** Cuánto tarda un régimen en imponerse. No es un corte: es una deformación. */
const MS_TRANSICION = 1400;

function pesosVacios(): Record<Atractor, number> {
  return Object.fromEntries(ATRACTORES.map((a) => [a, 0])) as Record<Atractor, number>;
}

class CampoPersistente {
  private estado: EstadoCampo;
  private escuchas = new Set<Escucha>();
  private objetivo: Atractor | null = null;
  private raf = 0;
  private ultimo = 0;

  constructor() {
    this.estado = {
      pesos: pesosVacios(),
      seed: this.leerSeed(),
      ruta: [],
      ciclo: 0,
      residuo: pesosVacios(),
      calidad: this.medirCalidad(),
    };
  }

  /* La semilla sobrevive a la navegación pero NO a la sesión: cada visita es
     un organismo distinto, y dentro de la visita es el mismo. */
  private leerSeed(): number {
    try {
      const g = sessionStorage.getItem(CLAVE + '-seed');
      if (g) return Number(g);
      const s = Math.floor(Math.random() * 2 ** 31);
      sessionStorage.setItem(CLAVE + '-seed', String(s));
      return s;
    } catch {
      return 1;
    }
  }

  /* Se mide UNA vez y no se re-negocia a mitad del viaje: cambiar de perfil
     en medio de una transición se vería como un salto, no como adaptación. */
  private medirCalidad(): EstadoCampo['calidad'] {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'REDUCED';
      const nucleos = navigator.hardwareConcurrency ?? 4;
      const mem = (navigator as any).deviceMemory ?? 4;
      if (nucleos <= 2 || mem <= 2) return 'FALLBACK';
      if (nucleos <= 4 || window.innerWidth < 700) return 'REDUCED';
      return 'FULL';
    } catch {
      return 'REDUCED';
    }
  }

  get actual(): EstadoCampo {
    return this.estado;
  }

  suscribir(fn: Escucha): () => void {
    this.escuchas.add(fn);
    fn(this.estado);
    return () => this.escuchas.delete(fn);
  }

  private emitir() {
    for (const fn of this.escuchas) fn(this.estado);
  }

  /**
   * Entrar a un régimen. NO reinicia nada: mueve los pesos.
   * Ahí está la diferencia entre transición y corte.
   */
  entrar(a: Atractor) {
    if (this.objetivo === a) return;

    /* RETURN → THRESHOLD no es un reset: es regeneración con memoria.
       El ciclo sube y el residuo del viaje anterior queda. */
    if (a === 'THRESHOLD' && this.estado.ruta.at(-1) === 'RETURN') {
      this.estado.ciclo += 1;
    }

    const previo = this.objetivo;
    if (previo) {
      /* El régimen que se va no desaparece: deja huella. Eso es lo que hace
         que el espectador pueda decir "veo cómo esto se convirtió en aquello"
         en vez de "el blob cambió". */
      this.estado.residuo[previo] = Math.min(1, this.estado.residuo[previo] + 0.35);
    }

    this.objetivo = a;
    if (this.estado.ruta.at(-1) !== a) this.estado.ruta.push(a);
    this.animar();
  }

  private animar() {
    if (this.raf) return;
    this.ultimo = performance.now();

    const paso = (ahora: number) => {
      const dt = Math.min(64, ahora - this.ultimo);
      this.ultimo = ahora;
      const k = dt / MS_TRANSICION;

      let moviendo = false;
      for (const a of ATRACTORES) {
        const meta = a === this.objetivo ? 1 : 0;
        const d = meta - this.estado.pesos[a];
        if (Math.abs(d) > 0.001) {
          this.estado.pesos[a] += d * Math.min(1, k * 3);
          moviendo = true;
        } else {
          this.estado.pesos[a] = meta;
        }
        /* El residuo decae lento: la memoria se desvanece, no se borra. */
        if (this.estado.residuo[a] > 0.001) {
          this.estado.residuo[a] *= 1 - k * 0.4;
          moviendo = true;
        }
      }

      this.emitir();
      this.raf = moviendo ? requestAnimationFrame(paso) : 0;
    };

    this.raf = requestAnimationFrame(paso);
  }

  /** Firma de ruta: misma ruta → misma firma. Es lo que RETURN debe leer. */
  firmaDeRuta(): string {
    const inicial = (a: Atractor) => (a === 'THRESHOLD' ? 'T' : a[0]);
    return this.estado.ruta.map(inicial).join('') + '·' + this.estado.ciclo;
  }
}

/* Singleton colgado de window: sobrevive a `astro:page-load` porque no
   pertenece a ninguna página. Ese es el punto entero de P0. */
declare global {
  interface Window { __kdxCampo?: CampoPersistente }
}

export function campo(): CampoPersistente {
  if (typeof window === 'undefined') {
    throw new Error('El campo persistente es de cliente: no existe en SSR.');
  }
  return (window.__kdxCampo ??= new CampoPersistente());
}
