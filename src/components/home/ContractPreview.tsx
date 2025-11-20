import React from 'react';
import Link from 'next/link';
import { FileCode, ShieldCheck, Handshake } from 'lucide-react';
import styles from '@/styles/contract-preview.module.css';

const ContractPreview = () => {
  const contracts = [
    { 
      name: 'Fungible Token', 
      description: 'A standard interface for fungible tokens, inspired by ERC-20. Includes functions for transfers, allowances, and balance queries.',
      icon: <FileCode size={24} color="var(--primary)" />,
      link: '/contracts/fungible-token'
    },
    { 
      name: 'NFT Marketplace', 
      description: 'A secure and audited marketplace for buying, selling, and trading non-fungible tokens (NFTs) using Pact.',
      icon: <ShieldCheck size={24} color="var(--primary)" />,
      link: '/contracts/nft-marketplace'
    },
    { 
      name: 'DAO Governance', 
      description: 'A modular framework for creating and managing Decentralized Autonomous Organizations (DAOs) with on-chain voting.',
      icon: <Handshake size={24} color="var(--primary)" />,
      link: '/contracts/dao-governance'
    },
  ];

  return (
    <section className={styles.contractPreview}>
      <div className={styles.content}>
        <h2>Featured Smart Contracts</h2>
        <p>
          Explore a curated collection of audited, community-vetted smart contracts ready for use in your projects.
        </p>
        <div className={styles.cardGrid}>
          {contracts.map((contract, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardHeader}>
                {contract.icon}
                <h3>{contract.name}</h3>
              </div>
              <p>{contract.description}</p>
              <Link href={contract.link}>View Contract →</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContractPreview;
