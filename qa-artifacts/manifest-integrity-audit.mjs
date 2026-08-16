#!/usr/bin/env node
/**
 * QA de integridad del manifest KODEX-∞.
 * Verifica: IDs duplicados, resonancias a IDs inexistentes, assets faltantes.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "public", "kodex-content", "manifest.json");
const CONTENT_ROOT = join(ROOT, "public", "kodex-content");

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const volumes = manifest.volumes || [];

const validIds = new Set([
  ...volumes.map((v) => v.id),
  ...(manifest.organismos || []).map((o) => o.id),
  ...(manifest.tratamientos || []).map((t) => t.id),
  ...(manifest.estratos || []).map((e) => e.id),
]);

const issues = {
  duplicatedIds: [],
  invalidResonancias: [],
  missingAssets: [],
};

const seenIds = new Map();
for (const v of volumes) {
  if (seenIds.has(v.id)) {
    issues.duplicatedIds.push({ id: v.id, first: seenIds.get(v.id), second: volumes.indexOf(v) });
  } else {
    seenIds.set(v.id, volumes.indexOf(v));
  }

  for (const r of v.resonancias || []) {
    if (!validIds.has(r)) {
      issues.invalidResonancias.push({ volume: v.id, resonancia: r });
    }
  }

  for (const asset of [...(v.assets || []), ...(v.asset_files || [])]) {
    if (typeof asset === "string" && !existsSync(join(CONTENT_ROOT, asset))) {
      issues.missingAssets.push({ volume: v.id, asset });
    }
  }
}

console.log(JSON.stringify(
  {
    timestamp: new Date().toISOString(),
    volumes: volumes.length,
    duplicatedIds: issues.duplicatedIds.length,
    invalidResonancias: issues.invalidResonancias.length,
    missingAssets: issues.missingAssets.length,
    samples: {
      duplicatedIds: issues.duplicatedIds.slice(0, 5),
      invalidResonancias: issues.invalidResonancias.slice(0, 10),
      missingAssets: issues.missingAssets.slice(0, 10),
    },
  },
  null,
  2
));
