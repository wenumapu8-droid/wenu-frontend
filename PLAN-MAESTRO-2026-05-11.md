# Plan Maestro · Wenu Mapu → Sitio App-Profesional
*Generado 2026-05-11 · Sesión Claude · post-auditoría*

## Visión declarada por el owner

> Página web que se sienta como **app profesional** y que la gente **se atreva a descubrir**. Herramienta de facturación operativa. Espacio de creación, inspiración y sabiduría ancestral. Objetivo: $10K USD/mes mínimo.

## Estado real del catálogo WC (auditado hoy)

| Métrica | Cantidad | Problema |
|---|---|---|
| Publicados | 62 | Base existente |
| **Sin foto** | **12** | No se ven en el shop, dan placeholder "NO IMAGE" |
| **Sin precio** | **35** ⚠️ | **No se pueden vender** — 56% del catálogo |
| Sin descripción ≥50 chars | 10 | Bajo SEO + bajo trust |
| Sin short_description | 31 | PDPs sin gancho corto |
| Duplicados detectados | 24 (3 clusters) | "handmade plug stone 10mm" ×17, "labret" ×3, "hanger" ×4 |

## Estado del frontend Astro (preview live)

✅ 105 páginas estáticas, build verde
✅ Tasks Codex 1-6 mergeadas (footer, materials, forms, journal, collections, PDP trust+related)
✅ Apex 502 muerto (Page Rule Cloudflare)
✅ 62/62 productos WC categorizados
✅ Nav arreglado: Commissions + Care visible
✅ Care nav → aftercare.wenumapuonline.com (subdominio existente, separado)
⏸ Cutover apex+www → Pages: **autorizado, esperando fotos completas primero**

## Brand folder (auditado)

**Existe:** `~/Obsidian/WenuAgent/brand/`
- BRAND-DNA-2026-05-03.md (9.5K)
- voz-de-marca-real-2026-05-03.md (4.7K)
- copy-frontend-2026-05-01.md (6.6K)
- color-palette.md, typography.md, patterns-textures.md
- 2 logos PNG (white + final)

**Vacío / faltante:**
- `brand/fotografias/` (carpeta vacía)
- `brand/guias/` (carpeta vacía)
- Logos en SVG (solo PNG)
- Variaciones de logo (vertical, horizontal, monocromo)
- Patterns mapuche en SVG vectorial
- Iconografía de marca
- Mockups
- Templates Instagram/TikTok
- Photo direction guide
- Font files (.otf/.ttf)

**Marketing folder:** `~/Downloads/WenuMapu/Marketing/`
- 4 banners webp (meteorite collection, ritual rings)
- 3 QR codes (Form, AftercareGuide, generic)
- 2 CSVs

---

# FASES PROPUESTAS · ordenadas por impacto $

## 🟢 FASE 0 · LIMPIEZA CATÁLOGO (urgente, 2 días, mayor ROI)

**Por qué primero:** sin esto, cualquier cutover muestra un sitio con productos rotos. El 56% del catálogo no vende por falta de precio.

### 0.1 NocoDB → WC bridge
- [ ] Recibir URL + token NocoDB del owner
- [ ] Script de mapeo: por SKU/nombre, hacer match NocoDB ↔ WC
- [ ] Para los **12 productos sin foto** en WC: traer fotos macro desde NocoDB
- [ ] Para productos que están en NocoDB pero NO en WC: crear nuevos con datos completos
- [ ] Optimización automática: strip EXIF + convertir a WebP (calidad 85, max 1600px)

### 0.2 Precios faltantes (35 productos)
- [ ] Listar los 35 sin precio
- [ ] Owner asigna precio a cada uno (sheet o NocoDB)
- [ ] Bulk update vía WC API

### 0.3 Dedup (24 productos en 3 clusters)
- [ ] Aplicar dup-2 (hanger) + dup-3 (labret) en WC (ya hicimos en local)
- [ ] Owner revisa dup-1 (canonical=None, raro) y dup-4 (advertencia categorías)
- [ ] Aplicar tras OK

