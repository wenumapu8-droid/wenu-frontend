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
PIERCE=[{"id":174}]
IB="https://08e54deb.wenu-frontend.pages.dev/img/products/piercing-tops"
HEALED=" For healed piercings — these are the non-sterile version (not sterile initial jewelry for fresh piercings)."
P=[
 ("WM-PRC-ORG-10","14k Gold Hammered Disc Top — 3mm","85","gold-hammered-disc-3mm.png","Solid 14k gold","","3 mm",
  "A 3mm solid-14k-gold disc, hand-hammered so it scatters the light. The smaller sister of our 4mm disc. Threadless."+HEALED),
 ("WM-PRC-ORG-11","14k Gold Opal Cabochon End","55","gold-opal-cabochon.png","Solid 14k gold","Opal","2 mm",
  "A 2mm opal cabochon bezel-set in solid 14k gold — soft fire in a warm frame. Threadless."+HEALED),
 ("WM-PRC-ORG-12","14k Gold Smooth Disc Top","48","gold-smooth-disc.png","Solid 14k gold","","2.5 mm",
  "A clean 2.5mm solid-14k-gold disc, polished smooth — the quiet essential. Threadless."+HEALED),
 ("WM-PRC-ORG-13","14k Gold Crown-Set CZ End","52","gold-crown-cz.png","Solid 14k gold","1.5mm CZ","1.5 mm",
  "A 1.5mm CZ held in a little solid-14k-gold crown of prongs — bright and dimensional. Threadless."+HEALED),
]
log=[]
for sku,name,price,img,mat,gem,size,desc in P:
    attrs=[{"name":"Material","visible":True,"options":[mat]},{"name":"Threading","visible":True,"options":["Threadless"]}]
    if gem: attrs.append({"name":"Gem","visible":True,"options":[gem]})
    if size: attrs.append({"name":"Size","visible":True,"options":[size]})
    body={"name":name,"type":"simple","status":"publish","sku":sku,"regular_price":price,
          "description":desc,"short_description":desc,"categories":PIERCE,"attributes":attrs,
          "images":[{"src":f"{IB}/{img}"}],
          "meta_data":[{"key":"wm_origin","value":"imported-curated"},
                       {"key":"wm_wear","value":"healed-only-non-sterile"},
                       {"key":"wm_note","value":"Provisional SKU. Register canonical in NocoDB when Docker up."}]}
    for attempt in range(3):
        try:
            st,res=call("POST","/products",body)
            log.append(f"{sku} http={st} id={res.get('id')} imgs={len(res.get('images',[]))} '{name[:30]}'"); break
        except Exception as e:
            log.append(f"{sku} try{attempt} {str(e)[:70]}"); time.sleep(3)
    time.sleep(1.5)
open("/tmp/gold2.log","w").write("\n".join(log)+"\n")
print("\n".join(log))
