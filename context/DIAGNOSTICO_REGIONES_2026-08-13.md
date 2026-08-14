# DIAGNÓSTICO DE REGIONES — 18 láminas (2026-08-13)

Barrido de solo lectura: `comparar-region.mjs <slug> <region>` sobre las 141
regiones definidas en los 9 `regions/<slug>.json` con render disponible.
No se tocó ningún componente.

- **Herramienta:** `scripts/lamina/comparar-region.mjs` (umbral 26, área mín 80).
- **Veredictos:** VACÍA = falta tinta (<60 %) o faltan componentes (>40 %);
  SOBRECARGADA = sobra densidad (>140 %); COMPARABLE = en el rango, es de forma/posición.
- **Puntaje:** `pct` del `score.json` de la lámina (diff pixel + estructural por 8x8).
- **Antigüedad:** fecha `generado` de cada score.json — los renders viejos valen menos.

## Calibración (confirmada)

| Caso | Esperado | Barrido | Resultado |
|------|----------|---------|-----------|
| u10-commons hero-center | VACÍA, 35 comps ref | 35 vs 2 comps, tinta 30212→6996 (−77 %) | ✅ reproducido |
| u10-commons hero-left | ref sin fila ≥150 px continua; render dibuja marcos | 17 vs 0 comps, tinta 28008→7497 (−73 %) | ✅ reproducido |

## Resumen

- **29 VACÍAS** · **6 SOBRECARGADAS** · **106 COMPARABLES**
- La lámina **t01-03-descent-tunnel** concentra la mayoría de las vacías altas
  (12 de 17 celdas de la columna 0x y 2x) — su render es del **08-10**.
- **u10-commons** (render del **08-13**, el más fresco) tiene las 3 vacías
  grandes del héroe, ya reportadas y en curso.

## Orden por rendimiento potencial

**Regla:** VACÍAS con puntaje alto = construir lo que falta = máximo
rendimiento por minuto (el trabajo es añadir, no afinar). COMPARABLES con
puntaje alto = las caras: hay densidad pero descalzada, hay que iterar.

### 1. VACÍAS por puntaje (de mayor rendimiento a menor)

