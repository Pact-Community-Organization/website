import React from 'react';
import Link from 'next/link';
import styles from '@/styles/nft.module.css';
import PersonaNav from './PersonaNav';

const CATALOG = 'https://github.com/Pact-Community-Organization/pact-contract-catalog';

const personas = [
  {
    href: '/nft/creators',
    title: 'Creators',
    description:
      'Mint NFTs whose royalties are enforced by the chain itself — on every marketplace, on every chain, forever.',
  },
  {
    href: '/nft/sellers',
    title: 'Sellers',
    description:
      'List at a fixed price or run an auction. The economics you sign are the economics that settle — nobody can change them after you list.',
  },
  {
    href: '/nft/buyers',
    title: 'Buyers',
    description:
      'You sign the exact price and nothing else. The contract splits the payment and proves the math on every sale.',
  },
  {
    href: '/nft/marketplaces',
    title: 'Build a marketplace',
    description:
      'Launch your own NFT market — usually without deploying a single contract. Your fee is paid by the settlement engine itself.',
  },
];

const NftOverview = () => {
  return (
    <div className={styles.page}>
      <h1>NFTs on Pact</h1>
      <p className={styles.lede}>
        The PCO publishes an open NFT standard and a complete, audited NFT framework for the Kadena
        chainweb — built so that creators keep their royalties, buyers cannot be cheated, and any
        business can open a marketplace. This is the documentation for all of it.
      </p>

      <PersonaNav current="/nft" />

      <section>
        <h2>Two building blocks</h2>
        <div className={styles.archGrid}>
          <div className={styles.archBox}>
            <h3>The interface standard v1</h3>
            <p>
              Three frozen on-chain interfaces (<code>nft-asset-v1</code>, <code>nft-market-v1</code>,{' '}
              <code>nft-xchain-v1</code>) plus a normative specification. Marketplaces that implement
              them are <strong>compatible</strong>: one wallet, one indexer, one aggregator works
              across all of them.
            </p>
            <ul>
              <li>For teams building standalone marketplace modules</li>
              <li>Runnable conformance suite with adversarial tests</li>
              <li>Audited MIT reference implementation to copy</li>
            </ul>
          </div>
          <div className={styles.archBox}>
            <h3>
              The <code>nft</code> framework
            </h3>
            <p>
              A shared-ledger NFT ecosystem: one hardened ledger anchors every token, one settlement
              engine pays every sale, and composable policies carry each token&apos;s rules — royalties,
              guards, editions, collections — with it wherever it goes.
            </p>
            <ul>
              <li>Marketplaces need no contract of their own</li>
              <li>Auctions built in (ascending and declining-price)</li>
              <li>Tokens move between chains, rules travel along</li>
            </ul>
          </div>
          <div className={`${styles.archBox} ${styles.archBase}`}>
            <h3>One owner: the community</h3>
            <p>
              Both are published on-chain by the PCO in a single namespace per network, and both are
              open source in the{' '}
              <a href={CATALOG} target="_blank" rel="noopener noreferrer">
                contract catalog
              </a>
              . Deployed interfaces cannot be upgraded — what is published is the standard,
              permanently.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>The promises the code makes</h2>
        <ul>
          <li>
            <strong>Nothing fails open.</strong> Every guard and account is required and validated —
            a malformed input aborts, it never degrades to &quot;anyone can transfer&quot;.
          </li>
          <li>
            <strong>One settlement, with the math checked.</strong> Every sale settles in a single
            step that asserts <code>money in = money out</code> to the currency&apos;s full precision.
            No stacked hook can skim.
          </li>
          <li>
            <strong>Economics live on-chain, never in the buy transaction.</strong> Price, royalty,
            and fees bind when the seller signs the listing. Nothing a buyer (or a malicious
            frontend) sends can change them.
          </li>
          <li>
            <strong>Royalties are real.</strong> A creator&apos;s cut is enforced at settlement — on
            every marketplace, through every auction, and across chain moves. There is no
            royalty-free exit unless the creator allowed one.
          </li>
          <li>
            <strong>Identity cannot be forged.</strong> A token&apos;s id is derived from its
            creator&apos;s guard: nobody can mint a token that claims to be someone else&apos;s, and
            nothing can be minted twice.
          </li>
        </ul>
      </section>

      <section>
        <h2>Pick your path</h2>
        <div className={styles.cardGrid}>
          {personas.map((persona) => (
            <Link key={persona.href} href={persona.href} className={styles.card}>
              <h3>{persona.title} →</h3>
              <p>{persona.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>Deployment status</h2>
        <div className={styles.callout}>
          <p>
            The standard and framework are complete, audited, and open source today. They were
            published to the community testnet across all 20 chains in July 2026; a network-wide
            reset later removed everything on that testnet, and re-publication is pending the
            network&apos;s return. Because the namespace and module hashes are deterministic, the
            catalog records the expected values — when re-published, anyone can verify every module
            with <code>describe-module</code> against those tables.
          </p>
        </div>
      </section>

      <section>
        <h2>Go deeper</h2>
        <div className={styles.cardGrid}>
          <a
            className={styles.card}
            href={`${CATALOG}/blob/main/contracts/standards/SPEC.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>The specification →</h3>
            <p>The normative rules (S1–S6) every conforming marketplace must obey, and why each one exists.</p>
          </a>
          <a
            className={styles.card}
            href={`${CATALOG}/blob/main/contracts/nft/QUICKSTART.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>Marketplace quickstart →</h3>
            <p>Launch your own market, step by step — the companion to the Build-a-marketplace page here.</p>
          </a>
          <a
            className={styles.card}
            href={`${CATALOG}/blob/main/contracts/nft/TECHNICAL.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>Technical reference →</h3>
            <p>Every mechanism down to the code: identity, policies, settlement, auctions, cross-chain.</p>
          </a>
        </div>
      </section>
    </div>
  );
};

export default NftOverview;
