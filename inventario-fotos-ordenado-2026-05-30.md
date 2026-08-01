# Inventario de fotos — estado ordenado · 2026-05-30

Cierre de la auditoría foto↔producto. Disco LaCie escaneado pieza por pieza,
caos de IA deduplicado, incongruencias marcadas. Este es el documento de verdad
para terminar de cargar el catálogo a la web.

> **Lo que importa entender primero:** el inventario real es chico, el caos es
> grande. El dedup automático dejó **171 macros "únicas"**, pero ese número está
> inflado: la serie `DSC_04xx/05xx` de `_PROCESADOS` son **decenas de tomas casi
> idénticas del mismo set de labrets/tops de titanio** disparadas en ráfaga
> (ángulos apenas distintos → no colapsan por hash). Producto distinto real:
> mucho menor. Tu intuición — "no son tanto producto pero hay mucho caos" — es
> exactamente correcta.

---

## Estado del catálogo (NocoDB)

- **READY: 84** · **RAW: 86** · SOLD OUT 13 · RESERVED 6 · total 189 piezas.
- **74 piezas necesitan foto** (RAW con `VACIA` o `NEF_ONLY`). Son el cuello de botella.
- **Coincidencias por nombre de archivo disco↔SKU: 0.** Ninguna foto en disco
  tiene el SKU en el nombre. Todo match es **visual** y requiere tu confirmación.

---

## Las 74 que necesitan foto, por tipo

### A. Tienen candidato visual fuerte en disco → cargar primero
Estas SÍ tienen una macro real que coincide con el tipo. Falta tu OK 1-a-1 para
asignar (no escribo a NocoDB sin confirmación — riesgo de mezclar variantes).

