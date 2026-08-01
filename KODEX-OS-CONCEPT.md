# KODEX −∞ — El concepto que conecta TODO (el eslabón)

> Norte maestro. Lo que Ocin intuía como "un dispositivo / sistema operativo / como los visualizadores
> de Winamp y Windows XP que se mueven con la música" tiene nombre y ES la clave para coser el proyecto.

## La idea que lo unifica: KODEX es un VISUALIZADOR-INSTRUMENTO, no una web

Los "efectos infinitos que se mueven con la música" de Windows XP / Winamp se llaman **music
visualizers**. Los dos canónicos — **MilkDrop** (Winamp) y las **visualizaciones de Windows Media
Player** — los hizo la misma persona (Ryan Geiss). Funcionaban así:

- **FFT (Fast Fourier Transform)** + detección de beats descomponen el audio en frecuencias y amplitud.
- Esos datos **manejan shaders/generadores de patrón** sobre una grilla → visuales generativos infinitos
  que "vuelan por dentro del sonido".
- Cada look es un **"preset"**: unas líneas de shader + variables. Miles de presets = infinitas skins.

**Eso es EXACTAMENTE KODEX.** El proyecto no es un sitio con efectos: es un **visualizador ritual**
—un instrumento/dispositivo— donde el contenido vive DENTRO de la visualización. Ese es el sentido
"alucinante" que buscás.

## El mapeo (por qué ya tenemos todo)

| MilkDrop / WMP | KODEX (lo que YA tenemos) |
|---|---|
| FFT del audio | `kodexAudio.js` — analizador FFT + `energy()` (ya escrito) |
| Shaders manejados por el audio | `src/kodex/shaders/*` + `threshold-portal` (feedback) + los 8 lab shaders |
| **Presets** (cada look) | **Cada escena/estrato = un preset** → "una gramática, siete productos distintos" |
| Skins de Winamp (el marco del player) | El **HUD dossier/flyer** (rails, checksum, barcode) = el chrome del dispositivo |
| Navegar presets/tracks, nunca para | **Navegación de 7 escenas** como controles de un aparato, visual siempre vivo |
| Presets infinitos | El **∞**: "this archive expands, each entry a new layer" (los 6 estratos + más) |

## Cómo se siente y se navega (la meta)
- Entrás y **algo ya está vivo y respirando con un drone** (como abrir Winamp con MilkDrop).
- Cada escena es un **preset** distinto del mismo motor: mismo ADN, piel única (organismo × tratamiento
  × color). Se lee como el mismo sistema, pero ninguna se repite.
- El **chrome** (headline monumental + rails de datos vivos + barcode + checksum) enmarca el visual
  como la skin enmarca al player. Datos que tickean = "el aparato está encendido".
- Se **navega como un dispositivo**: prev/next/index, estados (E00→R10), el audio y el visual cambian
  JUNTOS. No hay scroll de web; hay control de instrumento.

## La receta visual (ya corregida y aprobada)
- **Piel KodeLife**: pixelado + dither Bayer + scanlines + glow + chroma leve, sobre la **obra real**
  de Ocin (mandalas B&W de Drive). NO líneas vectoriales suaves. NO el ojo (rechazado).
- **Contraste**: negro dominante (~85%), color como **señal** (no pintura), mucho aire negro.
- **Tipografía v2**: Barlow Condensed (display) + IBM Plex Mono (datos) + Inter Tight (UI). Nada de serif protagonista.
- **Composición**: grilla modular, marco, paneles — flyer techno denso pero curado ("parece desorden, todo pensado").
- **Movimiento jerárquico**: 70% lento (respiración/scan) · 20% medio (datos/pulso) · 10% rápido (glitch episódico).

## Las herramientas que ya tenemos (el inventario del eslabón)
- **Motor audio**: `src/kodex/audio/kodexAudio.js` (FFT + estados E00/T01/M11/R10).
- **Shaders**: base (`src/kodex/shaders`) + **8 lab shaders** (archive-orbit, liquid-acid, mandelbrot-field,
  signal-bloom, threshold-portal, impossible-structure, network-vortex, split-corridor).
- **Gramática visual**: `kodex-grammar/system-v1` (10 grids, 12 motion presets, 20 bloques, recetas).
- **Tipografía**: `kodex-grammar/kodex-typography-system-v2`.
- **Contenido real**: `KODEX-STORYBOARD-CONTENT.md` (6 estratos + copy), `KODEX-TRANSLATION-MAP.md`.
- **Estructura**: el sistema OS de 7 escenas del Mac mini (`kodex-work`, nav + chrome).

