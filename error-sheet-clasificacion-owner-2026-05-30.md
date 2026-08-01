# `_ERROR` — clasificación confirmada por el dueño · 2026-05-30

Ground truth de Marimari revisando las 22 hojas de contacto (`/tmp/wenu-audit/error_sheets/`,
thumbs 001-425). **Hallazgo central: casi todo el producto real de `_ERROR` YA ESTÁ en el
inventario (NocoDB) — son las macros que faltaban (Bucket A), no productos nuevos.**

## En inventario — son macros para piezas ya existentes (adjuntar foto + promover)

| Thumbs (foto) | Producto (palabras del dueño) | Estado |
|---|---|---|
| 001 | Plug labradorita redondo ~20mm | EN INV |
| 002, 003 | Plug labradorita teardrop | EN INV |
| 005, 009 | Plug obsidiana | EN INV (implícito) |
| 011, 015, 083, 089, 090, 092, 097, 099 | Hangers greca acero quirúrgico, **cierre magnético** | EN INV · disponibles |
| 082, 086 | Hangers ornamentales dorados grandes, **cierre magnético** | EN INV |
| 012, 014 | Hangers gota de amatista + acero quirúrgico dorado | EN INV |
| 013, 016, 017, 022 | Hanger dorado pesado (mismo producto) | EN INV |
| 020, 021, 023, 024, 025, 026, 027, 031 | Plug ojo de tigre (mismo producto; 025 sobreexpuesta) | EN INV (probable) |
| 030, 032 | Hangers acero quirúrgico c/ colgante de amatista | EN INV · 1 par en stock |
| 034, 036, 037, 039, 040 | Expansión tipo sillín (saddle) chica c/ ópalo pequeño + diseño ornamental | EN INV |
| 036* | Hanger dorado con piedras grandes negras | EN INV (*nº reusado, ver ambigüedad) |
| 088 | Hangers de madera ornamentales | EN INV |
| 095, 104, 106 | Hanger cabeza de Buddha en ojo de tigre → **WM-HAN-002 Tiger Eye Buddha** | EN INV ✔ existe |
| 098 | Hanger triángulo de ojo de tigre → **WM-HAN-003 Triangular Tiger Eye** | EN INV ✔ existe |
| 100 | Hanger tipo gancho con Metatrón en bronce → **WM-HAN-004 Metatron** | EN INV ✔ existe |
| gafas: 004, 018, 019, 046, 054, 061, 109, 121 | Gafas de madera Wenu | EN INV · **solo bajo encargo** |

> **Esto desmiente 3 de las "12 incongruencias":** WM-HAN-002 (Buddha), WM-HAN-003 (Triángulo) y
> WM-HAN-004 (Metatron) SÍ existen y están en inventario. El clasificador previo los marcó como
> mismatch solo porque la macro vivía en `_ERROR`.

## NO en inventario — clasificar / decidir

| Thumbs | Producto | Acción |
|---|---|---|
| 010 | **Brazalete** con escrituras en sánscrito ("de playa") | NUEVO — falta nombre/SKU/categoría |
| 084, 085, 091, 093, 094, 096 | **Garra de plata** como colgante/earring | No en stock como earring; "si quieres agregarla está bien" → decisión dueño |

## Fotos que NO sirven (descartar)
- **028, 029, 035** — no se distingue, fotos malas.
- **025** — sobreexpuesta (producto OK, pero buscar mejor toma del mismo plug ojo de tigre).
- Paisajes nocturnos 424-425, gafas/caja como packaging ya marcados aparte.

## Ambigüedades RESUELTAS por el dueño (2026-05-30)
1. **036** = **hanger** (el dorado c/ piedras grandes negras). NO es el saddle. → saddle chico c/ ópalo = 034/037/039/040.
2. **006, 007** = **plug ojo de tigre rojo** (mismo producto que 020-027/031). EN INV.
3. **008** = **plug de amatista**, EN INV como los demás plugs.
4. Descarte 028/029/035 + "buscar mejor toma" para 025 → **OK confirmado**.

## Productos NUEVOS — CREADOS en NocoDB 2026-05-30 (SOLD OUT, con macro + copy completo)
- **WM-EAR-020 Silver Claw Talon Drop Earrings** (id 195) — macro DSC_0547. SOLD OUT, $50, stock 0.
- **WM-OTH-006 Sanskrit Mantra Silver Cuff Bracelet** (id 196) — macro DSC_0093. SOLD OUT, $45, stock 0.
- Script: `scripts/create-error-products.mjs` (dry-run default, `--apply`, idempotente por SKU).
- Backup reversible (Ids para borrar): `data/backups/error-products-created-2026-05-30T17-50-05-956Z.json`.
- Catálogo ahora: total 191 · READY 87 · RAW 83 · SOLD OUT 15 · RESERVED 6.

## 6 héroes promovidos a READY (2026-05-30) — macro real adjuntada + RAW→READY
Confirmados foto-a-foto antes de escribir. Cuatro tenían la foto MAL (la corregimos), dos no tenían foto.
| SKU | Producto | Foto | Acción |
|---|---|---|---|
| WM-HAN-002 | Tiger Eye Buddha Hanger | DSC_0562 (095/104/106) | Reemplazó foto errónea → READY ✔ |
| WM-HAN-003 | Triangular Tiger Eye Hanger | DSC_0571 (098) | Reemplazó foto errónea → READY ✔ |
| WM-HAN-004 | Metatron Mandala Hanger | DSC_0433 (100) | Reemplazó foto errónea → READY ✔ |
| WM-HAN-018 | Magnetic Greek Key Hangers 14mm | DSC_0550 (011/015/083…) | Adjuntó foto nueva → READY ✔ |
| WM-HAN-028 | Ornamental Wooden Weights 16mm | DSC_0559 (088) | Adjuntó foto nueva → READY ✔ |
| WM-SAD-001 | Ornamental Opal Saddle Expansions | DSC_0216 (034/037/039/040) | Reemplazó foto PLG-004 errónea → READY ✔ |

Catálogo ahora: total 191 · **READY 93** · **RAW 77** · SOLD OUT 15 · RESERVED 6.
Script `scripts/promote-6heroes.mjs`. Backup reversible: `data/backups/promote-6heroes-2026-05-30T11-15-14.json`.

## Pendiente ojo dueño — confirmá 1-a-1 antes de promover (ambigüedad tamaño/variante)
Estos los DEJÉ sin tocar: el producto está en inventario, pero hay que elegir el SKU/medida exacto o son una ráfaga.
- **Plugs** que necesitan elegir medida/SKU: labradorita redondo 20mm (001), labradorita teardrop (002/003), obsidiana (005/009), amatista (008), ojo de tigre rojo (006/007/020-027/031).
- **4 variantes Penrose Alai Wakan** (thumbs 200-250).
- **Hangers greca dorados ornamentales magnéticos** (082/086) — quizá ya están READY.
- Hangers gota amatista (012/014), dorado pesado (013/016/017/022), acero+amatista (030/032), dorado piedras negras (036).
- Ráfaga "quartz-point / pirámide drop" (thumbs 286-392) — ~2-3 diseños reales disparados ~100 veces. No clasificada aún.
