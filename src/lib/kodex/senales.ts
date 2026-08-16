/**
 * KODEX−∞ · EL BUS DE SEÑALES
 *
 * El blueprint pide una sola capa de modulación compartida:
 *
 *     "Create shared normalized signals available to visual, audio and UI
 *      systems… Avoid hard-coding independent interaction logic per scene."
 *
 * Lo que hay hoy es lo contrario: el portal calcula su proximidad, el audio
 * calcula su energía, la transición calcula su avance, y ninguno puede leer al
 * otro. Cuando dos capas parecen sincronizadas es porque están afinadas a mano.
 *
 * Acá una señal es un número en 0..1 y nada más. Quien la publica no sabe quién
 * la lee, y ésa es toda la gracia: el shader, el sonido y la interfaz leen el
 * MISMO valor en vez de tres parecidos.
 *
 * Se recorta al publicar, no al leer. Si una escena manda 1,4 de proximidad eso
 * es un error suyo, y arreglarlo en cada consumidor es multiplicar el parche.
 */

import type { SignalBus, SignalName } from "./contratos";
import { pesoDeMemoria } from "./memoria";

type Escucha = (v: number) => void;

class Bus implements SignalBus {
  private readonly valores = new Map<SignalName, number>();
  private readonly escuchas = new Map<SignalName, Set<Escucha>>();

  get(name: SignalName): number {
    return this.valores.get(name) ?? 0;
  }

  set(name: SignalName, value: number): void {
    const v = Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
    if (this.valores.get(name) === v) return; // no despertar a nadie por nada
    this.valores.set(name, v);
    const oyentes = this.escuchas.get(name);
    if (!oyentes) return;
    for (const fn of Array.from(oyentes)) {
      try {
        fn(v);
      } catch {
        /* Un consumidor que revienta no puede llevarse a los demás. */
      }
    }
  }

  subscribe(name: SignalName, fn: Escucha): () => void {
    let oyentes = this.escuchas.get(name);
    if (!oyentes) {
      oyentes = new Set();
      this.escuchas.set(name, oyentes);
    }
    oyentes.add(fn);
    /* Se entrega el valor actual de inmediato: quien se suscribe tarde no
       debería quedar en cero hasta el próximo cambio. */
    fn(this.get(name));
    return () => {
      oyentes!.delete(fn);
    };
  }
}

let bus: Bus | null = null;

/** El bus. Uno solo por documento. */
export function senales(): SignalBus {
  if (!bus) {
    bus = new Bus();
    /* `memory` no la publica ninguna escena: sale del registro y ya vale algo
       antes del primer movimiento del visitante. Es lo que permite que la
       segunda visita se vea distinta desde el primer cuadro. */
    bus.set("memory", pesoDeMemoria());
  }
  return bus;
}

/** Vuelve a leer la memoria y republica `memory`. Lo llama RETURN al cerrar ciclo. */
export function refrescarMemoria(): void {
  senales().set("memory", pesoDeMemoria());
}
