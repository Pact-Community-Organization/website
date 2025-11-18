import React from 'react';
import DocsHub from '@/components/docs/DocsHub';
import styles from '@/styles/docs.module.css';

const DocsPage = () => {
  return (
    <div className={styles.container}>
      <DocsHub />
    </div>
  );
};

export default DocsPage;
