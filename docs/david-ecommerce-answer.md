# Respuesta Para David — Wenu Mapu Ecommerce

David, la duda es valida: un sitio Astro/Claude Code no trae por si solo un product manager como WordPress/WooCommerce.

Pero en Wenu Mapu no lo estamos usando como reemplazo total de WooCommerce.

La arquitectura actual es:

```text
WooCommerce = productos, stock, checkout, pagos, ordenes y clientes.
Astro = storefront premium, catalogo publico, PDP, SEO, marca y velocidad.
NocoDB/wenu-platform = inventario interno, fotos, clasificador y fichas tecnicas.
```

Entonces el sitio nuevo no es una tienda estatica sin backend. Es una capa visual/headless encima de WooCommerce.

Lo que ya hace:

- lee productos publicados desde WooCommerce;
- genera shop;
- genera paginas de producto;
- muestra precio, SKU, imagen, categoria y stock;
- agrega Product schema para SEO;
- manda Add to cart al carrito WooCommerce.

Lo que WooCommerce sigue haciendo:

- administrar productos;
- stock;
- carrito;
- checkout;
- pagos;
- ordenes;
- clientes;
- impuestos y envios.

La estrategia correcta no es botar WordPress. Es:

```text
WooCommerce limpio por dentro.
Astro premium por fuera.
NocoDB ordenando fotos e inventario.
```

Eso permite que Wenu Mapu tenga una experiencia visual mucho mas fina sin perder el motor comercial que ya funciona.

No estamos reemplazando WooCommerce todavia. Estamos construyendo un storefront premium conectado al catalogo WooCommerce.
