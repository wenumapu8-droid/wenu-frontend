# WooCommerce + Astro Completion Checklist

Checklist operativo para terminar el sistema hibrido Wenu Mapu.

## 1. WooCommerce como fuente de verdad publica

No editar sin preview/backups. No hacer bulk destructive changes.

| Check | Objetivo | Estado |
| --- | --- | --- |
| Producto publicado tiene nombre claro | Product card y PDP confiables | [PENDIENTE] |
| Producto tiene SKU | Relacion Woo/Noco/fotos | [PENDIENTE] |
| Producto tiene precio | Conversion | [PENDIENTE] |
| Producto tiene stock/status | Evitar ventas incorrectas | [PENDIENTE] |
| Producto tiene categoria | Navegacion/filtros | [PENDIENTE] |
| Producto tiene material | Specs y SEO | [PENDIENTE] |
| Producto tiene medida/gauge | Compra segura | [PENDIENTE] |
| Producto tiene foto principal | Card/PDP visual | [PENDIENTE] |
| Producto tiene descripcion corta | PDP/meta | [PENDIENTE] |
| Producto no esta duplicado | Catalogo limpio | [PENDIENTE] |

## 2. Astro storefront

| Check | Estado actual | Siguiente paso |
| --- | --- | --- |
| `/shop` consume Woo | Hecho | Revisar filtros/UX |
| `/p/[slug]` consume Woo | Hecho | Mejorar trust blocks si hace falta |
| Product JSON-LD | Hecho | Revisar shipping/returns reales |
| Add to cart externo | Hecho | Verificar checkout Woo |
| Related pieces | Hecho | Revisar relevancia |
| Collection pages | Hecho | Crear banners finales |
| Category tiles | Parcial | Reemplazar PNG legacy |
| Product images premium | Parcial | Mapear fotos reales |
| Search index | Hecho | Verificar conteo tras limpieza Woo |

## 3. NocoDB / wenu-platform

| Check | Objetivo | Estado |
| --- | --- | --- |
| Inventario Noco completo | PIM interno | Hecho base |
| Relacion SKU/foto | Publicacion limpia | [PENDIENTE] |
| Clasificador fotos | Operacion visual | En uso |
| Auto assign MD5 twins | Acelerar duplicados | Script existe |
| pHash visual similarity | Sugerencias inteligentes | [PENDIENTE] |
| Lamina tecnica | Certificado/product sheet | Prototipo hecho |
| Sync Noco -> Woo | Evitar doble trabajo | [PROPUESTA FUTURA] |

## 4. Cierre minimo para decir "sistema ecommerce hibrido listo"

- [ ] WooCommerce limpio para los productos publicados.
- [ ] Astro build verde con productos reales.
- [ ] Add to cart confirmado en Woo.
- [ ] Product pages tienen imagen, precio, stock, SKU.
- [ ] Top 10 productos tienen foto premium.
- [ ] Collection banners aprobados.
- [ ] Category tiles aprobados.
- [ ] Documento de roles aceptado: Woo backend, Astro frontend, Noco operativo.

## 5. No hacer todavia

- No reemplazar checkout.
- No crear carrito propio.
- No escribir automaticamente a Woo desde Noco.
- No migrar fuera de WooCommerce.
- No redisenar WordPress entero.
- No tocar DNS/Cloudflare sin humano.

## Proximo loop recomendado

1. Ejecutar auditoria read-only del catalogo Woo publicado.
2. Generar reporte: missing SKU, missing price, missing image, duplicate names/slugs, weak names.
3. Priorizar 10 productos.
4. Mapear fotos reales para esos 10.
5. Preparar cambios Woo como preview, no aplicar automaticamente.
