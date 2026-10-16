# Motion graphics por código

Motion para redes sin IA generativa: cada frame es una función pura de `t`,
renderizada en Canvas por Chromium headless y encodeada con ffmpeg.

Por qué así y no con un generador de video:

- **Determinista.** Mismo input, mismo output, siempre. Reproducible y versionable.
- **Nítido.** Vectores y tipografía real a 1080px, sin artefactos de difusión.
- **En marca.** Usa los tokens de `src/styles/tokens.css` y las fuentes de `@fontsource`,
  las mismas que el sitio. No "se parece" a la marca: es la marca.
- **Gratis.** Sin créditos, sin API. ~70s de render por pieza de 6s en esta máquina.

## Uso

```bash
node scripts/motion/render.mjs tune-in                  # MP4 1080×1920 @30fps
node scripts/motion/render.mjs tune-in --format square  # 1080×1080
node scripts/motion/render.mjs tune-in --fps 60 --dur 8
node scripts/motion/render.mjs tune-in --still 3.1      # un PNG en t=3.1s
```

Salida en `dist-motion/` (ignorado por git — son artefactos, se regeneran).

Formatos: `reel` 1080×1920 (default, IG Reels/TikTok/Shorts) · `square` 1080×1080 ·
`post` 1080×1350 · `wide` 1920×1080.

Iterá siempre con `--still` antes de encodear: un PNG tarda 2s, el video 70s.

## Escribir una escena

Una escena es un HTML en `scripts/motion/scenes/<nombre>.html` que expone:

```js
window.SCENE       = { duration: 6, fps: 30, width: 1080, height: 1920 };
window.resizeScene = (w, h) => { /* ajustar canvas */ };
window.renderFrame = (t) => { /* dibujar el frame del segundo t */ };
```

Reglas que no son opcionales:

1. **Nada de `requestAnimationFrame` ni animaciones CSS.** El renderer llama
   `renderFrame(t)` y screenshotea; cualquier cosa atada al reloj real sale mal.
2. **Nada de `Math.random()` sin seed.** Usá un PRNG determinista (ver `mulberry32`),
   o el grano titila distinto en cada render.
3. **`ctx.globalAlpha` no es multiplicativo.** Asignarlo dentro de un `save()`
   *reemplaza* el alpha del contexto padre, no lo compone. Si una función de dibujo
   tiene que respetar un fade exterior, pasale el multiplicador como parámetro.
4. **Esperá las fuentes.** Exponé `window.renderFrame` recién después de
   `document.fonts.ready`, o los primeros frames salen con fuente de fallback.

## Escenas

| Escena | Duración | Qué es |
|---|---|---|
| `tune-in` | 6s | Constelación + rombo escalonado (ñimin) + manifiesto "Geometry borrowed from the sky" → remate "TUNE IN". |
