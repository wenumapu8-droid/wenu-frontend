/**
 * KODEX-∞ · EL VIAJE · runtime (FASE 1)
 *
 * Mueve la pista, mantiene el chrome y monta el motor.
 *
 * **Un solo KdxCore para las siete escenas.** Siete contextos WebGL2 con cadena
 * multipass no corren en un teléfono, y el spec pide que corra en un teléfono.
 * Al cambiar de escena se reconstruye el organismo sobre el mismo lienzo: son
 * unos milisegundos y ocurre en un gesto del visitante, no por cuadro.
 *
 * El organismo de esta fase es un PLACEHOLDER declarado: dibuja el gesto y el
 * color de cada escena, nada más. Los ocho organismos fieles son FASE 2, y
 * escribirlos a medias acá sólo serviría para tener que borrarlos.
 */

import { KdxCore, type PasoFx } from "../../../kodex/core/kdx-core";
import { KdxThresholdPortalRuntime } from "../../../kodex/threshold-portal/runtime/KdxThresholdPortalRuntime.js";
import { VIAJE, siguiente, anterior } from "../../../lib/kodex/viaje";
import { horaEspejo } from "../../../lib/kodex/simbolos";
// El ojo se ENSAMBLA desde el shader que ya existe. No se reescribe.
import OJO_FRAG from "../../../kodex/shaders/capitulo/observation-eye.frag?raw";
import CORREDOR_FRAG from "../../../kodex/shaders/lab/split-corridor.frag?raw";
import ESTRUCTURA_FRAG from "../../../kodex/shaders/lab/impossible-structure.frag?raw";
import ORBITA_FRAG from "../../../kodex/shaders/lab/archive-orbit.frag?raw";
import RIPPLE_FRAG from "../../../kodex/shaders/lab/ripple-floor.frag?raw";

/**
 * Organismo de fase 1.
 *
 * Un campo con el gesto de la escena: `u_gesto` decide si respira, barre,
 * desciende u orbita. Es honesto sobre lo que es — la estructura del viaje se
 * puede verificar sin los ocho organismos, y así FASE 1 no queda esperando a
 * FASE 2.
 */
const ORGANISMO_BASE = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 out_color;
uniform vec2  u_res, u_pointer;
uniform float u_time, u_low, u_mid, u_high, u_estado, u_progreso, u_reduced, u_seed;

#define TAU 6.28318530718

