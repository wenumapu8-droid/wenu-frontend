# KODEX shader reference audit — 2026-07-29

## Objetivo

Traducir referencias externas de shaders / live visuals / KodeLife a un mapa concreto de integración para KODEX, priorizando mecanismos técnicos reutilizables por encima de looks ajenos.

---

## Regla madre

**No copiar apariencia. Sí extraer mecanismos.**

Pipeline objetivo:

`original KODEX artwork -> KodeLife study -> GLSL passes -> WebGL runtime -> Astro scene -> QA Lab`

---

## Referencias auditadas

### 1) keijiro/ShaderSketches
- URL: https://github.com/keijiro/ShaderSketches
- Descripción: “KodeLife shader sketches I wrote while commuting”
- Lenguaje: GLSL
- Licencia código: **Unlicense**
- Valor para KODEX: **altísimo**

#### Hallazgos
Top-level structure:
- `Fragment/`
- `Lines/`
- `AA/`

Sketches relevantes detectados:
- `Eyes.glsl`
- `Spectrum.glsl`
- `ReactDiffuse.glsl`
- `Waves.glsl`
- `Circles*.glsl`
- `Discs*.glsl`
- `TriLattice*.glsl`
- `Lattice*.glsl`
- `Noise.glsl`
- `ValueNoise.glsl`
- `Text*.glsl`

#### Mecanismos extraíbles
- **ojo / mirada procedural** → `Eyes.glsl`
- **audio history / temporal spectrum storage** → `Spectrum.glsl`
- **feedback + estado persistente** → `ReactDiffuse.glsl`
- **simetrías radiales / discos / lattices** → `Circles`, `Discs`, `TriLattice`, `Lattice`
- **noise base útil** → `GradNoise`, `ValueNoise`, `Noise`

#### Notas de portabilidad
- KodeLife syntax propia; no asumir drop-in directo a WebGL2.
- Conviene usar estos sketches como **estudio de patrones de uniforms y loops**, no como copy/paste bruto.

#### Aplicación KODEX
- `KDX_THRESHOLD_PORTAL_001`:
  - polar warp / discs / circles
  - spectrum memory strip adaptado a bass envelope
  - feedback sutil inspirado en `ReactDiffuse` y `Spectrum`
- `KDX_OBSERVATION_EYE`:
  - gramática ocular derivada de `Eyes.glsl`, pero reconstruida con artwork KODEX + pupil logic propia

---

### 2) Hammster/windows-terminal-shaders — `kodelife.hlsl`
- URL: https://github.com/Hammster/windows-terminal-shaders/blob/main/kodelife.hlsl
- Formato: HLSL para Windows Terminal
- Valor para KODEX: **medio**

#### Hallazgos
El archivo expone una estructura simple y útil:
- `Time`
- `Scale`
- `Resolution`
- `Background`
- `shaderTexture`
- sistema de debug/patch coordinates

#### Mecanismos extraíbles
- wrapper minimalista para shader runtime
- uniforms claros y ordenados
- mentalidad de **debug visual** dentro del shader

#### No copiar
- No sirve como look final.
- No sirve como pipeline visual complejo.

#### Aplicación KODEX
- útil para definir **modo debug del QA Lab**:
  - UV view
  - coordinate overlays
  - pass inspection
  - “show input texture / show warped coords / show feedback buffer”

---

### 3) essenbee/shaders
- URL: https://github.com/essenbee/shaders
- Licencia: **MIT**
- Valor para KODEX: **medio/alto**

#### Hallazgos
Contiene:
- `.klproj` de KodeLife
- `.glsl` listos para ShaderToy
- ejemplos HTML de embedding web
- piezas tipo:
  - `codebasealpha*`
  - `TerrainShaderToy.glsl`
  - `TerrainCloudsWaterShaderToy.glsl`

#### Mecanismos extraíbles
- workflow claro **KodeLife -> GLSL -> web embed**
- shaders didácticos y fáciles de destripar
- base útil para:
  - kaleidoscope
  - SDF 2D
  - terrain / clouds / volumetric heuristics
  - wiring para browser runtime

#### Aplicación KODEX
- muy útil como referencia de **estructura de proyecto** y **puente de exportación**.
- menos útil para look KODEX directo.

---

### 4) Projectile Objects — inspirational A/V sets
- URL: https://projectileobjects.com/2018/08/08/inspirational-a-v-sets/
- Valor para KODEX: **conceptual / performático**

#### Hallazgos
El artículo insiste en:
- live coded audio + visuals
- simulated ecologies
- feedback humano ↔ sistema
- colaboración A/V
- inmersión / terapia emocional / espacialidad

#### Mecanismos extraíbles
No tanto código, sí principios de dirección:
- audio y visual no como capas separadas sino como **un mismo organismo**
- loops de feedback entre performer, sistema y público
- estado performativo y transiciones largas

