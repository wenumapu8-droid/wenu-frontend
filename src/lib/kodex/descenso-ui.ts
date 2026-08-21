/**
 * KODEX−∞ · DESCENSO (comportamiento) — el motor de ruta encarnado
 *
 * `ruta.ts` decide. Esto lo pone en pantalla, escribe la memoria y respeta el
 * botón Atrás. Separados a propósito: la decisión se puede medir sin navegador
 * (`scripts/kodex/probar-ruta.mjs`), y la pantalla se puede cambiar sin tocar
 * la decisión.
 *
 * §8 del documento: cada descenso es una entrada real del historial. §18: la
 * orientación es mínima y siempre visible, el mapa completo sólo a pedido.
 */
import { bifurcar, firmaDeRuta, PROFUNDIDAD_CORAZON, type Corpus, type Puerta, type Viaje } from './ruta';
import { recordar, derivados } from './memoria';
import '../../styles/kodex-descenso.css';
import { sonidoProfundidad } from './sonido-montar';
import { atravesarHaciaDentro, montarTravesia, prepararTravesia } from './travesia';
import { respirar, toca, prepararRespiracion } from './respiracion';

/**
 * LA PLACA SE CONSTRUYE ACÁ, no en el markup del componente.
 *
 * El creador lo señaló sin ver el código: "hay dos interfaces para la misma
 * máquina". El descenso desde una escena era un panel modal con espiral y
 * medidor de profundidad; el gusano desde una lámina, una lista de tres
 * puertas dentro de la página. Mismo motor, dos caras, y un visitante no puede
 * saber que son lo mismo.
 *
 * Construyéndola en JavaScript, la misma placa se abre desde un folio y desde
 * una lámina, con la misma espiral y el mismo vocabulario. Una sola máquina,
 * una sola cara. La hoja de estilos viaja con este módulo por la misma razón.
 */
function construirPlaca(escena: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'kdx-desc';
  el.id = 'kdx-descenso';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Descent');
  el.hidden = true;
  el.dataset.escena = escena;
  el.innerHTML = `
    <canvas class="kdx-desc__espiral" aria-hidden="true"></canvas>
    <header class="kdx-desc__cab">
      <button class="kdx-desc__salir" type="button" data-kdx-cerrar-descenso>← ASCEND</button>
      <button class="kdx-desc__instr" type="button" data-kdx-instrumentos
        aria-expanded="false" aria-label="Show instruments">◦</button>
      <p class="kdx-desc__medida" data-kdx-medida hidden>
        <span data-kdx-hondura>DEPTH 0</span><span aria-hidden="true">·</span><span data-kdx-firma>ROUTE 0000</span>
      </p>
    </header>
    <main class="kdx-desc__centro">
      <p class="kdx-desc__ojo" data-kdx-ojo>THE SCENE OPENS</p>
      <h2 class="kdx-desc__aqui" data-kdx-aqui>CHOOSE YOUR DESCENT</h2>
      <p class="kdx-desc__pie-t" data-kdx-sub>Three ways in. None of them is the same for two people.</p>
      <ul class="kdx-desc__puertas" data-kdx-puertas role="list"></ul>
      <p class="kdx-desc__nota" data-kdx-nota></p>
    </main>
    <footer class="kdx-desc__pie">
      <span data-kdx-rastro>NO TRACE YET</span>
      <a class="kdx-desc__corazon" href="/kodex/lab/heart/" hidden data-kdx-corazon>◉ THE HEART →</a>
    </footer>`;
  document.body.append(el);
  return el;
}

const PHI = (1 + Math.sqrt(5)) / 2;
const AUREO = 1 / (PHI * PHI);

const GLIFO: Record<string, string> = { HILO: '⌁', PUENTE: '⌖', HALLAZGO: '✳' };
const COLOR: Record<string, string> = { HILO: '#e8b4bc', PUENTE: '#8ba0c9', HALLAZGO: '#c9a84c' };
const DICE: Record<string, string> = {
  HILO: 'FOLLOW THE THREAD',
  PUENTE: 'CROSS THE FIELD',
  HALLAZGO: 'THE UNREAD ARCHIVE',
};

