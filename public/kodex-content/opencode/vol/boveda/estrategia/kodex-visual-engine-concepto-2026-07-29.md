---
tipo: estrategia-concepto
proyecto: KODEX −∞
fecha: 2026-07-29
foco: KODEX Visual Engine — gramática audiovisual paramétrica + integración del libro
estado: north-star técnico (después de terminar el sitio KODEX)
---

# KODEX Visual Engine — la obra como tecnología creativa

> Idea de Ocin (2026-07-29, disparada desde KodeLife). KODEX no es una colección de efectos: es
> un **motor que traduce una identidad artística en comportamiento visual programable.** La obra
> deja de ser algo que se mira → se vuelve un medio, un instrumento y una tecnología propia.

## La fórmula

`OBRA/SÍMBOLO/IMAGEN + COMPORTAMIENTO (respirar·crecer·observar·fracturar·orbitar·recordar) +
TRATAMIENTO (dither·CRT·bitmap·feedback·glitch·color) + ENTRADAS (tiempo·cursor·touch·audio·cámara·datos)
= UNIVERSO VISUAL VIVO`

El estilo no queda pegado a una ilustración — se vuelve **parámetros (una receta)**. Cambiás la
receta y nace otro organismo:
```json
{ "source":"observation-eye", "behavior":["observe","pulse","remember"],
  "treatment":["violet","crt","feedback"], "interaction":["pointer","audio"], "intensity":0.72 }
```
```json
{ "source":"archive-tree", "behavior":["grow","transmit","restore"],
  "treatment":["acid-green","bitmap","scan"], "interaction":["touch","bass"], "intensity":0.58 }
```

## Hito concreto: KODEX Visual Engine v1 (3 prototipos que comparten UN motor GLSL/WebGL)

1. **KDX_THRESHOLD_PORTAL** — respira, recuerda y se abre (violet, feedback). → escena THRESHOLD.
2. **KDX_OBSERVATION_EYE** — detecta, sigue y escanea (cyan/violet, crt). → escena PROLOGUE (el ojo).
3. **KDX_ARCHIVE_TREE** — crece, conecta y transmite (acid-green, bitmap). → escena RETURN (el árbol).

Cuando los 3 corran sobre el mismo shader parametrizado por uniforms (source + behavior + treatment
+ inputs), queda demostrado que KODEX es una **gramática reutilizable**. Pipeline: prototipar en
**KodeLife** (Metal/GLSL real-time) → portar a la web con **OGL/WebGL** (liviano, ya elegido) →
manejar por la receta JSON. Mismos motivos del pack SVG (eye/tree/portal) como source textures.

## Qué desbloquea (sin partir de cero cada vez)

KODEX retrofuturista · universo orgánico (raíces/hongos/redes neuronales) · sistemas alienígenas/
cosmológicos · visuales reactivos techno/psytrance · instalaciones y proyecciones de escenario ·
portales WebAR/reliquias digitales · interfaces para obras/NFT/dossiers · **identidades visuales
generativas para otros artistas/marcas** (= Commission a System, alto ticket).

## Integración del libro (Codex Estelar) en el universo codificado

El libro (4 libros, ~40 capítulos: Génesis, Nibiru, Templos, ADN Sagrado) = **la narrativa y el
banco de "sources".** Cada concepto/capítulo se mapea a una RECETA → un organismo visual vivo:
- "El Portal del Corazón" → THRESHOLD_PORTAL (breathe/remember/open · violet · feedback).
- "El ADN Sagrado / árbol de luz" → ARCHIVE_TREE (grow/transmit/restore · acid · bitmap).
- "El ojo / observación / los que ven" → OBSERVATION_EYE (observe/scan · cyan · crt).
- "Geometría Sagrada / Merkabah" → un organismo de simetría/rotación (orbit · dither).
Resultado: el libro se vuelve un **CODEX VIVO** — texto + un organismo generativo por capítulo.

**Formas de producto** (activos de la línea digital):
- Web "living codex" — cada capítulo una escena con su organismo reactivo.
- Codex ilustrado / ebook / print — stills renderizados del motor por capítulo.
- **NFT/ediciones** — cada organismo (o su seed) minteado como pieza.
- **El motor mismo** como servicio (Commission): generar identidades vivas para músicos/marcas.

**Ética Hidden Sky (dura):** el Codex Estelar es la capa de FICCIÓN esotérica (Nibiru/Arcontes/
Elohim). Como universo codificado es arte/ficción — perfecto. Mantener SIEMPRE etiquetado y
separado de la cosmovisión mapuche documentada; nunca presentarlo como verdad cultural.

## Sequencing (asesor)

Es el north-star técnico y el mayor salto (la obra → tecnología). PERO es un build grande. Orden:
1. Terminar el sitio KODEX actual (el contenedor/vitrina) — en curso, casi listo.
2. Recién ahí, KODEX Visual Engine v1 (los 3 prototipos sobre un shader compartido).
3. El "living codex" del libro sobre ese motor.
No dejar que el engine frene el lanzamiento del sitio. Prototipar en KodeLife en paralelo, sin presión.

## Herramienta
**KodeLife** (Hexler) — IDE de shaders real-time (Metal/GLSL/HLSL), ideal para prototipar los
organismos antes de portar a WebGL. https://hexler.net/kodelife
