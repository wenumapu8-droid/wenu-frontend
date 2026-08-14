import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../docs/kodex/visual-assembly');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const fail = (message) => { console.error(`KODEX Assembly Candidate FAIL: ${message}`); process.exit(1); };
const assert = (condition, message) => { if (!condition) fail(message); };

const schema = read('assembly_candidate.schema.json');
const examples = [
  ['desktop', read('examples/threshold-monolith.desktop.json')],
  ['mobile', read('examples/threshold-monolith.mobile.json')],
];

const required = new Set(schema.required ?? []);
for (const field of [
  'visual_mode',
  'recipe_id',
  'hero_media_ids',
  'components',
  'color_mode',
  'viewport',
  'provenance_check',
  'text_slots',
  'motion_profile',
  'epistemic_notes',
  'reduced_motion',
]) {
  assert(required.has(field), `schema must require ${field}`);
}

assert(schema.additionalProperties === false, 'top-level candidate must reject undeclared ad-hoc fields');
assert(schema.properties?.components?.items?.additionalProperties === false, 'component placement must reject undeclared fields');
assert(schema.properties?.reduced_motion?.properties?.continuous_motion?.const === false, 'reduced motion must prohibit continuous motion');

for (const [label, candidate] of examples) {
  for (const field of required) assert(Object.hasOwn(candidate, field), `${label} example missing required ${field}`);
  assert(/^[0-9]{2}_[A-Z0-9_-]+$/.test(candidate.visual_mode), `${label} visual_mode malformed`);
  assert(/^RCP-[A-Z0-9-]+$/.test(candidate.recipe_id), `${label} recipe_id malformed`);
  assert(Array.isArray(candidate.hero_media_ids) && candidate.hero_media_ids.length > 0, `${label} needs hero media`);
  assert(Array.isArray(candidate.components) && candidate.components.length > 0, `${label} needs components`);
  assert(typeof candidate.text_slots === 'object' && candidate.text_slots !== null, `${label} text_slots must be object`);
  assert(typeof candidate.motion_profile === 'string' && candidate.motion_profile.length > 0, `${label} motion_profile missing`);
  assert(Array.isArray(candidate.epistemic_notes) && candidate.epistemic_notes.length > 0, `${label} epistemic_notes missing`);
  assert(candidate.reduced_motion?.continuous_motion === false, `${label} reduced motion must be non-continuous`);
  assert(Array.isArray(candidate.reduced_motion?.preserve) && candidate.reduced_motion.preserve.length > 0, `${label} reduced motion preserve list missing`);
  for (const component of candidate.components) {
    assert(/^KDX-VIS-[0-9]{4}$/.test(component.stable_id), `${label} invalid component ID ${component.stable_id}`);
    for (const coordinate of ['x', 'y']) assert(component[coordinate] >= 0 && component[coordinate] <= 1, `${label} ${component.stable_id}.${coordinate} outside 0–1`);
    for (const dimension of ['w', 'h']) assert(component[dimension] > 0 && component[dimension] <= 1, `${label} ${component.stable_id}.${dimension} must be >0 and <=1`);
  }
}

const desktop = examples[0][1];
const mobile = examples[1][1];
assert(desktop.viewport === 'desktop', 'desktop example viewport mismatch');
assert(mobile.viewport === 'mobile', 'mobile example viewport mismatch');
assert(desktop.recipe_id === mobile.recipe_id, 'desktop/mobile recipe mismatch');
assert(JSON.stringify(desktop.hero_media_ids) === JSON.stringify(mobile.hero_media_ids), 'desktop/mobile source mismatch');
assert(JSON.stringify(desktop.components) !== JSON.stringify(mobile.components), 'mobile must be recomposed, not copied');

console.log(JSON.stringify({
  ok: true,
  schema: schema.title,
  requiredFields: required.size,
  validatedExamples: examples.map(([label, candidate]) => ({ label, id: candidate.example_id })),
  reducedMotionContinuous: false,
}, null, 2));
