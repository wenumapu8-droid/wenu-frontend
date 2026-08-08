# KODEX kit

Standard blocks for building on this repo. The point is that you should not have
to rediscover any of this.

Every entry below cost somebody real hours. Three separate agents independently
hit the 500px clamp on one night. Two lost a whole run to a screenshot call that
never returns. One nearly "fixed" a bug that did not exist.

## Use

```bash
scripts/kodex-kit/kit.sh new fix/my-thing        # isolated worktree, ready to build
cd /tmp/wt-fix-my-thing
scripts/kodex-kit/kit.sh sweep /kodex/           # build, serve, capture + audit at 3 viewports
# ... work ...
scripts/kodex-kit/kit.sh sweep /kodex/           # look again
scripts/kodex-kit/kit.sh done                    # drop the node_modules symlink
git add -A && git commit
```

`sweep` captures desktop, 390x844 and 412x915 — the two phone sizes every visual
work packet requires — and prints an audit for each. `look <path> <preset>` does
one. Shots land in `.kit-shots/`.

Exit code 3 means the audit found problems; 0 means clean.

## What the audit reports

Only real problems, so an empty report means the page is clean.

- **horizontalScroll** — `documentElement.scrollWidth` past the viewport.
- **overflowing** — visible elements crossing the viewport edge.
- **smallTargets** — tappable elements under 44x44, checked below 900px only.
  44px is `layout.touchTargetMin` in `kodex.tokens.json`; this checks the system
  against its own token rather than an outside rule.
- **overlaps** — leaf text elements that visually intersect. This is the check
  that catches a CTA sitting under fixed chrome, or a `::before` marker printing
  over its own button label.
- **missingAlt**.

## Why each step is the way it is

**Build with `ALLOW_EMPTY_PRODUCTS=true`, never plain `npm run build`.**
`getProducts()` in `src/lib/woo.ts` throws when the WooCommerce credentials are
absent — deliberately, so a broken fetch can never ship a zero-product catalogue.
Offline and in CI they are absent, so the build aborts. The flag is the documented
escape hatch and is what the CI workflow uses. A build that "fails" this way is not
a code defect; do not report it as one.

**Wait for HTTP 200 before capturing.** `serve` returns before it answers. A
capture taken too early is the server's error page: about 34KB, and it looks
enough like a real screenshot to fool you. `shoot.mjs` warns under 60KB.

**Use `Emulation.setDeviceMetricsOverride`, never `--window-size`, for phones.**
macOS clamps Chrome's window to a 500px minimum. A "390px" screenshot is a 500px
layout cropped to 390 — it invents overflow that is not there and hides overflow
that is. Conclusions from such a capture are wrong in both directions.

**Grab a screencast frame, never `Page.captureScreenshot`.** It never returns on a
page running an unconditional `requestAnimationFrame` loop, and several KODEX
scenes do exactly that (`KodexShell.astro` runs one for the crosshair). It reads
as a hang and burns the whole run.

**`--enable-unsafe-swiftshader --use-angle=swiftshader`, never plain
`--disable-gpu`.** The latter hangs forever on any page that initialises WebGL,
which is most KODEX scenes.

**Give Chrome its own `--user-data-dir` per run.** A shared profile hangs.

**Await `document.fonts.ready` before judging text.** A late webfont swap makes
text look clipped when it is not.

**Symlink `node_modules`, and remove it before committing.** It is about 1GB;
reinstalling per worktree is slow and pointless. `kit.sh done` removes it.

## Not covered here

- **There is no test runner** on most branches — no `test` script, no vitest, and
  neither `typescript` nor `@astrojs/check` is installed, so nothing typechecks
  this repo. Use `node --test` with Node 24's native type-stripping, which needs
  no dependency. Note that it validates syntax and runtime, **not types**. A
  branch adds a real runner; until it lands, say plainly what you could not verify.
- **CI pins a Node version that differs from `.nvmrc`** on some branches, which
  matters because Node 22.12 predates unflagged TypeScript type-stripping — a
  `.ts` test would not execute there at all.

## A layout trap worth designing against

Three separate pages failed the same way: a `display: grid` container with
`grid-template-rows` but no `grid-template-columns`. Its single implicit `auto`
track sizes to the min-content of its widest child, so one unbreakable string —
a raw slug title, a long id — blows every sibling out of the container. The fix is
`minmax(0, 1fr)`. If you build panels as grids, assume this will happen.
