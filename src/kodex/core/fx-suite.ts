/**
 * KODEX-∞ · KDX FX SUITE v1.0
 *
 * Los ocho tratamientos GPU de la TANDA 02, **transcritos del plano maestro**
 * (`reference/posters/70d17105-54976.png`) con sus parámetros exactos y su
 * modo de mezcla. Cuando el plano dice `DECAY 0.94`, acá dice 0.94.
 *
 * La ley del plano: *"ocho tratamientos visuales aplicables a CUALQUIER
 * organismo"*, en cadena. Por eso cada pase tiene la misma firma — recibe la
 * imagen anterior y devuelve una imagen — y ninguno sabe qué organismo lo
 * alimenta. Un tratamiento que necesita saber qué está tratando no es un
 * tratamiento, es parte del organismo.
 *
 * El modo de mezcla decide cómo vuelve el resultado sobre la entrada, y no es
 * un detalle: CRT SCAN suma luz (ADD/SCREEN), DITHER MATRIX reemplaza
 * (NORMAL/LUMA). Aplicar el segundo como si fuera el primero da una imagen
 * lavada, que es exactamente el error que uno comete si ignora la columna
 * "MODO" del plano.
 */

/** Modos de mezcla del plano. */
export type Modo = "NORMAL" | "ADD" | "SCREEN" | "MAX" | "OVERLAY" | "LIGHTEN" | "LUMA";

export type Tratamiento = {
  n: string;
  id: string;
  nombre: string;
  /** Parámetros con los valores exactos del plano. */
  params: Record<string, number>;
  /** Cómo vuelve el resultado sobre la entrada. */
  modo: Modo;
  /** Segundo modo declarado en el plano, cuando trae dos. */
  modoAlt?: Modo;
  /** El cuerpo del pase. Recibe `vec3 src` y devuelve `vec3`. */
  glsl: string;
};

/**
 * Preámbulo común a todos los pases.
 *
 * Se inyecta una vez, no ocho veces: las utilidades son las mismas y
 * duplicarlas es la forma más barata de que ocho copias se desincronicen.
 */
export const FX_PRELUDIO = /* glsl */ `
float kdxHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float kdxLuma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

/** Bayer 8x8 por entrelazado de bits. Es la matriz que pide el plano. */
float kdxBayer8(vec2 p) {
  ivec2 i = ivec2(mod(p, 8.0));
  int x = i.x, y = i.y, v = 0;
  for (int k = 0; k < 3; k++) {
    v = (v << 2) | ((((y >> (2 - k)) & 1) << 1) | (((x >> (2 - k)) & 1) ^ ((y >> (2 - k)) & 1)));
  }
  return float(v) / 64.0;
}

vec3 kdxHueShift(vec3 c, float a) {
  const vec3 k = vec3(0.57735);
  float ca = cos(a * 6.2831853);
  return c * ca + cross(k, c) * sin(a * 6.2831853) + k * dot(k, c) * (1.0 - ca);
}
`;

/* ────────────────────────────────────────────────────────────────────────── */

