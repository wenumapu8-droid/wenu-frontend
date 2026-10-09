# WENU MAPU — Ritual Receipt Lab (2026-10-09)

## Estado

**Experimento visual y funcional** en `/ritual-receipt-lab/`. No hay venta ni factura real. La página es `noindex`, no tiene accesos desde la navegación ni toca el carrito/checkout.

**Prueba del prototipo:** agregar/restar piezas, elegir medio de pago ficticio, activar «Simulate payment», ver la salida del ticket, usar «Print sample ticket» para lanzar el diálogo nativo de impresión (estilo aproximado 80 mm). En Chrome/Android, el usuario deberá tener una impresora instalada o elegir guardar PDF. Ninguna impresión silenciosa/automática se ejecuta.

## Arquitectura del producto real

El frontend actual usa Astro + catálogo WooCommerce (build) pero su carrito personalizado usa `POST /shop/order` y enlaces de `POST /shop/checkout-link`, no WooCommerce Checkout. No conectar la pantalla a pagos reales solo desde el navegador.

```
checkout -> procesador/conciliación -> backend valida -> estado order.paid
                                                |
                                                +-> recibo privado post-compra
                                                +-> job idempotente de impresión
                                                          |
                                                          +-> bridge local confiable
                                                          +-> impresora 58/80 mm
```

* **Tarjeta / Mercado Pago:** el backend debe verificar la firma del webhook del procesador y consultar el pago; nunca marcar `paid` por un redirect cliente.
* **Venmo/Zelle:** el flujo actual de `submitOrder()` registra pedidos con pago por verificar. No es un pago confirmado aunque el comprador pulse que lo envió. Ticket provisional = «Order received / Payment pending».
* **Reserve:** no es cobro; nunca emitir «Paid».
* **Precios:** recuperar y calcular productos, envío, impuestos, descuentos, cantidades y moneda en backend; nunca fiarse de `localStorage` como verdad financiera.
* **No duplicados:** `event_id` único, `order_id` idempotente y registros `printed_at` con opción «reimpresión autorizada».
* **Privacidad:** no incluir datos personales sensibles en ticket o URL pública; acceso por sesión o enlace firmado para vista privada de recibo.
* **Impresión física:** elegir modelo compatible ESC/POS; una web pública no puede imprimir silenciosamente a un dispositivo local sin servicio/permiso. Evaluar QZ Tray / PrintNode / CUPS local y no abrir ningún puerto de impresora a Internet.
* **Jurídico/fiscal:** ticket ritual ≠ boleta tributaria. La emisión fiscal dependerá de país/jurisdicción y debe quedar conectada al sistema contable pertinente.
* **Accesibilidad:** no animar si `prefers-reduced-motion`. Mantener un checkout real corto y esta experiencia *después* del pago validado.

## Definition of done del MVP real

Pago sandbox procesado y confirmado con firma válida; venta registrada una vez; impresión en dispositivo concreto con manejo de papel agotado/offline; email transaccional al cliente; recibo con impuesto/envío real; reimpresión segura; QA móvil; control de impresión duplicada; revisión legal.

## Decisión pendiente del propietario

1. ¿Uso principal: festival/atelier con impresora física o ecommerce con recibo digital?
2. ¿Marca/modelo y ancho de la impresora: 58 mm o 80 mm? ¿USB, Bluetooth o red?
3. ¿Pasarela de pago definitiva y endpoint de verificación de pago ya disponible?
4. ¿Qué estación local ejecutará el servicio (Mac, laptop, Pi)?

No ampliar el checkout productivo hasta resolver estas decisiones y completar los tests anteriores.
