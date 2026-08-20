# KODEX−∞ — MAPA DE CONVERGENCIA
Primer entregable del 08C MACHINE MASTER PROMPT · 2026-08-20
Agente: Claude Code (Mac mini) · rama `proof/kdx-folio-i-plate` · HEAD `6cc20f1c`

> Este documento NO propone rediseñar el KODEX. Inventaría lo que existe, lo mide,
> y dice qué falta para que se comporte como un solo organismo.

---

## 0 · ESTADO EXACTO DEL REPOSITORIO

| | |
|---|---|
| repo | `wenumapu8-droid/wenu-frontend` |
| worktree | `scratchpad/folio1` (propio; `~/kodex-work` es de otro agente y está sucio) |
| rama | `proof/kdx-folio-i-plate` |
| base | `origin/feat/laminas-movil` @ `ce1d80b8` |
| HEAD | `6cc20f1c` (6 commits sobre la base) |
| build | 1615 páginas, sin errores |
| desplegado | NO. Sin fusionar. Sin desplegar. |

**LIVE ≠ MAIN, y esto invalida una premisa del handoff anterior.**
`main` está congelado el 15-ago (`08daace1`), **544 commits atrás**. Producción sale de
`feat/laminas-movil`: es la única rama que contiene `src/components/kodex/os/Descenso.astro`,
y el HTML de producción carga su script. El deploy es subida directa del `dist`, no `git push`,
así que producción puede ir adelante de cualquier rama. **Quien despliegue desde `redesign-v2`
revierte el descenso y las láminas móviles sin darse cuenta.**

---

## 1 · ARQUITECTURA DE SIETE ESCENAS — REALIDAD, NO PLANO

| # | escena | ruta | plantilla | contrato |
|---|---|---|---|---|
| 00 | THRESHOLD | `/kodex/` | `index.astro` (propia) | sólo shell |
| 01 | PROLOGUE | `/kodex/folio/i/` | `[folio].astro` | completo |
| 02 | DESCENT | `/kodex/folio/ii/` | `[folio].astro` | completo |
| — | *interludio* MACHINE | `/kodex/interlude/archive-machine/` | `KodexQuietFrame` | sólo shell |
| 03 | ARCHIVE | `/kodex/folio/iii/` | `[folio].astro` | completo |
| 04 | MACHINE | `/kodex/folio/iv/` | `[folio].astro` | completo |
| 05 | COSMOLOGY | `/kodex/folio/v/` | `[folio].astro` | completo |
| — | *interludio* RETURN | `/kodex/interlude/cosmology-return/` | `KodexQuietFrame` | sólo shell |
| 06 | RETURN | `/kodex/folio/vi/` | `[folio].astro` | completo |

**Hallazgo:** el corredor no tiene siete escenas sino **nueve superficies** con **tres
plantillas distintas**. Los dos interludios no estaban en la lista canónica del 08A y sin
embargo el visitante los cruza caminando. Cualquier contrato que cubra "las siete" deja
dos pantallas afuera.

---

## 2 · INVENTARIO DE BLOQUES Y PRIORIDAD

Medido en navegador, 390×844 y 1440×900, con 6,5 s de asentado.
`—` = no existe · `oculto` = existe y no se muestra · medida = visible.

| pri | bloque | THR | PRO | DES | ARC | MAC | COS | RET |
|---|---|---|---|---|---|---|---|---|
| **P0** | obra | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P0** | organismo vivo | — | — | ✓ | — | ✓ | ✓ | — |
| **P0** | título | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P0** | acción primaria | **oculto** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P1** | navegación | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P1** | barra de estado | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P1** | descenso | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P1** | cajón | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P2** | rótulo | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P2** | banda de datos | — | ✓ | **oculto** | **oculto** | **oculto** | ✓ | ✓ |
| **P2** | tira volúmenes | — | ✓ | **oculto** | **oculto** | **oculto** | ✓ | ✓ |
| **P2** | eje −∞·0·+∞ | — | ✓ | **oculto** | **oculto** | **oculto** | ✓ | ✓ |
| **P2** | rail de obra | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P2** | lectura panel | — | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P3** | HUD astronomía | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P3** | línea de tiempo | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P3** | CRT + grano | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **P3** | túnel | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| P3 | código de barras | — | oculto | oculto | oculto | oculto | oculto | oculto |
| P3 | atajos ⌘K | oculto | oculto | oculto | oculto | oculto | oculto | oculto |

