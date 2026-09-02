/**
 * Tests del REGISTRO DE LAMINAS Y LABS.
 *
 * El registry es la fuente de verdad canonica del LOTE C del TELAR.
 * Cualquier drift entre el registry y el filesystem (una lamina borrada
 * que sigue declarada, una lamina agregada que no se registro) queda
 * bloqueado por este suite antes de commit.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  LAMINA_REGISTRY,
  conteoPorEstado,
  laminasDeEscena,
  laminaPorSlug,
  laminasAmbiguas,
} from './lamina-registry.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..', '..');
const LAMINA_DIR = join(REPO, 'src', 'pages', 'kodex', 'lamina');
const LAB_DIR = join(REPO, 'src', 'pages', 'kodex', 'lab');

describe('lamina-registry · fuente de verdad de LOTE C', () => {
  it('cada entrada del registry apunta a un archivo real en disco', () => {
    for (const e of LAMINA_REGISTRY) {
      const full = join(REPO, e.path);
      assert.ok(
        existsSync(full),
        `${e.slug}: declarado en registry pero el archivo no existe (${e.path})`,
      );
    }
  });

  it('cada .astro real de lamina/ (excepto index/kit) esta en el registry', () => {
    const files = readdirSync(LAMINA_DIR)
      .filter((f) => f.endsWith('.astro') && !['index.astro', 'kit.astro'].includes(f));
    const registrados = new Set(
      LAMINA_REGISTRY.filter((e) => e.kind === 'lamina').map((e) => `${e.slug}.astro`),
    );
    for (const f of files) {
      assert.ok(registrados.has(f), `${f} existe en disco pero no en registry`);
    }
  });

  it('slugs son unicos', () => {
    const slugs = LAMINA_REGISTRY.map((e) => e.slug);
    assert.equal(new Set(slugs).size, slugs.length, 'slug duplicado en registry');
  });

  it('paths son unicos', () => {
    const paths = LAMINA_REGISTRY.map((e) => e.path);
    assert.equal(new Set(paths).size, paths.length, 'path duplicado en registry');
  });

  it('cada entrada tiene una razon no vacia', () => {
    for (const e of LAMINA_REGISTRY) {
      assert.ok(e.reason && e.reason.length > 0, `${e.slug}: reason vacio`);
    }
  });

  it('VIVO siempre trae scene declarada', () => {
    for (const e of LAMINA_REGISTRY) {
      if (e.status === 'VIVO') {
        assert.ok(e.scene, `${e.slug} es VIVO pero sin scene`);
      }
    }
  });

  it('ARCHIVO/AMBIGUA/HUECO NO traen scene', () => {
    for (const e of LAMINA_REGISTRY) {
      if (e.status !== 'VIVO') {
        assert.ok(
          !e.scene,
          `${e.slug} es ${e.status} pero declara scene ${e.scene}`,
        );
      }
    }
  });

  it('todos los labs son ARCHIVO (regla canonica preexistente)', () => {
    for (const e of LAMINA_REGISTRY) {
      if (e.kind === 'lab') {
        assert.equal(
          e.status, 'ARCHIVO',
          `lab ${e.slug} no es ARCHIVO: ${e.status}. Regla dura: lab = biblioteca.`,
        );
      }
    }
  });

  it('conteoPorEstado suma exactamente el total del registry', () => {
    const c = conteoPorEstado();
    const total = c.VIVO + c.HUECO + c.ARCHIVO + c.AMBIGUA;
    assert.equal(total, LAMINA_REGISTRY.length);
  });

  it('hay 5 VIVO (las t01-* montadas en LaminaOrganismo)', () => {
    const c = conteoPorEstado();
    assert.equal(c.VIVO, 5, `esperaba 5 VIVO, hay ${c.VIVO}`);
  });

  it('laminasDeEscena(PROLOGUE) devuelve al menos 1 lamina montada', () => {
    const ns = laminasDeEscena('PROLOGUE');
    assert.ok(ns.length >= 1, 'PROLOGUE sin ninguna lamina montada');
    for (const e of ns) assert.equal(e.status, 'VIVO');
  });

  it('cada escena del corredor donde hay VIVO se refleja en laminasDeEscena', () => {
    const escenas = ['THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN'] as const;
    for (const s of escenas) {
      const ns = laminasDeEscena(s);
      for (const e of ns) {
        assert.equal(e.status, 'VIVO', `${s}: ${e.slug} no es VIVO`);
        assert.equal(e.scene, s);
      }
    }
  });

  it('laminaPorSlug encuentra por slug real', () => {
    const e = laminaPorSlug('t01-02-observation-eye');
    assert.ok(e);
    assert.equal(e!.status, 'VIVO');
    assert.equal(e!.scene, 'PROLOGUE');
  });

  it('laminaPorSlug devuelve undefined para slug ausente', () => {
    assert.equal(laminaPorSlug('no-existe'), undefined);
  });

  it('laminasAmbiguas devuelve exactamente las bloqueadas en curaduria', () => {
    const amb = laminasAmbiguas();
    for (const e of amb) {
      assert.equal(e.status, 'AMBIGUA');
      // No deben tener scene asignada (regla dura anti-inferencia).
      assert.ok(!e.scene, `AMBIGUA ${e.slug} tiene scene asignada`);
    }
  });
});
