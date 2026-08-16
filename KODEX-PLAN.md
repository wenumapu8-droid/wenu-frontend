# KODEX · plan de construcción

Escrito el 2026-08-10, después de leer por fin la constitución, el Truth Ledger,
el Node Standard, el Production Blueprint y la P0 Scene Bible. Reemplaza la
planificación anterior, que estaba hecha sin haberlos leído.

## Lo que cambia respecto de cómo veníamos

Las 17 láminas **no son la especificación**. En la jerarquía de verdad son el
puesto 8 de 9, debajo del Truth Ledger, el canon, el Decision Log, el código
verificado y la Scene Bible. El blueprint lo dice literal: *«never overwrite
canon based solely on a reference image»*.

Y el Truth Ledger fija la escala de producción:

```
CONCEPT → VISUAL REFERENCE → GENERATED IMAGE → PROTOTYPE
       → IMPLEMENTED FEATURE → TESTED FEATURE → DEPLOYED FEATURE
```

> *«Una intención no es un resultado. Un prompt no es una implementación.
>  Un prototipo no es un producto desplegado.»*

Las láminas reproducen GENERATED IMAGEs. Son **prototipos**, no features. Lo
digo acá para no volver a llamar terminado a lo que no lo está.

---

# MACRO · qué es el sitio

Seis escenas, **no seis micrositios**. La Scene Bible es explícita: comparten un
modelo de memoria, una capa de señal, un contrato de procedencia y un estándar
de accesibilidad.

```
01 THRESHOLD      entrada voluntaria      ¿entrás a un sistema que recuerda?
02 OBSERVER       percepción como relación  ves y sos visto
03 HEART          orientación, no puntaje   el corazón no puntúa: orienta
04 DIGITAL ALTAR  acto → señal → registro   la memoria no se guarda: se teje
05 SIGNAL TEMPLE  el estado acumulado       el altar contiene el acto,
                                            el templo contiene el estado
06 RETURN         reintegración, no reset   volver con memoria,
                                            no al mismo punto
```

El ciclo canónico que las une:
`CAOS → FORMA → SEÑAL → MEMORIA → DISOLUCIÓN → RETORNO → NUEVA FORMA`

## La base compartida, que hoy no existe

Cinco piezas. **Ninguna está construida**, y sin ellas cada página vuelve a tener
su lógica propia — que es justo lo que el blueprint prohíbe.

| pieza | qué hace | estado |
|---|---|---|
| `KodexNode` | tipo de nodo con procedencia y capa epistémica | falta |
| `SceneDefinition` | qué es una escena y qué expone | falta |
| `SceneState` | `dormant → aware → resonant → mutated → remembered` | falta |
| `MemoryEvent` | lo que el archivo recuerda | falta |
| `SignalBus` | puntero, dwell, foco, tiempo, memoria, coherencia… | falta |

El `SignalBus` es el que más importa: hoy `/kodex/m/descent` y `/kodex/m/ritual`
tienen cada una su propio manejo de puntero y de estados. Duplicado, y creciendo.

---

# MICRO · qué es una página

Cada escena recorre el pipeline entero, no sólo la parte visual:

```
NODO → SÍMBOLO → GRAMÁTICA VISUAL → INTERACCIÓN → ESTADO
     → TELEMETRÍA → EVENTO DE MEMORIA → ESCENA → RUTA → REGISTRO
```

Y responde ocho preguntas antes de existir:

1. ¿qué es? · 2. ¿qué fuente o canon lo sostiene? · 3. ¿a qué capa epistémica
pertenece? · 4. ¿cómo se ve? · 5. ¿qué cambia con el tiempo? · 6. ¿cómo puede
afectarlo el visitante? · 7. ¿qué recuerda KODEX después? · 8. ¿cuál es el
fallback sin movimiento y sin GPU?

## Terminado no es «se ve bien»

Doce compuertas, del blueprint. **La fidelidad de píxel no está entre ellas:**

nodos mapeados · procedencia asignada · sistema visual implementado ·
la interacción **significa** algo · transición de estado probada · **evento de
memoria emitido** · móvil verificado · reduced-motion presente · FPS medido ·
sin afirmación científica o cultural no sostenida · documentación al día ·
commit ligado al nodo

