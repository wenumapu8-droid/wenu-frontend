# KODEX · RECOVERY MODE
**Vigente desde 2026-08-31. Decisión de Ocín. No se renegocia por sesión.**

---

## POR QUÉ

Diagnóstico del creador, textual:

> Había progreso técnico real, pero **no progreso acumulativo visible**.
> Cada vez que resolvíamos algo podía quedar huérfano, otra versión seguía
> siendo la autoridad, un documento viejo mandaba más que la decisión
> nueva, o el gate verificaba "build correcto" en vez de "KODEX realmente
> mejoró". Entonces trabajabas muchísimo y el producto parecía casi igual.

Eso produce la sensación de avanzar y volver al mismo lugar. No era una
impresión: era un patrón del sistema.

---

## LA REGLA QUE ORDENA TODO

> **Ningún trabajo nuevo entra hasta que lo mejor que ya existe esté
> montado, visible y convertido en autoridad.**

---

## PROHIBIDO

```
ideas nuevas · shaders nuevos · escenas nuevas · arquitecturas nuevas
documentos maestros · versiones porque sí
```

Si ves algo que falta: **anotalo en el backlog, no lo empieces.**

---

## EL LÍMITE HUMANO

**KODEX no recibe más horas humanas ilimitadas.**

Ocín aporta **60–90 minutos al día**, y son de **revisión visual**, no de
operación. Su trabajo se reduce a tres cosas:

| | |
|---|---|
| **DIRECCIÓN** | "esto sí se siente KODEX / esto no" |
| **DECISIÓN** | "A gana sobre B" |
| **CANON** | "esto pasa a ser verdad del sistema" |

Todo lo demás —inventarios, huérfanos, imports, refactors, tests,
capturas, builds, estado, contradicciones— lo hace la máquina.

**Si el sistema autónomo no convierte ese input pequeño en progreso
visible, no se le da más tiempo ni más modelos: se arregla el sistema
primero.**

---

## EL TRINQUETE · `scripts/kodex-trinquete.mjs`

La pieza que faltaba, y es distinta de los gates.

- Un **gate** pregunta *"¿está bien?"* — y se pasa volviendo al estado anterior.
- El **trinquete** pregunta *"¿está mejor o igual que la última vez que
  estuvo bien?"* — ese no se pasa retrocediendo.

> Una escena que llega a PROVEN no puede retroceder porque otro agente
> leyó un documento viejo.

**El diente sólo sube.** Para bajarlo hace falta decisión explícita, con
razón escrita y fecha:

```bash
node scripts/kodex-trinquete.mjs --rebajar <clave> "por qué"
```

Corre dentro de `validate:kodex:core`. Si tu cambio baja un diente, el
build corta y te dice qué retrocedió y cuánto.

### Lo que el trinquete NO hace

**No mide si algo se ve bien.** Un gate dio 7/7 con el organismo al 11% del
viewport porque medía presencia y no proporción. El trinquete puede cuidar
un número que Ocín ya aprobó; **no puede decidir cuál número merece
cuidarse.** Eso es dirección, y la dirección es suya.

---

## LA FÁBRICA NOCTURNA · `npm run kodex:noche`

Cola **finita que la máquina no puede ampliar**. El agente no decide qué
inventar: toma lo que hay. Cada tarea declara **cómo se verifica** — una
tarea sin verificación es una intención, y las intenciones no se cierran
solas.

Produce un reporte de **una pantalla**, no 400 líneas de log.

---

## CÓMO TRABAJA UN AGENTE EN ESTE MODO

1. `node scripts/kodex-equipo.mjs quien` — ¿quién está en qué?
2. `npm run kodex:inventario` — **¿ya existe lo que ibas a construir?**
3. Tomá la unidad, hacela, **montá lo que ya está** antes que crear.
4. `npm run kodex:trinquete` — ¿subió algún diente? Queda protegido.
5. Commit con `git add <paths>` (nunca `-am`), push cada vuelta.
6. Una línea en `TELAR-BITACORA.md`.

**Si algo requiere juicio, se anota y se salta.** No se decide por Ocín.

---

## LAS SIETE REGLAS QUE COSTARON EL 30-31 DE AGOSTO

1. **Dato REAL o HUECO declarado. Nunca inventado.** La pregunta no es
   *¿es razonable?* sino **¿qué fuente lo dice, y esa fuente puede saberlo?**
2. **Antes de construir, buscá.** Aparecieron 34KB de escena nativa, tres
   organismos completos y una onda que su propio motor ya buscaba — todo
   construido y sin cablear.
3. **No todo huérfano se monta.** Verificá que su función no la cumpla otro.
4. **Nada se borra, todo se recicla.** Si dos cosas divergen, la salida no
   es elegir un ganador: es la síntesis que conserva ambas.
5. **`grep` no verifica apariencia.** Existir no es verse bien. Mirá.
6. **Contá, no estimes.** `:not()` suma especificidad; una regla "obvia"
   perdía por eso y el sitio mostraba los rieles caídos.
7. **`git add <paths>`, nunca `-am`.** Tres commits se llevaron trabajo
   ajeno sin querer.
