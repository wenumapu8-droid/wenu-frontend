# Art triage — mechanical pre-filter

Dimensions read for 1,307 of the 1,309 volumes that carry **no `fuente` and no
`curaduria_es`** — the set produced by mechanical ingestion. Read from R2 with
HTTP range requests (first 1KB per file, header only); the images were never
downloaded and are not needed to reproduce this.

| file | rows | meaning |
|---|---|---|
| `TRIAGE-flagged-pantalla.csv` | 837 | phone-screen aspect (~0.4545). Almost certainly screenshots. |
| `TRIAGE-para-vision.csv` | 470 | everything else. **This is the list a vision pass should look at.** |
| `TRIAGE-sin-leer.csv` | 2 | header unreadable after retries. |

## Why the fingerprint is trusted

821 of the flagged are **exactly `1080x2376`** — the same pixel dimensions as a
confirmed contaminated item (`spec-0050aebb-49347`, a screenshot of an Amazon
product page). Same device, same capture pipeline. The rest share the aspect at
other resolutions (`1800x3955`, `582x1280`).

Spot-checked 3 at random by eye, all screenshots:
- a capture of **wenumapuonline.com** itself — earrings at $45 with a CLAIM button
- a **Pinterest** pin of a Marvel/X-Men editorial layout
- a **Pinterest** pin of a piece credited to **MANIC AGENCY**

## The warning that matters for the vision pass

That third one is a dossier plate — dark ground, monospace, data rows, an eye. It
**is** digital art, and it is **in the KODEX aesthetic**. A classifier asked
*"is this art?"* will keep it.

The question is not "is this art" but **"is this Ocín's"**. Those are different
questions and only the second one protects the archive. References saved as
inspiration were ingested alongside the work, and they are the ones that look
most like it.

## The answer key

The author's real archive is in Google Drive at `Mi unidad/book/0cin/`, organised
by form — **137 pieces**: Mandala 38, Molecular 27, Banner 14, Toroide 7,
Elementos gráficos 7, Psycho 5, Cuadrado 5, Triangular 3, Fractal 3, Patron 3,
Circular 1, plus 24 loose. Filenames show mobile-app provenance (`InShot_2021…`,
`PSX_2021…`).

Match against that folder rather than judging by eye where possible. Provenance
beats taste, and it is the criterion the rest of the canon already uses.