| slug | región | pct | veredicto | comps ref vs render | tinta ref vs render | render
|---|---|---|---|---|---|---|
| t01-03-descent-tunnel | r10c05 | 8.70 | VACÍA | 1 vs 0 | 1963 vs 2665 | 2026-08-10 |
| t01-03-descent-tunnel | r02c03 | 8.40 | VACÍA | 1 vs 0 | 3503 vs 2759 | 2026-08-10 |
| u07-observer | heroe | 7.84 | VACÍA | 68 vs 12 | 72446 vs 65602 | 2026-08-11 |
| t01-03-descent-tunnel | r02c11 | 7.82 | VACÍA | 2 vs 1 | 2366 vs 1418 | 2026-08-10 |
| t01-03-descent-tunnel | r09c03 | 7.12 | VACÍA | 3 vs 0 | 3783 vs 3870 | 2026-08-10 |
| t01-03-descent-tunnel | r09c05 | 6.88 | VACÍA | 4 vs 1 | 4824 vs 5376 | 2026-08-10 |
| t01-03-descent-tunnel | r03c06 | 6.79 | VACÍA | 1 vs 0 | 3326 vs 2990 | 2026-08-10 |
| t01-03-descent-tunnel | r02c13 | 6.65 | VACÍA | 1 vs 0 | 1781 vs 1214 | 2026-08-10 |
| t01-03-descent-tunnel | r02c09 | 6.61 | VACÍA | 3 vs 1 | 2123 vs 1469 | 2026-08-10 |
| t01-03-descent-tunnel | r14c03 | 6.44 | VACÍA | 1 vs 0 | 3964 vs 2553 | 2026-08-10 |
| t01-03-descent-tunnel | r07c13 | 5.37 | VACÍA | 2 vs 0 | 2112 vs 1794 | 2026-08-10 |
| u10-commons | hero-center | 5.35 | VACÍA | 35 vs 2 | 30212 vs 6996 | 2026-08-14 |
| t01-03-descent-tunnel | r09c11 | 5.19 | VACÍA | 3 vs 0 | 3446 vs 2753 | 2026-08-10 |
| u09-source | tabla-cabeza | 4.64 | VACÍA | 2 vs 1 | 2829 vs 2969 | 2026-08-11 |
| u10-commons | hero-left | 4.29 | VACÍA | 17 vs 0 | 28008 vs 7497 | 2026-08-14 |
| u07-observer | der-cambio | 3.96 | VACÍA | 3 vs 1 | 2412 vs 2456 | 2026-08-11 |
| u04-alphabet | network-metrics | 3.96 | VACÍA | 2 vs 1 | 3884 vs 4777 | 2026-08-11 |
| u10-commons | hero-right | 3.90 | VACÍA | 21 vs 2 | 26682 vs 5602 | 2026-08-14 |
| u06-memory | trace | 3.67 | VACÍA | 2 vs 1 | 2395 vs 2265 | 2026-08-11 |
| u06-memory | version | 3.51 | VACÍA | 1 vs 0 | 2864 vs 2249 | 2026-08-11 |
| t01-03-descent-tunnel | r15c13 | 3.40 | VACÍA | 3 vs 0 | 1264 vs 1041 | 2026-08-10 |
| u01-origin-field | bajada | 3.28 | VACÍA | 1 vs 0 | 2170 vs 2116 | 2026-08-12 |
| u06-memory | erosion-der | 3.01 | VACÍA | 1 vs 0 | 2276 vs 2179 | 2026-08-11 |
| u04-alphabet | hero-alto | 2.95 | VACÍA | 8 vs 4 | 5563 vs 4401 | 2026-08-11 |
| u01-origin-field | panel-diag | 2.40 | VACÍA | 1 vs 0 | 2829 vs 2805 | 2026-08-12 |
| u10-commons | pie | 2.15 | VACÍA | 3 vs 1 | 3341 vs 1698 | 2026-08-14 |
| u01-origin-field | cabecera | 1.52 | VACÍA | 5 vs 3 | 3254 vs 1673 | 2026-08-12 |
| u05-genesis | pie | 1.45 | VACÍA | 2 vs 1 | 2934 vs 2960 | 2026-08-13 |
| u09-source | riel-der | 0.24 | VACÍA | 3 vs 0 | 1180 vs 222 | 2026-08-11 |

### 2. COMPARABLES de puntaje alto (las caras — densidad hay, forma/posición no)

