/**
 * KDX · CONTRATOS DE TRANSICIÓN
 *
 * Hasta acá el corredor tenía UNA transición para todo: el mismo velo, la
 * misma duración, entre cualquier par de escenas. El 08A dice que eso está
 * mal, y da la razón: "Do not use transitions only as page-change camouflage".
 * Cruzar de THRESHOLD a PROLOGUE significa RECONOCIMIENTO; cruzar de MACHINE a
 * COSMOLOGY significa EXPANSIÓN. Si las dos se sienten igual, la transición no
 * está diciendo nada.
 *
 * Cada frontera declara lo que el 08A pide: qué cambia de estado, qué se
 * entrega en imagen, en movimiento, en sonido, en semántica y en memoria,
 * cuánto dura, si se bloquea la entrada mientras ocurre, y qué pasa con
 * movimiento reducido.
 *
 * LAS DURACIONES SON RANGOS, NO DOGMA. El 08A: "Do not canonize arbitrary
 * millisecond values before real browser QA". Lo que está acá salió de medir:
 * el piso de una escena del corredor es ~566 ms y el sobrecosto útil de
 * transición quedó en ~183 ms. Los rangos respetan eso.
 */

export type ModoTransicion =
  | 'cruce'      // umbral: se atraviesa algo y del otro lado te reconocen
  | 'descenso'   // se cae hacia dentro: comprime
  | 'llegada'    // se aterriza en un lugar que ya estaba ahí
  | 'mutacion'   // la materia cambia de estado
  | 'expansion'  // se abre el campo
  | 'retorno'    // se vuelve, con algo en la mano
  | 'paso';      // tránsito neutro entre láminas del mismo estrato

export interface ContratoTransicion {
  desde: string;
  hacia: string;
  /** Qué le pasa al observador. En una frase, no en jerga. */
  cambioDeEstado: string;
  entrega: {
    visual: string;
    movimiento: string;
    audio: string;
    semantica: string;
    memoria: string;
  };
  modo: ModoTransicion;
  /** [mínimo, máximo] en ms del velo. Fuera de esto hay que volver a medir. */
  duracion: [number, number];
  /** ¿Se ignoran los clics mientras cruza? Sólo donde el cruce ES el contenido. */
  bloqueaEntrada: boolean;
  /** Qué queda cuando el visitante pidió menos movimiento. */
  movimientoReducido: string;
}

