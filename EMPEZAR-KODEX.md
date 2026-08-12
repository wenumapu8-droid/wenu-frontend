# EMPEZAR · KODEX−∞

Si te dijeron **«KODEX»** y nada más, este archivo es todo lo que necesitás
para arrancar. Leelo entero antes de tocar nada — son dos minutos y te ahorra
las once veces que en este repo alguien construyó algo que ya existía.

---

## 1 · Ponete en la rama correcta

```bash
git fetch origin
git checkout redesign-v2      # NO feature/kodex-depth-engine: está vieja
git pull
```

Todo el trabajo vive en `redesign-v2`. Si ves un repo sin `scripts/lamina/`,
estás en la rama equivocada.

## 2 · Leé el método

```
.claude/skills/kodex-lamina/SKILL.md
```

**Esto no es opcional.** Trae el método con números medidos, no opiniones, y
nueve trampas que ya costaron vueltas enteras. Su regla cero:

> **Auditar antes de escribir.** Once veces seguidas en este repo, lo que
> hacía falta ya estaba escrito. Antes de crear cualquier componente, página o
> utilidad: `grep -rl "<concepto>" src/ | head`. Si sale algo, leelo primero.

## 3 · Mirá dónde vamos

| archivo | qué te dice |
|---|---|
| `KODEX-DECISIONES.md` | lo que decidió el creador y lo que sigue abierto |
| `KODEX-INVENTARIO-DRIVE.md` | qué hay para construir: 31 procedurales, 19 fotográficos |
| `KODEX-PLAN.md` | el plan macro y los conflictos registrados |
| `KODEX-ESTADO.md` | estado y traspaso |

---

# LA PRÓXIMA TAREA

**`u10-commons`** — la que cierra la serie UNIVERSE. Nueve de diez ya están.

```
referencia   reference/canon/u10-commons.png   (1122×1402)
título       KODEX-∞ / THE COMMONS
subtítulo    COLLECTIVE TRACE
héroe        campo estelar radial cubierto de trazas y frases manuscritas
paneles      WRITE · DRAW · OBSERVE · CONSENT · FIELD CONDITIONS ·
             PUBLIC TRACE · SYSTEM NOTICE
```

Creá `src/pages/kodex/lamina/u10-commons.astro` y
`src/components/kodex/lamina/u10/*.astro`.

**Reusá el cromo compartido, no lo reescribas:**
`src/components/kodex/lamina/serie-universe/{CabeceraUniverse,PieUniverse}.astro`
y `geom.ts`. Mirá cómo los usa `u06/` o `u05/`: son archivos cortos que sólo
pasan props medidas.

Después de ésta, seguí por los pósters procedurales de
`KODEX-INVENTARIO-DRIVE.md`. **No tomes los 19 fotográficos** —discos de WENU
MAPU, dossiers KX-8—: no se generan por código y decir que sí sería mentir.

---

# EL CONTRATO, que no se negocia

- **HÉROE PROCEDURAL** en canvas 2D o SVG con parámetros. Nunca trazado. El
  cromo —glifos, sellos, marcos— sí se traza. Un puntaje bajísimo con la
  alarma «sin canvas y muy densa» encendida es el PNG vectorizado, no un buen
  resultado.
- Semilla determinista (`mulberry32`). **Jamás `Math.random()`**: sin semilla
  el banco mide ruido y ningún puntaje es comparable.
- **Bucle por fase** 0→1 que vuelve a 0 sin salto. Un `t` creciente deja
  costura al cerrar.
- `prefers-reduced-motion` **reduce, no congela**.
- `IntersectionObserver` + `visibilitychange`: fuera de pantalla no dibuja.
- Exponé `window.__kdxFreeze` — Playwright con `animations:"disabled"` NO
  congela un canvas, y sin esto la medición es inválida.
- Reusá `src/components/kodex/lamina/kit/` en vez de escribir medidores
  nuevos. La lámina 1 terminó con trece juegos distintos; el kit existe por eso.

## MEDÍ, no asumas

- **El fondo.** Cinco láminas van sobre negro puro y `u03` sobre blanco hueso
  rgb(248,245,242). Tomá diez muestras antes de fijar nada.
- **La paleta.** No se hereda: `u01` es acromática, `u05` usa `#b48fe2`, `u06`
  `#b18ae0`, y `u08` tiene un segundo acento naranja `#dc7050` que ninguna otra
  tiene.
- **El hexágono de cabecera y el marco inferior** cambian de posición entre
  láminas.

## PROHIBIDO hacerle trampa a la métrica

`filter: blur(1px)` baja el puntaje más que cualquier corrección real —medido,
4,16 → 3,33 %— y sólo esconde el error en vez de corregirlo. Igual bajar
contraste, veladuras o subir el negro.

