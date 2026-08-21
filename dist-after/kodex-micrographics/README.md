# KODEX Micrographics Kit v1

Biblioteca original de micrográficos vectoriales inspirada en interfaces técnicas, archivos retrofuturistas y sistemas de señal. No replica el pack comercial de referencia: traduce su lógica visual a un lenguaje propio de KODEX.

## Incluye

- 23 símbolos SVG reutilizables.
- Sprite externo: `public/assets/kodex/kodex-micrographics.svg`.
- Registro TypeScript con categorías y motion defaults.
- Componente Astro `KodexGlyph.astro`.
- Componente de composición `KodexMicroCluster.astro`.
- CSS con motion, tonos semánticos y `prefers-reduced-motion`.
- Demo standalone.

## Instalación en tu proyecto Astro

Copia cada carpeta respetando la estructura.

Importa los estilos globales en tu layout o página KODEX:

```astro
---
import '../../styles/kodex-micrographics.css';
import KodexGlyph from '../../components/kodex/KodexGlyph.astro';
---

<KodexGlyph name="radar" tone="violet" motion="auto" size={96} label="Radar de observación activo" />
```

## Composición de panel

```astro
---
import KodexMicroCluster from '../../components/kodex/KodexMicroCluster.astro';
---

<KodexMicroCluster
  title="OBSERVATION_PROTOCOL"
  status="SCANNING"
  code="KDX://OBSERVE/001"
  tone="violet"
  items={[
    { glyph: 'radar', label: 'RELATIONAL FIELD', value: '98.7%' },
    { glyph: 'waveform', label: 'SIGNAL BAND', value: '7.83 MHz' },
    { glyph: 'nodeRing', label: 'NODE ARRAY', value: '08 ACTIVE' },
    { glyph: 'checksumGrid', label: 'CHECKSUM', value: '8F21-A90C' },
  ]}
/>
```

## Regla de uso KODEX

- 1 micrográfico dominante por módulo.
- 2–4 secundarios como información, nunca decoración aleatoria.
- Solo un motion protagonista al mismo tiempo.
- Los símbolos deben representar estado o función: scan, target, archive, signal, verify, network.
- El color depende del estado de la escena, no del gusto del momento.

## Próxima expansión recomendada

- `v2`: status strips, barcodes, side rails y diagramas de metadata.
- `v3`: versiones GLSL/SDF de radar, orbit, crosshair y dot matrix.
- `v4`: generador procedural que combine símbolos desde una seed KDX.
