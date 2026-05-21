#!/usr/bin/env python3
"""
Wenu Mapu — Bulk WC product creator from product sheets.

Parses /Users/user1/wenu-frontend/product-sheets/{tier}/*.md
For each sheet:
  1. Uploads featured photo to WP Media (WP App Password auth)
  2. Creates WC product as DRAFT status (Marimari publishes manually)
  3. Logs success/failure to /tmp/wc-bulk-create-log.json

Usage:
  python3 wc-bulk-create-from-sheets.py --tier curated --limit 1 --dry-run
  python3 wc-bulk-create-from-sheets.py --tier curated         # all curated
  python3 wc-bulk-create-from-sheets.py --sheet path/to.md     # single sheet
"""

import os
import re
import sys
import json
import glob
import time
import argparse
import mimetypes
from pathlib import Path

import requests
from requests.auth import HTTPBasicAuth

# --- Config ---------------------------------------------------------------
def _load_dotenv():
    """Load KEY=VALUE pairs from <repo>/.env into os.environ without external deps."""
    env_path = Path(__file__).resolve().parent.parent / '.env'
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding='utf-8').splitlines():
        line = raw.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_dotenv()


def _require_env(name):
    val = os.environ.get(name)
    if not val:
        sys.exit(f"ERROR: missing {name} in .env")
    return val


WC_URL = os.environ.get("WC_BASE_URL", "https://www.wenumapuonline.com")
WC_KEY = _require_env("WC_CONSUMER_KEY")
WC_SEC = _require_env("WC_CONSUMER_SECRET")
WP_USER = _require_env("WP_USER")
WP_APP_PWD = _require_env("WP_APP_PWD")
SHEETS_DIR = "/Users/user1/wenu-frontend/product-sheets"
LOG_FILE = "/tmp/wc-bulk-create-log.json"

wc_auth = HTTPBasicAuth(WC_KEY, WC_SEC)
wp_auth = HTTPBasicAuth(WP_USER, WP_APP_PWD)


