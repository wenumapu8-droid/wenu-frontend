# KODEX · inventario del Drive

Catalogado el 2026-08-10 por cuatro agentes que abrieron cada imagen y copiaron
lo que la lámina dice **de sí misma**. Nada acá está interpretado: si un campo
no aparecía en la imagen, quedó vacío.

El repo conocía **17** referencias. En el Drive hay **337 archivos**, y de ellos
**58 son pósters de 1122×1402**: 8 ya estaban (TANDA 02 completa) y **50 no**.

---

# 1 · La serie que importa: KODEX-∞ UNIVERSE

Diez páginas numeradas, todas con la misma cabecera —`KODEX-∞ UNIVERSE ·
OBSERVE. DECIPHER. TRANSCEND.`— y con su código de archivo. **Es el diseño del
sitio, página por página.**

| pág | título | subtítulo | código |
|---|---|---|---|
| 01 | ORIGIN FIELD | — | `KDX-ORIGIN-0001` |
| 02 | THRESHOLD | THE FIRST CONSEQUENCE | `KDX-THRESHOLD-002` |
| 03 | RETURN | ALL PATHS LEAD HOME | `KDX-RETURN-0003` |
| 04 | ALPHABET | RELATION FIELD | `KDX-ALPHABET-004` |
| 05 | GENESIS | VISUAL LINEAGE | `KDX-GENESIS-0005` |
| 06 | MEMORY | TEMPORAL ARCHAEOLOGY | `KDX-MEM-006` |
| 07 | OBSERVER | MIRROR CHAMBER | `KDX-OBSERVER-007` |
| 08 | ANOMALY | MUTATION | `KDX-ANM-0008` |
| 09 | SOURCE | TRUTH CHAMBER | `KDX-SOURCE-0009` |
| 10 | THE COMMONS | COLLECTIVE TRACE | `KDX-COMMONS-0010` |

**Las diez son de héroe procedural.** Ninguna necesita fotografía.

## Por qué esto resuelve conflictos abiertos

**PAGE 04 · ALPHABET trae las coordenadas A–Y.** Es literalmente lo que el
encargo prohíbe inventar —*«coordenadas A-Y: eso lo decide el creador»*— y
resulta que ya estaban decididas y dibujadas: un grafo de nodos A a Y con
`ORIGIN COMMON NODE`, `M OPTIONAL HEART / 0 NODE` y `Y CONVERGENT HORIZON`. La
lámina lo dice así: *«NOT A SEQUENCE. A LIVING TOPOLOGY.»*

**PAGE 09 · SOURCE es el Truth Ledger dibujado.** Trae la tabla de las cinco
clases —VERIFIED, CANONICAL, INFERRED, SPECULATIVE, NEEDS CONFIRMATION— con
columnas SOURCE / CLAIM / EVIDENCE / TRANSLATION / PROVENANCE, y el flujo
`ORIGIN → INGEST → TRANSLATION → VALIDATION → ARCHIVE`.

**Y calza con la P0 Scene Bible.** THRESHOLD, OBSERVER, RETURN y THE COMMONS
—la superficie pública del DIGITAL ALTAR— tienen su página. Eso da material
para decidir si las seis de la Scene Bible son escenas o capas.

---

# 2 · Las fichas de receta: la máquina de ensamblaje ya existe en papel

Tres láminas **no son obra: son instrucciones**. Traen parámetros, variantes de
fase y pseudocódigo.

| ficha | qué enseña |
|---|---|
| `01. HÉLICE PARAMÉTRICA` · KX-HP-01 | malla helicoidal animada por fase, con código p5.js y 4 frames de loop |
| `02. TORQUE MESH` · KDX-M-002 | cinta paramétrica por trigonometría, tabla de parámetros y 4 variantes |
| `03. FIGURA VIVA EN LOOP` | deformación armónica, 6 pasos de 0 % a 100 % = 0 % |

Y traen la regla que este repo dedujo por su cuenta midiendo costuras:

> *«La forma completa un ciclo cuando la fase avanza de 0 → TAU (2π).»*
> *«Asegura que el último frame coincida con el primero para un loop perfecto.»*

Es exactamente el bucle por fase que está en la skill `kodex-lamina`. La regla
ya estaba escrita en el Drive; el repo la re-descubrió rompiéndose. Undécima
vez que algo ya existía.

---

# 3 · Qué se puede construir y qué no

De los 50 pósters nuevos:

```
héroe PROCEDURAL   31   se reproducen en canvas/SVG con el método actual
héroe FOTOGRÁFICO  19   render orgánico o fotografía: NO se generan por código
```

Los 19 fotográficos son sobre todo dos familias:

- **WENU MAPU · SOLAR TECHNOLOGY I–V** — discos solares metálicos, yantras,
  reactores. Es **otra marca**, con su propio lenguaje ancestral.
- **KX-8 / ARCHIVE DOSSIER** — cabezas rituales de piedra, cráneos con
  circuitería, bustos de mármol partidos.

Estos no son un fracaso del método: son otra categoría. Tratarlos como imagen
con tratamiento GPU es legítimo; fingir que se generan no lo es.

## Los procedurales, por familia

- **Sistema de glifos y teselados** — `KX-GTS-07 GLYPH TILE SYSTEM` (simetría
  D4, grilla 8×8, modos GRID/HEX/RADIAL), `KS-0002 GLYPH SYSTEM`,
  `MSB-10 MASTER SYSTEM BOARD`, `KX-08 MANDALA INDEX`
- **Mandalas y anillos** — `PORTAL RING`, `STAR COMPASS SEAL`,
  `KX-03 COSMOLOGY NODE MAP`, `KX-04 SIGNAL SPHERE`
- **Campos y vórtices** — `SIGNAL VORTEX`, `KX-05 PROCESSION FIELD`
  (túnel fractal), `ORIGIN FIELD`, `ARCHIVE ENGINE`
- **Bandas de código** — `KX-06 DIAGONAL CODE BAND`, `KX∞-VS.01`

---

# 4 · Lo que hay que decidir, y no me toca

1. **Qué series son KODEX y cuáles no.** Aparecieron mezcladas piezas de
   `WENU MAPU`, una revista `RENDAH MAG ISSUE 014` y cursos
   (`SPECULATIVE ARCHITECTS`, `QUANTUM FABRICATOR v.07`).
2. **Si la serie UNIVERSE 01–10 es el índice del sitio**, o si convive con las
   siete escenas ya declaradas. Se parecen pero no son lo mismo.
3. **Qué se hace con los 19 fotográficos** — tratamiento GPU sobre la imagen, o
   fuera del alcance de las láminas.
4. **Si PAGE 04 fija las coordenadas A–Y como canon.** Están dibujadas, pero
   declararlas es del creador.

---

## Nota de método

El catálogo salió de abrir las 50 imágenes, no de leer nombres de archivo. Los
nombres nuevos que puso Ocín hicieron visible la estructura de series; los
viejos eran hashes. Sin ese renombre esto no se encontraba.

El cruce se hizo por **md5**, nunca por nombre: 0 duplicados exactos entre los
58 pósters, y los 8 que ya estaban se identificaron por hash contra
`reference/MANIFEST.json`.
