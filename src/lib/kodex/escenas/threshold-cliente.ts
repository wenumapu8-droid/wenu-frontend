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
 * LA PUERTA ALTERADA. Si ya cruzaste, la raíz queda marcada con
 * `data-kdx-recordado` y la variable `--kdx-memoria` toma el peso real de tu
 * memoria. El CSS y el shader leen ESE valor. No es una animación distinta
 * afinada a mano: es el mismo número que devuelve el registro.
 *
 * CONTRATO DE CRUCE VIGENTE. Cruzar no es click/tap instantáneo: es un gesto
 * voluntario sostenido. Mantener presionado llena el progreso; soltar antes de
 * completar interrumpe y hace decay; sólo completar escribe `threshold_crossed`
 * y permite navegar. Pointer, touch y teclado comparten exactamente la misma
 * máquina de estado.
 */

import { recordar, ocurrio, pesoDeMemoria } from "../memoria";
import { senales } from "../senales";
import { THRESHOLD, THRESHOLD_NODE_ID, UMBRAL_PERMANENCIA } from "./threshold";

/**
 * Timing de implementación, no afirmación canónica. El canon exige hold +
 * progreso + release/decay; la duración puede afinarse mediante QA sin cambiar
 * la ley de interacción.
 */
const DURACION_HOLD_MS = 1800;
const DURACION_DECAY_MAX_MS = 900;

