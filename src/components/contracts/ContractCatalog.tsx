import React from 'react';
import styles from '@/styles/contracts.module.css';

const contracts = [
  {
    name: 'Sample Contract 1',
    description: 'A sample contract for demonstration purposes.',
    repository: 'https://github.com/pact-community/sample-contract-1',
    auditState: 'Audited',
    version: '1.0.0',
  },
  {
    name: 'Sample Contract 2',
    description: 'Another sample contract.',
    repository: 'https://github.com/pact-community/sample-contract-2',
    auditState: 'In Review',
    version: '0.9.0',
  },
  {
    name: 'Sample Contract 3',
    description: 'A third sample contract.',
    repository: 'https://github.com/pact-community/sample-contract-3',
    auditState: 'Not Audited',
    version: '0.1.0',
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
            <a href={contract.repository} target="_blank" rel="noopener noreferrer">
              Repository
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractCatalog;
