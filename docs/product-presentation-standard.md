# Estándar de Presentación de Producto — Wenu Mapu

Versión 1 · 2026-05-22 · El spec único para cargar cualquier pieza al catálogo.
Lo siguen: el agente curador de fotos, Codex (procesamiento), y quien suba productos
a WooCommerce. Si una pieza no cumple esto, **no se publica**.

---

## 1. El set de fotos — qué necesita cada pieza

Orden canónico (así se cargan en WooCommerce, así se muestran en la PDP):

| # | Tipo | Obligatorio | Trabajo |
|---|---|---|---|
| 1 | **Macro front** | **Sí** | Producto solo, fondo obsidian, luz lateral. La foto principal. |
| 2 | **Escala** | **Sí** | Pieza en cuerpo/mano. Responde "¿qué tamaño tiene?" |
| 3 | Macro detail | Recomendado | Acercamiento a textura/material/cierre. |
| 4 | Lifestyle | Opcional | Modelo editorial — mood, deseo. |

**Regla dura:** sin macro front + escala, la pieza queda en DRAFT. Joyería corporal
sin referencia de tamaño no se vende online (lo que BVLA nunca omite).

---

## 2. Macro — especificación técnica

- **Fondo:** obsidian `#080706` (el negro de la marca). Sin degradados, sin props.
- **Crop:** cuadrado 1:1. La pieza centrada, con aire — no llenar el cuadro al borde.
- **Luz:** lateral, una fuente dominante. Resalta textura y volumen.
- **3 tamaños** + companion AVIF (ya es la convención de los macros existentes):
  - `-front-thumb.webp` — 400px · ~15KB
  - `-front-medium.webp` — 800px · ~40KB
  - `-front-full.webp` — 1600px · ~120KB
- **EXIF:** stripped siempre (GPS, cámara). IPTC: title + copyright `© Wenu Mapu`.

## 3. Naming canónico

```
wm-<sku>-<slug-descriptor>-<vista>-<tamaño>.<webp|avif>
```
Ejemplo: `wm-ear-001-ethnic-shipibo-hoop-earrings-gold-silver-front-full.webp`

- `<sku>` en minúscula con guiones (`wm-ear-001`)
- `<vista>` ∈ `front` · `detail` · `scale` · `lifestyle`
- Todo lowercase kebab-case. Sin espacios, sin tildes, sin emojis.

## 4. Alt text

Plantilla: `Wenu Mapu <título> — <tipo de pieza> in <material>. Hand-curated body jewelry.`
Cada imagen lleva alt. Nunca vacío. Nunca el nombre del archivo.

---

## 5. Datos del producto (WooCommerce)

Cada pieza se carga desde su `product-sheet` con:

- **SKU** `WM-XXX-NNN` — único, obligatorio.
- **Nombre** sin el sufijo "— Curated by Marimari" (queda en metadata).
- **Precio** del frontmatter del sheet (`precio_sugerido_usd`).
- **Slug** explícito (no autogenerado).
- **Descripción** EN en `<p>` HTML · descripción ES en meta `_wenumapu_description_es`.
- **Atributos** WC: Material, Type, y los específicos (Gauge, Sold As…).
- **SEO:** `_yoast_wpseo_title` + `_yoast_wpseo_metadesc`.
- **Status:** `draft` — la dueña publica manualmente tras revisar.
- **Tier:** meta `_wenumapu_tier` (`curated` · `atelier-forged` · `atelier-assembled`
  · `atacama` · `collab`).

---

## 6. Cómo se muestra en el sitio

- **ProductCard (grid /shop, Featured):** usa la macro front. Las piezas sin imagen
  real (placeholder AI, `Sin-titulo`, ChatGPT-Image) **se filtran** — nunca llegan
  al ojo del cliente.
- **PDP `/p/[slug]`:** galería en orden canónico (§1). `<picture>` avif+webp, 3 tamaños.
- **Badges:** `NEW` (primeras 2 semanas) · `LIMITED` (stock ≤ 3). Uno por card, máximo.

---

## 7. Checklist antes de publicar una pieza

- [ ] Macro front en los 3 tamaños + AVIF, fondo obsidian, EXIF stripped.
- [ ] Foto de escala existe.
- [ ] Naming canónico correcto.
- [ ] Alt text en cada imagen.
- [ ] SKU, precio, slug, descripción EN/ES, atributos, SEO completos.
- [ ] Cero placeholders en la galería.
- [ ] Revisada por la dueña → recién ahí pasa de `draft` a `publish`.
