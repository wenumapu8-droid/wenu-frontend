/**
 * KODEX-∞ · DATOS VIVOS
 *
 * "Hacer que los números vivan" — el prototipo que Ocín aprobó tiene el HUD
 * tickeando por cuadro y ese es medio secreto de por qué se siente encendido.
 * La Receta Madre lo pone como pregunta de aprobación: *¿los códigos respiran?*
 *
 * Un dossier con datos congelados se lee como una captura de pantalla. Los
 * mismos datos moviéndose se leen como un aparato midiendo algo. La diferencia
 * no está en el diseño sino en si cambian.
 *
 * Qué se mueve y qué NO, que es la parte que importa:
 *
 *  · La SESIÓN se mueve: cronómetro, energía, el bloque hex. Son de esta
 *    visita y por eso pueden cambiar libremente.
 *  · Las COORDENADAS derivan lento, como una lectura de instrumento que nunca
 *    está del todo quieta. Derivan alrededor de su valor, no saltan.
 *  · El CHECKSUM se recalcula cada tanto, y cuando lo hace cambia en TODOS los
 *    lugares donde aparece a la vez. Un checksum que difiere entre dos paneles
 *    de la misma lámina delata que es decorado.
 *  · El IDENTIFICADOR de la pieza no se mueve nunca. Es lo que la nombra.
 */

const HEX = "0123456789ABCDEF";
const azar = (n: number) => Array.from({ length: n }, () => HEX[(Math.random() * 16) | 0]).join("");
const dos = (n: number) => String(n).padStart(2, "0");

/** Deriva suave alrededor de un valor: nunca salta, nunca se aleja. */
const deriva = (base: number, amplitud: number, t: number, fase: number) =>
  base + Math.sin(t * 0.0007 + fase) * amplitud;

class Vivos {
  private readonly t0 = performance.now();
  private timer = 0;

  constructor() {
    // Cada 90ms, como el prototipo. Más rápido no se alcanza a leer; más
    // lento se nota el salto entre valores.
    this.timer = window.setInterval(() => this.latir(), 90);
    this.latir();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) window.clearInterval(this.timer);
      else this.timer = window.setInterval(() => this.latir(), 90);
    });
  }

  private latir(): void {
    const ahora = performance.now();
    const t = ahora - this.t0;

    // Cronómetro de sesión.
    const s = (t / 1000) | 0;
    const reloj = `${dos((s / 3600) | 0)}:${dos(((s / 60) | 0) % 60)}:${dos(s % 60)}`;
    for (const el of document.querySelectorAll("[data-kdx-elapsed]")) el.textContent = reloj;

    // Energía: la del audio si suena, y si no una respiración lenta. No se
    // deja en cero cuando no hay sonido -- un medidor plano dice "roto", no
    // dice "sin señal".
    const bus = (window as unknown as { __kxAudio?: { activo: boolean; low: number; mid: number } }).__kxAudio;
    const e = bus?.activo ? (bus.low + bus.mid) / 2 : 0.18 + Math.sin(t * 0.0006) * 0.12;
    for (const el of document.querySelectorAll<HTMLElement>("[data-kdx-energy]")) {
      el.style.width = `${(8 + e * 88).toFixed(0)}%`;
    }

    // Bloque hex: se rebaraja entero. Es ruido con forma de dato, y está bien
    // que lo sea -- ocupa el lugar de la telemetría que todavía no existe.
    for (const el of document.querySelectorAll("[data-kdx-hex]")) {
      el.textContent = Array.from({ length: 8 }, () => azar(2)).join(" ");
    }

    // Coordenadas: derivan.
    const ra = document.querySelector("[data-kdx-ra]");
    if (ra) ra.textContent = `${deriva(137.59, 0.35, t, 0).toFixed(2)} MHZ`;
    const dec = document.querySelector("[data-kdx-dec]");
    if (dec) dec.textContent = `L−${(117 + Math.round(deriva(0, 4, t, 1.7)))}`;

    // Checksum: se recalcula de vez en cuando, y cuando cambia, cambia en
    // todas partes a la vez.
    if (Math.random() < 0.012) {
      const nuevo = `${azar(4)}-${azar(4)}`;
      for (const el of document.querySelectorAll("[data-kdx-checksum]")) el.textContent = nuevo;
    }

    // Registro de sistema: una línea parpadea cada tanto. Todas moviéndose
    // sería una cascada; una sola es un sistema reportando.
    if (Math.random() < 0.05) {
      const lineas = document.querySelectorAll("[data-kdx-logline]");
      if (lineas.length) {
        const el = lineas[(Math.random() * lineas.length) | 0] as HTMLElement;
        const antes = el.style.opacity;
        el.style.opacity = "0.25";
        setTimeout(() => { el.style.opacity = antes; }, 110);
      }
    }
  }
}

let vivos: Vivos | null = null;

export function montarDatosVivos(): void {
  if (vivos) return;
  // Con movimiento reducido los datos se quedan quietos. El pedido de no
  // animar incluye a los números: un contador corriendo es movimiento.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  vivos = new Vivos();
}
