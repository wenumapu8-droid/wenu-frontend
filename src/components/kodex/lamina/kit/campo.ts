/**
 * KODEX-∞ · EL CAMPO
 *
 * Dibuja el campo de una lámina a partir de su RECETA MEDIDA — la que escribe
 * `scripts/lamina/extraer-campo.mjs <slug>` leyendo la referencia.
 *
 * Por qué existe. El campo de `u10-commons` se llevó una noche entera para
 * pasar de 34 % a 85 % de cobertura, y lo que se aprendió quedó hardcodeado
 * dentro de esa lámina. Con el extractor, la receta de otra lámina sale en un
 * comando; sin esta pieza, dibujarla seguía siendo empezar de cero.
 *
 * Lo que se descubrió midiendo, y que esta pieza aplica sola:
 *
 *   · EL RADIO NO SE MODELA. La densidad de la referencia no es monótona —en
 *     u10 vale 13,3 % en el centro, SUBE a 27,5 % en r=40 y recién ahí baja—,
 *     así que ninguna potencia de u la reproduce: cualquier decaimiento tiene su
 *     máximo en el centro. Se sortea del perfil medido, anillo por anillo.
 *   · LA TRAMA CRECE AL CUADRADO. Unir pares vecinos hace que la tinta escale
 *     con la densidad², mientras la de la referencia escala lineal. En el núcleo
 *     eso daba 82 % contra 28 %. Se corrige bajando la densidad de los anillos
 *     interiores, no el grado de los nodos: se probaron dos topes de grado y los
 *     dos hundieron la periferia de 19,1 % a 6,8 %, porque la trama carga TODA
 *     la tinta de la lámina y no sólo la del centro.
 *   · LOS GLIFOS VAN DONDE ESTÁN. No se distribuyen: se dibujan en las
 *     coordenadas que el extractor sacó de la referencia.
 *   · LA PALETA SE MUESTREA. La referencia tinta en gris con matices, no en
 *     color: 25,9 % neutro y ni un tono vivo entre los siete primeros. El campo
 *     hacía lo contrario —51,5 % violeta saturado— y por eso se leía monocromo.
 *
 * Uso, en una lámina:
 *
 *   import receta from '../../../../scripts/lamina/campo/u01-origin-field.json';
 *   import { pintarCampo } from '../kit/campo';
 *
 *   pintarCampo(g, { receta, W, H, semilla: 0x1010 });
 */

export interface RecetaCampo {
  slug: string;
  centro: [number, number];
  radio: number;
  anillos_perfil: number[];
  anillos_r: number[];
  radios_n: number;
  glifos: number[];
  marcas: number[];
  paleta: Array<{ rgb: string; peso: number; clase: string }>;
  tinta_total?: number;
}

export interface OpcionesCampo {
  receta: RecetaCampo;
  /** Ancho y alto del canvas en píxeles CSS. */
  W: number;
  H: number;
  semilla?: number;
  /** Cuántas estrellas. Por defecto escala con el área de la referencia. */
  estrellas?: number;
  /** Cuántos puntos de polvo fino. */
  polvo?: number;
  /**
   * Qué capas dibujar. Existe para poder SUMAR lo que falta a una lámina que ya
   * tiene su campo, en vez de reemplazarlo: migrar a ciegas rompió seis láminas
   * una vez y la lección fue no suponer que dos composiciones son la misma.
   */
  capas?: Array<"polvo" | "estrellas" | "radios" | "anillos" | "glifos" | "marcas">;
  /**
   * Cuánto se rebaja la densidad de los anillos interiores. La trama une pares
   * vecinos, así que su tinta crece con la densidad al cuadrado: sin esto el
   * núcleo se satura. 1 = sin rebaja.
   */
  rebajeNucleo?: number;
}

const TAU = Math.PI * 2;
const tinta = (c: string, a: number) => `rgba(${c},${a})`;

