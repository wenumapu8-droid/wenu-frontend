# Motion graphics por código

Motion para redes sin IA generativa: cada frame es una función pura de `t`,
renderizada en Canvas por Chromium headless y encodeada con ffmpeg.

Por qué así y no con un generador de video:

- **Determinista.** Mismo input, mismo output, siempre. Reproducible y versionable.
- **Nítido.** Vectores y tipografía real a 1080px, sin artefactos de difusión.
- **En marca.** Usa los tokens de `src/styles/tokens.css` y las fuentes de `@fontsource`,
  las mismas que el sitio. No "se parece" a la marca: es la marca.
- **Gratis.** Sin créditos, sin API. ~70s de render por pieza de 6s en esta máquina.

## Uso

```bash
node scripts/motion/render.mjs tune-in --mblur 20       # entrega: MP4 1080×1920 @30fps
node scripts/motion/render.mjs tune-in                  # iteración: sin blur, más rápido
node scripts/motion/render.mjs tune-in --format square  # 1080×1080
node scripts/motion/render.mjs tune-in --fps 60 --dur 8
node scripts/motion/render.mjs tune-in --still 3.1      # un PNG en t=3.1s
```

## Motion blur

`--mblur N` renderiza N sub-frames dentro del obturador de cada frame y los
promedia. **Entregá siempre con blur.** Es lo que separa un desplazamiento
rápido que lee como "pro" de uno que lee como plantilla: el ojo espera
arrastre, y texto veloz perfectamente nítido lo delata.

Barato: el costo por frame lo domina el encode del PNG, no el pintado.
Medido en esta máquina, `--mblur 20` cuesta 2.4× lo que cuesta `--mblur 1`,
no 20×. Una pieza de 7s con blur completo son ~2 minutos.

Lo que hay que vigilar es **el bandeo**. Si un elemento se mueve demasiado
rápido, N muestras dejan N fantasmas discretos en vez de un arrastre continuo,
y eso lee peor que no tener blur. Dos perillas: subir `--mblur`, o bajar la
velocidad pico de la escena. Regla práctica: el desplazamiento por obturador
dividido por N tiene que quedar por debajo del grosor del trazo tipográfico.
En `word-scroll` eso fijó la distancia de giro en 21 filas, no más.

Salida en `dist-motion/` (ignorado por git — son artefactos, se regeneran).

Formatos: `reel` 1080×1920 (default, IG Reels/TikTok/Shorts) · `square` 1080×1080 ·
`post` 1080×1350 · `wide` 1920×1080.

Iterá siempre con `--still` antes de encodear: un PNG tarda 2s, el video 70s.

## Escribir una escena

Una escena es un HTML en `scripts/motion/scenes/<nombre>.html` que importa
`scene-kit.js` (paleta, easings, grano, tipografía, motion blur) y llama a
`mountScene`:

```js
import { mountScene, waitForFonts, span, EMBER } from '../scene-kit.js';

await waitForFonts(['600 94px "Instrument Sans"']);
mountScene({
  width: 1080, height: 1920, duration: 7, fps: 30,
  draw(ctx, t) { /* dibujar el frame del segundo t, en coordenadas de diseño */ },
});
```

`mountScene` se encarga del escalado, del motion blur y del grano. La escena
solo dibuja.

Reglas que no son opcionales:

1. **Nada de `requestAnimationFrame` ni animaciones CSS.** El renderer llama
   `renderFrame(t)` y screenshotea; cualquier cosa atada al reloj real sale mal.
2. **Nada de `Math.random()` sin seed.** Usá un PRNG determinista (ver `mulberry32`),
   o el grano titila distinto en cada render.
3. **`ctx.globalAlpha` no es multiplicativo.** Asignarlo dentro de un `save()`
   *reemplaza* el alpha del contexto padre, no lo compone. Si una función de dibujo
   tiene que respetar un fade exterior, pasale el multiplicador como parámetro.
4. **Canvas ignora un color inválido en silencio.** Si asignás un
   `strokeStyle`/`fillStyle` mal formado, no hay error: se conserva el valor
   anterior y el trazo sale negro o no sale. Un helper de color tiene que ser
   componible (operar y devolver tripletas, no strings `rgb()` que al anidarse
   se reparsean como hex y dan `NaN`).
5. **Esperá las fuentes.** Exponé `window.renderFrame` recién después de
   `document.fonts.ready`, o los primeros frames salen con fuente de fallback.

## Escenas

