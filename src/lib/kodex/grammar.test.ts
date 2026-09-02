/**
 * Tests de la GRAMATICA VISUAL.
 *
 * `grammar.ts` traduce las diez referencias visuales en datos: grillas,
 * presets de movimiento y recetas de escena. Es el sistema que hace que
 * las siete laminas se comporten distinto sin siete hojas de estilo -- si
 * se rompe, cada escena vuelve a inventar su ritmo suelto.
 *
 * Reglas:
 *
 *   G1 · SCENE_RECIPE cubre las 7 escenas del corredor.
 *   G2 · recipeFor / gridFor / motionsFor devuelven para las 7.
 *   G3 · fieldParams devuelve valores en rangos canonicos.
 *   G4 · highPriorityCount <= 2 en todas (regla del blueprint).
 *   G5 · motionVars es una string CSS declarativa valida (sin javascript,
 *        sin quotes rotas).
 *   G6 · Todo recipe declarado en SCENE_RECIPE existe en el JSON.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCENE_RECIPE,
  recipeFor,
  gridFor,
  motionsFor,
  motionVars,
  highPriorityCount,
  fieldParams,
  type SceneKey,
} from './grammar.ts';

const ESCENAS: SceneKey[] = ['threshold', 'i', 'ii', 'iii', 'iv', 'v', 'vi'];

describe('grammar · sistema de recetas por escena', () => {
  it('G1 · SCENE_RECIPE cubre las 7 escenas del corredor', () => {
    for (const s of ESCENAS) {
      assert.ok(SCENE_RECIPE[s], `${s} sin receta asignada`);
      assert.match(SCENE_RECIPE[s], /^KDX_RECIPE_\d{2}$/, `receta de ${s} rompe el patron`);
    }
  });

  it('G2 · recipeFor devuelve para las 7 sin throw', () => {
    for (const s of ESCENAS) {
      const r = recipeFor(s);
      assert.equal(r.id, SCENE_RECIPE[s]);
    }
  });

  it('G2 · gridFor devuelve para las 7 sin throw', () => {
    for (const s of ESCENAS) {
      const g = gridFor(s);
      assert.ok(g.id, `${s}: gridFor devolvio grid sin id`);
      assert.ok(g.columns >= 1 && g.rows >= 1, `${s}: grid con dimensiones invalidas`);
    }
  });

  it('G2 · motionsFor devuelve un array (posiblemente vacio)', () => {
    for (const s of ESCENAS) {
      const m = motionsFor(s);
      assert.ok(Array.isArray(m), `${s}: motionsFor no devolvio array`);
    }
  });

  it('G3 · fieldParams: speed en [0.35, 1.8], feedback/detail en [0, 1]', () => {
    for (const s of ESCENAS) {
      const { speed, feedback, detail } = fieldParams(s);
      assert.ok(speed >= 0.35 && speed <= 1.8, `${s}: speed ${speed} fuera de [0.35, 1.8]`);
      assert.ok(feedback >= 0 && feedback <= 1, `${s}: feedback ${feedback} fuera de [0,1]`);
      assert.ok(detail >= 0 && detail <= 1, `${s}: detail ${detail} fuera de [0,1]`);
    }
  });

  it('G4 · highPriorityCount <= 2 en todas (regla del blueprint)', () => {
    for (const s of ESCENAS) {
      const n = highPriorityCount(s);
      assert.ok(
        n <= 2,
        `${s}: highPriorityCount = ${n}. Blueprint fija maximo 2 movimientos high/critical a la vez.`,
      );
    }
  });

  it('G5 · motionVars produce string CSS declarativa valida', () => {
    for (const s of ESCENAS) {
      const css = motionVars(s);
      // Es una lista de declaraciones separadas por ';'.
      const decl = css.split(';');
      for (const d of decl) {
        if (!d.trim()) continue;
        // Cada una debe verse como --kdx-*:valor (sin sospecha de JS).
        assert.match(
          d.trim(),
          /^--kdx-[a-z0-9-]+:[a-z0-9.\- ]+$/i,
          `${s}: declaracion CSS invalida "${d}"`,
        );
      }
      // Debe siempre traer --kdx-density.
      assert.ok(css.includes('--kdx-density:'), `${s}: motionVars sin --kdx-density`);
    }
  });

  it('G6 · el densidad de la receta esta en [0, 1]', () => {
    for (const s of ESCENAS) {
      const { density } = recipeFor(s);
      assert.ok(density >= 0 && density <= 1, `${s}: density ${density} fuera de [0,1]`);
    }
  });

  it('las 7 escenas tienen recetas UNICAS (sin colisiones intencionales)', () => {
    const usadas = Object.values(SCENE_RECIPE);
    assert.equal(new Set(usadas).size, usadas.length, 'dos escenas compartiendo receta');
  });
});
