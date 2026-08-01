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
- [~] **3 · Escenas, una por una** — 00 THRESHOLD ensamblado desde el módulo
      real (`src/kodex/threshold-portal/`, runtime de 3 pases). NO reescribí el
      shader. Capa SVG (marco, regla graduada, barcode) montada en las siete y
      teñida con el acento por `currentColor`. Falta B3 (ver abajo).
- [ ] **4 · ARCHIVE interior** — grid de specimens, dossier, zoom, metadata,
      edition/certificate/trading-card
- [ ] **5 · Acabados** — hover, sellos SVG, mensajes decodables, horas divinas
- [ ] **6 · Validación** — 390/430/768/1440/1920, sin scroll, sin errores,
      FPS móvil ≥45, un canvas, 10 ciclos sin fuga

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

## Registro

- 03:40 — FASE 0 lista y verificada.
- 03:56 — FASE 1 lista y verificada.
- 04:05 — B1/B2 anotados. Sigo con la escena 00 desde el póster, sin parar.
- 04:20 — Escena 00 ensamblada desde el módulo real + capa SVG en las siete.
- 04:27 — **B3 cerrado.** El portal llena el campo. Y apareció un problema de
  composición que el bug tapaba: el portal se comía el titular. La cura NO fue
  bajarle el brillo —eso sería perder la pieza— sino darle suelo al texto: un
  velo direccional, negro pleno en la columna del texto y transparente donde
  vive el portal. Desktop 72% oscuro, móvil 79%, ambos legibles. Verificado a
  1440×900 y 390×844.

## Errores propios de esta noche, para no repetirlos

1. `señal` como identificador GLSL. GLSL es ASCII: con eñe NO COMPILA, el motor
   cae al respaldo y **la escena se ve negra sin una queja en consola**.
2. Comillas invertidas en un comentario dentro de un template literal. Cierran
   la cadena. Me pasó DOS veces — la segunda documentando la primera.
3. Llamar `start()` de un módulo sin su `await load()`. El contrato importa:
   `load()` es quien crea el contexto GL y `start()` se sale solo si no lo
   encuentra, en silencio.
4. Chrome headless escribe la captura AL CARGAR, no después de esperar. Todas
   las capturas muestran ~t=1s. Para fotografiar más tarde hay que usar enlaces
   profundos de estado.
