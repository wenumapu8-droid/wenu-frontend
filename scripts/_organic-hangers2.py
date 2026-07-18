#!/usr/bin/env python3
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
HANG=[{"id":i} for i in [cid.get("hanger"),cid.get("hangers / weights")] if i]
IB="https://228f55d9.wenu-frontend.pages.dev/img/products/organic-hangers"
log=[]
# rename the already-created one to keep the batch consistent
try:
    call("PUT","/products/3392",{"sku":"WM-HAN-ORG-01"}); log.append("renamed 3392 -> WM-HAN-ORG-01")
except Exception as e: log.append("rename err "+str(e)[:60])
PROD=[
 ("WM-HAN-ORG-02","Bloodwood Angular Spiral Hangers with Bone Inlay — Pair","50","wood-square-spiral.webp",
  "Warm red bloodwood carved into a squared, architectural spiral, set with pale bone squares along the edge. A matched pair with real grain and hand finish. Organic material, curated for Wenu Mapu."),
 ("WM-HAN-ORG-03","Carved Horn Ornamental Drop Hangers — Pair","55","black-ornate.webp",
  "Black horn carved into an ornate faceted drop, with a fine scrollwork spine down the center. Bold and ceremonial, worn as a matched pair. Curated for Wenu Mapu."),
 ("WM-HAN-ORG-04","Braided Horn Coil Hangers with Brass Tip — Pair","60","black-braided-brass.webp",
  "Black horn carved as a braided coil that curls into a polished brass point — a matched pair with quiet contrast between dark organic material and warm metal. Curated for Wenu Mapu."),
 ("WM-HAN-ORG-05","Bloodwood Round Spiral Hangers with Bone & Brass — Pair","55","wood-round-spiral.webp",
  "Red bloodwood coiled into a full round spiral, the tail finished with a checkered inlay of bone and brass. Warm, grounding, a matched pair. Organic material, curated for Wenu Mapu."),
 ("WM-HAN-ORG-06","Bloodwood Hook Hangers with Brass Point — Pair","55","wood-hook-brass.webp",
  "Red bloodwood swept into a long hook that ends in a tapered brass point — a clean, striking matched pair. Organic wood and warm metal. Curated for Wenu Mapu."),
]
for sku,name,price,img,desc in PROD:
    body={"name":name,"type":"simple","status":"draft","sku":sku,"regular_price":price,
          "description":desc,"short_description":desc,"categories":HANG,
          "images":[{"src":f"{IB}/{img}"}],
          "meta_data":[{"key":"wm_origin","value":"imported-curated"},
                       {"key":"wm_note","value":"DRAFT — confirm gauge/size + final price before publish."}]}
    for attempt in range(3):
        try:
            st,res=call("POST","/products",body)
            log.append(f"{sku} http={st} id={res.get('id')} imgs={len(res.get('images',[]))}"); break
        except Exception as e:
            log.append(f"{sku} try{attempt} {str(e)[:70]}"); time.sleep(3)
    time.sleep(1.5)
open("/tmp/hangers2.log","w").write("\n".join(log)+"\n")
print("\n".join(log))
