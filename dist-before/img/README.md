# public/img — convención

Todas las imágenes en este árbol deben cumplir:

## Naming
- **Lowercase, kebab-case**, sin espacios ni acentos.
- Patrón: `{descriptor}-{variante}.{ext}` (ej. `hero-portrait.webp`, `meteorite-collection.webp`).
- Sin nombres temporales (`copia-de-...`, `nuevo-...`, `screenshot-...`).
- Sin emojis, sin caracteres especiales.

## Carpetas
- `hero/` — fotos full-bleed para el bloque principal del home (retrato, lifestyle).
- `categories/` — fotos cuadradas para el strip del home, una por categoría top.
- `products/` — fotos profesionales de producto individual.
- `truckee/` — paisaje del estudio / Sierra Nevada / Lake Tahoe.
- `brand/` — banners narrativos (meteoritos, colecciones especiales).

## Formato
- **WebP** preferido para fotos.
- **PNG** solo para gráficos planos sin gradientes.
- Si una imagen pesa >800KB, conviértela a WebP — el script lo hace automáticamente.

## Metadatos
- **Strip EXIF/ICC siempre.** Riesgo: GPS, info de cámara, hashes de generación AI.
- El script `scripts/clean-images.mjs` lo hace automáticamente con sharp.

## Para agregar fotos nuevas
1. Copiá el archivo crudo a la carpeta que corresponda con un nombre que cumpla la convención.
2. Corré desde la raíz del proyecto:
   ```bash
   node scripts/clean-images.mjs
   ```
3. Verificá el listado de cambios. Si una imagen >800KB se convirtió de PNG/JPG a WebP, actualizá la referencia en el código.
4. `npm run build` para confirmar que nada se rompió.

## Por qué importa
- **Performance**: WebP típicamente ahorra 70–95% del peso vs PNG/JPG sin pérdida visible.
- **Privacidad**: EXIF puede filtrar coordenadas GPS o equipo usado.
- **Trazabilidad AI**: imágenes generadas por GPT/Midjourney llevan metadatos identificables — strip los oculta.
- **SEO**: nombres descriptivos en vez de `IMG_7421.JPG` ayudan a indexación.
