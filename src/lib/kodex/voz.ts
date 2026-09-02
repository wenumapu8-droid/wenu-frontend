/**
 * KODEX−∞ · LA VOZ — el punto rojo habla.
 *
 * Decision del creador (2026-08-27): el punto rojo es la IA del sistema, con
 * voz de mujer, que lee y guia el viaje. Estaba especificada en el plan desde
 * entonces y nunca se construyo.
 *
 * COMO SUENA: `SpeechSynthesis` del navegador, no un servicio externo. Sin
 * costo por visitante, sin API, funciona sin conexion, y no depende de que
 * ningun proveedor siga existiendo -- eso ultimo importa: coincide con el
 * Protocolo de Perpetuidad (canon §7).
 *
 * QUE DICE: SOLO lee texto que ya esta en pantalla. Nunca dice algo que el
 * visitante no pueda leer. Esa regla no es estetica: hace la voz verificable
 * (se puede comprobar contra el DOM) y accesible (no esconde informacion en
 * un canal que algunos no reciben).
 *
 * CUANDO: al entrar a una escena y al cambiar de estado. Nada mas. El silencio
 * es material activo del canon (§8 del Golden Scene): no se llena.
 *
 * NUNCA ARRANCA SOLA. Respeta la eleccion que el visitante ya hizo en la
 * puerta -- `sessionStorage['kx-audio']`, que escribe el velo del umbral. Si
 * ahi eligio silencio, la voz no existe. Tampoco habla si el visitante pidio
 * menos movimiento (`prefers-reduced-motion`), porque quien pide calma no
 * quiere que le hablen de golpe.
 */

const CLAVE_AUDIO = 'kx-audio';
const CLAVE_VOZ = 'kdx-voz';

type Estado = 'idle' | 'aware' | 'locked' | 'active' | 'transitionOut';

/** Lo que la voz dice al cruzar a cada estado. Corto, escaso, del sistema
 *  -- nunca del visitante. La Copy Bible prohibe inferir emocion, identidad
 *  o conciencia de quien mira. */
const VOZ_ESTADO: Partial<Record<Estado, string>> = {
  aware: 'Signal detected.',
  locked: 'Pattern locked.',
  active: 'The archive is listening.',
};

let vozElegida: SpeechSynthesisVoice | null = null;
let ultimoEstado = '';
let armada = false;

