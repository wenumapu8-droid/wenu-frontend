---
tipo: brand-report
fecha: 2026-05-11
estado: listo para revisión
fuente-de-verdad: BRAND-DNA-2026-05-03.md · voz-de-marca-real-2026-05-03.md
relacionado: [[brand/MARCA-maestro]]
---

# Brand Launch Readiness — Wenu Mapu
### 2026-05-11 · Pre soft-launch audit

---

## 1. Estado del DNA de marca

El DNA está consolidado y es operable. No falta estructura — lo que falta es sincronización entre los archivos canónicos y el copy del sitio en algunos puntos específicos.

- **Identidad nuclear definida y estable.** Nombre, tagline operativo, definición About y manifiesto están documentados en `BRAND-DNA-2026-05-03.md` y `voz-de-marca-real-2026-05-03.md`. No hay contradicciones internas.
- **Voz y vocabulario aprobados son concretos.** Lista de palabras OK y palabras prohibidas existe. La voz del frontend actual respeta el 90% de esas reglas — las excepciones son puntuales y corregibles.
- **Materiales tienen lenguaje canónico por material.** Las frases de `en.json` para cada material (sterling silver, vacamuerta, titanium, wood, brass) están alineadas con el DNA. Esto es el activo más sólido de la marca en el sitio.
- **Pivote operativo (100% online, Truckee) está integrado al copy.** El copy de `copy-frontend-2026-05-01.md` ya absorbió el pivote. `en.json` lo refleja correctamente en hero, what_we_are, pickup y contact.

---

## 2. Gaps de coherencia entre DNA y sitio actual

### Home (`/`)

**OK:** El headline `"Adornment for the sacred body."` es correcto — vocabulario aprobado, tono ritual, conciso. El bloque `what_we_are` y el bloque `sacred` son los más alineados del sitio.

**Gap 1 — Tagline ausente del hero.**
El sitio no muestra el tagline operativo ni el poético en ningún punto visible de la home. El eyebrow del hero es `"MARI MARI · TRUCKEE, CALIFORNIA"` (correcto como marca de lugar) pero no comunica la propuesta de marca al primer visitante. El tagline debe aparecer — en el hero o inmediatamente debajo del headline.

**Gap 2 — USP grid usa lenguaje genérico.**
Los cuatro bloques de `values` (`en.json` líneas 274-281) usan frases del tipo `"Premium Quality"`, `"Intentional Design"`, `"Selected Materials"` — que son exactamente el tipo de ecommerce genérico que el DNA prohíbe. La sección existe pero no habla con la voz de la marca. El bloque `values.noble`, `values.craft`, `values.ship` y `values.pickup` (que sí tienen la voz correcta) están definidos en `en.json` pero NO son los que se renderizan en `index.astro`. El home carga `titanium`, `materials`, `design`, `quality` — los genéricos.

**Fix:** En `index.astro` reemplazar los 4 items del array de la sección USPs para usar `en.values.noble`, `en.values.craft`, `en.values.ship` y `en.values.pickup`. El copy ya existe en `en.json` — solo requiere cambiar los keys referenciados.

---

### About (`/about`)

**OK:** La estructura es sólida. El bloque de story (`"From the southern Andes to the Sierra Nevada."`) es correcto en tono. `artistry.p2` ("Why some pieces take months. Why a one-of-a-kind sells once and becomes a memory.") es la mejor línea de marca del sitio.

**Gap 3 — Intro de la página no incluye el manifiesto.**
`a.intro` dice: `"Wenu Mapu — upper land, sky world. A small jewelry studio in Truckee, California, forging body jewelry by hand from titanium, silver, gold, wood and stone."` Es factual y correcto, pero no activa la voz ritual del DNA. El About es el lugar donde debe vivir el manifiesto (`"We believe your body is sacred territory. Every adornment you choose is an act of intention — a ritual."`). Actualmente ese manifiesto no aparece en ninguna página del sitio.

**Gap 4 — Stockists menciona "Thrue Tattoo" en el DNA pero no en el About.**
`a.stockists.list` en `en.json` hace referencia a "Truckee, California — workshop visits by appointment" y "Reno, Nevada — quarterly piercing pop-ups (next: TBD)" pero no menciona Thrue Tattoo, que sí está en el DNA original como vitrina física aliada. Confirmar si la alianza Thrue Tattoo sigue activa antes del lanzamiento y alinear el texto.

