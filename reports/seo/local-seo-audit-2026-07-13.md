# Local SEO audit — wenu-frontend — 2026-07-13

## Estado general
- **Build local:** OK
- **Comando validado:** `npm run build`
- **Salida:** `242` páginas estáticas construidas
- **Productos publicados renderizados en build:** `158`
- **Postbuild:** `verify-build` OK
- **Catálogo:** `audit-catalog.mjs --soft` corre, pero hoy quedó con limitación de snapshot Noco faltante (`/tmp/noco.db` ausente)

## Hallazgo principal
El repo **local Astro** ya resolvió gran parte de los problemas SEO graves que aparecían en la auditoría live anterior sobre superficies WordPress viejas.

En local:
- hay `title`, `meta description` y `canonical` globales en `src/layouts/Base.astro`
- Home sí tiene **H1 real** dentro de `HeroCarousel.astro`
- Shop sí tiene **H1 real** + description + JSON-LD
- Contact sí tiene **H1 real** + description + JSON-LD local business
- existen landings SEO más fuertes que las categorías viejas de Woo/WordPress:
  - `/piercing-jewelry`
  - `/ear-weights`
  - `/hangers`
  - `/material/titanium`
  - `/material/*`
  - `/collection/*`

## Evidencia puntual

### 1) Base SEO global existe y está bien armada
**Archivo:** `src/layouts/Base.astro`

Incluye:
- `<title>`
- `<meta name="description">`
- canonical automático desde `Astro.url.pathname`
- Open Graph completo
- Twitter card
- `robots`
- JSON-LD inyectable por página

Esto solo ya corrige buena parte del problema de páginas huérfanas o mudas que sí aparecía en el surface legacy.

### 2) Home local sí tiene H1
**Archivos:**
- `src/pages/index.astro`
- `src/components/HeroCarousel.astro`

La Home monta:
- `title="Wenu Mapu — Adornment for the sacred body"`
- `description="Ancestral-cosmic body jewelry forged by hand in Truckee, California..."`
- `<h1 class="hero-cx__wordmark">...` dentro del hero

**Importante:** el H1 cambia por slide porque el hero es rotativo. Eso funciona semánticamente, pero no es ideal para estabilidad SEO/mensaje principal.

### 3) Shop local ya está bastante mejor que el shop live viejo
**Archivo:** `src/pages/shop.astro`

Tiene:
- `title="Shop — Wenu Mapu"`
- description propia
- H1 real (`{en.shop.title}`)
- intro visible
- `CollectionPage` + `ItemList` + breadcrumbs JSON-LD
- links internos a materiales

### 4) Contact local ya tiene base SEO/local intent
**Archivo:** `src/pages/contact.astro`

Tiene:
- `title="Contact — Wenu Mapu"`
- description propia
- H1 real
- JSON-LD `Jeweler`
- `areaServed` para Truckee / Tahoe

### 5) Existen landings más fuertes para intención comercial real
**Ejemplos:**
- `src/pages/piercing-jewelry.astro`
- `src/pages/ear-weights.astro`
- `src/pages/material/titanium.astro`

Estas páginas están mejor orientadas a intención de búsqueda que las categorías viejas estilo `/categoria-producto/...`.

## Problemas / deuda local real que sí veo

### A. Home: H1 dinámico/rotativo = mensaje principal menos estable
El H1 del hero cambia con cada slide.

**Riesgo:**
- el mensaje principal de Home queda menos fijo
- mezcla colecciones, commissions y piercing en el mismo H1 según el slide activo
- para SEO y claridad comercial conviene un ancla más estable

**Mejor dirección:**
- dejar un H1 fijo, claro y comercial
- mover el cambio de narrativa al subhead / eyebrow / slides, no al H1

### B. Titles buenos pero algunos todavía demasiado editoriales
Hay varios títulos bien hechos, pero algunos priorizan atmósfera sobre query intent.

Ejemplos a revisar después:
- `Shop — Wenu Mapu`
- `Contact — Wenu Mapu`
- `Materials — Wenu Mapu`
- `About — Wenu Mapu`
- `Journal — Wenu Mapu`

No están mal, pero todavía pueden ganar intención de búsqueda sin romper marca.

### C. Duplicidad conceptual entre `/material/` y `/materials`
En el repo existen ambas rutas:
- `/material/index.astro`
- `/materials.astro`

Eso merece revisión porque puede generar:
- superposición temática
- canibalización interna
- confusión de linking

### D. La deuda más pesada hoy no es meta SEO: es catálogo/foto curada
El build pasa, pero el postbuild deja `136 warning(s)` de catálogo, casi todos por:
- `no curated photo in final/<SKU>/`

Eso pega en:
- CTR
- confianza
- calidad percibida
- consistencia visual

O sea: el cuello real no es solo titles/metas. También es **fidelidad visual del catálogo publicado**.

### E. Snapshot Noco local faltante
Postbuild avisó:
- `/tmp/noco.db` ausente

Entonces el `audit-catalog --soft` hoy corre con capacidad reducida para el cruce WC↔Noco.

## Oportunidades 80/20

### Prioridad 1 — fijar mensaje SEO estable en Home
Cambiar la Home para que el **H1 no rote**.

Objetivo:
- una sola promesa principal
- más clara para usuario y buscador
- dejar el carrusel como apoyo narrativo, no como fuente cambiante del H1

### Prioridad 2 — endurecer títulos de páginas madre
Primer lote lógico:
- Home
- Shop
- Contact
- Piercing
- Piercing Jewelry
- Ear Weights
- Hangers
- Materials / Titanium

### Prioridad 3 — elegir una arquitectura canónica para materiales
Definir si la ruta madre canónica es:
- `/material/`
- o `/materials`

Y después reforzar linking hacia esa sola familia.

### Prioridad 4 — usar landings Astro como superficie SEO madre, no las categorías legacy
Si el storefront real ya sirve Astro, la apuesta SEO debería ir a:
- `/shop`
- `/piercing-jewelry`
- `/ear-weights`
- `/hangers`
- `/material/titanium`
- `/collection/...`

No a empujar categorías viejas ambiguas del Woo legacy.

### Prioridad 5 — combinar SEO on-page con cierre de deuda visual
Cada mejora de landing/category conviene cruzarla con:
- foto curada real
- PDPs con imagen confiable
- familias que ya tengan suficiente material visual

## Archivos revisados
- `src/layouts/Base.astro`
- `src/pages/index.astro`
- `src/components/HeroCarousel.astro`
- `src/pages/shop.astro`
- `src/pages/contact.astro`
- `src/pages/piercing-jewelry.astro`
- `src/pages/ear-weights.astro`
- `src/pages/material/titanium.astro`
- `dist/index.html`

## Archivos modificados
Ninguno. Esto fue auditoría local + build + lectura.

## Siguiente paso recomendado
Armar un paquete editorial/SEO concreto con:
1. keyword map
2. H1 propuestos
3. title tags propuestos
4. meta descriptions propuestas
5. orden de implementación 80/20

Y recién después decidir si conviene aplicar cambios en el repo local.