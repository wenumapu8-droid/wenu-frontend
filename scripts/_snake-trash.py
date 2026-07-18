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
def call(m,path):
    r=urllib.request.Request(B+path+('&' if '?' in path else '?')+A,method=m,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=60) as x: return x.status, json.loads(x.read().decode())
# force=false -> goes to WP trash (recoverable), NOT permanent delete
st,res=call('DELETE','/products/2433?force=false')
print('WM-PRC-036 (id 2433) ->', st, 'status=', res.get('status'))
