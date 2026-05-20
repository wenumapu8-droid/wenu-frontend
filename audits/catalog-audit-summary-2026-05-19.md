---
fecha: 2026-05-19
fuentes: catalog-readonly-audit-2026-05-19.json (reports/), catalog-reconciliation-2026-05-15.md, WENU-PRECIOS-PENDIENTES.csv, copy-bank-10-products-despublished.md, brand/04-photography/product-macro/final/ (23 SKUs con foto procesada), BRAND-DNA.md, voz-de-marca.md
status: ejecutivo
---

# Wenu Mapu — Audit Ejecutivo del Catálogo — 2026-05-19

## Estado real del inventario

| Metrica | Valor |
|---|---|
| Total productos catalogados (WC + NocoDB) | ~104 registros WC / 50 publicados en build |
| Publicados con foto y precio (vivos en web) | 50 |
| Con foto procesada en product-macro/final (listos para subir a WC) | 23 SKUs |
| Precio cero entre los vivos | ~28 (estimado desde WENU-PRECIOS-PENDIENTES) |
| Sin foto entre los vivos | 0 (los 50 publicados tienen foto) |
| Sin foto en productos no publicados | 15-23 confirmados |
| Fotos-como-productos (a despublicar) | 20 confirmados (photo-as-product-cleanup-list.csv) |
| Clusters de duplicados pendientes aprobación | 7 |

## Conteo por tier (categorización 2026-05-19)

| Tier | Piezas | Con foto | Sin foto |
|---|---|---|---|
| Atelier-Forged | 2 (en proceso en taller) | 0 | 2 |
| Atelier-Assembled | ~22 | ~18 | ~4 |
| Curated by Marimari | ~72 | ~45 | ~27 |
| Collab (Alai / Galo) | 0 confirmados en datos disponibles | — | — |
| Atacama Meteorite | 3 (2084/2085/2086) | 2 | 1 |

Nota: Collab (Alai, Galo) no aparece en ninguna fuente de datos accesible hoy. Confirmar si existen en NocoDB o si son línea futura.

## Bloqueos encontrados — críticos

### 1. Precios en cero (bloqueo de venta inmediato)
28 productos publicados o listos para publicar tienen precio $0. Son invisibles para compra aunque estén en la web. Lista en WENU-PRECIOS-PENDIENTES.csv. Tiempo para resolver: 45 minutos en WP admin con la lista de precios sugeridos (reports/PRICES-suggested-23-products-2026-05-11.csv).

### 2. Naming con referencias prohibidas
Cuatro SKUs tienen nombres que violan las reglas de copy de Wenu Mapu:

- **WM-HAN-007** "Sanskrit Mantra Hanger" — hinduismo. Renombrar: "Engraved Brass Hanger with Compartment".
- **WM-TUN-006** "Brass Mandala Svastika Tunnels" — hinduismo/budismo + término sensible. Renombrar: "Brass Geometric Tunnels". Decisión del dueño si publicar.
- **WM-TUN-007** "Solar Light Weight Tunnel — Mandala Floral" — mandala = hindú/budista. Renombrar: "Floral Geometric Tunnel 12mm".
- **WM-SAD-005** "Maya Fan Saddle Expansion" — cultura mesoamericana. Renombrar: "Fan-Shape Saddle Expansion 25mm".
- **WM-EAR-001** "Ethnic Shipibo Hoop Earrings" — Shipibo es cultura amazónica peruana. Renombrar: "Mixed-Metal Hoop Earrings — Gold & Silver".

### 3. Fotos-como-productos publicados (IDs 1785 y 1810)
Dos productos en el build son fotos de ángulo de otros SKUs, no piezas independientes. Despublicar y mover imagen a galería del canonical correspondiente.

### 4. Categorías con links activos en nav pero vacías o sin precio
- **Ear Weights**: 2 productos sin precio. Nav link activo → categoría vacía para el cliente.
- **Amulets**: 0 productos con precio + foto publicados.
- **Ritual Pieces**: los Ritual Rings (meteorite) tienen precio pero bajo ($150 en vez de $240-260).

### 5. NocoDB API — acceso bloqueado
La API de NocoDB en localhost:8080 responde 401 (Unauthorized). Los datos de esta auditoría se construyeron desde las fuentes secundarias disponibles. No fue posible consultar el inventario maestro directamente. Desbloquear acceso (token o credenciales) para la próxima sesión de sync.

### 6. WooCommerce API — keys sin permisos
Documentado en CLAUDE.md. No se puede escribir a WC hasta tener keys con permisos write. Todo lo que sigue es preparación para cuando se desbloquee.

## Alertas de integridad narrativa

Ninguna pieza Curated puede llevar copy que diga o insinúe:
- "Formado en la tradición mapuche"
- "Ritual mapuche"
- "Ancestral de La Cisterna"
- "Hecho a mano por Ocin"

Esas afirmaciones son válidas solo en Atelier-Forged y Atelier-Assembled.

En las piezas curadas: voz curatorial honesta — "I found this piece because...", "The material is X", "It reads from the front like Y". Sin inflación narrativa.

## Top 20 a publicar primero (criterio: foto disponible + mayor impacto de revenue)

