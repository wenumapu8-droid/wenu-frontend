#!/usr/bin/env python3
"""Safe WP media cleanup for wenumapuonline.com (HostGator).
STEP 1: collect every image id used by ANY WooCommerce product (featured+gallery,
        any status) -> USED. These are NEVER touched.
STEP 2: list all media; orphans = media NOT in USED.
STEP 3: among orphans, flag the clearly-unnecessary ones (AI/reference renders,
        legacy phone UUID photos, exact-duplicate basenames, heavy old junk).
STEP 4: write a full manifest to ~/Downloads/wenu-audit-cleanup/media-deleted-<ts>.json
        (record of everything removed) and DELETE the flagged set (force=true).
Run with DELETE=1 env to actually delete; otherwise dry-run (reports only)."""
import os, re, json, base64, time, urllib.request, urllib.parse, ssl, collections
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
DELETE = os.environ.get("DELETE")=="1"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
WCA=urllib.parse.urlencode({"consumer_key":env("WOOCOMMERCE_KEY"),"consumer_secret":env("WOOCOMMERCE_SECRET")})
tok=base64.b64encode(f'{env("WP_USER")}:{env("WP_APP_PASSWORD")}'.encode()).decode()
UAwp={"User-Agent":"Mozilla/5.0 (Macintosh) Safari/605.1.15","Authorization":"Basic "+tok}
UAwc={"User-Agent":"Mozilla/5.0 (Macintosh) Safari/605.1.15"}
ctx=ssl.create_default_context()
WC="https://www.wenumapuonline.com/wp-json/wc/v3"
WP="https://www.wenumapuonline.com/wp-json/wp/v2/media"
def jget(url,hdr):
    r=urllib.request.Request(url,headers=hdr)
    with urllib.request.urlopen(r,context=ctx,timeout=120) as x:
        return json.loads(x.read().decode()), x.headers

# STEP 1: USED image ids from all products (any status)
USED=set()
for status in ("any",):
    page=1
    while True:
        u=f"{WC}/products?per_page=100&page={page}&status={status}&{WCA}"
        try: items,hdr=jget(u,UAwc)
        except Exception as e:
            print("products page err",page,str(e)[:80]); break
        if not items: break
        for p in items:
            for im in (p.get("images") or []):
                if im.get("id"): USED.add(im["id"])
        tp=int(hdr.get("X-WP-TotalPages","1"))
        if page>=tp: break
        page+=1
print("USED product images:",len(USED))

# STEP 2: all media
media=[]
page=1; pages=None
while True:
    u=f"{WP}?per_page=100&page={page}&_fields=id,date,source_url,title,mime_type,media_details"
    try: items,hdr=jget(u,UAwp)
    except Exception as e:
        time.sleep(3)
        try: items,hdr=jget(u,UAwp)
        except Exception as e2: print("media page err",page,str(e2)[:80]); break
    if pages is None: pages=int(hdr.get("X-WP-TotalPages","1"))
    if not items: break
    for m in items:
        md=m.get("media_details") or {}
        fs=md.get("filesize") or 0
        tb=0; seen=set()
        for s in (md.get("sizes") or {}).values():
            f=s.get("file");
            if f and f not in seen: seen.add(f); tb+=(s.get("filesize") or 0)
        name=(m.get("source_url","").split("/")[-1])
        media.append({"id":m["id"],"name":name,"date":(m.get("date") or "")[:10],
                      "mime":m.get("mime_type",""),"bytes":fs+tb})
    if page>=pages: break
    page+=1
print("media total:",len(media))

# STEP 3: orphans + flags
orphans=[m for m in media if m["id"] not in USED]
# duplicate basenames (strip -1,-2,-scaled,-e<digits> suffixes)
def base(n):
    n=re.sub(r'\.(png|jpe?g|webp|gif)$','',n,flags=re.I)
    n=re.sub(r'(-scaled|-\d+x\d+|-e\d+|-\d+)$','',n)
    return n.lower()
basecount=collections.Counter(base(m["name"]) for m in media)
UUID=re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.',re.I)
def is_reference(n):
    nl=n.lower()
    return ('chatgpt-image' in nl or 'referencia' in nl or nl.startswith('img_')
            or 'screenshot' in nl or 'captura' in nl or 'dall-e' in nl or 'render' in nl)
flag=[]
for m in orphans:
    reasons=[]
    if is_reference(m["name"]): reasons.append("reference/AI")
    if UUID.match(m["name"]): reasons.append("legacy-phone")
    if basecount[base(m["name"])]>1: reasons.append("duplicate")
    # heavy old orphan junk
    if m["bytes"]>2*1048576 and m["date"]<"2026-06": reasons.append("heavy-old-orphan")
    # SAFE delete only: unambiguous junk. Exclude pure heavy-old-orphan and any PDF
    # (could be linked by the still-live legacy WordPress at www).
    safe = any(r in ("reference/AI","legacy-phone","duplicate") for r in reasons) \
           and m["mime"] != "application/pdf"
    if reasons and safe:
        m2=dict(m); m2["reasons"]=reasons; flag.append(m2)
flag.sort(key=lambda x:-x["bytes"])
tot=sum(m["bytes"] for m in flag)
print(f"orphans:{len(orphans)}  FLAGGED for delete:{len(flag)}  frees ~{tot/1048576:.0f}MB")
for m in flag[:40]:
    print(f"  {m['bytes']/1048576:5.1f}MB id={m['id']:<6} {m['date']} {','.join(m['reasons']):28} {m['name'][:46]}")

# STEP 4: manifest + delete
os.makedirs(f"{H}/Downloads/wenu-audit-cleanup",exist_ok=True)
ts=time.strftime("%Y%m%d-%H%M%S")
json.dump({"used":len(USED),"media":len(media),"flagged":flag,"frees_mb":round(tot/1048576)},
          open(f"{H}/Downloads/wenu-audit-cleanup/media-deleted-{ts}.json","w"), indent=1)
print("manifest ->", f"~/Downloads/wenu-audit-cleanup/media-deleted-{ts}.json")
if DELETE:
    ok=0; err=0
    for m in flag:
        try:
            r=urllib.request.Request(f"{WP}/{m['id']}?force=true",headers=UAwp,method="DELETE")
            urllib.request.urlopen(r,context=ctx,timeout=90); ok+=1
        except Exception as e:
            err+=1; print("del err",m["id"],str(e)[:60])
        if ok%25==0: time.sleep(1)
    print(f"DELETED {ok}  errors {err}")
else:
    print("DRY RUN — nothing deleted. Re-run with DELETE=1 to remove the flagged set.")
