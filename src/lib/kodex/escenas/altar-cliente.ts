/**
 * KODEX−∞ · ALTAR · el enganche, el vórtice y el tejido
 *
 * La exigencia de interacción de la biblia es una sola y es visual (línea 62):
 * "marks should visibly travel into the archive rather than disappear into a
 * form submission." O sea: al ofrecer, la marca VIAJA al centro del vórtice a
 * la vista — no hay spinner, no hay "enviado", hay un trayecto.
 *
 * El vórtice usa el kit (`lienzo.ts`). Con `prefers-reduced-motion` el kit
 * alarga el período y además el dibujo cambia de registro: anillos por estado
 * en vez de giro continuo — textual de la biblia.
 *
 * La ofrenda se guarda local con el esquema de la biblia (clave `kx-altar`),
 * y el MemoryEvent que la acompaña es SOLO numérico: tipo y largo normalizado.
 * El contenido jamás entra al registro de eventos.
 */

import { montarLienzo, contexto, tinta } from "../../../components/kodex/lamina/kit/lienzo";
import { recordar, recorrido, pesoDeMemoria } from "../memoria";
import { senales } from "../senales";
import { ALTAR, ALTAR_NODE_ID, MAX_PALABRA, type Ofrenda } from "./altar";

const TAU = Math.PI * 2;
const HUESO = "240,237,232";
const VIOLETA = "176,126,205"; // el acento medido de u09, ya en uso en el códice

const CLAVE_ALTAR = "kx-altar";

function leerOfrendas(): Ofrenda[] {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ALTAR) || "[]");
  } catch {
    return [];
  }
}
function guardarOfrenda(o: Ofrenda): void {
  try {
    const todas = leerOfrendas();
    todas.push(o);
    if (todas.length > 64) todas.shift();
    localStorage.setItem(CLAVE_ALTAR, JSON.stringify(todas));
  } catch {
    /* modo privado o cuota: el altar sigue; la ofrenda no persiste */
  }
}

