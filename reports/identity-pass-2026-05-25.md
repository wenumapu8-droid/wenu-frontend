# Identity pass — home / shop / PDP / about — 2026-05-25

Fecha de corte: 2026-05-25 14:12:03 PDT

## Alcance
Pasada rápida de identidad sobre:
- `src/pages/index.astro`
- `src/pages/shop.astro`
- `src/pages/p/[slug].astro`
- `src/pages/about.astro`

Fuentes usadas:
- lectura directa de archivos Astro
- preview local en `http://127.0.0.1:4321`
- revisión de reportes previos de identidad

## Hallazgo crítico primero
En preview local, al navegar a `/shop`, `/about` y `/p/recovery-aftercare-saline-spray`, el navegador sigue mostrando visualmente el **home**.

Esto hoy bloquea una validación visual confiable página por página.

### Qué significa
- el código fuente de `shop.astro`, `about.astro` y `p/[slug].astro` **sí** contiene estructuras específicas de esas páginas
- pero el preview actual está resolviendo o renderizando una experiencia visual que se ve como home
- antes de seguir puliendo identidad fina, conviene verificar si hay:
  - problema de layout compartido
  - problema de navegación / hydration
  - problema de ruta preview
  - fallback inesperado en build/SSR

## Lo que ya se siente premium

### Home
- hero principal con buena postura editorial
- uso de macro real en `Witral Vilu` suma credibilidad de marca
- tono general oscuro/editorial está bastante alineado con Wenu contemporáneo
- mejoró mucho al filtrar placeholders en featured

### Shop
- tiene una intención clara de catálogo premium con banner inicial y filtros
- el rail por materiales ayuda a construir sistema, no solo venta
- la taxonomía ritual por prefijos (`KÜRÜF`, `KUYÉN`, etc.) tiene personalidad propia

### PDP
- `RitualHeader` + `RitualProductHero` van en la dirección correcta para elevar el PDP a experiencia, no ficha plana
- breadcrumb, specs, guías y bloques de soporte comercial están bien pensados
- el fallback de “Photography in progress” es mejor que un placeholder feo

### About
- estructura en bloques `Story / Materials / Artistry / Stockists` ordena bien el relato
- uso de `about-archive` ayuda a salir del texto puro
- mantiene tono íntimo, chico, artesanal

## Lo que todavía se siente inconsistente o provisional

### 1) La home sigue mezclando lujo editorial con señales de catálogo todavía débiles
- aparece `UNCATEGORIZED` en featured
- algunos featured parecen entrar sin suficiente curaduría narrativa
- el proof beat usa claims semi-provisorios (`Worn from`, ciudades) que piden validación real

### 2) Shop todavía está más cerca de una grilla funcional que de una experiencia de marca
- falta una segunda capa visual real después del hero
- los filtros pueden sentirse más utilitarios que rituales
- el bloque `Explore by material` tiene buen contenido, pero visualmente puede quedar genérico si no se apoya en mejores assets

### 3) El PDP tiene riesgo de sobre-atmósfera si el producto no está 100% sostenido por macro real
- el `RitualProductHero` suma, pero hay que vigilar que no tape o dramatice demasiado piezas flojas
- si el primer producto visible es un aftercare spray o algo no-icónico, la dirección ritual pierde potencia
- el fallback de foto en progreso está bien como recurso, pero si aparece mucho, baja nivel de marca

### 4) About todavía necesita más prueba visual del taller / archivo / mano real
- hoy la estructura está ordenada, pero todavía puede sentirse demasiado texto + una imagen
- falta más evidencia visual de proceso, materialidad, herramienta, escala o archivo propio

### 5) Hay un problema de sistema visual y sistema comercial mezclados
- la identidad quiere lujo ritual contemporáneo
- pero parte del catálogo y ciertos textos siguen tirando a ecommerce estándar
- hace falta decidir mejor qué páginas son:
  - editorial / manifiesto
  - catálogo / discovery
  - conversión / compra

## Prioridad por archivo

### `src/pages/index.astro`
**Prioridad: alta**

#### Ajustes siguientes
- sacar o remapear productos `UNCATEGORIZED` del featured principal
- endurecer el filtro de featured para que entren solo piezas visualmente fuertes
- revisar el bloque `Worn from` y reemplazar cualquier claim no confirmado
- revisar si el primer rail de featured debería priorizar:
  - macros hero
  - piezas emblemáticas
  - menos variedad, más autoridad
- bajar ruido en bloques secundarios si compiten con hero + editorial band

#### Recomendación concreta
Hacer una versión de featured más chica pero más curada: menos SKU, más impacto.

### `src/pages/shop.astro`
**Prioridad: alta**

#### Ajustes siguientes
- verificar primero por qué preview no muestra esta página como tal
- una vez resuelto eso, subir el nivel del catálogo con:
  - intro más corta y más precisa
  - una banda visual secundaria real por categorías/materiales
  - mejor jerarquía entre filtros y grilla
- revisar copy como `Ships across the US` y frases materiales para que no suenen genéricas
- revisar `Brass & bronze` porque “tribal roots” roza un tono demasiado amplio/genérico para la marca

#### Recomendación concreta
Shop debería sentirse como **archivo curado de piezas**, no solo página de browse.

### `src/pages/p/[slug].astro`
**Prioridad: muy alta**

#### Ajustes siguientes
- verificar por qué preview no deja validar el PDP real
- definir una lista de SKU hero permitidos para review visual de PDP
- no usar como referencia principal productos débiles o categorías no-joya para la dirección premium
- revisar densidad visual entre:
  - `RitualProductHero`
  - imagen principal repetida en la columna
  - specs
  - CTA
- si el hero ritual ya cumple la función visual principal, quizás la repetición inmediata del mismo asset abajo puede sentirse redundante

#### Recomendación concreta
Usar 3 PDP de referencia premium para ajustar el sistema:
- 1 hanger / ear weight hero
- 1 piercing en titanio / plata muy limpio
- 1 pieza escultórica o amuleto

### `src/pages/about.astro`
**Prioridad: media-alta**

#### Ajustes siguientes
- sumar 1 o 2 assets reales más de archivo/taller si existen
- evitar que el relato quede solo textual
- revisar `Stockists` para que no huela a programa wholesale activo si hoy no corresponde empujarlo
- reforzar más la relación entre Truckee, oficio, mano y material

#### Recomendación concreta
About debería sentirse más como **atelier note / archive page** y menos como “about us” estándar.

## Riesgos de marca detectados
- `UNCATEGORIZED` visible en home
- posible exceso de promesa editorial con catálogo todavía desparejo
- frases todavía genéricas en algunos materiales/categorías
- preview local hoy no deja validar la coherencia real entre rutas
- si el sistema visual premium cae sobre productos o fotos flojas, se nota más la diferencia

## Orden recomendado de trabajo
1. resolver bug de preview/routing visual en `/shop`, `/about` y `/p/[slug]`
2. curar featured del home para sacar piezas débiles o categorías impropias
3. elegir 3 PDP hero de referencia real
4. subir `about` con más archivo/taller real
5. recién después hacer polish fino de spacing, copy y secuencia visual

## Próximo paso sugerido para Claude Code
Pedirle que investigue **por qué el preview muestra el home en rutas no-home** y que deje un diagnóstico corto antes de seguir con polish visual.

## Próximo paso sugerido para Codex
Pedirle una lista local de:
- featured candidates permitidos
- productos que no deberían aparecer en hero/featured
- candidatos de PDP premium por categoría
