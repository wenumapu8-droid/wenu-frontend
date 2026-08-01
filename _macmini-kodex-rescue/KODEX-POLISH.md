# KODEX — Brief de pulido "a nivel referencia" (lámina por lámina)

> Para Claude Code, DESPUÉS del build actual. Es un pase ADITIVO de dirección de arte, NO un redo.
> Lo que ya existe (ej. la escena DESCENT "THE TREE DESCENDS TO HOLD WHAT RISES") le GUSTA a Ocin —
> es la base. El objetivo: pasar de "bueno pero respira demasiado" a "instrumento-dossier DENSO como
> los boards de referencia". Serializado, sin romper la joyería, changelog + capturas por lámina.

## Correcciones del director de arte (Ocin, 2026-07-29)

- ❌ **El OJO procedural (OBSERVE tal como se renderizó) NO va** — "horrible", no era lo esperado.
  Rework total del anchor de PROLOGUE o reemplazarlo; NO usar ese ojo así.
- ✅ **Las GEOMETRÍAS IMPOSIBLES sí** (le interesan) — son el lenguaje de anchor deseado
  (`public/kodex-spatial/` — corredor/túnel/perspectiva imposible). Usarlas como visual vivo.
- ✅ **El sitio KODEX actual (folio/DESCENT) es la base** que le gusta — pulir sobre eso.

## Los 4 movimientos de "compresión a referencia"

1. **DENSIDAD (micrographics kit — ya staged en `public/kodex-micrographics/`).** Tiene
   `KodexMicroCluster.astro`, `KodexGlyph.astro`, el sprite `kodex-micrographics.svg`, css y lib.
   Integrar (mover a `src/components/kodex/` + `public/assets/kodex/`) y **empaquetar bordes, esquinas
   y rails** con barcodes, coordenadas, IDs, glifos y data strips. Llenar el espacio vacío de SISTEMA.
2. **TEXTURA.** Overlay global sutil: dither + scanline + grain (CSS/canvas). Ahora se ve "demasiado
   limpio"; las refs tienen cuerpo de dispositivo. Muy controlado, no tapar la lectura.
3. **VISUAL ANCHOR VIVO.** Cada lámina con un organismo/shader detrás del texto (WebGL), en el lenguaje
   de las geometrías imposibles. No puntitos flotando.
4. **COMPOSICIÓN.** Headline monumental tapando PARTE del visual · rails a los dos lados · metadata
   incrustada en el layout (no separada) · una escena = un viewport, cero scroll vertical.

## Por lámina (anchor + qué densificar)

- **00 THRESHOLD** (rojo) — anchor: anillo de acceso / portal. Densidad: barra de acceso, ID de sesión,
  checksum, coordenadas mínimas. CTA `ENTER THE KODEX`.
- **01 PROLOGUE** (violet) — ⚠️ **rework del anchor** (el ojo NO). Opción: campo de observación /
  retícula viva en clave geometría imposible, o dossier de "observación" sin el ojo procedural feo.
  Densidad alta (node ID, protocol, status). CTA `BEGIN OBSERVATION`.
- **02 DESCENT** (naranja) — anchor: **corredor/túnel imposible VIVO** (usar kodex-spatial). Ya tiene
  buen headline; sumarle el shell denso (rails STEPWISE/STRATA/SKIP/INDEX ya está — empaquetar más).
- **03 ARCHIVE** (multi) — anchor: grid de ident-cards. Densidad: metadata por card, barcode, index modular.
- **04 MACHINE** (cyan) — anchor: red de nodos / kernel. Densidad: SEED/METHOD/SOURCE/STATUS reales.
- **05 COSMOLOGY** (magenta) — anchor: mapa orbital. Densidad: coordenadas RA/DEC, nombres de nodos.
- **06 RETURN** (acid) — anchor: árbol / patrón restaurado. Densidad: sello final, checksum de cierre.

## ⚠️ CORRECCIÓN DE OCIN (2026-07-30) — el look del ANCHOR

El anchor actual (animación de círculos/líneas vectoriales suaves generadas) está MAL: se ve
"cargado y abstracto". Ocin quiere el look **KodeLife: pixelado / dithered / holograma** — la
GEOMETRÍA (su obra: mandala/rosetón/árbol/patrón mapuche) renderizada como **artefacto tratado**,
NO un enredo de líneas suaves. Referencia: sus boards THRESHOLD (mandala enmarcado "ARTIFACT" sobre
campo rojo sutil) y COSMOLOGY CORE (rosetón central glow).

**Cómo debe verse el anchor de cada escena:**
- **La obra de Ocin** (geometría real / mandala / árbol) como foco — enmarcada tipo "ARTIFACT / ARCHIVED".
- Tratada con **pixelación + dither (Bayer) + scanlines + glow + leve chroma + flicker sutil** (shader).
- **Restringido y legible**, con FOCO — no denso de líneas moविéndose. La densidad va en los DATOS
  (rails, metadata), no en el visual central.
- Campo de fondo **sutil** (radar/dots tenue del color de la escena), no un tangle animado.
- Prototipo de referencia del tratamiento correcto: el mandala pixelado-holograma que Claude/Cowork
  demostró (rosetón radial rojo, dither por bloques, scanlines, glow, enmarcado ARTIFACT).
Reemplazar el anchor abstracto por este tratamiento en THRESHOLD primero, luego el resto.

## Regla de aprobación

Test de la Receta Madre: ¿se siente KODEX a 2m? ¿denso y con textura, no "web limpia"? ¿el anchor está
vivo? ¿la lámina funciona congelada como póster? Aprobar por FIDELIDAD al lenguaje, no por "funciona".
Referencias: `~/Obsidian/WenuAgent/estrategia/kodex-receta-madre-produccion-2026-07-29.md` (secciones 7, 12, 17).
