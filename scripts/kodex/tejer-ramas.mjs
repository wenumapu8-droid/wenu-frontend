/**
 * KODEX−∞ · TEJER RAMAS — el corpus compacto que baja al navegador
 *
 * El motor de ruta (`src/lib/kodex/ruta.ts`) corre en el navegador para que el
 * viaje sea distinto por persona sin necesitar servidor. Para eso necesita el
 * grafo, pero `graph.json` pesa lo que pesa y trae campos que la navegación no
 * usa. Esto lo destila: id, título, estrato, estatus, grado, href, más la lista
 * de vecinos ya resuelta desde las 728 aristas tipadas.
 *
 * NO INVENTA NADA: cada campo viene de `graph.json`, que a su vez viene del
 * manifiesto. Si un nodo no tiene estrato, sale `null` — no se le asigna uno.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const g = JSON.parse(readFileSync('public/kodex-content/graph.json', 'utf8'));

/* LAS CAPTURAS SALEN DEL GRAFO. Directiva del creador: no se publican, y por
   lo tanto el descenso no puede ofrecerlas — si lo hiciera, mandaría a una
   página que ya no existe. Se leen del manifiesto, que es donde vive la marca
   `descartado: "captura-de-pantalla"` con su evidencia. */
const man = JSON.parse(readFileSync('public/kodex-content/manifest.json', 'utf8'));
const capturas = new Set((man.volumes ?? []).filter((v) => v.descartado).map((v) => v.id));
console.log(`capturas excluidas del grafo: ${capturas.size}`);

/* 1.309 de los 1.427 nodos tienen por título su propio hash ("0050aebb-49347").
   No son un error: son especímenes del archivo que todavía nadie nombró. Poner
   ese hash en una puerta como si fuera un título sería presentar un dato falso,
   así que se marcan y la interfaz dice "UNNAMED SPECIMEN". El archivo admite lo
   que le falta en vez de disimularlo. */
const esHash = (t) => !t || /^[0-9a-f]{8}-\d+$/i.test(t) || t.length < 3;

const nodos = g.nodes.filter((n) => !capturas.has(n.node_id)).map((n) => ({
  id: n.node_id,
  titulo: n.title,
  sinNombre: esHash(n.title) || undefined,
  estrato: n.stratum || null,
  estatus: n.epistemic_status,
  grado: n.degree || 0,
  href: `/kodex/vol/${n.node_id}/`,
}));

const indice = {};
nodos.forEach((n, i) => { indice[n.id] = i; });

/* Vecinos en ambos sentidos: descender por una relación y volver por ella son
   el mismo cable. Sólo se enlaza lo que resuelve a un nodo que existe — una
   arista colgando sería una puerta al 404. */
const vecinos = {};
let colgadas = 0;
for (const e of g.edges) {
  const a = e.source_node, b = e.target_node;
  if (!(a in indice) || !(b in indice)) { colgadas++; continue; }
  (vecinos[a] ||= []).push(b);
  (vecinos[b] ||= []).push(a);
}

const salida = {
  version: 1,
  fuente: 'public/kodex-content/graph.json',
  nota: 'Corpus de navegación. Destilado, nunca ampliado: no hay dato acá que no esté en el grafo.',
  totales: {
    nodos: nodos.length,
    conVecinos: Object.keys(vecinos).length,
    aristasColgadas: colgadas,
    sinNombre: nodos.filter((n) => n.sinNombre).length,
  },
  nodos, vecinos, indice,
};
writeFileSync('public/kodex-content/ramas.json', JSON.stringify(salida));
console.log(`ramas.json · ${nodos.length} nodos · ${Object.keys(vecinos).length} con vecinos · ${colgadas} aristas colgadas · ${(JSON.stringify(salida).length/1024).toFixed(0)}KB`);
