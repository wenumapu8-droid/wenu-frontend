# KODEX Typography System V2

## Decisión central

Las referencias no usan una sola “tipografía futurista”. Utilizan una
orquestación de roles:

```text
CONDENSED DISPLAY
+ TECH DISPLAY
+ UI SANS
+ DATA MONO
+ TERMINAL MONO
+ EDITORIAL SERIF
+ SVG GLYPHS
```

No todas se cargan a la vez.

## Sistema recomendado

### Core global

1. **Barlow Condensed**
   - Titulares monumentales y comandos.
   - Pesos 600–900.
   - Reemplaza la serif gigante que estaba debilitando `Breathing Geometries`.

2. **Inter Tight**
   - Navegación, botones, paneles y texto breve.
   - Pesos 400–700.

3. **IBM Plex Mono**
   - Datos, coordenadas, IDs, telemetría y microcopy.
   - Pesos 400–600.

### Scene-specific

4. **Oxanium**
   - Machine, portal y cosmology.
   - No usar en todos los títulos.

5. **Azeret Mono**
   - Access denied, authentication y error terminal.

6. **Bodoni Moda**
   - Ghost Hardware, escenas poéticas y rituales.
   - Es un contraste deliberado, no el tono global.

7. **Libre Baskerville**
   - Manifiesto, archivo largo, referencias y lectura editorial.

8. **KODEX Glyph SVG Registry**
   - Runas, sigilos y símbolos.
   - No convertirlos en una fuente de texto ni ocultar labels accesibles.

## Escala fluida

| Token | Min | Preferred | Max | Leading | Tracking |
|---|---:|---:|---:|---:|---:|
| Poster XXL | 68px | 13vw | 190px | .76 | -.052em |
| Poster XL | 56px | 9.5vw | 148px | .80 | -.045em |
| Hero | 44px | 7.4vw | 116px | .84 | -.038em |
| Tech Hero | 38px | 5.5vw | 84px | .90 | .025em |
| Editorial Hero | 42px | 6vw | 96px | .94 | -.026em |
| Section | 28px | 3.5vw | 58px | .98 | -.022em |
| Panel | 16px | 1.5vw | 24px | 1.12 | .005em |
| Body Lead | 16px | 1.25vw | 20px | 1.48 | 0 |
| Body | 13px | 1vw | 16px | 1.58 | 0 |
| Editorial Body | 15px | 1.05vw | 18px | 1.68 | 0 |
| UI | 11px | .82vw | 14px | 1.32 | .01em |
| Label | 9px | .68vw | 12px | 1.22 | .14em |
| Data | 9px | .68vw | 12px | 1.38 | .055em |
| Terminal | 10px | .72vw | 13px | 1.42 | .035em |
| Micro | 8px | .56vw | 10px | 1.34 | .09em |

## Jerarquía por escena

### Threshold / Error

```text
Barlow Condensed 900
Azeret Mono 500
Inter Tight 500–700
```

### Observe / Archive

```text
Barlow Condensed 700–900
IBM Plex Mono 400–600
Inter Tight 400–600
```

### Machine / Cosmology

```text
Oxanium 600–700
IBM Plex Mono 400–600
Inter Tight 400–600
```

### Ghost / Editorial

```text
Bodoni Moda 400–600
Inter Tight 400–600
IBM Plex Mono 400
```

### Longform

```text
Libre Baskerville 400–700
Inter Tight 500–600
IBM Plex Mono 400
```

## Espaciado

```text
Eyebrow → headline       8px
Headline → lead         16px
Headline → body         24px
Panel title → content   12px
Body paragraph gap      .9em
Data row gap             6px
Terminal row gap         2px

Panel mobile            16px
Panel desktop           20px
Hero module             20–40px
Section gap mobile      48px
Section gap desktop     80px
```

## Anchos

```text
Poster headline       7.5–10ch
Tech headline          13ch
Editorial headline     12ch
Body lead              42ch
UI text                34ch
Body                    56ch
Editorial body          66ch
Data                    72ch
Microcopy               84ch
```

## Textura

El desgaste de las referencias no debe hornearse en una imagen del texto.
Se mantiene una capa tipográfica limpia y se añade una máscara visual encima.
Así la legibilidad y accesibilidad no dependen del ruido.

## Rendimiento

- Cargar `core` una sola vez.
- Cargar como máximo un bundle decorativo por escena.
- No importar siete familias globalmente en producción.
- Usar `font-display: swap`.
- Preferir pesos variables cuando el pipeline aprobado los soporte.
- Mantener fallbacks métricamente razonables para reducir saltos.

## Cobertura lingüística

Antes del deploy, ejecutar el specimen con:

```text
WËNÜ MÄPÜ · KODEX−∞
ÑI KÜME MONGEN
Á É Í Ó Ú Ü Ñ
0123456789
```

Si el proyecto usa grafemas adicionales en Mapudungun, deben agregarse al
test y al subset final.
