/**
 * ESPEJO DE ESTADO · KODEX−∞
 *
 * La máquina de estados ya existe y ya la comparten el campo, el portal, la
 * transición, el CRT y la compuerta (`estado.ts`). Lo que faltaba es que el
 * estado se VEA: nada lo escribía en el DOM.
 *
 * Eso tenía dos consecuencias, y las dos importan:
 *
 *  1. El gate de experiencia no podía verificar causalidad. El 26-08 las siete
 *     escenas reportaban "causalidad no evaluada": la ley del proyecto es
 *     INPUT → CAMBIO DE ESTADO → CONSECUENCIA VISIBLE, y el eslabón del medio
 *     era invisible desde afuera.
 *
 *  2. El CSS no podía responder al estado. Cada capa tenía que suscribirse por
 *     su cuenta en JavaScript para reaccionar; con el estado en un atributo,
 *     una regla `[data-kdx-estado="locked"]` alcanza.
 *
 * Un estado que no se ve no existe. Esto lo hace existir.
 */
import { estadoEscena, type Estado } from './estado';

/**
 * Refleja el estado de la escena en `data-kdx-estado` sobre la raíz declarada.
 *
 * @param raiz  el nodo que lleva `data-kdx-contrato`. Si no se pasa, se busca.
 * @returns función para desuscribirse.
 */
export function montarEspejoEstado(raiz?: HTMLElement | null): () => void {
  const nodo = raiz ?? document.querySelector<HTMLElement>('[data-kdx-contrato]');
  if (!nodo) return () => {};

  const maquina = estadoEscena();

  const escribir = (e: Estado) => {
    nodo.dataset.kdxEstado = e;
    /* La intensidad acompaña al estado como número continuo: el CSS puede
       interpolar sin conocer la máquina. */
    nodo.style.setProperty('--kdx-intensidad', String(maquina.intensidad));
  };

  escribir(maquina.actual);
  return maquina.suscribir(escribir);
}
