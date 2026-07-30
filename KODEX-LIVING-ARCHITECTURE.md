# KODEX −∞ — Arquitectura VIVA (conectar lo que ya existe)

> Para Claude Code. Hallazgo de auditoría (2026-07-30, código vivo): **el motor audio-reactivo ya
> está construido pero DESCONECTADO de la página.** El trabajo no es crear de cero — es cablear.
> Referencia visual del destino: `outputs/kodex-threshold-live.html` (prototipo que fusiona el
> shader + el audio de Ocin). Complementa `KODEX-TRANSLATION-MAP.md`, `KODEX-POLISH.md`, `KODEX-ASSEMBLY.md`.

## Lo que YA existe y hay que USAR (no reconstruir)

| Activo | Ruta | Qué hace |
|---|---|---|
| Motor de audio | `src/kodex/audio/kodexAudio.js` | drone generativo + **FFT `energy()`** + 4 estados (E00/T01/M11/R10) + `setCutoff` por puntero. Sin claims de salud. |
| Portal WebGL 3-pasadas | `src/kodex/threshold-portal/` | source→feedback→composite (feedback tipo KodeLife). `u_tex`=obra real, `u_bass`, `u_pointer`, `u_state`, telemetría FPS. |
| Shaders del motor | `src/kodex/shaders/` | spiralField, blackSun, flowLines, mirror, distort, feedback, composite, color. |
| Micrografía / glifos | `src/lib/kodex/micrographics.ts`, `KodexGlyph.astro` | densidad de datos para rails. |

## El problema (por qué todavía se ve "cargada y abstracta")

`src/pages/kodex/index.astro` NO usa el portal WebGL ni el audio. Dibuja el anchor con **capas de
SVG de líneas** (`kx-threshold__symbol-layer--outer/orbit/signal/frame/inner/core`, decenas de
`<circle>/<ellipse>/<path>`). Eso es el enredo vectorial que Ocin rechaza. Y PROLOGUE todavía
renderiza el ojo (`kx-prologue-stage__eye-art`, `ObservationEye`, `SpriteSignal` blink).

## Qué hacer (meticuloso, escena por escena)

1. **THRESHOLD primero.** Reemplazar el bloque `figure.kx-threshold__artifact` (todos los
   `symbol-layer` SVG) por un `<canvas>` que monte `KdxThresholdPortalRuntime`. Alimentar:
   - `u_tex` = **la obra real de Ocin** (mandala/rosetón B&W de Drive `book/0cin`, optimizada a
     `public/img/kodex/`). Es el sampler del shader, no SVG procedural.
   - `u_bass` = `kodexAudio.energy()` por frame.
   - `u_pointer` = puntero; `kodexAudio.setCutoff(y)`.
   - `u_state` = estado de la escena (THRESHOLD = E00).
2. **Tratamiento KodeLife encima** (en el composite): pixelación por bloques + dither Bayer 4x4 +
   scanlines + chroma leve + grano + viñeta. (Ver el frag del prototipo `kodex-threshold-live.html`.)
   El anchor = obra real tratada como **artefacto holográfico**, restringido y legible.
3. **Conservar el HUD techno-flyer que YA está bien** (rails NODE/STATE/SIGNAL/SOURCE, CHECKSUM,
   SYSTEM LOG, barcode, meta-clusters, chips). ESO es la densidad correcta: mucha data, parece
   desorden, todo en grilla. Hacer que los números **vivan**: checksum/coords/hex/energy que
   tickean por frame (rAF), no estáticos.
4. **Gate de entrada** (una vez): "TAP TO ENTER — ENABLE SOUND" → arranca `kodexAudio` (gesto
   obligatorio por política del browser) → `ACCESS: GRANTED`.
5. **Matar el ojo** de PROLOGUE. Anchor de PROLOGUE = campo de observación / retícula viva del
   portal (mismo runtime, `u_state` violeta), NO el ojo procedural.
6. **Replicar a las 7 escenas.** Cada escena = un `u_state` que maneja **audio + visual juntos**:
   E00 THRESHOLD → … → estados de MACHINE (Initializing/Generating/Complete) reales. El estado del
   audio y el del shader son el MISMO valor. Una escena a nivel referencia por vez (DESCENT ya buena).
7. **View mode OPTICAL / ASCII** (kit en `public/kodex-ascii/`) como capa opcional.

## Reglas
- **Buscar antes de crear.** Todo lo de la tabla ya existe — importarlo, no reescribirlo.
- **No romper la joyería.** Deploy serializado `deploy-now.sh` (verifica 174 productos). `git push` NO despliega.
- **Performance:** DPR cap ≤2, lazy por escena, `prefers-reduced-motion` desactiva motion, audio opt-in, `dispose()` al salir.
- **Hidden Sky:** las frecuencias del audio son elección de composición, NO "frecuencias de sanación". Sin claims.
- **Provenance:** no decir "hecho" sin verificar en vivo en `wenumapuonline.com/kodex` con captura.

## UNA gramática, SIETE productos distintos (regla de Ocin, 2026-07-30)

El norte quedó fijo con el prototipo `kodex-threshold-live.html`. **Pero las 7 escenas NO pueden
verse iguales.** Cada escena es un producto final propio, distinto de los otros — mientras TODAS
leen como el mismo sistema KODEX. Coherencia por ADN compartido; distinción por receta única.

**ADN compartido (lo que hace que "todo cobre un sentido brutal"):** fondo obsidiana · tipografía
mono + un display serif · UN acento por escena · rails de datos vivos (checksum/coords/hex/energy
que tickean) · composición en grilla · piel dither base · gate + sistema de estados · separación
Hidden Sky. Esto nunca cambia.

**Receta distinta por escena (de las 3 tandas del visual engine — organismo × tratamiento ×
distorsión × fuente × movimiento). Ninguna se repite:**

| # | Escena | Acento | Organismo | Tratamiento | Distorsión | Fuente (obra) | Movimiento |
|---|---|---|---|---|---|---|---|
| 00 | THRESHOLD | rojo | portal / rosetón | pixelado + dither Bayer | respiración radial | mandala B&W | breathe + bass |
| 01 | PROLOGUE | violeta | retícula / cruz cardinal | CRT scanline + chroma | barrido de scan | Meli Witran Mapu | sweep line |
| 02 | DESCENT | naranja | árbol invertido / corredor | feedback trails (previous-pass) | split-corridor + ripple | árbol | descenso hacia adelante |
| 03 | ARCHIVE | multi | grilla de ident-cards | bitmap / halftone | rígido (catálogo quieto) | ediciones B&W reales | hover "sintoniza" |
| 04 | MACHINE | cyan | red de nodos / kernel | glitch + pixel-sort | infinity-fold | rosetón kernel | estados generativos |
| 05 | COSMOLOGY | magenta | mapa orbital | thermal + chroma | wrinkled reality | cruz + órbitas | nodos derivando |
| 06 | RETURN | acid | mandala restaurado + sello | dither → resuelve limpio | fold que se cierra | mandala completo | re-ensamble / asienta |

Test: si tapo el HUD y pongo dos escenas lado a lado, ¿se distinguen al instante por organismo +
tratamiento + color, pero se reconocen como el mismo sistema? Si sí, está bien. Si las 7 parecen
la misma lámina recoloreada, está MAL — falta distinción.

## Criterio de aprobación (Receta Madre)
¿Se siente KODEX a 2m? ¿El anchor es la obra real tratada, viva, reaccionando al sonido? ¿Los códigos
respiran? ¿Funciona congelado como flyer techno curado? Aprobar por FIDELIDAD, no por "compila".
