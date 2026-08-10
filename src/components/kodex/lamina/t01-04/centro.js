/**
 * KODEX-∞ · t01-04 ARCHIVE TREE · ORGANISMOS DEL BLOQUE CENTRO
 *
 * Dos lienzos procedurales, ni un bitmap:
 *
 *  · `pintarArbol` — el héroe. Copa fractal, tronco e infinito, y raíces que
 *    NO son la copa reflejada: en la referencia la copa es un casquete alto
 *    (de y=121 a y=320 sobre 350 px de ancho) y la raíz es un abanico plano
 *    (de y=358 a y=495 sobre 430 px). Espejarla —que es lo primero que uno
 *    hace— da una figura de reloj de arena que el original no tiene.
 *
 *  · `pintarHabitat` — la cámara del panel 08: cúpula, anillos de piso, muros
 *    de instrumentos y la silueta. Es una escena, no un diagrama, así que se
 *    pinta por capas de profundidad y no por geometría exacta.
 *
 * DETERMINISMO. Todo sale de `rng(semilla)` y nunca de `Math.random()`: el
 * banco compara píxel a píxel y con azar real dos capturas de la misma página
 * dan puntajes distintos, así que el equipo persigue ruido en vez de converger.
 */

/** Mulberry32. Mismo generador que el kit; barato, sin estado global. */
export function rng(semilla) {
  let a = semilla >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function ctx2d(cv, w, h) {
  const dpr = 2;
  cv.width = w * dpr;
  cv.height = h * dpr;
  const c = cv.getContext("2d");
  c.scale(dpr, dpr);
  return c;
}

/* ── el árbol ──────────────────────────────────────────────────────────── */

/**
 * Una rama y su descendencia. El grosor decae más rápido que el largo porque
 * en la referencia la copa termina en filamentos de menos de un píxel mientras
 * las ramas madre siguen midiendo cuatro: con el mismo decaimiento para los dos
 * sale un coral, no un árbol.
 */
function rama(ctx, r, p) {
  const { x, y, ang, len, gros, prof, curva, abre, cae, larg, del, tinta, brote } = p;
  if (prof < 0 || len < 0.7) return;

  // El eje no es recto: cada tramo se dibuja como una cuadrática con la
  // tangente girada. Ramas rectas leen como un diagrama de nodos.
  const a2 = ang + curva * (r() - 0.5);
  const mx = x + Math.cos(ang) * len * 0.5;
  const my = y + Math.sin(ang) * len * 0.5;
  const x2 = x + Math.cos((ang + a2) / 2) * len;
  const y2 = y + Math.sin((ang + a2) / 2) * len;

  ctx.lineWidth = gros;
  ctx.strokeStyle = tinta(prof);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.stroke();

  if (prof === 0) {
    // Punta: un punto de luz. Es lo que le da grano a la masa de la copa.
    if (r() < brote) {
      ctx.fillStyle = tinta(-1);
      ctx.beginPath();
      ctx.arc(x2, y2, 0.55 + r() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  const n = r() < 0.34 ? 3 : 2;
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1) - 0.5;
    /* PODA. Sin esto todas las puntas caen al mismo radio y la copa sale hueca
       —un anillo de follaje con el centro vacío—, que es exactamente lo que
       pasó en la segunda pasada y costó 6,6 puntos. Terminar una de cada cinco
       ramas dos niveles antes es lo que llena el interior. */
    const salto = r() < p.poda ? 2 : 1;
    rama(ctx, r, {
      x: x2,
      y: y2,
      ang: a2 + t * abre * (0.72 + r() * 0.62) + cae,
      len: len * larg * (0.80 + r() * 0.38),
      gros: Math.max(0.32, gros * del),
      prof: prof - salto,
      curva,
      abre,
      cae,
      larg,
      del,
      tinta,
      brote,
      poda: p.poda,
    });
  }
}


/**
 * Tronco. NO es una línea de grosor constante ni un cono recto: en la
 * referencia se mantiene delgado casi toda su altura y se ABRE de golpe en el
 * último tercio, al entrar al cuello de la raíz. El perfil es (t^expo).
 *
 * Los dos errores están medidos. Con un stroke de ancho fijo la columna del eje
 * se pasaba 25 puntos de luminancia y sus vecinas quedaban 20 por debajo: la
 * mancha del póster es ANCHA abajo, no brillante en el medio. Con un cono recto
 * el número mejora pero el árbol sale con pie de copa de vino, que tampoco es
 * lo que hay en la referencia.
 */
function tronco(ctx, cx, yTop, yBase, wTop, wBase, expo, capas) {
  const N = 26;
  for (const [k, c] of capas) {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const w = (wTop + (wBase - wTop) * Math.pow(t, expo)) * k;
      const y = yTop + (yBase - yTop) * t;
      if (i === 0) ctx.moveTo(cx - w - 0.8, y); else ctx.lineTo(cx - w, y);
    }
    for (let i = N; i >= 0; i--) {
      const t = i / N;
      const w = (wTop + (wBase - wTop) * Math.pow(t, expo)) * k;
      ctx.lineTo(cx + w + (i === 0 ? 0.8 : 0), yTop + (yBase - yTop) * t);
    }
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
  }
}

/**
 * El héroe. Lienzo de 575×390 anclado en (405,112) del póster; el eje del
 * tronco cae en x=294 del lienzo, que es la columna de más energía del recorte
 * (181 de luminancia media contra 130 de sus vecinas) — no el centro
 * geométrico, que está en 287.
 */
export function pintarArbol(ctx, W, H) {
  ctx.clearRect(0, 0, W, H);

  const CX = 294;      // eje del tronco (póster x=699)
  const SUELO = 246;   // arranque de la raíz (póster y=358)
  const FORK = 150;    // primer horcón (póster y=262)

  /* ── retícula técnica ────────────────────────────────────────────────
     Muy tenue —2 a 4 de luminancia media— pero es tinta real del original y
     cubre el panel entero. Paso medido: 9,7 px en las dos direcciones. */
  ctx.save();
  ctx.strokeStyle = "rgba(96,104,44,0.055)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 1.5; x < W; x += 9.7) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 3.5; y < H; y += 9.7) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.restore();

  /* ── arcos de fondo ──────────────────────────────────────────────────
     Dos elipses concéntricas alrededor del árbol. Se midieron por sus cruces
     con la fila y=250 del póster (x=472 y x=505 a la izquierda, x=888 y x=926
     a la derecha): centro en x=699 y radios 216 y 204. */
  ctx.save();
  ctx.lineWidth = 1;
  for (const [rx, ry, a] of [[216, 192, 0.26], [204, 181, 0.19], [230, 205, 0.09]]) {
    ctx.strokeStyle = `rgba(138,158,52,${a})`;
    ctx.beginPath();
    ctx.ellipse(CX, 158, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  /* ── copa ────────────────────────────────────────────────────────────
     Fuste hasta el horcón, seis brazos madre desde ahí, seis ramas más que
     salen del fuste a media altura y cuatro brazos bajos para los hombros. El
     decaimiento de largo (0,775) y el de grosor (0,605) son distintos a
     propósito: en la referencia la copa termina en filamentos de menos de un
     píxel mientras las ramas madre siguen midiendo cuatro. */
  const tintaCopa = (prof) => {
    if (prof < 0) return "rgba(226,246,150,0.85)";
    const k = Math.min(1, prof / 6);
    const l = 0.36 + 0.5 * (1 - k);
    return `rgba(${Math.round(120 + 96 * l)},${Math.round(148 + 100 * l)},${Math.round(30 + 66 * l)},${0.5 + 0.34 * (1 - k)})`;
  };

  tronco(ctx, CX, FORK - 30, SUELO + 8, 5.6, 23, 2.1, [
    [1.0, "rgba(88,102,22,0.24)"], [0.62, "rgba(122,142,34,0.24)"],
    [0.34, "rgba(166,192,58,0.30)"], [0.15, "rgba(206,232,132,0.40)"],
  ]);
  /* Fibra del tronco. Cada hilo sigue el MISMO perfil que la silueta y se
     queda en su posición relativa: es veta de madera, no un chorro. Con los
     hilos convergiendo a un punto el pie del árbol se lee como el escape de un
     cohete, que es exactamente lo que pasó en la pasada anterior. */
  const rt = rng(0x3ae1);
  const perfil = (t) => 5.0 + (21 - 5.0) * Math.pow(t, 2.1);
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 46; i++) {
    const u = (rt() - 0.5) * 1.85;
    const desvio = (rt() - 0.5) * 0.30;
    ctx.strokeStyle = `rgba(198,224,110,${0.06 + rt() * 0.17})`;
    ctx.beginPath();
    for (let n = 0; n <= 12; n++) {
      const t = n / 12;
      const x = CX + (u + desvio * Math.sin(t * 3.1)) * perfil(t);
      const y = (FORK - 30) + (SUELO + 8 - (FORK - 30)) * t;
      if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /* La copa mide 353 px de ancho por 199 de alto (x 520–873, y 121–320 del
     póster). El alcance de una rama es len·(1−larg^n)/(1−larg), así que el
     primer tramo y el ángulo de apertura no son libres: con 40 px de tramo la
     copa se pasaba de alto y se salía por arriba del panel, y con 30 quedaba
     90 px angosta. 33 px con los brazos abiertos a 0,88 rad da los dos ejes. */
  const rc = rng(0x41c7);
  const BRAZOS = [-1.34, -0.82, -0.30, 0.22, 0.76, 1.30];
  for (const off of BRAZOS) {
    rama(ctx, rc, {
      x: CX + off * 3,
      y: FORK + Math.abs(off) * 12,
      ang: -Math.PI / 2 + off * 0.88,
      len: 33 + rc() * 9,
      gros: 5.4 - Math.abs(off) * 1.0,
      prof: 7,
      curva: 0.42,
      abre: 1.10,
      cae: -0.03,
      larg: 0.775,
      del: 0.605,
      tinta: tintaCopa,
      brote: 0.26,
      poda: 0.22,
    });
  }
  // Seis ramas que salen del TRONCO, no del horcón: en la referencia el fuste
  // no es un tramo liso, va soltando ramas desde media altura.
  for (const [h, off] of [[0.18, -1.0], [0.26, 0.95], [0.36, -0.85], [0.44, 0.8], [0.56, -0.7], [0.62, 0.7]]) {
    rama(ctx, rc, {
      x: CX + off * 3, y: FORK + (SUELO - FORK) * h,
      ang: -Math.PI / 2 + off * 1.05, len: 15 + rc() * 6, gros: 2.0,
      prof: 5, curva: 0.4, abre: 0.98, cae: -0.10, larg: 0.77, del: 0.6,
      tinta: tintaCopa, brote: 0.22, poda: 0.22,
    });
  }

  // Cuatro brazos bajos que llenan los hombros: sin ellos la copa se lee como
  // un hongo y el original es un casquete que baja hasta y=320.
  for (const off of [-1.70, -1.10, 1.08, 1.62]) {
    rama(ctx, rc, {
      x: CX + off * 4,
      y: FORK + 30,
      ang: -Math.PI / 2 + off * 0.84,
      len: 30,
      gros: 3.2,
      prof: 6,
      curva: 0.44,
      abre: 1.04,
      cae: 0.06,
      larg: 0.77,
      del: 0.60,
      tinta: tintaCopa,
      brote: 0.26,
      poda: 0.22,
    });
  }

  /* ── follaje ─────────────────────────────────────────────────────────
     El esqueleto recursivo da la silueta pero no la MASA: medido bloque a
     bloque contra la referencia, el interior de la copa quedaba 25 puntos de
     luminancia por debajo mientras el contorno se pasaba. La copa del póster
     no es un esqueleto: es una mata de filamentos de dos píxeles. Se siembran
     dentro de la envolvente medida —centro (294,108) del lienzo, semiejes 177
     y 99— con la densidad cayendo como (1−r²)^0,7 desde el centro. */
  const rf = rng(0x6b2d);
  const FX = 294, FY = 106, FRX = 181, FRY = 101;
  ctx.lineWidth = 0.62;
  for (let i = 0; i < 2900; i++) {
    const a = rf() * Math.PI * 2;
    const rad = Math.sqrt(rf());
    const x = FX + Math.cos(a) * rad * FRX;
    const y = FY + Math.sin(a) * rad * FRY;
    /* El peso no es sólo radial: la referencia tiene una CRESTA sobre el eje
       del tronco —las ramas madre convergen ahí— y medida bloque a bloque la
       columna x=294±40 quedaba 20 puntos por debajo con un peso puramente
       radial. El segundo término es esa cresta. */
    const w = Math.pow(Math.max(0, 1 - rad * rad), 0.60)
            * (1 + 0.45 * Math.exp(-Math.pow((x - FX) / 40, 2)));
    if (rf() > w * 1.05) continue;
    const dir = Math.atan2(y - (FY + 62), x - FX) + (rf() - 0.5) * 1.5;
    const l = 3 + rf() * 7;
    ctx.strokeStyle = `rgba(${150 + Math.round(rf() * 60)},${176 + Math.round(rf() * 56)},${44 + Math.round(rf() * 60)},${0.058 + rf() * 0.24 * w + 0.036})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(dir) * l, y + Math.sin(dir) * l);
    ctx.stroke();
  }

  /* ── raíces ──────────────────────────────────────────────────────────
     Abanico plano: los brazos salen casi horizontales y sólo caen. Con el
     mismo `abre` de la copa el sistema baja en vez de extenderse y el panel
     pierde los 430 px de ancho que la referencia sí tiene. */
  const tintaRaiz = (prof) => {
    if (prof < 0) return "rgba(214,236,140,0.42)";
    const k = Math.min(1, prof / 6);
    const l = 0.3 + 0.46 * (1 - k);
    return `rgba(${Math.round(112 + 92 * l)},${Math.round(132 + 96 * l)},${Math.round(26 + 60 * l)},${0.22 + 0.20 * (1 - k)})`;
  };

  const rr = rng(0x9e13);
  const N_RAIZ = 17;
  for (let i = 0; i < N_RAIZ; i++) {
    const t = i / (N_RAIZ - 1);            // 0 izquierda · 1 derecha
    const lado = t < 0.5 ? -1 : 1;
    const u = Math.abs(t - 0.5) * 2;        // 0 centro · 1 extremo
    rama(ctx, rr, {
      x: CX + (t - 0.5) * 18,
      y: SUELO + 4 + (1 - u) * 6,
      ang: Math.PI / 2 - lado * (0.34 + 0.66 * u) * 1.30,
      len: 21 + u * 12 + rr() * 7,
      gros: 2.8 - u * 0.9,
      prof: 7,
      curva: 0.26,
      abre: 0.66,
      cae: lado * 0.05,
      larg: 0.795,
      del: 0.635,
      tinta: tintaRaiz,
      brote: 0.36,
      poda: 0.26,
    });
  }
  /* Cabellera. Va CORTA y DENSA cerca del centro: en la referencia la raíz es
     un abanico que se apaga hacia afuera, no una explosión de rayos. La primera
     pasada tiraba 220 filamentos de hasta 210 px y llenaba las esquinas del
     panel de tinta que el original no tiene. */
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 170; i++) {
    const a = (rr() - 0.5) * 2.55;
    const l = 22 + rr() * rr() * 132;
    const x0 = CX + (rr() - 0.5) * 26;
    const y0 = SUELO + 6 + rr() * 12;
    ctx.strokeStyle = `rgba(150,172,44,${0.035 + rr() * 0.09})`;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(
      x0 + Math.sin(a) * l * 0.6,
      y0 + Math.cos(a) * l * 0.16,
      x0 + Math.sin(a) * l,
      y0 + Math.cos(a) * l * 0.34
    );
    ctx.stroke();
  }
  // Motas de nodo sobre las raíces.
  for (let i = 0; i < 90; i++) {
    const a = (rr() - 0.5) * 2.6;
    const l = 18 + rr() * rr() * 170;
    ctx.fillStyle = `rgba(206,232,124,${0.08 + rr() * 0.26})`;
    ctx.beginPath();
    ctx.arc(CX + Math.sin(a) * l, SUELO + 8 + Math.cos(a) * l * 0.32, 0.45 + rr() * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Tres raíces casi verticales. Sin ellas queda un agujero negro justo debajo
     del ∞: el abanico arranca a 0,34 rad del eje y nadie ocupa la vertical. */
  for (const off of [-0.20, 0.02, 0.24]) {
    rama(ctx, rr, {
      x: CX + off * 14, y: SUELO + 6,
      ang: Math.PI / 2 + off, len: 21, gros: 1.9, prof: 5,
      curva: 0.30, abre: 0.60, cae: 0, larg: 0.79, del: 0.63,
      tinta: tintaRaiz, brote: 0.34, poda: 0.26,
    });
  }

  /* Mata densa del cuello de la raíz: en la referencia los 60 px que rodean el
     ∞ son la zona de más tinta de toda la mitad inferior. */
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 420; i++) {
    const a = (rr() - 0.5) * 3.05;
    const l = 6 + rr() * rr() * 78;
    const x0 = CX + (rr() - 0.5) * 22;
    const y0 = SUELO + rr() * 8;
    ctx.strokeStyle = `rgba(168,192,54,${0.10 + rr() * 0.24})`;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + Math.sin(a) * l, y0 + Math.cos(a) * l * 0.62);
    ctx.stroke();
  }

  /* Motas rojas. Son pocas —unas treinta en todo el panel— pero están en la
     referencia y son el único color frío de la lámina. */
  const rx = rng(0x1d55);
  for (let i = 0; i < 34; i++) {
    const x = 20 + rx() * (W - 40);
    const y = 10 + rx() * (H - 30);
    ctx.fillStyle = `rgba(190,36,18,${0.35 + rx() * 0.5})`;
    ctx.fillRect(x, y, 1.2 + rx(), 1.2);
  }

  /* Ensanche del pie: el tronco no entra al suelo, se abre. */
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 26; i++) {
    const s = i % 2 ? 1 : -1;
    const w = 4 + (i / 26) * 20;
    ctx.strokeStyle = `rgba(178,204,70,${0.10 + rc() * 0.2})`;
    ctx.lineWidth = 0.8 + rc() * 1.1;
    ctx.beginPath();
    ctx.moveTo(CX + s * 1, SUELO - 34);
    ctx.quadraticCurveTo(CX + s * w * 0.4, SUELO - 6, CX + s * w, SUELO + 14 + rc() * 8);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";
}

/* ── arco punteado del pie del diagrama ─────────────────────────────────── */
export function pintarArcoPunteado(ctx) {
  ctx.save();
  ctx.setLineDash([1.6, 4.2]);
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = "rgba(176,96,20,0.62)";
  ctx.beginPath();
  ctx.moveTo(173, 372);
  ctx.quadraticCurveTo(298, 386, 438, 369);
  ctx.stroke();
  ctx.restore();
}

/* ── la cámara del panel 08 ────────────────────────────────────────────── */

/**
 * 08. ENVIRONMENT / HABITAT MOCKUP. Lienzo de 500×223 anclado en (474,622).
 * No es un diagrama: es una foto de estudio del mismo organismo, así que se
 * arma por capas de profundidad —muros, cúpula, árbol, piso, figura— y cada
 * capa se apaga con la distancia.
 */
export function pintarHabitat(ctx, W, H) {
  const r = rng(0x2f81);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#050603";
  ctx.fillRect(0, 0, W, H);

  const CX = 238;   // eje de la cámara (póster x=713)
  const PISO = 196; // línea de piso (póster y=818)

  /* ── cúpula ──────────────────────────────────────────────────────────
     Se ve DESDE ABAJO: los anillos son elipses que se abren hacia afuera y
     hacia abajo, no un arco. El borde de la cúpula cruza el lienzo en y≈62 a
     los costados y sube a y≈0 en el eje. */
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(126,140,58,${0.30 - i * 0.03})`;
    ctx.beginPath();
    ctx.ellipse(CX, -34, 60 + i * 32, 24 + i * 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    ctx.strokeStyle = `rgba(120,132,58,${0.05 + r() * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(CX, -34);
    ctx.lineTo(CX + Math.cos(a) * 250, -34 + Math.sin(a) * 105);
    ctx.stroke();
  }
  // Luminarias del techo: barras cortas muy claras, cuatro por lado.
  for (const [x, y, w, b] of [[24, 26, 26, 0.9], [58, 16, 22, 0.7], [96, 30, 18, 0.55],
                              [388, 30, 18, 0.55], [424, 16, 22, 0.7], [452, 26, 26, 0.9]]) {
    ctx.fillStyle = `rgba(206,224,180,${0.42 * b})`;
    ctx.fillRect(x, y, w, 2.2);
    ctx.fillStyle = `rgba(150,170,120,${0.16 * b})`;
    ctx.fillRect(x - 3, y - 2, w + 6, 6);
  }
  ctx.restore();

  /* ── muros de instrumento ────────────────────────────────────────────
     Ocho consolas en perspectiva. Las de afuera son más altas y más claras;
     las del centro, más angostas y apagadas. Cada una lleva su propia maraña
     de nodos: en la referencia se lee contenido, no una superficie lisa. */
  const consola = (x0, y0, w, h, b) => {
    ctx.fillStyle = "rgba(10,12,9,0.96)";
    ctx.fillRect(x0, y0, w, h);
    ctx.strokeStyle = `rgba(150,166,72,${0.30 * b})`;
    ctx.lineWidth = 0.7;
    ctx.strokeRect(x0 + 0.5, y0 + 0.5, w - 1, h - 1);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, w, h);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    const nn = 14;
    const nodos = [];
    for (let i = 0; i < nn; i++) nodos.push([x0 + 3 + r() * (w - 6), y0 + 3 + r() * (h - 6)]);
    for (const [ax, ay] of nodos) for (const [bx, by] of nodos) {
      const d = Math.hypot(ax - bx, ay - by);
      if (d < 1 || d > 26) continue;
      ctx.strokeStyle = `rgba(168,190,64,${(0.10 + (1 - d / 26) * 0.34) * b})`;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    for (const [ax, ay] of nodos) {
      ctx.fillStyle = `rgba(214,236,120,${(0.24 + r() * 0.4) * b})`;
      ctx.beginPath();
      ctx.arc(ax, ay, 0.7 + r() * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    // Renglones de micrografía: manchas de dos píxeles, no texto.
    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = `rgba(160,178,88,${(0.10 + r() * 0.26) * b})`;
      ctx.fillRect(x0 + 3 + r() * (w - 10), y0 + 4 + r() * (h - 8), 1.4 + r() * 5, 0.9);
    }
    ctx.restore();
  };

  for (const [x0, y0, w, h, b] of [
    [16, 62, 34, 122, 0.95], [54, 68, 58, 110, 1.0], [116, 74, 54, 98, 0.72],
    [174, 80, 40, 86, 0.42],
    [286, 80, 40, 86, 0.42], [330, 74, 54, 98, 0.72], [388, 68, 58, 110, 1.0],
    [450, 62, 34, 122, 0.95],
  ]) consola(x0, y0, w, h, b);

  // Estandartes rojos de los extremos: es el único rojo saturado de la escena.
  for (const x0 of [4, 486]) {
    const g = ctx.createLinearGradient(0, 66, 0, 182);
    g.addColorStop(0, "rgba(84,10,8,0.12)");
    g.addColorStop(0.45, "rgba(184,26,16,0.62)");
    g.addColorStop(1, "rgba(60,8,6,0.14)");
    ctx.fillStyle = g;
    ctx.fillRect(x0, 66, 11, 116);
  }

  /* ── el organismo ───────────────────────────────────────────────────
     Copa MUY plana: 190×57 en el póster (x 617–807, y 625–682). Con la copa
     alta del diagrama —que es lo primero que uno reusa— la cámara sale con un
     chupetín en el medio y el techo vacío. */
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  const tinta = (prof) => {
    if (prof < 0) return "rgba(216,240,140,0.7)";
    const k = Math.min(1, prof / 5);
    return `rgba(${Math.round(138 + 72 * (1 - k))},${Math.round(164 + 76 * (1 - k))},${Math.round(36 + 60 * (1 - k))},${0.30 + 0.26 * (1 - k)})`;
  };
  /* Tronco de la cámara: mismo perfil que el del diagrama. */
  tronco(ctx, CX, 44, PISO - 2, 2.4, 12, 2.2, [
    [1.0, "rgba(88,104,24,0.28)"], [0.55, "rgba(134,158,40,0.32)"],
    [0.28, "rgba(184,212,70,0.40)"], [0.12, "rgba(220,242,150,0.48)"],
  ]);

  const ra = rng(0x77b2);
  for (const off of [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5]) {
    rama(ctx, ra, {
      x: CX, y: 44, ang: -Math.PI / 2 + off * 1.02, len: 19, gros: 2.2,
      prof: 6, curva: 0.4, abre: 1.12, cae: 0.10, larg: 0.78, del: 0.6,
      tinta, brote: 0.34, poda: 0.24,
    });
  }
  // Mata de la copa dentro de la envolvente medida.
  ctx.lineWidth = 0.55;
  for (let i = 0; i < 1500; i++) {
    const a = ra() * Math.PI * 2;
    const rad = Math.sqrt(ra());
    const x = CX + Math.cos(a) * rad * 104;
    const y = 31 + Math.sin(a) * rad * 33;
    const wgt = Math.pow(Math.max(0, 1 - rad * rad), 0.6);
    if (ra() > wgt * 1.1) continue;
    const dir = ra() * Math.PI * 2;
    ctx.strokeStyle = `rgba(172,198,60,${0.12 + ra() * 0.40 * wgt})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(dir) * (2 + ra() * 5), y + Math.sin(dir) * (1 + ra() * 3));
    ctx.stroke();
  }
  // Raíces sobre el piso: abanico plano de 165×50.
  for (let i = 0; i < 1050; i++) {
    const a = ra() * Math.PI * 2;
    const rad = Math.sqrt(ra());
    const x = CX + Math.cos(a) * rad * 84;
    const y = PISO - 22 + Math.sin(a) * rad * 26;
    const wgt = Math.pow(Math.max(0, 1 - rad * rad), 0.8);
    if (ra() > wgt * 1.1) continue;
    ctx.strokeStyle = `rgba(164,188,54,${0.10 + ra() * 0.34 * wgt})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (ra() - 0.5) * 9, y + (ra() - 0.5) * 4);
    ctx.stroke();
  }
  // Motas en suspensión: la mitad del brillo de la escena sale de acá.
  for (let i = 0; i < 340; i++) {
    const a = ra() * Math.PI * 2;
    const l = ra() * ra() * 160;
    ctx.fillStyle = `rgba(212,238,120,${0.10 + ra() * 0.44})`;
    ctx.fillRect(CX + Math.cos(a) * l, 26 + ra() * 172, 0.9, 0.9);
  }
  ctx.restore();

  /* ── piso ───────────────────────────────────────────────────────────
     Anillos concéntricos vistos en escorzo: la razón alto/ancho es 0,25, que es
     la del original, no la de una circunferencia. */
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = 0.8;
  for (let i = 1; i <= 8; i++) {
    ctx.strokeStyle = `rgba(146,162,74,${0.30 - i * 0.028})`;
    ctx.beginPath();
    ctx.ellipse(CX, PISO + 6, i * 30, i * 7.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.strokeStyle = `rgba(120,134,60,${0.06 + r() * 0.10})`;
    ctx.beginPath();
    ctx.moveTo(CX, PISO + 6);
    ctx.lineTo(CX + Math.cos(a) * 250, PISO + 6 + Math.sin(a) * 62);
    ctx.stroke();
  }
  ctx.restore();

  /* ── figura ─────────────────────────────────────────────────────────
     Recorta el árbol: por eso va DESPUÉS del organismo y en source-over. */
  ctx.fillStyle = "rgba(1,1,1,0.92)";
  ctx.beginPath();
  ctx.moveTo(CX - 4.5, 204);
  ctx.lineTo(CX - 4, 166);
  ctx.quadraticCurveTo(CX - 3.6, 158, CX - 1.6, 157);
  ctx.quadraticCurveTo(CX + 1.6, 156.4, CX + 2.2, 160);
  ctx.quadraticCurveTo(CX + 3.4, 163, CX + 3.6, 168);
  ctx.lineTo(CX + 4, 204);
  ctx.closePath();
  ctx.fill();

  /* ── viñeta ─────────────────────────────────────────────────────────
     La cámara del póster está muy oscura en las esquinas; sin esto los muros
     de los extremos sobran 20 puntos de luminancia. */
  const v = ctx.createRadialGradient(CX, 105, 60, CX, 105, 320);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(0,0,0,0.66)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

/* ── el diagrama de nodos del panel vecino que cae dentro de esta caja ─── */

/** Trocito del cuadro 4 de «07. MOTION NOTES», cuya caja termina en x=457 del
 *  póster: los 57 px que quedan a la derecha del corte del andamiaje son míos.
 *  El vecino no puede pintarlos —su caja muere en x=399— y sin esto queda una
 *  franja negra de 57×250 en mitad de la lámina. */
export function pintarNodos(ctx, W, H) {
  const r = rng(0x5a03);
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.strokeStyle = "rgba(88,94,44,0.13)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 2.5; x < W; x += 9.4) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let y = 2.5; y < H; y += 9.4) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  ctx.restore();

  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  /* Nudos sobre una malla sacudida, no al azar puro: al azar se apelotonan y
     dejan medio recuadro vacío, y la referencia llena el recuadro entero.
     Densidad calibrada contra el bloque: la referencia promedia 18 de
     luminancia ahí adentro. */
  const nodos = [];
  for (let gy = 0; gy < 8; gy++) {
    for (let gx = 0; gx < 5; gx++) {
      nodos.push([3 + (gx + r() * 0.9) * ((W - 6) / 5), 3 + (gy + r() * 0.9) * ((H - 6) / 8)]);
    }
  }
  for (const [x, y] of nodos) {
    for (const [x2, y2] of nodos) {
      const d = Math.hypot(x - x2, y - y2);
      if (d < 1 || d > 22) continue;
      ctx.strokeStyle = `rgba(162,182,46,${0.05 + (1 - d / 22) * 0.26})`;
      ctx.lineWidth = 0.5 + (1 - d / 22) * 0.7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo((x + x2) / 2 + (r() - 0.5) * 7, (y + y2) / 2 + (r() - 0.5) * 7, x2, y2);
      ctx.stroke();
    }
  }
  // Filamentos sueltos: lo que convierte una malla de nodos en un micelio.
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 150; i++) {
    const [x, y] = nodos[Math.floor(r() * nodos.length)];
    const a = r() * Math.PI * 2;
    const l = 3 + r() * 13;
    ctx.strokeStyle = `rgba(150,170,42,${0.05 + r() * 0.22})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.6 + (r() - 0.5) * 4, y + Math.sin(a) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  for (const [x, y] of nodos) {
    ctx.fillStyle = `rgba(212,232,118,${0.14 + r() * 0.34})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + r() * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}
