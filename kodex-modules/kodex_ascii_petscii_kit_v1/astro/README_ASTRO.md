# Integración Astro

1. Copia las carpetas de este directorio dentro de la raíz de tu proyecto Astro.
2. Copia también la carpeta raíz `src/engine`, `src/scenes` y `src/config` del kit a una ubicación equivalente, o ajusta los imports de `mount.ts`.
3. Importa el CSS una vez en tu layout o página:

```astro
---
import "../styles/kodex-ascii.css";
import "../../src/fonts.css";
import KodexAsciiScene from "../components/KodexAsciiScene.astro";
---

<KodexAsciiScene scene="observe" glyphs="kodex" title="THE ARCHIVE WATCHES." />
```

Para KODEX existente, lo más limpio es copiar los módulos compartidos a:

```text
src/lib/kodex-ascii/
```

y adaptar los imports del componente a esa ruta.
