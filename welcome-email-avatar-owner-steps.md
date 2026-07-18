# Welcome email redesign + sender avatar — owner steps

Date: 2026-07-05
Scope: (1) what changed in the welcome email, (2) the ONE thing Ocin does to get the Wenu emblem as the sender avatar in Gmail.

---

## 1. Welcome email — what changed (already coded)

File: `~/wenu-platform/src/api.mjs` → `sendWelcomeEmail()` (fires from `/newsletter/subscribe`).
Preview mirror: `~/wenu-frontend/scripts/preview-welcome-email.mjs`.

Moved toward the "Element Body Jewelry" reference hierarchy while keeping Wenu warmth:

- Near-black **obsidian** field top to bottom (dropped the charcoal frame — pure #0a0a0a like the ref).
- Tiny **"Ver en el navegador" / "View in browser"** link at the very top.
- **Logo centered and bigger** (230px → 300px) as the first prominent element.
- **Big characterful headline** (34px → 40px): `Mari mari — / estás en el círculo.` (ember second line). Not the generic "Estás en el círculo."
- Warm **subtitle** promoted (16px → 18px, bone): "Te recibimos. Ahora ves primero lo que va llegando al taller."
- Mapudungun accent updated to canon: **`Küme akun — bienvenidx.`**
- Spinning **mandala GIF** kept as protagonist (240px → 260px).
- Real **mood photo**, one **ember CTA** ("ENTRAR AL TALLER"), coupon block, footer unchanged.
- Still email-safe: tables + inline styles, 600px, `color-scheme: dark`, hidden preheader, bulletproof CTA.

Assets are unchanged and already on the CDN (`wenu-frontend.pages.dev/img/email/email-logo.png`, `mandala-spin.gif`, `email-mood.jpg`), so **the email change needs no frontend deploy** to work — it ships the next time the platform API restarts.

---

## 2. Sender avatar (the emblem circle in Gmail) — DECISION + your step

Goal: emails from `marimari@wenumapuonline.com` show the **Wenu emblem** as the round avatar in Gmail, not the plain "M" letter.

There are two ways. We are using the free one.

### ✅ Recommended (free, no DNS, no certificate): Google profile photo on the Titan address

Gmail draws the sender avatar from the **sender's Google Account photo**. You can attach a Google Account to your Titan address without creating a new @gmail address:

1. Go to https://accounts.google.com/signup
2. Choose **"Use my current email address instead"**.
3. Enter **marimari@wenumapuonline.com** (your Titan address) and verify the code Titan delivers.
4. Finish the account. Then open the account → profile picture → **upload the emblem PNG** (see asset below).
5. Done. Within a short propagation window, Gmail shows the emblem for every email you send from marimari@.

Emblem asset to upload: `public/img/email/wenu-emblem-avatar-512.png`
(generate it once with: `cd ~/wenu-frontend && node scripts/gen-email-avatar.mjs` — rasterizes the SVG master to 512/1024 PNG on the obsidian field. Needs `sharp`: `npm i -D sharp` if missing.)
Master vector: `public/img/email/wenu-emblem-avatar.svg` (ember Wenu sigil on obsidian).

Titan's own profile picture (Titan webmail → Settings → Preferences → Account → Profile Picture) is **only visible to you** — it does NOT reach Gmail recipients. The Google-account-on-Titan-address method above is the one that works. (Source: Titan support.)

### ⏳ Optional later (paid, only for the blue verified check): BIMI

BIMI would show the logo without any Google account, but for Gmail specifically it needs BOTH:
- DMARC at `p=quarantine` or `p=reject` (ours is currently `p=none` — BIMI rejects `p=none`), AND
- a **VMC** (Verified Mark Certificate, ~US$1,000+/yr from DigiCert/Entrust) for the check, or a CMC for logo-without-check.

Not worth it pre-launch. If you ever want it, the square logo is already prepared: `public/img/email/wenu-bimi.svg` (SVG Tiny-PS profile). The DNS record would be a TXT at `default._bimi.wenumapuonline.com` pointing at the hosted SVG (+ `a=` the VMC). Do the Google-photo method now; revisit BIMI only if you buy a VMC.

---

## 3. Still pending (blocked on tooling this session)

The local build VM was down, so these were NOT done and are the remaining loop:
- Live test send of the redesigned email to a real inbox + inbox/render confirmation.
- Deploy of the two new emblem SVGs to the CDN (only needed for the BIMI path).
- Rasterizing the PNG (run `node scripts/gen-email-avatar.mjs`).

Route the deploy through `wenu-frontend-eng` and verify live per the hard rules.