**Gap 5 — Materiales en About listan "Sterling silver 925" pero el DNA canónico especifica 950.**
`about.materials.items[1]` dice `"Sterling Silver 925"` con descripción de 92.5% de plata. El DNA (`BRAND-DNA-2026-05-03.md`, sección 4) y el resto del sitio (incluyendo las landing pages de material) usan Sterling Silver 950. Esta inconsistencia es visible al usuario y daña la credibilidad de materiales.

**Fix prioritario:** Cambiar en `en.json` el ítem de `about.materials` de 925 → 950 y actualizar la descripción a "95% pure silver" alineado con la landing `/material/sterling-silver`.

---

### Contact (`/contact`)

**OK:** La estructura de canales es clara y funcional. El uso del mapudungun (`RÜPÜ · GET IN TOUCH`) es correcto y consistente con el tono ritual.

**Gap 6 — "48 business hours" aparece tres veces en la misma página.**
`contact.intro`, `departments_intro` y `faq.intro` repiten la misma promesa de respuesta en 48 horas. En la página de contacto esto aparece en el encabezado y en la sección de departamentos — es redundante. Quitar una ocurrencia.

**Gap 7 — Tono del bloque de departamentos es operativo-frío.**
`"Reach the right desk directly."` y `"All addresses respond within 48 business hours."` es lenguaje de soporte corporativo. La voz de marca en este punto debería ser más directa y menos burocrática. Sugerencia de fix: `"Write to the desk that makes sense. We respond within 48 hours."` — eliminar "business" en este contexto de marca sensorial.

---

### PDP (`/p/[slug]`)

**OK:** La estructura de la página es funcional. La limpieza visual es coherente con el posicionamiento premium. Los links contextuales (care guide, sizing, custom) son correctos.

**Gap 8 — Fallback de descripción es genérico.**
Si el producto no tiene descripción, el PDP genera: `"[Product name] — handcrafted body jewelry by Wenu Mapu."` — esto es correcto para SEO pero si un producto llega al lanzamiento sin descripción el usuario lo verá en pantalla. Verificar que todos los productos publicados en WC tienen description antes del launch.

**Gap 9 — "NO IMAGE" placeholder es visible.**
Si un producto publicado no tiene imagen, el PDP muestra el texto `"NO IMAGE"` en mayúsculas en un bloque gris. Esto es inaceptable para el posicionamiento premium de la marca. Verificar que todos los productos publicados tienen al menos una imagen antes del launch — o cambiar el placeholder a un SVG de marca coherente (el cardinal cross que ya existe en `ProductCard.astro` para este caso).

**Gap 10 — "Add to cart" envía al carrito WordPress legacy.**
`/p/[slug]` tiene el botón "Add to cart →" apuntando a `https://www.wenumapuonline.com/cart/?add-to-cart=${product.id}`. Esto es correcto para el estado actual del proyecto, pero significa que el usuario pasa del sitio nuevo al sitio WordPress antiguo al comprar. Esta fricción de UX debe estar documentada en el plan de lanzamiento y comunicada al equipo — no es un gap de marca sino un gap de experiencia que afecta la percepción de calidad.

---

## 3. Tagline + Elevator Pitch finales (EN)

Basados en el DNA canónico. Listos para copiar y pegar.

### Tagline (max 6 palabras)

```
Adornment for the sacred body.
```

*Nota: ya aparece como headline de home. Funciona como tagline si se usa solo, sin contexto de hero. Alternativa más breve y apta para bio de IG:*

```
Ritual body jewelry. Forged by hand.
```

### Elevator 1 línea (max 25 palabras — para IG bio, meta description)

```
Hand-forged ritual body jewelry from Truckee, California. Titanium, silver, meteorite. No middlemen. Direct from the studio to your body.
```

*(23 palabras)*

### Elevator 50 palabras (para About / Press)

```
Wenu Mapu — "Land of the Sky" in Mapuche — is a studio and portal in Truckee, California. We forge body jewelry by hand: implant-grade titanium, sterling silver 950, 14k gold, Atacama meteorite. Each piece is one of a kind. No factory. No middlemen. Born in Chile. Worn by the world.
```

*(52 palabras — recortar "Born in Chile. Worn by the world." para entrar en 45 si se necesita)*

---

## 4. Sistema de hashtags IG

