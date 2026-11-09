/*{
  "DESCRIPTION": "KODEX−∞ TANDA 02 / 05 · THERMAL MAP — Mapa termico / Calor del archivo",
  "CREDIT": "KODEX−∞ · derivado de reference/canon/t02-05-thermal-map.png",
  "CATEGORIES": [
    "KODEX",
    "Filter",
    "THERMAL MAP"
  ],
  "ISFVSN": "2",
  "INPUTS": [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME": "u_temperature",
      "LABEL": "TEMPERATURE",
      "TYPE": "float",
      "DEFAULT": 1.12,
      "MIN": 0,
      "MAX": 2
    },
    {
      "NAME": "u_color_steps",
      "LABEL": "COLOR STEPS",
      "TYPE": "long",
      "DEFAULT": 8,
      "MIN": 2,
      "MAX": 32
    },
    {
      "NAME": "u_emissive",
      "LABEL": "EMISSIVE",
      "TYPE": "float",
      "DEFAULT": 1.35,
      "MIN": 0,
      "MAX": 3
    },
    {
      "NAME": "u_hue_shift",
      "LABEL": "HUE SHIFT",
      "TYPE": "float",
      "DEFAULT": 0.02,
      "MIN": -1,
      "MAX": 1
    },
    {
      "NAME": "u_contrast",
      "LABEL": "CONTRAST",
      "TYPE": "float",
      "DEFAULT": 1,
      "MIN": 0,
      "MAX": 4
    }
  ]
}*/

// ── compatibilidad ISF → runtime KODEX ──────────────────────────────────
// ISF declara sus propias entradas y uniforms estandar. Lo que en el runtime
// propio son uniforms explicitos, aca son alias.
#define u_inputTex      inputImage
#define u_previousFrame historial
#define u_resolution    RENDERSIZE
#define u_time          TIME
#define u_delta         TIMEDELTA
vec2 v_uv = isf_FragNormCoord;


/**
 * KODEX-∞ · TANDA 02 / 05 · THERMAL MAP
 * Referencia: reference/canon/t02-05-thermal-map.png
 *
 * La lámina declara paleta THERMAL-X con seis bandas (LOW → CRITICAL). Se
 * implementa como rampa continua + cuantización opcional a `color_steps`, no
 * como seis colores duros: el póster muestra degradado dentro de cada banda.
 *
 * La rampa es negro → púrpura → rojo → naranja → amarillo → blanco. No se usa
 * un colormap prestado (inferno, magma) porque ninguno coincide con los
 * púrpuras del póster en la banda baja.
 */

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

vec3 thermalX(float t) {
  t = clamp(t, 0.0, 1.0);
  const vec3 c0 = vec3(0.02, 0.01, 0.06); // 0-50    LOW
  const vec3 c1 = vec3(0.28, 0.06, 0.55); // 50-100  MODERATE
  const vec3 c2 = vec3(0.78, 0.11, 0.36); // 100-150 ELEVATED
  const vec3 c3 = vec3(0.98, 0.34, 0.06); // 150-200 HIGH
  const vec3 c4 = vec3(1.00, 0.72, 0.09); // 200-250 EXTREME
  const vec3 c5 = vec3(1.00, 0.98, 0.86); // >250    CRITICAL
  float s = t * 5.0;
  if (s < 1.0) return mix(c0, c1, s);
  if (s < 2.0) return mix(c1, c2, s - 1.0);
  if (s < 3.0) return mix(c2, c3, s - 2.0);
  if (s < 4.0) return mix(c3, c4, s - 3.0);
  return mix(c4, c5, s - 4.0);
}

void main() {
  vec3 src = texture(u_inputTex, v_uv).rgb;

  float t = luma(src);
  t = clamp((t - 0.5) * u_contrast + 0.5, 0.0, 1.0);
  t = pow(t, 1.0 / max(u_temperature, 1e-3));

  if (u_color_steps >= 2.0) {
    t = floor(t * u_color_steps) / (u_color_steps - 1.0);
  }

  vec3 col = thermalX(clamp(t + u_hue_shift, 0.0, 1.0));

  // Emissive por encima de 1 empuja las bandas altas fuera de rango para que
  // el bloom posterior de la cadena las agarre. Es intencional que sature.
  col *= u_emissive;

  gl_FragColor = vec4(col, 1.0);
}
