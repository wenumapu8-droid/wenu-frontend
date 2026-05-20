import { readFile, writeFile, mkdir } from "node:fs/promises";

const CATALOG_PATH = "reports/nocodb-catalog-current-2026-05-20.json";
const GAP_PATH = "reports/nocodb-vs-woo-gap-2026-05-20.json";
const OUT_MD = "docs/visual-content-production-queue-2026-05-20.md";
const OUT_JSON = "docs/visual-content-production-queue-2026-05-20.json";

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function byCount(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const value = row[key] || "Sin definir";
    map.set(value, (map.get(value) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

function scoreProduct(row) {
  let score = 0;
  if (row.estado === "READY") score += 100;
  if (row.urlWoo) score += 30;
  if (row.hasFotoMacro) score += 20;
  if (row.hasFotoReferencia) score += 12;
  if (row.precioUsd) score += Math.min(20, Number(row.precioUsd) / 10);
  if (row.proveedor && row.proveedor !== "AliExpress") score += 8;
  return score;
}

function pickProducts(rows, filter, limit = 5) {
  return rows
    .filter(filter)
    .sort((a, b) => scoreProduct(b) - scoreProduct(a))
    .slice(0, limit);
}

function table(headers, rows) {
  const lines = [];
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of rows) lines.push(`| ${row.map((cell) => String(cell ?? "—").replaceAll("\n", " ")).join(" | ")} |`);
  return lines.join("\n");
}

function productList(rows) {
  return rows.map((p) => `${p.SKU} — ${p.title}`).join("; ");
}

function promptFor(kind, name, products) {
  const refs = productList(products);
  if (kind === "category") {
    return `Create a Wenu Mapu ecommerce category banner for ${name}. Use the real product references: ${refs}. Preserve exact silhouettes, material character and scale from the references. Dark ritual luxury, product-led, obsidian surface, sober cosmic geometry, no text, no logo, no invented extra pieces, no generic tribal decoration.`;
  }
  return `Create a Wenu Mapu collection/drop banner for ${name}. Use the real product references: ${refs}. The product must remain recognizable and central. Editorial dark ritual luxury, tactile metal/stone, restrained cosmic field, no text, no logo, no cultural motifs used as decoration, no fantasy space scene.`;
}

const catalog = JSON.parse(await readFile(CATALOG_PATH, "utf8"));
const gap = JSON.parse(await readFile(GAP_PATH, "utf8"));
const rows = catalog.rows || [];
const available = rows.filter((r) => ["RAW", "READY"].includes(r.estado));
const ready = rows.filter((r) => r.estado === "READY");

const categories = byCount(available, "categoria").map((c) => ({
  ...c,
  products: pickProducts(available, (r) => r.categoria === c.name, 5),
}));

const lines = byCount(available, "linea").map((c) => ({
  ...c,
  products: pickProducts(available, (r) => r.linea === c.name, 5),
}));

const missing = {
  readyMissingWoo: gap.nocoReadyMissingWoo || [],
  availableMissingWoo: gap.nocoAvailableMissingWoo || [],
  missingReference: available.filter((r) => !r.hasFotoReferencia),
  missingMacro: available.filter((r) => !r.hasFotoMacro),
  missingScale: available.filter((r) => !r.hasFotoEscala),
  missingTechnicalSheet: available.filter((r) => !r.hasLaminaTecnica),
};

const priorityProducts = uniq([
  ...ready.filter((r) => !r.urlWoo).map((r) => r.SKU),
  ...ready.filter((r) => !r.hasFotoMacro || !r.hasFotoReferencia).map((r) => r.SKU),
]).map((sku) => rows.find((r) => r.SKU === sku)).filter(Boolean);

const queue = {
  generatedAt: new Date().toISOString(),
  sources: { catalog: CATALOG_PATH, gap: GAP_PATH },
  totals: {
    rows: rows.length,
    available: available.length,
    ready: ready.length,
    readyMissingWoo: missing.readyMissingWoo.length,
    availableMissingWoo: missing.availableMissingWoo.length,
    missingReference: missing.missingReference.length,
    missingMacro: missing.missingMacro.length,
    missingScale: missing.missingScale.length,
    missingTechnicalSheet: missing.missingTechnicalSheet.length,
  },
  categories,
  lines,
  priorityProducts,
  missing,
};

const md = [];
md.push("# Wenu Mapu — Visual Content Production Queue");
md.push("");
md.push(`Generated: ${queue.generatedAt}`);
md.push("");
md.push("Safe queue for Codex, ChatGPT, Claude Design, Figma, Canva and manual production. It is generated from read-only Noco/Woo reports and does not write to NocoDB or WooCommerce.");
md.push("");
md.push("## Summary");
md.push("");
md.push(table(["Metric", "Count"], [
  ["Catalog rows", queue.totals.rows],
  ["Available now (RAW + READY)", queue.totals.available],
  ["READY products", queue.totals.ready],
  ["READY missing Woo URL", queue.totals.readyMissingWoo],
  ["Available missing Woo URL", queue.totals.availableMissingWoo],
  ["Available missing reference photo", queue.totals.missingReference],
  ["Available missing macro photo", queue.totals.missingMacro],
  ["Available missing scale photo", queue.totals.missingScale],
  ["Available missing technical sheet", queue.totals.missingTechnicalSheet],
]));
md.push("");
md.push("## Immediate Production Priorities");
md.push("");
md.push("1. Product sheets: generate/finish technical sheets for all READY products first.");
md.push("2. Category banners: create one banner per high-volume category using real products listed below.");
md.push("3. Collection/drop banners: use Linea as the first collection axis until final strategic collection names are decided.");
md.push("4. Product macro prompts: only use real product reference photos; never invent silhouettes, stones, colors or pair count.");
md.push("5. Woo publication queue: READY missing Woo URL is the commercial bottleneck.");
md.push("");
md.push("## Category Banner Queue");
md.push("");
md.push(table(["Priority", "Category", "Available", "Reference products", "Prompt"], categories.map((c, i) => [
  i + 1,
  c.name,
  c.count,
  productList(c.products),
  promptFor("category", c.name, c.products),
])));
md.push("");
md.push("## Collection / Line Banner Queue");
md.push("");
md.push(table(["Priority", "Linea", "Available", "Reference products", "Prompt"], lines.map((c, i) => [
  i + 1,
  c.name,
  c.count,
  productList(c.products),
  promptFor("line", c.name, c.products),
])));
md.push("");
md.push("## READY Product Sheet Queue");
md.push("");
md.push(table(["SKU", "Product", "Category", "Line", "Material", "Has ref", "Has macro", "Woo URL"], ready.map((p) => [
  p.SKU,
  p.title,
  p.categoria,
  p.linea,
  p.material,
  p.hasFotoReferencia ? "yes" : "NO",
  p.hasFotoMacro ? "yes" : "NO",
  p.urlWoo ? "yes" : "NO",
])));
md.push("");
md.push("## Missing Image Coverage");
md.push("");
md.push("### Missing reference photo");
md.push("");
md.push(missing.missingReference.length ? table(["SKU", "Product", "Category", "Line"], missing.missingReference.map((p) => [p.SKU, p.title, p.categoria, p.linea])) : "None detected.");
md.push("");
md.push("### Missing macro photo");
md.push("");
md.push(missing.missingMacro.length ? table(["SKU", "Product", "Category", "Line"], missing.missingMacro.map((p) => [p.SKU, p.title, p.categoria, p.linea])) : "None detected.");
md.push("");
md.push("### Missing scale photo");
md.push("");
md.push("All available products currently need scale-photo coverage unless captured outside the audited Noco fields.");
md.push("");
md.push("### Missing technical sheet");
md.push("");
md.push("All available products currently need a finished technical sheet unless generated outside the audited Noco fields.");
md.push("");
md.push("## Prompt Rules For AI Image Work");
md.push("");
md.push("- Use real product photo references first. If no reference exists, mark `[NECESITO FOTO REAL]` and create only a background/template, not a fake product.");
md.push("- Preserve exact product silhouette, material, color, stone shape, pair/single count and visible size relationships.");
md.push("- Allowed atmosphere: obsidian dark field, restrained stars/cosmos, editorial shadow, stone/metal texture, subtle celestial axis geometry.");
md.push("- Avoid: invented gemstones, extra pieces, generic tribal patterns, Mapuche/Mapudungun decoration, fantasy space, cyberpunk, smoke as filler, watermarks, text baked into image.");
md.push("- Every generated image must be reviewed against the real product before publication.");
md.push("");
md.push("## Next Safe Commands");
md.push("");
md.push("```bash");
md.push("node scripts/generate-visual-content-production-queue.mjs");
md.push("node /Users/user1/wenu-platform/scripts/phash-suggest-from-assigned.mjs --auto-max-dist=2 --max-review-dist=8");
md.push("```");

await mkdir("docs", { recursive: true });
await writeFile(OUT_MD, md.join("\n") + "\n");
await writeFile(OUT_JSON, JSON.stringify(queue, null, 2) + "\n");

console.log(`Wrote ${OUT_MD}`);
console.log(`Wrote ${OUT_JSON}`);
