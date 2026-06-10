# Manifiesto de consolidación — Cluster Labradorite Stone Plug (master `WM-PLG-015`)

- **Fecha:** 2026-06-10
- **Agente:** Claude (cowork)
- **Piloto solicitado:** `WM-PLG-004`
- **Estado:** PROPUESTA — **nada ejecutado en Woo**. Requiere aprobación de Ocin por acción.
- **Guardrails respetados:** NO archivar · NO borrar · NO escribir en Woo · NO tocar stock/precio. Solo lectura + manifest.

---

## TL;DR

El piloto `WM-PLG-004` **no existe como SKU canónico**. El producto Woo que lo lleva en el nombre
(id **1811**, slug `curated-stone-plug-10mm-wm-plg-004`) es en realidad **`WM-PLG-034`** — la variante
de **10 mm** del cluster Labradorite Stone Plug, cuyo **master canónico es `WM-PLG-015`**.

NocoDB (fuente de verdad) ya marcó las 3 variantes de talla como **CONSOLIDADO en `WM-PLG-015`**
(`Estado=RESERVED`, `Stock=0`), pero en Woo siguen **publicadas como productos separados**. Eso es
exactamente la "vista/variante duplicada publicada como producto independiente" que el audit
señaló como oportunidad #1.

Además, el producto 1811 arrastra **dos defectos de integridad**: nombre con SKU viejo (`WM-PLG-004`)
+ nombre genérico ("Curated Stone Plug" en vez de "Labradorite Stone Plug 10mm Pair"), y **galería con
la misma foto duplicada** (`DSC_0578` a 600px y 300px como dos imágenes separadas).

---

## El cluster (fuente de verdad: NocoDB)

| SKU | Talla | NocoDB Estado | NocoDB Stock | Precio | Nota NocoDB | Producto Woo | Woo status | Woo stock |
|---|---|---|---|---|---|---|---|---|
| **WM-PLG-015** | Master (multi-size) | **READY** | **5** | 85 | MASTER record de todas las variantes labradorite | **1826** | publish | instock |
| WM-PLG-034 | 10 mm | RESERVED | 0 | 60 | ⚠️ CONSOLIDADO en WM-PLG-015 | **1811** | publish | **instock** ⚠️ |
| WM-PLG-023 | 16 mm | RESERVED | 0 | 85 | ⚠️ CONSOLIDADO en WM-PLG-015 | **2711** | publish | outofstock |
| WM-PLG-028 | 22 mm | RESERVED | 0 | 95 | ⚠️ CONSOLIDADO en WM-PLG-015 | — | (no está en Woo) | — |

> Hermanos declarados en NocoDB (`Variantes`): WM-PLG-023 (16mm), WM-PLG-028 (22mm). Esta=10mm. Master=WM-PLG-015.

---

## Producto piloto — Woo id 1811 (lo que el nombre llama "WM-PLG-004")

| Campo | Valor actual en Woo | Verdad canónica (NocoDB WM-PLG-034 / master WM-PLG-015) |
|---|---|---|
| Nombre | `Curated Stone Plug 10mm \| WM-PLG-004` | `Labradorite Stone Plug 10mm Pair` |
| SKU (campo) | `WM-PLG-034` ✅ (correcto) | `WM-PLG-034` |
| Slug | `curated-stone-plug-10mm-wm-plg-004` | (sugerido) `labradorite-stone-plug-10mm-pair` |
| Status | `publish` | debería seguir al master (consolidado) |
| Stock | `instock` | `0` / RESERVED |
| Precio | `60` | `60` (NocoDB) — el master cobra `85` por la colección |
| Imágenes | 2 → `DSC_0578-600x397-19.jpg` **+** `DSC_0578-300x199-63.jpg` | **misma foto duplicada** (600px y 300px del mismo `DSC_0578`) |
| Descripción | "A curated 10mm stone plug…" (genérica, no menciona labradorita) | debería describir labradorita / línea Orgánico / nombre ritual *Lafken Witral* |

Nota adicional: el **master 1826** (WM-PLG-015) **también** usa el mismo `DSC_0578` duplicado
(600px + 300px). El cluster entero comparte una sola foto de catálogo reutilizada.

---

## Acciones propuestas (cada una requiere aprobación — NINGUNA ejecutada)

