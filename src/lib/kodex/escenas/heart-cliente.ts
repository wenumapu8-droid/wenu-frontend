/**
 * KODEX−∞ · HEART · el enganche y el latido
 *
 * El dibujo usa el kit (`lienzo.ts`): fase en [0,1) sin costura, DPR acotado,
 * pausa fuera de pantalla, período alargado con `prefers-reduced-motion` y el
 * contrato de congelado que permite medir la escena con el banco. Nada de eso
 * se reescribe acá — reescribirlo es el error que el kit existe para evitar.
 *
 * La escena tiene tres actos, y los tres emiten memoria:
 *
 *   heart_arrival          llegaste al Corazón
 *   heart_route_reviewed   miraste tu recorrido (abrir la revisión, no pasar)
 *   heart_choice           elegiste un camino — cualquiera; no hay correcto
 *   heart_return_anchor    marcaste el Corazón como ancla para volver
 *
 * LO QUE EL LATIDO NO ES: biometría. El modo acompasado lo enciende el
 * visitante con un control visible, y lo único que hace es cambiar el período
 * del ciclo. No se lee nada del cuerpo de nadie.
 */

import { montarLienzo, contexto, tinta } from "../../../components/kodex/lamina/kit/lienzo";
import { recordar, recorrido, pesoDeMemoria, ciclo } from "../memoria";
import { senales } from "../senales";
import { HEART, HEART_NODE_ID } from "./heart";

const TAU = Math.PI * 2;

/* La paleta del Corazón: el neutro hueso del sistema con el acento cálido.
   Valores de tokens.css (Bone #f0ede8, Ember #c9a84c), no inventados. */
const HUESO = "240,237,232";
const BRASA = "201,168,76";