| Escena | Duración | Qué es |
|---|---|---|
| `tune-in` | 6s | Constelación + rombo escalonado (ñimin) + manifiesto "Geometry borrowed from the sky" → remate "TUNE IN". |
| `word-scroll` | 7s | Rueda de selección: el glosario mapudungun pasa, desacelera largo y bloquea en NEWEN → "Forged with newen." Depende del motion blur. |

| `body-scan` | 8s | Escaneo biométrico sobre una **foto propia del catálogo**. Costillas de scanline desplazadas por luminancia + telemetría lateral + haz de ámbar. Cero generación por IA. |
| `kdx-film-001` | 15s | **Piloto canónico.** SIGNAL / THRESHOLD, al contrato de plano de la biblia §11. Interferencia de dos fuentes, iris de observador, push-through. |
| `kodex-orbit` | 10s | Esfera armilar: anillos metálicos precesando en planos distintos, cuentas viajando, eje de luz. 3D por software con oclusión real. |
| `kodex-artifact` | 8s | **Un teseracto.** Objeto de 4 dimensiones proyectado dos veces (4D→3D→2D): no puede existir acá, solo su sombra. DORMANT → AWARE → OPEN. |
| `kodex-wrinkled` | 7s | **KODEX**, no Wenu Mapu. Membrana domain-warp que despierta y se desgarra: DORMANT → AWARE → OPEN, los tres estados que declara `public/kodex-wrinkled/preset.json`. |

### La biblia de producción manda

`46_KODEX_AI_VIDEO_FACTORY` (Drive) es canon y define el sistema. Lo que hay
que respetar al escribir una escena de Kodex:

- **§17, CANONICAL:** el flujo central *no debe depender de Higgsfield*.
  Motion por código, render por frames en navegador, composición con FFmpeg.
  Este pipeline no es una alternativa: es la arquitectura declarada.
- **§5 gramática de cámara.** Permitido: dolly lento, deriva orbital,
  macro-a-micro, push-through aperture, paralaje contenido, encuadre fijo.
  Prohibido: cámara en mano, swoops genéricos, drone, speed ramps, zoom
  perpetuo. `applyCamera()` en scene-kit existe para esto.
- **§6 gramática temporal.** MICRO 80-300 ms · SHORT 0.3-1.5 s ·
  MEDIUM 1.5-5 s · AMBIENT 5-30 s. *"Nothing moves merely because AI can
  make it move."*
- **§8 tipografía.** El texto, los IDs y la telemetría se componen DESPUÉS,
  fuera de la cámara. "AI generates the phenomenon. KODEX supplies the system."
- **§14 anti-patrones.** Prohibidos: glitch constante, HUD sobrecargados,
  **mediciones falsas**, geometría sagrada al azar, un solo renderer aplicado
  a todo el universo.
- **§13 QA.** Debe ser reconociblemente KODEX *sin depender del logo*.

`kdx-film-001` es el primero escrito contra esa especificación en vez de
contra el gusto. Su guion son las líneas de `KODEX_MESSAGES`, del repo.

### 3D sin librería

`kodex-orbit` hace 3D a mano: rotaciones en los tres ejes, proyección en
perspectiva y pintor con orden de profundidad. Lo que decide si se ve como un
objeto o como un dibujo plano es **una sola cosa**: partir cada anillo en los
segmentos que quedan detrás de la esfera y los que quedan delante, y dibujar
la esfera opaca en el medio. Sin eso los anillos se ven «a través» del planeta
y el volumen desaparece entero.

Lo demás es consecuencia: grosor y brillo de cada segmento salen de su `z`, y
eso solo da la sensación de metal cuando la oclusión ya es correcta.

### Piezas largas: el corte

`kodex-showreel` son 15s en seis actos con cinco cortes duros. Lo que una
pieza de 7s no exige y una de 15 sí:

1. **El corte tiene que estar motivado.** Sale de un pico de movimiento del
   plano anterior y entra en otro. Un corte sobre imagen quieta lee como error
   de edición, no como decisión.
2. **El flash dura dos frames** (66 ms). Más largo deja de leer como corte y
   pasa a leer como transición; más corto no se registra.
3. **Ningún acto puede tener tiempo muerto.** El colapso empezó durando 0.9s y
   solo los últimos 0.35 pasaban algo: se recortó a 0.5s y ese tiempo se le
   devolvió al desgarro, que sí tenía qué mostrar.
4. **Un colapso gana brillo.** Es energía comprimiéndose. La primera versión
   lo apagaba hacia granate y quedaba medio segundo de negro.
5. **Cuidado al encoger una capa a pantalla completa:** su propio borde
   rectangular entra en campo. De ahí el parámetro `bleed` de `drawMembrane`.

