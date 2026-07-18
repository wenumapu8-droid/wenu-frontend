#!/usr/bin/env python3
import os, json, urllib.request, urllib.parse, ssl
E=os.path.expanduser('~')+'/.hermes/.env'
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+'='): return l.split('=',1)[1].strip().strip('"').strip("'")
    return ''
A=urllib.parse.urlencode({'consumer_key':env('WOOCOMMERCE_KEY'),'consumer_secret':env('WOOCOMMERCE_SECRET')})
B='https://www.wenumapuonline.com/wp-json/wc/v3'
UA={'User-Agent':'Mozilla/5.0 (Macintosh) Safari/605.1.15'}
ctx=ssl.create_default_context()
def call(path):
    r=urllib.request.Request(B+path+('&' if '?' in path else '?')+A,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=60) as x: return json.loads(x.read().decode())
res=call('/products?search=snake&per_page=50&status=any')
out=[]
for p in res:
    imgs=[i.get('src','').split('/')[-1] for i in p.get('images',[])]
    mat=[a.get('options') for a in p.get('attributes',[]) if a.get('name')=='Material']
    out.append("%s | %s | %r | $%s | %s | imgs=%d %s | mat=%s | desc=%r" % (
        p['id'], p['sku'], p['name'], p.get('regular_price'), p['status'],
        len(p.get('images',[])), imgs, mat, (p.get('short_description') or p.get('description') or '')[:120]))
open('/tmp/snakes.txt','w').write("\n".join(out)+"\n")
print("\n".join(out))
