# Loop de láminas

Un agente avanzando sin parar, con tres cosas que no puede hacer.

## Para qué existe

No para que el agente trabaje sin parar — eso es fácil y ya se probó que sale
caro: la lámina 1 se llevó 3,4 M de tokens y 26 agentes hasta una meseta.
Existe para que un agente que trabaja sin parar **no pueda**:

1. **tocar algo que el banco no mide** — todo ítem declara una `region`, y si esa
   región no existe en `regions/<slug>.json`, el loop no arranca. Los rieles de
   u10 caen en `x 10..17` y `x 1103..1110`, fuera de las cinco cajas: se
   trabajaron igual y movieron el global seis milésimas. Esa regla es para eso;
2. **insistir con lo que no baja el número** — si la región no mejora al menos
   el `umbral` del ítem, `git reset --hard` y al siguiente. Sin preguntar, sin
   segunda oportunidad. Una vuelta que revierte es una vuelta completa;
3. **tocar lo que no le corresponde** — sólo trabaja en ramas `wip/*`, no
   mergea, no despliega, no pushea. La revisión sigue siendo del creador.

## Puesta en marcha

```bash
cp loop.conf.ejemplo loop.conf     # y completá AGENTE_CMD
./loop.sh                          # hasta vaciar la cola
./loop.sh --siempre                # y después espera ítems nuevos
touch PARAR                        # lo corta en la vuelta siguiente
```

`loop.conf`, `PARAR` y `registro/` no se commitean: dependen de la máquina.

## Una vuelta, por dentro

```
compuertas → medir → agente → medir → veredicto → cola + bitácora
```

`vuelta.sh` mide con `iterate.mjs` antes y después, así que el veredicto sale
del mismo banco que usa todo el proyecto. El agente recibe el objetivo del ítem
y el puntaje actual de su región, más la instrucción de leer
`KIMI-BRIEF-LAMINAS.md` antes de tocar nada.

Códigos de salida de `vuelta.sh`:

| | |
|---|---|
| `0` | vuelta completa — mejoró o se revirtió |
| `3` | cuota agotada; `loop.sh` duerme `ESPERA_CUOTA` y reintenta el mismo ítem |
| `4` | cola vacía |
| `5` | compuerta violada — el loop se detiene y espera a una persona |

El 5 no se reintenta nunca. Rama equivocada, árbol sucio o ítem sin región no
se arreglan insistiendo, y reintentar en bucle es exactamente el modo de falla
que este loop existe para evitar.

## El relevo — que lo siga otro agente, u otra máquina

Todo el estado vive en git, no en la cabeza del agente. Por eso el trabajo se
puede soltar y levantar sin coordinación humana:

```bash
scripts/lamina/loop/estado.sh    # lo primero que corre el que llega
```

Contesta las cuatro preguntas del que toma el relevo: qué lámina, cómo va el
puntaje por región, qué está tomado por quién, y cuál es el siguiente.

Cómo funciona el pase de mano:

- Antes de trabajar, `vuelta.sh` hace `pull --rebase`, marca el ítem
  `en_curso` con **quién** y **desde cuándo**, y lo **commitea y pushea**. Otra
  máquina que sincronice ve que está ocupado y no lo toca.
- Al terminar —mejore o no— suelta el ítem con su resultado y vuelve a pushear.
  Desde ahí cualquiera clona, lee `cola.json` y sigue donde quedó.
- **La toma caduca.** Si el agente se cayó, se quedó sin cuota o le mataron el
  proceso, pasadas `LOCK_TTL` (2 h por defecto) el ítem vuelve a estar libre y
  otro lo levanta. Y si se queda sin cuota, lo suelta en el acto en vez de
  esperar a que caduque.

Si la rama no está en `origin`, `estado.sh` lo dice con todas las letras: sin
upstream nadie puede tomar el relevo.

## Dónde seguir, sin que nadie lo escriba