# --- Sheet parsing --------------------------------------------------------
def parse_sheet(md_path):
    """Return dict with sku, tier, precio, slug, name, descriptions, foto_path, attributes."""
    text = Path(md_path).read_text(encoding='utf-8')

    # YAML frontmatter
    fm_match = re.match(r'^---\n(.*?)\n---\n', text, re.DOTALL)
    if not fm_match:
        raise ValueError(f"No frontmatter in {md_path}")
    fm_raw = fm_match.group(1)
    frontmatter = {}
    for line in fm_raw.split('\n'):
        if ':' in line:
            k, v = line.split(':', 1)
            frontmatter[k.strip()] = v.strip()

    body = text[fm_match.end():]

    # Product name (first h1)
    name_match = re.search(r'^#\s+(.+?)$', body, re.MULTILINE)
    name = name_match.group(1).strip() if name_match else frontmatter.get('sku', 'Unnamed')
    # Strip the "— Curated by Marimari" trailing suffix for cleaner display
    name_clean = re.sub(r'\s+—\s+(Curated|Made|Assembled|Forged).*$', '', name).strip()

    # SEO Title EN
    seo_match = re.search(r'##\s+SEO Title\s*\n+\*\*EN:\*\*\s+(.+?)$', body, re.MULTILINE)
    seo_title = seo_match.group(1).strip() if seo_match else name_clean

    # Slug
    slug_match = re.search(r'##\s+Slug\s*\n+`([^`]+)`', body)
    slug = slug_match.group(1).strip() if slug_match else None

    # Meta Description EN
    meta_match = re.search(r'##\s+Meta Description\s*\n+\*\*EN:\*\*\s+(.+?)$', body, re.MULTILINE | re.DOTALL)
    short_desc = meta_match.group(1).split('\n')[0].strip() if meta_match else ''

    # Long description EN
    long_match = re.search(
        r'##\s+Long Description\s*\n+\*\*EN:\*\*\s*\n+(.*?)(?=\n\*\*ES:\*\*|\n---)',
        body, re.DOTALL
    )
    long_desc_en = long_match.group(1).strip() if long_match else ''

    # Long description ES (for reference / future)
    long_es_match = re.search(
        r'\*\*ES:\*\*\s*\n+(.*?)(?=\n---)',
        body, re.DOTALL
    )
    long_desc_es = long_es_match.group(1).strip() if long_es_match else ''

    # Convert EN description to <p> HTML
    paragraphs_en = [p.strip() for p in long_desc_en.split('\n\n') if p.strip()]
    description_html = '\n'.join(f'<p>{p}</p>' for p in paragraphs_en)

    # Attributes table (Material, Type, Gauge, Sold As, etc.)
    attrs_match = re.search(
        r'##\s+WooCommerce Attributes\s*\n+\|.*?\|.*?\|\s*\n\|[-\s|]+\|\s*\n((?:\|.*\|\s*\n)+)',
        body, re.DOTALL
    )
    attributes = []
    wc_category_text = ""
    wc_tags_text = ""
    if attrs_match:
        rows = attrs_match.group(1).strip().split('\n')
        for row in rows:
            cells = [c.strip() for c in row.split('|') if c.strip()]
            if len(cells) >= 2:
                k, v = cells[0], cells[1]
                if k.lower() == 'wc category':
                    wc_category_text = v
                elif k.lower() == 'wc tag':
                    wc_tags_text = v
                else:
                    attributes.append({'name': k, 'options': [v]})

    # Photo path
    foto_match = re.search(r'##\s+Foto principal\s*\n+`([^`]+)`', body)
    foto_path = foto_match.group(1).strip() if foto_match else None

    if not foto_path and frontmatter.get('foto_path'):
        # Try frontmatter foto_path (directory) — find front-full.webp inside
        d = frontmatter['foto_path']
        # Normalize: if starts with /Obsidian make absolute
        if d.startswith('/Obsidian'):
            d = '/Users/user1' + d
        if os.path.isdir(d):
            cands = glob.glob(os.path.join(d, '*front-full.webp')) or \
                    glob.glob(os.path.join(d, '*-full.webp')) or \
                    glob.glob(os.path.join(d, '*.webp'))
            if cands:
                foto_path = cands[0]

    return {
        'sku': frontmatter.get('sku'),
        'tier': frontmatter.get('tier'),
        'precio': int(float(frontmatter.get('precio_sugerido_usd', '0'))),
        'name': name_clean,
        'seo_title': seo_title,
        'slug': slug,
        'short_description': short_desc,
        'description': description_html,
        'description_es': long_desc_es,
        'attributes': attributes,
        'wc_category_text': wc_category_text,
        'wc_tags_text': wc_tags_text,
        'foto_path': foto_path,
        'sheet_path': str(md_path),
    }


# --- WC operations --------------------------------------------------------
BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"


def resolve_photo_fallback(image_path):
    """If exact path doesn't exist, try -medium then -thumb in same folder."""
    if image_path and os.path.exists(image_path):
        return image_path
    if not image_path:
        return None
    folder = os.path.dirname(image_path)
    if not os.path.isdir(folder):
        return None
    fname = os.path.basename(image_path)
    # Try -full -> -medium -> -thumb fallback
    base = fname.replace('-front-full.webp', '').replace('-full.webp', '')
    for suffix in ['-front-medium.webp', '-medium.webp', '-front-thumb.webp', '-thumb.webp']:
        candidate = os.path.join(folder, f"{base}{suffix}")
        if os.path.exists(candidate):
            return candidate
    # Last resort: any webp
    any_webp = glob.glob(os.path.join(folder, '*.webp'))
    return any_webp[0] if any_webp else None


def upload_media(image_path):
    """Upload image to WP Media using multipart + browser UA (bypasses HostGator ModSecurity).
    Returns (media_id, error_or_None)."""
    # Try fallback to -medium / -thumb if -full doesn't exist
    resolved = resolve_photo_fallback(image_path)
    if not resolved:
        return None, f"file_not_found:{image_path}"
    image_path = resolved
    fname = os.path.basename(image_path)
    mime = mimetypes.guess_type(image_path)[0] or 'image/webp'
    with open(image_path, 'rb') as fh:
        files = {'file': (fname, fh, mime)}
        r = requests.post(
            f"{WC_URL}/wp-json/wp/v2/media",
            auth=wp_auth,
            files=files,
            headers={'User-Agent': BROWSER_UA},
            timeout=120,
        )
    if r.status_code in (200, 201):
        return r.json()['id'], None
    return None, f"http_{r.status_code}:{r.text[:200]}"


