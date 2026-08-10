/**
 * KODEX-∞ · t01-06 RITUAL DEVICE · ORGANISMOS DEL BLOQUE IZQUIERDA
 *
 * Tres lienzos 2D, ni un bitmap trazado:
 *
 *  · `pintarDispositivo` — el héroe del bloque. El artefacto despiezado en seis
 *    piezas (sello, anillo de contención, cámara de señal con el árbol, cristal
 *    de núcleo, carrete estabilizador y placa nova). Cada pieza es geometría
 *    con parámetros, así que el despiece SE ABRE: `apertura` separa las seis
 *    piezas a lo largo del eje y es lo que la página viva anima al tocarlo.
 *
 *  · `pintarEstados` — los cuatro discos de OPERATING STATES y sus tres ondas.
 *    Es una máquina de estados de verdad: CHARGE → ALIGN → RESONATE → EMIT.
 *    `estado` y `fase` mandan sobre el brillo del disco activo y sobre la
 *    amplitud de su onda; en t=0 los cuatro están en reposo, que es lo que
 *    muestra el póster.
 *
 *  · `pintarGraficos` — las dos ondas, la pila de resonancia y el mapa armónico
 *    del panel 05.
 *
 * DETERMINISMO. Todo sale de `rng(semilla)` y nunca de `Math.random()`: el banco
 * compara píxel a píxel y con azar real dos capturas de la misma página dan
 * puntajes distintos, así que el equipo persigue ruido en vez de converger.
 *
 * COORDENADAS. Cada función recibe el origen de su lienzo EN COORDENADAS DEL
 * PÓSTER y dibuja en coordenadas del póster. Las medidas de acá salen de sondas
 * sobre la referencia (perfil de anchos fila por fila del dispositivo, radios de
 * los discos leídos sobre su eje, base de cada onda), no de mirar la lámina.
 */

/** Mulberry32. Mismo generador que el kit; barato, sin estado global. */
export function rng(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Serie con memoria: sin inercia una onda se lee como trama, no como señal.
 *
 * SE NORMALIZA a [0,1] antes de devolverse, y esto no es cosmético: una AR(1)
 * con inercia 0,88 tiene desviación 0,05 y se queda entre 0,45 y 0,55, así que
 * usada cruda como altura da una línea RECTA. La primera versión de la pila de
 * resonancia salía con cuatro trazas planas por exactamente eso.
 */
function serie(semilla, n, inercia = 0.6) {
  const r = rng(semilla);
  const o = [];
  let v = 0.5;
  for (let i = 0; i < n; i++) { v = v * inercia + r() * (1 - inercia); o.push(v); }
  const mn = Math.min(...o), mx = Math.max(...o), d = mx - mn || 1;
  return o.map((q) => (q - mn) / d);
}

/**
 * Contexto listo para dibujar: el lienzo se monta al tamaño de su caja y con el
 * origen trasladado al del póster, para que todas las medidas de este archivo
 * sean las mismas que salen de las sondas.
 */
export function ctx2d(canvas, ox, oy) {
  const c = canvas.getContext("2d");
  c.setTransform(1, 0, 0, 1, -ox, -oy);
  c.lineCap = "round";
  c.lineJoin = "round";
  return c;
}

const limpiar = (c, ox, oy, w, h) => c.clearRect(ox, oy, w, h);

/* ── paleta ───────────────────────────────────────────────────────────────
   Los tonos salen del promedio RGB de la tinta real de cada pieza (sondas de
   luminancia sobre la referencia), no de elegir hexadecimales: el sello promedia
   #6295a6 por encima de 90, la cámara #8c7fb7, el cristal #9f7cd1. */
const CIAN = [43, 216, 230];
const CIAN_MED = [26, 143, 158];
const VIOLETA = [180, 120, 240];
const VIOLETA_MED = [123, 79, 176];
const PLATA = [200, 208, 216];

const tinta = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;

/** Elipse en perspectiva: todo el dispositivo son discos vistos de canto. */
function disco(c, cx, cy, rx, ry, color, alfa, grosor = 1) {
  c.beginPath();
  c.ellipse(cx, cy, Math.max(0.2, rx), Math.max(0.2, ry), 0, 0, Math.PI * 2);
  c.strokeStyle = tinta(color, alfa);
  c.lineWidth = grosor;
  c.stroke();
}

/** Arco de brillo: en la referencia ningún anillo tiene el mismo peso en toda
 *  la vuelta — la luz entra por arriba y a la izquierda. */
function reflejo(c, cx, cy, rx, ry, a0, a1, color, alfa, grosor) {
  c.beginPath();
  c.ellipse(cx, cy, Math.max(0.2, rx), Math.max(0.2, ry), 0, a0, a1);
  c.strokeStyle = tinta(color, alfa);
  c.lineWidth = grosor;
  c.stroke();
}

/** Halo radial barato: un gradiente por pieza, no un blur de canvas. */
function halo(c, cx, cy, r, color, alfa) {
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, tinta(color, alfa));
  g.addColorStop(0.45, tinta(color, alfa * 0.35));
  g.addColorStop(1, tinta(color, 0));
  c.fillStyle = g;
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.fill();
}

