---
tipo: plan de fotocopia · referencias → código real
proyecto: KODEX −∞
fecha: 2026-08-09
autor: claude-mini
método: inspección de las 17 referencias únicas + auditoría del código actual + investigación web
alcance: `~/kodex-work` (repo wenu-frontend). NO toca Sinergia-Industrial ni ~/.hermes/
---

# Fotocopia de las referencias en código real

## 0. Resumen en una página

Las referencias **no son un moodboard. Son una hoja de especificación.** Cada una
trae nombres de estado, nombres de uniform, valores por defecto, modos de mezcla,
paletas en hexadecimal y pseudo-GLSL. Eso cambia el trabajo: no hay que
*interpretar* un estilo, hay que *transcribir* un contrato.

Tres cosas que descubrí y que mandan sobre todo lo demás:

1. **El motor central ya existe y es bueno.** `KodexField`
   (`src/components/kodex/field/kodex-field-client.ts`, 598 líneas) es WebGL2 con
   ping-pong de framebuffers y un contrato de uniforms que coincide casi 1:1 con
   las "ENTRADAS GLOBALES" del pliego maestro. No hay que reescribirlo.
2. **Falta entera la TANDA 02.** Los 8 tratamientos GPU no existen como capa.
   No hay concepto de cadena, ni de blend mode, ni de parámetros. Cero.
   Es el hueco estructural más grande y es el que más rinde cerrar.
3. **Las referencias definen una taxonomía que el código no tiene.** El sitio está
   organizado por el *viaje* de 7 escenas (threshold, prologue, descent, archive,
   machine, cosmology, return). El pliego habla de **8 organismos**. Se parecen,
   no son lo mismo. Decidir si los 8 reemplazan o se mapean a las 7 **es canon y
   no me toca** — es lo primero que necesito del creador.

---

## 1. Inventario verificado de las referencias

`reference/posters/` y `reference/kodex-posters/` son **la misma carpeta duplicada**
(los 17 hashes md5 coinciden uno a uno). 111 archivos, **17 imágenes únicas**,
213 MB en disco de los cuales ~35 MB son contenido real.

| formato | únicos | qué son |
|---|---|---|
| 1536×1024 | 1 | **Pliego maestro** — índice de las dos tandas |
| 1672×941 | 8 | **Visual Development Board**, uno por organismo (TANDA 01) |
| 1122×1402 | 8 | **Póster de tratamiento**, uno por efecto GPU (TANDA 02) |

### 1.1 El pliego maestro es el contrato

`70d17105-54976.png` declara literalmente:

```
MOTOR CENTRAL COMPARTIDO
WebGL2 / GLSL / Multipass / Audio Reactive / Feedback
Estados: DORMANT → AWARE → ACTIVE → OPEN

ENTRADAS GLOBALES
Tiempo · Puntero/Touch · Audio (Low/Mid/High) · Estado/Progreso · Texturas/Máscaras
```

Y **TANDA 02** viene con los parámetros y sus valores por defecto ya fijados:

| # | tratamiento | parámetros (nombre → default) | modo |
|---|---|---|---|
| 01 | CRT SCAN | scanline 0.78 · curvature 0.25 · vignette 0.40 · phosphor glow 0.65 · noise 0.18 | ADD / SCREEN |
| 02 | DITHER MATRIX | dither scale 4.0 · contrast 1.25 · threshold 0.48 · color quant 6 · pattern BAYER 8×8 | NORMAL / LUMA |
| 03 | BITMAP THRESHOLD | threshold 0.52 · edge width 1.5 · posterize 3 · crush 0.25 · invert OFF | NORMAL |
| 04 | MEMORY FEEDBACK | feedback 0.88 · decay 0.94 · distortion 0.15 · rotation speed 0.20 | ADD / MAX |
| 05 | THERMAL MAP | temperature 1.12 · color steps 8 · emissive 1.35 · hue shift 0.02 · contrast 1.00 | ADD |
| 06 | CHROMATIC SPLIT | split 0.006 · angle 0.00 · ghosting 0.40 · convergence 0.00 | SCREEN |
| 07 | GLITCH FRACTURE | glitch 0.62 · block size 64.0 · speed 1.80 · displacement 0.15 · rgb shift 0.50 | ADD / OVERLAY |
| 08 | PIXEL SORT | sort line HORIZONTAL · intensity 0.85 · seed 0.31 · threshold 0.20 | ADD / LIGHTEN |

