# Final publish readiness — 2026-05-25

## Estado real
- Branch actual: `redesign-v2`
- Build local Astro: **OK**
- Páginas generadas: **58**
- Productos construidos: **11**
- `postbuild`: corre y termina, pero el audit deja **3 errores** y **13 warnings**

## Lo importante
El frontend **sí compila**. El bloqueo para una publicación final no es tanto visual/técnico del build, sino de **catálogo/datos** y de **cutover**.

## Bloqueos duros detectados
1. `WM-CARE-001`
   - category mismatch: esperado `accessories`, actual `[Sin categorizar]`
   - SKU no encontrado en NocoDB
2. `WM-SEP-008`
   - SKU no encontrado en NocoDB
3. Cutover productivo
   - según `CLAUDE.md`, `wenumapuonline.com` sigue sirviendo el WordPress legacy
   - el deploy final al dominio principal no está cableado en este repo

## Riesgos medios
- Price drift WC ↔ Noco:
  - `WM-HAN-028`: WC 80 vs Noco 50
  - `WM-TUN-017`: WC 28 vs Noco 40
  - `WM-SEP-002`: WC 45 vs Noco 30
- Falta de foto curada en múltiples SKUs publicados:
  - `WM-CARE-001`
  - `WM-RNG-003`
  - `WM-HAN-028`
  - `WM-TUN-017`
  - `WM-PRC-006`
  - `WM-SEP-001`
  - `WM-HAN-026`
  - `WM-HAN-029`
  - `WM-SEP-002`
  - `WM-SEP-008`

## Qué sí puedo avanzar sin tocar WordPress live
### Lane 1 — Publish readiness pack
- checklist final de publicación
- matriz de blockers duros vs blandos
- lista exacta de assets/SKUs faltantes
- plan de rollback/cutover

### Lane 2 — Frontend safe polish
- revisar páginas clave del funnel:
  - home
  - shop
  - PDP
  - contact
  - local
  - shipping
- detectar roturas visuales o contenido placeholder
- dejar preview limpia para revisión

### Lane 3 — Data gap pack
- armar lista exacta de SKUs huérfanos y price drift
- dejar payload/brief para corregir Noco antes del switch
- no tocar WC live

## Recomendación
Orden sugerido para avanzar hacia publicación final:
1. Cerrar huérfanos y drift de catálogo
2. Revisar visualmente preview de home/shop/PDP
3. Preparar checklist de cutover final
4. Recién ahí decidir switch de dominio

## Conclusión
Hoy el sitio nuevo **está bastante cerca de publicable en preview**, pero **todavía no está listo para corte final a dominio principal** sin resolver catálogo huérfano, drift de precios y estrategia de cutover.