/* ══ 1 · EL DISPOSITIVO ══════════════════════════════════════════════════
 *
 * Medidas del póster. Los ANCHOS salen del perfil de tinta fila por fila (eje
 * en x=154); las ALTURAS de los labios salen del perfil de luminancia media por
 * fila comparado contra el render, que es lo que corrigió la primera vuelta:
 * el sello estaba 14 px bajo y el anillo de contención 10, y ahí se iba la
 * mitad del error del panel. Los picos del original están en
 *
 *   y=138 (labio del sello)      y=182 (su labio inferior)
 *   y=204 (labio del anillo)     y=228 (su labio inferior)
 *   y=356 (piso de la cámara)    y=396 (carrete)
 *   y=414 · 444 · 450 · 462      (los cuatro aros vivos de la placa nova)
 *
 * y las columnas más cargadas son x=104 y x=206 —las paredes de la cámara— y
 * x=152-158, el eje de luz.
 */
const PIEZAS = {
  sello: { sup: 140, inf: 182, rx: 76, ry: 30 },
  anillo: { sup: 204, inf: 228, rx: 78, ry: 26, labio: 244 },
  camara: { rx: 52, boca: 250, piso: 356, ry: 17 },
  cristal: { cy: 330, ancho: 34, alto: 28 },
  carrete: { cy: 396, rx: 55, ry: 10 },
  placa: { cy: 442, rx: 89, ry: 28 },
};
const EJE = 154;

export function pintarDispositivo(c, ox, oy, w, h, opc = {}) {
  const { apertura = 0, pulso = 0, tinte = 0.55 } = opc;
  limpiar(c, ox, oy, w, h);
  /* El póster es un render con bloom: sus filos son suaves y ninguno llega al
     blanco. Con el trazo a plena tinta la pieza queda dura y el diff la castiga
     dos veces (claro donde el original es oscuro y al revés). `tinte` es el
     único número de este archivo que salió de un barrido contra el banco. */
  c.globalAlpha = tinte;
  const r = rng(6106);
  /* La apertura separa las piezas a lo largo del eje. En la lámina vale 0 —el
     póster muestra el despiece ya armado— pero la página viva lo abre. */
  const dz = (k) => k * apertura;

  bruma(c, pulso, 1.5);
  ejeDeLuz(c, pulso);
  placaNova(c, PIEZAS.placa.cy + dz(3), r, pulso);
  carrete(c, PIEZAS.carrete.cy + dz(1.5), r);
  camara(c, dz(0), r, pulso);
  cristal(c, PIEZAS.cristal.cy + dz(0), pulso);
  anilloContencion(c, -dz(1.5), r);
  selloCorona(c, -dz(3), r);
  c.globalAlpha = 1;
}

/**
 * Bruma del artefacto. El original no es un dibujo de líneas: es un render con
 * bloom, y entre trazo y trazo el fondo NO es negro —la ventana promedia 16,5
 * de luminancia y un dibujo de líneas puras llega a 8. Esto es esa diferencia:
 * un halo por pieza, sin un solo filo. Es lo que mide el diff estructural por
 * bloques de 8×8, que no ve siluetas sino medias locales.
 */
function bruma(c, pulso, k = 1) {
  const capas = [
    [161, 30, 0.10], [216, 34, 0.11], [300, 40, 0.055], [330, 30, 0.09],
    [396, 26, 0.05], [442, 52, 0.10],
  ];
  for (const [cy, rr, a0] of capas) {
    const a = a0 * k;
    const g = c.createRadialGradient(EJE, cy, 0, EJE, cy, rr * 2.4);
    g.addColorStop(0, tinta(cy > 380 || cy < 250 ? CIAN : VIOLETA, a * (1 + pulso * 0.3)));
    g.addColorStop(0.5, tinta(cy > 380 || cy < 250 ? CIAN : VIOLETA, a * 0.42));
    g.addColorStop(1, tinta(CIAN, 0));
    c.fillStyle = g;
    c.fillRect(EJE - rr * 2.6, cy - rr * 2.6, rr * 5.2, rr * 5.2);
  }
}

/** El eje de luz que atraviesa las seis piezas: 253 de pico sobre la sonda. */
function ejeDeLuz(c, pulso) {
  const g = c.createLinearGradient(0, 126, 0, 476);
  g.addColorStop(0, tinta(CIAN, 0.05));
  g.addColorStop(0.18, tinta(CIAN, 0.5));
  g.addColorStop(0.5, tinta(VIOLETA, 0.55));
  g.addColorStop(0.8, tinta(CIAN, 0.75));
  g.addColorStop(1, tinta(CIAN, 0.1));
  c.save();
  c.globalAlpha = 1;
  c.strokeStyle = g;
  c.lineWidth = 1.4 + pulso * 0.5;
  c.beginPath();
  c.moveTo(EJE, 128);
  c.lineTo(EJE, 470);
  c.stroke();
  c.strokeStyle = tinta(PLATA, 0.2);
  c.lineWidth = 3.6;
  c.stroke();
  c.restore();
}

/**
 * A · CROWN SEAL. Un toro visto de canto: labio superior en y≈152, labio
 * inferior en y≈182, y entre los dos la pared del anillo. La luz entra por
 * arriba, así que el arco superior es el trazo más vivo de toda la pieza.
 */
