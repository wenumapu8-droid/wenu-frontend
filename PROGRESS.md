# KODEX−∞ · PROGRESS

Autopilot del Mac Mini. Se marca sólo lo **verificado en vivo con captura**.
Un ítem que compila y no se ve NO está hecho.

## Backlog

- [x] **1 · Fundación** — tokens (paleta canónica, mono, grilla 8px),
      KDX CORE (WebGL2 multipass + feedback ping-pong + uniforms globales),
      máquina DORMANT→AWARE→ACTIVE→OPEN, KDX FX SUITE (8 pases con params del
      spec). Verificado en `/kodex/lab/core/`.
- [x] **2 · Shell del viaje** — 7 escenas fullscreen horizontales, sin scroll,
      una acción por escena, chrome persistente, loop ∞, responsive 1440/390.
      Verificado en `/kodex/viaje/`.
- [~] **3 · Escenas, una por una** — LAS SIETE tienen organismo y se ven.
      00 THRESHOLD (módulo real), 01 PROLOGUE (ojo), 03 ARCHIVE (specimens),
      04 MACHINE, 05 COSMOLOGY, 06 RETURN (los tres desde el lab).
      02 DESCENT con respaldo visible (B4). Falta coherencia de color (B5).
      00 ensamblado desde el módulo
      real (`src/kodex/threshold-portal/`, runtime de 3 pases). NO reescribí el
      shader. Capa SVG (marco, regla graduada, barcode) montada en las siete y
      teñida con el acento por `currentColor`. Falta B3 (ver abajo).
- [ ] **4 · ARCHIVE interior** — grid de specimens, dossier, zoom, metadata,
      edition/certificate/trading-card
- [~] **5 · Acabados** — sello SVG (árbol + ∞) en el chrome, reloj vivo con
      horas espejo (11:11, 4:44…), micro-interacción en la acción. Falta:
      mensajes decodables, hover sobre specimens ampliado.
- [~] **6 · Validación** — los cinco anchos verificados con captura y sin
      errores de consola. Falta medir FPS en móvil real y los 10 ciclos de
      fuga, que necesitan un dispositivo o instrumentación de memoria.

## BLOCKERS

### B1 · No puedo bajar el repo de GitHub desde el mini  ⛔ ABIERTO
`wenumapu8-droid/wenu-frontend` es privado.

Diagnóstico fino: **el mini SÍ tiene una llave SSH que GitHub acepta**, pero es
una *deploy key* de OTRO repo — autentica como `cobranzas-rgb/sinergia-industrial`.
Las deploy keys son por repositorio, así que no alcanza `wenu-frontend`.
Por HTTPS pide usuario y `gh auth status` dice "not logged into any GitHub hosts".
No debo tipear credenciales en ningún caso.

**El arreglo más limpio, sin que yo toque nada secreto:** agregar la clave
PÚBLICA del mini como deploy key (con permiso de escritura) en
`wenumapu8-droid/wenu-frontend` → Settings → Deploy keys → Add deploy key.
La clave pública no es un secreto y está en `~/.ssh/sinergia_github.pub`.

Con eso hago:

    git remote add origin git@github.com:wenumapu8-droid/wenu-frontend.git
    git fetch origin feature/kodex-depth-engine

y tengo el THRESHOLD aprobado, los módulos y la obra. **Después swapeo** los
equivalentes por el código real.

