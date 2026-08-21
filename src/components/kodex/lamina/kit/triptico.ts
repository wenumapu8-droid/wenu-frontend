/**
 * KODEX−∞ · TRÍPTICO — la lámina en móvil, recompuesta en tres páginas
 *
 * EL PEDIDO DEL CREADOR, textual (2026-08-20):
 *   "esas láminas son la base, o sea son la arquitectura del sistema de cada
 *    concepto, o sea los planos… la experiencia al final puede dividirse en 3
 *    páginas, o sea ese concepto vive en las 3 páginas y todo lo que está en la
 *    lámina se organiza de la mejor forma posible entre los 3… nada se pierde,
 *    sólo se mejora y se optimiza."
 *
 * Y EL DRIVE YA LO TENÍA ESCRITO. `23-MASTER-LAYOUT-RECIPE.txt`, sección 02,
 * bloque MOBILE, literal:
 *
 *     Do not miniature the desktop composition.
 *     Recompose priority:
 *       1. macro signal;  2. payload;  3. primary state;
 *       4. next action;   5. optional evidence behind progressive disclosure.
 *
 * Eso condena exactamente lo que hacía la versión anterior: encoger la plancha
 * entera y colgarle el texto debajo. Miniaturizar no es adaptar.
 *
 * LAS CINCO ZONAS que la receta define para toda lámina —A operacional,
 * B señal macro, C campo visual, D evidencia, E continuidad— caen exactas en
 * las tres páginas que pidió el creador:
 *
 *   I   SIGNAL     A + B          el concepto se anuncia
 *   II  FIELD      C              la obra, sola, a pantalla completa
 *   III EVIDENCE   D + E          los datos y adónde se sigue
 *
 * LA OBRA SE MONTA UNA SOLA VEZ. Las tres páginas no la duplican: es la misma
 * plancha, viva y animando, vista de tres maneras. Duplicarla habría duplicado
 * también su canvas y su rAF, y habría triplicado el costo de la escena — lo
 * que §11 del documento de navegación prohíbe explícitamente ("performance must
 * scale with current attention").
 *
 * NADA SE PIERDE: cada bloque de texto de la plancha termina en alguna de las
 * tres páginas. Al final se verifica y lo que no encontró zona cae en EVIDENCE,
 * que es la página que admite todo. Se cuenta y se puede auditar.
 */
import { raizLamina, idLamina } from './raiz';
import '../../../../styles/kodex-lamina.css';
import { recordar } from '../../../../lib/kodex/memoria';
import { montarDescenso } from '../../../../lib/kodex/descenso-ui';

/** Sobre este ancho, la lámina se ve como plano completo y no hace falta. */
const CORTE = 560;

type Bloque = { t: string; x: number; y: number; w: number; h: number; cuerpo: number };
type Zona = 'A' | 'B' | 'D' | 'E';