function selloCorona(c, dz, r) {
  const { rx, ry } = PIEZAS.sello;
  const sup = PIEZAS.sello.sup + dz, inf = PIEZAS.sello.inf + dz;
  /* La pared del toro va como DOS ARCOS y no como dos rectas verticales: con
     rectas la pieza se lee como un barril de jaula, que es lo que salió en la
     primera vuelta, y en el original el canto es curvo. */
  reflejo(c, EJE, (sup + inf) / 2, rx, (inf - sup) / 2 + ry * 0.2, Math.PI * 0.78, Math.PI * 1.22, PLATA, 0.3, 1);
  reflejo(c, EJE, (sup + inf) / 2, rx, (inf - sup) / 2 + ry * 0.2, Math.PI * 1.78, Math.PI * 2.22, PLATA, 0.3, 1);
  // labio inferior: se ve por detrás, más apagado
  disco(c, EJE, inf, rx, ry * 0.92, PLATA, 0.3, 1);
  reflejo(c, EJE, inf, rx, ry * 0.92, 0, Math.PI, CIAN_MED, 0.6, 1.2);
  // labio superior y su reflejo, el trazo más brillante de la pieza
  disco(c, EJE, sup, rx, ry, PLATA, 0.34, 1);
  reflejo(c, EJE, sup, rx, ry, Math.PI * 1.0, Math.PI * 1.5, CIAN, 0.95, 1.9);
  reflejo(c, EJE, sup, rx, ry, Math.PI * 1.55, Math.PI * 1.98, CIAN, 0.8, 1.7);
  reflejo(c, EJE, sup, rx, ry, Math.PI * 0.08, Math.PI * 0.42, CIAN, 0.45, 1.2);
  // meseta: anillos concéntricos hundidos, en progresión de razón 0,78
  let k = 0.78;
  for (let i = 0; i < 5; i++) {
    disco(c, EJE, sup + 6 + i * 2.2, rx * k, ry * k, i % 2 ? CIAN_MED : PLATA, 0.4 - i * 0.05, i ? 0.75 : 1);
    k *= 0.78;
  }
  // muescas del sello glífico sobre el borde
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const x = EJE + Math.cos(a) * rx * 0.99, y = sup + Math.sin(a) * ry * 0.98;
    const l = 1.8 + r() * 3.4;
    c.strokeStyle = tinta(CIAN, 0.2 + r() * 0.5);
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.6);
    c.stroke();
  }
  motas(c, r, EJE, sup, rx * 1.12, ry * 1.5, 26, CIAN, 0.5);
}

/** Motas de campo alrededor de una pieza: el póster no tiene ningún contorno
 *  limpio, siempre hay polvo de instrumento afuera. */
function motas(c, r, cx, cy, rx, ry, n, color, alfa) {
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2;
    const q = 0.85 + r() * 0.35;
    c.fillStyle = tinta(color, 0.1 + r() * alfa);
    c.fillRect(cx + Math.cos(a) * rx * q, cy + Math.sin(a) * ry * q, 1, 1);
  }
}

/** B · CONTAINMENT RING. Dos coronas y la boca violeta que abre la cámara. */
function anilloContencion(c, dz, r) {
  const { rx, ry } = PIEZAS.anillo;
  const sup = PIEZAS.anillo.sup + dz, inf = PIEZAS.anillo.inf + dz;
  const cy = (sup + inf) / 2;
  reflejo(c, EJE, cy, rx, (inf - sup) / 2 + ry * 0.2, Math.PI * 0.76, Math.PI * 1.24, PLATA, 0.28, 1);
  reflejo(c, EJE, cy, rx, (inf - sup) / 2 + ry * 0.2, Math.PI * 1.76, Math.PI * 2.24, PLATA, 0.28, 1);
  disco(c, EJE, inf, rx, ry * 0.9, PLATA, 0.3, 1);
  disco(c, EJE, sup, rx, ry, PLATA, 0.36, 1.1);
  // los dos brillos laterales: es lo que primero se reconoce de esta pieza
  reflejo(c, EJE, sup, rx, ry, Math.PI * 1.02, Math.PI * 1.36, CIAN, 0.95, 2.1);
  reflejo(c, EJE, sup, rx, ry, Math.PI * 1.66, Math.PI * 1.98, CIAN, 0.9, 2);
  reflejo(c, EJE, inf, rx, ry * 0.9, Math.PI * 0.06, Math.PI * 0.44, CIAN, 0.5, 1.3);
  let k = 0.86;
  for (let i = 0; i < 4; i++) {
    disco(c, EJE, sup + 4 + i * 2.6, rx * k, ry * k, i % 2 ? CIAN_MED : PLATA, 0.34 - i * 0.05, 0.8);
    k *= 0.82;
  }
  // la corona violeta: es el labio superior de la cámara de señal
  const rc = PIEZAS.camara.rx, lab = PIEZAS.anillo.labio + dz;
  disco(c, EJE, lab, rc * 1.08, ry * 0.7, VIOLETA_MED, 0.45, 1.1);
  reflejo(c, EJE, lab, rc * 1.08, ry * 0.7, Math.PI, Math.PI * 2, VIOLETA, 0.9, 1.8);
  disco(c, EJE, lab + 4, rc * 1.0, ry * 0.6, VIOLETA_MED, 0.28, 0.9);
  for (let i = 0; i < 34; i++) {
    const a = (i / 34) * Math.PI * 2;
    c.strokeStyle = tinta(PLATA, 0.12 + r() * 0.4);
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(EJE + Math.cos(a) * rx * 0.6, sup + 6 + Math.sin(a) * ry * 0.6);
    c.lineTo(EJE + Math.cos(a) * rx * 0.74, sup + 6 + Math.sin(a) * ry * 0.74);
    c.stroke();
  }
  motas(c, r, EJE, sup, rx * 1.1, ry * 1.6, 26, CIAN, 0.45);
}

