# Clasificación monolito 2022 — cierre foto↔producto (2026-06-05)

Fuente: `/Volumes/LaCie/Wenu mapu/WenuMapu/📸 _INVENTARIO_FOTOS/_RAW_SOURCE/2022/`
Dedup: 1661 fotos únicas (de ~2900 crudas). Cross-match perceptual (dHash+color) vs 546 imágenes de referencia NocoDB.

## Veredicto

**0 productos nuevos.** Todo el monolito 2022 mapea a SKU existentes en NocoDB, a packaging/props, o a fotos personales. Confirma la sospecha del owner: el "2900" era casi todo duplicado + lifestyle.

- STRONG+MEDIUM (auto-match ≤16): ~644 → ya eran productos conocidos.
- NONE/WEAK (>16): 1017 revisadas a fondo (9 hojas detalle + mosaicos densos prod_1..4 y life_1..2).
  - **337 = fotos personales** (viaje desierto/Burning Man/playa/lago Tahoe/perros), RS22 idx 950-1296 = DSC_0203-0597 de 102D5100. → **reubicadas a `/Volumes/LaCie/Fotos/2022_personas_inventario/`** (copia, log reversible).
  - **680 = fotos de producto** de SKU existentes, en lighting difícil (siluetas a contraluz azul, sobreexpuestas, ángulos raros) — por eso el hash no matcheó, NO porque sean nuevas.

## Mapeo producto → familia SKU (NONE/WEAK)

| Lo que se ve en 2022 | Familia NocoDB |
|---|---|
| Plugs piedra verde/jade | WM-PLG-024/025/033 (jade) |
| Plugs labradorita | WM-PLG-015/023/028/032/034 |
| Plugs obsidiana/negro glass | WM-PLG-008/009/036 |
| Plugs ojo de tigre rojo | WM-PLG-022 / TUN-030 |
| Plugs madera roja (saddle) | WM-PLG-001/016/020 |
| Plugs patrón mandala/swirl negro | WM-PLG-002/018 |
| Plugs/tunnels glass transparente | familia glass/resin (PLG-037, TUN-022) |
| Saddle dorado liso (sillín) | **WM-SAD-006** (Polished Gold Saddle) |
| Saddles opal/blanco ornamental | WM-SAD-001/002/003/004/005 |
| Hanger serpiente bronce/maciza | **WM-HAN-005** (Ornamental Bronze Snake) |
| Hanger serpiente acero | WM-HAN-019 |
| Cobra plata fina (S/hook) | WM-HAN-023 |
| Teardrop amatista (siluetas loop+gota) | WM-HAN-008 |
| Hanger madera romboide | WM-HAN-027 (Diamond Walnut) |
| Pesas madera ornamental (keyhole) | WM-HAN-028 |
| Aros captive dorados + piedra negra | WM-HAN-014 |
| Aros griegos/ornamentados dorados | WM-HAN-009/010 |
| Tunnels dorados mandala / flower of life | WM-TUN-006/007/008 |
| Espiral glass glow-in-dark | **WM-HAN-030** (Glow Pyrex Spiral) |
| Anillos signet/tallados plata | WM-RNG-003/005/006/011 |
| Aros "om" dorados/plata | WM-EAR-011 (Om Stud) |
| Gafas de sol | WM-OTH-002 |

## No-producto (a Fotos / descarte)

- Personas/lifestyle viaje 2022 (337) → `Fotos/2022_personas_inventario/` ✓
- Packaging tarjeta madera p/ expansiones (0363, 1658) → no SKU
- Base/prop obsidiana (0449) → no SKU
- Fotos malas/sobreexpuestas/fuera de foco → descarte

## Flags para ojo del owner (NO nuevos, pero a confirmar tipo exacto)

1. **Darts azules glow (idx 1308-1321)** — piezas dart/keyhole brillando cian. Probable variante glow/UV de saddle-dart o HAN-030. Si es un producto glow DISTINTO al espiral, dímelo y le creo SKU.
2. **Piezas "pulpo/tentáculo" negras (0595-0601)** — siluetas en dedos con varias curvas colgando. Las leo como HAN-005 (snake ornamental) en silueta. Confirmar.

## Pendiente owner (SKU que pediste fijar de hoja 1)

- Ornamental plata sobre cuentas (0016, 0386-0389) — ¿SKU?
- Pendientes amatista (0110) — ¿EAR-014 o HAN-008/016?
- Aros hanger livianos variación color (0181, 0251) — ¿SKU?
- Serpiente maciza (0377-0381) — ¿HAN-005 bronce o HAN-019 acero?

## Reversibilidad

- Copia personas: `data/backups/life-photos-copy-2026-06-05.json` (revert: `rm -rf` la carpeta destino; originales intactos en _RAW_SOURCE).