## El trabajo que falta (conectar, no crear)
1. Montar el **visualizador** (audio → shaders) como CAPA VIVA detrás de cada escena, con la obra real.
2. Tratar cada escena como un **preset** (organismo×tratamiento×color únicos) — la tabla de distinción.
3. Poner el **chrome dossier** encima (typography v2, datos vivos), negro dominante.
4. Cablear el **estado** para que audio + visual cambien juntos por escena.
5. Navegación de dispositivo + el ∞ (drill-down por capas).
6. Verificar en vivo (screenshots), escena por escena.

## Fuente de imagen + transformación (autorizado por Ocin 2026-07-31)
- **Fuente primaria = la obra de Ocin** (su "book" / portafolio 0cin, Drive `book/0cin` — mandalas,
  fractales, geometrías hi-res). Autorizado usar TODO su book en KODEX.
- **También autorizado**: fotos/contenido que sirvan, con criterio de Cowork.
- **REGLA DURA: nada entra crudo.** Toda imagen (su arte o una foto) pasa por la **transformación
  dither/halftone** (Floyd-Steinberg, tonal) → se vuelve KODEX-native. Ese look = el plugin "dithertone"
  de Doron Studio (referencia) = **nuestro shader de dither que YA tenemos**. Aplicarlo a la fuente
  convierte cualquier imagen en textura/detalle KODEX (pixelado/holograma B&N + duotono rojo/ámbar).
- **Ventaja legal**: usando su propio book + fotos transformadas fuerte, la identidad es PROPIA y sin
  depender de licencias externas.

## Giphy: solo descubrimiento, NO producción
El kit `kodex-grammar/giphy-curator` (300 candidatos vía API oficial) sirve para **descubrir/prototipar**
el look de los detalles efímeros — NO para producción. Su propia letra chica lo dice: los símbolos,
loaders, barcodes y fenómenos hero deben ser **activos propios** (SVG/shader/sprite). Además Giphy exige
"Powered by GIPHY" + atribución + revisión de derechos para uso comercial. **Para producción: reproducir
el detalle nosotros** (transformando el book de Ocin), no incrustar GIFs ajenos. Requiere API key de Ocin para correr.

## El momento cultural (posicionamiento)
Winamp se **abrió (open source) en sept 2024** y explotó una **revival**: Webamp (Winamp en el navegador),
+80.000 skins, museos navegables, nostalgia Y2K. **KODEX cae justo en esa ola** — el lenguaje de
"reproductor/skin/visualizador vivo" está caliente ahora. Sirve para DESCUBRIMIENTO/marketing: KODEX es
esa estética pero llevada a arte ritual serio.

## UX de referencia: Winamp Skin Museum (skins.webamp.org)
UX = **grilla densa edge-to-edge de miles de skins**, cada celda un artefacto vivo, search minimal
arriba, click → carga la skin en un player funcional. **Ese es el modelo de la escena ARCHIVE de KODEX**:
grilla densa de "specimens/presets" (= la obra de Ocin **dithered/transformada** como skins KODEX),
buscable, click para cargar el artefacto en el visualizador vivo. Chrome mínimo sobre contenido máximo.
El museo entero = "el archivo" = el ∞. Inspirarse en la **estética del período** (Y2K, cromo, readouts
LCD, barras de EQ/espectro, píxel fonts, botones biselados) para los detalles del chrome KODEX.

## Referencias
- **Winamp revival / Webamp / Skin Museum** (skins.webamp.org) — UX del archivo + validación cultural.
- **"dithertone"** (Doron Studio) — el look de transformación dither/halftone = nuestra piel (ya como shader).
- MilkDrop (Geisswerks) · WMP visualizations (Ryan Geiss) — el paradigma del visualizador.
- Boards de flyer/dossier de Ocin (rojo/negro, halftone, LUNAR) — el chrome.
- KodeLife — herramienta para prototipar los shaders (mismo tech que MilkDrop, en vivo).

## Una línea
**KODEX = Winamp/MilkDrop reimaginado como un archivo ritual vivo: un instrumento donde tu obra se
vuelve visualizador, cada escena es un preset, y los datos son la piel del dispositivo.**