export function montarAltar(raiz: HTMLElement): () => void {
  const bus = senales();
  const limpiezas: Array<() => void> = [];
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  raiz.dataset.kdxScene = ALTAR.scene_id;
  raiz.dataset.kdxNode = ALTAR.node_id;

  const peso = pesoDeMemoria();
  bus.set("memory", peso);
  raiz.style.setProperty("--kdx-memoria", peso.toFixed(3));

  const pasarA = (estado: string) => {
    raiz.dataset.state = estado;
    const c = ALTAR.canonical[estado];
    if (c) raiz.dataset.kdxCanonState = c;
  };
  pasarA("dormant");

  /* ── el vórtice ──────────────────────────────────────────────────────────
     Brazos espirales que giran con la fase; cuando hay una marca viajando, se
     dibuja su trayecto hacia el centro. En movimiento reducido no gira: los
     brazos se vuelven anillos que se encienden por estado. */
  const canvas = raiz.querySelector<HTMLCanvasElement>("[data-kdx-altar-canvas]");
  let viaje: { desde: number; x: number; y: number; texto: string } | null = null;
  let coordenada: { x: number; y: number } | null = null;
  let lienzo: { parar: () => void } | null = null;
  let CX = 0, CY = 0, R = 0;

  if (canvas) {
    const { g, W, H } = contexto(canvas);
    CX = W / 2; CY = H / 2; R = Math.min(W, H) * 0.4;

    const cuadro = (fase: number) => {
      g.clearRect(0, 0, W, H);
      const estado = raiz.dataset.state || "dormant";
      const vivo = estado !== "dormant" ? 1 : 0.45;

      if (!reducido) {
        /* tres brazos espirales */
        for (let b = 0; b < 3; b++) {
          g.strokeStyle = tinta(b ? HUESO : VIOLETA, 0.16 * vivo + (b === 0 ? 0.08 : 0));
          g.lineWidth = 0.9;
          g.beginPath();
          for (let t = 0; t <= 1; t += 0.02) {
            const a = fase * TAU + (b / 3) * TAU + t * TAU * 1.6;
            const rr = R * (0.12 + t * 0.85);
            const x = CX + Math.cos(a) * rr, y = CY + Math.sin(a) * rr;
            t === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
          }
          g.stroke();
        }
      } else {
        /* progresión radial por estado, sin giro */
        const orden = ALTAR.states.indexOf(estado);
        for (let k = 0; k < ALTAR.states.length; k++) {
          g.strokeStyle = tinta(k <= orden ? VIOLETA : HUESO, k <= orden ? 0.4 : 0.1);
          g.lineWidth = k <= orden ? 1.3 : 0.7;
          g.beginPath();
          g.arc(CX, CY, R * (0.2 + k * 0.15), 0, TAU);
          g.stroke();
        }
      }

      /* la coordenada elegida */
      if (coordenada) {
        g.strokeStyle = tinta(VIOLETA, 0.8);
        g.lineWidth = 1;
        g.beginPath();
        g.arc(coordenada.x, coordenada.y, 6, 0, TAU);
        g.stroke();
      }

      /* la marca viajando al centro — el requisito visual de la biblia */
      if (viaje) {
        const t = Math.min(1, (performance.now() - viaje.desde) / 1800);
        const suave = 1 - Math.pow(1 - t, 3);
        const x = viaje.x + (CX - viaje.x) * suave;
        const y = viaje.y + (CY - viaje.y) * suave;
        g.fillStyle = tinta(VIOLETA, 0.9 - suave * 0.4);
        g.font = `${14 - suave * 8}px ui-monospace, monospace`;
        g.textAlign = "center";
        g.fillText(viaje.texto.slice(0, 18), x, y);
        if (t >= 1) {
          viaje = null;
          pasarA("archived");
          pintarTejido();
        }
      }

      /* el pedestal: el centro donde todo converge */
      g.fillStyle = tinta(VIOLETA, 0.35 + peso * 0.3);
      g.beginPath();
      g.arc(CX, CY, 2.6, 0, TAU);
      g.fill();
    };

    lienzo = montarLienzo({ raiz, cuadro, periodo: 16000, periodoReducido: 40000 });

    /* elegir coordenada: un click en el campo ES una ofrenda de coordenada */
    const alClickCampo = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      coordenada = { x: e.clientX - r.left, y: e.clientY - r.top };
      pasarA("composing");
    };
    canvas.addEventListener("click", alClickCampo);
    limpiezas.push(() => canvas.removeEventListener("click", alClickCampo));
  }

  /* ── el tejido: lo ya ofrecido, visible ──────────────────────────────────
     "Memory is not stored. It is woven": el registro se muestra como hilos,
     no como tabla. Cada ofrenda es una fila con su tipo y su edad. */
  const tejido = raiz.querySelector<HTMLElement>("[data-kdx-woven]");
  const pintarTejido = () => {
    if (!tejido) return;
    const todas = leerOfrendas();
    tejido.textContent = "";
    if (!todas.length) {
      const p = document.createElement("p");
      p.textContent = "NOTHING WOVEN YET.";
      tejido.appendChild(p);
      return;
    }
    todas.slice(-9).reverse().forEach((o) => {
      const fila = document.createElement("p");
      const edad = Math.max(1, Math.round((Date.now() - o.timestamp) / 60000));
      fila.textContent = `${o.offering_type.toUpperCase()} · ${o.content.slice(0, 28)} · ${edad}m · LOCAL`;
      tejido.appendChild(fila);
    });
  };
  pintarTejido();

  /* ── recibir ─────────────────────────────────────────────────────────────
     Tocar el campo de texto despierta el altar. */
  const entrada = raiz.querySelector<HTMLInputElement>("[data-kdx-word]");
  if (entrada) {
    const alEnfocar = () => pasarA("receiving");
    const alTipear = () => pasarA("composing");
    entrada.addEventListener("focus", alEnfocar);
    entrada.addEventListener("input", alTipear);
    limpiezas.push(() => {
      entrada.removeEventListener("focus", alEnfocar);
      entrada.removeEventListener("input", alTipear);
    });
  }

  /* ── ofrecer ─────────────────────────────────────────────────────────────
     El acto explícito. Guarda la ofrenda con el esquema de la biblia, dispara
     el viaje visual, y emite el evento SOLO numérico. */
  const ofrecer = (tipo: Ofrenda["offering_type"], contenido: string, origen?: { x: number; y: number }) => {
    const limpio = contenido.trim().slice(0, MAX_PALABRA);
    if (!limpio) return;
    const o: Ofrenda = {
      offering_id: `OFR-${Date.now().toString(36)}-${Math.floor(Math.random() * 1296).toString(36)}`,
      timestamp: Date.now(),
      offering_type: tipo,
      local_or_public: "local",
      node_context: ALTAR_NODE_ID,
      route_context: recorrido().slice(-8),
      transformation_history: ["offered"],
      moderation_status: "not_applicable_local",
      content: limpio,
    };
    guardarOfrenda(o);
    pasarA("offered");
    /* el viaje: desde donde nació la marca hasta el pedestal */
    viaje = {
      desde: performance.now(),
      x: origen?.x ?? CX,
      y: origen?.y ?? CY + R * 0.86,
      texto: tipo === "coordinate" ? "◈" : limpio,
    };
    if (reducido) {
      /* sin viaje continuo: pasa directo y el vórtice lo marca por estado */
      viaje = null;
      pasarA("archived");
      pintarTejido();
    }
    recordar("altar_offered", ALTAR_NODE_ID, {
      tipo: tipo === "word" ? 0.2 : tipo === "symbol" ? 0.5 : 0.8,
      largo: limpio.length / MAX_PALABRA,
    });
    bus.set("dwell", 1);
  };

  const botonPalabra = raiz.querySelector<HTMLButtonElement>("[data-kdx-offer-word]");
  if (botonPalabra && entrada) {
    const al = () => {
      ofrecer("word", entrada.value);
      entrada.value = "";
    };
    botonPalabra.addEventListener("click", al);
    limpiezas.push(() => botonPalabra.removeEventListener("click", al));
  }

  raiz.querySelectorAll<HTMLButtonElement>("[data-kdx-symbol]").forEach((b) => {
    const al = (e: MouseEvent) => ofrecer("symbol", b.textContent?.trim() || "·", { x: e.clientX, y: e.clientY });
    b.addEventListener("click", al);
    limpiezas.push(() => b.removeEventListener("click", al));
  });

  const botonCoord = raiz.querySelector<HTMLButtonElement>("[data-kdx-offer-coord]");
  if (botonCoord) {
    const al = () => {
      if (!coordenada) return;
      ofrecer(
        "coordinate",
        `${Math.round(coordenada.x)},${Math.round(coordenada.y)}`,
        coordenada,
      );
      coordenada = null;
    };
    botonCoord.addEventListener("click", al);
    limpiezas.push(() => botonCoord.removeEventListener("click", al));
  }

  /* ── soltar ──────────────────────────────────────────────────────────────
     "release/return": el visitante puede deshacer su tejido local entero. Es
     el mismo derecho que `olvidar()` — irse sin dejar nada. */
  const botonSoltar = raiz.querySelector<HTMLButtonElement>("[data-kdx-release]");
  if (botonSoltar) {
    const al = () => {
      try {
        localStorage.removeItem(CLAVE_ALTAR);
      } catch { /* nada */ }
      pasarA("released");
      pintarTejido();
      recordar("altar_released", ALTAR_NODE_ID);
    };
    botonSoltar.addEventListener("click", al);
    limpiezas.push(() => botonSoltar.removeEventListener("click", al));
  }

  return () => {
    lienzo?.parar();
    for (const f of limpiezas) f();
  };
}
