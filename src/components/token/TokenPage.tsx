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
            <b>Step 1 — choose your wallet.</b> One active wallet drives everything on the page:
            claims land there, balances show for it, votes and transfers come from it. The in-browser
            key needs zero setup (perfect for a first claim); or pick EckoWallet, Zelcore, or a
            Ledger. Never two identities at once — switching wallets switches everything.
          </li>
          <li>
            <b>Step 2 — claim, free.</b> The on-chain gas station pays the claim fee and your wallet
            never signs for it — claiming is free with any wallet. Everything else (transfers,
            ranked-choice voting) is <i>not</i> sponsored: your active wallet signs and pays
            ordinary gas. On-chain questions are admin-authored — suggest yours on the public
            channels and the organization makes it official.
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

        <h2>Documentation</h2>
        <ul>
          <li>
            <b><Link href="/token/guide">The user guide</Link></b> — step-by-step: claiming, wallet
            setup (all four options, including the devnet network for EckoWallet), transfers,
            voting, the <Link href="/token/guide#voting-key">voting key</Link>, guard{' '}
            <Link href="/token/guide#rotate">rotation</Link>, and how to verify everything yourself.
          </li>
          <li>
            <a href="https://github.com/Pact-Community-Organization/website/wiki/PCO-Token-Guide">The same guide on the wiki</a> — for reading outside the site.
          </li>
          <li>
            <a href={REPO}>The contracts on GitHub</a> — source of truth: modules, test suites, and
            the verification guide for byte-comparing what is deployed against the repository.
          </li>
        </ul>
      </div>

      <TokenApp />

      <p className={styles.muted} style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link href="/">← back to pact-community.org</Link> · <a href={REPO}>contracts &amp; verification guide</a>
      </p>
    </div>
  );
}
