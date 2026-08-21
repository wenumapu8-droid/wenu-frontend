# KDX.BEAM — Optical Memory Transfer / Animated QR / Air-Gap Artifact Exchange

Status: `RESEARCH / FUTURE MODULE / NON-CANON / NO RELEASE-BLOCKING RUNTIME WORK`

## Source observation
User-supplied screenshots show a local/offline transfer UI labelled “QR Beam” that selects a file and emits rapidly changing QR frames for a phone camera to receive. Visible controls include QR size/density, error correction and playback speed. The screenshot establishes the demo concept only, not its exact protocol, encryption, source code, license or implementation.

## KODEX interpretation
`KDX.BEAM` is a transport module that lets a compact KODEX artifact move from one surface/device to another through visible light/camera without requiring network transport.

Semantic chain:

`MATERIA → CÓDIGO → LUZ → OBSERVADOR → MEMORIA → NUEVA FORMA`

Potential flow:

`KODEX ARTIFACT → COLLECT / BEAM → MULTIPART OPTICAL SIGNAL → PHONE CAMERA → RECONSTRUCTED ARTIFACT → LOCAL MEMORY FRAGMENT`

Potential uses:
- collect a fragment from a KODEX scene;
- gallery/projector installation exchange;
- physical-product bridge for books, posters, vinyl and objects;
- offline field/archive transfer;
- provenance capsules carrying ID, title, scene, seed, checksum, relations and approved compact media.

## Verified open references — 2026-08-21

### Blockchain Commons Animated QRs
https://developer.blockchaincommons.com/animated-qrs/

Interoperable multipart QR transmission across air gaps. Built on Uniform Resources (UR), fragmentation and Luby-transform fountain codes so reception can begin at arbitrary frames and tolerate missing frames.

### Multipart UR Implementation Guide
https://github.com/BlockchainCommons/Research/blob/master/papers/bcr-2024-001-multipart-ur.md

Technical reference for MUR / rateless fountain-code sequencing.

### bc-ur
https://github.com/BlockchainCommons/bc-ur

C++ UR reference implementation; companion ecosystem includes Swift and other language implementations.

### qr-transfer/qrf
https://github.com/qr-transfer/qrf

Browser-based, fully offline animated-QR file transfer with compression, configurable density/FPS/redundancy, fountain coding and progressive reconstruction. Strong P1 reference candidate.

### Coinkite BBQr
https://github.com/coinkite/BBQr

Multipart animated QR transport. Supports CBOR, JSON and text in addition to Bitcoin-oriented payload types.

### bc-mur-rust
https://github.com/BlockchainCommons/bc-mur-rust

Multipart UR QR generator with single/animated fountain-coded modes, frame dumps and media export.

## First bounded proof — future only
P0 — research only.

P1 — exactly one JSON artifact → animated QR → phone/browser decoder → exact reconstruction + checksum.

P2 — add SVG or small image derivative.

P3 — define a KODEX artifact package with provenance metadata.

P4 — installation mode.

P5 — physical-product bridge.

## Architecture boundary
- transport only; no new router, renderer, memory authority or public shell;
- serialize through existing KODEX artifact/provenance contracts;
- transmission state inspectable and checksum-verifiable;
- prefer interoperable/open specifications;
- camera/storage permissions explicit and user initiated;
- reduced-motion/accessibility needs a non-flashing alternative;
- QR frames must remain scanner-reliable; no decorative distortion that breaks decoding.

Suggested states:

`DORMANT → PREPARE → ENCODE → TRANSMIT → ACQUIRE → VERIFY → STORED`

## Security
Offline/optical is not the same as secret or encrypted. Any camera with line of sight may potentially capture frames. Sensitive payloads require:

`ENCRYPT → ENCODE → OPTICAL TRANSMIT`

No sensitive-data use should ship before threat modeling and implementation review.

## Release boundary
Do not divert the 2026-08-21 whole-corridor KODEX release sprint. Preserve KDX.BEAM as a future research module only.

## Drive dossier
https://docs.google.com/document/d/16ASx5LvGkjS2lt16KCJ7EvF0P0KM4v2dcqf5YZlcsb4/edit

## Truth boundary
`USER-SUPPLIED DEMO ≠ VERIFIED IMPLEMENTATION DETAILS`

`REFERENCE PROTOCOL ≠ KODEX DEPENDENCY`

`RESEARCH ≠ IMPLEMENTED ≠ TESTED ≠ CREATOR ACCEPTED ≠ CANON ≠ MERGED ≠ DEPLOYED`
