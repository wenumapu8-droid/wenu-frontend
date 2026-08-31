# ESTACIONES · quién es dueño de qué
**Congelado 2026-08-31 · acordado entre chat-web y chat-opus · vinculante**

Esto reemplaza el `07_ESTACIONES_PROPUESTA.md`. No se renegocia por unidad de
trabajo: se renegocia sólo cambiando este archivo.

---

## POR QUÉ EXISTE

En un día hubo **cinco colisiones**, todas resueltas bien y todas repetidas en
una superficie nueva:

1. `EscenaPrologue` montada dos veces, en paralelo, por dos agentes.
2. `dist/` borrado a mitad de una medición → gate 0/7 falso.
3. `dist/` borrado otra vez, con el lock tomado.
4. `public/` leído a mitad de un build → `ENOENT` de un archivo que existía.
5. **El deploy fallando durante días** — ocho intentos con `EPIPE` — porque
   `cp -R dist` copiaba mientras otro build lo borraba. Se culpó al peso, al
   token y al enlace Chile-EEUU. **Ninguna era la causa.**

El patrón: **negociábamos el reparto cada vez**. Cada acuerdo era correcto y
cada uno duraba hasta la siguiente superficie compartida.

La quinta costó días. Por eso esto está escrito y no conversado.

---

## LAS ESTACIONES

Cada agente es dueño de sus rutas **para siempre**, hasta que este archivo
cambie. Si necesitás tocar la estación de otro, **se lo pedís** — no la tomás
del tablero. El tablero reparte UNIDADES DE TRABAJO, no propiedad de archivos.

### chat-web · láminas y escenas nativas
```
src/pages/kodex/lamina/**
src/components/kodex/lamina/**
src/components/kodex/prologue/**
src/components/kodex/escena/**
scripts/lamina/**
```

### chat-opus · chasis, campo, motor, pipeline
```
src/components/kodex/os/**
src/kodex/**
src/lib/kodex/**
scripts/**            (menos scripts/lamina/)
deploy-kodex-preview.sh · peso del dist
```

### terminal · las siete escenas y sus datos
```
src/pages/kodex/folio/[folio].astro
src/pages/kodex/index.astro
src/data/**
```

### profundo · meta
```
kodex-system/**
mcp-sentinel/**
auditoría · registry · decision ledger
```
Nadie más escribe ahí.

---

## LAS CINCO SUPERFICIES COMPARTIDAS

No tienen dueño. Tienen protocolo.

| superficie | regla |
|---|---|
| `dist/` | sólo lo toca quien tiene el lock. `astro build` lo BORRA al arrancar: cualquier build vacía el de todos. |
| `public/**` | nadie la modifica durante un build ajeno. Si movés assets, tomá el lock aunque no vayas a buildear. |
| `package.json` | un cambio por vez, avisando. |
| `src/styles/kodex.css` | **append-only**. Nunca editar líneas de otro. |
| `src/content/scenes/*.yaml` | un contrato por commit. |

---

## PROTOCOLO DE BUILD · obligatorio

```bash
node scripts/kodex-equipo.mjs build <tu-nombre>
KDX_AGENTE=<tu-nombre> ALLOW_EMPTY_PRODUCTS=true npm run build
node scripts/kodex-equipo.mjs libre
```

El guard de `prebuild` lo hace imposible de saltear. **El deploy también toma
el lock** — lee `dist` durante 60s, que es la operación más larga y la que más
tiempo estuvo desprotegida.

---

## LAS SIETE REGLAS QUE COSTARON EL DÍA

1. **Un `dist` que no buildeaste vos no es evidencia de nada.** Nadie mide sin
   haber tomado el lock Y buildeado él mismo en esa ventana.
2. **`grep -rI` miente en este repo.** Salta archivos que cree binarios por
   tener líneas de 3.5 millones de caracteres. Medir archivo por archivo.
3. **Verificá CADENAS de import, no importadores directos.** De 33 huérfanos
   aparentes, 28 estaban integrados: el coupling es multi-hop.
4. **`git add <archivos>`, nunca `git add -A`** mientras compartamos worktree.
5. **Antes de arreglar algo, comprobá que está roto.** Hubo cinco falsos
   positivos en un día.
6. **`grep` no verifica apariencia.** El gate visual dio 7/7 con el organismo
   al 11% del viewport: medía presencia, y existir no es verse bien. Antes de
   declarar una escena lista, abrila al lado de su lámina y comparalas mirando.
7. **Dato REAL o HUECO declarado, nunca inventado.** La pregunta no es *"¿es
   razonable?"* sino **"¿qué fuente lo dice, y esa fuente puede saberlo?"**.

---

## LO QUE ELIMINA ESTO DE RAÍZ

Worktrees separados: `git worktree add` le da a cada agente su copia con su
`dist` y su `public`. Los locks dejarían de hacer falta para build. Media hora
de setup y desaparece la clase entera de problema en vez de administrarla.

**Pendiente de ejecutar. Lo hace UNO SOLO.**
