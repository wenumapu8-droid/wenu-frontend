#!/usr/bin/env python3
"""Wenu OS watchdog — robusto.

Cambios 2026-07-18 (fix timeout):
- Toda llamada a subprocess tiene timeout y degrada con gracia (nunca cuelga el script).
- Los estados de cron se leen DIRECTO de ~/.hermes/cron/jobs.json (instantáneo),
  en vez del CLI `hermes cron list` (lento por state.db grande).
Sale 0 siempre; imprime alertas solo si hay algo no sano (Hermes entrega el stdout a Telegram).
"""
import json
import os
import re
import subprocess
import sys
import urllib.request

HERMES = os.path.expanduser('~/.hermes')


def run(cmd, timeout=25):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, (p.stdout or '').strip(), (p.stderr or '').strip()
    except subprocess.TimeoutExpired:
        return 124, '', f'timeout tras {timeout}s'
    except Exception as e:
        return 1, '', str(e)


def fetch_json(url, timeout=5):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return True, json.loads(r.read().decode('utf-8'))
    except Exception as e:
        return False, str(e)


alerts = []

# 1) Health endpoints (5s c/u, acotado)
for name, url in [
    ('dashboard', 'http://127.0.0.1:3390/health'),
    ('platform', 'http://127.0.0.1:3335/inventory/command-center'),
    ('wenu-system', 'http://127.0.0.1:3333/api/status'),
]:
    ok, payload = fetch_json(url)
    if not ok:
        alerts.append(f'P0 {name} caído o inaccesible: {str(payload)[:120]}')

# 2) Kanban stats (con timeout; si el CLI está lento, avisa pero no muere)
rc, out, err = run(['hermes', 'kanban', 'stats'], timeout=25)
if rc == 124:
    alerts.append('P2 hermes kanban stats lento (>25s) — posible state.db pesado')
elif rc != 0:
    alerts.append(f'P1 kanban stats falló: {(err or out)[:120]}')
else:
    counts = {}
    for line in out.splitlines():
        m = re.match(r'^\s*(triage|todo|scheduled|ready|running|blocked|done)\s+(\d+)$', line)
        if m:
            counts[m.group(1)] = int(m.group(2))
    if counts.get('blocked', 0) > 0:
        alerts.append(f"P1 kanban con {counts['blocked']} task(s) bloqueadas")

# 3) Cron jobs no sanos — leído directo de jobs.json (rápido y confiable)
try:
    jobs = json.load(open(os.path.join(HERMES, 'cron', 'jobs.json')))['jobs']
    bad = []
    for j in jobs:
        if not j.get('enabled', True):
            continue
        st = j.get('last_status')
        if st == 'error':
            reason = (j.get('last_error') or j.get('last_delivery_error') or '').split('\n')[0][:90]
            bad.append(f"- {j['name']}: {reason}")
        elif j.get('paused_at'):
            bad.append(f"- {j['name']}: PAUSADO ({(j.get('paused_reason') or '').split(chr(10))[0][:60]})")
    if bad:
        alerts.append(f'P1 {len(bad)} cron job(s) en estado no sano:')
        alerts.extend(bad[:10])
except Exception as e:
    alerts.append(f'P1 no pude leer cron/jobs.json: {str(e)[:100]}')

if alerts:
    print('Wenu OS watchdog')
    for a in alerts:
        print(a)

sys.exit(0)
