# Auditoría + rescate del Mac mini — KODEX (2026-07-31)

> Hecho por Cowork desde el iMac por SSH (`mini` = 100.91.188.82, user galvazincia).
> Snapshot rescatado a `/Users/user1/wenu-frontend/_macmini-kodex-rescue/` (no destructivo).

## Qué hay en el Mac mini
Proyecto **`~/kodex-work`** (copia de wenu-frontend enfocada en KODEX). **Astro completo.**
⚠️ **NO es repo git** (sin `.git`) → riesgo alto: todo su trabajo vive sin versionar.
⚠️ **Sigue trabajando AHORA**: procesos `claude` y `codex` (OpenAI Codex CLI) activos, `astro preview`
en :4321, shaders tocados hasta hoy (Jul 31 00:42). No interrumpir.

## Lo valioso que construyó (rescatado)
- **Shaders base** (`src/kodex/shaders`): blackSun, spiralField, flowLines, mirror, distort, feedback,
  composite, color, observe, artifact.
- **Shaders LAB** (`src/kodex/shaders/lab`) — ya integró el open-visual-lab: **archive-orbit,
  liquid-acid, mandelbrot-field, signal-bloom, threshold-portal** + **impossible-structure,
  network-vortex, split-corridor** (spatial engine). Esto es oro y ya está codeado.
- **Módulos** (`src/kodex`): ascii, audio, engine, observe-v2, return, threshold-portal.
- **Componentes** (`src/components/kodex`): CommissionForm, CosmologyMap, KodexGlyph,
  KodexMicroCluster, artifact, ascii, density, field, motion, observe, scenes.
- **Sistema OS de 7 escenas** (changelog 2026-07-29): `/kodex` = THRESHOLD; folios 01-06
  (PROLOGUE/DESCENT/ARCHIVE/MACHINE/COSMOLOGY/RETURN) fullscreen; `kodex.css` con `.kx-os-scene`
  (grilla, halo/portal, scanlines, metadata rail, dossier, drawers, barcode, mobile, reduced-motion).
- **Docs**: CHANGELOG-KODEX.md, KODEX-HANDOFF.md, RETOMAR-AQUI.md, KODEX-BUILD/ASSEMBLY.md.

## Bloqueo conocido (del changelog)
Astro local se cuelga antes de levantar Vite (por eso usa `astro preview` + previews temporales).
Coincide con el bug de subprocesos huérfanos ya documentado.

## Estado del rescate
- ✅ 3 zips de sistemas → LaCie `Wenu mapu/KODEX/systems-zips` + repo `kodex-grammar/_zips`.
- ✅ Snapshot `src/` (281 archivos, 48 en `src/kodex`, 13 shaders) + docs → `_macmini-kodex-rescue/`.
- ✅ Assets `public/assets/kodex` + `public/img/kodex` → `_macmini-kodex-rescue/public/`.

## Recomendación (para avanzar)
1. **El Mac mini tiene la versión MÁS avanzada** (shaders lab integrados, ascii, OS 7 escenas). No la iMac.
2. **Riesgo #1: no está en git.** Cuando termine, ponerlo en git y hacerlo la ÚNICA fuente de verdad.
   Hoy hay dos copias divergentes (iMac `wenu-frontend` vs mini `kodex-work`) — hay que consolidar UNA.
3. **Qué sirve YA**: los 8 lab shaders + el sistema `.kx-os-scene` + ascii + audio. Reusar, no rehacer.
4. **Aplicar encima nuestra corrección de dirección**: negro dominante / rojo como señal, typography
   v2 (Barlow Condensed + IBM Plex Mono + Inter Tight), y el PRD como documento rector.
5. No tocar el mini mientras trabaja; consolidar cuando pause.
