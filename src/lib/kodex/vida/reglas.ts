/**
 * KODEX−∞ · KDX.LIFE — el tercer motor
 *
 * El handoff de Ocín (2026-08-20 09:14) nombra tres motores del sistema:
 * KDX.OS × KDX.TYPE × KDX.LIFE. Los dos primeros existen —la barra de comandos
 * y los títulos cinéticos—. Este es el tercero, que no existía en ninguna rama.
 *
 * Su referencia declarada es Slide Rules / Game of Life, y su aprendizaje —
 * textual del handoff— es: "rule blocks, cellular behavior, presets, emergence,
 * mutation. KODEX construye su propia implementación. NO copiar."
 *
 * En castellano el creador pidió lo mismo el mismo día:
 *   "que vayan apareciendo señales e infográficos de una misma experiencia
 *    como botones que interactúen con la experiencia o que transformen, den
 *    color y transformen, aceleren, roten etc."
 *
 * QUÉ ES: una retícula de celdas viva sobre la lámina. Cada celda que sobrevive
 * lo suficiente emerge como SEÑAL —un glifo que se puede tocar—. Tocarla no la
 * "activa": le aplica una regla, y esa regla queda mutada para el resto de la
 * sesión. Por eso dos personas nunca ven la misma constelación de señales.
 *
 * LA MATEMÁTICA NO ES DECORATIVA (regla de canon). La semilla de la retícula no
 * es aleatoria: sale del identificador de la lámina, así que cada plancha tiene
 * su vida propia y siempre la misma. Y el vecindario no es el cuadrado de
 * Conway sino la vuelta áurea, la misma razón con que `ruta.ts` elige puertas.
 *
 * PURO A PROPÓSITO: sin DOM, sin reloj, sin Math.random. Entra estado, sale
 * estado. Se mide en `scripts/kodex/probar-vida.mjs` sin abrir un navegador.
 */

/** Un bloque de regla: la unidad que el handoff llama "rule block". */
export type Bloque = {
  id: string;
  /** rótulo en inglés, como el resto del sitio */
  nombre: string;
  /** vecinos vivos que hacen NACER una celda muerta */
  nace: number[];
  /** vecinos vivos con los que una celda viva SOBREVIVE */
  vive: number[];
  /** qué le hace a una señal cuando la tocás */
  gesto: 'COLOR' | 'ROTATE' | 'ACCELERATE' | 'DIVIDE';
  /** densidad de siembra PROPIA de esta regla — ver el comentario de BLOQUES */
  densidad: number;
};

/**
 * Los presets. El handoff pide "presets" explícitamente.
 * Cada uno es un régimen distinto de vida, no una variación cosmética:
 * medidos en el banco dan densidades y velocidades de emergencia distintas.
 */
/*
 * CADA REGLA TRAE SU PROPIA DENSIDAD, y eso no es un detalle: es el hallazgo
 * del barrido. Con una densidad única para todas, 12 de 30 combinaciones
 * dejaban la lámina sin una sola señal, CORAL se extinguía y EMBER no emergía
 * nunca. Una regla que pide muchos vecinos para sobrevivir necesita sembrarse
 * densa; una que revienta con poco, rala. Los números de abajo salen de
 * `scripts/kodex/barrer-vida.mjs`, que prueba 10 reglas × 5 densidades sobre
 * las 39 láminas y sólo deja pasar las que en TODAS cumplen: cero extinciones,
 * cero saturación, y al menos una señal emergida.
 *
 * CORAL quedó afuera por medición, no por gusto: satura las 39 a toda densidad
 * que la mantenga viva. Entró PULSE en su lugar.
 */
export const BLOQUES: Bloque[] = [
  { id: 'weave', nombre: 'WEAVE', nace: [3],       vive: [2, 3], gesto: 'COLOR',      densidad: 0.22 },
  { id: 'bloom', nombre: 'BLOOM', nace: [3, 6],    vive: [2, 3], gesto: 'DIVIDE',     densidad: 0.30 },
  { id: 'pulse', nombre: 'PULSE', nace: [2, 3],    vive: [2, 3], gesto: 'ROTATE',     densidad: 0.14 },
  { id: 'drift', nombre: 'DRIFT', nace: [3, 4],    vive: [3, 4], gesto: 'ACCELERATE', densidad: 0.30 },
];

/*
 * SON CUATRO Y NO CINCO, y también es un resultado del banco.
 *
 * EMBER (B345/S5) pasaba el barrido mirando el PICO de señales, pero medido
 * ciclo a ciclo terminaba en cero: la regla exige cinco vecinos para sobrevivir
 * y ninguna chispa de tres celdas llega a eso. Es un régimen que enciende y se
 * apaga —fiel a su nombre— pero una capa sin nada que tocar no es una capa de
 * vida. Se intentó sostenerla con el avivado y no alcanzó.
 *
 * Antes de agregar un quinto parche se prefirió sacarla. Cuatro regímenes que
 * funcionan en las 39 láminas valen más que cinco con uno roto, y además caen
 * exactos sobre los cuatro gestos: COLOR, DIVIDE, ROTATE, ACCELERATE.
 *
 * Queda escrito acá para que nadie la vuelva a proponer sin medirla: la regla
 * no está prohibida, está DESCARTADA POR MEDICIÓN. Si alguien encuentra una
 * siembra que la sostenga, que la reponga con el número.
 */