export const FX: Tratamiento[] = [
  {
    n: "01", id: "crt-scan", nombre: "CRT SCAN",
    params: { SCANLINE: 0.78, CURVATURE: 0.25, VIGNETTE: 0.40, PHOSPHOR: 0.65, NOISE: 0.18 },
    modo: "ADD", modoAlt: "SCREEN",
    glsl: /* glsl */ `
      // La curvatura del tubo deforma la LECTURA, no la imagen: se remuestrea
      // la fuente en uv curvado. Curvar el resultado dejaría el borde recto y
      // el efecto se leería como un marco pegado encima.
      vec2 c = uv * 2.0 - 1.0;
      c *= 1.0 + dot(c, c) * P_CURVATURE * 0.35;
      vec2 uvc = c * 0.5 + 0.5;
      vec3 col = texture(u_src, clamp(uvc, 0.0, 1.0)).rgb;
      // Fuera del tubo no hay señal.
      col *= step(0.0, uvc.x) * step(uvc.x, 1.0) * step(0.0, uvc.y) * step(uvc.y, 1.0);

      // Fósforo: las líneas del tubo, y el brillo que dejan al apagarse.
      // SCANLINE es la fuerza de la línea; PHOSPHOR, el brillo que deja al
      // apagarse. Son dos cosas y el spec las separa.
      float linea = mix(1.0, 0.5 + 0.5 * sin(uvc.y * u_res.y * 1.5708), P_SCANLINE);
      col *= mix(1.0, 0.72 + 0.28 * linea, P_PHOSPHOR);
      col += col * linea * P_PHOSPHOR * 0.22;

      float vin = 1.0 - dot(c * 0.72, c * 0.72) * P_VIGNETTE;
      col *= clamp(vin, 0.0, 1.0);
      col += (kdxHash(gl_FragCoord.xy + floor(u_time * 24.0)) - 0.5) * P_NOISE * 0.12;
      return col;
    `,
  },

  {
    n: "02", id: "dither-matrix", nombre: "DITHER MATRIX",
    params: { SCALE: 4.0, CONTRAST: 1.25, THRESHOLD: 0.48, COLOR_QUANT: 6, PATTERN: 8 },
    modo: "NORMAL", modoAlt: "LUMA",
    glsl: /* glsl */ `
      vec3 col = texture(u_src, uv).rgb;
      col = (col - 0.5) * P_CONTRAST + 0.5;
      // El umbral Bayer se SUMA antes de cuantizar: así el error de
      // cuantización se reparte en el patrón en vez de acumularse en bandas.
      // SCALE agranda la celda del patrón: el dither se ve, que es el punto.
      float b = kdxBayer8(gl_FragCoord.xy / max(P_SCALE, 1.0)) - 0.5;
      float pasos = max(2.0, P_COLOR_QUANT);
      col = floor((col + b / pasos + (P_THRESHOLD - 0.5) * 0.2) * pasos) / (pasos - 1.0);
      return clamp(col, 0.0, 1.0);
    `,
  },

  {
    n: "03", id: "bitmap-threshold", nombre: "BITMAP THRESHOLD",
    params: { THRESHOLD: 0.52, EDGE: 1.5, POSTERIZE: 3, CRUSH: 0.25, INVERT: 0 },
    modo: "NORMAL",
    glsl: /* glsl */ `
      vec2 px = P_EDGE / u_res;
      vec3 col = texture(u_src, uv).rgb;
      // Borde por diferencia central: el contorno sale de la propia imagen,
      // no de un filtro que no la conoce.
      float l  = kdxLuma(col);
      float lx = kdxLuma(texture(u_src, uv + vec2(px.x, 0.0)).rgb) - kdxLuma(texture(u_src, uv - vec2(px.x, 0.0)).rgb);
      float ly = kdxLuma(texture(u_src, uv + vec2(0.0, px.y)).rgb) - kdxLuma(texture(u_src, uv - vec2(0.0, px.y)).rgb);
      float borde = clamp(length(vec2(lx, ly)) * 3.0, 0.0, 1.0);

      // El umbral del spec decide qué es figura y qué es fondo antes de
      // posterizar: posterizar primero borraría la decisión.
      col = mix(col, step(vec3(P_THRESHOLD), col), 0.55);
      float pasos = max(2.0, P_POSTERIZE);
      col = floor(col * pasos) / (pasos - 1.0);
      // CRUSH aplasta las sombras contra el negro: el negro dominante del
      // sistema se gana aplastando, no bajando el brillo de todo.
      col = max(col - P_CRUSH, 0.0) / max(1.0 - P_CRUSH, 0.001);
      col += vec3(borde);
      return mix(col, 1.0 - col, step(0.5, P_INVERT));
    `,
  },

  {
    n: "04", id: "memory-feedback", nombre: "MEMORY FEEDBACK",
    params: { FEEDBACK: 0.88, DECAY: 0.94, DISTORTION: 0.15, ROTATION: 0.20 },
    modo: "ADD", modoAlt: "MAX",
    glsl: /* glsl */ `
      vec3 col = texture(u_src, uv).rgb;

      // El cuadro anterior se lee ROTADO y desplazado: de ahí sale la estela.
      // Sin la rotación, el feedback sólo desvanece; con ella, recuerda en
      // espiral, que es lo que el nombre del tratamiento promete.
      vec2 c = uv - 0.5;
      float a = u_time * P_ROTATION * 0.1;
      mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
      c = R * c * (1.0 - P_DISTORTION * 0.04);
      vec3 prev = texture(u_prev, clamp(c + 0.5, 0.0, 1.0)).rgb;

      // FEEDBACK es cuánto del recuerdo entra; DECAY, cuánto se apaga cada
      // cuadro. Con uno solo no se puede tener estela larga y tenue.
      return max(col, prev * P_DECAY * P_FEEDBACK);
    `,
  },

  {
    n: "05", id: "thermal-map", nombre: "THERMAL MAP",
    params: { TEMP: 1.12, COLOR_STEPS: 8, EMISSIVE: 1.35, HUE_SHIFT: 0.02 },
    modo: "ADD",
    glsl: /* glsl */ `
      vec3 src = texture(u_src, uv).rgb;
      float l = clamp((kdxLuma(src) - 0.5) * P_TEMP + 0.5, 0.0, 1.0);
      // Escalonado: un mapa térmico tiene BANDAS. Un degradado continuo se lee
      // como un tinte, no como una medición.
      l = floor(l * P_COLOR_STEPS) / max(P_COLOR_STEPS - 1.0, 1.0);

      vec3 col = mix(vec3(0.02, 0.0, 0.16), vec3(0.72, 0.0, 0.62), smoothstep(0.0, 0.45, l));
      col = mix(col, vec3(1.0, 0.62, 0.06), smoothstep(0.45, 0.8, l));
      col = mix(col, vec3(1.0, 1.0, 0.9), smoothstep(0.82, 1.0, l));
      col = kdxHueShift(col, P_HUE_SHIFT);
      return col * P_EMISSIVE * step(0.02, l);
    `,
  },

  {
    n: "06", id: "chromatic-split", nombre: "CHROMATIC SPLIT",
    params: { SPLIT: 0.006, GHOSTING: 0.40, ABERRATION: 0.31, INTENSITY: 0.85 },
    modo: "SCREEN",
    glsl: /* glsl */ `
      // CONVERGENCE 0.0 significa desalineado: converger es volver a juntar.
      // El desplazamiento crece hacia el borde porque una óptica converge en
      // el centro y falla en la periferia.
      // SPLIT es la separación base; ABERRATION la hace crecer hacia el borde,
      // que es como falla una óptica real: converge en el centro.
      float radio = length(uv - 0.5) * 2.0;
      vec2 off = vec2(P_SPLIT * (1.0 + radio * P_ABERRATION * 3.0), 0.0);
      vec3 col = vec3(
        texture(u_src, uv + off).r,
        texture(u_src, uv).g,
        texture(u_src, uv - off).b
      );
      // GHOSTING: una copia rezagada, que es lo que hace fantasma al fantasma.
      vec3 ghost = texture(u_src, uv + off * 2.5).rgb;
      col = mix(col, max(col, ghost), P_GHOSTING);
      return col * P_INTENSITY;
    `,
  },

  {
    n: "07", id: "glitch-fracture", nombre: "GLITCH FRACTURE",
    params: { AMOUNT: 0.62, BLOCK: 64.0, SPEED: 1.80, DISPLACEMENT: 0.15, RGB_SHIFT: 0.50 },
    modo: "ADD", modoAlt: "OVERLAY",
    glsl: /* glsl */ `
      // Bloques que se corren. Sólo ALGUNOS: si se corrieran todos sería una
      // distorsión uniforme, y una distorsión uniforme se lee como efecto, no
      // como fractura.
      float fila = floor(uv.y * u_res.y / P_BLOCK);
      float s = kdxHash(vec2(fila, floor(u_time * P_SPEED * 6.0)));
      // AMOUNT decide CUÁNTAS filas se rompen, no cuánto se rompen: subir la
      // cantidad y no la fuerza es lo que separa una fractura de un temblor.
      float activa = step(1.0 - P_AMOUNT * 0.35, s);
      vec2 off = vec2((s - 0.5) * P_DISPLACEMENT * activa, 0.0);
      vec3 col = texture(u_src, clamp(uv + off, 0.0, 1.0)).rgb;
      float rgb = P_RGB_SHIFT * 0.01 * activa;
      col.r = texture(u_src, clamp(uv + off + vec2(rgb, 0.0), 0.0, 1.0)).r;
      col.b = texture(u_src, clamp(uv + off - vec2(rgb, 0.0), 0.0, 1.0)).b;
      return col;
    `,
  },

  {
    n: "08", id: "pixel-sort", nombre: "PIXEL SORT",
    params: { HORIZONTAL: 1.0, INTENSITY: 0.85, SEED: 0.31, THRESHOLD: 0.20 },
    modo: "ADD", modoAlt: "LIGHTEN",
    glsl: /* glsl */ `
      // Ordenar de verdad una fila no se puede en un fragment shader: cada
      // píxel no ve a sus vecinos. Lo que sí se puede — y es lo que produce la
      // lectura de "pixel sort" — es ARRASTRAR el valor más brillante de un
      // tramo. Se muestrea hacia atrás y se queda el máximo.
      vec3 col = texture(u_src, uv).rgb;
      if (kdxLuma(col) < P_THRESHOLD) return col;

      float largo = P_INTENSITY * 0.09;
      // HORIZONTAL 1.0 = se arrastra por filas. El eje es del spec.
      float eje = mix(uv.x, uv.y, 1.0 - P_HORIZONTAL);
      float sem = kdxHash(vec2(floor(mix(uv.y, uv.x, 1.0 - P_HORIZONTAL) * u_res.y), P_SEED * 100.0));
      vec3 mx = col;
      for (int i = 1; i <= 10; i++) {
        float f = float(i) / 10.0;
        vec2 paso = mix(vec2(largo * f * sem, 0.0), vec2(0.0, largo * f * sem), 1.0 - P_HORIZONTAL);
        vec3 s = texture(u_src, clamp(uv - paso, 0.0, 1.0)).rgb;
        if (kdxLuma(s) > kdxLuma(mx)) mx = s;
      }
      return mix(col, mx, P_INTENSITY);
    `,
  },
];