| slug | región | pct | veredicto | comps ref vs render | tinta ref vs render | render
|---|---|---|---|---|---|---|
| t01-03-descent-tunnel | r07c09 | 13.32 | COMPARABLE | 0 vs 0 | 3518 vs 3774 | 2026-08-10 |
| u04-alphabet | nodo-M | 12.94 | COMPARABLE | 3 vs 4 | 12354 vs 15867 | 2026-08-11 |
| u01-origin-field | campo-nucleo | 10.22 | COMPARABLE | 19 vs 23 | 16932 vs 14837 | 2026-08-12 |
| u06-memory | hero | 8.58 | COMPARABLE | 22 vs 17 | 37653 vs 46776 | 2026-08-11 |
| t01-03-descent-tunnel | r07c06 | 8.53 | COMPARABLE | 0 vs 1 | 2648 vs 3448 | 2026-08-10 |
| u01-origin-field | titulo | 8.06 | COMPARABLE | 19 vs 19 | 11970 vs 10629 | 2026-08-12 |
| t01-08-signal-bloom | r02c02 | 8.03 | COMPARABLE | 6 vs 16 | 8647 vs 9596 | 2026-08-10 |
| t01-08-signal-bloom | r02c04 | 7.89 | COMPARABLE | 4 vs 21 | 8625 vs 8744 | 2026-08-10 |
| t01-03-descent-tunnel | r07c05 | 7.86 | COMPARABLE | 1 vs 1 | 2997 vs 3975 | 2026-08-10 |
| t01-03-descent-tunnel | r03c13 | 7.69 | COMPARABLE | 1 vs 2 | 2195 vs 1460 | 2026-08-10 |
| t01-03-descent-tunnel | r10c11 | 7.58 | COMPARABLE | 0 vs 3 | 2893 vs 3053 | 2026-08-10 |
| t01-03-descent-tunnel | r07c03 | 7.56 | COMPARABLE | 0 vs 0 | 2793 vs 2379 | 2026-08-10 |
| t01-03-descent-tunnel | r03c03 | 7.51 | COMPARABLE | 6 vs 7 | 3019 vs 2500 | 2026-08-10 |
| t01-08-signal-bloom | r02c08 | 7.26 | COMPARABLE | 19 vs 29 | 25539 vs 26065 | 2026-08-10 |
| t01-03-descent-tunnel | r03c11 | 7.03 | COMPARABLE | 1 vs 2 | 1779 vs 1276 | 2026-08-10 |
| t01-03-descent-tunnel | r09c06 | 6.90 | COMPARABLE | 0 vs 1 | 3775 vs 4048 | 2026-08-10 |
| t01-03-descent-tunnel | r07c11 | 6.88 | COMPARABLE | 0 vs 0 | 1448 vs 1278 | 2026-08-10 |
| t01-03-descent-tunnel | r14c11 | 6.79 | COMPARABLE | 1 vs 3 | 3590 vs 3458 | 2026-08-10 |
| t01-03-descent-tunnel | r03c09 | 6.78 | COMPARABLE | 2 vs 2 | 2190 vs 1653 | 2026-08-10 |
| t01-03-descent-tunnel | r14c13 | 6.72 | COMPARABLE | 4 vs 6 | 2556 vs 3264 | 2026-08-10 |
| t01-03-descent-tunnel | r03c05 | 6.46 | COMPARABLE | 0 vs 0 | 3900 vs 3483 | 2026-08-10 |
| u01-origin-field | rot-sup-der | 6.43 | COMPARABLE | 0 vs 0 | 1634 vs 1752 | 2026-08-12 |
| u04-alphabet | hero-medio | 6.40 | COMPARABLE | 17 vs 14 | 19316 vs 19826 | 2026-08-11 |
| t01-08-signal-bloom | r00c02 | 6.20 | COMPARABLE | 4 vs 9 | 6055 vs 5320 | 2026-08-10 |
| t01-03-descent-tunnel | r10c09 | 6.17 | COMPARABLE | 0 vs 0 | 1301 vs 1300 | 2026-08-10 |

### 3. SOBRECARGADAS (sobra densidad — hay que quitar, no mover)

| slug | región | pct | veredicto | comps ref vs render | tinta ref vs render | render
|---|---|---|---|---|---|---|
| t01-03-descent-tunnel | r10c06 | 7.34 | SOBRECARGADA | 0 vs 0 | 1230 vs 2284 | 2026-08-10 |
| u01-origin-field | entry-vector | 2.50 | SOBRECARGADA | 1 vs 1 | 1352 vs 2168 | 2026-08-12 |
| u07-observer | pie | 1.49 | SOBRECARGADA | 7 vs 9 | 6182 vs 9848 | 2026-08-11 |
| t01-03-descent-tunnel | r15c06 | 1.45 | SOBRECARGADA | 0 vs 0 | 728 vs 1085 | 2026-08-10 |
| u06-memory | pie | 1.44 | SOBRECARGADA | 3 vs 3 | 3463 vs 5726 | 2026-08-11 |
| t01-03-descent-tunnel | r15c05 | 0.80 | SOBRECARGADA | 0 vs 0 | 363 vs 854 | 2026-08-10 |

## Nota de antigüedad

Las fechas de la columna "render" son el `generado` de cada `score.json` en
**UTC**. En hora local (12/08 madrugada del barrido):

- **t01-03, t01-08, u04, u05, u06, u07, u09:** renders de las noches del
  09–11/08 (2–3 días) — los veredictos sirven de orden, no de golpe fino;
  regenerar con `node scripts/lamina/iterate.mjs <slug>` antes de trabajar.
- **u01-origin-field:** render del 12/08 (noche previa) — casi vigente.
- **u10-commons** (`2026-08-14T04:59Z`): render de esta madrugada, el más
  fresco — los 5 veredictos son vigentes.
