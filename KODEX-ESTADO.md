# KODEX · estado y relevo

Escrito para que la próxima sesión —o el cron— retome sin volver a descubrir
nada. Si sólo vas a leer una cosa, leé «Cómo producir una lámina».

Última actualización: 2026-08-10.

## Dónde está todo

| | |
|---|---|
| repo del sitio | `~/kodex-work` (es `wenu-frontend`; KODEX vive dentro) |
| repo de canon | `~/kodex-minus-infinity`, rama `feat/visual-library-calibrated-v1` |
| referencias | `~/kodex-work/reference/canon/` — 17 únicas, con `MANIFEST.json` |
| banco de pruebas | `~/kodex-work/scripts/lamina/` |
| kit de primitivas | `~/kodex-work/src/components/kodex/lamina/kit/` — **leé su README** |
| descarga de Drive | `~/Trabajos-Aparte/KODEX/drive-pull/` — 335 imágenes inventariadas |

## Hecho

| lámina | combinado | píxel | estructural |
|---|---|---|---|
| `t01-04-archive-tree` | **3,10 %** | 4,79 | 1,40 |
| `t01-01-threshold-portal` | 3,72 % | 6,29 | 1,16 |
| `t01-08-signal-bloom` | 5,06 % | 8,45 | 1,66 |
| `t01-03-descent-tunnel` | 5,61 % | 9,60 | 1,62 |
| `t01-02-observation-eye` | 5,82 % | 9,78 | 1,86 |

Más `/kodex/lamina/` (índice) y `/kodex/m/descent` — **la primera página real**:
móvil, viva, con máquina de estados, arrastre y telemetría que sale del motor.

Faltan doce: los organismos 05 SPECIMEN SKULL, 06 RITUAL DEVICE y 07 COSMOLOGY
CORE, los ocho tratamientos de TANDA 02 y el pliego maestro.

## Cómo producir una lámina

```bash
# 1 · medir la retícula (semiautomático: mirá la salida y decidí los cortes)
node scripts/lamina/bandas.mjs <slug>

# 2 · andamiar con los dos cortes verticales de la banda central
node scripts/lamina/andamiar.mjs <slug> <col1> <col2>

# 3 · repartir 4 bloques a 4 agentes (izquierda / centro / derecha / bandas)
#     — el prompt completo está en los scripts de workflow ya usados

# 4 · medir
node scripts/lamina/iterate.mjs <slug>
```

Y para que un agente se puntúe solo mientras trabaja, en 2,7 s:

```bash
node scripts/lamina/score-panel.mjs <slug> <Bloque> --triptico
```

## Lo que costó descubrir y no hay que volver a pagar

**Las cajas se miden, no se estiman.** Las estimé a ojo en la lámina 1 y quemaron
dos vueltas enteras: los agentes comprimieron tipografía para que su contenido
entrara, y eso le puso techo a la lámina completa.

**La retícula no es la misma a toda la altura.** En DESCENT TUNNEL la banda
inferior se parte en 415/429 y 1173, distinto de la principal. Medí por bandas.

**La obra fabrica reglas falsas.** En SIGNAL BLOOM el detector marcó una columna
maestra en x=835 que no era un marco: era el eje de simetría de la floración.
Medí donde hay chrome, no donde hay organismo.

**Cada lámina tiene su propio umbral de tinta.** Los marcos de DESCENT TUNNEL son
naranja brillante (>26); los de SIGNAL BLOOM, magenta tenue con pico 23-28. Con
un umbral fijo, la segunda sale entera sin paneles.

**El arte fija se traza, no se dibuja.** `glyphs.mjs` hizo siete glifos en 90
segundos con 6,01 % de diferencia; un agente gastó ~100 k tokens dibujándolos a
ojo y quedaron peor. Excepción: los **códigos de barras se leen columna por
columna**, no con vtracer — el contorno les inventa esquinas y pierde 38 % de la
tinta. Y el trazo binario necesita 1 px de desenfoque.

**La métrica tuvo un sesgo grave, ya corregido.** El diff píxel a píxel solo
premiaba dejar el panel vacío: con densidad p < 0,5 el óptimo de `p + q − 2pq`
está en `q = 0`. Medido: un panel vacío daba 10,04 % y con textura correcta
11,98 %. Ahora el puntaje promedia el diff de píxel con un **diff estructural**
por bloques de 8×8 sobre la luminancia media. **No bajes brillo ni apagues
organismos para ganarle al número.**

