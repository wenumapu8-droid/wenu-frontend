/**
 * KODEX-∞ · ORBIT MAP · runtime
 *
 * El panel 04 del plano, corriendo.
 *
 * Esto no dibuja "algo que se parece" al mapa del póster: **ejecuta el
 * pseudocódigo del panel 08 sobre los datos del panel 09.** El radio de KX-13
 * en pantalla sale de sus 2.54 AU, su velocidad de sus 1024.55 días, su
 * profundidad de su inclinación. El plano no ilustra la escena; la escena es
 * el plano corriendo.
 *
 * Por qué Canvas 2D y no WebGL, que es lo que uno esperaría del hero:
 *
 *  · El mapa es un instrumento de líneas finas con rótulos, y tiene que
 *    aceptar clics en cuerpos, sectores y puertas. Texto nítido y hit-testing
 *    son gratis en 2D y costosos en shaders.
 *  · Ya hay un campo WebGL corriendo detrás de la lámina. Dos contextos
 *    peleando por la GPU en un iMac 2015 es exactamente el "no sobrecargar"
 *    que pide la ley del proyecto.
 *
 * Lo audio-reactivo vive donde se nota y no donde se puede: el núcleo late con
 * los graves, los nodos se encienden con los agudos, y el campo respira con
 * los medios. Repartirlo por todo convertiría el mapa en una ecualización.
 */

import {
  CUERPOS, SECTORES, PORTALES, type Cuerpo,
} from "../../../lib/kodex/capitulos";

type Bus = { activo: boolean; low: number; mid: number; high: number };

type Fase = "MAP" | "ORBIT" | "ALIGN" | "REVEAL";

/** Estado calculado de un cuerpo en un instante. */
type Pos = { x: number; y: number; z: number; pulso: number };

const TAU = Math.PI * 2;

/**
 * Lee el bus de audio del sistema.
 *
 * Cuando no hay sonido NO devuelve ceros: devuelve una respiración sintética.
 * Un mapa que se congela porque el visitante no encendió el audio se lee como
 * roto, no como silencioso.
 */
function audio(t: number): Bus {
  const bus = (window as any).__kxAudio as Bus | undefined;
  if (bus?.activo) return bus;
  return {
    activo: false,
    low: 0.5 + Math.sin(t * 0.7) * 0.3,
    mid: 0.5 + Math.sin(t * 1.3 + 1.7) * 0.25,
    high: 0.5 + Math.sin(t * 2.1 + 3.1) * 0.2,
  };
}

export class OrbitMap {
  private readonly cv: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly raiz: HTMLElement;
  private readonly acento: string;
  private readonly apoyo: string;

  private raf = 0;
  private t0 = performance.now();
  private fase: Fase = "MAP";
  /** Avance suavizado hacia la fase actual. Las fases no saltan: viajan. */
  private faseVal = 0;
  /** Descubrimiento inicial del campo, independiente de la fase. */
  private entrada = 0;
  private faseObj = 0;

  private reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private puntero = { x: 0.5, y: 0.5 };
  /** Radio máximo en AU, para normalizar a pantalla. */
  private readonly radioMax: number;
  /** Zonas sensibles, recalculadas cada cuadro para el hit-testing. */
  private zonas: { x: number; y: number; r: number; url: string; nombre: string }[] = [];

  constructor(raiz: HTMLElement) {
    this.raiz = raiz;
    this.cv = raiz.querySelector("canvas")!;
    this.ctx = this.cv.getContext("2d")!;
    this.acento = raiz.dataset.acento || "#FF2E7E";
    this.apoyo = raiz.dataset.apoyo || "#4FC3F7";
    this.radioMax = Math.max(...CUERPOS.map((c) => c.radio));

    this.medir();
    new ResizeObserver(() => this.medir()).observe(raiz);

    raiz.addEventListener("pointermove", (e) => {
      const r = this.cv.getBoundingClientRect();
      this.puntero = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
      this.hover(e.clientX - r.left, e.clientY - r.top, r);
    });
    raiz.addEventListener("pointerleave", () => {
      this.puntero = { x: 0.5, y: 0.5 };
      this.cv.style.cursor = "";
      this.rotular(null);
    });
    raiz.addEventListener("click", (e) => this.tocar(e));

    // Los botones de fase: el panel 02 hecho control.
    for (const b of raiz.parentElement?.querySelectorAll<HTMLButtonElement>("[data-kdx-fase]") ?? []) {
      b.addEventListener("click", () => this.irA(b.dataset.kdxFase as Fase));
    }

    // Sólo corre cuando se ve. Un mapa animado fuera de pantalla es puro gasto.
    new IntersectionObserver((es) => {
      for (const e of es) e.isIntersecting ? this.arrancar() : this.parar();
    }, { rootMargin: "120px" }).observe(raiz);
  }

