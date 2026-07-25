# PCO Token — User Guide

> **Plain-language disclosure:** PCO tokens carry **no dividends, no revenue rights, and no
> monetary value** — and they are never sold. Claiming is free; votes are advisory signals that
> execute nothing on-chain. If anyone quotes a PCO price or direct-messages you a claim link,
> it is not us.

This guide covers everything a community member can do with the PCO token. Every action here is
a **community function** — administrative functions (opening rounds, granting awards, sweeping
the pool, upgrading modules) are never exposed on the website and always require the
organization's hardware-held keysets.

## 1. Choose your wallet — one active identity

The token page uses **one active wallet at a time**: claims land there, balances show for it,
votes and transfers come from it. Never two identities at once — switching wallets switches
everything. Four options:

| Option | What it is | Notes |
|---|---|---|
| **In-browser key** | A keypair generated inside your browser (the default) | Zero setup — perfect for a first claim. **Download the key backup**: the key lives only in that browser's storage. |
| **EckoWallet** | Browser extension | Must be on the site's network (see §2 note) |
| **Zelcore** | Desktop app | Log in first; the site talks to its local signing API |
| **Ledger** | Hardware, via WebHID | Chrome/Edge/Brave; Kadena app open, hash signing enabled |

## 2. Claim — free, with any wallet

Claiming is the one action whose gas is **sponsored** by the on-chain gas station — and your
wallet never signs for it (claims need no signature from the claimer; tokens can only land in
the account bound to the supplied guard). So even a Ledger claim needs no device interaction.

1. Pick the open claim round and answer its quest. Quests are published on the PCO channels
   together with the round id; the answer, normalized to lowercase, is the claim code.
2. Claim. The gas station pays the fee; tokens land in your **active wallet's** account.

On-chain rules that keep this fair: **one claim per account per round**, a fixed budget per round,
and a time window — when a round's budget is exhausted or its window closes, the round is over.

Everything beyond claiming is **self-paid**: your active wallet signs and pays a little KDA gas.

**EckoWallet network setup (devnet preview):** the preview build points at a local development
network. In EckoWallet: *Settings → Networks → add* — Name `PCO devnet`, URL `http://localhost:8090`,
Network ID `recap-development` — save it and select it as the active network, then reconnect.
(The launch build will point at Kadena mainnet, where no setup is needed.)

## 3. What is sponsored and what you pay

- **Sponsored (free for you):** the claim. Nothing else — this keeps the community gas fund an
  onboarding fund that cannot be drained by routine activity.
- **Self-paid (your wallet pays ordinary gas):** transfers, cross-chain transfers, voting,
  proposing, vote-key registration, guard rotation. Fees are tiny fractions of a KDA.

## 4. Transfers

- **Same-chain:** enter a `k:` recipient and an amount. Transfers are irreversible — check the
  recipient twice. If the recipient account does not exist yet it is created bound to the key in
  its name (that is what makes `k:` accounts safe to send to).
- **Cross-chain:** PCO lives on all 20 Kadena chains; governance lives on chain 0 (the hub).
  A cross-chain send debits your account on the source chain and, after the SPV proof settles,
  credits the target chain. The token page starts the transfer; the continuation on the target
  chain is finished automatically (Kadena's public cross-chain gas station pays that leg).

## 5. Governance — ranked-choice voting on admin-authored questions {#voting}

- **Questions come from the organization; answers come from you.** Each on-chain question
  carries 2–5 named options. The community **suggests questions on the public channels**
  (Telegram / X) and the organization puts them on-chain — an accountable public step.
- **You vote by ranking the options** in order of preference (a partial ranking is fine).
  Tallies are live **Borda scores**: with K options, your first choice earns K points per token,
  the second K−1, and so on. The leading score is the community's preference; there is no quorum
  and **no vote executes anything on-chain**.
- Voting weight is your **current hub-chain balance**; re-submitting replaces your ballot, and
  every balance decrease (transfer, cross-chain send) automatically shrinks your open ballots —
  tokens that left can never keep voting. Received tokens arrive unvoted.
- The organization can close a question early only with a **public on-chain reason**.

### Why can't holders create proposals directly? {#governance-design}

With a small global cap on open questions (which bounds gas on every transfer), open proposing
is squattable: one threshold-sized bankroll hopping between fresh accounts can fill every slot
forever, and defending against that requires stake locks plus admin cancel/seizure backstops —
at which point admin involvement is structural anyway. v1 takes honest control of question
authorship instead, keeps voting and suggesting fully open, and preserves the complete
open-proposing design (stake locks, cooldowns, cancel/seize) for a future version. The full
analysis is in the repository: `docs/GOVERNANCE-DESIGN.md`.

## 6. The voting key — vote hot, keep your wallet cold {#voting-key}

If you hold PCO in a wallet you do not want to take out for routine votes, register a
**dedicated vote key**:

- **Register:** your MAIN wallet signs one transaction (`set-vote-key`, scoped to the
  `VOTE-KEY-ADMIN` capability). On the token page, one click registers the browser's own key as
  your vote key.
- **After that:** the hot key can cast and re-cast votes for your account, paying its own tiny
  gas. Your main wallet never has to come out to vote.
- **Safety properties, enforced on-chain:**
  - The hot key can **only vote**. Transfers, rotation, claiming, and the registration itself
    all require the main guard.
  - The hot key can never re-point or clear itself — only the main wallet can.
  - Your main wallet **always keeps its own voting power**: the contract checks the main guard
    first, so a registration can never lock you out.
  - **Clear** the key any time with one main-wallet transaction (`clear-vote-key`).

## 7. Rotating an account guard {#rotate}

Named PCO accounts (accounts that are not `k:`-prefixed) can rotate to a new guard: connect a
wallet satisfying the account's **current** guard and submit the rotation (scoped `ROTATE`
capability). Protocol note: **`k:` accounts cannot rotate** — their guard is permanently bound
to the key in their name; that is exactly what makes them safe transfer targets.

## 8. Verifying everything yourself

- **Contracts:** the deployed modules byte-compare against the public repository
  ([Pact-Community-Organization/pco-token](https://github.com/Pact-Community-Organization/pco-token)) —
  the repo's verification guide shows how to run the comparison against any node.
- **Activity:** every claim, grant (with its public reason), round, vote, vote-key registration,
  and transfer emits a public on-chain event. Nothing about the program is off-ledger.

## 9. Fair play and safety

- Official rounds exist on-chain before they are announced anywhere. We never direct-message
  claim links, and there is nothing to buy — ever.
- The claim page never asks for a seed phrase. The in-browser key is generated locally; back it
  up and treat the backup like a password.
- Round budgets bound worst-case abuse; one-claim-per-account-per-round is the on-chain rule.
