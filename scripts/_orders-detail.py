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
r=urllib.request.Request(B+'/orders?per_page=100&status=any&'+A,headers=UA)
with urllib.request.urlopen(r,context=ctx,timeout=60) as x:
    orders=json.loads(x.read().decode())
for o in sorted(orders,key=lambda z:z.get('date_created','')):
    items=', '.join(f"{i.get('quantity')}x {i.get('name','?')[:34]}" for i in o.get('line_items',[]))
    print(f"#{o.get('number')} | {o.get('date_created','')[:10]} | {o.get('status'):11} | ${o.get('total')} {o.get('currency')} | {o.get('payment_method_title') or 'sin metodo'}")
    print(f"     items: {items or '(vacio)'}")