| SKU | Pieza | Candidato visual (hoja#) |
|---|---|---|
| WM-HAN-015 / 021 | Ammonite Fossil Hanger (silver) | ammonite teardrop (056) + `Hanger_Ammonite_Bronze_Teardrop_EDITED.jpg` |
| WM-HAN-016 | Raw Amethyst Heart Hanger | amatista cruda (123/133/138) |
| WM-HAN-028 | Ornamental Wooden Weights 16mm | pesos madera (128/129/149/161) |
| WM-HAN-031..034 | Alai Wakan — Triangle Dart Hangers | triángulo Penrose madera (136) |
| WM-SAD-008 / 010 | Black Steel Snake Saddle, Golden Eye | serpiente verdigris/acero (049/155) |
| WM-PLG-024/025/033 | Jade Stone Plug (20/16/12mm) | plugs piedra verde (147 labradorita / jade) |
| WM-PLG-031 | Amethyst Stone Plug 14mm | plug amatista (123/133) |
| WM-PLG-016/020 | Red/Dark Wood Plug (22/20mm) | plugs madera roja (149) |
| WM-PLG-018 | Black Wood Plug + Silver Mandala | mandala plateado (053/157) |
| WM-TUN-002/003/004 | Black Wood Tunnels (Labyrinth/Mycelium/Spiral) | túneles negros (064-066/148) |
| WM-TUN-019 | Brown Wood Tunnels 20mm | túneles madera (146/150/161) |
| WM-EAR-005/009/010/017/018/019 | Sword/Katana/Lance/Dagger drops (gold) | espadas doradas (158/163) |
| WM-EAR-007 | Silver Snake Silhouette Drop | serpiente plata (135/155) |
| WM-PRC-012/013 | Trinity Cluster CZ Labret Top | colección labret titanio (071-105, serie DSC_04xx) |

### B. Necesitan foto y NO hay match claro → producir o descartar
Sin candidato visual identificable en el disco. Son los que hay que **fotografiar**
o marcar como no-vendibles hoy (regla: solo es producto lo que tiene foto real).

- **Collares/colgantes** WM-NCK-001..009 (Picoyo, obsidiana, labradorita, moonstone, orthoceras, sword pendants) — ninguno aparece como macro. **Probable: fotografiar.**
- **Anillos meteorito Jimmy** WM-RNG-007..010 (casting Atacama) — casting/encargo, sin macro. **Probable: fotografiar al fundir.**
- **Galo Escultor** WM-OTH-004/005 (hormiga bronce, calavera) + WM-OTH-003 (caja musgo) — sin macro de producto.
- Resto de plugs piedra (fluorita, coral fósil, moonstone, obsidiana, sheen) y EAR varios (Om, tree branch, moon phases) — sin match confiable.

### C. Retenidas — solo NEF crudo (la web no renderiza NEF)
Acción concreta y reversible: derivar JPG con `sips -s format jpeg`.
- **WM-HAN-013** Polished Hexagonal Magnetic Hanger
- **WM-HAN-023** Silver Cobra Light Hangers
- **WM-SAD-005** Maya Fan Saddle Expansion 25mm

---

## Excluir del inventario de producto (NO son macros vendibles)
Detectadas en las hojas de contacto. Son lifestyle / marketing / packaging / mockups:

- **Lifestyle (modelos):** 010, 013, 018, 167, 168, 170
- **Gráficos marketing:** 014 (TRIBAL RITUAL), 131 (LIMITED STOCK), BANNER_ETSY_2
- **Escena taller/vitrina:** 020-028
- **Packaging (caja Wenu Mapu):** 156, 165, 169, 171
- **Mockups IA / renders:** `mockup_psy_spectrum_ring.webp`, `psy_spectrum_ring_triptych_final.webp`, `1.png`, `4.png`, `5.png`, `Copia de *.png`, `ritual_ring_950_*` (crops repetidos)
- **Basura técnica:** `test-foto.jpg`, `DSC_0475` (negro/casi vacío, cluster 6)

---

## Incongruencias confirmadas (errores del clasificador previo)
Ya documentadas en memoria, NO promover hasta resolver con dueño:

- **12 RAW retenidas por foto↔título que no coinciden** (Tiger Eye Buddha = loto dorado; Triangular Tiger Eye = serpientes plata; Metatron = hangers madera; etc.). Lista completa en `reference_photo_locations.md`.
- **Fotos mal etiquetadas:** WM-HAN-026 (foto es de HAN-030), WM-PRC-001 (galería tiene macro suelto de PRC-003), WM-SAD-001 (foto es plug PLG-004).
- **No es foto producto:** WM-OTH-003 (screenshot Instagram), WM-TUN-007 (foto grupal ambigua de 3 diseños).

---

## El caos de la "titanio labret collection"
La serie `_PROCESADOS/DSC_0464–0523` (~60 archivos) son ráfagas del mismo set de
labret tops / piercing tops de titanio (marquise dorado, CZ verde, opal, plata).
NO son ~60 productos. Son un puñado de diseños (probable 6-10) fotografiados
muchas veces. **Requiere tu ojo para decir cuántos diseños reales hay** — yo no
puedo distinguir "Trinity Purple CZ" de "Trinity Blue CZ" a este tamaño sin que
me confirmes. Esto es la mayor fuente de inflado del conteo.

---

## Plan de carga a web (orden recomendado)

1. **Derivar los 3 NEF → JPG** (HAN-013, HAN-023, SAD-005). Reversible, lo hago ya si confirmas.
2. **Bucket A:** te muestro cada candidato 1-a-1, confirmas, escribo `Foto macro` + promuevo RAW→READY en NocoDB (PATCH, con backup). ~14 SKUs ganados.
3. **Labret collection:** sesión corta contigo para definir cuántos diseños reales y cuál foto es la "hero" de cada uno.
4. **Bucket B (sin foto):** lista de "fotografiar" para la próxima sesión de cámara. Hasta entonces se quedan RAW (no son producto hoy, por tu regla).
5. **Limpiar el disco:** mover los "excluir" fuera de `_PROCESADOS` para que el inventario quede realmente ordenado (dry-run + backup primero).

---

## HALLAZGO GRANDE — la carpeta `_ERROR` era una mina de macros reales (2026-05-30, pasada 2)

`_ERROR` (872 imgs) **nunca se había escaneado** en la pasada anterior. Triage con dHash
(`scripts/photo_error_triage.py`) quitó dupes de producto ya cargado + las 171 ya vistas →
**548 "únicas" por hash**, que al revisar las 22 hojas de contacto colapsan a
**~25-30 diseños de producto REALES**. El resto es ráfaga del mismo set + packaging + basura.
Confirmado el patrón de siempre: mucho caos, producto real modesto — **pero acá el producto
real estaba escondido en una carpeta llamada "_ERROR".**

**Lo importante: varias de estas macros resuelven Bucket A y desmienten "incongruencias" previas.**

### Diseños reales identificados en `_ERROR` (agrupados, ya colapsada la ráfaga)
**Plugs piedra/madera:** labradorita (001-003,065,326-330) · gold-sheen obsidiana (002,005,009,063) ·
obsidiana/ónix negro (063-064,323-325,396,399-404,421) · jaspe/ojo-tigre rojo (006-007) ·
madera roja (020-027,322,406,409,418) · amatista (008) · rubí/granate (395,397) · fluorita (394).
**Pesos/saddles metal:** lágrima dorada c/ amatista-fluorita cabujón (012,014,405,410,412) ·
greca/meander plata y negro (011,015,083,089-099,101,414-415) · gancho liso dorado teardrop
(013,016-017,060,115,295,416-420) · saddle dorado ornamentado (067-082) · crescent dorado c/
perla-ópalo (121,126,129,161-178) · dragon-scale/aleta plata+oro+rosa (149,154-155,159-160,329) ·
garra/colmillo plata+oro (079,081,084-096) · "araña/coral" negro (047,051-055,103,110-113,196) ·
**tiger-eye triángulo péndulo dorado (044,049,098,107,111)** · **tiger-eye Buddha péndulo (104,106)** ·
hook dorado c/ cilindro grabado (179,187-193) · peso "costilla/pez" dorado (194,307,393).
**Hangers geométricos:** **Penrose triángulo madera (200-226) = WM-HAN-031..034 Alai Wakan** (+ versión c/cristal 222-226) ·
**Penrose hexágono dorado (038-043,227-250)** · hexágono outline (203,206).
**Drop earrings:** **Metatron's Cube dorado (100,169-170,180-186) = WM-HAN-004** ·
**ammonite fossil glass-hook (142,260-285) = WM-HAN-015/021** · **amatista cruda glass-hook (245,261-273) = WM-HAN-016** ·
quartz-point/pirámide drop oro+plata (286-392, ráfaga gigante ≈2-3 reales: cuarzo claro / amatista / labradorita) ·
**serpiente plata (050,053,195,251) = WM-EAR-007** + serpiente bronce/azul (125,199,252-259,310-312).
**Ear cuffs plata chicos:** lisos (136-153,281-282,296-297) · dragon-scale (149,154-155,159).

### Esto cambia 3 cosas del estado anterior
1. **Bucket A gana candidatos sólidos** que antes eran "fotografiar": Metatron (WM-HAN-004),
   ammonite (WM-HAN-015/021), amatista cruda (WM-HAN-016), Penrose triángulo (WM-HAN-031..034),
   serpiente plata (WM-EAR-007), + plugs piedra/madera surtidos.
2. **Desmiente 2 de las "12 incongruencias":** el **Tiger Eye Buddha (WM-HAN-002)** SÍ existe como
   macro real (104,106) y el **Triangular Tiger Eye** corresponde al péndulo triángulo tiger-eye
   (044,049,098,107,111) — el clasificador previo los marcó como mismatch porque la macro vivía en
   `_ERROR`, no porque el producto no existiera. **Revisar 1-a-1 con dueño antes de promover.**
3. **El "fotografiar" de Bucket B se achica:** varios EAR (espadas/garras/serpientes) y HAN
   geométricos YA tienen macro real acá.

### Excluir de `_ERROR` (no son producto)
Gafas de madera Wenu Mapu (004,018-019,046,054,061,109,121) · caja/estuche grabado (062,116-124,135) ·
oscuras/quemadas/flash (066,127-128,130,141,422-423) · **paisajes nocturnos (424-425)** · manos sosteniendo
(varias, pero muestran producto real → recortar, no descartar).

> **Sigue pendiente tu ojo** para la ráfaga quartz-point (286-392): son ~2-3 diseños reales
> disparados ~100 veces. Igual que la "labret titanio collection", necesito que me digas cuántos
> diseños reales hay y cuál es la foto hero de cada uno. Artefactos: `error_unique.json` +
> `error_sheets/sheet_01..22.jpg` (hojas de contacto numeradas 001-425).

---

## Artefactos de esta auditoría
- `scripts/photo_audit.py` — manifiesto + dedup (dHash)
- `scripts/photo_crossref.py` — cruce disco↔catálogo NocoDB
- `scripts/photo_reduce.py` — reduce a representantes únicos + thumbnails
- `scripts/photo_montage.py` — hojas de contacto numeradas
- `/tmp/wenu-audit/` — manifest.json, crossref.json, unique_untagged.json, sheets/ (9 hojas)