**Reproducir un póster y hacer algo vivo son objetivos opuestos.** El banco mide
parecido a una imagen quieta, así que cada punto de fidelidad empuja hacia el
afiche. Las láminas son documentación; el producto son las páginas.

**El andamiaje de bloques gruesos deja fronteras ambiguas.** En OBSERVATION EYE
el corte quedó en x=1180 pero el marco real de los paneles 05 y 06 empieza en
x=1122: dos agentes dibujaron los mismos 58 px porque ninguno podía alcanzarlos
sin salirse. No hizo daño —los rellenos son opacos— pero hay dos verdades sobre
el mismo píxel. Conviene que el corte caiga en un marco real, no en un número
redondo.

**Chromium redondea `feGaussianBlur` a cajas de ancho `floor(sigma·1,88+0,5)`,**
así que todo sigma bajo 0,8 no hace nada y 0,9 y 1,3 dan capturas idénticas.
Barrer valores intermedios es tiempo tirado. Y en 10 de 12 piezas trazadas el
banco puntúa mejor SIN desenfoque, porque el trazo ya trae el halo del antialias
binarizado adentro.

**EL BANCO NO DISTINGUE REPRODUCIR DE VECTORIZAR, Y ESA ES LA DECISIÓN
PENDIENTE MÁS IMPORTANTE.** Los agentes de COSMOLOGY CORE llegaron a 0,19 % y
0,23 % —los mejores puntajes del proyecto— trazando la referencia entera con
vtracer en vez de construirla. Medido: esa lámina pesa 9,3 MB con 67.483 paths y
**cero canvas**; DESCENT TUNNEL, que sí es procedural, pesa 308 KB con 303 paths
y puntúa 5,61 %. El banco premia con 30× menos error a la versión 30× más pesada
— y que **no puede estar viva**: sin canvas no hay organismo, ni máquina de
estados, ni respuesta al puntero.

Los dos agentes lo avisaron solos, sin que nadie preguntara. Uno dejó sin aplicar
un ajuste que bajaba a 0,07 % con píxel exactamente 0, porque lo que agregaba
eran manchas de medio píxel —el antialias del PNG— y ahí, dice, «deja de trazarse
el dibujo y se codifica la trama».

Mientras esto no se resuelva, **el puntaje solo es comparable entre láminas del
mismo método**. Lo mínimo sería fijar en el contrato que el HÉROE va procedural
sí o sí y que el trazado es para el chrome; o agregarle al banco un término de
peso/complejidad, para que codificar la trama deje de ganar.

**Antes de construir algo, buscá si ya existe.** Reconstruí `Micrografia` desde
cero cuando `kodex_micrographics_kit` ya estaba instalado y en uso en tres
páginas. Y tracé sellos con vtracer teniendo `KODEX_Master_Seal_high_fidelity.svg`
en Drive.

## Costos medidos

| | agentes | tokens |
|---|---|---|
| lámina 1 (sin método) | 13 + 13 | 3,4 M |
| lámina 2 (método v2) | 4 | 1,10 M |

15 láminas ≈ 16 M — viable. Las ~199 del Drive ≈ 220 M — **no** sin un
generador. Para eso está el sistema de recetas del Atlas.

## Prohibiciones permanentes

- **Sin deploy** sin la frase literal `APROBAR DEPLOY`, y sólo `redesign-v2`.
- **Sin mergear PRs.** La revisión es la compuerta y la tiene el creador.
- **Nada** bajo `~/.hermes/` ni `~/Sinergia-Industrial/` — es Galvazinc.
- **Sin inventar canon**: ni coordenadas A–Y, ni significados de B–L o N–X, ni
  presentar valores generados como mediciones.

## Abierto, para el creador

1. **La taxonomía.** 8 organismos vs 7 escenas del viaje. Los diseños de página
   de Drive traen una tercera: `00 THRESHOLD · 01 AWAKENING · 02 DESCENT ·
   03 RESONANCE · 04 HEART CHAMBER · 05 INTEGRATION · 06 TRANSCENDENCE`.
2. **La paleta.** Tres sistemas en paralelo; el análisis está en
   `packages/visual-library/docs/PALETTE-RECONCILIATION.md`. No la elegí yo.
3. **Faltan 4 láminas.** Los pósters de TANDA 02 declaran «OF 12» y hay 8.
4. **Dos piezas necesitan revisión cultural**: un `kisspng` de Kali (stock de
   terceros y tradición religiosa viva) y `Wenu_Mapu_2020.mp4` (registro mapuche
   dentro de carpeta KODEX).
