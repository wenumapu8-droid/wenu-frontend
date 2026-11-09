# KODEX−∞ ASCII / PETSCII GENERATIVE KIT v1

Kit ejecutable para producir visuales ASCII, PETSCII y micrográficos procedurales dentro del universo KODEX.

## Qué incluye

- Motor Canvas 2D sin dependencias.
- Cuatro escenas generativas:
  - OBSERVE: ojo / archivo observador.
  - DESCENT: túnel de profundidad.
  - COSMOLOGY: órbitas y campo estelar.
  - SIGNAL: onda, interferencia y ruido.
- Cuatro alfabetos visuales:
  - KODEX.
  - ASCII.
  - PETSCII.
  - BLOCKS.
- Interacción por mouse, touch y teclado.
- Sistema de color por escena.
- HUD con códigos, estado, checksum, barcode y micrográficos.
- Perfil responsive para desktop y móvil.
- `prefers-reduced-motion`.
- Integración base para Astro.
- Fuentes listas mediante CSS remoto, sin archivos binarios.

## Ejecutar sin instalar nada

Desde la carpeta del kit:

```bash
python3 -m http.server 8080
```

Abre:

```text
http://localhost:8080
```

También puedes usar cualquier servidor estático.

## Controles

- `1–4`: cambia de escena.
- `R`: regenera la señal.
- `Espacio`: activa o libera el estado OBSERVING.
- Botones `KDX / ASCII / PETSCII / BLOCK`: cambian el alfabeto.
- Pointer/touch: desplaza el centro del campo.

## API global del demo

```js
window.KODEX_ASCII.setScene("descent");
window.KODEX_ASCII.setGlyphSet("petscii");
window.KODEX_ASCII.renderer.randomize();
window.KODEX_ASCII.getMetrics();
```

## Personalización rápida

### Cambiar símbolos

Edita:

```text
src/config/glyph-sets.js
```

Ejemplo:

```js
kodex: "  ·:;+=xX#%@◉◎◇◆⊙⊗∞⌁⌬⌾"
```

### Cambiar colores

Edita:

```text
src/config/palettes.js
```

### Crear una escena nueva

1. Duplica uno de los archivos en `src/scenes/`.
2. Implementa una función `field(x, y, t, pointer, seed)` que retorne un valor entre `0` y `1`.
3. Registra la escena en `src/scenes/index.js`.
4. Agrega su botón a `index.html`.

Contrato:

```js
export const miEscena = {
  id: "mi-escena",
  index: 5,
  title: "TITLE",
  kicker: "05 · PROTOCOL",
  body: "COPY",
  command: "ACTIVATE",
  message: "HIDDEN MESSAGE",
  field(x, y, t, pointer, seed) {
    return 0.5;
  },
};
```

## Fuentes

`src/fonts.css` carga:

- Chakra Petch: display y titulares.
- IBM Plex Mono: datos y sistema.
- Share Tech Mono: señal y glifos.

El kit no contiene archivos `.ttf`, `.otf` ni `.woff`. Si el sitio debe funcionar completamente offline, descarga y aloja tú mismo tipografías con licencia compatible y reemplaza el `@import` por tus propios `@font-face`.

## Integración con KODEX / Astro

Revisa:

```text
astro/README_ASTRO.md
```

La recomendación para el proyecto real es instalar el motor dentro de:

```text
src/lib/kodex-ascii/
```

y usar una instancia por escena. No conviertas todo el sitio a ASCII: úsalo como protocolo visual, modo de lectura y capa de señal.