Esto **es** el JSON de configuración. No hay que inventarlo.

### 1.2 Cada board trae su propia máquina de estados

Y no son iguales entre sí — esto importa, porque el código de hoy asume una sola:

| organismo | estados según su board | color |
|---|---|---|
| 01 Threshold Portal | DORMANT → AWARE → OPEN | rojo `#FF1A0A` |
| 02 Observation Eye | IDLE → TRACK → LOCK | violeta |
| 03 Descent Tunnel | SURFACE → DROP → DEEP → VOID | naranja |
| 04 Archive Tree | SEED → ROOT → BLOOM → TRANSMIT | verde ácido |
| 05 Specimen Skull | SCAN → ISOLATE → REVEAL → GLITCH → ARCHIVE | rojo |
| 06 Ritual Device | CHARGE → ALIGN → RESONATE → EMIT | cian |
| 07 Cosmology Core | MAP → ORBIT → ALIGN → REVEAL | magenta |
| 08 Signal Bloom | IDLE → BUILD → BLOOM → DISPERSE | magenta/rosa |

El pliego maestro dice "DORMANT → AWARE → ACTIVE → OPEN" como estados del motor;
cada board los renombra a su vocabulario. Lectura correcta: **4 fases genéricas en
el motor, etiquetas por organismo en la configuración.** Eso es implementable sin
inventar nada.

### 1.3 Los boards traen pseudo-GLSL utilizable

Threshold Portal declara sus uniforms (`u_signal`, `u_coherence`, `u_gateOpen`,
`u_colorPrimary`) y sus 5 pasadas de render: field distortion → glyph overlay →
energy veins → bloom+chroma → scanlines+CRT. Observation Eye trae la función de
scan completa con sus 5 uniforms y defaults. Signal Bloom trae el bloom con sus
4 thresholds por estado (0.80 / 0.55 / 0.30 / 0.75).

No es código compilable, pero **es la estructura de la función.** Transcribirlo es
mucho más barato y mucho más fiel que mirar la imagen y adivinar.

---

## 2. El gap real, medido contra el código

### 2.1 TANDA 01 — organismos

| # | organismo | estado en código | veredicto |
|---|---|---|---|
| 01 | Threshold Portal | runtime 3-pass propio (`KdxThresholdPortalRuntime`, 328 ln) + máquina DORMANT/AWARE/OPEN + página `/kodex/lab` | **el único completo** — y su máquina ya coincide con su board |
| 02 | Observation Eye | `observe-v2` con 7 shaders (source/threshold/feedback/displace/chroma/crt) + página lab | **casi** — falta la máquina IDLE/TRACK/LOCK |
| 03 | Descent Tunnel | `split-corridor.frag` + escena ASCII | parcial, sin estados |
| 04 | Archive Tree | — | **no existe** |
| 05 | Specimen Skull | — | **no existe** |
| 06 | Ritual Device | — | **no existe** |
| 07 | Cosmology Core | `archive-orbit.frag` + `CosmologyMap.astro` | parcial, sin estados |
| 08 | Signal Bloom | `signal-bloom.frag` cableado a `KodexField` | shader sí, estados no |

**3 organismos no existen. Ninguno salvo Threshold Portal tiene su máquina de estados.**
Grepeé `DORMANT` en todo `src/` y `public/`: aparece en un solo archivo.

### 2.2 TANDA 02 — tratamientos GPU