float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / max(u_res.y, 1.0);
  float t = u_time * (1.0 - clamp(u_reduced, 0.0, 1.0));
  float g = u_seed;                      // el gesto viaja en la semilla
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // OJO: identificador ASCII. GLSL no acepta acentos ni enies. Un shader con
  // "senal" escrito con enie NO COMPILA, y el motor cae al respaldo: la escena
  // se ve NEGRA sin una sola queja en consola. Me paso aca.
  // (Y sin comillas invertidas en este comentario: esta dentro de un template
  //  literal y lo cerrarian. Tambien me paso, dos veces.)
  float senal = 0.0;

  // PULSE — late desde el centro.
  senal += exp(-r * r * 6.0) * (0.5 + 0.5 * sin(t * 4.19)) * step(abs(g - 1.0), 0.5);
  // SCAN — barrido rotacional.
  senal += pow(1.0 - fract(a / TAU + 0.5 - t * 0.12), 26.0) * step(abs(g - 2.0), 0.5);
  // DESCEND — anillos que caen hacia el centro.
  senal += (1.0 - smoothstep(0.0, 0.02, abs(fract(r * 3.0 + t * 0.5) - 0.5) * 0.5)) * step(abs(g - 3.0), 0.5);
  // REVEAL — retícula que se abre.
  senal += max(1.0 - smoothstep(0.0, 0.006, abs(fract(uv.x * 6.0) - 0.5) * 0.14),
               1.0 - smoothstep(0.0, 0.006, abs(fract(uv.y * 6.0) - 0.5) * 0.14))
           * smoothstep(0.0, 1.0, u_progreso) * step(abs(g - 4.0), 0.5);
  // ORBIT — elipses girando.
  senal += (1.0 - smoothstep(0.0, 0.015, abs(length(vec2(uv.x, uv.y * 2.2)) - 0.5 - sin(t * 0.4) * 0.06)))
           * step(abs(g - 5.0), 0.5);
  // RETURN — todo converge y se apaga.
  senal += exp(-abs(r - 0.6 + fract(t * 0.2) * 0.6) * 14.0) * step(abs(g - 6.0), 0.5);

  senal *= 0.35 + u_low * 0.5;
  senal *= 0.4 + u_estado * 0.2;

  vec3 col = vec3(senal);
  col += vec3(hash(gl_FragCoord.xy + floor(t * 24.0)) - 0.5) * 0.012;
  col *= clamp(1.2 - r * 0.5, 0.0, 1.0);
  out_color = vec4(col, 1.0);
}`;

const GESTO_N: Record<string, number> = {
  pulse: 1, scan: 2, descend: 3, reveal: 4, orbit: 5, return: 6,
};

const montar = () => {
  const raiz = document.querySelector<HTMLElement>("[data-kdx-viaje]");
  if (!raiz || (raiz as any).__kdxViaje) return;
  (raiz as any).__kdxViaje = true;

  const pista = raiz.querySelector<HTMLElement>("[data-vj-pista]")!;
  const campo = raiz.querySelector<HTMLElement>("[data-vj-campo]")!;
  const ruta = raiz.querySelector<HTMLElement>("[data-vj-ruta]")!;
  const estado = raiz.querySelector<HTMLElement>("[data-vj-estado]")!;
  const barra = raiz.querySelector<HTMLElement>("[data-vj-barra]")!;
  const escenas = [...raiz.querySelectorAll<HTMLElement>("[data-vj-escena]")];
  const chips = [...raiz.querySelectorAll<HTMLElement>("[data-vj-ir]")];

  let i = 0;
  let core: KdxCore | null = null;
  let portal: any = null;
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Monta el organismo de la escena.
   *
   * **Un pipeline por escena activa, y se destruye al salir.** No se pausan
   * siete motores: se construye el de la escena y se libera el anterior. Siete
   * contextos WebGL2 vivos no entran en un teléfono, y el spec pide teléfono.
   *
   * Donde existe el MÓDULO REAL se ensambla desde él y no se reescribe el
   * shader. Hoy eso es THRESHOLD, con su runtime de tres pases. El resto usa
   * el organismo de gesto hasta que lleguen sus módulos — está anotado como
   * blocker en PROGRESS.md, no disimulado.
   */
  const montarCampo = () => {
    core?.dispose(); core = null;
    portal?.dispose?.(); portal = null;
    campo.innerHTML = "<canvas></canvas>";
    const cv = campo.querySelector("canvas")!;
    const e = VIAJE[i];

    /**
     * El lienzo se dimensiona ACÁ, explícitamente, antes de entregárselo a
     * ningún runtime.
     *
     * Depender de que el CSS ya haya aplicado cuando el runtime mide es una
     * carrera que se pierde: el canvas lo crea JS, los estilos de Astro van
     * scopeados con un `data-astro-cid-…` que el elemento nuevo no lleva, y el
     * runtime lee `clientWidth` — que devuelve los 300×150 por defecto. El
     * organismo termina dibujado en una cajita de la esquina, sin un error.
     *
     * Con estilo en línea y las medidas puestas a mano, el runtime recibe un
     * lienzo correcto pase lo que pase con la cascada.
     *
     * El DPR es el del spec: 1 en móvil, 1.5 en desktop.
     */
    const caja = campo.getBoundingClientRect();
    const dpr = innerWidth < 720 ? 1 : Math.min(devicePixelRatio || 1, 1.5);
    cv.style.display = "block";
    cv.style.width = "100%";
    cv.style.height = "100%";
    cv.width = Math.max(1, Math.round(caja.width * dpr));
    cv.height = Math.max(1, Math.round(caja.height * dpr));

    if (e.id === "threshold") {
      const p = new KdxThresholdPortalRuntime(cv, {
        state: "DORMANT",
        // El modo de movimiento del runtime honra la preferencia del sistema:
        // no se apaga la pieza, se detiene.
        motionMode: reducido ? "reduced" : "live",
        qualityLevel: innerWidth < 720 ? "LOW" : "HIGH",
        // La obra por defecto del módulo (`bw-06-alpha.png`) no está en este
        // repo. Se le pasa una que sí existe en vez de dejar que falle: el
        // portal sin textura arranca y no dibuja nada, en silencio.
        artworkUrl: "/img/kodex/works/bw-01.jpg",
      });
      portal = p;
      // El contrato del módulo es `await load()` y RECIÉN despues `start()`:
      // `load()` es quien inicializa el contexto GL, y `start()` se sale solo
      // si no lo encuentra. Llamar start() directo deja el lienzo negro sin
      // ningún error — me pasó.
      p.load().then(() => {
        if (portal !== p) { p.dispose?.(); return; }   // la escena ya cambió
        p.start();
        // El runtime mide el lienzo dentro de `load()`, que corre ANTES de que
        // el navegador haya aplicado el `width:100%` del CSS: se quedaba con
        // los 300x150 por defecto y dibujaba el portal en una cajita de la
        // esquina. Se le pide remedir en el siguiente cuadro, ya con layout.
        requestAnimationFrame(() => {
          if (portal !== p) return;
          p._resize?.();
          dispatchEvent(new Event("resize"));
        });
        if (!reducido) setTimeout(() => { if (portal === p) p.setState("AWARE"); }, 1200);
      }).catch((err: unknown) => {
        campo.dataset.kdxPortalError = String(err).slice(0, 160);
      });
      return;
    }

    if (e.id === "prologue") {
      // PROLOGUE · el ojo. Mismo shader del capítulo OBSERVATION EYE, montado
      // en el motor del viaje. Sus parámetros propios entran por `uniformes`.
      const t0 = performance.now();
      let proxBlink = 2.4;
      core = new KdxCore(campo, {
        organismo: OJO_FRAG,
        // DITHER MATRIX a media fuerza: le da materia de archivo sin tapar la
        // fibra del iris, que es lo que hay que ver.
        cadena: [{ id: "dither-matrix", mix: 0.34 }],
        seed: 2,
        uniformes: () => {
          const t = reducido ? 3 : (performance.now() - t0) / 1000;
          // El parpadeo va por reloj y a intervalos irregulares: metronómico
          // se leería como animación, irregular se lee como vivo.
          let blink = 0;
          if (!reducido) {
            const d = t - proxBlink;
            if (d > 0 && d < 0.22) blink = Math.sin((d / 0.22) * Math.PI);
            else if (d >= 0.22) proxBlink = t + 2.6 + ((t * 7919) % 5);
          }
          return {
            /**
             * `u_estado` mapeado, y esto es una lección de interfaz.
             *
             * El motor entrega 0–3 (DORMANT→AWARE→ACTIVE→OPEN). Este shader
             * viene del capítulo OBSERVATION EYE, donde 0–2 significaba
             * LOCK→TRACK→IDLE. Al montarlo tal cual, el ojo se leía a sí mismo
             * como IDLE y se atenuaba al 42% — compilaba, corría, y salía casi
             * negro sin un solo error.
             *
             * Se traduce acá y no se toca el shader: el organismo es código
             * que ya funciona, y el que tiene que adaptarse es quien lo
             * hospeda. El viaje avanza LOCK → TRACK, sin llegar nunca a IDLE:
             * un ojo que observa no se apaga.
             */
            u_estado: Math.min(1, (core as any)?.progresoPublico?.() ?? 0.35),
            u_blink: blink,
            // La paleta del organismo, en su lugar: el motor no la conoce.
            u_violeta: [0.565, 0.235, 1.0],   // #903CFF
            u_cyan: [0.0, 0.969, 1.0],        // #00F7FF
            u_rojo: [1.0, 0.125, 0.157],      // #FF2028
          };
        },
      });
      return;
    }

    /**
     * DESCENT · el corredor, REACTIVADO.
     *
     * Estuvo apagado mientras `split-corridor` no dibujaba. La causa era un
     * bug de SDF —multiplicar una distancia con signo por un factor de
     * revelado, ver B4— y está corregida.
     *
     * La cadena se eligió MIDIENDO sobre este organismo, no sobre el de
     * prueba: CRT SCAN + DITHER MATRIX da 57.6% de fondo oscuro contra 44.5%
     * crudo, y le gana a THERMAL (52.6%) y a DITHER solo (51.4%). Y CRT es
     * además lo que el corredor pide: es un tubo, y las líneas del tubo lo
     * dicen mejor que nada.
     */
    if (e.id === "descent") {
      core = new KdxCore(campo, {
        organismo: CORREDOR_FRAG,
        cadena: [
          { id: "crt-scan", mix: 0.62 },
          { id: "dither-matrix", mix: 0.42 },
        ],
        seed: 3,
        uniformes: () => ({
          // 0.45 sale de MEDIR: con la cadena CRT+DITHER da 84.6% de fondo
          // oscuro en el banco, que es el canon. Y sólo se pudo ajustar
          // después de conectar `u_intensity`, que el shader declaraba y no
          // usaba — antes cualquier valor daba idéntico.
          u_intensity: 0.45,
          u_branchBias: 0.35,
          u_branchPulseAge: 0.0,
        }),
      });
      return;
    }

    /**
     * Las tres últimas, desde los shaders del lab. Sin reescribir ninguno.
     *
     * Cada uno lleva el tratamiento que su escena pide, no el que quede bien:
     * MACHINE genera, así que le toca GLITCH FRACTURE — la señal se rompe al
     * generarse. COSMOLOGY orbita: CHROMATIC SPLIT, que es lo que hace una
     * óptica mirando lejos. RETURN cierra: MEMORY FEEDBACK, que es literalmente
     * recordar.
     */
    const DESDE_LAB: Record<string, { frag: string; fx: PasoFx[]; u?: Record<string, number> }> = {
      // Las intensidades salen de MEDIR contra el canon (~85% de fondo oscuro),
      // no de tantear. En MACHINE hubo que conectar antes `u_intensity`, que
      // `impossible-structure` declaraba sin usar.
      machine:   { frag: ESTRUCTURA_FRAG, fx: [{ id: "glitch-fracture", mix: 0.30 }], u: { u_intensity: 0.55 } },
      cosmology: { frag: ORBITA_FRAG,     fx: [{ id: "chromatic-split", mix: 0.45 }], u: { u_intensity: 0.7 } },
      /**
       * RETURN salía al 66% de fondo oscuro, por debajo del canon (~85%).
       *
       * Bajarle `u_intensity` no hizo nada: **ese uniform está declarado y
       * jamás usado en `ripple-floor`**. Lo confirmé leyendo el shader, después
       * de que la medición se moviera 2 puntos ante un cambio que debía
       * moverla mucho.
       *
       * Probé encadenar BITMAP THRESHOLD con `CRUSH` alto, pensando que
       * aplastaría las sombras. Tampoco: con la posterización desactivada y su
       * término de borde, ese pase ACLARA en vez de oscurecer. Medido: 67.5%.
       *
       * Segunda vez en esta tanda que encadeno a ciegas teniendo un banco de
       * pruebas — `/kodex/lab/core/?fx=<id>` existe justamente para medir un
       * pase aislado antes de meterlo en una escena. Queda revertido a la
       * cadena que sí se ve bien, y B5 anotado con lo aprendido.
       */
      return: {
        frag: RIPPLE_FRAG,
        fx: [
          { id: "memory-feedback", mix: 0.40 },
          // DITHER MATRIX, elegido POR MEDICIÓN y no por intuición: en el banco
          // de pruebas baja la luz un 23% y sube el fondo oscuro a 87.8%. Es el
          // segundo mejor oscurecedor de los ocho y, a diferencia de THERMAL
          // MAP (−25%), no reescribe la paleta — que en RETURN importa, porque
          // su color es blanco/verde y no una escala térmica.
          { id: "dither-matrix", mix: 0.5 },
        ],
      },
    };

    const lab = DESDE_LAB[e.id];
    if (lab) {
      core = new KdxCore(campo, {
        organismo: lab.frag,
        cadena: lab.fx,
        seed: GESTO_N[e.gesto] ?? 1,
        uniformes: () => ({ ...(lab.u ?? {}) }),
      });
      return;
    }

    core = new KdxCore(campo, {
      organismo: ORGANISMO_BASE,
      cadena: [{ id: "crt-scan", mix: 0.55 }],
      seed: GESTO_N[e.gesto] ?? 1,
    });
  };

  /**
   * La escena que se está mirando NO está dormida.
   *
   * DORMANT es el estado de una escena a la que nadie llegó. Pero el viaje
   * monta la escena porque el visitante YA está ahí, así que arrancarla en
   * DORMANT es mentirle al organismo — y varios shaders del lab multiplican
   * toda su salida por la consciencia, así que en DORMANT se ven negros.
   * Entra en AWARE y sube sola desde ahí.
   */
  const despertar = () => {
    core?.irA("AWARE");
    if (!reducido) setTimeout(() => core?.irA("ACTIVE"), 900);
  };

  const ir = (n: number, foco = true) => {
    i = ((n % VIAJE.length) + VIAJE.length) % VIAJE.length;
    const e = VIAJE[i];

    pista.style.transform = `translate3d(${-i * (100 / VIAJE.length)}%, 0, 0)`;
    ruta.textContent = `${e.n} / ${e.titulo}`;
    estado.textContent = e.estado;
    barra.style.width = `${((i + 1) / VIAJE.length) * 100}%`;
    barra.style.background = e.color;
    // La capa SVG hereda el acento por currentColor: marco, regla y barcode
    // cambian juntos con un solo set.
    raiz.querySelector<SVGElement>(".vj__svg")?.style.setProperty("color", e.color);
    raiz.style.setProperty("--c-actual", e.color);

    escenas.forEach((el, k) => {
      const act = k === i;
      el.toggleAttribute("data-activa", act);
      // Lo que no está al frente no se lee ni se tabula: un lector de pantalla
      // no debe recorrer seis escenas invisibles para llegar a la que se ve.
      el.setAttribute("aria-hidden", act ? "false" : "true");
      el.querySelector("button")?.toggleAttribute("disabled", !act);
    });
    chips.forEach((c, k) => c.setAttribute("aria-current", String(k === i)));

    // El hash deja compartir y recargar una escena concreta.
    history.replaceState(null, "", `#${e.id}`);
    montarCampo();
    despertar();
    if (foco) raiz.querySelector<HTMLElement>(`[data-vj-escena="${i}"] button`)?.focus({ preventScroll: true });
  };

  // La acción de cada escena avanza el viaje. RETURN vuelve a THRESHOLD por
  // el módulo: el archivo no termina, se recorre.
  raiz.querySelectorAll<HTMLButtonElement>("[data-vj-accion]").forEach((b) => {
    b.addEventListener("click", () => {
      // ENTER abre el portal ANTES de avanzar: la acción tiene consecuencia
      // visible en la escena que se deja, no sólo en la que llega.
      if (portal?.setState) {
        portal.setState("OPEN");
        setTimeout(() => ir(siguiente(i)), reducido ? 0 : 620);
        return;
      }
      ir(siguiente(i));
    });
  });
  chips.forEach((c) => c.addEventListener("click", () => ir(Number(c.dataset.vjIr))));
  raiz.querySelector("[data-vj-next]")?.addEventListener("click", () => ir(siguiente(i)));
  raiz.querySelector("[data-vj-prev]")?.addEventListener("click", () => ir(anterior(i)));

  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") ir(siguiente(i));
    if (e.key === "ArrowLeft") ir(anterior(i));
  });

  /**
   * El reloj y las horas espejo.
   *
   * Se marcan 11:11, 4:44 y compañía porque son una convención de la cultura
   * contemporánea que el archivo reconoce. Lo que se dibuja es un HECHO sobre
   * el reloj — "hora espejo" — y nada más: el sistema celebra la coincidencia,
   * no le atribuye poder. Afirmar lo segundo sería un claim, y está prohibido.
   */
  const reloj = raiz.querySelector<HTMLElement>("[data-vj-reloj]");
  const espejo = raiz.querySelector<HTMLElement>("[data-vj-espejo]");
  const tic = () => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    if (reloj) reloj.textContent = `${p(d.getHours())}:${p(d.getMinutes())}`;
    const e = horaEspejo(d.getHours(), d.getMinutes());
    if (espejo) {
      espejo.hidden = e === null;
      if (e) espejo.textContent = `HORA ESPEJO ${e}`;
    }
    // El archivo se abre en la hora espejo: el sello toma el acento.
    raiz.toggleAttribute("data-abierto", e !== null);
  };
  tic();
  setInterval(tic, 15000);

  // Entrada por hash: `#cosmology` abre esa escena.
  const h = location.hash.slice(1);
  const k = VIAJE.findIndex((e) => e.id === h);
  ir(k >= 0 ? k : 0, false);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else { montar(); }
document.addEventListener("astro:page-load", montar);
