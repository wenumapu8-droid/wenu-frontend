/**
 * KODEX-∞ · ARCHIVE TREE · runtime
 *
 * El panel 02 del plano corriendo: el árbol de memoria en feed vivo.
 *
 * **Este árbol es el mapa, no un dibujo del mapa.** El plano lo dice en una
 * línea — *every leaf is an archive* — y la consecuencia es de navegación: cada
 * hoja lleva a un volumen o a un capítulo, y las demás escenas cuelgan de sus
 * ramas. Por eso va en Canvas 2D: hay que poder señalar una hoja y entrar.
 * Hit-testing y rótulos nítidos son gratis en 2D y caros en un shader.
 *
 * La geometría se genera UNA vez con semilla fija y después sólo se anima. Un
 * árbol que se re-sortea en cada cuadro no es un archivo: es ruido con forma de
 * árbol, y además cuesta lo que no hay que gastar.
 *
 * Las cuatro conductas del panel 07 corren con las duraciones del plano, que no
 * son decorativas:
 *   BREATHE 2–4 s · PULSE 1–2 s · GROW 3–8 s · ARCHIVE 2–6 s
 */

type Bus = { activo: boolean; low: number; mid: number; high: number };
type Destino = { titulo: string; url: string; tipo: string };

/** Un segmento del árbol, ya generado. */
type Rama = {
  x1: number; y1: number; x2: number; y2: number;
  prof: number;
  /** Orden de aparición: el árbol crece de la raíz a las puntas. */
  orden: number;
  raiz: boolean;
};

type Hoja = {
  x: number; y: number; orden: number;
  destino: Destino | null;
};

const TAU = Math.PI * 2;

function audio(t: number): Bus {
  const ka = (window as any).__kodexAudio;
  if (ka && typeof ka.energy === "function") {
    const e = ka.energy();
    if (typeof e === "number" && e > 0) return { activo: true, low: e, mid: e * 0.85, high: e * 0.7 };
  }
  const b = (window as any).__kxAudio as Bus | undefined;
  if (b?.activo) return b;
  return {
    activo: false,
    low: 0.5 + Math.sin(t * 0.7) * 0.3,
    mid: 0.5 + Math.sin(t * 1.3 + 1.7) * 0.25,
    high: 0.5 + Math.sin(t * 2.1 + 3.1) * 0.2,
  };
}

function azar(s: number): () => number {
  let x = s || 1;
  return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; };
}

export class ArchiveTree {
  private readonly cv: HTMLCanvasElement;
  private readonly raiz: HTMLElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly verde: string;
  private readonly claro: string;

  private ramas: Rama[] = [];
  private hojas: Hoja[] = [];
  private ordenMax = 1;
  private destinos: Destino[] = [];

  private raf = 0;
  private t0 = performance.now();
  private reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Estado de crecimiento: 0 SEED · 1 ROOT · 2 BLOOM · 3 TRANSMIT. */
  private idx = 0;
  private val = 0;
  /**
   * Con movimiento reducido el ciclo no avanza, así que el árbol se quedaría
   * en SEED — un tronco pelado — para siempre. Quien pide menos movimiento
   * pide menos movimiento, no menos archivo: arranca CRECIDO y quieto.
   */
  private readonly quietoCrecido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private tCambio = performance.now();
  private manual = false;

  private hover: Hoja | null = null;