Y la de la Scene Bible, más corta y más dura:

> *«El estado recordado cambia un renderizado futuro.»*

Si volver a la página no la cambia, no está terminada.

---

# El orden

La Scene Bible fija los primeros siete pasos; los últimos son míos.

| | qué | por qué primero |
|---|---|---|
| **1** | Auditoría del repo contra estos documentos | el blueprint arranca con «FIRST, DO NOT CODE» |
| **2** | Los cinco contratos compartidos | sin esto cada página duplica lógica |
| **3** | **THRESHOLD** end-to-end | es la implementación de referencia |
| **4** | Migrar OBSERVE V2 a los contratos | sin aplanar su identidad visual |
| **5** | HEART — revisión de ruta y orientación | primera escena que *lee* memoria |
| **6** | DIGITAL ALTAR — memoria local antes que pública | escribir memoria |
| **7** | SIGNAL TEMPLE — mutación persistente | el estado se vuelve arquitectura |
| **8** | RETURN — firma de ruta | cierra el ciclo |
| **9** | Pase de móvil, reduced-motion y rendimiento | sobre las seis |

**El sitio existe recién en el paso 3.** Con THRESHOLD terminado hay una puerta
real: se entra, el sistema reconoce presencia, y al volver la puerta es distinta.
Eso ya es KODEX, aunque haya una sola escena.

## El ritmo diario

Una entrega por día, y **entrega significa medida y documentada**, no escrita.

- Los pasos 1 y 2 son de **un día cada uno** y no los reparto entre agentes: son
  decisiones de arquitectura y se toman una vez.
- Del 3 en adelante, **una escena cada dos o tres días** — no una por día. Una
  escena con memoria y estados no sale en una tarde, y prometerlo sería repetir
  el error de llamar terminado a lo que no lo está.
- Las **láminas siguen en paralelo**, una por día, con el cron ya puesto. Son
  insumo de gramática visual, no producto. Hay siete de diecisiete.

---

# Dónde entra lo ya construido

Nada se tira. Se recoloca:

| hecho | dónde entra |
|---|---|
| kit calibrado (`Waveform`, `RadialScanner`, `BarMeter`, `RingGauge`, `StepGraph`, `Micrografia`) | GRAMÁTICA VISUAL |
| héroes procedurales de las 5 láminas buenas | GRAMÁTICA VISUAL, reusables como organismos |
| los 8 tratamientos GPU + `KodexTreatmentChain` | capa de renderer |
| `/kodex/m/descent` y `/kodex/m/ritual` | **prototipos**, no escenas P0 — sirven de prueba de que el método da páginas vivas |
| el banco de fotocopia | test de regresión visual, **no** definición de terminado |
| las 335 imágenes de Drive inventariadas | asset atlas, con las reglas de procedencia del Truth Ledger |

Dos láminas —`t01-05` y `t01-07`— están trazadas y sin canvas. La constitución ya
responde qué hacer con ellas: la pregunta central del canon es *«¿puede un
sistema comportarse como una forma viva de memoria?»*, y un SVG de 85.000 paths
no puede. Van a rehacerse o a declararse excepción, pero eso es del creador.

---

# Reglas que gobiernan todo esto

Del Truth Ledger y la Scene Bible, y no son negociables:

- **Nunca fusionar** REALITY / MODEL / TRADITION / SPECULATION / KODEX en la misma
  categoría de verdad.
- **Ninguna fórmula como ornamento.** Toda matemática mostrada explica una
  propiedad, controla un algoritmo, define una transformación o se declara
  modelo conceptual.
- **Privacidad:** sin fingerprinting, sin inferencia emocional, sin puntaje
  espiritual, sin inferencia de salud, sin micrófono oculto. En OBSERVER,
  textual: *no inferir emoción, calidad de atención ni estado psicológico*.
- **Cultura:** ningún símbolo cultural sin cultura, territorio, fuente, custodio,
  licencia, transformación, límites, riesgo de apropiación y estado de consulta.
  Y nada de «sabiduría ancestral» como categoría homogénea.
- **Conflictos:** ningún agente los resuelve en silencio. Se conservan, se
  clasifican y se propone una acción verificable.

