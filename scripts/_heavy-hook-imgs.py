#!/usr/bin/env python3
import os, json, urllib.request, urllib.parse, ssl, time
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
    url=f"{BASE}{path}?{A}"
    data=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(url,data=data,method=m,headers=UA)
    return json.load(urllib.request.urlopen(r,context=ctx,timeout=120))
PID=2377
IB="https://wenumapuonline.com/img/products/heavy-hook"
# backup current
cur=call("GET",f"/products/{PID}")
json.dump(cur, open(f"{H}/Downloads/wenu-audit-cleanup/han-012-backup.json","w"), indent=1)
imgs=[{"src":f"{IB}/heavy-hook-1.png"},{"src":f"{IB}/heavy-hook-2.png"},
      {"src":f"{IB}/heavy-hook-3.png"},{"src":f"{IB}/heavy-hook-4.png"}]
res=call("PUT",f"/products/{PID}",{"images":imgs})
print("imgs now:", [i["src"].split("/")[-1] for i in res.get("images",[])])
open("/tmp/heavy-hook.log","w").write("done: "+str(len(res.get("images",[])))+" imgs\n")
