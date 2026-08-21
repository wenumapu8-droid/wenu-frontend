/**
 * KODEX−∞ · el sonido, conectado a la superficie
 *
 * Separado de `sonido.ts` por la misma razón que el motor de ruta está
 * separado de su pantalla: el motor se puede probar sin página y la conexión
 * se puede cambiar sin tocar el motor.
 *
 * TRES REGLAS DURAS:
 *
 * 1. NUNCA ARRANCA SOLO. El umbral pregunta y esa elección manda en todo el
 *    sitio. "El visitante elige. KODEX responde" (manifiesto).
 * 2. NO PIDE PERMISO DE NUEVO. Quien ya eligió no vuelve a ser interrumpido:
 *    la elección vive en `localStorage` y el sonido entra solo.
 * 3. RESPETA `prefers-reduced-motion`. Quien pidió menos movimiento
 *    probablemente también quiere menos estímulo; entra igual pero al 40%.
 */
import { sonido, estadoDe, sonidoPermitido, permitirSonido, type Estado } from './sonido';

/** Un interruptor discreto, para poder callarlo desde cualquier superficie. */
function montarInterruptor(): void {
  if (document.querySelector('[data-kdx-sonido]')) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'kdx-son';
  b.setAttribute('data-kdx-sonido', '');
  const pintar = () => {
    const on = sonidoPermitido();
    b.textContent = on ? '◉' : '◌';
    b.setAttribute('aria-label', on ? 'Sound on — tap to silence' : 'Sound off — tap to enable');
    b.setAttribute('aria-pressed', String(on));
  };
  b.addEventListener('click', async () => {
    const on = !sonidoPermitido();
    permitirSonido(on);
    if (on) { await sonido.iniciar(); sonido.estado(estadoActual()); }
    else sonido.silenciar();
    pintar();
  });
  pintar();
  document.body.append(b);
}

function estadoActual(): Estado {
  const lam = document.querySelector('[data-lam],[data-lamina]');
  const id = lam?.getAttribute('data-lam') ?? lam?.getAttribute('data-lamina');
  return estadoDe(id ?? location.pathname);
}

export async function montarSonido(): Promise<void> {
  montarInterruptor();
  if (!sonidoPermitido()) return;
  /* El contexto de audio sólo puede arrancar tras un gesto. Si el visitante ya
     dijo que sí en una visita anterior, se espera el primer gesto de ésta y
     entra sin volver a preguntar — que es distinto de arrancar solo. */
  const entrar = async () => {
    await sonido.iniciar();
    sonido.estado(estadoActual());
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) sonido.corte(0.25);
  };
  if (document.visibilityState === 'visible') {
    for (const ev of ['pointerdown', 'keydown', 'touchstart'] as const) {
      addEventListener(ev, entrar, { once: true, passive: true });
    }
  }
}

/** Que el descenso cambie el cuerpo del sonido: bajar cierra el aire. */
export function sonidoProfundidad(profundidad: number, tope: number): void {
  if (!sonidoPermitido()) return;
  /* Cuanto más hondo, más cerrado el filtro: el aire se apaga a medida que se
     entra. No es un efecto: es el mismo dato de profundidad que dibuja la
     espiral, sonando. */
  sonido.corte(Math.max(0, 1 - profundidad / tope));
}
