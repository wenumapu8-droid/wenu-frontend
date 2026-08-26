# KODEX · ESTADO DEL CICLO AUTÓNOMO

Actualizado: 2026-08-26 · por la sesión que montó el ciclo

## DÓNDE ESTAMOS

PROLOGUE es la Golden Scene candidata. Rama `kodex/pass-a-organismos-corredor`
sobre `converge/kodex-todo @ 56bc3576`. Último SHA publicado: `f2602382`.
Preview: https://kodex-preview.wenu-frontend.pages.dev/kodex/folio/i/

## GATES DE PROLOGUE — estado medido

- PASS · organismo vivo · causalidad mouse (luminancia 18.6 → 121 → 143.9) · causalidad touch
- PASS · máquina unificada DORMANT → AWARE → LOCK → TRACK → INSPECT → DESCEND
- PASS · KDX.TYPE con seis tratamientos distintos · micrográficos derivados · data truth (0 falsos)
- PASS · coherencia de botones · copy coherente con el estado · motion de un solo pulso
- PASS · navegación · transición de profundidad · memoria del viaje · reduced-motion
- PASS · fidelidad de croma: panel 04 saturación 0.539 contra 0.548 de la lámina
- **FALTA** · aceptación del creador. NO se replica hasta que él la dé.

## TAREAS PENDIENTES — tomar la primera, una sola por tanda

1. **Densidad del ojo.** La lámina tiene filamentos radiales y espigas que el
   runtime no dibuja: sólo anillos concéntricos. Medido: tinta 14.8% contra
   13.5%, pero la ESTRUCTURA difiere. Añadir los radios sin subir la densidad
   total. Referencia: fileId `1oLNdv2ttClvxsXekrQ7eBqX6bIxkIXyE`, panel 04.

2. **Instrumentación flanqueante.** La lámina muestra AZIMUTH / ELEVATION / ZOOM /
   FOCUS / IRIS / APERTURE a la izquierda del ojo y SIGNAL STR / NOISE / SYNC /
   RESOLUTION / BIT DEPTH / COLOR SPACE a la derecha, **siempre visibles**. El
   runtime las esconde en el inspector. Evaluar sacarlas al campo en desktop
   (donde hay sitio) manteniéndolas tras interacción en móvil.
   Sólo las que deriven de algo real: ZOOM, RESOLUTION y BIT DEPTH probablemente
   sean parámetros canónicos, no telemetría. Clasificarlas antes de mostrarlas.

3. **Audio.** El contrato lo pide opt-in, consciente del estado, y con el mute
   funcionando. Hoy no existe en la escena.

4. **Contratos de las seis restantes.** Preparar Scene Translation Contract de
   DESCENT, ARCHIVE, MACHINE, COSMOLOGY y RETURN contra su referencia de Drive.
   **Esto es sólo documento:** no tocar su código hasta que PROLOGUE sea aceptada.

## BLOQUEOS

- Aceptación del creador sobre PROLOGUE: sin eso no hay replicación.
- Producción: requiere `APROBAR DEPLOY` explícito sobre un SHA exacto.

## LECCIONES QUE NO HAY QUE REAPRENDER

- **Medir el píxel, no el atributo.** Un estado que cambia sin consecuencia
  visible no es causalidad. El ojo pasó dos rondas «probado» mientras su
  luminancia era plana entre estados.
- **Encuadrar la métrica.** Comparar la saturación global de un tablero de once
  paneles contra un organismo sobre negro mide composición, no color: llevó a
  «arreglar» algo que no estaba roto.
- **Buscar antes de construir.** Tres veces se reimplementó algo que ya existía
  en el repo y estaba muerto por una ruta rota: el tríptico móvil, el sistema de
  memoria y el pintor del portal.
- **La boca del descenso se esconde sola** cuando chocaría con texto. No es un
  bug: se le reserva el carril y vuelve.
- **Apagar `.kx-tunnel` o `.kx-crt`** con `opacity:0` / `display:none` /
  `visibility:hidden` **cuelga el hilo principal** (4.8s → +40s). Medido tres veces.
- **Bajar una referencia de Drive:**
  `curl -sL "https://drive.google.com/uc?export=download&id=<fileId>" -o ref.png`
  El mount del iMac expira; el fileId funciona directo y sin auth.
