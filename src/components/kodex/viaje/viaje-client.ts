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

import { KdxCore } from "../../../kodex/core/kdx-core";
import { VIAJE, siguiente, anterior } from "../../../lib/kodex/viaje";

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

  /** Reconstruye el motor con el gesto de la escena. */
  const montarCampo = () => {
    core?.dispose();
    const e = VIAJE[i];
    core = new KdxCore(campo, {
      organismo: ORGANISMO_BASE,
      // El tratamiento por escena entra en FASE 2. Acá va la cadena mínima que
      // le da materia al negro sin taparlo.
      cadena: [{ id: "crt-scan", mix: 0.55 }],
      seed: GESTO_N[e.gesto] ?? 1,
    });
  };

  const ir = (n: number, foco = true) => {
    i = ((n % VIAJE.length) + VIAJE.length) % VIAJE.length;
    const e = VIAJE[i];

    pista.style.transform = `translate3d(${-i * (100 / VIAJE.length)}%, 0, 0)`;
    ruta.textContent = `${e.n} / ${e.titulo}`;
    estado.textContent = e.estado;
    barra.style.width = `${((i + 1) / VIAJE.length) * 100}%`;
    barra.style.background = e.color;

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
    if (foco) raiz.querySelector<HTMLElement>(`[data-vj-escena="${i}"] button`)?.focus({ preventScroll: true });
  };

  // La acción de cada escena avanza el viaje. RETURN vuelve a THRESHOLD por
  // el módulo: el archivo no termina, se recorre.
  raiz.querySelectorAll<HTMLButtonElement>("[data-vj-accion]").forEach((b) => {
    b.addEventListener("click", () => ir(siguiente(i)));
  });
  chips.forEach((c) => c.addEventListener("click", () => ir(Number(c.dataset.vjIr))));
  raiz.querySelector("[data-vj-next]")?.addEventListener("click", () => ir(siguiente(i)));
  raiz.querySelector("[data-vj-prev]")?.addEventListener("click", () => ir(anterior(i)));

  addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") ir(siguiente(i));
    if (e.key === "ArrowLeft") ir(anterior(i));
  });

  // Entrada por hash: `#cosmology` abre esa escena.
  const h = location.hash.slice(1);
  const k = VIAJE.findIndex((e) => e.id === h);
  ir(k >= 0 ? k : 0, false);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", montar, { once: true });
} else { montar(); }
document.addEventListener("astro:page-load", montar);
