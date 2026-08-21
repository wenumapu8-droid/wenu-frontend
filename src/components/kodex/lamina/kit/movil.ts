
/* La hoja viaja con el módulo, no con la página: 9 de las 39 láminas no
   importan `kodex-lamina.css` y en esas esta capa salía sin posición ni color.
   Importándola acá, cualquier lámina que monte el módulo recibe sus estilos. */
import { raizLamina } from "./raiz";
import "../../../../styles/kodex-lamina.css";
/**
 * KODEX−∞ · LA LÁMINA EN EL TELÉFONO
 *
 * El problema, medido en producción: una plancha de 1122×1402 escalada a 390 px
 * queda en 0,317 — su tipografía cae a 3–4 px y **24 de 29 textos resultan
 * ilegibles**. La plancha no está rota: está siendo *encogida*, que es
 * justamente lo que el canon prohíbe — "mobile may recompose but must preserve
 * the same hierarchy", no "mobile is desktop, smaller".
 *
 * LA SOLUCIÓN NO ES REDIBUJAR 36 LÁMINAS A MANO.
 *
 * Una plancha impresa se mira de lejos (composición) y se lee de cerca
 * (contenido). En papel hacés las dos cosas moviendo la cabeza; en un teléfono
 * no podés. Así que el móvil separa esos dos actos:
 *
 *   1. LA OBRA arriba, entera, a ancho completo — se ve como cartel.
 *   2. EL CONTENIDO debajo, reordenado y legible — extraído de la PROPIA
 *      lámina, leyendo sus `<text>` en orden de lectura (banda superior a
 *      inferior, y dentro de cada banda de izquierda a derecha).
 *
 * No inventa una palabra: transcribe lo que la lámina ya dice. Si mañana la
 * lámina cambia su texto, el móvil cambia solo.
 *
 * Y el orden de lectura no es el orden del DOM: en un SVG los elementos están
 * en orden de PINTADO. Se ordenan por geometría, agrupando en bandas de 26 px
 * para que una fila de etiquetas no se desarme por dos píxeles de diferencia.
 */

const ANCHO_MOVIL = 560;
const BANDA = 26;

export function montarMovil(): void {
  if (matchMedia(`(min-width:${ANCHO_MOVIL + 1}px)`).matches) return;
  /* SUPERSEDIDO POR EL TRÍPTICO EN MÓVIL. No se borra —el creador pidió
     transformar, no borrar, y este lector sigue siendo el respaldo si el
     tríptico no puede montar— pero se aparta cuando el tríptico va a montar.
     
     Medido: los dos corrían a la vez y se peleaban el armazón. Este ponía
     `body{overflow-y:auto}` para poder desplazar hasta su panel, y pisaba el
     `overflow:hidden` del tríptico: la página se desplazaba 600px, violando el
     límite NO NEGOCIABLE de §2 de `38-GESTURE-TIMELINE` ("body-level Y scroll
     remains disabled", "MUST NOT become a hidden vertical feed").
     
     Una regla que no hace nada es peor que ninguna; dos módulos peleando por el
     mismo armazón, peor todavía. */
  if (document.querySelector('.kdx-tri') || matchMedia('(max-width:560px)').matches) return;

  const lam = raizLamina();
  if (!lam || document.querySelector("[data-kdx-movil]")) return;

  /* ── el contenido, en orden de lectura ──────────────────────────── */
  type Linea = { x: number; y: number; t: string; grande: boolean };
  const lineas: Linea[] = [];
  const vistos = new Set<string>();
  /* Dos familias de lámina y por eso dos orígenes de texto: las procedurales
     escriben en `<svg><text>`, y las de la serie de archivo arman su cromo con
     componentes HTML. Buscar sólo en el SVG dejaba el panel vacío justo en las
     diez que más texto tienen — se vio midiendo, no leyendo el código. */
  const anota = (el: Element, x: number, y: number) => {
    const t = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (t.length < 2 || vistos.has(t)) return;
    vistos.add(t);
    const cuerpo = parseFloat(getComputedStyle(el).fontSize) || 10;
    lineas.push({ x, y, t, grande: cuerpo >= 26 });
  };
  lam.querySelectorAll<SVGTextElement>("svg text").forEach((el) => {
    const c = el.getBBox ? el.getBBox() : ({ x: 0, y: 0 } as DOMRect);
    anota(el, c.x, c.y);
  });
  const base = lam.getBoundingClientRect();
  lam.querySelectorAll<HTMLElement>("p,h1,h2,h3,strong,b,span,dd,dt,li,em,small").forEach((el) => {
    /* sólo hojas de texto: si un contenedor trae hijos con texto, sus hijos ya
       se anotan y el padre duplicaría el bloque entero */
    if (el.querySelector("p,h1,h2,h3,span,dd,dt,li,strong,b,em,small")) return;
    const c = el.getBoundingClientRect();
    if (c.width === 0 && c.height === 0) return;
    anota(el, c.left - base.left, c.top - base.top);
  });
  lineas.sort((a, b) => {
    const ba = Math.floor(a.y / BANDA), bb = Math.floor(b.y / BANDA);
    return ba !== bb ? ba - bb : a.x - b.x;
  });
  if (!lineas.length) return;

  /* ── el panel ───────────────────────────────────────────────────── */
  const panel = document.createElement("section");
  panel.dataset.kdxMovil = "1";
  panel.className = "kdx-mov";
  const slug = lam.dataset.lam || "";
  panel.innerHTML =
    `<p class="kdx-mov__ojo">◉ PLATE · READABLE</p>` +
    lineas
      .map((l) =>
        l.grande
          ? `<h2 class="kdx-mov__t">${escapar(l.t)}</h2>`
          : `<p class="kdx-mov__l">${escapar(l.t)}</p>`,
      )
      .join("") +
    `<p class="kdx-mov__pie">${escapar(slug.toUpperCase())}</p>`;

  /* La obra se queda arriba, entera y sin recortar; el panel va debajo.
     `position:fixed` en el escalador impedía apilar: acá pasa a flujo. */
  lam.style.position = "relative";
  lam.insertAdjacentElement("afterend", panel);
  document.body.style.height = "auto";
  document.body.style.overflowY = "auto";
}

function escapar(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}
