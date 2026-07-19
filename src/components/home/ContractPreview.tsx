import React from 'react';
import Link from 'next/link';
import { FileCode, ShieldCheck, Handshake } from 'lucide-react';
import styles from '@/styles/contract-preview.module.css';

const ContractPreview = () => {
  const CATALOG =
    'https://github.com/Pact-Community-Organization/pact-contract-catalog/tree/main/contracts/library';
  const contracts = [
    {
      name: 'Fungible Token',
      description: 'A hardened fungible-v2 + fungible-xchain-v1 token template: coin-pattern guard enforcement, governed mint, and cross-chain transfer semantics.',
      icon: <FileCode size={24} color="var(--primary)" />,
      link: `${CATALOG}/token-fungible`
    },
    {
      name: 'NFT Marketplace',
      description: 'A conservation-checked NFT marketplace with immutable creator royalties — the reference implementation of the Kadena NFT interface standard.',
      icon: <ShieldCheck size={24} color="var(--primary)" />,
      link: `${CATALOG}/royalty-sale`
    },
    {
      name: 'DAO Voting',
      description: 'Membership voting with quorum and threshold, per-proposal snapshots of the passage bar, and rotation that revokes in-flight votes.',
      icon: <Handshake size={24} color="var(--primary)" />,
      link: `${CATALOG}/dao-voting`
    },
  ];

  return (
    <section className={styles.contractPreview}>
      <div className={styles.content}>
        <h2>Featured Smart Contracts</h2>
        <p>
          Explore a curated collection of security-reviewed smart contract templates — every entry ships with a blocking test suite, static analysis, and a documented adversarial review.
        </p>
        <div className={styles.cardGrid}>
          {contracts.map((contract, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardHeader}>
                {contract.icon}
                <h3>{contract.name}</h3>
              </div>
              <p>{contract.description}</p>
              <Link href={contract.link} target="_blank" rel="noopener noreferrer">
                View Contract →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContractPreview;