/** C · SIGNAL CHAMBER. Cilindro de vidrio con la matriz de glifos adentro. */
function camara(c, dz, r, pulso) {
  const { rx, boca, piso, ry } = PIEZAS.camara;
  const b = boca + dz, p = piso + dz;
  /* Las dos paredes son las COLUMNAS MÁS CARGADAS del panel: sobre 350 filas
     x=104 promedia 47 de luminancia y x=206, 27. O sea el canto izquierdo vale
     ~155 donde existe y el derecho ~90; pintarlas iguales aplana el cilindro y
     le saca el volumen. Van con su propio alfa y no con el `tinte` general. */
  c.save();
  c.globalAlpha = 1;
  c.strokeStyle = tinta(VIOLETA, 0.95);
  c.lineWidth = 1.7;
  c.beginPath(); c.moveTo(EJE - rx, b); c.lineTo(EJE - rx, p); c.stroke();
  c.strokeStyle = tinta(VIOLETA, 0.3);
  c.lineWidth = 3.4;
  c.beginPath(); c.moveTo(EJE - rx, b); c.lineTo(EJE - rx, p); c.stroke();
  c.strokeStyle = tinta(CIAN, 0.6);
  c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(EJE + rx, b); c.lineTo(EJE + rx, p); c.stroke();
  c.strokeStyle = tinta(CIAN, 0.2);
  c.lineWidth = 3;
  c.beginPath(); c.moveTo(EJE + rx, b); c.lineTo(EJE + rx, p); c.stroke();
  c.restore();
  // aros internos: la matriz vertical de la que habla el rótulo
  for (let i = 1; i < 9; i++) {
    const y = b + ((p - b) * i) / 9;
    disco(c, EJE, y, rx * 0.98, ry * 0.62, VIOLETA_MED, 0.09 + (i % 3) * 0.035, 0.6);
  }
  // costillas verticales de la jaula, más apretadas cerca del canto
  for (let i = 1; i < 8; i++) {
    const q = -1 + (2 * i) / 8;
    const x = EJE + Math.sin((q * Math.PI) / 2) * rx;
    c.strokeStyle = tinta(VIOLETA_MED, 0.08 + Math.abs(q) * 0.16);
    c.lineWidth = 0.6;
    c.beginPath();
    c.moveTo(x, b + 3); c.lineTo(x, p - 3);
    c.stroke();
  }
  disco(c, EJE, b, rx, ry, VIOLETA, 0.5, 1.1);
  reflejo(c, EJE, b, rx, ry, Math.PI, Math.PI * 2, VIOLETA, 0.85, 1.5);
  arbol(c, EJE, p - 22, r, pulso);
  // piso de la cámara: disco ancho de cian, el más brillante de la pieza
  disco(c, EJE, p, rx * 1.2, ry * 0.95, CIAN_MED, 0.45, 1.1);
  reflejo(c, EJE, p, rx * 1.2, ry * 0.95, 0, Math.PI, CIAN, 0.9, 1.5);
  disco(c, EJE, p + 4, rx * 0.95, ry * 0.7, CIAN, 0.4, 0.95);
  disco(c, EJE, p + 6, rx * 0.6, ry * 0.45, CIAN, 0.3, 0.85);
  disco(c, EJE, p + 8, rx * 0.3, ry * 0.24, CIAN, 0.24, 0.75);
  motas(c, r, EJE, p, rx * 1.3, ry * 1.4, 22, CIAN, 0.45);
}

/**
 * El árbol de la cámara. Ramificación recursiva con jitter determinista: la
 * copa se abre 96 px sobre 66 de alto, que es lo que mide en la referencia.
 * No es el mismo árbol de ARCHIVE TREE — acá cuelga hacia el cristal.
 */
function arbol(c, x0, y0, r, pulso) {
  const rama = (x, y, ang, largo, ancho, prof) => {
    if (prof > 7 || largo < 1.3) return;
    const x1 = x + Math.cos(ang) * largo;
    const y1 = y + Math.sin(ang) * largo;
    /* El brillo SUBE con la profundidad: en la referencia la copa fina es más
       clara que el tronco, al revés de lo que hace un árbol dibujado a ojo. */
    c.strokeStyle = tinta(PLATA, 0.26 + prof * 0.07);
    c.lineWidth = ancho;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x1, y1);
    c.stroke();
    const abre = 0.32 + r() * 0.34;
    rama(x1, y1, ang - abre, largo * (0.72 + r() * 0.1), ancho * 0.7, prof + 1);
    rama(x1, y1, ang + abre, largo * (0.72 + r() * 0.1), ancho * 0.7, prof + 1);
    if (prof < 4 && r() > 0.5) rama(x1, y1, ang + (r() - 0.5) * 0.5, largo * 0.6, ancho * 0.55, prof + 2);
  };
  // tronco: nace del cristal y sube 26 px antes de abrirse
  c.strokeStyle = tinta(VIOLETA, 0.6 + pulso * 0.2);
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(x0, y0);
  c.lineTo(x0, y0 - 26);
  c.stroke();
  rama(x0, y0 - 26, -Math.PI / 2, 21, 1.3, 0);
  halo(c, x0, y0 - 6, 16, VIOLETA, 0.2 + pulso * 0.1);
}

