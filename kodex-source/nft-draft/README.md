# KODEX -∞ NFT Draft

This package prepares metadata only. It does not mint, connect a wallet, pay gas, or sign transactions.

## Contents

- `images/` - local preview images copied from the Printful/Pinterest POC.
- `metadata/` - OpenSea-style draft metadata with placeholder IPFS image URLs.
- `collection.json` - draft collection-level metadata.

## Human-Only Steps

1. Choose the final marketplace/platform.
2. Upload images to IPFS or platform storage.
3. Replace `ipfs://REPLACE_WITH_IMAGE_CID/...` in metadata.
4. Connect owner wallet, pay gas if needed, and sign mint transaction manually.

## Operational Blockers

- Owner wallet address is not filled in, by design.
- Final rights/licensing language is pending owner approval.
- Minting is intentionally blocked until Ocin signs manually.
