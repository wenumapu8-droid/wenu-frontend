/**
 * KODEX−∞ · PROLOGUE · MÁQUINA DE OBSERVACIÓN
 *
 * VOCABULARIO CONGELADO 2026-08-29 (decision de Ocin). Se elimina IDLE.
 * Razon: KODEX rastrea PRESENCIA, no intencion. Soltar el dedo es un hecho
 * observable -- "dejo de sostener" -- y decaer a DORMANT ahi inferiria que se
 * fue, que es justo lo que el canon 08G prohibe. AWARE dice "sigo viendote",
 * que es lo que el motor efectivamente sabe.
 *
 * `salir` SI cae a DORMANT: que el puntero abandone el campo no es inferencia,
 * es un hecho medido. DESCEND sigue terminal -- soltar despues de DESCEND no
 * vuelve a AWARE, ya pasaste.
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
 *   soltar (dedo)          → AWARE     sigue reconocido: dejo de sostener, no se fue
 *   salir del campo        → DORMANT   la presencia dejo de ser observable
 *   pedir ver más          → INSPECT   lo denso se abre; el ojo baja su agitación
 *                                      para no competir con lo que se está leyendo
 *   cruzar la pupila       → DESCEND   el campo converge al punto de fuga
 *
 * INSPECT y DESCEND NO son funciones paralelas pegadas al costado. El creador lo
 * pidió por nombre: «deberían formar parte del mismo modelo causal», porque las
 * escenas siguientes van a heredar el CONTRATO DE ESTADOS, no una colección de
 * hacks independientes. Por eso viven acá, con sus transiciones declaradas:
 *
 *   INSPECT sólo se alcanza desde AWARE / LOCK / TRACK — no se inspecciona algo
 *   que el sistema todavía no reconoció. Al cerrarlo se vuelve al estado que se
 *   traía, no a un genérico.
 *
 *   DESCEND es TERMINAL: una vez comprometido, ninguna entrada lo revierte. Un
 *   descenso que se cancela solo porque el dedo se movió no sería un descenso.
 *
 * No hay temporizadores que finjan vida: sin entrada, el sistema cae a DORMANT
 * y se queda ahí. La vida la trae quien mira. Eso es lo que hace que la escena
 * observe al visitante y no al revés.
 */

