---
title: KODEX −∞ · NFT launch checklist (Manifold)
date: 2026-07-27
status: needs-ocin-action
owner: Ocin
context: kodex-microsite
---

# KODEX −∞ · NFT launch (Manifold)

Recomendación fijada: **Manifold Studio** (`studio.manifold.xyz`). Razones: editorial, contract propio (no plataforma-comercio), edición limitada, mejor fit para KODEX que OpenSea/Foundation. Base chain (gas ~$0.10-2 por mint).

## Blockers para arrancar (tuyos, 15-30 min)

1. **Wallet crypto** (si no tenés)
   - Instalar `rainbow.me` (recomendado, mobile+web) o `metamask.io`
   - Crear wallet nueva → **guardar seed phrase en el password manager, NUNCA en texto plano ni en el vault Obsidian**
   - Añadir Base chain (Rainbow lo hace auto; MetaMask requiere `chainid.link/?network=base`)
   - Comprar/transferir ~$20 USD en ETH sobre Base (via Coinbase o bridge desde Ethereum). Para 10 mints iniciales.

2. **Manifold account**
   - Login en `studio.manifold.xyz` con email `wenu.mapu8@gmail.com` (resolver reCAPTCHA)
   - Elegir "Continue with wallet" al final y conectar la wallet
   - Setup handle: `wenu-mapu` o `ocin`

3. **Decisiones estratégicas** para el primer contract:
   - **Nombre contract:** `KODEX −∞ · Achroma Editions` (sugerencia)
   - **Symbol:** `KODEX`
   - **Edition type:** ERC-1155 (multi-edition, más barato para colecciones) o ERC-721 (1/1, más prestige)
   - **Chain:** Base (gas bajo, misma UX que Ethereum)
   - **Royalties:** 10% al artista (Manifold auto-splits)

4. **Primera obra a mintear:**
   - Recomiendo `arch-01` (primer plate, iconic) como pieza inaugural
   - Precio sugerido: **0.008 ETH** (~$20 USD, edición limitada 100 unidades)
   - Metadata: título "Arch-01 · The First Plate", descripción del kodex, ops C01/C03

## Cuando termines lo anterior, pasame:

- Wallet address (`0x...`)
- Nombre exacto del contract creado
- ID de la primera obra minteada
- URL del listing en Manifold

**Yo cableo en 15 min:**
- Actualizar producto WC 3438 (kodex-nft-edition-placeholder) → renombrar + linkear a NFT real
- Actualizar `store.astro` channel NFT: SOON → LIVE + link real a Manifold
- Añadir sección "NFT Editions" en `/kodex/store` con embed del contract
- Deploy

## Alternativa low-friction si NO querés meterte con web3 ahora

- Dejar el channel NFT como "COMING SOON · Notify me" — funciona hoy, deriva a `mailto:` para lista de espera
- Yo cablo el producto placeholder 3438 con copy "On-chain editions launching Q4 · Join the drop"
- Cuando tengas 20+ inscripciones interesadas, arrancás Manifold sin gas quemado especulativo

Recomiendo esta si NFT no es prioridad esta semana.

## Referencias

- Manifold docs: `docs.manifold.xyz`
- Base chain guide: `docs.base.org/tools/wallets`
- Ejemplo similar (art-editorial NFT en Manifold): `manifold.xyz/@refikanadol`
