#!/usr/bin/env python3
"""WM-TUN-011 Tribal Brass Tunnel 20mm: replace the ruler/caliper main photo with
the black-bg hero (tunnel-black-1), keep the existing gallery diagrams. Backup first."""
import os, json, urllib.request, urllib.parse, ssl
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
A=urllib.parse.urlencode({"consumer_key":env("WOOCOMMERCE_KEY"),"consumer_secret":env("WOOCOMMERCE_SECRET")})
BASE="https://www.wenumapuonline.com/wp-json/wc/v3"
UA={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15","Content-Type":"application/json"}
ctx=ssl.create_default_context()
def call(m,path,body=None):
    data=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(f"{BASE}{path}{'&' if '?' in path else '?'}{A}",data=data,method=m,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=120) as resp:
        return resp.status, json.loads(resp.read().decode())

NEW="https://3d473a45.wenu-frontend.pages.dev/img/products/tunnel/tunnel-black-1.webp"
st,found=call("GET","/products?sku=WM-TUN-011")
p=found[0]; PID=p["id"]
os.makedirs(f"{H}/Downloads/wenu-audit-cleanup",exist_ok=True)
json.dump(p, open(f"{H}/Downloads/wenu-audit-cleanup/tun-011-backup.json","w"), indent=1)
old=p.get("images",[])
# keep everything EXCEPT the current main (index 0 = ruler photo), referenced by id
keep=[{"id":im["id"]} for im in old[1:]]
imgs=[{"src":NEW}]+keep
st,res=call("PUT",f"/products/{PID}",{"images":imgs})
now=[i["src"].split("/")[-1] for i in res.get("images",[])]
print(f"WM-TUN-011 id={PID} http={st} imgs now: {now}")
open("/tmp/tunnel.log","w").write(f"{PID} {st} {now}\n")
