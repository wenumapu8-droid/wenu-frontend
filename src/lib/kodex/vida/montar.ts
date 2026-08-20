/**
 * KODEX−∞ · KDX.LIFE en pantalla
 *
 * `reglas.ts` decide quién vive. Esto lo hace visible y tocable sobre la
 * lámina, sin taparla. Separados igual que el motor de ruta: la vida se mide
 * sin navegador (`scripts/kodex/probar-vida.mjs`) y la pantalla se cambia sin
 * tocar la vida.
 *
 * REGLA DE CANON QUE MANDA ACÁ: la obra no se sacrifica al layout. El documento
 * de navegación §19 es explícito — "full artwork always visible at rest",
 * "activation UI lives outside or behind the protected art surface". Por eso
 * las señales son glifos chicos en el margen del campo, nunca encima del
 * centro de la plancha, y la capa entera se puede apagar.
 *
 * Y §19 otra vez: "no arbitrary decorative HUD density". Siete señales como
 * tope, medido y respetado.
 */
/* La hoja viaja con el módulo, no con la página: 9 de las 39 láminas no
   importan `kodex-lamina.css` y en esas esta capa salía sin posición ni color.
   Importándola acá, cualquier lámina que monte el módulo recibe sus estilos. */
import "../../../styles/kodex-lamina.css";

import { sembrar, latir, senales, tocar, avivar, apagado, cambiarBloque, BLOQUES, type Campo, type Senal } from './reglas';
import { recordar } from '../memoria';

const GLIFO: Record<string, string> = { COLOR: '◉', DIVIDE: '⋔', ROTATE: '◈', ACCELERATE: '⊹' };
const TINTE: Record<string, string> = { COLOR: '#e8b4bc', DIVIDE: '#c9a84c', ROTATE: '#8ba0c9', ACCELERATE: '#ff2733' };

/** Lo que la lámina puede escuchar para que el tacto la cambie a ella también. */
export type PulsoVida = { gesto: string; tempo: number; tinte: string; mutaciones: number };

