# PCO token — DEVNET PREVIEW (branch `devnet-token-preview`)

This branch adds the **PCO token page** to the website, wired to a **local devnet** so you can
click through and simulate everything before mainnet. It is a PREVIEW: it points at
`recap-development` on `localhost:8090`, carries a site-wide DEVNET banner, and must **never be
merged to `main` or deployed** (main stays token-free until launch).

## What's on it

- **`/token` page** — the full token experience, themed to the site:
  - disclosure + how-it-works + fair-play info
  - **Claim (no wallet, no fee):** an in-browser throwaway key claims, the on-chain gas station
    pays. The only sponsored action.
  - **Do more (connect a wallet):** transfer, cross-chain transfer, vote, propose — self-paid.
    Four wallet options (in-browser test key, EckoWallet, Zelcore, Ledger), ported from the
    Smart Pacts holder-portal adapters, pointed at devnet.
- **Home-page banner** → the token page.
- **Site-wide DEVNET banner** on every page.

## Run it locally

1. **Devnet up** (the PCO v2 stack lives in namespace `user`):
   ```
   docker start spt-test-devnet-api-proxy-1        # if the proxy is down
   # deploy/rehearse the stack if needed: cd <pco-token>/ops && PCO_NS=user npm run rehearse
   ```
2. **Seed some state** (a genesis round + a few proposals) — from the pco-token ops repo:
   the seed opens a `genesis` round with code **`fungible-v2`** and a couple of advisory
   proposals. (See the session notes; it uses the rehearsal keys + reserve.)
3. **Build + serve the site:**
   ```
   npm install
   npm run build
   npx serve out           # or: python3 -m http.server 8093 --directory out
   ```
   Open `/token`.

## Testing the two modes

- **Claim:** pick the `genesis` round, enter `fungible-v2`, click claim → 100 PCO, no wallet, no KDA.
- **Do more:** to test transfer/vote/propose you need an account holding a little **devnet KDA**.
  Easiest: connect the **in-browser test key**, then fund that `k:` account with devnet KDA from
  `sender00` (the seed/faucet helper). Then vote/transfer/propose — the key signs and pays its
  own gas. (On mainnet you'd connect EckoWallet/Zelcore/Ledger instead.)

## Verified (Playwright, this branch)

Gasless claim confirmed (0 → 100 PCO); wallet connected; **self-paid vote landed on-chain** (a
proposal tally rose by the voter's weight, "your vote: yes (100)" rendered). Home banner + nav
link + DEVNET banner present. Zero console errors. Screenshots in this folder.

## Config

Everything devnet-facing is in `src/lib/chain.ts` (`CFG`) — the mainnet block is staged and
commented. A launch build flips `CFG` and drops the DEVNET banner + the preview framing.
