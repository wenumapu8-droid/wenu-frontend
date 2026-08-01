/**
 * KODEX-∞ · GATE · runtime
 *
 * Cruzar hace tres cosas a la vez, y que sean simultáneas es el punto: el
 * acceso pasa a GRANTED, la escena entra en estado `active`, y el sonido
 * arranca. No son tres animaciones coordinadas — es un gesto y sus
 * consecuencias.
 */
import { estadoEscena, montarEstadoEscena } from "../../../lib/kodex/estado";

/** Se recuerda por sesión: cruzar el umbral en cada lámina sería un peaje. */
const YA_CRUZO = "kdx-gate";

function cruzar(raiz: HTMLElement, conSonido: boolean): void {
  raiz.dataset.kdxGateState = "open";
  try { sessionStorage.setItem(YA_CRUZO, "1"); } catch { /* modo privado */ }

  // El chrome lo viene anunciando desde el primer cuadro. Ahora se cumple.
  for (const el of document.querySelectorAll("[data-kdx-access]")) el.textContent = "GRANTED";

  estadoEscena().ir("active");

  if (conSonido) {
    // El botón de sonido del chrome ya sabe encender el motor y recordar la
    // elección entre láminas. Se dispara ese, en vez de duplicar su lógica.
    const boton = document.querySelector<HTMLElement>("[data-sound]");
    if (boton?.getAttribute("aria-pressed") !== "true") boton?.click();
  }

  // Se retira del árbol al terminar la disolución: un elemento a pantalla
  // completa, aunque sea invisible, sigue existiendo para los lectores de
  // pantalla y para el tabulador.
  setTimeout(() => raiz.remove(), 900);
}

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-gate]");
  if (!raiz || (raiz as any).__kdxGate) return;
  (raiz as any).__kdxGate = true;

  montarEstadoEscena();

  let cruzado = false;
  try { cruzado = sessionStorage.getItem(YA_CRUZO) === "1"; } catch { /* ignorado */ }
  if (cruzado) {
    // Ya cruzó en esta sesión: no se muestra ni un parpadeo.
    raiz.remove();
    for (const el of document.querySelectorAll("[data-kdx-access]")) el.textContent = "GRANTED";
    return;
  }

  raiz.querySelector("[data-kdx-gate-enter]")?.addEventListener("click", () => cruzar(raiz, true));
  raiz.querySelector("[data-kdx-gate-skip]")?.addEventListener("click", (e) => {
    e.stopPropagation();
    cruzar(raiz, false);
  });

  // Enter y espacio cruzan también. El foco arranca en el botón grande, así
  // que quien llega con teclado entra sin buscar nada.
  raiz.querySelector<HTMLElement>("[data-kdx-gate-enter]")?.focus({ preventScroll: true });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
