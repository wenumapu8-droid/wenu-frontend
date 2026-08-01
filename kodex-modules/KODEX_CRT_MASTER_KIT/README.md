# KODEX–∞ CRT MASTER KIT

Motor CRT original y reutilizable para Astro, WebGL2, Canvas, imagen y vídeo.

## Contenido

- Runtime WebGL2 sin dependencias.
- Ping-pong persistence / ghost frame.
- Scanlines, fósforo, bloom, aberración, bleed, curvatura, ruido, flicker y vignette.
- Anomalías `tear`, `roll`, `slice`, `burst`.
- 8 presets y 3 perfiles de rendimiento.
- Métricas en `window.__KODEX_CRT_METRICS__`.
- Pausa automática al ocultar la pestaña.
- Fallback CSS y SVG.
- Componente Astro.
- 12 texturas transparentes originales.
- Demo standalone.

No incluye archivos del producto de Steven McFarlane ni material de terceros.

## Demo

```bash
cd KODEX_CRT_MASTER_KIT
python3 -m http.server 8080
```

Abre `http://localhost:8080`.

## Uso

```html
<link rel="stylesheet" href="/assets/kodex/crt/kodex-crt.css">
<script type="module">
  import { mountKodexCrt } from '/assets/kodex/crt/kodex-crt.esm.js';
  const crt = mountKodexCrt({ source:'#source', container:'#scene', preset:'observe', quality:'balanced' });
  crt.setSignalState({ signal:.82, focus:.65 });
  crt.triggerAnomaly('tear', 1, 420);
</script>
```
