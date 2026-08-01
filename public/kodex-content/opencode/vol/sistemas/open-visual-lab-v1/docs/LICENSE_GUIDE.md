# License Guide

This is a practical checklist, not legal advice.

## Green

Usually suitable for commercial integration when notices are preserved:

- MIT
- Apache-2.0
- BSD-2-Clause / BSD-3-Clause
- Unlicense / clearly dedicated public domain
- CC0 assets

## Yellow

Requires deliberate review:

- CC BY: attribution required.
- LGPL: distribution/linking obligations depend on use.
- AGPL: network deployment and modifications can require source availability.
- Mixed-license repositories: inspect each file.
- Openverse: each result has its own license.

## Red

Do not copy into a commercial KODEX build without explicit permission:

- No license.
- “Free download” with no reuse license.
- Non-commercial licenses.
- Shadertoy shaders without an explicit commercially compatible license.
- Pinterest/Behance/Instagram reference artwork.
- Paid visual packs not purchased for the intended use.

## Required provenance record

For every imported external file, store:

```json
{
  "source": "",
  "author": "",
  "source_url": "",
  "license": "",
  "license_url": "",
  "downloaded_at": "",
  "modified": true,
  "attribution_text": ""
}
```
