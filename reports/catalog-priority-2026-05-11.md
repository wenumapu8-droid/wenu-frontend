# Catalog Priority Report — Wenu Mapu
Date: 2026-05-11
Source: woo-audit-latest.json (104 products), dist/p/ (62 built pages), market-reference-study

---

## Estado real del catálogo

| Metrica | Valor |
|---|---|
| Total productos en WC | 104 |
| Publicados visibles (precio + imagen) | 27 |
| Publicados pero sin precio | 33 |
| Publicados sin imagen | 12 |
| Drafts (invisibles) | 42 |
| Sin SKU | 53 |
| Precio cero | 37 |
| Duplicados de foto-como-producto | 478 entradas WC |

El catalogo visible real es 27 productos. El resto bloquea ventas activamente.

---

## 1. Top 10 a desbloquear de inmediato

Criterio: publicados, tienen imagen, solo les falta precio. Esfuerzo = abrir WP admin, escribir precio, guardar. 10 minutos el lote.

| # | Nombre | ID WC | Problema | Que falta | Esfuerzo |
|---|---|---|---|---|---|
| 1 | Ritual Ring Vacamuerta No.3 — Sterling Silver & Atacama Meteorite | 2086 | Sin precio | Precio (estimado $180–$280 dado el material) | 5 min |
| 2 | RITUAL RING No.19 — Sterling Silver + Atacama Meteorite | 2085 | Sin precio | Precio | 5 min |
| 3 | Mystic Snake Piercing | 2076 | Sin precio | Precio ($40–$60 range) | 5 min |
| 4 | Mystic Bee Titanium Piercing | 2077 | Sin precio | Precio ($40–$60 range) | 5 min |
| 5 | Golden Drop-Shaped Clicker Septum | 2060 | Sin precio | Precio ($45–$70) | 5 min |
| 6 | 6mm Titanium Septum Rings | 2055 | Sin precio | Precio ($35–$55) | 5 min |
| 7 | 6mm Silver Titanium Septum Rings | 2054 | Sin precio | Precio ($35–$55) | 5 min |
| 8 | Tribal Bronze Expansions | 2069 | Sin precio | Precio ($45–$80) | 5 min |
| 9 | Black Surgical Steel Snake Saddle Expander (Golden Eye) | 2066 | Sin precio | Precio ($55–$85) | 5 min |
| 10 | Teardrop Amethyst | 2073 | Sin precio | Precio ($60–$90) | 5 min |

Nota: los 23 productos "publicados + imagen + sin precio" pueden desbloquearse en una sola sesion de 45-60 minutos en WP admin. Priorizar los 10 anteriores por categoria con demanda (septums, snakes, ritual rings, expansions con material diferencial).

Separado: los Ritual Rings (2086, 2085) son los productos con mayor potencial premium. La historia Vacamuerta/meteorite es el diferenciador unico de la marca. Si el precio aun no esta definido, establecerlo hoy: $220–$350 es el rango correcto dado el posicionamiento y la referencia de Maria Tash/Tawapa.

---

## 2. Top 10 winners actuales (publicados, precio, imagen)

Productos ya listos para vender, ordenados por potencial.

| # | Nombre | Precio | Por que es winner |
|---|---|---|---|
| 1 | Ear Gauges — Certified Walnut Wood (WM-WOO-593) | $120 | Unico en precio alto, material certificado, diferencial claro. Categoria madera con demanda en nicho stretched-lobe. |
| 2 | Handmade Plug - Stone 10mm (WM-PLG-005 a PLG-015) | $25 | Catalogo de piedras naturales con foto. 15 variantes activas. Precio accesible, alta rotacion posible. |
| 3 | Handmade Plug - Stone 10mm (WM-PLG-004 / Curated) | $25 | Nombre "Curated" diferencia del generico. Necesita descripcion (flag no_desc), esfuerzo bajo. |
| 4 | Handmade Hanger - Surgical Steel 10mm (WM-HAN-001/002/004) | $15 | Categoria hangers con demanda comprobada. Precio entry-level. Genera volumen. |
| 5 | Curated Surgical Steel Body Hanger 10mm (WM-HAN-003) | $15 | Con foto, SKU correcto. Solo le falta descripcion. |
| 6 | Handmade Labret - Steel 10mm (WM-LAB-001) | $18 | Labrets son categoria de alta busqueda en body jewelry. Precio correcto. |
| 7 | Handmade Labret - Steel 10mm (WM-LAB-002 / WM-LAB-003) | $18 | Dos variantes publicadas con imagen. Amplian la oferta de labrets sin trabajo adicional. |
| 8 | Stainless Steel Spiral Engraved Plugs | $0 | Tiene imagen + nombre fuerte — solo falta precio. En cuanto se fije (~$35-55), es winner inmediato. |
| 9 | Diamond Walnut Wood Hangers | $0 | Madera + hangers = nicho fuerte. Con precio y descripcion correcta puede ser el segundo producto $60+. |
| 10 | Teardrop Ammonite Plugs — Walnut & Bronze | $0 | Combinacion walnut + bronze es diferencial de marca. Nombre ya vende. Solo falta precio + imagen (actualmente sin imagen en WC, pero el slug existe en build). |

---

## 3. Productos a archivar / discontinuar ahora

No valen el tiempo de reparar en esta etapa.

**Eliminar o dejar en draft permanente:**

