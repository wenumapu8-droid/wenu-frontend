# KODEX–∞ / GIPHY 300 CURATOR

Este ZIP no contiene 300 GIF copiados ni raspados de GIPHY. Contiene una herramienta local que usa la API oficial para buscar, revisar y exportar **hasta 300 stickers transparentes** orientados al universo KODEX.

## Qué incluye

- 72 búsquedas curadas para KODEX.
- Categorías: Cosmos, Observe, System, Biocyber, Alien/Ritual, Techno y Pixel/ASCII.
- Asociación por escena: Threshold, Prologue, Descent, Archive, Machine, Cosmology y Return.
- Vista previa sobre fondo negro, blanco y checker para detectar falsos transparentes.
- Selección manual.
- Exportación JSON y CSV.
- IDs, página GIPHY, autor/fuente, rating, medidas, roles y rendiciones.
- Componentes de integración para Astro/KODEX.
- 25 IDs semilla visibles en `giphy.com/explore/png`, marcados como no curados.

## Uso

1. Crea una API key beta en el panel de desarrolladores de GIPHY.
2. Descomprime el ZIP.
3. Desde la carpeta ejecuta:

```bash
python3 -m http.server 8080
```

4. Abre:

```text
http://localhost:8080
```

5. Pega la API key.
6. Pulsa `FETCH 300`.
7. Cambia el fondo para comprobar transparencia.
8. Selecciona solo piezas que realmente respeten la dirección de arte KODEX.
9. Exporta el manifiesto.

## Regla de selección KODEX

No uses 300 elementos en producción. El buscador entrega 300 candidatos para terminar con:

- 12–18 elementos hero.
- 25–40 micrográficos animados.
- 12 transiciones.
- 20 specimens de Archive.
- 8–14 anomalías/glitches.
- 7 símbolos primarios, uno por escena.
- 30–50 piezas secundarias como máximo.

El resto queda como biblioteca de referencia. Meter los 300 a la vez convertiría el archivo vivo en un casino interdimensional.

## Rendimiento

- Usa WEBP para stickers cuando esté disponible.
- Preview: `fixed_height.webp`.
- Hero seleccionado: `original.webp`.
- No ejecutes más de 3–5 stickers simultáneos en mobile.
- Pausa animaciones fuera de viewport.
- Evita assets hero mayores a 2 MB.
- Mantén fallback SVG/GLSL propio para elementos esenciales.

## Producción

El manifiesto guarda IDs y URLs de la sesión. Para producción, vuelve a consultar los IDs mediante la API y no reescribas las URLs entregadas por GIPHY.
