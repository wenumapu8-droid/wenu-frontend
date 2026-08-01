# Clasificación Wave 2 — `_RAW_SOURCE` (NEF 2022-2023-2025)

Dedupe `photo_classify_wave.py` + reagrupado por categoría `photo_regroup_by_cat.py`.
Etiquetas `RS-NNNN` (global, 1-indexed). Artefactos:
- `/tmp/wenu-audit/rs_2023_2025/` — wave 2023+2025 (rápida, 403 únicas, 34 hojas)
- `/tmp/wenu-audit/raw_source/` — wave full 2022+2023+2025 (1661 únicas, 139 hojas)
- `by_cat/<bucket>/sheet_NN.jpg` — hojas por categoría/material/diseño

**Restricción dura confirmada otra vez:** todo lo revisado = inventario existente o
sold-out. Cero productos nuevos.

## 2023 — Bloque 1 (GROUND TRUTH dueño, 2026-05-31)

| Bucket | RS | Ground truth dueño | Estado |
|---|---|---|---|
| Anillo | 0001 | Anillo forma abstracta **regulable**, plata | ✅ inventario (= PRO-030/031, a pedido) |
| Anillo | 0002 | Anillo **ajustable** con textura, envejecido, plata | ✅ inventario |
| Anillo | 0003-0006 | **Mismo producto** (anillo texturado ajustable plata envejecida) | ✅ inventario |
| Aros | 0007-0014 | Aros diseño **SHIPIBO**, 2 variantes: dorada + plateada | ✅ inventario |
| Ear cuff 925 | 0015-0019 | **Mismo ear cuff de plata, detalle serpientes** | ✅ SOLD OUT (= PRO-050/051/053) |
| Piercing Titanio | 0319 | Piercing titanio rosca interna, **el más grande 16g**, visto por atrás + back part | ✅ inventario |
| Piercing Titanio | 0321-0328 | **Mismo producto, 2 acabados**: titanio dorado c/ piedra negra · plateado c/ piedra verde. Ambos 16g rosca interna | ✅ inventario |
| Piercing Titanio | 0329 | **Ópalo con 3 puntitos**, titanio rosca interna 16g | ✅ inventario |
| Septum Titanio | 0334-0336 | **Mismo clicker titanio**: uno dorado 8mm + plateado otro 10mm | ✅ inventario (= burst septum wave 1) |
| Septum Titanio | 0337 | Clicker **forma de gota**, dorado y plateado, titanio | ✅ inventario |
| Septum Titanio | 0338 | Clicker **3 anillos en paralelo**, dorado, titanio | ✅ inventario |

**Bloque 1: 0 nuevos.** Anillos = abstracto regulable + texturado ajustable (ambos en
inventario). Aros = Shipibo 2 acabados. Ear cuff = serpiente plata SOLD OUT. Piercing/
septum titanio = variantes de acabado/medida de productos ya cargados.

## 2023 — Bloque 2: Expansión/plug parte A (GROUND TRUTH dueño)

| Bucket | RS | Ground truth dueño | Estado |
|---|---|---|---|
| Hanger Bronce | 0190-0198 | **Metatron**, 2 opciones de gancho: sin gancho + gancho **cola de chancho** (mismo diseño) | ✅ inventario (= WM-HAN-004) |
| Hanger Bronce | 0199-0201 | Hangers con **cajitas de India con sánscrito/mantra** | ✅ inventario |
| Hanger Madera | 0206-0217 | Hangers **madera** forma diamante | ✅ inventario |
| Túnel svastika bronce | 0036-0040 | Todos **túnel svastika** (bronce) | ✅ inventario |
| Tunnel black acero | 0024-0035 | Túneles **negros con diseño por dentro** (acero) | ✅ inventario |

**Bloque 2: 0 nuevos.** Todo expansión/hanger ya en catálogo.

## 2023 — Bloque 2 parte B: Expansión/plug (GROUND TRUTH dueño)

| Bucket | RS | Ground truth dueño | Estado |
|---|---|---|---|
| Medusa | 0020-0023 | Túnel/plug acero negro cabeza medusa | ✅ inventario |
| Snake | 0177-0188 | Hangers serpiente **acero PLATEADO, sólidos (NO flexibles)** | ✅ inventario (corrección: plateado/sólido) |
| Acero con piedra (hexag.) | 0130-0141 | Hangers con **detalles negro** — **2 pares disponibles** | ✅ inventario |
| Tipo Sillín | 0248-0253 | Sillines acero quir. **ojo dorado + serpiente** — **solo 1 disponible** | ✅ inventario (1 stock) |
| Tipo Sillín | 0257 | Sillín con diseños **acero plateado** — **OTRO producto** | ✅ inventario (distinto) |
| Tipo Sillín | 0254-0256, 0258-0259 | Sillines **grandes ornamentales tipo MAYA** (prob. = colección Maya) | ✅ inventario (= WM-SAD Maya?) |

