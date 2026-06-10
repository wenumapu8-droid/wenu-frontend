# Wenu Frontend — Founder Ops Launch System (2026-06-04)

## Executive read
Wenu no está en cero. El sistema ya tiene base real para operar remoto, pero hoy sufre tres fracturas:
1. **Claude UI** puede congelarse aunque el trabajo siga por detrás.
2. **Inventario visual** está partido entre NocoDB, LaCie y supuestos viejos del dashboard.
3. **Sitio** compila y existe, pero comercialmente todavía necesita foco, jerarquía y verdad visual.

## What is already true
- Hermes / gateway / cron: operativos.
- Claude Code session viva en `wenu-frontend` durante la auditoría.
- NocoDB local: online, 191 productos.
- Frontend Astro: build OK, preview OK, ~90 páginas generadas.
- Fotos reales existen en LaCie y NocoDB, pero no están organizadas de forma totalmente coherente para el pipeline final.

## Hard truths
- La home todavía se siente más editorial que vendedora.
- El catálogo tiene deuda de SKU/fotos/categorías/confianza.
- Solo 52 productos tienen macro usable >1200px.
- 72 productos no tienen foto útil en NocoDB.
- El endpoint `/api/inventory` no refleja el estado mental esperado del inventario por SKU porque los archivos viven sobre todo en `_PROCESADOS`.
- Un script de producción visual actual no matchea el esquema nuevo del audit (`ready: 0`).

## Strategic principle
No usar IA para “inventar un catálogo”.
Usar IA para **amplificar** productos reales ya existentes.

## Source of truth hierarchy
1. **NocoDB** → producto maestro, SKU, campos, attachments canónicos
2. **LaCie** → fotos originales/crudas, procesados, vitrina real, archivos físicos
3. **Frontend repo** → derivados web y composición comercial
4. **WooCommerce** → reflejo comercial, no fuente maestra

## Minimum viable launch system
### Lane A — Commercial truth
- limpiar drift WC ↔ NocoDB
- definir 20–30 SKUs publicables con verdad suficiente
- excluir lo que no tiene foto real creíble

### Lane B — Visual truth
- usar foto real como anchor para todo asset IA
- crear derivados por tipo:
  - macro enhancement
  - category tile
  - editorial banner
  - worn placement selectivo
- jamás reemplazar la documentación del producto por fantasía visual

### Lane C — UX / trust
- rehacer el above-the-fold de home
- CTA más obvio
- trust signals más arriba
- menos mística abstracta, más “qué vendemos / por qué confiar / cómo comprar”

### Lane D — Founder remote ops
- watchdog de Claude
- reportes persistentes en repo/vault
- checkpoints diarios
- trabajo multiagente: Claude para exploración/código, Hermes para continuidad, auditoría y cierre

## Recommended 10-day sequence
### Day 1–2
- cerrar shortlist de 20–30 SKUs launchable
- identificar top 10 con mejor visual truth
- definir backlog de fotos faltantes

### Day 3–4
- arreglar home hero, CTA, trust blocks, featured products
- reducir ruido y refinar jerarquía

### Day 5–6
- generar primeros assets IA fieles a producto real
- category tiles + 1–2 banners + 10 product enhancements

### Day 7–8
- reparar drift de catálogo y copy esencial
- validar PDPs clave

### Day 9–10
- review completo de beta funcional
- decidir qué queda dentro vs fuera del launch

## Practical SOP — Product-faithful AI image workflow
1. Elegir SKU desde NocoDB.
2. Verificar `Foto referencia` o `Foto macro` válida.
3. Si no existe, marcar `NEEDS_REAL_PHOTO`.
4. Si existe:
   - generar solo derivado editorial/comercial
   - conservar forma/material/escala exacta
5. Exportar asset web como derivado, nunca como sustituto del máster.
6. Registrar resultado y uso previsto: hero / category / PDP / IG / story.

## Immediate engineering backlog
- patch del script visual production pack para el esquema actual del audit
- dashboard / inventory model alignment (`_PROCESADOS` vs carpetas SKU)
- catálogo: resolver warnings y errores bloqueantes
- home UX pass
- definición de carpeta/manifest de “assets IA aprobados”

## Success metrics
- 20–30 SKUs launchables con verdad comercial
- 10 SKUs con assets visuales premium derivados de foto real
- home que explica y vende en 5 segundos
- cero dependencia de la ventana de Claude para continuidad operativa

## Files created / related
- `reports/site-status-audit-2026-06-04.md`
- `reports/founder-ops-launch-system-2026-06-04.md`
- `/tmp/wenu-audit.json`
- `~/Obsidian/WenuAgent/20-Operaciones/audit-productos-2026-06-04.md`
