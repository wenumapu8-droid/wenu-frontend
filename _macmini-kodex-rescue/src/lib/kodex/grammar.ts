/**
 * KODEX-∞ · GRAMÁTICA VISUAL
 *
 * El sistema de gramática convirtió diez referencias en datos: grillas,
 * perfiles de movimiento y recetas de escena. Su regla central es
 *
 *   REFERENCIA → ADN FORMAL → GRILLA → RECETA → ARTE ORIGINAL KODEX
 *
 * y su reparto de responsabilidades es explícito: "JSON decide qué se coloca,
 * cuánto ocupa y cómo se comporta".
 *
 * Hasta ahora el sitio no cumplía esa regla. Las duraciones vivían sueltas en
 * el CSS y los parámetros de los campos eran números elegidos a ojo, escena
 * por escena. Funcionaban, pero no eran el sistema: eran siete decisiones
 * sueltas que se parecían. Este módulo invierte eso -- la receta manda y el
 * componente obedece.
 *
 * Lo que NO sale de los datos es el color. Las recetas dicen
 * `palette_mode: "original_kodex_palette"` y nada más, a propósito: la paleta
 * es de KODEX, no de las referencias. El acento de cada lámina se sigue
 * eligiendo a mano, que es donde tiene que decidirse.
 */
import recipes from "./grammar/kdx_scene_recipes.json";
import motions from "./grammar/kdx_motion_presets.json";
import grids from "./grammar/kdx_grid_system.json";

export type MotionPreset = {
  id: string;
  name: string;
  layer: string;
  duration_sec: [number, number];
  amplitude: [number, number];
  behaviors: string[];
  trigger: string;
  loop: boolean;
  priority: "low" | "medium" | "high" | "critical";
  reduced_motion: string;
};

export type SceneRecipe = {
  id: string;
  derived_from: string;
  grid_id: string;
  hero_role: string;
  motion_ids: string[];
  palette_mode: string;
  density: number;
  literal_source_assets_allowed: boolean;
};

export type Grid = {
  id: string;
  name: string;
  aspect: string[];
  columns: number;
  rows: number;
  hero_pct: [number, number];
  rail_pct: [number, number];
  data_pct: [number, number];
  negative_space_pct: [number, number];
  rules: string[];
  best_for: string[];
};

const RECIPES = recipes as SceneRecipe[];
const MOTIONS = motions as MotionPreset[];
const GRIDS = grids as Grid[];

/** Las siete láminas del KODEX. */
export type SceneKey = "threshold" | "i" | "ii" | "iii" | "iv" | "v" | "vi";

/**
 * Qué receta gobierna cada lámina.
 *
 * No es un reparto arbitrario: cada una se eligió por el `best_for` de su
 * grilla y por lo que la escena hace.
 *
 *  · THRESHOLD toma el portal de mármol -- su grilla dice "dream field,
 *    ambient scene", que es exactamente una puerta que todavía no se cruzó.
 *  · PROLOGUE toma la óptica de alambre: "portal, navigation". Es la lámina
 *    donde el archivo mira y donde se aprende a moverse.
 *  · DESCENT toma el tríptico de secuencia: "mutation, state machine". Bajar
 *    por estratos es una máquina de estados.
 *  · ARCHIVE toma el dossier de espécimen, que es literalmente lo que la
 *    lámina muestra, y con eso hereda la densidad más alta del set (0.91).
 *  · MACHINE toma la máquina temporal: "machine, ritual instrument".
 *  · COSMOLOGY toma el campo orbital denso: "cosmology, ritual diagram", el
 *    más denso de todos (0.96) porque es el que relaciona todo con todo.
 *  · RETURN toma la transmisión por cuadrantes: "four states, scene index".
 *    Es la lámina que mira hacia atrás sobre lo recorrido.
 */
export const SCENE_RECIPE: Record<SceneKey, string> = {
  threshold: "KDX_RECIPE_06",
  i: "KDX_RECIPE_09",
  ii: "KDX_RECIPE_03",
  iii: "KDX_RECIPE_02",
  iv: "KDX_RECIPE_10",
  v: "KDX_RECIPE_04",
  vi: "KDX_RECIPE_08",
};

const byId = <T extends { id: string }>(list: T[], id: string): T | undefined =>
  list.find((x) => x.id === id);

export function recipeFor(scene: SceneKey): SceneRecipe {
  const recipe = byId(RECIPES, SCENE_RECIPE[scene]);
  if (!recipe) throw new Error(`KODEX gramática: no existe la receta de ${scene}.`);
  return recipe;
}