export const KDX_TRANSICIONES: ContratoTransicion[] = [
  {
    desde: 'kdx:interlude/threshold',
    hacia: 'kdx:folio/prologue',
    cambioDeEstado:
      'De afuera a adentro. El visitante deja de mirar el archivo y pasa a ser mirado por él.',
    entrega: {
      visual:
        'El eje cromático que partió la palabra del umbral se cierra, y la escena aparece con el mismo gesto al revés. Es la única frontera donde el glitch del título es también la transición: se cruza POR la palabra.',
      movimiento: 'Corto y hacia adentro. No hay caída; hay paso.',
      audio:
        'La elección de sonido tomada en la puerta viaja intacta. Es lo único que el visitante decidió hasta acá y se respeta sin volver a preguntar.',
      semantica: 'kdx:interlude/threshold → kdx:folio/prologue en el eje canónico.',
      memoria:
        'Acá se libera lo que se encoló en la puerta. Antes del cruce el archivo no había escrito nada: recuerda a quien entra, no a quien miraba.',
    },
    modo: 'cruce',
    duracion: [220, 320],
    bloqueaEntrada: false,
    movimientoReducido:
      'Sin velo y sin partición: la escena siguiente aparece directamente, legible desde el primer cuadro.',
  },
  {
    desde: 'kdx:folio/prologue',
    hacia: 'kdx:folio/descent',
    cambioDeEstado: 'De reconocer a descender. Se acepta la invitación y empieza la profundidad.',
    entrega: {
      visual: 'La escena se comprime hacia el centro, como una caída que empieza.',
      movimiento: 'Acelera. Es la única frontera donde la transición gana velocidad en vez de perderla.',
      audio: 'El estado de señal continúa.',
      semantica: 'kdx:folio/prologue → kdx:folio/descent.',
      memoria: 'Se registra el paso y el estrato de entrada.',
    },
    modo: 'descenso',
    duracion: [200, 300],
    bloqueaEntrada: false,
    movimientoReducido: 'Aparición directa.',
  },
  {
    desde: 'kdx:folio/descent',
    hacia: 'kdx:interlude/archive-machine',
    cambioDeEstado: 'Se toca fondo y aparece un lugar que ya estaba ahí, esperando.',
    entrega: {
      visual: 'Se abre. Lo contrario de la compresión anterior.',
      movimiento: 'Desacelera hasta quedarse quieto: el interludio es respiración.',
      audio: 'Continúa.',
      semantica: 'kdx:folio/descent → kdx:interlude/archive-machine.',
      memoria: 'Se registra la permanencia si el visitante se queda.',
    },
    modo: 'llegada',
    duracion: [240, 340],
    bloqueaEntrada: false,
    movimientoReducido: 'Aparición directa.',
  },
  {
    desde: 'kdx:folio/archive',
    hacia: 'kdx:folio/machine',
    cambioDeEstado: 'De leer a transformar. El espécimen elegido entra a la máquina.',
    entrega: {
      visual: 'La obra seleccionada persiste un instante y muta.',
      movimiento: 'Respuesta rápida: la máquina contesta.',
      audio: 'Continúa.',
      semantica: 'kdx:folio/archive → kdx:folio/machine, con el espécimen como carga.',
      memoria: 'Se registra QUÉ se eligió, no sólo que se cruzó.',
    },
    modo: 'mutacion',
    duracion: [180, 260],
    bloqueaEntrada: false,
    movimientoReducido: 'Aparición directa.',
  },
  {
    desde: 'kdx:folio/machine',
    hacia: 'kdx:folio/cosmology',
    cambioDeEstado: 'Lo que salió de la máquina encuentra su lugar en el campo de relaciones.',
    entrega: {
      visual: 'Se aleja la cámara: lo que era una pieza pasa a ser un punto entre muchos.',
      movimiento: 'Se expande, sin prisa.',
      audio: 'Continúa.',
      semantica: 'kdx:folio/machine → kdx:folio/cosmology, y el nodo generado se conecta.',
      memoria: 'Se registra el efecto producido.',
    },
    modo: 'expansion',
    duracion: [260, 360],
    bloqueaEntrada: false,
    movimientoReducido: 'Aparición directa.',
  },
  {
    desde: 'kdx:folio/cosmology',
    hacia: 'kdx:folio/return',
    cambioDeEstado: 'El campo converge. El visitante vuelve, y no vuelve igual.',
    entrega: {
      visual: 'Las relaciones se recogen hacia un solo centro.',
      movimiento: 'Desacelera. Es el final de la respiración larga.',
      audio: 'Continúa.',
      semantica: 'kdx:folio/cosmology → kdx:folio/return.',
      memoria:
        'Acá la memoria se LEE, no sólo se escribe: el espécimen de salida se deriva del recorrido real.',
    },
    modo: 'retorno',
    duracion: [280, 380],
    bloqueaEntrada: false,
    movimientoReducido: 'Aparición directa.',
  },
  {
    desde: 'kdx:folio/return',
    hacia: 'kdx:interlude/threshold',
    cambioDeEstado: 'Recursión. La misma puerta, otro visitante — porque el que vuelve ya cambió.',
    entrega: {
      visual: 'El umbral reaparece, pero el archivo ya no está en blanco.',
      movimiento: 'Lento, como la primera vez. La puerta no se apura nunca.',
      audio: 'La elección de sonido se conserva.',
      semantica: 'kdx:folio/return → kdx:interlude/threshold, cerrando el ciclo.',
      memoria: 'Se incrementa el ciclo. Es el único evento que lo hace.',
    },
    modo: 'retorno',
    duracion: [320, 460],
    bloqueaEntrada: false,
    movimientoReducido: 'Aparición directa.',
  },
];

/** El contrato de una frontera, o null si esa frontera no está declarada. */
export function contratoDe(desde: string, hacia: string): ContratoTransicion | null {
  return KDX_TRANSICIONES.find((t) => t.desde === desde && t.hacia === hacia) ?? null;
}

/**
 * La duración a usar. Se toma el piso del rango: el 07D pide 180–320 ms para
 * la navegación normal, y estirarse hasta el techo por gusto es volver a cobrar
 * el peaje que este trabajo vino a sacar. El techo existe para los cruces que
 * de verdad son un acontecimiento.
 */
export function duracionDe(desde: string, hacia: string, fallback = 260): number {
  const c = contratoDe(desde, hacia);
  return c ? c.duracion[0] : fallback;
}
