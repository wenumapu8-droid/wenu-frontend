/**
 * KODEX-∞ · NODOS DEL ATLAS EN PROMOCIÓN
 *
 * Los 54 nodos que el autor declaró en el Visual Atlas, más las 74 aristas que escribió
 * a mano entre ellos.
 *
 * POR QUÉ VIVEN APARTE DE `nodes/`
 * --------------------------------
 * `pages/kodex/vol/[slug].astro` convierte cada archivo de `src/data/kodex/nodes/` en una
 * ruta. Estos 54 traen `summary` —la función que escribió el autor— pero les falta
 * `proposition`, `visualAnchor.label` y `editorial.body`. Publicarlos ahora serían 54
 * páginas a medio escribir.
 *
 * Así que esperan acá, completos, validados contra `kodex-node.schema.json` y consultables.
 * Cada uno declara en `pending` exactamente qué le falta.
 *
 * PROMOVER UN NODO
 * ----------------
 * 1. Escribirle los campos de `pending`.
 * 2. Vaciar `pending`.
 * 3. Mover el archivo a `src/data/kodex/nodes/`.
 *
 * La ruta aparece sola. No hay que tocar código.
 *
 * Regenerar: `python3 scripts/build-kodex-nodes.py <atlas-export> -o <dir> --claims <claims>`
 */

import type { KodexNode } from './nodes';
import authoredEdges from '../../data/kodex/authored-edges.json';

export interface AtlasNode extends KodexNode {
  /** Estado declarado por el autor: CANON · CANON_CANDIDATE · NEEDS_PROVENANCE… */
  atlasStatus: string;
  /** Campos que un humano todavía tiene que escribir. Vacío = listo para promover. */
  pending: string[];
  publishable: boolean;
}

export interface AuthoredEdge {
  from: string;
  relation: string;
  to: string;
  descriptor?: string | null;
  /** CANONICAL · VALID · HYPOTHESIS · NEEDS_CULTURAL_REVIEW */
  validity: string;
}

const edges = (authoredEdges as { edges: AuthoredEdge[] }).edges;

/**
 * Carga los nodos en promoción. Igual que `getKodexNodes()`, lee el filesystem en build.
 */
export async function getAtlasNodes(): Promise<AtlasNode[]> {
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const dir = new URL('../../data/kodex/nodes-atlas', import.meta.url).pathname;

    let files: string[] = [];
    try {
      files = await fs.readdir(dir);
    } catch {
      return [];
    }

    const nodes: AtlasNode[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        nodes.push(JSON.parse(await fs.readFile(path.join(dir, file), 'utf-8')) as AtlasNode);
      } catch (err) {
        console.error(`[kodex] nodo del atlas ilegible: ${file}`, err);
      }
    }
    return nodes.sort((a, b) => a.id.localeCompare(b.id));
  } catch {
    return [];
  }
}

/** Las aristas que escribió el autor. 33 tipos de relación entre 54 nodos. */
export function authoredEdgesFrom(nodeId: string): AuthoredEdge[] {
  return edges.filter((e) => e.from === nodeId);
}

export function authoredEdgesTo(nodeId: string): AuthoredEdge[] {
  return edges.filter((e) => e.to === nodeId);
}

export function allAuthoredEdges(): readonly AuthoredEdge[] {
  return edges;
}

/**
 * Aristas cuyo destino no está declarado como nodo en el Atlas.
 * No son un error del grafo: son huecos reales que el autor todavía no cerró.
 * La ausencia se muestra, no se rellena.
 */
export function danglingTargets(nodes: AtlasNode[]): AuthoredEdge[] {
  const declared = new Set(nodes.map((n) => n.id));
  return edges.filter((e) => !declared.has(e.to));
}

/** Listos para promover: sin campos pendientes y sin autorización cultural en trámite. */
export function readyForPromotion(nodes: AtlasNode[]): AtlasNode[] {
  return nodes.filter(
    (n) => n.pending.length === 0
      && n.epistemic?.culturalStatus !== 'AUTHORIZATION_REQUIRED',
  );
}
