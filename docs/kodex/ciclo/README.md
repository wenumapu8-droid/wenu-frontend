# CICLO AUTÓNOMO DE KODEX

Esto vive en el repo **a propósito**. La primera versión vivía en
`~/kodex-autonomo/` del Mac mini: un launchd, de una cuenta, con un llavero que
hay que desbloquear a mano. Si esa máquina se apaga, KODEX deja de avanzar y
nadie se entera — y ese es exactamente el punto único de fallo que el proyecto
está tratando de eliminar.

Acá el estado y las lecciones quedan versionados, replicados en GitHub y
legibles por cualquier agente, sea Claude o el que venga después. La máquina
que ejecuta el ciclo pasa a ser reemplazable; su memoria, no.

## Archivos

- `ESTADO.md` — dónde quedó el trabajo, qué sigue, qué bloquea. Cada ciclo lo
  lee al empezar y lo reescribe al terminar.
- `correr.sh` — el runner. Toma UNA tarea por tanda, la mide en navegador,
  commitea si mejoró, revierte si empeoró, publica a preview.

## Lo que el ciclo NO puede hacer

- Desplegar a producción. Requiere `APROBAR DEPLOY` explícito del creador sobre
  un SHA exacto. El ciclo no puede dárselo a sí mismo ni inferirlo.
- Mergear ramas.
- Replicar el patrón de PROLOGUE a otra escena antes de que el creador la acepte.
- Declarar PASS sin medirlo en navegador. Build verde no es aceptación visual.
- Inventar rutas, assets o cifras.

## Dónde queda frágil todavía

- **Ejecución**: depende de un launchd en una máquina concreta. Migrar a
  GitHub Actions o similar lo desacopla del hardware.
- **Credenciales**: `~/.cf-deploy-env` y el llavero viven sólo en esa máquina.
- **Modelo**: el runner invoca `claude`. Los contratos deberían poder ejecutarse
  con cualquier agente; hoy el prompt asume uno.

Se anotan acá porque un sistema que pretende durar tiene que saber por dónde se
rompe, no sólo por dónde funciona.
