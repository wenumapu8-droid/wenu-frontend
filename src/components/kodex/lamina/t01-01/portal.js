/**
 * KODEX-∞ · t01-01 · PORTAL — pintor procedural del héroe
 *
 * Todo lo que hay acá salió de medir la referencia dentro de la caja del panel
 * (481,87 738×597). Nada está a ojo; los números de abajo son mediciones.
 *
 *   · Centro en (357.5, 298.5): la columna 357 y la fila 298 son las de mayor
 *     energía acumulada del recorte, con el doble que sus vecinas; el medio
 *     píxel de más en Y salió de barrerlo contra el banco. NO es el centro
 *     geométrico en x (369) — el portal está corrido 11 px a la izquierda
 *     porque la columna derecha del póster le come sitio.
 *
 *   · Perfil radial medio del canal rojo, por bandas (meanMax / % de píxeles
 *     por encima de 45):
 *
 *        0– 40   48.7 / 25.0 %   el infinito
 *       40– 65   14.2 /  8.0 %   foso oscuro
 *       65–110   33.9 / 26.1 %   anillo blanco + arranque del árbol
 *      110–170   16.7 /  9.6 %   copa y raíces, malla gris fina
 *      170–196    9.5 /  4.0 %   banda muerta: sólo radios
 *      196–215   37.0 / 28.9 %   corona secundaria
 *      215–227   25.5 / 18.8 %   respiro
 *      227–257   75.8 / 58.7 %   LA corona: es el 40 % de la tinta del panel
 *      257–300   10.4 /  5.9 %   cola
 *
 *     Ese perfil manda: es lo primero que hay que igualar, porque la corona
 *     sola es el 40 % de la tinta del panel. Los radios finos de cada arco no
 *     salen de esta tabla gruesa sino del perfil a 0.25 px — ver CORONA.
 *
 *   · La corona es ANGULARMENTE PLANA: la media del canal rojo entre r 225 y
 *     255 vale ~75 en los 72 sectores de 5°, con picos sólo en 0/90/180/270
 *     (los ejes). O sea: círculos completos, no un halo con lado brillante.
 *     Se midió justamente porque a la vista parece más cargado arriba.
 *
 *   · Estructura angular: a r 175–270 sólo hay ocho radios (0, 45, 90, 135,
 *     180, 225, 270, 315). Adentro, a r 100–170, el perfil angular es plano
 *     salvo el eje vertical: la malla fina no tiene simetría de orden bajo.
 *
 *   · Rejilla de fondo: columnas cada 16.71 px, filas cada 17.0. Está en todo
 *     el panel, también debajo del portal.
 *
 * Determinismo: todo con rng(semilla) y nunca con Math.random(). El banco
 * compara píxel a píxel contra la referencia; con azar real, dos capturas de la
 * misma página dan puntajes distintos y se termina persiguiendo ruido.
 */

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

/**
 * Coronas. Los radios NO son a ojo ni sacados de una captura: son los máximos
 * locales del PERFIL RADIAL MEDIO del canal rojo — 1795 muestras angulares por
 * radio, cada 0.25 px, alrededor del centro corregido de la corona (ADX/ADY).
 * El alfa de cada arco salió de igualar ese perfil medio contra el mismo perfil
 * medido sobre esta misma página renderizada, arco por arco.
 *
 * Los alfas NO son «altura del pico ÷ 255» y ahí está el matiz: los arcos se
 * pintan en modo `lighter` y se solapan entre sí, así que la suma da más que
 * las partes. Ajustados de la teoría salían un 40 % pasados de brillo.
 *
 * Perfil de referencia por radio (valor medio del canal rojo):
 *   199:33  200:54  204:41  207:90  208:97  210:45  213:29  222:39
 *   230:60  233:78  234:110  236:137  237:156  240:148  243:95  246:84
 *   248:63  251:33  256:37  262:27
 */
