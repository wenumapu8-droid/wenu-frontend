#!/usr/bin/env python3
# Extract text from Ocin's KODEX Atlas — Cosmogonías Antiguas Vol. I.
import sys
PDF = "/Users/user1/Library/Application Support/Claude/local-agent-mode-sessions/4814e213-bbe2-40ae-b139-8ba7b3337c45/0c515280-d897-4086-a1c6-f53a62fb974f/agent/local_ditto_0c515280-d897-4086-a1c6-f53a62fb974f/uploads/9e8d3f7c-KODEX_Atlas_Cosmogonias_Antiguas_Volumen_I.pdf"
OUT = "/Users/user1/wenu-frontend/kodex-source/atlas-cosmogonias-vol1.txt"
try:
    import fitz  # PyMuPDF
except Exception as e:
    print("NO_FITZ", e); sys.exit(2)
doc = fitz.open(PDF)
chunks = []
for i, page in enumerate(doc):
    t = page.get_text().strip()
    chunks.append("\n===== PAGE %d =====\n%s" % (i + 1, t))
text = "\n".join(chunks)
open(OUT, "w").write(text)
print("PAGES", doc.page_count, "CHARS", len(text))
print(text[:6000])
