#!/usr/bin/env python3
import json, sys
try:
    d = json.load(open('/tmp/wenu-nocodb-snapshot.json'))
except Exception as e:
    print('no snapshot:', e); sys.exit()
rows = d if isinstance(d, list) else d.get('rows') or d.get('data') or []
targets = ('WM-PRC-044', 'WM-PRC-038')
found = 0
for r in rows:
    sku = str(r.get('SKU') or '')
    if sku in targets:
        found += 1
        print('=' * 50)
        for k, v in r.items():
            v = str(v)
            if v and v.lower() not in ('none', 'null', ''):
                print(f'  {k} = {v[:220]}')
if not found:
    print('NO estan PRC-044 / PRC-038 en el snapshot de NocoDB.')
    print('SKUs presentes que empiezan con WM-PRC-03/04:')
    for r in rows:
        s = str(r.get('SKU') or '')
        if s.startswith('WM-PRC-03') or s.startswith('WM-PRC-04'):
            print('  ', s, '|', str(r.get('Nombre interno'))[:60], '| prov:', r.get('Proveedor'))
