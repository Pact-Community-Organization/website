import React from 'react';
import styles from '@/styles/home.module.css';

const ContractPreview = () => {
  // TODO: Replace with dynamic data
  const contracts = [
    { name: 'Contract 1', description: 'A brief description of contract 1.' },
    { name: 'Contract 2', description: 'A brief description of contract 2.' },
    { name: 'Contract 3', description: 'A brief description of contract 3.' },
  ];

  return (
    <section className={styles.contractPreview}>
      <h2>Featured Smart Contracts</h2>
      <div className={styles.cardGrid}>
        {contracts.map((contract, index) => (
          <div key={index} className={styles.card}>
            <h3>{contract.name}</h3>
            <p>{contract.description}</p>
            <a href="#">View Contract →</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContractPreview;