| Prioridad | SKU | Nombre | Tier | Precio sugerido | Bloqueador actual | Tiempo para resolver |
|---|---|---|---|---|---|---|
| 1 | WM-MET-001 (ID 2086) | Ritual Ring Vacamuerta No.3 | Atacama | $260 | Precio bajo ($150) | 5 min — subir precio en WP admin |
| 2 | WM-MET-002 (ID 2085) | Ritual Ring No.19 | Atacama | $240 | Precio bajo ($150) | 5 min |
| 3 | WM-HAN-005 | Ornamental Bronze Snake Weights | Curated | $52 | Precio $0 | 5 min — foto ya lista para subir a WC |
| 4 | WM-HAN-006 | Golden Stainless Steel Weights with Black Obsidian | Curated | $55 | Precio $0 | 5 min |
| 5 | WM-HAN-019 | Surgical Steel Snake Hangers (12mm) | Curated | $48 | Precio $0 | 5 min |
| 6 | WM-PRC-001 | Snake Top Labret Piercing Pack | Curated | $45 | Precio $0 | 5 min |
| 7 | WM-SAD-001 | Ornamental Opal Saddle Expansions | Curated | $65 | Precio $0 | 5 min |
| 8 | WM-HAN-008 | Golden Amethyst Teardrop Hanger | Curated | $58 | Precio $0 | 5 min |
| 9 | ID 2067 | Ornamental Ear Weight | Curated | $68 | Precio $0 | 5 min — llena categoría Ear Weights |
| 10 | ID 2056 | Golden Geometric Triangular Hanger Weight | Curated | $72 | Precio $0 | 5 min — llena Ear Weights |
| 11 | WM-TUN-014 | Medusa Serpent Surgical Steel Expanders (20mm) | Curated | $55 | Precio $0 | 5 min + copy existente |
| 12 | ID 2073 | Teardrop Amethyst | Curated | $75 | Precio $0 | 5 min |
| 13 | ID 2066 | Black Surgical Steel Snake Saddle Expander | Curated | $68 | Precio $0 | 5 min |
| 14 | ID 2060 | Golden Drop Clicker Septum | Curated | $58 | Precio $0 | 5 min |
| 15 | ID 2069 | Tribal Bronze Expansions | Curated | $62 | Precio $0 | 5 min |
| 16 | WM-HAN-001 | Witral Vilu Hanger | Atelier-Assembled | $65 | Precio muy bajo ($15) | 5 min + copy sheet listo |
| 17 | WM-HAN-011 | Tribal Architecture Magnetic Hanger | Curated | $52 | Precio $0 | 5 min |
| 18 | WM-SAD-006 | Polished Gold Saddle Expansions (20-25mm) | Curated | $50 | Precio $0 | 5 min |
| 19 | WM-HAN-014 | Gold Captive Bead Ring Hanger with Black Stone | Curated | $45 | Precio $0 | 5 min |
| 20 | WM-HAN-012 | Heavy Cast Hook Hanger 14mm | Curated | $48 | Precio $0 | 5 min |

Tiempo total estimado para los 20: 2 horas (precio + copy de cada uno en WP admin, foto de los 23 SKUs que ya están en product-macro/final subida a WC Media).

## Next steps concretos — en orden

**Hoy (sesión 1 — 45 min):**
1. WP Admin → editar los 20 productos del top-20 → asignar precio → guardar.
2. Subir las 23 fotos de `brand/04-photography/product-macro/final/*/` a WooCommerce Media y vincularlas a sus SKUs.
3. Renombrar los 5 productos con nombres prohibidos (Sanskrit/Svastika/Mandala/Maya/Shipibo).

**Hoy (sesión 2 — 30 min):**
4. Despublicar IDs 1785 y 1810 (fotos-como-productos).
5. Agregar descripción al ID 1811 (Ear Gauges Walnut — único publicado sin descripción).
6. Borrar IDs 2080 y 2078 (Pronto y producto prueba).

**Esta semana:**
7. Resolver los 7 clusters de duplicados en NocoDB (decisión humana requerida).
8. Subir los 2 septums en plata cuando estén terminados (ficha ya generada en product-sheets/atelier-forged/).
9. Recuperar acceso a NocoDB API (token) para habilitar sync automatizado.

**Próxima sesión con datos completos:**
10. Categorizar las ~17 piezas Collab (Alai, Galo) cuando se confirme qué está en NocoDB/WC.
11. Desarrollar 6-8 productos tier $80-$150 para llenar el gap de revenue.

## Datos fuente

- `/Users/user1/wenu-frontend/reports/catalog-readonly-audit-2026-05-19.json`
- `/Users/user1/wenu-frontend/reports/catalog-reconciliation-2026-05-15.md`
- `/Users/user1/wenu-frontend/reports/catalog-priority-2026-05-11.md`
- `/Users/user1/wenu-frontend/reports/PRICES-suggested-23-products-2026-05-11.csv`
- `/Users/user1/wenu-frontend/reports/copy-bank-10-products-despublished.md`
- `/Users/user1/wenu-frontend/WENU-PRECIOS-PENDIENTES.csv`
- `/Users/user1/Obsidian/WenuAgent/brand/04-photography/product-macro/final/` (23 SKUs)
- `/Users/user1/Obsidian/WenuAgent/brand/01-identity/BRAND-DNA.md`
- `/Users/user1/Obsidian/WenuAgent/brand/01-identity/voz-de-marca.md`