/** D · CORE CRYSTAL. Octaedro con facetas y núcleo encendido. */
function cristal(c, cy, pulso) {
  const { ancho: a, alto: b } = PIEZAS.cristal;
  const arriba = cy - b, abajo = cy + b;
  const cintura = cy + b * 0.12;
  const puntos = [[EJE, arriba], [EJE + a, cintura], [EJE, abajo], [EJE - a, cintura]];
  halo(c, EJE, cy, a * 1.5, VIOLETA, 0.2 + pulso * 0.12);
  c.beginPath();
  c.moveTo(puntos[0][0], puntos[0][1]);
  for (const [x, y] of puntos.slice(1)) c.lineTo(x, y);
  c.closePath();
  c.fillStyle = tinta(VIOLETA_MED, 0.12);
  c.fill();
  c.strokeStyle = tinta(VIOLETA, 0.9);
  c.lineWidth = 1.3;
  c.stroke();
  // facetas: las aristas internas son lo que lo hace un sólido y no un rombo
  c.strokeStyle = tinta(VIOLETA, 0.42);
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(EJE - a, cintura); c.lineTo(EJE + a, cintura);
  c.moveTo(EJE, arriba); c.lineTo(EJE - a * 0.42, cy + b * 0.5);
  c.moveTo(EJE, arriba); c.lineTo(EJE + a * 0.42, cy + b * 0.5);
  c.moveTo(EJE - a * 0.42, cy + b * 0.5); c.lineTo(EJE, abajo);
  c.moveTo(EJE + a * 0.42, cy + b * 0.5); c.lineTo(EJE, abajo);
  c.moveTo(EJE - a * 0.42, cy + b * 0.5); c.lineTo(EJE + a * 0.42, cy + b * 0.5);
  c.stroke();
  halo(c, EJE, cy - 2, 9 + pulso * 3, [235, 225, 255], 0.85);
}

/** E · STABILIZER SPOOL. Toro chato de aros desiguales. */
function carrete(c, cy, r) {
  const { rx, ry } = PIEZAS.carrete;
  disco(c, EJE, cy, rx, ry, CIAN_MED, 0.4, 1.1);
  reflejo(c, EJE, cy, rx, ry, Math.PI * 1.05, Math.PI * 1.95, CIAN, 0.65, 1.4);
  reflejo(c, EJE, cy, rx, ry, Math.PI * 0.15, Math.PI * 0.6, CIAN_MED, 0.4, 1);
  disco(c, EJE, cy - 4, rx * 0.62, ry * 0.62, PLATA, 0.34, 1);
  disco(c, EJE, cy - 6, rx * 0.36, ry * 0.42, CIAN, 0.5, 1);
  disco(c, EJE, cy - 7, rx * 0.18, ry * 0.26, CIAN, 0.4, 0.85);
  disco(c, EJE, cy + 7, rx * 0.9, ry * 0.72, PLATA, 0.18, 0.75);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    c.strokeStyle = tinta(CIAN, 0.14 + r() * 0.34);
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(EJE + Math.cos(a) * rx * 0.66, cy + Math.sin(a) * ry * 0.66);
    c.lineTo(EJE + Math.cos(a) * rx * 0.92, cy + Math.sin(a) * ry * 0.92);
    c.stroke();
  }
  motas(c, r, EJE, cy, rx * 1.2, ry * 2, 18, CIAN, 0.4);
}

/** F · BASE NOVA PLATE. Nueve aros y la nova del centro. */
function placaNova(c, cy, r, pulso) {
  const { rx, ry } = PIEZAS.placa;
  halo(c, EJE, cy + 2, 46, CIAN, 0.24 + pulso * 0.1);
  // la placa es un disco de dos labios, igual que el sello pero al revés
  reflejo(c, EJE, cy + 1, rx, 7 + ry * 0.2, Math.PI * 0.74, Math.PI * 1.26, PLATA, 0.24, 1);
  reflejo(c, EJE, cy + 1, rx, 7 + ry * 0.2, Math.PI * 1.74, Math.PI * 2.26, PLATA, 0.24, 1);
  disco(c, EJE, cy + 8, rx, ry, PLATA, 0.24, 0.9);
  /* Los aros NO se apilan de a 1,5 px: en el original la placa reparte su tinta
     entre y=414 y y=466 y tiene cuatro filas vivas (414 · 444 · 450 · 462).
     Apretados quedaba una diana de 14 px de alto y medio panel oscuro. */
  let k = 1;
  for (let i = 0; i < 10; i++) {
    const a = 0.44 - i * 0.03 + (i % 3 === 0 ? 0.18 : 0);
    disco(c, EJE, cy - 26 + i * 5.2, rx * k, ry * k, i % 2 ? CIAN_MED : PLATA, Math.max(0.1, a), i === 0 ? 1.2 : 0.85);
    k *= 0.9;
  }
  reflejo(c, EJE, cy + 8, rx, ry, 0, Math.PI, CIAN, 0.8, 1.7);
  reflejo(c, EJE, cy - 26, rx, ry, Math.PI, Math.PI * 2, CIAN, 0.5, 1.3);
  reflejo(c, EJE, cy + 20, rx * 0.66, ry * 0.64, 0, Math.PI, CIAN, 0.7, 1.4);
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const q = 0.9 + r() * 0.16;
    c.fillStyle = tinta(CIAN, 0.14 + r() * 0.55);
    c.fillRect(EJE + Math.cos(a) * rx * q - 0.5, cy - 6 + Math.sin(a) * ry * q - 0.5, 1.3, 1.3);
  }
  motas(c, r, EJE, cy - 4, rx * 1.12, ry * 1.5, 30, CIAN, 0.5);
  halo(c, EJE, cy - 2, 24 + pulso * 4, [220, 250, 255], 0.6);
}

