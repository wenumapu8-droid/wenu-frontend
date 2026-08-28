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
  if (!texto || !sonidoPermitido()) return;
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

  return () => {
    obs.disconnect();
    speechSynthesis.cancel();
    speechSynthesis.removeEventListener('voiceschanged', cargarVoces);
    window.removeEventListener('pointerdown', armar);
    window.removeEventListener('keydown', armar);
  };
}

/** Silencio permanente, a pedido del visitante. Se recuerda entre visitas. */
export function silenciarVoz() {
  try { localStorage.setItem(CLAVE_VOZ, 'off'); } catch { /* sin storage, igual calla ahora */ }
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

/** ¿Esta hablando ahora? Para que el punto rojo pueda mostrarlo. */
export function vozActiva(): boolean {
  return 'speechSynthesis' in window && speechSynthesis.speaking;
}
