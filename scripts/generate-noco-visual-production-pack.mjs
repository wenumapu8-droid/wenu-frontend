#!/usr/bin/env node
// Generate visual/content production docs from the read-only NocoDB catalog audit.
// Read-only. Does not call NocoDB, WooCommerce, or image generation tools.

import fs from "node:fs";
import path from "node:path";

const source = process.argv[2] || "reports/nocodb-catalog-current-2026-05-20.json";
if (!fs.existsSync(source)) throw new Error(`Missing source report: ${source}`);

const audit = JSON.parse(fs.readFileSync(source, "utf8"));
const rows = audit.rows || [];

const ready = rows.filter((row) => row.estado === "READY");
const available = rows.filter((row) => ["READY", "RAW"].includes(row.estado));

function safe(value) {
  return value === null || value === undefined || value === "" ? "—" : String(value);
}

function byCategory(list) {
  const map = new Map();
  for (const row of list) {
    const key = row.categoria || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

function byLine(list) {
  const map = new Map();
  for (const row of list) {
    const key = row.linea || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

function promptForProduct(row, type = "macro") {
  const shared = [
    `Product SKU: ${row.SKU}`,
    `Product name: ${row.title}`,
    `Category: ${row.categoria || "[NECESITO MATERIAL]"}`,
    `Material: ${row.material || "[NECESITO MATERIAL]"}`,
    `Price USD: ${row.precioUsd || "[NECESITO MATERIAL]"}`,
    "",
    "Use the uploaded real product reference image(s) as strict visual truth.",
    "Preserve the exact product silhouette, color, material, proportion, quantity, stone shape, metal finish, attachment type and visible defects/marks.",
    "Do not invent a different product. Do not add extra pieces. Do not change material. Do not change stone color. Do not change number of items in the pair/set.",
    "If no real reference image is attached, create only a background/layout/template and leave a product placeholder. Do not fabricate the product.",
    "",
    "Wenu Mapu direction: dark ritual luxury, obsidian black, bone, sand, silver, bronze, ember, product as ritual object, body as small cosmos, piece as point of orientation.",
    "Use cosmic/sideral atmosphere only as subtle brand memory: dust, coordinates, darkness, archive geometry. No fantasy galaxies.",
    "",
    "Avoid: text, logo, watermark, boho, new age, cyberpunk, generic tribal decoration, fantasy space, excessive smoke, fake hands, fake cultural symbols, magic/healing claims.",
  ];

  if (type === "macro") {
    return [
      "Create a faithful macro product photograph enhancement for Wenu Mapu.",
      ...shared,
      "",
      "Composition: tight macro crop, product sharp, material texture visible, dark obsidian surface, single controlled side light, premium editorial contrast.",
      "Output: square or 4:5 image, no text.",
    ].join("\n");
  }

  if (type === "model") {
    return [
      "Create a faithful usability / worn placement image for Wenu Mapu.",
      ...shared,
      "",
      "Use the uploaded product reference and, if provided, uploaded model/body reference. Place the exact product realistically on the correct body placement.",
      "Show only body fragment needed for scale. Avoid generic AI face. Skin and anatomy must look natural. Keep product scale realistic.",
      "Output: 4:5 or 9:16 image, no text.",
    ].join("\n");
  }

  if (type === "feed") {
    return [
      "Create an Instagram product feed layout for Wenu Mapu.",
      ...shared,
      "",
      "Create an editable layout concept: product image area, title area, material line, SKU/archive line, CTA area.",
      "If generating a flat image, keep text minimal and editable in final design tool. Prefer no baked-in text for web assets.",
      "Output: 1080x1350 feed post.",
    ].join("\n");
  }

  return shared.join("\n");
}

function mdQueue() {
  let md = "# Wenu Mapu — Noco-Based Visual Production Queue\n\n";
  md += `Generated from: \`${source}\`\n\n`;
  md += "This queue uses the NocoDB audit as the source of available products. It does not invent product data.\n\n";
  md += "## Non-Negotiable Anti-Invention Rule\n\n";
  md += "For any image that shows a product, attach the real product reference photo from NocoDB first. If there is no real product reference attached, the AI may create only background, layout, template, or placeholder. It must not fabricate the product.\n\n";
  md += "## READY Products\n\n";
  md += "| SKU | Product | Category | Material | Price | Ref | Macro | Recommended use |\n";
  md += "| --- | --- | --- | --- | ---: | --- | --- | --- |\n";
  for (const row of ready) {
    const use = row.categoria === "Piercing" || row.categoria === "Septum"
      ? "macro, worn placement, story"
      : row.categoria === "Hanger" || row.categoria === "Tunnel" || row.categoria === "Plug"
        ? "category tile, macro, product sheet"
        : "feed, macro, archive";
    md += `| ${row.SKU} | ${row.title} | ${safe(row.categoria)} | ${safe(row.material)} | ${safe(row.precioUsd)} | ${row.hasFotoReferencia ? "yes" : "no"} | ${row.hasFotoMacro ? "yes" : "no"} | ${use} |\n`;
  }

  md += "\n## Collections To Build From Real Products\n\n";
  md += "| Collection | Products | Purpose | First assets |\n";
  md += "| --- | --- | --- | --- |\n";
  md += `| Hangers / Weights | ${ready.filter((r) => r.categoria === "Hanger").slice(0, 8).map((r) => r.SKU).join(", ")} | Strongest READY visual group | collection banner, category tile, feed carousel |\n`;
  md += `| Piercing Signals | ${ready.filter((r) => ["Piercing", "Septum"].includes(r.categoria)).slice(0, 8).map((r) => r.SKU).join(", ")} | Small wearable pieces | macro grid, body placement, story set |\n`;
  md += `| Tunnels / Plugs | ${ready.filter((r) => ["Tunnel", "Plug"].includes(r.categoria)).slice(0, 10).map((r) => r.SKU).join(", ")} | Size/category commerce | category tiles, sizing carousel, product sheets |\n`;
  md += `| Atacama / Author Archive | ${available.filter((r) => r.linea === "Atacama" || /Vacamuerta|Meteorite/i.test(r.title)).slice(0, 8).map((r) => `${r.SKU} (${r.estado})`).join(", ")} | Brand halo and ritual archive | hero banner, certificate, journal/social |\n`;
  md += `| Stone / Organic | ${available.filter((r) => ["Stone", "Wood"].includes(r.material)).slice(0, 12).map((r) => `${r.SKU} (${r.estado})`).join(", ")} | Material education | macro carousel, category tile |\n`;

  md += "\n## Category Tiles Needed\n\n";
  md += "| Category | READY count | Available count | Suggested product refs |\n";
  md += "| --- | ---: | ---: | --- |\n";
  const readyByCat = new Map(byCategory(ready));
  for (const [cat, list] of byCategory(available)) {
    const readyList = readyByCat.get(cat) || [];
    md += `| ${cat} | ${readyList.length} | ${list.length} | ${list.slice(0, 5).map((r) => r.SKU).join(", ")} |\n`;
  }

  md += "\n## Banner Backlog\n\n";
  md += "| Banner | Real product references | Notes |\n";
  md += "| --- | --- | --- |\n";
  md += "| Hangers / Weights READY Drop | WM-HAN-001, WM-HAN-005, WM-HAN-009, WM-HAN-010, WM-HAN-017 | Strong first commercial banner because many READY pieces have ref+macro. |\n";
  md += "| Piercing Signals READY Drop | WM-PRC-014, WM-PRC-016, WM-PRC-020, WM-PRC-021, WM-SEP-002, WM-SEP-003 | Use macro and body placement references. |\n";
  md += "| Tunnels / Plugs READY Drop | WM-TUN-015, WM-TUN-016, WM-PLG-017, WM-PLG-030, WM-TUN-022 | Good for category grid and sizing content. |\n";
  md += "| Ritual Ring Vacamuerta Archive | WM-RNG-001 READY, WM-RNG-002 SOLD OUT | Use as brand halo/archive. Do not present SOLD OUT as available. |\n";
  md += "| Stone / Organic Material Memory | WM-PLG-007, WM-PLG-009, WM-PLG-030, wood/tunnel refs | Material education and macro content. |\n";

  md += "\n## First 12 Assets To Produce\n\n";
  md += "1. Hangers / Weights collection banner.\n";
  md += "2. Piercing Signals collection banner.\n";
  md += "3. Tunnels / Plugs collection banner.\n";
  md += "4. Ritual Ring Vacamuerta archive banner.\n";
  md += "5. Hanger category tile.\n";
  md += "6. Piercing category tile.\n";
  md += "7. Plug category tile.\n";
  md += "8. Tunnel category tile.\n";
  md += "9. READY product sheet batch for top 10.\n";
  md += "10. Macro carousel for titanium/silver/stone/wood/bronze.\n";
  md += "11. Model usability story set for piercing and septum.\n";
  md += "12. Feed/story launch pack for READY drop.\n";

  return md;
}

function promptPack() {
  let md = "# Wenu Mapu — Product-Faithful AI Prompt Pack From NocoDB\n\n";
  md += "Use these prompts only with real product reference images attached. They are designed to prevent AI from inventing products.\n\n";
  md += "## Universal Product Fidelity Contract\n\n";
  md += "The uploaded real product photo is the source of truth. Preserve exact silhouette, material, number of pieces, color, scale, stone shape, metal finish, closures and visible marks. Do not invent or beautify into a different product. If product data and image conflict, stop and ask for review.\n\n";
  for (const row of ready.slice(0, 24)) {
    md += `\n## ${row.SKU} — ${row.title}\n\n`;
    md += "### Macro / product photo enhancement\n\n```text\n";
    md += promptForProduct(row, "macro");
    md += "\n```\n\n";
    md += "### Model / usability placement\n\n```text\n";
    md += promptForProduct(row, "model");
    md += "\n```\n\n";
    md += "### Feed layout\n\n```text\n";
    md += promptForProduct(row, "feed");
    md += "\n```\n";
  }
  return md;
}

function csv() {
  const header = ["sku","title","status","category","material","price_usd","has_ref","has_macro","priority_asset","prompt_group"];
  const lines = [header.join(",")];
  for (const row of ready) {
    const priority = row.categoria === "Hanger" ? "hanger-banner/category/feed"
      : row.categoria === "Piercing" || row.categoria === "Septum" ? "piercing-macro/model/story"
      : row.categoria === "Plug" || row.categoria === "Tunnel" ? "plug-tunnel-category/sizing"
      : "product-feed/archive";
    const values = [row.SKU,row.title,row.estado,row.categoria,row.material,row.precioUsd,row.hasFotoReferencia,row.hasFotoMacro,priority,`${row.SKU}-prompt`];
    lines.push(values.map((v) => `"${String(v ?? "").replaceAll('"','""')}"`).join(","));
  }
  return lines.join("\n") + "\n";
}

fs.mkdirSync("docs/brand/07_campaigns", { recursive: true });
fs.mkdirSync("docs/brand/08_ai_prompts", { recursive: true });
fs.mkdirSync("docs/brand/09_assets_needed", { recursive: true });

fs.writeFileSync("docs/brand/07_campaigns/WENU_MAPU_NOCO_VISUAL_PRODUCTION_QUEUE.md", mdQueue());
fs.writeFileSync("docs/brand/08_ai_prompts/WENU_MAPU_PRODUCT_FAITHFUL_AI_PROMPTS_FROM_NOCO.md", promptPack());
fs.writeFileSync("docs/brand/09_assets_needed/wenu-mapu-ready-visual-production-queue.csv", csv());

console.log(JSON.stringify({
  ok: true,
  ready: ready.length,
  available: available.length,
  outputs: [
    "docs/brand/07_campaigns/WENU_MAPU_NOCO_VISUAL_PRODUCTION_QUEUE.md",
    "docs/brand/08_ai_prompts/WENU_MAPU_PRODUCT_FAITHFUL_AI_PROMPTS_FROM_NOCO.md",
    "docs/brand/09_assets_needed/wenu-mapu-ready-visual-production-queue.csv",
  ],
}, null, 2));