/** Busca un tratamiento por su id. */
export const fxPorId = (id: string) => FX.find((f) => f.id === id) ?? null;

/**
 * Arma el fragment shader de un pase.
 *
 * Los parámetros se inyectan como constantes `#define`, no como uniforms: son
 * los valores del plano y no cambian en runtime. Compilar con constantes deja
 * que el compilador plegue las expresiones, y de paso hace imposible que un
 * parámetro quede sin setear y el pase se vea "raro" sin razón visible.
 */
export function armarPase(fx: Tratamiento, override: Record<string, number> = {}): string {
  const defs = Object.entries({ ...fx.params, ...override })
    .map(([k, v]) => `#define P_${k} ${Number.isInteger(v) ? v.toFixed(1) : String(v)}`)
    .join("\n");

  return `#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 out_color;

uniform sampler2D u_src;
uniform sampler2D u_prev;
uniform vec2  u_res;
uniform float u_time;
uniform float u_low;
uniform float u_mid;
uniform float u_high;
uniform float u_estado;
uniform float u_progreso;
uniform float u_mix;

${defs}

${FX_PRELUDIO}

vec3 kdxPase(vec2 uv) {
${fx.glsl}
}

void main() {
  vec2 uv = v_uv;
  vec3 src = texture(u_src, uv).rgb;
  vec3 res = kdxPase(uv);
  // u_mix deja atenuar el pase entero sin sacarlo de la cadena: un
  // tratamiento a media fuerza es una decision de direccion, no un bug.
  // (Sin comillas invertidas aca dentro: estan adentro de un template
  //  literal y lo cerrarian.)
  out_color = vec4(mix(src, res, clamp(u_mix, 0.0, 1.0)), 1.0);
}`;
}
