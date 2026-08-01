---
tipo: spec-tecnico
proyecto: KODEX −∞ Visual Engine
fecha: 2026-07-29
foco: arquitectura del motor v1 — shader compartido + receta JSON + 3 prototipos
estado: spec listo — construir DESPUÉS del sitio KODEX; prototipar en KodeLife en paralelo
---

# KODEX Visual Engine v1 — spec técnico

> UN shader parametrizado por uniforms. Una **receta** (JSON) → uniforms → un organismo visual
> vivo. Mismo motor para PORTAL, EYE, TREE (y todos los que vengan). Prototipo en KodeLife
> (GLSL/Metal), producción en la web con **OGL/WebGL** (liviano). Ver
> [[kodex-visual-engine-concepto-2026-07-29]].

## 1. La receta (contrato de datos)

```json
{
  "id": "kdx-observation-eye",
  "source": "observation-eye",          // textura/motivo base (del pack SVG rasterizado o proc)
  "behavior": ["observe","pulse","remember"],
  "treatment": ["violet","crt","feedback"],
  "interaction": ["pointer","audio"],
  "intensity": 0.72,
  "seed": "8F21A90C",
  "palette": { "bg":"#0A0A0A", "ink":"#EDEDED", "accent":"#B770FF" }
}
```
La receta se traduce a uniforms + flags. Cambiar la receta = otro organismo, sin tocar el shader.

## 2. Contrato de uniforms (el shader recibe esto)

```
uTime      float     // segundos
uRes       vec2      // resolución
uPointer   vec3      // xy normalizado + z=down (0/1)
uAudio     vec2      // x=level, y=bass (0..1); 0 si no hay audio
uSource    sampler2D // el motivo/obra base
uPrev      sampler2D // frame anterior (para feedback/remember) — ping-pong FBO
uSeed      float     // desde la receta (hash→float)
uIntensity float     // 0..1
uAccent    vec3      // color de acento (de palette)
uBehavior  int       // bitmask de comportamientos activos
uTreatment int       // bitmask de tratamientos activos
```

## 3. Librería de funciones (el vocabulario del motor)

**Behaviors** (modulan coordenadas / muestreo, en función de uTime + inputs):
- `breathe` — escala/pulso: `uv *= 1.0 + 0.04*sin(uTime*1.2)`.
- `grow` — expansión radial desde el centro (crecimiento del árbol).
- `observe` — el centro sigue a `uPointer`; dilatación tipo pupila con `uAudio`/pointer.
- `fracture` — desplazamiento por bandas (glitch estructural), gatillado por intensity/audio.
- `orbit` — rotación continua `rot(uTime*speed)` (simetría/merkabah).
- `remember` — feedback: mezcla con `uPrev` (afterimage), decae con el tiempo.

**Treatments** (post-proceso del color/salida):
- `dither` — Bayer 8x8 sobre luminancia.
- `crt` — scanlines + leve curvatura + aberración cromática.
- `bitmap` — threshold/posterize (blanco/negro duro).
- `feedback` — blend con `uPrev` (va de la mano con `remember`).
- `glitch` — RGB split + band displace puntual.
- `color` — mapea luminancia → gradiente `bg→ink→uAccent` (violet/cyan/acid según receta).

## 4. Pipeline (skeleton GLSL — estructura, no producción)

```glsl
// vec2 uv = coordenada normalizada
uv = applyBehaviors(uv, uBehavior, uTime, uPointer, uAudio, uSeed); // deforma el espacio
float m = texture(uSource, uv).r;                                   // muestrea el motivo
m = mixMemory(m, texture(uPrev, uv).r, uBehavior);                  // remember/feedback
vec3 col = mapColor(m, uAccent);                                    // color treatment
col = applyTreatments(col, uv, uTreatment, uTime);                 // dither/crt/bitmap/glitch
fragColor = vec4(col, 1.0);
```
`remember`/`feedback` requieren **ping-pong FBO** (2 render targets alternados). En KodeLife eso
es el "Previous Pass" (ya visto en tu captura); en OGL, dos framebuffers que se intercambian.

## 5. Los 3 prototipos (recetas)

- **KDX_THRESHOLD_PORTAL** → `behavior:[breathe,remember,orbit] · treatment:[violet,feedback,dither]`
  · interaction:[pointer] · source: portal/anillo. Respira, recuerda, se abre. → escena THRESHOLD.
- **KDX_OBSERVATION_EYE** → `behavior:[observe,pulse,remember] · treatment:[violet,crt,feedback]`
  · interaction:[pointer,audio] · source: iris/ojo. Detecta, sigue, escanea. → escena PROLOGUE.
- **KDX_ARCHIVE_TREE** → `behavior:[grow,transmit,remember] · treatment:[acid-green,bitmap,scan]`
  · interaction:[touch,bass] · source: árbol. Crece, conecta, transmite. → escena RETURN.

Cuando los 3 corran sobre el MISMO shader (solo cambia la receta), queda probada la gramática.

## 6. API en la web

```js
import { KodexEngine } from '/kodex/engine/visual/kodexEngine.js';
const eng = new KodexEngine(canvas, recipe);   // OGL bajo el capó
eng.play();                                     // rAF loop
eng.setIntensity(0.8); eng.setRecipe(otra);     // en vivo
eng.stop();                                     // cleanup (dispose FBOs, cancel rAF)
```
Cada escena de KODEX invoca una receta. El "living codex" del libro = una receta por capítulo.

## 7. Performance / reglas (móvil)

DPR cap ~1.5 · pausar fuera de viewport (IntersectionObserver) · `prefers-reduced-motion` → still
render (una pasada, sin loop) · audio opt-in (uAudio=0 hasta activar) · lazy-load por escena ·
dispose de FBOs y cancel rAF al salir. Un solo rAF por página (no múltiples loops).

## 8. Roadmap

1. Prototipar los 3 organismos en **KodeLife** (validar el look, un shader por receta first).
2. Unificar en UN shader con branches por `uBehavior/uTreatment`.
3. Portar a **OGL/WebGL** con el API de arriba + ping-pong para feedback.
4. Cablear a las escenas KODEX (reemplazar/mejorar los efectos Canvas 2D actuales donde sume).
5. "Living codex" del libro sobre el motor. NFT/ediciones = seed + receta congelada.
Construir DESPUÉS del sitio KODEX (que está casi listo). Sin apuro, prototipo en paralelo.
