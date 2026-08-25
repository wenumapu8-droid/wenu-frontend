/**
 * KODEX−∞ · PROLOGUE · MÁQUINA DE OBSERVACIÓN
 *
 * La lámina t01-02 dibuja tres etiquetas —LOCK, TRACK, IDLE— dentro de un panel
 * llamado «01. SCAN STATES». En la plancha son rótulos. Acá son el estado real
 * del sistema, y todo lo demás deriva de ellos: la intensidad del ojo, la
 * convergencia de la pupila, la amplitud de la señal, la aparición del título y
 * qué módulos existen en pantalla.
 *
 * El criterio del creador: «si el mismo resultado se lograra exportando la
 * lámina a PNG, no has construido KODEX». Un PNG no puede tener estado. Esto sí.
 *
 * ENTRADA → ESTADO → CONSECUENCIA VISIBLE
 *
 *   sin presencia          → DORMANT   el ojo apenas late, deriva lento
 *   puntero/dedo entra     → AWARE     la pupila se dilata, el limbo enciende,
 *                                      la señal sube, el título empieza a formarse
 *   sostener               → LOCK      la pupila converge, la señal se estabiliza,
 *                                      aparecen los fragmentos de escaneo
 *   mover mientras sostiene→ TRACK     el iris SIGUE al puntero, la onda modula
 *                                      con la velocidad del gesto
 *   soltar / salir         → IDLE      decae de vuelta, con memoria del último lock
 *
 * No hay temporizadores que finjan vida: sin entrada, el sistema cae a DORMANT
 * y se queda ahí. La vida la trae quien mira. Eso es lo que hace que la escena
 * observe al visitante y no al revés.
 */

export type Estado = 'DORMANT' | 'AWARE' | 'LOCK' | 'TRACK' | 'IDLE';

export type Pulso = {
  estado: Estado;
  /** 0..1 — cuánta presencia percibe el sistema. Gobierna brillo e intensidad. */
  presencia: number;
  /** 0..1 — qué tan convergida está la pupila. 1 = lock total. */
  foco: number;
  /** posición del objetivo en coordenadas normalizadas -1..1 respecto del centro */
  objetivo: { x: number; y: number };
  /** 0..1 — energía del gesto; alimenta la amplitud de la onda */
  energia: number;
  /** cuántas veces se ha alcanzado LOCK en esta sesión: es memoria, no adorno */
  locks: number;
};

type Oyente = (p: Pulso) => void;

const MS_PARA_LOCK = 420;

