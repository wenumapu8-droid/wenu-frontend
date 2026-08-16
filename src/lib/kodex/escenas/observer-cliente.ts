/**
 * KODEX−∞ · OBSERVER · el enganche
 *
 * Migra Observe V2 a los contratos compartidos SIN TOCAR SU RENDERIZADOR.
 *
 * El renderizador ya publica todo lo que hace falta en la raíz de la escena:
 *
 *     data-state          idle | aware | locked | observing
 *     data-checksum       latent | pending | verified
 *     data-kdx-fps        cuadros por segundo reales
 *     data-kdx-metrics-json   el bloque entero de telemetría
 *     data-webgl          active | fallback
 *
 * Así que esto observa esos atributos con un `MutationObserver` en vez de
 * pedirle nada al cliente de 732 líneas. La biblia manda migrar "without
 * flattening its current visual identity or telemetry", y la forma de cumplirlo
 * es leer lo que la escena ya dice de sí misma, no reescribir cómo lo dice.
 *
 * Los tres eventos son los que la escena declara en `emits`:
 *
 *   observer_focus               el campo se enganchó (locked u observing)
 *   observer_dwell               el visitante SOSTUVO la observación
 *   observer_pattern_revisited   ya había observado antes — "repeated paths
 *                                reveal previous observer traces"
 *
 * Y lo que NO hace, que en esta escena es la parte que importa: no infiere
 * emoción, ni calidad de atención, ni estado psicológico. `focus` es un número
 * del campo —cuántos nodos se activan—, nunca una propiedad de la persona.
 */

import { recordar, ocurrio, pesoDeMemoria } from "../memoria";
import { senales } from "../senales";
import { OBSERVER, OBSERVER_NODE_ID, UMBRAL_OBSERVACION } from "./observer";

/** Los estados en que el campo está enganchado. Los otros dos no cuentan. */
const ENGANCHADO = new Set(["locked", "observing"]);

export function montarObserver(raiz: HTMLElement): () => void {
  const bus = senales();
  const limpiezas: Array<() => void> = [];

  raiz.dataset.kdxScene = OBSERVER.scene_id;
  raiz.dataset.kdxNode = OBSERVER.node_id;

  const peso = pesoDeMemoria();
  bus.set("memory", peso);
  raiz.style.setProperty("--kdx-memoria", peso.toFixed(3));

  /* "Repeated paths reveal previous observer traces". El rastro es haber
     observado antes, y eso lo sabe el registro. El estado `remembered` de la
     biblia vive acá y no en el shader: la GPU no tiene memoria entre visitas. */
  const yaObservo = ocurrio("observer_focus");
  if (yaObservo) {
    raiz.dataset.kdxRecordado = "1";
    raiz.dataset.kdxCanonState = "remembered";
    recordar("observer_pattern_revisited", OBSERVER_NODE_ID, { memoria: peso });
  }

  /* ── el estado, leído de lo que la escena ya publica ─────────────────────
     Un `MutationObserver` sobre `data-state`. Sin esto habría que meter una
     llamada dentro del renderizador, que es justo lo que no se toca. */
  let enganchadoDesde = 0;
  let acumulado = 0;
  let focoAnotado = false;
  let permanenciaAnotada = false;

  const leerFoco = (): number => {
    /* La telemetría viene como JSON en un atributo. Si falta o no parsea, se
       devuelve 0 en vez de inventar un número: una señal falsa es peor que
       una ausente. */
    try {
      const m = JSON.parse(raiz.getAttribute("data-kdx-metrics-json") || "{}");
      const f = Number(m.focus ?? m.focusLevel);
      return Number.isFinite(f) ? Math.min(1, Math.max(0, f)) : 0;
    } catch {
      return 0;
    }
  };

  const alCambiarEstado = () => {
    const estado = raiz.dataset.state || "idle";
    const canonico = OBSERVER.canonical[estado];
    if (canonico) raiz.dataset.kdxCanonState = yaObservo && estado === "idle" ? "remembered" : canonico;

    const activo = ENGANCHADO.has(estado);
    const foco = leerFoco();
    bus.set("proximity", foco);

    if (activo && !enganchadoDesde) {
      enganchadoDesde = performance.now();
      if (!focoAnotado) {
        focoAnotado = true;
        recordar("observer_focus", OBSERVER_NODE_ID, { foco });
      }
    } else if (!activo && enganchadoDesde) {
      acumulado += performance.now() - enganchadoDesde;
      enganchadoDesde = 0;
    }
  };

  const obs = new MutationObserver(alCambiarEstado);
  obs.observe(raiz, { attributes: true, attributeFilter: ["data-state", "data-kdx-metrics-json"] });
  limpiezas.push(() => obs.disconnect());
  alCambiarEstado();

  /* ── permanencia ─────────────────────────────────────────────────────────
     La biblia separa mirar de sostener la mirada ("dwell causes reciprocal eye
     response"). Sólo cuenta el tiempo ENGANCHADO: tener la pestaña abierta en
     `idle` no es observar. */
  const revisar = () => {
    if (permanenciaAnotada) return;
    const total = acumulado + (enganchadoDesde ? performance.now() - enganchadoDesde : 0);
    if (total >= UMBRAL_OBSERVACION) {
      permanenciaAnotada = true;
      recordar("observer_dwell", OBSERVER_NODE_ID, {
        sostenido: total / (UMBRAL_OBSERVACION * 4),
        foco: leerFoco(),
      });
      bus.set("dwell", 1);
    }
  };
  const reloj = window.setInterval(revisar, 500);
  limpiezas.push(() => window.clearInterval(reloj));

  /* Con la pestaña oculta no se observa. Sin esto, dejarla abierta contaría
     como sostener la mirada. */
  const alOcultar = () => {
    if (document.hidden && enganchadoDesde) {
      acumulado += performance.now() - enganchadoDesde;
      enganchadoDesde = 0;
    }
  };
  document.addEventListener("visibilitychange", alOcultar);
  limpiezas.push(() => document.removeEventListener("visibilitychange", alOcultar));

  return () => {
    for (const f of limpiezas) f();
  };
}