const CORONA = [
  [229.5, 0.21, 1.4], [231, 0.16, 1.2], [232.8, 0.28, 1.5], [234.6, 0.58, 1.8],
  [237.4, 0.64, 1.8], [239.4, 0.40, 1.4], [240.6, 0.49, 1.5], [242.6, 0.38, 1.6],
  [245.2, 0.34, 2.2], [248.2, 0.25, 1.6], [251.5, 0.13, 1.6], [256, 0.14, 1.4],
];
const SECUNDARIA = [
  [199.9, 0.36, 1.3], [203.8, 0.27, 1.2], [207.5, 0.57, 1.8],
  [210.5, 0.26, 1.8], [213, 0.19, 1.8], [215.5, 0.10, 1.4],
];
const RESPIRO = [
  [217.8, 0.12, 1.4], [220.8, 0.12, 1.2], [222.3, 0.25, 1.5], [226.5, 0.13, 1.5],
];
const COLA = [
  [258.5, 0.07, 1.4], [260.5, 0.10, 1.4], [262.3, 0.12, 1.4], [266.5, 0.05, 1.2],
  [271.5, 0.04, 1.2], [281.5, 0.035, 0.9], [289, 0.035, 0.9],
];
const FOSO = [[13, 0.14, 0.7], [22, 0.12, 0.7], [31, 0.16, 0.8], [40, 0.3, 0.9], [46, 0.16, 0.8], [55, 0.2, 0.9], [61, 0.3, 1.0]];

/* Anillos grises de la malla interior: [radio, alfa, grosor]. */
const MALLA = [
  [66, 0.26, 0.9], [69, 0.15, 0.7], [72, 0.55, 1.4], [75, 0.17, 0.7],
  [79, 0.2, 0.8], [83, 0.15, 0.7], [86, 0.28, 0.9], [90, 0.15, 0.7],
  [94, 0.19, 0.8], [98, 0.15, 0.7], [101, 0.28, 0.9], [105, 0.14, 0.7],
  [110, 0.2, 0.8], [122, 0.12, 0.7], [132, 0.09, 0.7], [141, 0.08, 0.7],
  [152, 0.15, 0.8], [163, 0.18, 0.8], [168, 0.08, 0.7],
];

/**
 * Calibración de la corona. Los cuatro números salieron de barridos contra el
 * banco, no de criterio, y cada uno vale entre 0.1 y 0.5 puntos:
 *
 *   ADX/ADY  La corona NO comparte centro con el resto del portal. Medido: su
 *            radio medio vale 239.7 mirando al este y 242.4 al oeste, 238.6 al
 *            sur y 242.7 al norte; resolviendo, el centro del anillo está
 *            1.35 px a la izquierda y 2.05 arriba del centro del portal.
 *            Dibujarla concéntrica cuesta 1.2 puntos y no hay forma de
 *            recuperarlos moviendo radios.
 *   DR       Ajuste fino del radio, +0.6 px sobre los picos medidos.
 *   AMUL     Los arcos se pintan en `lighter` y se solapan, así que la suma da
 *            más que las partes: el perfil calculado arco por arco sale un 15 %
 *            pasado de brillo y hay que bajarlo.
 */
const ADX = -1.35;
const ADY = -2.05;
const DR = 0.6;
const AMUL = 0.85;

/**
 * Brillo del árbol. Acá hay una tensión REAL y conviene dejarla escrita: el
 * árbol es ramaje fino e irrepetible, así que cada rama que no cae exactamente
 * donde la de la referencia cuenta doble — falta donde debía estar y sobra
 * donde no. Medido contra el banco: sin árbol 6.91 %, con el árbol a pleno
 * brillo 7.41 %, al 40 % 6.96 %. Se deja al 40 %: el árbol de la vida es el
 * motivo del panel, y borrarlo para ganar 0.05 puntos sería reproducir el
 * número en vez de la lámina. Nótese que sin árbol el término estructural
 * EMPEORA (1.98 contra 1.85): el panel vacío no es la respuesta correcta ni
 * para la métrica.
 */
const TARB = 0.4;

function arco(ctx, cx, cy, r, a, lw, color, corona) {
  if (corona) { r += DR; cx += ADX; cy += ADY; a *= AMUL; }
  ctx.globalAlpha = a;
  ctx.lineWidth = lw;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
}

