---
tipo: plan
proyecto: KODEX
fecha: 2026-07-26
estado: análisis previo a implementar — esperando aprobación de Ocin
---

# KODEX −∞ · Secuencia RETURN — Análisis + Plan

> Respuesta al spec de Ocin (2026-07-26): construir la **secuencia final audiovisual
> generativa** que se dispara al completar un ciclo KODEX. El propio spec pide NO
> implementar aún, primero este análisis. El video (IG reel) = referencia de LENGUAJE
> audiovisual, NO se copia ni se embebe. Enlaza [[project_kodex_microsite]].

## 1. Dónde está RETURN hoy
- **Folio `vi` "Return"** (kodexBook.js → folios, stage `RETURN`), renderizado por
  `src/pages/kodex/folio/[folio].astro` (motor: `src/scripts/kodex-engine.js`).
- Hoy RETURN es una **página estática** (sigilo + terminal + texto), NO una secuencia.
- Señal de "blanco/luz": la clase `kx--white` se activa por IntersectionObserver
  (kodex-engine.js ~227) y el audio RETURN (preset `lumen`) mete `shimmer` cuando está blanco.

## 2. Componentes reutilizables (NO crear un segundo sistema)
- **Motor WebGL2 real**: `src/kodex/engine/kodexWorld.js` (1 contexto, framebuffers,
  feedback ping-pong, multipass) — ES el motor para la secuencia. Ya hace source→efectos→
  feedback→composite con bloom/scanlines/vignette/grain.
- **Audio sintético**: `kodexAudio.js` (world) + `kodex-audio.js` (book, presets por etapa
  incl. RETURN lumen) — base del soundscape.
- **Efectos/curaduría**: paintFx (6 efectos) + la data curada de cada obra (kodexBook.js).
- **Sigilos/terminal/glitch**: helpers ya existentes (sigilSvg, typeTerm, scramble).

## 3. Data de sesión REAL disponible hoy
- `sessionStorage`: `kx-audio` (sonido on/off), `kx-signal` (señal on/off).
- Seed por obra (determinista). Efecto aplicado en el último click (variable en runtime).
- **NO hay** memoria de recorrido persistente.

## 4. Data faltante (hay que construirla)
Para personalizar el cierre necesito un **MemoryStore ligero** que registre durante la visita:
- obras vistas (ids), efectos aplicados por obra (visualChain), toggles de SEÑAL,
  tiempo/energía de audio, sentido de giro (chirality), nº de ciclo.
- De ahí derivo: `cycle`, `memory` (contador), `signal` (0–1), `chirality` (±1),
  `visualChain`, `audioChain`, y el **espécimen** `KDX-[FAMILY]-[CYCLE]-[STATE]-[CHIRALITY]-[SEED]`.
- Si no hay recorrido → **fallback "CURATED RETURN"** (sin datos falsos).

## 5. Shaders reutilizables (src/kodex/shaders/)
- `flowLines.frag` (hilos/partículas convergentes), `spiralField.frag` (campo/órbitas),
  `mirror.frag` (simetría radial/toroidal), `distort.frag` (lente/ripple = contracción/
  expansión), `blackSun.frag` (colapso/sello), `feedback.frag` (rastros/memoria),
  `composite.frag` (bloom/pulsos de luz/grain), `color.frag` (paleta como señal).
- Faltan (nuevos, específicos): `toroidalScanner`, `radialCoordinates`, `spectralReveal`,
  `returnCollapse`, `specimenComposite` — pequeños, sobre el mismo motor.

## 6. Audio existente
- Web Audio synthesis (sin samples). Preset RETURN `lumen` (drone 49/98/196 + shimmer).
- Reutilizable + capas nuevas mapeadas a los 7 movimientos (subgrave 45–55Hz, ruido filtrado,
  pulsos de transición, parciales en manifestación, delay en retorno, silencio antes del sello).
- Regla: arranca solo si el visitante entró con sonido; nunca "curativo".

## 7. Timeline (cómo la implemento)
- `ReturnTimeline` = reloj basado en `performance.now()` con 7 movimientos (0–40s), cada uno
  con envelopes que manejan uniforms del motor (radio/densidad/rotación/feedback/bloom) +
  entradas de texto + eventos de audio. Reproducible por seed. No CSS-animations como motor.

