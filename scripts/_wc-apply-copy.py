#!/usr/bin/env python3
"""Apply corrected copy (name + short_description + description) to WooCommerce.
Backup-first, skip blocked, only the 3 text fields. Fully reversible.
Reads WC creds from ~/wenu-frontend/.env. Specs (attributes_fix) are NOT touched
here — those go to src/data/specs-by-sku.json in a separate step."""
import json, os, time, urllib.request, urllib.parse, ssl

HOME = os.path.expanduser("~")
ENV = os.path.join(HOME, ".hermes", ".env")   # Hermes holds the READ-WRITE key
SRC = os.path.join(HOME, "Downloads", "wenu-audit-cleanup", "copy-corregido-2026-07-12.json")
TS = time.strftime("%Y%m%d-%H%M%S")
BACKUP = os.path.join(HOME, "Downloads", "wenu-audit-cleanup", f"woo-copy-backup-{TS}.json")
LOG = "/tmp/wc-apply.log"
ONLY = os.environ.get("ONLY_SKU")  # if set, apply just that one (test mode)

def env(k):
    for line in open(ENV):
        line = line.strip()
        if line.startswith(k + "="):
            return line.split("=", 1)[1].strip().strip('"').strip("'").strip()
    return ""

CK, CS = env("WOOCOMMERCE_KEY"), env("WOOCOMMERCE_SECRET")
WURL = env("WOOCOMMERCE_URL") or "https://www.wenumapuonline.com"
BASE = WURL if "wp-json" in WURL else WURL.rstrip("/") + "/wp-json/wc/v3"
auth = urllib.parse.urlencode({"consumer_key": CK, "consumer_secret": CS})
ctx = ssl.create_default_context()

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
      "(KHTML, like Gecko) Version/17.0 Safari/605.1.15")  # Cloudflare bans Python-urllib UA

def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method,
                               headers={"Content-Type": "application/json", "User-Agent": UA})
    with urllib.request.urlopen(r, context=ctx, timeout=40) as resp:
        return resp.status, json.loads(resp.read().decode())

d = json.load(open(SRC))
prods = d["products"]
backup, results = [], []
applied = skipped = failed = 0

for p in prods:
    sku, pid = p.get("sku"), p.get("id")
    if ONLY and sku != ONLY:
        continue
    if p.get("blocked"):
        results.append(f"SKIP blocked  {sku} ({pid})")
        skipped += 1
        continue
    payload = {}
    for f in ("name", "short_description", "description"):
        v = p.get(f)
        if v:  # null/empty = leave as is
            payload[f] = v
    if not payload:
        results.append(f"SKIP nofields {sku} ({pid})")
        skipped += 1
        continue
    try:
        st, cur = req("GET", f"{BASE}/products/{pid}?{auth}")
        backup.append({"id": pid, "sku": sku,
                       "name": cur.get("name"),
                       "short_description": cur.get("short_description"),
                       "description": cur.get("description")})
        st2, _ = req("PUT", f"{BASE}/products/{pid}?{auth}", payload)
        if st2 == 200:
            results.append(f"OK   {sku} ({pid})  fields={list(payload)}")
            applied += 1
        else:
            results.append(f"FAIL {sku} ({pid}) http={st2}")
            failed += 1
    except Exception as e:
        results.append(f"ERR  {sku} ({pid}) {e}")
        failed += 1
    time.sleep(0.4)

json.dump(backup, open(BACKUP, "w"), indent=1, ensure_ascii=False)
with open(LOG, "w") as f:
    f.write("\n".join(results))
    f.write(f"\n\nAPPLIED {applied}  SKIPPED {skipped}  FAILED {failed}\nBACKUP {BACKUP}\n")
print(f"APPLIED {applied}  SKIPPED {skipped}  FAILED {failed}")
print("BACKUP", BACKUP)