### Lote A — Integridad (UPDATE reversible, bajo riesgo)
- **A1 · Renombrar 1811** → `Labradorite Stone Plug 10mm Pair`. Quita el sufijo ` | WM-PLG-004`
  (SKU viejo erróneo) del título visible. SKU del campo ya es correcto (`WM-PLG-034`), no se toca.
- **A2 · Dedup galería 1811** → conservar una sola entrada de `DSC_0578` (la de mayor resolución),
  remover la entrada de 300px. Idem para master **1826**.
- **A3 · (opcional) Slug 1811** → `labradorite-stone-plug-10mm-pair` **con 301-redirect** del slug viejo
  (`curated-stone-plug-10mm-wm-plg-004`) para no romper enlaces.

### Lote B — Consolidación (REQUIERE DECISIÓN — afecta visibilidad pública)
Las variantes de talla ya están consolidadas en NocoDB pero siguen vivas en Woo. Dos caminos posibles
(Ocin elige uno; **ninguno borra ni archiva** datos):

- **Opción B1 — Draft + redirect (recomendada, mínimo destructivo):**
  - `WM-PLG-034` (1811) y `WM-PLG-023` (2711) → `status: draft` (salen del catálogo público, **no se borran**).
  - 301-redirect de sus slugs → el master `WM-PLG-015` (slug `labradorite-stone-plug-collection-…`, Woo 1826).
  - Master 1826 queda como único producto público del cluster.

- **Opción B2 — Producto variable:**
  - Convertir `WM-PLG-015` (1826) en producto *variable* con atributo **Talla** (10/16/22 mm) y precios por
    variación (60/85/95). Las variantes 1811/2711 se absorben como variaciones.
  - Más trabajo, mejor UX a largo plazo. Requiere reestructurar el producto master.

> **Inconsistencia a resolver sí o sí:** 1811 está `instock` en Woo pero `Stock=0` en NocoDB. Mientras
> siga publicado+instock, se puede vender una pieza que la fuente de verdad da por consolidada/sin stock.

### Lote C — Higiene de foto (no bloqueante)
- El cluster reutiliza una sola foto `DSC_0578`. 2711 (16mm) ya tiene su macro propia
  (`labradorite-stone-plug-16mm-pair-wm-plg-023-macro.jpg`). Sugerencia: el master debería usar una foto
  de la colección completa, no la de una sola talla.

---

## Patrón generalizable (para repetir el piloto)

1. Tomar SKU base → buscar en NocoDB su `Notas`/`Variantes` para detectar `CONSOLIDADO en …`.
2. Si está consolidado: el master es el `READY` con stock; los hijos `RESERVED`/stock 0 son los a degradar.
3. En Woo: detectar hijos aún `publish` + galería con misma foto a múltiples tamaños (sufijos `-600x`, `-300x`).
4. Proponer: A (integridad) siempre seguro; B (draft+redirect) requiere ok del owner.

Candidatos siguientes con el mismo patrón (del audit Oportunidades #3, sin verificar aún): pares de
Labret opal (Aurora/Green Fire/Pink), anillos Jimmy meteorito (17.5 vs 19mm), tunnels titanio (10 vs 14mm).

---

## Apéndice — datos crudos verificados (2026-06-10, vía API)

- Woo `GET /products/1811`: name `Curated Stone Plug 10mm | WM-PLG-004`, sku `WM-PLG-034`, status publish, price 60, stock instock, 2 imgs (1947 `DSC_0578-600x397-19.jpg`, 1948 `DSC_0578-300x199-63.jpg`), cat `Plug`.
- Woo `GET /products/1826`: name `Labradorite Stone Plug Collection (Multi-Size, Saddle & Teardrop)`, sku `WM-PLG-015`, publish, price 85, instock, 2 imgs (1917/1918 `DSC_0578`).
- Woo `GET /products/2711`: name `Labradorite Stone Plug 16mm Pair`, sku `WM-PLG-023`, publish, price 85, **outofstock**, 1 img (2710 macro propia).
- NocoDB `WM-PLG-034` (Id 138): Title `Labradorite Stone Plug 10mm Pair`, Nombre ritual `Lafken Witral`, Línea `Orgánico`, Estado RESERVED, Stock 0, Notas "CONSOLIDADO en WM-PLG-015".
- NocoDB `WM-PLG-015`: Title `Labradorite Stone Plug Collection (Multi-Size…)`, Estado READY, Stock 5.
- NocoDB `WM-PLG-004`: **0 registros** (el SKU no existe en la fuente de verdad).