### 0.4 Limpiar productos zombi
- [ ] Productos sin foto Y sin precio Y sin descripción → archivar (no borrar, mover a status=draft o trash con backup)

**Entregables Fase 0:**
- Catálogo WC con 62-80 productos vendibles (foto + precio + descripción + categoría)
- Backup completo del estado pre-cambio

---

## 🟢 FASE 1 · PÁGINA PIERCING + INTEGRACIÓN CALENDLY (1-2 días)

**Por qué:** el piercing es servicio de alto ticket (~$100-300 por sesión) con margen alto. Calendly es industria estándar.

### 1.1 Integración Calendly
- [ ] Owner crea/comparte URL Calendly: ej. `https://calendly.com/wenu-mapu/piercing`
- [ ] Tipos de cita en Calendly:
  - "Piercing consultation" (15 min, gratis)
  - "Piercing session" (60-90 min, $X)
  - "Stretching consultation" (30 min)
- [ ] Embed Calendly en `/piercing/` con `data-url` + `data-text-color` matching dark theme
- [ ] Webhook Calendly → email a `marimari@`

### 1.2 Rediseño `/piercing/`
- [ ] Hero: foto macro + headline "Piercing ritual · Truckee, California"
- [ ] Servicios y precios (tabla limpia)
- [ ] Materiales seguros (ASTM F-136 titanio, oro 14k, niobio)
- [ ] Proceso (5 pasos: consulta → desinfección → marca → piercing → aftercare)
- [ ] Galería de placements
- [ ] Calendly embed final
- [ ] Link a `aftercare.wenumapuonline.com` post-procedimiento

### 1.3 Pre/post-cita digital
- [ ] Email automático pre-cita (qué traer, qué comer, contraindicaciones)
- [ ] Email post-cita con link a aftercare
- [ ] Recordatorio 24h antes

**Decisión owner necesaria:**
- ¿Qué servicios concretos? Lista con precios para configurar Calendly.
- ¿Usuario Calendly free o paid? (paid permite branding + webhooks)

---

## 🟡 FASE 2 · ENCARGOS / COMMISSIONS (6 meses + abonos, 3-5 días)

**Por qué:** ticket promedio $1500-5000 USD. Una commission/mes = $18K-60K/año. Sistema de cuotas reduce fricción.

### 2.1 Estructura del workflow de 6 meses

| Mes | Hito | Cliente paga | Owner entrega |
|---|---|---|---|
| 0 | Brief inicial firmado | **30% depósito** | Diseño boceto + materiales propuestos |
| 1 | Aprobación diseño | — | Sourcing materiales (meteorito Atacama, vacamuerta wood, etc.) |
| 2 | Forge iniciado | **30% abono** | Fotos en taller, video del proceso |
| 3 | Pieza en limado/acabado | — | Foto WIP |
| 4 | Pulido final | **30% abono** | Foto final |
| 5 | Sesión fit (presencial o video) | — | Ajustes finales |
| 6 | Entrega | **10% final** | Pieza entregada + certificado autenticidad |

### 2.2 Página `/commissions/` rediseñada

**Bloques necesarios:**
- Hero: "Forged with you in mind · 6 months · One of one"
- Cómo funciona (timeline visual 6 meses)
- Galería de comisiones pasadas (necesita 6-12 fotos macro de obras previas)
- Tipos: rings, amulets, piercing tops, hangers, ear weights
- Materiales: 14k gold, sterling 950, titanium, meteorite, vacamuerta wood
- Formulario brief (ya existe `CustomOrderForm.astro`, expandir)
- FAQ específica de commissions
- Precios desde X (decisión owner)
- Sistema de cuotas explicado

### 2.3 Pagos por cuotas — opciones técnicas

**Opción A · Stripe Payment Links manuales (más simple, 1h setup)**
- Owner crea 4 payment links en Stripe por commission (30/30/30/10)
- Envía links por email según hito
- No requiere desarrollo, escalable, $0.30+2.9% por transacción

**Opción B · WC Subscriptions (más complejo, requiere plugin $)**
- Plugin "WooCommerce Subscriptions" ($229/año)
- Cliente paga automático cada hito
- Más automatizado pero rígido en fechas

