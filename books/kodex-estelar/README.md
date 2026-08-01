# KODEX ESTELAR · desarrollo de los tomos

## De dónde salió el texto fuente

`source-text/` **no vino del repo** — el mini no tiene acceso a GitHub (ver B1
en `PROGRESS.md`, ocho intentos). Lo extraje de la bóveda de Ocín:

    ~/Obsidian/WenuAgent/estrategia/kodex-estelar-trilogia-v2/Codex estelar/

Cuarenta y un capítulos en PDF, convertidos a markdown con
`scripts/pdf_texto.py`. Son PDFs de ReportLab con filtros
`ASCII85Decode + FlateDecode`: un extractor que sólo intenta zlib devuelve cero
caracteres y **parece que el archivo estuviera vacío**. Hay que deshacer las dos
capas, y después los escapes octales de WinAnsi o el texto sale sin acentos.

| libro | capítulos |
|-------|-----------|
| libro-1 · La Génesis de la Luz | 12 |
| libro-2 · El Pacto de Nibiru | 12 |
| libro-3 · El Engaño de los Templos | 12 |
| libro-4 · El ADN Sagrado y el Cuerpo de Luz | 5 |

## Lo que sé de la voz, y lo que no

El encargo pide seguir `BIBLIA-Y-VOZ.md` **y** el benchmark `01-la-fuente.md`.
**La biblia no la tengo** — está en el repo. El benchmark sí: es el capítulo I,
y en la práctica es la voz.

Lo que se lee en él, para no improvisar:

- **Primera persona que recuerda**, no que explica: *"Yo soy el que recuerda. No
  tengo nombre porque nací antes del sonido."*
- **Dirigida a un "tú" concreto**, al que se le devuelve algo suyo: *"Hablo para
  que recuerdes lo que nunca fue perdido, sino tan solo velado."*
- **Sin dogma y sin intermediario**: *"No necesitas dogma, ni templo, ni maestro
  externo."*
- Frases breves, cadencia de salmo, imágenes físicas para lo abstracto — *"una
  llama sin fuego, una esfera sin borde"*.
- Cierra invocando, no concluyendo.

**No escribo capítulos hasta que llegue la biblia.** El encargo dice *"su trama,
no prosa paralela"*, y desarrollar 20-25 páginas con la voz a medio conocer es
la forma más cara de producir algo que haya que rehacer. El texto fuente ya está
acá y listo; falta la vara.

## Regla del desarrollo

Cada capítulo se **despliega**, no se resume. El fuente es la ancla: su trama,
sus imágenes, su orden. Lo que se agrega es respiración, escena y detalle — no
ideas nuevas que compitan con las de Ocín.