export type Celda = {
  viva: boolean;
  /** cuántos ciclos lleva viva sin morir: a los `UMBRAL_SENAL` emerge */
  edad: number;
  /** mutaciones acumuladas por el tacto de la persona */
  mutacion: number;
};

export type Campo = {
  ancho: number;
  alto: number;
  celdas: Celda[];
  bloque: Bloque;
  ciclo: number;
};

/** Ciclos que una celda debe sobrevivir para volverse señal tocable. */
export const UMBRAL_SENAL = 4;

const PHI = (1 + Math.sqrt(5)) / 2;
const AUREO = 1 / (PHI * PHI);

function firmar(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * Sembrar el campo desde el identificador de la lámina.
 *
 * No hay Math.random: la misma lámina siembra siempre la misma vida, y dos
 * láminas distintas siembran vidas distintas. Es la misma disciplina que el
 * motor de ruta — determinista y por eso medible.
 *
 * La siembra usa la vuelta áurea sobre la retícula: las celdas iniciales caen
 * en filotaxis, que es cómo una planta distribuye lo suyo sin dejar hueco ni
 * superponer. No es adorno: es la razón por la que la vida arranca repartida
 * en vez de en grumos, y se ve en el banco (densidad inicial pareja).
 */
export function sembrar(idLamina: string, ancho: number, alto: number, bloque?: Bloque): Campo {
  const semilla = firmar(idLamina);
  const n = ancho * alto;
  const celdas: Celda[] = Array.from({ length: n }, () => ({ viva: false, edad: 0, mutacion: 0 }));

  const b0 = bloque ?? BLOQUES[semilla % BLOQUES.length];
  /* La densidad la manda la REGLA, no la lámina: ver el comentario de BLOQUES.
     La lámina sólo decide dónde caen las celdas, no cuántas. */
  const cuantas = Math.floor(n * b0.densidad);
  const base = (semilla % 0xffff) / 0xffff;
  for (let k = 0; k < cuantas; k++) {
    const t = (base + k * AUREO) % 1;
    const i = Math.floor(t * n) % n;
    celdas[i].viva = true;
  }

  return { ancho, alto, celdas, bloque: b0, ciclo: 0 };
}

/** Vecinos de Moore, con los bordes cerrados: la lámina tiene marco. */
function vecinosVivos(c: Campo, x: number, y: number): number {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= c.ancho || ny >= c.alto) continue;
      if (c.celdas[ny * c.ancho + nx].viva) n++;
    }
  }
  return n;
}

/** Un ciclo de vida. Devuelve campo nuevo — no muta el que entra. */
export function latir(c: Campo): Campo {
  const celdas: Celda[] = new Array(c.celdas.length);
  for (let y = 0; y < c.alto; y++) {
    for (let x = 0; x < c.ancho; x++) {
      const i = y * c.ancho + x;
      const v = vecinosVivos(c, x, y);
      const a = c.celdas[i];
      const viva = a.viva ? c.bloque.vive.includes(v) : c.bloque.nace.includes(v);
      celdas[i] = {
        viva,
        /* La edad sobrevive a la muerte como cicatriz: una celda que vivió y
           murió no vuelve a cero. El campo recuerda dónde hubo vida, que es lo
           que hace que la lámina se vea habitada y no reiniciada. */
        edad: viva ? a.edad + 1 : Math.max(0, a.edad - 1),
        mutacion: a.mutacion,
      };
    }
  }
  return { ...c, celdas, ciclo: c.ciclo + 1 };
}

export type Senal = {
  i: number; x: number; y: number;
  edad: number; mutacion: number;
  gesto: Bloque['gesto'];
};

/**
 * El gesto de UNA señal.
 *
 * Se midió en navegador y las siete señales salían con el mismo glifo del mismo
 * color, porque el gesto era una propiedad de la regla y no de la celda. Siete
 * botones idénticos no son "señales e infográficos de una misma experiencia":
 * son el mismo botón siete veces.
 *
 * Ahora el gesto sale de la celda —determinista, por su posición— y el bloque
 * SESGA la mezcla en vez de imponerla: dos de cada tres señales llevan el gesto
 * de la regla que gobierna, y la tercera trae otro. Así el campo tiene carácter
 * (se reconoce qué regla corre) sin ser monótono.
 */
export function gestoDe(c: Campo, i: number): Bloque['gesto'] {
  const GESTOS: Bloque['gesto'][] = ['COLOR', 'DIVIDE', 'ROTATE', 'ACCELERATE'];
  const h = ((i * 2654435761) >>> 0) % 3;
  return h < 2 ? c.bloque.gesto : GESTOS[(i * 7 + c.ciclo) % GESTOS.length];
}

