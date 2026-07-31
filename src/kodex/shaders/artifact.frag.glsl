#ifdef GL_ES
precision highp float;
precision highp int;
#endif

// KODEX-∞ · ARTIFACT
//
// Trata la OBRA (mandala / roseton / arbol / patron mapuche) como un artefacto
// archivado: pixelado por bloques, dither Bayer, scanlines, glow y un chroma
// minimo. Reemplaza el anchor vectorial anterior, que se leia "cargado y
// abstracto" -- un enredo de lineas suaves donde deberia haber una pieza.
//
// Reglas de direccion de arte (Ocin, 2026-07-30):
//  · La obra es el FOCO. El tratamiento la envuelve, nunca compite con ella.
//  · La densidad vive en los DATOS (rails, metadata), no en este visual.
//  · El fondo es un campo sutil del color de la escena, no un tangle animado.
//  · Legible ante todo: si el efecto tapa la pieza, el efecto esta mal.

uniform sampler2D artwork;      // la obra, con alpha
uniform vec2  resolution;
uniform vec2  artworkSize;      // px reales, para respetar la proporcion
uniform float time;
uniform vec3  accent;           // color de la escena (threshold = rojo)
uniform float pixelSize;        // lado del bloque, en px de pantalla
uniform float ditherAmount;     // 0 = limpio · 1 = dither pleno
uniform float scanlineAmount;
uniform float glowAmount;
uniform float chromaAmount;
uniform float flickerAmount;
uniform float reducedMotion;    // 1 = sin animacion
uniform float reveal;           // 0..1 para la entrada
// Casi todo el portafolio son JPG opacos sobre negro: no traen alpha del que
// sacar la silueta. Con lumaKey en 1 la mascara se deriva de la luminancia,
// que en una obra sobre fondo negro es exactamente la pieza. Con 0 se usa el
// alpha del archivo (mandala, PNG recortados).
uniform float lumaKey;
uniform float lumaFloor;        // por debajo de esto se considera fondo
// Cuanto del acento entra EN la pieza. Bajo por defecto: la obra se lee
// clara y el color vive en el ambiente, como en los boards.
uniform float tint;

varying vec2 v_texcoord;

// Bayer 8x8 sin arreglo: los arreglos en WebGL1 no admiten indice dinamico en
// todos los drivers, asi que se calcula el umbral por bit-interleaving. Sale
// mas barato y funciona igual en GPUs viejas, que es la mitad del publico.
float bayer8(vec2 pos) {
  vec2 p = floor(mod(pos, 8.0));
  float x = p.x;
  float y = p.y;
  float result = 0.0;
  float scale = 1.0;
  for (int i = 0; i < 3; i++) {
    float xb = mod(x, 2.0);
    float yb = mod(y, 2.0);
    result += scale * (3.0 * mod(xb + yb, 2.0) + 2.0 * xb + yb) * 0.25;
    x = floor(x * 0.5);
    y = floor(y * 0.5);
    scale *= 0.25;
  }
  return result;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

// Ruido barato y estable: se usa para decidir que franja glitchea y cuando.
// Debe ser determinista por (franja, instante) o el glitch titilaria en cada
// frame en vez de durar un momento.
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Muestrea la obra encajandola por "contain": nunca la deforma. Fuera de la
// pieza devuelve alpha 0, para que el marco quede limpio.
vec4 sampleArtwork(vec2 uv, vec2 offset) {
  float canvasAspect = resolution.x / max(resolution.y, 1.0);
  float artAspect = artworkSize.x / max(artworkSize.y, 1.0);
  vec2 scale = artAspect > canvasAspect
    ? vec2(1.0, canvasAspect / artAspect)
    : vec2(artAspect / canvasAspect, 1.0);
  vec2 p = (uv - 0.5) / scale + 0.5 + offset;
  if (p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return vec4(0.0);
  return texture2D(artwork, p);
}

// Muestreo por BLOQUE, quedandose con lo mas presente del bloque.
//
// Por que existe: el mandala son lineas finas sobre transparente -- apenas el
// 13% de los pixeles tienen tinta. Muestrear el centro del bloque hacia
// desaparecer la pieza entera: si la linea no cruzaba justo ese punto, el
// bloque salia vacio. Se toma el maximo alpha del bloque (una dilatacion) y el
// color del punto de mas tinta, asi la geometria sobrevive a la pixelacion.
vec4 sampleBlock(vec2 blockUv, vec2 texel, vec2 offset) {
  vec4 best = vec4(0.0);
  float bestWeight = -1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 d = vec2(float(x), float(y)) * texel * 0.5;
      vec4 s = sampleArtwork(blockUv + d, offset);
      // Con lumaKey la presencia la da el brillo, no el alpha: en un JPG sobre
      // negro el alpha siempre es 1 y compararlo no distingue pieza de fondo.
      float weight = mix(s.a, s.a * luma(s.rgb), lumaKey);
      if (weight > bestWeight) { bestWeight = weight; best = s; }
    }
  }
  // La mascara final: alpha del archivo, o la luminancia recortada por el piso.
  float keyed = smoothstep(lumaFloor, lumaFloor + 0.22, luma(best.rgb));
  best.a = mix(best.a, best.a * keyed, lumaKey);
  return best;
}