Cuando la cola se vacía, el loop no termina: corre `reponer.sh`, que mira los
`score.json` medidos y encola las peores regiones que siguen por encima de la
meta (3 % por defecto). **Termina la lámina en curso antes de cruzar a la
siguiente** — acabar una vale más que empezar tres.

```bash
scripts/lamina/loop/reponer.sh --meta 3.0 --max 3
```

Dos cosas que no puede hacer, y son las que lo vuelven confiable: sólo propone
regiones que existen en `regions/<slug>.json` —la regla dura vale igual para lo
automático que para lo escrito a mano—, y descarta por lámina+región y no por
nombre, así que no manda a nadie dos veces al mismo lugar.

Los ítems traen su propio `slug`, de modo que la cola puede mezclar láminas. Sin
tocar nada, el orden natural que sale de los puntajes de hoy es terminar u10 y
después ir a `t01-03-descent-tunnel` (13,3 %), `u04-alphabet` (12,9 %) y
`u01-origin-field` (10,2 %).

## La cola

`cola.json`. Un ítem sin `region` se puede dejar anotado con `"estado":
"descartado"` y su `motivo` — sirve de registro de por qué algo no se hizo, que
es tan útil como el trabajo hecho. Ver el ítem `u10-rieles-punteos`.

Antes de agregar un ítem, la pregunta es una sola: **¿qué región medida cubre
esto?** Si no hay respuesta, no es un ítem del loop.

## La cuota, de día y de noche

Cuando el agente se queda sin cuota, `vuelta.sh` sale con 3, revierte lo que
haya quedado a medias y `loop.sh` **sondea cada 30 minutos** hasta que vuelva,
reintentando el mismo ítem.

No duerme la ventana entera a propósito. La ventana es de unas 5 h pero corre
**desde el primer uso, no desde una hora fija**: si la cuota se repone a los
veinte minutos, un `sleep 5h` pierde cuatro horas y media de producción. Con
sondeos de media hora retoma dentro de los 30 min de que vuelva, a las 4 de la
mañana igual que a las 4 de la tarde.

A las 12 h de sondeos sin éxito se detiene. A esa altura ya no es la ventana.

Para que sobreviva a un reinicio y corra sin nadie mirando, está
`ai.kodex.loop-laminas.plist.ejemplo`. **No es un cron que lo dispara cada
tanto** — el loop ya sabe esperar solo; launchd sólo se ocupa de que el proceso
siga vivo. Y relanza únicamente en salida fallida: un `PARAR`, una compuerta o
las 12 h sin cuota son decisiones, no accidentes.

## Publicación continua — preview sí, producción no

Con `PUBLICAR_PREVIEW=1`, después de cada vuelta que dejó un commit nuevo el
loop corre `deploy-kodex-preview.sh`, que publica al alias `kodex-preview` del
proyecto de Pages y **nunca toca producción** (lo dice en su primera línea).
Si la publicación falla, se anota y el loop sigue: el trabajo ya está
commiteado y la vuelta siguiente reintenta.

Producción no va acá, y no es una omisión. La regla del creador es permanente:
**sin deploy a producción sin la frase literal `APROBAR DEPLOY`, y sólo por
`redesign-v2`, nunca por `main`.** Un loop que publicara solo a producción
convertiría cada vuelta sin revisar en algo que ve el público, y la revisión es
exactamente la compuerta que él se reservó. El loop produce sin parar; publicar
lo revisado sigue siendo un acto humano.

## Dónde corre

Donde esté el agente. El repo entero viaja por git —las referencias PNG y los
scripts de medición están trackeados—, así que no hace falta editar por `ssh`:
se clona, se trabaja local y se pushea la rama `wip/`.

Si va por `launchd` o `cron`, va con el suyo propio. **No** en el crontab de
Sinergia-Industrial: eso es Galvazinc y KODEX no se mezcla ahí.
