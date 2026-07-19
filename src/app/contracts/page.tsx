import React from 'react';
import ContractCatalog from '@/components/contracts/ContractCatalog';

export const metadata = {
  title: 'Smart Contract Catalog',
};
import styles from '@/styles/contracts.module.css';

const ContractsPage = () => {
  return (
    <div className={styles.container}>
      <ContractCatalog />
    </div>
  );
};

export default ContractsPage;