export function gridFor(scene: SceneKey): Grid {
  const grid = byId(GRIDS, recipeFor(scene).grid_id);
  if (!grid) throw new Error(`KODEX gramática: no existe la grilla de ${scene}.`);
  return grid;
}

export function motionsFor(scene: SceneKey): MotionPreset[] {
  return recipeFor(scene)
    .motion_ids.map((id) => byId(MOTIONS, id))
    .filter((m): m is MotionPreset => Boolean(m));
}

/**
 * Nombre corto de un preset, para usarlo como variable CSS.
 * MOTION_04_SCAN_VERTICAL -> scan-vertical
 */
const slug = (id: string) =>
  id.replace(/^MOTION_\d+_/, "").toLowerCase().replace(/_/g, "-");

/**
 * Dónde cae la duración dentro del rango del preset.
 *
 * La densidad de la receta decide: mientras más hay en pantalla, más lento se
 * mueve cada cosa. Una lámina al 0.96 con todo moviéndose en el extremo rápido
 * de su rango no se lee como sistema, se lee como ruido. Al revés, una lámina
 * vacía puede permitirse el extremo rápido sin cansar.
 *
 * El sistema lo dice de otra forma -- "no usar más de dos movimientos de alta
 * prioridad al mismo tiempo" -- y esto es la versión continua de esa regla.
 */
const duracion = ([min, max]: [number, number], density: number) =>
  Math.round((min + (max - min) * density) * 100) / 100;

/**
 * Variables CSS de movimiento para una lámina.
 *
 * Cada preset de la receta emite `--kdx-m-<nombre>` con su duración y
 * `--kdx-a-<nombre>` con su amplitud. Los presets que la receta NO declara no
 * emiten nada: el CSS los pide con un valor de respaldo (`var(--kdx-m-scan,
 * 0s)`), así una animación que no pertenece a la escena simplemente no corre.
 * Eso es lo que hace que las láminas se comporten distinto sin tener siete
 * hojas de estilo.
 */
export function motionVars(scene: SceneKey): string {
  const { density } = recipeFor(scene);
  const partes: string[] = [`--kdx-density:${density}`];
  for (const m of motionsFor(scene)) {
    const n = slug(m.id);
    partes.push(`--kdx-m-${n}:${duracion(m.duration_sec, density)}s`);
    partes.push(`--kdx-a-${n}:${duracion(m.amplitude, density)}`);
  }
  return partes.join(";");
}

/**
 * Presupuesto de movimiento de alta prioridad.
 *
 * La regla del sistema es dura: como máximo dos movimientos de prioridad alta
 * a la vez. Se calcula acá para que sea verificable y no una intención escrita
 * en un README -- si una receta futura se pasa, esto lo dice.
 */
export function highPriorityCount(scene: SceneKey): number {
  return motionsFor(scene).filter((m) => m.priority === "high" || m.priority === "critical").length;
}

/**
 * Parámetros del campo vivo derivados de la receta.
 *
 * Antes eran siete juegos de números elegidos a ojo. Ahora salen de la receta:
 *
 *  · La VELOCIDAD sale del movimiento continuo más rápido que la receta
 *    declara para el fondo o el héroe. Una escena que declara mutación de
 *    secuencia se mueve rápido porque su receta dice que muta; una que declara
 *    deriva orbital se mueve lento porque su receta dice que deriva.
 *  · El RASTRO sale de la densidad. Más denso, más estela: es lo que amarra
 *    la trama en vez de dejarla como puntos sueltos.
 *  · El DETALLE sale de la densidad directamente. La receta más densa del set
 *    (0.96, COSMOLOGY) es la que tiene que verse más tejida.
 *
 * El color no sale de acá a propósito: ver la nota del encabezado.
 */
export function fieldParams(scene: SceneKey): { speed: number; feedback: number; detail: number } {
  const { density } = recipeFor(scene);
  const continuos = motionsFor(scene).filter(
    (m) => m.trigger === "continuous" && (m.layer === "background" || m.layer === "hero" || m.layer === "diagram"),
  );
  // Sin movimiento continuo declarado, el campo queda en su ritmo base: la
  // lámina no pidió que el fondo se moviera.
  const masRapido = continuos.length
    ? Math.min(...continuos.map((m) => duracion(m.duration_sec, density)))
    : 20;
  // 20s de ciclo es el ritmo base del campo. Un preset de 4s corre cinco veces
  // más rápido; uno de 40s, la mitad de lento.
  const speed = Math.round(Math.min(1.8, Math.max(0.35, 20 / masRapido)) * 100) / 100;

  return {
    speed,
    feedback: Math.round((0.22 + density * 0.34) * 100) / 100,
    detail: Math.round((0.34 + density * 0.3) * 100) / 100,
  };
}