### Tres hallazgos de este inventario

**A · THRESHOLD no tiene acción primaria visible.** La escena cuyo trabajo es invitar a
cruzar no muestra un CTA en ninguno de los dos viewports. Es un incumplimiento P0 en la
escena 00.

**B · La densidad P2 está partida en dos grupos, y nadie lo decidió.**
PROLOGUE, COSMOLOGY y RETURN muestran banda + tira + eje en escritorio.
DESCENT, ARCHIVE y MACHINE los ocultan. Eso no es "cada escena tiene su carácter":
es que tres escenas heredaron un tratamiento y tres heredaron otro. El 08A pide
diferenciación deliberada; esto es diferenciación accidental.

**C · Las siete escenas cargan tres capas a pantalla completa a la vez** — túnel + CRT/grano
+ organismo donde lo hay. El 07D advierte literalmente: *"do not let transition canvas +
scene WebGL + CRT + grain all peak together during navigation"*. Hoy coinciden siempre.

---

## 3 · PROBLEMAS MEDIDOS

### 3.1 Composición — resuelto

Superposiciones de texto (elementos con texto propio que se pisan más del 22% del menor):

| escena | antes | ahora |
|---|---|---|
| PROLOGUE | 32 | **0** |
| DESCENT | 18 | **0** |
| ARCHIVE | 15 | **0** |
| MACHINE | 12 | **0** |
| COSMOLOGY | 38 | **3** (sólo horizontal) |
| RETURN | 36 | **0** |
| interludio MACHINE | 33 | **2** (sólo escritorio) |
| interludio RETURN | 30 | **2** (sólo escritorio) |
| THRESHOLD | 17 | **17** (sin tocar) |
| **total** | **231** | **24** |

Blancos táctiles bajo 44px en las seis planchas: de 3–5 por escena a **cero** en teléfono
y en horizontal.

### 3.2 Ritmo — parcialmente resuelto

| | antes | ahora | objetivo 07D |
|---|---|---|---|
| acuse del toque | 0,3 ms | 1 ms | 0–100 ms ✓ |
| clic → escena siguiente | 1.214 ms | 749 ms | — |
| sobrecosto de transición | 648 ms | **183 ms** | 180–320 ms ✓ |
| shell sobrevive al salto | no | **sí** | persistente ✓ |

**Piso irreducible: 566 ms.** Es lo que tarda una escena en cargar por sí sola, medido con
navegación directa sin transición. No lo baja ninguna transición. Instrumentado con
PerformanceObserver: 26 tareas largas y 3.575 ms de hilo principal ocupado durante un
cambio de escena, en bloques de ~143 ms — el vórtice WebGL, el lector ASCII con su
`getImageData` por cuadro, el CRT. **Ese es el próximo cuello y no es de layout.**

### 3.3 Lo que NO está hecho

**No hay coreografía temporal.** Esto es lo central del 08A y no existe en el código.
No hay `ENTER → ESTABLISH → REVEAL → OBSERVE → INTERACT → CONNECT → EXIT`. Hay una máquina
de estados (`src/lib/kodex/estado.ts`) con `idle → aware → locked → active → transitionOut`,
que es un ancestro del modelo pero no lo mismo: no distingue ESTABLISH de REVEAL, no tiene
CONNECT, y su tempo es idéntico en las siete escenas.

