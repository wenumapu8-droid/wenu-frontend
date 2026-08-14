import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../docs/kodex/visual-assembly');

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
const registry = readJson('visual_component_registry.json');

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

assert(registry.schema === 'kdx.visual-component-registry.v0.2', 'unexpected visual component registry schema');
assert(registry.status === 'RESERVED_PENDING_CANONICAL_MERGE', 'component registry must remain pending canonical merge');
assert(registry.component_count === 77, 'v0.2 component registry must contain 77 components');
assert(Array.isArray(registry.components) && registry.components.length === registry.component_count, 'component_count differs from registry length');
assert(registry.shared_policy?.source_class === 'GENERATED', 'visual components must remain explicitly GENERATED');
assert(registry.shared_policy?.epistemic_status === 'SPECULATIVE', 'visual components must remain explicitly SPECULATIVE');
assert(registry.shared_policy?.production_gate === 'READY_CONDITIONAL', 'visual components must remain READY_CONDITIONAL');
assert(registry.shared_policy?.forbidden_transformations?.includes('claim_as_traditional_symbol'), 'registry must prohibit traditional-symbol claims');
assert(registry.shared_policy?.forbidden_transformations?.includes('use_as_scientific_evidence'), 'registry must prohibit scientific-evidence claims');

const registryById = new Map();
const registrySlugs = new Set();
for (const [indexNumber, component] of registry.components.entries()) {
  const expectedId = `KDX-VIS-${String(indexNumber + 1).padStart(4, '0')}`;
  assert(component.id === expectedId, `component sequence break: expected ${expectedId}, found ${component.id}`);
  assert(/^KDX-VIS-[0-9]{4}$/.test(component.id), `invalid component ID ${component.id}`);
  assert(typeof component.slug === 'string' && component.slug.length > 0, `${component.id} missing slug`);
  assert(typeof component.family === 'string' && component.family.length > 0, `${component.id} missing family`);
  assert(!registryById.has(component.id), `duplicate component ID ${component.id}`);
  assert(!registrySlugs.has(component.slug), `duplicate component slug ${component.slug}`);
  registryById.set(component.id, component);
  registrySlugs.add(component.slug);
}

const visualModes = new Set();
const referencedVisualIds = new Set();
const scenePacks = new Map();
let ocinCandidateCount = 0;

