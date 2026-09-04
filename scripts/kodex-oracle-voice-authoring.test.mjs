import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { ORACLE_CUES, ORACLE_VOICE_ID } from '../src/lib/kodex/oracle/oracle-script.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const manifestPath = path.join(ROOT, 'data/kodex/oracle-voice-authoring.v0.1.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

const runtimeCuesById = new Map(
  Object.values(ORACLE_CUES).map((cue) => [cue.id, cue]),
);

test('KDX.ORACLE voice authoring remains authoring-only and non-canonical', () => {
  assert.equal(manifest.status, 'AUTHORING_ONLY_NOT_CANON');
  assert.equal(manifest.model.runtimeUse, 'AUTHORING_ONLY');
  assert.equal(manifest.model.visitorModelDownload, false);
  assert.equal(manifest.identity.targetId, 'KDX_F01');
  assert.equal(manifest.identity.currentRuntimeId, 'KDX_F01_DEV_TEMP');
  assert.equal(ORACLE_VOICE_ID, manifest.identity.currentRuntimeId);
  assert.equal(manifest.identity.voiceCloning, false);
  assert.equal(manifest.outputPolicy.automaticProductionPromotion, false);
});

test('authoring corpus is exactly reconciled to runtime Oracle cues', () => {
  assert.equal(manifest.cues.length, runtimeCuesById.size);

  for (const authored of manifest.cues) {
    const runtime = runtimeCuesById.get(authored.id);
    assert.ok(runtime, `missing runtime cue ${authored.id}`);
    assert.equal(authored.scene, runtime.scene, `${authored.id} scene drift`);
    assert.equal(authored.event, runtime.event, `${authored.id} event drift`);
    assert.equal(authored.text, runtime.text, `${authored.id} text drift`);
    assert.equal(authored.runtimePath, runtime.audio, `${authored.id} audio path drift`);
    assert.match(authored.authoringStem, /^[a-z0-9-]+$/);
  }
});

test('audition set is bounded and cannot silently become final voice canon', () => {
  assert.ok(Array.isArray(manifest.auditionVoices));
  assert.ok(manifest.auditionVoices.length >= 2);
  assert.ok(manifest.auditionVoices.length <= 8);
  assert.ok(manifest.auditionVoices.every((voice) => typeof voice === 'string' && voice.length > 0));
  assert.ok(manifest.outputPolicy.requiredBeforePromotion.includes('creator_perceptual_acceptance'));
  assert.ok(manifest.outputPolicy.requiredBeforePromotion.includes('asset_sha256_manifest'));
  assert.ok(manifest.outputPolicy.requiredBeforePromotion.includes('browser_audio_visual_gate'));
  assert.match(ORACLE_VOICE_ID, /DEV_TEMP$/);
});

test('epistemic boundary stays explicit', () => {
  const boundary = manifest.epistemicBoundary.join(' ').toLowerCase();
  for (const forbidden of ['identity', 'emotion', 'destiny', 'spiritual', 'personal-meaning']) {
    assert.ok(boundary.includes(forbidden), `missing explicit boundary for ${forbidden}`);
  }
});
