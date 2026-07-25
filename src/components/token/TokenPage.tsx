import React from 'react';
import Link from 'next/link';
import styles from '@/styles/token.module.css';
import TokenApp from './TokenApp';

const REPO = 'https://github.com/Pact-Community-Organization/pco-token';

export default function TokenPage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>The PCO Community Token</h1>
      </div>

      <p className={styles.disclosure}>
        <strong>Free and valueless by design.</strong> PCO tokens carry no dividends, no revenue
        rights, and no monetary value — and they are never sold. Claiming is free; votes are
        advisory signals about community tooling direction and execute nothing on-chain. If anyone
        quotes a PCO price or direct-messages you a claim link, it is not us.
      </p>

      <div className={styles.info}>
        <h2>What it is</h2>
        <p>
          PCO is the community&apos;s participation token: a way to recognize the people who show up
          — answering quests, contributing code and documentation, keeping the ecosystem&apos;s tools
          alive — and to practice running real on-chain operations (multi-device custody, 20-chain
          deployments, key rotation) in public, on a deliberately low-stakes vehicle.
        </p>

        <h2>How to use this page</h2>
        <ul>
          <li>
            <b>Claim (no wallet, no fee).</b> A key is created in your browser and an on-chain gas
            station pays the transaction fee — so claiming needs no wallet and no KDA. Pick the open
            round, answer its quest, and claim.
          </li>
          <li>
            <b>Do more (connect a wallet).</b> Transferring, voting, and proposing are <i>not</i>
            gas-sponsored — only claiming is. To do them you connect a Kadena wallet holding a little
            KDA (it signs and pays). On this preview the in-browser test key is the easiest way; on
            mainnet you would use EckoWallet, Zelcore, or a Ledger.
          </li>
          <li>
            <b>Everything is verifiable.</b> The deployed contracts byte-compare against the{' '}
            <a href={REPO}>public repository</a>, and every claim, grant, round, and vote lives in
            public on-chain events.
          </li>
        </ul>

        <h2>Fair play</h2>
        <ul>
          <li>One claim per account per round is the on-chain rule.</li>
          <li>Round budgets and grant caps bound every event — when a budget is exhausted, the round is over.</li>
          <li>Official rounds exist on-chain before they exist anywhere else. We never direct-message claim links.</li>
        </ul>
      </div>

      <TokenApp />

      <p className={styles.muted} style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/">← back to pact-community.org</Link> · <a href={REPO}>contracts &amp; verification guide</a>
      </p>
    </div>
  );
}
