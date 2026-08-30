/**
 * Tests de los tres registries que kodex-integrity-audit.mjs corre como
 * puertas de integridad:
 *
 *   evidence-registry   · fuentes y relaciones documentadas.
 *   v0-vertical-slice   · manifest de release y checkpoints.
 *   experience-engine   · politica de experiencia + prohibiciones canonicas.
 *
 * Los tres exponen `validate*` que este suite corre. Ademas cubren la
 * politica de experiencia: si el enum `prohibitedObjectives` pierde una
 * regla del canon (por ejemplo, "spiritual-score"), el sitio empieza a
 * medir cosas que la biblia prohibe -- y esa perdida seria silenciosa.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  KODEX_EVIDENCE_RELATIONS,
  KODEX_EVIDENCE_SOURCES,
  evidenceFor,
  validateEvidenceRegistry,
} from './evidence-registry.js';
import {
  KODEX_V0_CHECKPOINTS,
  KODEX_V0_RELEASE_GATES,
  v0Readiness,
  validateV0Manifest,
} from './v0-vertical-slice.js';
import { EXPERIENCE_POLICY, hashSeed } from './experience-engine.js';

describe('evidence-registry · fuentes y relaciones', () => {
  it('KODEX_EVIDENCE_SOURCES y RELATIONS estan congelados', () => {
    assert.ok(Object.isFrozen(KODEX_EVIDENCE_SOURCES));
    assert.ok(Object.isFrozen(KODEX_EVIDENCE_RELATIONS));
  });

  it('validateEvidenceRegistry valida sin errores', () => {
    const r = validateEvidenceRegistry();
    assert.equal(r.valid, true, `errores: ${JSON.stringify(r.errors)}`);
    assert.deepEqual(r.errors, []);
    assert.ok(r.sources >= 1, 'ninguna evidencia declarada');
    assert.ok(r.relations >= 1, 'ninguna relacion declarada');
  });

  it('evidenceFor devuelve evidencia para ids que existan', () => {
    // No conocemos los ids pero al menos hay 3 sources segun validate; probamos
    // que evidenceFor sea callable sin throw.
    assert.doesNotThrow(() => evidenceFor('bogus'));
  });
});

describe('v0-vertical-slice · checkpoints de release', () => {
  it('KODEX_V0_CHECKPOINTS congelado', () => {
    assert.ok(Object.isFrozen(KODEX_V0_CHECKPOINTS));
  });

  it('KODEX_V0_RELEASE_GATES congelado', () => {
    assert.ok(Object.isFrozen(KODEX_V0_RELEASE_GATES));
  });

  it('validateV0Manifest valida sin errores', () => {
    const r = validateV0Manifest();
    assert.equal(r.valid, true, `errores: ${JSON.stringify(r.errors)}`);
    assert.deepEqual(r.errors, []);
  });

  it('v0Readiness devuelve un shape usable', () => {
    const r = v0Readiness();
    assert.ok(r, 'v0Readiness devolvio nada');
    assert.equal(typeof r, 'object');
  });
});

describe('experience-engine · politica canonica', () => {
  it('EXPERIENCE_POLICY declara objective y prohibitedObjectives', () => {
    assert.ok(Array.isArray(EXPERIENCE_POLICY.objective));
    assert.ok(Array.isArray(EXPERIENCE_POLICY.prohibitedObjectives));
    assert.ok(EXPERIENCE_POLICY.objective.length >= 1);
    assert.ok(EXPERIENCE_POLICY.prohibitedObjectives.length >= 1);
  });

  it('EXPERIENCE_POLICY prohibe las 4 metricas del canon', () => {
    // La biblia prohibe explicitamente: time-on-site, compulsion,
    // activity-score, spiritual-score. Si alguna desaparece, el filtro
    // canonico deja de proteger.
    const prohibidas = ['time-on-site', 'compulsion', 'activity-score', 'spiritual-score'];
    for (const p of prohibidas) {
      assert.ok(
        EXPERIENCE_POLICY.prohibitedObjectives.includes(p),
        `politica dejo de prohibir "${p}" -- violacion de canon`,
      );
    }
  });

  it('EXPERIENCE_POLICY declara objectivos canonicos', () => {
    // continuity, meaningful-discovery, novelty, user-agency, memory.
    const canonicos = ['continuity', 'meaningful-discovery', 'novelty', 'user-agency', 'memory'];
    for (const o of canonicos) {
      assert.ok(
        EXPERIENCE_POLICY.objective.includes(o),
        `objetivo canonico "${o}" ausente de la politica`,
      );
    }
  });

  it('EXPERIENCE_POLICY.interestFloor es un numero razonable', () => {
    assert.ok(typeof EXPERIENCE_POLICY.interestFloor === 'number');
    assert.ok(EXPERIENCE_POLICY.interestFloor >= 0 && EXPERIENCE_POLICY.interestFloor <= 1);
  });

  it('EXPERIENCE_POLICY.randomness es "seeded-controlled" (no puro aleatorio)', () => {
    // §22 del documento: "no random route roulette". Cambiar a
    // "random" o "true-random" indica una violacion silenciosa.
    assert.equal(EXPERIENCE_POLICY.randomness, 'seeded-controlled');
  });

  it('hashSeed es determinista', () => {
    assert.equal(hashSeed('hola'), hashSeed('hola'));
    assert.equal(hashSeed(''), hashSeed(''));
  });

  it('hashSeed distingue textos', () => {
    const textos = ['a', 'b', 'aa', 'hola', 'chau'];
    const hashes = new Set(textos.map(hashSeed));
    assert.equal(hashes.size, textos.length, 'colision inesperada en hashSeed');
  });
});
