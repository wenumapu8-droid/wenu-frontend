# KODEX−∞ · estado y traspaso

Última sesión: 2026-07-31. Escrito para que otro modelo retome sin arqueología.

> **Empezá por acá:** el estándar de aprobación del proyecto NO está en este
> repo. Está en la bóveda de Obsidian del iMac, en
> `~/Obsidian/WenuAgent/estrategia/kodex-receta-madre-produccion-2026-07-29.md`,
> y dice textualmente *"toda escena KODEX se aprueba contra esto"*. El mapa raíz
> es `~/Obsidian/WenuAgent/00-Index/KODEX-MOC.md`, que abre con la frase que
> ordena todo el proyecto: *"el vault es la versión invisible; KODEX es esa misma
> red renderizada"*.
>
> La bóveda SÍ se puede leer por SSH — `~/Obsidian` no está protegida por TCC
> como Descargas. Leela antes de tocar nada.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Repo real (acá se comitea) | iMac, `~/wenu-frontend` |
| Copia de trabajo | Mac Mini, `~/kodex-work` |
| Packs originales (11 zips, 214 archivos) | `Sinergia-Industrial/assets/kodex/context-library/` |
| Referencia de calidad holográfica | `context-library/videos/instagram-reel-DbZQij2PVPT.mp4` + análisis de Hermes en `external-refs/` |
| Rutas | `/kodex/` (THRESHOLD) y `/kodex/folio/{i..vi}/` |

Al cerrar el proyecto: todo al segundo cerebro, borrar la data del Mac Mini,
dejarla en el iMac. Es el último paso y lo decide Ocín.

## Una gramática, siete productos

La regla más dura del proyecto: **las siete escenas no pueden verse iguales.**
Si tapás el chrome y ponés dos lado a lado tienen que distinguirse al instante
por organismo, tratamiento y color, y reconocerse como el mismo sistema.

| | Organismo | Tratamiento | Acento |
|---|---|---|---|
| 00 THRESHOLD | portal polar sobre la obra, con feedback | pixelado + dither Bayer | rojo · 2° |
| 01 PROLOGUE | la obra como retícula | CRT fósforo + aberración | violeta · 280° |
| 02 DESCENT | corredor partido | CRT descent | naranja · 29° |
| 03 ARCHIVE | ficha de espécimen, **sin campo detrás** | CRT archive | ácido · 73° |
| 04 MACHINE | red de nodos | CRT machine | cyan · 181° |
| 05 COSMOLOGY | mapa orbital | — | magenta · 331° |
| 06 RETURN | mandala restaurado, **sin campo detrás** | CRT return | ácido/blanco · 78° |

Las dos ausencias son decisión: ARCHIVE es un catálogo quieto (la tabla dice
"rígido") y RETURN resuelve limpio. Un campo vivo ahí repetiría el recurso
justo donde la escena pide lo contrario.

RETURN es la única lámina clara — 29% de fondo oscuro contra ~85% del resto — y
está bien: es el momento en que el archivo se resuelve y el codex se pone
blanco. Su preset de audio ya se llamaba "lumen".

**ARCHIVE y RETURN quedan a 3° de matiz.** Hoy no confunden porque están sobre
fondos opuestos. Si alguna cambia de fondo, chocan.

## Un solo estado para todas las capas

`idle → aware → locked → active → transitionOut` en `src/lib/kodex/estado.ts`.

Antes el portal tenía sus fases, el audio su encendido y el campo ninguna:
coincidían por casualidad. Ahora es un valor y las tres capas lo leen. Cuando
la escena se activa, el shader y el sonido se abren porque es **el mismo
número**, no dos animaciones afinadas para parecer simultáneas. Esa es la
diferencia entre una página con efectos y un instrumento.

La máquina sólo avanza: pedir un estado anterior no hace nada.

## Tres perfiles de rendimiento

`src/lib/kodex/perf.ts`. FULL / BALANCED / LOW-POWER, con la regla del canon:
*se reduce complejidad del shader, NUNCA la identidad ni la composición.*

**No se adivina el hardware.** Se adivina una vez para arrancar y después se
mide: mediana del tiempo de cuadro sobre 70 muestras, descartando las primeras
20 porque son el costo de encender, no el de correr. Se fuerza con `?quality=`.