let corpus: Corpus | null = null;
let cargando: Promise<Corpus> | null = null;

/** El corpus baja UNA vez y sólo cuando alguien decide descender — §11: el
    costo escala con la atención actual, no con el tamaño del archivo. */
function traerCorpus(): Promise<Corpus> {
  if (corpus) return Promise.resolve(corpus);
  cargando ||= fetch('/kodex-content/ramas.json')
    .then((r) => r.json())
    .then((j) => (corpus = { nodos: j.nodos, vecinos: j.vecinos, indice: j.indice }));
  return cargando;
}

/**
 * @param opciones.boca  disparador propio (una lámina pasa el suyo por página)
 * @param opciones.escena  la boca por la que se entra — siembra la firma de
 *   ruta, así que dos bocas distintas del mismo sitio abren ramas distintas
 */
export function montarDescenso(opciones?: { boca?: HTMLElement; escena?: string }) {
  const boca = opciones?.boca
    ?? document.querySelector<HTMLButtonElement>('[data-kdx-abrir-descenso]');
  if (!boca) return;
  const escena = opciones?.escena
    ?? boca.getAttribute('data-kdx-escena')
    ?? document.getElementById('kdx-descenso')?.getAttribute('data-escena')
    ?? 'i';
  /* Una sola placa por documento, compartida por todas las bocas: abrir dos
     modales a la vez no significa nada, y duplicar el canvas de la espiral
     duplicaría su rAF. */
  const placa = document.getElementById('kdx-descenso') ?? construirPlaca(escena);
  placa.dataset.escena = escena;
  const $ = <T extends Element>(s: string) => placa.querySelector<T>(s)!;
  const lista = $<HTMLUListElement>('[data-kdx-puertas]');
  const espiral = $<HTMLCanvasElement>('.kdx-desc__espiral');

  /* El estado del viaje vive acá y sólo acá. `memoria.ts` guarda el hecho de
     haber pasado; la ruta en curso es efímera a propósito — un descenso es una
     bajada, no un documento. */
  let v: Viaje = {
    escena, profundidad: 0, aqui: null, visitados: [],
    firma: 0, memoria: { archiveDepth: 0, routeDiversity: 0, returnCount: 0 },
  };

  const refrescarFirma = () => {
    const d = derivados();
    v.memoria = {
      archiveDepth: d.archiveDepth ?? 0,
      routeDiversity: d.routeDiversity ?? 0,
      returnCount: d.returnCount ?? 0,
    };
    v.firma = firmaDeRuta(escena, v.visitados, v.memoria.returnCount);
  };

  /* ── la espiral: la geometría del motor, dibujada ────────────────────────
     Es la MISMA razón áurea con que `ruta.ts` elige puertas. El radio se
     divide por φ en cada nivel, así que la vuelta que estás pisando se ve
     converger al centro. No ilustra la profundidad: la mide. */
  let animando = 0;
  const dibujarEspiral = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = placa.clientWidth, h = placa.clientHeight;
    espiral.width = w * dpr; espiral.height = h * dpr;
    const g = espiral.getContext('2d');
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pintar = (t: number) => {
      g.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      /* 0.34 y no 0.46: la vuelta más externa entraba justo en el ancho y se
         cortaba contra los bordes, que es lo contrario de converger. */
      const r0 = Math.min(w, h) * 0.34;
      const giro = quieto ? 0 : t / 26000;

      /* Una vuelta por nivel: las ya bajadas quedan tenues, la actual encendida,
         y las que faltan apenas se insinúan. Se ve cuánto queda al corazón. */
      for (let n = 0; n <= PROFUNDIDAD_CORAZON; n++) {
        const r = r0 / Math.pow(PHI, n * 0.62);
        const pasado = n < v.profundidad, ahora = n === v.profundidad;
        g.beginPath();
        for (let k = 0; k <= 220; k++) {
          const a = (k / 220) * Math.PI * 2 + giro * (1 + n * 0.5) + n * 2.399963;
          const rr = r * (1 + 0.045 * Math.sin(a * 5 + n));
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.94;
          k ? g.lineTo(x, y) : g.moveTo(x, y);
        }
        g.closePath();
        /* La espiral es AHORA el único indicador de profundidad: al sacar
           «DEPTH 0 / 7» de la cabecera, el dibujo quedó solo con el trabajo.
           Y con la vuelta actual al 50% de rojo se leía como un lazo suelto en
           vez de como una espiral que converge. Se baja el acento y se sube el
           resto: lo que informa es la FAMILIA de vueltas cerrándose, no una
           sola gritando. */
        g.strokeStyle = ahora ? 'rgba(255,39,51,.30)'
          : pasado ? 'rgba(240,237,232,.20)' : 'rgba(240,237,232,.11)';
        g.lineWidth = ahora ? 1.1 : 1;
        g.stroke();
      }

      /* El corazón, al medio, latiendo más fuerte cuanto más cerca estás. */
      const cerca = v.profundidad / PROFUNDIDAD_CORAZON;
      const pulso = quieto ? 1 : 1 + 0.3 * Math.sin(t / 900);
      g.beginPath();
      g.arc(cx, cy, (3 + cerca * 9) * pulso, 0, Math.PI * 2);
      g.fillStyle = `rgba(255,39,51,${0.2 + cerca * 0.7})`;
      g.fill();

      if (!quieto) animando = requestAnimationFrame(pintar);
    };
    cancelAnimationFrame(animando);
    animando = requestAnimationFrame(pintar);
  };

  /* ── pintar una bifurcación: NODOS, NO ALTERNATIVAS ─────────────────────
     El creador, mirando lo publicado: "necesitamos que la experiencia sea más
     visual y no una app de quién quiere ser millonario, con alternativas y
     textos". Tenía razón y era exacto: tres rectángulos apilados, cada uno con
     su rótulo, su título y su metadato, son un examen de opción múltiple.
     
     `10-ESCONDER-EL-SISTEMA` (2026-08-21) da la forma: "incluso los botones
     que técnicamente necesitamos pueden convertirse visualmente en hotspots,
     anomalías, símbolos, objetos, grietas, NODOS o zonas vivas".
     
     Así que las tres salidas son tres puntos EN LA ESPIRAL. Su posición no es
     decorativa: caen sobre la vuelta de la profundidad actual, separados por el
     ángulo áureo desde la firma de ruta — la misma razón con que el motor las
     eligió. Se ve dónde estás y qué se abre desde ahí, sin una sola caja.
     
     El nombre no se muestra hasta que te acercás: "nada se explica antes de
     poder sentirse". Y debajo siguen siendo <button> con su `aria-label`
     completo, porque esconder el sistema no es esconder la accesibilidad. */
  const pintar = (puertas: Puerta[]) => {
    lista.replaceChildren();
    const N = puertas.length || 1;
    puertas.forEach((p, k) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'kdx-n';
      const papel = p.papel || 'HALLAZGO';
      b.dataset.papel = papel;
      b.style.setProperty('--kdx-n-color', COLOR[papel]);

      /* Sobre la vuelta actual, a ángulo áureo desde la firma. */
      const giro = ((v.firma % 1000) / 1000 + k * AUREO) * Math.PI * 2;
      const radio = 34 - v.profundidad * 2.2;            // en % del lado menor
      b.style.setProperty('--kdx-n-x', `${(50 + Math.cos(giro) * radio).toFixed(2)}%`);
      b.style.setProperty('--kdx-n-y', `${(50 + Math.sin(giro) * radio * 0.92).toFixed(2)}%`);
      /* Late más rápido cuanto más hondo: la profundidad hecha pulso. */
      b.style.setProperty('--kdx-n-pulso', `${(4.2 / (1 + v.profundidad * 0.3)).toFixed(2)}s`);

      const t = p.nodo.sinNombre ? `UNNAMED · ${p.nodo.id.slice(5, 13)}` : p.nodo.titulo;
      const punto = document.createElement('i');
      punto.className = 'kdx-n__punto';
      punto.setAttribute('aria-hidden', 'true');
      const nombre = document.createElement('span');
      nombre.className = 'kdx-n__nombre';
      nombre.textContent = t;
      /* El estatus sólo si es excepción — regla ya establecida. */
      if (p.nodo.estatus !== 'VERIFIED' && p.nodo.estatus !== 'CANONICAL') {
        const e = document.createElement('em');
        e.className = 'kdx-n__aviso';
        e.textContent = p.nodo.estatus.replace('_', ' ').toLowerCase();
        nombre.append(e);
      }
      b.append(punto, nombre);
      b.setAttribute('aria-label', `${DICE[papel]}: ${t}. ${p.razon.toLowerCase()}`);

      /* En táctil el primer toque revela y el segundo entra: tocar a ciegas un
         punto sin nombre sería adivinar adónde vas. Con puntero, acercarse ya
         revela y un click entra. */
      b.addEventListener('click', (ev) => {
        const revelado = b.dataset.abierto === 'si';
        if (!revelado && matchMedia('(hover:none)').matches) {
          ev.preventDefault();
          lista.querySelectorAll<HTMLElement>('.kdx-n').forEach((x) => delete x.dataset.abierto);
          b.dataset.abierto = 'si';
          return;
        }
        elegir(p, puertas);
      });
      li.append(b);
      lista.append(li);
    });
    lista.dataset.n = String(N);
  };

  const rotular = () => {
    $('[data-kdx-hondura]').textContent = `DEPTH ${v.profundidad} / ${PROFUNDIDAD_CORAZON}`;
    $('[data-kdx-firma]').textContent = `ROUTE ${v.firma.toString(16).slice(0, 4).toUpperCase()}`;
    $('[data-kdx-rastro]').textContent = v.visitados.length
      ? `${v.visitados.length} NODE${v.visitados.length > 1 ? 'S' : ''} BEHIND YOU`
      : 'NO TRACE YET';
    const enCorazon = v.profundidad >= PROFUNDIDAD_CORAZON;
    ($('[data-kdx-corazon]') as HTMLElement).hidden = !enCorazon;
    /* El ojo NO numera la capa. El manifiesto del creador nombra «LAYER 1»
       entre lo que el visitante no necesita ver, y la espiral ya lo dice sin
       palabras: una vuelta más cerrada por nivel. La palabra sobraba encima
       del dibujo que la explica. */
    $('[data-kdx-ojo]').textContent = enCorazon ? 'THE CENTRE' : '';
    $('[data-kdx-nota]').textContent = enCorazon
      ? 'Seven layers. This is the middle. The way out is the way you came.'
      : 'Each door records what you chose and what you left. Two people never descend the same.';
  };

  const abrirNivel = async () => {
    const c = await traerCorpus();
    refrescarFirma();
    rotular();
    /* El sonido baja con vos: cuanto más hondo, más cerrado el aire. Es el
       mismo dato que dibuja la espiral, sonando. */
    sonidoProfundidad(v.profundidad, PROFUNDIDAD_CORAZON);
    dibujarEspiral();
    if (v.profundidad >= PROFUNDIDAD_CORAZON) {
      lista.replaceChildren();
      $('[data-kdx-aqui]').textContent = 'YOU REACHED THE HEART';
      return;
    }
    pintar(bifurcar(v, c));
  };

  const elegir = (p: Puerta, todas: Puerta[]) => {
    /* §20: el evento de memoria guarda la elección CON las alternativas que
       estaban a la vista. Sólo números y identificadores del propio KODEX —
       nada sobre la persona. */
    recordar('ROUTE_CHOICE', p.nodo.id, {
      depth: v.profundidad,
      offered: todas.length,
      chosen: todas.indexOf(p),
    });
    v = {
      ...v, profundidad: v.profundidad + 1, aqui: p.nodo.id,
      visitados: [...v.visitados, p.nodo.id],
    };
    $('[data-kdx-aqui]').textContent = p.nodo.sinNombre
      ? `UNNAMED SPECIMEN · ${p.nodo.id.slice(5, 13)}` : p.nodo.titulo;
    $('[data-kdx-sub]').textContent = p.nodo.sinNombre
      ? 'An entry the archive holds but has not named. It is still yours to read.'
      : `${p.razon.toLowerCase()} — and it opens further.`;
    /* SE ATRAVIESA, no se cambia de contenido. El creador: "esto es un loop,
       como un black hole o agujeros de gusano, que entrás hacia dentro cada
       vez". El túnel es el feedback pass que ya existía en el repo, no una
       animación nueva. */
    void atravesarHaciaDentro(560);
    /* Cada dos niveles se respira: aparece una obra suya a pantalla completa,
       sin nada encima, y el descenso espera a que la persona siga. Es la
       ACTIVATOR PLATE de §20 — "respiration + authorial encounter". */
    if (toca(v.profundidad)) {
      void respirar(v.firma, v.profundidad);
    }
    /* Historial real: Atrás sube un nivel, como debe ser. */
    history.pushState({ kdx: v.profundidad, escena }, '', `#descent-${v.profundidad}`);
    abrirNivel();
  };

  const abrir = () => {
    /* El shader se pide ACÁ, no al descender: abrir la placa ya es atención
       declarada, y compilarlo tarda casi tres segundos en producción. */
    prepararTravesia();
    prepararRespiracion();
    placa.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    recordar('DESCENT_OPENED', `scene-${escena}`, { depth: 0 });
    history.pushState({ kdx: 0, escena }, '', '#descent-0');
    abrirNivel();
    $<HTMLButtonElement>('[data-kdx-cerrar-descenso]').focus();
  };

  const cerrar = () => {
    placa.hidden = true;
    document.documentElement.style.overflow = '';
    cancelAnimationFrame(animando);
    boca.focus();
  };

  /* Subir un nivel: la placa no se cierra, se retrae. El documento pide que el
     retorno sea parte del viaje, no una salida de emergencia. */
  const subir = () => {
    if (v.profundidad === 0) { cerrar(); return; }
    v = {
      ...v, profundidad: v.profundidad - 1,
      visitados: v.visitados.slice(0, -1),
      aqui: v.visitados[v.visitados.length - 2] ?? null,
    };
    recordar('ROUTE_ASCENT', v.aqui ?? `scene-${escena}`, { depth: v.profundidad });
    $('[data-kdx-aqui]').textContent = 'CHOOSE AGAIN';
    abrirNivel();
  };

  /* Los instrumentos, a pedido. "Puede aparecer ocasionalmente como
     microdetalle estético —como mirar los instrumentos de una nave— pero no
     puede dominar la escena." Un punto que se toca y aparece la lectura. */
  const instr = placa.querySelector<HTMLButtonElement>('[data-kdx-instrumentos]');
  const medida = placa.querySelector<HTMLElement>('[data-kdx-medida]');
  instr?.addEventListener('click', () => {
    const abierto = instr.getAttribute('aria-expanded') === 'true';
    instr.setAttribute('aria-expanded', String(!abierto));
    if (medida) medida.hidden = abierto;
    instr.textContent = abierto ? '◦' : '◉';
  });

  /* ── LA BOCA SE UBICA MIDIENDO, NO CON UN NÚMERO ────────────────────────
     Se movió dos veces por número fijo —58px y después 120px— y las dos veces
     cayó encima de otra cosa: primero de la barra del mazo, después del CTA
     `SPECIMEN DATA` de la escena, al 100%. Un número mágico sólo acierta hasta
     que alguien agrega un control abajo.
     
     Ahora mira qué hay realmente en la franja inferior y se pone ARRIBA de lo
     más alto que encuentre. Es la misma solución que ya usa la navegación de
     las láminas: medir la caja real en vez de suponerla. Se recalcula al rotar
     y cuando las fases terminan de revelar. */
  const ubicar = () => {
    /* Se sube hasta quedar LIBRE, comprobándolo. La versión anterior sólo
       miraba elementos `fixed` y `SPECIMEN DATA` no lo es: está en el flujo
       normal de la escena, así que el barrido lo ignoraba y la boca seguía
       encima al 100%.
       
       Acá no se clasifica nada: se prueba. Se baja la boca al piso, se mide
       contra todo lo que tenga texto visible, y si choca sube 8px y se vuelve
       a medir. Máximo 40 pasos —320px— para no subirse a la obra. */
    boca.style.bottom = `calc(16px + env(safe-area-inset-bottom,0px))`;
    const choca = () => {
      const m = boca.getBoundingClientRect();
      for (const el of document.querySelectorAll<HTMLElement>('body *')) {
        if (el === boca || boca.contains(el) || el.contains(boca)) continue;
        if (!el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true })) continue;
        const propio = [...el.childNodes].filter((n) => n.nodeType === 3)
          .map((n) => n.textContent?.trim() ?? '').join('').length;
        if (propio < 2) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        const ox = Math.min(m.right, r.right) - Math.max(m.left, r.left);
        const oy = Math.min(m.bottom, r.bottom) - Math.max(m.top, r.top);
        if (ox > 2 && oy > 2) return true;
      }
      return false;
    };
    for (let k = 0; k < 40 && choca(); k++) {
      const y = 16 + (k + 1) * 8;
      boca.style.bottom = `calc(${y}px + env(safe-area-inset-bottom,0px))`;
    }
  };

  montarTravesia();
  ubicar();
  addEventListener('resize', ubicar);
  /* Las fases revelan controles con retraso; sin este segundo pase la boca se
     ubica contra una franja que todavía no está completa. */
  setTimeout(ubicar, 1200);
  setTimeout(ubicar, 3600);

  boca.addEventListener('click', abrir);
  /* Cerrar es DIRECTO, y además se corrige el historial.
     Antes el botón sólo hacía `history.back()` y confiaba en que el popstate
     cerrara. Medido en una lámina: la placa quedaba abierta y bloqueaba todo lo
     de atrás —el segundo paso del tríptico no se podía tocar—. Desde un folio
     funcionaba de casualidad, porque la escena tenía historial propio.
     Un modal tiene que cerrarse cuando se toca su botón de cerrar, sin
     depender de qué haya en la pila.

     Y NO rebobina el historial. El primer intento devolvía las entradas que el
     descenso había empujado, y medido se pasaba de largo: sacaba al visitante
     de la lámina entera. Además contradice el canon — §8 del documento de
     navegación pide que cada descenso SEA una entrada real del historial, así
     que Atrás debe poder recorrer la bajada. Cerrar la placa no es deshacer el
     viaje: es guardarla. */
  $('[data-kdx-cerrar-descenso]').addEventListener('click', () => cerrar());
  addEventListener('popstate', (e) => {
    if (placa.hidden) return;
    const d = (e.state as { kdx?: number } | null)?.kdx;
    if (typeof d !== 'number') { cerrar(); return; }
    while (v.profundidad > d) subir();
  });
  addEventListener('keydown', (e) => {
    if (placa.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); history.back(); }
    /* 1–3 eligen puerta: el teclado no es una segunda clase. */
    const n = Number(e.key);
    if (n >= 1 && n <= 3) lista.querySelectorAll<HTMLButtonElement>('.kdx-p')[n - 1]?.click();
  });
  addEventListener('resize', () => { if (!placa.hidden) dibujarEspiral(); });
}
