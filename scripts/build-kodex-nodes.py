#!/usr/bin/env python3
"""
KODEX-∞ · Bridge 3 — de registro del Atlas a KodexNode publicable. Cierra L3.

QUÉ CORRIGE
-----------
Bridge 1 leyó mal la familia de especificaciones de nodo. En esas 128 filas la columna
`SOURCE_URL` no contiene una URL: contiene el TIPO del nodo, o —cuando la fila es una
arista— el ID del nodo destino.

Resultado: 128 fuentes falsas, y **74 aristas que Ocin escribió a mano se perdieron**.

Las filas repetidas nunca fueron duplicados. `KDX-NODE-ELEMENTAL-ARCHIVE` aparece 11 veces
porque declara el nodo una vez y sus diez relaciones `CONTAINS` después.

LAYOUT REAL DE LA FAMILIA
-------------------------
Declaración de nodo:
    col1 NODE_ID · col2 TITLE · col3 TIPO/FAMILIA · col4 CONCEPTO/ZONA
    col5 FUNCIÓN (prosa del autor) · col6 ESTADO

Arista:
    col1 NODE_ID origen · col2 RELACIÓN · col3 NODE_ID destino
    col4 descriptor · col5 VALIDEZ

REGLA
-----
No se inventa contenido. `summary` sale de la prosa que escribió el autor. `proposition`,
`visualAnchor.label` y `editorial.body` quedan VACÍOS y listados en `pending` cuando nadie
los ha escrito. Un hueco declarado vale más que una frase inventada.

Uso:
    python3 build_kodex_nodes.py <atlas-export.json> -o <outdir> [--claims claims.json]
"""

import argparse
import hashlib
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from ingest_visual_atlas import parse_markdown_table, split_multi  # noqa: E402

NODE_ID = re.compile(r"^KDX-(NODE|MAP)-")

# Estado del Atlas → estado del schema (enum: dormant/active/unstable/sealed).
STATUS_MAP = {
    "CANON": ("active", "surface"),
    "CANON_CANDIDATE": ("dormant", "deep"),
    "NEEDS_PROVENANCE_REVIEW": ("unstable", "sealed"),
    "NEEDS_PROVENANCE": ("unstable", "sealed"),
    "NEEDS_RESEARCH": ("unstable", "deep"),
    "INCOMPLETE_PAGE_26": ("unstable", "sealed"),
}

# Familia declarada → acento visual. Deriva de la familia, no del gusto.
ACCENT_BY_FAMILY = [
    ("THRESHOLD", "red"), ("ENTITY", "red"),
    ("SANCTUARY", "gold"), ("HEART", "gold"), ("MEMORY", "gold"),
    ("COSMOLOGY", "magenta"), ("CULTURAL", "magenta"),
    ("SIGNAL", "violet"), ("BODY", "violet"),
    ("OBSERVER", "cyan"), ("PROCESS", "cyan"), ("INTERACTIVE", "cyan"),
    ("SYSTEM", "acid"), ("ROUTE", "acid"), ("MAP", "acid"),
    ("BESTIARY", "indigo"), ("GAIA", "indigo"),
]

TYPE_BY_FAMILY = [
    ("ROUTE", "protocol"), ("MAP", "system"), ("SYSTEM", "system"),
    ("PROCESS", "protocol"), ("ENTITY", "node"), ("BESTIARY", "myth"),
    ("CULTURAL", "myth"), ("SANCTUARY", "system"), ("INTERACTIVE", "system"),
]


def slugify(node_id: str) -> str:
    return re.sub(r"^KDX-(NODE|MAP)-", "", node_id).lower().replace("_", "-")


def pick(table, family, default):
    up = (family or "").upper()
    for key, value in table:
        if key in up:
            return value
    return default


def checksum(node_id: str) -> str:
    h = hashlib.sha1(node_id.encode()).hexdigest()[:4].upper()
    return f"{node_id[:20]}-{h}"