**Opción C · Stripe Custom + Astro form (medio, 1-2 días dev)**
- Cliente firma brief → recibe link único de pago programado por hitos
- Más fluido UX, requiere desarrollo

**Recomendación:** empezar con A (manual), migrar a C cuando haya 5+ commissions/mes.

### 2.4 Galería de obras pasadas
- [ ] Owner selecciona 6-12 commissions ya entregadas
- [ ] Foto macro (con setup macro fotografía personal)
- [ ] Mini-story por pieza (3 líneas: cliente, materia, intención)
- [ ] Permission del cliente para mostrarla

---

## 🟡 FASE 3 · COLECCIONES PROFUNDAS + CONJUNTOS (2-3 días)

**Estado actual:** 3 collection pages (mystic-series, ritual-ring-vacamuerta, author-jewelry) en `src/pages/collection/`.

### 3.1 Expansión por colección
Cada colección necesita:
- [ ] **Story** (1500-2500 palabras editorial — quién la inspiró, qué representa)
- [ ] **Lookbook** (4-8 fotos lifestyle del modelo usando piezas en contexto)
- [ ] **Material guide** (qué metales/piedras, por qué se eligieron)
- [ ] **Edición info** (1/1, edición limitada de N, etc.)
- [ ] **Linked products** (todos los productos de esa colección)

### 3.2 Conjuntos (sets curados)
Nueva sección `/conjuntos/` o `/sets/`:
- [ ] Conjuntos pre-armados por estilo (Ritual / Cotidiano / Ceremonial)
- [ ] Fotos lifestyle del conjunto puesto
- [ ] Botón "Comprar el conjunto completo" (descuento -15% bundle)
- [ ] Cada conjunto = 3-7 piezas

### 3.3 Banners de conjuntos
- [ ] 6-10 fotos lifestyle horizontal (1920x800 mínimo) de conjuntos en contexto
- [ ] Optimización: AVIF + WebP + JPG fallback
- [ ] Usar en home, en colección, en footer

**Necesita:**
- Sesión foto modelo + 3-5 sets curados
- Brief de fotografía: locación natural Truckee, luz dorada, fondo orgánico
- Mood board (Aesop ritualizado + Petite Anna Kaminski editorial)

---

## 🟣 FASE 4 · SOUL · SENSACIÓN APP PROFESIONAL (3-5 días)

**Por qué:** acá vive la "sofistiqueza" que pidió el owner.

### 4.1 Movimiento + microinteracciones
- [ ] Hero loop sutil (video 6-10s del modelo respirando, piezas en movimiento orgánico)
- [ ] Cards de productos: hover con segunda foto + zoom suave
- [ ] Cursor custom (círculo + dot que crece en hover)
- [ ] Page transitions (View Transitions API o Barba.js)
- [ ] Parallax sutil en hero sections
- [ ] Texto fade-in progresivo en scroll (Intersection Observer ya en uso)
- [ ] Skeleton loaders para imágenes pesadas

### 4.2 3D rotativo en PDPs (necesita iPad scan)
- [ ] Owner escanea 6-10 piezas top con Polycam → exporta `.glb`
- [ ] Integrar `<model-viewer>` web component en PDP
- [ ] Auto-rotate + manual rotate + AR ready
- [ ] Lazy load (solo cargar 3D al click)

### 4.3 Elementos gráficos mapuche
- [ ] Dividers ornamentales SVG (necesita assets — ver prompts ChatGPT abajo)
- [ ] Patterns sutiles de fondo en secciones específicas
- [ ] Iconografía custom (cardinal cross, kultrun, copihue)

### 4.4 Editorial / sabiduría ancestral
- [ ] Journal: expandir las 6 entries existentes a 1500-3000 palabras cada una
- [ ] Sección "Cosmología" con artículos largos
- [ ] Glosario mapudungun + significado
- [ ] Audio: pronunciación de palabras mapudungun

---

## 🔵 FASE 5 · IDENTIDAD GRÁFICA REORGANIZADA (1-2 días)

### 5.1 Reorganización del brand folder

