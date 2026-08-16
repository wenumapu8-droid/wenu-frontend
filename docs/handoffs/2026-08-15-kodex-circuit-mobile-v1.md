# KODEX−∞ — Circuit Mobile v1

STATUS: BOUNDED VISUAL PROOF / NOT MERGED / NOT DEPLOYED

## Objective
Turn the current folio experience from a stack of visible HUD/card layers into an orientable semantic circuit, beginning with PROLOGUE on mobile.

## Architecture boundary
This branch does **not** introduce or replace any route, memory, JourneyState, Deep Route, PlateSpec, Assembly OS, renderer, manifest, or artwork pipeline.

It starts from PR #77 head `5a4ab173cf79cf67f7e4812a24d26251f85a9abe` and changes only the visible composition layer.

## First bounded proof
### Shared mobile circuit chrome
- collapse astronomy HUD to one locator (`scene / total / code`);
- hide duplicate segmented timeline on mobile;
- convert bottom navigation from rounded pill UI into one structural route rail;
- keep previous / current / next / index available;
- reduce top status chrome to logo + compact sound/signal controls.

### PROLOGUE
- artwork/CRT becomes the dominant visual field;
- hide first-view DataStrip / axis / stratum strip / barcode / registration marks / art rail on mobile;
- preserve those systems in code rather than deleting them;
- move the macro statement into the lower visual silence instead of a card stack;
- reduce `YOU ARE NOT ALONE / A SIGNAL / A SYSTEM / A CHOICE` to the first signal in the initial viewport;
- keep primary observation action and protocol disclosure;
- retain reduced-motion fallback.

## Acceptance target
At 390×844 and 412×915, the first viewport should read in this order:
1. location;
2. artwork / observation field;
3. `THE ARCHIVE IS WATCHING.`;
4. one context signal;
5. observation action;
6. route rail.

No generic dashboard block should outrank the artwork or macro signal.

## Creator gate
Technical/browser acceptance is not visual approval. Creator Visual PASS remains explicit and separate.
