#!/usr/bin/env python3
import os, json, urllib.request, urllib.parse, ssl
E=os.path.expanduser('~')+'/.hermes/.env'
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+'='): return l.split('=',1)[1].strip().strip('"').strip("'")
    return ''
WC_A=urllib.parse.urlencode({'consumer_key':env('WOOCOMMERCE_KEY'),'consumer_secret':env('WOOCOMMERCE_SECRET')})
WCB='https://www.wenumapuonline.com/wp-json/wc/v3'
UA='Mozilla/5.0 (Macintosh) Safari/605.1.15'
ctx=ssl.create_default_context()
URL='https://f7f2f420.wenu-frontend.pages.dev/img/products/snake-hangers/wm-han-019-snake-crystal-coil.webp'
def wc(m,path,body=None):
    d=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(WCB+path+('&' if '?' in path else '?')+WC_A,data=d,method=m,
        headers={'User-Agent':UA,'Content-Type':'application/json'})
    with urllib.request.urlopen(r,context=ctx,timeout=120) as x: return json.loads(x.read().decode())
p=wc('GET','/products/2179')
existing=[{'id':i['id']} for i in p.get('images',[])]
print('existing imgs:',existing)
# new photo first (featured/hero), keep existing after
new_imgs=[{'src':URL,'name':'Snake Hanger on black crystal','alt':'Surgical steel snake hanger coiled around a black crystal point'}]+existing
res=wc('PUT','/products/2179',{'images':new_imgs})
imgs=res.get('images',[])
print('updated -> count=',len(imgs),'| first=',imgs[0]['src'].split('/')[-1] if imgs else None)
for i in imgs: print('  ',i['id'],i['src'].split('/')[-1])