/* ══ 2 · LOS CUATRO ESTADOS ══════════════════════════════════════════════
 *
 * Discos: centro medido en x=470, radio de anillo 30, ejes verticales en
 * y=174.5 / 292.5 / 410.5 / 523.5. Ondas: base en y=222 / 337 / 455, de x=438
 * a x=617. La celda de EMIT no lleva onda.
 */
const DISCO_X = 470;
/* El disco y su onda NO comparten color: el de RESONATE es turquesa y su onda
   es violeta, y pintarlos del mismo tono aplana la celda más cargada de las
   cuatro. `amp` sale de la caja de tinta medida de cada onda: ±10, ±12 y ±12. */
const ESTADOS = [
  { cy: 174.5, color: CIAN, onda: 222, ondaColor: CIAN, amp: 10, alfa: 0.7, semilla: 21 },
  { cy: 292.5, color: VIOLETA, onda: 337, ondaColor: VIOLETA, amp: 12, alfa: 0.72, semilla: 22 },
  { cy: 410.5, color: CIAN_MED, onda: 455, ondaColor: VIOLETA, amp: 12, alfa: 0.78, semilla: 23 },
  { cy: 523.5, color: VIOLETA, onda: null, semilla: 24 },
];

export function pintarEstados(c, ox, oy, w, h, opc = {}) {
  const { estado = -1, fase = 0 } = opc;
  limpiar(c, ox, oy, w, h);
  ESTADOS.forEach((e, i) => {
    const vivo = i === estado ? 0.55 + 0.45 * Math.sin(fase * Math.PI * 2) : 0;
    /* Misma bruma que el dispositivo, por la misma razón: la celda promedia
       entre 13,5 y 16,7 de luminancia y los anillos solos llegan a 11. */
    halo(c, DISCO_X, e.cy, 44, e.color, 0.075 + vivo * 0.05);
    if (e.onda !== null) {
      const g = c.createLinearGradient(0, e.onda - 16, 0, e.onda + 16);
      g.addColorStop(0, tinta(e.ondaColor, 0));
      g.addColorStop(0.5, tinta(e.ondaColor, 0.13));
      g.addColorStop(1, tinta(e.ondaColor, 0));
      c.fillStyle = g;
      c.fillRect(438, e.onda - 16, 179, 32);
    }
    c.save();
    if (i === 0) discoCarga(c, e.cy, e.color, vivo);
    if (i === 1) discoAlineacion(c, e.cy, e.color, vivo, fase);
    if (i === 2) discoResonancia(c, e.cy, e.color, vivo);
    if (i === 3) discoEmision(c, e.cy, e.color, vivo);
    c.restore();
    if (e.onda !== null) onda(c, 438, 617, e.onda, e.ondaColor, e.semilla, e.alfa * (1 - vivo * 0.15), e.amp * (1 + vivo * 0.25));
  });
}

/** Retícula punteada de fondo de cada disco: cruz y ticks de los cuatro. */
function cruz(c, cy, color, alfa, r = 34) {
  c.setLineDash([1.5, 3]);
  c.strokeStyle = tinta(color, alfa);
  c.lineWidth = 0.7;
  c.beginPath();
  c.moveTo(DISCO_X - r, cy); c.lineTo(DISCO_X + r, cy);
  c.moveTo(DISCO_X, cy - r); c.lineTo(DISCO_X, cy + r);
  c.stroke();
  c.setLineDash([]);
}