Estructura propuesta:
```
~/Obsidian/WenuAgent/brand/
├── 00-Mapa-Brand.md             ← índice maestro
├── 01-identity/
│   ├── BRAND-DNA.md
│   ├── voz-de-marca.md
│   └── manifesto.md
├── 02-visual-system/
│   ├── color-palette.md
│   ├── typography.md
│   ├── patterns-textures.md
│   └── grid-spacing.md
├── 03-logos/
│   ├── png/ (existentes)
│   ├── svg/ (TODO crear)
│   ├── variations/ (horizontal, vertical, mono, color)
│   └── lockups/
├── 04-photography/
│   ├── direction-guide.md
│   ├── product-macro/
│   ├── lifestyle/
│   └── conjuntos/
├── 05-graphics/
│   ├── dividers-svg/
│   ├── patterns-svg/
│   ├── icons/
│   └── frames/
├── 06-social-templates/
│   ├── instagram-post/
│   ├── instagram-story/
│   ├── tiktok/
│   └── pinterest/
├── 07-marketing-collateral/
│   ├── banners/
│   ├── qr-codes/
│   └── flyers/
└── 08-copy-bank/
    ├── copy-frontend.md
    └── copy-social.md
```

### 5.2 Variaciones de logo necesarias
- [ ] Logo SVG (vector — recrear desde PNG con ChatGPT/Illustrator)
- [ ] Horizontal full color
- [ ] Horizontal mono blanco
- [ ] Horizontal mono negro
- [ ] Vertical full color
- [ ] Vertical mono blanco
- [ ] Solo isotipo (sin texto)
- [ ] Favicon 32x32 + 192x192 + 512x512

### 5.3 Assets gráficos necesarios

Para producir, ver "Prompts ChatGPT" abajo.

---

# 🎨 PROMPTS PARA CHATGPT (imagen + texto)

## Logo en SVG (recrear vectorial)

> "I'm sending a PNG of my brand logo 'Wenu Mapu'. Trace it as a clean SVG with:
> - Bone color #F2EDE4 fill
> - 1px stroke clean paths
> - No raster effects
> - Single-color (one fill)
> - Optimized paths (max 50 nodes)
> - Output: SVG code I can paste in HTML."

## Patterns mapuche para divider

> "Generate 4 horizontal SVG dividers inspired by Mapuche textile patterns (witral). Style:
> - Geometric, repeating step-pyramid motifs
> - Bone color #F2EDE4 lines on transparent background
> - Width: 1200px, Height: 24-48px
> - Subtle, not loud
> - Variants: (a) cardinal cross repeat, (b) zigzag with diamonds, (c) stepped triangles, (d) abstract weave
> - Output as 4 separate SVGs, optimized, paste-ready."

## Iconografía custom (cardinal cross, kultrun, copihue)

> "Design 6 minimal line-art icons for an ancestral jewelry brand:
> 1. Cardinal cross (mapuche 4 directions)
> 2. Kultrun (mapuche ceremonial drum, top view)
> 3. Copihue (Chilean national flower, simplified)
> 4. Volcano + smoke (Andean)
> 5. Meteor + trail
> 6. Spiral (ancestral memory)
> Style: 1.4px stroke, rounded ends, bone #F2EDE4, 48x48px each, SVG."

## Mood board fotográfico

> "Create a 9-image mood board for jewelry photography direction:
> - Brand: ancestral mapuche × cosmic ritual × Truckee high-Sierra
> - Aesthetic reference: Aesop editorial + Hodinkee macro + Petite Anna Kaminski
> - Tone: dark, intimate, natural light, golden hour, soft shadows
> - Subjects: hands wearing rings, ear weights in profile, plug macro with skin, model in dark veil
> - Output: grid of 9 representative images describing the style I want to commission."

## Banners conjuntos (lifestyle)

> "Direction for 6 horizontal lifestyle banner photos (1920x800):
> 1. Hand emerging from dark wool with ring (top-down)
> 2. Ear profile with hanger + ear weight set, dark hair
> 3. Hands holding cup with multiple rings, candle light
> 4. Macro detail of pendant on collarbone
> 5. Workshop scene: hands working at bench, fire, tools
> 6. Truckee snow + figure with dark cloak, distant
> All: cinematic, 35mm grain, color grade obsidian/bone/bronze, model gaze inward."

