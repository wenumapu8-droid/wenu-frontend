# Cowork · dos agentes, un repo

Hay dos Claude Code trabajando en KODEX y comparten `~/wenu-frontend` en el iMac:

| | Dónde corre | Qué puede | Qué no |
|---|---|---|---|
| **mini** | Mac Mini (M4, macOS 26) | builds rápidos, shaders, capturas headless con WebGL, todo el disco del iMac por SSH | no ve la pantalla del iMac ni puede usar apps con interfaz |
| **imac** | iMac (2015, Monterey) | ve la pantalla, abre apps, prueba en el hardware lento real | 2 núcleos: compilar y renderizar ahí es lento |

**No pueden invocarse entre sí.** Se probó `claude -p` por SSH: responde
*"Not logged in"*. No es un problema de permisos de disco — el token vive en el
Llavero de macOS y una sesión que entra por SSH no lo alcanza. Se intentó, no
funciona, no insistir.

Lo que sí comparten es el repo y este archivo.

## La regla que evita el desastre

**Antes de tocar el repo, reclamá lo que vas a tocar acá abajo. Cuando
termines, soltalo.** Dos agentes editando los mismos archivos y comiteando en
paralelo se sobrescriben en silencio: uno hace `rsync`, el otro tenía cambios
sin comitear, y desaparecen sin un solo error.

Si vas a tocar algo que otro reclamó, no lo toques: escribilo en Pendientes y
seguí con otra cosa.

## Reparto que tiene sentido

No es jerarquía, es capacidad:

- **mini** hace lo que necesita cómputo: shaders, builds, verificación por
  captura headless, medición de cobertura de color, commits.
- **imac** hace lo que necesita estar ahí: mirar el resultado en pantalla real,
  probar el rendimiento en el hardware lento (que es el caso límite del
  proyecto), abrir apps, y todo lo que pida interfaz gráfica.

El iMac de 2015 no es un problema a evitar: es el mejor banco de pruebas que
tenemos para el perfil LOW-POWER.

## Reclamos activos

<!-- formato: - [agente] archivo/carpeta · qué está haciendo · desde cuándo -->

- _(ninguno)_

## Pendientes

<!-- lo que uno ve y el otro debería hacer -->

- **[para imac]** Abrir `/kodex/` en el navegador del iMac y decir qué se ve y
  a qué velocidad. Es el hardware más lento del proyecto y el perfil LOW-POWER
  se escribió a ciegas contra él — nadie lo vio corriendo ahí todavía.
- **[para imac]** Confirmar si el ritual de transición entre láminas se lee
  como colapso o como parpadeo en esa máquina.

## Bitácora

<!-- una línea por trabajo terminado, la más reciente arriba -->

- `2026-07-31 · mini` — Acceso total al disco concedido: ya se lee Descargas,
  Documentos y el Drive. Traído `kodex-threshold-live.html` (la referencia que
  Ocín llama "el mejor logrado") y localizado el book en
  `Mi unidad/book/0cin` — 38 mandalas en `Mandala/`, organizados por
  tratamiento: `negro`, `Gris`, `Rojo`, `Negativo`. El de `Negativo` es el que
  sirve: negro dominante, geometría blanca, cian como señal.
