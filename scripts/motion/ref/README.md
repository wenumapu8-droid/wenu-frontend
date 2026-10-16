# Referencias de movimiento

Acá van los videos de referencia. **No se versionan los archivos** (están en
`.gitignore` igual que `dist-motion/`): van acá para poder estudiarlos, y lo
que se versiona es la ficha que sale de estudiarlos.

## Cómo hacer llegar un video

1. **Adjuntarlo en el chat.** Llega al contenedor como archivo real; es lo más
   rápido y no requiere configurar nada.
2. **Copiarlo a esta carpeta** por cualquier otro medio.
3. **Google Drive por URL no funciona** desde este contenedor: la política de
   red del entorno deniega `drive.google.com` (el gateway responde 403 al
   CONNECT). Se habilita agregando el dominio en *Network access → Allowed
   domains* en los ajustes del entorno.

## Cómo se estudia

Un video no se mira: se descompone. La biblia de producción (§2,
`46_KODEX_AI_VIDEO_FACTORY`) lo dice: *"KODEX does not animate references as
finished JPEGs. It extracts temporal laws."*

```bash
# contact sheet: 20 frames repartidos en toda la duración
ffmpeg -i ref/CLIP.mp4 -vf "fps=1/$(( $(ffprobe -v0 -show_entries format=duration \
  -of csv=p=0 ref/CLIP.mp4 | cut -d. -f1) / 20 )),scale=320:-1,tile=5x4" \
  -frames:v 1 ref/CLIP-sheet.png

# un corte fino alrededor de un momento concreto
ffmpeg -i ref/CLIP.mp4 -ss 4.0 -t 1.0 -vf "fps=10,scale=360:-1,tile=5x2" \
  -frames:v 1 ref/CLIP-beat.png

# detección de cortes: dónde cambia de plano, con timestamps
ffmpeg -i ref/CLIP.mp4 -vf "select='gt(scene,0.3)',metadata=print" -f null - 2>&1 \
  | grep pts_time
```

## Qué registrar (biblia §2)

Por cada referencia, una ficha en `ref/<id>.md`:

| Campo | Qué anotar |
|---|---|
| source ID / procedencia | de dónde salió, y su estado de derechos |
| duración | |
| sujeto dominante | qué manda el encuadre |
| camera path | cuál de las gramáticas de §5, o cuál prohibida |
| motion zones | qué se mueve y qué se queda quieto |
| cadence | dónde caen los cortes y los acentos |
| depth logic | cuántas capas, cómo se separan |
| transitions | cómo entra y sale cada plano |
| material behavior | cómo se comporta la superficie |
| abstracción útil | la **ley temporal** que sí se puede llevar |
| forbidden copy | lo que NO se puede copiar: layouts, símbolos, footage |
| afinidad de escena | a qué familia de §3 pertenece |

**Las referencias externas son `REFERENCE_ONLY`.** Informan comportamiento de
cámara, timing, capas y gramática de montaje. No se copian como obra
identificable, layouts exactos, símbolos ni footage.