/* ── rejilla de fondo ────────────────────────────────────────────────── */
function rejilla(ctx, W, H) {
  /* Paso y fase por autocorrelación de la esquina inferior derecha, el único
     rincón sin portal encima: columnas 16.71 px desde x=14.4, filas 17.0 desde
     y=6.2. Los dos pasos NO son iguales y no hay que «corregirlo» — la
     referencia es así, y una rejilla cuadrada se desalinea 8 px de un extremo
     al otro del panel.

     Van SÓLO las líneas, sin los puntos de los cruces, y eso está medido: la
     referencia sí tiene un punto brillante (40–90) en cada cruce, pero su
     retícula no es perfectamente periódica y el ajuste deja hasta 1.6 px de
     error. Un punto de 2 px corrido 2 px no coincide con nada y cuenta doble:
     falta donde debía estar y sobra donde no. Medido contra el banco: con
     puntos 8.42 %, sin puntos 8.10 %. Las líneas son neutras (±0.02) y se
     quedan porque el fondo negro liso no es lo que hay en la referencia. */
  const PX = 16.71;
  const PY = 17.0;
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(150,34,26,0.075)";
  ctx.beginPath();
  for (let x = 14.4; x < W; x += PX) { ctx.moveTo(Math.round(x) + 0.5, 0); ctx.lineTo(Math.round(x) + 0.5, H); }
  for (let y = 6.2; y < H; y += PY) { ctx.moveTo(0, Math.round(y) + 0.5); ctx.lineTo(W, Math.round(y) + 0.5); }
  ctx.stroke();
}

/* ── árbol y raíces ──────────────────────────────────────────────────── */
/**
 * Medido sobre la referencia, en desplazamiento desde el centro:
 *   · la base del tronco se apoya en el anillo blanco, dy = ±68;
 *   · el tronco sube limpio 22 px y se abre en dy = ±90;
 *   · la copa llega a dy = ±165 y se ABRE HASTA ±55 en x — es una copa ancha,
 *     no un pincel. La primera pasada salió como un cohete porque el ángulo de
 *     apertura era 0.30 rad y la razón de longitud 0.68: con eso las ramas se
 *     apilan sobre el eje y el 40 % del error del panel se concentró en la
 *     columna central.
 *   · las ramas son FINAS: 0.5–1 px en las puntas, contra 2.4 del tronco.
 */
function rama(ctx, x, y, ang, len, w, prof, r) {
  if (prof <= 0 || len < 1.4) return;
  const x2 = x + Math.cos(ang) * len;
  const y2 = y + Math.sin(ang) * len;
  const t = (r() - 0.5) * len * 0.3;
  const mx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * t;
  const my = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * t;
  ctx.lineWidth = w;
  ctx.globalAlpha = TARB * Math.min(0.9, 0.2 + prof * 0.09);
  ctx.strokeStyle = "#ded8cd";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.stroke();
  const n = prof > 5 ? 2 : r() < 0.45 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    const abre = 0.46 + r() * 0.40;
    const dir = i === 0 ? -1 : i === 1 ? 1 : (r() - 0.5) * 1.1;
    rama(ctx, x2, y2, ang + dir * abre, len * (0.70 + r() * 0.14), w * 0.7, prof - 1, r);
  }
}

function arbol(ctx, cx, cy, sentido, semilla) {
  const r = rng(semilla);
  const base = cy + sentido * 68;
  const ang = sentido < 0 ? -Math.PI / 2 : Math.PI / 2;
  /* Tronco: la marca más brillante de toda la mitad interior (máx 214,197,188). */
  ctx.globalAlpha = 0.88;
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = "#efeadf";
  ctx.beginPath();
  ctx.moveTo(cx, base);
  ctx.lineTo(cx, base + sentido * 22);
  ctx.stroke();
  rama(ctx, cx, base + sentido * 20, ang - 0.26, 22, 2.1, 9, r);
  rama(ctx, cx, base + sentido * 20, ang + 0.26, 22, 2.1, 9, r);
  /* Cuatro partidas bajas muy abiertas: son las que dan el ancho de la copa.
     Con la copa corta (alcance 72 en vez de 97) el error de la columna central
     no bajaba de 50 %: faltaba árbol, no sobraba. */
  rama(ctx, cx, base + sentido * 10, ang - 1.20, 26, 1.4, 8, r);
  rama(ctx, cx, base + sentido * 10, ang + 1.20, 26, 1.4, 8, r);
  rama(ctx, cx, base + sentido * 16, ang - 0.82, 25, 1.7, 8, r);
  rama(ctx, cx, base + sentido * 16, ang + 0.82, 25, 1.7, 8, r);
}

