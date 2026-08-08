/**
 * Señales culturales · pruebas contra el dato real, no contra fixtures.
 *
 * Correr:  node --test src/lib/kodex/cultural-signal.test.js
 *
 * No hay script `test` en package.json ni compilador de TypeScript instalado. Esto
 * ejercita `cultural-signal.js` —JS plano, sin imports— más los JSON leídos del
 * filesystem. `nodes.ts` no se puede importar acá: usa `import.meta.glob`, que solo
 * existe bajo Vite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AUTHOR_READING_NOTE,
  hasCitedSource,
  hasUnresolvedClaims,
  isAuthorReading,
  isCulturallySensitive,
} from './cultural-signal.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, '../../data/kodex');

const readNodes = (dir) =>
  fs
    .readdirSync(path.join(dataDir, dir))
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dataDir, dir, f), 'utf-8')));

const liveNodes = readNodes('nodes');
const atlasNodes = readNodes('nodes-atlas');
const declared = [...liveNodes, ...atlasNodes];
const authored = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'authored-edges.json'), 'utf-8'),
).edges;

const bySlug = (slug) => declared.find((n) => n.slug === slug);

// ── La cita propagada ────────────────────────────────────────────────────────

test('we-tripantu ya trae la cita que el proyecto tenía en otra parte', () => {
  const node = bySlug('we-tripantu');
  assert.equal(node.sources.length, 1);
  assert.match(node.sources[0].label, /Canio Llanquinao/);
  assert.match(node.sources[0].label, /978-956-335-205-4/);
  // Deja de estar sin resolver, sin que nadie toque código.
  assert.equal(hasUnresolvedClaims(node), false);
  // Y su afirmación de significado vuelve a mostrarse.
  assert.ok(node.summary.length > 0);
});

test('la raíz cultural declarada no cambió: sigue siendo REVIEW_REQUIRED', () => {
  // Tener fuente no la vuelve material sin sensibilidad. Son cosas distintas.
  assert.equal(isCulturallySensitive(bySlug('we-tripantu')), true);
});

test('wenu-mapu conserva su fuente de museo y no se toca', () => {
  const node = bySlug('wenu-mapu');
  assert.equal(node.sources.length, 1);
  assert.equal(node.sources[0].type, 'museum / curatorial');
  assert.equal(hasCitedSource(node), true);
  assert.equal(hasUnresolvedClaims(node), false);
});

// ── La señal no resuelta ─────────────────────────────────────────────────────

test('la señal se enciende por dato, no por una lista de slugs', () => {
  const unresolved = declared.filter(hasUnresolvedClaims).map((n) => n.slug).sort();
  assert.deepEqual(unresolved, ['ancestral-signal', 'animal-guides', 'kundalini-passage']);
  for (const node of declared.filter(hasUnresolvedClaims)) {
    assert.ok(isCulturallySensitive(node));
    assert.equal(node.sources.length, 0);
  }
});

test('un nodo STANDARD sin fuentes no se marca: la señal es cultural, no genérica', () => {
  const astral = bySlug('astral-route');
  assert.equal(astral.sources.length, 0);
  assert.equal(hasUnresolvedClaims(astral), false);
});

test('los nueve nodos publicados afirman con normalidad', () => {
  assert.equal(liveNodes.length, 9);
  assert.equal(liveNodes.filter(hasUnresolvedClaims).length, 0);
});

test('agregar una fuente apaga la señal; quitarla la enciende', () => {
  const base = bySlug('animal-guides');
  assert.equal(hasUnresolvedClaims(base), true);
  const conFuente = { ...base, sources: [{ label: 'x', type: 'documentado' }] };
  assert.equal(hasUnresolvedClaims(conFuente), false);
});

// ── La lectura del autor (arista que cruza registros) ────────────────────────

test('la arista WE TRIPANTU -> RETURN sigue intacta en el dato', () => {
  const edge = authored.find(
    (e) => e.from === 'KDX-NODE-WE-TRIPANTU' && e.to === 'KDX-NODE-RETURN',
  );
  assert.ok(edge);
  assert.equal(edge.relation, 'EXPANDS');
  assert.equal(edge.descriptor, 'Ambos articulan renovación y continuidad cíclica');
  assert.equal(edge.validity, 'NEEDS_CULTURAL_REVIEW');
  // Y su copia en el nodo, que es la que se renderiza.
  const rel = bySlug('we-tripantu').relationships.find((r) => r.id === 'return');
  assert.equal(rel.validity, 'NEEDS_CULTURAL_REVIEW');
  assert.equal(rel.descriptor, 'Ambos articulan renovación y continuidad cíclica');
});

test('esa arista dispara la marca de lectura del autor', () => {
  const rel = bySlug('we-tripantu').relationships.find((r) => r.id === 'return');
  assert.equal(isAuthorReading(rel), true);
  assert.equal(isAuthorReading({ validity: 'CANONICAL' }), false);
});

test('la marca es llana, dice que es analogía y no usa la palabra prohibida', () => {
  assert.match(AUTHOR_READING_NOTE, /Lectura del autor/);
  assert.match(AUTHOR_READING_NOTE, /Analogía/);
  assert.doesNotMatch(AUTHOR_READING_NOTE, /aut[eé]ntic/i);
});
