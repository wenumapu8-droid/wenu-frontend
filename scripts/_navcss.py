#!/usr/bin/env python3
import re
s = open('/Users/user1/wenu-frontend/src/components/Nav.astro').read()
for sel in ['navk__icons', 'navk__icon', 'navk__inner', 'navk__logo', 'navk__word', 'navk__mark']:
    for m in re.finditer(r'\.' + sel + r'\b[^{]*\{[^}]*\}', s):
        print(m.group(0))
        print()
print('=== media queries en Nav ===')
for m in re.finditer(r'@media[^{]*\{', s):
    # print the line and a peek
    idx = m.start()
    print(s[idx:idx+90].replace(chr(10), ' '))
