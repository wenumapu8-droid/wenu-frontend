#!/usr/bin/env node
/**
 * KODEX-∞ · EXPORTADOR ISF
 *
 * Genera la versión ISF (Interactive Shader Format) de los 8 tratamientos de la
 * TANDA 02, en public/kodex-isf/.
 *
 * Por qué ISF y no un formato propio: el pliego maestro declara
 * «ENGINE: KODELIFE // GLSL» y los pósters ya escriben sus parámetros con
 * nombre, rango y valor por defecto — que es exactamente lo que un bloque ISF
 * describe. Adoptarlo da tres cosas gratis:
 *
 *   · los tratamientos se abren en KodeLife, VDMX, Millumin o el editor web de
 *     ISF sin adaptación, así que Ocín puede tocar los parámetros sin compilar;
 *   · la UI de controles del lab se puede generar sola desde el JSON;
 *   · el rango y el default quedan validables, no comentados.
 *
 * DERIVADO, NO FUENTE. La verdad vive en design-system/tanda-02.json y en los
 * .frag; esto se regenera. Tener el default escrito en dos lugares es cómo
 * empiezan a divergir.
 *
 * ISF y WebGL2 difieren en detalles (ISF usa isf_FragNormCoord, RENDERSIZE,
 * TIME e inputImage; el runtime propio usa v_uv, u_resolution, u_time y
 * u_inputTex). Se emite una capa de compatibilidad al principio del cuerpo en
 * vez de mantener dos copias del shader.
 *
 * Uso: node scripts/kodex/build-isf.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const contrato = JSON.parse(
  readFileSync(join(ROOT, "design-system", "tanda-02.json"), "utf8")
);
const outDir = join(ROOT, "public", "kodex-isf");
mkdirSync(outDir, { recursive: true });

/** Traduce un parámetro del contrato a una entrada ISF. */
function aISF(nombre, spec) {
  const base = { NAME: `u_${nombre}`, LABEL: nombre.replace(/_/g, " ").toUpperCase() };
  const d = spec.default;

  if (spec.opciones) {
    return {
      ...base,
      TYPE: "long",
      VALUES: spec.opciones.map((_, i) => i),
      LABELS: spec.opciones,
      DEFAULT: Math.max(0, spec.opciones.indexOf(String(d))),
    };
  }
  if (typeof d === "boolean") return { ...base, TYPE: "bool", DEFAULT: d };
  if (spec.tipo === "int") {
    return { ...base, TYPE: "long", DEFAULT: d, MIN: spec.rango?.[0] ?? 0, MAX: spec.rango?.[1] ?? 32 };
  }
  return { ...base, TYPE: "float", DEFAULT: d, MIN: spec.rango?.[0] ?? 0, MAX: spec.rango?.[1] ?? 1 };
}

/**
 * Puente ISF → contrato propio. Se inserta después de la cabecera JSON y
 * reemplaza las declaraciones que ISF ya provee, para no declararlas dos veces.
 */
const PUENTE = `
// ── compatibilidad ISF → runtime KODEX ──────────────────────────────────
// ISF declara sus propias entradas y uniforms estandar. Lo que en el runtime
// propio son uniforms explicitos, aca son alias.
#define u_inputTex      inputImage
#define u_previousFrame historial
#define u_resolution    RENDERSIZE
#define u_time          TIME
#define u_delta         TIMEDELTA
vec2 v_uv = isf_FragNormCoord;
`;

let n = 0;
const indice = [];

for (const t of contrato.tratamientos) {
  const fragPath = join(ROOT, "src", "kodex", "treatments", "shaders", `${t.id}.frag`);
  if (!existsSync(fragPath)) {
    console.log(`  · ${t.id}: sin shader, se salta`);
    continue;
  }
  const src = readFileSync(fragPath, "utf8");

  const usaHistorial = /u_previousFrame/.test(src);

  const cabecera = {
    DESCRIPTION: `KODEX−∞ TANDA 02 / ${String(t.numero).padStart(2, "0")} · ${t.titulo} — ${t.subtitulo}`,
    CREDIT: "KODEX−∞ · derivado de reference/canon/" + t.referencia.split("/").pop(),
    CATEGORIES: ["KODEX", "Filter", t.titulo],
    ISFVSN: "2",
    INPUTS: [
      { NAME: "inputImage", TYPE: "image" },
      ...Object.entries(t.parametros).map(([k, v]) => aISF(k, v)),
    ],
    // El feedback necesita un buffer persistente. ISF lo declara asi; sin esto
    // el shader compila y el rastro no aparece nunca.
    ...(usaHistorial ? { PASSES: [{ TARGET: "historial", PERSISTENT: true }] } : {}),
  };

  // El cuerpo va sin su #version ni sus declaraciones de uniform: ISF las pone.
  const cuerpo = src
    .replace(/^#version[^\n]*\n/m, "")
    .replace(/^precision[^\n]*\n/m, "")
    .replace(/^\s*in vec2 v_uv;\s*$/m, "")
    .replace(/^\s*out vec4 fragColor;\s*$/m, "")
    .replace(/^\s*uniform sampler2D (u_inputTex|u_previousFrame);\s*$/gm, "")
    .replace(/^\s*uniform (vec2|float|int)\s+(u_resolution|u_time|u_delta)[^\n]*\n/gm, "")
    .replace(/^\s*uniform (float|int)\s+u_[a-zA-Z_]+;[^\n]*\n/gm, "")
    .replace(/\bfragColor\b/g, "gl_FragColor");

  const salida = `/*${JSON.stringify(cabecera, null, 2)}*/\n${PUENTE}\n${cuerpo}`;
  writeFileSync(join(outDir, `KDX_T02_${String(t.numero).padStart(2, "0")}_${t.id}.fs`), salida);

  indice.push({
    archivo: `KDX_T02_${String(t.numero).padStart(2, "0")}_${t.id}.fs`,
    titulo: t.titulo,
    entradas: cabecera.INPUTS.length - 1,
    persistente: usaHistorial,
  });
  n++;
  console.log(`  ${String(t.numero).padStart(2, "0")} ${t.titulo.padEnd(18)} ${cabecera.INPUTS.length - 1} entradas${usaHistorial ? " · buffer persistente" : ""}`);
}

writeFileSync(
  join(outDir, "index.json"),
  JSON.stringify(
    {
      _nota: "Derivado de design-system/tanda-02.json. NO editar a mano: regenerar con scripts/kodex/build-isf.mjs",
      generado: new Date().toISOString().slice(0, 10),
      tratamientos: indice,
    },
    null,
    2
  )
);
console.log(`\n  ${n} tratamientos → public/kodex-isf/\n`);