def build(rows, claims_doc):
    declarations, edges = {}, []

    for row in rows:
        nid = row["IMAGE_ID"]
        if not NODE_ID.match(nid):
            continue
        col3 = (row.get("SOURCE_URL") or "").strip()

        if col3.startswith("KDX-"):
            edges.append({
                "from": nid,
                "relation": (row.get("TITLE") or "RELATED").strip().upper(),
                "to": col3,
                "descriptor": (row.get("PRIMARY_CONCEPT") or "").strip() or None,
                "validity": (row.get("SECONDARY_CONCEPTS") or "").strip().upper() or "UNSET",
            })
            continue

        # Declaración. Si un nodo se declara dos veces, gana la primera y se anota.
        if nid in declarations:
            declarations[nid].setdefault("duplicateDeclarations", 0)
            declarations[nid]["duplicateDeclarations"] += 1
            continue

        declarations[nid] = {
            "id": nid,
            "title": (row.get("TITLE") or nid).strip(),
            "family": col3,
            "zone": (row.get("PRIMARY_CONCEPT") or "").strip(),
            "function": (row.get("SECONDARY_CONCEPTS") or "").strip(),
            "atlasStatus": (row.get("MAP_ZONE") or "").strip().upper(),
        }

    # Claims que sostienen cada nodo, con su sensibilidad.
    claims_by_node = {}
    for claim in (claims_doc or {}).get("claims", []):
        for target in claim.get("relatedNodes", []):
            claims_by_node.setdefault(target, []).append(claim)

    nodes, report = [], {"pendingFields": 0, "blocked": 0}

    for nid, decl in sorted(declarations.items()):
        family = decl["family"]
        status, visibility = STATUS_MAP.get(decl["atlasStatus"], ("dormant", "deep"))

        outgoing = [e for e in edges if e["from"] == nid]
        node_claims = claims_by_node.get(nid, [])

        # `sensitivity: CRITICAL` no significa "bloquear". Significa que hay una manera
        # de equivocarse, y hay tres distintas. Solo la tercera bloquea:
        #   epistemicCaution     → escribir con precisión. No bloquea.
        #   attributionRequired  → atribuir y contextualizar. No bloquea el uso.
        #   permiso de la fuente → bloquea, y solo cuando la fuente lo pide.
        # Ver tools/reclassify_sensitivity.py.
        needs_permission = [
            c for c in node_claims
            if c.get("sensitivity") == "CRITICAL"
            and c.get("attributionRequired")
            and not c.get("epistemicCaution")
        ]
        needs_review = any(
            e["validity"] == "NEEDS_CULTURAL_REVIEW" for e in outgoing
        ) or any(c.get("attributionRequired") for c in node_claims)

        cultural = ("AUTHORIZATION_REQUIRED" if needs_permission
                    else "REVIEW_REQUIRED" if needs_review
                    or decl["atlasStatus"].startswith("NEEDS_PROVENANCE")
                    else "STANDARD")

        # El autor escribió la función; ésa es la summary. Nada se inventa.
        summary = decl["function"]
        pending = []
        if not summary:
            pending.append("summary")
        pending.extend(["proposition", "visualAnchor.label", "editorial.body"])

        limitations = []
        for c in node_claims:
            limitations.extend(c.get("limitations", []))

        node = {
            "$schema": "../kodex-node.schema.json",
            "id": nid,
            "slug": slugify(nid),
            "type": pick(TYPE_BY_FAMILY, family, "node"),
            "title": decl["title"].upper(),
            "subtitle": family or None,
            "status": status,
            "mode": "dark-archive",
            "accent": pick(ACCENT_BY_FAMILY, family, "bone"),
            "summary": summary,
            "proposition": "",
            "visualAnchor": {
                "kind": "pending-authoring",
                "label": "",
                "role": "dominant-phenomenon",
            },
            "symbols": [s.upper() for s in split_multi(decl["zone"])],
            "relationships": [
                {
                    "id": slugify(e["to"]),
                    "label": e["to"],
                    "type": e["relation"],
                    **({"descriptor": e["descriptor"]} if e["descriptor"] else {}),
                    "validity": e["validity"],
                }
                for e in outgoing
            ],
            "protocols": [],
            "sources": [
                {
                    "label": c["topic"],
                    "type": c.get("sourceType") or "research",
                    "path": c["supportedBy"] or c["id"],
                }
                for c in node_claims
            ],
            "behavior": {
                "engine": slugify(nid),
                "tempo": 0.2,
                "entropy": 0.3,
                "responsiveness": 0.5,
                "persistence": 0.5,
                "topology": decl["zone"].lower() or "undeclared",
            },
            "visibility": visibility,
            "version": "0.1.0",
            "checksum": checksum(nid),
            "epistemic": {
                "domains": sorted({d for c in node_claims for d in c.get("domains", [])}),
                "claimClass": "UNKNOWN",
                "culturalStatus": cultural,
                "limitations": limitations,
                "claims": [c["id"] for c in node_claims],
            },
            "atlasStatus": decl["atlasStatus"],
            "pending": pending,
            "publishable": bool(summary) and cultural != "AUTHORIZATION_REQUIRED",
        }
        if decl.get("duplicateDeclarations"):
            node["duplicateDeclarations"] = decl["duplicateDeclarations"]

        report["pendingFields"] += len(pending)
        if not node["publishable"]:
            report["blocked"] += 1
        nodes.append(node)

    return nodes, edges, report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("atlas")
    ap.add_argument("-o", "--outdir", default="nodes-build")
    ap.add_argument("--claims")
    args = ap.parse_args()

    raw = pathlib.Path(args.atlas).read_text(encoding="utf-8")
    try:
        raw = json.loads(raw)["fileContent"]
    except (json.JSONDecodeError, KeyError, TypeError):
        pass

    _, visual, _ = parse_markdown_table(raw)
    claims_doc = json.loads(pathlib.Path(args.claims).read_text()) if args.claims else None

    nodes, edges, report = build(visual, claims_doc)

    out = pathlib.Path(args.outdir)
    (out / "nodes").mkdir(parents=True, exist_ok=True)
    for node in nodes:
        (out / "nodes" / f"{node['slug']}.json").write_text(
            json.dumps(node, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (out / "authored-edges.json").write_text(
        json.dumps({
            "note": "Aristas escritas por el autor en el Atlas. Bridge 1 las perdió.",
            "count": len(edges),
            "edges": sorted(edges, key=lambda e: (e["from"], e["relation"], e["to"])),
        }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    from collections import Counter
    print(f"nodos generados      : {len(nodes)}")
    print(f"aristas recuperadas  : {len(edges)}")
    print(f"publicables          : {sum(1 for n in nodes if n['publishable'])}")
    print(f"bloqueados           : {report['blocked']}")
    print(f"campos por escribir  : {report['pendingFields']}")
    print()
    print("por estado del Atlas :", dict(Counter(n["atlasStatus"] for n in nodes)))
    print("por estatus cultural :", dict(Counter(n["epistemic"]["culturalStatus"] for n in nodes)))
    print("por tipo             :", dict(Counter(n["type"] for n in nodes)))
    print("relaciones           :", dict(Counter(e["relation"] for e in edges).most_common(8)))
    print("validez de aristas   :", dict(Counter(e["validity"] for e in edges)))


if __name__ == "__main__":
    main()
