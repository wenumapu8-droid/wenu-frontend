# 14 · LA LEY DE PROFUNDIDAD · CANON
**Ocín — 2026-08-21, 20:06**

Cierra la pieza que faltaba: cómo se entra. Complementa el documento 13
(estados de significado) y reemplaza cualquier lectura previa del "túnel" como
efecto decorativo.

---

## LA REGLA

> **Entrar en profundidad no debería significar "volar por un túnel". Debería
> significar que cada composición contiene físicamente la siguiente composición
> dentro de ella.**

> **Cada pantalla KODEX tiene un objeto dominante que contiene el siguiente
> estado.** Puede ser un ojo, un corazón, una fotografía, un glifo, un agujero
> negro, una célula, un nodo, una pantalla CRT, un diagrama, una pupila, un
> portal, un fragmento de archivo. Cuando el usuario decide observarlo, entra
> literalmente dentro de él. **La imagen deja de ser decoración: se convierte en
> arquitectura de información.**

No `página → página → página`. Sino **mundo dentro de mundo dentro de mundo**.
Una muñeca rusa digital, pero continua.

```
KODEX └─ THRESHOLD └─ SIGNAL └─ PROLOGUE └─ MEMORY └─ DESCENT
      └─ ARCHIVE └─ NODE └─ MACHINE └─ … −∞
```

**El vector ontológico principal siempre es hacia dentro:**

`SUPERFICIE → SEÑAL → ESTRUCTURA → MEMORIA → PROFUNDIDAD → TRANSFORMACIÓN → −∞`

Se puede desviar lateralmente por ramas infinitas, pero la dirección es esa.

---

## 1 · NO HAY QUE RENDERIZAR EL INFINITO

Sólo se mantienen cinco planos:

```
Z −2   escena anterior
Z −1   restos / ecos
Z  0   escena actual
Z +1   próxima escena
Z +2   preview / portal
```

Al atravesar Z+1, ésta pasa a ser Z0 y la anterior se recicla. Da la ilusión de
profundidad ilimitada sin cargar un universo infinito en el teléfono.

## 2 · POR QUÉ `scale()` NO ALCANZA

Aumentar la escala no produce la sensación de entrar. Hay que combinar indicios
perceptuales **simultáneos**:

| indicio | comportamiento |
|---|---|
| escala | lo que está delante crece |
| parallax | los planos cercanos se desplazan más rápido que los lejanos |
| perspectiva | los elementos periféricos se separan hacia afuera |
| blur | la capa que se deja atrás pierde foco |
| luminosidad | el destino aumenta emisión y bloom |
| distorsión | refracción / radial warp alrededor del centro |
| partículas | fluyen hacia los bordes, como atravesar materia |
| microtexto | cruza el campo visual a distintas velocidades |
| audio | frecuencias y texturas cambian con la profundidad |
| scan | la nueva capa se reconstruye al llegar |

Con eso el cerebro deja de percibir *"hicieron zoom a una imagen"* y percibe
*"entré dentro de algo"*.

## 3 · TRES DIRECCIONES SEMÁNTICAS, NO VEINTE CONTROLES

```
        FORWARD ◉
             │
BRANCH ◀─────┼─────▶ BRANCH
             │
             ▼
           BACK
```

- **Centro / profundidad** = continuar el viaje principal.
- **Laterales** = ramificaciones del conocimiento.
- **Atrás** = regresar un nivel.

Esto permite información enorme sin convertirse en un sitemap disfrazado.
Estando en COSMOLOGY aparecen alrededor `BLACK HOLES`, `QUANTUM`, `FRACTALS`,
`INFORMATION`; se entra lateralmente a BLACK HOLES → EVENT HORIZON →
INFORMATION → HOLOGRAPHIC PRINCIPLE → AdS/CFT, y **siempre existe un hilo para
volver a la trayectoria principal**.

## 4 · UNA LEY, SIETE MANIFESTACIONES

No siete portales iguales con skins distintos. La regla espacial es la misma;
cada escena interpreta el descenso de otra manera:

| escena | cómo se entra |
|---|---|
| THRESHOLD | el centro parece una abertura |
| PROLOGUE | se entra dentro de una imagen |
| DESCENT | las capas se multiplican y aceleran |
| ARCHIVE | dentro de un registro → dentro de otro → dentro de una asociación |
| MACHINE | dentro del sistema: nodos, algoritmos, organismos, señales |
| COSMOLOGY | la escala cambia radicalmente: célula → planeta → red → cosmos |
| RETURN | la dirección se invierte o colapsa; lo visitado se recombina |

---

## 5 · LA MECÁNICA DE LA ANIMACIÓN

> Debería sentirse como una cámara atravesando una lámina holográfica, no como
> zoom de PowerPoint ni scroll.

