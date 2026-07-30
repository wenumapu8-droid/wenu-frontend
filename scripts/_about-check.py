#!/usr/bin/env python3
import re, html
h = open('/tmp/about.html', encoding='utf-8', errors='ignore').read()
h = re.sub(r'(?s)<(script|style|svg)[^>]*>.*?</\1>', ' ', h)
t = html.unescape(re.sub(r'<[^>]+>', ' ', h))
t = re.sub(r'\s+', ' ', t)
for kw in ['Chile', 'Wallmapu', 'Truckee', 'California', 'born', 'began', 'Nicol', 'silversm', 'goldsm']:
    hits = list(re.finditer(kw, t, re.I))
    print(f'--- {kw} ({len(hits)}) ---')
    for m in hits[:2]:
        print('   …', t[max(0, m.start()-130):m.start()+160].strip())
    print()
