# Wenu Mapu — NocoDB As Current Available Catalog Source

Fecha: 2026-05-19

La dueña confirmó que todo el catálogo disponible por ahora ya fue publicado en NocoDB. Esto cambia la prioridad operativa: NocoDB pasa a ser la fuente interna actual de disponibilidad, mientras WooCommerce sigue siendo el motor público de checkout/ordenes hasta nueva decisión.

## Estado estratégico actualizado

```text
NocoDB = catálogo disponible actual / inventario interno / fotos / datos ricos
WooCommerce = checkout, carrito, pagos, ordenes, clientes, catálogo público legacy
Astro = storefront premium, SEO, colecciones, PDP, experiencia visual
```

## Implicación

El siguiente trabajo no es inventar productos ni seguir preguntando dónde está el catálogo. El catálogo disponible está en NocoDB.

Ahora falta decidir y construir el puente:

1. NocoDB -> reporte de productos disponibles.
2. NocoDB -> comparación contra WooCommerce.
3. NocoDB -> contenido web/product sheets.
4. NocoDB -> propuesta de actualización Woo, sin aplicar automáticamente.
5. Astro -> consumir Woo por ahora, y eventualmente consumir un export limpio derivado de NocoDB si se aprueba.

## Lo que hay que extraer de NocoDB

Campos mínimos para cada producto disponible:

- SKU.
- Title / Nombre interno / Nombre ritual.
- Categoría.
- Tipo de pieza.
- Subtipo piercing.
- Material.
- Medida mm.
- Medida US.
- Color.
- Línea.
- Proveedor.
- Estado.
- Cantidad stock.
- Precio venta USD.
- Descripción interna.
- Descripción ritual.
- Foto referencia.
- Foto macro.
- Foto con escala.
- Lámina técnica.
- URL WooCommerce.
- Packaging.

## Auditoría read-only intentada

Se intentó consultar NocoDB por API read-only desde `~/wenu-platform/src/nocodb.mjs`.

Resultado temporal:

```text
NocoDB 400 ERR_DATABASE_OP_FAILED
SQLITE_BUSY: The database is locked by another process or transaction.
```

Esto indica bloqueo SQLite por otro proceso/transacción, no ausencia de datos. No se reinició NocoDB, no se mataron procesos y no se escribió nada.

## Auditoría read-only completada

Luego se creó y ejecutó:

```text
~/wenu-platform/scripts/audit-nocodb-current-catalog.mjs
```

El script es read-only, no escribe a NocoDB ni a WooCommerce y no imprime secretos.

Resultado del reporte:

```text
Total NocoDB rows: 189
Estado: 133 RAW, 37 READY, 13 SOLD OUT, 6 RESERVED
Con precio: 187
Con foto referencia: 166
Con foto macro: 107
Con URL WooCommerce: 24
Con foto escala: 0
Con lámina técnica: 0
```

Reportes generados:

- `~/wenu-platform/.runtime/reports/nocodb-catalog-current-2026-05-20.md`
- `~/wenu-platform/.runtime/reports/nocodb-catalog-current-2026-05-20.json`
- Copia en frontend:
  - `reports/nocodb-catalog-current-2026-05-20.md`
  - `reports/nocodb-catalog-current-2026-05-20.json`

Lectura estrategica:

NocoDB ya contiene mucho mas catalogo disponible que WooCommerce publicado. El cuello de botella actual es el puente entre NocoDB y Woo/Frontend: solo 24 piezas tienen `URL WooCommerce`.

## Próximo loop técnico seguro

1. Ejecutar auditoría read-only de Piezas.
2. Generar:
   - `reports/nocodb-catalog-current-YYYY-MM-DD.json`
   - `reports/nocodb-catalog-current-YYYY-MM-DD.md`
   - `reports/nocodb-vs-woocommerce-gap-YYYY-MM-DD.md`
3. Comparar NocoDB vs `dist/search-index.json`.
4. Detectar:
   - productos en Noco que no están en Woo;
   - productos en Woo que ya no están disponibles en Noco;
   - precios diferentes;
   - fotos faltantes;
   - nombres débiles;
   - productos sin URL Woo.
5. Preparar propuesta de actualización Woo en modo preview.

## Regla de seguridad

No escribir a WooCommerce desde este proceso.
No escribir a NocoDB salvo que la dueña lo pida explícitamente.
No reiniciar NocoDB mientras haya actividad humana o procesos activos.

## Respuesta corta para David

El sistema tiene aún más sentido ahora: NocoDB ya concentra el catálogo disponible. WooCommerce queda como motor comercial y Astro como storefront premium. Lo que falta no es volver atrás, sino construir una sincronización controlada entre NocoDB y WooCommerce.
