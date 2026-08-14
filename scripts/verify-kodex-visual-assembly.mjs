import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../docs/kodex/visual-assembly');
const packsDir = path.join(root, 'scene-packs');

const fail = (message) => {
  console.error(`KODEX Visual Assembly contract FAIL: ${message}`);
  process.exit(1);
};

const assert = (condition, message) => {
  if (!condition) fail(message);
};

const readJson = (file) => {
  const full = path.join(root, file);
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    fail(`${file} is not valid JSON: ${error.message}`);
  }
};

const index = readJson('scene-packs/INDEX.json');
const recipes = readJson('layout_recipes.json');
const schema = readJson('assembly_candidate.schema.json');

assert(index.schema === 'kdx.visual-scene-pack.v0.2', 'unexpected scene-pack schema');
assert(index.topology_authority === false, 'visual scene packs must never claim canonical topology authority');
assert(Array.isArray(index.packs) && index.packs.length === 7, 'exactly seven visual mode packs are expected in v0.2');

assert(Array.isArray(recipes) && recipes.length === 7, 'exactly seven composition recipes are expected in v0.2');
const recipeIds = new Set(recipes.map((recipe) => recipe.id));
assert(recipeIds.size === recipes.length, 'recipe IDs must be unique');
for (const recipe of recipes) {
  assert(/^RCP-[A-Z0-9-]+$/.test(recipe.id), `invalid recipe ID ${recipe.id}`);
  assert(Array.isArray(recipe.layer_order) && recipe.layer_order.length > 0, `${recipe.id} needs a layer order`);
  assert(recipe.accent_limit === 1, `${recipe.id} must preserve single-accent discipline in v0.2`);
}

const visualModes = new Set();
const referencedVisualIds = new Set();
let ocinCandidateCount = 0;

for (const ref of index.packs) {
  const file = path.join('scene-packs', ref.file);
  const pack = readJson(file);
  assert(pack.schema === index.schema, `${ref.file} schema mismatch`);
  assert(pack.visual_mode === ref.visual_mode, `${ref.file} visual_mode mismatch`);
  assert(!visualModes.has(pack.visual_mode), `duplicate visual mode ${pack.visual_mode}`);
  visualModes.add(pack.visual_mode);
  assert(pack.status === 'EXPERIMENTAL', `${pack.visual_mode} must remain EXPERIMENTAL until accepted`);
  assert(pack.epistemic_status === 'SPECULATIVE', `${pack.visual_mode} epistemic status must remain explicit`);
  assert(pack.runtime_status === 'NOT_IMPLEMENTED_BY_THIS_PACK', `${pack.visual_mode} cannot claim runtime implementation`);
  assert(recipeIds.has(pack.recipe_primary), `${pack.visual_mode} references unknown primary recipe ${pack.recipe_primary}`);
  assert(recipeIds.has(pack.recipe_secondary), `${pack.visual_mode} references unknown secondary recipe ${pack.recipe_secondary}`);
  assert(Array.isArray(pack.component_shortlist) && pack.component_shortlist.length > 0, `${pack.visual_mode} needs component shortlist`);
  for (const component of pack.component_shortlist) {
    assert(/^KDX-VIS-[0-9]{4}$/.test(component.stable_id), `${pack.visual_mode} has invalid KDX-VIS ID ${component.stable_id}`);
    assert(component.production_gate === 'READY_CONDITIONAL', `${component.stable_id} must remain conditional before canonical merge`);
    referencedVisualIds.add(component.stable_id);
  }
  assert(Array.isArray(pack.ocin_candidates), `${pack.visual_mode} ocin_candidates must be an array`);
  assert(pack.ocin_candidates.length === ref.ocin_candidate_count, `${pack.visual_mode} candidate count differs from INDEX.json`);
  for (const work of pack.ocin_candidates) {
    assert(/^OCN-/.test(work.ocin_id), `${pack.visual_mode} has invalid Ocín source ID ${work.ocin_id}`);
    assert(work.public_export_rule === 'CHECK_CANONICAL_REGISTRY', `${work.ocin_id} must defer export rights to canonical registry`);
    ocinCandidateCount += 1;
  }
  assert(Array.isArray(pack.hard_rules) && pack.hard_rules.length >= 6, `${pack.visual_mode} is missing hard governance rules`);
}

assert(schema.title === 'KODEX Assembly Candidate v0.2', 'assembly schema title mismatch');
assert(schema.properties?.provenance_check, 'assembly schema must require provenance state');
assert(schema.properties?.components, 'assembly schema must define governed visual components');

console.log(JSON.stringify({
  ok: true,
  visualModes: visualModes.size,
  recipes: recipeIds.size,
  referencedVisualIds: referencedVisualIds.size,
  ocinCandidateReferences: ocinCandidateCount,
  topologyAuthority: index.topology_authority,
}, null, 2));
