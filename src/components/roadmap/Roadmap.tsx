import React from 'react';
import Link from 'next/link';
import styles from '@/styles/roadmap.module.css';

const CATALOG = 'https://github.com/Pact-Community-Organization/pact-contract-catalog';

const shipped = [
  {
    title: 'Contract Library — nine security-reviewed templates',
    body: (
      <>
        Deployable templates for the foundations most projects need: fungible token, gas station,
        multisig treasury, vesting, DAO voting, oracle feed, property lease, an NFT marketplace, and
        a minimal starter. Every entry shipped through a blocking test suite, static analysis, and a
        documented adversarial review. <Link href="/contracts">Browse the catalog →</Link>
      </>
    ),
  },
  {
    title: 'Kadena NFT interface standard v1',
    body: (
      <>
        A normative specification, three un-upgradeable on-chain interfaces, and a runnable
        conformance suite — so independent marketplaces stay compatible by construction.{' '}
        <a href={`${CATALOG}/blob/main/contracts/standards/SPEC.md`} target="_blank" rel="noopener noreferrer">
          Read the spec →
        </a>
      </>
    ),
  },
  {
    title: 'NFT Framework',
    body: (
      <>
        One hardened ledger anchoring token identity, a conservation-asserted settlement engine, a
        composable policy set (royalties, guards, 1/1s, collections, URI rules), auctions, and
        cross-chain relocation — cleared by an adversarial red-team suite.{' '}
        <Link href="/nft">Explore the NFT docs →</Link>
      </>
    ),
  },
  {
    title: 'pact-kit 0.3.0',
    body: (
      <>
        Domain knowledge and workflow automation for Pact 5 development, packaged for AI coding
        agents.{' '}
        <a href="https://github.com/Pact-Community-Organization/pact-kit" target="_blank" rel="noopener noreferrer">GitHub</a>
        {' · '}
        <a href="https://www.npmjs.com/package/@pact-community/pact-kit" target="_blank" rel="noopener noreferrer">npm</a>
      </>
    ),
  },
  {
    title: 'Pact MCP servers',
    body: (
      <>
        mcp-pact 0.2.2 and mcp-chainweb 0.2.3 — MCP servers giving AI agents safe, auditable access
        to Pact development and Chainweb nodes, on npm and the MCP registry.{' '}
        <a href="https://github.com/Pact-Community-Organization/pact-mcp" target="_blank" rel="noopener noreferrer">GitHub</a>
        {' · '}
        <a href="https://www.npmjs.com/package/@pact-community/mcp-pact" target="_blank" rel="noopener noreferrer">npm</a>
      </>
    ),
  },
  {
    title: 'Contract Registry — the on-chain census',
    body: (
      <>
        Verbatim, read-only snapshots of contracts that already exist: standard interfaces, core
        chain infrastructure, and census-selected ecosystem modules — reference for integration and
        due diligence.{' '}
        <a href={`${CATALOG}/tree/main/contracts/registry`} target="_blank" rel="noopener noreferrer">
          Browse the registry →
        </a>
      </>
    ),
  },
  {
    title: 'Foundation & community infrastructure',
    body: (
      <>
        The organization itself: governance documentation, wiki, GitHub Discussions, contribution
        templates, and security policy — the 2025 groundwork everything above builds on.
      </>
    ),
  },
  {
    title: 'Website relaunch',
    body: <>This site: the contract catalog, NFT documentation, tooling, and this roadmap — July 2026.</>,
  },
];

const next = [
  {
    title: 'Re-publish the NFT standard and framework on-chain',
    body: (
      <>
        Once the community testnet bootstrap (namespace tooling and faucet) lands: interfaces first,
        then the framework modules, with published deployment hashes for verification.
      </>
    ),
  },
  {
    title: 'Independent reviewer sourcing for the contract library',
    body: (
      <>
        Qualifying independent reviews promote entries from self-reviewed to community-reviewed
        under the catalog&apos;s audit-status ladder — reviewing a template is the highest-leverage
        contribution the catalog accepts.
      </>
    ),
  },
  {
    title: 'Keep the registry census current',
    body: (
      <>
        New ecosystem modules catalogued verbatim as they appear, each with deployment evidence
        matching the census methodology.
      </>
    ),
  },
];

const Roadmap = () => {
  return (
    <div className={styles.roadmap}>
      <h1>Roadmap</h1>
      <p>
        What the Pact Community Organization has shipped, and the real, queued work that comes next.
        No speculative entries.
      </p>
      <p className={styles.updated}>Last updated: July 2026</p>

      <section className={styles.section}>
        <h2>Shipped</h2>
        {shipped.map((entry, index) => (
          <div key={index} className={styles.entry}>
            <h3>{entry.title}</h3>
            <p>{entry.body}</p>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>On-chain status</h2>
        <div className={`${styles.entry} ${styles.status}`}>
          <p>
            The NFT standard&apos;s three interfaces and the framework were published to the
            community testnet across all 20 chains in July 2026. A network-wide reset later removed
            everything deployed on that testnet. The code is complete and re-verified since; no PCO
            contract is currently live on a public network, and re-publication is queued behind the
            community testnet bootstrap.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Next</h2>
        {next.map((entry, index) => (
          <div key={index} className={styles.entry}>
            <h3>{entry.title}</h3>
            <p>{entry.body}</p>
          </div>
        ))}
        <p className={styles.note}>
          This roadmap is a living document — entries appear here when the work is actually queued,
          and move to Shipped when it is done.
        </p>
      </section>
    </div>
  );
};

export default Roadmap;