- `Pronto` (id 2080) — placeholder sin nombre, sin nada. Borrar.
- `producto prueba` (id 2078) — test. Borrar.
- `Aonik` (id 2079) — publicado sin precio, sin descripcion, sin imagen. Nombre sin contexto para el cliente. Archivar hasta que tenga ficha completa.
- Los 11 drafts tipo "Cosmic Fragment / Stellar Horizon / Sacred Territory / Sacred Threshold / Ritual Portal" (ids 2129–2144, excepto los Ritual Rings) — nomenclatura generada por AI que no conecta con la voz de marca (Mapuche-grounded, material-disciplined). Ninguno tiene imagen ni SKU. El nombre "Cosmic Fragment Stud — Mixed Material Fragment" es generico y contradice el diferenciador. Dejar en draft hasta que tengan pieza fisica, foto, y nombre aprobado por la fundadora.
- Todos los drafts con SKU tipo `WM-LAB-002_angle`, `WM-LAB-002_back`, etc. (ids 2026–2049) — estos son fotos individuales que se subieron como productos separados por error del pipeline. Son duplicados de los productos ya publicados. Deben eliminarse de WC como productos; las fotos van en la galeria del producto principal correspondiente. Son la causa de los 478 "duplicados" reportados en el audit.

---

## 4. Gaps de catalogo

**Categorias prometidas en la navegacion del site que estan vacias o sin stock vendible:**

| Categoria | Estado real | Impacto |
|---|---|---|
| Ear Weights | 1 producto publicado (id 2074), sin precio ni imagen | Nav link activo → pagina vacia. Rompe la experiencia. |
| Amulets | 0 productos publicados con precio + imagen | El site tiene `/amulets` en nav. Categoria vacia visible. |
| Ritual Pieces | Solo los 2 Ritual Rings sin precio | La marca se posiciona como "ritual jewelry" pero la categoria no tiene nada comprable. |
| Rings / Anillos | 4 productos en WC, ninguno con precio + imagen activo | Septum rings tienen precio 0. Anillo gota sin precio ni imagen. |
| Collares | 0 productos en todo el catalogo | Codigo WM-COL existe en el sistema pero sin productos. |
| Amuletos (WM-AMU) | 0 productos | Mismo problema. |
| Piercings flat/eyebrow/nipple/tongue | 0 productos | Documentado en CLAUDE.md como pendiente de carga. |

**El gap mas urgente:** Ear Weights y Amulets tienen link activo en la navegacion y estan vacios. Un visitante que llega por esa promesa rebota.

---

## 5. Pricing — observaciones

**Distribucion actual (67 productos con precio):**

| Rango | Cantidad | Observacion |
|---|---|---|
| < $20 | 36 | Labrets ($18) y hangers ($15). Precio entry-level correcto para volumen. |
| $20–$60 | 30 | Plugs ($25), WM-RNG ($25). Cluster muy comprimido. |
| $60–$120 | 0 | Vacio total. |
| $120–$200 | 1 | Ear Gauges en madera ($120). Outlier aislado. |
| $200+ | 0 | Ningun producto en este tier. |

**Problemas:**

1. **El gap $60–$200 es un problema de revenue.** Casi todo el catalogo esta entre $15 y $25. Con ese precio promedio (~$22), alcanzar $20k/mes requiere ~900 transacciones mensuales — imposible para una operacion de citas privadas. El catalogo necesita un tier medio ($80–$150) con 8–12 productos: expansiones con piedra, hangers en madera premium, septums en titanio anodizado con diseno.

2. **Los Ritual Rings (Vacamuerta/meteorite) son el unico producto con potencial $200–$400.** Estan publicados pero sin precio. Si el precio se fija en $220–$350 y se activan hoy, cambian la metrica de AOV inmediatamente.

3. **No existe tier premium ($300+).** El posicionamiento de marca (meteorite, mano de autor, lote limitado) justifica piezas comisionadas en ese rango. No hay un producto de catastro en $300+ que ancle la percepcion de valor. Crear aunque sea 2–3 piezas en ese tier (anillo autor, collar ritual, pieza unica) aunque sean "por encargo" con precio visible.

4. **Precio $15 para labrets de acero quirurgico esta por debajo del mercado.** Buddha Jewelry y Ask & Embla cobran $35–$85 por piezas equivalentes. Si el material es implant-grade titanium (como lo nombra el audit), el precio correcto es $35–$65. Revisar si el costo de produccion permite subir sin perder margen — si el margen ya es bueno a $18, subir a $35 dobla el revenue de esa categoria sin esfuerzo adicional.

---

## Acciones priorizadas (orden de impacto / esfuerzo)

1. **Hoy (45 min):** Agregar precio a los 23 productos publicados con imagen y precio cero. Priorizar Ritual Rings primero.
2. **Esta semana:** Eliminar los drafts-foto (ids 2026–2049, SKUs con sufijos `_back/_detail/_angle`). Son ruido en WC y causan los 478 duplicados.
3. **Esta semana:** Agregar descripcion a los 3 productos publicados con imagen + precio pero sin descripcion (ids 1811, 1786, 593).
4. **Proxima sesion:** Definir precio y activar Ear Weights + minimo 2 Amulets para llenar las categorias con links activos en nav.
5. **Mediano plazo:** Desarrollar 6–8 productos en el tier $80–$150 (expansiones premium, hangers en madera certificada, septums con diseno). Sin este tier, el AOV promedio se queda en ~$22 y la meta de $20k/mes es estructuralmente inalcanzable con el modelo de citas privadas.