export function montarHeart(raiz: HTMLElement): () => void {
  const bus = senales();
  const limpiezas: Array<() => void> = [];

  raiz.dataset.kdxScene = HEART.scene_id;
  raiz.dataset.kdxNode = HEART.node_id;
  raiz.dataset.state = "quiet";

  const peso = pesoDeMemoria();
  bus.set("memory", peso);
  raiz.style.setProperty("--kdx-memoria", peso.toFixed(3));

  recordar("heart_arrival", HEART_NODE_ID, { memoria: peso, ciclo: Math.min(1, ciclo() / 8) });

  const pasarA = (estado: string) => {
    raiz.dataset.state = estado;
    const c = HEART.canonical[estado];
    if (c) raiz.dataset.kdxCanonState = c;
  };

  /* ── el latido ───────────────────────────────────────────────────────────
     Doble pulso (sístole-diástole) sobre anillos concéntricos, más la rosa de
     orientación. La amplitud crece con la memoria: un sistema que recuerda
     late más hondo. Es símbolo, y queda dicho en la definición de escena. */
  const canvas = raiz.querySelector<HTMLCanvasElement>("[data-kdx-heart-canvas]");
  let latido: { parar: () => void } | null = null;

  if (canvas) {
    const { g, W, H } = contexto(canvas);
    const CX = W / 2, CY = H / 2;
    const R = Math.min(W, H) * 0.36;
    const rutas = recorrido();

    /* El doble pulso: dos golpes por ciclo, el segundo más corto. Perfil
       sumado de dos campanas — continuo en el cierre del ciclo porque ambas
       campanas mueren antes de fase 1. */
    const pulso = (f: number) => {
      const g1 = Math.exp(-Math.pow((f - 0.18) / 0.07, 2));
      const g2 = 0.6 * Math.exp(-Math.pow((f - 0.38) / 0.05, 2));
      return g1 + g2;
    };

    const cuadro = (fase: number) => {
      g.clearRect(0, 0, W, H);
      const p = pulso(fase);
      const amp = 0.5 + peso * 0.5; // la memoria ahonda el latido

      /* anillos que respiran */
      for (let k = 0; k < 5; k++) {
        const rr = R * (0.34 + k * 0.16) * (1 + p * 0.045 * amp);
        g.strokeStyle = tinta(HUESO, 0.1 + p * 0.14 * amp * (1 - k * 0.16));
        g.lineWidth = 0.8 + p * 0.9 * amp;
        g.beginPath();
        g.arc(CX, CY, rr, 0, TAU);
        g.stroke();
      }

      /* la rosa de orientación: cuatro puntos cardinales, sin jerarquía */
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU - TAU / 4;
        const r0 = R * 0.2, r1 = R * (0.92 + p * 0.03 * amp);
        g.strokeStyle = tinta(BRASA, 0.22 + p * 0.2 * amp);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0);
        g.lineTo(CX + Math.cos(a) * r1, CY + Math.sin(a) * r1);
        g.stroke();
      }

      /* el recorrido, alrededor del Corazón: un nodo por ruta vista, en el
         orden en que se vieron. Se muestran, no se puntúan. */
      const n = Math.min(rutas.length, 24);
      for (let k = 0; k < n; k++) {
        const a = (k / Math.max(n, 8)) * TAU - TAU / 4;
        const rr = R * 1.12;
        const x = CX + Math.cos(a) * rr, y = CY + Math.sin(a) * rr;
        g.fillStyle = tinta(HUESO, 0.35 + p * 0.25 * amp);
        g.beginPath();
        g.arc(x, y, 1.6 + p * 0.8, 0, TAU);
        g.fill();
      }

      /* el centro: el nodo M */
      g.fillStyle = tinta(BRASA, 0.5 + p * 0.4 * amp);
      g.beginPath();
      g.arc(CX, CY, 3 + p * 2.4 * amp, 0, TAU);
      g.fill();
    };

    /* Período en reposo ~1 latido/seg lento de escena (4,8 s el ciclo doble).
       El modo acompasado lo alarga a respiración (~7 s): control del
       visitante, no sensor. */
    let periodo = 4800;
    latido = montarLienzo({
      raiz,
      cuadro,
      periodo,
      periodoReducido: 12000,
    });

    const acompasado = raiz.querySelector<HTMLButtonElement>("[data-kdx-breath]");
    if (acompasado) {
      const alternar = () => {
        const activo = raiz.dataset.kdxBreath === "1";
        raiz.dataset.kdxBreath = activo ? "0" : "1";
        acompasado.setAttribute("aria-pressed", activo ? "false" : "true");
        /* El kit no re-parametriza el período en vivo; se remonta el lienzo.
           Es un botón, no un cuadro por segundo: el costo no importa. */
        latido?.parar();
        periodo = activo ? 4800 : 7000;
        latido = montarLienzo({ raiz, cuadro, periodo, periodoReducido: 12000 });
      };
      acompasado.addEventListener("click", alternar);
      limpiezas.push(() => acompasado.removeEventListener("click", alternar));
    }
  }

  pasarA("pulsing");

  /* ── la revisión del recorrido ───────────────────────────────────────────
     Abrirla es un acto y se recuerda como tal. Pasar por la página no. */
  const revision = raiz.querySelector<HTMLElement>("[data-kdx-route-review]");
  const botonRevisar = raiz.querySelector<HTMLButtonElement>("[data-kdx-review]");
  if (botonRevisar && revision) {
    let revisado = false;
    /* La lista se llena acá y no en el build: el recorrido vive en el navegador
       del visitante. Sin historia, la revisión lo dice en vez de fingir una. */
    const lista = revision.querySelector<HTMLElement>("[data-kdx-route-list]");
    const poblar = () => {
      if (!lista) return;
      const rutas = recorrido();
      lista.textContent = "";
      if (!rutas.length) {
        const li = document.createElement("li");
        li.textContent = "NO ROUTE YET. THE HEART WAITS.";
        lista.appendChild(li);
        return;
      }
      rutas.slice(-24).forEach((r, i) => {
        const li = document.createElement("li");
        li.textContent = `${String(i + 1).padStart(2, "0")} · ${r}`;
        lista.appendChild(li);
      });
    };
    const alRevisar = () => {
      const abierto = !revision.hidden;
      if (abierto === false) poblar(); // se está por abrir
      revision.hidden = abierto;
      botonRevisar.setAttribute("aria-expanded", abierto ? "false" : "true");
      pasarA(abierto ? "pulsing" : "orienting");
      if (!abierto && !revisado) {
        revisado = true;
        recordar("heart_route_reviewed", HEART_NODE_ID, {
          rutas: Math.min(1, recorrido().length / 24),
        });
      }
    };
    botonRevisar.addEventListener("click", alRevisar);
    limpiezas.push(() => botonRevisar.removeEventListener("click", alRevisar));
  }

  /* ── la elección ─────────────────────────────────────────────────────────
     Cualquier camino vale lo mismo. El evento registra QUE se eligió, y el
     índice del camino — no una calificación. En captura porque navega. */
  raiz.querySelectorAll<HTMLAnchorElement>("[data-kdx-path]").forEach((a, i) => {
    const alElegir = () => {
      pasarA("integrating");
      recordar("heart_choice", HEART_NODE_ID, { camino: Math.min(1, i / 8) });
    };
    a.addEventListener("click", alElegir, { capture: true });
    limpiezas.push(() => a.removeEventListener("click", alElegir, { capture: true }));
  });

  /* ── el ancla ────────────────────────────────────────────────────────────
     "heart_return_anchor": marcar el Corazón como punto al que volver. */
  const ancla = raiz.querySelector<HTMLButtonElement>("[data-kdx-anchor]");
  if (ancla) {
    const alAnclar = () => {
      pasarA("returning");
      ancla.setAttribute("aria-pressed", "true");
      ancla.dataset.kdxAnclado = "1";
      recordar("heart_return_anchor", HEART_NODE_ID, { memoria: peso });
    };
    ancla.addEventListener("click", alAnclar);
    limpiezas.push(() => ancla.removeEventListener("click", alAnclar));
  }

  return () => {
    latido?.parar();
    for (const f of limpiezas) f();
  };
}
