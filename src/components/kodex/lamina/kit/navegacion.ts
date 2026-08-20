/**
 * KODEX−∞ · la navegación de la lámina, fuera de la obra
 *
 * Ocín, textual: "no quiero que se sobrepongan elementos como palabras con
 * signos y con iconos o infográficos".
 *
 * EL HALLAZGO, medido con `scripts/kodex/solapes.mjs` sobre las 39 láminas en
 * tres viewports: 292 solapamientos de texto. Separados por origen, 29 de cada
 * 43 eran MÍOS — los dos enlaces `lam-salida` y `lam-siguiente`, que agregué
 * fijos sobre la plancha para que las láminas dejaran de ser callejones sin
 * salida, y que quedaron flotando encima del cromo de la obra. Casos de
 * cobertura del 100%: "KODEX-∞ UNIVERSE" tapado entero por "← KODEX−∞ · PLATES".
 *
 * Los otros 14 son elementos de la propia plancha entre sí. Esos son
 * composición del creador y NO se tocan: se le reportan.
 *
 * LA REGLA QUE MANDA (documento de navegación §19): "full artwork always
 * visible at rest", "activation UI lives outside or behind the protected art
 * surface". Así que la navegación se corre a donde la obra no está, en vez de
 * pedirle a la obra que se corra.
 *
 * CÓMO: se mide la caja real de la plancha ya escalada. Si abajo queda aire
 * —pasa en móvil, donde la plancha se ajusta al ancho y sobra alto— los
 * enlaces bajan ahí y no tapan nada. Si no queda aire —escritorio, donde la
 * plancha llena la pantalla— se quedan fijos pero se RETRAEN al borde: una
 * pestaña angosta que se abre al tocarla. La obra se ve entera en reposo, y la
 * salida sigue estando a un dedo.
 */
import { raizLamina } from './raiz';

/** Aire mínimo bajo la plancha para que valga la pena mudar los enlaces ahí. */
const AIRE = 96;

/** El rótulo completo, guardado para poder restituirlo al expandir. */
const ROTULO = new WeakMap<HTMLElement, string>();

