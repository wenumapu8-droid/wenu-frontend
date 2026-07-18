#!/usr/bin/env python3
"""Turn WM-PRC-029 into a variable CZ Labret Top with 6 colour variations (one of
each, $25), clean photos, and archive the duplicate 2-colour listing. Backup first."""
import os, json, time, urllib.request, urllib.parse, ssl

H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
CK,CS=env("WOOCOMMERCE_KEY"),env("WOOCOMMERCE_SECRET")
BASE="https://www.wenumapuonline.com/wp-json/wc/v3"
AUTH=urllib.parse.urlencode({"consumer_key":CK,"consumer_secret":CS})
UA={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15","Content-Type":"application/json"}
ctx=ssl.create_default_context()
def call(method,path,body=None):
    url=f"{BASE}{path}{'&' if '?' in path else '?'}{AUTH}"
    data=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(url,data=data,method=method,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=120) as resp:
        return resp.status, json.loads(resp.read().decode())

IMGBASE="https://wenumapuonline.com/img/products/cz-tops"
COLORS=[("Champagne","cz-champagne"),("Blue","cz-blue"),("Aurora","cz-aurora"),
        ("Clear","cz-clear"),("Pink","cz-pink"),("Purple","cz-purple")]
PID=2426
TS=time.strftime("%Y%m%d-%H%M%S")

log=[]
# 1. backup
st,cur=call("GET",f"/products/{PID}")
json.dump(cur, open(f"{H}/Downloads/wenu-audit-cleanup/cz-029-backup-{TS}.json","w"), indent=1)
log.append(f"backup ok: {cur['name']} type={cur['type']} imgs={len(cur.get('images',[]))}")

# 2. convert parent to variable + hero (group) image + Color attribute.
#    Only ONE image here (the group hero) so WC sideloads just one → no timeout.
#    The per-colour photos ride on their variations below.
body={
  "name":"Titanium Round CZ Prong-Set Labret Top 16G — Choose Your Color",
  "type":"variable",
  "manage_stock":False,
  "images":[{"src":f"{IMGBASE}/cz-group.png"}],
  "attributes":[{"name":"Color","position":0,"visible":True,"variation":True,
                 "options":[c for c,_ in COLORS]}],
}
st,res=call("PUT",f"/products/{PID}",body)
log.append(f"parent -> variable: http {st}, imgs now {len(res.get('images',[]))}")

# 3. remove any pre-existing variations (clean slate)
st,exist=call("GET",f"/products/{PID}/variations?per_page=100")
for v in exist:
    call("DELETE",f"/products/{PID}/variations/{v['id']}?force=true")
if exist: log.append(f"removed {len(exist)} old variations")

# 4. create 6 colour variations, one of each, $25
for c,f in COLORS:
    vb={"regular_price":"25","sku":f"WM-PRC-029-{c[:3].upper()}",
        "manage_stock":True,"stock_quantity":1,"stock_status":"instock",
        "attributes":[{"name":"Color","option":c}],
        "image":{"src":f"{IMGBASE}/{f}.png"}}
    st,vr=call("POST",f"/products/{PID}/variations",vb)
    log.append(f"  variation {c}: http {st} id={vr.get('id')}")
    time.sleep(0.5)

# 5. archive the duplicate 2-colour listing
st,found=call("GET","/products?search="+urllib.parse.quote("CZ Labret Tops")+"&per_page=20")
for p in found:
    n=p["name"].lower()
    if p["id"]!=PID and "2 color" in n:
        call("PUT",f"/products/{p['id']}",{"status":"draft"})
        log.append(f"archived duplicate: {p['id']} {p['name']}")

open("/tmp/cz-var.log","w").write("\n".join(log)+"\n")
print("\n".join(log))