**Todas las escenas tienen el mismo tempo.** El 08A pide que THRESHOLD sea anticipación
lenta y MACHINE respuesta rápida. Hoy las siete comparten la misma duración de transición
y la misma curva. La diferenciación es visual, no temporal.

**No hay contratos de transición.** Ninguna frontera declara `visual_handoff`,
`motion_handoff`, `semantic_handoff` ni `memory_handoff`. La transición es genérica:
el mismo velo entre cualquier par de escenas.

**No hay prefetch de escenas adyacentes.** El 07D lo pide explícitamente y no está.

**Ningún `scene_id` declara los 21 campos del contrato de escena del 08A.** Hoy el perfil
declara 9 campos, todos de composición espacial. Faltan los 12 de tiempo, transición,
semántica, memoria, audio, rendimiento y verificación.

---

## 4 · ARQUITECTURA QUE NO SE DEBE DUPLICAR

Existe y funciona. Extender, no reemplazar:

| pieza | dónde | qué resuelve |
|---|---|---|
| máquina de estados | `src/lib/kodex/estado.ts` | ciclo de escena, una sola fuente |
| memoria del recorrido | `KodexRecuerda` + clave `kx-journey` | qué visitó el observador |
| grafo semántico | `ramas.json`, 1.427 nodos | relaciones entre conceptos |
| motor de descenso | `ruta.ts`, `descenso-ui.ts` | navegación por significado |
| shell compartido | `KodexChrome` + `[data-kdx-shell]` | cromo de las nueve superficies |
| contrato de plancha | `src/lib/kodex/plancha/plate-contract.ts` | anatomía espacial |
| router de vistas | `ClientRouter` vía `osShell` | shell persistente |
| cajón | `kx-os-drawer` + secciones | profundidad local |
| gramática visual | `src/lib/kodex/grammar` | recetas, campos, movimiento |

**Identidad canónica acordada con el agente de las láminas:** `kdx:<superficie>/<slug>` —
`kdx:folio/prologue`, `kdx:lamina/null-knot`, `kdx:interlude/archive-machine`,
`kdx:node/<hash8>`. Un solo espacio de nombres para las tres superficies y el grafo.

---

## 5 · LA REBANADA VERTICAL MÁS ÚTIL AHORA

El 08C sugiere `THRESHOLD → PROLOGUE`. **Coincide con la evidencia, por dos razones que
no estaban en el documento:**

1. THRESHOLD es la única escena que empeoró en términos relativos: 17 superposiciones sin
   tocar, y **sin acción primaria visible**. Es la peor pantalla del corredor y es la primera.
2. PROLOGUE ya está resuelta espacialmente (0 superposiciones en los tres viewports), así
   que la rebanada aísla limpiamente lo que falta: **el tiempo**. Si se prueba
   `THRESHOLD → PROLOGUE` con coreografía temporal, no hay ruido de composición mezclado.

### Qué debería probar esa rebanada
- THRESHOLD con acción primaria visible y jerarquía macro (el propio `00C-MASTER-PROMPT:477`
  pide auditoría capa por capa y *"the smallest removal/recomposition"*).
- Los siete estados temporales, con tempo distinto en cada una de las dos escenas.
- Un contrato de transición real en esa frontera: qué se entrega en visual, movimiento,
  semántica y memoria.
- Prefetch de PROLOGUE desde THRESHOLD.
- Evidencia en navegador en 390×844, 360×800, 1440×900 y 1920×1080.

---

## 6 · DECISIÓN PENDIENTE DEL CREADOR

**El velo de THRESHOLD.** `kx-veil__marca` ("THRESHOLD") se dibuja encima del `h1`
("KODEX−∞") con 91–100% de área compartida, y el decreto "REMEMBERS" encima del velo.
La receta maestra, ZONE B, dice *"never compete with another equally large headline"*.