Motivo real: el iMac de Ocín es de 2015 y no aguanta tres capas WebGL.

## Cómo ver qué está pasando

`?debug=1` en cualquier lámina. Muestra receta, grilla, estado, perfil, fps,
capas montadas, bandas de audio y el piso/techo de luminancia de la obra —
que es donde estuvo el fallo más persistente del proyecto.

## Las tres capas de imagen, y por qué son tres

Cada lámina apila tres sistemas distintos. Confundirlos es el error fácil.

**1 · El campo (`KodexField` + `network-vortex.frag`)** — el fondo. Es una red
en espiral logarítmica: brazos que giran, anillos que caen, trazas finas,
nodos que laten, pulsos que viajan por las líneas y polvo granular al fondo.
Se escribió contra el reel que mandó Ocín, porque ningún preset del lab hacía
eso. Las siete láminas corren el MISMO shader; lo que cambia es cómo se
comporta, y eso sale de la receta (ver abajo).

**2 · La etapa de grado** — se le injerta a todo preset al traducirlo a WebGL2.
El preset aporta la estructura; el color lo pone la lámina. Sin esto, cada
preset arrastraba la página a su propia paleta y el KODEX dejaba de ser un
sistema para volverse una galería de fondos ajenos. Acá viven también el piso
de luminancia, la curva de hebra y la siembra de nodos.

**3 · El artefacto (`KodexArtifact` + `artifact.frag.glsl`)** — la obra
tratada: pixelada, dither Bayer, scanlines, glow. Es la pieza; el campo es
atmósfera. La obra manda.

Sobre esas tres van los bloques de densidad (rail, tira de datos, vector de
origen, registro de sistema, pie con barcode/UTC/uptime, cruces de registro) y
el motor ASCII, que sólo aparece en PROLOGUE y MACHINE.

## La gramática decide el comportamiento

`src/lib/kodex/grammar.ts` + los JSON en `grammar/`.

Los packs convirtieron diez referencias en datos y fijaron la regla: *"JSON
decide qué se coloca, cuánto ocupa y cómo se comporta"*. Cada lámina declara
una receta y de ahí salen las duraciones de las animaciones y los parámetros
del campo.

- La densidad de la receta decide dónde cae cada duración dentro del rango de
  su preset: más denso, más lento. Es la versión continua de la regla del
  sistema, "no más de dos movimientos de alta prioridad a la vez".
- `highPriorityCount(escena)` cuenta ese presupuesto. Hoy ninguna se pasa.
- **El color NO sale de los datos, a propósito.** Las recetas dicen
  `palette_mode: original_kodex_palette` y nada más. El acento se elige a mano.

Si cambiás una receta, cambia el ritmo de la lámina entera. Es el lugar
correcto para tocar el comportamiento; el CSS ya no lo es.

## El sonido y la imagen son la misma señal

El KODEX sintetiza su propia música por escena (`src/scripts/kodex-audio.js`):
ambient en el umbral, dark psy en el descenso, techno en la máquina. No hay
archivos ni micrófono.

Un analizador cuelga del **limitador**, que es el último eslabón: mide lo que
sale, no lo que se le pidió al sintetizador. Publica tres bandas en
`window.__kxAudio` — la misma división del espectro de KodeLife, que es contra
lo que estos shaders están escritos. Los graves empujan el brillo de la red,
los agudos encienden los nodos.

**El SIGNAL abre las dos cosas a la vez.** Cada escena suena a través de un
pasabajos y el SIGNAL lo abre: medido en MACHINE, los agudos pasan de 0.014 a
0.082, y por el mismo camino se encienden los nodos de la red. Una palanca,
dos manifestaciones. Esto no se diseñó, estaba en el sistema y faltaba
conectarlo.

Sin sonido hay una envolvente sintética de respaldo. Es respaldo, no
simulación: el campo sigue vivo, pero no se hace pasar por un análisis que no
existe.

## Cosas que fallaban en silencio y ya no

Ninguna tiraba un error. Todas cambiaban el diseño sin avisar.

