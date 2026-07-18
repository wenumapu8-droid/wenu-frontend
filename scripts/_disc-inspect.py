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
for sku in ['WM-PRC-ORG-04','WM-PRC-ORG-10']:
    res=call('/products?sku='+sku)
    for p in res:
        imgs=[(i['id'],i['src'].split('/')[-1]) for i in p.get('images',[])]
        print(p['id'],'|',p['sku'],'|',repr(p['name']),'| type=',p.get('type'),'| $'+str(p.get('regular_price')),'| slug=',p['slug'])
        print('   imgs=',imgs)
        print('   attrs=',[(a['name'],a.get('options')) for a in p.get('attributes',[])])
