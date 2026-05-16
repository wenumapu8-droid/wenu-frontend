# Plan de Sincronización WC ↔ NocoDB — 2026-05-15

Track T5 / catálogo. Documento de SOLO LECTURA + plan. No se ejecutó ningún cambio
en WooCommerce ni en NocoDB. Docker estaba APAGADO durante el análisis (NocoDB en
`localhost:8080` inaccesible) — los conteos de NocoDB provienen de investigación
previa, no de un fetch live.

**Fuentes:** `reports/catalog-reconciliation-2026-05-15.md`,
`reports/catalog-cleanup-status-2026-05-15.md`, `src/lib/woo.ts`,
`~/wenu-platform/src/nocodb.mjs`, `scripts/sync-to-wc.mjs`,
`scripts/audit-nocodb.mjs`.

---

## (a) Conteo canónico

| Capa | N | Fuente |
|---|---:|---|
| Piezas en NocoDB (total) | **89** | investigación previa |
| — NocoDB en estado RAW | 84 | investigación previa |
| — NocoDB en estado SOLD OUT | 5 | investigación previa |
| Registros WC auditados (total) | 104 | product-master |
| WC publicados (vivos en el build) | **50** | search-index.json / dist/p/ |
| WC bloqueados como duplicados | 39 | quality-report |
| WC no publicados restantes (needs_photo / needs_facts) | 15 | 104 − 39 − 50 |
| WC publicados con código WM-* en SKU | ~26 | reconciliation |
| WC publicados sin código WM-* (IDs 2054-2086, 593) | ~24 | reconciliation |

**Asimetría clave:** NocoDB tiene 89 piezas; WC publica solo 50. NocoDB es el
inventario maestro real (más completo). WC es el escaparate, parcialmente poblado
y contaminado con 39 duplicados y 2 fichas de detalle (`_detail`).

---

## (b) Schema tabla Piezas NocoDB

Base ID `pbmsibdovaalqw4`, tabla Piezas `m5s3jnm72tzhk9g`, tabla Fotos
`m68mef57yfy4uwc`. API v2, auth header `xc-token`. Campos confirmados leyendo
`nocodb.mjs` (`createNuevaPieza`, `audit-nocodb.mjs` REQUIRED, `getCachedPiezas`):

| Campo NocoDB | Tipo | Notas |
|---|---|---|
| `Id` | int | PK interno NocoDB |
| `SKU` | text | Formato `WM-<PREFIX>-NNN` (HAN, PLG, TUN, SEP, EAR, RNG, CUF, BRC, NCK, PRC, SAD, LWT, OTH). Generado por `nextSkuForCategoria()` |
| `Title` | text | Título en inglés (campo de match principal) |
| `Nombre interno` | text | Alias interno |
| `Nombre ritual` | text | Mapudungun → mapea a WC `short_description` |
| `Categoría` | single-select | Hanger, Plug, Tunnel, Septum, Earring, Ring, Ear cuff, Bracelet, Necklace, Piercing, Saddle, Light weight, Other |
| `Material` | multi-select / CSV | Gold, Silver, Bronze, Brass, Stainless steel, Titanium, Wood, Stone, Meteorite, Bone, Resin, Coral… |
| `Medida mm` / `Medida US` | text | Gauge (`00g`/`0g`/`14g`…) y mm |
| `Color` | text | |
| `Línea` | single-select | Origin, Atacama, Custom, Araucanía, India, Ornamental, Neo, Maya, Solar, Fossil, Organic, Selva |
| `Estado` | single-select | RAW, READY, (SOLD OUT)… lifecycle `RAW→READY` por `maybeAdvanceEstado()` |
| `Precio venta USD` | number | → WC `regular_price` |
| `Costo USD` | number | interno, no se sincroniza |
| `Cantidad stock` | number | → WC `stock_quantity` (referenciado en `sync-to-wc.mjs`) |
| `Peso g` | number | |
| `Descripción ritual` | long text | → WC `description` |
| `Descripción interna` | long text | fallback de descripción |
| `Threading` / `Subtipo piercing` / `Tipo de pieza` / `Unidad de venta` / `Packaging` | text | atributos |
| `Proveedor` | text | normalizado por `normalizeSupplier()` |
| `URL WooCommerce` | text | **link de retorno WC→NocoDB (clave para idempotencia)** |
| `URL post IG` / `Texto redes` / `Ubicación vitrina` / `Notas` | text | |
| `Foto macro` / `Foto referencia` / `Foto con escala` / `Lámina técnica` | attachment[] | |

