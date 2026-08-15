# Contrato de agente · wenu-frontend / KODEX−∞

Esto se lee antes de tocar nada. Es corto a propósito.

## Dónde estás

Un repo con dos negocios adentro. `src/` y `/p/[slug]` son la tienda de **Wenu
Mapu**, que está en producción. `src/pages/kodex/`, `src/components/kodex/` y
`scripts/lamina/` son **KODEX−∞**. No mezcles conceptos, configuraciones ni
registros entre los dos, y nunca escribas bajo `~/.hermes/` ni
`~/Sinergia-Industrial/` — eso es Galvazinc, otro negocio, otra máquina lógica.

## Las cinco que nunca

1. **No mergeás.** La revisión es del creador y la compuerta la tiene él.
2. **No desplegás a producción.** Hace falta la frase literal `APROBAR DEPLOY`,
   y sale sólo por `redesign-v2`, jamás por `main`. Preview sí.
3. **No inventás canon.** Ni coordenadas A–Y, ni significados de B–L o N–X, ni
   presentar un valor generado como si fuera una medición.
4. **No dejás trabajo sin commitear.** Ya se perdió dos veces. Commit WIP en tu
   propia rama `wip/...`, aunque esté a medias.
5. **No trabajás sobre la rama de otro.** Esta copia la comparten varios
   agentes y se cambian la rama entre ellos. Verificá `git rev-parse
   --abbrev-ref HEAD` antes de editar y otra vez antes de commitear.

## Si tocás una lámina

Leé **`KIMI-BRIEF-LAMINAS.md`** completo. Es el procedimiento, no un resumen.
En una línea:

> Lo que es arte fija se traza. Lo que es información se compone. El agente
> sólo toca lo que exige criterio.

Y el ciclo, en este orden y sin saltearse pasos:

```bash
node scripts/lamina/_medir_region_components.mjs <slug> <region>  # 1 · medir
                                                                  # 2 · clasificar
node scripts/lamina/perfil.mjs <slug> --banda y0,y1 --comparar    # 3 · actuar
node scripts/lamina/iterate.mjs <slug>                            # 4 · cerrar
```

Tres cosas que ya costaron horas y conviene no volver a pagar:

- **Ajustar a ojo no es un paso del método.** Si estás moviendo posiciones,
  tamaños u opacidades estimando, parás: eso se mide o se traza.
- **Cuando el número empeora, medí el render** con `perfil.mjs --comparar`
  antes de proponer otro valor. El puntaje dice que fallaste; el perfil dice
  por qué. Proponer a ciegas cuesta un build de 19 s y 1.558 páginas por
  hipótesis.
- **Tres ciclos sin bajar el número y revertís**, y preguntás. No pasás sola a
  la región siguiente.

Antes de trabajar algo, la pregunta es una sola: **¿qué región medida cubre
esto?** Si no hay respuesta, el banco no lo ve y no sabés si sirvió.

## Si editás desde otra máquina

Nunca metas código dentro de las comillas de un `ssh`: las comillas del código
cierran las del shell y el archivo llega mutilado. Lo que tenga comillas viaja
como archivo (`scp`), y el `ssh` lleva sólo comandos simples. Mejor todavía:
cloná el repo donde estés y trabajá local — las referencias PNG y los scripts
de medición están todos trackeados.

## Contexto largo

`CLAUDE.md` (build, deploy, tokens, componentes) · `KODEX-METODO-LAMINAS.md`
(por qué el método es así, con los números) · `.claude/skills/kodex-lamina/`
(el método completo) · `scripts/lamina/loop/README.md` (el loop y sus
compuertas).