## Lo que sigue esperando decisión del creador

1. **La paleta** — tres sistemas en paralelo, análisis en
   `PALETTE-RECONCILIATION.md`.
2. **Las dos láminas trazadas** — rehacer o declarar excepción.
3. **Faltan 4 láminas** de TANDA 02: los pósters declaran «OF 12» y hay 8.
4. **Dos piezas con revisión cultural pendiente**: el `kisspng` de Kali y
   `Wenu_Mapu_2020.mp4`.
5. **La taxonomía** quedó casi resuelta por la ontología primaria de la
   constitución (SIGNAL, NODE, FIELD, SPECIMEN, SUBJECT, ARCHIVE RECORD,
   PROTOCOL, MACHINE, MEMORY, ANOMALY, PORTAL, RELIC, ORGANISM, VOID, RETURN) —
   pero mapear cada organismo a su nodo **es asignar canon**, y no me toca.

---

# CONFLICTO REGISTRADO · cuatro taxonomías simultáneas

El Truth Ledger es explícito: *«ningún agente debe resolver silenciosamente un
conflicto; debe conservarlo, clasificarlo y proponer una acción verificable»*.
Este es el conflicto más grande que encontré, y lo dejo registrado sin resolver.

**Hay cuatro conjuntos de escenas vigentes al mismo tiempo, y no coinciden:**

| fuente | escenas |
|---|---|
| **MOC del vault** + sitio actual | THRESHOLD · PROLOGUE · DESCENT · ARCHIVE · MACHINE · COSMOLOGY · RETURN (7, con color asignado) |
| **P0 Scene Bible** | THRESHOLD · OBSERVER · HEART · DIGITAL ALTAR · SIGNAL TEMPLE · RETURN (6) |
| **Diseños de página** de Drive | THRESHOLD · AWAKENING · DESCENT · RESONANCE · HEART CHAMBER · INTEGRATION · TRANSCENDENCE (7) |
| **Boards de referencia** | 8 organismos: THRESHOLD PORTAL · OBSERVATION EYE · DESCENT TUNNEL · ARCHIVE TREE · SPECIMEN SKULL · RITUAL DEVICE · COSMOLOGY CORE · SIGNAL BLOOM |

Sólo THRESHOLD y RETURN aparecen en las cuatro. HEART aparece en dos con nombres
distintos (HEART / HEART CHAMBER). MACHINE, ARCHIVE y COSMOLOGY existen en el
sitio construido pero **no** en la Scene Bible P0.

**Y hay un segundo conflicto, de máquinas de estado:**

| fuente | estados |
|---|---|
| Scene Bible | `dormant → aware → resonant → mutated → remembered` |
| Memory Infrastructure | `LATENT → DETECTED → MAPPED → FORGED → CARRIED → RETURNED → REPAIRED → ARCHIVED → TRANSMITTED` |
| Boards | uno propio por organismo (`SURFACE/DROP/DEEP/VOID`, `CHARGE/ALIGN/RESONATE/EMIT`…) |

Probablemente **no** sean alternativas sino capas distintas —la escena, el objeto
físico y el organismo visual— pero eso es una hipótesis mía, no una decisión, y
declararla sería inventar canon.

## Acción propuesta, verificable

1. El creador declara **cuál conjunto es el índice del sitio**. Recomendación:
   los 7 del MOC, porque son los que ya existen construidos y los que el vault
   alimenta nota por nota.
2. Se declara si las 6 de la Scene Bible son **escenas** o **capas de sistema**
   que atraviesan las 7. OBSERVER, ALTAR, TEMPLE y RETURN se leen más como
   funciones del sistema que como paradas del viaje.
3. Se declara si las tres máquinas de estado son capas —escena / objeto /
   organismo— o si una reemplaza a las otras.
4. Recién entonces se implementan los contratos compartidos. Codificar
   `SceneState` antes de esto es fijar en tipos una decisión que no está tomada.

**Esto bloquea el paso 2 del plan.** No el paso 1: la auditoría del repo se puede
hacer igual, y de hecho es lo que va a mostrar cuál de las cuatro taxonomías está
realmente construida.
