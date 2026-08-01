# KDX FX SUITE · qué hace cada pase, medido

Medido en `/kodex/lab/core/`, mismo organismo, mismo estado (`?estado=OPEN`),
mismo recorte (se descartan cabecera y barra de tratamientos). Ventana
1000×700, SwiftShader.

**Para qué sirve esta tabla:** para no encadenar a ciegas. Antes de meter un
tratamiento en una escena hay que saber si aclara o oscurece — dos veces elegí
mal por intuición y las dos veces perdí tiempo.

| # | tratamiento | luz media | fondo oscuro | Δ luz vs crudo |
|---|-------------|-----------|--------------|----------------|
| — | CRUDO (organismo solo) | 24.03 | 82.0 % | — |
| 05 | **THERMAL MAP** | 17.98 | **91.5 %** | **−25.2 %** |
| 02 | **DITHER MATRIX** | 18.47 | 87.8 % | −23.1 % |
| 01 | CRT SCAN | 22.80 | 85.3 % | −5.1 % |
| 06 | CHROMATIC SPLIT | 22.91 | 84.5 % | −4.7 % |
| 07 | GLITCH FRACTURE | 24.11 | 82.2 % | +0.3 % |
| 04 | MEMORY FEEDBACK | 24.32 | 81.9 % | +1.2 % |
| 08 | PIXEL SORT | 26.10 | 81.9 % | +8.6 % |
| 03 | **BITMAP THRESHOLD** | 43.64 | 63.2 % | **+81.6 %** |

## Lo que se lee de acá

**Para llegar al negro dominante (~85 %)** los que sirven son THERMAL MAP y
DITHER MATRIX. THERMAL oscurece más pero **reescribe la paleta** a una escala
térmica: sólo conviene donde el color de la escena no importe o sea el suyo.
DITHER oscurece casi igual y **conserva el color**.

**BITMAP THRESHOLD es un ACLARADOR**, y por lejos: +81.6 %. Su nombre sugiere
lo contrario y ahí está la trampa — su parámetro `CRUSH` aplasta sombras, pero
el término de borde y la posterización suman mucha más luz de la que CRUSH
quita. **No usarlo para oscurecer.** Sirve para lo que hace: sacar estructura.

**GLITCH FRACTURE y MEMORY FEEDBACK son casi neutros** en luz (+0.3 %, +1.2 %).
Se pueden encadenar sin pelear con el presupuesto de negro.

**PIXEL SORT aclara moderado** (+8.6 %): arrastra el máximo de un tramo, así que
por construcción sube la media.

## Un límite de esta tabla, encontrado en el intento siguiente

La tabla mide el **organismo del banco**, que es un campo tenue con estructura
fina. Aplicar el mismo pase a un organismo distinto **no da el mismo delta**.

Caso real: DITHER MATRIX baja 23 % en el banco, pero puesto sobre `ripple-floor`
en RETURN movió la escena de 67.5 % a 67.6 % de fondo oscuro — nada. La razón es
que la luz de RETURN no está en medios tonos que el dither pueda cuantizar hacia
abajo, sino en un área grande y saturada; y además la medición de la escena
incluye velo, texto y chrome, no sólo el campo.

**Cómo usar la tabla, entonces:** sirve para saber la DIRECCIÓN de cada pase
(aclara / oscurece / neutro) y su orden de magnitud relativo. No sirve como
predicción exacta sobre otro organismo. Para eso hay que medir la cadena
concreta — `?fx=a,b` en el mismo banco, o la escena misma.

**Y una decisión de método:** después de tres intentos de bajar RETURN al canon,
paré. La escena se lee bien, el desvío está medido y anotado, y seguir ajustando
números sin una hipótesis nueva es justamente el error que esta tabla venía a
corregir.

## Método

    /kodex/lab/core/?estado=OPEN&fx=<id>
    /kodex/lab/core/?estado=OPEN&fx=<id>,<id>   (cadena)

Un pase se mide AHÍ antes de entrar a una escena. La captura se toma con Chrome
headless, que escribe al cargar: por eso el `?estado=OPEN`, para no fotografiar
el primer segundo.
