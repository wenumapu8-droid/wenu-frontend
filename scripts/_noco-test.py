#!/usr/bin/env python3
import os, json, urllib.request, ssl
H=os.path.expanduser("~"); E=H+"/.hermes/.env"
def env(k):
    for l in open(E):
        l=l.strip()
        if l.startswith(k+"="): return l.split("=",1)[1].strip().strip('"').strip("'")
    return ""
URL=env("NOCODB_URL"); BASE=env("NOCODB_BASE"); TOK=env("NOCODB_TOKEN")
TP=env("NOCODB_TABLE_PIEZAS")
print("URL set:", bool(URL), "| host:", (URL.split("//")[-1].split("/")[0] if URL else "?"))
print("BASE set:", bool(BASE), "| TOKEN set:", bool(TOK), "| PIEZAS tbl set:", bool(TP))
ctx=ssl.create_default_context()
UA={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15","xc-token":TOK}
# try v2 records endpoint
for desc, u in [
    ("meta bases", f"{URL.rstrip('/')}/api/v2/meta/bases"),
    ("piezas rows", f"{URL.rstrip('/')}/api/v2/tables/{TP}/records?limit=1" if TP else None),
]:
    if not u: continue
    try:
        r=urllib.request.Request(u, headers=UA)
        with urllib.request.urlopen(r, context=ctx, timeout=15) as resp:
            body=resp.read().decode()[:160]
            print(f"{desc}: {resp.status} :: {body}")
    except urllib.error.HTTPError as e:
        print(f"{desc}: HTTP {e.code} :: {e.read().decode()[:140]}")
    except Exception as e:
        print(f"{desc}: ERR {type(e).__name__}: {str(e)[:120]}")
