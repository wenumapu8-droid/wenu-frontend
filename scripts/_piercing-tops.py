#!/usr/bin/env python3
"""Create 9 piercing tops/ends (14k gold + titanium) as PUBLISHED products.
Attributes: Material / Gem / Size / Threading (for the shop filters Ocin asked for).
Origin imported-curated. Names Wenu-voice (not the supplier's). Solid 14k gold IS a
real claim (allowed). Threading on the gold tops = Threadless (supplier default) —
flagged to confirm."""
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
PIERCE=[{"id":cid[n]} for n in ["piercing"] if cid.get(n)]
IB="https://9824338b.wenu-frontend.pages.dev/img/products/piercing-tops"
# sku, name, price, img, material, gem, size, threading, desc
P=[
 ("WM-PRC-ORG-01","14k Gold Crescent Moon Opal End","58","gold-crescent-moon-opal.png",
  "Solid 14k gold","Opal","","Threadless",
  "A slim solid-14k-gold crescent cradling a fire opal — a tiny moon for a healed piercing. Threadless push-fit. Curated for Wenu Mapu."),
 ("WM-PRC-ORG-02","14k Gold 3-Prong CZ Top","52","gold-3prong-cz.png",
  "Solid 14k gold","1.5mm CZ","1.5 mm","Threadless",
  "A single 1.5mm CZ held in a three-prong solid-14k-gold setting — clean, bright, quiet. Threadless. Curated for Wenu Mapu."),
 ("WM-PRC-ORG-03","14k Gold Marquise CZ Leaf Top","95","gold-marquise-fan-cz.png",
  "Solid 14k gold","Marquise CZ","","Threadless",
  "A marquise-cut CZ crowned by a little solid-14k-gold leaf — a piece with movement and light. Threadless. Curated for Wenu Mapu."),
 ("WM-PRC-ORG-04","14k Gold Hammered Disc Top","90","gold-hammered-disc.png",
  "Solid 14k gold","","4 mm","Threadless",
  "A 4mm solid-14k-gold disc, hand-hammered so it catches the light in a hundred small facets. Threadless. Curated for Wenu Mapu."),
 ("WM-PRC-ORG-05","Titanium Flat Bar Navel Clicker","28","ti-flat-bar-navel-clicker.png",
  "Implant-grade titanium ASTM F-136","","7/16\"","Clicker",
  "A clean flat-bar navel clicker in implant-grade titanium (ASTM F-136) — hinged, easy, secure. 7/16\". Curated for Wenu Mapu."),
 ("WM-PRC-ORG-06","Titanium Crescent Moon Dangle CZ End","30","ti-threadless-moon-dangle.png",
  "Implant-grade titanium ASTM F-136","CZ","","Threadless",
  "A titanium crescent moon with a kite-cut CZ swinging below it — a little movement for a healed piercing. Threadless. Curated for Wenu Mapu."),
 ("WM-PRC-ORG-07","Titanium Curved 9-Gem Cluster End — Pink CZ","28","ti-cluster-pink-cz.png",
  "Implant-grade titanium ASTM F-136","Pink CZ","","Internally threaded",
  "A curved cluster of pink CZs that follows the arc of the ear — implant-grade titanium, internally threaded. Curated for Wenu Mapu."),
 ("WM-PRC-ORG-08","Titanium Curved 5-Gem Cluster End — Lavender Opal","26","ti-cluster-lavender-opal.png",
  "Implant-grade titanium ASTM F-136","Lavender Opal","","Internally threaded",
  "Five lavender opals in a graduated titanium curve — soft colour that shifts with the light. Implant-grade, internally threaded. Curated for Wenu Mapu."),
 ("WM-PRC-ORG-09","Titanium 4-Bead Cluster End — Violet CZ","22","ti-cluster-violet-cz.png",
  "Implant-grade titanium ASTM F-136","Violet CZ","","Threadless",
  "A violet CZ framed by a trinity of titanium beads — small, balanced, a favourite for helix and lobe. Implant-grade titanium, threadless. Curated for Wenu Mapu."),
]
log=[]
for sku,name,price,img,mat,gem,size,thr,desc in P:
    attrs=[{"name":"Material","visible":True,"options":[mat]},
           {"name":"Threading","visible":True,"options":[thr]}]
    if gem: attrs.append({"name":"Gem","visible":True,"options":[gem]})
    if size: attrs.append({"name":"Size","visible":True,"options":[size]})
    body={"name":name,"type":"simple","status":"publish","sku":sku,"regular_price":price,
          "description":desc,"short_description":desc,"categories":PIERCE,"attributes":attrs,
          "images":[{"src":f"{IB}/{img}"}],
          "meta_data":[{"key":"wm_origin","value":"imported-curated"},
                       {"key":"wm_note","value":"Provisional SKU. Gold tops threading assumed Threadless — confirm. Register canonical in NocoDB when Docker up."}]}
    for attempt in range(3):
        try:
            st,res=call("POST","/products",body)
            log.append(f"{sku} http={st} id={res.get('id')} imgs={len(res.get('images',[]))} '{name[:34]}'"); break
        except Exception as e:
            log.append(f"{sku} try{attempt} {str(e)[:60]}"); time.sleep(3)
    time.sleep(1.5)
open("/tmp/tops-create.log","w").write("cats="+str(PIERCE)+"\n"+"\n".join(log)+"\n")
print("\n".join(log))
