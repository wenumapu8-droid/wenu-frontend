// keep-draft-guard.mjs
// ────────────────────────────────────────────────────────────────────────────
// Regla canónica anti-"los drafts vuelven solos":
// Cualquier producto WooCommerce marcado como "no republicar" NUNCA debe ser
// promovido draft → publish por scripts de publicación masiva.
//
// Un producto queda protegido si cumple CUALQUIERA de estos criterios:
//   1. meta_data contiene { key: '_wenu_keep_draft', value: '1'|'true'|'yes' }
//   2. tiene un tag cuyo slug/nombre ∈ { 'keep-draft', 'no-republish',
//      'duplicado', 'archivado' }
//   3. el nombre contiene un marcador explícito [DUPLICADO] / [ARCHIVO] /
//      [INDICE] / [NO-PUBLICAR]
//
// El marcador es reversible: quitar el meta o el tag re-habilita la publicación.
// Es unidireccional-seguro: productos nuevos legítimos NO llevan el marcador y
// siguen publicándose normalmente.
//
// Copia sincronizada de wenu-agent-hub/scripts/lib/keep-draft-guard.mjs
// AUTHOR: agente infra Wenu · 2026-07-04
// ────────────────────────────────────────────────────────────────────────────

export const KEEP_DRAFT_META_KEY = '_wenu_keep_draft';

const KEEP_DRAFT_TAG_SLUGS = new Set([
  'keep-draft',
  'no-republish',
  'no-republicar',
  'duplicado',
  'archivado',
]);

const KEEP_DRAFT_NAME_MARKERS = [
  /\[\s*(duplicado|archivo|archivado|indice|índice|no[-\s]?publicar)\s*\]/i,
];

const TRUTHY = new Set(['1', 'true', 'yes', 'si', 'sí', 'y']);

export function isKeepDraft(product) {
  if (!product) return false;
  const meta = Array.isArray(product.meta_data) ? product.meta_data : [];
  const flag = meta.find((m) => m && m.key === KEEP_DRAFT_META_KEY);
  if (flag && TRUTHY.has(String(flag.value).trim().toLowerCase())) return true;
  const tags = Array.isArray(product.tags) ? product.tags : [];
  for (const t of tags) {
    const slug = String(t?.slug || '').toLowerCase();
    const name = String(t?.name || '').toLowerCase();
    if (KEEP_DRAFT_TAG_SLUGS.has(slug) || KEEP_DRAFT_TAG_SLUGS.has(name)) return true;
  }
  const name = String(product.name || '');
  if (KEEP_DRAFT_NAME_MARKERS.some((rx) => rx.test(name))) return true;
  return false;
}

export function keepDraftReason(product) {
  if (!product) return null;
  const meta = Array.isArray(product.meta_data) ? product.meta_data : [];
  const flag = meta.find((m) => m && m.key === KEEP_DRAFT_META_KEY);
  if (flag && TRUTHY.has(String(flag.value).trim().toLowerCase())) {
    return `meta ${KEEP_DRAFT_META_KEY}=${flag.value}`;
  }
  const tags = Array.isArray(product.tags) ? product.tags : [];
  for (const t of tags) {
    const slug = String(t?.slug || '').toLowerCase();
    const name = String(t?.name || '').toLowerCase();
    if (KEEP_DRAFT_TAG_SLUGS.has(slug) || KEEP_DRAFT_TAG_SLUGS.has(name)) {
      return `tag ${t?.name || t?.slug}`;
    }
  }
  const name = String(product.name || '');
  for (const rx of KEEP_DRAFT_NAME_MARKERS) {
    const m = name.match(rx);
    if (m) return `nombre marcador ${m[0]}`;
  }
  return null;
}

export function keepDraftMetaPatch() {
  return { meta_data: [{ key: KEEP_DRAFT_META_KEY, value: '1' }] };
}
