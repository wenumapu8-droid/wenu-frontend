# WM-ORDER-001 — Wënü Order Experience
**Fecha:** 2026-11-06  
**Estado:** propuesta técnica + prototipo visual aislado (NO producción)  
**Objetivo:** ofrecer al comprador consulta privada de pedidos, productos, pago confirmado, preparación, despacho, escaneos del carrier y entrega, sin abandonar el storefront Astro ni duplicar el sistema de ventas.

## Hechos inspeccionados (en `main`, 2026-11-06)
- `astro.config.mjs`: Astro 6, `output: 'static'`; el catálogo se construye desde WooCommerce.
- `src/pages/account.astro`: pedidos por correo; el formulario de seguimiento abre un `mailto:`; no hay login ni status API en este frontend.
- `src/components/Cart.astro` y `ReserveModal.astro`: las solicitudes pasan por `PUBLIC_API_URL` (fallback `https://api.wenumapuonline.com`) → `POST /shop/order`. El carrito indica backend Postgres + correo/Telegram; Venmo y Zelle son manuales; Mercado Pago usa checkout alojado; existe modo reserva.
- `docs/ecommerce-hybrid-architecture-and-completion-plan.md`: WooCommerce está documentado como motor comercial, pero esto NO demuestra que cada solicitud del carrito actual origine una orden en Woo.
- `README.md` y `CLAUDE.md` contradicen aspectos del despliegue/dominio. Verificar infraestructura y autoridad del backend antes de activar cualquier ruta transaccional.
- `docs/COWORK.md`: agentes mini/imac comparten workspace; reclamar archivos antes de modificarlos.

## Prohibiciones
- Nada de despliegues, DNS, pagos, checkout, webhooks, clientes reales o inventario sin aprobación explícita.
- NO incluir `WC_CONSUMER_SECRET`, contraseñas, claves o tokens privilegiados en JavaScript del navegador o builds estáticos.
- NO asumir que un cobro Venmo/Zelle está pagado porque se generó una orden o se abrió un QR.
- NO activar una ruta pública que devuelva pedidos solo por número/email, ni exponer PII en analytics, logs o URLs.
- NO inventar GPS ni ubicaciones de paquetes; no confundir evento del carrier con tiempo real.

## Arquitectura propuesta

```text
Astro SSG (UI pública)
  /account                       acceso a pedido / solicitador de enlace privado
  /order-experience-preview      DEMO aislada, datos ficticios, noindex (esta rama)
  /orders/view                   vista protegida (futuro; no estática sin autenticación)
       |
       | HTTPS + sesión de acceso limitada
       v
Order Gateway (API privada en entorno autorizado: Node/Express existente
               o Cloudflare Worker, elección tras auditoría)
       |                   |
       |                   +--> Payment status reconciled (manual / Mercado Pago)
       |                   +--> Carrier adapter (USPS/UPS/AfterShip sólo si conectado)
       +--> Orders DB (confirmar esquema Postgres de /shop/order)
       +--> Optional Woo order reconciler (solamente si existen órdenes Woo)
       +--> Event log / idempotency / notificaciones
```

**Fuente de verdad a confirmar:** primer candidato: base de órdenes detrás de `/shop/order`; WooCommerce solo cuando se demuestre que contiene el pedido correspondiente. Crear `canonical_order_id` y `external_refs` sin duplicar órdenes ni hacer merge por email únicamente. Las solicitudes `reserve` son distintas de ventas pagadas.

### Contrato del estado de pedido
Estados internos sugeridos: `requested`, `reserved`, `awaiting_payment`, `payment_review`, `paid`, `preparing`, `dispatched`, `out_for_delivery`, `delivered`, `exception`, `cancelled`, `refunded`. Una reserva no equivale a `paid`. El estado visible debe derivarse de eventos auditables y no permitir saltos imposibles. Guardar historial inmutable y `occurred_at`/zona horaria y `source`.

Objeto mínimo normalizado (contrato privado; nunca volcarlo completo en el cliente):
```json
{
  "id": "opaque-identifier",
  "display_reference": "WM-XXXX",
  "status": "preparing",
  "payment_status": "confirmed",
  "items": [{"sku": "EXAMPLE", "name": "Example", "quantity": 1, "image_url": null}],
  "fulfillment": {"method": "shipping", "carrier": null, "tracking_display": null, "tracking_url": null},
  "events": [{"type": "preparing", "occurred_at": "2026-11-06T00:00:00Z", "source": "internal"}]
}
```
`tracking_url` debe ser URL validada de carrier aprobado; no reflejar URLs arbitrarias. Las fotos salen del snapshot de pedido, no necesariamente del catálogo actual. Montos y dirección del cliente solo si aporta y está autorizado.

## Acceso seguro — bloquear enumeración
1. `POST /v1/order-access/request` con email y referencia opcional. Respuesta **idéntica** 202 para existentes/inexistentes; CAPTCHA/rate limit por IP + identidad sin revelar existencia.
2. Backend envía enlace de acceso de un uso a **correo verificado vinculado al pedido**, con vencimiento corto (recomendado 15 min), token aleatorio >= 128 bits, hash almacenado; no enviar datos de pedido en el correo previo a autenticación.
3. `POST /v1/order-access/exchange` canjea token una vez, emite cookie HttpOnly + Secure + SameSite=Lax, sesión corta y con alcance solo a la orden; limpiar token de la URL de forma inmediata. Para frontend puramente estático, el gateway debe servir el acceso con sesiones/headers apropiados.
4. `GET /v1/orders/:id` verifica sesión y vinculación con ese id en servidor; devuelve vista mínima saneada. `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`, CSP.
5. Reintentos, logout, expiración y revocación; no `localStorage` para tokens.

