---
tipo: tutorial-tecnico
proyecto: KODEX Visual Engine
fecha: 2026-07-29
foco: LA CONEXIÓN — cómo tu obra entra al shader (KodeLife starter)
---

# La conexión 🧩 — de tu obra al código vivo

## El concepto (lo que faltaba)

Los ejemplos de KodeLife (Keijiro, Virgill, Mandelbrot) **generan desde matemática pura**. Vos NO
partís de cero: **tu obra entra como TEXTURA (`uSource`) y el shader la hace comportarse.**

```
TU IMAGEN (ojo/árbol/portal, o tu obra B&W)  →  [ SHADER: behavior + treatment ]  →  ORGANISMO VIVO
        (uSource)                                (breathe/observe/dither/color/feedback)
```

Eso es la gramática: la MISMA lógica, cambiando la imagen de entrada + la receta = otro organismo.

## Cómo conectarlo en KodeLife (pasos)

1. En KodeLife, panel **Shader Stage / Parameters** → `+` → agregá un **Texture** (Image).
   Nombralo **`tex0`**. Cargá tu PNG (ej. el ojo del pack SVG rasterizado, o una obra B&W).
   (Para "remember/feedback" agregás también el **Previous Pass** — el que ya viste en tu captura.)
2. Pegá el shader de abajo en el editor (fragment).
3. Movés el mouse / pasa el tiempo → tu imagen respira, colorea y ditherea. **Ahí está la conexión.**

## Shader starter (GLSL — pegar en KodeLife)

```glsl
#version 150
uniform float time;
uniform vec2  resolution;
uniform vec2  mouse;
uniform sampler2D tex0;   // <- TU IMAGEN acá (nombrá la textura "tex0")
out vec4 fragColor;

float bayer(vec2 p){
  int x = int(mod(p.x,4.0)); int y = int(mod(p.y,4.0));
  float m[16] = float[16](0.,8.,2.,10., 12.,4.,14.,6., 3.,11.,1.,9., 15.,7.,13.,5.);
  return m[x + y*4]/16.0;
}

void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  // BEHAVIOR · breathe (+ leve observe hacia el mouse)
  vec2 c = uv - 0.5;
  c *= 1.0 - 0.05*sin(time*1.2);
  c += (mouse/resolution - 0.5) * 0.06;
  uv = c + 0.5;

  // SOURCE · tu obra
  float m = texture(tex0, uv).r;

  // TREATMENT · color (paleta KODEX: bg -> ink -> accent)
  vec3 bg     = vec3(0.039);            // #0A0A0A
  vec3 ink    = vec3(0.929);            // #EDEDED
  vec3 accent = vec3(0.718, 1.0, 0.0);  // acid #B7FF00 (cambialo a violet/cyan por receta)
  vec3 col = mix(bg, ink, smoothstep(0.2, 0.8, m));
  col = mix(col, accent, smoothstep(0.85, 1.0, m));

  // TREATMENT · dither
  if (m + (bayer(gl_FragCoord.xy) - 0.5)*0.12 < 0.5) col *= 0.45;

  fragColor = vec4(col, 1.0);
}
```

## Cómo se vuelve la gramática

- Cambiás `tex0` (otra obra) → otro organismo, mismo shader.
- Cambiás `accent` a violet `#B770FF` o cyan `#00F0FF` → otro tratamiento (por receta).
- Agregás behaviors (grow/orbit/observe) y treatments (crt/glitch) como funciones = tu librería
  ([[kodex-visual-engine-v1-spec-2026-07-29]]).
Después esto se porta a la web con OGL/WebGL usando la misma idea (source texture + uniforms).

## Referencias (artistas de shaders para estudiar TÉCNICA, no copiar)

De los ejemplos de KodeLife: **Keijiro Takahashi** (creative coding, mucho open-source),
**Jochen "Virgill" Feldkötter** (demoscene), **Paul Karlik**, **Fabio Cortés**. Se estudia la
técnica; la conexión con TU identidad es siempre: tu textura de entrada + tu paleta + tus tratamientos.
