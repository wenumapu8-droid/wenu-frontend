# KODEX−∞ · estado y traspaso

Última sesión: 2026-07-31. Escrito para que otro modelo retome sin arqueología.

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

- Las animaciones CSS de los folios todavía no toman su ritmo de la receta.
  Las de THRESHOLD sí. Es el mismo patrón, replicado.
- Tres efectos de los packs sin montar: wrinkled reality, ripple floor,
  perspective flip. Están completos, con componente Astro y shader.
- El pack de design system (`tokens/kdx.tokens.css`) sin revisar contra las
  variables que el sitio ya usa.
- El pie de sistema existe en THRESHOLD; en los folios no.
- `kodex-threshold-live.html` — Ocín lo llamó "el mejor logrado" y sigue sin
  poder leerse: está en `~/Downloads` del iMac y macOS no deja entrar ahí por
  SSH. Un `cp` a `~/kodex-ref/` lo desbloquea.

## Reglas que no se negocian

- No desplegar a producción sin la frase exacta `APROBAR DEPLOY`.
- No borrar activos de KODEX.
- El ojo procedural de PROLOGUE se retiró por pedido de Ocín ("horrible, no era
  lo esperado"). La pieza es la obra, no el efecto.
- Dirección visual: OS de archivo alienígena, neo-ancestral cósmico,
  retrofuturista. No es dashboard SaaS, no es cyberpunk genérico, no es galería
  convencional.