**Bloque 2B: 0 nuevos.** Correcciones de stock anotadas (snake plateado sólido,
hexagonales 2 pares, sillín ojo-dorado solo 1, sillín plateado distinto, sillines Maya).

## 2023 — Bloque 3: cierre Expansión/plug (GROUND TRUTH dueño)

| Bucket | RS | Ground truth dueño | Estado |
|---|---|---|---|
| Hanger 2 Bronce | 0103,0106,0107,0109,0111,0113,0114 | **Mismo producto**: hanger bronce envejecido forma serpiente, sólidos, **NO uso diario** | ✅ inventario |
| Hanger 2 Bronce | 0104,0105,0108,0110,0112 | **Ensambles propios** (tipo Metatron + colgante serpiente bronce), gancho siempre acero quir. | ✅ inventario (ensamble) |
| Piedra | 0239 | Plug **amatista** | ✅ inventario |
| Piedra | 0240-0241 | Expansión plug **fluorita** | ✅ inventario |
| Piedra | 0242-0243 | **Labradorita** | ✅ inventario |
| Piedra | 0244-0245 | **Obsidiana negra** | ✅ inventario |
| Piedra | 0246 | **Ojo de tigre rojo** | ✅ **SOLD OUT** |
| Piedra | 0247 | **Labradorita forma de gota** | ✅ inventario |
| Silver 925 | 0122-0129 | **Mismo producto**: aros pesados / hangers livianos de plata, **garra de reptil/dinosaurio** | ✅ **SOLD OUT** |
| Madera tapón | 0232-0234 | Plugs **madera negra** | ✅ inventario |
| Madera tapón | 0235-0236 | Plugs **madera roja** | ✅ inventario |

**Bloque 3: 0 nuevos.** Ojo de tigre rojo + garra de plata = SOLD OUT. Resto inventario.

## 2023 — Bloque 4: Lentes / Cadena / Pulsera / Madera teardrop
| Bucket | RS | Qué es | SKU NocoDB |
|---|---|---|---|
| Lentes | 0298-0309 | Lentes madera Wenu Mapu (sol + ópticos) | WM-OTH-002 Octagonal Wooden Sunglasses |
| Piercing con cadena | 0316-0318 | Doble piercing dorado + cadena, top flor CZ | (pendiente match) |
| Pulsera | 0330-0331 | Cuff plata grabado geométrico | WM-OTH-006 Sanskrit Mantra Cuff (SOLD OUT) |
| Hanger 2 Madera | 0117-0121 | Teardrop madera tallada filigrana | WM-HAN-028 Ornamental Wooden Weights |

## 2025 — Selección reciente (65 fotos, GROUND TRUTH dueño 2026-06-01)

### Hoja 1 (RS-0339–0350)
| RS | Ground truth dueño | SKU NocoDB | Estado |
|---|---|---|---|
| 0339-0340 | Plug lágrima ammonite (0340 = mismo, luz roja) | WM-SAD-009 Ammonite Wood Teardrop Plug (Brass Inlay) | ✅ READY |
| 0341 | Túnel cráneo ciervo **dorado**, par | WM-TUN-018 Skull Deer Brass Tunnel 12mm Pair | ✅ READY |
| 0342-0343 | Plug espiral (mismo producto; 0343 muestra detalle del filete) | WM-PLG-005 Spiral Pinwheel Plugs | ✅ READY |
| 0344-0347 | Túneles **madera roja** con anillo dorado al centro | WM-TUN-005 Brass-rimmed Wood Tunnels | ✅ READY |
| 0348-0350 | Túneles **titanio** | WM-TUN-015/016 Implant Grade Titanium Tunnel | ✅ READY |

**Hoja 1: 0 nuevos.** DB tenía razón en TUN-018 dorado (yo leí plateado). Sin discrepancias de Estado.

