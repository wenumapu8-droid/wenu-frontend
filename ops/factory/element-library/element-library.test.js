import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const CONTRACT_PATH = path.resolve('ops/factory/element-library/holocore-rgx-contracts.json');

const REQUIRED_FIELDS = [
  'element_id',
  'family',
  'version',
  'status',
  'allowed_plate_types',
  'allowed_scene_roles',
  'semantic_role',
  'slot_types',
  'min_max_size',
  'aspect_behavior',
  'responsive_behavior',
  'states',
  'inputs_tokens',
  'motion_cost',
  'fallback',
  'accessibility_contract',
  'provenance_rights',
  'incompatibilities'
];

function runTests() {
  assert.ok(fs.existsSync(CONTRACT_PATH), `Contract file exists at ${CONTRACT_PATH}`);
  
  const raw = fs.readFileSync(CONTRACT_PATH, 'utf8');
  const data = JSON.parse(raw);
  
  assert.strictEqual(data.layer, 'L6', 'Contract specifies layer L6');
  assert.strictEqual(data.layer_name, 'Element Library', 'Contract specifies L6 Element Library name');
  
  const elements = data.elements;
  assert.ok(Array.isArray(elements), 'Elements is an array');
  assert.strictEqual(elements.length, 17, 'Must contain exactly 17 HoloCore RGX functional core entries');
  
  const seenIds = new Set();
  
  for (const elem of elements) {
    assert.ok(elem.element_id, 'Element has non-empty element_id');
    assert.ok(!seenIds.has(elem.element_id), `Duplicate element_id: ${elem.element_id}`);
    seenIds.add(elem.element_id);
    
    for (const field of REQUIRED_FIELDS) {
      assert.ok(Object.prototype.hasOwnProperty.call(elem, field), `Element ${elem.element_id} is missing required field '${field}'`);
      assert.notStrictEqual(elem[field], null, `Element ${elem.element_id} field '${field}' must not be null`);
    }
    
    assert.ok(typeof elem.min_max_size === 'object', `Element ${elem.element_id} min_max_size must be an object`);
    assert.ok(typeof elem.min_max_size.min === 'string', `Element ${elem.element_id} min_max_size.min must be a string`);
    assert.ok(typeof elem.min_max_size.max === 'string', `Element ${elem.element_id} min_max_size.max must be a string`);
    
    assert.ok(Array.isArray(elem.allowed_plate_types), `Element ${elem.element_id} allowed_plate_types must be array`);
    assert.ok(Array.isArray(elem.allowed_scene_roles), `Element ${elem.element_id} allowed_scene_roles must be array`);
    assert.ok(Array.isArray(elem.slot_types), `Element ${elem.element_id} slot_types must be array`);
    assert.ok(Array.isArray(elem.states), `Element ${elem.element_id} states must be array`);
    assert.ok(Array.isArray(elem.inputs_tokens), `Element ${elem.element_id} inputs_tokens must be array`);
    assert.ok(Array.isArray(elem.incompatibilities), `Element ${elem.element_id} incompatibilities must be array`);
  }
  
  console.log('✅ ALL 17 HOLOCORE RGX CONTRACTS PASSED NODE ASSERTION TESTS (18/18 FIELDS VALIDATED).');
}

runTests();
