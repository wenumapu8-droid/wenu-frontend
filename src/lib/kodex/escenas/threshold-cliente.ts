/**
 * KODEX−∞ · THRESHOLD · el enganche
 *
 * Conecta la escena a los contratos compartidos. No dibuja: el dibujo ya lo
 * hacen `KodexPortal` y su runtime. Lo que faltaba era lo que la biblia pide y
 * ninguna escena hacía — emitir memoria y publicar señales.
 *
 * Los cuatro eventos son los que la escena declara en `emits`, y están cerrados
 * ahí a propósito: una escena que puede emitir cualquier cosa no tiene contrato.
 *
 *   threshold_seen      la puerta se vio
 *   threshold_dwell     el visitante SE QUEDÓ (no es lo mismo que pasar)
 *   threshold_crossed   cruzó — el único acto que lo deja distinto
 *   threshold_returned  volvió con memoria de haber cruzado antes
 *
 * LA PUERTA ALTERADA. La biblia lo pide textual en la línea 23: "return visit
 * produces an altered gate using remembered route variables". Acá eso es
 * concreto y verificable: si ya cruzaste, la raíz queda marcada con
 * `data-kdx-recordado` y la variable `--kdx-memoria` toma el peso real de tu
 * memoria. El CSS y el shader leen ESE valor. No es una animación distinta
 * afinada a mano: es el mismo número que devuelve el registro.
 */

import { recordar, ocurrio, pesoDeMemoria } from "../memoria";
import { senales } from "../senales";
import { THRESHOLD, THRESHOLD_NODE_ID, UMBRAL_PERMANENCIA } from "./threshold";

export function montarThreshold(raiz: HTMLElement): () => void {
  const bus = senales();
  const limpiezas: Array<() => void> = [];

  /* La memoria pesa desde el primer cuadro, antes de que el visitante mueva
     nada. Ésa es la diferencia entre recordar y reaccionar. */
  const peso = pesoDeMemoria();
  bus.set("memory", peso);
  raiz.style.setProperty("--kdx-memoria", peso.toFixed(3));

  const yaCruzo = ocurrio("threshold_crossed");
  if (yaCruzo) raiz.dataset.kdxRecordado = "1";

  /* VER LA PUERTA NO ES ENTRAR.
     `threshold_seen` se disparaba en el primer cuadro, antes de que el
     visitante hiciera nada: eso es escritura pasiva, y el creador la prohibió
     para esta rebanada. La puerta tiene dos elecciones explícitas -- entrar con
     sonido o seguir en silencio -- y recién una de ellas abre el archivo.
     Si la página no declara espera (cualquier otra escena, o una vuelta con la
     elección ya tomada), se registra de inmediato como siempre. */
  const registrarPaso = () => {
    recordar("threshold_seen", THRESHOLD_NODE_ID, { memoria: peso });
    if (yaCruzo) recordar("threshold_returned", THRESHOLD_NODE_ID, { memoria: peso });
  };
  if (document.documentElement.hasAttribute("data-kdx-espera-eleccion")) {
    document.addEventListener("kdx:eleccion", registrarPaso, { once: true });
  } else {
    registrarPaso();
  }

  /* ── proximidad ──────────────────────────────────────────────────────────
     La biblia: "pointer proximity increases membrane tension". Se mide contra
     el centro de la escena y se normaliza por su media diagonal, así que el
     valor no depende del tamaño de la ventana. */
  const alMover = (e: PointerEvent) => {
    const c = raiz.getBoundingClientRect();
    const dx = e.clientX - (c.left + c.width / 2);
    const dy = e.clientY - (c.top + c.height / 2);
    const d = Math.hypot(dx, dy) / (Math.hypot(c.width, c.height) / 2);
    bus.set("proximity", 1 - Math.min(1, d));
  };
  raiz.addEventListener("pointermove", alMover, { passive: true });
  limpiezas.push(() => raiz.removeEventListener("pointermove", alMover));

  /* ── permanencia ─────────────────────────────────────────────────────────
     "dwell stabilizes the opening". Se cuenta una sola vez por carga: quedarse
     ocho segundos no es quedarse dos veces. El reloj corre sólo con la pestaña
     visible — si no, dejar una pestaña abierta contaría como permanecer. */
  let anotada = false;
  let acumulado = 0;
  let desde = document.hidden ? 0 : performance.now();

  const cerrarTramo = () => {
    if (desde) acumulado += performance.now() - desde;
    desde = 0;
  };
  const revisar = () => {
    /* Quedarse mirando la puerta tampoco es entrar. El reloj sigue contando
       -- la permanencia real no se pierde -- pero no se ESCRIBE hasta que hay
       elección. En cuanto el visitante elige, el siguiente tic la anota con el
       total acumulado, incluido el rato que estuvo dudando. */
    if (document.documentElement.hasAttribute("data-kdx-espera-eleccion")) return;
    const total = acumulado + (desde ? performance.now() - desde : 0);
    if (!anotada && total >= UMBRAL_PERMANENCIA) {
      anotada = true;
      recordar("threshold_dwell", THRESHOLD_NODE_ID, {
        permanencia: total / (UMBRAL_PERMANENCIA * 4),
      });
      bus.set("dwell", 1);
    }
  };
  const reloj = window.setInterval(revisar, 500);
  limpiezas.push(() => window.clearInterval(reloj));

  const alCambiarVisibilidad = () => {
    if (document.hidden) cerrarTramo();
    else if (!desde) desde = performance.now();
  };
  document.addEventListener("visibilitychange", alCambiarVisibilidad);
  limpiezas.push(() =>
    document.removeEventListener("visibilitychange", alCambiarVisibilidad),
  );

  /* ── cruzar ──────────────────────────────────────────────────────────────
     "intentional press/tap crosses". Sólo el acto explícito cuenta: la biblia
     separa entrar de pasar, y la escena entera existe para que entrar sea
     voluntario. Se escucha en captura porque el enlace navega. */
  const cta = raiz.querySelector<HTMLAnchorElement>("[data-kdx-cruzar]");
  if (cta) {
    const alCruzar = () => {
      recordar("threshold_crossed", THRESHOLD_NODE_ID, {
        memoria: peso,
        permanencia: Math.min(1, (acumulado + (desde ? performance.now() - desde : 0)) / 20000),
      });
    };
    cta.addEventListener("click", alCruzar, { capture: true });
    limpiezas.push(() => cta.removeEventListener("click", alCruzar, { capture: true }));
  }

  /* La escena queda declarada en el documento. Es lo que pide la biblia —
     "every scene must expose node_id… state" — y lo que hace que una vista de
     depuración del grafo sea posible sin instrumentar cada escena a mano. */
  raiz.dataset.kdxScene = THRESHOLD.scene_id;
  raiz.dataset.kdxNode = THRESHOLD.node_id;

  return () => {
    cerrarTramo();
    for (const f of limpiezas) f();
  };
}
