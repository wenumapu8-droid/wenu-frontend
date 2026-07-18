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
def call(m,p,b=None):
    d=json.dumps(b).encode() if b is not None else None
    r=urllib.request.Request(B+p+('&' if '?' in p else '?')+A,data=d,method=m,headers=UA)
    x=urllib.request.urlopen(r,context=ctx,timeout=120);return x.status,json.loads(x.read().decode())
IB="https://d219ed57.wenu-frontend.pages.dev/img/products/tribal-arch"
PID=2181
log=[]
st,p=call("GET","/products/%d"%PID)
ids=[im["id"] for im in p["images"]]
log.append("start ids %s"%ids)
for n in (2,3,4):
    src=IB+"/arch-%d.webp"%n
    for attempt in range(5):
        try:
            st,res=call("PUT","/products/%d"%PID,{"images":[{"id":x} for x in ids]+[{"src":src}]})
            ids=[im["id"] for im in res["images"]]
            log.append("arch-%d ok total=%d"%(n,len(ids)));break
        except Exception as e:
            log.append("arch-%d try%d %s"%(n,attempt,str(e)[:50]));time.sleep(4)
    time.sleep(1)
st,res=call("GET","/products/%d"%PID)
log.append("FINAL: %s"%[i["src"].split("/")[-1] for i in res["images"]])
open("/tmp/arch-resume.log","w").write("\n".join(log)+"\nDONE\n")
