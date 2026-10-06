# KDX AUTOPILOT — Near-Term Launch Checklist

Status key:

- [x] scaffolded in this branch
- [ ] required before first autonomous production run
- [ ] required before public release

## P0 — repository scaffold

- [x] isolated feature branch
- [x] architecture document
- [x] episode schema
- [x] example episode
- [x] local run preparation script
- [x] environment placeholders
- [x] no automatic publishing
- [x] no generative-video dependency

## P1 — local production workstation

- [ ] verify Node version with `nvm use`
- [ ] verify `npm install`
- [ ] verify `npm run build`
- [ ] install / verify FFmpeg on the production machine
- [ ] create a deterministic browser/frame capture adapter
- [ ] confirm 1920×1080 and 1080×1920 render paths
- [ ] define safe cache / scratch limits
- [ ] define maximum run time and disk usage

## P2 — provider adapters

Provider integrations are optional until explicitly configured.

- [ ] OpenAI adapter: define supported task + model + budget
- [ ] Anthropic / Claude Code adapter: define tools, max turns and allowed paths
- [ ] Gemini adapter: define QA schema and model
- [ ] ElevenLabs adapter: select narration voice and confirm API entitlement
- [ ] verify current API costs / quotas before enabling unattended runs
- [ ] store secrets only in local / provider secret stores, never git

## P3 — first film

Target:

**KDX-FILM-001 — THE ARCHIVE REMEMBERS**

- [ ] approve source KODEX plate(s)
- [ ] approve 60–90 s script
- [ ] build beat graph
- [ ] implement one SVG scene
- [ ] implement one Canvas scene
- [ ] implement one Three/WebGL or GLSL scene
- [ ] implement editorial typography overlay
- [ ] create narration
- [ ] create / source licensed sound
- [ ] produce rough render
- [ ] run 2–3 QA / revision cycles
- [ ] export MASTER_CANDIDATE
- [ ] creator review
- [ ] archive provenance

## P4 — YouTube release

- [ ] channel identity / handle
- [ ] banner / avatar
- [ ] description / links
- [ ] thumbnail system
- [ ] subtitle language policy
- [ ] source / bibliography description format
- [ ] upload checklist
- [ ] analytics event sheet
- [ ] initial release cadence

## P5 — automation after proof

Only after one film passes manually:

- [ ] automate episode worktree creation
- [ ] automate provider calls
- [ ] automate preview render
- [ ] automate keyframe extraction
- [ ] automate structured visual QA
- [ ] automate revision loop with hard iteration ceiling
- [ ] automate Shorts derivatives
- [ ] automate title / description package
- [ ] keep final publication gated by human approval

## Definition of ready

KDX AUTOPILOT is **production-ready** when a clean machine can take one approved episode manifest and produce a reproducible MASTER_CANDIDATE without manual timeline editing, while preserving source provenance and approval gates.

It is **release-ready** only after creator approval and channel packaging are complete.
