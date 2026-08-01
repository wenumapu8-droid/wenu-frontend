---
title: KODEX −∞ · Printful ↔ WooCommerce (guía Ocin-executable)
date: 2026-07-27
status: ready-to-execute
owner: Ocin
context: kodex-microsite
---

# KODEX −∞ · Printful ↔ WooCommerce

Guía paso a paso para que Ocin conecte Printful a la tienda WC de Wenu Mapu, cree los products KODEX (poster, tee, sticker) y los deje visibles solo en `/kodex/store` (nunca en `/shop` de joyería).

**Pre-requisito ya hecho por mí (Claude):**
- ✅ Categoría `kodex` (id 485) creada en WC
- ✅ `src/lib/woo.ts` filtra la categoría kodex del shop de joyería, `/p/[slug]`, `/search-index.json` y del listado de categorías
- ✅ Producto placeholder `KODEX −∞ · Museum-Grade Print (placeholder)` id 3439 creado en draft

**Owner del proceso a partir de acá:** Ocin en el dashboard.

---

## Paso 1 — Cuenta Printful (10 min)

1. `printful.com/auth/register` → sign up con `marimari@wenumapuonline.com`.
2. Skip "add store now" (lo hacemos por WC, no manual).
3. Perfil → Billing → añadir método de pago (Printful cobra por cada orden fulfilled). No hay fee mensual.

## Paso 2 — Conectar WooCommerce (5 min)

1. En Printful dashboard: `Stores → Add store → WooCommerce`.
2. Store URL: `https://www.wenumapuonline.com`
3. Printful pide instalar el plugin `Printful Integration` en WP. Dos rutas:
   - **A) Auto:** Printful te redirige a WP admin, hacés login y aprueba el connect (OAuth). Recomendado.
   - **B) Manual:** WP admin → Plugins → Add New → buscar "Printful" → Install + Activate → API keys manual.
4. Verificar en Printful: la tienda aparece como "Connected · WooCommerce".

## Paso 3 — Configurar defaults Printful (5 min)

En `Store settings`:
- Fulfillment region: US East (más barato para Truckee/US).
- Shipping: usar Printful shipping profiles (evita cablear rates a mano).
- Order approval: **Manual** las primeras 5 órdenes (para revisar mockups). Luego cambiar a Automatic.
- Notification email: `marimari@wenumapuonline.com`.

## Paso 4 — Crear los primeros 3 productos Printful (30 min)

**Regla:** cada producto Printful se auto-crea en WC con la categoría `Uncategorized`. Ocin **tiene que moverlos a la categoría `KODEX`** manualmente después de crearlos (id 485, slug `kodex`).

### Producto 1 — Poster museo-grade

- Printful → `Add product → Wall art → Enhanced Matte Paper Poster`.
- Sizes recomendados: 12"×18", 18"×24", 24"×36". Precio final: markup 2× sobre base (Printful poster 12×18 ~$8 → precio venta $16).
- Design: subir `~/wenu-frontend/public/img/kodex/archive/arch-01.jpg` (300 DPI, 5000×5000 px OK).
- Nombre WC: `KODEX −∞ · Arch-01 Museum Poster`.
- Publicar → WC crea el producto.
- **En WC admin:** editar el producto recién creado → mover a categoría KODEX (quitar Uncategorized).

### Producto 2 — T-shirt sigilo

- Printful → `Add product → T-shirts → Bella + Canvas 3001 Unisex`.
- Design: usar `arch-14` o `disco-01` (verificar contraste sobre negro/blanco).
- Colores: Black, White, Bone. Sizes: XS-3XL.
- Precio: Printful base ~$12 → venta $28.
- Nombre WC: `KODEX −∞ · Arch-14 Sigil Tee`.
- **En WC admin:** mover a categoría KODEX.

### Producto 3 — Sticker

- Printful → `Add product → Accessories → Kiss-cut stickers`.
- 3", 4", 5.5".
- Design: uno por movimiento (arch-01, disco-01, arch-43).
- Precio: base $2 → venta $6.
- Nombre WC: `KODEX −∞ · Disco-01 Sticker`.
- **En WC admin:** mover a categoría KODEX.

## Paso 5 — Verificar que NO leaked al /shop de joyería (crítico)

Después de crear los productos:

```bash
cd ~/wenu-frontend
npm run build   # tarda ~8min
```

- El build debe pasar (verify pasa si dist/p ≥ 10 productos).
- Verificar que `dist/shop.html` NO contiene los slugs `kodex-`. Grep rápido:
  ```bash
  grep -c 'kodex-' dist/shop/index.html   # debe ser 0
  ```
- Si sale 0 → el filtro `slug === 'kodex'` en `src/lib/woo.ts` está funcionando. Deploy con `./deploy-now.sh`.
- Si sale >0 → los productos Printful no quedaron en categoría `kodex`. Volver a Paso 4 y mover manualmente.

## Paso 6 — Wire visual en /kodex/store

Una vez los productos existen en WC con categoría kodex:

- Editar `~/wenu-frontend/src/pages/kodex/store.astro`
- En el array `channels`, cambiar `PRINTS · POSTERS` y `STICKERS · TEES` de `soon:true` a `soon:false` + añadir `href:'/kodex/store#printful'`.
- Añadir sección nueva al final que fetchee de WC solo la categoría kodex (o hardcodear los links directos a los products Printful).

Esta parte la hago yo (Claude) cuando me digan que los products ya están creados y en categoría kodex. Solo necesito los IDs o slugs finales.

---

## Costos y márgenes de referencia (Printful base US)

| Producto | Base | Precio venta sugerido | Margen |
|---|---|---|---|
| Poster 12×18 matte | $8.15 | $18 | $9.85 |
| Poster 18×24 matte | $12.95 | $28 | $15.05 |
| Poster 24×36 matte | $22.95 | $48 | $25.05 |
| T-shirt Bella 3001 | $12.60 | $28 | $15.40 |
| T-shirt Champion crew | $22.50 | $45 | $22.50 |
| Sticker 3" kiss-cut | $2.40 | $6 | $3.60 |
| Sticker 5.5" | $4.20 | $10 | $5.80 |

**Shipping** lo paga el cliente en checkout (Printful lo calcula). No entra al margen.

---

## Alternativas si Printful no funciona

- **Gelato** — competidor directo, misma UX de connect, mejores precios en EU. Plugin WC oficial.
- **Fine Art America** — solo prints, pero calidad museum superior. No integra con WC (link externo).

Recomiendo Printful como default (integración WC madura, catálogo amplio, US-fulfillment barato).

---

## Bloqueadores

1. **Ocin logueado en Printful + WC admin** — no puedo hacerlo por él, requiere OAuth manual.
2. **Categoría KODEX manual** — Printful auto-asigna Uncategorized. Mover a `kodex` (id 485) después de cada create.
3. **Método de pago Printful** — sin billing configurado, no fulfillean órdenes.

---

## Siguiente pieza (cuando esto esté hecho)

Cablear la sección PRINTS en `/kodex/store` con los products WC reales. Esa parte la hago yo apenas Ocin diga "los tres productos están creados".