## Templates Instagram

> "Design 5 Instagram post templates (1080x1080) for Wenu Mapu:
> - Dark obsidian background #080706
> - Bone #F2EDE4 typography
> - Bronze accent #8A6A43
> - DM Serif Display headlines, Source Serif Pro body
> Templates:
> 1. Product launch (photo top, name, material, price)
> 2. Quote / mantra
> 3. Behind the scenes
> 4. New journal entry teaser
> 5. Customer testimonial
> Output: Figma file or Canva-ready specs."

## Cursor custom CSS/SVG

> "Generate a custom cursor as SVG for a luxury jewelry website:
> - Default: small bronze circle 8px with subtle 1px stroke
> - Hover state: circle grows to 32px with dotted ring outside
> - Click state: brief contraction animation
> - Color: bronze #8A6A43 on dark obsidian backgrounds
> Output: SVG + CSS implementation."

---

# DECISIONES OWNER NECESARIAS

1. **NocoDB URL + token API** (desbloquea Fase 0.1 — el más impactante)
2. **Lista de 35 productos sin precio + precio sugerido** (Fase 0.2)
3. **Calendly URL + tipos de cita + precios** (Fase 1.1)
4. **Stripe option A/B/C para commissions** (recomendado A: payment links manuales)
5. **6-12 fotos de commissions pasadas + permiso clientes** (Fase 2.4)
6. **Brief de colecciones a expandir** (cuáles 3 expandir primero, Fase 3.1)
7. **iPad: ¿escanear 1 pieza piloto con Polycam?** (Fase 4.2)
8. **Sesión foto lifestyle para banners y conjuntos** (Fase 3.3) — coordinar con tu modelo

---

# CRONOGRAMA SUGERIDO (3 semanas)

```
Sem 1 (12-18 mayo)
├─ Lu-Ma: Fase 0 (Limpieza catálogo + NocoDB)
├─ Mi:    Fase 0 (precios) + Fase 5.1 (reorganizar brand folder)
├─ Ju:    Fase 1.1 (Calendly setup)
└─ Vi:    Fase 1.2-1.3 (rediseño /piercing/)

Sem 2 (19-25 mayo)
├─ Lu-Ma: Fase 2.1-2.2 (workflow + rediseño /commissions/)
├─ Mi:    Fase 2.3 (Stripe payment links)
├─ Ju-Vi: Fase 2.4 (galería commissions) + Fase 5.2-5.3 (logos SVG + assets)

Sem 3 (26 may - 1 jun)
├─ Lu-Ma: Fase 3 (colecciones profundas + conjuntos)
├─ Mi:    Fase 4.1 (microinteracciones)
├─ Ju:    Fase 4.2 (3D si escaneo está)
├─ Vi:    Fase 4.3-4.4 (gráficos mapuche + editorial)
└─ Cierre: CUTOVER apex+www → Pages (sitio nuevo en producción)
```

---

# QUÉ PUEDO ARRANCAR YO YA (sin esperar nada del owner)

1. ✅ Subir las 4 banners webp + 3 QR codes de `Downloads/WenuMapu/Marketing/` al brand folder organizado
2. ✅ Reorganizar `~/Obsidian/WenuAgent/brand/` con la estructura propuesta (5.1)
3. ✅ Limpiar duplicados WC dup-2 y dup-3 (ya hicimos local, aplicar al WC)
4. ✅ Identificar y archivar productos sin precio + sin foto + sin descripción (Fase 0.4)
5. ✅ Generar PNG → SVG trace básico de los 2 logos existentes (Fase 5.2)
6. ✅ Crear los 4 SVG dividers mapuche básicos (geometría simple)
7. ✅ Expandir 1-2 journal entries actuales a contenido más editorial
8. ✅ Crear estructura de `/commissions/` rediseñada (esqueleto, sin Stripe aún)
9. ✅ Crear estructura de `/sets/` (vacía, lista para fotos)
