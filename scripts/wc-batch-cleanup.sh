#!/usr/bin/env bash
# WC batch update generado 2026-05-22
# NO ejecutar sin OK del owner.
# Fuente: NocoDB nc_9aor___Piezas (189 SKUs)

set -e
cd "$(dirname "$0")/.."
set -a; source ./.env; set +a

API="https://www.wenumapuonline.com/wp-json/wc/v3/products"
AUTH="-u $WC_CONSUMER_KEY:$WC_CONSUMER_SECRET"

log(){ echo "[$(date +%H:%M:%S)] $*"; }

update(){
  local id="$1"; local body="$2"; local desc="$3"
  log "PUT $id  $desc"
  curl -sS -X PUT $AUTH -H "Content-Type: application/json" "$API/$id" -d "$body" -o /tmp/wc-update-$id.json -w "  → HTTP %{http_code}\n"
}


log "==== PUBLISH (8) ===="
update 2073 '{"status":"publish","sku":"WM-HAN-008"}' "publish: Teardrop Amethyst"
update 2067 '{"status":"publish","sku":"WM-HAN-005"}' "publish: Ornamental Wood Ear Weights"
update 2064 '{"status":"publish","sku":"WM-TUN-017"}' "publish: Wood Tunnel Expansion"
update 2061 '{"status":"publish","sku":"WM-PRC-006"}' "publish: Gold Titanium Marquise Piercing wit"
update 2056 '{"status":"publish","sku":"WM-HAN-029"}' "publish: Golden Triangular Geometric Ear Wei"
update 2055 '{"status":"publish","sku":"WM-SEP-002"}' "publish: 6mm Titanium Septum Rings"
update 2054 '{"status":"publish","sku":"WM-SEP-003"}' "publish: 6mm Silver Titanium Septum Rings"
update 1828 '{"status":"publish","sku":"WM-RNG-001"}' "publish: Ring | WM-RNG-001"

log "==== SOLD-OUT (4) ===="
update 2071 '{"stock_status":"outofstock","sku":"WM-RNG-003"}' "sold-out: Carved Brass Ring"
update 2060 '{"stock_status":"outofstock","sku":"WM-SEP-001"}' "sold-out: Golden Drop-Shaped Clicker Septum"
update 2057 '{"stock_status":"outofstock","sku":"WM-SEP-005"}' "sold-out: Golden Multi-Ring Expansion Clicker"
update 1829 '{"stock_status":"outofstock","sku":"WM-SEP-001"}' "sold-out: Septum Ring | WM-SEP-001"

log "==== DRAFT (17) ===="
update 2083 '{"status":"draft","sku":"WM-PLG-003"}' "draft: Stainless Steel Spiral Engraved Plu"
update 2076 '{"status":"draft","sku":"WM-PRC-001"}' "draft: Mystic snake piercing"
update 2075 '{"status":"draft","sku":"WM-HAN-027"}' "draft: Diamond Walnut Wood Hangers"
update 2072 '{"status":"draft","sku":"WM-OTH-002"}' "draft: Octagonal Wood Sunglasses"
update 2070 '{"status":"draft","sku":"WM-PLG-011"}' "draft: Bell Surgical Steel Expansions (Bla"
update 2069 '{"status":"draft","sku":"WM-PLG-013"}' "draft: Bronze Spiral Expansions"
update 2068 '{"status":"draft","sku":"WM-PLG-013"}' "draft: Bronze Spiral Expansion"
update 2066 '{"status":"draft","sku":"WM-SAD-008"}' "draft: Black Surgical Steel Snake Saddle E"
update 2065 '{"status":"draft","sku":"WM-PLG-020"}' "draft: Dark Wood Smooth Plug"
update 2062 '{"status":"draft","sku":"WM-PRC-005"}' "draft: Three Dot Titanium Piercing"
update 1826 '{"status":"draft","sku":"WM-PLG-015"}' "draft: Stone Plug 10mm | WM-PLG-015"
update 1811 '{"status":"draft","sku":"WM-PLG-034"}' "draft: Curated Stone Plug 10mm | WM-PLG-00"
update 1810 '{"status":"draft","sku":"WM-PLG-034"}' "draft: Stone Plug 10mm Detail | WM-PLG-004"
update 1787 '{"status":"draft","sku":"WM-HAN-004"}' "draft: Surgical Steel Hanger 10mm | WM-HAN"
update 1786 '{"status":"draft","sku":"WM-HAN-003"}' "draft: Curated Surgical Steel Body Hanger "
update 1785 '{"status":"draft","sku":"WM-HAN-003"}' "draft: Surgical Steel Hanger 10mm Detail |"
update 593 '{"status":"draft","sku":"WM-HAN-027"}' "draft: Certified Walnut Wood Ear Gauges"

log "==== UNPUBLISH-AI (3) ===="
update 2086 '{"status":"draft","sku":"WM-RNG-001"}' "unpublish-AI: Ritual Ring Vacamuerta Nº3 – Sterli"
update 2085 '{"status":"draft","sku":"WM-RNG-002"}' "unpublish-AI: RITUAL RING No. 19 – Sterling Silve"
update 2077 '{"status":"draft","sku":"WM-PRC-002"}' "unpublish-AI: Mystic Bee Titanium Piercing"

log "==== UNPUBLISH-LEGACY (1) ===="
update 1800 '{"status":"draft"}' "unpublish-legacy: Steel Labret 10mm | WM-LAB-003"

log "DONE. Logs en /tmp/wc-update-*.json"