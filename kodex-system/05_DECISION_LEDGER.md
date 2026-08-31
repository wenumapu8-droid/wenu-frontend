# KODEX DECISION LEDGER

**Fuente única de verdad de decisiones autorales.** Consolidado 2026-08-30.

Extraído por barrido exhaustivo de: `DECISION-LOG-*.md` (2), `ATLAS-07A/B`,
`decisiones-encontradas-kimi.md`, `~/.claude/projects/-Users-user1/memory/project_kodex_*.md` (23),
`docs/kodex/*.md` (20), `AUTHORITIES.yaml`, `~/kodex-relevo/*.md` (128), commits de `kodex/pass-a-organismos-corredor`.

**Regla dura**: ninguna decisión anterior se borra. Si una nueva la reemplaza,
la anterior queda marcada SUPERSEDED con referencia. **Cero paráfrasis** —
las citas van textuales.

**47 decisiones activas · 8 categorías · 7 conflictos abiertos**

---

## Índice

- [1. Autoridad y jerarquía](#1-autoridad-y-jerarquía) — 9 decisiones
- [2. Visual · palette · chasis](#2-visual--palette--chasis) — 8
- [3. Vocabulario y estados](#3-vocabulario-y-estados) — 7
- [4. Arquitectura del corredor](#4-arquitectura-del-corredor) — 5
- [5. Assembly OS · pipeline](#5-assembly-os--pipeline) — 6
- [6. Rights gate y publicación](#6-rights-gate-y-publicación) — 4
- [7. Assets y láminas](#7-assets-y-láminas) — 5
- [8. Reglas de trabajo · agentes](#8-reglas-de-trabajo--agentes) — 3
- [Conflictos abiertos](#conflictos-abiertos) — 7 no resueltos
- [Decisiones implícitas en código](#decisiones-implícitas-en-código) — sin decision-log formal

---

## 1. Autoridad y jerarquía

### DEC-001 · Hi-Fi Targets son VISUAL_REFERENCE, no autoridad total
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA
- **Fuente**: `~/kodex-relevo/DECISION-LOG-2026-08-29-AUTORIDAD-HIFI.md`
- **Textual**: *"Los Hi-Fi Targets del 29-08 superseden los boards del 27 SOLAMENTE en VISUAL PRESENTATION: composición, color, jerarquía, dimensionalidad, materialidad, profundidad, densidad y lenguaje de interfaz. NO superseden copy / CTA / data / IDs / canon narrativo."*
- **Cableado en**: `src/content/scenes/AUTHORITIES.yaml` (clase `HIFI_TARGETS_2026_08_29`)

### DEC-002 · Corredor principal = 7 escenas (00–06)
- **Fecha**: 2026-08-29
- **Estado**: CONGELADA
- **Fuente**: `DECISION-LOG-2026-08-29-AUTORIDAD-HIFI.md:17-19`
- **Textual**: *"El corredor principal permanece en 7 escenas: 00–06. `00 THRESHOLD → 01 PROLOGUE → 02 DESCENT → 03 ARCHIVE → 04 MACHINE → 05 COSMOLOGY → 06 RETURN`. El `/10` de las láminas fue exploración generada y no se convierte en arquitectura."*

### DEC-003 · HEART/OBSERVER/SILENCE = SPECIAL CHAMBERS
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA
- **Fuente**: `DECISION-LOG-2026-08-29-AUTORIDAD-HIFI.md:21-24`
- **Textual**: *"HEART / OBSERVER / SILENCE = SPECIAL CHAMBERS / SUB-UNIVERSES. Fuera del numerador principal. IDs: `KDX-CH-HEART`, `KDX-CH-OBSERVER`, `KDX-CH-SILENCE`."*
- **Nota**: existen ALTAR + TEMPLE con rutas propias `/kodex/chamber/altar/` y `/temple/` — no aparecen en este canon; su estado requiere decisión.

### DEC-004 · Ocín Master Art Registry = gate de aprobación autoral
- **Fecha**: 2026-08-29
- **Estado**: GATE CERRADO
- **Fuente**: `src/content/scenes/AUTHORITIES.yaml:64-77`
- **Textual**: *"Publicly approved = 0 de 25. NINGUNA obra puede publicarse hasta que el registry la marque aprobada. Especificar sí, publicar no."*

### DEC-005 · Constitución KODEX: continuidad NO es imitación
- **Fecha**: Fundacional, congelado 2026-08-29
- **Estado**: PREVALENCIA (supersede si conflicto)
- **Fuente**: `~/kodex-relevo/00-CONSTITUCION.md:1-86`
- **Textual**: *"KODEX puede sobrevivir a Ocín sin fingir que Ocín sigue creando. Un sistema que continúa generando y firma con el nombre del creador no lo continúa: lo borra."*

### DEC-006 · Canon 08G — prohibición de perfilado psicológico silencioso
- **Fecha**: 2026-08-29
- **Estado**: RESTRICCIÓN DURA
- **Fuente**: `~/.claude/projects/-Users-user1/memory/project_kodex_canon_67_perception_2026_08_29.md`
- **Textual**: *"KODEX no hace perfilado psicológico silencioso. Recuerda acciones y recorridos reales; nunca infiere que alguien 'prefiere cosmología' o 'está espiritualmente preparado'. El MEMORY TRACE es una traza de qué hizo el visitante, no un modelo de quién es."*

### DEC-007 · Láminas son DESIGN SPECIFICATION, no runtime final
- **Fecha**: 2026-08-25
- **Estado**: ACTIVA (rechaza commit `fb200595` anterior)
- **Fuente**: `~/kodex-relevo/00-STOP-CONVERTIR-LA-LAMINA-EN-SOFTWARE.md:27-29`
- **Textual**: *"La lámina es una DESIGN SPECIFICATION, NO el runtime final. Debes descomponerla y reconstruirla como software nativo."*

### DEC-008 · KODEX es motor de mundo, no web (RESPONSIVE CAMERA)
- **Fecha**: 2026-08-25
- **Estado**: PARADIGMA FUNDACIONAL
- **Fuente**: `~/kodex-relevo/00-KODEX-ES-UN-MOTOR-NO-UNA-WEB.md:1-154`
- **Textual**: *"NO RESPONSIVE LAYOUT. RESPONSIVE CAMERA + RESPONSIVE CHOREOGRAPHY. Un videojuego no toma la pantalla 16:9 y la encoge en un teléfono. Cambia cámara, FOV, composición, controles y densidad — pero sigue siendo el mismo mundo."*

### DEC-009 · La Referencia Manda — aparato visual idéntico en 7 escenas
- **Fecha**: 2026-08-27
- **Estado**: ACTIVA
- **Fuente**: `~/kodex-relevo/00-LA-REFERENCIA-MANDA.md:1-80`
- **Textual**: *"Las siete escenas comparten un aparato idéntico. [shell con] CABECERA · NAV · ESTADO (🔴 SIGNAL <ESTADO>) · RIEL IZQ/DER · CENTRO con ORGANISMO · PIE IZQ/DER · BASE. Nada de esto existe hoy en la implementación."*

---

## 2. Visual · palette · chasis

### DEC-010 · Chasis ámbar compartido + color por escena INTENCIONAL
- **Fecha**: 2026-08-28
- **Estado**: ACTIVA
- **Fuente**: `~/.claude/projects/-Users-user1/memory/project_kodex_paleta_ambar_2026_08_28.md`
- **Textual**: *"El chasis de instrumento es ámbar y compartido en los 7 boards. El color de cada escena es propio e intencional — es el MUNDO. NO cambiar los colores por escena."*

### DEC-011 · Paleta congelada por escena (DRIFT no resuelto)
- **Fecha**: 2026-08-29 (contratos) · drift medido 2026-08-30
- **Estado**: **ACTIVA pero DRIFT NO RESUELTO**
- **Fuente**: `docs/kodex/20-ACCENT-DRIFT-3-SOURCES-2026-08-30.md`
- **Textual**: (ver tabla) 3 fuentes divergen — contratos yaml, `[folio].astro` render, `kodexScenes.js` nav.
- **Decisión pendiente**: ARCHIVE/MACHINE/RETURN cada uno con 3 valores distintos.

### DEC-012 · RETURN = BLANCO CANONICAL
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA pero DIVERGE EN RENDER
- **Fuente**: `DECISION-LOG-2026-08-29-AUTORIDAD-HIFI.md:44-45`
- **Textual**: *"RETURN = blanco es CANONICAL visual. Fue decisión explícita nuestra, independiente de lo que inventara el generador."*
- **Conflicto**: render usa acid green `#A7FF00` / `#B7FF00`.

### DEC-013 · Punto Rojo = THE KODEX VOICE (reporta estado del sistema)
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA / implementación pending completa
- **Fuente**: `~/kodex-relevo/00-LA-REFERENCIA-MANDA.md:60-80` + `decisiones-encontradas-kimi.md:1-27`
- **Textual (nombre)**: *"en el documento de voz canónico la entidad se llama `THE KODEX VOICE`"*
- **Textual (arranque)**: *"Silencio por defecto / opt-in: audio begins only after user initiation or explicit consent."*

### DEC-014 · Generated Visual Telemetry — nunca medición real
- **Fecha**: 2026-08-29
- **Estado**: RESTRICCIÓN DURA
- **Fuente**: `DECISION-LOG-2026-08-29-AUTORIDAD-HIFI.md:30-35`
- **Textual**: *"Los números de las láminas son GENERATED VISUAL TELEMETRY, no datos. `98.7%` · `99.7%` · `100%` · `87 BPM` · `1.12` · `DEPTH` · coordenadas cosmológicas → clasificación SPECULATIVE / VISUAL_REFERENCE, nunca VERIFIED ni CANONICAL."*
- **Regla**: *"antes de mover algo de HUECO a VIVO, la pregunta no es '¿está confirmado por varias fuentes?' sino '¿esta fuente puede medir?'"*

### DEC-015 · Obra de Ocín = materia real + transformación (nunca reinterpretación)
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA
- **Fuente**: `~/kodex-relevo/DECISION-LOG-2026-08-29-B-ACTIVADORES.md:10-18`
- **Textual**: *"El arte de Ocín es materia visual real. KODEX agrega encima: profundidad, recortes, zooms, máscaras, capas, micro-UI, códigos, texto, señal, parallax, glitches, estados y transición."*

### DEC-016 · Fragmentación — original siempre reconocible
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA
- **Fuente**: `DECISION-LOG-2026-08-29-B-ACTIVADORES.md:23-25`
- **Textual**: *"Obra completa + macrodetalles + recortes + versiones invertidas + secuencias de transformación + información técnica. El original siempre reconocible."*

### DEC-017 · Evitar mandala monocromático (identidad local por escena)
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA
- **Fuente**: `DECISION-LOG-2026-08-29-B-ACTIVADORES.md:27-29`
- **Textual**: *"Evitar que todas las escenas sean el mismo mandala con otro color. Coherencia global, identidad local."*

---

## 3. Vocabulario y estados

### DEC-018 · Motor KODEX: 6 estados congelados (post-IDLE removal)
- **Fecha**: 2026-08-29 · commit `347bab03`
- **Estado**: ACTIVA / IMPLEMENTADO
- **Fuente**: `src/lib/kodex/prologue/observacion.ts:55` + tests 10/10
- **Textual**: *"DORMANT · AWARE · LOCK · TRACK · INSPECT · DESCEND (6). soltar → AWARE (el gesto termino, la presencia no). salir del campo → DORMANT. DESCEND es TERMINAL."*
- **Elimina**: IDLE (era 7º estado).

### DEC-019 · Carril visual pantalla: 5 estados (board manda en presentación)
- **Fecha**: 2026-08-27 (board) · 2026-08-29 (congelado)
- **Estado**: ACTIVA (motor y pantalla DIFIEREN A PROPÓSITO)
- **Fuente**: `~/kodex-relevo/00-LA-REFERENCIA-MANDA.md:84-90` + scene contracts yaml
- **Textual (contrato)**: *"El motor de escena tiene 5 estados. El de observacion tiene 6: DORMANT AWARE LOCK TRACK INSPECT DESCEND. El carril colapsa LOCK/TRACK/INSPECT/DESCEND bajo CROSSED; ese colapso es deliberado y el sub-estado se reporta en la luz."*

### DEC-020 · OBSERVE no pertenece al carril de 5 estados
- **Fecha**: 2026-08-29
- **Estado**: CONFIRMADA POR OCÍN
- **Fuente**: `DECISION-LOG-2026-08-29-AUTORIDAD-HIFI.md:26-28`
- **Textual**: *"OBSERVE no pertenece a ese carril. El motor NO se reduce a cinco: presentación y runtime pueden diferir."*
- **Verificado**: pixel check confirmó que OBSERVE es microtexto vertical lateral en THRESHOLD, no paso del carril.

### DEC-021 · IDLE eliminado del carril visible
- **Fecha**: 2026-08-29 (decisión) · commit `347bab03` (implementación)
- **Estado**: ACTIVA en motor · CONFLICTO EN PRESENTACIÓN
- **Fuente**: `DECISION-LOG-2026-08-29-B-ACTIVADORES.md:60-70`
- **Textual**: *"IDLE vuelve. Lo eliminamos hoy del motor por decisión explícita (commit 347bab03): soltar → AWARE, salir → DORMANT."*

### DEC-022 · FOCUS = nombre visible del colapso LOCK/TRACK/INSPECT (hipótesis)
- **Fecha**: 2026-08-29
- **Estado**: **HIPÓTESIS PENDIENTE**
- **Fuente**: `DECISION-LOG-2026-08-29-B-ACTIVADORES.md:60-76`
- **Textual**: *"FOCUS podría ser el nombre visible del colapso LOCK/TRACK/INSPECT del motor — justo la distinción que hoy se pierde bajo CROSSED. Si es así, esto resuelve el problema del carril en vez de romperlo. Pero es una hipótesis mía y no la voy a implementar como si fuera la decisión."*

### DEC-023 · Paleta activadores contradice paleta congelada en 4 escenas
- **Fecha**: 2026-08-29
- **Estado**: **CONFLICTO NO RESUELTO**
- **Fuente**: `DECISION-LOG-2026-08-29-B-ACTIVADORES.md:37-56`
- **Divergencia**:
  ```
  DESCENT:    congelado naranja #FF6A00 → activadores morado profundo
  ARCHIVE:    congelado ácido #A7FF00  → activadores cian
  MACHINE:    congelado cian #00D8FF   → activadores naranja
  COSMOLOGY:  congelado magenta #FF00C8 → activadores verde
  ```

### DEC-024 · Activadores = 7 escenas o familia paralela (AMBIGÜEDAD)
- **Fecha**: 2026-08-29
- **Estado**: AMBIGÜEDAD ABIERTA
- **Fuente**: `DECISION-LOG-2026-08-29-B-ACTIVADORES.md:78-85`
- **Pregunta**: el collage muestra 00,01,02,03,04,06 (sin 05 COSMOLOGY). ¿Los activadores son las 7 del corredor, o familia paralela con IDs `KDX-CH-*`?

---

## 4. Arquitectura del corredor

### DEC-025 · Ley de Profundidad: composición contiene físicamente la siguiente
- **Fecha**: 2026-08-21
- **Estado**: FILOSOFÍA FUNDAMENTAL
- **Fuente**: `docs/kodex/14-LEY-DE-PROFUNDIDAD-2026-08-21.md:10-50`
- **Textual**: *"Entrar en profundidad no debería significar 'volar por un túnel'. Debería significar que cada composición contiene físicamente la siguiente composición dentro de ella."*
- **Manifestación**: `SUPERFICIE → SEÑAL → ESTRUCTURA → MEMORIA → PROFUNDIDAD → TRANSFORMACIÓN → −∞`

### DEC-026 · Cinco planos de profundidad (Z−2 a Z+2)
- **Fecha**: 2026-08-21
- **Estado**: ARQUITECTURA DE RENDER
- **Fuente**: `docs/kodex/14-LEY-DE-PROFUNDIDAD-2026-08-21.md:40-51`
- **Textual**: *"Sólo se mantienen cinco planos: Z −2 (escena anterior) · Z −1 (restos/ecos) · Z 0 (escena actual) · Z +1 (próxima) · Z +2 (preview/portal)."*

### DEC-027 · Tres direcciones de navegación (FORWARD/BACK/BRANCH)
- **Fecha**: 2026-08-21
- **Estado**: ACTIVA
- **Fuente**: `docs/kodex/14-LEY-DE-PROFUNDIDAD-2026-08-21.md:75-94`
- **Textual**: *"Centro/profundidad = continuar el viaje principal. Laterales = ramificaciones del conocimiento. Atrás = regresar un nivel."*

### DEC-028 · Máquina de transición: 8 fases (IDLE → SETTLE)
- **Fecha**: 2026-08-21
- **Estado**: ACTIVA / PARCIALMENTE IMPLEMENTADO
- **Fuente**: `docs/kodex/14-LEY-DE-PROFUNDIDAD-2026-08-21.md:113-144`
- **Textual**: *"IDLE → AWARE → LOCK → PULL → ACCELERATE → CROSS → DECODE → SETTLE"*
- **Estado real**: `src/lib/kodex/estado.ts` implementa 5 (idle/aware/locked/active/transitionOut). Faltan PULL/ACCELERATE/CROSS/DECODE/SETTLE.

### DEC-029 · Descomposición semántica (no reemplazo genérico)
- **Fecha**: 2026-08-25
- **Estado**: ACTIVA
- **Fuente**: `~/kodex-relevo/00-STOP-CONVERTIR-LA-LAMINA-EN-SOFTWARE.md:31-60`
- **Textual**: *"AUTHORED PLATE → SEMANTIC DECOMPOSITION → NATIVE SCENE COMPONENTS → REAL STATE → REAL MOTION → REAL INTERACTION → DESKTOP SPATIAL / MOBILE TEMPORAL → KODEX SHELL"*

---

## 5. Assembly OS · pipeline

### DEC-030 · Atlas de 40 nodos existe y NO está siendo leído por el corredor
- **Fecha**: 2026-08-23 (hallado) · 2026-08-28 (bajado local)
- **Estado**: ACTIVA / SUBUTILIZADO
- **Fuente**: `~/kodex-relevo/ATLAS-07A/07B*.md` + `docs/kodex/17-EL-ATLAS-2026-08-23.md`
- **Contenido**: 40 nodos con CONCEPT, TAXONOMY, ZONE, INTERACTION, IMPLEMENTATION.
- **Problema**: `grep -rl "KDX-IMG" src/` devuelve cero (memoria 2026-08-28).

### DEC-031 · Campos del Atlas que el runtime pierde
- **Fecha**: 2026-08-23
- **Estado**: HUECO DE IMPLEMENTACIÓN
- **Fuente**: `docs/kodex/17-EL-ATLAS-2026-08-23.md:42-61`
- **Perdidos**: `zones` (P0–P3), `reading` (orden de revelado), `transfer_rule`, `forbidden_literal_reuse`.

### DEC-032 · 213 artworks compilados con SHA-256 (Assembly OS L6–L10)
- **Fecha**: 2026-08-30 (reconciliado al corredor via G0, commit `5d551407`)
- **Estado**: ACTIVA
- **Fuente**: `ops/factory/build-out/batch_inventory_213.json`
- **Pipeline**: L6 Element Library (17 HoloCore RGX) · L7 Recipe Engine · L8 Plate Assembler · L9 QA Capture · L10 Agent Dispatcher.

### DEC-033 · SHA-256 obligatorio para provenance
- **Fecha**: Histórico · congelado en constitución
- **Estado**: ACTIVA
- **Fuente**: implícito en `00-CONSTITUCION.md` + Assembly OS commits.

### DEC-034 · Generado ≠ medición (regla de gate)
- **Fecha**: 2026-08-29
- **Estado**: RESTRICCIÓN
- **Fuente**: `DECISION-LOG-2026-08-29-AUTORIDAD-HIFI.md:64-78`
- **Textual**: *"Un generador es perfectamente capaz de repetir el mismo número diez veces sin que ese número mida nada. Tratarlo como dato con fuente es exactamente lo que la política de anti-alucinación prohíbe."*

### DEC-035 · Recipe visual debe arrastrar zones/reading/transfer_rule
- **Fecha**: 2026-08-23
- **Estado**: PROPUESTA PENDIENTE
- **Fuente**: `docs/kodex/17-EL-ATLAS-2026-08-23.md:85-89`
- **Textual**: *"Ampliar `kdx_scene_recipes.json` para que arrastre `zones`, `reading`, `transfer_rule` y `forbidden_literal_reuse` desde el atlas."*

---

## 6. Rights gate y publicación

### DEC-036 · 0 de 25 obras aprobadas públicamente
- **Fecha**: 2026-08-29
- **Estado**: GATE CERRADO
- **Fuente**: `src/content/scenes/AUTHORITIES.yaml:74-77`
- **Textual**: *"NINGUNA obra puede publicarse hasta que el registry la marque aprobada. Especificar sí, publicar no."*

### DEC-037 · Mapeo lugar ↔ estado NO ENCONTRADO
- **Fecha**: 2026-08-27 (identificado como hueco)
- **Estado**: DECISIÓN PENDIENTE
- **Fuente**: `~/kodex-relevo/decisiones-encontradas-kimi.md:30-47`
- **Pregunta**: ¿PROLOGUE = AWAKENING?, ¿DESCENT = SYNCHRONY?
- **Dos boards contradicen**:
  - Board A: `AWAKENING · SYNCHRONY · RESONANCE · HEART CHAMBER · TRANSCENDENCE`
  - Board B: `AWAKENING · RESONANCE · INTEGRATION · TRANSCENDENCE`

### DEC-038 · Octava escena opcional post-RETURN para comercio (evidencia parcial)
- **Fecha**: 2026-08-25 (indicios) · 2026-08-28 (comentario)
- **Estado**: HIPÓTESIS CON EVIDENCIA
- **Fuente**: `~/kodex-relevo/decisiones-encontradas-kimi.md:101-145`
- **Textual**: *"El canon es explícito — RETURN debe funcionar artísticamente aunque el visitante se vaya sin nada, y el comercio migra a la 8ª escena, que es opcional y va DESPUÉS."*

### DEC-039 · RETURN dashboard estático (ubicación A/B/C sin resolver)
- **Fecha**: 2026-08-28
- **Estado**: DECISIÓN PENDIENTE
- **Fuente**: `~/kodex-relevo/decisiones-encontradas-kimi.md:51-75`
- **Board existe**: `06-RETURN.png` muestra dashboard con 6 paneles.
- **A/B/C**: reemplazar cinemática / agregar después del sello / dashboard como estado inicial.

---

## 7. Assets y láminas

### DEC-040 · Canon 67 · cadena perceptual
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA
- **Fuente**: memoria `project_kodex_canon_67_perception_2026_08_29`
- **Textual**: *"CAMPO → FOCO EXPLÍCITO → SALIENCIA VISUAL → LOCK → REVEAL → DEPTH → MEMORY TRACE"*

### DEC-041 · Obra jamás recoloreada
- **Fecha**: 2026-08-29
- **Estado**: ACTIVA
- **Fuente**: `DECISION-LOG-2026-08-29-B-ACTIVADORES.md:10-18`
- **Textual**: *"NUNCA se recolorea la obra."*

### DEC-042 · Especificación ejecutable define slice V0
- **Fecha**: 2026-08-28
- **Estado**: ACTIVA
- **Fuente**: `~/kodex-relevo/especificacion-ejecutable-2026-08-28.md`

### DEC-043 · Lotes 09/11/12 del Atlas = especificación completa
- **Fecha**: 2026-08-28
- **Estado**: SUBUTILIZADO
- **Fuente**: `~/kodex-relevo/ATLAS-07B-lotes-09-11-12.md`

### DEC-044 · Visual Genome Canon V1 — NEEDS_RESEARCH
- **Fecha**: Histórico
- **Estado**: NEEDS_RESEARCH
- **Fuente**: `src/content/scenes/AUTHORITIES.yaml:79-86`
- **Concepto**: *"Un genoma visual KODEX con múltiples FENOTIPOS, en vez de muchas estéticas inconexas."*

---

## 8. Reglas de trabajo · agentes

### DEC-045 · SEARCH BEFORE CREATE (regla constitucional)
- **Fecha**: 2026-08-30 (formalizada) · 2026-08-25 (proto)
- **Estado**: LEY CONSTITUCIONAL
- **Fuente**: `kodex-system/README.md`
- **Textual**: *"Ningún agente escribe código KODEX sin verificar los archivos de autoridad primero. Antes de crear un componente nuevo, el agente debe producir: EXISTING IMPLEMENTATION SEARCH... REUSE POSSIBLE: YES / NO. Si NO: reason. Sin esto no se escribe código nuevo."*

### DEC-046 · Nada se borra, todo se recicla (versionado inmutable)
- **Fecha**: 2026-08-29
- **Estado**: PREVALENCIA MÁXIMA
- **Fuente**: `~/kodex-relevo/00-CONSTITUCION.md:56-62`
- **Textual**: *"Ningún estado anterior se sobrescribe: se conserva y se versiona."*
- **Aplicación medible**: commit G0 `5d551407` — fusión campo por campo, preservó 914 triages + 213 artworks.

### DEC-047 · Coordinación por archivo, no por chat
- **Fecha**: Histórico
- **Estado**: ACTIVA
- **Fuente**: implícito en RELEVOs + handoffs + AUTHORITIES.yaml
- **Regla**: decisiones van en documentos accesibles, no en commits privados.

---

## Conflictos abiertos

Siete conflictos activos requieren decisión autoral antes de ejecutar:

| # | Conflicto | Fuentes en drift | Decisión | Bloqueador |
|---|-----------|------------------|----------|------------|
| C1 | Paleta 3-fuentes drift | yaml vs `[folio].astro` vs `kodexScenes.js` | ¿cuál es canónica? | DEC-011 |
| C2 | ARCHIVE ↔ MACHINE accents intercambiados | congelado vs activadores | ¿cyan/orange como yaml o como render? | DEC-023 |
| C3 | RETURN blanco vs acid | contrato vs render | DEC-012 dice blanco, render usa acid | DEC-012 |
| C4 | Paleta activadores contradice 4 escenas | congelado vs activadores | ¿ejecutar o ignorar activadores? | DEC-023 |
| C5 | FOCUS/DORMANT/IDLE en carril | activadores vs motor vs carril | reconciliación de nombres | DEC-021/022/024 |
| C6 | Mapeo lugar ↔ estado | dos boards se contradicen | ¿qué board manda? | DEC-037 |
| C7 | Activadores = 7 escenas o familia paralela | collage muestra 6 de 7 sin COSMOLOGY | ¿integran corredor o son propios? | DEC-024 |

---

## Decisiones implícitas en código

Cuatro decisiones vivas en el runtime SIN entry formal en decision-log:

| Decisión | Código | Nota |
|----------|--------|------|
| IDLE eliminado del motor | `src/lib/kodex/prologue/observacion.ts:165` (commit `347bab03`) | Formalizada como DEC-018/021 después de ejecutar |
| Máquina causal 7→6 estados | `observacion.ts:44` + 10 tests | Congelada 2026-08-29 |
| Aparato visual SHELL SIN CABLEAR | `[folio].astro` no monta la estructura declarada en DEC-009 | Hueco activo |
| ALTAR + TEMPLE como chambers | `escenas/altar.ts` + `escenas/temple.ts` + rutas `/chamber/altar/` `/temple/` | No aparecen en DEC-003 canon; ¿legacy o cuartas chambers? |

---

## Meta

**Mantenimiento**: cada nuevo decision-log debe integrarse aquí en su categoría, con DEC-NNN incremental. Regla de oro: **cero paráfrasis, citas textuales, procedencia exacta**.

**Última actualización**: 2026-08-30 · 47 decisiones activas.