1. **Ninguna tipografía se cargaba.** `kodex.css` pedía seis familias que el
   proyecto nunca cargó. Todo se dibujaba con las fuentes del sistema, y
   distintas en cada equipo. Ahora se cargan las cinco que el pack prescribe
   por rol, con el prop `kodexFonts`.
2. **La obra era invisible en cinco de las seis láminas.** El recorte por
   luminancia usaba un umbral fijo; `bw-07` promedia 0.04 de luminancia, así
   que lo borraba entero. Ahora piso y techo salen del histograma de cada obra.
3. **En MACHINE el artefacto se dibujaba 500px fuera de pantalla**, con todo su
   estado en `ready`. El canvas generativo heredado se llevaba una fila del
   grid y lo empujaba fuera del recorte.
4. **`u_intensity` no hacía nada en varios presets.** Cada uno lo trataba a su
   manera; uno lo declaraba y no lo usaba. Ahora el brillo se fija en un solo
   lugar.
5. **Estilos de componente ganándole a los de página por especificidad.** Un
   `KodexAscii` posicionado desde afuera quedaba en altura cero y su
   observador nunca lo daba por visible. Por eso el componente tiene un modo
   `bed` propio en vez de depender de una clase externa.

## Cómo verificar sin abrir ventanas

Ocín trabaja desde el iMac y el Mac Mini no debe mostrar ni sonar nada.

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --mute-audio --use-gl=angle --use-angle=swiftshader \
  --enable-unsafe-swiftshader --hide-scrollbars \
  --window-size=1440,900 --virtual-time-budget=10000 \
  --screenshot=salida.png http://localhost:4321/kodex/
```

Renderiza el WebGL completo. Verificar a 1440×900 y no en ventana chica:
varios choques de layout que parecían de diseño eran de ventana baja.

## Lo que queda

- **La obra real.** Los shaders corren con las cuatro imágenes que ya estaban
  en el repo. La fuente primaria es el book de Ocín en Drive (`book/0cin`), y
  las 10 láminas de `book/Kodex` con el copy real deberían bajarse a
  `public/img/kodex/refs/`. Bloqueado: Drive vive en CloudStorage, que SSH no
  puede leer.
- `kodex-threshold-live.html` — Ocín lo llamó "el mejor logrado" y sigue sin
  poder leerse: está en `~/Downloads` del iMac. Mismo bloqueo.
- **Ambos se destraban con un interruptor:** Ajustes del Sistema → Privacidad y
  seguridad → Acceso total al disco → agregar `/usr/libexec/sshd-keygen-wrapper`.
  Es un ajuste de seguridad; lo hace Ocín, no el agente.
- Las animaciones CSS de los folios todavía no toman su ritmo de la receta.
  Las de THRESHOLD sí. Es el mismo patrón, replicado.
- Tres efectos de los packs sin montar: wrinkled reality, ripple floor,
  perspective flip. La tabla los asigna a COSMOLOGY, DESCENT y MACHINE.
- El pie de sistema existe en THRESHOLD; en los folios no.
- El pipeline de 7 pasos (§6) está completo en THRESHOLD; en las demás, parcial.

## Cosas que NO hay que "corregir"

- **Las duraciones de animación.** Se auditaron contra el §9 y salieron 13 de
  15 "fuera de rango": era el clasificador, que metía en la misma bolsa el
  parpadeo de un cursor de terminal (1s, correcto) y la respiración de un héroe
  (12s). Además la gramática fija AMBIENT_BREATH en 14–24s y la receta dice
  "Pulse 3–7s": no se contradicen, hablan de capas distintas.
- **El 29% de fondo oscuro de RETURN.** Es la lámina blanca a propósito.
- **Que ARCHIVE y RETURN no tengan campo vivo.** Es decisión, no olvido.

## Reglas que no se negocian

- No desplegar a producción sin la frase exacta `APROBAR DEPLOY`.
- No borrar activos de KODEX.
- El ojo procedural de PROLOGUE se retiró por pedido de Ocín ("horrible, no era
  lo esperado"). La pieza es la obra, no el efecto.
- Dirección visual: OS de archivo alienígena, neo-ancestral cósmico,
  retrofuturista. No es dashboard SaaS, no es cyberpunk genérico, no es galería
  convencional.