  constructor(raiz: HTMLElement) {
    this.raiz = raiz;
    this.cv = raiz.querySelector("canvas")!;
    this.ctx = this.cv.getContext("2d")!;
    this.verde = raiz.dataset.verde || "#9DFF3C";
    this.claro = raiz.dataset.claro || "#4FE07A";

    try { this.destinos = JSON.parse(raiz.dataset.destinos || "[]"); } catch { this.destinos = []; }

    if (this.quietoCrecido) { this.idx = 3; this.val = 3; }

    /**
     * Enlace profundo del estado: `?estado=BLOOM` abre el árbol ahí.
     *
     * Sirve para compartir un estado concreto — y de paso resuelve una
     * limitación real del instrumento con el que reviso: Chrome headless
     * escribe la captura al CARGAR la página, no después de esperar, así que
     * sin esto sólo se puede fotografiar el primer segundo de vida del árbol,
     * que es siempre SEED.
     */
    const pedido = new URLSearchParams(location.search).get("estado")?.toUpperCase();
    const iPedido = pedido ? ["SEED", "ROOT", "BLOOM", "TRANSMIT"].indexOf(pedido) : -1;
    if (iPedido >= 0) { this.idx = iPedido; this.val = iPedido; this.manual = true; }

    this.medir();
    new ResizeObserver(() => this.medir()).observe(raiz);

    raiz.addEventListener("pointermove", (e) => this.mover(e));
    raiz.addEventListener("pointerleave", () => { this.hover = null; this.rotular(null); this.cv.style.cursor = ""; });
    raiz.addEventListener("click", () => { if (this.hover?.destino) location.href = this.hover.destino.url; });

    for (const b of document.querySelectorAll<HTMLButtonElement>("[data-kdx-crecer]")) {
      b.addEventListener("click", () => {
        const i = ["SEED", "ROOT", "BLOOM", "TRANSMIT"].indexOf(b.dataset.kdxCrecer || "");
        if (i < 0) return;
        // Tocar dos veces el activo devuelve el ciclo automático.
        this.manual = !(this.manual && this.idx === i);
        this.idx = i;
        this.tCambio = performance.now();
        this.marcar();
      });
    }

    new IntersectionObserver((es) => {
      for (const e of es) e.isIntersecting ? this.arrancar() : this.parar();
    }, { rootMargin: "120px" }).observe(raiz);

    this.marcar();
  }

  private medir(): void {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = this.raiz.getBoundingClientRect();
    this.cv.width = Math.max(1, Math.round(r.width * dpr));
    this.cv.height = Math.max(1, Math.round(r.height * dpr));
    this.generar();
  }

  /**
   * Genera copa, tronco y raíces. Determinista.
   *
   * `orden` es el NIVEL del segmento — su distancia al tronco —, no el orden en
   * que lo visitó la recursión. La diferencia no es cosmética: la recursión va
   * en profundidad, así que numerar por visita le da números bajos a toda la
   * rama izquierda y altos a la derecha, y el árbol "crece" un lado entero
   * antes de empezar el otro. Un árbol real crece por niveles: todas las ramas
   * de una altura aparecen juntas.
   */
  private generar(): void {
    const w = this.cv.width, h = this.cv.height;
    const U = Math.min(w, h);
    const cx = w / 2;
    // El suelo: por debajo van las raíces, por encima la copa.
    const suelo = h * 0.66;
    const r = azar(1741);

    this.ramas = [];
    this.hojas = [];
    let nivelMax = 0;

    const rama = (x: number, y: number, ang: number, len: number, prof: number, esRaiz: boolean, nivel: number) => {
      if (nivel > nivelMax) nivelMax = nivel;
      if (prof === 0 || len < U * 0.008) {
        if (!esRaiz) this.hojas.push({ x, y, orden: nivel, destino: null });
        return;
      }
      const x2 = x + Math.cos(ang) * len;
      const y2 = y + Math.sin(ang) * len;
      this.ramas.push({ x1: x, y1: y, x2, y2, prof, orden: nivel, raiz: esRaiz });

      // Dos hijas con apertura irregular: un árbol perfectamente simétrico se
      // lee como diagrama, y este tiene que leerse vivo.
      const ap = (esRaiz ? 0.52 : 0.44) + r() * 0.2;
      const dec = esRaiz ? 0.68 : 0.74;
      rama(x2, y2, ang - ap, len * dec, prof - 1, esRaiz, nivel + 1);
      rama(x2, y2, ang + ap, len * dec, prof - 1, esRaiz, nivel + 1);
      // Una tercera rama ocasional rompe la binariedad.
      if (!esRaiz && prof > 3 && r() > 0.62) {
        rama(x2, y2, ang + (r() - 0.5) * 0.3, len * 0.6, prof - 2, false, nivel + 1);
      }
    };

    // Tronco: nivel 0. Es lo primero que existe.
    const troncoLargo = U * 0.15;
    this.ramas.push({ x1: cx, y1: suelo, x2: cx, y2: suelo - troncoLargo, prof: 8, orden: 0, raiz: false });
    // Copa y raíces arrancan JUNTAS en el nivel 1: son el mismo organismo
    // creciendo en dos direcciones, y el plano las nombra capa 01 y capa 03 de
    // una misma cosa.
    rama(cx, suelo - troncoLargo, -Math.PI / 2, U * 0.125, 7, false, 1);
    rama(cx, suelo, Math.PI / 2, U * 0.09, 6, true, 1);

    this.ordenMax = Math.max(1, nivelMax);

    // Cada hoja es un archivo. Los destinos se reparten DISTRIBUIDOS entre las
    // hojas, no en las primeras: si se amontonaran en una rama, media copa
    // quedaría muerta y el mapa mentiría sobre dónde hay algo.
    if (this.destinos.length > 0 && this.hojas.length > 0) {
      const paso = this.hojas.length / this.destinos.length;
      this.destinos.forEach((d, i) => {
        const h = this.hojas[Math.floor(i * paso)];
        if (h) h.destino = d;
      });
    }
  }

