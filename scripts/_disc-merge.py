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
UA={'User-Agent':'Mozilla/5.0 (Macintosh) Safari/605.1.15','Content-Type':'application/json'}
ctx=ssl.create_default_context()
def call(m,path,body=None):
    d=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(B+path+('&' if '?' in path else '?')+A,data=d,method=m,headers=UA)
    with urllib.request.urlopen(r,context=ctx,timeout=120) as x: return x.status,json.loads(x.read().decode())
PID=3410  # WM-PRC-ORG-04 parent (keep)
DUP=3422  # WM-PRC-ORG-10 (3mm) -> trash after merge
IMG_4MM=3409  # gold-hammered-disc.png
IMG_3MM=3421  # gold-hammered-disc-3mm.png (media persists after product trash)
desc=("A solid-14k-gold disc, hand-hammered so it scatters the light in a hundred small facets. "
      "Choose your size below. Threadless push-fit. Best worn in a healed piercing. Curated for Wenu Mapu.")
# 1) convert parent to variable
body={'name':'14k Gold Hammered Disc Top','type':'variable','regular_price':'',
      'description':desc,'short_description':desc,
      'images':[{'id':IMG_4MM},{'id':IMG_3MM}],
      'attributes':[
        {'name':'Material','visible':True,'variation':False,'options':['Solid 14k gold']},
        {'name':'Threading','visible':True,'variation':False,'options':['Threadless']},
        {'name':'Size','visible':True,'variation':True,'options':['3 mm','4 mm']},
      ]}
st,res=call('PUT','/products/%d'%PID,body)
print('parent -> http',st,'type=',res.get('type'),'attrs=',[(a['name'],a.get('variation')) for a in res.get('attributes',[])])
# 2) variations
for size,price,img in [('4 mm','90',IMG_4MM),('3 mm','85',IMG_3MM)]:
    vb={'regular_price':price,'attributes':[{'name':'Size','option':size}],'image':{'id':img}}
    st,v=call('POST','/products/%d/variations'%PID,vb)
    print('  variation',size,'-> http',st,'id=',v.get('id'),'$',v.get('regular_price'))
# 3) trash the standalone 3mm duplicate
st,d=call('DELETE','/products/%d?force=false'%DUP)
print('trashed dup 3422 -> http',st)
# 4) show final
st,fin=call('GET','/products/%d'%PID)
print('FINAL:',fin['name'],'| type=',fin.get('type'),'| price=',fin.get('price'),'| variations=',len(fin.get('variations',[])))
