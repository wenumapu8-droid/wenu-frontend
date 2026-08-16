/**
 * KODEX−∞ · TEMPLE · la arquitectura que recuerda
 *
 * Dibuja la nave recursiva, las columnas de memoria, el suelo de frecuencia y
 * el domo de constelación — todo DETERMINISTA desde los tres derivados de la
 * memoria. Sin `Math.random()`: la biblia manda que la arquitectura corresponda
 * a variables reales de estado y no a azar decorativo, así que la única
 * "variación" es aritmética fija sobre el índice de cada elemento.
 *
 * El mapeo es el de la biblia, por nombre:
 *
 *   archiveDepth    → cuántas columnas tiene la nave (4 a 14 por lado)
 *   routeDiversity  → cuántas ramas abre cada corredor (0 a 3)
 *   returnCount     → cuántas conexiones cuelgan del techo a las raíces (0 a 8)
 *
 * El panel muestra los tres números crudos. Eso no es decoración: es la
 * exigencia de que la mutación sea "explainable/debuggable" — el visitante
 * puede ver POR QUÉ su templo tiene la forma que tiene.
 */

import { montarLienzo, contexto, tinta } from "../../../components/kodex/lamina/kit/lienzo";
import { recordar, derivados, ocurrio, pesoDeMemoria } from "../memoria";
import { senales } from "../senales";
import { TEMPLE, TEMPLE_NODE_ID, UMBRAL_MUTACION } from "./temple";

const HUESO = "240,237,232";
const BRASA = "201,168,76";
const CIAN = "88,243,255"; // el acento de Observe, para la señal