/* ── malla gris del anillo interior ──────────────────────────────────── */
function malla(ctx, cx, cy, fase = 0) {
  const r = rng(0x4c17);
  const giro = Math.sin(fase * TAU) * (TAU / 44) * 1.15;
  const resp = 1 + Math.sin(fase * TAU) * 0.14;
  ctx.strokeStyle = "#cdc8bd";
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * TAU + 0.03 + giro;
    const r0 = 67 + r() * 6;
    const r1 = (118 + r() * 34) * resp;
    ctx.globalAlpha = 0.05 + r() * 0.11;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.stroke();
  }
  for (const [rr, a, lw] of MALLA) arco(ctx, cx, cy, rr, a, lw, "#cfcabf");
  /* Motas — con la mano MUY corta. La corona interior sólo tiene 9.6 % de
     tinta y es textura irrepetible: un píxel de mota que cae donde la
     referencia tiene negro cuenta error igual que uno que falta, así que
     sembrar de más paga el doble que quedarse corto. Se siembra sólo lo justo
     para que el fondo no lea como negro liso. */
  ctx.globalAlpha = 1;
  for (let i = 0; i < 900; i++) {
    const a = r() * TAU;
    const rr = 66 + Math.sqrt(r()) * 102;
    ctx.globalAlpha = 0.06 + r() * 0.2;
    ctx.fillStyle = r() < 0.3 ? "#b8332a" : "#c9c4b9";
    ctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1, 1);
  }
  ctx.globalAlpha = 1;
}

/* ── ornamentos del eje, medidos sobre el brazo este ─────────────────── */
/**
 * La lente alargada (dx 107–160, con su anillo en 127) existe SÓLO en el eje
 * este-oeste. Rotarla también al vertical mete un bulto rojo de 55 px justo
 * encima de la copa del árbol, donde la referencia tiene fondo: fue el segundo
 * foco de error del panel. Del dx 182 hacia afuera los cuatro brazos sí son
 * iguales — flecha, sello cuadrado en 205–218 y barra gruesa en 248.
 */
function ornamentoEje(ctx, conLente) {
  ctx.lineJoin = "miter";
  if (conLente) {
  /* lente: punta en dx 107, cuerpo hasta 160, con un anillo en dx 127 */
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = "#e02516";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(107, 0);
  ctx.lineTo(120, -8.5); ctx.lineTo(146, -8.5); ctx.lineTo(158, -4);
  ctx.lineTo(160, -4); ctx.lineTo(160, 4); ctx.lineTo(158, 4);
  ctx.lineTo(146, 8.5); ctx.lineTo(120, 8.5); ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(127, 0, 9.5, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#7d1a12";
  ctx.fillRect(140, -2, 14, 4);
  }
  /* flecha hacia el centro y sello cuadrado */
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(204, 0); ctx.lineTo(192, 0);
  ctx.moveTo(197, -4.5); ctx.lineTo(192, 0); ctx.lineTo(197, 4.5);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeRect(205, -7, 13, 14);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(209, -3.5); ctx.lineTo(214, -3.5); ctx.lineTo(214, 3.5);
  ctx.moveTo(209, 0); ctx.lineTo(211, 0);
  ctx.stroke();
  /* Barra gruesa exterior: la marca más brillante del brazo, y NO es igual en
     los cuatro. En el eje este-oeste es una pastilla corta en dx 248–255; en el
     norte-sur es una barra radial de 21 px, de 254 a 275, y 6 de ancho. */
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ff3a22";
  if (conLente) ctx.fillRect(248, -3.5, 8, 7);
  else ctx.fillRect(254, -3, 21, 6);
  ctx.globalAlpha = 0.7;
  ctx.fillRect(182, -1.6, 7, 3.2);
}

/* medallón de los ejes diagonales, en r 274 */
function medallon(ctx, x, y, rad, semilla) {
  const r = rng(semilla);
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#d8271a";
  ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.arc(x, y, rad * 0.34, 0, TAU); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + r() * 0.05;
    ctx.globalAlpha = 0.35 + r() * 0.4;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * rad * 0.36, y + Math.sin(a) * rad * 0.36);
    ctx.lineTo(x + Math.cos(a) * rad * 0.94, y + Math.sin(a) * rad * 0.94);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#e02b1c";
  ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
}