#### Aplicación KODEX
- refuerza la idea de que cada escena debe tener:
  - input sonoro
  - comportamiento autónomo
  - respuesta al visitante
  - memoria / persistencia

---

### 5) keijiro/Gamma
- URL: https://github.com/keijiro/Gamma
- Descripción: “Live coding project with KodeLife and Unity”
- Valor para KODEX: **altísimo como arquitectura**

#### Hallazgos
Top-level:
- `KodeLife/`
- `GammaStage/`
- `GammaRemote/`
- `TouchOSC/`

#### Lo importante
Acá no importa tanto un shader puntual, sino el patrón:
- **KodeLife como laboratorio vivo**
- **runtime separado** (Unity allá; Astro/WebGL acá)
- **remote control / live parameters**
- proyecto pensado como performance system

#### Aplicación KODEX
Este repo valida exactamente la arquitectura que queremos:
- laboratorio shader separado del runtime final
- control de parámetros externos
- stage runtime + control surface

Para nosotros eso se traduce a:
- `src/kodex/threshold-portal/` = laboratorio / runtime modular
- `/kodex/lab/` = control surface
- Playwright + métricas = versión KODEX del “stage discipline” 

---

## Mapa de mecanismos prioritarios para integrar

### P0 — integrar ya en `KDX_THRESHOLD_PORTAL_001`
1. **polar / concentric geometry**
   - fuente: `Circles*`, `Discs*`, `Coaxial`, `Lattice`
   - uso: deformación del portal Threshold

2. **temporal feedback controlado**
   - fuente: `Spectrum.glsl`, `ReactDiffuse.glsl`
   - uso: memoria corta del portal sin smear excesivo

3. **audio-reactive envelope**
   - fuente: `Spectrum.glsl`
   - uso: bass -> expansión / corona / pulse

4. **debug visualization mindset**
   - fuente: `kodelife.hlsl`
   - uso: capas de QA para UV / pass / buffers

5. **lab/runtime separation**
   - fuente: `Gamma`
   - uso: `/kodex/lab/` no como página pública sino como stage técnica

### P1 — integrar después
6. **procedural eye logic**
   - fuente: `Eyes.glsl`
   - uso: `KDX_OBSERVATION_EYE`

7. **reaction-diffusion / living corrosion**
   - fuente: `ReactDiffuse.glsl`
   - uso: escena skull / memory / corruption / reconstruction

8. **text / glyph / barcode modulation**
   - fuente: `Text*.glsl`, KODEX own UI language
   - uso: overlays, barcode breathing, hidden message bands

9. **lattice / triangular sacred geometry motion**
   - fuente: `TriLattice*`, `Hex*`
   - uso: Cosmology / Archive structures

### P2 — investigar si suma
10. **terrain/cloud volumetrics**
   - fuente: `essenbee/shaders`
   - uso posible: Descent / deep field / atmosphere
   - riesgo: puede empujar demasiado a “landscape shader” y alejarse del lenguaje gráfico KODEX

---

## Riesgos y disciplina de licencias

### Seguro / permisivo
- `keijiro/ShaderSketches` → **Unlicense**
- `essenbee/shaders` → **MIT**

### Igual conviene hacer clean-room parcial
Aunque la licencia lo permita, conviene:
- copiar **ideas de mecanismo**
- reescribir implementación con naming y estructura KODEX
- documentar procedencia del mecanismo
- no arrastrar el look ni convenciones enteras del repo fuente

### Antes de mezclar código directo
Registrar en notas del prototipo:
- repo fuente
- archivo fuente
- mecanismo tomado
- si fue port directo, adaptación o clean-room rewrite

---

## Recomendación concreta para el próximo paso

### Carril inmediato
Implementar `/kodex/lab/` mínimo con:
- canvas
- selector `DORMANT / AWARE / OPEN`
- `seed`
- `elapsedMs`
- `bass`
- `motionMode`
- toggles de debug

### Integración técnica inmediata
En `KdxThresholdPortalRuntime` agregar en esta secuencia:
1. source pass actual → enriquecer con radial segmentation y ring logic derivada de `Discs/Circles`
2. feedback pass → agregar mezcla/history mejor inspirada en `Spectrum`
3. debug pass opcional → buffers y UV como en mentalidad `kodelife.hlsl`
4. panel de control `/kodex/lab/` inspirado arquitectónicamente en `Gamma`

---

## Conclusión

Las referencias no apuntan a “copiar shaders lindos”.
Apuntan a construir un sistema KODEX con estas cuatro verdades:

1. **KodeLife es el laboratorio**, no el producto final.
2. **El runtime final vive en web**, no en el ejemplo.
3. **La identidad viene de tus obras**, no del repo fuente.
4. **El valor está en los mecanismos**: polaridad, feedback, audio, buffers, simetría, observación, memoria.

KODEX no necesita parecerse a ShaderSketches, Gamma o esos AV sets.
Necesita absorber sus mecanismos y hablar con su propia voz.