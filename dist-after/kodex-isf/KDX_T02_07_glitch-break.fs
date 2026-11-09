/*{
  "DESCRIPTION": "KODEX−∞ TANDA 02 / 07 · GLITCH BREAK — Ruptura controlada / Fractura digital",
  "CREDIT": "KODEX−∞ · derivado de reference/canon/t02-07-glitch-break.png",
  "CATEGORIES": [
    "KODEX",
    "Filter",
    "GLITCH BREAK"
  ],
  "ISFVSN": "2",
  "INPUTS": [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME": "u_glitch_amount",
      "LABEL": "GLITCH AMOUNT",
      "TYPE": "float",
      "DEFAULT": 0.62,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_block_size",
      "LABEL": "BLOCK SIZE",
      "TYPE": "float",
      "DEFAULT": 64,
      "MIN": 1,
      "MAX": 256
    },
    {
      "NAME": "u_speed",
      "LABEL": "SPEED",
      "TYPE": "float",
      "DEFAULT": 1.8,
      "MIN": 0,
      "MAX": 8
    },
    {
      "NAME": "u_displacement",
      "LABEL": "DISPLACEMENT",
      "TYPE": "float",
      "DEFAULT": 0.15,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "u_rgb_shift",
      "LABEL": "RGB SHIFT",
      "TYPE": "float",
      "DEFAULT": 0.5,
      "MIN": 0,
      "MAX": 1
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
 * KODEX-∞ · TANDA 02 / 07 · GLITCH BREAK
 * Referencia: reference/canon/t02-07-glitch-break.png
 * El pliego maestro lo llama GLITCH FRACTURE; el póster GLITCH BREAK.
 *
 * La lámina declara su propio pipeline de 7 etapas: inject → shift → slice →
 * displace → collapse → recode → archive. Las que tienen expresión visual son
 * las cuatro primeras; collapse/recode/archive son estados del sistema, no
 * pasadas de render, así que no se inventan aquí.
 *
 * El glitch es POR BANDAS y DISCRETO EN EL TIEMPO. Un desplazamiento continuo
 * se lee como distorsión analógica, no como fallo digital: lo que lo hace
 * digital es que la banda se mantiene idéntica durante varios cuadros y salta.
 */

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  // Tiempo cuantizado: el fallo salta, no fluye.
  float t = floor(u_time * u_speed * 8.0);

  // Banda horizontal. block_size está en píxeles, así que se calcula sobre la
  // resolución real y no sobre la UV — si no, el bloque cambia de alto al
  // cambiar de tamaño el canvas.
  float band = floor(gl_FragCoord.y / max(u_block_size, 1.0));

  float trigger = hash(vec2(band, t));
  float active = step(1.0 - u_glitch_amount * 0.35, trigger);

  // shift + slice: la banda entera se corre en X.
  float shift = (hash(vec2(band * 1.7, t * 0.3)) - 0.5) * u_displacement * active;
  vec2 uv = v_uv + vec2(shift, 0.0);

  // displace / channel split: el desgarro también separa canales, y solo
  // dentro de la banda activa. Fuera de ella la imagen queda limpia, que es lo
  // que hace legible el contraste.
  float rs = u_rgb_shift * 0.02 * active;

  vec3 col = vec3(
    texture(u_inputTex, uv + vec2(rs, 0.0)).r,
    texture(u_inputTex, uv).g,
    texture(u_inputTex, uv - vec2(rs, 0.0)).b
  );

  // inject noise matrix: bloques duros de ruido sobre una fracción chica.
  vec2 cell = floor(gl_FragCoord.xy / max(u_block_size * 0.25, 1.0));
  float n = hash(cell + t);
  if (n > 1.0 - u_glitch_amount * 0.06) {
    col = vec3(n, n * 0.2, n * 0.6);
  }

  gl_FragColor = vec4(col, 1.0);
}