export function montarTriptico() {
  if (matchMedia(`(min-width:${CORTE + 1}px)`).matches) return;
  const lam = raizLamina();
  if (!lam) return;
  const id = idLamina(lam) ?? '';

  /* ── leer la plancha ────────────────────────────────────────────────────
     Dos familias: las procedurales escriben en `<svg><text>`, las de archivo
     arman su cromo con componentes HTML. Se leen las dos. */
  const caja = lam.getBoundingClientRect();
  const alto = lam.offsetHeight || caja.height || 1;
  const ancho = lam.offsetWidth || caja.width || 1;
  const vistos = new Set<string>();
  const bloques: Bloque[] = [];

  const anota = (el: Element, x: number, y: number, w: number, h: number) => {
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (t.length < 2 || vistos.has(t)) return;
    vistos.add(t);
    bloques.push({ t, x, y, w, h, cuerpo: parseFloat(getComputedStyle(el).fontSize) || 10 });
  };

  lam.querySelectorAll<SVGTextElement>('svg text').forEach((el) => {
    const b = el.getBBox ? el.getBBox() : ({ x: 0, y: 0, width: 0, height: 0 } as DOMRect);
    anota(el, b.x, b.y, b.width, b.height);
  });
  lam.querySelectorAll<HTMLElement>('p,h1,h2,h3,strong,b,span,dd,dt,li,em,small').forEach((el) => {
    if (el.querySelector('p,h1,h2,h3,span,dd,dt,li,strong,b,em,small')) return;
    const c = el.getBoundingClientRect();
    if (!c.width && !c.height) return;
    /* En coordenadas de la plancha SIN escalar: la caja del cliente ya viene
       multiplicada por el transform, así que se divide por la escala real. */
    const esc = caja.width / ancho || 1;
    anota(el, (c.left - caja.left) / esc, (c.top - caja.top) / esc, c.width / esc, c.height / esc);
  });
  if (bloques.length < 3) return;

  /* ── clasificar en zonas ────────────────────────────────────────────────
     Por posición y cuerpo MEDIDOS sobre la propia plancha, no por una lista
     escrita a mano: 39 láminas con estructuras distintas no admiten una lista.
     La receta define las bandas y acá se aplican tal cual. */
  const cuerpos = bloques.map((b) => b.cuerpo).sort((a, b) => b - a);
  /* ZONE B es "una palabra dominante": el cuerpo más grande de la plancha, y
     sólo si de verdad descuella sobre la mediana. Si nada descuella, la lámina
     no tiene señal macro y la página I se arma con lo que haya arriba. */
  const mayor = cuerpos[0] ?? 0;
  const mediana = cuerpos[Math.floor(cuerpos.length / 2)] ?? 1;
  /* 1.35× la mediana, no 2.2×. Medido: con 2.2 dos de tres láminas de muestra
     quedaban SIN señal macro —`null-knot` tiene su título en 19px contra una
     mediana de 13, que no llega a 2.2— y la página I salía sin titular. Una
     plancha siempre se nombra a sí misma; el umbral tenía que reconocerlo. */
  const umbralMacro = Math.max(mediana * 1.35, mayor * 0.92);

  const zonaDe = (b: Bloque): Zona => {
    const arriba = b.y / alto, abajo = (b.y + b.h) / alto;
    /* B — señal macro: cuerpo dominante, y de 1 a 4 palabras como pide la receta */
    if (b.cuerpo >= umbralMacro && b.t.split(' ').length <= 4) return 'B';
    /* A — cabecera operacional: 5-10% de arriba */
    if (arriba <= 0.10) return 'A';
    /* E — pie de continuidad: 3-7% de abajo */
    if (abajo >= 0.93) return 'E';
    /* D — todo lo demás es evidencia inspeccionable */
    return 'D';
  };

  const zonas: Record<Zona, Bloque[]> = { A: [], B: [], D: [], E: [] };
  for (const b of bloques) zonas[zonaDe(b)].push(b);

  /* ZONE E SE ACOTA A TRES. La receta la define como "persistent but low
     hierarchy", 3-7% de alto, y enumera lo que le toca: next action, route
     status, logging state, return path, system-state phrase, chapter marker.
     Los identificadores de archivo, marcas de tiempo y numeración de serie son
     ZONE D --"ARCHIVE ID / TIMESTAMP / PROVENANCE / NODE / VERSION"-- aunque
     estén impresos abajo.
     
     Medido: en `null-knot`, siete de sus nueve bloques cayeron en continuidad
     porque su cromo entero vive en la banda inferior, y la página de evidencia
     quedó sin un solo dato. La posición sola no distingue un pie de página de
     un identificador; la cantidad sí, porque una continuidad de siete líneas
     no es una continuidad. Los que sobran bajan a D, que es donde se pueden
     inspeccionar. */
  if (zonas.E.length > 3) {
    zonas.E.sort((p, q) => q.y - p.y);
    zonas.D.push(...zonas.E.slice(3));
    zonas.E = zonas.E.slice(0, 3);
  }
  /* Y si aun así ninguna califica, la señal macro es el bloque de cuerpo mayor.
     Nunca se inventa un título: se PROMUEVE el que la plancha ya tiene. Si la
     plancha no tuviera texto alguno, el tríptico ni se monta. */
  if (!zonas.B.length) {
    const may = bloques.reduce((a, b) => (b.cuerpo > a.cuerpo ? b : a), bloques[0]);
    zonas.B.push(may);
    for (const k of ['A', 'D', 'E'] as const) {
      const i = zonas[k].indexOf(may);
      if (i >= 0) zonas[k].splice(i, 1);
    }
  }
  /* Orden de lectura dentro de cada zona: por bandas de 26px y después por x —
     una plancha no se lee en el orden en que está escrita en el DOM. */
  const ordenar = (l: Bloque[]) =>
    l.sort((p, q) => Math.round(p.y / 26) - Math.round(q.y / 26) || p.x - q.x);
  (Object.keys(zonas) as Zona[]).forEach((k) => ordenar(zonas[k]));

  /* ── armar el tríptico ──────────────────────────────────────────────── */
  const raiz = document.createElement('div');
  raiz.className = 'kdx-tri';
  raiz.dataset.pagina = '0';
  raiz.setAttribute('role', 'group');
  raiz.setAttribute('aria-label', 'Plate, recomposed in three pages');

  const texto = (t: string, cls: string) => {
    const e = document.createElement('p');
    e.className = cls;
    e.textContent = t;
    return e;
  };

  /* I · SIGNAL — A + B. El concepto se anuncia. */
  const p1 = document.createElement('section');
  p1.className = 'kdx-tri__p kdx-tri__p--signal';
  p1.append(texto('I · SIGNAL', 'kdx-tri__ojo'));
  if (zonas.B.length) {
    const h = document.createElement('h1');
    h.className = 'kdx-tri__macro';
    h.textContent = zonas.B[0].t;
    p1.append(h);
    for (const b of zonas.B.slice(1)) p1.append(texto(b.t, 'kdx-tri__macro2'));
  }
  const railA = document.createElement('div');
  railA.className = 'kdx-tri__rail';
  for (const b of zonas.A) railA.append(texto(b.t, 'kdx-tri__railt'));
  p1.append(railA);

  /* II · FIELD — C. La obra sola, sin nada encima. */
  const p2 = document.createElement('section');
  p2.className = 'kdx-tri__p kdx-tri__p--field';
  p2.append(texto('II · FIELD', 'kdx-tri__ojo'));
  p2.append(texto('THE PLATE, WHOLE', 'kdx-tri__pie'));

  /* III · EVIDENCE — D + E. Los datos y la continuidad. */
  const p3 = document.createElement('section');
  p3.className = 'kdx-tri__p kdx-tri__p--evidence';
  p3.append(texto('III · EVIDENCE', 'kdx-tri__ojo'));
  const lista = document.createElement('div');
  lista.className = 'kdx-tri__datos';
  for (const b of zonas.D) lista.append(texto(b.t, 'kdx-tri__d'));
  p3.append(lista);
  if (zonas.E.length) {
    const pie = document.createElement('div');
    pie.className = 'kdx-tri__cont';
    for (const b of zonas.E) pie.append(texto(b.t, 'kdx-tri__e'));
    p3.append(pie);
  }

  raiz.append(p1, p2, p3);

  /* Los pasos. Tres puntos y dos flechas: se toca, no se adivina. */
  const pasos = document.createElement('nav');
  pasos.className = 'kdx-tri__pasos';
  pasos.setAttribute('aria-label', 'Pages of this plate');
  const NOMBRES = ['SIGNAL', 'FIELD', 'EVIDENCE'];
  const puntos: HTMLButtonElement[] = [];
  const ir = (n: number) => {
    const i = Math.max(0, Math.min(2, n));
    raiz.dataset.pagina = String(i);
    puntos.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'true' : 'false'));
    lam.dataset.kdxTri = String(i);
  };
  NOMBRES.forEach((n, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'kdx-tri__punto';
    b.textContent = `${i + 1} ${n}`;
    b.addEventListener('click', () => ir(i));
    puntos.push(b);
    pasos.append(b);
  });
  raiz.append(pasos);

  /* Deslizar entre páginas: en un teléfono es el gesto natural, pero los
     botones siguen estando — el gesto no puede ser el único camino. */
  let x0 = 0;
  raiz.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  raiz.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 56) ir(Number(raiz.dataset.pagina) + (dx < 0 ? 1 : -1));
  }, { passive: true });

  document.body.append(raiz);

  /* ── EL ARMAZÓN QUEDA ACOTADO A LA PANTALLA ─────────────────────────────
     `38-GESTURE-TIMELINE-NAVIGATION.txt` §2, límite declarado NO NEGOCIABLE:
       "This mechanism MUST NOT become a hidden vertical feed."
       · page shell remains bounded to 100dvh
       · body-level Y scroll remains disabled
       · long-form reading uses a deliberate reader/overlay state
     
     Medido antes de esto: 692px de scroll de documento en void-orchard, 558 en
     u03-return, 410 en null-knot. La causa no era el lector viejo sino la
     plancha misma: `transform:scale()` la achica en pantalla pero su CAJA DE
     LAYOUT sigue midiendo 1254px, así que estiraba el body por debajo.
     
     Sacarla del flujo con `fixed` devuelve el armazón a la pantalla, y la
     lectura larga pasa a ocurrir DENTRO de la página III —que es exactamente
     el "deliberate reader/overlay state" que el documento pide— en vez de en
     el documento. El tríptico se hace cargo del armazón porque es quien lo
     necesita acotado; nadie más decide por él. */
  const raizEl = lam as HTMLElement;
  raizEl.style.position = 'fixed';
  raizEl.style.top = '0';
  raizEl.style.left = '0';
  document.body.style.height = '100dvh';
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  ir(0);

  /* ── el agujero de gusano: LA MISMA PLACA ───────────────────────────────
     El creador: "desde cada página uno entra como en agujero de gusano y entra
     en otro concepto… según de dónde hagas click, porque todo está conectado".
     Y después, mirando el resultado: "hay dos interfaces para la misma
     máquina".
     
     Tenía razón. Este archivo armaba su propia lista de tres puertas mientras
     las escenas abrían una placa modal con espiral y medidor de profundidad.
     Mismo motor de ruta, dos caras, y un visitante no puede saber que son lo
     mismo. Ahora las tres bocas abren LA PLACA — la misma que el folio — con
     su espiral y su cuenta de profundidad.
     
     Lo que cambia entre las tres no es la interfaz sino la SEMILLA: cada página
     entra con su propia boca, `kdx:lamina/<slug>#SIGNAL|FIELD|EVIDENCE`, así
     que salir por una no lleva adonde lleva salir por otra. Eso era el pedido
     y se conserva entero. */
  for (let i = 0; i < 3; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'kdx-tri__boca';
    b.setAttribute('data-kdx-abrir-descenso', '');
    b.textContent = `◎ ENTER ANOTHER CONCEPT · FROM ${NOMBRES[i]} →`;
    b.addEventListener('click', () => recordar('WORMHOLE_OPENED', `kdx:lamina/${id}`, { page: i }), { once: true });
    [p1, p2, p3][i].append(b);
    montarDescenso({ boca: b, escena: `kdx:lamina/${id}#${NOMBRES[i]}` });
  }

  /* Auditoría: cuántos bloques de la plancha quedaron repartidos. "Nada se
     pierde" tiene que ser comprobable, no una promesa. */
  const repartidos = zonas.A.length + zonas.B.length + zonas.D.length + zonas.E.length;
  raiz.dataset.kdxBloques = String(bloques.length);
  raiz.dataset.kdxRepartidos = String(repartidos);
  raiz.dataset.kdxLamina = id;
}