Funciones API expuestas: `listPiezas`, `listAllPiezas`, `searchPiezas`,
`getPiezaBySku`, `getCoverageStats`, `createNuevaPieza`, `uploadAttachmentToPieza`,
`createFotoExtra`, `deletePieza`, `maybeAdvanceEstado`. Aliases retirados se
filtran por SKU `ALIAS-*`/`MERGED-*` o nota "alias/duplicado" (`isRetiredAlias`).

---

## (c) Plan de sincronización paso a paso

**Dirección:** NocoDB → WC. NocoDB es la fuente de verdad del inventario. WC es
solo el escaparate. El sync NUNCA escribe a NocoDB.

**Campo de match: `SKU` normalizado.** Es el único identificador estable que
existe en ambos sistemas. `scripts/sync-to-wc.mjs` ya implementa esto:
- `normSku(s)` = uppercase + strip de sufijos `_front|_back|_detail|_angle|_macro|_lifestyle|_card|_pair|_vN`. Esto colapsa las fichas de detalle (`..._detail`) sobre su SKU base.
- WC se indexa en `wcByNormSku` por SKU normalizado; cada pieza NocoDB busca su match ahí.
- Si hay match → `UPDATE` (PUT a `/products/{id}`); si no → `CREATE` (POST, siempre `status=draft`).
- El título NocoDB es el match secundario / humano cuando un SKU WC viene vacío (los ~24 WC sin código WM-*).

`sync-to-wc.mjs` ya implementa el sync completo y es seguro: dry-run por default,
`--apply` exige `--confirm`, crea siempre como `draft`, hace backup del estado WC
de cada producto tocado en `~/wenu-agent-hub/data/backups/wc-sync-*`. Mapea prefijo
SKU → categorías WC (`SKU_PREFIX_TO_CAT`) y escribe `_wenu_noco_id` en `meta_data`
para trazabilidad.

`audit-nocodb.mjs` es solo lectura: snapshot + scoring de completitud por pieza,
no toca WC. No es parte del sync — es la herramienta de calidad previa.

**Pasos de ejecución:**

1. **Arrancar Docker** y el contenedor NocoDB; verificar `localhost:8080` responde.
2. `node scripts/audit-nocodb.mjs` — refrescar snapshot y ver completitud real de las 89 piezas.
3. **Limpiar WC primero** (antes del sync): resolver los 7 clusters de duplicados (sección d) y decidir las 2 fichas `_detail`. Sincronizar sobre un WC sucio multiplica los duplicados.
4. `node scripts/sync-to-wc.mjs` (dry-run) — leer el plan: cuántos `CREATE` vs `UPDATE`. Esperado: ~50 UPDATE (las publicadas) + hasta ~39 CREATE como draft (las piezas NocoDB sin ficha WC).
5. `node scripts/sync-to-wc.mjs --only-with-photo` o `--only-status READY` para acotar al subconjunto publicable.
6. `node scripts/sync-to-wc.mjs --apply --confirm --sku WM-XXX-001` — validar UNA pieza primero.
7. `--apply --confirm` global solo tras validar. Todo entra como `draft`; el dueño publica manualmente en wp-admin.
8. Backfill recomendado: escribir `URL WooCommerce` en cada pieza NocoDB tras el sync, para que futuras corridas sean idempotentes sin depender solo del SKU.

