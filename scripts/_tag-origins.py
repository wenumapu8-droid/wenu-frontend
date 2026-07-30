#!/usr/bin/env python3
"""Propaga a WooCommerce la clasificación de origen que ya existe en NocoDB
para las piezas de Origins Handmade (artisan-sourced / named-maker).
NO cambia nombres ni precios — solo mete el meta wm_origin + wm_maker."""
import os, json, time, urllib.request, urllib.parse, ssl
E=os.path.expanduser('~')+'/.hermes/.env'
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+'='): return l.split('=',1)[1].strip().strip('"').strip("'")
    return ''
A=urllib.parse.urlencode({'consumer_key':env('WOOCOMMERCE_KEY'),'consumer_secret':env('WOOCOMMERCE_SECRET')})
B='https://www.wenumapuonline.com/wp-json/wc/v3'
UA={'User-Agent':'Mozilla/5.0 (Macintosh) Safari/605.1.15','Content-Type':'application/json'}
ctx=ssl.create_default_context()
def call(m,path,body=None):
    d=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(B+path+('&' if '?' in path else '?')+A,data=d,method=m,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=120) as x: return x.status,json.loads(x.read().decode())
MAKER='Origins Handmade (Alan) @originshandmade'
for pid,sku in [(2870,'WM-PRC-044'),(2854,'WM-PRC-038')]:
    body={'meta_data':[
        {'key':'wm_origin','value':'artisan-sourced'},
        {'key':'wm_maker','value':MAKER},
        {'key':'wm_origin_note','value':'Named-maker artisan piece, adquirida en APP Conference. "Handmade" es claim legitimo (no importado anonimo). Fuente: NocoDB.'},
    ]}
    st,res=call('PUT','/products/%d'%pid,body)
    meta={m['key']:m['value'] for m in res.get('meta_data',[]) if m['key'].startswith('wm_')}
    print(sku,'http',st,'->',{k:str(v)[:50] for k,v in meta.items()})
    time.sleep(1)
