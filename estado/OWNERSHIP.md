# WRITE OWNERSHIP · KODEX−∞

WRITE_OWNER=mini
IMAC_MODE=READ_ONLY
NO_PASS_TO_FAIL=true

Vigente desde 2026-08-27. Autorizado por Ocin tras una condición de carrera
real: la sesión del iMac editó folio/[folio].astro mientras se medía desde
el Mini, y el trabajo del carril de estados desapareció del disco a mitad
de la investigación.

El Mini (este worktree, rama kodex/pass-a-organismos-corredor → redesign-v2)
es la única autoridad de escritura sobre archivos de producto de KODEX.

El iMac puede inspeccionar, auditar, comparar, diagnosticar y proponer
diffs. No puede aplicarlos. Reporta a ~/kodex-relevo/, el Mini ejecuta.

NO_PASS_TO_FAIL=true es la regla que ya vive en el código: el trinquete de
gate-experiencia.mjs / latido.sh compara VECTOR:ESCENA=PASS/FAIL por
identidad, no conteo total. Ninguna escena que pasa puede pasar a fallar,
sin importar qué le pase al total. Ver commit 441c4437.

Este archivo es la marca de la política, no el mecanismo — el mecanismo
ya está en el gate. Si algún día WRITE_OWNER cambia, actualizar acá primero.
