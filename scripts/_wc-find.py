#!/usr/bin/env python3
import os, json, urllib.request, urllib.parse, ssl, sys
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
CK,CS=env("WOOCOMMERCE_KEY"),env("WOOCOMMERCE_SECRET")
BASE="https://www.wenumapuonline.com/wp-json/wc/v3"
q=urllib.parse.urlencode({"consumer_key":CK,"consumer_secret":CS})
UA={"User-Agent":"Mozilla/5.0 (Macintosh) Safari/605.1.15"}
ctx=ssl.create_default_context()
def call(url):
    r=urllib.request.Request(url,headers=UA)
    return json.loads(urllib.request.urlopen(r,context=ctx,timeout=30).read().decode())
term=sys.argv[1] if len(sys.argv)>1 else "prong"
res=call(f"{BASE}/products?search={urllib.parse.quote(term)}&per_page=20&{q}")
for p in res:
    print(p["id"], "|", p.get("sku"), "|", p["name"], "| type:", p.get("type"), "| imgs:", len(p.get("images",[])))
    for i,im in enumerate(p.get("images",[])):
        print("     [%d] id=%s %s"%(i, im["id"], im.get("src","").split("/")[-1]))