```
IDLE → AWARE → LOCK → PULL → ACCELERATE → CROSS → DECODE → SETTLE → IDLE
```

- **Reposo (IDLE).** La escena está viva pero casi quieta: respiración mínima,
  glow, ruido, líneas, partículas, microdatos.
- **Intención (AWARE).** Al acercar mouse o dedo al objeto central, ese objeto
  *te reconoce*: más brillo, líneas de lectura, pequeños datos, un pulso
  eléctrico. Todavía no se avanza.
- **Activación (LOCK).** Click/tap/drag hacia delante. Durante 300–500 ms: baja
  el entorno, el centro gana contraste, aparece un anillo/scan, los elementos
  laterales empiezan a separarse.
- **Aceleración (PULL / ACCELERATE).** El centro crece 1× → 1.3× → 2× → 4× →
  10×, mientras las capas hacen cosas distintas: el primer plano sale rápido
  hacia los bordes, el medio se mueve moderadamente, el fondo casi no se mueve,
  el microtexto cruza lateralmente, las partículas dejan estelas hacia afuera y
  la retícula se expande radialmente.
- **Cruce (CROSS).** Cuando el portal ocupa casi toda la pantalla, 150–250 ms de
  anomalía: aberración cromática, radial blur, scanline, distorsión, un flash
  breve, caída de luminancia, sonido grave / click / succión. Ese momento le
  dice al cerebro *acabas de atravesar algo*.
- **Reconstrucción (DECODE).** La pantalla no cambia de golpe: la siguiente
  escena aparece como información incompleta —
  `ruido → puntos → wireframe → imagen → texto → UI` — como si KODEX estuviera
  decodificando la siguiente profundidad.
- **Anclaje (SETTLE).** La cámara frena, los elementos encuentran su sitio, el
  glow baja, el texto vuelve a ser perfectamente legible.

**El usuario nunca "pasa de página": siente que atraviesa la materia de la
escena actual.**

### Capas y velocidades

```
CAPA 5 · partículas lejanas      0.15×
CAPA 4 · grid / coordenadas      0.30×
CAPA 3 · imágenes secundarias    0.55×
CAPA 2 · texto / nodos           0.80×
CAPA 1 · portal / objeto central 1.00×
                        CAMERA → Z
```

Cada capa responde a distinta velocidad. Ahí aparece la sensación de túnel **sin
construir un túnel 3D**.

### Cuatro tipos de avance, una sola física

- **ZOOM THROUGH** — se entra dentro de una imagen, ojo, portal, pantalla.
- **DISSOLVE THROUGH** — la escena se rompe en partículas y detrás aparece la
  siguiente.
- **SCAN THROUGH** — un escáner revela una capa más profunda.
- **FOLD THROUGH** — planos 2D se abren y dejan ver el siguiente nivel.

### El input controla el avance

No `click → reproduce video`, sino:

```
input del usuario → depth → posición de capas + escala + blur + glow + shader + audio
```

- **Escritorio:** rueda/trackpad hacia adelante aumenta la profundidad; click
  hace snap al próximo nodo; el mouse da parallax.
- **Móvil:** arrastrar hacia arriba o hacia el centro profundiza; tap entra;
  tilt opcional da parallax.

Si el dedo se mueve lento, se entra lento. Si se suelta, según el umbral vuelve
o completa el cruce. **Eso hace que la interfaz se sienta física.** Ahí está la
diferencia entre una animación decorativa y un sistema navegable vivo.

---

## QUÉ HAY YA CONSTRUIDO QUE SIRVE

Anotado por el agente, no por el creador:

- `src/lib/kodex/estado.ts` ya tiene `idle → aware → locked → active →
  transitionOut`, que es la mitad de la máquina de arriba. Faltan `PULL`,
  `ACCELERATE`, `CROSS`, `DECODE`, `SETTLE` y, sobre todo, que la profundidad
  sea **continua y controlada por el input** en vez de una transición disparada.
- `src/kodex/threshold-portal/shaders/thresholdPortalFeedback.frag` es un pase
  de realimentación: da la sensación de túnel real, no imitada con
  `transform:scale` + `blur`. Es el candidato para CROSS.
- `src/kodex/treatments/` (8 shaders + `KodexTreatmentChain`) cubre buena parte
  de los indicios perceptuales: aberración, dither, scanlines, grano, viñeta.
- Lo que **no** existe todavía: el buffer Z−2…Z+2, las cinco capas con
  velocidades propias, las tres direcciones semánticas (hoy sólo hay FORWARD y
  BACK), los cuatro tipos de avance, y que el objeto dominante de cada escena
  esté declarado como lo que contiene el siguiente estado.

**Regla de aceptación derivada:** si al entrar la pantalla anterior desaparece
en vez de ser atravesada, no cumple. Y si las siete escenas cruzan igual, tampoco.
