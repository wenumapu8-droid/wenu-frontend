# Catalog Cleanup Status — 2026-05-15

## Hecho

- WooCommerce publicado: 50 productos.
- Productos publicados sin precio: 0.
- Productos publicados sin foto: 0.
- Productos publicados sin descripción: 0.
- Nombres genéricos tipo `Handmade Plug - Stone 10mm`: 0 en el índice nuevo.
- Slugs viejos de productos limpiados redirigen a slugs nuevos en `public/_redirects`.
- `/ear-cuffs` y `/ritual-objects` ya no quedan como páginas vacías: muestran estado de comisión cuando no hay inventario listo.

## Cambios aplicados en WooCommerce

- 27 productos recibieron precio.
- 38 slugs/títulos fueron limpiados o normalizados.
- 3 productos recibieron descripción y short description.
- Cada escritura dejó respaldo en `.runtime/catalog-fixes-*.json`.

## Verificación

- `npm run build`: OK.
- Build: 95 páginas.
- PDPs: 50 productos.
- `dist/search-index.json`: 50 productos, 0 sin precio, 0 nombres genéricos.

## Pendiente Para Decidir

- 8 productos siguen bajo $20:
  - 3 labrets de acero a $18.
  - 5 hangers de acero a $15.
- Recomendación: no subirlos automáticamente sin revisar margen/estrategia. Pueden funcionar como entrada barata al catálogo.

## Pendiente Técnico

- Hay productos con SKU terminado en `_front` o `_detail`. Algunos parecen fotos individuales que deberían vivir como galería de un producto principal, no como producto separado.
- No los despubliqué ni borré. Requieren revisión visual antes de fusionar/ocultar.

## Siguiente Mejor Paso

1. Revisar duplicados por SKU base (`WM-PLG-004`, `WM-HAN-003`, etc.).
2. Decidir si se dejan como variantes visibles o se mueven a galería del producto principal.
3. Revisar precios bajos una vez decidido si queremos entrada económica o posicionamiento más premium.