30 hashtags estratificados. Listos para copiar.

### Brand (5) — usar en cada post

```
#wenumapuonline #wenumapujewelry #wenumapu #ritualadornment #sacredbodyjewelry
```

### Nicho — body jewelry específico (10)

```
#bodyjewelry #bodyjewelrylovers #earlobe #earstretching #septumjewelry #titaniumjewelry #plugsandtunnels #hangers #elobeweights #sterlingsilver950
```

### Lifestyle ritual (10)

```
#ritualjewelry #ancestraljewelry #handcraftedjewelry #artisanjewelry #intentionalliving #sacredbodyart #bodyistemple #cosmicjewelry #mapucheculture #attackamameteorite
```

### Long-tail — intención de compra (10)

```
#bodyjewelryshop #customjewelrycommission #handforgedjewelry #smallbatchjewelry #independentjeweler #truckeelocal #northlaketahoeliving #plugsofinstagram #septumring #bodymodification
```

**Nota de uso:** No usar los 30 en cada post. Rotar por grupo: brand siempre presentes + 6-8 del grupo relevante a ese post. Máximo 15-20 por caption para no parecer spam.

---

## 5. Templates de copy para IG posts

Voz: primera persona plural de la marca, sensorial y concreta. Sin emojis salvo donde se indica el contexto que los requiere.

---

### Template 1 — Nuevo producto

**Caption:**

```
[Nombre del producto]. [Material]. [Una frase sensorial del material canonico].

Esta pieza sale del estudio esta semana. [Detalle específico: número de unidades disponibles / qué la hace distinta]. 

Link en bio — o escríbenos por DM si quieres reservarla antes de que aparezca en el catálogo.

#wenumapuonline #ritualjewelry #handcraftedjewelry #bodyjewelry [+ 4-6 hashtags de nicho relevantes]
```

**Ejemplo aplicado:**

```
Ritual Ring Vacamuerta No. 21. Sterling silver 950 and Atacama meteorite — 4.5 billion years of origin, set by hand in Truckee.

One piece. The Widmanstätten pattern on this fragment reads like a map of something older than the Earth.

Link in bio. DMs open if you want it held.

#wenumapuonline #ritualring #vacamuerta #attackamameteorite #sterlingsilver950 #handforgedjewelry #sacredbodyjewelry
```

---

### Template 2 — Journal entry

**Caption:**

```
[Frase de apertura que nombra el material o el proceso — no el producto].

[Dos a tres oraciones sobre lo que ocurre en el estudio esta semana. Proceso, decisión de material, problema que se resolvió. Concreto, no poético abstracto].

[Cierre: qué viene / qué se puede pedir].

#wenumapuonline #handforgedjewelry #studiojewelry #artisanjewelry #smallbatchjewelry
```

**Ejemplo aplicado:**

```
This week: walnut wood and the question of grain direction.

When you turn a plug from solid wood, the direction the grain runs determines whether it cracks under body pressure or holds for years. We rejected three blanks before finding the right cut on a fourth. The piece ships next Tuesday.

Made-to-order in the same gauge. DM with your size.

#wenumapuonline #woodjewelry #handforgedjewelry #plugsandtunnels #artisanjewelry
```

---

### Template 3 — Ritual story (cosmología / manifiesto)

**Caption:**

```
[Concepto o fuerza cosmológica: un cardinal, un material, una práctica de cuerpo].

[Dos oraciones que conectan ese concepto con la pieza o con la práctica de adornarse. Usar vocabulario aprobado: ritual, sacred, portal, threshold, signal, origin].

[Una oración final que cierra con la pieza o con una invitación a la acción, sin ser comercial].

#wenumapuonline #ancestraljewelry #ritualjewelry #sacredbodyjewelry #mapucheculture #cosmicjewelry
```

**Ejemplo aplicado:**

```
Nüku Mapu. North. Earth. Ancestry.

In Mapuche cosmology, the north cardinal holds what came before — the lineage, the root, the weight of origin. We forge ear weights for the north direction: pieces you feel on the body, not just see.

The new Nüku pair is in the catalogue.

#wenumapuonline #earweights #ancestraljewelry #mapucheculture #ritualjewelry #sacredbodyjewelry #earlobe
```

---

### Template 4 — Behind the scenes

**Caption:**