**Piezas NocoDB que NO están en WC (candidatas a CREATE):** hasta ~39 (89 NocoDB
− 50 WC publicadas), menos las que ya existan como draft entre los 15 WC no
publicados. El número exacto solo se sabe con Docker arriba y el dry-run.

**Productos WC que NO están en NocoDB:** los ~24 publicados sin código WM-* y las
2 fichas `_detail` (IDs 1810, 1785) son los sospechosos. Decisión del dueño: o se
les crea pieza en NocoDB (NocoDB como maestro absoluto), o se aceptan como
huérfanos solo-WC. Recomendado: darlos de alta en NocoDB para una sola fuente.

---

## (d) Los 7 clusters de duplicados — decisión requerida

Los 7 siguen en `pending_human_approval`. Ninguno resuelto. Concentran 39
duplicados que bloquean hasta 39 fichas nuevas. dup-5 + dup-4 = 59% del total.

| Cluster | Canonical | Dups | Riesgo | Decisión que necesita el dueño |
|---|---|---:|---|---|
| dup-5 Stone Plug WM-PLG-015 | #1826 | 13 | alto | Confirmar #1826 representa el producto real; verificar que los 13 no son variantes de medida/foto distinta antes de mergear |
| dup-4 Handmade Plug Stone | #2036 | 10 | alto | **#2036 NO está publicado.** Decidir: publicar #2036 como canonical ANTES del merge, o elegir otro del cluster que ya esté vivo |
| dup-3 Handmade Labret Steel | #2046 | 9 | medio | Confirmar #2046 como canonical; revisar 9 dups |
| dup-2 Handmade Hanger Surgical | #2049 | 2 | medio | Confirmar #2049; revisar 2 dups |
| dup-6 Steel Labret WM-LAB-003 | #1800 | 2 | medio | Confirmar #1800; revisar 2 dups |
| dup-7 Surgical Steel Hanger WM-HAN-004 | #1787 | 2 | medio | Confirmar #1787; revisar 2 dups |
| dup-1 Ritual Ring Vacamuerta N3 | #2086 | 1 | medio | Confirmar #2086; revisar 1 dup |

Acción por cluster tras confirmar: `npm run catalog:decision -- --cluster dup-N
--decision approve_canonical --by user`.

---

## (e) Bloqueadores antes de ejecutar el sync

1. **Docker apagado** — NocoDB en `localhost:8080` inaccesible. Hay que arrancar Docker y el contenedor NocoDB. Sin esto ni `audit-nocodb.mjs` ni `sync-to-wc.mjs` funcionan.
2. **Credenciales** — `sync-to-wc.mjs` necesita `NOCODB_TOKEN`, `WOOCOMMERCE_URL`, `WOOCOMMERCE_KEY`, `WOOCOMMERCE_SECRET` (lee de `~/wenu-agent-hub/.env`). Verificar que el token NocoDB siga vigente.
3. **7 clusters sin resolver** — Aprobar/mergear ANTES del sync; sincronizar sobre WC sucio crea más duplicados. dup-4 además requiere publicar #2036 primero.
4. **2 fichas `_detail`** (IDs 1810, 1785) — Decidir si se despublican y mueven a galería, o se dejan como SKU. `normSku()` ya las colapsaría sobre el SKU base, pero conviene decidir explícito.
5. **Productos WC sin código WM-*** (~24) — Decidir si se dan de alta en NocoDB o se aceptan como huérfanos solo-WC.
6. **Precios bajos** (3 labrets $18, 5 hangers $15) — Confirmar precios antes de que el sync los empuje a WC.
7. **Variable de tabla** — `sync-to-wc.mjs` usa `NOCODB_TABLE` (default `m5s3jnm72tzhk9g`, correcto). Confirmar que el `.env` no la sobrescriba con otra.
