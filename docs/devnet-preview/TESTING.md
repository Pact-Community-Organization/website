# Testing the PCO token site against the local devnet

Two ways to test — the LIVE production site (it already points at your devnet) or a local build.
Both need the devnet running on this machine.

## 0. One-time state check

```bash
docker start spt-test-devnet-api-proxy-1          # if the api proxy is down
curl -s http://localhost:8090/chainweb/0.0/recap-development/cut | head -c 80   # sanity: devnet answers
```

The PCO v2 stack lives in namespace `user`. If the devnet was reset, redeploy first:
`cd <pco-token>/ops && PCO_NS=user npm run rehearse`.

**Seed the public quest state (run this LAST, after any rehearse/e2e):**
```bash
cd <pco-token>/ops && PCO_NS=user npx tsx /tmp/seed-devnet.mjs   # or re-create: genesis round, code "fungible-v2", proposals
```
The rehearsal/e2e harnesses reset the genesis code to an internal test code — if a claim fails
with "wrong engagement code", re-run the seed.

## 1. Test on the LIVE site (simplest)

Open **https://pact-community.org/token** in Chrome/Edge/Brave **on Windows** (the browser reaches
`localhost:8090` through WSL2 port forwarding; HTTPS→localhost is exempt from mixed-content
blocking). The page should show open rounds and proposals within a few seconds.

- **Claim:** pick the `genesis` round, code `fungible-v2` → 100 PCO, no wallet, no fee.
- **Fund the browser key** so it can act (self-paid gas + optional PCO):
  ```bash
  cd <pco-token>/ops
  PCO_NS=user npm run fund -- <k:account-shown-on-the-page> 1 1000
  ```
  (1 KDA gas + 1,000 PCO — enough to open a proposal. PCO comes from the devnet reserve.)
- **Do more:** click *use in-browser key* → transfer, cross-chain, vote, propose.
- **Voting key:** with the wallet connected, *register browser key as vote key* → switch
  "Voting as" to the vote-key mode → vote (the hot key signs and pays).
- **Look up / rotate:** lookup needs nothing; rotate applies to named accounts only
  (`k:` accounts get the protocol explanation).

## 2. Test with EckoWallet

In EckoWallet: *Settings → Networks → add* — Name `PCO devnet`, URL `http://localhost:8090`,
Network ID `recap-development` — save, select as active, reconnect on the page. Fund its account
with `npm run fund` as above.

## 3. Test with a Ledger

- Browser: Chrome/Edge/Brave on **Windows** (WebHID talks to the device directly; no usbipd
  needed for the browser).
- Device: **Kadena app open**, blind/hash signing **enabled** in the app settings (the page uses
  hash signing).
- Click *Ledger* → pick the device in the browser's HID prompt. The page derives the account at
  `m/44'/626'/0'/0/0` (`k:<device pubkey>`).
- Fund that account with `npm run fund` as above, then transfer / vote / propose — each action
  asks the device to sign a hash; verify and approve on the device.
- Devnet only: throwaway state, tiny devnet KDA. Mainnet ceremony signing stays on the pinned
  ledger-signer pipeline — never this page.

## 4. Local build instead of the live site

```bash
git clone https://github.com/Pact-Community-Organization/website && cd website
npm install && npm run build
npx serve out          # or: python3 -m http.server 8093 --directory out
```
Open `http://localhost:8093/token.html` (plain http.server needs the `.html`; `npx serve` and
GitHub Pages resolve `/token`). Same flows as above.

## What to expect when something is off

- **"Cannot reach devnet"** → devnet/api-proxy down on this machine (§0).
- **"wrong engagement code"** → a harness run reset the genesis code; re-run the seed (§0).
- **Action buttons disabled** → no wallet connected (that's the claim-only sponsorship rule).
- **"balance below proposal threshold"** → the wallet holds < 1,000 PCO; fund more.
