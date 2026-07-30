# KDX_THRESHOLD_PORTAL_001 Implementation Plan

> **For Hermes:** ejecutar en rama `feature/kodex-depth-engine` sin tocar producción ni reemplazar `/kodex/` actual hasta validar el prototipo.

**Goal:** probar que una obra original KODEX puede vivir como portal programable en tiempo real: artwork fuente → shader GLSL → runtime WebGL → escena Astro → fallback estático/video.

**Architecture:** crear un carril aislado `src/kodex/threshold-portal/` con tres capas: `source` (muestreo y deformación del artwork), `feedback` (memoria temporal / previous frame) y `composite` (tratamiento rojo Threshold + scanline/glow). El runtime debe aceptar `seed`, `elapsedTime`, `motionMode`, `qualityLevel`, audio bass y pointer/touch para que luego el QA Lab pueda congelar frames deterministas.

**Tech Stack:** Astro, WebGL2, GLSL ES 3.00, Web Audio API, Vite raw shader imports, Playwright más adelante para captura determinista.

---

## Fixed prototype scope

- **Prototype name:** `KDX_THRESHOLD_PORTAL_001`
- **Source artwork candidate:** `public/img/kodex/works/bw-06-alpha.png`
- **Scene states:** `DORMANT`, `AWARE`, `OPEN`
- **Scene palette:** Threshold red only
- **Required mechanics:** polar transform, breathing deformation, subtle feedback, bass expansion, pointer/touch response
- **Out of scope for this pass:** raymarching, particle swarms, multi-scene orchestration, full `/kodex/lab/` dashboard

---

## File map

### New files
- `docs/plans/2026-07-29-kdx-threshold-portal-001.md`
- `src/kodex/threshold-portal/config.js`
- `src/kodex/threshold-portal/index.js`
- `src/kodex/threshold-portal/runtime/KdxThresholdPortalRuntime.js`
- `src/kodex/threshold-portal/shaders/screen.vert`
- `src/kodex/threshold-portal/shaders/thresholdPortalSource.frag`
- `src/kodex/threshold-portal/shaders/thresholdPortalFeedback.frag`
- `src/kodex/threshold-portal/shaders/thresholdPortalComposite.frag`
- `src/kodex/threshold-portal/README.md`

### Future integration targets
- `src/pages/kodex/lab.astro`
- `src/pages/kodex/index.astro`
- `src/scripts/kodex-engine.js`
- `playwright.config.ts`
- `tests/kodex/*.spec.ts`

---

## Task 1: Freeze source artwork + prototype contract

**Objective:** fijar una obra original, estados y uniforms obligatorios antes de integrar UI.

**Files:**
- Create: `src/kodex/threshold-portal/config.js`
- Create: `src/kodex/threshold-portal/README.md`

**Step 1: Define config object**

Debe incluir:
- `id: 'KDX_THRESHOLD_PORTAL_001'`
- `artworkUrl`
- `states: ['DORMANT','AWARE','OPEN']`
- `defaultSeed`
- `defaultElapsedMs`
- `defaultMotionMode`
- `defaultQualityLevel`
- palette Threshold (`base`, `accent`, `glow`, `background`)

**Step 2: Document mechanism mapping**

En el README dejar claro:
- qué parte viene del artwork original
- qué parte es transformación geométrica
- qué parte es memoria temporal
- qué parte es tratamiento de color/screen
- qué partes podrán venir de KodeLife examples pero solo como mecanismo, no look

**Verification**
- Leer ambos archivos y verificar que el prototipo no depende de example artwork externo.

---

## Task 2: Scaffold isolated shader passes

**Objective:** separar la receta del portal en passes exportables como GLSL plano.

**Files:**
- Create: `src/kodex/threshold-portal/shaders/screen.vert`
- Create: `src/kodex/threshold-portal/shaders/thresholdPortalSource.frag`
- Create: `src/kodex/threshold-portal/shaders/thresholdPortalFeedback.frag`
- Create: `src/kodex/threshold-portal/shaders/thresholdPortalComposite.frag`

**Step 1: Vertex pass**
- fullscreen triangle
- salida `v_uv`

**Step 2: Source pass uniforms**
- `u_tex`
- `u_res`
- `u_time`
- `u_seed`
- `u_pointer`
- `u_bass`
- `u_state`
- `u_quality`
- `u_motion`

**Step 3: Source pass behavior**
- preservar geometría reconocible del artwork
- aplicar coordenadas polares controladas
- breathing lento
- offset local por pointer
- expansión por graves

