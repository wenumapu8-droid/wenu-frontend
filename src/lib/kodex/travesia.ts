/**
 * KODEX−∞ · TRAVESÍA — atravesar, no cambiar de página
 *
 * El creador: "esto es un loop, como un black hole o agujeros de gusano… que
 * entrás hacia dentro cada vez". Y el manifiesto: "KODEX no cambia de página.
 * KODEX atraviesa dimensiones."
 *
 * NO SE ESCRIBIÓ NINGÚN MOTOR NUEVO. El creador fue explícito: "ya tenemos
 * muchas tools y referencias que ya solucionaron todo en la vida de KODEX, no
 * gasten token recreando la rueda". Y tenía razón — el túnel ya estaba
 * compilado en el repo desde antes:
 *
 *     src/kodex/threshold-portal/shaders/thresholdPortalSource.frag
 *     src/kodex/threshold-portal/shaders/thresholdPortalFeedback.frag   ← el túnel
 *     src/kodex/threshold-portal/shaders/thresholdPortalComposite.frag
 *
 * Un feedback buffer realimenta el cuadro anterior deformado hacia el centro.
 * Eso ES la sensación de caer hacia dentro: no la imita, la produce. La
 * alternativa que estaba en curso —`transform: scale` + `blur`— es la versión
 * pobre de exactamente esto.
 *
 * EL CONTRATO, acordado con el agente del corredor: la escena pone
 * `data-kdx-travesia="<forma>-sale"` en `[data-deck]` y `"<forma>-entra"`
 * después del intercambio, con `--kdx-travesia-ms`. Este módulo escucha ese
 * atributo y no sabe nada más del folio. Cinco formas, del runtime de
 * transición: absorcion · caida · expansion · convergencia · paso.
 */
import { KdxThresholdPortalRuntime } from '../../kodex/threshold-portal/index.js';

type Forma = 'absorcion' | 'caida' | 'expansion' | 'convergencia' | 'paso';

/**
 * Cada forma es un modo de atravesar, y se expresa con los mandos que el
 * runtime YA tiene — estado, tiempo y foco — no con parámetros nuevos.
 *
 *   absorcion    el centro traga: estado abierto, tiempo acelerado hacia dentro
 *   caida        el campo cae: tiempo rápido, foco desplazado hacia abajo
 *   expansion    se abre en capas: estado consciente, tiempo lento
 *   convergencia todo vuelve al centro: tiempo invertido
 *   paso         el más sobrio, para cruces que no son eventos narrativos
 */
const FORMAS: Record<Forma, { estado: 'DORMANT' | 'AWARE' | 'OPEN'; vel: number; foco: [number, number] }> = {
  absorcion:    { estado: 'OPEN',   vel:  2.6, foco: [0.5, 0.5] },
  caida:        { estado: 'OPEN',   vel:  2.0, foco: [0.5, 0.9] },
  expansion:    { estado: 'AWARE',  vel:  1.2, foco: [0.5, 0.5] },
  convergencia: { estado: 'OPEN',   vel: -1.8, foco: [0.5, 0.5] },
  paso:         { estado: 'AWARE',  vel:  1.0, foco: [0.5, 0.5] },
};

let runtime: InstanceType<typeof KdxThresholdPortalRuntime> | null = null;
let lienzo: HTMLCanvasElement | null = null;
let raf = 0;
let t0 = 0;

function crearLienzo(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.className = 'kdx-travesia';
  c.setAttribute('aria-hidden', 'true');
  document.body.append(c);
  return c;
}

/** Se carga cuando hace falta, no antes: §11, el costo escala con la atención. */
async function preparar(obra?: string): Promise<void> {
  if (runtime) return;
  lienzo ??= crearLienzo();
  const dpr = Math.min(2, devicePixelRatio || 1);
  lienzo.width = Math.round(innerWidth * dpr);
  lienzo.height = Math.round(innerHeight * dpr);
  runtime = new KdxThresholdPortalRuntime(lienzo, {
    artworkUrl: obra,
    /* La semilla sale de la obra que se está cruzando, así que atravesar dos
       escenas distintas no se ve igual — y atravesar la misma, sí. */
    seed: 0.382,
    qualityLevel: matchMedia('(max-width:560px)').matches ? 'MEDIUM' : 'HIGH',
    motionMode: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'live',
  });
  await runtime.load();
}

function correr(f: Forma, ms: number, saliendo: boolean): void {
  if (!runtime || !lienzo) return;
  const C = FORMAS[f] ?? FORMAS.paso;
  runtime.setState(C.estado);
  runtime.setPointer(C.foco[0], C.foco[1]);
  runtime.start();
  lienzo.dataset.activa = 'si';
  t0 = performance.now();
  cancelAnimationFrame(raf);

  const paso = (t: number) => {
    const p = Math.min(1, (t - t0) / ms);
    /* Saliendo, el túnel se cierra sobre el centro; entrando, se abre desde él.
       Es el mismo movimiento leído en dos direcciones: por eso una travesía se
       siente continua y no como dos animaciones pegadas. */
    const dir = saliendo ? p : 1 - p;
    runtime!.setElapsedMs(t0 * 0.001 + dir * C.vel * ms);
    runtime!.setBass(saliendo ? p : 1 - p);
    lienzo!.style.opacity = String(saliendo ? p : 1 - p);
    if (p < 1) raf = requestAnimationFrame(paso);
    else {
      lienzo!.dataset.activa = saliendo ? 'si' : '';
      if (!saliendo) runtime!.stop();
    }
  };
  raf = requestAnimationFrame(paso);
}

/**
 * Escucha el contrato. Un solo observador para todo el documento: la travesía
 * es una sola cosa, no una por escena.
 */
export function montarTravesia(): void {
  const deck = document.querySelector<HTMLElement>('[data-deck]') ?? document.documentElement;

  const leer = async () => {
    const v = deck.dataset.kdxTravesia;
    if (!v) return;
    const [forma, fase] = v.split('-') as [Forma, 'sale' | 'entra'];
    const ms = parseFloat(getComputedStyle(deck).getPropertyValue('--kdx-travesia-ms')) || 620;
    const obra = deck.dataset.artwork || document.querySelector<HTMLElement>('[data-artwork]')?.dataset.artwork;
    await preparar(obra);
    correr(forma, ms, fase === 'sale');
  };

  new MutationObserver(leer).observe(deck, { attributes: true, attributeFilter: ['data-kdx-travesia'] });
  if (deck.dataset.kdxTravesia) void leer();

  addEventListener('resize', () => {
    if (!lienzo) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    lienzo.width = Math.round(innerWidth * dpr);
    lienzo.height = Math.round(innerHeight * dpr);
  }, { passive: true });
}

/** Para el descenso: atravesar hacia dentro al bajar un nivel. */
export async function atravesarHaciaDentro(ms = 620): Promise<void> {
  await preparar();
  correr('absorcion', ms, true);
  await new Promise((r) => setTimeout(r, ms));
  correr('absorcion', ms, false);
}
