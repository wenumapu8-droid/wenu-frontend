---
tipo: spec-tecnico
proyecto: KODEX −∞ Visual Engine
fecha: 2026-07-29
foco: el sistema completo en 3 tandas — organismos + tratamientos + distorsión espacial
estado: spec definido (Ocin) · construir después del sitio · primer prototipo: SPLIT_CORRIDOR
---

# KODEX Visual Engine — sistema completo (3 Tandas)

> Respuesta a "¿la página puede verse/animarse como KodeLife con mi arte adentro?": **SÍ.** WebGL
> en el navegador = la misma tecnología que KodeLife (mismo GLSL). El ojo OBSERVE ya lo probó
> corriendo en vivo. Con estas 3 tandas queda un **sistema operativo audiovisual**, no una landing
> con efectos. Ver [[kodex-visual-engine-v1-spec-2026-07-29]] · [[kodex-shader-starter-conexion-2026-07-29]].

## Tanda 1 — 8 ORGANISMOS (la obra + comportamiento)

Motor central compartido (WebGL2/GLSL, multipass, audio-reactive, feedback; estados DORMANT→AWARE→ACTIVE→OPEN):
01 Threshold Portal (respira·recuerda·se abre) · 02 Observation Eye (sigue·escanea·bloquea) ·
03 Descent Tunnel (acelera·distorsiona·absorbe) · 04 Archive Tree (crece·conecta·transmite) ·
05 Specimen Skull (escanea·lee·clasifica) · 06 Ritual Device (carga·resuena·activa) ·
07 Cosmology Core (orbita·conecta·expande) · 08 Signal Bloom (pulsa·expande·corrompe).
**La conexión con tu arte:** tu obra entra como la textura/source del organismo (ya validado con el ojo).

## Tanda 2 — 8 TRATAMIENTOS GPU (capa final, encadenables/mezclables)

01 CRT Scan · 02 Dither Matrix (Bayer 8x8) · 03 Bitmap Threshold · 04 Memory Feedback ·
05 Thermal Map · 06 Chromatic Split · 07 Glitch Fracture · 08 Pixel Sort.
Parámetros globales: intensidad, velocidad, umbral, modo de fusión, color/tinte. Se aplican a
CUALQUIER organismo (multipass). Cada uno con sus params (scanline intensity, dither scale, etc.).

## Tanda 3 — 8 DISTORSIÓN ESPACIAL (dónde viven — perspectiva imposible / no-euclidiana)

La pieza que faltaba: no es el estilo, es la LÓGICA ESPACIAL (dos direcciones de una forma, puntos
de fuga incompatibles, corredores que se bifurcan, superficies que se comportan como membranas).
01 DUAL_VANISH_CHAMBER (dos puntos de fuga; el cursor decide cuál domina) · 02 IMPOSSIBLE_STRUCTURE
· 03 MIRROR_IDENTITY (identity→duplicate→rotate→desync→recompose) · 04 RIPPLE_FLOOR (suelo líquido
por vertex shader; cursor/graves generan ondas) · 05 SPLIT_CORRIDOR (un corredor se bifurca) ·
06 WRINKLED_REALITY (retícula deformada como tela cósmica) · 07 PERSPECTIVE_FLIP (interpola entre
dos proyecciones; AWARE→OPEN) · 08 INFINITY_FOLD (el corredor se pliega y vuelve al origen; RETURN).
(Snippets vertex/fragment GLSL en el mensaje de Ocin 2026-07-29 — mod(), sin/cos warp, smoothstep split.)

## La integración (la receta completa)

`ORGANISMO (Tanda1) → ESPACIO (Tanda3) → TRATAMIENTO (Tanda2)`
```json
{ "scene":"KDX_SPLIT_CORRIDOR", "organism":"observation-eye",
  "spatialBehavior":["dual-vanishing","corridor-split","perspective-flip"],
  "treatment":["crt-scan","chromatic-split","memory-feedback"],
  "interaction":{ "pointer":"vanishing-point","touch":"surface-ripple",
                  "audioLow":"corridor-breath","audioHigh":"grid-fracture" } }
```
Resultado: el ojo ya no está "sobre un fondo" — está suspendido en un corredor imposible, conectado
a dos puntos de fuga, deformando el suelo, siguiéndote, duplicándose, dejando memoria por feedback,
desintegrándose en bitmap al cambiar de escena. **Eso es el OS audiovisual.**

## Stack correcto (corrección honesta)

Para efectos 2D sueltos sugerí OGL (liviano). Pero para ESTA tanda 3D/espacial, Ocin tiene razón:
**Three.js** para cámara/geometría/escenas 3D · **vertex shaders GLSL** (ondas/pliegues/deformación)
· **fragment shaders** (retículas/niebla/energía/color) · **render targets multipass** (memoria/feedback)
· **InstancedMesh** (columnas/nodos/segmentos sin matar performance) · **Astro** shell · **DOM/SVG**
para textos/códigos/barcodes/controles (la UI estable no se mueve, el shader sí). Móvil: DPR cap,
lazy por escena, fallback estático, prefers-reduced-motion, audio opt-in.

## Primer prototipo a programar: KDX_SPLIT_CORRIDOR

Ocin acierta: valida TODO en una sola pieza — perspectiva · geometría · interacción · audio ·
deformación · navegación entre escenas · tratamiento GPU · performance móvil. Es el "hello world"
del motor espacial. Después se replican los otros módulos con la misma base.

## Sequencing (asesor)

Es el north-star y es GRANDE (3D + multipass + shaders espaciales). Orden: 1) termina el sitio KODEX
(en curso). 2) Prototipo SPLIT_CORRIDOR (Three.js) — valida el motor. 3) Se suman organismos/espacios/
tratamientos por receta. 4) El "living codex" del libro encima. Prototipar en KodeLife en paralelo,
sin presión. No construir los 24 módulos de una.
