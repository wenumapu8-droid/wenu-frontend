import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../docs/kodex/visual-assembly');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const fail = (message) => { console.error(`KODEX Visual Specimen Viewport FAIL: ${message}`); process.exit(1); };
const assert = (condition, message) => { if (!condition) fail(message); };

const schema = read('visual_specimen_viewport.schema.json');
const example = read('examples/specimen-viewport.ocn-cir-001.internal.json');
const snapshot = read('source-snapshots/ocin-a-candidates-2026-08-14.json');
const registry = read('visual_component_registry.json');
const recipes = read('layout_recipes.json');
const sceneIndex = read('scene-packs/INDEX.json');

assert(schema.title === 'KODEX Visual Specimen Viewport v0.1', 'unexpected schema title');
assert(schema.additionalProperties === false, 'viewport contract must reject ad-hoc root fields');
assert(example.schema === 'kdx.visual-specimen-viewport.v0.1', 'example schema mismatch');
assert(example.execution_scope === 'INTERNAL_ONLY', 'blocked source example must remain internal only');
assert(example.fallback?.required === true && example.fallback?.semantic_path_preserved === true, 'fallback must be mandatory and semantic');
assert(example.loop?.semantic_motion_dependency === false, 'motion cannot carry semantics alone');
assert(example.motion_mode === 'OFF' ? example.loop?.enabled === false : true, 'OFF mode cannot keep a continuous loop enabled');
assert(example.layers.includes('SOURCE_MASTER'), 'viewport must keep SOURCE_MASTER addressable');
assert(!example.layers.includes('SOURCE_DERIVATIVE'), 'example must not introduce a source derivative');

const source = snapshot.works.find((entry) => entry.id === example.source_resolution.id);
assert(source, `source ${example.source_resolution.id} missing from dated snapshot`);
assert(source.public_export_allowed === false, 'test source is expected to be public-export blocked');
assert(example.source_resolution.public_export_allowed === source.public_export_allowed, 'viewport cannot override source export permission');
assert(example.source_resolution.resolution_status === 'RESOLVED', 'snapshot-grounded source should be resolved, even while public export is blocked');

const sourceAllowed = new Set(source.allowed_transformations);
for (const transform of example.source_resolution.allowed_transformations) {
  assert(sourceAllowed.has(transform), `source resolution invents transformation ${transform}`);
}
for (const transform of example.applied_transformations ?? []) {
  assert(sourceAllowed.has(transform), `viewport applies unauthorized transformation ${transform}`);
}

const componentById = new Map(registry.components.map((entry) => [entry.id, entry]));
for (const id of example.component_ids ?? []) {
  assert(componentById.has(id), `viewport references unknown component ${id}`);
}

const recipeIds = new Set(recipes.map((entry) => entry.id));
assert(recipeIds.has(example.recipe_id), `viewport references unknown recipe ${example.recipe_id}`);
const visualModes = new Set(sceneIndex.packs.map((entry) => entry.visual_mode));
assert(visualModes.has(example.visual_mode), `viewport references unknown visual mode ${example.visual_mode}`);

const sceneName = example.visual_mode.replace(/^\d+_/, '');
assert(source.scenes.includes(sceneName), `${source.id} is not mapped to ${sceneName} in the dated source snapshot`);

if (example.execution_scope === 'PUBLIC_ELIGIBLE') {
  assert(example.source_resolution.resolution_status === 'RESOLVED', 'public viewport source must be resolved');
  assert(example.source_resolution.public_export_allowed === true, 'public viewport source must be explicitly export-allowed');
}

console.log(JSON.stringify({
  ok: true,
  contract: example.schema,
  sourceId: source.id,
  executionScope: example.execution_scope,
  publicExportAllowed: example.source_resolution.public_export_allowed,
  presentationMode: example.presentation_mode,
  recipeId: example.recipe_id,
  governedComponents: example.component_ids.length,
  fallback: example.fallback.mode,
}, null, 2));