/** ¿El visitante acepto sonido en la puerta? Sin un si explicito, no hay voz. */
function sonidoPermitido(): boolean {
  try {
    if (sessionStorage.getItem(CLAVE_AUDIO) === 'off') return false;
    if (localStorage.getItem(CLAVE_VOZ) === 'off') return false;
  } catch {
    return false;                       // sin acceso a storage, no se asume que si
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Elige voz femenina del catalogo del sistema, en ingles (el copy de KODEX
 * esta en ingles). Si no hay ninguna marcada como femenina, cae a la primera
 * voz inglesa disponible: mejor una voz que ninguna. Si no hay ninguna, la
 * voz simplemente no existe y nada se rompe.
 */
function elegirVoz(): SpeechSynthesisVoice | null {
  const voces = speechSynthesis.getVoices();
  if (!voces.length) return null;
  const ingles = voces.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const pista = /female|samantha|victoria|karen|moira|tessa|fiona|serena|zira|aria/i;
  return ingles.find((v) => pista.test(v.name)) || ingles[0] || voces[0];
}

/** Dice una frase. Corta lo anterior: la voz no se acumula ni se pisa. */
function decir(texto: string) {
  if (!texto) return;

  /* EL SUBTITULO NO DEPENDE DEL AUDIO.
   *
   * Si el subtitulo viviera dentro del `if (sonidoPermitido())`, quien no
   * oye -- por sordera, por auriculares ausentes, por haber elegido silencio
   * en la puerta -- perderia la narracion entera. La Oracle quedaria hablando
   * solo para una parte de los visitantes.
   *
   * El brief pide subtitulos diegeticos; la accesibilidad pide que lo dicho
   * exista tambien escrito. Las dos cosas se cumplen igual: el texto se
   * muestra SIEMPRE, y lo unico que el consentimiento de audio gobierna es
   * si ademas suena.
   *
   * `silenciarVoz()` sigue apagando las dos: cuando el visitante pide que se
   * calle, se calla del todo. */
  /* El silencio permanente gana sobre todo, incluido el subtitulo. */
  try { if (localStorage.getItem(CLAVE_VOZ) === 'off') return; } catch { /* sin storage: sigue */ }

  subtitular(texto);

  if (!sonidoPermitido()) return;
  if (!('speechSynthesis' in window)) return;

  vozElegida = vozElegida || elegirVoz();
  if (!vozElegida) return;

  speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.voice = vozElegida;
  frase.rate = 0.86;      // pausada, ritual, no locutora de aeropuerto
  frase.pitch = 0.94;
  frase.volume = 0.72;
  speechSynthesis.speak(frase);
}

/**
 * Lee el titulo de la escena TAL COMO ESTA EN PANTALLA. Si no hay titulo
 * visible, no dice nada: la voz nunca inventa contenido.
 */
/**
 * La memoria del viaje, leida del DOM.
 *
 * En RETURN la escena MUESTRA la firma de ruta y el regimen dominante --
 * los publica el campo persistente en el <html>. La voz los lee de ahi y
 * no de un estado interno, por la regla de la casa: SOLO se dice lo que el
 * visitante puede leer. Una voz que sabe mas que la pantalla esconde
 * informacion en un canal que no todos reciben.
 */
function leerMemoriaDelViaje(): string | null {
  const r = document.documentElement;
  const firma = r.dataset.kdxFenotipo;
  const dom = r.dataset.kdxDominante;
  if (!firma) return null;
  const pasos = firma.split('·')[0].length;
  /* Se narra lo que el recorrido HIZO, nunca lo que el visitante es. El
     canon 08G prohibe inferir identidad: "recorriste seis" es un hecho,
     "sos una persona cosmologica" seria perfilado. */
  const cuantos = `You crossed ${pasos} regimes.`;
  return dom ? `${cuantos} ${dom.toLowerCase()} left the deepest trace.` : cuantos;
}

function leerTituloVisible(raiz: Element): string {
  const t = raiz.querySelector('[data-kdx-titulo] h1, .kdx-tt__h, h1');
  const texto = (t?.getAttribute('aria-label') || t?.textContent || '').trim();
  return texto.replace(/\s+/g, ' ');
}

/**
 * Enciende la voz sobre una escena.
 *
 * Devuelve una funcion para apagarla, porque una voz que no se puede callar
 * es una voz que el visitante no controla.
 */
export function montarVoz(raiz: Element): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return () => {};
  }

  // El catalogo de voces del navegador carga tarde. Sin esto, la primera
  // frase sale con la voz por defecto en vez de la elegida.
  const cargarVoces = () => { vozElegida = elegirVoz(); };
  cargarVoces();
  speechSynthesis.addEventListener('voiceschanged', cargarVoces);

  /* La voz NO habla hasta que el visitante toque algo. No es una precaucion
     nuestra: los navegadores bloquean el audio sin gesto previo, y forzarlo
     produce un fallo silencioso que parece un bug. Se arma en el primer
     gesto real y ahi recien saluda la escena. */
  const armar = () => {
    if (armada) return;
    armada = true;
    const titulo = leerTituloVisible(raiz);
    if (titulo) decir(titulo);
  };
  window.addEventListener('pointerdown', armar, { once: true, passive: true });
  window.addEventListener('keydown', armar, { once: true });

  // Habla cuando el estado cambia, nunca en medio de una escena quieta.
  const obs = new MutationObserver(() => {
    const estado = (raiz as HTMLElement).dataset.kdxEstado || '';
    if (!estado || estado === ultimoEstado) return;
    ultimoEstado = estado;
    if (!armada) return;
    const frase = VOZ_ESTADO[estado as Estado];
    if (frase) decir(frase);
  });
  obs.observe(raiz, { attributes: true, attributeFilter: ['data-kdx-estado'] });

  /* LA VOZ NARRA EL VIAJE, no solo la escena.
   *
   * El campo publica el atractor en <html data-kdx-atractor>. Al cambiar de
   * regimen la voz lo nombra; al llegar a RETURN lee la memoria del
   * recorrido, que es la unica escena donde la memoria ES el contenido.
   *
   * Se observa el <html> y no la escena porque el campo sobrevive al swap
   * de pagina y la escena no: escuchar a la escena seria volver a atarse al
   * ciclo de vida que P0 vino a romper. */
  let ultimoAtractor = '';
  const obsCampo = new MutationObserver(() => {
    const a = document.documentElement.dataset.kdxAtractor || '';
    if (!a || a === ultimoAtractor) return;
    const primero = !ultimoAtractor;
    ultimoAtractor = a;
    if (!armada) return;
    /* En la primera lectura no se anuncia: el visitante acaba de llegar y
       el titulo de la escena ya se dijo. Anunciar dos veces la misma
       llegada suena a error, no a bienvenida. */
    if (primero) return;
    if (a === 'RETURN') {
      const mem = leerMemoriaDelViaje();
      if (mem) { decir(mem); return; }
    }
    decir(a.charAt(0) + a.slice(1).toLowerCase() + '.');
  });
  obsCampo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-kdx-atractor', 'data-kdx-fenotipo'],
  });

  return () => {
    obs.disconnect();
    obsCampo.disconnect();
    speechSynthesis.cancel();
    speechSynthesis.removeEventListener('voiceschanged', cargarVoces);
    window.removeEventListener('pointerdown', armar);
    window.removeEventListener('keydown', armar);
  };
}

