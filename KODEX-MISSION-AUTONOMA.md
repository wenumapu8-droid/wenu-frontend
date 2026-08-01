# KODEX −∞ — MISIÓN AUTÓNOMA (2–3 horas non-stop para el Mac mini)

> Para el Claude Code del Mac mini (Max). Objetivo: **terminar KODEX** trabajando solo 2–3 horas, sobre
> `~/kodex-work`, con changelog por escena y verificación EN VIVO. Cowork (iMac, Pro) queda de director
> y revisor cuando reanude. Este documento es la biblia operativa: leelo entero antes de tocar código.

## 0 · Orden de lectura (canónico)
1. `KODEX-OS-CONCEPT.md` — el norte (KODEX = visualizador/instrumento tipo Winamp/MilkDrop).
2. `KODEX-STORYBOARD-CONTENT.md` — contenido real, 6 estratos + copy verdadera.
3. `KODEX-LIVING-ARCHITECTURE.md` — receta técnica (audio+shaders ya existen; conectarlos).
4. `KODEX-TRANSLATION-MAP.md` — concepto→píxel por escena.
5. `KODEX-README-START-HERE.md` — índice.
6. `kodex-grammar/` — grids, typography v2, 8 lab shaders, gramática, giphy-curator.

## 1 · Reglas UX/UI NO NEGOCIABLES (lo que pidió Ocin)
- **CERO scroll de página.** Cada escena = **un viewport** (100dvh/100svw), sin scroll vertical accidental.
- **El scroll es una HERRAMIENTA, no navegación**: se usa para ACTIVAR cosas dentro de la escena — ej.
  girar un modelo/mandala 360°, avanzar por un túnel, revelar capas, subir intensidad. Nunca para "bajar la página".
- **Ejecución técnica sólida**: nada de botones que se solapan, nada de layouts rotos, nada de texto cortado.
  Grillas modulares, z-index claro, safe-areas mobile, targets ≥44px. Probar 1440/1920 y 390/430 móvil.
- **Animaciones CON ALMA, no abstractas porque sí**: cada movimiento comunica una función (scan, pulse,
  reveal, transmit, orbit, descend). Si una animación no se entiende ni cumple rol, se saca. Jerarquía
  70% lento / 20% medio / 10% rápido (glitch episódico, nunca permanente).
- **Nada de "casino interdimensional"**: denso pero curado. Parece mucha data, todo está pensado y alineado.

## 2 · El sistema organizador (fundaciones → aplicar en cada página)
Cada escena se compone con las MISMAS fundaciones, variando por tema/color/organismo (así todo hace MATCH
pero cada página es distinta — "una gramática, siete productos"):
- **Tema/estrato** (contenido real del storyboard) · **color dominante** (un acento por escena) ·
  **organismo** (la forma viva) · **tratamiento** (piel) · **datos** (chrome) · **interacción de scroll**.
- Cada página se llena como una **página de referencias tipo Pinterest**: densa, con TODO el contenido
  posible del tema (copy, datos, notas, bibliografía, glifos, coordenadas) — pero jerarquizado, no amontonado.

## 3 · Pipeline de transformación de imagen (la piel KODEX)
- **Fuente**: la obra de Ocin (book/0cin — mandalas/fractales/geometrías) + fotos que sirvan. **Nada crudo.**
- **Transformar** cada imagen con **dither/halftone (Floyd-Steinberg, tonal)** + pixelado + scanline + glow
  + duotono (rojo/ámbar/verde según escena) → queda KODEX-native. Ese shader YA existe (`src/kodex/shaders`
  + lab). Aplicarlo como textura del hero/visualizador de cada escena.
- Giphy-curator = solo descubrimiento/prototipo, NO producción (licencias). Reproducir el detalle nosotros.

## 4 · El motor visualizador (cablear, ya existe)
- `src/kodex/audio/kodexAudio.js` (FFT + energy + estados E00/T01/M11/R10) maneja los shaders detrás de
  cada escena. Audio opt-in (gate "enter/enable sound"), reduced-motion respetado, DPR≤2, pausa fuera de viewport.