### Hoja 2 (RS-0351–0362)
| RS | Ground truth dueño | SKU NocoDB | Estado |
|---|---|---|---|
| 0351 | Túnel titanio | WM-TUN-015/016 Titanium Tunnel | ✅ READY |
| 0352 (plug) + 0353 (túnel) | **Mismo producto** resina morada 8mm, 2 formatos | WM-PLG-037 (plug) + WM-TUN-022 (túnel) | ✅ ambos cargados |
| 0354-0355 | Túneles acero quir. **dorados** | WM-TUN-013 Gold Plain Tunnel | ✅ READY |
| 0356 | Plug dorado mandala floreado, medida chica | WM-TUN-007 Solar Light Weight Tunnel - Mandala Floral 12mm | ✅ (RAW) |
| 0357 | Túnel negro + cráneo **dorado** ciervo | WM-TUN-021 Black Steel Tunnel w/ Golden Deer Skull | ✅ RESERVED |
| 0358-0359 | Acero negro diseño de ondas | WM-PLG-017 Black Surgical Steel Wave Pattern Plug | ✅ READY |
| 0360-0362 | Teardrop madera + chapa bronce fósil | WM-SAD-009 Ammonite Wood Teardrop (Brass Inlay) | ✅ READY |

**Hoja 2: 0 nuevos.** ✅ **CORRECCIÓN aplicada**: resina morada TUN-022 + PLG-037 estaban como
**10mm** → owner confirmó **8mm** → PATCH titles (backup `data/backups/purple-resin-8mm-2026-06-01T23-57-34Z.json`).

### Hoja 3 (RS-0363–0374) — plugs de piedra
| RS | Ground truth dueño | SKU NocoDB | Estado |
|---|---|---|---|
| 0363, 0371, 0372 | Amatista plug | WM-PLG-031 Amethyst Stone Plug 14mm | RAW |
| 0364-0366 | Jade | WM-PLG-024/025/033 Jade Stone Plug (20/16/12mm) | RAW |
| 0367-0368, 0373-0374 | Obsidiana ónix | WM-PLG-008 Black Obsidian Stone Plugs | READY |
| 0369-0370 | Fósil de coral | WM-PLG-029 (14mm) + WM-PLG-035 (8mm) Fossil Coral Plug | RAW |

**Hoja 3: 0 nuevos.** Sin discrepancias de Estado.

### Hoja 4 (RS-0375–0386)
| RS | Ground truth dueño | SKU NocoDB | Estado |
|---|---|---|---|
| 0375 | Fósil coral plug | WM-PLG-029/035 Fossil Coral Plug | RAW |
| 0376-0377 | Hangers livianos plata **cobra** | WM-HAN-023 Silver Cobra Light Hangers | ✅ READY |
| 0378-0379 | Anillo plata ajustable serpiente | WM-RNG-005 Snake Silver Ring | ✅ SOLD OUT |
| 0380-0381 | Hangers ornamentales cierre magnético | familia magnética (HAN-011 Tribal Architecture u otro) | READY |
| 0382-0384 | Túnel patrón de **cruces** | WM-TUN-009 Solar Light Weight Tunnel - Cross Lattice | ✅ READY |
| 0385-0386 | Túnel **mandala** dorado acero quir. | WM-TUN-007 Solar Light Weight Tunnel - Mandala Floral | RAW |

**Hoja 4: 0 nuevos.** Confirmado: cobra hangers (HAN-023) ≠ ear cuff serpiente (EAR-007) — productos distintos.
Sin discrepancias de Estado.

## ✅ Cruce ground-truth ↔ NocoDB (2026-06-01) — la base CIERRA
~15/15 categorías mapean a SKU real. La DB es coherente con la realidad del dueño.
Matches clave verificados: RNG-006/011 (anillos ajustables), EAR-001 (Shipibo),
HAN-004 (Metatron), HAN-005 (snake bronce), PRC-027 (snake labret 16g),
SAD-005 (Maya), SAD-008/010 (snake saddle golden eye), TUN-014 (Medusa),
HAN-018 (greca/svastika), PLG-027 (fluorita), PLG-015/023/028/032/034 (labradorita),
EAR-020 (garra plata SOLD), OTH-006 (cuff SOLD), OTH-002 (lentes).

### Incongruencias detectadas + acción
1. ✅ **CORREGIDA**: WM-PLG-022 Red Tiger Eye estaba READY → owner dijo vendido →
   **PATCH SOLD OUT** (backup `data/backups/plg022-soldout-2026-06-01T23-10-36.json`).
   Catálogo: READY 96→95, SOLD OUT 15→16.
2. ✅ **RESUELTA (2026-06-01)**: Ear cuff serpiente plata (RS-0015-0019) = **WM-EAR-007
   "Silver Snake Silhouette Drop Earrings"**. Match visual confirmado: las macros RS muestran
   la misma silueta de serpiente plateada; la foto de referencia de EAR-007 confirma que son
   **aros colgantes con gancho** (el "ear cuff" del dueño fue impreciso — el nombre del SKU es
   correcto). NO falta SKU. Producto estaba RAW → owner dijo vendido → **PATCH SOLD OUT**
   (backup `data/backups/ear007-soldout-2026-06-01T23-30-28Z.json`). RAW 74→73, SOLD OUT 16→17.
