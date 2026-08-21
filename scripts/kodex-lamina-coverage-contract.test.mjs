import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const compareSource = readFileSync(join(HERE, "lamina", "compare.mjs"), "utf8");

test("lamina coverage remains diagnostic-only and preserves epistemic scope", () => {
  assert.match(compareSource, /process\.env\.KDX_REFDIR/);
  assert.match(compareSource, /reference_scope/);
  assert.match(compareSource, /NON_CANON_REFERENCE/);
  assert.match(compareSource, /coverage_status:\s*"OBSERVED_DIAGNOSTIC"/);
  assert.match(compareSource, /aesthetic_threshold_status:\s*"NONE"/);
  assert.match(compareSource, /cobertura:/);
  assert.match(compareSource, /tinta_ref:/);
  assert.match(compareSource, /tinta_actual:/);

  // Historical #68 used local restoration thresholds. Those are evidence from
  // that lane, not creator-approved aesthetic correctness policy.
  assert.doesNotMatch(compareSource, /FALTA DIBUJO/);
  assert.doesNotMatch(compareSource, /sobra tinta/);
  assert.doesNotMatch(compareSource, /c\s*<\s*60/);
  assert.doesNotMatch(compareSource, /c\s*<\s*85/);
  assert.doesNotMatch(compareSource, /c\s*>\s*140/);
});

test("coverage is not folded into the legacy pct score", () => {
  assert.match(compareSource, /pct:\s*\+\(\(pixel \+ estructural\) \/ 2\)\.toFixed\(3\)/);
  assert.doesNotMatch(compareSource, /pixel\s*\+\s*estructural\s*\+\s*cobertura/);
});
