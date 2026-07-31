/**
 * KODEX-∞ · SONDA · runtime
 *
 * Lee lo que ya está publicado -- estado de escena, perfil de rendimiento, bus
 * de audio, receta, capas montadas -- y lo muestra. No instrumenta nada nuevo:
 * si un dato no aparece acá es porque el sistema no lo estaba publicando, y eso
 * también es información.
 *
 * Marca en rojo lo que está fuera de lo que el canon espera. Un panel que sólo
 * muestra números obliga a recordar cuál era el bueno; uno que señala el
 * problema se puede leer de un vistazo.
 */
import { estadoEscena } from "../../../lib/kodex/estado";
import { perfilKodex } from "../../../lib/kodex/perf";

type Fila = [string, string, boolean?];

const activo = () => new URLSearchParams(location.search).get("debug") === "1";

class Sonda {
  private readonly cuerpo: HTMLElement;
  private cuadros = 0;
  private ultimo = performance.now();
  private fps = 0;

  constructor(raiz: HTMLElement) {
    raiz.hidden = false;
    this.cuerpo = raiz.querySelector("[data-kdx-probe-body]") as HTMLElement;
    this.medirFps();
    // Cuatro veces por segundo: suficiente para seguir lo que cambia y lo
    // bastante lento para poder leerlo.
    setInterval(() => this.pintar(), 250);
    this.pintar();
  }

  private medirFps(): void {
    const paso = (t: number) => {
      this.cuadros++;
      if (t - this.ultimo >= 500) {
        this.fps = Math.round((this.cuadros * 1000) / (t - this.ultimo));
        this.cuadros = 0;
        this.ultimo = t;
      }
      requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  private filas(): Fila[] {
    const doc = document.documentElement;
    const escena = document.querySelector<HTMLElement>("[data-kdx-recipe]");
    const bus = (window as unknown as { __kxAudio?: { activo: boolean; low: number; mid: number; high: number } })
      .__kxAudio;

    const portal = document.querySelector<HTMLElement & { __kdxPortal?: { debug(): any } }>("[data-kdx-portal]");
    const campo = document.querySelector<HTMLElement>("[data-kdx-field]");
    const crt = document.querySelector<HTMLElement>(".kdx-crt-mount");
    const obra = document.querySelector<HTMLElement & { __kdxArtifact?: { debug(): any } }>("[data-kdx-artifact]");

    const capas = [
      portal && "portal",
      campo && `campo:${campo.dataset.field ?? "?"}`,
      crt && `crt:${crt.dataset.preset ?? "?"}`,
      obra && "obra",
    ].filter(Boolean) as string[];

    const f: Fila[] = [
      ["escena", escena?.dataset.kdxRecipe ?? "—"],
      ["grilla", escena?.dataset.kdxGrid ?? "—"],
      ["estado", estadoEscena().actual],
      ["perfil", perfilKodex().perfil],
      // Por debajo de 24 el movimiento deja de leerse como movimiento.
      ["fps", String(this.fps), this.fps > 0 && this.fps < 24],
      ["capas", capas.length ? capas.join(" · ") : "ninguna", capas.length === 0],
      ["dpr", String(devicePixelRatio || 1)],
    ];

    // "CERO scroll de pagina" es regla dura de la mision: cada escena es un
    // viewport. Se vigila acá porque es exactamente el tipo de rotura que no
    // avisa -- la pagina scrollea y nadie lo nota hasta que alguien la abre en
    // una ventana mas baja y ve medio pie cortado.
    const sobra = document.documentElement.scrollHeight - innerHeight;
    f.push(["scroll", sobra > 4 ? `+${sobra}px DE MAS` : "un viewport", sobra > 4]);

    if (bus) {
      f.push([
        "audio",
        bus.activo
          ? `L ${bus.low.toFixed(2)} · M ${bus.mid.toFixed(2)} · H ${bus.high.toFixed(2)}`
          : "apagado",
      ]);
    }

    if (portal?.__kdxPortal) {
      const d = portal.__kdxPortal.debug();
      f.push(["portal", `${d.fase} · ${d.metricas?.canvasSize ?? "?"}`]);
    }

    if (obra?.__kdxArtifact) {
      const d = obra.__kdxArtifact.debug();
      // Una obra en "ready" que no se ve es el fallo silencioso que mas veces
      // aparecio en este proyecto: textura cargada, estado correcto, nada en
      // pantalla. Por eso se muestran piso y techo, que es donde estaba.
      f.push(["obra", `${d.estado} · piso ${Number(d.lumaFloor).toFixed(2)} · techo ${Number(d.lumaCeil).toFixed(2)}`]);
    }

    const q = doc.dataset.kdxQuality;
    if (q && q !== perfilKodex().perfil) f.push(["desajuste", `html=${q}`, true]);

    return f;
  }

  private pintar(): void {
    this.cuerpo.replaceChildren(
      ...this.filas().map(([k, v, mal]) => {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.textContent = k;
        const td = document.createElement("td");
        td.textContent = v;
        if (mal) td.dataset.mal = "";
        tr.append(th, td);
        return tr;
      }),
    );
  }
}

const montar = () => {
  if (!activo()) return;
  const raiz = document.querySelector<HTMLElement>("[data-kdx-probe]");
  if (!raiz || (raiz as any).__kdxProbe) return;
  (raiz as any).__kdxProbe = new Sonda(raiz);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else {
  montar();
}
document.addEventListener("astro:page-load", montar);