3. ✅ **RESUELTA (2026-06-01)**: Lentes — owner confirmó **octagonales** = WM-OTH-002 correcto.
   No hay variantes redondas/rectangulares sin cargar. Sin acción.

**Regla aprendida (owner 2026-06-01):** cruzar SIEMPRE ground-truth ↔ NocoDB y corregir
incongruencias de Estado solito (backup+reversible), sin pedir permiso. Grabada en skill
`wenu-photo-classify`.

### Hoja 5 (RS-0387–0398) — los 2 hangers que el dueño insistió (2026-06-02)
Búsqueda exhaustiva: se renderizaron y revisaron **los 396 attachments únicos de los 191
SKU** (foto_referencia + foto_macro, todas las posiciones, todas las carpetas de uploads:
`piezas`, `noco`, `2026/05/30-31`). Método: `docker cp` de las carpetas que faltaban + sheets
de contacto + inspección visual.

| RS | Ground truth dueño | Resultado |
|---|---|---|
| 0390-0391 | Hanger **hexagonal** acero quirúrgico + resina **teal** | ✅ **= WM-HAN-022** (titulado "Crown Spine Hangers (10mm)"). Confirmación dura: uno de los 6 attachments de HAN-022 es **`DSC_0282.NEF`** = el archivo fuente exacto de RS-0390. Mismo producto, sin duda. |
| 0397-0398 | Hanger **spiral glow** de Pyrex (vidrio, forma garra/cola en espiral, transparente con luz / verde fluo bajo UV) | ❌ **NO existe en NocoDB**. Revisados los 396 attachments — ningún hanger de vidrio con cola en espiral. Lo más cercano (PLG-012 plug de vidrio espiral cilíndrico, TUN-015/016 túneles de vidrio) NO es el mismo producto. La foto de referencia SÍ existe en disco (`DSC_0296.NEF`/`DSC_0301.NEF` en `2025/seleccion/`) pero **nunca se creó el SKU** en noco. |

**Hoja 5: 1 GAP REAL detectado** (el spiral glow Pyrex). Es el primer producto real
fotografiado que el audit demuestra que falta cargar a NocoDB. Siguiente slot libre = **WM-HAN-030**
(falta en la secuencia HAN). Pendiente owner: material exacto / medida / precio / estado para
crear el SKU. NO inventar.

**Naming RESUELTO (owner aprobó 2026-06-04):** WM-HAN-022 renombrado de "Crown Spine Hangers (10mm)"
→ **"Teal Resin Hexagon Hangers (surgical steel, 10mm)"** (PATCH Id 51, backup
`data/backups/han022-rename-2026-06-04T23-19-36Z.json`). Verificado en noco.

**Búsqueda glow Pyrex (2026-06-04) — exhaustiva, definitiva:** escaneadas TODAS las fuentes con
imágenes del NocoDB: Piezas.Foto_referencia + Foto_macro (todas las posiciones, carpetas
`piezas`/`noco`/`2026/05/30-31`), Piezas.Foto_con_escala (vacía), tabla aparte `nc_9aor___fotos`
(72 imágenes), + las 200 imágenes casi-negras aclaradas ×7 brillo, + detector de verde-fluo
sobre negro. **El hanger spiral glow Pyrex NO está en este NocoDB.** Las únicas piezas de vidrio
son túneles/plugs redondos (TUN-015/016, PLG-008/013, fotos #57/#63). La foto de referencia SÍ
existe en disco (`DSC_0296`/`DSC_0301` en `2025/seleccion/`) pero nunca se cargó a la base.
→ Producto real MISSING. Crear SKU nuevo (slot libre WM-HAN-030) cuando el owner dé
material/medida/precio/estado. NO inventar.

**RESUELTO (owner dijo "dale" 2026-06-04):** creado **WM-HAN-030 "Glow Pyrex Spiral Hangers"**
(Id 197, POST). Categoria=Hanger, Tipo=Expansion, Unidad=Pair, **Estado=RAW** (datos incompletos),
precio/medida/peso VACÍOS (no inventados). Material=Glass NO existe en el single-select de noco →
queda en Notas + pendiente agregar opción. Log reversible `data/backups/han030-create-2026-06-04.json`.
Catálogo 191→192. **PENDIENTE OWNER para pasar a READY**: Medida_mm, Precio_venta_USD, Costo_USD,
opción Material=Glass, y adjuntar la foto del disco (DSC_0296/0301, son NEF → convertir a web).
