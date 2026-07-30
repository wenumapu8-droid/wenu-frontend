#!/usr/bin/env python3
import json, os
F = os.path.expanduser('~/wenuos-system/facturas-procesadas.json')
try:
    d = json.load(open(F))
except Exception as e:
    print('ERR', e); raise SystemExit
def rows_of(d):
    if isinstance(d, list): return d
    for k in ('facturas','items','invoices','data','compras'):
        if isinstance(d.get(k), list): return d[k]
    # else flatten dict values that are lists
    out=[]
    for v in d.values():
        if isinstance(v, list): out += v
    return out
rows = rows_of(d)
print('registros:', len(rows))
if rows:
    print('campos:', list(rows[0].keys()))
    print('--- muestra 3 ---')
    for r in rows[:3]:
        print(json.dumps(r, ensure_ascii=False)[:300])
    # try to sum any total-ish field
    def num(x):
        try: return float(str(x).replace('$','').replace(',','').strip())
        except: return 0.0
    for key in ('total','amount','monto','total_usd'):
        s = sum(num(r.get(key)) for r in rows if isinstance(r, dict))
        if s: print(f'suma {key}: {round(s,2)}'); break
    # suppliers / categories present
    for key in ('supplier','proveedor','category','categoria','project','proyecto'):
        vals = set(str(r.get(key)) for r in rows if isinstance(r, dict) and r.get(key))
        if vals: print(f'{key}:', sorted(vals)[:12])