- El **estado** de cada escena cambia audio + visual JUNTOS. Cada escena = un "preset" del mismo motor.

## 5 · Build por escena (6 estratos / 7 escenas) — hacer UNA a nivel referencia por vez
Para cada escena entregar: viewport único · anchor = obra real transformada (dither) · organismo/tratamiento/
color únicos · copy real (storyboard) · chrome dossier (typography v2: Barlow Condensed + IBM Plex Mono +
Inter Tight) · datos vivos (checksum/coords/hex/energy ticking) · **una interacción de scroll con sentido**
(girar/revelar/descender/intensificar) · negro dominante, color como señal.
Orden sugerido: **THRESHOLD → ARCHIVE (grilla tipo Winamp Skin Museum de obras transformadas) → DESCENT →
MACHINE → COSMOLOGY → RETURN → PROLOGUE (rework, MATAR el ojo)**.
- **ARCHIVE** = museo de skins: grilla densa edge-to-edge de la obra de Ocin dithered como "presets",
  search minimal, click → carga el artefacto en el visualizador. (Ref UX: skins.webamp.org.)

## 6 · "Transformar en código" (lo que pidió: info/fórmulas → visual)
Convertir el contenido en elementos vivos: fórmulas/geometría → **polígonos/shaders**; transiciones →
**cinemáticas** (state transition); patrones → **hologramas** (dither+glow); textos → chrome + micrografía;
opcional **voz** (Web Speech / audio) para intros de escena si aporta (no obligatorio). Cada dato = señal viva.

## 7 · Puertas de calidad (antes de dar cada escena por "hecha")
- Test Receta Madre: ¿se siente KODEX a 2m? ¿anchor vivo con obra real tratada? ¿datos respiran? ¿funciona
  congelado como flyer? ¿UX sin roturas, sin scroll de página, scroll-como-herramienta funcionando?
- **Verificar EN VIVO** (abrir el render, capturas desktop+mobile). No decir "hecho" sin ver. Un anchor feo NO entra.
- Changelog por escena en `CHANGELOG-KODEX.md` + capturas.

## 8 · Anti-colisión + deploy
- Trabajás solo en `~/kodex-work`. **En git** (inicializá si falta) con commits por escena. No tocar Soma (`~/soma-web`).
- Deploy serializado cuando una escena esté aprobada; no romper la joyería si compartís pipeline. `git push` NO despliega.
- Si Astro dev se cuelga: matar esbuild/vite huérfanos y arrancar limpio (bug conocido de subprocesos).

## 9 · Task list (para 2–3 horas seguidas)
1. Leer todos los docs (sección 0). Confirmar inventario de shaders/audio/gramática.
2. Montar el pipeline de transformación dither sobre 3–5 obras reales de Ocin (texturas base por escena).
3. THRESHOLD: viewport único, anchor mandala transformado + audio-reactivo, chrome dossier, scroll = girar/entrar. Verificar en vivo.
4. ARCHIVE: grilla museo de skins (obras dithered), search, click→visualizador. Verificar.
5. DESCENT / MACHINE / COSMOLOGY / RETURN: cada una preset distinto, copy real, interacción de scroll con sentido. Verificar cada una.
6. PROLOGUE: rework SIN el ojo (campo de observación / retícula). Verificar.
7. Nav de dispositivo (prev/next/index/estado) + ∞ drill-down (overlays de capas).
8. Pase de pulido: contraste (negro dominante), tipografía v2, movimiento 70/20/10, mobile.
9. Build limpio + deploy + capturas. Reportar URL y estado en CHANGELOG.

## Una línea
**Conectar todo lo que ya existe en un instrumento ritual vivo: obra real transformada = visualización,
cada escena = un preset, scroll = herramienta, datos = piel, sin roturas y con alma. Terminar KODEX.**
