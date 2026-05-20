#!/usr/bin/env node
// Compare current NocoDB audit export against Astro/Woo generated search index.
// Read-only. Does not call WooCommerce or NocoDB APIs.

import fs from "node:fs";
import path from "node:path";

const nocoPath = process.argv[2] || "reports/nocodb-catalog-current-2026-05-20.json";
const wooPath = process.argv[3] || "dist/search-index.json";

if (!fs.existsSync(nocoPath)) throw new Error(`Missing Noco audit JSON: ${nocoPath}`);
if (!fs.existsSync(wooPath)) throw new Error(`Missing Woo search index: ${wooPath}`);

const noco = JSON.parse(fs.readFileSync(nocoPath, "utf8"));
const woo = JSON.parse(fs.readFileSync(wooPath, "utf8"));

function normSku(value) {
  return String(value || "").trim().toUpperCase();
}

function skuFromWoo(product) {
  const name = product.name || "";
  const match = name.match(/\bWM-[A-Z]+-\d+\b/i);
  return normSku(match?.[0] || "");
}

const wooBySku = new Map();
const wooWithoutSku = [];
for (const product of woo) {
  const sku = skuFromWoo(product);
  if (sku) wooBySku.set(sku, product);
  else wooWithoutSku.push(product);
}

const nocoRows = noco.rows || [];
const nocoBySku = new Map();
for (const row of nocoRows) {
  const sku = normSku(row.SKU);
  if (sku) nocoBySku.set(sku, row);
}

const availableStatuses = new Set(["RAW", "READY"]);
const notAvailableStatuses = new Set(["SOLD OUT", "RESERVED"]);

const nocoAvailable = nocoRows.filter((row) => availableStatuses.has(row.estado));
const nocoAvailableMissingWoo = nocoAvailable.filter((row) => !row.urlWoo && !wooBySku.has(normSku(row.SKU)));
const nocoReadyMissingWoo = nocoRows.filter((row) => row.estado === "READY" && !row.urlWoo && !wooBySku.has(normSku(row.SKU)));

const wooNotLinkedToNoco = woo.filter((product) => {
  const sku = skuFromWoo(product);
  if (!sku) return true;
  return !nocoBySku.has(sku);
});

const wooButNocoNotAvailable = woo
  .map((product) => ({ product, sku: skuFromWoo(product), noco: nocoBySku.get(skuFromWoo(product)) }))
  .filter((item) => item.noco && notAvailableStatuses.has(item.noco.estado));

const report = {
  generatedAt: new Date().toISOString(),
  sources: { nocoPath, wooPath },
  counts: {
    nocoTotal: nocoRows.length,
    nocoAvailable: nocoAvailable.length,
    nocoReady: nocoRows.filter((row) => row.estado === "READY").length,
    wooTotal: woo.length,
    wooWithSkuInName: woo.length - wooWithoutSku.length,
    wooWithoutSkuInName: wooWithoutSku.length,
    nocoAvailableMissingWoo: nocoAvailableMissingWoo.length,
    nocoReadyMissingWoo: nocoReadyMissingWoo.length,
    wooNotLinkedToNoco: wooNotLinkedToNoco.length,
    wooButNocoNotAvailable: wooButNocoNotAvailable.length,
  },
  nocoReadyMissingWoo: nocoReadyMissingWoo.map((row) => ({
    sku: row.SKU,
    title: row.title,
    categoria: row.categoria,
    material: row.material,
    precioUsd: row.precioUsd,
    hasFotoReferencia: row.hasFotoReferencia,
    hasFotoMacro: row.hasFotoMacro,
  })),
  nocoAvailableMissingWoo: nocoAvailableMissingWoo.map((row) => ({
    sku: row.SKU,
    title: row.title,
    estado: row.estado,
    categoria: row.categoria,
    material: row.material,
    precioUsd: row.precioUsd,
  })),
  wooWithoutSkuInName: wooWithoutSku.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    cat: product.cat,
  })),
  wooNotLinkedToNoco: wooNotLinkedToNoco.map((product) => ({
    slug: product.slug,
    name: product.name,
    price: product.price,
    cat: product.cat,
  })),
  wooButNocoNotAvailable: wooButNocoNotAvailable.map((item) => ({
    sku: item.sku,
    wooSlug: item.product.slug,
    wooName: item.product.name,
    nocoTitle: item.noco.title,
    nocoEstado: item.noco.estado,
  })),
};

function md(report) {
  let out = "# Wenu Mapu — NocoDB vs Woo/Astro Catalog Gap\n\n";
  out += `Generated: ${report.generatedAt}\n\n`;
  out += "Read-only comparison. It uses local report files only.\n\n";
  out += "## Counts\n\n| Metric | Count |\n| --- | ---: |\n";
  for (const [key, value] of Object.entries(report.counts)) out += `| ${key} | ${value} |\n`;

  out += "\n## READY in NocoDB missing Woo link\n\n| SKU | Title | Category | Material | Price | Photo ref | Macro |\n| --- | --- | --- | --- | ---: | --- | --- |\n";
  for (const row of report.nocoReadyMissingWoo) {
    out += `| ${row.sku} | ${row.title} | ${row.categoria || ""} | ${row.material || ""} | ${row.precioUsd || ""} | ${row.hasFotoReferencia ? "yes" : "no"} | ${row.hasFotoMacro ? "yes" : "no"} |\n`;
  }

  out += "\n## Woo products without SKU in name\n\n| Slug | Name | Price | Category |\n| --- | --- | --- | --- |\n";
  for (const row of report.wooWithoutSkuInName) out += `| \`${row.slug}\` | ${row.name} | ${row.price} | ${row.cat || ""} |\n`;

  out += "\n## Woo products not linked to NocoDB by SKU-in-name\n\n| Slug | Name | Price | Category |\n| --- | --- | --- | --- |\n";
  for (const row of report.wooNotLinkedToNoco) out += `| \`${row.slug}\` | ${row.name} | ${row.price} | ${row.cat || ""} |\n`;

  out += "\n## Woo products whose NocoDB status is not available\n\n| SKU | Woo slug | Woo name | Noco title | Noco status |\n| --- | --- | --- | --- | --- |\n";
  for (const row of report.wooButNocoNotAvailable) out += `| ${row.sku} | \`${row.wooSlug}\` | ${row.wooName} | ${row.nocoTitle} | ${row.nocoEstado} |\n`;

  out += "\n## Recommended next step\n\n";
  out += "Use `nocoReadyMissingWoo` as the first upload/publish queue. Prepare WooCommerce changes as preview only, then get human approval before applying.\n";
  return out;
}

fs.mkdirSync("reports", { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const jsonOut = path.resolve(`reports/nocodb-vs-woo-gap-${date}.json`);
const mdOut = path.resolve(`reports/nocodb-vs-woo-gap-${date}.md`);
fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2));
fs.writeFileSync(mdOut, md(report));

console.log(JSON.stringify({
  ok: true,
  counts: report.counts,
  json: jsonOut,
  markdown: mdOut,
}, null, 2));
