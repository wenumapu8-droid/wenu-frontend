/**
 * KODEX-∞ · EL SCROLL COMO HERRAMIENTA
 *
 * Regla dura de la misión: **cero scroll de página**. La rueda no baja el
 * documento — opera la escena. Gira el mandala, desciende por el corredor,
 * recorre la grilla, sube la intensidad.
 *
 * Es la diferencia entre una web y un instrumento. En una web el scroll te
 * mueve a vos por el contenido; acá el contenido no se mueve y vos girás una
 * perilla. El gesto es el mismo que ya tenés en la mano, el significado es
 * otro.
 *
 * Tres cosas que hacen que se sienta bien y no como un secuestro del scroll:
 *
 *  · INERCIA. El valor persigue al objetivo, no salta a él. Un mandala que se
 *    teletransporta con cada muesca de la rueda se siente roto; uno que sigue
 *    y frena se siente pesado, que es lo que un artefacto debe sentir.
 *  · SIN TOPES DUROS en lo que gira. El mandala da vueltas infinitas: llegar
 *    a un tope en un objeto redondo es mentir sobre lo que es.
 *  · SE SUELTA. Si la escena no declara herramienta, la rueda no se toca. Y
 *    nunca se roba el gesto dentro de un bloque que legítimamente scrollea.
 */

export type Herramienta = "girar" | "descender" | "recorrer" | "intensificar" | "orbitar" | "reensamblar";

type Estado = {
  /** Crudo acumulado, sin límite. En "girar" son vueltas. */
  bruto: number;
  /** El valor suavizado que consumen las capas. */
  valor: number;
  /** 0..1 para las herramientas con recorrido finito. */
  progreso: number;
};

class Rueda {
  private readonly herramienta: Herramienta;
  private readonly estado: Estado = { bruto: 0, valor: 0, progreso: 0 };
  private objetivo = 0;
  private raf = 0;
  private ultimo = 0;

  /** Cuánto recorrido tiene la herramienta antes de llegar al final. */
  private get recorrido(): number {
    return this.herramienta === "girar" ? Number.POSITIVE_INFINITY : 2400;
  }

  constructor(raiz: HTMLElement, herramienta: Herramienta) {
    this.herramienta = herramienta;

    // Semilla por URL: `?wheel=1200` arranca como si ya hubieras girado esa
    // cantidad. Existe para poder verificar el giro con capturas -- una
    // captura no puede mover la rueda -- y de paso permite compartir un enlace
    // a un estado concreto de la escena.
    const semilla = Number(new URLSearchParams(location.search).get("wheel"));
    if (Number.isFinite(semilla) && semilla !== 0) {
      this.objetivo = semilla;
      this.estado.bruto = semilla;
    }

    raiz.addEventListener(
      "wheel",
      (e) => {
        // No se roba el gesto si el puntero está sobre algo que de verdad
        // scrollea -- un panel de texto largo, un índice. Ahí la rueda es la
        // rueda.
        const dentro = (e.target as HTMLElement)?.closest?.("[data-kdx-scrollable]");
        if (dentro) return;
        e.preventDefault();
        this.empujar(e.deltaY);
      },
      { passive: false },
    );

    // Táctil: el arrastre vertical hace lo mismo que la rueda.
    let y0: number | null = null;
    raiz.addEventListener("touchstart", (e) => { y0 = e.touches[0]?.clientY ?? null; }, { passive: true });
    raiz.addEventListener(
      "touchmove",
      (e) => {
        if (y0 === null) return;
        const y = e.touches[0]?.clientY ?? y0;
        const d = y0 - y;
        y0 = y;
        if ((e.target as HTMLElement)?.closest?.("[data-kdx-scrollable]")) return;
        e.preventDefault();
        // El dedo recorre menos que la rueda para el mismo efecto.
        this.empujar(d * 2.2);
      },
      { passive: false },
    );

    // El teclado también: flechas y AvPág. Si la rueda opera la escena, el
    // teclado tiene que poder lo mismo o la escena queda inoperable sin mouse.
    addEventListener("keydown", (e) => {
      const paso = e.key === "PageDown" ? 600 : e.key === "PageUp" ? -600
        : e.key === "ArrowDown" ? 120 : e.key === "ArrowUp" ? -120 : 0;
      if (!paso) return;
      e.preventDefault();
      this.empujar(paso);
    });

    this.correr();
    (raiz as any).__kdxRueda = this;
  }

  private empujar(delta: number): void {
    this.objetivo += delta;
    if (Number.isFinite(this.recorrido)) {
      this.objetivo = Math.max(0, Math.min(this.recorrido, this.objetivo));
    }
  }

  private correr(): void {
    const paso = (t: number) => {
      const dt = Math.min(64, this.ultimo ? t - this.ultimo : 16);
      this.ultimo = t;

      // Persecución con inercia. El 0.12 por cuadro a 60fps da una frenada de
      // media segundo: suficiente para sentir peso, poco para sentir retraso.
      const k = 1 - Math.pow(1 - 0.12, dt / 16.667);
      this.estado.bruto += (this.objetivo - this.estado.bruto) * k;

      if (this.herramienta === "girar") {
        // Una vuelta cada 1200px de rueda.
        this.estado.valor = (this.estado.bruto / 1200) * Math.PI * 2;
        this.estado.progreso = ((this.estado.bruto / 1200) % 1 + 1) % 1;
      } else {
        this.estado.valor = this.estado.bruto / this.recorrido;
        this.estado.progreso = this.estado.valor;
      }

      this.publicar();
      this.raf = requestAnimationFrame(paso);
    };
    this.raf = requestAnimationFrame(paso);
  }

  private publicar(): void {
    const w = window as unknown as { __kdxRueda?: { herramienta: Herramienta } & Estado };
    w.__kdxRueda = { herramienta: this.herramienta, ...this.estado };
    // También como variable CSS, para que el chrome pueda reaccionar sin JS:
    // una barra de progreso, un rail que se llena, un número que sube.
    document.documentElement.style.setProperty("--kdx-rueda", this.estado.progreso.toFixed(4));
  }
}

export function montarRueda(): void {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-tool]");
  if (!raiz || (raiz as any).__kdxRueda) return;
  const h = raiz.dataset.kdxTool as Herramienta;
  if (!h) return;
  new Rueda(raiz, h);
}