### Motores compartidos

`lib/kodex-geometry.js` tiene los dos motores de Kodex —teseracto y membrana—
para que las escenas no los dupliquen. `scene-kit.js` es infraestructura
genérica (easings, grano, motion blur, SVG); el lib es geometría de marca.

### El wordmark no se compone con una fuente

`public/assets/kodex/01-kodex-logo-kit.svg` trae el logo oficial en vectores,
dentro de `<g id="logo-primary">`. Las escenas de Kodex lo cargan de ahí —
`loadSvgCrop()` + `tint()` en `scene-kit.js`— en vez de aproximarlo con una
tipografía. Es el logo, no algo parecido al logo.

`loadSvgCrop` reescribe el `viewBox` y el `width/height` del SVG **antes** de
cargarlo. Importa: `drawImage` con rectángulo de origen rasteriza el SVG a su
tamaño intrínseco y recién después escala, así que un wordmark grande sale
borroso. Reescribiendo el documento, el navegador lo rasteriza nítido al
tamaño final.

Otras marcas en el repo, por si hacen falta: `public/logos/` (Wenu Mapu).

### Proyectar lo imposible

`kodex-artifact` renderiza un teseracto: 16 vértices, 32 aristas, 4 ejes. Las
aristas que parecen atravesarse no se tocan — están separadas en un eje que la
pantalla no tiene. Tres cosas que costaron:

1. **El encuadre no puede depender del ángulo.** La doble proyección divide por
   ~8 y el tamaño en pantalla late solo. Se normaliza por frame — pero usando
   la media cuadrática de los radios, no el máximo: un único vértice fugado
   encoge el objeto entero a una astilla.
2. **El ojo 4D no puede bajar de √2.** La |w| de un vértice rotado llega a
   1.414; si `dw` cruza ese valor, el guard contra infinito se dispara y la
   sombra colapsa. La inversión la da la rotación en el plano XW, que ya da
   vuelta el objeto sobre sí mismo — forzar la proyección sobra.
3. **Los momentos de canto son inherentes.** Medidos con
   `scripts/motion/probe-flatness.mjs`: ~5-10% de los frames, en cualquier
   fase de arranque. No se evitan. Con techo de encuadre estricto se ven como
   astillas diminutas, que leen como error; con techo flojo la misma astilla
   cruza el cuadro y lee como estela. Se abrazan.

El HUD muestra los ángulos reales que se están calculando. No es atrezo.

### Tratar una foto, sin generarla

`body-scan` resuelve el look de "radiografía cibernética" sin modelo
generativo. El método:

1. Muestrear la foto a una grilla pequeña (320×568) **una sola vez**, al cargar.
2. Normalizar y aplicar curva de contraste. Sin curva la piel y el fondo caen
   juntos en los medios y la forma no emerge.
3. Por cada fila, dibujar una polilínea cuya altura se desplaza según la
   luminancia de cada punto. La forma aparece sola: la luz ya la describía.
4. **Tres pasadas tonales por fila** (umbrales 0.12 / 0.40 / 0.66), cada una
   con más alpha. Una sola pasada deja la fila entera del mismo brillo y la
   imagen se aplana — este es el paso que decide si parece un escáner o un
   gráfico de barras.
5. Levantar el lápiz bajo el umbral mínimo, para que el fondo no produzca
   línea.

Costo: cero créditos. Entrada: cualquier foto del catálogo. Cambiar `SRC` y
`CROP` da una pieza nueva.

### Dos marcas, dos sistemas

`scene-kit.js` es infraestructura compartida; la identidad **no** se comparte.

| | Wenu Mapu | KODEX |
|---|---|---|
| Fondo | `#0a0a0a` obsidiana | `#050608` |
| Acento | `#c9a84c` ámbar | `#10E9FF` / `#FF1427` / `#7C20FF` |
| Tipografía | Instrument Serif + Sans | Space Grotesk |
| Fuente de verdad | `src/styles/tokens.css` | `public/kodex-*/preset.json` |
| Registro | ritual, editorial, quieto | técnico, HUD, tensión |

Las escenas de Kodex salen de los presets, no del gusto: `preset.json` ya trae
paleta, estados (`DORMANT → AWARE → OPEN`) y comportamientos (`domain_warp`,
`topology_collapse`). Eso es la estructura de tres actos, ya escrita.

> `word-scroll` usa léxico de `src/i18n/mapudungun.json`. Ese archivo marca
> `validation_needed`: confirmar ortografía y uso con fuente mapuche autorizada
> antes de publicar. Un reel público es publicación.
