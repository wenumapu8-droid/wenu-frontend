# Decisions Needed Before Launch

Documento centralizado con todas las decisiones que requieren tu input antes del soft launch. Cada una está bloqueando un fix o un siguiente paso.

---

## 🔴 P1 — Bloqueantes pre-launch

### 1. Material confusion: vacamuerta ≠ Atacama meteorite

**Hallazgo SEO audit**: `/material/vacamuerta/` y varias PDPs etiquetan **vacamuerta como "Atacama meteorite"** (origen chileno). Pero "vacamuerta" sugiere **fossilized wood patagónica** (Formación Vaca Muerta, Argentina/Chile sur). El brand DNA dice "mapuche-patagónico" — no Atacama.

**Decisión que necesito**:
- A) Vacamuerta es **fossil wood patagónica** → renombrar Atacama meteorite a otro material (ej: "Atacama iron meteorite" como separado)
- B) Vacamuerta es **meteorite chileno** y el naming es correcto, solo nos confundimos
- C) Otro

**Impacto**: si está mal, indexa en Google con info falsa de origen + es problema legal (Certificate of Authenticity al cliente).

---

### 2. Sterling 925 vs 950: distinción intencional o inconsistencia?

**Hallazgo**: El sitio usa AMBOS:
- **950 silver** en: `/material/sterling-silver`, `/collection/ritual-ring-vacamuerta`, `/collection/mystic-series`, `/journal/four-cardinal-forces`, `ear cuffs page`
- **925 silver** en: shop intro, titanium card, `/about` materials list, `/custom-orders`, `/contact materials` block

**Interpretación posible** (consistente con brand): 
- 925 = body jewelry standard daily (anillos básicos, hangers, aros)
- 950 = premium ritual pieces (cardinal amulets, mystic series, ritual rings vacamuerta)

**Decisión que necesito**:
- A) Es intencional (925 body / 950 ritual) → solo arreglar el link en `materials.astro:13` ("Sterling silver 925" linkea a página que describe 950)
- B) Unificar todo a 950 (la "plata canónica" mapuche)
- C) Unificar todo a 925 (body jewelry industry standard)

**Mi recomendación**: Opción A — la distinción tiene sentido brand y técnico. Solo fixear el link roto.

---

### 3. Cierre del Gap 9: Placeholder NO IMAGE en PDPs

El home ya filtra productos sin imagen (`withImage`). Pero las PDPs muestran un placeholder visible "NO IMAGE" si alguien entra directo al producto sin foto. Hoy hay 54 productos sin imagen según audit.

**Opciones**:
- A) Despublicar (status `draft`) todos los productos sin imagen → desaparecen del catálogo público hasta que tengan foto
- B) Mejorar el placeholder visualmente (logo + "Photo coming soon - contact for details") como CTA a custom-orders
- C) Dejar como está

**Mi recomendación**: A + B combinado. Despublicar los 54 productos sin imagen (sale del catálogo), Y mejorar el placeholder por si alguno se cuela.

---

## 🟡 P2 — B2B Outreach Strategy

Estas 4 las identificó el agente B2B antes del primer envío (D7):

### 4. Exclusividad geográfica?
- A) Sin exclusividad año 1 (escala más rápido, riesgo de cannibalización en 1 ciudad)
- B) Exclusividad por ciudad para los primeros 3 partners (premium feel, ralentiza)
- C) Solo por barrio/zona dentro de cities grandes (LA, NYC)

**Mi recomendación**: A — año 1 prioriza coverage. Revisar año 2 si hay queja.

### 5. Custom commissions para partners?
¿Los piercers partners pueden encargar custom pieces para sus clientes con margen wholesale?
- A) Sí, mismo 50% off
- B) Sí pero con minimum order $300
- C) No (solo catálogo stock)

**Mi recomendación**: B — abre oportunidad sin saturar capacidad de producción.

### 6. Press coverage discount floor?
Si VICE/Hyperallergic/blog menciona, ¿ofrecemos descuento al outlet/journalist?
- A) Sí, código 20% una vez
- B) Solo regalo de pieza (no descuento)
- C) Nada, just gracias por la mención

**Mi recomendación**: B — mantiene premium positioning, sigue siendo generoso.

### 7. Lookbook en Spanish?
3 de los 15 estudios target (Diablo Rojo, JuL Head, 13 Bats) tienen clientela bilingual.

**Mi recomendación**: Sí, versión bilingüe ES/EN en el PDF.

---

## 🟢 P3 — Catálogo (no bloqueantes inmediatos, pero alto ROI)

### 8. Pricing de los 23 productos listos
Reporte de catálogo identifica 23 productos publicables que SOLO les falta precio. Los Ritual Rings Vacamuerta están en la lista con sugerencia $220-350.

**Acción**: 45 min de tu tiempo en WP admin para subir precios. El reporte tiene rangos sugeridos por categoría. Voy a generar un CSV con sugerencias específicas si querés.

### 9. Eliminar drafts basura (fotos sueltas con SKU `_angle`, `_back`)
~20 productos draft son fotos individuales del pipeline. No son productos.

**Acción**: bulk delete desde WP admin (o yo puedo escribir un script si me pasás temporal access).

### 10. Crear tier $80-200 (CRÍTICO para llegar a $20k/mes)
Catálogo actual todo $15-25. Sin tier medio, $20k/mes es imposible.

**Decisión**: ¿qué 8-12 productos del catálogo actual o futuro pueden subir a este tier? Necesito tu input en sesión separada para repricing strategy.

---

## Workflow recomendado

1. Responde 1-2-3 (P1) hoy o mañana → desbloquea fixes técnicos
2. Responde 4-5-6-7 (P2) antes del D7 del B2B outreach
3. P3 cuando tengas tiempo de bloque dedicado (1-2h)

Te puedo ayudar a tomar cada decisión si me das contexto adicional. Marcá tu opción y avanzo.
