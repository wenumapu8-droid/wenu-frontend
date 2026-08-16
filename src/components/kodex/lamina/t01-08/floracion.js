/**
 * KODEX-∞ · t01-08 · FLORACIÓN — pintor procedural compartido
 *
 * El organismo del póster aparece tres veces (héroe, mini-cartel y baldosa
 * móvil). Se pinta una sola vez acá y se instancia con radio distinto, en vez
 * de tener tres dibujos que se van pareciendo cada vez menos.
 *
 * Lo que se midió sobre la referencia y manda la geometría (coordenadas dentro
 * de la caja del héroe, 661×491):
 *
 *   · Centro en (326, 220): es el píxel más brillante y también la columna y la
 *     fila de mayor energía. OJO: esa columna x=835 absoluta engañó al detector
 *     de marcos — es el eje de simetría del organismo, no una regla del cartel.
 *   · Perfil radial medio: 254 en el núcleo, valle en r≈27, repunte en r≈35
 *     (roseta interior), meseta baja entre 45 y 90, y la CRESTA GRANDE en
 *     r 100–130 con máximo en 120 — que es el borde de los pétalos mayores, no
 *     su interior. Cae a 24 en r=145 y deja cola hasta r≈205.
 *   · Perfil angular a r 80–150: picos limpios en 0°, 45°, 90°, 135°, 180°,
 *     225°, 270° y 315°. Es simetría diedral D8, no una rosa cualquiera: hay
 *     ocho ejes y cada uno es además un espejo. Por eso el pintor genera UNA
 *     rama y la instancia 8 veces rotada × 2 espejada.
 *
 * Todo con `rng(semilla)` determinista: el banco compara píxel a píxel y con
 * Math.random() dos capturas de la misma página dan puntajes distintos.
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

/* Los umbrales por estado que la propia lámina publica en el panel 06. No se
   inventan acá: se leen de la obra y se usan como ganancia del organismo. */
export const UMBRAL = { IDLE: 0.8, BUILD: 0.55, BLOOM: 0.3, DISPERSE: 0.75 };

/** Ganancia de floración: cuanto más bajo el umbral, más abierto el organismo. */
export function ganancia(estado) {
  const u = UMBRAL[estado] ?? UMBRAL.BLOOM;
  return 1.15 - u * 0.55;
}


/**
 * Envolvente radial MEDIDA sobre la referencia: brillo medio del anillo r,
 * normalizado al valor de r=20, en fracción de R=218.
 *
 * Es el dato que más rinde de todo el panel y no se puede adivinar. El
 * organismo dibujado a fuerza pareja da una masa sólida —primer intento denso:
 * 32,8 %, peor que el alambre— porque la referencia tiene estructura radial
 * fuerte: foso oscuro en r≈27, repunte de roseta en r≈35, meseta baja entre 45
 * y 90, la cresta de los pétalos en r≈120 y caída rápida después. La envolvente
 * se aplica como máscara multiplicativa sobre el organismo ya dibujado.
 */
const PERFIL = [
  [0.000, 0.45], [0.092, 0.45], [0.115, 0.35], [0.138, 0.34], [0.161, 0.62],
  [0.183, 0.50], [0.206, 0.45], [0.252, 0.45], [0.298, 0.48], [0.344, 0.50],
  [0.390, 0.50], [0.436, 0.62], [0.482, 0.78], [0.528, 0.95], [0.550, 1.00],
  [0.573, 0.97], [0.596, 0.88], [0.642, 0.78], [0.688, 0.74], [0.734, 0.70],
  [0.780, 0.66], [0.826, 0.62], [0.872, 0.56], [0.917, 0.50], [0.963, 0.40],
  [1.000, 0.24],
];

