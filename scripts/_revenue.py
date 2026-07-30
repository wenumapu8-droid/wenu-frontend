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
    with urllib.request.urlopen(r,context=ctx,timeout=60) as x:
        return x.getheaders(), json.loads(x.read().decode())
# all orders, any status, count + sum
tot=0.0; n=0; byst={}; paid=0.0; paidn=0
page=1
while True:
    hdrs,orders=call(f'/orders?per_page=100&page={page}&status=any')
    if not orders: break
    for o in orders:
        n+=1
        t=float(o.get('total') or 0)
        tot+=t
        st=o.get('status')
        byst[st]=byst.get(st,0)+1
        if st in ('completed','processing'):
            paid+=t; paidn+=1
    if len(orders)<100: break
    page+=1
print('ordenes totales:', n)
print('valor bruto todas:', round(tot,2))
print('por estado:', byst)
print('pagadas (completed+processing):', paidn, '= $'+str(round(paid,2)))
