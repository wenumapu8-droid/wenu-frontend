# Wenu Mapu — Hybrid Ecommerce Architecture And Completion Plan

Fecha: 2026-05-19

Este documento responde la duda estrategica: si el sitio nuevo creado con Claude/Codex sirve para ecommerce o si WordPress/WooCommerce sigue siendo necesario.

## Respuesta corta

Si sirve, pero no como reemplazo total de WooCommerce todavia.

El sitio nuevo funciona como storefront premium/headless parcial. WooCommerce sigue siendo el motor comercial: productos publicados, stock, carrito, checkout, pagos, ordenes, clientes e impuestos/envios.

```text
WooCommerce = product manager + checkout + pagos + ordenes
Astro/Wenu frontend = experiencia premium + catalogo + PDP + SEO + marca
NocoDB/wenu-platform = inventario interno + fotos + clasificador + laminas tecnicas
```

## Lo que ya esta hecho

| Area | Estado real |
| --- | --- |
| Catalogo publico | Astro lee productos publicados desde WooCommerce con `getProducts()` |
| Shop | `/shop` lista productos desde WooCommerce |
| PDP | `/p/[slug]` se genera por producto Woo publicado |
| SEO producto | PDP incluye Product JSON-LD, breadcrumb y metadata |
| Precio | Viene desde WooCommerce |
| Stock | `stock_status` viene desde WooCommerce |
| SKU | Viene desde WooCommerce |
| Imagenes | Vienen desde WooCommerce para PDP/product cards |
| Add to cart | El boton usa URL Woo `cart/?add-to-cart=ID` |
| Checkout | Sigue en WooCommerce |
| Cart nav | La navegacion apunta al carrito Woo |
| NocoDB | Fuente interna de inventario/fotos/clasificacion, no checkout |
| Laminas tecnicas | Prototipo HTML/SVG/PNG/PDF desde NocoDB read-only |

## Lo que NO esta hecho

| Faltante | Riesgo | Decision |
| --- | --- | --- |
| Product manager propio en Astro | Alto esfuerzo, duplicaria Woo | No conviene ahora |
| Carrito propio en Astro | Alto riesgo checkout/pagos | No conviene ahora |
| Checkout propio | Riesgo legal/pagos/impuestos | No conviene ahora |
| Ordenes/clientes propios | Duplicacion de sistema | Mantener en Woo |
| Sincronizacion NocoDB -> Woo | Puede romper catalogo si escribe mal | Solo con aprobacion humana |
| Admin visual propio para editar productos | Proyecto grande | Fase futura |
| Fotos finales por SKU | Bloquea calidad visual | Prioridad actual |
| Catalogo Woo totalmente limpio | Impacta sitio nuevo porque Astro consume Woo | Prioridad actual |

## Actualizacion 2026-05-20 — NocoDB publicado completo

La dueña confirmó que el catálogo disponible actual está cargado en NocoDB. Se ejecutó auditoría read-only:

```text
reports/nocodb-catalog-current-2026-05-20.md
```

Hallazgos:

- NocoDB tiene 189 filas de piezas.
- 37 están en estado READY.
- 133 están en RAW.
- 13 SOLD OUT.
- 6 RESERVED.
- 187 tienen precio.
- 166 tienen foto referencia.
- 107 tienen foto macro.
- Solo 24 tienen URL WooCommerce.

Conclusión:

NocoDB ya es la fuente operativa más completa. WooCommerce sigue siendo checkout/backend público, pero está por detrás de NocoDB en cobertura. El trabajo crítico ahora es crear un puente controlado NocoDB -> WooCommerce/Astro, primero como reporte y preview, no como escritura automática.

## Por que la arquitectura tiene sentido

WooCommerce es fuerte donde Wenu necesita seguridad operativa:

- productos;
- stock;
- pagos;
- carrito;
- checkout;
- impuestos/envios;
- ordenes;
- clientes;
- historial comercial.

Astro es fuerte donde Wenu necesita marca:

- velocidad;
- diseno premium;
- SEO limpio;
- paginas editoriales;
- landing pages;
- colecciones;
- control visual;
- no depender de un tema WordPress generico.

NocoDB/wenu-platform es fuerte donde Wenu necesita operacion interna:

- inventario completo;
- fotos;
- clasificador;
- relacion pieza/imagen;
- fichas tecnicas;
- curaduria de producto;
- futuros reportes.

## Respuesta para David