/* ── una rama dendrítica en el marco local (+x hacia afuera) ─────────────── */
function ramas(r, R, maxProf) {
  const segs = [];
  const empuje = (x, y, a0, len, w, prof) => {
    if (prof > maxProf || len < R * 0.01) return;
    const pasos = 4;
    let px = x;
    let py = y;
    let ang = a0;
    /* Curvatura constante por rama: sin ella los filamentos salen rectos y el
       organismo se lee como estrella de navidad, no como dendrita. */
    const curva = (r() - 0.5) * 0.6;
    for (let i = 0; i < pasos; i++) {
      ang += curva / pasos + (r() - 0.5) * 0.1;
      const nx = px + Math.cos(ang) * (len / pasos);
      const ny = py + Math.sin(ang) * (len / pasos);
      segs.push([px, py, nx, ny, w, prof]);
      px = nx;
      py = ny;
      if (i > 0 && r() < 0.55) {
        empuje(
          px, py,
          ang + (r() < 0.5 ? -1 : 1) * (0.35 + r() * 0.5),
          len * (0.44 + r() * 0.34),
          w * 0.68,
          prof + 1,
        );
      }
    }
    empuje(px, py, ang, len * 0.78, w * 0.86, prof + 1);
  };
  empuje(R * 0.05, 0, 0, R * 0.3, 2.4, 0);
  return segs;
}

/* Tinta por profundidad: el tronco es rosa caliente, las puntas se enfrían a
   violeta. En la referencia los pétalos altos tiran a violeta y los bajos a
   magenta puro; sin ese enfriamiento todo queda de un solo rosa plano. */
const TINTA = [
  [255, 190, 248],
  [255, 110, 230],
  [252, 60, 205],
  [244, 42, 190],
  [228, 40, 200],
  [196, 48, 224],
  [162, 62, 232],
];

function hoja(ctx, r0, r1, an) {
  const d = r1 - r0;
  ctx.beginPath();
  ctx.moveTo(r0, 0);
  ctx.bezierCurveTo(r0 + d * 0.16, an, r1 - d * 0.24, an, r1, 0);
  ctx.bezierCurveTo(r1 - d * 0.24, -an, r0 + d * 0.16, -an, r0, 0);
}

/** Corona de pétalos: `n` hojas repartidas, opcionalmente giradas medio paso. */
function corona(ctx, n, giro, r0, r1, an, trazo, relleno, lw) {
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.rotate(giro + (i * 2 * Math.PI) / n);
    hoja(ctx, r0, r1, an);
    if (relleno) {
      ctx.fillStyle = relleno;
      ctx.fill();
    }
    ctx.strokeStyle = trazo;
    ctx.lineWidth = lw;
    ctx.stroke();
    /* Nervadura: una hoja hueca se lee como pétalo de vector. Las de la
       referencia están rellenas de venas que salen del pecíolo. */
    ctx.beginPath();
    ctx.moveTo(r0, 0);
    ctx.lineTo(r1, 0);
    for (let k = 1; k <= 5; k++) {
      const f = k / 6;
      const rr = r0 + (r1 - r0) * f;
      const aa = an * Math.sin(f * Math.PI) * 0.82;
      ctx.moveTo(r0 + (r1 - r0) * (f - 0.14), 0);
      ctx.lineTo(rr, aa);
      ctx.moveTo(r0 + (r1 - r0) * (f - 0.14), 0);
      ctx.lineTo(rr, -aa);
    }
    ctx.lineWidth = lw * 0.42;
    ctx.stroke();
    ctx.restore();
  }
}

