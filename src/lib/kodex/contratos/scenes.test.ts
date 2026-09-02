/**
 * Tests de integridad de los Scene Contracts.
 *
 * El schema de `src/content.config.ts` valida FORMA (regex de scene_id,
 * campos requeridos). Este suite valida CONTENIDO CRUZADO — cosas que el
 * schema no puede verificar solo:
 *
 *   T1 · las 7 escenas del corredor tienen exactamente los 7 IDs canonicos.
 *   T2 · position, route y scene_id son coherentes entre si (00 -> THR ->
 *        /kodex/, 01 -> PRO -> /kodex/folio/i/, ...).
 *   T3 · cada atlas_concept declarado existe en kodex-atlas.json.
 *   T4 · owned_files declarados existen en el repo (los que son strings; los
 *        `{ shared: ... }` se validan como shared).
 *   T5 · visible_states tiene tamaño razonable (5 o 6).
 *   T6 · runtime_mapping cubre todos los visible_states (menos las notes).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import yaml from 'js-yaml';
import atlas from '../../../data/kodex-atlas.json' with { type: 'json' };

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..', '..');
const CONTRACTS_DIR = join(REPO, 'src', 'content', 'scenes');

interface RawContract {
  scene_id: string;
  route: string;
  position: string;
  canonical_copy: { source: string; title: string; subtitle?: string };
  cta?: { source: string; label: string };
  visible_states: string[];
  runtime_mapping?: Record<string, string>;
  owned_files?: Array<string | { shared: string }>;
  forbidden_files?: string[];
  atlas_concepts?: string[];
}

const ARCHIVOS = [
  'scene.00-threshold.yaml',
  'scene.01-prologue.yaml',
  'scene.02-descent.yaml',
  'scene.03-archive.yaml',
  'scene.04-machine.yaml',
  'scene.05-cosmology.yaml',
  'scene.06-return.yaml',
];

const CANONICO = [
  { pos: '00 / 06', letras: 'THR', route: '/kodex/' },
  { pos: '01 / 06', letras: 'PRO', route: '/kodex/folio/i/' },
  { pos: '02 / 06', letras: 'DES', route: '/kodex/folio/ii/' },
  { pos: '03 / 06', letras: 'ARC', route: '/kodex/folio/iii/' },
  { pos: '04 / 06', letras: 'MAC', route: '/kodex/folio/iv/' },
  { pos: '05 / 06', letras: 'COS', route: '/kodex/folio/v/' },
  { pos: '06 / 06', letras: 'RET', route: '/kodex/folio/vi/' },
];

function cargar(nombre: string): RawContract {
  const raw = readFileSync(join(CONTRACTS_DIR, nombre), 'utf8');
  return yaml.load(raw) as RawContract;
}

const CONTRATOS: RawContract[] = ARCHIVOS.map(cargar);
const IDS_ATLAS = new Set(
  (atlas as { nodos: Array<{ id: string }> }).nodos.map((n) => n.id),
);

describe('Scene Contracts · integridad cruzada', () => {
  it('T1 · las 7 escenas del corredor cargan sin excepcion', () => {
    assert.equal(CONTRATOS.length, 7);
    for (const c of CONTRATOS) assert.ok(c.scene_id, 'scene_id requerido');
  });

  it('T2 · position, scene_id y route son coherentes', () => {
    for (let i = 0; i < 7; i++) {
      const c = CONTRATOS[i];
      const esperada = CANONICO[i];
      assert.equal(c.position, esperada.pos, `contrato ${i}: position`);
      assert.ok(
        c.scene_id.includes(esperada.letras),
        `contrato ${i}: scene_id "${c.scene_id}" debe incluir "${esperada.letras}"`,
      );
      assert.equal(c.route, esperada.route, `contrato ${i}: route`);
    }
  });

  it('T3 · atlas_concepts declarados existen en kodex-atlas.json', () => {
    for (const c of CONTRATOS) {
      const conceptos = c.atlas_concepts ?? [];
      for (const id of conceptos) {
        assert.ok(
          IDS_ATLAS.has(id),
          `${c.scene_id} declara ${id} pero no existe en kodex-atlas.json`,
        );
      }
    }
  });

  it('T4 · owned_files no-shared existen en el repo', () => {
    for (const c of CONTRATOS) {
      for (const f of c.owned_files ?? []) {
        if (typeof f === 'string') {
          const ruta = join(REPO, f);
          assert.ok(
            existsSync(ruta),
            `${c.scene_id} declara owned_files["${f}"] pero no existe`,
          );
        } else if (f && typeof f === 'object' && 'shared' in f) {
          const ruta = join(REPO, f.shared);
          assert.ok(
            existsSync(ruta),
            `${c.scene_id} declara shared["${f.shared}"] pero no existe`,
          );
        }
      }
    }
  });

  it('T5 · visible_states tiene 5 o 6 elementos', () => {
    for (const c of CONTRATOS) {
      const n = c.visible_states.length;
      assert.ok(
        n === 5 || n === 6,
        `${c.scene_id}: visible_states debe ser 5 o 6, tiene ${n}`,
      );
    }
  });

  it('T6 · runtime_mapping cubre todos los visible_states', () => {
    for (const c of CONTRATOS) {
      if (!c.runtime_mapping) continue;
      const claves = Object.keys(c.runtime_mapping).filter((k) => k !== 'note');
      const faltantes = c.visible_states.filter(
        (v) => !(v in c.runtime_mapping!),
      );
      assert.deepEqual(
        faltantes,
        [],
        `${c.scene_id}: runtime_mapping no cubre ${faltantes.join(', ')}`,
      );
    }
  });

  it('canonical_copy.source y cta.source estan declarados', () => {
    for (const c of CONTRATOS) {
      assert.ok(
        c.canonical_copy.source && c.canonical_copy.source.length > 0,
        `${c.scene_id}: canonical_copy.source vacio`,
      );
      if (c.cta) {
        assert.ok(
          c.cta.source && c.cta.source.length > 0,
          `${c.scene_id}: cta.source vacio`,
        );
      }
    }
  });
});
