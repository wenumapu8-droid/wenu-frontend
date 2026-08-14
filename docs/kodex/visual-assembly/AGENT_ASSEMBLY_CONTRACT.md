# KODEX Visual Assembly Agent Contract v0.1

## Input

```json
{
  "scene": "03_ARCHIVE",
  "hero_media_id": "required",
  "recipe": "RCP-ARCHIVE-COLLAGE",
  "color_mode": "mono | paper | cyan | violet | magenta | yellow | red",
  "density": "very-low | low | medium | high",
  "text_slots": {},
  "seed": 0,
  "viewport": "desktop | mobile",
  "reduced_motion": false
}
```

## Required behavior

- Load the `hero_media` master without modifying its pixels.
- Resolve provenance before composition.
- Pick components only from the governed Visual Assembly manifest/registry.
- Use one recipe only as the primary skeleton.
- Use normalized coordinates 0–1.
- Use max one signal accent unless recipe is `RCP-COLOR-EVENT`.
- Keep critical text outside raster artwork.
- Output both render and assembly JSON.

## Output

```json
{
  "recipe_id": "RCP-MONOLITH",
  "hero_media_ids": ["..."],
  "components": [
    {"stable_id":"KDX-VIS-0017","slug":"FRM_full_tech","x":0,"y":0,"w":1,"h":1,"opacity":0.75},
    {"stable_id":"KDX-VIS-0041","slug":"MRK_crosshair","x":0.72,"y":0.18,"w":0.08,"h":0.08,"opacity":0.5}
  ],
  "text_slots": {},
  "color_mode":"mono",
  "motion_profile":"static",
  "viewport":"desktop",
  "provenance_check":"PASS",
  "epistemic_notes":[]
}
```

The machine schema in `assembly_candidate.schema.json` is authoritative for fields currently enforced by CI.

## Automatic rejection

Reject the candidate if:
- the master artwork was restyled;
- provenance or rights are unresolved for intended use;
- more than one hero competes for dominance without collage recipe;
- typography is baked into an AI-generated raster when live text could be used;
- cultural glyph provenance is absent;
- external reference is reproduced too literally;
- important state is conveyed only by color;
- mobile version is a scaled-down desktop poster;
- reduced-motion has no valid fallback.

## Authority boundary

An assembly agent may compose, select and parameterize governed pieces. It may not redefine canon, grant rights, reinterpret cultural material, turn visual metaphor into scientific evidence or declare creator visual acceptance.