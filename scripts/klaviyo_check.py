#!/usr/bin/env python3
"""
klaviyo_check.py — verifica la conexión a Klaviyo API y opcionalmente lista recursos.

Uso:
  python3 scripts/klaviyo_check.py             # verifica auth + lista lists/flows
  python3 scripts/klaviyo_check.py --lists     # solo lists
  python3 scripts/klaviyo_check.py --flows     # solo flows
  python3 scripts/klaviyo_check.py --metrics   # lista metrics (verifica Woo integration)

Lee KLAVIYO_PRIVATE_API_KEY de ~/wenu-frontend/.env

Agente: Claude (cowork) · 2026-06-05
"""

import os
import sys
import json
import argparse
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests no instalado. Run: pip3 install requests --break-system-packages")
    sys.exit(1)


ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
KLAVIYO_BASE = "https://a.klaviyo.com/api"
REVISION = "2024-10-15"


def load_api_key():
    """Lee KLAVIYO_PRIVATE_API_KEY de .env."""
    if not ENV_PATH.exists():
        print(f"ERROR: .env no existe en {ENV_PATH}")
        sys.exit(1)

    key = None
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if line.startswith("KLAVIYO_PRIVATE_API_KEY="):
            value = line.split("=", 1)[1].strip()
            if value and value != "***Claude***":
                key = value
        # fallback: línea suelta con formato pk_XXXXXX_
        elif line.startswith("pk_") and "_" in line[3:] and len(line) > 30:
            if not key:
                key = line

    if not key or key == "***Claude***":
        print("ERROR: KLAVIYO_PRIVATE_API_KEY no encontrada o es placeholder.")
        print("Fix .env line:")
        print("  KLAVIYO_PRIVATE_API_KEY=pk_WKWhAh_xxxxxxxxxxxxxxxxxx")
        sys.exit(1)

    return key


def headers(api_key):
    return {
        "Authorization": f"Klaviyo-API-Key {api_key}",
        "accept": "application/vnd.api+json",
        "revision": REVISION,
    }


def check_auth(api_key):
    """GET /accounts/ — verifica que la key autoriza."""
    print("→ Verificando autenticación...")
    r = requests.get(f"{KLAVIYO_BASE}/accounts/", headers=headers(api_key), timeout=15)
    if r.status_code == 200:
        data = r.json().get("data", [])
        if data:
            attrs = data[0].get("attributes", {})
            print(f"  ✓ Auth OK")
            print(f"  Account: {attrs.get('contact_information', {}).get('organization_name', '?')}")
            print(f"  Industry: {attrs.get('industry', '?')}")
            print(f"  Timezone: {attrs.get('timezone', '?')}")
        return True
    else:
        print(f"  ✗ Auth FAIL — HTTP {r.status_code}")
        print(f"  Response: {r.text[:300]}")
        return False


def list_lists(api_key):
    print("\n→ Listando Lists...")
    r = requests.get(f"{KLAVIYO_BASE}/lists/", headers=headers(api_key), timeout=15)
    if r.status_code != 200:
        print(f"  ✗ HTTP {r.status_code}: {r.text[:300]}")
        return
    for item in r.json().get("data", []):
        attrs = item.get("attributes", {})
        print(f"  • [{item['id']}] {attrs.get('name', '?')} · created {attrs.get('created', '?')[:10]}")


def list_flows(api_key):
    print("\n→ Listando Flows...")
    r = requests.get(f"{KLAVIYO_BASE}/flows/", headers=headers(api_key), timeout=15)
    if r.status_code != 200:
        print(f"  ✗ HTTP {r.status_code}: {r.text[:300]}")
        return
    for item in r.json().get("data", []):
        attrs = item.get("attributes", {})
        status = attrs.get("status", "?")
        marker = "●" if status == "live" else "○"
        print(f"  {marker} [{item['id']}] {attrs.get('name', '?')} · {status} · trigger: {attrs.get('trigger_type', '?')}")


def list_metrics(api_key):
    print("\n→ Listando Metrics (verificar Woo integration)...")
    r = requests.get(f"{KLAVIYO_BASE}/metrics/", headers=headers(api_key), timeout=15)
    if r.status_code != 200:
        print(f"  ✗ HTTP {r.status_code}: {r.text[:300]}")
        return
    woo_metrics = []
    for item in r.json().get("data", []):
        attrs = item.get("attributes", {})
        name = attrs.get("name", "?")
        integration = attrs.get("integration", {}).get("name", "?")
        if "woo" in integration.lower() or name in ("Placed Order", "Started Checkout", "Ordered Product"):
            woo_metrics.append((item["id"], name, integration))
    if woo_metrics:
        print(f"  Metrics relevantes para flows ({len(woo_metrics)}):")
        for mid, name, integration in woo_metrics:
            print(f"    • [{mid}] {name} · source: {integration}")
    else:
        print("  ⚠ No Woo metrics found — integración no activa o no syncing.")


def main():
    parser = argparse.ArgumentParser(description="Klaviyo API check tool")
    parser.add_argument("--lists", action="store_true", help="Solo listar lists")
    parser.add_argument("--flows", action="store_true", help="Solo listar flows")
    parser.add_argument("--metrics", action="store_true", help="Solo listar metrics")
    args = parser.parse_args()

    api_key = load_api_key()
    print(f"Using key: {api_key[:12]}...{api_key[-6:]}")

    if not check_auth(api_key):
        sys.exit(1)

    # If no specific flag, run all
    run_all = not (args.lists or args.flows or args.metrics)

    if args.lists or run_all:
        list_lists(api_key)
    if args.flows or run_all:
        list_flows(api_key)
    if args.metrics or run_all:
        list_metrics(api_key)

    print("\n✓ Done. See 02-Operaciones/klaviyo-flows-setup.md for next steps.")


if __name__ == "__main__":
    main()
