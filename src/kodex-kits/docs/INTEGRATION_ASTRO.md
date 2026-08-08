# Integración Astro

Copia `public/assets/kodex/crt/` y `src/astro/KodexCrtLayer.astro`. Incluye el CSS global y monta el componente sobre el canvas fuente.

```astro
<link rel="stylesheet" href="/assets/kodex/crt/kodex-crt.css" />
<div class="observe-stage"><canvas id="observe-source"></canvas><KodexCrtLayer sourceSelector="#observe-source" preset="observe" quality="balanced" /></div>
```

El componente destruye el runtime en `astro:before-swap`.