void main() {
  vec2 fragPos = v_texcoord * resolution;

  // 1 · PIXELACION. Se cuantiza la coordenada, no el color: asi los bordes de
  //     la obra quedan duros como en un artefacto de baja resolucion.
  float px = max(pixelSize, 1.0);
  vec2 blockPos = floor(fragPos / px) * px + px * 0.5;
  vec2 blockUv = blockPos / resolution;

  // 2 · CHROMA. Separacion horizontal de canales, de un bloque a lo sumo.
  //     Sugiere señal analoga sin ensuciar la lectura.
  vec2 texel = px / resolution;
  float chroma = chromaAmount * px / max(resolution.x, 1.0);
  float r = sampleBlock(blockUv, texel, vec2(-chroma, 0.0)).r;
  vec4  g = sampleBlock(blockUv, texel, vec2(0.0, 0.0));
  float b = sampleBlock(blockUv, texel, vec2( chroma, 0.0)).b;
  vec3 art = vec3(r, g.g, b);
  float alpha = g.a;

  // 3 · DITHER BAYER sobre la luminancia. La obra se posteriza a pocos niveles
  //     y el umbral ordenado reparte el error: es lo que da el grano de
  //     holograma en vez de un degradado liso.
  float threshold = bayer8(fragPos / px) - 0.5;
  float l = luma(art);
  float levels = mix(24.0, 4.0, ditherAmount);
  float dithered = floor(l * levels + threshold * ditherAmount + 0.5) / levels;
  // La obra se mantiene clara y el acento vive en el AMBIENTE -- anillos,
  // paneles, glow -- no dentro de la pieza. En la referencia de THRESHOLD el
  // mandala es blanco sobre negro y el rojo esta alrededor; tenirlo al 72%,
  // como estaba, se comia el patron justo cuando la pieza es el motivo de
  // toda la lamina.
  vec3 base = mix(vec3(dithered), art * (0.45 + dithered * 0.55), 0.35);
  vec3 color = mix(base, accent * dithered, tint);

  // 4 · GLOW. Halo del color de la escena alrededor de la pieza, muestreando
  //     el alpha en cruz. Barato y suficiente a esta escala.
  float halo = 0.0;
  for (int i = 1; i <= 4; i++) {
    float d = float(i) * px * 1.5 / max(resolution.x, 1.0);
    halo += sampleBlock(blockUv + vec2( d, 0.0), texel, vec2(0.0)).a;
    halo += sampleBlock(blockUv + vec2(-d, 0.0), texel, vec2(0.0)).a;
    halo += sampleBlock(blockUv + vec2(0.0,  d), texel, vec2(0.0)).a;
    halo += sampleBlock(blockUv + vec2(0.0, -d), texel, vec2(0.0)).a;
  }
  halo = clamp(halo / 16.0 - alpha, 0.0, 1.0);
  color += accent * halo * glowAmount;
  alpha = clamp(alpha + halo * glowAmount * 0.55, 0.0, 1.0);

  // 5 · SCANLINES fijas al pixel fisico: si escalaran con el zoom producirian
  //     moire. Una linea cada dos pixeles de bloque.
  float scan = 0.5 + 0.5 * sin(fragPos.y / max(px * 0.5, 1.0) * 3.14159265);
  color *= 1.0 - scanlineAmount * (1.0 - scan) * 0.85;

  // 6 · VIDA HOLOGRAFICA. En las plantillas de KodeLife el holograma nunca
  //     esta quieto: respira, se desalinea un instante y lo recorre un barrido.
  //     Son tres gestos chicos y lentos; juntos hacen la diferencia entre una
  //     imagen tratada y un artefacto proyectado.
  float motion = 1.0 - reducedMotion;

  //   a · Latido de intensidad, con dos frecuencias que nunca coinciden.
  float flicker = 1.0 + motion * flickerAmount * (
      sin(time * 7.3) * 0.5 + sin(time * 17.1) * 0.3 + sin(time * 2.7) * 0.2
    ) * 0.1;
  color *= flicker;

  //   b · Barrido de refresco: una banda tenue que sube cada pocos segundos,
  //       como el rolling de una pantalla mal sincronizada.
  float sweepPos = fract(time * 0.18);
  float sweep = smoothstep(0.06, 0.0, abs(v_texcoord.y - sweepPos));
  color += accent * sweep * 0.16 * motion * alpha;

  //   c · Glitch de linea: cada tanto una franja se desplaza un bloque. Muy
  //       breve y muy raro; si se nota el patron, deja de leerse como falla.
  float band = floor(v_texcoord.y * 48.0);
  float glitchGate = step(0.988, hash21(vec2(band, floor(time * 3.0))));
  float glitchAmt = glitchGate * motion * 0.6;
  if (glitchAmt > 0.0) {
    vec2 shifted = blockUv + vec2(px * 2.0 / resolution.x, 0.0);
    vec4 g2 = sampleBlock(shifted, texel, vec2(0.0));
    color = mix(color, accent * luma(g2.rgb) + color * 0.4, glitchAmt);
    alpha = max(alpha, g2.a * glitchAmt);
  }

  // 7 · CAMPO DE FONDO. Retícula de puntos muy tenue del color de la escena.
  //     Da cuerpo de dispositivo sin convertirse en un tangle.
  // Ojo: no llamar a esta variable `dot` — es una funcion built-in de GLSL y
  // varios compiladores rechazan la sombra.
  vec2 gridPos = fract(fragPos / (px * 4.0)) - 0.5;
  float gridDot = 1.0 - smoothstep(0.06, 0.14, length(gridPos));
  float field = gridDot * 0.06 * (1.0 - alpha);
  color += accent * field;
  alpha = max(alpha, field * 2.2);

  // 8 · REVELADO. La pieza entra de abajo hacia arriba, como un escaneo.
  float scanReveal = smoothstep(0.0, 0.35, reveal - (1.0 - v_texcoord.y) * 0.55);
  alpha *= scanReveal;
  // Línea de barrido viva solo mientras revela.
  float edge = 1.0 - smoothstep(0.0, 0.02, abs(reveal - (1.0 - v_texcoord.y) * 0.55 - 0.02));
  color += accent * edge * 0.6 * (1.0 - step(0.999, reveal));

  gl_FragColor = vec4(color, alpha);
}
