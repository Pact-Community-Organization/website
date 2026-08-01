import React from 'react';
import Link from 'next/link';
import styles from '@/styles/token.module.css';

export const metadata = {
  title: 'PCO Token — User Guide',
  description:
    'How to claim, transfer, vote, register a voting key, rotate a guard, and verify the PCO community token — every community function, step by step.',
};

const REPO = 'https://github.com/Pact-Community-Organization/pco-token';
const WIKI = 'https://github.com/Pact-Community-Organization/website/wiki/PCO-Token-Guide';

export default function TokenGuide() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>PCO Token — User Guide</h1>
      </div>

      <p className={styles.disclosure}>
        <strong>Plain-language disclosure:</strong> PCO tokens carry no dividends, no revenue
        rights, and no monetary value — and they are never sold. Claiming is free; votes are
        advisory signals that execute nothing on-chain. If anyone quotes a PCO price or
        direct-messages you a claim link, it is not us.
      </p>

      <div className={styles.info}>
        <p>
          This guide covers everything a community member can do with the PCO token. Every action
          here is a <b>community function</b> — administrative functions (opening rounds, granting
          awards, sweeping the pool, upgrading modules) are never exposed on the website and always
          require the organization&apos;s hardware-held keysets.
        </p>

        <h2>1 · Choose your wallet — one active identity</h2>
        <p>
          The <Link href="/token">token page</Link> uses <b>one active wallet at a time</b>: claims
          land there, balances show for it, votes and transfers come from it. Never two identities
          at once — switching wallets switches everything. Three options:
        </p>
        <ul>
                    <li><b>EckoWallet</b> — browser extension. Must be on the site&apos;s network (see below).</li>
          <li><b>Zelcore</b> — desktop app. Log in first; the site talks to its local signing API.</li>
          <li><b>Ledger</b> — hardware, via WebHID (Chrome/Edge/Brave; Kadena app open). The page asks the device to <b>display</b> the transaction so you can check the recipient and amount on the device itself. Leave <b>blind signing off</b>: if the device shows only a hash it cannot tell you what you are approving, and this page will warn you before it continues.</li>
        </ul>

        <h2>2 · Claim — free, with any wallet</h2>
        <p>
          Claiming is the one action whose gas is <b>sponsored</b> by the on-chain gas station, so
          <b>you need no KDA to claim</b>. Your wallet signs one thing: permission for the station to
          pay the fee. It never authorises a transfer of your funds, and the tokens can only land in
          the account bound to the guard supplied with the claim.
        </p>
        <ul>
          <li>Pick the open claim round and answer its quest. Quests are published on the PCO channels together with the round id; the answer, normalized to lowercase, is the claim code.</li>
          <li>Claim. The gas station pays the fee; tokens land in your <b>active wallet&apos;s</b> account.</li>
        </ul>
        <p>
          On-chain rules that keep this fair: <b>one claim per account per round</b>, a fixed budget
          per round, and a time window — when a round&apos;s budget is exhausted or its window
          closes, the round is over. Everything beyond claiming is <b>self-paid</b>: your active
          wallet signs and pays a little KDA gas.
        </p>
        <p>
          <b>Wallet setup:</b> none needed. PCO is deployed on <b>Kadena mainnet</b>, so any
          Kadena wallet already points at the right network — just connect. PCO lives in the
          namespace{' '}
          <span className={styles.mono}>n_57fcd6f7b72e8949af51a8d6f17fe12cc7719d10</span>, a{' '}
          <i>principal</i> namespace whose name is derived from the governance keyset, so it cannot
          be impersonated by a look-alike.
        </p>

        <h2>3 · What is sponsored and what you pay</h2>
        <ul>
          <li><b>Sponsored (free for you):</b> the claim — the community gas fund exists to onboard newcomers who hold no KDA. It is capped at a fixed daily budget that refills each day, so it stays an onboarding fund.</li>
          <li><b>Self-paid (ordinary gas from your wallet):</b> transfers, cross-chain transfers, voting, vote-key registration, guard rotation. Fees are tiny fractions of a KDA. (Questions are authored by the organization, not by holders — see below.)</li>
        </ul>

        <h2>4 · Transfers</h2>
        <ul>
          <li><b>Same-chain:</b> enter a <span className={styles.mono}>k:</span> recipient and an amount. Transfers are irreversible — check the recipient twice. A not-yet-existing recipient account is created bound to the key in its name; that is what makes <span className={styles.mono}>k:</span> accounts safe to send to.</li>
          <li><b>Cross-chain sends are not offered here, on purpose.</b> The token supports them, but a cross-chain move is a two-step transfer: the first step debits the chain you are on, and the credit only lands when someone submits the second step with a proof on the target chain. This page does not do that, so offering it would take your PCO and leave it in a half-finished transfer. Claiming, awards and voting all live on chain 0 in any case, so there is nothing on another chain for PCO to do yet.</li>
        </ul>

        <h2 id="voting">5 · Governance — ranked-choice voting on admin-authored questions</h2>
        <ul>
          <li><b>Questions come from the organization; answers come from you.</b> Each on-chain question carries 2–5 named options. The community <b>suggests questions on the public channels</b> (Telegram / X) and the organization puts them on-chain — an accountable public step.</li>
          <li><b>You vote by ranking the options</b> in order of preference. A partial ranking is fine and costs you nothing — ranking more options can never hurt your favourite.</li>
          <li><b>The result is head-to-head.</b> For every pair of options the contract records how much voting weight prefers one to the other, and the winner is the option that beats every other. If none does, that is published as a split rather than broken by an arbitrary rule. A Borda points row is shown too, but only as a completeness diagnostic — points reward ranking fewer options, so they are not the result.</li>
          <li>Voting weight is your <b>current hub-chain balance</b>, and re-submitting replaces your ballot. If your balance ever falls <b>below</b> the weight recorded on an open ballot, that ballot is automatically trimmed to what you still hold — so you can never keep voting with tokens you no longer have. A decrease that still leaves you above your recorded weight changes nothing. Received tokens arrive unvoted.</li>
          <li>The organization can close a question early only with a <b>public on-chain reason</b>.</li>
        </ul>
        <h2 id="governance-design">Why can&apos;t holders create proposals directly?</h2>
        <p>
          With a small global cap on open questions (which bounds gas on every transfer), open
          proposing is squattable: one threshold-sized bankroll hopping between fresh accounts can
          fill every slot forever, and defending that requires stake locks plus admin
          cancel/seizure backstops — at which point admin involvement is structural anyway. v1
          takes honest control of question authorship instead, keeps voting and suggesting fully
          open, and preserves the complete open-proposing design for a future version. Full
          analysis: <a href={`${REPO}/blob/main/docs/GOVERNANCE-DESIGN.md`}>GOVERNANCE-DESIGN.md</a>.
        </p>

        <h2 id="voting-key">6 · The voting key — vote hot, keep your wallet cold</h2>
        <p>
          If you hold PCO in a wallet you do not want to take out for routine votes, register a{' '}
          <b>dedicated vote key</b>:
        </p>
        <ul>
          <li><b>Register:</b> your MAIN wallet signs one transaction (<span className={styles.mono}>set-vote-key</span>, scoped to the <span className={styles.mono}>VOTE-KEY-ADMIN</span> capability). On the token page, one click registers the browser&apos;s own key as your vote key.</li>
          <li><b>After that:</b> the hot key can cast and re-cast votes for your account, paying its own tiny gas. Your main wallet never has to come out to vote.</li>
          <li><b>Safety, enforced on-chain:</b> the hot key can <b>only vote</b> — transfers, rotation, claiming, and the registration itself all require the main guard; the hot key can never re-point or clear itself; the contract checks the main guard first, so a registration can never lock you out; <b>clear</b> the key any time with one main-wallet transaction.</li>
        </ul>

        <h2 id="rotate">7 · Rotating an account guard</h2>
        <p>
          Named PCO accounts (not <span className={styles.mono}>k:</span>-prefixed) can rotate to a
          new guard: connect a wallet satisfying the account&apos;s <b>current</b> guard and submit
          the rotation (scoped <span className={styles.mono}>ROTATE</span> capability). Protocol
          note: <b><span className={styles.mono}>k:</span> accounts cannot rotate</b> — their guard
          is permanently bound to the key in their name; that is exactly what makes them safe
          transfer targets.
        </p>

        <h2>8 · Verifying everything yourself</h2>
        <ul>
          <li><b>Contracts:</b> the deployed modules byte-compare against the <a href={REPO}>public repository</a> — its verification guide shows how to run the comparison against any node.</li>
          <li><b>Activity:</b> every claim, grant (with its public reason), round, vote, vote-key registration, and transfer emits a public on-chain event. Nothing about the program is off-ledger.</li>
        </ul>

        <h2>9 · Fair play and safety</h2>
        <ul>
          <li>Official rounds exist on-chain before they are announced anywhere. We never direct-message claim links, and there is nothing to buy — ever.</li>
          <li>The claim page never asks for a seed phrase or a private key, and never generates one for you. Every signature comes from a wallet you already control. Any page asking you to paste key material is not ours — including one that looks exactly like this.</li>
          <li>Round budgets bound worst-case abuse; one-claim-per-account-per-round is the on-chain rule.</li>
        </ul>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/token">← back to the token page</Link> · <a href={WIKI}>this guide on the wiki</a> · <a href={REPO}>contracts on GitHub</a>
        </p>
      </div>
    </div>
  );
}