function ticks(c, cy, color, alfa, n, r0, r1, ancho = 0.9) {
  c.strokeStyle = tinta(color, alfa);
  c.lineWidth = ancho;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    c.beginPath();
    c.moveTo(DISCO_X + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    c.lineTo(DISCO_X + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    c.stroke();
  }
}

const anillo = (c, cy, r, color, alfa, grosor = 1) => disco(c, DISCO_X, cy, r, r, color, alfa, grosor);

/** 01 CHARGE · anillo exterior fino, anillo interior vivo, núcleo diminuto. */
function discoCarga(c, cy, color, vivo) {
  cruz(c, cy, color, 0.3 + vivo * 0.2);
  anillo(c, cy, 30, color, 0.5 + vivo * 0.3, 1);
  ticks(c, cy, color, 0.55, 8, 27, 33, 1.1);
  anillo(c, cy, 16.5, color, 0.85 + vivo * 0.15, 1.4);
  anillo(c, cy, 5, color, 0.9, 1.2);
  halo(c, DISCO_X, cy, 4 + vivo * 3, color, 0.5 + vivo * 0.4);
}

/** 02 ALIGN · el anillo interior BUSCA: por eso los ticks giran con la fase. */
function discoAlineacion(c, cy, color, vivo, fase) {
  cruz(c, cy, color, 0.28);
  anillo(c, cy, 28, color, 0.45, 0.9);
  c.save();
  c.translate(DISCO_X, cy);
  c.rotate(fase * Math.PI * 2 * (vivo > 0 ? 1 : 0));
  c.translate(-DISCO_X, -cy);
  ticks(c, cy, color, 0.5, 12, 24, 30, 0.9);
  c.restore();
  anillo(c, cy, 17, color, 0.9 + vivo * 0.1, 1.6);
  c.setLineDash([2, 3.4]);
  anillo(c, cy, 12, color, 0.45, 0.9);
  c.setLineDash([]);
  ticks(c, cy, color, 0.35, 4, 6, 11, 0.8);
}

/** 03 RESONATE · cascada de anillos y radios: el disco más cargado de los cuatro. */
function discoResonancia(c, cy, color, vivo) {
  cruz(c, cy, color, 0.3, 33);
  const radios = [30, 25.5, 21, 17, 13.5, 10.5];
  radios.forEach((r, i) => anillo(c, cy, r, color, 0.28 + (i % 2 ? 0.18 : 0.34) + vivo * 0.15, i === 0 ? 1 : 0.8));
  ticks(c, cy, color, 0.45, 16, 10, 31, 0.7);
  ticks(c, cy, [130, 200, 240], 0.55, 4, 4, 33, 1);
  anillo(c, cy, 2.4, [200, 235, 250], 0.9, 1);
  halo(c, DISCO_X, cy, 12 + vivo * 6, color, 0.14 + vivo * 0.2);
}

/** 04 EMIT · estrella de ocho puntas: el campo sale, no gira. */
function discoEmision(c, cy, color, vivo) {
  anillo(c, cy, 30, color, 0.4 + vivo * 0.2, 0.9);
  const r = rng(46);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const largo = 30 + (i % 2 ? 0 : 3);
    c.strokeStyle = tinta(color, 0.75 + vivo * 0.25);
    c.lineWidth = i % 2 ? 1.5 : 1.1;
    c.beginPath();
    c.moveTo(DISCO_X, cy);
    c.lineTo(DISCO_X + Math.cos(a) * largo, cy + Math.sin(a) * largo);
    c.stroke();
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const q = 12 + r() * 18;
    c.fillStyle = tinta(color, 0.15 + r() * 0.4);
    c.fillRect(DISCO_X + Math.cos(a) * q - 0.5, cy + Math.sin(a) * q - 0.5, 1.1, 1.1);
  }
  anillo(c, cy, 8, color, 0.55, 1);
  halo(c, DISCO_X, cy, 7 + vivo * 4, [225, 200, 255], 0.9);
}

/**
 * Onda de peine. La envolvente agrupa la señal en ráfagas: sin ella el peine
 * sale parejo de punta a punta y se lee como trama, no como registro.
 */
function onda(c, x0, x1, base, color, semilla, alfa, amplitud = 12, paso = 1.15) {
  const n = Math.floor((x1 - x0) / paso);
  const s = serie(semilla, n, 0.18);
  const env = serie(semilla + 977, n, 0.94);
  const mn = Math.min(...env), mx = Math.max(...env);
  c.strokeStyle = tinta(color, alfa);
  c.lineWidth = 0.85;
  c.beginPath();
  for (let i = 0; i < n; i++) {
    const x = x0 + i * paso;
    const e = Math.pow((env[i] - mn) / (mx - mn || 1), 1.7) * 0.85 + 0.15;
    const a = s[i] * amplitud * e;
    c.moveTo(x, base - a);
    c.lineTo(x, base + a * 0.82);
  }
  c.stroke();
  c.strokeStyle = tinta(color, alfa * 0.9);
  c.lineWidth = 0.7;
  c.beginPath();
  c.moveTo(x0, base);
  c.lineTo(x1, base);
  c.stroke();
}

/* ══ 3 · PANEL 05 · ONDAS Y GRÁFICOS ═════════════════════════════════════
 *
 * RAW INPUT      x 26..239   base 640   amplitud 22
 * FILTERED       x 260..476  base 640   amplitud 19
 * RESONANCE      caja x 46..237 · y 700..775, cuatro trazas
 * HARMONIC MAP   elipse cx 377.5 cy 741 rx 80 ry 47
 */
export function pintarGraficos(c, ox, oy, w, h, opc = {}) {
  const { deriva = 0 } = opc;
  limpiar(c, ox, oy, w, h);
  /* Alfa y amplitud salen de la luminancia medida de cada ventana (14,6 la
     cruda y 9,7 la filtrada): con 0,72 el peine dejaba la caja en 17,9. */
  for (const [x0, x1, col, a] of [[26, 239, PLATA, 0.05], [260, 476, VIOLETA, 0.035]]) {
    const g = c.createLinearGradient(0, 618, 0, 662);
    g.addColorStop(0, tinta(col, 0));
    g.addColorStop(0.5, tinta(col, a));
    g.addColorStop(1, tinta(col, 0));
    c.fillStyle = g;
    c.fillRect(x0, 618, x1 - x0, 44);
  }
  onda(c, 26, 239, 640, PLATA, 71, 0.5, 20, 1.15);
  onda(c, 260, 476, 640, VIOLETA, 72, 0.5, 17, 1.15);
  pilaResonancia(c, deriva);
  mapaArmonico(c);
}