def find_or_create_category(name_text):
    """Find category by name. Returns id or None."""
    if not name_text:
        return None
    # Take first part of "Stretching > Tunnel / Organic > Wood" — use the last leaf
    primary = name_text.split('/')[0].strip().split('>')[-1].strip()
    if not primary:
        return None
    r = requests.get(
        f"{WC_URL}/wp-json/wc/v3/products/categories",
        auth=wc_auth,
        params={'search': primary, 'per_page': 5},
        timeout=15,
    )
    if r.status_code == 200:
        cats = r.json()
        for c in cats:
            if c['name'].lower() == primary.lower():
                return c['id']
    return None


_SKU_INDEX = None


def _build_sku_index():
    """Paginate the whole catalog and map sku -> (id, [image_srcs]).

    The WooCommerce REST `?sku=` filter is unreliable on this install
    (the wc_product_meta_lookup table is out of sync, and most legacy
    products have an empty SKU), so we scan client-side instead. Pages
    are kept small because HostGator ModSecurity drops large responses."""
    global _SKU_INDEX
    _SKU_INDEX = {}
    page = 1
    while True:
        resp = None
        for attempt in range(3):
            try:
                resp = requests.get(
                    f"{WC_URL}/wp-json/wc/v3/products",
                    auth=wc_auth,
                    params={'per_page': 20, 'page': page, 'status': 'any'},
                    headers={'User-Agent': BROWSER_UA},
                    timeout=25,
                )
                break
            except requests.exceptions.RequestException:
                time.sleep(2)
        if resp is None:
            print(f"    WARN: sku index page {page} failed after retries")
            break
        if resp.status_code != 200:
            print(f"    WARN: sku index page {page} HTTP {resp.status_code}")
            break
        items = resp.json()
        if not items:
            break
        for p in items:
            sku = (p.get('sku') or '').strip()
            if sku:
                _SKU_INDEX[sku] = (
                    p['id'],
                    [img.get('src', '') for img in p.get('images', [])],
                )
        total_pages = int(resp.headers.get('X-WP-TotalPages', page) or page)
        if page >= total_pages:
            break
        page += 1
    print(f"    sku index built: {len(_SKU_INDEX)} products with a SKU")


def find_product_by_sku(sku):
    """Return (product_id, [image_srcs]) for an existing SKU, else (None, None)."""
    if not sku:
        return None, None
    if _SKU_INDEX is None:
        _build_sku_index()
    return _SKU_INDEX.get(sku, (None, None))


def create_product(sheet_data, dry_run=False, update_existing=False):
    """Create or update a WC product. Returns (id, action, error).

    action is one of: 'created', 'updated', 'skipped', 'error'.
    When the SKU already exists and update_existing is False the product
    is left untouched (safe default). With update_existing=True an
    existing product is PUT-updated from the sheet — this replaces the
    image gallery, name, price, description and attributes with the
    sheet's curated values."""
    sku = sheet_data['sku']
    existing_id, existing_imgs = find_product_by_sku(sku)

    if existing_id and not update_existing:
        return existing_id, 'skipped', f'sku_exists:{existing_id} (pass --update-existing to overwrite)'

    # Upload photo
    media_id = None
    if sheet_data['foto_path']:
        if dry_run:
            print(f"    [dry-run] would upload: {sheet_data['foto_path']}")
            media_id = 0
        else:
            media_id, err = upload_media(sheet_data['foto_path'])
            if err:
                return None, 'error', f"upload_failed:{err}"
            print(f"    photo uploaded media_id={media_id}")

    # Build product payload
    payload = {
        'name': sheet_data['name'],
        'slug': sheet_data['slug'] or '',
        'status': 'draft',                      # DRAFT — Marimari publishes
        'catalog_visibility': 'visible',
        'sku': sheet_data['sku'],
        'regular_price': str(sheet_data['precio']),
        'description': sheet_data['description'],
        'short_description': sheet_data['short_description'],
        'attributes': sheet_data['attributes'],
        'meta_data': [
            {'key': '_wenumapu_tier', 'value': sheet_data['tier']},
            {'key': '_wenumapu_description_es', 'value': sheet_data['description_es']},
            {'key': '_yoast_wpseo_title', 'value': sheet_data['seo_title']},
            {'key': '_yoast_wpseo_metadesc', 'value': sheet_data['short_description']},
        ],
    }

    if media_id and media_id > 0:
        payload['images'] = [{'id': media_id}]

    if dry_run:
        action = 'updated' if existing_id else 'created'
        print(f"    [dry-run] would {action.upper()} (existing_id={existing_id})")
        if existing_id and existing_imgs:
            print(f"    [dry-run] current image(s): {[s[-50:] for s in existing_imgs]}")
        print(f"    [dry-run] payload preview:")
        print(json.dumps({k: v for k, v in payload.items() if k != 'description'}, indent=2)[:800])
        return (existing_id or -1), action, None

    if existing_id:
        r = requests.put(
            f"{WC_URL}/wp-json/wc/v3/products/{existing_id}",
            auth=wc_auth,
            json=payload,
            headers={'User-Agent': BROWSER_UA},
            timeout=30,
        )
        if r.status_code in (200, 201):
            return r.json()['id'], 'updated', None
        return None, 'error', f"update_failed_{r.status_code}:{r.text[:300]}"

    r = requests.post(
        f"{WC_URL}/wp-json/wc/v3/products",
        auth=wc_auth,
        json=payload,
        headers={'User-Agent': BROWSER_UA},
        timeout=30,
    )
    if r.status_code in (200, 201):
        return r.json()['id'], 'created', None
    return None, 'error', f"create_failed_{r.status_code}:{r.text[:300]}"


