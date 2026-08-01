# KODEX −∞ — LA BIBLIA (sistema de organización maestro)

> El documento que ORGANIZA todo para terminar el proyecto. Consolida: reglas UX/interacción, el
> principio "biblia" (cada página = referencia densa curada), la abstracción (todo se vuelve código),
> y una hoja de referencia por escena. Se apoya en las fundaciones (grammar system-v1, typography v2,
> tokens). Norte conceptual: `KODEX-OS-CONCEPT.md`. Contenido: `KODEX-STORYBOARD-CONTENT.md`.

## 1. Reglas UX / interacción (DURAS — Ocin 2026-07-31)
1. **CERO scroll de página.** Cada escena = **un viewport fijo** (100dvh, sin scroll vertical de web).
2. **El scroll es una HERRAMIENTA de interacción**, no navegación: scroll → gira un modelo/mandala 360°,
   activa capas, revela datos, avanza el estado. Como el jog/dial de un aparato. (Excepción: la grilla
   ARCHIVE puede scrollear como el skin-museum, pero es una escena, no toda la web.)
3. **UI impecable**: NADA de botones solapados, layouts rotos, ni faltas técnicas. Responsive real,
   verificado EN VIVO (capturas desktop + mobile) antes de decir "hecho".
4. **Animación con ALMA, no ruido**: nada ultra-abstracto e ininteligible. Cada movimiento SIGNIFICA algo
   (señal, no decoración). Jerarquía 70% lento / 20% medio / 10% rápido. Si no se entiende y no tiene
   soul, fuera.
5. **Señal antes que ruido**: cada elemento cumple función (medir, autenticar, localizar, revelar,
   transmitir, archivar). No hay gráficos "para verse futurista".

## 2. El principio BIBLIA
KODEX es extenso → se organiza como una biblia. **Cada escena = una página de referencia densa tipo
Pinterest**, curada, con TODO el contenido relevante aplicado, organizada por **TEMA · COLOR ·
INFORMACIÓN** sobre las FUNDACIONES compartidas. Aplicar todo el contenido posible por página hasta que
haga "match" y KODEX exista como sistema, no como páginas sueltas.

## 3. La abstracción (transformar TODO en código)
Nada queda como texto plano ni imagen cruda. Cada materia prima se abstrae en forma viva y renderizable:

| Materia prima | Se transforma en |
|---|---|
| concepto / lore / mensaje | copy + comportamiento del sistema |
| fórmula / física | shader · polígono · cinemática |
| símbolo / geometría | SVG glyph · mandala tratado (dither) |
| dato | HUD vivo (checksum, coordenadas, hex, estados) |
| sonido | visualizador audio-reactivo (+ voz/locución) |
| foto / obra (su book) | dither/halftone → textura/skin KODEX |

## 4. Fundaciones compartidas (una sola vez)
- **Grid** modular 12-col (`kodex-grammar/system-v1`) + tokens de color/espaciado.
- **Tipografía v2**: Barlow Condensed (display) · IBM Plex Mono (datos) · Inter Tight (UI).
- **Paleta**: negro dominante + un acento-señal por escena (ver tabla).
- **Piel**: dither Bayer + scanline + glow + chroma (KodeLife), sobre la obra real transformada.
- **Motion presets** (12) + reglas 70/20/10.
- **Motor**: `kodexAudio` (FFT) → shaders. Estados E00→R10 manejan audio + visual juntos.

## 5. Hojas de referencia por escena (TEMA · COLOR · CONTENIDO · SÍMBOLO · INTERACCIÓN(scroll) · AUDIO)

### 00 · THRESHOLD — acceso
- Tema: el umbral / acceso al sistema. Color-señal: **rojo**. Audio: E00.
- Contenido: "TECHNO-TRIBAL ARCHITECTURES / PROTO-CODES FOR A FUTURE CULTURE / We remember what does not yet have form." CTA ENTER THE SYSTEM.
- Símbolo: mandala/rosetón real tratado (artefacto holográfico). Escritura acento: Devanagari.
- **Scroll = herramienta**: gira el anillo/mandala 360°; al fondo del giro, cruza el umbral.

### 01 · PROLOGUE — observación
- Tema: el archivo observa. Color: **violeta**. Audio: T01.
- Contenido: "THE ARCHIVE OBSERVES / Observation changes the pattern." (SIN el ojo — retícula/campo).
- Símbolo: cruz cardinal / retícula viva. Escritura: Árabe.
- **Scroll**: barre la retícula de observación (scan sweep), revela nodos/telemetría.

### 02 · DESCENT — descenso
- Tema: bajar bajo la superficie. Color: **naranja/ámbar**. Audio: T01→M11.
- Contenido: "THE TREE DESCENDS TO HOLD WHAT RISES." (base que ya gusta).
- Símbolo: árbol invertido + corredor/túnel imposible (spatial + ripple). Escritura: Kanji.
- **Scroll**: desciende por el corredor (único lugar donde scroll = avance controlado).

### 03 · ARCHIVE — coleccionar (= skin museum)
- Tema: el archivo de señales/specimens. Color: **multi por card**. Audio: M11.
- Contenido: grilla densa tipo Winamp Skin Museum de **su obra dithered como "skins/presets"**; ficha por specimen. CTA COLLECT A FRAGMENT.
- Símbolo: ident-cards de sus ediciones B&W transformadas.
- **Scroll**: navega la grilla (la excepción); click → carga el specimen en el visualizador vivo.

### 04 · MACHINE — generar
- Tema: el motor que produce. Color: **cyan**. Audio: M11. CTA COMMISSION A SYSTEM.
- Contenido: estados reales (SEED/METHOD/SOURCE/STATUS), red de nodos/kernel.
- Símbolo: rosetón como núcleo generativo (feedback ping-pong).
- **Scroll**: cicla seeds/estados generativos (Initializing→Generating→Complete).

### 05 · COSMOLOGY — conectar
- Tema: el mapa que une el ecosistema. Color: **magenta**. Audio: M11.
- Contenido: mapa orbital; nodos = Wenu / Soma / KODEX / Codex Estelar; astronomía documentada (antü/küyen/wüñellfe) citada. CTA REVEAL CONNECTION.
- Símbolo: cruz cardinal + órbitas (wrinkled reality). Escritura: Griego.
- **Scroll**: orbita/rota el mapa 360°, hace zoom a nodos.

### 06 · RETURN — cerrar el ciclo
- Tema: volver con el patrón restaurado. Color: **acid/verde eléctrico + hueso**. Audio: R10.
- Contenido: sello final, checksum de cierre. CTA CHOOSE NEXT: Collect / Commission / Explore.
- Símbolo: mandala restaurado + sello. Escritura: Hangul.
- **Scroll**: el patrón se re-ensambla; scroll para elegir la próxima puerta.

## 6. Regla Hidden Sky (dura)
Cultura mapuche documentada (citada, fuente Canio & Pozo) SEPARADA del Codex Estelar (ficción). Sin claims de salud. La estética puede rimar; la afirmación no.

## 7. Criterio de "terminado" por escena
Un viewport, cero scroll de página (scroll = herramienta), UI sin solapes, animación con alma y función,
piel dither sobre obra real, datos vivos, verificado en vivo desktop+mobile. Aprobar por FIDELIDAD y SOUL.