/* ── el organismo, centrado en el origen del contexto que se le pase ─────── */
function organismo(ctx, R, semilla, detalle, g) {
  const k = R / 218;
  const maxProf = detalle >= 1 ? 5 : 4;
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  /* Bruma: la referencia nunca deja fondo negro dentro del organismo, hay un
     lavado magenta ancho que le da cuerpo al conjunto. */
  const bruma = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
  bruma.addColorStop(0, "rgba(255,60,200,0.14)");
  bruma.addColorStop(0.35, "rgba(200,30,180,0.08)");
  bruma.addColorStop(0.7, "rgba(140,30,180,0.03)");
  bruma.addColorStop(1, "rgba(90,20,150,0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = bruma;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();

  /* ── anillos de fondo ─────────────────────────────────────────────────
     Progresión geométrica como el kit: repartidos parejo se ven como diana. */
  const ra = rng(semilla ^ 0x9e37);
  ctx.strokeStyle = "rgba(200,45,180,1)";
  let rr = R * 0.99;
  for (let i = 0; i < 7; i++) {
    ctx.globalAlpha = 0.06 + ra() * 0.08;
    ctx.lineWidth = 0.6 * k;
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, Math.PI * 2);
    ctx.stroke();
    rr *= 0.93;
  }
  for (let i = 0; i < 32; i++) {
    const a = (i * 2 * Math.PI) / 32;
    ctx.globalAlpha = 0.03 + ra() * 0.05;
    ctx.lineWidth = 0.5 * k;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * R * 0.12, Math.sin(a) * R * 0.12);
    ctx.lineTo(Math.cos(a) * R * (0.72 + ra() * 0.3), Math.sin(a) * R * (0.72 + ra() * 0.3));
    ctx.stroke();
  }

  /* ── filamentos dendríticos, D8 ───────────────────────────────────────
     Tres desvíos por eje y su espejo: 48 juegos. Con uno solo el organismo
     queda de alambre — que fue exactamente el primer intento, 17,6 %. */
  const juegos = [
    { l: ramas(rng(semilla), R * g * 1.02, maxProf), d: 0, o: 1 },
    { l: ramas(rng(semilla ^ 0x2f13), R * g * 0.86, maxProf), d: 0.3, o: 0.8 },
    { l: ramas(rng(semilla ^ 0x71c5), R * g * 0.86, maxProf), d: -0.3, o: 0.8 },
  ];
  for (const j of juegos) {
    for (let e = 0; e < 8; e++) {
      for (const esp of [1, -1]) {
        ctx.save();
        ctx.rotate((e * Math.PI) / 4 + j.d * esp);
        ctx.scale(1, esp);
        for (const [x1, y1, x2, y2, w, prof] of j.l) {
          const c = TINTA[Math.min(prof, TINTA.length - 1)];
          ctx.globalAlpha = j.o * (0.6 - prof * 0.065);
          ctx.strokeStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
          ctx.lineWidth = Math.max(0.4, w * k);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  /* ── púas largas ──────────────────────────────────────────────────────
     Dendritas rectas que salen del cuerpo y llegan casi al borde del campo. Sin
     ellas el organismo se lee como nube redonda: es lo que le faltaba al
     mini-cartel, donde la referencia muestra una estrella de puntas nítidas y
     el primer intento daba una bola difusa. */
  const rp = rng(semilla ^ 0x4e21);
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    const largo = R * (i % 2 ? 0.82 : 0.99) * (0.94 + rp() * 0.12);
    const r0 = R * 0.26;
    ctx.globalAlpha = i % 2 ? 0.4 : 0.72;
    ctx.strokeStyle = i % 4 === 1 ? "rgba(170,90,240,1)" : "rgba(255,95,225,1)";
    ctx.lineWidth = (i % 2 ? 0.6 : 1.0) * k;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    ctx.lineTo(Math.cos(a) * largo, Math.sin(a) * largo);
    ctx.stroke();
    /* Cada púa lleva barbas cortas: recta pelada se ve como radio de rueda. */
    for (let b = 0; b < 5; b++) {
      const t = 0.35 + b * 0.14 + rp() * 0.05;
      const rr2 = r0 + (largo - r0) * t;
      const lb = (largo - r0) * (0.1 + rp() * 0.12);
      for (const sg of [1, -1]) {
        const ab = a + sg * (0.4 + rp() * 0.3);
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 0.5 * k;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
        ctx.lineTo(Math.cos(a) * rr2 + Math.cos(ab) * lb, Math.sin(a) * rr2 + Math.sin(ab) * lb);
        ctx.stroke();
      }
    }
  }

  for (let i = 0; i < 32; i++) {
    const a = (i * Math.PI) / 16 + 0.098;
    const r0 = R * (0.42 + rp() * 0.1);
    const largo = R * (0.72 + rp() * 0.26);
    ctx.globalAlpha = 0.3 + rp() * 0.18;
    ctx.strokeStyle = i % 3 === 0 ? "rgba(150,80,235,1)" : "rgba(240,80,205,1)";
    ctx.lineWidth = 0.5 * k;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    let px = Math.cos(a) * r0;
    let py = Math.sin(a) * r0;
    let ang = a;
    for (let t = 0; t < 4; t++) {
      ang += (rp() - 0.5) * 0.22;
      px += Math.cos(ang) * (largo - r0) / 4;
      py += Math.sin(ang) * (largo - r0) / 4;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  /* ── pétalos ──────────────────────────────────────────────────────────
     Las coronas salen del perfil radial: roseta 0.05→0.20 R (repunte medido en
     r≈35), cuerpos medios, y la corona grande 0.22→0.62 R cuyo BORDE es la
     cresta de r≈120. El semiancho de la corona grande sale del perfil angular:
     ocho lóbulos de ~40° de abertura → 0.175 R. */
  ctx.globalAlpha = 1;
  corona(ctx, 16, Math.PI / 16, R * 0.05, R * 0.2, R * 0.042,
    "rgba(255,110,235,0.6)", "rgba(220,40,200,0.07)", 1.0 * k);
  corona(ctx, 16, 0, R * 0.1, R * 0.34, R * 0.062,
    "rgba(240,60,225,0.4)", "rgba(180,30,200,0.05)", 0.9 * k);
  corona(ctx, 8, 0, R * 0.14, R * 0.46, R * 0.13,
    "rgba(245,60,205,0.5)", "rgba(200,30,170,0.09)", 1.2 * k);
  corona(ctx, 8, Math.PI / 8, R * 0.18, R * 0.52, R * 0.125,
    "rgba(195,60,230,0.44)", "rgba(140,35,195,0.08)", 1.15 * k);
  corona(ctx, 8, Math.PI / 8, R * 0.26, R * 0.57, R * 0.15,
    "rgba(205,55,235,0.46)", "rgba(150,32,205,0.085)", 1.25 * k);
  corona(ctx, 8, 0, R * 0.22, R * 0.62, R * 0.178,
    "rgba(255,70,225,0.72)", "rgba(215,30,190,0.11)", 1.7 * k);

  /* ── motas ────────────────────────────────────────────────────────────── */
  const rm = rng(semilla ^ 0x77aa);
  const nm = Math.round(detalle >= 1 ? 420 : 130);
  for (let i = 0; i < nm; i++) {
    const a = rm() * Math.PI * 2;
    const d = R * (0.18 + Math.pow(rm(), 0.6) * 0.95);
    const s = (0.4 + rm() * 1.0) * Math.max(0.6, k);
    ctx.globalAlpha = 0.12 + rm() * 0.55;
    ctx.fillStyle = rm() < 0.16 ? "#7d6cff" : "#ff45c8";
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

/**
 * Pinta la floración centrada en (cx, cy) con radio de campo R.
 *
 * El organismo se dibuja aparte y se compone TRES veces sobre el destino: muy
 * desenfocado, poco desenfocado y nítido. Ése es el paso que convierte un
 * dibujo de líneas en la masa luminosa de la referencia — la primera versión
 * pintaba directo y quedaba de alambre.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{cx:number,cy:number,R:number,semilla?:number,detalle?:number,
 *          estado?:string,alfa?:number}} o
 */
export function pintarFloracion(ctx, o) {
  const {
    cx, cy, R,
    semilla = 0x51b1,
    detalle = 1,
    estado = "BLOOM",
    alfa = 1,
  } = o;
  const g = ganancia(estado);
  const dpr = 2;
  const S = Math.ceil(R * 2.1);
  const off = document.createElement("canvas");
  off.width = S * dpr;
  off.height = S * dpr;
  const oc = off.getContext("2d");
  oc.scale(dpr, dpr);
  oc.translate(S / 2, S / 2);
  organismo(oc, R, semilla, detalle, g);

  /* Máscara radial medida: recorta el organismo al perfil de la referencia. */
  oc.globalCompositeOperation = "destination-in";
  const env = oc.createRadialGradient(0, 0, 0, 0, 0, R);
  for (const [f, v] of PERFIL) env.addColorStop(f, `rgba(0,0,0,${(v * alfa).toFixed(3)})`);
  oc.fillStyle = env;
  oc.fillRect(-S / 2, -S / 2, S, S);
  oc.globalCompositeOperation = "source-over";

  const x0 = cx - S / 2;
  const y0 = cy - S / 2;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  /* En radios chicos el desenfoque proporcional convierte el organismo en una
     bola: el mini-cartel a R=64 perdía toda la estructura. Por debajo de 100 px
     de radio se compone casi nítido. */
  const pasadas = R >= 100
    ? [[R * 0.03, 0.3], [R * 0.01, 0.26], [0, 0.9]]
    : [[R * 0.022, 0.2], [0, 0.95]];
  for (const [b, a] of pasadas) {
    ctx.filter = b > 0.4 ? `blur(${b.toFixed(2)}px)` : "none";
    ctx.globalAlpha = a;
    ctx.drawImage(off, x0, y0, S, S);
  }
  ctx.filter = "none";
  ctx.globalAlpha = 1;

  /* ── núcleo: va DESPUÉS del compuesto para que quede nítido y blanco ──── */
  ctx.translate(cx, cy);
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.16);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.09, "rgba(255,235,255,0.95)");
  gr.addColorStop(0.24, "rgba(255,105,240,0.55)");
  gr.addColorStop(0.55, "rgba(215,35,190,0.2)");
  gr.addColorStop(1, "rgba(150,20,150,0)");
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,205,255,1)";
  ctx.lineCap = "round";
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    ctx.globalAlpha = k % 2 ? 0.25 : 0.6;
    ctx.lineWidth = (k % 2 ? 0.5 : 0.9) * (R / 218) * 1.6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * R * (k % 2 ? 0.22 : 0.4), Math.sin(a) * R * (k % 2 ? 0.22 : 0.4));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(0.8, R * 0.014), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

/** Estrella de cuatro puntas: la marca que la lámina repite en las esquinas. */
export function estrella(ctx, x, y, r, op = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,90,225,1)";
  ctx.lineCap = "round";
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const largo = k % 2 ? r * 0.42 : r;
    ctx.globalAlpha = (k % 2 ? 0.35 : 0.75) * op;
    ctx.lineWidth = k % 2 ? 0.5 : 0.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * largo, Math.sin(a) * largo);
    ctx.stroke();
  }
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.5);
  gr.addColorStop(0, `rgba(255,220,255,${0.8 * op})`);
  gr.addColorStop(1, "rgba(255,60,210,0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

/**
 * Reflejo: el organismo se apoya sobre un plano y lo que devuelve no es una
 * copia espejada sino ondas concéntricas achatadas con un destello al centro.
 */
export function reflejo(ctx, cx, cy, rx, ry, op = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "lighter";
  const rr = rng(0x3c17);
  for (let i = 0; i < 9; i++) {
    const f = 0.16 + (i / 8) * 0.94;
    ctx.globalAlpha = (0.28 - i * 0.024) * op;
    ctx.strokeStyle = i % 3 === 2 ? "rgba(140,110,255,1)" : "rgba(230,60,200,1)";
    ctx.lineWidth = 0.6 + rr() * 0.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * f, ry * f, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, rx * 0.34);
  gr.addColorStop(0, `rgba(255,255,255,${0.95 * op})`);
  gr.addColorStop(0.16, `rgba(255,120,240,${0.5 * op})`);
  gr.addColorStop(0.55, `rgba(150,60,230,${0.12 * op})`);
  gr.addColorStop(1, "rgba(90,30,160,0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 0.34, ry * 1.9, 0, 0, Math.PI * 2);
  ctx.fill();
  /* Barrido horizontal del destello sobre el plano. */
  const gh = ctx.createLinearGradient(-rx, 0, rx, 0);
  gh.addColorStop(0, "rgba(255,60,210,0)");
  gh.addColorStop(0.5, `rgba(255,190,255,${0.55 * op})`);
  gh.addColorStop(1, "rgba(255,60,210,0)");
  ctx.fillStyle = gh;
  ctx.fillRect(-rx, -0.7, rx * 2, 1.4);
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}
