#version 300 es
precision highp float;

/**
 * KODEX-∞ · TANDA 02 / 08 · PIXEL SORT
 * Referencia: reference/canon/t02-08-pixel-sort.png
 *
 * ADVERTENCIA HONESTA SOBRE ESTE SHADER.
 *
 * Un pixel sort de verdad ordena cada intervalo de la fila por luminancia. Eso
 * es un algoritmo secuencial: no se puede hacer en un fragment shader, donde
 * cada píxel se resuelve sin saber de sus vecinos. Las implementaciones reales
 * usan compute shaders o una bitonic sort de log²(n) pasadas.
 *
 * Esto es una APROXIMACIÓN de una pasada: un estirado direccional que arrastra
 * el píxel más brillante encontrado hacia adelante. Reproduce la lectura del
 * póster —"data becomes motion, order becomes erosion"— y es honesta en lo que
 * cuesta, pero NO es un sort.
 *
 * Si se quiere el efecto exacto de la lámina hay que subirlo a multipass
 * bitónico. Queda anotado, no escondido.
 */

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_inputTex;
uniform vec2  u_resolution;
uniform float u_time;

uniform float u_intensity; // 0.85
uniform float u_seed;      // 0.31
uniform float u_threshold; // 0.20
uniform int   u_sort_axis; // 0 = HORIZONTAL, 1 = VERTICAL

const int STEPS = 24;

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

float hash(float p) {
  return fract(sin(p * 127.1 + u_seed * 311.7) * 43758.5453);
}

void main() {
  vec3 src = texture(u_inputTex, v_uv).rgb;

  // El umbral decide qué se erosiona. Debajo de él el píxel queda intacto: en
  // el póster el planeta conserva su forma y solo el lado iluminado se estira.
  if (luma(src) < u_threshold) {
    fragColor = vec4(src, 1.0);
    return;
  }

  vec2 axis = (u_sort_axis == 1) ? vec2(0.0, 1.0) : vec2(1.0, 0.0);

  // El largo del arrastre varía por línea, no por píxel: si varía por píxel se
  // ve como ruido, y lo que el póster muestra son vetas largas y coherentes.
  float line = (u_sort_axis == 1) ? gl_FragCoord.x : gl_FragCoord.y;
  float len = (0.04 + hash(floor(line)) * 0.16) * u_intensity;

  vec3 best = src;
  float bestL = luma(src);

  for (int i = 1; i <= STEPS; i++) {
    float f = float(i) / float(STEPS);
    vec2 uv = v_uv - axis * len * f;
    if (uv.x < 0.0 || uv.y < 0.0) break;
    vec3 s = texture(u_inputTex, uv).rgb;
    float l = luma(s);
    // Cae con la distancia: sin esto la veta es una barra sólida del color más
    // brillante de la fila entera.
    l *= 1.0 - f * 0.65;
    if (l > bestL) { bestL = l; best = s; }
  }

  fragColor = vec4(mix(src, best, u_intensity), 1.0);
}
