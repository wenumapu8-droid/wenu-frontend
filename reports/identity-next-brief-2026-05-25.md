# Identity next brief — 2026-05-25

Fecha de corte: 2026-05-25 13:33:07 PDT

## Objetivo
Retomar el rediseño visual de Wenu Mapu desde un estado coherente con la marca real: lujo ritual contemporáneo, producto primero, cero boho genérico, cero placeholders complacientes, y prioridad absoluta a fotos reales útiles para vender.

## Estado confirmado hoy
- El frontend compila localmente.
- La ruta `/wholesale` quedó parqueada como **currently unavailable** para no exponer un programa B2B activo antes de tiempo.
- El build sigue mostrando bloqueos de catálogo, no de layout base:
  - `WM-CARE-001` huérfano en NocoDB + category mismatch
  - `WM-SEP-008` huérfano en NocoDB
  - 13 warnings por fotos curadas faltantes y price drift WC ↔ Noco
- Reportes clave ya existentes:
  - `reports/design-action-plan-2026-05-22.md`
  - `reports/final-publish-readiness-2026-05-25.md`
  - `reports/visual-queue-next-actions-2026-05-20.md`

## Dirección visual ya definida
1. **Producto real primero**
   - foto real macro tier-1
   - nada de inventar producto
   - nada de IA para simular piezas
2. **Convergencia del sistema**
   - mismo nivel de disciplina en hero, categorías, lifestyle, PDP y banners
   - un solo lenguaje visual, sin excepciones
3. **Brecha principal actual**
   - faltan fotos de escala
   - faltan macros/fotos curadas en varios SKUs publicados
   - hay assets visuales buenos en `public/img/brand`, `public/img/hero`, `public/img/categories`, pero todavía hay dispersión

## Prioridad recomendada
### P1 — Safe polish del funnel
Auditar y pulir estas páginas en este orden:
1. `src/pages/index.astro`
2. `src/pages/shop.astro`
3. `src/pages/p/[slug].astro`
4. `src/pages/about.astro`
5. `src/pages/contact.astro`
6. `src/pages/local.astro`

### P2 — Coherencia visual por sistema
- revisar `src/components/Nav.astro`
- revisar `src/components/Footer.astro`
- revisar `src/components/PatternBand.astro`
- revisar `src/styles/tokens.css`
- revisar `src/styles/global.css`
- asegurar que las fotos nuevas reales ya agregadas estén realmente cableadas en las páginas correctas

### P3 — Presentación comercial de producto
- consolidar el estándar macro → escala → detalle → lifestyle
- dejar brief claro para futuras PDP y láminas técnicas
- no tocar WordPress live

## Criterio de calidad
- cada asset debe subir el nivel de marca o se archiva
- si una imagen se siente placeholder, genérica o demasiado AI, sale
- si falta escala, se marca como gap comercial, no se inventa
- si un banner no representa catálogo real, no se integra todavía

## Primera tanda de trabajo sugerida para el próximo agente
1. hacer una pasada visual de `home`, `shop` y `PDP`
2. listar exactamente qué se ve premium, qué se ve inconsistente y qué se ve provisional
3. proponer cambios locales concretos archivo por archivo
4. ejecutar solo cambios green-lane, sin deploy ni push

## No hacer
- no tocar WordPress live
- no activar wholesale
- no publicar redes
- no inventar producto con IA
- no corregir price drift tocando WC o Noco sin aprobación

## Resultado esperado de la próxima pasada
Un preview más limpio, más premium y más coherente, con menos ruido visual y mejor jerarquía comercial, pero sin romper catálogo ni forzar assets que todavía no están listos.
