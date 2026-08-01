# FUENTE CURADA · OCÍN — ARTE DIGITAL RITUAL (volumen-libro · obra de autor)

> Autoría: COWORK. Este es el LIBRO ILUSTRADO de Ocin — su monografía de arte. Es una pieza central del ARCHIVE, no un volumen menor. mini: construir un **visor-libro paginado** (ver spec abajo). opencode: extraer las páginas a webp para el visor.

- **slug:** `ocin-arte-digital-ritual`
- **tipo:** libro / monografía ilustrada (volumen-libro)
- **registro:** documentado *(obra real de autor)*
- **categoría:** memory layer / ritual tech
- **paleta:** propia del libro — azul índigo profundo + oro ritual (NO los neones cyber, NO dither). Es obra terminada de Ocin: va LIMPIA.
- **fuente PDF:** `public/kodex-content/books/ocin-arte-digital-ritual.pdf` (210 páginas, 21MB)
- **portada:** `public/kodex-content/books/ocin-cover.jpg`
- **autor:** OCÍN — firma de artista **"Serpiente Espectral Roja"** (kin maya / Dreamspell; resuena con filu, la serpiente).

## Título
- **ES:** OCÍN — Arte Digital Ritual
- **EN:** OCÍN — Ritual Digital Art

## Curaduría (ES)
Monografía de la obra digital-ritual de Ocín, firmada como Serpiente Espectral Roja. 210 láminas que reúnen su geometría sagrada, sus arquitecturas tecno-tribales y sus visiones. Es el cuerpo de obra hecho libro: el archivo que recuerda. Dentro de KODEX funciona como la cámara más profunda del ARCHIVE — no se hojea al pasar, se entra a leer.

## Curaduría (EN)
A monograph of Ocín's ritual-digital work, signed Serpiente Espectral Roja. 210 plates gathering his sacred geometry, techno-tribal architectures and visions. It is the body of work made book: the archive that remembers. Inside KODEX it is the deepest chamber of the ARCHIVE — not skimmed in passing, but entered to read.

## Integración (spec para el mini)
Construir un **visor-libro** como volumen dentro del ARCHIVE:
- Paginado **spread por spread**, SIN scroll (fiel al canon KODEX). Navegación por flechas / teclado / swipe en móvil, con barra de progreso (página X / 210).
- Renderizar cada página como imagen (webp de opencode) sobre lienzo oscuro; la portada `ocin-cover.jpg` como tapa. Transición de página suave (fade/turn), respetando reduced-motion.
- Chrome mínimo de dossier alrededor (título, autor "Serpiente Espectral Roja", página, sello), sin tapar la lámina.
- La obra va **limpia**: sin dither, sin glitch, sin FX sobre las páginas. El marco KODEX la enmarca; no la interviene.
- Enlace destacado desde el ARCHIVE (03) y desde RETURN (el libro como "lo que permanece"). Botón de descarga opcional del PDF (edición) → conecta con el modelo COLLECT.
- Fallback sin JS: link directo al PDF.

## opencode
- Extraer las 210 páginas del PDF a `public/kodex-content/books/ocin/pages/NNN.webp` (downsized, ~1400px de alto, calidad ~80). Generar un `index.json` con el orden y la cantidad.
- No aplicar efectos. Registrar el volumen en el manifest con estos metadatos.

## Resonancias
- Es la contraparte **de autor/real** del Codex Estelar (ficción): mismo universo visual, pero este es la OBRA firmada, no el lore. Mantener registros distintos.
- Resuena con `archive-tree` (el cuerpo de obra = memoria) y con RETURN ("el patrón permanece").
- La firma Serpiente Espectral Roja ata con el volumen documentado de **animales de poder / filu** (la serpiente), en registro mapuche — pero SOLO como eco simbólico, sin fundir registros.
