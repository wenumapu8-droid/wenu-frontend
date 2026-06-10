# Wenu Frontend — Site Status Audit (2026-06-04)

## Estado real hoy

### Lo que sí está bien
- `npm run build` pasa limpio.
- Astro genera `90` páginas.
- Se construyen `25` páginas de producto desde WooCommerce.
- `verify-build` pasa (`25` product pages built).
- Preview local funcional en `http://127.0.0.1:4321`.
- Hay estructura real de ecommerce/editorial: home, shop, PDP, collections, materials, journal, care, local, contact, sitemap y search index.

### Lo que bloquea sentirlo “listo”
1. **Catálogo con drift real WC ↔ NocoDB / taxonomías**
   - `14` errores en `audit-catalog --soft`
   - `27` warnings
   - Hay productos publicados sin SKU, huérfanos, categorías incorrectas y fotos faltantes.

2. **Home con jerarquía comercial débil**
   - Visualmente distintiva, pero más atmosférica que vendedora.
   - Arriba del fold falta claridad, CTA dominante y señales de confianza.

3. **Repo muy sucio / mezcla de cambios**
   - Muchísimos archivos modificados y sin trackear.
   - Mezcla de copy, imágenes, componentes, scripts, assets y reportes.
   - Riesgo alto de romper foco o perder trazabilidad.

4. **Producción todavía no está cortada al frontend nuevo**
   - El dominio live sigue en WordPress/WooCommerce legacy.
   - Cloudflare Pages es preview, no cutover final.

5. **Observabilidad comercial incompleta**
   - `npm run metrics` no puede leer órdenes.
   - Falta scope `read_orders` para métricas reales de venta.

## Diagnóstico honesto

El proyecto ya **no es un prototipo vacío**.
Está más cerca de una **beta funcional con deuda comercial y de catálogo** que de un simple mockup.

La sensación general:
- **Técnicamente**: sólido para seguir construyendo.
- **Editorialmente**: potente y con identidad.
- **Comercialmente**: todavía ambiguo.
- **Operativamente**: necesita orden y scope mínimo de lanzamiento.

## Prioridad recomendada

### P0 — Congelar scope de lanzamiento
Definir qué significa “listo” para una primera versión:
- home
- shop
- PDP
- contact/local
- care/shipping/FAQ
- collections clave

Todo lo demás queda como nice-to-have.

### P1 — Limpiar verdad comercial
Resolver primero:
- SKU huérfanos
- productos sin SKU
- categorías incorrectas
- productos `instock` cuando Noco dice `SOLD OUT`
- foto curada faltante en piezas visibles

### P2 — Arreglar home para confianza
Arriba del fold:
- headline más claro
- subhead menos abstracto
- CTA dominante
- trust strip más fuerte
- featured products más temprano y más legible

### P3 — Ordenar repo
Separar:
- assets aprobados
- experiments
- reportes
- scripts de mantenimiento
- cambios de contenido vs cambios de layout

### P4 — Medición real
Agregar credenciales de solo lectura para orders metrics.

## Próximos pasos concretos

1. Hacer shortlist de issues bloqueantes para “beta funcional”.
2. Revisar y agrupar los cambios del repo por tema.
3. Priorizar fixes de catálogo que dañan confianza comercial.
4. Reescribir la home arriba del fold para claridad + conversión.
5. Dejar checklist de cutover preview → candidata a lanzamiento.