export function crearObservacion(raiz: HTMLElement) {
  const pulso: Pulso = {
    estado: 'DORMANT',
    presencia: 0,
    foco: 0,
    objetivo: { x: 0, y: 0 },
    energia: 0,
    locks: 0,
  };

  const oyentes: Oyente[] = [];
  const emitir = () => { for (const o of oyentes) o(pulso); };

  let sosteniendo = false;
  let tLock: number | null = null;
  let ultX = 0, ultY = 0;
  let dentro = false;

  const fijar = (e: Estado) => {
    if (pulso.estado === e) return;
    pulso.estado = e;
    raiz.dataset.kdxObs = e;                       // el CSS reacciona a esto
    if (e === 'LOCK') pulso.locks += 1;
    raiz.dispatchEvent(new CustomEvent('kdx:observacion', { detail: { ...pulso }, bubbles: true }));
    emitir();
  };

  const normalizar = (cx: number, cy: number) => {
    const r = raiz.getBoundingClientRect();
    return {
      x: Math.max(-1, Math.min(1, (cx - (r.left + r.width / 2)) / (r.width / 2))),
      y: Math.max(-1, Math.min(1, (cy - (r.top + r.height / 2)) / (r.height / 2))),
    };
  };

  const entrar = (cx: number, cy: number) => {
    dentro = true;
    const n = normalizar(cx, cy);
    const dx = n.x - ultX, dy = n.y - ultY;
    ultX = n.x; ultY = n.y;
    pulso.objetivo = n;
    pulso.energia = Math.min(1, pulso.energia * 0.72 + Math.hypot(dx, dy) * 5.5);
    if (sosteniendo && pulso.estado === 'LOCK' && Math.hypot(dx, dy) > 0.012) fijar('TRACK');
    else if (!sosteniendo && pulso.estado !== 'LOCK' && pulso.estado !== 'TRACK') fijar('AWARE');
  };

  const sostener = (cx: number, cy: number) => {
    sosteniendo = true;
    entrar(cx, cy);
    tLock = window.setTimeout(() => { if (sosteniendo) fijar('LOCK'); }, MS_PARA_LOCK);
  };

  const soltar = () => {
    sosteniendo = false;
    if (tLock) { clearTimeout(tLock); tLock = null; }
    fijar(dentro ? 'AWARE' : 'IDLE');
  };

  const salir = () => {
    dentro = false; sosteniendo = false;
    if (tLock) { clearTimeout(tLock); tLock = null; }
    fijar('IDLE');
  };

  raiz.addEventListener('pointermove', (e) => entrar(e.clientX, e.clientY), { passive: true });
  raiz.addEventListener('pointerdown', (e) => sostener(e.clientX, e.clientY));
  raiz.addEventListener('pointerup', soltar);
  raiz.addEventListener('pointercancel', soltar);
  raiz.addEventListener('pointerleave', salir);

  /* Teclado: la escena tiene que ser recorrible sin puntero. Flechas mueven el
     objetivo, Espacio/Enter sostiene. No es un añadido de accesibilidad pegado
     al final: es la misma máquina, con otra entrada. */
  raiz.addEventListener('keydown', (e) => {
    const paso = 0.12;
    if (e.key === 'ArrowLeft') { pulso.objetivo.x -= paso; }
    else if (e.key === 'ArrowRight') { pulso.objetivo.x += paso; }
    else if (e.key === 'ArrowUp') { pulso.objetivo.y -= paso; }
    else if (e.key === 'ArrowDown') { pulso.objetivo.y += paso; }
    else if (e.key === ' ' || e.key === 'Enter') { sosteniendo = true; fijar('LOCK'); e.preventDefault(); return; }
    else return;
    e.preventDefault();
    pulso.objetivo.x = Math.max(-1, Math.min(1, pulso.objetivo.x));
    pulso.objetivo.y = Math.max(-1, Math.min(1, pulso.objetivo.y));
    pulso.energia = Math.min(1, pulso.energia + 0.3);
    dentro = true;
    fijar(sosteniendo ? 'TRACK' : 'AWARE');
  });
  raiz.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') soltar(); });

  /* Integración continua del estado. Sin entrada la presencia decae y el
     sistema vuelve a dormirse: la escena no finge actividad cuando no hay nadie. */
  let raf = 0;
  const tic = () => {
    const objetivoPresencia = dentro ? 1 : 0;
    pulso.presencia += (objetivoPresencia - pulso.presencia) * 0.06;
    const objetivoFoco = (pulso.estado === 'LOCK' || pulso.estado === 'TRACK') ? 1 : (dentro ? 0.34 : 0);
    pulso.foco += (objetivoFoco - pulso.foco) * 0.08;
    pulso.energia *= 0.94;
    if (!dentro && pulso.presencia < 0.02 && pulso.estado !== 'DORMANT') fijar('DORMANT');
    emitir();
    raf = requestAnimationFrame(tic);
  };
  raf = requestAnimationFrame(tic);

  raiz.dataset.kdxObs = 'DORMANT';

  return {
    pulso,
    escuchar(o: Oyente) { oyentes.push(o); return () => { const i = oyentes.indexOf(o); if (i >= 0) oyentes.splice(i, 1); }; },
    destruir() { cancelAnimationFrame(raf); },
  };
}
