#!/usr/bin/env python3
import os, json, base64, urllib.request, urllib.parse, ssl
E=os.path.expanduser('~')+'/.hermes/.env'
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+'='): return l.split('=',1)[1].strip().strip('"').strip("'")
    return ''
WC_A=urllib.parse.urlencode({'consumer_key':env('WOOCOMMERCE_KEY'),'consumer_secret':env('WOOCOMMERCE_SECRET')})
WCB='https://www.wenumapuonline.com/wp-json/wc/v3'
WPB='https://www.wenumapuonline.com/wp-json/wp/v2'
UA='Mozilla/5.0 (Macintosh) Safari/605.1.15'
ctx=ssl.create_default_context()
wpuser=env('WP_USER'); wppass=env('WP_APP_PASSWORD')
basic=base64.b64encode(('%s:%s'%(wpuser,wppass)).encode()).decode()

# 1. upload webp to WP media
img='/Users/user1/wenu-frontend/public/img/products/snake-hangers/wm-han-019-snake-crystal-coil.webp'
data=open(img,'rb').read()
r=urllib.request.Request(WPB+'/media',data=data,method='POST',headers={
    'User-Agent':UA,'Authorization':'Basic '+basic,
    'Content-Type':'image/webp',
    'Content-Disposition':'attachment; filename="wm-han-019-snake-crystal-coil.webp"'})
with urllib.request.urlopen(r,context=ctx,timeout=120) as x:
    m=json.loads(x.read().decode())
mid=m['id']; msrc=m.get('source_url')
print('media id=',mid,'src=',msrc)

# 2. get current product images
def wc(m,path,body=None):
    d=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(WCB+path+('&' if '?' in path else '?')+WC_A,data=d,method=m,
        headers={'User-Agent':UA,'Content-Type':'application/json'})
    with urllib.request.urlopen(r,context=ctx,timeout=120) as x: return json.loads(x.read().decode())
p=wc('GET','/products/2179')
existing=[{'id':i['id']} for i in p.get('images',[])]
print('existing imgs:',existing)
# new photo first (featured), keep the rest
new_imgs=[{'id':mid}]+existing
res=wc('PUT','/products/2179',{'images':new_imgs})
print('updated -> imgs now:',[i['id'] for i in res.get('images',[])],'| src[0]=',res['images'][0]['src'].split('/')[-1] if res.get('images') else None)
