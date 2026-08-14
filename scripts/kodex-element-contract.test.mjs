import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const base = new URL('../src/lib/kodex/grammar/', import.meta.url);
const registry = JSON.parse(await fs.readFile(new URL('kdx_element_registry.v0.1.json', base), 'utf8'));
const schema = JSON.parse(await fs.readFile(new URL('kdx_element_contract.schema.json', base), 'utf8'));
const grids = JSON.parse(await fs.readFile(new URL('kdx_grid_system.json', base), 'utf8'));
const motions = JSON.parse(await fs.readFile(new URL('kdx_motion_presets.json', base), 'utf8'));
const effectSource = await fs.readFile(new URL('../effectFoundry.js', base), 'utf8');

const REQUIRED = schema.required;
const PLATE_TYPES = new Set(schema.properties.allowed_plate_types.items.enum);
const STATUS = new Set(schema.properties.status.enum);
const FAMILY = new Set(schema.properties.family.enum);
const RIGHTS = new Set(schema.properties.rights.enum);
const MOTION_COST = new Set(schema.properties.motion_cost.enum);
const ASPECT = new Set(schema.properties.geometry.properties.aspect_behavior.enum);

const sourceIds = new Set([
  ...grids.map((item) => item.id),
  ...motions.map((item) => item.id),
  ...[...effectSource.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1]),
]);

function validateElement(element) {
  for (const key of REQUIRED) assert.ok(Object.hasOwn(element, key), `${element.element_id || 'UNKNOWN'} missing ${key}`);
  assert.ok(FAMILY.has(element.family), `${element.element_id}: invalid family ${element.family}`);
  assert.ok(STATUS.has(element.status), `${element.element_id}: invalid status ${element.status}`);
  assert.ok(RIGHTS.has(element.rights), `${element.element_id}: invalid rights ${element.rights}`);
  assert.ok(MOTION_COST.has(element.motion_cost), `${element.element_id}: invalid motion cost ${element.motion_cost}`);
  assert.match(element.version, /^[0-9]+\.[0-9]+\.[0-9]+$/, `${element.element_id}: invalid version`);
  assert.ok(element.allowed_plate_types.length > 0, `${element.element_id}: no plate types`);
  assert.ok(element.allowed_plate_types.every((type) => PLATE_TYPES.has(type)), `${element.element_id}: invalid plate type`);
  assert.ok(element.allowed_scene_roles.length > 0, `${element.element_id}: no scene roles`);
  assert.ok(element.slot_types.length > 0, `${element.element_id}: no slots`);
  assert.ok(ASPECT.has(element.geometry.aspect_behavior), `${element.element_id}: invalid aspect behavior`);
  assert.equal(typeof element.accessibility.keyboard_safe, 'boolean');
  assert.equal(typeof element.accessibility.touch_safe, 'boolean');
  assert.equal(element.accessibility.meaning_preserved_without_motion, true, `${element.element_id}: meaning must survive motion removal`);
  assert.equal(element.provenance.kind, 'REPO_SOURCE', `${element.element_id}: representative set must be repo-grounded`);
  assert.equal(element.provenance.status, 'VERIFIED', `${element.element_id}: source provenance must be verified`);
  assert.equal(element.rights, 'PROJECT_SOURCE', `${element.element_id}: representative set cannot normalize unclear/external rights`);
  assert.ok(sourceIds.has(element.element_id), `${element.element_id}: ID is not present in registered source files`);
}

test('ElementContract representative registry is 20–30 existing elements', () => {
  assert.equal(registry.registry_version, '0.1.0');
  assert.ok(registry.elements.length >= 20 && registry.elements.length <= 30, `expected 20–30, got ${registry.elements.length}`);
  assert.equal(registry.elements.length, 28);
  assert.equal(new Set(registry.elements.map((element) => element.element_id)).size, registry.elements.length, 'element IDs must be unique');
  registry.elements.forEach(validateElement);
});

test('representative subset spans grid, motion, and implemented effects', () => {
  const counts = registry.elements.reduce((acc, element) => {
    acc[element.family] = (acc[element.family] || 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(counts, { GRID: 10, MOTION: 12, EFFECT: 6 });
  assert.ok(registry.elements.filter((element) => element.family === 'EFFECT').every((element) => element.status === 'IMPLEMENTED'));
});

test('HOLD records remain registered but are mechanically excluded from assembly-safe candidates', () => {
  const holdIds = registry.elements.filter((element) => element.status === 'HOLD').map((element) => element.element_id).sort();
  assert.deepEqual(holdIds, ['KDX_G05_BIOMETRIC_CLOCK', 'MOTION_07_DATA_TICK']);
  const assemblySafe = registry.elements.filter((element) => !['HOLD', 'DEPRECATED'].includes(element.status));
  assert.ok(!assemblySafe.some((element) => holdIds.includes(element.element_id)));
});

test('accessibility and no-auto-navigation boundaries are encoded in normalized records', () => {
  assert.ok(registry.elements.every((element) => element.accessibility.keyboard_safe && element.accessibility.touch_safe));
  assert.ok(registry.elements.every((element) => element.accessibility.meaning_preserved_without_motion));
  const stateTransition = registry.elements.find((element) => element.element_id === 'MOTION_12_STATE_TRANSITION');
  assert.ok(stateTransition.incompatibilities.includes('auto_navigation'));
});
