#!/usr/bin/env node
/**
 * KODEX-∞ · Genera el registro del Atlas para el frontend.
 *
 * Toma los derivados de Bridge 1 (nodes/edges/sources/claims del Visual Atlas) y emite
 * UN archivo: src/data/kodex/atlas-registry.json
 *
 * POR QUÉ UN SOLO ARCHIVO Y NO 600 EN src/data/kodex/nodes/
 * --------------------------------------------------------
 * `getKodexNodes()` lee ese directorio y sus nodos alimentan rutas. Los registros del
 * Atlas no traen `summary`, `proposition`, `visualAnchor` ni `behavior`: son inventario,
 * no nodos publicables. Volcarlos ahí generaría cientos de páginas incompletas.
 *
 * El registro es consultable (lib/kodex/atlas.ts) sin ser renderizable. Un registro del
 * Atlas se PROMUEVE a nodo cuando alguien le escribe el contenido que le falta.
 *
 * Uso:
 *   node scripts/build-kodex-atlas-registry.mjs <dir-con-artefactos-bridge1>
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('uso: node scripts/build-kodex-atlas-registry.mjs <dir-bridge1>');
  process.exit(1);
}

const out = path.join(process.cwd(), 'src/data/kodex/atlas-registry.json');

const read = async (name) => JSON.parse(await readFile(path.join(src, name), 'utf-8'));

const [nodes, edges, sources, claims] = await Promise.all([
  read('nodes.json'),
  read('edges.json'),
  read('sources.json'),
  read('claims.json'),
]);

const sourceById = new Map(sources.sources.map((s) => [s.id, s]));

// Un claim sostiene nodos; damos la vuelta al índice para que el nodo sepa qué lo sostiene.
const claimsByNode = new Map();
for (const c of claims.claims) {
  for (const nid of c.relatedNodes ?? []) {
    if (!claimsByNode.has(nid)) claimsByNode.set(nid, []);
    claimsByNode.get(nid).push(c.id);
  }
}

const sourceByNode = new Map();
for (const e of edges.edges) {
  if (e.relation === 'SOURCED_FROM') sourceByNode.set(e.from, e.to);
}

const registry = nodes.nodes.map((n) => {
  const claimIds = claimsByNode.get(n.id) ?? [];
  const srcId = sourceByNode.get(n.id);
  const src = srcId ? sourceById.get(srcId) : undefined;

  // Un nodo hereda el estatus cultural más restrictivo de lo que lo sostiene.
  const statuses = [
    src?.culturalStatus,
    ...claimIds.map((id) => sourceById.get(id.replace('CLM-', 'SRC-'))?.culturalStatus),
  ].filter(Boolean);
  const culturalStatus = statuses.includes('AUTHORIZATION_REQUIRED')
    ? 'AUTHORIZATION_REQUIRED'
    : statuses.includes('REVIEW_REQUIRED')
      ? 'REVIEW_REQUIRED'
      : 'STANDARD';

  return {
    id: n.id,
    type: n.type,
    label: n.label,
    ...(n.coordinate ? { coordinate: n.coordinate } : {}),
    ...(n.functionCategory ? { functionCategory: n.functionCategory } : {}),
    ...(n.primaryConcept ? { primaryConcept: n.primaryConcept } : {}),
    ...(n.symbols?.length ? { symbols: n.symbols } : {}),
    ...(n.mapZones?.length ? { mapZones: n.mapZones } : {}),
    epistemic: {
      domains: n.domains ?? [],
      claimClass: n.claimClass ?? 'UNKNOWN',
      culturalStatus,
      claims: claimIds,
      ...(srcId ? { sourceIds: [srcId] } : {}),
    },
    /** Publicable solo si tiene procedencia y no requiere autorización pendiente. */
    publishable: Boolean(srcId) && culturalStatus !== 'AUTHORIZATION_REQUIRED',
  };
});

const payload = {
  generatedFrom: 'Bridge 1 — Visual Atlas Master',
  doNotEditByHand: true,
  regenerate: 'node scripts/build-kodex-atlas-registry.mjs <dir-bridge1>',
  count: registry.length,
  publishable: registry.filter((r) => r.publishable).length,
  entries: registry.sort((a, b) => a.id.localeCompare(b.id)),
};

await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(payload, null, 2) + '\n', 'utf-8');

const byStatus = registry.reduce((acc, r) => {
  acc[r.epistemic.culturalStatus] = (acc[r.epistemic.culturalStatus] ?? 0) + 1;
  return acc;
}, {});

console.log(`[kodex] atlas-registry.json → ${registry.length} registros`);
console.log(`[kodex] publicables: ${payload.publishable}`);
console.log('[kodex] estatus cultural:', byStatus);