Y algo más sutil: **el óptimo del banco cae más oscuro que el original.**
Cuatro agentes seguidos descartaron estados con MEJOR puntaje por eso, y
tuvieron razón. Si encontrás un truco que mejora el número sin acercar la
forma, anotá que lo probaste y por qué no va — no lo dejes puesto.

## Trampas del repo, ya cobradas

| síntoma | causa |
|---|---|
| el `<script>` no corre | TypeScript en `<script>` de Astro: se compila como JS |
| el build rompe con GLSL | `{` en el marcado se parsea como expresión: `&#123;` `&#125;` |
| un path con degradado sale negro | `fill: url(#id)` en hoja externa resuelve contra `/_astro/*.css` — va como atributo |
| un `<circle>` sale negro | en SVG el valor inicial de `fill` es negro, no «ninguno» |
| el puntaje no cambia | estás midiendo contra un `dist/` viejo |
| build falla por WooCommerce | `ALLOW_EMPTY_PRODUCTS=true npm run build` |
| el índice «no lista» mi lámina | mirá `dist/kodex/lamina/index.html`, no el fuente |

`opacity` y `fill-opacity` dicen lo mismo por especificación pero **no
rasterizan igual**. Si calibrás con uno, no cambies al otro.

---

# CERRAR LA VUELTA

```bash
ALLOW_EMPTY_PRODUCTS=true npm run build
npx --yes serve dist -l 4321 &
node scripts/lamina/compare.mjs u10-commons
```

Canvas > 0 en la línea de forma es obligatorio.

## Y después de medir, MIRÁ

**El puntaje mide promedio, no jerarquía.** Una lámina dio 4,68 % y aun así el
arco de su portal se leía como halo en vez de arquitectura. Capturá tu render a
1122×1402 (poniendo `transform:none` al `.lam`), abrilo junto al PNG y
preguntate **qué se lee primero**. Si el orden no coincide con la referencia,
arreglalo aunque el número esté bien.

El índice de láminas se descubre solo por glob: no hay que editarlo.

Commiteá, empujá a `redesign-v2` y registrá con:

```bash
bitacora claude-mini "..."
```

Declará tus deudas en vez de taparlas. Los cinco agentes anteriores lo
hicieron y fue lo mejor de sus entregas.

---

# PROHIBICIONES

- **Sin deploy a producción** sin la frase literal `APROBAR DEPLOY` del
  creador. Ya la dio el 2026-08-11: ver `ENCARGO-DEPLOY-KODEX.md`. Preview sí.
- **Sin mergear PRs.**
- **Nada bajo `~/.hermes/` ni `~/Sinergia-Industrial/`.**
- **No inventar canon.** Paleta y taxonomía las decide el creador. Las
  coordenadas A–Y ya están dibujadas en `PAGE 04` y **se copian, no se
  «mejoran»** — incluso su rareza: el grafo no tiene E y tiene dos I, y eso
  está registrado sin resolver en `KODEX-DECISIONES.md`.
- **No corras `git add -A` con otros agentes escribiendo**: barre su trabajo a
  medio hacer dentro de tu commit. Ya pasó.

## Trabajo en paralelo

`dist/` es compartido. Si un build falla por chunks o módulos faltantes,
verificá aislado antes de «arreglar» nada:

```bash
npm run build -- --outDir /tmp/verif-<tu-tarea>
```

Si en aislado pasa y en el compartido falla, **no es tu cambio**: es una
colisión y desaparece sola.

---

# CUOTA

El creador estaba al **89 % de su límite semanal**, que se restablece el
sábado a la 1:00. Si corrés en su cuenta, esto la consume.

- Ruteá a **Fable** todo el trabajo mecánico: medir recortes, barrer semillas,
  contar píxeles, transcribir textos, verificar builds. Es la mayor parte del
  tiempo de una lámina, y en Fable costó ~250k tokens contra ~365k del modelo
  caro, **sin perder calidad**: cuatro láminas seguidas dentro del promedio.
- Dejá el modelo caro para el héroe procedural y las decisiones de jerarquía.
- **Una lámina por disparo.** Si la vuelta se va de presupuesto, entregá lo que
  haya medido y documentado y cerrá. Media lámina medida vale más que una
  entera sin medir.
- Si un agente muere por «session limit», **no relances**: anotá en la bitácora
  y terminá la vuelta.

---

# LAS NUEVE YA HECHAS, para calibrar expectativa

```
u01 ORIGIN FIELD  2,52 %      u07 OBSERVER    4,39 %
u04 ALPHABET      3,49 %      u06 MEMORY      4,61 %
u03 RETURN        3,53 %      u02 THRESHOLD   4,63 %
u05 GENESIS       3,99 %      u08 ANOMALY     6,00 %
u09 SOURCE        4,16 %
```

Todas con héroe procedural, 2 a 4 canvas, entre 0,05 y 0,13 MB.

Un puntaje entre 2,5 % y 5 % es un buen resultado. Por encima de 6 %, mirá la
jerarquía antes de dar por buena la lámina.