  private medir(): void {
    // El DPR se limita a 2: por encima el mapa no se ve mejor y el costo de
    // pintarlo se dispara justo en las máquinas que menos lo aguantan.
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = this.raiz.getBoundingClientRect();
    this.cv.width = Math.max(1, Math.round(r.width * dpr));
    this.cv.height = Math.max(1, Math.round(r.height * dpr));
  }

  public irA(f: Fase): void {
    this.fase = f;
    const orden: Fase[] = ["MAP", "ORBIT", "ALIGN", "REVEAL"];
    this.faseObj = orden.indexOf(f);
    this.raiz.dataset.fase = f;
    for (const b of this.raiz.parentElement?.querySelectorAll<HTMLElement>("[data-kdx-fase]") ?? []) {
      b.setAttribute("aria-pressed", String(b.dataset.kdxFase === f));
    }
  }

  private arrancar(): void {
    if (this.raf) return;
    this.raf = requestAnimationFrame(this.cuadro);
  }
  private parar(): void {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /**
   * El pseudocódigo del panel 08, literal.
   *
   *   angle  = body.angular_velocity × delta_time
   *   radius = body.orbit_radius
   *   x = cos(angle) × radius
   *   y = sin(angle) × radius
   *   z = sin(angle × 0.5) × body.inclination
   *   if NODE: body.pulse = sin(time × body.frequency)
   */
  private posicion(c: Cuerpo, t: number, a: Bus): Pos {
    if (c.periodo <= 0) {
      // Nodos y puertas no orbitan. Se quedan en su radio y laten.
      const ang = (c.radio * 2.7 + 1.9) % TAU;
      const pulso = c.frecuencia ? Math.sin(t * c.frecuencia) : 0;
      return { x: Math.cos(ang) * c.radio, y: Math.sin(ang) * c.radio, z: 0, pulso };
    }

    // ω = 2π / período. Se comprime el tiempo para que una órbita larga se
    // note en una visita: KX-21 tarda 2011 días y nadie va a esperarlos.
    const omega = TAU / c.periodo;
    const escalaTiempo = 26.0;

    // Fase de arranque por cuerpo. Sin esto, en t=0 TODOS caen en ángulo cero
    // y el sistema se dibuja como una fila de bolas a la derecha del núcleo —
    // que es exactamente lo que ve alguien con movimiento reducido, para quien
    // el tiempo no avanza nunca. Un sistema orbital congelado tiene que seguir
    // leyéndose como un sistema.
    const fase0 = (c.radio * 2.7 + c.inclinacion * 11.3) % TAU;
    const ang = fase0 + omega * t * escalaTiempo;

    return {
      x: Math.cos(ang) * c.radio,
      y: Math.sin(ang) * c.radio,
      z: Math.sin(ang * 0.5) * c.inclinacion,
      pulso: 0,
    };
  }

  private readonly cuadro = (): void => {
    this.raf = 0;
    const t = this.reducido ? 0 : (performance.now() - this.t0) / 1000;
    const a = audio(t);

    // La fase viaja hacia su objetivo en vez de saltar. El salto delata la
    // maquina; el viaje se lee como que el instrumento obedece.
    this.faseVal += (this.faseObj - this.faseVal) * 0.055;
    this.entrada += (1 - this.entrada) * (this.reducido ? 1 : 0.03);

    this.pintar(t, a);
    this.raf = requestAnimationFrame(this.cuadro);
  };

  private pintar(t: number, a: Bus): void {
    const { ctx, cv } = this;
    const w = cv.width;
    const h = cv.height;
    const cx = w / 2;
    const cy = h / 2;
    // DOS escalas distintas, y confundirlas fue un error real:
    //  · `esc` convierte AU a píxeles — sirve para radios de órbita.
    //  · `U` es el lado corto del lienzo — sirve para TAMAÑOS de dibujo:
    //    tipografía, cuerpos, glifos.
    // Al escalar los rótulos con `esc` quedaban de 2.6px, ilegibles: `esc` es
    // "píxeles por AU" y no tiene nada que ver con cuán grande debe verse una
    // letra.
    const U = Math.min(w, h);
    const esc = (U * 0.40) / this.radioMax;

    ctx.clearRect(0, 0, w, h);
    this.zonas = [];

    // MAP es la fase BASE: "reveal the field". El campo se descubre al entrar
    // y se queda. Antes lo ataba a `faseVal`, que en MAP vale 0 — con lo cual
    // las órbitas se apagaban justo en la fase cuyo trabajo es mostrarlas.
    const mapa = Math.min(1, this.entrada);
    const orbita = Math.max(0, Math.min(1, this.faseVal - 0.4));
    const alinea = Math.max(0, Math.min(1, this.faseVal - 1.4));
    const revela = Math.max(0, Math.min(1, this.faseVal - 2.2));

    // Parallax: el puntero corre las capas distinto según su profundidad. Son
    // las 7 capas que declara el panel 01 (PARALLAX: 7 LAYERS).
    const px = (this.puntero.x - 0.5) * 26;
    const py = (this.puntero.y - 0.5) * 18;

    this.anillos(ctx, cx, cy, esc, t, a, mapa, px, py);
    this.rejilla(ctx, cx, cy, esc, mapa, px, py);
    this.sectores(ctx, cx, cy, esc, U, mapa, px, py);
    this.nucleo(ctx, cx, cy, U, t, a, revela);
    this.cuerpos(ctx, cx, cy, esc, U, t, a, orbita, alinea, revela, px, py);
    this.puertas(ctx, cx, cy, esc, U, mapa, revela, px, py);
    if (revela > 0.02) this.transmision(ctx, cx, cy, esc, t, revela);
  }

  /** Las elípticas del mapa. Respiran con los medios. */
  private anillos(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, esc: number,
    t: number, a: Bus, mapa: number, px: number, py: number,
  ): void {
    const respira = 1 + (a.mid - 0.5) * 0.03;
    ctx.save();
    ctx.lineWidth = 1;
    for (const c of CUERPOS) {
      if (c.periodo <= 0) continue;
      const r = c.radio * esc * respira;
      // Las órbitas son ELÍPTICAS, como pide la nota de movimiento. El
      // achatamiento sale de la inclinación: más inclinada, más de canto.
      const ry = r * (1 - c.inclinacion * 0.42);
      ctx.beginPath();
      ctx.ellipse(cx + px * c.inclinacion, cy + py * c.inclinacion, r, ry, 0, 0, TAU);
      // Las órbitas son la lectura principal del panel: se dibujan para leerse,
      // no como fondo. Las activas llevan el acento.
      ctx.strokeStyle = this.tinta(c.estado === "ACTIVE" ? this.acento : "#93a2b5", (c.estado === "ACTIVE" ? 0.62 : 0.4) * mapa);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** GRID: HEX / TRIAD, del panel 01. Se dibuja lo que la referencia declara. */
  private rejilla(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, esc: number,
    mapa: number, px: number, py: number,
  ): void {
    ctx.save();
    ctx.strokeStyle = this.tinta("#8892a0", 0.11 * mapa);
    ctx.lineWidth = 1;
    const R = this.radioMax * esc;
    // Triadas: tres ejes a 120°.
    for (let i = 0; i < 3; i++) {
      const ang = (i / 3) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(ang) * R + px, cy - Math.sin(ang) * R + py);
      ctx.lineTo(cx + Math.cos(ang) * R + px, cy + Math.sin(ang) * R + py);
      ctx.stroke();
    }
    // Hexágono de referencia.
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const ang = (i / 6) * TAU;
      const x = cx + Math.cos(ang) * R * 0.62 + px;
      const y = cy + Math.sin(ang) * R * 0.62 + py;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  private sectores(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, esc: number, U: number,
    mapa: number, px: number, py: number,
  ): void {
    const R = this.radioMax * esc * 1.04;
    ctx.save();
    ctx.font = `${Math.max(9, Math.round(U * 0.019))}px "IBM Plex Mono", monospace`;
    for (const s of SECTORES) {
      const ang = (-s.angulo * Math.PI) / 180;
      const x = cx + Math.cos(ang) * R + px;
      const y = cy + Math.sin(ang) * R + py;
      ctx.fillStyle = this.tinta(this.acento, 0.8 * mapa);
      ctx.textAlign = Math.cos(ang) < -0.3 ? "right" : Math.cos(ang) > 0.3 ? "left" : "center";
      ctx.fillText(`SECTOR ${s.n}`, x, y - 6);
      ctx.fillStyle = this.tinta("#e8e5df", 0.78 * mapa);
      ctx.fillText(s.nombre, x, y + 8);
      if (s.destino) {
        this.zonas.push({ x, y, r: U * 0.07, url: `/kodex/vol/${s.destino}/`, nombre: s.nombre });
      }
    }
    ctx.restore();
  }

  /**
   * El núcleo: rosetón de flor de la vida.
   *
   * `body.pulse = sin(time × frequency)` del panel 08, aplicado al corazón del
   * mapa y atado a los graves. Es el único elemento que puede crecer mucho:
   * todo lo demás se mueve poco para que este se note.
   */
  private nucleo(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, U: number,
    t: number, a: Bus, revela: number,
  ): void {
    const pulso = Math.sin(t * 1.1) * 0.5 + 0.5;
    // El nucleo se mide contra el LIENZO, no contra la escala orbital: es el
    // corazon de la lamina y tiene que pesar lo mismo en cualquier pantalla.
    const r = U * (0.085 + pulso * 0.006 + a.low * 0.014 + revela * 0.035);

    ctx.save();
    ctx.translate(cx, cy);

    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.4);
    halo.addColorStop(0, this.tinta(this.acento, 0.5 + revela * 0.3));
    halo.addColorStop(0.45, this.tinta(this.acento, 0.12));
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.4, 0, TAU);
    ctx.fill();

    // Flor de la vida: círculos en dos coronas, el patrón del póster.
    ctx.strokeStyle = this.tinta("#ffffff", 0.5 + revela * 0.4);
    ctx.lineWidth = 1;
    for (const [n, k] of [[6, 0.5], [12, 0.86]] as [number, number][]) {
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * TAU + t * 0.05;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * r * k, Math.sin(ang) * r * k, r * 0.5, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = this.tinta(this.acento, 0.85);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.5, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  private cuerpos(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, esc: number, U: number,
    t: number, a: Bus, orbita: number, alinea: number, revela: number,
    px: number, py: number,
  ): void {
    const pos = new Map<string, { x: number; y: number; z: number; pulso: number }>();

    for (const c of CUERPOS) {
      const p = this.posicion(c, t, a);

      // ALIGN sincroniza los vectores: los cuerpos derivan hacia un mismo
      // ángulo. No se teletransportan — se interpola, que es lo que "lock the
      // geometry" quiere decir.
      let ang = Math.atan2(p.y, p.x);
      if (alinea > 0) {
        const objetivo = -Math.PI / 6;
        ang = ang + (objetivo - ang) * alinea * 0.85;
      }
      const rr = Math.hypot(p.x, p.y);

      // z entra como PROFUNDIDAD: escala y opacidad. Es el parallax del plano.
      const prof = 1 + p.z * 0.28;
      const x = cx + Math.cos(ang) * rr * esc * prof + px * (1 + p.z);
      const y = cy + Math.sin(ang) * rr * esc * (1 - c.inclinacion * 0.42) * prof + py * (1 + p.z);
      pos.set(c.id, { x, y, z: p.z, pulso: p.pulso });
    }

    // Vectores primero: las rutas van debajo de los cuerpos.
    ctx.save();
    ctx.lineWidth = 1;
    for (const c of CUERPOS) {
      if (!c.enlace) continue;
      const A = pos.get(c.id);
      const B = pos.get(c.enlace);
      if (!A || !B) continue;
      ctx.strokeStyle = this.tinta(this.apoyo, 0.25 + alinea * 0.5);
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();

    for (const c of CUERPOS) {
      const p = pos.get(c.id)!;
      const prof = 1 + p.z * 0.28;
      const base = U * (c.tipo === "satellite" ? 0.011 : c.tipo === "planet" ? 0.021 : 0.015);
      const rad = base * prof * (c.tipo === "planet" ? 1 + parseFloat(c.masa || "1") * 0.045 : 1);

      ctx.save();

      if (c.tipo === "node") {
        // El nodo late con su propia frecuencia y se enciende con los agudos.
        const enc = 0.4 + (p.pulso * 0.5 + 0.5) * 0.6 * (0.5 + a.high);
        ctx.strokeStyle = this.tinta("#FFB74D", enc);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * TAU + Math.PI / 4;
          const x = p.x + Math.cos(ang) * rad * 1.5;
          const y = p.y + Math.sin(ang) * rad * 1.5;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (c.tipo === "gate") {
        // La puerta serpiente está LOCKED hasta REVEAL. Ahí se abre.
        const abierta = revela;
        ctx.strokeStyle = this.tinta(abierta > 0.5 ? this.acento : "#8892a0", 0.4 + abierta * 0.6);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const ang = (i / 6) * TAU;
          const x = p.x + Math.cos(ang) * rad * 1.6;
          const y = p.y + Math.sin(ang) * rad * 1.6;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        if (abierta < 0.5) {
          ctx.fillStyle = this.tinta("#8892a0", 0.6);
          ctx.font = `${Math.max(8, Math.round(U * 0.016))}px "IBM Plex Mono", monospace`;
          ctx.textAlign = "center";
          ctx.fillText("LOCKED", p.x, p.y + rad * 3);
        }
      } else {
        const g = ctx.createRadialGradient(
          p.x - rad * 0.35, p.y - rad * 0.35, rad * 0.1, p.x, p.y, rad,
        );
        g.addColorStop(0, this.tinta("#ffffff", 0.9));
        g.addColorStop(0.55, this.tinta(c.estado === "ACTIVE" ? this.acento : this.apoyo, 0.55));
        g.addColorStop(1, this.tinta("#05060a", 0.9));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = this.tinta("#e8e5df", 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Rótulo: sólo desde ORBIT — "read the nodes" es la fase que los nombra.
      if (orbita > 0.15) {
        ctx.fillStyle = this.tinta("#e8e5df", 0.42 * orbita);
        ctx.font = `${Math.max(8, Math.round(U * 0.017))}px "IBM Plex Mono", monospace`;
        ctx.textAlign = "left";
        ctx.fillText(c.id, p.x + rad + 5, p.y + 3);
      }
      ctx.restore();

      if (c.destino) {
        this.zonas.push({ x: p.x, y: p.y, r: Math.max(rad * 2, U * 0.028), url: `/kodex/vol/${c.destino}/`, nombre: `${c.id} · ${c.nombre}` });
      }
    }
  }

  private puertas(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, esc: number, U: number,
    mapa: number, revela: number, px: number, py: number,
  ): void {
    const R = this.radioMax * esc * 1.14;
    ctx.save();
    ctx.font = `${Math.max(8, Math.round(U * 0.016))}px "IBM Plex Mono", monospace`;
    ctx.textAlign = "center";
    for (const g of PORTALES) {
      const ang = (-g.angulo * Math.PI) / 180;
      const x = cx + Math.cos(ang) * R + px;
      const y = cy + Math.sin(ang) * R + py;
      ctx.strokeStyle = this.tinta(this.acento, (0.4 + revela * 0.5) * mapa);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const b = (i / 6) * TAU;
        const ux = x + Math.cos(b) * U * 0.018;
        const uy = y + Math.sin(b) * U * 0.018;
        i ? ctx.lineTo(ux, uy) : ctx.moveTo(ux, uy);
      }
      ctx.stroke();
      ctx.fillStyle = this.tinta("#e8e5df", 0.6 * mapa);
      ctx.fillText(g.nombre, x, y - U * 0.028);
      if (g.destino) {
        this.zonas.push({ x, y, r: U * 0.032, url: `/kodex/vol/${g.destino}/`, nombre: g.nombre });
      }
    }
    ctx.restore();
  }

  /** REVEAL · "transmit the signal": un pulso que sale del núcleo y se va. */
  private transmision(
    ctx: CanvasRenderingContext2D, cx: number, cy: number, esc: number,
    t: number, revela: number,
  ): void {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const f = ((t * 0.42 + i / 3) % 1);
      const r = f * this.radioMax * esc * 1.3;
      ctx.strokeStyle = this.tinta(this.acento, (1 - f) * 0.5 * revela);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  private tinta(hex: string, alfa: number): string {
    const a = Math.max(0, Math.min(1, alfa));
    if (hex.startsWith("#") && hex.length === 7) {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    return hex;
  }

  /* ── Interacción ─────────────────────────────────────────────────────── */

  private zonaEn(x: number, y: number, r: DOMRect) {
    const dpr = this.cv.width / r.width;
    const px = x * dpr;
    const py = y * dpr;
    return this.zonas.find((z) => Math.hypot(z.x - px, z.y - py) < z.r);
  }

  private hover(x: number, y: number, r: DOMRect): void {
    const z = this.zonaEn(x, y, r);
    this.cv.style.cursor = z ? "pointer" : "";
    this.rotular(z?.nombre ?? null);
  }

  private rotular(txt: string | null): void {
    const el = this.raiz.querySelector<HTMLElement>("[data-kdx-orbita-rotulo]");
    if (!el) return;
    el.textContent = txt ?? "";
    el.hidden = !txt;
  }

  private tocar(e: MouseEvent): void {
    const r = this.cv.getBoundingClientRect();
    const z = this.zonaEn(e.clientX - r.left, e.clientY - r.top, r);
    if (z) location.href = z.url;
  }
}

const montar = () => {
  for (const raiz of document.querySelectorAll<HTMLElement>("[data-kdx-orbita]")) {
    if ((raiz as any).__kdxOrbita) continue;
    (raiz as any).__kdxOrbita = new OrbitMap(raiz);
    ((raiz as any).__kdxOrbita as OrbitMap).irA("MAP");
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
