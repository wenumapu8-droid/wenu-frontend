#!/usr/bin/env python3
"""Setea atributos Origin/Maker en las piezas de Origins Handmade (Alan),
preservando los atributos existentes. Origin='curated-independent' porque:
  - es exacto (pieza handmade de un artesano independiente, curada por Wenu)
  - NO activa isForged => la pieza sigue siendo comprable (sin cambiar el flujo)
"""
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
NEW=[('Origin','curated-independent'),('Maker','Origins Handmade (Alan)'),('Maker IG','@originshandmade')]
for pid,sku in [(2870,'WM-PRC-044'),(2854,'WM-PRC-038')]:
    st,p=call('GET','/products/%d'%pid)
    attrs=[{'name':a['name'],'visible':a.get('visible',True),'options':a.get('options',[])}
           for a in p.get('attributes',[])]
    have={a['name'].strip().lower() for a in attrs}
    for name,val in NEW:
        if name.strip().lower() not in have:
            attrs.append({'name':name,'visible':(name=='Maker'),'options':[val]})
    st,res=call('PUT','/products/%d'%pid,{'attributes':attrs})
    print(sku,'http',st,'->',[(a['name'],a.get('options')) for a in res.get('attributes',[])])
    time.sleep(1)