No se tocó. Según la escala del propio material —
**KEEP / SUBORDINATE / CONDITIONAL / REMOVE_FROM_THIS_SCENE / DEFER** —
la recomendación de los dos agentes es **SUBORDINATE**, no borrado. Es composición del
creador y la decisión es suya.

---

## 7 · ESTADO DE CURADURÍA POR ESCENA

Escala del 08C: CONCEPT → PROTOTYPE → IMPLEMENTED → TESTED → CURATED → VERIFIED → DEPLOYED.

| escena | estado | falta para CURATED |
|---|---|---|
| THRESHOLD | IMPLEMENTED | CTA visible, jerarquía macro, decisión del velo, tiempo |
| PROLOGUE | **TESTED** | tiempo, transición, audio, presupuesto de rendimiento |
| DESCENT | TESTED | ídem |
| ARCHIVE | TESTED | ídem |
| MACHINE | TESTED | ídem |
| COSMOLOGY | TESTED | ídem + horizontal (3 superposiciones) |
| RETURN | TESTED | ídem |
| interludios | IMPLEMENTED | no están en el canon de siete; hay que decidir si lo están |

Ninguna escena es CURATED. Ninguna es VERIFIED. **IMPLEMENTED ≠ CURATED.**

---

## 8 · ARCHIVOS TOCADOS Y POR QUÉ

| archivo | razón |
|---|---|
| `src/lib/kodex/plancha/plate-contract.ts` | nuevo — anatomía y dirección de arte por plancha |
| `src/styles/kodex-plate.css` | nuevo — dos capas: shell y escena |
| `src/pages/kodex/folio/[folio].astro` | emite el contrato, dossier para las seis |
| `src/pages/kodex/index.astro` | firma la capa de shell |
| `src/pages/kodex/interlude/[id].astro` | firma la capa de shell |
| `src/components/KodexChrome.astro` | `transition:persist` en túnel, CRT, grano, retícula |
| `src/components/kodex/transition/KodexTransition.astro` | el velo sobrevive al intercambio |
| `src/components/kodex/transition/kodex-transition-client.ts` | modo rápido + ritual como evento |
| `src/scripts/kodex-engine.js` | el salvavidas no atropella una navegación en curso |
| `src/components/kodex/eje/KodexEje.astro` | dos defectos de alto y envoltura |
| `src/layouts/Base.astro` | `osShell` opcional, apagado por defecto |

**Nada borrado. Ninguna regla legacy marcada DEPRECATED todavía.**

---

## 9 · ERRORES COMETIDOS EN ESTE TRAMO

Se dejan escritos porque el 08C exige estado de verdad explícito.

1. **El detector inventaba superposiciones.** Un elemento dentro de un contenedor con scroll,
   corrido fuera de él, está recortado pero su rectángulo geométrico sigue dando su posición.
   Seis choques falsos en COSMOLOGY. Corregido, y la línea base se volvió a medir con la
   herramienta arreglada — por eso la cifra base subió de 199 a 231.
2. **Una abstracción sobre un modelo del DOM no verificado.** Se escribió un campo
   `visualSource:'scene'` para que la cartografía tomara la región visual, ocultando la figura
   de la obra. La cartografía es HIJA de esa figura: se ocultaron las dos. Retirado.
3. **El dossier existía sólo en PROLOGUE.** Al extender el contrato se ocultó la densidad P2
   en las seis escenas pero el botón que la recupera vivía en una rama condicional. En cinco
   escenas esa información quedó inalcanzable. Corregido.
4. **Una compuerta de `requestAnimationFrame`** durante la preparación de la escena: empeoraba,
   porque el navegador necesita cuadros para su propia transición de vistas. Retirada y anotada.
5. **Una regla de `padding-right` sobre un rail que en escritorio es vertical**, no horizontal.
   No hacía nada. Se quitó en vez de dejarla: una regla que no hace nada es peor que ninguna,
   porque el próximo cree que el caso está cubierto.