export function montarTemple(raiz: HTMLElement): () => void {
  const bus = senales();
  const limpiezas: Array<() => void> = [];
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  raiz.dataset.kdxScene = TEMPLE.scene_id;
  raiz.dataset.kdxNode = TEMPLE.node_id;

  const d = derivados();
  const peso = pesoDeMemoria();
  bus.set("memory", peso);
  raiz.style.setProperty("--kdx-memoria", peso.toFixed(3));

  const pasarA = (estado: string) => {
    raiz.dataset.state = estado;
    const c = TEMPLE.canonical[estado];
    if (c) raiz.dataset.kdxCanonState = c;
  };

  /* El estado de entrada depende de si el visitante ya mutó el templo. */
  const mutado = Math.max(d.archiveDepth, d.routeDiversity, d.returnCount) >= UMBRAL_MUTACION;
  pasarA(mutado ? "mutated" : "aware");
  recordar("temple_entered", TEMPLE_NODE_ID, { ...d });

  if (mutado && !ocurrio("temple_mutation_unlocked")) {
    recordar("temple_mutation_unlocked", TEMPLE_NODE_ID, { ...d });
  }

  /* ── el panel que explica la mutación ────────────────────────────────────
     Los tres derivados, crudos, con su consecuencia arquitectónica. */
  const panel = raiz.querySelector<HTMLElement>("[data-kdx-mutation-panel]");
  const columnas = 4 + Math.round(d.archiveDepth * 10);   // por lado
  const ramas = Math.round(d.routeDiversity * 3);          // por corredor
  const conexiones = Math.round(d.returnCount * 8);        // techo→raíz
  if (panel) {
    panel.innerHTML = "";
    const fila = (nombre: string, valor: number, efecto: string) => {
      const p = document.createElement("p");
      p.textContent = `${nombre} ${valor.toFixed(3)} → ${efecto}`;
      panel.appendChild(p);
    };
    fila("ARCHIVE DEPTH", d.archiveDepth, `${columnas * 2} COLUMNS`);
    fila("ROUTE DIVERSITY", d.routeDiversity, `${ramas} BRANCHES PER CORRIDOR`);
    fila("RETURN COUNT", d.returnCount, `${conexiones} ROOT-CEILING TIES`);
  }

  /* ── la nave ─────────────────────────────────────────────────────────────
     Perspectiva de un punto: la nave recede al centro. Las columnas se apoyan
     en el suelo de frecuencia; el domo lleva la constelación local. */
  const canvas = raiz.querySelector<HTMLCanvasElement>("[data-kdx-temple-canvas]");
  let lienzo: { parar: () => void } | null = null;

  if (canvas) {
    const { g, W, H } = contexto(canvas);
    const CX = W / 2;
    const HORIZONTE = H * 0.46;

    const cuadro = (fase: number) => {
      g.clearRect(0, 0, W, H);
      /* la deriva: respiración lenta de la luz. En reducido, fija. */
      const luz = reducido ? 0.5 : 0.5 + 0.5 * Math.sin(fase * Math.PI * 2);

      /* la nave recursiva: marcos que receden */
      for (let k = 0; k < 7; k++) {
        const t = k / 7;
        const w = W * (0.94 - t * 0.78);
        const h = H * (0.88 - t * 0.72);
        g.strokeStyle = tinta(HUESO, 0.05 + t * 0.1 + luz * 0.04);
        g.lineWidth = 0.8;
        g.strokeRect(CX - w / 2, HORIZONTE - h * 0.44, w, h);
      }

      /* columnas de memoria: archiveDepth decide cuántas */
      for (let lado = -1; lado <= 1; lado += 2) {
        for (let k = 0; k < columnas; k++) {
          const t = (k + 1) / (columnas + 1);
          const x = CX + lado * W * (0.47 - t * 0.36);
          const y0 = HORIZONTE + H * (0.4 - t * 0.31);
          const y1 = HORIZONTE - H * (0.38 - t * 0.29);
          const a = 0.14 + t * 0.2;
          g.strokeStyle = tinta(HUESO, a + luz * 0.06);
          g.lineWidth = 2.2 - t * 1.4;
          g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();

          /* ramas: routeDiversity abre corredores laterales */
          for (let r = 0; r < ramas; r++) {
            const ry = y1 + (y0 - y1) * ((r + 1) / (ramas + 1));
            g.strokeStyle = tinta(BRASA, 0.14 + luz * 0.08);
            g.lineWidth = 0.7;
            g.beginPath();
            g.moveTo(x, ry);
            g.lineTo(x + lado * (14 + ((k * 7 + r * 13) % 10)), ry - 6);
            g.stroke();
          }
        }
      }

      /* conexiones techo→raíz: returnCount las cuelga */
      for (let k = 0; k < conexiones; k++) {
        const t = (k + 1) / (conexiones + 1);
        const x = CX + (t - 0.5) * W * 0.6;
        g.strokeStyle = tinta(BRASA, 0.16 + luz * 0.1);
        g.lineWidth = 0.6;
        g.beginPath();
        g.moveTo(x, HORIZONTE - H * 0.34);
        /* curva hacia el suelo, siempre la misma para el mismo k */
        g.quadraticCurveTo(x + ((k % 3) - 1) * 24, HORIZONTE, x, HORIZONTE + H * 0.3);
        g.stroke();
      }

      /* el suelo de frecuencia: barras fijas por índice, tinta por luz */
      const barras = 48;
      for (let k = 0; k < barras; k++) {
        const t = k / barras;
        const x = CX + (t - 0.5) * W * 0.88;
        const alto = 3 + ((k * 29) % 11) + luz * 4;
        g.strokeStyle = tinta(CIAN, 0.08 + luz * 0.08);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x, H * 0.94);
        g.lineTo(x, H * 0.94 - alto);
        g.stroke();
      }

      /* el domo: constelación LOCAL — un punto por evento propio, fijo por
         índice. collectiveSignals no existe todavía y no se finge. */
      const puntos = Math.round((d.archiveDepth + d.routeDiversity) * 14);
      for (let k = 0; k < puntos; k++) {
        const a = ((k * 137) % 100) / 100 * Math.PI; // ángulo fijo por índice
        const rr = W * 0.3 * (0.5 + ((k * 61) % 50) / 100);
        const x = CX + Math.cos(a + Math.PI) * rr;
        const y = HORIZONTE - H * 0.3 - Math.abs(Math.sin(a)) * H * 0.1;
        g.fillStyle = tinta(HUESO, 0.3 + luz * 0.25);
        g.beginPath();
        g.arc(x, y, 1 + ((k * 17) % 3) * 0.5, 0, Math.PI * 2);
        g.fill();
      }

      /* el altar al centro: contiene el acto; el templo, todo lo demás */
      g.fillStyle = tinta(BRASA, 0.4 + luz * 0.3);
      g.fillRect(CX - 8, HORIZONTE - 5, 16, 10);
    };

    lienzo = montarLienzo({ raiz, cuadro, periodo: 18000, periodoReducido: 46000 });
  }

  /* Ver el estado propio es un acto de la escena: la biblia lo nombra. Se
     cuenta al abrir el panel, una vez. */
  const botonEstado = raiz.querySelector<HTMLButtonElement>("[data-kdx-see-state]");
  const cajaPanel = raiz.querySelector<HTMLElement>("[data-kdx-state-box]");
  if (botonEstado && cajaPanel) {
    let visto = false;
    const al = () => {
      const abierto = !cajaPanel.hidden;
      cajaPanel.hidden = abierto;
      botonEstado.setAttribute("aria-expanded", abierto ? "false" : "true");
      if (!abierto) {
        pasarA(mutado ? "resonant" : "aware");
        if (!visto) {
          visto = true;
          recordar("temple_state_seen", TEMPLE_NODE_ID, { ...d });
        }
      }
    };
    botonEstado.addEventListener("click", al);
    limpiezas.push(() => botonEstado.removeEventListener("click", al));
  }

  return () => {
    lienzo?.parar();
    for (const f of limpiezas) f();
  };
}