/** mulberry32, el mismo de kit/rng.ts. Sin semilla la lámina no es reproducible. */
function azar(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pintarCampo(g: CanvasRenderingContext2D, o: OpcionesCampo) {
  const { receta: r, W, H } = o;
  const CX = W / 2, CY = H / 2;
  const escala = (Math.min(W, H) / 2 - 8) / r.radio;
  const rnd = azar(o.semilla ?? 0x1010);

  /* Paleta por peso medido. Sin esto el campo tinta en un solo color y se lee
     monocromo al lado de la referencia. */
  const paleta = r.paleta.length ? r.paleta : [{ rgb: "150,148,145", peso: 100, clase: "neutro" }];
  const pesoTotal = paleta.reduce((s, p) => s + p.peso, 0) || 1;
  const color = (u: number) => {
    let acc = u * pesoTotal;
    for (const p of paleta) { acc -= p.peso; if (acc <= 0) return p.rgb; }
    return paleta[0].rgb;
  };

  /* El radio, sorteado del perfil medido. Los anillos interiores van rebajados
     porque la trama los amplifica al cuadrado. */
  const rebaje = o.rebajeNucleo ?? 2.3;
  const pesos = r.anillos_perfil.map((w, k) => (k < 2 ? w / rebaje : k < 4 ? w / (rebaje * 0.74) : w));
  const sumaPesos = pesos.reduce((a, b) => a + b, 0) || 1;
  const radio = (u: number) => {
    let acc = u * sumaPesos;
    for (let k = 0; k < pesos.length; k++) {
      acc -= pesos[k];
      if (acc <= 0) return (k + (1 + acc / pesos[k])) / pesos.length;
    }
    return 1;
  };

  const capas = new Set(o.capas ?? ["polvo", "estrellas", "radios", "anillos", "glifos", "marcas"]);
  const RR = Math.min(W, H) / 2 - 8;
  const punto = (u: number, v: number) => {
    const rr = radio(u) * RR;
    const ang = v * TAU;
    return [CX + rr * Math.cos(ang), CY + rr * Math.sin(ang)] as const;
  };

  if (capas.has("polvo")) {
    /* ── polvo fino ─────────────────────────────────────────────────────── */
    const nPolvo = o.polvo ?? 2600;
    for (let k = 0; k < nPolvo; k++) {
      const [x, y] = punto(rnd(), rnd());
      g.fillStyle = tinta(color(rnd()), 0.04 + rnd() * 0.28);
      g.beginPath();
      g.arc(x, y, 0.25 + rnd() * 0.9, 0, TAU);
      g.fill();
    }
  }

  if (capas.has("estrellas")) {
    /* ── estrellas y trama ──────────────────────────────────────────────── */
    const nEstrellas = o.estrellas ?? 1400;
    const estrellas: Array<{ x: number; y: number; r: number; br: number }> = [];
    for (let k = 0; k < nEstrellas; k++) {
      const [x, y] = punto(rnd(), rnd());
      estrellas.push({ x, y, r: 1 + rnd() * 2.2, br: rnd() });
    }
    g.strokeStyle = tinta(paleta[0].rgb, 0.15);
    g.lineWidth = 0.5;
    for (let i = 0; i < estrellas.length; i++) {
      for (let j = i + 1; j < estrellas.length; j++) {
        const dx = estrellas[i].x - estrellas[j].x, dy = estrellas[i].y - estrellas[j].y;
        if (dx * dx + dy * dy < 1600) {
          g.beginPath();
          g.moveTo(estrellas[i].x, estrellas[i].y);
          g.lineTo(estrellas[j].x, estrellas[j].y);
          g.stroke();
        }
      }
    }
    for (const e of estrellas) {
      g.fillStyle = tinta(color(e.br), 0.3 + e.br * 0.5);
      g.beginPath();
      g.arc(e.x, e.y, e.r, 0, TAU);
      g.fill();
    }
  }

  /* ── radios de la roseta ────────────────────────────────────────────── */
  if (capas.has("radios") && r.radios_n > 0) {
    g.lineWidth = 0.6;
    for (let k = 0; k < r.radios_n; k++) {
      const ang = (k / r.radios_n) * TAU;
      const largo = 0.55 + 0.45 * ((k * 7919) % 100) / 100;
      g.strokeStyle = tinta(color((k % 11) / 11), 0.24);
      g.beginPath();
      g.moveTo(CX + Math.cos(ang) * RR * 0.04, CY + Math.sin(ang) * RR * 0.04);
      g.lineTo(CX + Math.cos(ang) * RR * 0.56 * largo, CY + Math.sin(ang) * RR * 0.56 * largo);
      g.stroke();
    }
  }

  if (capas.has("anillos")) {
    /* ── anillos concéntricos ───────────────────────────────────────────── */
    g.lineWidth = 0.7;
    for (const rr of r.anillos_r) {
      g.strokeStyle = tinta(color((rr % 7) / 7), 0.26);
      g.beginPath();
      g.arc(CX, CY, rr * escala, 0, TAU);
      g.stroke();
    }
  }

  if (capas.has("glifos")) {
    /* ── glifos, en sus posiciones medidas ──────────────────────────────── */
    const [RX, RY] = r.centro;
    g.lineWidth = 0.7;
    for (let k = 0; k < r.glifos.length; k += 3) {
      const gx = CX + (r.glifos[k] - RX) * escala;
      const gy = CY + (r.glifos[k + 1] - RY) * escala;
      const gr = Math.max(3, r.glifos[k + 2] * escala);
      const c = color(((k * 37) % 100) / 100);
      g.strokeStyle = tinta(c, 0.34);
      g.beginPath(); g.arc(gx, gy, gr, 0, TAU); g.stroke();
      if (gr > 7) { g.beginPath(); g.arc(gx, gy, gr * 0.58, 0, TAU); g.stroke(); }
      g.fillStyle = tinta(c, 0.5);
      g.beginPath(); g.arc(gx, gy, Math.min(1.6, gr * 0.2), 0, TAU); g.fill();
    }
  }

  if (capas.has("marcas")) {
    /* ── marcas alargadas ───────────────────────────────────────────────── */
    g.lineWidth = 0.9;
    for (let k = 0; k < r.marcas.length; k += 4) {
      const mx = CX + (r.marcas[k] - RX) * escala;
      const my = CY + (r.marcas[k + 1] - RY) * escala;
      const mw = r.marcas[k + 2] * escala, mh = r.marcas[k + 3] * escala;
      g.strokeStyle = tinta(color(((k * 53) % 100) / 100), 0.38);
      g.beginPath();
      if (mw >= mh) { g.moveTo(mx - mw / 2, my); g.lineTo(mx + mw / 2, my); }
      else { g.moveTo(mx, my - mh / 2); g.lineTo(mx, my + mh / 2); }
      g.stroke();
      g.beginPath();
      g.ellipse(mx, my, Math.max(1.5, mw / 2), Math.max(1.5, mh / 2), 0, 0, TAU);
      g.stroke();
    }
  }

}
