#!/usr/bin/env python3
import os, json, sys, urllib.request, urllib.parse, ssl
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
CK,CS=env("WOOCOMMERCE_KEY"),env("WOOCOMMERCE_SECRET")
WURL=env("WOOCOMMERCE_URL") or "https://www.wenumapuonline.com"
BASE=WURL if "wp-json" in WURL else WURL.rstrip("/")+"/wp-json/wc/v3"
q=urllib.parse.urlencode({"consumer_key":CK,"consumer_secret":CS})
UA={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15","Content-Type":"application/json"}
ctx=ssl.create_default_context()

def call(method,url,body=None):
    data=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(url,data=data,method=method,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=30) as resp:
        return json.loads(resp.read().decode())

sku="WM-TUN-001"
prods=call("GET", f"{BASE}/products?sku={sku}&{q}")
if not prods:
    print("NOT FOUND", sku); sys.exit(1)
p=prods[0]
print("PRODUCT", p["id"], "-", p["name"])
for i,img in enumerate(p.get("images",[])):
    print(f"  [{i}] id={img['id']}  {img.get('src','').split('/')[-1]}  alt={img.get('alt','')[:40]}")

# If an arg 'remove:<imgId>' is given, remove that image and PUT.
for a in sys.argv[1:]:
    if a.startswith("remove:"):
        rid=int(a.split(":")[1])
        newimgs=[{"id":im["id"]} for im in p["images"] if im["id"]!=rid]
        res=call("PUT", f"{BASE}/products/{p['id']}?{q}", {"images":newimgs})
        print("AFTER REMOVE:")
        for i,img in enumerate(res.get("images",[])):
            print(f"  [{i}] id={img['id']}  {img.get('src','').split('/')[-1]}")
