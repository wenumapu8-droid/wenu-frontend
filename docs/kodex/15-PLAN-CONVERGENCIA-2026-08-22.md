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

## PENDIENTE DE ENTRADA

08D, 08E y 08F no son legibles desde estas máquinas: el paquete
`08_KDX_EXPERIENCE_ORCHESTRATION` no está sincronizado en el Drive local del
iMac. Este plan se hizo con el repositorio y el canon 07D/09–14. Si 08F asigna
paquetes de trabajo distintos, manda 08F.