**Consecuencia:** no tengo el THRESHOLD aprobado, ni los módulos reales de
kodex-source, ni la obra que opencode subió. Estoy construyendo contra el
póster y las specs, que es lo que el encargo autoriza explícitamente ("si no
los tenés aún, construí equivalentes WebGL con estas specs y después se
swapean").

**Lo desbloquea Ocín en un minuto**, en la terminal del mini:

    ! gh auth login

(el prefijo `!` lo ejecuta en esta sesión). Después yo hago el clone y
**swapeo** los equivalentes por los módulos reales.

Alternativa sin interacción: dejar un token en `GH_TOKEN`, o hacer el repo
público, o AirDropear los zips.

### B2 · Los módulos de kodex-source no están en el mini  ⛔ ABIERTO
Buscados por nombre de carpeta y como .zip: open-visual-lab, spatial-engine,
observe-prototype, visual-grammar, crt-master-kit. Cero coincidencias.
Se resuelve con B1 o por AirDrop.

### B3 · El portal dibujaba en una caja de 300×150  ✅ CERRADO
El runtime mide el lienzo dentro de `load()`, que corre antes de que el
navegador aplique el `width:100%` del CSS: se queda con el tamaño por defecto
del canvas y pinta el portal en una cajita de la esquina superior izquierda.

**Causa real, leída del runtime y no supuesta:** `_resize()` usa
`canvas.clientWidth`. El canvas lo crea JS, los estilos de Astro van scopeados
con un `data-astro-cid-…` que el elemento nuevo NO lleva, así que la regla
`width:100%` nunca lo alcanzaba y `clientWidth` devolvía los 300 por defecto.
Probé `:global()` y tampoco alcanzó.

**Cura:** el lienzo se dimensiona explícitamente antes de entregárselo a
ningún runtime — estilo en línea + `width`/`height` a mano, con el DPR del spec
(móvil 1, desktop 1.5). Así el runtime recibe un lienzo correcto pase lo que
pase con la cascada.

Es la **quinta vez** que en este proyecto un elemento montado y sin errores no
se ve por un problema de medida. Queda como regla: *ningún runtime recibe un
lienzo sin medir.*

Lo que SÍ quedó verificado de la escena 00: el módulo real monta, inicializa GL
y dibuja (antes no dibujaba nada porque yo llamaba `start()` sin el `await
load()` que el contrato pide, y porque su obra por defecto —`bw-06-alpha.png`—
no existe en este repo).

### B4 · `split-corridor` entrega casi nada de luz  ⛔ ABIERTO
Ya NO es un problema de montaje: hizo falta traducir su `#version 330 core` a
`#version 300 es` (el motor ahora lo hace para cualquier shader del lab), y con
eso compila y corre — la medición se movió de 10.58 a 10.78. Pero el corredor
entrega tan poca luz que la escena se lee negra (98.3% oscuro).

Su salida está multiplicada por `awareness = smoothstep(0,1,u_state)` y por
`openState = smoothstep(1,2,u_state) * u_progress`. Con el motor en ACTIVE eso
debería abrir. Falta leer el raymarcher entero y ver dónde se pierde la luz —
es calibración de shader y merece tiempo propio, no un número al azar.

**Mientras tanto DESCENT usa el organismo de gesto**, que sí se ve. Una escena
negra es peor que un placeholder honesto.

### Escena 03 · ARCHIVE ✅
Doce specimens del manifiesto REAL dentro de la escena. ARCHIVE es la única que
muestra contenido y no sólo una acción, porque el archivo ES su contenido.

**La obra va LIMPIA**: sin dither, sin filtro, sin tratamiento. Verificado en el
CSS compilado — cero reglas de `filter` sobre esas imágenes. El tratamiento
existe en el sistema, pero se pide; no se impone.

Cada pieza conserva SU proporción. Hay verticales 9:16 y apaisadas √2 en el
archivo y meterlas en una caja cuadrada las deformaría: el alto manda y el ancho
lo pone la obra.

Muestra DISTRIBUIDA, no las primeras doce: las primeras entradas de un
manifiesto suelen ser de la misma serie, y una grilla con doce variaciones de lo
mismo miente sobre lo que hay adentro.

### B5 · Los organismos del lab traen su propia paleta  ⛔ ABIERTO
04/05/06 ya montan y se leen (MACHINE como dispositivo, COSMOLOGY como mapa
orbital, RETURN como suelo ondulante), pero **el color no coincide con el
acento de su escena**: `archive-orbit` pinta rojo donde COSMOLOGY es magenta
`#FF20CC`, y `ripple-floor` pinta cyan donde RETURN es blanco/verde.

El chrome, el índice y la capa SVG SÍ llevan el acento correcto — la
incoherencia es sólo del organismo.

**Anexo medido, con dos intentos fallidos y lo que enseñaron:**

RETURN sale al ~67% de fondo oscuro, por debajo del canon (~85%).

1. Bajé `u_intensity` de 1.5 a 0.62 → la medición se movió de 49.51 a 47.3.
   Leí el shader: **`u_intensity` está DECLARADO y jamás usado en
   `ripple-floor`**. Por eso no hacía nada.
2. Encadené BITMAP THRESHOLD con `CRUSH` alto, esperando que aplastara las
   sombras → 67.5%, sin cambio. Con la posterización desactivada y su término
   de borde, **ese pase ACLARA en vez de oscurecer**.

**La lección, y es sobre mi método:** encadené a ciegas dos veces teniendo un
banco de pruebas hecho para esto. `/kodex/lab/core/?fx=<id>` mide un pase
aislado sobre un organismo legible. Antes de meter un tratamiento en una escena
hay que medirlo ahí.

Queda revertido a la cadena que se ve bien. **No es una escena rota**: RETURN se
lee correctamente y es, además, la escena del regreso a la luz — que sea la más
clara de las siete puede ser lo correcto. Lo dejo medido y anotado para que Ocín
o Cowork decidan, en vez de forzarlo.

El runtime anterior resolvía esto con una etapa GRADE que teñía la salida con
`u_kdxTint`. El motor nuevo no la tiene, y agregarla a ciegas sería reescribir
la paleta de shaders que ya funcionan. Hay que ver, uno por uno, si aceptan un
uniform de tinte; si no, la salida es un pase de tinte en la cadena — pero eso
NO está entre los ocho tratamientos del plano, así que no lo invento sin
consultar.

### Tabla de tratamientos medida ✅
`docs/KDX-FX-MEDICIONES.md` — los ocho pases medidos en el banco, con su
dirección (aclara/oscurece) y magnitud. Hallazgo que explica dos fracasos
míos: **BITMAP THRESHOLD es el que MÁS ACLARA** (+81.6 %), pese a que su
parámetro se llama `CRUSH`. Los oscurecedores reales son THERMAL MAP (−25 %) y
DITHER MATRIX (−23 %).

Y su propio límite, encontrado al aplicarla: la tabla vale para el organismo del
banco. Sobre `ripple-floor` el dither no movió nada, porque la luz de RETURN no
está en medios tonos. Sirve para saber la DIRECCIÓN de cada pase, no como
predicción exacta.

### Acabados · primera tanda ✅
- **Sello SVG** (árbol + ∞) en el chrome. Es el mismo que recurre en THRESHOLD,
  SIGNAL BLOOM y en la frente del espécimen: la marca del archivo, no un logo
  repetido. En SVG para que tome el acento de la escena y quede nítido.
- **Reloj vivo con horas espejo.** Se marcan 11:11, 4:44 y compañía porque son
  una convención contemporánea que el archivo reconoce. Lo que se dibuja es un
  HECHO sobre el reloj —"hora espejo"— y nada más: el sistema celebra la
  coincidencia, **no le atribuye poder**. Afirmar lo segundo sería un claim.
  En la hora espejo el sello toma el acento: el archivo se abre.
- **Micro-interacción de la acción:** la flecha avanza 4px al pasar. Un solo
  movimiento y corto — la acción se siente como una puerta que ya está
  cediendo, no como un botón que se anima. Apagada con reduced-motion.

### Validación · los cinco anchos ✅
Medido en `/kodex/viaje/#archive`, captura por ancho:

| viewport   | luz media | fondo oscuro |
|------------|-----------|--------------|
| 390 × 844  | 30.9      | 89.0 %       |
| 430 × 932  | 32.6      | 88.1 %       |
| 768 × 1024 | 25.5      | 90.3 %       |
| 1440 × 900 | 18.0      | 94.4 %       |
| 1920 × 1080| 16.3      | 95.3 %       |

**Ninguno baja del 88 %**, sobre el canon (~85 %). Sin errores de consola en
ninguno. Sin scroll de página: `.vj` es `position: fixed; inset: 0;
overflow: hidden`, así que la regla se cumple por construcción y no por ajuste.

Lo que se ve en cada uno: en 430 el índice colapsa a puntos y los specimens
envuelven; en 768 el índice muestra los nombres completos; en 1920 la lámina
respira sin que nada quede huérfano.

**Falta** de este punto: FPS en un teléfono real y los 10 ciclos sin fuga de
memoria. No los puedo medir con captura headless — necesitan dispositivo o
instrumentación de memoria. Anotado, no disimulado.

## Registro

- 03:40 — FASE 0 lista y verificada.
- 03:56 — FASE 1 lista y verificada.
- 04:05 — B1/B2 anotados. Sigo con la escena 00 desde el póster, sin parar.
- 04:20 — Escena 00 ensamblada desde el módulo real + capa SVG en las siete.
- 08:20 — **Validación de los cinco anchos.** Todos ≥88% oscuro, cero errores.
- 07:50 — **Acabados, primera tanda**: sello, reloj con horas espejo, micro.
- 07:22 — **Tabla de tratamientos medida** (`docs/KDX-FX-MEDICIONES.md`).
  Tercer intento en RETURN: tampoco. Paré de ajustar ese número — la escena se
  lee bien y el desvío está documentado.
- 06:20 — **Escenas 04, 05 y 06 montadas desde el lab y verificadas.** Las
  siete del viaje tienen organismo. B5 abierto (coherencia de color).
- 05:50 — **Escena 03 ARCHIVE verificada.** 94.4% oscuro, 12 specimens reales
  y limpios, responsive.
- 05:25 — Motor: capa de compatibilidad con el contrato viejo (`u_resolution`,
  `u_audioLow`, `u_state`…) y **traducción `#version 330 core` → `300 es`**,
  para poder hospedar los shaders del lab sin reescribirlos. B4 abierto.
- 04:57 — **Escena 01 PROLOGUE verificada.** 91.5% oscuro, el ojo lee y el
  titular también. Extensión `uniformes` en el motor. B1 sigue bloqueado.
- 04:27 — **B3 cerrado.** El portal llena el campo. Y apareció un problema de
  composición que el bug tapaba: el portal se comía el titular. La cura NO fue
  bajarle el brillo —eso sería perder la pieza— sino darle suelo al texto: un
  velo direccional, negro pleno en la columna del texto y transparente donde
  vive el portal. Desktop 72% oscuro, móvil 79%, ambos legibles. Verificado a
  1440×900 y 390×844.

### Escena 01 · PROLOGUE ✅
El ojo, ensamblado desde `shaders/capitulo/observation-eye.frag` — el mismo
shader del capítulo, sin reescribir. Sus parámetros propios (paleta exacta,
parpadeo por reloj a intervalos irregulares) entran por la extensión
`uniformes` que le agregué al motor: una función evaluada cada cuadro, porque
algunos valores dependen del reloj.

Tratamiento DITHER MATRIX al 34%: le da materia de archivo sin tapar la fibra
del iris, que es lo que hay que ver.

**Una lección de interfaz.** El motor entrega `u_estado` 0–3
(DORMANT→AWARE→ACTIVE→OPEN); ese shader venía de un capítulo donde 0–2 era
LOCK→TRACK→IDLE. Montado tal cual, el ojo se leía a sí mismo como IDLE y se
atenuaba al 42%. Se traduce en el hospedador y NO se toca el shader: el
organismo es código que ya funciona, y quien se adapta es quien lo aloja.

## Errores propios de esta noche, para no repetirlos

1. `señal` como identificador GLSL. GLSL es ASCII: con eñe NO COMPILA, el motor
   cae al respaldo y **la escena se ve negra sin una queja en consola**.
2. Comillas invertidas en un comentario dentro de un template literal. Cierran
   la cadena. Me pasó DOS veces — la segunda documentando la primera.
3. Llamar `start()` de un módulo sin su `await load()`. El contrato importa:
   `load()` es quien crea el contexto GL y `start()` se sale solo si no lo
   encuentra, en silencio.
4. **Arreglar una cosa rompió otra.** Para que el portal midiera bien empecé a
   dimensionar el lienzo antes de entregarlo — y eso rompió el motor, porque su
   `medir()` salía temprano cuando el tamaño "no había cambiado" y así nunca
   creaba los framebuffers. Escena negra, sin error. Un chequeo de salida
   temprana tiene que mirar TODO lo que la función produce, no sólo su entrada.
5. **Dos mediciones idénticas al decimal después de un cambio que debía
   moverlas = el cambio no se está ejecutando.** Me pasó con el corredor: yo
   ajustaba uniforms de un programa que nunca había compilado. Cuando el
   número no se mueve, el problema está antes de donde estás mirando.
6. Chrome headless escribe la captura AL CARGAR, no después de esperar. Todas
   las capturas muestran ~t=1s. Para fotografiar más tarde hay que usar enlaces
   profundos de estado.