**Step 4: Feedback pass**
- `u_scene`, `u_prev`, `u_decay`, `u_mix`, `u_time`
- memoria sutil, no smear agresivo

**Step 5: Composite pass**
- tratamiento rojo Threshold
- glow muy controlado
- scanline/dither liviano
- reduced-motion compatible

**Verification**
- Cada shader compila como texto plano y queda aislado por responsabilidad.

---

## Task 3: Build deterministic WebGL runtime

**Objective:** encapsular WebGL2 en una clase reusable y auditable por QA.

**Files:**
- Create: `src/kodex/threshold-portal/runtime/KdxThresholdPortalRuntime.js`
- Create: `src/kodex/threshold-portal/index.js`

**Runtime contract**
- constructor `(canvas, options)`
- methods:
  - `load()`
  - `start()`
  - `stop()`
  - `dispose()`
  - `setSeed(number)`
  - `setElapsedMs(number)`
  - `setState('DORMANT'|'AWARE'|'OPEN')`
  - `setMotionMode('live'|'paused'|'reduced'|'low-power')`
  - `setQualityLevel('high'|'medium'|'low')`
  - `setBass(number)`
  - `setPointer(x, y)`
  - `captureFrame()`
  - `getMetrics()`

**Determinism rules**
- no usar `Math.random()` dentro del render loop
- todo ruido deriva de `seed`
- `elapsedMs` puede venir inyectado externamente
- `paused` debe renderizar un frame estable
- `reduced` debe neutralizar feedback y breathing intensa

**Verification**
- Dos renders con mismo seed/time/state deben producir mismo frame.

---

## Task 4: Add lab route shell

**Objective:** montar `/kodex/lab/` como superficie privada de prueba sin meterlo en la navegación pública.

**Files:**
- Create: `src/pages/kodex/lab.astro`
- Modify later: `src/layouts/KodexShell.astro` only if needed

**Minimum contents**
- canvas principal
- selector de state
- selector de viewport preset
- seed
- time
- motion mode
- bass value
- botón de capture
- panel de métricas (`fps`, `frameTime`, `heap`, `drawCalls`, `activeLoops`)

**Rules**
- no enlazar desde nav pública
- noindex
- route pensada como tool interna

**Verification**
- `/kodex/lab/` responde localmente y no aparece en navegación pública.

---

## Task 5: Wire CTA transition contract

**Objective:** definir cómo `ENTER THE SYSTEM` mueve el portal entre `DORMANT → AWARE → OPEN`.

**Files:**
- Modify later: `src/pages/kodex/index.astro`
- Modify later: `src/scripts/kodex-engine.js`

**Behavior**
- `DORMANT`: respiración mínima, pointer gain casi nulo
- `AWARE`: pointer activo, expansión leve, feedback visible
- `OPEN`: expansión más amplia, composite intensificado, salida/transición a siguiente escena

**Verification**
- La CTA no hace solo navigate: primero dispara la mutación visual.

---

## Task 6: Prepare QA / Playwright integration

**Objective:** dejar el runtime listo para el laboratorio determinista y regresión visual.

**Files:**
- Create later: `playwright.config.ts`
- Create later: `tests/kodex/threshold-portal.spec.ts`
- Create later: `tests/kodex/threshold-portal-cycle.spec.ts`

**Required test matrix**
- viewports: `390x844`, `430x932`, `768x1024`, `1440x900`, `1920x1080`
- times: `0`, `500`, `1500`, `5000`
- states: `DORMANT`, `AWARE`, `OPEN`
- modes: `live`, `paused`, `reduced`, `low-power`

**Verification**
- capturas idénticas para mismo seed/time/state
- reduced-motion sin loops vivos innecesarios
- test de 10 ciclos sin fuga material de listeners/RAF

---

## Acceptance gates for prototype

- El artwork original sigue siendo reconocible
- El portal respira sin desfigurarse
- El feedback existe pero no ensucia lectura editorial
- El rojo Threshold domina sin caer en synthwave genérico
- Pointer/touch y bass modifican el sistema de forma clara pero sobria
- Seed + elapsedTime producen frames repetibles
- Reduced-motion deja un still digno, no una versión rota

---

## Exact next implementation order

1. scaffold de archivos aislados
2. source pass con artwork + polar transform
3. feedback sutil
4. composite Threshold red
5. runtime determinista
6. route `/kodex/lab/`
7. Playwright + memory cycle tests
8. recordings desktop/mobile

---

## Current handoff status

- plan escrito
- estructura base del pipeline creada
- sin tocar aún el runtime live de `/kodex/`
- siguiente paso ideal: implementar el source pass y levantar un primer canvas aislado en `/kodex/lab/`
