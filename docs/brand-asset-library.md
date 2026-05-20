# Wenu Mapu Brand Asset Library

Generated: 2026-05-16T07:21:22.566Z

## Que Es Esto

Esta biblioteca convierte las carpetas de marca, marketing, producto y archivo en una lista accionable: cada pieza queda con nombre, rol, estado y uso recomendado.

Regla de seguridad: este proceso es solo lectura. No copia archivos, no sube nada, no escribe WooCommerce, no toca DNS, no hace deploy y no lee secretos.

## Mapa Simple

| Departamento | Sirve para | Accion normal |
| --- | --- | --- |
| Identidad | Logos, simbolos, marca madre | Validar antes de usar publico |
| Web | Hero, banners, fondos, graficos UI | Copiar a `public/img`, optimizar y cablear en Astro |
| Producto | Fotos finales, renders, macros | Asociar a SKU/producto y revisar calidad |
| Marketing | Campanas, dipticos, QR, Behance | Convertir en piezas web/social si corresponde |
| Social | Stories, posts, plantillas | Derivar contenido para Instagram/Canva |
| Archivo | Fuentes historicas, compras, screenshots | Mantener como referencia, no publicar directo |

## Notas De Marca Detectadas

- Logo: el sistema local indica no asumir una version oficial sin validacion humana.
- Criterio operativo: una imagen puede ser bella, pero solo entra a la web si tiene rol claro, formato web y ubicacion definida.

## Roles

- `identity-logo`: Logo, marca, favicon o sistema de identidad. Usar solo si esta validado como version oficial.
- `web-hero-banner`: Imagen ancha para hero, banner, Open Graph o cabecera de coleccion.
- `web-background-texture`: Textura, patron o fondo sutil para secciones web.
- `web-graphic-ui`: Icono, divisor, simbolo o grafica pequena para interfaz.
- `web-product`: Foto/render de producto que puede alimentar PDP, catalogo o laminas.
- `product-master`: Fuente maestra o fotografia base de producto; revisar antes de copiar a public/img.
- `social-template`: Material para Instagram, stories, posts o plantillas de redes.
- `marketing-collateral`: Banner, diptico, portfolio, QR o pieza impresa/digital de campana.
- `qr-code`: QR para formularios, aftercare, links o material fisico.
- `copy-doc`: Documento de marca, copy, reglas visuales o metadatos.
- `archive-source`: Archivo historico o fuente sin destino web inmediato.

## Estados

- `already-wired`: Ya vive en public/img y puede estar referenciado por la web.
- `website-ready-source`: Formato web o fuente cercana; candidato a copiar/optimizar si se aprueba.
- `needs-human-approval`: Debe validarse visualmente antes de entrar al sitio.
- `source-only`: Guardar como fuente o referencia; no usar directo en frontend.
- `review-required`: Necesita clasificacion manual por ambiguedad o riesgo de marca.

## Resumen

- Assets clasificados: 1326
- Fuentes revisadas: 7
- Website public assets: 46 assets
- Obsidian brand system: 177 assets
- Obsidian ChatGPT image intake: 0 assets
- LaCie marketing: 10 assets
- LaCie design archive: 95 assets
- LaCie WooCommerce-ready source: 98 assets
- LaCie inventory photos: truncated at 900

### Por Rol

- archive-source: 994
- product-master: 189
- copy-doc: 50
- web-hero-banner: 22
- social-template: 12
- marketing-collateral: 11
- web-graphic-ui: 11
- qr-code: 10
- web-background-texture: 10
- web-product: 9
- identity-logo: 8

### Por Estado

- source-only: 1021
- website-ready-source: 191
- needs-human-approval: 68
- already-wired: 46

## Prioridades De Uso

1. `already-wired`: revisar visualmente que lo que ya esta en web mantiene la marca.
2. `website-ready-source`: candidatos directos para copiar, optimizar y usar en banners/fondos/productos.
3. `needs-human-approval`: mirar en el board antes de usar, sobre todo logos, screenshots, renders y material historico.
4. `source-only`: mantener como memoria de marca, no publicar.