  private marcar(): void {
    const id = ["SEED", "ROOT", "BLOOM", "TRANSMIT"][this.idx];
    this.raiz.dataset.estado = id;
    for (const b of document.querySelectorAll<HTMLElement>("[data-kdx-crecer]")) {
      b.setAttribute("aria-pressed", String(b.dataset.kdxCrecer === id));
    }
    const rot = document.querySelector<HTMLElement>("[data-kdx-crecer-rot]");
    if (rot) rot.textContent = this.manual ? `${id} · FIJO` : id;
  }

  private arrancar(): void { if (!this.raf) this.raf = requestAnimationFrame(this.cuadro); }
  private parar(): void { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; } }

  private mover(e: PointerEvent): void {
    const r = this.cv.getBoundingClientRect();
    const dpr = this.cv.width / r.width;
    const x = (e.clientX - r.left) * dpr;
    const y = (e.clientY - r.top) * dpr;
    const tope = Math.min(this.cv.width, this.cv.height) * 0.03;

    let cerca: Hoja | null = null;
    let dMin = tope;
    for (const h of this.hojas) {
      if (!h.destino) continue;
      const d = Math.hypot(h.x - x, h.y - y);
      if (d < dMin) { dMin = d; cerca = h; }
    }
    this.hover = cerca;
    this.cv.style.cursor = cerca ? "pointer" : "";
    this.rotular(cerca?.destino?.titulo ?? null);
  }

  private rotular(txt: string | null): void {
    const el = this.raiz.querySelector<HTMLElement>("[data-kdx-arbol-rotulo]");
    if (!el) return;
    el.textContent = txt ?? "";
    el.hidden = !txt;
  }

  private readonly cuadro = (): void => {
    this.raf = 0;
    const ahora = performance.now();
    const t = this.reducido ? 7.0 : (ahora - this.t0) / 1000;
    const a = audio(t);

    // GROW: el plano da 3–8 s por estado. Se toma el medio del rango.
    if (!this.manual && !this.reducido && ahora - this.tCambio > 5500) {
      this.idx = (this.idx + 1) % 4;
      this.tCambio = ahora;
      this.marcar();
    }
    this.val += (this.idx - this.val) * 0.03;

    this.pintar(t, a);
    if (this.reducido) return;
    this.raf = requestAnimationFrame(this.cuadro);
  };

  private pintar(t: number, a: Bus): void {
    const { ctx, cv } = this;
    const w = cv.width, h = cv.height;
    const U = Math.min(w, h);
    ctx.clearRect(0, 0, w, h);

    // ── Las cuatro conductas del panel 07 ────────────────────────────────
    // BREATHE · 2–4 s: expansión rítmica. Se toma 3 s.
    const respira = 1 + Math.sin((t / 3) * TAU) * 0.018 + (a.mid - 0.5) * 0.02;
    // PULSE · 1–2 s: late con la raíz. 1.5 s.
    const pulso = 0.5 + 0.5 * Math.sin((t / 1.5) * TAU);
    const late = pulso * (0.5 + a.low);
    // ARCHIVE · 2–6 s: las hojas se encienden. 4 s, desfasadas entre sí.
    const archivar = 0.5 + 0.5 * Math.sin((t / 4) * TAU);

    // GROW: cuánto árbol está dibujado. SEED apenas la semilla; TRANSMIT todo.
    const crecido = 0.16 + Math.min(1, this.val / 3) * 0.84;
    const corte = crecido * this.ordenMax;

    const cx = w / 2, cy = h * 0.66;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(respira, respira);
    ctx.translate(-cx, -cy);

    // ── Ramas ────────────────────────────────────────────────────────────
    for (const b of this.ramas) {
      if (b.orden > corte) continue;
      // Las que acaban de aparecer entran con un fundido: el crecimiento se ve.
      // El fundido se mide en NIVELES, no en cientos de segmentos: la escala
      // cambió al cambiar el criterio de orden.
      const nuevo = Math.min(1, (corte - b.orden) / 0.9);
      const base = b.raiz ? 0.28 : 0.42;
      ctx.strokeStyle = b.raiz ? this.claro : this.verde;
      ctx.globalAlpha = (base + b.prof * 0.06) * nuevo;
      ctx.lineWidth = Math.max(0.6, b.prof * U * 0.0013);
      // La raíz lleva el latido: el pulso nace abajo y sube, como dice el plano
      // ("sync with root").
      if (b.raiz) ctx.globalAlpha *= 0.6 + late * 0.7;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ── Hojas · cada una es un archivo ───────────────────────────────────
    for (let i = 0; i < this.hojas.length; i++) {
      const hj = this.hojas[i];
      if (hj.orden > corte) continue;
      const fase = (i * 0.37) % 1;
      const enc = 0.35 + 0.65 * Math.max(0, Math.sin((archivar + fase) * TAU)) * (0.5 + a.high);
      const rad = U * (hj.destino ? 0.006 : 0.0028) * (1 + enc * 0.5);

      ctx.fillStyle = hj.destino ? "#ffffff" : this.verde;
      ctx.globalAlpha = hj.destino ? 0.55 + enc * 0.45 : 0.25 + enc * 0.5;
      ctx.beginPath();
      ctx.arc(hj.x, hj.y, rad, 0, TAU);
      ctx.fill();

      // Las hojas con destino llevan halo: son las que se pueden abrir, y eso
      // tiene que verse sin pasar el puntero por encima.
      if (hj.destino) {
        ctx.globalAlpha = 0.18 + enc * 0.3;
        ctx.strokeStyle = this.verde;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hj.x, hj.y, rad * 2.6, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // ── El ∞ del tronco ──────────────────────────────────────────────────
    // Va en la capa 02, que el plano llama SIGNAL PROCESSING: el símbolo está
    // donde el árbol procesa, no donde decora.
    const rInf = U * 0.032;
    ctx.save();
    ctx.translate(cx, cy - U * 0.065);
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = 0.5 + late * 0.5;
    ctx.lineWidth = Math.max(1, U * 0.0022);
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(s * rInf * 0.82, 0, rInf, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    // ── Rótulos de capa ──────────────────────────────────────────────────
    ctx.font = `${Math.max(8, Math.round(U * 0.017))}px "IBM Plex Mono", monospace`;
    ctx.fillStyle = this.claro;
    ctx.globalAlpha = 0.5;
    ctx.textAlign = "left";
    ctx.fillText("LAYER 01 · CANOPY", w * 0.02, h * 0.14);
    ctx.fillText("LAYER 02 · TRUNK", w * 0.02, cy - U * 0.04);
    ctx.fillText("LAYER 03 · ROOT", w * 0.02, h * 0.9);
    ctx.globalAlpha = 1;

    // La hoja señalada, marcada.
    if (this.hover) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(this.hover.x, this.hover.y, U * 0.022, 0, TAU);
      ctx.stroke();
    }
  }
}

const montar = () => {
  for (const raiz of document.querySelectorAll<HTMLElement>("[data-kdx-arbol]")) {
    if ((raiz as any).__kdxArbol) continue;
    (raiz as any).__kdxArbol = new ArchiveTree(raiz);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else { montar(); }
document.addEventListener("astro:page-load", montar);