| # | tratamiento | estado en código |
|---|---|---|
| 01 | CRT Scan | hay `kodex-crt.esm.js` y `crt.frag.glsl` (observe-v2) — **no parametrizado, no encadenable** |
| 02 | Dither Matrix | Bayer aparece dentro de 3 shaders, **incrustado, no extraíble** |
| 03 | Bitmap Threshold | `threshold.frag.glsl` en observe-v2, acoplado a esa escena |
| 04 | Memory Feedback | el ping-pong existe en `KodexField`, **pero como comportamiento fijo, no como tratamiento con parámetros** |
| 05 | Thermal Map | — |
| 06 | Chromatic Split | `chroma.frag.glsl` acoplado a observe-v2 |
| 07 | Glitch Fracture | fragmentos dentro de `artifact.frag.glsl` |
| 08 | Pixel Sort | — |

**Ninguno de los 8 existe como unidad reutilizable.** Están disueltos dentro de
escenas. El pliego dice "aplicables en cadena o mezcla (multipass), a *cualquier*
organismo". Eso hoy es imposible: no hay cadena.

### 2.3 El motor: mejor de lo esperado, con una deuda

`KodexField` ya emite estos uniforms:

```
u_kdxTime u_time u_delta u_resolution u_kdxRes u_devicePixelRatio
u_pointer u_pointerVelocity
u_audio u_audioLow u_audioMid u_audioHigh
u_state u_sceneProgress u_scrollProgress u_transition
u_previousFrame u_feedback u_seed u_reducedMotion u_intensity
u_kdxTint u_kdxGrade u_kdxGain u_kdxFloor u_kdxSpark u_kdxDetail
```

Contra las ENTRADAS GLOBALES del pliego (Tiempo, Puntero/Touch, Audio Low/Mid/High,
Estado/Progreso, Texturas/Máscaras) **falta solo el canal de texturas/máscaras.**
El resto está.

Además tiene un registro de 10 shaders cargados con `?raw` y un fallback explícito
cuando un preset no compila — decisión buena, ya pagada con dolor según los
comentarios del propio archivo.

**La deuda:** hay 6 motores paralelos que hacen lo mismo.
`KodexField`, `KdxThresholdPortalRuntime`, `observe-v2`, `kodex-crt`,
`src/scripts/kodex-engine.js` (1280 ln) y los 5 paquetes sueltos de
`public/kodex-*/`. Y los shaders están duplicados en disco: `ripple-floor`,
`split-corridor`, `wrinkled-reality` y `observe` viven cada uno en 2 o 3 rutas.
Cualquier arreglo hay que hacerlo 3 veces o se desincroniza.

---

## 3. Tres bloqueos que no son técnicos

Estos no los resuelvo yo. Los dejo escritos para que se decidan.

### 3.1 La taxonomía (canon — decisión del creador)

El sitio vive sobre 7 escenas del viaje. El pliego trae 8 organismos. Solapan
parcialmente (threshold ↔ Threshold Portal, cosmology ↔ Cosmology Core,
descent ↔ Descent Tunnel) pero Archive Tree, Specimen Skull, Ritual Device,
Observation Eye y Signal Bloom no tienen escena, y prologue/machine/return no
tienen organismo.

Tres salidas posibles, y **elegir es canon**: (a) los organismos son una capa nueva
independiente del viaje; (b) reemplazan a las escenas; (c) se mapean n:m. La
prohibición vigente de no inventar canon me impide elegir.

### 3.2 La telemetría inventada choca con el protocolo

`ops/factory/VISUAL_PASSPORT_PROTOCOL.md` es explícito:

> Generated concept images often contain invented labels, percentages, frequencies
> […] The implementation must not display invented numeric telemetry as factual
> system state.

Y las referencias están **saturadas** de eso: `DISRUPTION 87.6%`, `FREQ 13.37 kHz`,
`CORE TEMP 87.3 K`, `THREAT LEVEL C-4`, `NEURAL INTERFACE PROB. 82%`,
`GRAVITY SHEAR 0.0021 g`.

