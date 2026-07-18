#!/usr/bin/env python3
"""Finalize the 6 organic hangers: real material + mm (from Ocin's TAWAPA receipt),
add to the Organic collection/category, fix inlay copy (brass), add a Size attribute,
and PUBLISH. Names stay Wenu's own (not TAWAPA's). Origin imported-curated."""
import os, json, time, urllib.request, urllib.parse, ssl
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
A=urllib.parse.urlencode({"consumer_key":env("WOOCOMMERCE_KEY"),"consumer_secret":env("WOOCOMMERCE_SECRET")})
B="https://www.wenumapuonline.com/wp-json/wc/v3"
UA={"User-Agent":"Mozilla/5.0 (Macintosh) Safari/605.1.15","Content-Type":"application/json"}
ctx=ssl.create_default_context()
def call(m,path,body=None):
    d=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(B+path+('&' if '?' in path else '?')+A,data=d,method=m,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=120) as x: return x.status, json.loads(x.read().decode())
st,cats=call("GET","/products/categories?per_page=100")
cid={c["name"].lower():c["id"] for c in cats}
def catids(*names):
    return [{"id":cid[n]} for n in names if cid.get(n)]
ORG=catids("hanger","hangers / weights","organic")
# id, name, material, size_mm, description
DATA=[
 (3392,"Black Horn Teardrop Spiral Hangers — Pair","Carved horn","11 mm",
  "Hand-carved horn, polished to a deep obsidian black — the classic teardrop coil, worn as a matched pair. From the Organic collection. Carved horn · 11 mm."),
 (3394,"Bloodwood Angular Spiral Hangers with Brass Inlay — Pair","Bloodwood with brass inlay","12.5 mm",
  "Warm red bloodwood carved into a squared, architectural spiral, set with brass along the edge. A matched pair with real grain and hand finish. From the Organic collection. Bloodwood + brass · 12.5 mm."),
 (3396,"Carved Horn Ornamental Drop Hangers — Pair","Carved horn","5 mm",
  "Black horn carved into an ornate faceted drop, with a fine scrollwork spine down the center. Bold and ceremonial, worn as a matched pair. From the Organic collection. Carved horn · 5 mm."),
 (3398,"Braided Horn Coil Hangers with Brass Tip — Pair","Carved horn with brass","9.5 mm",
  "Black horn carved as a braided coil that curls into a polished brass point — a matched pair, dark organic material against warm metal. From the Organic collection. Horn + brass · 9.5 mm."),
 (3400,"Bloodwood Round Spiral Hangers with Brass Inlay — Pair","Bloodwood with brass inlay","12.5 mm",
  "Red bloodwood coiled into a full round spiral, the tail finished with a checkered brass inlay. Warm and grounding, a matched pair. From the Organic collection. Bloodwood + brass · 12.5 mm."),
 (3402,"Bloodwood Hook Hangers with Brass Point — Pair","Bloodwood with brass","9.5 mm",
  "Red bloodwood swept into a long hook that ends in a tapered brass point — a clean, striking matched pair. From the Organic collection. Bloodwood + brass · 9.5 mm."),
]
log=[]
for pid,name,mat,size,desc in DATA:
    body={"name":name,"status":"publish","description":desc,"short_description":desc,
          "categories":ORG,
          "attributes":[
            {"name":"Material","visible":True,"options":[mat]},
            {"name":"Size","visible":True,"options":[size]},
          ],
          "meta_data":[{"key":"wm_origin","value":"imported-curated"},
                       {"key":"wm_collection","value":"organic"},
                       {"key":"wm_note","value":"Provisional SKU WM-HAN-ORG — register canonical in NocoDB when Docker up."}]}
    try:
        st,res=call("PUT","/products/%d"%pid,body)
        log.append(f"{res.get('sku')} id={pid} -> {res['status']} · {mat} {size}")
    except Exception as e:
        log.append(f"id={pid} ERR {str(e)[:70]}")
    time.sleep(1)
open("/tmp/hangers-final.log","w").write("cats="+str(ORG)+"\n"+"\n".join(log)+"\n")
print("cats:",ORG); print("\n".join(log))
