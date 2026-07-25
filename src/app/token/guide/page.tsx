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

        <h2>1 · Claiming — free, no wallet, no fee</h2>
        <p>
          Claiming is the one action whose gas is <b>sponsored</b> by the on-chain gas station, so a
          complete newcomer with no KDA and no wallet can receive their first tokens.
        </p>
        <ul>
          <li>Open the <Link href="/token">token page</Link>. A fresh keypair is generated <b>inside your browser</b> (it never leaves it).</li>
          <li><b>Download the key backup</b> — the key lives only in that browser&apos;s storage; clearing site data deletes it, and the backup file is the only way to restore it.</li>
          <li>Pick the open claim round and answer its quest. Quests are published on the PCO channels together with the round id; the answer, normalized to lowercase, is the claim code.</li>
          <li>Claim. The gas station pays the fee; tokens land in the account bound to your browser key.</li>
        </ul>
        <p>
          On-chain rules that keep this fair: <b>one claim per account per round</b>, a fixed budget
          per round, and a time window — when a round&apos;s budget is exhausted or its window
          closes, the round is over.
        </p>

        <h2>2 · Wallets — the four ways to sign</h2>
        <p>
          Everything beyond claiming is <b>self-paid</b>: you sign with a wallet that holds a little
          KDA for gas. The token page supports four options:
        </p>
        <ul>
          <li><b>In-browser test key</b> — the same key that claimed. Simplest; fund its <span className={styles.mono}>k:</span> account with a little KDA to act.</li>
          <li><b>EckoWallet</b> — browser extension. The wallet must be on the site&apos;s network (see below).</li>
          <li><b>Zelcore</b> — desktop app. Log in first; the site talks to its local signing API.</li>
          <li><b>Ledger</b> — hardware, via WebHID (Chrome/Edge/Brave; hash signing enabled on-device).</li>
        </ul>
        <p>
          <b>EckoWallet network setup (devnet preview):</b> this preview build points at a local
          development network. In EckoWallet: <i>Settings → Networks → add</i> — Name{' '}
          <span className={styles.mono}>PCO devnet</span>, URL{' '}
          <span className={styles.mono}>http://localhost:8090</span>, Network ID{' '}
          <span className={styles.mono}>recap-development</span> — save it, select it as the active
          network, then reconnect. (The launch build will point at Kadena mainnet, where no setup is
          needed.)
        </p>

        <h2>3 · What is sponsored and what you pay</h2>
        <ul>
          <li><b>Sponsored (free for you):</b> the claim. Nothing else — this keeps the community gas fund an onboarding fund that cannot be drained by routine activity.</li>
          <li><b>Self-paid (ordinary gas from your wallet):</b> transfers, cross-chain transfers, voting, proposing, vote-key registration, guard rotation. Fees are tiny fractions of a KDA.</li>
        </ul>

        <h2>4 · Transfers</h2>
        <ul>
          <li><b>Same-chain:</b> enter a <span className={styles.mono}>k:</span> recipient and an amount. Transfers are irreversible — check the recipient twice. A not-yet-existing recipient account is created bound to the key in its name; that is what makes <span className={styles.mono}>k:</span> accounts safe to send to.</li>
          <li><b>Cross-chain:</b> PCO lives on all 20 Kadena chains; governance lives on chain 0 (the hub). A cross-chain send debits the source chain and, after the SPV proof settles, credits the target chain — the continuation is finished automatically.</li>
        </ul>

        <h2>5 · Governance — advisory voting</h2>
        <ul>
          <li>Voting weight is your <b>current hub-chain balance</b> at the moment you vote; re-voting replaces your previous vote in place.</li>
          <li>Every balance decrease (transfer out, cross-chain send) automatically releases the moved weight from your open votes — tokens that left can never keep voting. Received tokens arrive unvoted.</li>
          <li>Anyone holding <b>1,000 PCO</b> may open a proposal (at most 3 open community-wide). Proposals are pure signals: <b>no vote executes anything on-chain</b>. There is no quorum; tallies and distinct-voter counts are public chain state.</li>
        </ul>

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
          <li>The claim page never asks for a seed phrase. The in-browser key is generated locally; back it up and treat the backup like a password.</li>
          <li>Round budgets bound worst-case abuse; one-claim-per-account-per-round is the on-chain rule.</li>
        </ul>

        <p style={{ marginTop: '2rem' }}>
          <Link href="/token">← back to the token page</Link> · <a href={WIKI}>this guide on the wiki</a> · <a href={REPO}>contracts on GitHub</a>
        </p>
      </div>
    </div>
  );
}
