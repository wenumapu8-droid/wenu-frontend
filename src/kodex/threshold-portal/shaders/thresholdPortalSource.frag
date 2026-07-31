#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 o;

uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_seed;
uniform vec2 u_pointer;
uniform float u_bass;
uniform float u_state;
uniform float u_quality;
uniform float u_motion;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = v_uv;
  vec2 centered = uv - 0.5;
  centered.x *= u_res.x / max(1.0, u_res.y);

  float radius = length(centered);
  float angle = atan(centered.y, centered.x);

  float breathe = sin(u_time * mix(0.12, 0.28, u_state)) * mix(0.02, 0.08, u_state);
  float bassPulse = u_bass * mix(0.03, 0.14, u_state);
  float polarWarp = mix(0.06, 0.24, u_state) * sin(angle * 4.0 + u_time * 0.18 + u_seed * 6.2831);
  float pointerPull = dot(centered, u_pointer) * 0.12;

  float warpedRadius = radius * (1.0 - breathe - bassPulse) + polarWarp * (0.4 + u_quality * 0.6);
  float warpedAngle = angle + pointerPull + sin(radius * 11.0 - u_time * 0.22) * 0.06;

  vec2 sampleUv = vec2(cos(warpedAngle), sin(warpedAngle)) * warpedRadius;
  sampleUv.x /= u_res.x / max(1.0, u_res.y);
  sampleUv += 0.5;

  vec4 artwork = texture(u_tex, sampleUv);
  float mask = artwork.a > 0.0 ? artwork.a : dot(artwork.rgb, vec3(0.3333));

  // El anillo define hasta donde llega el portal. Ancho, el disco entero se
  // llena de ambiente y el negro se pierde; el sistema pide negro dominante y
  // el color como señal.
  float ring = smoothstep(0.50, 0.14, radius);
  float halo = exp(-8.0 * abs(radius - 0.22 - bassPulse * 0.5));
  float grain = (hash21(gl_FragCoord.xy + u_seed * 100.0) - 0.5) * 0.025;

  // La obra es BLANCA y el rojo vive alrededor.
  //
  // Antes esto era mix(negro, rojo, mask): donde el mandala era opaco salia
  // rojo pleno, y como el mandala es denso, la lamina entera se volvia una
  // masa roja. Eso es pintura, y la regla del sistema es que el color sea
  // señal -- negro dominante, un acento por escena, mucho aire negro.
  //
  // Con la obra en blanco se lee la geometria, que es el motivo de la lamina,
  // y el rojo queda donde tiene que estar: en el halo y en el borde, como
  // ambiente del portal y no como relleno de la pieza.
  float cuerpo = smoothstep(0.42, 0.92, mask);
  vec3 base = vec3(0.02, 0.012, 0.012);
  base += vec3(0.94, 0.90, 0.88) * cuerpo * 0.86;

  // El acento va en el CONTORNO real de la obra, medido por derivada, no en su
  // franja de alfa medio. Restar el cuerpo a un smoothstep de alfa parece un
  // borde y no lo es: en una obra con alfa suave -- y el centro de este mandala
  // lo tiene -- esa franja es un area enorme, y lo que salia era un disco rojo
  // pleno en el medio de la pieza. fwidth mide donde el alfa CAMBIA, que es
  // donde esta el filo de verdad, y da una linea de un pixel.
  float filo = smoothstep(0.0, 1.0, length(vec2(dFdx(mask), dFdy(mask))) * 14.0);
  base += vec3(0.86, 0.10, 0.10) * filo * 0.55;

  // El halo es un filo, no un relleno. Medido sobre la captura, con el valor
  // anterior el cuadro quedaba en 69% de negro y 22% con color fuerte: la
  // receta pide ~85% de negro. Esto lo baja a un borde de luz.
  base += vec3(1.0, 0.26, 0.14) * pow(halo, 2.2) * (0.16 + 0.20 * u_state);
  base *= ring;
  base += grain;

  // El alfa sigue a la pieza. El 18% del anillo que habia antes tapaba de rojo
  // todo el disco aunque no hubiera obra ahi.
  o = vec4(base, max(cuerpo, halo * 0.5 * ring));
}
