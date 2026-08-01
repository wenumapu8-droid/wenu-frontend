---
type: wireframe-canon
project: KODEX
status: ready-for-handoff
created: 2026-07-25
purpose: congelar IA + UX + jerarquia narrativa antes de mas polish visual o FX
related:
  - [[contenido/kodex-atlas-cosmogonias-humanas-2026-07-25]]
  - [[contenido/kodex-arquitectura-operativa-desde-menor-infinito-2026-07-24]]
  - [[contenido/kodex-sistema-madre-archivo-vivo-2026-07-24]]
  - [[estrategia/kodex-canon-64-sistemas-2026-07-24]]
---

# KODEX — wireframe canónico del Atlas de las Cosmogonías Humanas

## Decisión madre
KODEX deja de pensarse como una landing oscura con archivo + efectos.
Pasa a pensarse como un **atlas vivo, navegable y comparativo**.

La estética sigue siendo importante, pero ahora queda subordinada a una promesa más fuerte:

**hacer visible cómo distintas culturas resolvieron el paso de lo indeterminado a un mundo habitable.**

---

## Objetivo UX
La persona no debería sentir que está “viendo una web de arte”.
Debería sentir que está entrando a un sistema de conocimiento ritual-cartográfico.

### Secuencia emocional correcta
1. **Umbral** — algo mayor que una home
2. **Orientación** — entiendo qué atlas es este
3. **Atracción** — quiero explorar un código primordial
4. **Cruce** — comparo civilizaciones sin perder singularidad
5. **Descenso** — entro a una tradición / texto / caso
6. **Reconocimiento** — veo patrones recurrentes sin borrar diferencias
7. **Retorno** — vuelvo con otra lectura del conjunto

### Fórmula UX
**entrar → elegir operación → cruzar culturas → comparar → descender → volver**

---

# 1. Arquitectura de información

## Nivel A — home / portal del atlas
Ruta sugerida:
- `/kodex`

### Rol
- umbral
- manifiesto breve
- índice vivo del atlas
- distribución de rutas de exploración

### No debe ser
- portfolio
- landing promo
- galería lineal sin IA
- laboratorio de efectos aislados

---

## Nivel B — mapa de operaciones cosmogónicas
Ruta sugerida:
- `/kodex/atlas`
- o como bloque principal dentro de `/kodex`

### Rol
Mostrar los **12 códigos cosmogónicos** como gramática maestra del proyecto.

### Códigos
- C01 vacío / abertura primordial
- C02 aguas primordiales
- C03 oscuridad fértil
- C04 huevo / matriz cósmica
- C05 separación cielo–tierra
- C06 palabra / pensamiento creador
- C07 cuerpo convertido en mundo
- C08 modelado artesanal
- C09 emergencia entre niveles
- C10 tierra extraída del agua
- C11 edades cíclicas
- C12 universo eterno sin creador

### Regla
Este mapa debe ser **navegable**. No decorativo.

---

## Nivel C — vistas por tradición / cultura / corpus
Ruta sugerida:
- `/kodex/atlas/tradiciones`
- `/kodex/atlas/tradicion/[slug]`

### Ejemplos
- Egipto
- Mesopotamia
- India
- Grecia
- China
- Mesoamérica
- Andes
- Mapuche
- Oceanía
- Norteamérica indígena

### Rol
Permitir una lectura situada, no solamente abstracta.

---

## Nivel D — vista comparativa
Ruta sugerida:
- `/kodex/atlas/comparar`

### Rol
Cruzar tradiciones por operación cosmogónica, no por parecido superficial.

### Ejemplo de comparación
**Separación cielo–tierra**
- Egipto
- Māori
- China
- Japón

### Resultado esperado
El usuario ve:
- qué comparten
- qué no comparten
- qué problema resuelven de forma distinta

---

## Nivel E — ficha profunda / entrada canónica
Ruta sugerida:
- `/kodex/entry/[slug]`

### Rol
Ser la unidad de lectura profunda.

### Puede ser una entrada de:
- una tradición completa
- un texto específico
- un motivo cosmogónico
- un caso singular dentro del atlas

Ejemplos:
- `enuma-elish`
- `nasadiya-sukta`
- `te-po`
- `trengtreng-kaykay`
- `woman-of-the-sky`

---

## Nivel F — máquina KODEX
Ruta sugerida:
- `/kodex/machine`

### Rol
Traducir operaciones cosmogónicas profundas a geometría, movimiento, luz, compresión, frecuencia y retorno.

### Regla dura
No copiar símbolos sagrados.
No hacer collage pseudo-místico.
Traducir **operaciones**, no iconografía literal.

