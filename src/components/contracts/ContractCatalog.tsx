import React from 'react';
import styles from '@/styles/contracts.module.css';

const CATALOG =
  'https://github.com/Pact-Community-Organization/pact-contract-catalog/tree/main/contracts/library';

const contracts = [
  {
    name: 'Token (fungible)',
    description:
      'A hardened fungible-v2 + fungible-xchain-v1 token: coin-pattern guard enforcement, governed mint, reserved-name protection, cross-chain step semantics.',
    repository: `${CATALOG}/token-fungible`,
    auditState: 'Self-reviewed',
    version: '0.2.0',
  },
  {
    name: 'Gas Station',
    description:
      'Drain-defended gas sponsorship: bounds and accounting against actual chain gas, never signer-supplied values, with a per-user on-chain allowlist.',
    repository: `${CATALOG}/gas-station`,
    auditState: 'Self-reviewed',
    version: '1.0.0',
  },
  {
    name: 'Multisig Treasury',
    description:
      'M-of-N treasury: KDA in a capability-guarded vault, asynchronous propose/approve/execute, rotation that revokes stale approvals.',
    repository: `${CATALOG}/multisig-treasury`,
    auditState: 'Self-reviewed',
    version: '1.0.0',
  },
  {
    name: 'Vesting',
    description:
      'Cliff + linear vesting, escrowed upfront: the beneficiary never depends on the funder’s solvency; revoke returns only the unvested part.',
    repository: `${CATALOG}/vesting`,
    auditState: 'Self-reviewed',
    version: '1.0.0',
  },
  {
    name: 'DAO Voting',
    description:
      'Membership voting with quorum and threshold: per-proposal snapshot of the passage bar, rotation revokes a compromised member’s in-flight votes.',
    repository: `${CATALOG}/dao-voting`,
    auditState: 'Self-reviewed',
    version: '1.0.0',
  },
  {
    name: 'Oracle Feed',
    description:
      'Median data/price feed with fail-closed consumption: chain-assigned timestamps, staleness windows, publisher rotation as instant revocation.',
    repository: `${CATALOG}/oracle-feed`,
    auditState: 'Self-reviewed',
    version: '1.0.0',
  },
  {
    name: 'Property Lease',
    description:
      'Rental rails: escrowed deposit, rent buckets with a revenue split, party-authenticated notice, vault conservation across every mutating path.',
    repository: `${CATALOG}/property-lease`,
    auditState: 'Self-reviewed',
    version: '1.0.0',
  },
  {
    name: 'Royalty Sale (NFT marketplace)',
    description:
      'A conservation-checked NFT marketplace: 1-of-1 tokens with immutable creator royalties, state-bound listing economics, one atomic settlement. Reference implementation of the Kadena NFT interface standard.',
    repository: `${CATALOG}/royalty-sale`,
    auditState: 'Self-reviewed',
    version: '1.0.0',
  },
  {
    name: 'Hello World',
    description: 'The minimal starter: module shape, governance, and a real test suite.',
    repository: `${CATALOG}/hello-world`,
    auditState: 'Self-reviewed',
    version: '1.0.0',
  },
];

const ContractCatalog = () => {
  return (
    <div className={styles.catalog}>
      <h1>Smart Contract Catalog</h1>
      <div className={styles.grid}>
        {contracts.map((contract, index) => (
          <div key={index} className={styles.card}>
            <h2>{contract.name}</h2>
            <p>{contract.description}</p>
            <p><strong>Version:</strong> {contract.version}</p>
            <p><strong>Status:</strong> {contract.auditState}</p>
            <a href={contract.repository} target="_blank" rel="noopener noreferrer">Repository</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractCatalog;