## Banners Y Heroes

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| Website public assets | `graphics/collection-backdrop.svg` | web-hero-banner | already-wired | - | 1 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-graphic.avif` | web-hero-banner | already-wired | - | 84 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-graphic.webp` | web-hero-banner | already-wired | - | 122 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait-1200w.avif` | web-hero-banner | already-wired | - | 38 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait-1200w.webp` | web-hero-banner | already-wired | - | 51 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait-1800w.avif` | web-hero-banner | already-wired | - | 92 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait-1800w.webp` | web-hero-banner | already-wired | - | 115 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait-600w.avif` | web-hero-banner | already-wired | - | 12 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait-600w.webp` | web-hero-banner | already-wired | - | 15 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait-900w.avif` | web-hero-banner | already-wired | - | 25 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait-900w.webp` | web-hero-banner | already-wired | - | 33 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait.avif` | web-hero-banner | already-wired | - | 92 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| Website public assets | `hero/hero-portrait.webp` | web-hero-banner | already-wired | - | 132 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie inventory photos | `_ERROR/montaje_web_wenumapu_BANNER.png` | web-hero-banner | needs-human-approval | - | 1.8 MB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie inventory photos | `_ERROR/montajeweb_banner.png` | web-hero-banner | needs-human-approval | - | 993 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie inventory photos | `_NUEVOS/BANNER_ETSY_2.png` | web-hero-banner | needs-human-approval | - | 845 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie marketing | `banner_meteorite_ritual_rings.webp` | web-hero-banner | website-ready-source | - | 97 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie marketing | `escritorio_banner1.webp` | web-hero-banner | website-ready-source | - | 87 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie marketing | `meteorite_ring_collection_banner.webp` | web-hero-banner | website-ready-source | - | 138 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie marketing | `meteorite_ritual_collection_banner_final.webp` | web-hero-banner | website-ready-source | - | 149 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie design archive | `Social_Media/meteorite_ring_collection_banner.webp` | web-hero-banner | website-ready-source | - | 138 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |
| LaCie design archive | `Social_Media/meteorite_ritual_collection_banner_final.webp` | web-hero-banner | website-ready-source | - | 149 KB | Banner o cabecera para home/shop/colecciones. Revisar recorte responsive. |

## Fondos Y Texturas

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| LaCie inventory photos | `_ERROR/Medusa detalle fondo negro II.JPG` | web-background-texture | needs-human-approval | - | 2.1 MB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| LaCie inventory photos | `_ERROR/Medusa fondo negro II.JPG` | web-background-texture | needs-human-approval | - | 2.2 MB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| LaCie inventory photos | `_ERROR/Medusas detalle fondo negro.JPG` | web-background-texture | needs-human-approval | - | 2.0 MB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-002/wm-sad-002-reptile-texture-opal-saddle-expansion-front-full.avif` | web-background-texture | website-ready-source | WM-SAD-002 | 39 KB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-002/wm-sad-002-reptile-texture-opal-saddle-expansion-front-full.webp` | web-background-texture | website-ready-source | WM-SAD-002 | 57 KB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-002/wm-sad-002-reptile-texture-opal-saddle-expansion-front-medium.avif` | web-background-texture | website-ready-source | WM-SAD-002 | 29 KB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-002/wm-sad-002-reptile-texture-opal-saddle-expansion-front-medium.webp` | web-background-texture | website-ready-source | WM-SAD-002 | 35 KB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-002/wm-sad-002-reptile-texture-opal-saddle-expansion-front-thumb.avif` | web-background-texture | website-ready-source | WM-SAD-002 | 24 KB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-002/wm-sad-002-reptile-texture-opal-saddle-expansion-front-thumb.webp` | web-background-texture | website-ready-source | WM-SAD-002 | 25 KB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |
| Obsidian brand system | `05-graphics/dividers-svg/divider-abstract-weave.svg` | web-background-texture | website-ready-source | - | 1 KB | Fondo o overlay sutil para secciones oscuras; no usar como imagen principal. |

## Simbolos E Interfaz

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| Website public assets | `graphics/cardinal-sigil.svg` | web-graphic-ui | already-wired | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| LaCie design archive | `Dipticos/diptico_kultrun.png` | web-graphic-ui | needs-human-approval | - | 277 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/dividers-svg/divider-cardinal-cross-repeat.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/dividers-svg/divider-stepped-triangles.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/dividers-svg/divider-zigzag-diamonds.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/icons/icon-cardinal-cross.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/icons/icon-copihue.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/icons/icon-kultrun.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/icons/icon-meteor.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/icons/icon-spiral.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |
| Obsidian brand system | `05-graphics/icons/icon-volcano.svg` | web-graphic-ui | website-ready-source | - | 1 KB | Elemento grafico de interfaz: divisor, icono, simbolo o decoracion controlada. |

## Producto / SKU

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| LaCie inventory photos | `_ERROR/PRODUCT3.png` | product-master | needs-human-approval | - | 3.1 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: PRODUCT3. |
| LaCie inventory photos | `_ERROR/SEPTUM_G23.png` | product-master | needs-human-approval | - | 2.2 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: SEPTUM G23. |
| LaCie inventory photos | `_ERROR/slice_EARCUFF.png` | product-master | needs-human-approval | - | 335 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: slice EARCUFF. |
| LaCie inventory photos | `_ERROR/slice_plugs.png` | product-master | needs-human-approval | - | 227 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: slice plugs. |
| LaCie inventory photos | `_ERROR/slice_PLUGSANDHANGERS.png` | product-master | needs-human-approval | - | 320 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: slice PLUGSANDHANGERS. |
| LaCie inventory photos | `_ERROR/slice_septum.png` | product-master | needs-human-approval | - | 269 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: slice septum. |
| LaCie inventory photos | `_ERROR/wooden_ear.png` | product-master | needs-human-approval | - | 3.6 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wooden ear. |
| LaCie design archive | `Product_Photography/Hanger_Ammonite_Bronze_Teardrop_EDITED.jpg` | product-master | needs-human-approval | - | 173 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Hanger Ammonite Bronze Teardrop EDITED. |
| LaCie design archive | `Product_Photography/Hanger_Ammonite_Bronze_Teardrop.jpg` | product-master | needs-human-approval | - | 94 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Hanger Ammonite Bronze Teardrop. |
| LaCie design archive | `Product_Photography/mockup_psy_spectrum_ring.webp` | product-master | needs-human-approval | - | 67 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: mockup psy spectrum ring. |
| LaCie design archive | `Product_Photography/Render_Mockup_3000_4000_2024-01-25 (1).jpg` | product-master | needs-human-approval | - | 1.7 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 3000 4000 2024 01 25 (1). |
| LaCie design archive | `Product_Photography/Render_Mockup_3000_4000_2024-01-25 (2).jpg` | product-master | needs-human-approval | - | 1.3 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 3000 4000 2024 01 25 (2). |
| LaCie design archive | `Product_Photography/Render_Mockup_3000_4000_2024-01-25 (3).jpg` | product-master | needs-human-approval | - | 1.3 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 3000 4000 2024 01 25 (3). |
| LaCie design archive | `Product_Photography/Render_Mockup_3000_4000_2024-01-25.jpg` | product-master | needs-human-approval | - | 1.6 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 3000 4000 2024 01 25. |
| LaCie design archive | `Product_Photography/Render_Mockup_4000_3000_2024-01-25 (1).jpg` | product-master | needs-human-approval | - | 1.3 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 4000 3000 2024 01 25 (1). |
| LaCie design archive | `Product_Photography/Render_Mockup_4000_3000_2024-01-25 (2).jpg` | product-master | needs-human-approval | - | 670 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 4000 3000 2024 01 25 (2). |
| LaCie design archive | `Product_Photography/Render_Mockup_4000_3000_2024-01-25 (3).jpg` | product-master | needs-human-approval | - | 787 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 4000 3000 2024 01 25 (3). |
| LaCie design archive | `Product_Photography/Render_Mockup_4000_3000_2024-01-25 (4).jpg` | product-master | needs-human-approval | - | 700 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 4000 3000 2024 01 25 (4). |
| LaCie design archive | `Product_Photography/Render_Mockup_4000_3000_2024-01-25.jpg` | product-master | needs-human-approval | - | 784 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: Render Mockup 4000 3000 2024 01 25. |
| LaCie WooCommerce-ready source | `WRR-VACAM-003/image-3.png` | product-master | needs-human-approval | WRR-VACAM-003 | 2.5 MB | Fuente de producto para catalogo, PDP o lamina; nombre visible: image 3. Producto/sku: WRR-VACAM-003. |
| Obsidian brand system | `04-photography/product-macro/final/WM-EAR-001/wm-ear-001-ethnic-shipibo-hoop-earrings-gold-silver-front-full.avif` | product-master | website-ready-source | WM-EAR-001 | 65 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm ear 001 ethnic shipibo hoop earrings gold silver front full. Producto/sku: WM-EAR-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-EAR-001/wm-ear-001-ethnic-shipibo-hoop-earrings-gold-silver-front-full.webp` | product-master | website-ready-source | WM-EAR-001 | 103 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm ear 001 ethnic shipibo hoop earrings gold silver front full. Producto/sku: WM-EAR-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-EAR-001/wm-ear-001-ethnic-shipibo-hoop-earrings-gold-silver-front-medium.avif` | product-master | website-ready-source | WM-EAR-001 | 41 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm ear 001 ethnic shipibo hoop earrings gold silver front medium. Producto/sku: WM-EAR-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-EAR-001/wm-ear-001-ethnic-shipibo-hoop-earrings-gold-silver-front-medium.webp` | product-master | website-ready-source | WM-EAR-001 | 55 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm ear 001 ethnic shipibo hoop earrings gold silver front medium. Producto/sku: WM-EAR-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-EAR-001/wm-ear-001-ethnic-shipibo-hoop-earrings-gold-silver-front-thumb.avif` | product-master | website-ready-source | WM-EAR-001 | 30 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm ear 001 ethnic shipibo hoop earrings gold silver front thumb. Producto/sku: WM-EAR-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-EAR-001/wm-ear-001-ethnic-shipibo-hoop-earrings-gold-silver-front-thumb.webp` | product-master | website-ready-source | WM-EAR-001 | 34 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm ear 001 ethnic shipibo hoop earrings gold silver front thumb. Producto/sku: WM-EAR-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-001/wm-han-001-witral-vilu-hanger-front-full.avif` | product-master | website-ready-source | WM-HAN-001 | 52 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 001 witral vilu hanger front full. Producto/sku: WM-HAN-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-001/wm-han-001-witral-vilu-hanger-front-full.webp` | product-master | website-ready-source | WM-HAN-001 | 80 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 001 witral vilu hanger front full. Producto/sku: WM-HAN-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-001/wm-han-001-witral-vilu-hanger-front-medium.avif` | product-master | website-ready-source | WM-HAN-001 | 36 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 001 witral vilu hanger front medium. Producto/sku: WM-HAN-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-001/wm-han-001-witral-vilu-hanger-front-medium.webp` | product-master | website-ready-source | WM-HAN-001 | 47 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 001 witral vilu hanger front medium. Producto/sku: WM-HAN-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-001/wm-han-001-witral-vilu-hanger-front-thumb.avif` | product-master | website-ready-source | WM-HAN-001 | 27 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 001 witral vilu hanger front thumb. Producto/sku: WM-HAN-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-001/wm-han-001-witral-vilu-hanger-front-thumb.webp` | product-master | website-ready-source | WM-HAN-001 | 31 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 001 witral vilu hanger front thumb. Producto/sku: WM-HAN-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-005/wm-han-005-ornamental-bronze-snake-weights-front-full.avif` | product-master | website-ready-source | WM-HAN-005 | 40 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 005 ornamental bronze snake weights front full. Producto/sku: WM-HAN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-005/wm-han-005-ornamental-bronze-snake-weights-front-full.webp` | product-master | website-ready-source | WM-HAN-005 | 61 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 005 ornamental bronze snake weights front full. Producto/sku: WM-HAN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-005/wm-han-005-ornamental-bronze-snake-weights-front-medium.avif` | product-master | website-ready-source | WM-HAN-005 | 31 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 005 ornamental bronze snake weights front medium. Producto/sku: WM-HAN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-005/wm-han-005-ornamental-bronze-snake-weights-front-medium.webp` | product-master | website-ready-source | WM-HAN-005 | 38 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 005 ornamental bronze snake weights front medium. Producto/sku: WM-HAN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-005/wm-han-005-ornamental-bronze-snake-weights-front-thumb.avif` | product-master | website-ready-source | WM-HAN-005 | 26 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 005 ornamental bronze snake weights front thumb. Producto/sku: WM-HAN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-005/wm-han-005-ornamental-bronze-snake-weights-front-thumb.webp` | product-master | website-ready-source | WM-HAN-005 | 28 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 005 ornamental bronze snake weights front thumb. Producto/sku: WM-HAN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-006/wm-han-006-golden-stainless-steel-weights-with-black-obsidian-front-full.avif` | product-master | website-ready-source | WM-HAN-006 | 42 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 006 golden stainless steel weights with black obsidian front full. Producto/sku: WM-HAN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-006/wm-han-006-golden-stainless-steel-weights-with-black-obsidian-front-full.webp` | product-master | website-ready-source | WM-HAN-006 | 74 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 006 golden stainless steel weights with black obsidian front full. Producto/sku: WM-HAN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-006/wm-han-006-golden-stainless-steel-weights-with-black-obsidian-front-medium.avif` | product-master | website-ready-source | WM-HAN-006 | 32 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 006 golden stainless steel weights with black obsidian front medium. Producto/sku: WM-HAN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-006/wm-han-006-golden-stainless-steel-weights-with-black-obsidian-front-medium.webp` | product-master | website-ready-source | WM-HAN-006 | 44 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 006 golden stainless steel weights with black obsidian front medium. Producto/sku: WM-HAN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-006/wm-han-006-golden-stainless-steel-weights-with-black-obsidian-front-thumb.avif` | product-master | website-ready-source | WM-HAN-006 | 27 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 006 golden stainless steel weights with black obsidian front thumb. Producto/sku: WM-HAN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-006/wm-han-006-golden-stainless-steel-weights-with-black-obsidian-front-thumb.webp` | product-master | website-ready-source | WM-HAN-006 | 31 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 006 golden stainless steel weights with black obsidian front thumb. Producto/sku: WM-HAN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-007/wm-han-007-sanskrit-mantra-hanger-with-secret-compartment-front-full.avif` | product-master | website-ready-source | WM-HAN-007 | 44 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 007 sanskrit mantra hanger with secret compartment front full. Producto/sku: WM-HAN-007. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-007/wm-han-007-sanskrit-mantra-hanger-with-secret-compartment-front-full.webp` | product-master | website-ready-source | WM-HAN-007 | 65 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 007 sanskrit mantra hanger with secret compartment front full. Producto/sku: WM-HAN-007. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-007/wm-han-007-sanskrit-mantra-hanger-with-secret-compartment-front-medium.avif` | product-master | website-ready-source | WM-HAN-007 | 31 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 007 sanskrit mantra hanger with secret compartment front medium. Producto/sku: WM-HAN-007. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-007/wm-han-007-sanskrit-mantra-hanger-with-secret-compartment-front-medium.webp` | product-master | website-ready-source | WM-HAN-007 | 38 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 007 sanskrit mantra hanger with secret compartment front medium. Producto/sku: WM-HAN-007. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-007/wm-han-007-sanskrit-mantra-hanger-with-secret-compartment-front-thumb.avif` | product-master | website-ready-source | WM-HAN-007 | 25 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 007 sanskrit mantra hanger with secret compartment front thumb. Producto/sku: WM-HAN-007. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-007/wm-han-007-sanskrit-mantra-hanger-with-secret-compartment-front-thumb.webp` | product-master | website-ready-source | WM-HAN-007 | 27 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 007 sanskrit mantra hanger with secret compartment front thumb. Producto/sku: WM-HAN-007. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-008/wm-han-008-golden-amethyst-teardrop-hanger-front-full.avif` | product-master | website-ready-source | WM-HAN-008 | 40 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 008 golden amethyst teardrop hanger front full. Producto/sku: WM-HAN-008. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-008/wm-han-008-golden-amethyst-teardrop-hanger-front-full.webp` | product-master | website-ready-source | WM-HAN-008 | 68 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 008 golden amethyst teardrop hanger front full. Producto/sku: WM-HAN-008. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-008/wm-han-008-golden-amethyst-teardrop-hanger-front-medium.avif` | product-master | website-ready-source | WM-HAN-008 | 31 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 008 golden amethyst teardrop hanger front medium. Producto/sku: WM-HAN-008. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-008/wm-han-008-golden-amethyst-teardrop-hanger-front-medium.webp` | product-master | website-ready-source | WM-HAN-008 | 41 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 008 golden amethyst teardrop hanger front medium. Producto/sku: WM-HAN-008. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-008/wm-han-008-golden-amethyst-teardrop-hanger-front-thumb.avif` | product-master | website-ready-source | WM-HAN-008 | 26 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 008 golden amethyst teardrop hanger front thumb. Producto/sku: WM-HAN-008. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-008/wm-han-008-golden-amethyst-teardrop-hanger-front-thumb.webp` | product-master | website-ready-source | WM-HAN-008 | 29 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 008 golden amethyst teardrop hanger front thumb. Producto/sku: WM-HAN-008. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-011/wm-han-011-tribal-architecture-magnetic-hanger-front-medium.avif` | product-master | website-ready-source | WM-HAN-011 | 21 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 011 tribal architecture magnetic hanger front medium. Producto/sku: WM-HAN-011. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-011/wm-han-011-tribal-architecture-magnetic-hanger-front-medium.webp` | product-master | website-ready-source | WM-HAN-011 | 30 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 011 tribal architecture magnetic hanger front medium. Producto/sku: WM-HAN-011. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-011/wm-han-011-tribal-architecture-magnetic-hanger-front-thumb.avif` | product-master | website-ready-source | WM-HAN-011 | 8 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 011 tribal architecture magnetic hanger front thumb. Producto/sku: WM-HAN-011. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-011/wm-han-011-tribal-architecture-magnetic-hanger-front-thumb.webp` | product-master | website-ready-source | WM-HAN-011 | 11 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 011 tribal architecture magnetic hanger front thumb. Producto/sku: WM-HAN-011. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-012/wm-han-012-heavy-cast-hook-hanger-14mm-front-medium.avif` | product-master | website-ready-source | WM-HAN-012 | 34 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 012 heavy cast hook hanger 14mm front medium. Producto/sku: WM-HAN-012. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-012/wm-han-012-heavy-cast-hook-hanger-14mm-front-medium.webp` | product-master | website-ready-source | WM-HAN-012 | 47 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 012 heavy cast hook hanger 14mm front medium. Producto/sku: WM-HAN-012. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-012/wm-han-012-heavy-cast-hook-hanger-14mm-front-thumb.avif` | product-master | website-ready-source | WM-HAN-012 | 12 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 012 heavy cast hook hanger 14mm front thumb. Producto/sku: WM-HAN-012. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-012/wm-han-012-heavy-cast-hook-hanger-14mm-front-thumb.webp` | product-master | website-ready-source | WM-HAN-012 | 16 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 012 heavy cast hook hanger 14mm front thumb. Producto/sku: WM-HAN-012. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-014/wm-han-014-gold-captive-bead-ring-hanger-with-black-stone-front-medium.avif` | product-master | website-ready-source | WM-HAN-014 | 18 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 014 gold captive bead ring hanger with black stone front medium. Producto/sku: WM-HAN-014. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-014/wm-han-014-gold-captive-bead-ring-hanger-with-black-stone-front-medium.webp` | product-master | website-ready-source | WM-HAN-014 | 27 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 014 gold captive bead ring hanger with black stone front medium. Producto/sku: WM-HAN-014. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-014/wm-han-014-gold-captive-bead-ring-hanger-with-black-stone-front-thumb.avif` | product-master | website-ready-source | WM-HAN-014 | 8 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 014 gold captive bead ring hanger with black stone front thumb. Producto/sku: WM-HAN-014. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-014/wm-han-014-gold-captive-bead-ring-hanger-with-black-stone-front-thumb.webp` | product-master | website-ready-source | WM-HAN-014 | 10 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 014 gold captive bead ring hanger with black stone front thumb. Producto/sku: WM-HAN-014. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-019/wm-han-019-surgical-steel-snake-hangers-12mm-front-medium.avif` | product-master | website-ready-source | WM-HAN-019 | 16 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 019 surgical steel snake hangers 12mm front medium. Producto/sku: WM-HAN-019. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-019/wm-han-019-surgical-steel-snake-hangers-12mm-front-medium.webp` | product-master | website-ready-source | WM-HAN-019 | 23 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 019 surgical steel snake hangers 12mm front medium. Producto/sku: WM-HAN-019. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-019/wm-han-019-surgical-steel-snake-hangers-12mm-front-thumb.avif` | product-master | website-ready-source | WM-HAN-019 | 7 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 019 surgical steel snake hangers 12mm front thumb. Producto/sku: WM-HAN-019. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-019/wm-han-019-surgical-steel-snake-hangers-12mm-front-thumb.webp` | product-master | website-ready-source | WM-HAN-019 | 9 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm han 019 surgical steel snake hangers 12mm front thumb. Producto/sku: WM-HAN-019. |
| Obsidian brand system | `04-photography/product-macro/final/WM-OTH-001/wm-oth-001-premium-laser-engraved-wood-display-box-front-full.avif` | product-master | website-ready-source | WM-OTH-001 | 45 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm oth 001 premium laser engraved wood display box front full. Producto/sku: WM-OTH-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-OTH-001/wm-oth-001-premium-laser-engraved-wood-display-box-front-full.webp` | product-master | website-ready-source | WM-OTH-001 | 78 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm oth 001 premium laser engraved wood display box front full. Producto/sku: WM-OTH-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-OTH-001/wm-oth-001-premium-laser-engraved-wood-display-box-front-medium.avif` | product-master | website-ready-source | WM-OTH-001 | 32 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm oth 001 premium laser engraved wood display box front medium. Producto/sku: WM-OTH-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-OTH-001/wm-oth-001-premium-laser-engraved-wood-display-box-front-medium.webp` | product-master | website-ready-source | WM-OTH-001 | 43 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm oth 001 premium laser engraved wood display box front medium. Producto/sku: WM-OTH-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-OTH-001/wm-oth-001-premium-laser-engraved-wood-display-box-front-thumb.avif` | product-master | website-ready-source | WM-OTH-001 | 27 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm oth 001 premium laser engraved wood display box front thumb. Producto/sku: WM-OTH-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-OTH-001/wm-oth-001-premium-laser-engraved-wood-display-box-front-thumb.webp` | product-master | website-ready-source | WM-OTH-001 | 30 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm oth 001 premium laser engraved wood display box front thumb. Producto/sku: WM-OTH-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-PRC-001/wm-prc-001-snake-top-labret-piercing-pack-front-full.avif` | product-master | website-ready-source | WM-PRC-001 | 29 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm prc 001 snake top labret piercing pack front full. Producto/sku: WM-PRC-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-PRC-001/wm-prc-001-snake-top-labret-piercing-pack-front-full.webp` | product-master | website-ready-source | WM-PRC-001 | 41 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm prc 001 snake top labret piercing pack front full. Producto/sku: WM-PRC-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-PRC-001/wm-prc-001-snake-top-labret-piercing-pack-front-medium.avif` | product-master | website-ready-source | WM-PRC-001 | 24 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm prc 001 snake top labret piercing pack front medium. Producto/sku: WM-PRC-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-PRC-001/wm-prc-001-snake-top-labret-piercing-pack-front-medium.webp` | product-master | website-ready-source | WM-PRC-001 | 27 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm prc 001 snake top labret piercing pack front medium. Producto/sku: WM-PRC-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-PRC-001/wm-prc-001-snake-top-labret-piercing-pack-front-thumb.avif` | product-master | website-ready-source | WM-PRC-001 | 21 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm prc 001 snake top labret piercing pack front thumb. Producto/sku: WM-PRC-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-PRC-001/wm-prc-001-snake-top-labret-piercing-pack-front-thumb.webp` | product-master | website-ready-source | WM-PRC-001 | 22 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm prc 001 snake top labret piercing pack front thumb. Producto/sku: WM-PRC-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-001/wm-sad-001-ornamental-opal-saddle-expansions-front-full.avif` | product-master | website-ready-source | WM-SAD-001 | 41 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 001 ornamental opal saddle expansions front full. Producto/sku: WM-SAD-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-001/wm-sad-001-ornamental-opal-saddle-expansions-front-full.webp` | product-master | website-ready-source | WM-SAD-001 | 60 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 001 ornamental opal saddle expansions front full. Producto/sku: WM-SAD-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-001/wm-sad-001-ornamental-opal-saddle-expansions-front-medium.avif` | product-master | website-ready-source | WM-SAD-001 | 30 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 001 ornamental opal saddle expansions front medium. Producto/sku: WM-SAD-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-001/wm-sad-001-ornamental-opal-saddle-expansions-front-medium.webp` | product-master | website-ready-source | WM-SAD-001 | 36 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 001 ornamental opal saddle expansions front medium. Producto/sku: WM-SAD-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-001/wm-sad-001-ornamental-opal-saddle-expansions-front-thumb.avif` | product-master | website-ready-source | WM-SAD-001 | 24 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 001 ornamental opal saddle expansions front thumb. Producto/sku: WM-SAD-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-001/wm-sad-001-ornamental-opal-saddle-expansions-front-thumb.webp` | product-master | website-ready-source | WM-SAD-001 | 25 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 001 ornamental opal saddle expansions front thumb. Producto/sku: WM-SAD-001. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-003/wm-sad-003-ornamental-surgical-steel-saddle-22mm-front-full.avif` | product-master | website-ready-source | WM-SAD-003 | 44 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 003 ornamental surgical steel saddle 22mm front full. Producto/sku: WM-SAD-003. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-003/wm-sad-003-ornamental-surgical-steel-saddle-22mm-front-full.webp` | product-master | website-ready-source | WM-SAD-003 | 67 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 003 ornamental surgical steel saddle 22mm front full. Producto/sku: WM-SAD-003. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-003/wm-sad-003-ornamental-surgical-steel-saddle-22mm-front-medium.avif` | product-master | website-ready-source | WM-SAD-003 | 31 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 003 ornamental surgical steel saddle 22mm front medium. Producto/sku: WM-SAD-003. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-003/wm-sad-003-ornamental-surgical-steel-saddle-22mm-front-medium.webp` | product-master | website-ready-source | WM-SAD-003 | 39 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 003 ornamental surgical steel saddle 22mm front medium. Producto/sku: WM-SAD-003. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-003/wm-sad-003-ornamental-surgical-steel-saddle-22mm-front-thumb.avif` | product-master | website-ready-source | WM-SAD-003 | 26 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 003 ornamental surgical steel saddle 22mm front thumb. Producto/sku: WM-SAD-003. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-003/wm-sad-003-ornamental-surgical-steel-saddle-22mm-front-thumb.webp` | product-master | website-ready-source | WM-SAD-003 | 28 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 003 ornamental surgical steel saddle 22mm front thumb. Producto/sku: WM-SAD-003. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-004/wm-sad-004-ornamental-lace-saddle-expansion-25mm-front-full.avif` | product-master | website-ready-source | WM-SAD-004 | 55 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 004 ornamental lace saddle expansion 25mm front full. Producto/sku: WM-SAD-004. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-004/wm-sad-004-ornamental-lace-saddle-expansion-25mm-front-full.webp` | product-master | website-ready-source | WM-SAD-004 | 83 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 004 ornamental lace saddle expansion 25mm front full. Producto/sku: WM-SAD-004. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-004/wm-sad-004-ornamental-lace-saddle-expansion-25mm-front-medium.avif` | product-master | website-ready-source | WM-SAD-004 | 38 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 004 ornamental lace saddle expansion 25mm front medium. Producto/sku: WM-SAD-004. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-004/wm-sad-004-ornamental-lace-saddle-expansion-25mm-front-medium.webp` | product-master | website-ready-source | WM-SAD-004 | 47 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 004 ornamental lace saddle expansion 25mm front medium. Producto/sku: WM-SAD-004. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-004/wm-sad-004-ornamental-lace-saddle-expansion-25mm-front-thumb.avif` | product-master | website-ready-source | WM-SAD-004 | 28 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 004 ornamental lace saddle expansion 25mm front thumb. Producto/sku: WM-SAD-004. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-004/wm-sad-004-ornamental-lace-saddle-expansion-25mm-front-thumb.webp` | product-master | website-ready-source | WM-SAD-004 | 31 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 004 ornamental lace saddle expansion 25mm front thumb. Producto/sku: WM-SAD-004. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-006/wm-sad-006-polished-gold-saddle-expansions-20-25mm-front-medium.avif` | product-master | website-ready-source | WM-SAD-006 | 17 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 006 polished gold saddle expansions 20 25mm front medium. Producto/sku: WM-SAD-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-006/wm-sad-006-polished-gold-saddle-expansions-20-25mm-front-medium.webp` | product-master | website-ready-source | WM-SAD-006 | 24 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 006 polished gold saddle expansions 20 25mm front medium. Producto/sku: WM-SAD-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-006/wm-sad-006-polished-gold-saddle-expansions-20-25mm-front-thumb.avif` | product-master | website-ready-source | WM-SAD-006 | 7 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 006 polished gold saddle expansions 20 25mm front thumb. Producto/sku: WM-SAD-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-006/wm-sad-006-polished-gold-saddle-expansions-20-25mm-front-thumb.webp` | product-master | website-ready-source | WM-SAD-006 | 9 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm sad 006 polished gold saddle expansions 20 25mm front thumb. Producto/sku: WM-SAD-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-005/wm-tun-005-brass-rimmed-wood-tunnels-12mm-16mm-front-full.avif` | product-master | website-ready-source | WM-TUN-005 | 17 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 005 brass rimmed wood tunnels 12mm 16mm front full. Producto/sku: WM-TUN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-005/wm-tun-005-brass-rimmed-wood-tunnels-12mm-16mm-front-full.webp` | product-master | website-ready-source | WM-TUN-005 | 39 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 005 brass rimmed wood tunnels 12mm 16mm front full. Producto/sku: WM-TUN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-005/wm-tun-005-brass-rimmed-wood-tunnels-12mm-16mm-front-medium.avif` | product-master | website-ready-source | WM-TUN-005 | 8 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 005 brass rimmed wood tunnels 12mm 16mm front medium. Producto/sku: WM-TUN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-005/wm-tun-005-brass-rimmed-wood-tunnels-12mm-16mm-front-medium.webp` | product-master | website-ready-source | WM-TUN-005 | 17 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 005 brass rimmed wood tunnels 12mm 16mm front medium. Producto/sku: WM-TUN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-005/wm-tun-005-brass-rimmed-wood-tunnels-12mm-16mm-front-thumb.avif` | product-master | website-ready-source | WM-TUN-005 | 4 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 005 brass rimmed wood tunnels 12mm 16mm front thumb. Producto/sku: WM-TUN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-005/wm-tun-005-brass-rimmed-wood-tunnels-12mm-16mm-front-thumb.webp` | product-master | website-ready-source | WM-TUN-005 | 7 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 005 brass rimmed wood tunnels 12mm 16mm front thumb. Producto/sku: WM-TUN-005. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-006/wm-tun-006-brass-mandala-svastika-tunnels-16-25mm-front-full.avif` | product-master | website-ready-source | WM-TUN-006 | 40 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 006 brass mandala svastika tunnels 16 25mm front full. Producto/sku: WM-TUN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-006/wm-tun-006-brass-mandala-svastika-tunnels-16-25mm-front-full.webp` | product-master | website-ready-source | WM-TUN-006 | 58 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 006 brass mandala svastika tunnels 16 25mm front full. Producto/sku: WM-TUN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-006/wm-tun-006-brass-mandala-svastika-tunnels-16-25mm-front-medium.avif` | product-master | website-ready-source | WM-TUN-006 | 32 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 006 brass mandala svastika tunnels 16 25mm front medium. Producto/sku: WM-TUN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-006/wm-tun-006-brass-mandala-svastika-tunnels-16-25mm-front-medium.webp` | product-master | website-ready-source | WM-TUN-006 | 38 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 006 brass mandala svastika tunnels 16 25mm front medium. Producto/sku: WM-TUN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-006/wm-tun-006-brass-mandala-svastika-tunnels-16-25mm-front-thumb.avif` | product-master | website-ready-source | WM-TUN-006 | 28 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 006 brass mandala svastika tunnels 16 25mm front thumb. Producto/sku: WM-TUN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-006/wm-tun-006-brass-mandala-svastika-tunnels-16-25mm-front-thumb.webp` | product-master | website-ready-source | WM-TUN-006 | 30 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 006 brass mandala svastika tunnels 16 25mm front thumb. Producto/sku: WM-TUN-006. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-007/wm-tun-007-solar-light-weight-tunnel-mandala-floral-12mm-front-medium.avif` | product-master | website-ready-source | WM-TUN-007 | 23 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 007 solar light weight tunnel mandala floral 12mm front medium. Producto/sku: WM-TUN-007. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-007/wm-tun-007-solar-light-weight-tunnel-mandala-floral-12mm-front-medium.webp` | product-master | website-ready-source | WM-TUN-007 | 40 KB | Fuente de producto para catalogo, PDP o lamina; nombre visible: wm tun 007 solar light weight tunnel mandala floral 12mm front medium. Producto/sku: WM-TUN-007. |
| ... | ... | ... | ... | ... | ... | 69 assets mas en esta seccion. |

## Identidad Y Logos

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| Obsidian brand system | `01-identity/identity-core.md` | identity-logo | needs-human-approval | - | 1 KB | Identidad visual: validar como logo o variante antes de usar. |
| Obsidian brand system | `01-identity/MARCA-maestro.md` | identity-logo | needs-human-approval | - | 2 KB | Identidad visual: validar como logo o variante antes de usar. |
| Obsidian brand system | `03-logos/png/wenu-mapu-logo-final.png` | identity-logo | needs-human-approval | - | 274 KB | Identidad visual: validar como logo o variante antes de usar. |
| Obsidian brand system | `03-logos/png/wenu-mapu-logo-white.png` | identity-logo | needs-human-approval | - | 297 KB | Identidad visual: validar como logo o variante antes de usar. |
| Obsidian brand system | `07-marketing-collateral/banners/banner_meteorite_ritual_rings.webp` | identity-logo | needs-human-approval | - | 97 KB | Identidad visual: validar como logo o variante antes de usar. |
| Obsidian brand system | `07-marketing-collateral/banners/escritorio_banner1.webp` | identity-logo | needs-human-approval | - | 87 KB | Identidad visual: validar como logo o variante antes de usar. |
| Obsidian brand system | `07-marketing-collateral/banners/meteorite_ring_collection_banner.webp` | identity-logo | needs-human-approval | - | 138 KB | Identidad visual: validar como logo o variante antes de usar. |
| Obsidian brand system | `07-marketing-collateral/banners/meteorite_ritual_collection_banner_final.webp` | identity-logo | needs-human-approval | - | 149 KB | Identidad visual: validar como logo o variante antes de usar. |

## Marketing Collateral

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| LaCie inventory photos | `_ERROR/anillo forma abstracta.jpg` | marketing-collateral | needs-human-approval | - | 19.4 MB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie inventory photos | `_ERROR/anillo forma abstracta2 .jpg` | marketing-collateral | needs-human-approval | - | 16.7 MB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie inventory photos | `_PROCESADOS/anillo forma abstracta.jpg` | marketing-collateral | needs-human-approval | - | 19.4 MB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie inventory photos | `_PROCESADOS/anillo forma abstracta2 .jpg` | marketing-collateral | needs-human-approval | - | 16.7 MB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie design archive | `Dipticos/diptico_22.png` | marketing-collateral | needs-human-approval | - | 213 KB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie design archive | `Dipticos/diptico_bold.png` | marketing-collateral | needs-human-approval | - | 155 KB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie design archive | `Dipticos/diptico_imprenta.pdf` | marketing-collateral | needs-human-approval | - | 1.7 MB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie design archive | `Dipticos/diptico_negro2.png` | marketing-collateral | needs-human-approval | - | 76 KB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie design archive | `Dipticos/diptico0o0o0o0.png` | marketing-collateral | needs-human-approval | - | 253 KB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie marketing | `WenuMapu_Behance_Portfolio.pdf` | marketing-collateral | needs-human-approval | - | 45.0 MB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |
| LaCie design archive | `WenuMapu_Behance_Portfolio.pdf` | marketing-collateral | needs-human-approval | - | 45.0 MB | Pieza de marketing/impresion/campana; revisar si conviene web, PDF o social. |

## Social

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| LaCie inventory photos | `_ERROR/instagram-feed_wenumapu.jpg` | social-template | needs-human-approval | - | 549 KB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| LaCie inventory photos | `_ERROR/POST_HANGER.png` | social-template | needs-human-approval | - | 2.4 MB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| LaCie inventory photos | `_ERROR/post_medusa.png` | social-template | needs-human-approval | - | 2.1 MB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| LaCie inventory photos | `_ERROR/POST_SEPTUM_2.png` | social-template | needs-human-approval | - | 3.4 MB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| LaCie inventory photos | `_ERROR/story1.png` | social-template | needs-human-approval | - | 2.9 MB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| LaCie inventory photos | `_ERROR/story2.png` | social-template | needs-human-approval | - | 2.1 MB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| LaCie inventory photos | `_ERROR/story3.png` | social-template | needs-human-approval | - | 2.6 MB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| LaCie inventory photos | `_ERROR/story4.png` | social-template | needs-human-approval | - | 2.9 MB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| Obsidian brand system | `06-social-templates/instagram-post/TEMPLATE.md` | social-template | needs-human-approval | - | 3 KB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| Obsidian brand system | `06-social-templates/instagram-story/TEMPLATE.md` | social-template | needs-human-approval | - | 3 KB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| Obsidian brand system | `06-social-templates/pinterest/TEMPLATE.md` | social-template | needs-human-approval | - | 3 KB | Plantilla o pieza social; puede derivar posts, stories o campanas. |
| Obsidian brand system | `06-social-templates/tiktok/TEMPLATE.md` | social-template | needs-human-approval | - | 4 KB | Plantilla o pieza social; puede derivar posts, stories o campanas. |

## QR

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| Obsidian brand system | `07-marketing-collateral/qr-codes/QR_WenuMapu_AftercareGuide_URL.png` | qr-code | needs-human-approval | - | 1 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| Obsidian brand system | `07-marketing-collateral/qr-codes/QR-generic.png` | qr-code | needs-human-approval | - | 3 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| Obsidian brand system | `07-marketing-collateral/qr-codes/WenuMapu_Form_QR.png` | qr-code | needs-human-approval | - | 1 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| LaCie marketing | `QR_WenuMapu_AftercareGuide_URL.png` | qr-code | needs-human-approval | - | 1 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| LaCie marketing | `QRcode.png` | qr-code | needs-human-approval | - | 3 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| LaCie design archive | `Social_Media/QR_WenuMapu_AftercareGuide_URL.png` | qr-code | needs-human-approval | - | 1 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| LaCie design archive | `Social_Media/QRcode.png` | qr-code | needs-human-approval | - | 3 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| LaCie design archive | `Social_Media/WenuMapu_Form_QR.png` | qr-code | needs-human-approval | - | 1 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| LaCie marketing | `WenuMapu_Form_QR.png` | qr-code | needs-human-approval | - | 1 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |
| LaCie design archive | `WenuMapu_Form_QR.png` | qr-code | needs-human-approval | - | 1 KB | QR para material fisico o pagina de contacto; verificar destino antes de publicar. |

## Documentos De Marca

| Fuente | Asset | Rol | Estado | SKU | Peso | Para que sirve |
| --- | --- | --- | --- | --- | --- | --- |
| Website public assets | `brand/artistry-workbench.avif` | copy-doc | already-wired | - | 55 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/artistry-workbench.webp` | copy-doc | already-wired | - | 100 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/meteorite-banner.avif` | copy-doc | already-wired | - | 36 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/meteorite-banner.webp` | copy-doc | already-wired | - | 48 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/meteorite-collection.avif` | copy-doc | already-wired | - | 31 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/meteorite-collection.webp` | copy-doc | already-wired | - | 39 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/meteorite-final.avif` | copy-doc | already-wired | - | 35 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/meteorite-final.webp` | copy-doc | already-wired | - | 46 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/obsidian-textile-texture.avif` | copy-doc | already-wired | - | 145 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/obsidian-textile-texture.webp` | copy-doc | already-wired | - | 218 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/shop-ritual-septum-hero.avif` | copy-doc | already-wired | - | 99 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/shop-ritual-septum-hero.webp` | copy-doc | already-wired | - | 135 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Website public assets | `brand/wenu-mapu-mark.svg` | copy-doc | already-wired | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `00-Mapa-Brand.md` | copy-doc | source-only | - | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `01-identity/BRAND-DNA.md` | copy-doc | source-only | - | 9 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `01-identity/voz-de-marca.md` | copy-doc | source-only | - | 5 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `02-visual-system/brand-system.md` | copy-doc | source-only | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `02-visual-system/color-palette.md` | copy-doc | source-only | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `02-visual-system/graphic-structures.md` | copy-doc | source-only | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `02-visual-system/patterns-textures.md` | copy-doc | source-only | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `02-visual-system/typography.md` | copy-doc | source-only | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `02-visual-system/visual-rules.md` | copy-doc | source-only | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `03-logos/logo-system.md` | copy-doc | source-only | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-EAR-001/METADATA.md` | copy-doc | source-only | WM-EAR-001 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-001/METADATA.md` | copy-doc | source-only | WM-HAN-001 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-005/METADATA.md` | copy-doc | source-only | WM-HAN-005 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-006/METADATA.md` | copy-doc | source-only | WM-HAN-006 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-007/METADATA.md` | copy-doc | source-only | WM-HAN-007 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-008/METADATA.md` | copy-doc | source-only | WM-HAN-008 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-011/METADATA.md` | copy-doc | source-only | WM-HAN-011 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-012/METADATA.md` | copy-doc | source-only | WM-HAN-012 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-014/METADATA.md` | copy-doc | source-only | WM-HAN-014 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-HAN-019/METADATA.md` | copy-doc | source-only | WM-HAN-019 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-OTH-001/METADATA.md` | copy-doc | source-only | WM-OTH-001 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-PRC-001/METADATA.md` | copy-doc | source-only | WM-PRC-001 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-001/METADATA.md` | copy-doc | source-only | WM-SAD-001 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-002/METADATA.md` | copy-doc | source-only | WM-SAD-002 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-003/METADATA.md` | copy-doc | source-only | WM-SAD-003 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-004/METADATA.md` | copy-doc | source-only | WM-SAD-004 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-005/METADATA.md` | copy-doc | source-only | WM-SAD-005 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-SAD-006/METADATA.md` | copy-doc | source-only | WM-SAD-006 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-005/METADATA.md` | copy-doc | source-only | WM-TUN-005 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-006/METADATA.md` | copy-doc | source-only | WM-TUN-006 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-007/METADATA.md` | copy-doc | source-only | WM-TUN-007 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-013/METADATA.md` | copy-doc | source-only | WM-TUN-013 | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `04-photography/product-macro/final/WM-TUN-014/METADATA.md` | copy-doc | source-only | WM-TUN-014 | 2 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `08-copy-bank/ASSETS-config.md` | copy-doc | source-only | - | 3 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `08-copy-bank/content-structures.md` | copy-doc | source-only | - | 1 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| Obsidian brand system | `08-copy-bank/copy-frontend.md` | copy-doc | source-only | - | 6 KB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |
| LaCie design archive | `Brand_Identity/dipticowenumapu/diptico_imprenta.pdf` | copy-doc | source-only | - | 1.7 MB | Documento de reglas, copy o metadata; usar para decisiones, no como asset visual. |

## Fuentes Escaneadas

- Website public assets: `~/wenu-frontend/public/img`
- Obsidian brand system: `~/Obsidian/WenuAgent/brand`
- Obsidian ChatGPT image intake: `~/Obsidian/WenuAgent/40-ChatGPT/imagenes`
- LaCie marketing: `/Volumes/LaCie/Wenu mapu/WenuMapu/Marketing`
- LaCie design archive: `/Volumes/LaCie/Wenu mapu/WenuMapu/🎨 _DISEÑO`
- LaCie WooCommerce-ready source: `/Volumes/LaCie/Wenu mapu/WenuMapu/📦 _WOOCOMMERCE_READY`
- LaCie inventory photos: `/Volumes/LaCie/Wenu mapu/WenuMapu/📸 _INVENTARIO_FOTOS`

## Proxima Accion Recomendada

1. Abrir `docs/asset-board.html` para mirar visualmente los candidatos.
2. Elegir una sola familia: banners web, logos, producto o social.
3. Copiar solo aprobados a `public/img/...` con nombre kebab-case.
4. Generar WebP/AVIF, correr inventario y build.
5. Repetir por departamento, no mezclar todo en una sola pasada.

