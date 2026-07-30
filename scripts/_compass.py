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
res=call('/products?search=compass&per_page=20&status=any')
for p in res:
    meta={m['key']:m['value'] for m in p.get('meta_data',[]) if m['key'].startswith('wm_')}
    print(p['id'],'|',p['sku'],'|',repr(p['name']))
    print('   origin meta:',meta.get('wm_origin'),'| otros:',{k:v for k,v in meta.items() if k!='wm_origin'})
    print('   price:',p.get('regular_price'),'| status:',p['status'])