---

# 2. Wireframe canónico de `/kodex`

## Bloque 1 — UMBRAL
### Objetivo
Separar esta experiencia del resto del sitio y declarar que no es una home comercial.

### Contenido
- wordmark KODEX−∞
- una frase madre
- una frase de orientación
- un CTA principal
- un CTA secundario

### Copy funcional sugerido
- título: `KODEX−∞`
- subtítulo: `Atlas de las Cosmogonías Humanas`
- frase: `No un archivo de símbolos, sino un mapa de operaciones originarias.`

### CTA principal
- `ENTRAR AL ATLAS`

### CTA secundario
- `EXPLORAR LOS 12 CÓDIGOS`

### Interacción
- fondo vivo, sí
- profundidad, sí
- pero legibilidad primero

---

## Bloque 2 — QUÉ ES ESTE ATLAS
### Objetivo
Evitar que el usuario lo lea como “web de arte abstracto”.

### Contenido
Texto de 3 piezas:
- qué estudia
- qué no afirma
- cómo se recorre

### Estructura
- `KODEX estudia cómo distintas culturas imaginaron el origen.`
- `No dice que todas dijeron lo mismo.`
- `Se entra por operaciones, se cruza por civilizaciones, se vuelve por patrones.`

---

## Bloque 3 — MAPA DE LOS 12 CÓDIGOS
### Objetivo
Mostrar la gramática maestra del atlas.

### Formato ideal
- mandala / rueda / constelación / matriz radial
- 12 nodos clicables
- hover con microdefinición
- click abre vista comparativa o cluster

### Cada nodo muestra
- código
- nombre
- definición de 1 línea
- cantidad de tradiciones relacionadas

### Ejemplo
- `C02 — Aguas primordiales`
- `Antes de la forma, un medio indiferenciado y fértil.`
- `12 tradiciones`

### Este bloque es el corazón de la home
Si esto no funciona, KODEX sigue siendo escenografía.

---

## Bloque 4 — RUTAS DE EXPLORACIÓN
### Objetivo
Dar puertas claras para distintos tipos de usuario.

### 4 puertas sugeridas
- **Por código** — las grandes operaciones del origen
- **Por civilización** — Egipto, India, Mapuche, etc.
- **Por forma del cosmos** — huevo, aguas, separación, cuerpo, ciclos
- **Por retorno** — catástrofe, diluvio, disolución, reinicio

### Formato
4 cards grandes, inequívocas, con 1 frase cada una.

---

## Bloque 5 — CONSTELACIÓN DE TRADICIONES
### Objetivo
Hacer visible la diversidad real del corpus.

### Formato
Grid / constelación de nodos con ejemplos concretos:
- Sumeria
- Enūma Eliš
- Heliópolis
- Nāsadīya
- Puruṣa
- Jainismo
- Te Pō
- Popol Vuh
- Trengtreng y Kaykay
- Mujer del Cielo

### Cada nodo muestra
- nombre
- región
- tipo principal
- estado: cosmogonía / cosmología / antropogonía

### Regla
Acá tiene que aparecer conocimiento concreto, no solo atmósfera.

---

## Bloque 6 — COMPARADOR VIVO
### Objetivo
Mostrar por qué esto es atlas y no archivo lineal.

### UX
El usuario elige un código y ve 3–6 tradiciones alineadas.

### Ejemplo
**C05 · separación cielo–tierra**
- Egipto
- Māori
- China
- Japón

### Cada columna muestra
- relato breve
- gesto operativo
- qué ordena
- qué pierde / qué habilita

---

## Bloque 7 — MÁQUINA KODEX
### Objetivo
Decir qué hace KODEX con esta investigación.

### Contenido
- no replica símbolos
- extrae operaciones profundas
- las traduce a cosmografía original
- las vuelve geometría, ritmo, estructura, experiencia

### Output visual posible
- diagrama animado
- geometría reactiva
- pequeño laboratorio explicativo

### Regla
Esta sección aparece **después** del atlas, no antes.

---

## Bloque 8 — ENTRADAS DESTACADAS
### Objetivo
Ofrecer descensos concretos.

### 3–6 entradas iniciales sugeridas
- Enūma Eliš
- Ogdóada de Hermópolis
- Nāsadīya Sūkta
- Jainismo y universo eterno
- Popol Vuh
- Trengtreng y Kaykay

### Formato
Cards editoriales con:
- título
- subtítulo
- código(s) asociados
- motivo de relevancia
- CTA: `descender`

---

## Bloque 9 — FRASE DE RETORNO
### Objetivo
Cerrar la home con expansión, no con agotamiento.

