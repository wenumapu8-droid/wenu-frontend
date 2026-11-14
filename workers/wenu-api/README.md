# wenu-api

Worker that will replace the store API currently running on the iMac (`api.wenumapuonline.com` → Cloudflare Tunnel → Fastify). This folder is only the new code. **Nothing here is deployed.** The live site and the tunnel are unchanged.

Phases in this folder: scaffold (`GET /health`, CORS, D1 schema) and `POST /shop/checkout-link` (Mercado Pago). Reserve, newsletter, and constellation are not implemented yet. Those paths still belong to the iMac.

## What is safe to run today

From this directory:

```bash
npm install
npm test
npm run migrate:local
npm run dev
```

`npm test` uses Vitest inside the Workers runtime (Miniflare, the same local runtime as `wrangler dev`). Mercado Pago is mocked. No request leaves the machine.

`wrangler dev` is local. Do **not** add `--remote`. Check:

```bash
curl -i http://127.0.0.1:8787/health
curl -i -X OPTIONS http://127.0.0.1:8787/shop/checkout-link \
  -H 'Origin: https://wenumapuonline.com' \
  -H 'Access-Control-Request-Method: POST'
```

`/health` returns `productCount: null` until a catalog table exists. The iMac still reports the real product count. The extra `runtime: "workers"` field is how you can tell the responses apart. The storefront does not call `/health`.

For a local checkout attempt, copy `.dev.vars.example` to `.dev.vars` and paste a **sandbox** access token (it starts with `TEST-`). `.dev.vars` is gitignored. An empty token is enough for `/health`. A valid cart posted to local dev will call Mercado Pago for real, so use a sandbox token only.

## Commands that touch the Cloudflare account

Do not run these until Nico writes **APROBAR DEPLOY**. Each one writes to the real account:

| Command | What it does |
|---|---|
| `npx wrangler d1 create wenu` | Creates the remote D1 database |
| `npx wrangler d1 migrations apply wenu --remote` | Creates the tables on that database |
| `npx wrangler queues create wenu-mail` | Creates the mail queue (not used yet; leave it) |
| `npx wrangler deploy` | Uploads the Worker |
| `npx wrangler secret put MERCADOPAGO_ACCESS_TOKEN` | Stores the token **and deploys a new version** |

`wrangler secret put` reads the value from the terminal prompt. Do not put the token in the command, in chat, or in git. `wrangler.toml` lists the name only.

There is no route and `workers_dev = false`, so a deploy still does **not** attach `api.wenumapuonline.com`. The placeholder `database_id` is intentional: omitting it would let Wrangler create a database during deploy.

## Staging, after APROBAR DEPLOY

1. `npx wrangler login` on the existing account (`wenu.mapu8@gmail.com`, account `68d502a80b1badf06df7795aeb91d96c`).
2. `npx wrangler d1 create wenu`. Copy the printed `database_id` over the placeholder in `wrangler.toml`.
3. `npx wrangler d1 migrations apply wenu --remote`.
4. In `wrangler.toml`, set `workers_dev = true` for this trial only. Leave `routes` absent.
5. `npx wrangler deploy`. This publishes `https://wenu-api.<account>.workers.dev` and does not change `api.wenumapuonline.com`.
6. `npx wrangler secret put MERCADOPAGO_ACCESS_TOKEN`. Paste the Mercado Pago **sandbox** token when prompted (`TEST-…`, not the live token). The command redeploys.
7. `curl https://wenu-api.<account>.workers.dev/health`, then a sandbox card checkout. Cancel without paying.

The cart contract is `{ email, name, items: [{ sku, name, price, qty }], shipping, total }`. Shipping is `$8` when the merchandise subtotal is under `$150`, and `$0` from `$150` (same rule as `Cart.astro`). The Worker rejects a total or shipping figure that does not match. The product-page reserve button sends `{ email, name, piece, sku, price }` instead; that shape is accepted and the same shipping rule is applied on the server.

Prices are sent to Mercado Pago as US dollars (`MERCADOPAGO_CURRENCY = "USD"`). There is no conversion. If the sandbox account cannot charge USD, stop and tell Nico. Do not switch the currency code to CLP (or anything else) without a decision: the same numbers would then mean a different currency.

A test token (`TEST-…`) makes the Worker return `sandbox_init_point`. The browser is sent only an `https` Mercado Pago checkout URL.

Return pages, already on the site: success and pending go to `/gracias?type=shop&id=<order>`, failure goes to `/cart`. No webhook is registered. If the iMac has a Mercado Pago webhook, leave it on the tunnel until a later phase.

## Cutover of this one route (a second, separate approval)

Not part of staging. Only with another **APROBAR DEPLOY**, add a Worker Route for `api.wenumapuonline.com/shop/checkout-link*` and nothing else. The rest of `api.` keeps going to the iMac. Rollback is deleting that route. The tunnel serves the path again. Do not delete the D1 database; orders created during the window stay there for Nico to reconcile.

`workers_dev` can go back to `false` once a route exists, so the `*.workers.dev` URL is not a second public copy.

## Still on the iMac

`POST /shop/order`, `POST /newsletter/subscribe`, and the email-agent constellation route are not in this Worker. `GET` on a POST-only path returns the Fastify 404 shape (`message`, `error`, `statusCode`) so a stray GET does not look like a new API. `GET /audit/woo/latest` is **401** here. It is public and unauthenticated on the iMac today; do not route it at this Worker.

Mail (Resend) and the queue are documented and not bound. Checkout does not send email.

## Free-tier notes

Handlers validate JSON, run one or two D1 statements, and `fetch` Mercado Pago. Waiting on that `fetch` does not count toward the 10 ms CPU limit. Measure CPU on the staging checkout before any route is attached. If the Worker returns error 1102 repeatedly, stop and talk to Nico. Do not enable Workers Paid.

The frontend is not pointed at this Worker. Cloudflare Pages config for the site is untouched.
