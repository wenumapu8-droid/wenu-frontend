#!/usr/bin/env python3
"""Tribal Architecture Magnetic Hanger: replace ruler/caliper photo with 4 black-bg
photos (pair as hero). Sequential single sideloads to avoid WC 500. Backup first."""
import os, json, time, urllib.request, urllib.parse, ssl
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
A=urllib.parse.urlencode({"consumer_key":env("WOOCOMMERCE_KEY"),"consumer_secret":env("WOOCOMMERCE_SECRET")})
BASE="https://www.wenumapuonline.com/wp-json/wc/v3"
UA={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15","Content-Type":"application/json"}
ctx=ssl.create_default_context()
def call(m,path,body=None):
    data=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(f"{BASE}{path}{'&' if '?' in path else '?'}{A}",data=data,method=m,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=120) as resp:
        return resp.status, json.loads(resp.read().decode())

IB="https://d219ed57.wenu-frontend.pages.dev/img/products/tribal-arch"
NEW=[f"{IB}/arch-1.webp",f"{IB}/arch-2.webp",f"{IB}/arch-3.webp",f"{IB}/arch-4.webp"]

# find the product
st,found=call("GET","/products?search="+urllib.parse.quote("Tribal Architecture Magnetic"))
p=next((x for x in found if "architecture" in x["name"].lower()),found[0] if found else None)
PID=p["id"]
os.makedirs(f"{H}/Downloads/wenu-audit-cleanup",exist_ok=True)
json.dump(p, open(f"{H}/Downloads/wenu-audit-cleanup/arch-{PID}-backup.json","w"), indent=1)
print(f"product: {p['name']} id={PID} sku={p.get('sku')} old imgs={len(p.get('images',[]))}")

# sequential: set hero first (1 sideload), then append one at a time
ids=[]
for i,src in enumerate(NEW):
    imgs=[{"id":x} for x in ids]+[{"src":src}]
    st,res=call("PUT",f"/products/{PID}",{"images":imgs})
    ids=[im["id"] for im in res.get("images",[])]
    print(f"  +arch-{i+1}: http={st} total imgs now={len(ids)}")
    time.sleep(0.6)
st,res=call("GET",f"/products/{PID}")
print("final:",[im["src"].split("/")[-1] for im in res.get("images",[])])
