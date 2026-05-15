# Reconciliación de Catálogo — 2026-05-15

Generado por la cadena multi-agente (track T5 / wenu-producto). Fuente de verdad
del catálogo para el sync futuro a NocoDB.

**Fuentes consultadas:** `Estado-Sistema.md`, `product-master.md`,
`product-master-quality-report.md`, `catalog-approval-queue.md`,
`dist/search-index.json`, `dist/p/` (50 entradas),
`reports/catalog-cleanup-status-2026-05-15.md`.

---

## Conteo canónico

| Capa | N | Fuente |
|---|---:|---|
| Total registros en WC auditados | 104 | product-master |
| Publicados con foto y precio (vivos en el build) | **50** | search-index.json / dist/p/ |
| Bloqueados como duplicados | 39 | quality-report |
| No publicados restantes (needs_photo / needs_facts) | 15 | 104 − 39 − 50 |
| Sin foto (universo total WC) | 54 | Estado-Sistema (Woo Audit) |
| Sin SKU/facts | 22 | quality-report |
| Sin precio entre los publicados | 0 | catalog-cleanup-status-2026-05-15 |

**Conteo canónico vivo: 50 productos publicados, 0 sin precio, 0 sin foto entre los publicados.**

La discrepancia histórica se cierra así: "104" era el total de registros WC
incluyendo duplicados no publicados. "59 estimados" era una proyección
pre-limpieza. El build ve 50 porque `fetchAllProducts()` filtra `status=publish`;
los 39 bloqueados y los 15 sin foto nunca se publicaron.

---

## Códigos WM-* asignados

De los 50 publicados: ~26 tienen código WM-* en el SKU (series WM-PLG-001/015,
WM-HAN-001/004, WM-LAB-001/003, WM-SEP-001, WM-RNG-001). Los ~24 restantes
(IDs 2054-2086 y 593) tienen nombre descriptivo pero sin código WM-* formal.

Caso especial: dos slugs con `_detail` (`stone-plug-10mm-detail-wm-plg-004` ID 1810,
`surgical-steel-hanger-10mm-detail-wm-han-003` ID 1785) son fotos de ángulo
publicadas como productos separados, no variantes reales.

---

## Clusters de duplicados — estado

Los 7 clusters siguen en `pending_human_approval`. Ninguno resuelto. El canonical
de **dup-4** (#2036, Handmade Plug Stone 10mm) no está publicado — si se aprueba
ese cluster, hay que publicar el canonical antes del merge.

| Cluster | Canonical | Duplicados | Riesgo |
|---|---:|---:|---|
| dup-5 Stone Plug WM-PLG-015 | #1826 | 13 | alto |
| dup-4 Handmade Plug Stone | #2036 | 10 | alto |
| dup-3 Handmade Labret Steel | #2046 | 9 | medio |
| dup-2 Handmade Hanger Surgical | #2049 | 2 | medio |
| dup-6 Steel Labret WM-LAB-003 | #1800 | 2 | medio |
| dup-7 Surgical Steel Hanger WM-HAN-004 | #1787 | 2 | medio |
| dup-1 Ritual Ring Vacamuerta N3 | #2086 | 1 | medio |

dup-5 y dup-4 concentran el 59% de los duplicados.

---

## Tipos de piercing pendientes

Flat, eyebrow, nipple, lip y tongue están mapeados en `woo.ts` CATEGORY_EN pero
no aparecen en el `search-index.json`. Ninguno ha entrado al catálogo.

---

## Severidad

| Severidad | Item |
|---|---|
| CRÍTICA | dup-4: canonical (#2036) no publicado — aprobar el cluster sin publicarlo primero rompe el merge |
| ALTA | 39 duplicados bloqueando hasta 39 fichas nuevas |
| ALTA | 2 productos publicados son fotos de detalle, no SKUs reales (IDs 1810 y 1785) |
| MEDIA | 24 publicados sin código WM-* asignado |
| MEDIA | 22 con needs_facts sin SKU normalizado |
| BAJA | 8 publicados bajo $20 (3 labrets a $18, 5 hangers a $15) |
| BAJA | 5 tipos de piercing mapeados pero sin stock |

---

## Decisiones que necesita el dueño

1. **7 clusters** — Para cada uno: abrir el canonical en WC, confirmar que
   representa el producto real, confirmar que los duplicados no son variantes con
   foto/medida distinta. Luego correr
   `npm run catalog:decision -- --cluster dup-N --decision approve_canonical --by user`.
   Sin esto no se puede hacer merge ni limpiar WC antes del sync a NocoDB.

2. **dup-4 canonical no publicado** — El #2036 nunca salió. Decidir: publicarlo
   como canonical, o elegir otro del cluster que ya esté en vivo.

3. **2 fichas de detalle publicadas** (IDs 1810 y 1785) — Decidir: despublicar y
   mover la imagen a galería del producto principal, o dejar como SKUs
   independientes.

4. **Precios bajos** — 3 labrets a $18, 5 hangers a $15. Confirmar si quedan como
   entrada económica o se ajusta antes del sync.

5. **Image Lab / sin foto** — Decidir si se activa crédito Gemini para imágenes de
   referencia, o se hace sesión fotográfica antes de publicar los 15 productos
   restantes no bloqueados.
