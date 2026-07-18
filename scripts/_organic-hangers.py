#!/usr/bin/env python3
"""Create 6 organic-hanger products (imported-curated) as DRAFTS in WooCommerce,
with Wenu-voice fichas + prices + the black-bg photos. Draft until Ocin confirms
price + gauge. Origin = imported-curated (NEVER handmade)."""
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

# hanger category ids
st,cats=call("GET","/products/categories?per_page=100")
cid={c["name"].lower():c["id"] for c in cats}
HANG=[cid.get("hanger")] if cid.get("hanger") else []
if cid.get("hangers / weights"): HANG.append(cid["hangers / weights"])
HANG=[{"id":i} for i in HANG if i]

IB="https://228f55d9.wenu-frontend.pages.dev/img/products/organic-hangers"
PROD=[
 ("WM-HAN-030","Black Horn Teardrop Spiral Hangers — Pair","45","black-spiral.webp",
  "Hand-carved horn, polished to a deep obsidian black — the classic teardrop coil, worn as a matched pair. Smooth organic weight that settles into a stretched lobe. Curated for Wenu Mapu."),
 ("WM-HAN-031","Bloodwood Angular Spiral Hangers with Bone Inlay — Pair","50","wood-square-spiral.webp",
  "Warm red bloodwood carved into a squared, architectural spiral, set with pale bone squares along the edge. A matched pair with real grain and hand finish. Organic material, curated for Wenu Mapu."),
 ("WM-HAN-032","Carved Horn Ornamental Drop Hangers — Pair","55","black-ornate.webp",
  "Black horn carved into an ornate faceted drop, with a fine scrollwork spine down the center. Bold and ceremonial, worn as a matched pair. Curated for Wenu Mapu."),
 ("WM-HAN-033","Braided Horn Coil Hangers with Brass Tip — Pair","60","black-braided-brass.webp",
  "Black horn carved as a braided coil that curls into a polished brass point — a matched pair with quiet contrast between dark organic material and warm metal. Curated for Wenu Mapu."),
 ("WM-HAN-034","Bloodwood Round Spiral Hangers with Bone & Brass — Pair","55","wood-round-spiral.webp",
  "Red bloodwood coiled into a full round spiral, the tail finished with a checkered inlay of bone and brass. Warm, grounding, a matched pair. Organic material, curated for Wenu Mapu."),
 ("WM-HAN-035","Bloodwood Hook Hangers with Brass Point — Pair","55","wood-hook-brass.webp",
  "Red bloodwood swept into a long hook that ends in a tapered brass point — a clean, striking matched pair. Organic wood and warm metal. Curated for Wenu Mapu."),
]
log=[]
for sku,name,price,img,desc in PROD:
    body={"name":name,"type":"simple","status":"draft","sku":sku,"regular_price":price,
          "description":desc,"short_description":desc,"categories":HANG,
          "images":[{"src":f"{IB}/{img}"}],
          "meta_data":[{"key":"wm_origin","value":"imported-curated"},
                       {"key":"wm_note","value":"DRAFT — confirm gauge/size + final price before publish. Base ref $45, brass/inlay higher."}]}
    try:
        st,res=call("POST","/products",body)
        log.append(f"{sku} http={st} id={res.get('id')} imgs={len(res.get('images',[]))} '{name[:40]}'")
    except Exception as e:
        log.append(f"{sku} ERROR {str(e)[:80]}")
    time.sleep(1)
open("/tmp/hangers.log","w").write("\n".join(log)+"\n")
print("cats used:",HANG)
print("\n".join(log))