```text
David, tienes razon en que un sitio Astro/Claude Code no reemplaza por si solo a WooCommerce como product manager, checkout, stock manager y sistema de ordenes.

Pero no lo estamos usando asi.

La arquitectura de Wenu Mapu es hibrida/headless: WooCommerce sigue como motor comercial y administrador de productos; Astro es el storefront premium que consume el catalogo y mejora marca, velocidad, SEO y experiencia; NocoDB/wenu-platform es la capa interna de inventario, fotos y clasificacion.

Entonces no estamos abandonando WordPress. Estamos usando WordPress/WooCommerce donde es fuerte, y sacando la experiencia visual publica a un frontend mas premium.
```

## Trabajo que falta para cerrar el sistema hibrido

### Fase 1 — WooCommerce limpio

Objetivo: que Woo sea una fuente confiable para Astro.

- [ ] Confirmar 50 productos publicados actuales.
- [ ] Revisar duplicados.
- [ ] Confirmar que cada producto publicado tenga nombre claro.
- [ ] Confirmar precio.
- [ ] Confirmar stock.
- [ ] Confirmar SKU.
- [ ] Confirmar categoria.
- [ ] Confirmar material/medida como atributo cuando aplique.
- [ ] Confirmar foto principal.
- [ ] Confirmar descripcion corta.
- [ ] No hacer cambios masivos sin preview/backups.

### Fase 1.5 — Comparar NocoDB contra WooCommerce

Objetivo: saber exactamente que piezas disponibles faltan en Woo o no están enlazadas.

- [x] Auditar NocoDB read-only.
- [ ] Exportar catálogo Woo actual desde build/API.
- [x] Comparar por SKU.
- [x] Lista A: en Noco READY pero sin Woo URL.
- [x] Lista B: en Woo pero SOLD OUT/RESERVED en Noco.
- [ ] Lista C: precios diferentes.
- [x] Lista D: productos sin foto/macro.
- [ ] Preparar preview de creación/actualización Woo.
- [ ] Esperar aprobación humana antes de escribir Woo.

Comparación generada:

- `reports/nocodb-vs-woo-gap-2026-05-20.md`
- `reports/nocodb-vs-woo-gap-2026-05-20.json`

Resumen:

- NocoDB total: 189.
- NocoDB disponibles (`RAW` + `READY`): 170.
- NocoDB `READY`: 37.
- Woo/Astro actual: 50.
- NocoDB disponibles sin Woo/link detectado: 142.
- NocoDB `READY` sin Woo/link detectado: 24.
- Woo sin SKU detectable en nombre: 24.
- Woo no enlazado a Noco por SKU-en-nombre: 30.
- Woo publicado pero Noco no disponible: 2.

### Fase 2 — Fotos y assets de producto

Objetivo: que el sitio nuevo se vea premium con producto real.

- [ ] Mapear fotos reales por SKU.
- [ ] Priorizar top 10 productos.
- [ ] Crear main/macro/body/scale por SKU.
- [ ] Optimizar a WebP/AVIF.
- [ ] Usar NocoDB/wenu-platform como control interno.
- [ ] Subir a Woo solo con aprobacion humana.

### Fase 3 — Storefront Astro completo

Objetivo: que Astro sea la cara publica superior sin asumir checkout.

- [ ] Mejorar banners de coleccion.
- [ ] Reemplazar category tiles legacy.
- [ ] Mejorar PDP con mas confianza visual.
- [ ] Agregar badges reales: limited/new/sold out si vienen de datos.
- [ ] Revisar filtros de shop.
- [ ] Revisar mobile PDP.
- [ ] Verificar Add to cart externo a Woo.
- [ ] Build verde.

### Fase 4 — Operacion interna NocoDB

Objetivo: que NocoDB sea el taller de producto, no la tienda publica.

- [ ] Completar relacion SKU -> foto final.
- [ ] Implementar sugerencias visuales pHash.
- [ ] Usar laminas tecnicas por SKU.
- [ ] Crear reportes de productos incompletos.
- [ ] Preparar sync hacia Woo como propuesta, no escritura automatica.

### Fase 5 — Futuro product manager propio

Solo evaluar despues de que lo anterior funcione.

Opciones:

1. Mantener WooCommerce como product manager definitivo.
2. Usar NocoDB como product PIM y sincronizar a Woo.
3. Migrar a backend headless real, como Medusa/Shopify/Custom API.
4. Crear admin propio, solo si el costo se justifica.

Recomendacion actual: mantener WooCommerce.

## Decision estrategica

No conviene elegir entre "WordPress" o "Claude Code".

Conviene dividir responsabilidades:

```text
WordPress/WooCommerce por dentro.
Astro/Wenu frontend por fuera.
NocoDB/wenu-platform como taller operativo.
```

Esta arquitectura tiene sentido para Wenu Mapu porque protege lo comercial y libera la identidad visual.
