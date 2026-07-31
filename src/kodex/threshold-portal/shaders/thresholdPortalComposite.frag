#version 300 es
precision highp float;

/*
 * KDX_THRESHOLD_PORTAL · COMPOSITE
 *
 * Tercera pasada: el tratamiento. Las dos anteriores producen el portal vivo
 * -- la obra en coordenadas polares, respirando y expandiendose con los graves,
 * con memoria corta de feedback. Aca esa imagen se vuelve KODEX-native.
 *
 * La regla del proyecto es dura: nada entra crudo. Toda imagen, sea la obra de
 * Ocin o una foto, pasa por la transformacion dither/halftone. Ese paso no es
 * un filtro decorativo: es lo que convierte una imagen en textura del sistema.
 *
 * El orden importa y no es libre:
 *
 *   1. PIXELACION por bloques -- se cuantiza la COORDENADA, no el color, para
 *      que los bordes queden duros como en un artefacto de baja resolucion.
 *      Cuantizar el color deja bordes suaves y se lee como JPG malo.
 *   2. CHROMA -- separacion horizontal de canales de un bloque a lo sumo.
 *      Sugiere señal analoga sin ensuciar la lectura.
 *   3. DITHER BAYER sobre la luminancia -- la obra se posteriza a pocos
 *      niveles y el umbral ordenado reparte el error. Es lo que da el grano de
 *      holograma en vez de un degradado liso.
 *   4. Bloom, scanline, viñeta y grano, que ya estaban.
 *
 * El dither va DESPUES del bloom: al reves, el bloom difumina la trama y el
 * dither deja de leerse.
 */

in vec2 v_uv;
out vec4 o;

uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_bass;
uniform float u_motion;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

/**
 * Bayer 8x8 por intercalado de bits. Es la matriz ordenada clasica: reparte el
 * error de cuantizacion en un patron fijo en vez de al azar, que es lo que
 * produce la trama regular del holograma. Con ruido saldria television muerta.
 */
float bayer8(vec2 p) {
  ivec2 i = ivec2(mod(p, 8.0));
  int x = i.x, y = i.y, v = 0;
  for (int k = 0; k < 3; k++) {
    v = (v << 1) | ((y >> (2 - k)) & 1);
    v = (v << 1) | (((x ^ y) >> (2 - k)) & 1);
  }
  return float(v) / 64.0;
}

void main() {
  // 1 · PIXELACION. El bloque late con los graves: la trama se abre cuando
  //     entra el sonido, que es la respiracion del aparato hecha visible.
  float px = max(2.0, 3.0 + u_bass * 2.0);
  vec2 frag = v_uv * u_res;
  vec2 blockPos = floor(frag / px) * px + px * 0.5;
  vec2 uv = blockPos / max(u_res, vec2(1.0));

  // 2 · CHROMA. Un bloque a lo sumo; mas que eso es un efecto, no una señal.
  float chroma = px / max(u_res.x, 1.0) * 0.55;
  vec4 src = texture(u_tex, uv);
  vec3 col = vec3(
    texture(u_tex, uv + vec2(-chroma, 0.0)).r,
    src.g,
    texture(u_tex, uv + vec2(chroma, 0.0)).b
  );

  vec2 pxs = 1.0 / max(u_res, vec2(1.0));
  vec3 bloom = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float a = float(i) * 1.5707963;
    vec2 d = vec2(cos(a), sin(a)) * pxs * (3.0 + u_bass * 5.0);
    bloom += max(vec3(0.0), texture(u_tex, uv + d).rgb - 0.22);
  }
  col += bloom * 0.24;

  // 3 · DITHER. Sobre la luminancia y no por canal: por canal aparecen bordes
  //     de color donde la obra es gris, y la obra es B&N.
  float l = luma(col);
  float levels = 6.0;
  float dithered = floor(l * levels + (bayer8(frag / px) - 0.5) * 0.9 + 0.5) / levels;
  // El color conserva su tono y toma el VALOR de la trama. Reemplazar el color
  // entero por el dither dejaria la pieza en escala de grises y se perderia el
  // rojo del portal.
  // El piso del divisor no puede ser muy bajo: donde la imagen es casi negra,
  // dividir por 0.04 multiplica por 25 y el ruido del fondo se vuelve bloque.
  col *= dithered / max(l, 0.22);

  col *= mix(0.96, 1.0, sin(v_uv.y * u_res.y * 3.14159) * 0.5 + 0.5);
  col *= smoothstep(1.18, 0.22, length(v_uv - 0.5));
  col += (hash21(gl_FragCoord.xy + u_time * 10.0) - 0.5) * 0.018 * step(0.5, u_motion + 0.5);

  o = vec4(col, src.a);
}
