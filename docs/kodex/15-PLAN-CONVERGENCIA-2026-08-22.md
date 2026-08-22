# 15 · PLAN DE CONVERGENCIA · AUDITORÍA REAL
**2026-08-22 · HEAD 65ee2d71 · ninguna línea de código escrita para producirlo**

Informe completo con las tablas A–K:
https://claude.ai/code/artifact/ab4f9f9f-b391-4b5b-8da6-4d19d9a4f009

Regenerar el inventario: `node scripts/kodex/inventario-convergencia.mjs --lista`

---

## EL HALLAZGO QUE ORDENA TODO

Existen **dos KODEX en el mismo repositorio**.

Uno es el corredor: siete escenas escritas a mano en `.astro`, publicado y
verificado — barrido 0 defectos en 45 combinaciones, banco 72/72.

El otro es la gramática: compilador de IR semántica, ensamblador determinista,
receta de manifestación, modelo de renderizado de placa, registro de 28
elementos, 6 recetas de escena, 11 presets de movimiento.

**El segundo sólo se ejecuta en `/kodex/lab/`.** Ninguna de las siete escenas lo
invoca. No falta arquitectura: falta el cable entre dos mitades ya construidas.

## CIFRAS

| medida | valor |
|---|---|
| archivos rastreables en `src/` | 647 |
| alcanzables desde páginas/layouts | 564 |
| huérfanos (nadie los importa) | 83 · 13% |
| shaders totales / vivos | 52 / 11 — **41 huérfanos** |
| gramática: archivos / vivos | 29 / 12 |
| registro de elementos | 28 elementos · **huérfano** |
| nodos del grafo (`ramas.json`) | 513 · 108 vecindades |
| obras curadas (`obras.json`) | 47 |
| láminas escritas a mano | 40 |
| PRs abiertas en borrador | 8 |
| HoloCore en este repositorio | **0 archivos** |

## POR QUÉ SE SIENTE COMO PÁGINAS

1. **Cada escena es un archivo escrito a mano.** 7 folios + 40 láminas comparten
   hoja de estilos, no gramática. Cambiar el lenguaje obliga a tocar 47 archivos.
2. **El cruce reemplaza en vez de atravesar.** La pantalla anterior desaparece.
   Es la definición de «página».
3. **La máquina que las generaría está apagada.** Existe, funciona, y sólo corre
   en el laboratorio.

## LA CADENA DE CONTENIDO: ONCE DE DOCE ESLABONES EXISTEN

```
investigación → fuente → concepto → nodo → relaciones → activos
  → receta visual → IR semántica → ensamblaje → placa → estado → PANTALLA
                                                                    ↑
                                              escrita a mano · AQUÍ ESTÁ EL CORTE
```

**El delta que desbloquea el escalado es uno:** un *Node Manifestation Renderer*
de producción que tome `nodo + receta + activos` y devuelva una escena que
cumpla el contrato de lámina. El laboratorio ya demuestra que la cadena
funciona: `/kodex/lab/golden-plates/[case_id]` ensambla hoy.

Y hay que enchufar el registro: el ensamblador trabaja sin validar contra su
propia lista de 28 piezas, que está huérfana junto con
`kdx_element_contract.schema.json` y `kdx_plate_spec.schema.json`.

## LAS PRIMITIVAS QUE FALTAN — CINCO, NO UNA ARQUITECTURA

1. Los cinco verbos: DEEPEN · LATERAL · REVISIT · CROSS · RETURN_TRACE
2. Las cinco capas de profundidad con velocidades 0,15 → 1,00
3. La placa activadora
4. El hilo de retorno a la espina
5. El renderer de nodos

## FASE PALANCA

**P4.** Mientras cada escena siga siendo un archivo a mano, cada tema nuevo
cuesta una pantalla nueva. El renderer es lo único que convierte 513 nodos, 47
obras y 6 recetas en experiencia sin diseñar 513 pantallas.

## LO QUE ESTE PLAN NO PROPONE, A PROPÓSITO

Ningún router nuevo. Ningún JourneyState nuevo. Ninguna memoria nueva. Ningún
registro de escenas nuevo. Ningún grafo nuevo. Ningún Assembly OS nuevo. Ninguna
familia de renderizado nueva. Nada se borra por parecer viejo: lo huérfano se
tría y se declara.