## 8. Archivos a MODIFICAR (mínimo, sin romper nada)
- `src/pages/kodex/folio/[folio].astro` (o el nodo RETURN): montar la secuencia al llegar al
  final del folio RETURN (o al completar un ciclo). Punto de entrada, no reescritura.
- `kodex-engine.js`: registrar en el MemoryStore los eventos (obra vista, efecto, señal) —
  hooks pequeños, aditivos.

## 9. Archivos NUEVOS (módulos)
`src/kodex/return/`: `ReturnSequence.js`, `ReturnTimeline.js`, `ReturnParticleField.js`,
`ReturnGeometry.js`, `ReturnTypography.js`, `ReturnSoundscape.js`, `ReturnSpecimenSeal.js`,
`MemoryStore.js` + shaders nuevos. Todo sobre el motor existente.

## 10. Fallback
- **FULL** (WebGL + audio + pulsos), **REDUCED MOTION** (menos rotación, sin profundidad
  agresiva, mensaje íntegro), **STATIC** (secuencia editorial de imágenes + texto + ficha,
  sin WebGL). SKIP siempre lleva a la ficha del espécimen (registra memoria igual).

## 11. Riesgos móvil
- Partículas instanciadas + feedback + bloom = costoso. Mitigación: 1 canvas, pixel-ratio
  cap, menos partículas, feedback a menor resolución, bloom reducido, dispose() al salir.
  Objetivo 30–45 FPS móvil. Los flashes: máx 3/seg, sincronizados, respeta reduced-motion.

## 12. Storyboard (7 movimientos, ~40s)
- **01 RESIDUAL MEMORY** (0–4s): interfaz se disuelve, quedan partículas de la última obra,
  subgrave, "RETURN PROTOCOL / MEMORY FOUND". Sin logo.
- **02 CONVERGENCE** (4–9s): partículas viajan al centro, líneas radiales, el espécimen se
  arma en fragmentos según su seed. "WHAT ENTERED AS NOISE".
- **03 SIGNAL RECOGNITION** (9–14s): espécimen dentro de un toro wireframe, meridianos que
  escanean, onda al centro, 1er pulso blanco controlado → "RETURNED AS SIGNAL".
- **04 TRANSMUTATION** (14–21s): mirror/simetría, contrarrotación, fragmentos-memoria de
  obras previas, feedback real, 2º pulso → "WHAT ENTERED AS SIGNAL / RETURNED AS FORM".
- **05 MANIFESTATION** (21–27s): la forma se expande, aparece color por 1ª vez, audio abre,
  partículas salen del centro, muestra el código real del espécimen.
- **06 RETURN** (27–34s): desacelera y contrae, parte se vuelve datos/líneas, el campo
  registra una capa. "YOU DID NOT REACH THE END / YOU BECAME THE RETURN / …LIVES AS MEMORY".
- **07 SEAL** (34–40s): todo colapsa en el símbolo KODEX (el logo aparece SOLO acá).
  "KODEX HAS RECORDED THE DIFFERENCE / CYCLE 01 COMPLETE" + ficha (FORM CHANGED / CORE
  PRESERVED / MEMORY +1) + acciones [HOLD SPECIMEN][BEGIN ANOTHER CYCLE][RETURN TO CIRCUIT]
  [MANIFEST THROUGH WENU MAPU]. Sin NEXT.

## 13. Plan incremental
1. `MemoryStore` + hooks (registrar recorrido) — sin visual aún.
2. Generador de espécimen (código + parámetros) + fallback CURATED.
3. `ReturnTimeline` + tipografía (los 7 movimientos con texto, sobre negro) — sin partículas.
4. Geometría central (toro/anillos/partículas) mapeada a la sesión.
5. Shaders nuevos (scanner/collapse/reveal) + pulsos de luz seguros.
6. Soundscape por movimientos.
7. Fallbacks (reduced/static) + SKIP + performance móvil + criterios de aceptación.

**Regla final:** NO reproducir el video. Construir una secuencia KODEX original que produzca
la misma sensación de revelación → procesamiento → retorno. La última imagen = la forma del
visitante colapsando hasta volverse el logo.

<!-- wenu-backlinks -->
Relacionado: [[Home]] · [[project_kodex_microsite]]