export function montarNavegacion() {
  const lam = raizLamina();
  if (!lam) return;
  const salida = document.querySelector<HTMLElement>('.lam-salida');
  const siguiente = document.querySelector<HTMLElement>('.lam-siguiente');
  if (!salida && !siguiente) return;

  /* Colapsar y expandir. El rótulo se guarda una vez y se restituye tal cual:
     no se recorta ni se reescribe, porque el texto de esos enlaces nombra la
     lámina de destino y es información, no adorno. */
  const colapsar = (el: HTMLElement, flecha: string) => {
    if (!ROTULO.has(el)) ROTULO.set(el, el.textContent ?? '');
    if (el.dataset.kdxAbierto === 'si') return;
    el.textContent = flecha;
  };
  const expandir = (el: HTMLElement) => {
    const t = ROTULO.get(el);
    if (t) el.textContent = t;
  };
  for (const [el, flecha] of [[salida, '←'], [siguiente, '→']] as const) {
    if (!el) continue;
    const abrir = () => {
      if (el.dataset.kdxFuera === 'si') return;
      el.dataset.kdxAbierto = 'si';
      expandir(el);
    };
    const cerrar = () => {
      if (el.dataset.kdxFuera === 'si') return;
      delete el.dataset.kdxAbierto;
      colapsar(el, flecha);
    };
    el.addEventListener('pointerenter', abrir);
    el.addEventListener('focus', abrir);
    el.addEventListener('pointerleave', cerrar);
    el.addEventListener('blur', cerrar);
    /* En táctil el primer toque abre y el segundo navega: sin hover, tocar a
       ciegas una flecha sin rótulo sería adivinar adónde va. */
    el.addEventListener('click', (e) => {
      if (el.dataset.kdxFuera === 'si' || el.dataset.kdxAbierto === 'si') return;
      if (!matchMedia('(hover:none)').matches) return;
      e.preventDefault();
      abrir();
    });
  }

  const acomodar = () => {
    const c = lam.getBoundingClientRect();
    const bajo = innerHeight - c.bottom;
    /* `fuera` = hay aire real bajo la obra. Se mide, no se supone: depende del
       alto de la plancha, de su escala y del viewport, y cambia al rotar. */
    const fuera = bajo >= AIRE;
    for (const el of [salida, siguiente]) {
      if (!el) continue;
      el.dataset.kdxFuera = fuera ? 'si' : '';
      /* Sin aire, el enlace COLAPSA a una pestaña de flecha. No alcanza con
         bajarle la opacidad ni ponerle fondo: el detector mide geometría y
         tiene razón —un enlace opaco encima del texto lo tapa igual—. Medido:
         con sólo opacidad, 292 solapamientos bajaron a 268. Lo que hay que
         achicar es la CAJA, no la presencia. */
      if (fuera) {
        /* Anclados al aire bajo la obra, en coordenadas de viewport porque
           siguen siendo `fixed`. */
        el.style.top = `${Math.min(innerHeight - 56, c.bottom + 16)}px`;
        el.style.bottom = 'auto';
        /* LADO A LADO, no apilados. Al bajarlos los dos al mismo `top` se
           pisaban entre sí al 85-96%: "NEXT PLATE · …" va centrado y es ancho,
           así que cubría al de salida, anclado a la izquierda. Se corrigió un
           solapamiento contra la obra y se creó otro entre los dos controles —
           por eso hay que re-medir DESPUÉS de arreglar, no sólo antes. */
        if (el === siguiente) {
          el.style.left = 'auto';
          el.style.right = '12px';
          el.style.transform = 'none';
          el.style.maxWidth = 'calc(100% - 150px)';
        }
        expandir(el);
      } else {
        el.style.top = '';
        el.style.bottom = '';
        if (el === siguiente) {
          el.style.left = ''; el.style.right = ''; el.style.transform = ''; el.style.maxWidth = '';
        }
        colapsar(el, el === salida ? '←' : '→');
      }
    }
  };

  /* Y si aun lado a lado no entran, van en DOS FILAS.
     Medido a 390×844: con los dos rótulos completos en la misma fila se
     seguían pisando al 49% — "← KODEX−∞ · PLATES" mide ~150px y
     "NEXT PLATE · ANATOMICAL STAR →" no baja de 240, y 150+240+24 no cabe en
     390. La alternativa era recortar los rótulos, pero esos textos nombran la
     lámina de destino: son información, no adorno. Se apilan.
     Se comprueba con la caja real después de colocarlos, no con un cálculo
     sobre anchos supuestos. */
  const desapilar = () => {
    if (!salida || !siguiente) return;
    if (salida.dataset.kdxFuera !== 'si') return;
    const a = salida.getBoundingClientRect();
    const z = siguiente.getBoundingClientRect();
    const chocan = Math.min(a.right, z.right) - Math.max(a.left, z.left) > 2
      && Math.min(a.bottom, z.bottom) - Math.max(a.top, z.top) > 2;
    if (!chocan) return;
    siguiente.style.top = `${Math.min(innerHeight - 52, a.bottom + 8)}px`;
    siguiente.style.maxWidth = 'calc(100% - 24px)';
  };

  acomodar();
  requestAnimationFrame(desapilar);
  addEventListener('resize', () => { acomodar(); requestAnimationFrame(desapilar); });
  addEventListener('scroll', acomodar, { passive: true });
  /* La escala se aplica después del primer cuadro; sin este segundo pase los
     enlaces se acomodan contra una caja que todavía no es la definitiva. */
  requestAnimationFrame(() => requestAnimationFrame(() => { acomodar(); desapilar(); }));
  setTimeout(() => { acomodar(); desapilar(); }, 400);
}