/**
 * Las señales: las celdas que sobrevivieron lo suficiente como para merecer
 * ser tocadas. El handoff lo llama "emergence" — no se dibujan todas las
 * celdas como botones, emergen las que la regla sostuvo.
 *
 * Se limita a `tope` porque §19 del documento de navegación es explícito sobre
 * densidad: "no arbitrary decorative HUD density". Una lámina cubierta de
 * cien botones no es un organismo, es ruido.
 */
export function senales(c: Campo, tope = 7): Senal[] {
  const s: Senal[] = [];
  for (let i = 0; i < c.celdas.length; i++) {
    const a = c.celdas[i];
    if (!a.viva || a.edad < UMBRAL_SENAL) continue;
    s.push({
      i, x: i % c.ancho, y: Math.floor(i / c.ancho),
      edad: a.edad, mutacion: a.mutacion, gesto: gestoDe(c, i),
    });
  }
  /* Las más viejas primero: la señal que más sobrevivió es la que más pesa. */
  s.sort((a, b) => b.edad - a.edad || a.i - b.i);
  return s.slice(0, tope);
}

/**
 * Tocar una señal. El handoff pide "mutation": el tacto no dispara un efecto,
 * MUTA el campo, y la mutación queda.
 *
 * Cada gesto muta distinto, y cada uno es la regla que le corresponde al bloque:
 *   COLOR       enciende el vecindario — la señal contagia
 *   ROTATE      gira el vecindario un cuarto de vuelta
 *   ACCELERATE  envejece el vecindario: adelanta su emergencia
 *   DIVIDE      parte la señal en dos, a vuelta áurea de distancia
 */
export function tocar(c: Campo, i: number): Campo {
  const gesto = gestoDe(c, i);
  const celdas = c.celdas.map((x) => ({ ...x }));
  const x0 = i % c.ancho, y0 = Math.floor(i / c.ancho);
  const en = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < c.ancho && y < c.alto ? y * c.ancho + x : -1;

  celdas[i].mutacion += 1;

  switch (gesto) {
    case 'COLOR':
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const j = en(x0 + dx, y0 + dy);
        if (j >= 0) { celdas[j].viva = true; celdas[j].mutacion += 1; }
      }
      break;
    case 'ROTATE': {
      /* un cuarto de vuelta del vecindario alrededor de la señal */
      const anillo = [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
      const antes = anillo.map(([dx, dy]) => {
        const j = en(x0 + dx, y0 + dy);
        return j >= 0 ? celdas[j].viva : false;
      });
      anillo.forEach(([dx, dy], k) => {
        const j = en(x0 + dx, y0 + dy);
        if (j >= 0) { celdas[j].viva = antes[(k + 6) % 8]; celdas[j].mutacion += 1; }
      });
      break;
    }
    case 'ACCELERATE':
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const j = en(x0 + dx, y0 + dy);
        if (j >= 0 && celdas[j].viva) { celdas[j].edad += 2; celdas[j].mutacion += 1; }
      }
      break;
    case 'DIVIDE': {
      const n = c.ancho * c.alto;
      const a = Math.floor(((i / n + AUREO) % 1) * n) % n;
      const b = Math.floor(((i / n + AUREO * 2) % 1) * n) % n;
      for (const j of [a, b]) {
        celdas[j].viva = true;
        celdas[j].edad = Math.max(celdas[j].edad, UMBRAL_SENAL);
        celdas[j].mutacion += 1;
      }
      break;
    }
  }
  return { ...c, celdas };
}

/** Cambiar de bloque de regla sin perder la vida que ya hay: el campo persiste. */
export function cambiarBloque(c: Campo, id: string): Campo {
  const b = BLOQUES.find((x) => x.id === id);
  return b ? { ...c, bloque: b } : c;
}

/** ¿El campo se murió? Sirve para resembrar en vez de mostrar una lámina muerta. */
export function extinto(c: Campo): boolean {
  return !c.celdas.some((x) => x.viva);
}

/**
 * Avivar: la brasa que impide que la lámina quede con una capa muerta.
 *
 * EMBER es un régimen transitorio a propósito —las señales encienden y se
 * apagan, que es lo que la palabra promete— pero medido en el banco eso dejaba
 * 3 de 30 combinaciones sin ninguna señal al ciclo 30. Una capa de vida que no
 * tiene nada que tocar no es una capa de vida.
 *
 * Esto NO es un piso falso: no fuerza señales donde la regla no las sostiene.
 * Inyecta una chispa determinista —posición por vuelta áurea desde el ciclo—
 * y deja que la regla decida si prende o no. Si la regla la mata, la próxima
 * chispa cae en otro lado. La lámina respira; no se le miente.
 */
export function avivar(c: Campo): Campo {
  const n = c.ancho * c.alto;
  const celdas = c.celdas.map((x) => ({ ...x }));
  const base = ((c.ciclo * AUREO) % 1);
  /* Una chispa de tres celdas: una sola casi siempre muere sin vecinos. */
  for (let k = 0; k < 3; k++) {
    const i = Math.floor(((base + k * AUREO) % 1) * n) % n;
    celdas[i].viva = true;
  }
  return { ...c, celdas };
}

/** ¿Hace falta avivar? Sin señales tocables, la capa no tiene función. */
export function apagado(c: Campo): boolean {
  return senales(c).length === 0;
}