# --- Main loop ------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--tier', default=None, help='atelier-forged|atelier-assembled|curated|atacama|collab')
    parser.add_argument('--sheet', default=None, help='single sheet path')
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--update-existing', action='store_true',
                        help='PUT-update products whose SKU already exists '
                             '(replaces image, name, price, description from the sheet)')
    args = parser.parse_args()

    if args.sheet:
        sheets = [args.sheet]
    elif args.tier:
        sheets = sorted(glob.glob(f"{SHEETS_DIR}/{args.tier}/*.md"))
    else:
        sheets = sorted(glob.glob(f"{SHEETS_DIR}/*/*.md"))

    # Skip template / alert files
    sheets = [s for s in sheets if '_template' not in s and '_ALERTA' not in s]
    if args.limit:
        sheets = sheets[:args.limit]

    print(f"Processing {len(sheets)} sheets "
          f"(dry_run={args.dry_run}, update_existing={args.update_existing})")

    results = []
    for i, sheet_path in enumerate(sheets, 1):
        print(f"\n[{i}/{len(sheets)}] {os.path.basename(sheet_path)}")
        try:
            data = parse_sheet(sheet_path)
            print(f"    sku={data['sku']} tier={data['tier']} precio=${data['precio']}")
            print(f"    name: {data['name'][:60]}")
            print(f"    foto: {data['foto_path']}")
            wc_id, action, err = create_product(
                data, dry_run=args.dry_run, update_existing=args.update_existing)
            if err and action == 'error':
                print(f"    FAIL: {err}")
                results.append({'sheet': sheet_path, 'sku': data['sku'],
                                'ok': False, 'action': action, 'error': err})
            elif action == 'skipped':
                print(f"    SKIPPED: {err}")
                results.append({'sheet': sheet_path, 'sku': data['sku'],
                                'ok': True, 'action': 'skipped', 'wc_id': wc_id})
            else:
                print(f"    OK [{action}] wc_id={wc_id}")
                results.append({'sheet': sheet_path, 'sku': data['sku'],
                                'ok': True, 'action': action, 'wc_id': wc_id})
        except Exception as e:
            print(f"    EXCEPTION: {e}")
            results.append({'sheet': sheet_path, 'ok': False,
                            'action': 'error', 'error': f'exception:{e}'})

    # Save log
    with open(LOG_FILE, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\nLog: {LOG_FILE}")
    created = sum(1 for r in results if r.get('action') == 'created')
    updated = sum(1 for r in results if r.get('action') == 'updated')
    skipped = sum(1 for r in results if r.get('action') == 'skipped')
    fail = sum(1 for r in results if not r['ok'])
    print(f"Summary: {created} created, {updated} updated, "
          f"{skipped} skipped, {fail} failed")


if __name__ == '__main__':
    main()
