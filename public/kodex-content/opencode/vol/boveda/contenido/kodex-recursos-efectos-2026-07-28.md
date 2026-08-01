---
tipo: recursos-implementacion
proyecto: KODEX −∞
fecha: 2026-07-28
foco: stack open-source de efectos + fuentes + referencias (todo uso libre)
estado: para Claude Code — todo verificado OFL/MIT, liviano, mobile-aware
---

# KODEX −∞ — Stack de efectos y recursos (open-source, liviano)

> Todo verificado de **uso libre** (OFL/MIT). Prioridad: CSS/SVG/Canvas sobre WebGL pesado.
> Regla móvil: los efectos costosos se calculan UNA vez (o en build), no por frame.

## Fuentes (self-host, patrón @fontsource / Fontsource)
- **Space Grotesk** (OFL) — KODEX SANS, UI/cuerpo. · **Archivo Expanded** (OFL) — headers dossier.
- **Departure Mono** (OFL 1.1, departuremono.com) — KODEX MONO retro-terminal (IDs/seeds/coords).
- **JetBrains Mono** (OFL, ya en el sitio) — data/código en volumen.

## Efectos → librería/técnica recomendada

| Efecto | Solución (peso) | Licencia | Móvil |
|---|---|---|---|
| Dither / halftone | **CanvasDither** o **ditherjs** (pocos KB, Canvas) | MIT | ✅ ditherear 1 vez / en build, mostrar bitmap. NO por frame |
| Grain / noise | **SVG `feTurbulence`** nativo (0 KB JS) | nativo | ✅ estático (no animar seed en móvil). Generar en fffuel.co/nnnoise |
| Scanlines / CRT | **CSS puro** `repeating-linear-gradient` + blend + RGB-split | — | ✅ perfecto |
| Glitch / text-scramble | **soulwire TextScramble** (~1 KB vanilla) | MIT-spirit | ✅ copiar directo |
| Wireframe tunnel / vortex | **OGL** (~8 KB WebGL) para el hero; o **Canvas 2D** perspectiva procedural | MIT | ✅ OGL con DPR≤1.5 + pausar fuera de viewport; Canvas 2D vuela |
| Reveal / animación | **GSAP core + plugins (GRATIS desde 2025)** o **Splitting.js** (~4 KB) | libre / MIT | ✅ honrar prefers-reduced-motion |
| Smooth (si hiciera falta) | **Lenis** (~3 KB) | MIT | ⚠️ probar en touch, a veces desactivar |

**Descartar:** Three.js (peso muerto para 1 efecto → usar OGL). Stack mínimo combinado <70 KB.

## Referencias (inspiración + fuente de código real)
1. **Codrops / Tympanus** — tutoriales + demos MIT descargables (feTurbulence, shaders, scramble). La mina.
2. **thewhole.website** — nivel Awwwards con solo vanilla+CSS. Nuestro norte técnico (ya en memoria).
3. **Awwwards → Brutalism / Generative Art Studio** — curaduría dark/mono premium (inspiración, no copia).
4. **CodePen** — colecciones CRT/scanline/dither/text-scramble (soulwire mEMPrK, etc.). Código listo.
5. **fffuel.co · uwarp.design/nnnoise** — generadores de noise/grain SVG, exportar y pegar.
6. **oframe.github.io/ogl** — ejemplos oficiales de túneles/partículas con código MIT para el hero-vortex.
7. **Fontsource** — self-host de todas las OFL de arriba, encaja con `@fontsource`.

## Cómo aplicarlo a las escenas KODEX
- **THRESHOLD/DESCENT:** OGL o Canvas 2D wireframe vortex/túnel (el hero). Grain SVG estático encima.
- **ARCHIVE / obras:** dither/halftone pre-procesado sobre las imágenes de obra. Scanlines CSS sutiles.
- **MACHINE:** text-scramble en los readouts (SEED/METHOD/STATUS), estados reales, waveform Canvas.
- **Transiciones:** GSAP/Splitting reveal por letra en títulos; duraciones 120–900ms; audio opt-in.
Todo lazy-load por escena, cleanup de rAF al cambiar de escena, prefers-reduced-motion respetado.