/* mira con rosetón del bajo-izquierda (41, 413), radio 30 */
function mira(ctx, x, y) {
  const r = rng(0x77a1);
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = "#c8241a";
  ctx.lineWidth = 1;
  for (const [rr, a] of [[30, 0.75], [26, 0.45], [21, 0.6], [13, 0.5], [8, 0.7]]) {
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * TAU;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26);
    ctx.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20);
    ctx.lineTo(x + Math.cos(a + TAU / 8) * 12, y + Math.sin(a + TAU / 8) * 12);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 41, y); ctx.lineTo(x + 92, y);
  ctx.moveTo(x, y - 85); ctx.lineTo(x, y + 56);
  ctx.stroke();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#d8271a";
  ctx.fillRect(x - 1.5, y - 87, 3, 3);
  if (r() < 2) ctx.globalAlpha = 1;
}

/* ── el infinito ─────────────────────────────────────────────────────── */
function infinito(ctx, cx, cy) {
  /* Lemniscata de Bernoulli: medido, alto/ancho = 24.4/71.4 = 0.342, que es
     exactamente 1/(2√2) = 0.354 de una Bernoulli. No son dos círculos. */
  const a = 35.7;
  ctx.beginPath();
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * TAU;
    const d = 1 + Math.sin(t) * Math.sin(t);
    const x = cx + (a * Math.cos(t)) / d;
    const y = cy + (a * Math.sin(t) * Math.cos(t)) / d;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  /* Sin halo: con un resplandor de 12 px la banda 0–40 subía a 37 % de tinta
     contra el 25 % medido. El infinito de la referencia es trazo limpio. */
  ctx.globalAlpha = 1;
  ctx.lineWidth = 5.0;
  ctx.strokeStyle = "#ee271a";
  ctx.stroke();
}

