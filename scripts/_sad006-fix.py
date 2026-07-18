#!/usr/bin/env python3
import os,json,urllib.request,urllib.parse,ssl
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
# SAD-006 (id 2177): both photos are the real product (casual grey shots). Keep only the
# ref.webp (lighter/cleaner) as the single hero, unassign the 'recover' jpg from the
# product gallery (media NOT deleted).
body={"images":[{"id":2746}]}
r=urllib.request.Request(B+"/products/2177?"+A,data=json.dumps(body).encode(),method="PUT",headers=UA)
res=json.loads(urllib.request.urlopen(r,context=ctx,timeout=90).read().decode())
print("SAD-006 imgs now:",[i["src"].split("/")[-1] for i in res["images"]])