### Frase candidata
**El universo no aparece una sola vez. Continúa originándose cada vez que una posibilidad adquiere forma y entra en relación con el mundo.**

### CTA final
- `VOLVER AL MAPA`
- `ABRIR UNA ENTRADA`
- `ACTIVAR LA MÁQUINA`

---

# 3. Wireframe de ficha profunda `/kodex/entry/[slug]`

## Bloque 1 — encabezado
- nombre de la tradición / texto / caso
- región
- periodo aproximado si aplica
- nivel: cosmogonía / cosmología / antropogonía
- códigos asociados

## Bloque 2 — relato corto
- resumen claro de 120–220 palabras
- sin academicismo pesado
- sin vulgarización tonta

## Bloque 3 — operación cosmogónica
- cuál es el gesto central
- separación / modelado / sacrificio / emergencia / etc.

## Bloque 4 — estructura del cosmos
- cómo se organiza ese universo
- planos, direcciones, aguas, cielo, inframundo, ciclos, etc.

## Bloque 5 — aparición de lo humano
- si aplica
- de barro, maíz, aliento, modelado, emergencia, etc.

## Bloque 6 — cuidado cultural / notas
- tradición viva
- fuente parcial
- reconstrucción moderna
- sesgo colonial en la fuente
- límites del conocimiento

## Bloque 7 — relaciones
- “si te interesa esto, mirá también...”
- cruces por operación, no por decoración

## Bloque 8 — traducción KODEX
- qué operación profunda reconoce KODEX ahí
- cómo podría volverse geometría / ritmo / diagrama

---

# 4. Wireframe de la vista comparativa `/kodex/atlas/comparar`

## Estructura base
### Columna izquierda
- selector de código
- selector de región
- selector de nivel

### Centro
- tabla / matriz comparativa

### Columna derecha
- insights KODEX
- patrones recurrentes
- excepciones fuertes

## Modos de lectura
- por código
- por tradición
- por región
- por relación de retorno / catástrofe / reinicio

## Regla visual
No parecer dashboard corporativo.
Sí parecer instrumento ritual-intelectual.

---

# 5. Interacciones fenomenales que sí valen
Estas sí empujan el atlas. Las otras sobran.

## Interacciones P1
- mandala de 12 códigos como interfaz real
- hover con microdefinición + contador de tradiciones
- transición entre códigos como cambio de campo cosmológico
- líneas de relación entre nodos
- filtro por región / tipo / nivel
- cards con reveal de metadatos al hover

## Interacciones P2
- comparador animado entre tradiciones
- constelación relacional entre entradas
- diagrama vivo de retorno / disolución / renacimiento

## Interacciones P3
- máquina KODEX generativa
- visualización geométrica de operaciones profundas
- sonido o pulso muy sutil por modo/código si realmente suma

## Interacciones que NO suman
- shader por shader sin contexto
- túnel eterno como protagonista
- FX que compiten con la lectura
- glitches o sci-fi gamer
- oscuridad que mata legibilidad

---

# 6. Jerarquía de contenido
## Siempre visibles
- qué es KODEX
- cómo se recorre
- los 12 códigos
- entradas concretas
- rutas de navegación

## Visibles al segundo scroll
- comparadores
- constelación de tradiciones
- cruces culturales

## Profundos / opcionales
- máquina KODEX
- laboratorio geométrico
- traducciones visuales más abstractas

---

# 7. MVP realista
Si hubiera que ordenar el build en fases útiles:

## Fase 1 — home con IA clara
- umbral
- qué es este atlas
- 12 códigos
- rutas de exploración
- 6 entradas destacadas

## Fase 2 — ficha profunda
- 3 entradas canónicas completas
- comparador simple

## Fase 3 — navegación relacional
- filtros
- cruces
- constelación de tradiciones

## Fase 4 — máquina KODEX
- traducción geométrica original

---

# 8. Regla final
KODEX gana cuando:
- la persona entiende que está frente a un sistema
- la diversidad del atlas aparece claramente
- la comparación no borra diferencias
- la estética sostiene el conocimiento
- la interactividad sirve para pensar, no solo para impresionar

KODEX pierde cuando:
- la atmósfera reemplaza al mapa
- el símbolo reemplaza al contenido
- la oscuridad reemplaza la estructura
- el FX reemplaza la navegación

---

# Próximo artefacto recomendado
Después de este wireframe, lo correcto es producir uno de estos dos:

1. **sitemap / IA detallada con rutas, slugs y entidades**
2. **mockup low-fi sección por sección de `/kodex`**

No conviene saltar todavía a polish visual fino sin esos dos artefactos.