## CORRECCIÓN AL BRIEF

**HoloCore no existe en este repositorio** — cero archivos. O está en otro
linaje y hay que localizarlo, o hay que sacarlo del canon. Documentación no es
implementación.

## CORRECCIONES DE LA SEGUNDA PASADA · 2026-08-22

Tres cosas que este documento decía mal y que la verificación corrigió. Se
dejan escritas en vez de editarlas en silencio.

### 1 · 08D, 08E y 08F no existen

La serie del Drive termina en C: `08A-KDX-SCENE-ORCHESTRATOR`,
`08B-KDX-OBSERVATORY-CONTROL-ROOM`, `08C-MACHINE-MASTER-PROMPT`. No falta
entrada: el plan está hecho contra el canon completo.

### 2 · HoloCore SÍ se escribió — y se cerró sin fusionar

No es «documentación sin implementación». Es **implementación abandonada**:

    PR #67  CLOSED · DRAFT · feat/kodex-holocore-registry-v1 · 12 archivos
    ramas vivas en origin, las tres de hace 8 días:
      feat/kodex-holocore-registry-v1
      feat/kodex-holocore-renderer-adapters-v0
      feat/kodex-holocore-prototype-v1

Incluye `src/kodex/holocore/registry.js` (11 KB), cuatro escenas ASCII y
scripts de evidencia en navegador. Los docs 28 y 29 hablan de «catorce núcleos
visuales direccionables por consulta». Está escrito, tiene evidencia, y nadie lo
fusionó. Eso es material de P0, no una ausencia.

### 3 · El renderer y la placa activadora YA EXISTEN — el plan los daba por construir

`src/components/kodex/grammar/KodexPlateSpecRenderer.astro`, 18 KB, **en esta
rama**, sabe dibujar tres tipos de placa:

    KNOWLEDGE_PLATE · JUNCTION_PLATE · ACTIVATOR_PLATE

y dos cargas: `ARTWORK` y `FIELD`. Con ranuras, lista de rutas, referencias de
procedencia, movimiento y control de bytes de la obra.

La **placa activadora**, que el artefacto G daba por inexistente, está declarada
en cuatro esquemas y tiene **12 entradas** en el registro de 28 elementos.

Lo consume, otra vez, sólo el laboratorio: `lab/semantic-ir/[case_id]` y
`lab/golden-plates/[case_id]`.

**Consecuencia para P4:** no es construir un renderer. Es **promover a producción
uno que ya dibuja, y enchufarle el registro huérfano que es su lista de piezas.**
De semanas a días. Y eso desarma la objeción de que P4 sea construir motor
mientras el creador espera experiencia.

**Consecuencia para P7:** la dependencia `P7 → P4` que este plan escribió es
demasiado fuerte. Los controles de MACHINE sobre `KodexTreatmentChain` no
necesitan el renderer: corren en paralelo sobre la escena escrita a mano y se
pliegan al renderer después.

### 4 · El detector medía cajas, no letras

En `genesis-cradle` a 1440 informaba 8 superposiciones al 63% — pares
`"STABILITY" × "98.7%"`. Medido: la caja de la etiqueta va de x=843 a 984, sus
letras ocupan unos 60px, y el valor cae en 929-952, dentro de la caja y lejos
del texto. **Las ocho eran falsas.** Un bloque con texto a la izquierda siempre
«solapa» con lo que tenga a la derecha.

Corregido: se mide el rectángulo de las letras con un `Range` sobre los nodos de
texto, recortado por los ancestros. Las ocho desaparecen y el corredor sigue en
0 defectos en 45 combinaciones, así que no se escondió nada.

**Lo que sí queda abierto en `genesis-cradle`**, y es distinto de lo reportado:
en 390, 412 y reduced-motion, dos controles de 44×44 están apilados con 4px de
desfase — el interruptor de señales en x 338-382 y el de sonido en x 334-378.
Dos objetivos táctiles en el mismo lugar. **P1 abierto.**

### 5 · P13 no arranca de cero

`scripts/kodex/cosechar-marcas.mjs` y `public/kodex-content/marcas.json` ya
tienen **60 signos extraídos de 13 planchas**, normalizados y con procedencia.
Es el primer eslabón de ATOMS y está hecho.
