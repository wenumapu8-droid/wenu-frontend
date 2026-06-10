# Plan de Acción Visual — Wenu Mapu
### Convergencia hacia una plataforma multi-forma nivel referentes

Fecha: 2026-05-22 · Autor: Claude (rol diseñador) · Codex trabaja en paralelo (optimización + clasificación de imágenes, formatos web/PNG).

---

## 0. La idea en una frase

Wenu Mapu **ya tiene un sistema visual fuerte y diferenciado** (dark cosmic-ritual,
no white-clinical como BVLA). El problema **no es el concepto — es la convergencia**:
el trabajo visual está disperso en carpetas y no aplicado consistentemente en cada
superficie (web, producto, IG, Pinterest, TikTok). Este plan une todo bajo un solo
lenguaje.

---

## 1. El estándar — la vara

Qué hace que los referentes se vean "pro" (no es presupuesto, es disciplina):

| Referente | Lo que roban el ojo | Qué tomamos |
|---|---|---|
| **BVLA** | Cada foto de producto: misma luz, mismo fondo, mismo crop. Cero ruido. | **Consistencia fotográfica absoluta** |
| **Tania Larsson** | Pieza única tratada como objeto de museo. Aire. Restraint. | **Una pieza, un foco. Espacio negativo.** |
| **Buddha Jewelry** | Macro + lifestyle alternados, narrativa de materialidad. | **Ritmo macro/lifestyle** |
| **Cambio & Co.** | DTC narrative-first, cada pantalla cuenta algo. | **Cada sección tiene un trabajo** |

**Veredicto de diseñador:** el aesthetic de Wenu (obsidian + bronze + DM Serif +
esquinas rectas brutalist) ya es nivel referente. Lo que falta es **ejecutarlo sin
una sola excepción**. Un solo placeholder AI, un solo crop inconsistente, una sola
foto sin escala — y todo el conjunto baja de categoría. "Cuida los detalles" = cero
excepciones.

---

## 2. Diagnóstico — qué tenemos (decisivo)

### ✅ FUERTE — mantener y proteger
- Sistema visual documentado: `tokens.css`, color-palette, typography, visual-rules
- **23 macros de producto** reales, calidad pro (`brand/04-photography/product-macro/final/`)
- **48 imágenes lifestyle editoriales** (`public/img/lifestyle/`)
- Logo system completo (svg + png + variations) + 6 iconos rituales + 4 divisores SVG
- Hero portrait fuerte (4 resoluciones)
- Web redesign con estructura sólida (11 secciones, mobile-ready)

### ⚠️ FRAGMENTADO — converger
- Las 23 macros **no están en el catálogo vivo** (WooCommerce roto — ver abajo)
- Las 48 lifestyle **no están cableadas** en las páginas (existen, no se usan)
- Social templates: las carpetas existen (`06-social-templates/{instagram-post,
  instagram-story,pinterest,tiktok}`) — contenido sin verificar/unificar

### ❌ FALTA — crear o conseguir
- `04-photography/conjuntos/` **vacío** — 0 fotos "set" (piezas agrupadas)
- **0 fotos de escala** — ninguna pieza mostrada en cuerpo/mano con referencia de tamaño
- ~66 macros faltan (catálogo NocoDB = 89 piezas vs 23 hechas) → **Codex en eso**
- `05-graphics/frames/` y `patterns-svg/` vacíos · `07-marketing-collateral/flyers/` vacío

---

## 3. El sistema de fotografía — la columna vertebral

Toda la plataforma se sostiene en 4 tipos de foto. Cada uno tiene un trabajo:

| Tipo | Trabajo | Tenemos | Falta |
|---|---|---|---|
| **MACRO** | Producto solo, fondo obsidian, luz lateral. Detalle. | 23 | ~66 → Codex |
| **ESCALA** | Pieza en cuerpo/mano. Responde "¿qué tamaño tiene?" | **0** | crítico |
| **LIFESTYLE** | Modelo editorial, mood, deseo. | 48 | cablear |
| **SET / CONJUNTO** | Piezas agrupadas — venta cruzada, "colección". | **0** | componer |