```
[Una sola acción: lo que está pasando en el estudio ahora mismo. Sin introducción].

[Detalle técnico o decisivo que explica por qué esa acción importa. El trabajo artesanal tiene fricción — mostrarla].

[Opcional: resultado que viene / pieza que saldrá].

#wenumapuonline #handforgedjewelry #smallbatchjewelry #studiojewelry #independentjeweler
```

**Ejemplo aplicado:**

```
Filing the setting seam on a meteorite piece takes about 40 minutes by hand. There is no shortcut that doesn't show on the surface.

The Widmanstätten pattern is fragile along the edges. One wrong file pass cracks the etch. We slow down here every time.

This ring ships Thursday.

#wenumapuonline #vacamuerta #handforgedjewelry #ritualring #studiojewelry #smallbatchjewelry
```

---

### Template 5 — Testimonial / cliente

**Caption:**

```
[Cita directa del cliente — en sus palabras, sin edición de marca. Entrecomillado].

— [Nombre o inicial, ciudad, pieza que recibió]

[Una oración de la marca que contextualiza sin inflar. Nunca "nos alegra" ni "estamos orgullosos de"].

[CTA: link en bio / DM para la misma pieza o para curation].

#wenumapuonline #ritualjewelry #bodyjewelry #handcraftedjewelry [+ 2-3 de nicho]
```

**Ejemplo aplicado:**

```
"I've worn this septum ring every day since it arrived. It doesn't feel like jewelry — it feels like something that was always supposed to be there."

— M., Portland, OR — Mystic Snake septum in titanium

That's the point. Link in bio for the full septum collection.

#wenumapuonline #septumjewelry #ritualjewelry #titaniumjewelry #bodyjewelry
```

---

## 6. Riesgos de marca para los primeros 30 días

Lo que no hacer en el período de lanzamiento:

**No hacer descuentos porcentuales visibles en el primer mes.**
Un "20% OFF launch sale" destruye el posicionamiento premium antes de establecerlo. Si se quiere activar tráfico, hacerlo vía free shipping en pedidos sobre $100, o vía acceso anticipado a piezas nuevas para subscribers — no vía descuento en precio de lista.

**No publicar más de 1 post por día en IG las primeras dos semanas.**
El algoritmo favorece consistencia, no volumen. Saturar el feed de lanzamiento parece desesperado. Frecuencia recomendada para launch: 4-5 posts por semana + stories diarias. Los posts deben ser los templates de arriba — no reposts genéricos.

**No usar los productos con stock 0 como contenido principal.**
Mystic Bee y Mystic Snake figuran como "out of stock" en el DNA desde el snapshot de abril. Si se muestran en IG en las primeras semanas y el usuario no puede comprarlos, se genera frustración. Usar solo piezas disponibles en el contenido de presentación, a menos que el post sea explícitamente "coming soon" con fecha.

**No responder consultas de precio por DM con el precio a secas.**
El primer contacto de compra establece el tono. La respuesta debe incluir: precio + material + gauge disponible + tiempo de envío + invitación a ver el catálogo. Cero mensajes de una sola línea con el número de dólares.

**No publicar copy generado por IA sin revisar contra el vocabulario prohibido.**
Las palabras `beautiful`, `magical`, `enchanted`, `perfect`, `unique`, `positive energy` y los nombres tipo `Mapuche Root` / `Earthborn` están documentadas como prohibidas. Cualquier caption o descripción generada externamente debe revisarse contra la lista de la sección 8 del DNA antes de publicar.

**No lanzar campañas de ads pagados antes de tener al menos 9 posts de feed coherentes.**
Un perfil con menos de 9 posts que recibe tráfico pagado tiene una tasa de conversión a seguidor cercana a cero. El perfil debe verse como marca establecida antes de comprar tráfico.

**No prometer tiempos de entrega que no se pueden cumplir.**
El DNA dice 2–5 días hábiles de procesamiento y 2–3 días USPS Priority. Si el volumen de lanzamiento supera la capacidad del estudio, actualizar el copy de la tienda WC inmediatamente — no dejar las promesas de tiempo originales activas si no se pueden cumplir.

---

*Fuentes: `BRAND-DNA-2026-05-03.md` · `voz-de-marca-real-2026-05-03.md` · `copy-frontend-2026-05-01.md` · `src/i18n/en.json` · páginas `/`, `/about`, `/contact`, `/p/[slug]`*

*[[brand/MARCA-maestro]]*
