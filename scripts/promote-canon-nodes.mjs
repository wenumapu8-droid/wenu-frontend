#!/usr/bin/env node
/**
 * KODEX-∞ · Promueve los 8 nodos CANON de `nodes-atlas/` a `nodes/`.
 *
 * Escribe `proposition`, `visualAnchor` y `editorial.body`, vacía `pending` y mueve
 * el archivo. Cada ruta `/kodex/vol/<slug>` aparece sola después.
 *
 * Las proposiciones derivan de la prosa que el autor escribió en la columna FUNCIÓN
 * del Visual Atlas. No hay cosmología añadida.
 *
 * REVERSIBLE: `node scripts/promote-canon-nodes.mjs --undo` devuelve todo a
 * `nodes-atlas/` con `proposition` vacía. No se borra ningún archivo.
 */

import { readFile, writeFile, rename, readdir } from 'node:fs/promises';
import path from 'node:path';

const ATLAS = 'src/data/kodex/nodes-atlas';
const LIVE = 'src/data/kodex/nodes';

const AUTHORED = {
  'astral-route': {
    proposition: 'La ruta no se recorre: se ordena. Cada estación contiene a la siguiente y ninguna es obligatoria. Reversible significa que el regreso también es camino.',
    anchor: { kind: 'route-diagram', label: 'Seis estaciones con dirección declarada y retorno visible' },
    body: 'La ruta astral no impone un orden de paso: declara un orden de contención. Se puede entrar por donde se pueda entrar, y volver es parte del trayecto, no su fracaso.',
  },
  'dream-gate': {
    proposition: 'Lo liminal no es la puerta: es la condición para verla. La intención convierte una imagen en un acceso.',
    anchor: { kind: 'threshold-membrane', label: 'Umbral que solo se resuelve cuando la mirada se sostiene' },
    body: 'La puerta del sueño no se abre por insistencia sino por permanencia. Sin intención, la imagen sigue siendo imagen.',
  },
  'field-of-eyes': {
    proposition: 'Ningún ojo observa solo. Mirar es ya ser parte del campo que mira.',
    anchor: { kind: 'distributed-field', label: 'Campo donde la atención propia aparece como un nodo más' },
    body: 'La observación recursiva es acá un modelo computacional: el observador se representa dentro del campo que observa. No afirma efectos de observador fuera de ese modelo.',
  },
  'dna-ascent': {
    proposition: 'La herencia es dato antes que símbolo. El ascenso no niega la biología: la lee dos veces.',
    anchor: { kind: 'dual-reading', label: 'Una misma estructura en capa verificada y capa simbólica, distinguibles' },
    body: 'La biología de la herencia está documentada y se muestra como tal. El linaje simbólico es construcción de KODEX y se muestra como tal. Las dos capas conviven sin fundirse: esa separación es parte de la obra, no una advertencia legal.',
  },
  'source-chamber': {
    proposition: 'El origen no es un comienzo: es lo que todavía no ha elegido forma. La unidad acá no cierra nada.',
    anchor: { kind: 'sustained-absence', label: 'Cámara de silencio; ausencia sostenida sin rellenar' },
    body: 'Concepto autoral de KODEX sobre el origen como potencial. No es cosmología física ni pretende serlo.',
  },
  'heart-chamber': {
    proposition: 'Lo que no vuelve al cuerpo no se recuerda. El pulso es la única escala que el archivo no puede abstraer.',
    anchor: { kind: 'embodied-pulse', label: 'Pulso encarnado como escala de retorno' },
    body: 'El corazón es opcional en el viaje. Nada obliga a pasar por acá, y salir devuelve exactamente al punto de ruta anterior.',
  },
  'astral-return-gate': {
    proposition: 'Se vuelve al mismo templo y ya no es el mismo. La mutación no está en el lugar: está en lo que se trae.',
    anchor: { kind: 'transformed-reentry', label: 'Reingreso donde el templo muestra la diferencia, no el recorrido' },
    body: 'Única arista MUTATES de la ruta astral. Acá el recorrido deja de ser trayecto y pasa a ser estado.',
  },
  'return': {
    proposition: 'No se vuelve al principio. Se vuelve con lo que el recorrido dejó, y eso ya es otra forma.',
    anchor: { kind: 'new-form', label: 'Forma nueva que conserva el patrón anterior sin repetirlo' },
    body: 'Reintegra memoria en una nueva forma. Coordenada Y, terminal del viaje.',
  },
};

const undo = process.argv.includes('--undo');

async function main() {
  if (undo) {
    const files = await readdir(LIVE);
    let moved = 0;
    for (const file of files) {
      if (file === 'tree-infinity-core.json' || !file.endsWith('.json')) continue;
      const slug = file.replace('.json', '');
      if (!(slug in AUTHORED)) continue;
      const node = JSON.parse(await readFile(path.join(LIVE, file), 'utf-8'));
      node.proposition = '';
      node.visualAnchor = { kind: 'pending-authoring', label: '', role: 'dominant-phenomenon' };
      delete node.editorial;
      node.pending = ['proposition', 'visualAnchor.label', 'editorial.body'];
      await writeFile(path.join(ATLAS, file), JSON.stringify(node, null, 2) + '\n');
      await rename(path.join(LIVE, file), path.join(LIVE, `.removed-${file}`));
      moved++;
    }
    console.log(`[kodex] revertidos ${moved} nodos a nodes-atlas/ (originales renombrados, no borrados)`);
    return;
  }

  let promoted = 0;
  for (const [slug, authored] of Object.entries(AUTHORED)) {
    const src = path.join(ATLAS, `${slug}.json`);
    let node;
    try {
      node = JSON.parse(await readFile(src, 'utf-8'));
    } catch {
      console.warn(`[kodex] no encontrado, se omite: ${slug}`);
      continue;
    }
    if (node.atlasStatus !== 'CANON') {
      console.warn(`[kodex] ${slug} no es CANON (${node.atlasStatus}) — se omite`);
      continue;
    }

    node.proposition = authored.proposition;
    node.visualAnchor = { ...authored.anchor, role: 'dominant-phenomenon' };
    node.editorial = { language: 'es', body: authored.body };
    node.pending = [];
    node.version = '1.0.0';

    await writeFile(path.join(LIVE, `${slug}.json`), JSON.stringify(node, null, 2) + '\n');
    await rename(src, path.join(ATLAS, `.promoted-${slug}.json`));
    promoted++;
    console.log(`  promovido  ${node.id}  → /kodex/vol/${slug}`);
  }
  console.log(`\n[kodex] ${promoted} nodos promovidos. Revertir: --undo`);
}

main();