**Regla de oro (lo que hace BVLA siempre):** una pieza = mínimo **macro + escala**.
Sin foto de escala el cliente no sabe el tamaño → no compra joyería corporal online.
Esta es la falta #1 que separa a Wenu de los referentes hoy.

---

## 4. Plan de acción priorizado

### P1 — Esta semana · desbloquea el lanzamiento
1. **Restaurar los 13 productos WC de papelera + publicar** → usuario, wp-admin.
   (Existen pero invisibles al REST. Una vez publicados, salen en el sitio.)
2. **Codex: completar macros faltantes** + formatos web/PNG. (en curso)
3. **Cablear lifestyle a las páginas** → Claude. Hoy hay 48 fotos sin usar; van en
   `/about`, `/artistry`, banners de `/shop`, y bandas entre secciones del home.
4. **Definir el estándar de presentación de producto** → Claude. Un doc de 1 página:
   crop, fondo, orden de fotos (macro→escala→detalle→lifestyle), badges. Sin esto
   cada producto se carga distinto y se ve amateur.

### P2 — Convergencia multi-forma
5. **Fotos de escala** → donde el lifestyle existente sirva, recortar; marcar las
   piezas que necesitan sesión nueva. (Auditoría Claude → lista para usuario.)
6. **5 set-shots compuestos** desde las macros existentes → carpeta `conjuntos/`.
7. **Unificar social templates** con el sistema web: mismo obsidian, mismo bronze,
   misma DM Serif, mismas esquinas rectas. IG/Pinterest/TikTok deben leerse como la
   misma marca que la web.

### P3 — Pulido fino
8. **Marketing collateral**: ver §5.
9. **Llenar `frames/` y `patterns-svg/`** con SVGs derivados de los 4 divisores y
   6 iconos que ya existen — no inventar, extender el sistema.

---

## 5. Carpeta de marketing — qué cortar, qué convertir

Auditoría hecha:

- **`marketing/` del repo** — solo 2 archivos (`chatgpt-banners.md`, `calendar-30d.md`).
  Son briefs de texto, no assets. **Dejar como están.**
- **`brand/07-marketing-collateral/banners/`** — 4 webp, **los 4 son tema meteorito**
  (`banner_meteorite_ritual_rings`, `meteorite_ring_collection_banner`,
  `meteorite_ritual_collection_banner_final`, `escritorio_banner1`). Redundantes y
  mono-temáticos: no representan el catálogo amplio (hangers, tunnels, piercings).
  **Recomendación: quedarse con 1, archivar 3.** Rehacer la familia de banners con
  el sistema cuando el catálogo esté poblado.
- **`flyers/` vacío** — no es prioridad (negocio 100% digital). Saltar.
- **`qr-codes/`** — 3 QR funcionales. Mantener.

**Conversión a PNG:** los SVG (6 iconos, 4 divisores) ya son escalables — **no
necesitan PNG para web**. Sí para social (Instagram no renderiza SVG). Tarea para
Codex: exportar **PNG @2x con fondo transparente** de los 6 iconos + 4 divisores
para la biblioteca social. Nada más necesita conversión.

---

## 6. Quién hace qué — sin pisarse

| Responsable | Tareas |
|---|---|
| **Codex** | Optimización + clasificación de imágenes · macros faltantes · PNG/web formats · PNG @2x de iconos+divisores para social |
| **Claude** | Cablear lifestyle a páginas · estándar de presentación de producto · 5 set-shots compuestos · pulido web · auditoría de fotos de escala |
| **Usuario** | Restaurar/publicar 13 productos WC · decidir qué banners archivar · sesión de foto de escala si la auditoría la pide |

---

## 7. Definición de "listo y nivel referente"

La plataforma converge cuando se cumple TODO esto:

- [ ] Cada producto del catálogo: macro + escala, mismo crop, mismo fondo.
- [ ] Cero imágenes AI / `Sin-titulo` / placeholder en cualquier superficie.
- [ ] Lifestyle cableado: el home y las páginas respiran fotografía real.
- [ ] Web, IG, Pinterest y TikTok se leen como la misma marca (color, tipo, esquinas).
- [ ] Marketing collateral refleja el catálogo amplio, no solo meteorito.
- [ ] El sitio deployado en una URL pública que el usuario revisa de un vistazo.