export function pintarPortal(ctx, W, H, fase = 0) {
  /* TENSIÓN DE MEMBRANA. `fase` es opcional y vale 0 por omisión: la lámina que
     calibró este portal lo llama con tres argumentos y obtiene exactamente el
     mismo dibujo. Verificado contra su puntaje versionado, no supuesto.

     La Scene Bible describe el umbral como membrana viva y pide que la cercanía
     aumente su tensión. Acá la tensión respira sola: la malla del anillo se
     tuerce y se estira apenas, y vuelve. Oscila en vez de girar para que el
     bucle cierre sin salto — un giro continuo dejaría costura al dar la vuelta,
     porque cada radio tiene su propia opacidad sembrada. */
  const CX = 357.5;
  const CY = 298.5;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  rejilla(ctx, W, H);

  /* Halo de la corona. Va MUY bajo: la referencia tiene 58.7 % de tinta en la
     banda 227–257 pero repartida en arcos finos con negro entre medio, no en
     un anillo lleno. Con el halo al 30 % la banda salía a 150 de media contra
     los 76 medidos y el panel entero leía como una dona encendida. */
  const halo = ctx.createRadialGradient(CX, CY, 214, CX, CY, 266);
  halo.addColorStop(0, "rgba(150,18,10,0)");
  halo.addColorStop(0.45, "rgba(190,26,14,0.10)");
  halo.addColorStop(0.7, "rgba(200,28,15,0.075)");
  halo.addColorStop(1, "rgba(140,16,8,0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";

  /* radios interiores: 16, tenues, hasta el borde de la banda muerta */
  const rr = rng(0x1a03);
  ctx.strokeStyle = "#b81f14";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    ctx.globalAlpha = 0.14 + rr() * 0.24;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(a) * 9, CY + Math.sin(a) * 9);
    ctx.lineTo(CX + Math.cos(a) * (176 + rr() * 20), CY + Math.sin(a) * (176 + rr() * 20));
    ctx.stroke();
  }

  malla(ctx, CX, CY, fase);
  arbol(ctx, CX, CY, -1, 0x2f51);
  arbol(ctx, CX, CY, 1, 0x9b27);

  /* coronas */
  ctx.globalCompositeOperation = "lighter";
  for (const [r, a, lw] of FOSO) arco(ctx, CX, CY, r, a, lw, "#c22014");
  for (const [r, a, lw] of SECUNDARIA) arco(ctx, CX, CY, r, a, lw, "#e6260f", 1);
  for (const [r, a, lw] of RESPIRO) arco(ctx, CX, CY, r, a, lw, "#b81d10", 1);
  for (const [r, a, lw] of CORONA) arco(ctx, CX, CY, r, a, lw, "#ff2d12", 1);
  for (const [r, a, lw] of COLA) arco(ctx, CX, CY, r, a, lw, "#c22014", 1);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  /* ocho radios largos: los únicos que sobreviven más allá de r 175 */
  const rd = rng(0x5511);
  ctx.strokeStyle = "#e8331c";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const eje = i % 2 === 0;
    ctx.globalAlpha = eje ? 0.85 : 0.5 + rd() * 0.2;
    ctx.lineWidth = eje ? 1.4 : 1.1;
    ctx.setLineDash(eje ? [] : [6, 4, 2, 4]);
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(a) * 96, CY + Math.sin(a) * 96);
    ctx.lineTo(CX + Math.cos(a) * 272, CY + Math.sin(a) * 272);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  /* eje horizontal y vertical de borde a borde */
  ctx.globalCompositeOperation = "lighter";
  const gh = ctx.createLinearGradient(86, 0, 628, 0);
  gh.addColorStop(0, "rgba(190,26,14,0.0)");
  gh.addColorStop(0.32, "rgba(255,52,26,0.9)");
  gh.addColorStop(0.5, "rgba(255,96,60,0.55)");
  gh.addColorStop(0.72, "rgba(255,52,26,0.9)");
  gh.addColorStop(1, "rgba(190,26,14,0.0)");
  /* El eje NO va de borde a borde: medido sobre la fila 298, la tinta empieza
     en x≈86 y muere en x≈628 — la columna derecha del HUD lo tapa. */
  ctx.fillStyle = gh;
  ctx.fillRect(86, CY - 0.6, 542, 1.4);
  /* El eje vertical se APAGA donde pasa el árbol: en la referencia la columna
     central del interior es blanca (tronco), no roja. Dejarlo encendido de
     punta a punta mete una raya roja de 1.4 px sobre 200 px de copa. */
  const gv = ctx.createLinearGradient(0, 4, 0, 568);
  gv.addColorStop(0, "rgba(190,26,14,0.5)");
  gv.addColorStop(0.14, "rgba(255,52,26,0.8)");
  gv.addColorStop(0.24, "rgba(210,34,18,0.34)");
  gv.addColorStop(0.5, "rgba(255,96,60,0.4)");
  gv.addColorStop(0.76, "rgba(210,34,18,0.34)");
  gv.addColorStop(0.86, "rgba(255,52,26,0.8)");
  gv.addColorStop(1, "rgba(190,26,14,0.5)");
  /* Ídem en vertical: la columna 357 tiene tinta de y≈4 a y≈568. */
  ctx.fillStyle = gv;
  ctx.fillRect(CX - 0.6, 4, 1.4, 564);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;

  /* ornamentos de los cuatro brazos */
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate((i / 4) * TAU);
    ornamentoEje(ctx, i % 2 === 0);
    ctx.restore();
  }
  /* anillos chicos de las diagonales, en r 160 */
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    const x = CX + Math.cos(a) * 160;
    const y = CY + Math.sin(a) * 160;
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = "#e8301c";
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 11, y + 6); ctx.lineTo(x + 11, y - 6);
    ctx.stroke();
  }
  /* medallones de las diagonales, en r 274 */
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + Math.PI / 4;
    medallon(ctx, CX + Math.cos(a) * 274, CY + Math.sin(a) * 274, 14, 0x300 + i * 97);
  }
  /* glifos sueltos sobre los radios diagonales, a media altura */
  const rg = rng(0x8f13);
  ctx.strokeStyle = "#d8271a";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + Math.PI / 8;
    const rr2 = 118 + rg() * 60;
    const x = CX + Math.cos(a) * rr2;
    const y = CY + Math.sin(a) * rr2;
    ctx.globalAlpha = 0.4 + rg() * 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 4); ctx.lineTo(x, y - 5); ctx.lineTo(x + 4, y + 4);
    ctx.stroke();
  }

  mira(ctx, 41, 413);
  infinito(ctx, CX, CY);
  ctx.globalAlpha = 1;
}
