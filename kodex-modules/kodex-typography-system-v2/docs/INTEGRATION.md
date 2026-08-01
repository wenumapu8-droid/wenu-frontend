# Integración con KODEX Design System Pack V1

## Reemplazo

Sustituir:

```text
tokens/kdx.typography.css
```

por:

```text
patch/kdx.typography.css
```

## Añadir

```text
fonts/kdx.font-manifest.json
tokens/kdx.typography.tokens.json
runtime/kdx-font-loader.ts
astro/KdxTypographyProvider.astro
```

## Ejemplo Astro

```astro
---
import KdxTypographyProvider
  from "./KdxTypographyProvider.astro";
---

<KdxTypographyProvider bundle="threshold_error">
  <section data-kdx-theme="threshold">
    <p class="kdx-type-label">AUTH / NODE 03</p>
    <h1 class="kdx-type-poster-xl kdx-type-distressed">
      ACCESS DENIED
    </h1>
    <pre class="kdx-type-terminal">
      [ ERROR ] IDENTITY MODULE FAILED
    </pre>
  </section>
</KdxTypographyProvider>
```

## Regla

El bundle corresponde a la escena, no al componente individual. No cargar
un nuevo stylesheet cada vez que aparece un label.