for (const ref of index.packs) {
  const file = path.join('scene-packs', ref.file);
  const pack = readJson(file);
  assert(pack.schema === index.schema, `${ref.file} schema mismatch`);
  assert(pack.visual_mode === ref.visual_mode, `${ref.file} visual_mode mismatch`);
  assert(!visualModes.has(pack.visual_mode), `duplicate visual mode ${pack.visual_mode}`);
  visualModes.add(pack.visual_mode);
  scenePacks.set(pack.visual_mode, pack);
  assert(pack.status === 'EXPERIMENTAL', `${pack.visual_mode} must remain EXPERIMENTAL until accepted`);
  assert(pack.epistemic_status === 'SPECULATIVE', `${pack.visual_mode} epistemic status must remain explicit`);
  assert(pack.runtime_status === 'NOT_IMPLEMENTED_BY_THIS_PACK', `${pack.visual_mode} cannot claim runtime implementation`);
  assert(recipeIds.has(pack.recipe_primary), `${pack.visual_mode} references unknown primary recipe ${pack.recipe_primary}`);
  assert(recipeIds.has(pack.recipe_secondary), `${pack.visual_mode} references unknown secondary recipe ${pack.recipe_secondary}`);
  assert(Array.isArray(pack.component_shortlist) && pack.component_shortlist.length > 0, `${pack.visual_mode} needs component shortlist`);
  for (const component of pack.component_shortlist) {
    assert(/^KDX-VIS-[0-9]{4}$/.test(component.stable_id), `${pack.visual_mode} has invalid KDX-VIS ID ${component.stable_id}`);
    assert(component.production_gate === 'READY_CONDITIONAL', `${component.stable_id} must remain conditional before canonical merge`);
    const registered = registryById.get(component.stable_id);
    assert(registered, `${pack.visual_mode} references unregistered component ${component.stable_id}`);
    assert(registered.slug === component.slug, `${component.stable_id} slug mismatch: pack=${component.slug}, registry=${registered.slug}`);
    assert(registered.family === component.family, `${component.stable_id} family mismatch: pack=${component.family}, registry=${registered.family}`);
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

const allowedColorModes = new Set(schema.properties.color_mode.enum);
const allowedViewports = new Set(schema.properties.viewport.enum);
const allowedProvenance = new Set(schema.properties.provenance_check.enum);

const validateExample = (file) => {
  const example = readJson(file);
  assert(typeof example.example_id === 'string' && example.example_id.length > 0, `${file} missing example_id`);
  assert(scenePacks.has(example.visual_mode), `${file} references unknown visual mode ${example.visual_mode}`);
  const pack = scenePacks.get(example.visual_mode);
  assert(recipeIds.has(example.recipe_id), `${file} references unknown recipe ${example.recipe_id}`);
  assert(example.recipe_id === pack.recipe_primary || example.recipe_id === pack.recipe_secondary, `${file} recipe is not allowed by ${example.visual_mode}`);
  assert(Array.isArray(example.hero_media_ids) && example.hero_media_ids.length > 0, `${file} requires hero media`);
  const allowedWorks = new Set(pack.ocin_candidates.map((work) => work.ocin_id));
  for (const heroId of example.hero_media_ids) {
    assert(allowedWorks.has(heroId), `${file} hero ${heroId} is not listed for ${example.visual_mode}`);
  }
  assert(Array.isArray(example.components) && example.components.length > 0, `${file} requires governed components`);
  const allowedComponents = new Map(pack.component_shortlist.map((component) => [component.stable_id, component]));
  for (const component of example.components) {
    const registered = registryById.get(component.stable_id);
    assert(registered, `${file} references unregistered component ${component.stable_id}`);
    assert(registered.slug === component.slug, `${file} ${component.stable_id} slug mismatch`);
    assert(allowedComponents.has(component.stable_id), `${file} uses ${component.stable_id} outside the scene shortlist`);
    for (const coordinate of ['x', 'y', 'w', 'h']) {
      assert(typeof component[coordinate] === 'number' && component[coordinate] >= 0 && component[coordinate] <= 1, `${file} ${component.stable_id}.${coordinate} must be normalized 0–1`);
    }
    if (component.opacity !== undefined) {
      assert(typeof component.opacity === 'number' && component.opacity >= 0 && component.opacity <= 1, `${file} ${component.stable_id}.opacity must be 0–1`);
    }
  }
  assert(allowedColorModes.has(example.color_mode), `${file} invalid color_mode ${example.color_mode}`);
  assert(allowedViewports.has(example.viewport), `${file} invalid viewport ${example.viewport}`);
  assert(allowedProvenance.has(example.provenance_check), `${file} invalid provenance_check ${example.provenance_check}`);
  assert(example.provenance_check !== 'PASS', `${file} must not claim provenance PASS before canonical source resolution`);
  assert(example.reduced_motion?.continuous_motion === false, `${file} must declare non-continuous reduced motion`);
  return example;
};

const desktopExample = validateExample('examples/threshold-monolith.desktop.json');
const mobileExample = validateExample('examples/threshold-monolith.mobile.json');
assert(desktopExample.viewport === 'desktop' && mobileExample.viewport === 'mobile', 'Threshold example pair must cover desktop + mobile');
assert(desktopExample.recipe_id === mobileExample.recipe_id, 'Threshold example pair must use the same composition recipe');
assert(desktopExample.hero_media_ids.join('|') === mobileExample.hero_media_ids.join('|'), 'Threshold example pair must resolve the same hero source');
const desktopGeometry = JSON.stringify(desktopExample.components.map(({ x, y, w, h }) => [x, y, w, h]));
const mobileGeometry = JSON.stringify(mobileExample.components.map(({ x, y, w, h }) => [x, y, w, h]));
assert(desktopGeometry !== mobileGeometry, 'mobile must be recomposed rather than copied from desktop geometry');

console.log(JSON.stringify({
  ok: true,
  visualModes: visualModes.size,
  recipes: recipeIds.size,
  componentRegistry: registryById.size,
  referencedVisualIds: referencedVisualIds.size,
  ocinCandidateReferences: ocinCandidateCount,
  deterministicExamples: 2,
  topologyAuthority: index.topology_authority,
  registryStatus: registry.status,
}, null, 2));