const clamp01 = (valor: number) => Math.max(0, Math.min(1, valor));

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

  recordar("threshold_seen", THRESHOLD_NODE_ID, { memoria: peso });
  if (yaCruzo) recordar("threshold_returned", THRESHOLD_NODE_ID, { memoria: peso });

  /* ── proximidad ──────────────────────────────────────────────────────────
     La proximidad modifica tensión visual, pero NO cruza la puerta ni escribe
     una decisión personal. Se normaliza por media diagonal para no depender del
     tamaño de ventana. */
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
     Permanecer puede estabilizar la escena y quedar como observación de sesión,
     pero jamás abre ni cruza automáticamente el umbral. El reloj corre sólo con
     la pestaña visible. */
  let anotada = false;
  let acumulado = 0;
  let desde = document.hidden ? 0 : performance.now();

  const cerrarTramo = () => {
    if (desde) acumulado += performance.now() - desde;
    desde = 0;
  };
  const revisar = () => {
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

  /* ── cruzar: hold → progreso → release/decay → complete ─────────────────
     La CTA sigue siendo un <a> real para conservar semántica y href, pero la
     navegación nativa se bloquea hasta completar el hold. El progreso visible
     se expresa en texto + `data-kdx-hold-progress` + una barra de fondo, de modo
     que no depende sólo de color ni de WebGL. */
  const cta = raiz.querySelector<HTMLAnchorElement>("[data-kdx-cruzar]");
  let interrumpirHold: (() => void) | null = null;

  if (cta) {
    const textoBase = (cta.textContent || THRESHOLD.copy.invitation).trim();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let progreso = 0;
    let sosteniendo = false;
    let completado = false;
    let rafHold = 0;
    let rafDecay = 0;
    let holdInicio = 0;
    let progresoInicio = 0;
    let punteroActivo: number | null = null;

    const duracionPermanenciaActual = () =>
      Math.min(1, (acumulado + (desde ? performance.now() - desde : 0)) / 20000);

    const pintarProgreso = (valor: number) => {
      progreso = clamp01(valor);
      const porcentaje = Math.round(progreso * 100);

      cta.dataset.kdxHoldProgress = progreso.toFixed(3);
      cta.toggleAttribute("data-kdx-holding", progreso > 0 && progreso < 1);
      cta.setAttribute(
        "aria-label",
        progreso > 0 && progreso < 1
          ? `${textoBase} — hold progress ${porcentaje}%`
          : textoBase,
      );

      // Feedback visible incluso sin shader. Se borra al volver a cero.
      cta.textContent =
        progreso > 0 && progreso < 1
          ? `${textoBase.replace(/\.$/, "")} · HOLD ${porcentaje}%`
          : textoBase;
      cta.style.backgroundImage =
        progreso > 0
          ? `linear-gradient(90deg, rgba(255,255,255,0.16) ${porcentaje}%, transparent ${porcentaje}%)`
          : "";
      cta.style.backgroundRepeat = progreso > 0 ? "no-repeat" : "";
      cta.style.backgroundSize = progreso > 0 ? "100% 100%" : "";
    };

    const detenerFrames = () => {
      if (rafHold) window.cancelAnimationFrame(rafHold);
      if (rafDecay) window.cancelAnimationFrame(rafDecay);
      rafHold = 0;
      rafDecay = 0;
    };

    const completar = () => {
      if (completado) return;
      completado = true;
      sosteniendo = false;
      detenerFrames();
      pintarProgreso(1);
      raiz.dataset.kdxThresholdState = "crossed";

      recordar("threshold_crossed", THRESHOLD_NODE_ID, {
        memoria: peso,
        permanencia: duracionPermanenciaActual(),
        gesto: "sustained_hold",
        hold_ms: DURACION_HOLD_MS,
      });

      // Deja un frame legible de completion antes de la navegación.
      window.setTimeout(
        () => window.location.assign(cta.href),
        reduceMotion.matches ? 0 : 120,
      );
    };

    const avanzar = (ahora: number) => {
      if (!sosteniendo || completado) return;
      if (!holdInicio) holdInicio = ahora;
      const siguiente = progresoInicio + (ahora - holdInicio) / DURACION_HOLD_MS;
      pintarProgreso(siguiente);
      raiz.dataset.kdxThresholdState = siguiente >= 0.02 ? "open" : "aware";
      if (siguiente >= 1) completar();
      else rafHold = window.requestAnimationFrame(avanzar);
    };

    const decaer = () => {
      if (completado || progreso <= 0) {
        pintarProgreso(completado ? 1 : 0);
        return;
      }

      if (reduceMotion.matches) {
        pintarProgreso(0);
        raiz.dataset.kdxThresholdState = "aware";
        return;
      }

      const inicial = progreso;
      const inicio = performance.now();
      const duracion = Math.max(180, DURACION_DECAY_MAX_MS * inicial);

      const paso = (ahora: number) => {
        if (sosteniendo || completado) return;
        const t = clamp01((ahora - inicio) / duracion);
        pintarProgreso(inicial * (1 - t));
        if (t >= 1) raiz.dataset.kdxThresholdState = "aware";
        else rafDecay = window.requestAnimationFrame(paso);
      };

      rafDecay = window.requestAnimationFrame(paso);
    };

    const empezarHold = () => {
      if (completado || sosteniendo) return;
      if (rafDecay) window.cancelAnimationFrame(rafDecay);
      rafDecay = 0;
      sosteniendo = true;
      holdInicio = 0;
      progresoInicio = progreso;
      raiz.dataset.kdxThresholdState = progreso > 0 ? "open" : "aware";
      rafHold = window.requestAnimationFrame(avanzar);
    };

    const soltarHold = () => {
      if (!sosteniendo || completado) return;
      // Materializa el tramo transcurrido aunque pointerup llegue entre frames.
      if (holdInicio) {
        pintarProgreso(
          progresoInicio + (performance.now() - holdInicio) / DURACION_HOLD_MS,
        );
      }
      sosteniendo = false;
      if (rafHold) window.cancelAnimationFrame(rafHold);
      rafHold = 0;
      holdInicio = 0;
      progresoInicio = progreso;
      if (progreso >= 1) completar();
      else decaer();
    };

    interrumpirHold = soltarHold;

    const alPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || completado) return;
      e.preventDefault();
      punteroActivo = e.pointerId;
      try {
        cta.setPointerCapture(e.pointerId);
      } catch (_) {}
      empezarHold();
    };
    const alPointerUp = (e: PointerEvent) => {
      if (punteroActivo !== null && e.pointerId !== punteroActivo) return;
      e.preventDefault();
      punteroActivo = null;
      soltarHold();
    };
    const alPointerCancel = (e: PointerEvent) => {
      if (punteroActivo !== null && e.pointerId !== punteroActivo) return;
      punteroActivo = null;
      soltarHold();
    };
    const alClick = (e: MouseEvent) => {
      // Un click/tap corto nunca cruza. La navegación ocurre sólo en completar().
      e.preventDefault();
    };
    const alContextMenu = (e: MouseEvent) => {
      if (sosteniendo) e.preventDefault();
    };
    const alKeyDown = (e: KeyboardEvent) => {
      if ((e.key !== "Enter" && e.key !== " ") || e.repeat || completado) return;
      e.preventDefault();
      empezarHold();
    };
    const alKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      soltarHold();
    };
    const alBlur = () => soltarHold();

    cta.addEventListener("pointerdown", alPointerDown);
    cta.addEventListener("pointerup", alPointerUp);
    cta.addEventListener("pointercancel", alPointerCancel);
    cta.addEventListener("click", alClick);
    cta.addEventListener("contextmenu", alContextMenu);
    cta.addEventListener("keydown", alKeyDown);
    cta.addEventListener("keyup", alKeyUp);
    cta.addEventListener("blur", alBlur);
    pintarProgreso(0);

    const limpiarHold = () => {
      detenerFrames();
      cta.removeEventListener("pointerdown", alPointerDown);
      cta.removeEventListener("pointerup", alPointerUp);
      cta.removeEventListener("pointercancel", alPointerCancel);
      cta.removeEventListener("click", alClick);
      cta.removeEventListener("contextmenu", alContextMenu);
      cta.removeEventListener("keydown", alKeyDown);
      cta.removeEventListener("keyup", alKeyUp);
      cta.removeEventListener("blur", alBlur);
      cta.style.backgroundImage = "";
      cta.style.backgroundRepeat = "";
      cta.style.backgroundSize = "";
      cta.textContent = textoBase;
    };
    limpiezas.push(limpiarHold);
  }

  const alCambiarVisibilidad = () => {
    if (document.hidden) {
      cerrarTramo();
      // Ocultar/cambiar de pestaña interrumpe la intención, pero no desmonta
      // los listeners: al volver, la puerta sigue siendo utilizable.
      interrumpirHold?.();
    } else if (!desde) {
      desde = performance.now();
    }
  };
  document.addEventListener("visibilitychange", alCambiarVisibilidad);
  limpiezas.push(() =>
    document.removeEventListener("visibilitychange", alCambiarVisibilidad),
  );

  /* La escena queda declarada en el documento. Es lo que hace que una vista de
     depuración del grafo sea posible sin instrumentar cada escena a mano. */
  raiz.dataset.kdxScene = THRESHOLD.scene_id;
  raiz.dataset.kdxNode = THRESHOLD.node_id;
  raiz.dataset.kdxThresholdState = yaCruzo ? "remembered" : "dormant";

  return () => {
    cerrarTramo();
    for (const f of limpiezas) f();
  };
}