## Shipment adapter
- Primero registrar `carrier`, `tracking_number`, `tracking_url` validado y `shipped_at` desde operación interna.
- Lectura de eventos mediante API del carrier o agregador, guardando `provider_event_id` para deduplicación. Verificar autenticidad de webhooks (firma + timestamp/tolerancia de replay), reconciliar orden, y tratar eventos fuera de orden.
- UI muestra secuencia de **escaneos verificados** con fecha/ciudad solo si el proveedor la entrega. Mapa opcional condicionado a datos reales y precisión conocida; nunca prometer GPS en directo.
- Si no hay carrier o tracking, mostrar “Preparing / Tracking not yet available”; si falta ubicación, mostrar línea de tiempo, no mapa ficticio.

## Notificaciones
Confirmación de recepción, solicitud de pago (cuando aplique), pago **efectivamente conciliado**, preparación (opcional), despacho con enlace privado seguro y entrega verificada. Templates en inglés por defecto; consentimiento y preferencias para marketing separados de comunicaciones transaccionales. Reintentos idempotentes, trazabilidad de envíos y unsubscribe solo para marketing.

## Plan para Claude Code / Hermes
### Gate 0 — Auditoría READ ONLY (bloqueante)
- Inspeccionar backend de `/shop/order`: persistencia, IDs, schema, timestamps, campos personales, métodos de pago, tratamiento de reservas, modelo de fulfillment y políticas de acceso.
- Probar si WooCommerce recibe las mismas órdenes o sólo provee productos.
- Identificar hosting real del API y del frontend; resolver discrepancias README / CLAUDE / producción. Confirmar cuál branch se despliega.
- Comprobar webhook de Mercado Pago y vulnerabilidades de pago existentes; **no activar** integraciones automáticas sin firma, monto, moneda, idempotencia y autorización.
- Verificar políticas de privacidad, emails transaccionales y proveedores de envío; no asumir integración.
- Entregable: `docs/order-experience/00-audit.md` con evidencias, mapa de datos y ADR de fuente de verdad. Si no hay acceso, marcar BLOQUEADO.

### Gate 1 — Contratos y seguridad
- Diseñar tablas `orders_normalized` (o vistas sobre existente), `order_items`, `order_events`, `shipments`, `order_access_tokens`, `notification_jobs` **solo si no existen equivalentes**.
- Idempotencia en webhook/orden/email y control de estados con pruebas unitarias; migraciones reversibles en staging.
- Integrar `/v1/order-access/*` y endpoint `/v1/orders/:id` con fixtures; pruebas de autorización cruzada/IDOR, rate limit y no-enumeración.
- Entregables: OpenAPI, test suite, threat model, plan de rollback. Ningún dato real en fixtures.

### Gate 2 — UI Astro
- Revisar prototipo `src/pages/order-experience-preview.astro` y tokens `src/styles/tokens.css`.
- Crear experiencia en `/account` sin romper su fallback actual de correo. Activar enlace privado sólo con feature flag `PUBLIC_WM_ORDER_TRACKING_ENABLED=true` y backend autenticado listo.
- No servir páginas de pedidos privadas como HTML estático prerenderizado. Considerar Worker/SSR separado para vistas protegidas.
- Accesibilidad WCAG 2.2 AA, 320-1440px, teclado, screen readers, `prefers-reduced-motion`, sin simulación de status de producción.
- Preparar prueba end-to-end cliente A no puede acceder al pedido B.

### Gate 3 — Shipping & QA
- Conectar un carrier real elegido tras auditoría; fixtures de `label_created`, `in_transit`, `out_for_delivery`, `delivered`, `exception`, errores y eventos duplicados/fuera de orden.
- Medir entregabilidad emails, latencia y tasas de fallo. Asegurar fallback de contacto y reintento.
- Probar mobile Android y iOS; locales inglés; aprobar copy Wënü.
- Preview privado + capturas + `npm run build` + revisión de seguridad + PR draft. **No deploy de producción**.

## Criterios de aceptación antes de lanzamiento
- [ ] Fuente de verdad para cada tipo de pedido documentada y probada.
- [ ] Usuario legítimo ve exclusivamente su pedido; pruebas de acceso cruzado bloqueadas.
- [ ] Ningún pedido se marca pagado sin reconciliación de pago verificable.
- [ ] Notificaciones no se duplican, y el sistema tolera carriers/webhooks fuera de servicio.
- [ ] No hay PII ni secretos en bundle JS, HTML estático, URL, logs, analytics o emails equivocados.
- [ ] Demo no se presenta como live; si falta proveedor de tracking se conserva fallback.
- [ ] `npm run build` y QA responsive y accesibilidad aprobados por agente local.
- [ ] Aprobación humana explícita antes de migrar datos, cambiar checkout o desplegar.

## Ownership y límites de ramas
Owner: Wënü commerce. Claude Code backend revisa sólo API /schema en entorno de prueba tras Gate 0. Agente frontend trabaja ruta/estilos del portal en rama separada. Seguridad revisa autenticación/pagos/webhooks antes del merge. Hermes coordina dependencias y registra evidencias, no debe ejecutar cambios de producción. Respetar `docs/COWORK.md` y `agent-control` vigentes. No tocar KODEX, aftercare ni la home cinematográfica.

## Métricas mínimas
`order_lookup_success_rate`, `tracking_link_open_rate`, `carrier_event_delay_p95`, `notification_failure_rate`, `order_support_tickets_per_100_orders`, `reorders_30d`. Registrar métricas agregadas sin datos personales.
