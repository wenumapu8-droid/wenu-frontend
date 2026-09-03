# KODEX · WORKFLOW ÚNICO
**Vigente 2026-09-03. Pedido de Ocín: "trabajen en equipo, hagan un workflow
limpio, pásense el contexto". Esto reemplaza toda coordinación ad-hoc.**

---

## LA CONDICIÓN DE OCÍN, textual

> Aprobé deploy **siempre y cuando se puedan asegurar que esto funcione bien**
> y que KODEX se trabaje según las referencias de mockup, los copys de Drive,
> el banco de imágenes, que estén los collages con mi arte entremedio, y que
> se pueda navegar según lo hemos establecido.

**El deploy no es libre: está condicionado a las cinco cosas de arriba.**

---

## LOS CUATRO ROLES · uno por sesión, no negociable por vuelta

| rol | sesión | escribe en |
|---|---|---|
| **NAVEGACIÓN** | quien tome | `folio/[folio].astro` · `index.astro` · puertas |
| **LÁMINAS** | quien tome | `pages/kodex/lamina/**` · `components/kodex/lamina/**` |
| **CHASIS** | chat-opus | `components/kodex/os/**` · `src/kodex/**` · `scripts/**` · deploy |
| **MEDICIÓN** | quien tome | `wenuos-system/**` · gates · matrices · **no escribe producto** |

Quien no tenga rol: **lee, mide, reporta. No escribe.**

---

## LA LEY DE ESCRITURA

**READ PARALLEL · WRITE SERIAL.**

```bash
node scripts/kodex-equipo.mjs quien                    # antes de todo
node scripts/kodex-equipo.mjs escritura <vos> "<qué>"  # UNO solo escribe
node scripts/kodex-equipo.mjs escritura <vos> soltar   # al terminar
```

Leer, auditar, medir, investigar: **todos a la vez, sin permiso.**
Escribir en el worktree: **uno**. El lease caduca a los 45 min.

**Antes de crear un archivo nuevo:**
```bash
node scripts/kodex-equipo.mjs crear <vos> <ruta>
```
Las estaciones cubren archivos que existen, no los que todavía no.

---

## EL CICLO · ninguna vuelta se salta un paso

```
1  escritura <vos>          nadie más toca el worktree
2  npm run kodex:inventario ¿ya existe lo que vas a construir?
3  construir / cablear
4  build <vos> + KDX_AGENTE=<vos> npm run build
5  verificar el DIST         antes de subir, no después
6  npm run test:kodex        355+
7  npm run kodex:trinquete   nada retrocedió
8  git add <paths> && commit && push    NUNCA -am
9  bitácora: una línea
10 escritura <vos> soltar
```

**El deploy es un paso aparte y sólo lo hace CHASIS**, con la frase de Ocín
en la mano y después de `kodex-verificar-publicado.mjs`.

---

## LAS CINCO CONDICIONES DE OCÍN · convertidas en gate

Ninguna escena está lista hasta que las cinco pasen:

| # | condición | cómo se verifica |
|---|---|---|
| 1 | **referencias de mockup** | comparar contra HI-FI vertical 941×1672 (target primario) y boards 1672×941 (referencia semántica). **No rotar, no comparar pixel a pixel.** |
| 2 | **copys de Drive** | `canonical_copy` de los contratos, `source: BOARD_2026_08_27`. El Hi-Fi NO manda en copy. |
| 3 | **banco de imágenes** | sólo obra publicada en `/kodex-content/obra/**`. Registry: 0 de 25 aprobadas — **rights gate cerrado**. |
| 4 | **collages con el arte entremedio** | los 10 de `OCÍN COLLAGE VISUAL RESTS` son **portadas / interludios / descansos**, NO targets de UI. Van *entre* secuencias densas, según canon 08G §6: DENSIDAD → DECELERACIÓN → SILENCIO → OBRA → CONTEMPLACIÓN. |
| 5 | **navegación establecida** | canon `08G`: cinco familias de puerta — DEEPEN · LATERAL · REVISIT · CROSS · RETURN_TRACE. Sin jerarquía entre ellas: *"no existe ruta correcta ni ruta equivocada"*. |

---

## EL ORDEN DE TRABAJO · lo listo antes que lo nuevo

**RECOVERY MODE sigue vigente.** Ningún trabajo nuevo entra hasta que lo
mejor que ya existe esté montado, visible y convertido en autoridad.

```
1  las 40 láminas alcanzables desde el corredor     hoy: 6 de 40
2  los collages entre secuencias (canon 08G §6)     hoy: 0
3  la máquina de observación del ojo en las 6 restantes
4  las 133 filas del Atlas que son sólo título
```

**El diente `laminas_alcanzables` del trinquete mide el 1.** Es el primer
número que baja si alguien construye algo y no lo cablea.

---

## LO QUE NO SE HACE

- No otro renderer, router, memoria, ontología ni design system
- No presentar CI verde, tests ni documentos como avance
- No inventar un dato: **REAL o HUECO declarado**
- No medir sobre un `dist` que no construiste vos
- No `git add -am` en repo compartido
- No deploy sin la frase de Ocín **y** sin verificar el sitio después

---

## PASO DE CONTEXTO ENTRE SESIONES

Al terminar una vuelta, el mensaje al equipo lleva **sólo esto**:

```
QUÉ HICE     una línea + SHA
QUÉ MEDÍ     el número, con el comando que lo produjo
QUÉ TOQUÉ    rutas exactas
QUÉ SIGUE    y qué NO tomo, para que otro lo tome
```

Sin resúmenes largos. **Un número medido vale más que un párrafo.**

---

## LAS SIETE REGLAS QUE COSTARON ESTE MES

1. **Dato REAL o HUECO. Nunca inventado.** La pregunta no es *¿es razonable?*
   sino **¿qué fuente lo dice, y esa fuente puede saberlo?**
2. **Antes de construir, buscá.** Aparecieron 34 KB de escena nativa, tres
   organismos completos y una onda cuyo motor ya la buscaba — sin cablear.
3. **No todo huérfano se monta.** Verificá que su función no la cumpla otro.
4. **Nada se borra, todo se recicla.** Ante divergencia: síntesis, no ganador.
5. **`grep` no verifica apariencia.** Un gate dio 7/7 con la obra al 11% del
   viewport. Existir no es verse bien. **Mirá.**
6. **Contá, no estimes.** `:not()` suma especificidad, y una regla "obvia"
   perdía por eso mientras el sitio mostraba los rieles caídos.
7. **Presencia ≠ dominancia ≠ alcance.** 40 láminas publicadas y 0
   alcanzables, con todos los gates en verde.