export type Estado = 'DORMANT' | 'AWARE' | 'LOCK' | 'TRACK' | 'INSPECT' | 'DESCEND';

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
  /** cuántas veces se pidió ver lo denso */
  inspecciones: number;
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
    inspecciones: 0,
  };

  const oyentes: Oyente[] = [];
  const emitir = () => { for (const o of oyentes) o(pulso); };

  let sosteniendo = false;
  let tLock: number | null = null;
  let ultX = 0, ultY = 0;
  let dentro = false;
  /* EN TACTIL NO EXISTE EL HOVER.
     La primera version modelaba la entrada como un puntero de escritorio: la
     presencia dependia de estar «dentro», y el navegador dispara pointerleave
     inmediatamente despues de pointerup en un toque. Resultado medido en un
     viewport tactil: un tap encendia y apagaba en el mismo gesto, y la escena
     quedaba muerta en el telefono — que es justamente donde el creador la
     prueba. Con dedo la presencia es DELIBERADA: se enciende al tocar y se
     queda hasta que el visitante toca fuera o abandona la escena. */
  let tactil = false;

  /* Desde dónde se puede alcanzar cada estado. Declararlo evita que el sistema
     entre a INSPECT desde DORMANT —inspeccionar sin haber sido reconocido— o
     que salga de DESCEND, que es terminal. */
  const ALCANZABLE: Record<Estado, Estado[]> = {
    DORMANT: ['AWARE'],
    AWARE: ['LOCK', 'TRACK', 'INSPECT', 'DESCEND', 'DORMANT'],
    /* Soltar desde cualquiera de estos vuelve a AWARE, no a DORMANT: el
       gesto termino, la presencia no. Salir del campo si baja a DORMANT. */
    LOCK: ['TRACK', 'AWARE', 'INSPECT', 'DESCEND', 'DORMANT'],
    TRACK: ['LOCK', 'AWARE', 'INSPECT', 'DESCEND', 'DORMANT'],
    INSPECT: ['AWARE', 'LOCK', 'TRACK', 'DESCEND', 'DORMANT'],
    DESCEND: [],
  };

  let previo: Estado = 'DORMANT';

  const fijar = (e: Estado) => {
    if (pulso.estado === e) return;
    if (!ALCANZABLE[pulso.estado].includes(e)) return;
    if (e === 'INSPECT') previo = pulso.estado;
    pulso.estado = e;
    raiz.dataset.kdxObs = e;                       // el CSS reacciona a esto
    if (e === 'LOCK') pulso.locks += 1;
    if (e === 'INSPECT') pulso.inspecciones += 1;
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
    /* Mientras se lee o se desciende, el puntero no reescribe el estado: el
       sistema está en otra cosa. Sin esto, mover el dedo sobre el inspector lo
       cerraría de facto volviendo a TRACK. */
    if (pulso.estado === 'INSPECT' || pulso.estado === 'DESCEND') return;
    if (sosteniendo && (pulso.estado === 'LOCK' || pulso.estado === 'TRACK') && Math.hypot(dx, dy) > 0.012) fijar('TRACK');
    /* DORMANT tiene que romperse aunque ya se este sosteniendo: si no, un toque
       rapido entra por `sostener` con `sosteniendo` ya en true y ninguna rama
       llegaba a encender AWARE. */
    else if (pulso.estado === 'DORMANT') fijar('AWARE');
  };

  const sostener = (cx: number, cy: number) => {
    sosteniendo = true;
    entrar(cx, cy);
    tLock = window.setTimeout(() => { if (sosteniendo) fijar('LOCK'); }, MS_PARA_LOCK);
  };

  const soltar = () => {
    sosteniendo = false;
    if (tLock) { clearTimeout(tLock); tLock = null; }
    /* Con dedo, soltar NO es marcharse: el sistema sigue reconociendo la
       presencia. Con puntero si, porque el cursor sigue en pantalla y el hover
       expresa la intencion por si mismo. */
    fijar('AWARE');
  };

  const salir = () => {
    dentro = false; sosteniendo = false;
    if (tLock) { clearTimeout(tLock); tLock = null; }
    /* Salir del campo NO es inferencia: el puntero se fue, es medible.
       Por eso aca si se cae a DORMANT y no a AWARE. */
    fijar('DORMANT');
  };

  raiz.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' && !sosteniendo) return;   // sin dedo apoyado no hay rastro
    entrar(e.clientX, e.clientY);
  }, { passive: true });
  raiz.addEventListener('pointerdown', (e) => {
    tactil = e.pointerType === 'touch';
    sostener(e.clientX, e.clientY);
  });
  raiz.addEventListener('pointerup', soltar);
  raiz.addEventListener('pointercancel', soltar);
  raiz.addEventListener('pointerleave', (e) => {
    /* En tactil, pointerleave llega pegado al pointerup y significa «levante el
       dedo», no «me fui». Ignorarlo es lo que mantiene viva la escena en el
       telefono. */
    if ((e as PointerEvent).pointerType === 'touch') return;
    salir();
  });
  /* La salida deliberada en tactil: tocar fuera de la escena la devuelve a
     reposo. Es simetrico con encenderla tocando dentro. */
  document.addEventListener('pointerdown', (e) => {
    if (!tactil) return;
    if (!raiz.contains(e.target as Node)) salir();
  }, true);

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
    /* INSPECT conserva foco alto pero no total: el ojo sigue reconociendo, sólo
       baja su agitación para no competir con lo que se está leyendo.
       DESCEND lo lleva a 1: todo converge al punto de fuga. */
    const objetivoFoco = pulso.estado === 'DESCEND' ? 1
      : pulso.estado === 'INSPECT' ? 0.72
      : (pulso.estado === 'LOCK' || pulso.estado === 'TRACK') ? 1
      : (dentro ? 0.34 : 0);
    pulso.foco += (objetivoFoco - pulso.foco) * 0.08;
    pulso.energia *= 0.94;
    if (!dentro && pulso.presencia < 0.02
        && pulso.estado !== 'DORMANT' && pulso.estado !== 'INSPECT' && pulso.estado !== 'DESCEND') fijar('DORMANT');
    emitir();
    raf = requestAnimationFrame(tic);
  };
  raf = requestAnimationFrame(tic);

  raiz.dataset.kdxObs = 'DORMANT';

  return {
    pulso,
    /* La escena pide transiciones por nombre; la máquina decide si son legales.
       Así INSPECT y DESCEND entran por la misma puerta que el resto. */
    inspeccionar() { fijar('INSPECT'); },
    cerrarInspeccion() { fijar(previo === 'INSPECT' ? 'AWARE' : previo); },
    descender() { fijar('DESCEND'); },
    escuchar(o: Oyente) { oyentes.push(o); return () => { const i = oyentes.indexOf(o); if (i >= 0) oyentes.splice(i, 1); }; },
    destruir() { cancelAnimationFrame(raf); },
  };
}
