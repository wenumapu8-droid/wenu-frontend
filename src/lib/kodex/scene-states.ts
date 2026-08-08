/**
 * KODEX-∞ · DOS EJES DE ESTADO, NO DOS CANON EN CONFLICTO
 *
 * EL PROBLEMA APARENTE
 * --------------------
 * `estado.ts` fija, citando la Receta Madre §8:
 *     idle → aware → locked → active → transitionOut
 *
 * El `09_KODEX_PRODUCTION_BLUEPRINT` §C pide:
 *     dormant → aware → resonant → mutated → remembered
 *
 * Se leyó como una contradicción de canon. Al mirarlos de cerca no lo son:
 * miden cosas distintas.
 *
 * LA DISTINCIÓN
 * -------------
 * El ciclo de `estado.ts` describe UNA VISITA. Es el ciclo de vida de la interacción:
 * la escena está quieta, detecta presencia, se fija, responde, se va. Empieza y termina
 * dentro de la sesión. Por eso `transitionOut` existe: es una salida, no una memoria.
 *
 * El ciclo del blueprint describe LA RELACIÓN ENTRE EL VISITANTE Y LA ESCENA a lo largo
 * del tiempo. `mutated` y `remembered` son imposibles dentro de una sola visita: exigen
 * que haya un antes. Ninguna máquina de una sesión puede alcanzarlos.
 *
 *     eje de INTERACCIÓN  (por visita, estado.ts)
 *         idle → aware → locked → active → transitionOut
 *
 *     eje de MEMORIA      (entre visitas, este módulo)
 *         dormant → aware → resonant → mutated → remembered
 *
 * Son ortogonales. Una escena puede estar `active` en interacción y `dormant` en memoria
 * — es exactamente la primera visita de alguien que se involucra a fondo. Y puede estar
 * `idle` en interacción y `remembered` en memoria: alguien que vuelve y todavía no toca nada.
 *
 * `aware` aparece en ambos y significa cosas distintas en cada uno. Es la única
 * coincidencia léxica y conviene no confundirla.
 *
 * CONSECUENCIA
 * ------------
 * No hay que renombrar `estado.ts` ni descartar el blueprint. Ninguno de los dos canon
 * cede. Este módulo agrega el eje que faltaba y lo deriva de la memoria, que es donde
 * vive el dato.
 *
 * Si al revisarlo decides que sí querías reemplazar el ciclo de interacción, este módulo
 * se borra y no se pierde nada: no lo consume nadie todavía.
 */

import { memoryWeight, readEvents } from './memory';

/** Eje de memoria: la relación acumulada entre el visitante y una escena. */
export type MemoryState =
  | 'dormant'      // nunca visitada
  | 'aware'        // visitada, sin permanencia significativa
  | 'resonant'     // permanencia o retorno suficientes para que la escena responda
  | 'mutated'      // la escena cambió por lo vivido y el cambio persiste
  | 'remembered';  // relación estable; la escena reconoce el retorno

/** Eje de interacción, tal como lo define `estado.ts`. Se re-declara solo para componer. */
export type InteractionState =
  | 'idle'
  | 'aware'
  | 'locked'
  | 'active'
  | 'transitionOut';

export interface SceneStatePair {
  interaction: InteractionState;
  memory: MemoryState;
}

const RESONANT_THRESHOLD = 0.25;
const MUTATED_THRESHOLD = 0.55;
const REMEMBERED_THRESHOLD = 0.8;

/**
 * Deriva el estado de memoria de una escena.
 *
 * Deliberadamente conservador: `mutated` exige que exista una mutación REGISTRADA,
 * no solo peso acumulado. Una escena no declara haber cambiado porque alguien se quedó
 * mirando; lo declara porque emitió el evento que lo dice.
 */
export function memoryStateFor(scene: string): MemoryState {
  const weight = memoryWeight(scene);
  if (weight <= 0) return 'dormant';

  const events = readEvents().filter((e) => e.scene === scene);
  const hasMutation = events.some(
    (e) => e.kind === 'state.transition' && e.resultingState === 'mutated',
  );

  if (weight >= REMEMBERED_THRESHOLD && hasMutation) return 'remembered';
  if (hasMutation && weight >= MUTATED_THRESHOLD) return 'mutated';
  if (weight >= RESONANT_THRESHOLD) return 'resonant';
  return 'aware';
}

/**
 * Cuánto debe apartarse una escena de su forma base, 0..1.
 *
 * El blueprint pide que la memoria altere escenas futuras "de forma pequeña pero
 * perceptible". El techo de 0.35 hace cumplir ese "pequeña": una escena recordada sigue
 * siendo reconocible. Sin techo, la memoria acaba deformando la obra.
 */
export function mutationAmount(state: MemoryState): number {
  switch (state) {
    case 'dormant': return 0;
    case 'aware': return 0.05;
    case 'resonant': return 0.15;
    case 'mutated': return 0.28;
    case 'remembered': return 0.35;
  }
}

/**
 * Compone ambos ejes. Es lo que una escena debería leer: nunca uno solo.
 * `interaction` lo aporta `estado.ts`; `memory` se deriva acá.
 */
export function sceneState(scene: string, interaction: InteractionState): SceneStatePair {
  return { interaction, memory: memoryStateFor(scene) };
}
