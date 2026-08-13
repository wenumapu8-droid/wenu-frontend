# Reporte de Verificación de Muestra — Triaje Visual (13 de Agosto, 2026)

## Resumen Ejecutivo

Se realizó una auditoría visual directa sobre **35 piezas** extraídas del balde `OCIN_ART` de `ops/triage/TRIAGE-visual-clasificacion.csv` para validar la fiabilidad de la clasificación automatizada.

### ⚠️ Hallazgo Principal — Error Sistemático Confirmado

La clasificación automatizada basada en hashing (`dhash`) y relación de aspecto **cometió un error sistemático severo**, absorbiendo masivamente fotografías de productos de joyería (aros, piercings, anillos Wenu Mapu sobre fondos neutros u oscuros) dentro del balde `OCIN_ART`.

Esto explica la discrepancia masiva observada:
- **Resultado del Script Automático:** `OCIN_ART: 420` · `DESCARTE_TERCEROS: 42` · `PRODUCTO: 8`
- **Conteo de la Revisión Humana Previa:** `ARTE: 107` · `PRODUCTO: 247` · `BASURA: 85` · `AJENO: 31`

---

## Estadísticas de la Muestra de 35 Piezas

| Diagnóstico | Cantidad | Porcentaje |
|---|---|---|
| ✅ **Arte de Ocín Confirmado** | 9 | 25.7% |
| ❌ **Falso Positivo: Foto de Producto / Joyería** | 25 | 71.4% |
| ❌ **Falso Positivo: Poster / Referencia de Terceros** | 1 | 2.9% |

**Tasa Total de Falsos Positivos en `OCIN_ART`:** **74.3%**

---

## Detalle de las 35 Piezas Auditadas

| N° | Specimen ID | Dimensiones | Tamaño | Confianza CSV | Veredicto Visual Auditado |
|---|---|---|---|---|---|
| 1 | `spec-c155be92-51068` | 399x501 | 29.4 KB | 0.8 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 2 | `spec-efd1ed32-55046` | 1080x1320 | 107.0 KB | 0.8 | ❌ Falso Positivo — Poster de Terceros / Editorial Pinterest |
| 3 | `spec-f0d5c444-51162` | 1079x867 | 25.4 KB | 0.8 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 4 | `spec-02a52eb7-9856` | 1800x1800 | 230.4 KB | 0.81 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 5 | `spec-05dcc87f-39407` | 1800x1192 | 100.1 KB | 0.81 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 6 | `spec-1cf20a1e-9644` | 1800x1800 | 77.0 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 7 | `spec-2695ce19-9834` | 1800x1800 | 103.0 KB | 0.81 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 8 | `spec-2a944ab8-50474` | 400x400 | 5.2 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 9 | `spec-2eed5949-39434` | 1800x2718 | 55.5 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 10 | `spec-3538aa57-39406` | 1800x1192 | 27.2 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 11 | `spec-36205323-52290` | 990x661 | 16.4 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 12 | `spec-3ad1cd1d-39415` | 1800x1192 | 15.7 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 13 | `spec-4221a24c-46687` | 1800x2400 | 107.3 KB | 0.81 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 14 | `spec-5ccb3b68-9836` | 1800x1800 | 72.2 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 15 | `spec-6e4217fb-46811` | 1800x2400 | 67.3 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 16 | `spec-79189d85-39414` | 1800x2718 | 144.6 KB | 0.81 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 17 | `spec-7bfd42f4-39381` | 1800x1192 | 59.1 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 18 | `spec-7f976155-39385` | 1800x1192 | 32.3 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 19 | `spec-82670b9a-39407` | 1800x1192 | 84.9 KB | 0.81 | ❌ Falso Positivo — Foto de producto / aros (baja resolución sobre fondo neutro) |
| 20 | `spec-86682f67-46693` | 1800x2400 | 76.2 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 21 | `spec-a23b8dea-50292` | 1202x1800 | 62.9 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 22 | `spec-b7fe8bd3-39414` | 1800x2718 | 144.6 KB | 0.81 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 23 | `spec-c50121a9-52290` | 990x661 | 16.4 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 24 | `spec-949c5d43-46740` | 1800x2400 | 66.3 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 25 | `spec-c8f69c04-39406` | 1800x1192 | 27.2 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 26 | `spec-efaeccec-39423` | 1800x1192 | 38.7 KB | 0.81 | ❌ Falso Positivo — Foto de Producto / Joyería Wenu Mapu |
| 27 | `spec-16a40acf-39425` | 1800x2718 | 119.3 KB | 0.83 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 28 | `spec-20c80c1c-39379` | 1800x2718 | 339.5 KB | 0.83 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 29 | `spec-2cc2e138-46718` | 1800x2400 | 100.0 KB | 0.83 | ✅ Arte de Ocín Confirmado (geometría sagrada / greca) |
| 30 | `spec-3971e8d2-46791` | 1800x2400 | 62.1 KB | 0.83 | ❌ Falso Positivo — Foto de producto / aros (baja resolución sobre fondo neutro) |
| 31 | `spec-41f3632a-39405` | 1800x1192 | 49.5 KB | 0.83 | ❌ Falso Positivo — Foto de producto / aros (baja resolución sobre fondo neutro) |
| 32 | `spec-5b02c953-39405` | 1800x1192 | 49.5 KB | 0.83 | ❌ Falso Positivo — Foto de producto / aros (baja resolución sobre fondo neutro) |
| 33 | `spec-648867e9-39380` | 1800x1192 | 29.4 KB | 0.83 | ❌ Falso Positivo — Foto de producto / aros (baja resolución sobre fondo neutro) |
| 34 | `spec-8088af41-39405` | 1800x1192 | 49.5 KB | 0.83 | ❌ Falso Positivo — Foto de producto / aros (baja resolución sobre fondo neutro) |
| 35 | `spec-cca61252-39380` | 1800x1192 | 29.4 KB | 0.83 | ❌ Falso Positivo — Foto de producto / aros (baja resolución sobre fondo neutro) |

---

## Conclusiones y Recomendación Final para Ocín

1. **No confiar en el CSV consolidado actual (`TRIAGE-visual-clasificacion.csv`):** Contiene cerca de ~240 fotos de catálogo de joyería de Wenu Mapu clasificadas erróneamente como arte de Ocín.
2. **El CSV grande se mantiene intacto en Git por ahora** (no ha sido sobrescrito en esta corrida de verificación).
3. **Decisión para mañana:** Re-ajustar el clasificador con un detector visual específico de superficie de catálogo / fotos de aros (o realizar la revisión manual de los candidatos) para alinear la clasificación con los números humanos reales (`~107` obras de arte auténticas).