#!/usr/bin/env python3
"""Shipibo fix: WM-EAR-001 becomes a Gold/Silver variable product (the silver
photo comes from the mislabelled WM-HAN-009), and WM-HAN-009 is archived (draft,
not deleted — reversible). Backup first."""
import os, json, time, urllib.request, urllib.parse, ssl
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
A=urllib.parse.urlencode({"consumer_key":env("WOOCOMMERCE_KEY"),"consumer_secret":env("WOOCOMMERCE_SECRET")})
BASE="https://www.wenumapuonline.com/wp-json/wc/v3"
UA={"User-Agent":"Mozilla/5.0 (Macintosh) Safari/605.1.15","Content-Type":"application/json"}
ctx=ssl.create_default_context()
def call(m,path,body=None):
    data=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(f"{BASE}{path}?{A}",data=data,method=m,headers=UA)
    return json.load(urllib.request.urlopen(r,context=ctx,timeout=120))

EAR=2159; HAN=2369
SILVER_URL="https://www.wenumapuonline.com/wp-content/uploads/2026/06/WM-HAN-009__web.jpg"
GOLD_IMG_ID=2158  # existing gold front-full on WM-EAR-001
log=[]

cur=call("GET",f"/products/{EAR}")
json.dump(cur, open(f"{H}/Downloads/wenu-audit-cleanup/ear-001-backup.json","w"), indent=1)
price=cur.get("regular_price") or cur.get("price") or "88"
log.append(f"backup EAR-001: {cur['name']} price={price} type={cur['type']}")

# parent -> variable, gallery gold + silver, Color attribute Gold/Silver
body={
  "type":"variable",
  "images":[{"id":GOLD_IMG_ID},{"src":SILVER_URL}],
  "attributes":[{"name":"Color","position":0,"visible":True,"variation":True,
                 "options":["Gold","Silver"]}],
}
res=call("PUT",f"/products/{EAR}",body)
log.append(f"EAR-001 -> variable: imgs {len(res.get('images',[]))}")
# capture the sideloaded silver image id (2nd gallery image)
imgs=res.get("images",[])
silver_id=imgs[1]["id"] if len(imgs)>1 else None

# create Gold + Silver variations (product had none — was simple)
for color,img in (("Gold",{"id":GOLD_IMG_ID}),("Silver",{"id":silver_id} if silver_id else {"src":SILVER_URL})):
    vb={"regular_price":str(price),"sku":f"WM-EAR-001-{color[:3].upper()}",
        "stock_status":"instock","attributes":[{"name":"Color","option":color}],"image":img}
    vr=call("POST",f"/products/{EAR}/variations",vb)
    log.append(f"  variation {color}: id={vr.get('id')} img={vr.get('image',{}).get('id')}")
    time.sleep(0.5)

# archive the mislabelled duplicate (draft, not deleted)
call("PUT",f"/products/{HAN}",{"status":"draft"})
log.append(f"archived WM-HAN-009 (Magnetic Greek Hoop Hanger) -> draft")

open("/tmp/shipibo-run.log","w").write("\n".join(log)+"\n")
print("\n".join(log))