/**
 * SUBTITULOS · KDX.ORACLE Brief §1
 *
 * El brief los pide como parte de la diegesis, no como texto de
 * accesibilidad pegado abajo: "subtitles/captions are part of the diegesis,
 * not accessibility text pasted underneath".
 *
 * Que sean diegéticos no los exime de ser accesibles -- al contrario. La voz
 * es un canal que no todos reciben: sin subtitulo, quien no oye pierde
 * narracion. Con subtitulo, lo dicho y lo escrito son el mismo hecho.
 *
 * `aria-live="polite"` y no "assertive": la Oracle interrumpe poco, y un
 * lector de pantalla no deberia cortar lo que el visitante esta leyendo.
 */
function panelSubtitulo(): HTMLElement {
  let el = document.getElementById('kdx-oracle-cc');
  if (el) return el;
  el = document.createElement('p');
  el.id = 'kdx-oracle-cc';
  el.className = 'kdx-oracle-cc';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('data-fuente', 'REAL');
  document.body.appendChild(el);

  const css = document.createElement('style');
  css.textContent = `
    .kdx-oracle-cc{
      position:fixed; left:50%; bottom:clamp(4.6rem,9vh,6.4rem);
      transform:translateX(-50%);
      max-width:min(46ch,86vw); margin:0; padding:.5rem .9rem;
      font-family:var(--kdx-mono,ui-monospace,monospace);
      font-size:clamp(.62rem,1.5vw,.72rem); letter-spacing:.12em;
      line-height:1.7; text-align:center; text-transform:uppercase;
      color:var(--kdx-bone,#f0ede8);
      background:color-mix(in srgb,var(--kdx-obsidian,#0a0a0a) 72%,transparent);
      border-top:1px solid color-mix(in srgb,var(--kdx-red,#FF3833) 34%,transparent);
      z-index:60; pointer-events:none;
      opacity:0; transition:opacity .5s ease;
    }
    .kdx-oracle-cc[data-visible]{opacity:1}
    @media (prefers-reduced-motion:reduce){.kdx-oracle-cc{transition:none}}
  `;
  document.head.appendChild(css);
  return el;
}

let ccTimer = 0;

/** Muestra lo dicho. Se va solo: un subtitulo que se queda es una etiqueta. */
function subtitular(texto: string) {
  const el = panelSubtitulo();
  el.textContent = texto;
  el.setAttribute('data-visible', '');
  clearTimeout(ccTimer);
  /* El tiempo en pantalla sigue al largo de la frase, no a un valor fijo:
     una frase larga leida a velocidad de una corta no se alcanza a leer. */
  ccTimer = window.setTimeout(
    () => el.removeAttribute('data-visible'),
    Math.max(2600, texto.length * 78),
  );
}

/** Silencio permanente, a pedido del visitante. Se recuerda entre visitas. */
export function silenciarVoz() {
  try { localStorage.setItem(CLAVE_VOZ, 'off'); } catch { /* sin storage, igual calla ahora */ }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  /* Callar es callar del todo: si solo se apagara el audio, el subtitulo
     seguiria narrando a alguien que pidio silencio. */
  clearTimeout(ccTimer);
  document.getElementById('kdx-oracle-cc')?.removeAttribute('data-visible');
}

/** ¿Esta hablando ahora? Para que el punto rojo pueda mostrarlo. */
export function vozActiva(): boolean {
  return 'speechSynthesis' in window && speechSynthesis.speaking;
}