/** Cuatro trazas apiladas, F1 violeta y F2-F4 turquesa, con su retícula. */
function pilaResonancia(c, deriva) {
  const x0 = 47, x1 = 236, y0 = 702, y1 = 774;
  c.strokeStyle = tinta(PLATA, 0.28);
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(x0, y0 - 2); c.lineTo(x0, y1);
  c.moveTo(x0, y1); c.lineTo(x1, y1);
  c.stroke();
  // marcas del eje de tiempo
  for (let i = 0; i <= 5; i++) {
    const x = x0 + ((x1 - x0 - 12) * i) / 5;
    c.beginPath(); c.moveTo(x, y1); c.lineTo(x, y1 + 3); c.stroke();
  }
  /* F1 arriba y violeta, F2-F4 debajo y turquesa: el orden importa y salió mal
     en la primera vuelta —las cuatro trazas quedaron espejadas— porque `base`
     se mide desde el piso del gráfico, no desde su techo. */
  const trazas = [
    { base: 0.84, amp: 0.20, color: [150, 60, 175], semilla: 81, alfa: 0.9 },
    { base: 0.60, amp: 0.22, color: [40, 155, 160], semilla: 82, alfa: 0.8 },
    { base: 0.40, amp: 0.17, color: [40, 155, 160], semilla: 83, alfa: 0.75 },
    { base: 0.22, amp: 0.19, color: [40, 155, 160], semilla: 84, alfa: 0.7 },
  ];
  const n = 96;
  for (const t of trazas) {
    const s = serie(t.semilla, n, 0.88);
    c.strokeStyle = tinta(t.color, t.alfa);
    c.lineWidth = 1;
    c.beginPath();
    for (let i = 0; i < n; i++) {
      const x = x0 + 2 + ((x1 - x0 - 6) * i) / (n - 1);
      // arranque bajo y subida: las cuatro trazas nacen pegadas en x=0
      const arranque = Math.min(1, i / 14);
      const y = y1 - (y1 - y0) * (t.base * arranque + (s[i] - 0.5) * t.amp * arranque + 0.06);
      i ? c.lineTo(x, y + deriva) : c.moveTo(x, y + deriva);
    }
    c.stroke();
  }
  // motas de retícula: el fondo del gráfico no es negro liso
  const r = rng(85);
  c.fillStyle = tinta(PLATA, 0.1);
  for (let i = 0; i < 90; i++) c.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.9, 0.9);
}

/** Mapa armónico: elipse de contención, ejes y el enjambre de nodos del centro. */
function mapaArmonico(c) {
  const cx = 377.5, cy = 741, rx = 80, ry = 47;
  const r = rng(91);
  // retícula punteada
  c.fillStyle = tinta(PLATA, 0.09);
  for (let gx = 268; gx < 466; gx += 11) for (let gy = 696; gy < 790; gy += 11) c.fillRect(gx, gy, 0.8, 0.8);
  disco(c, cx, cy, rx, ry, CIAN_MED, 0.75, 1.1);
  disco(c, cx, cy, rx * 0.62, ry * 0.62, CIAN_MED, 0.14, 0.7);
  // ejes: la línea horizontal es la más marcada del panel
  c.strokeStyle = tinta(CIAN_MED, 0.6);
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx - rx, cy); c.lineTo(cx + rx, cy);
  c.stroke();
  c.strokeStyle = tinta(CIAN_MED, 0.22);
  c.lineWidth = 0.7;
  c.beginPath();
  c.moveTo(cx, cy - ry); c.lineTo(cx, cy + ry);
  c.stroke();
  // enjambre: densidad gaussiana hacia el centro, no uniforme
  /* El enjambre NO es una bola: en la referencia llega casi al borde de la
     elipse y se afina hacia afuera. Con exponente 2,6 quedaba un punto brillante
     en el centro y el resto negro, que es medio panel de error. */
  for (let i = 0; i < 3000; i++) {
    const a = r() * Math.PI * 2;
    const q = Math.pow(r(), 1.35);
    const x = cx + Math.cos(a) * q * rx * 0.95;
    const y = cy + Math.sin(a) * q * ry * 0.95;
    c.fillStyle = tinta(CIAN, (0.1 + r() * 0.6) * (1 - q * 0.55));
    c.fillRect(x, y, 1, 1);
  }
  // filamentos horizontales que salen del núcleo
  for (let i = 0; i < 30; i++) {
    const y = cy + (r() - 0.5) * ry * 0.7;
    const l = 18 + r() * 62;
    const d = r() > 0.5 ? 1 : -1;
    c.strokeStyle = tinta(CIAN, 0.14 + r() * 0.45);
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(cx, y);
    c.lineTo(cx + d * l, y + (r() - 0.5) * 3);
    c.stroke();
  }
  // arcos concéntricos del interior: la elipse no está sola
  for (let i = 1; i < 5; i++) disco(c, cx, cy, rx * (0.2 + i * 0.16), ry * (0.2 + i * 0.16), CIAN_MED, 0.16, 0.7);
  halo(c, cx, cy, 78, CIAN, 0.07);
  halo(c, cx, cy, 16, CIAN, 0.35);
  c.fillStyle = tinta([190, 235, 245], 0.9);
  c.fillRect(cx - 3, cy - 2.5, 6, 5);
}