export function montarVida(opciones: { id: string; raiz?: HTMLElement } ) {
  const raiz = opciones.raiz ?? document.querySelector<HTMLElement>('[data-lam]');
  if (!raiz) return;

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Retícula: la misma proporción que la plancha, para que las señales caigan
     donde la plancha tiene lugar y no encima de su centro. */
  const ANCHO = 32, ALTO = 18;
  let campo: Campo = sembrar(opciones.id, ANCHO, ALTO);
  let quietud = 0;
  let mutaciones = 0;

  const capa = document.createElement('div');
  capa.className = 'kdx-vida';
  capa.setAttribute('aria-label', 'Living signals');

  const barra = document.createElement('div');
  barra.className = 'kdx-vida__barra';

  const rotulo = document.createElement('button');
  rotulo.type = 'button';
  rotulo.className = 'kdx-vida__regla';
  /* El selector de preset: el handoff pide "presets" y esto es eso. Cambiar de
     regla NO reinicia el campo — la vida que hay sigue, bajo otra ley. */
  rotulo.addEventListener('click', () => {
    const i = BLOQUES.findIndex((b) => b.id === campo.bloque.id);
    const sig = BLOQUES[(i + 1) % BLOQUES.length];
    campo = cambiarBloque(campo, sig.id);
    recordar('LIFE_RULE_CHANGED', `kdx:lamina/${opciones.id}`, { rule: i, cycle: campo.ciclo });
    pintarBarra();
  encuadrar();
  });

  const apagar = document.createElement('button');
  apagar.type = 'button';
  apagar.className = 'kdx-vida__apagar';
  apagar.textContent = 'SIGNALS OFF';
  let encendida = true;
  apagar.addEventListener('click', () => {
    encendida = !encendida;
    capa.dataset.apagada = encendida ? '' : 'si';
    apagar.textContent = encendida ? 'SIGNALS OFF' : 'SIGNALS ON';
  });

  barra.append(rotulo, apagar);
  const lienzo = document.createElement('div');
  lienzo.className = 'kdx-vida__campo';
  capa.append(lienzo, barra);
  /* Va colgada de <body>, NO al lado de la plancha.
     Medido a 390×844: puesta como hermana de `.lam` la capa `position:fixed`
     aparecía en y=1539 —fuera de la pantalla— porque la plancha vive dentro de
     un ancestro con `transform`, y un transform convierte a sus descendientes
     `fixed` en `absolute`. Colgada del body, `fixed` vuelve a ser fixed. */
  document.body.append(capa);

  /* El campo se recorta sobre la CAJA DE LA PLANCHA, no sobre la pantalla.
     Medido a 390×844: con `inset:0` las señales caían por todo el viewport,
     incluida la franja de abajo donde vive el botón NEXT PLATE. Una señal
     flotando sobre el pie no pertenece a la obra — pertenece al ruido.
     La caja se recalcula al redimensionar y en cada latido, que es barato
     porque son cuatro números. */
  const encuadrar = () => {
    const c = raiz.getBoundingClientRect();
    lienzo.style.left = `${Math.max(0, c.left)}px`;
    lienzo.style.top = `${Math.max(0, c.top)}px`;
    lienzo.style.width = `${Math.min(innerWidth, c.width)}px`;
    lienzo.style.height = `${Math.min(innerHeight, c.height)}px`;
  };
  addEventListener('resize', encuadrar);
  addEventListener('scroll', encuadrar, { passive: true });

  /* Y como ahora flota sobre el viewport y no sobre la plancha, se apaga sola
     cuando la plancha no está a la vista: en móvil el lector de texto ocupa la
     pantalla más abajo y unas señales flotando sobre el texto serían ruido. */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((e) => {
      capa.dataset.fuera = e[0].isIntersecting ? '' : 'si';
    }, { threshold: 0.08 }).observe(raiz);
  }

  const pintarBarra = () => {
    rotulo.textContent = `RULE · ${campo.bloque.nombre} · B${campo.bloque.nace.join('')}/S${campo.bloque.vive.join('')}`;
    rotulo.style.setProperty('--kdx-v-color', TINTE[campo.bloque.gesto]);
  };

  const emitir = (gesto: string) => {
    const detalle: PulsoVida = {
      gesto,
      /* El tacto acelera la lámina misma: "que interactúen con la experiencia".
         El tempo se compone, no se pisa — cada toque suma un escalón y vuelve
         solo. */
      tempo: 1 + Math.min(1.4, mutaciones * 0.12),
      tinte: TINTE[gesto] ?? '#f0ede8',
      mutaciones,
    };
    raiz.dispatchEvent(new CustomEvent<PulsoVida>('kdx:vida', { detail: detalle, bubbles: true }));
  };

  /* Los nodos se REUTILIZAN por índice de celda. Antes se reconstruía la capa
     entera cada latido y Playwright no lograba tocar una señal: "element is not
     stable" y después "element was detached from the DOM". No era un problema
     de la prueba — era el dedo persiguiendo un blanco que se movía y
     desaparecía cada 800ms. Ahora la señal permanece mientras la celda viva. */
  const vivos = new Map<number, HTMLButtonElement>();

  const pintarSenales = () => {
    const s = senales(campo);
    const presentes = new Set(s.map((n) => n.i));
    for (const [i, el] of vivos) if (!presentes.has(i)) { el.remove(); vivos.delete(i); }
    for (const n of s) {
      let b = vivos.get(n.i);
      const nuevo = !b;
      if (!b) {
        b = document.createElement('button');
        b.type = 'button';
        b.className = 'kdx-vida__s';
        vivos.set(n.i, b);
      }
      b.style.left = `${((n.x + 0.5) / ANCHO * 100).toFixed(2)}%`;
      b.style.top = `${((n.y + 0.5) / ALTO * 100).toFixed(2)}%`;
      /* Con un gesto desconocido, `TINTE[...]` daba undefined, la propiedad
         quedaba inválida y `color` caía en herencia: señales NEGRAS sobre fondo
         negro, invisibles. Se vio en la captura, no en las métricas. */
      b.style.setProperty('--kdx-v-color', TINTE[n.gesto] ?? '#f0ede8');
      /* La señal más vieja gira más lento y pesa más: la edad es el dato y el
         movimiento es el dato hecho visible. */
      b.style.setProperty('--kdx-v-giro', `${(14 / (1 + n.edad * 0.16)).toFixed(2)}s`);
      b.style.setProperty('--kdx-v-peso', String(Math.min(1, n.edad / 14)));
      /* El glifo gira dentro de un <i>; el botón queda quieto. Rotar el botón
         mismo lo volvía intocable. */
      b.replaceChildren(Object.assign(document.createElement('i'), {
        className: 'kdx-vida__g', textContent: GLIFO[n.gesto] ?? '◉',
      }));
      b.setAttribute('aria-label', `${n.gesto.toLowerCase()} signal, age ${n.edad}`);
      b.title = `${n.gesto} · age ${n.edad}${n.mutacion ? ` · mutated ${n.mutacion}×` : ''}`;
      if (!nuevo) continue;
      b.addEventListener('click', () => {
        campo = tocar(campo, n.i);
        mutaciones++;
        recordar('LIFE_SIGNAL_TOUCHED', `kdx:lamina/${opciones.id}`, {
          age: n.edad, cycle: campo.ciclo, mutations: mutaciones,
        });
        emitir(n.gesto);
        pintarSenales();
      });
      lienzo.append(b);
    }
  };

  pintarBarra();
  encuadrar();

  /* El latido. Lento a propósito: esto es un organismo que se mira de reojo
     mientras la plancha respira, no una animación que compite con ella. Con
     movimiento reducido late igual pero cuatro veces más despacio, en vez de
     congelarse — una capa muerta no informa nada. */
  const PERIODO = quieto ? 3200 : 800;
  let ultimo = 0;
  const paso = (t: number) => {
    if (t - ultimo >= PERIODO) {
      ultimo = t;
      campo = latir(campo);
      encuadrar();
      if (apagado(campo)) { if (++quietud >= 6) { campo = avivar(campo); quietud = 0; } }
      else quietud = 0;
      if (encendida) pintarSenales();
    }
    requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