Una fotocopia literal viola el protocolo. La salida limpia y que además queda
mejor: **cablear cada readout a un valor real del motor** (u_audioLow, FPS,
sceneProgress, coherencia del feedback, nº de nodos dibujados) y marcar como
`data-symbolic` los que no tengan fuente. Se ve idéntico y deja de mentir.
Recomiendo esto y no un `<span>87.6%</span>` hardcodeado.

### 3.3 Las referencias no están en control de versiones

`reference/` está **untracked, no ignorado**. Un `git add .` distraído mete 213 MB
al historial, con 6× de duplicación. Y al revés: hoy no hay garantía de que la
referencia contra la que se compara sea la misma la semana que viene.

Propuesta: dejar los 17 únicos en `reference/canon/` con nombres legibles
(`t01-03-descent-tunnel.png`, `t02-07-glitch-fracture.png`), borrar los 94
duplicados, y anotar el md5 de cada uno en un `reference/MANIFEST.json`. Eso es
lo que convierte "la referencia" en algo verificable.

---

## 4. Herramientas, skills y open source — la investigación

### 4.1 Lo que hay que traer sí o sí

**LYGIA** — [github.com/patriciogonzalezvivo/lygia](https://github.com/patriciogonzalezvivo/lygia).
Librería granular multi-lenguaje (GLSL/HLSL/Metal/WGSL) de funciones reutilizables,
licencia BSD. Trae dither, sample, color spaces, blend modes, noise. Es exactamente
la capa que falta debajo de los 8 tratamientos: en vez de reescribir Bayer por
cuarta vez, `#include "lygia/color/dither/bayer.glsl"`. Hay un
[paquete web](https://github.com/radames/lygia/tree/web-package-feature) para
resolver los includes en bundler.

**ISF — Interactive Shader Format** — [docs.isf.video](https://docs.isf.video/) ·
[spec](https://github.com/mrRay/ISF_Spec).
Un fragment shader GLSL con un blob JSON al inicio que declara sus inputs: nombre,
tipo, rango, valor por defecto. **Es literalmente el formato de la TANDA 02.** Los
pósters ya escriben `SCANLINE INTENSITY 0.78` — eso es un `INPUT` de ISF con
`DEFAULT: 0.78`. Adoptar ISF da: parámetros tipados y validables, un editor de UI
generado solo, y compatibilidad con KodeLife (que el propio póster declara como
motor: "ENGINE: KODELIFE SHADER v2.0" — y ya hay carpetas `kodelife/` en el repo,
así que el puente ya se intentó). Hay puerto JS: `interactive-shader-format-js`.

**libretro/glsl-shaders** — [github.com/libretro/glsl-shaders](https://github.com/libretro/glsl-shaders).
Décadas de shaders CRT y dithering probados en producción: `crt-lottes.glsl`,
`bayer-matrix-dithering.glsl`. Para CRT SCAN (curvature, phosphor glow, scanline,
vignette — los 5 parámetros del póster) esto ahorra semanas.

**glsl-dither** — [github.com/hughsk/glsl-dither](https://github.com/hughsk/glsl-dither).
Bayer 2×2/4×4/8×8 como módulo. El póster pide explícitamente `BAYER 8×8`.

**Codrops · dithering y ASCII en tiempo real** —
[Efecto (ene 2026)](https://tympanus.net/codrops/2026/01/04/efecto-building-real-time-ascii-and-dithering-effects-with-webgl-shaders/) ·
[Real-Time Dithering Shader](https://tympanus.net/codrops/2025/06/04/building-a-real-time-dithering-shader/) ·
[Maxime Heckel, The Art of Dithering](https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/).
Son los tres artículos de referencia actuales para hacer esto bien en web, con el
detalle que casi todo el mundo se salta: el dither hay que aplicarlo en espacio de
pantalla y a resolución fija, o "nada" al hacer zoom.

### 4.2 Para el bucle de comparación (lo que hoy no existe)

Este es el que convierte "se parece" en "es una fotocopia".

**Playwright + `toHaveScreenshot()`** — comparación integrada con pixelmatch, genera
esperado/actual/diff automáticamente. `.playwright-mcp/` ya está en el `.gitignore`
del repo, así que alguien ya lo usó.

**odiff** — [github.com/dmtrKovalenko/odiff](https://github.com/dmtrKovalenko/odiff).
SIMD, ~8× más rápido que pixelmatch. Con 17 referencias y varios viewports el
volumen es chico; **pixelmatch alcanza**. Guardar odiff para cuando la suite crezca.

El punto honesto sobre esto: un estudio comparativo citado en
[vadim.blog](https://vadim.blog/pixel-perfect-playwright-figma-mcp/) mide la
fidelidad de los agentes en diseño→código entre **65 % y 80 %**, con Claude Code en
65–70 %. La conclusión de ese artículo es la correcta y aplica acá: *"the broad
strokes are right, but the pixels are wrong"*. Un agente mirando una captura no
llega a fotocopia. **Lo que sí llega es un contrato numérico + un diff automático
que falle.** Por eso insisto tanto en la tabla de parámetros de §1.1: ahí los
números ya están dados, no hay que estimarlos del pixel.

### 4.3 Para el andamiaje HUD (los marcos, no el organismo)

Los boards son ~70 % chrome: paneles con esquinas cortadas, barcodes, sellos,
chips, grillas de glifos. Eso es CSS/SVG, no shader, y es la mitad del trabajo.

**augmented-ui** — [augmented-ui.com](https://augmented-ui.com/) ·
[repo](https://github.com/propjockey/augmented-ui). Esquinas cortadas, muescas y
bordes tipo HUD por atributo CSS, sin JS. Resuelve de una los marcos de panel que
se repiten en las 17 referencias.
**Alternativas:** [ARWES](http://arwes.dev/) (framework sci-fi completo — más
opinado, probablemente demasiado), [react-cyber-elements](https://github.com/thiswallz/react-cyber-elements)
(+90 SVG cyberpunk; el repo es React pero los SVG son extraíbles y acá no hay React).

Con eso hay que tener cuidado: KODEX ya tiene tokens propios
(`design-system/tokens/kodex.tokens.css`) y una gramática visual canónica. La
librería entra como **primitiva de forma**, nunca como estética. Si empieza a
verse a augmented-ui en vez de a KODEX, se sacó.

### 4.4 Generativo / editorial

- [awesome-creative-coding](https://github.com/terkelg/awesome-creative-coding) — el índice de referencia del campo.
- [openrndr/workshop-generative-posters](https://github.com/openrndr/workshop-generative-posters) — pósters generativos y data-driven; el modelo mental de "un póster = una función de datos" es justo el que hace falta para no hardcodear los 17.
- [A Generative SVG Starter Kit](https://dev.to/georgedoescode/a-generative-svg-starter-kit-5cm1) — para las grillas de glifos y los diagramas de constelación.

### 4.5 Sobre las skills y el MCP

Lo que falta acá **no es una skill nueva**, es un lazo cerrado. Concretamente:

- Un **MCP de Playwright** configurado en este repo para que el agente capture y
  compare sin intervención. Es lo que falta para que el bucle exista.
- Una skill de repo, `kodex-fotocopia`, que fije el procedimiento: leer la
  referencia → extraer el contrato numérico a JSON → implementar → capturar →
  diff → iterar hasta umbral. Sin eso, cada sesión reinventa el método (que es
  exactamente lo que le pasó a AUDIT-VISUAL con el deep-link por hash: se
  auditaron siete escenas y eran la misma captura siete veces).
- El repo ya tiene el andamiaje de gobernanza correcto en
  `kodex-minus-infinity/ops/factory/` — Visual Passport, template, schema, tests.
  **No hay que construir proceso nuevo. Hay que llenar 16 passports.**

### 4.6 Lo que evalué y descartaría

- **three.js EffectComposer** — [según la guía 2026](https://threejsroadmap.com/blog/the-complete-guide-to-threejs-post-processing-in-2026)
  no comparte datos entre pasadas (cada canal extra = re-render completo de la
  escena) y no tiene ruta de migración a WebGPU. `KodexField` ya hace ping-pong
  crudo y pesa 598 líneas contra los ~600 KB de three. Para 8 tratamientos
  fullscreen sobre una textura, three es peso muerto. **Quedarse con el motor propio.**
  (`three` ya está en `package.json` para `ManifestoSpiral3D` — ese es otro asunto.)
- **Herramientas screenshot→código** (v0, builder.io y similares) — el modo de
  fallo documentado es exactamente el que arruinaría KODEX: radios mal, gradientes
  aplanados a color sólido, flex adivinado. Y acá el diseño no es el problema:
  el contrato ya está escrito en la referencia.

---

## 5. El orden en que yo lo haría

Cada paso deja algo verificable. Nada de esto requiere merge ni deploy.

**P0 — Fijar las referencias.** Deduplicar a 17, renombrar legible, `MANIFEST.json`
con md5. Media hora, y sin esto todo lo demás compara contra arena.

**P1 — Extraer el contrato a JSON.** `design-system/tanda-02.json` con los 8
tratamientos, sus parámetros, defaults y blend modes, transcritos del pliego
maestro. `design-system/tanda-01.json` con los 8 organismos, sus estados y sus
paletas hex. Es transcripción, no diseño: no inventa canon y desbloquea todo.

**P2 — La capa de tratamientos.** Un `KodexTreatmentChain` encima de `KodexField`:
N pasadas fullscreen sobre la textura del organismo, con blend mode por pasada.
Implementar los 8 en formato ISF, apoyándose en LYGIA y libretro. Esto es lo que
convierte 8 escenas sueltas en el sistema que dibuja el pliego.

**P3 — El lazo de comparación.** Playwright con un test por referencia, capturando
el mismo encuadre del board y diffeando. Umbral generoso al principio (el organismo
está vivo, nunca va a dar 0 diferencias) y estricto en el chrome, que sí es estático.

**P4 — Las máquinas de estado.** 4 fases genéricas en el motor + etiquetas por
organismo desde `tanda-01.json`. Con eso, los 5 organismos que hoy no tienen
estados los tienen sin código nuevo por organismo.

**P5 — Los 3 organismos que faltan.** Archive Tree, Specimen Skull, Ritual Device.
Este es el trabajo de shader de verdad y va último a propósito: cuando llegue,
el motor, los tratamientos, el diff y los estados ya existen.

**Transversal — unificar los 6 motores.** No como fase: cada vez que se toque uno
de los duplicados, colapsarlo. Empezando por los 4 shaders que están en 2-3 rutas.

---

## 6. Lo que necesito del creador para seguir

1. **La taxonomía** (§3.1) — ¿los 8 organismos conviven con las 7 escenas del
   viaje, las reemplazan, o se mapean? Es canon.
2. **La telemetría** (§3.2) — confirmar que vamos por "cablear a valores reales +
   marcar lo simbólico" y no por copiar los números de la imagen.
3. **Si las 17 son todas.** El pliego maestro habla de TANDA 01 y TANDA 02; los
   `SEED HASH` dicen `TANDA-01` y las fechas `2025-05-21/22`. Si hay tandas
   posteriores o versiones más nuevas de estos boards, hay que traerlas antes de
   fijar el manifiesto — no quiero que P0 congele una versión vieja.

Nota de contexto: la memoria de sesión del 2026-08-08 decía que las imágenes de
referencia "nunca llegaron". Ya llegaron — son estas. Pero **no cubren FIELD OF
EYES, DNA PASSAGE ni SOURCE SPHERE**, que son los tres passports en rama. Esos
siguen sin referencia visual.
