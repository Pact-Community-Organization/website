import React from 'react';
import styles from '@/styles/docs.module.css';

const links = [
  {
    title: 'Pact Documentation',
    url: 'https://docs.pact.io/reference',
    description: 'The official documentation for the Pact smart contract language.',
  },
  {
    title: 'Pact Developer Portal',
    url: 'https://docs.pact.io/',
    description: 'The official developer portal for the Pact platform.',
  },
  {
    title: 'Foundation Documentation',
    url: 'https://github.com/Pact-Community-Organization/foundation/wiki',
    description: 'Documentation specific to the Pact Community Organization.',
  },
  {
    title: 'Pact Tutorials',
    url: 'https://docs.pact.io/quickstart',
    description: 'A collection of tutorials for learning Pact.',
  },
];

const DocsHub = () => {
  return (
    <div className={styles.hub}>
      <h1>Documentation Hub</h1>
      <p>Everything you need to build with Pact, in one place.</p>
      <div className={styles.grid}>
        {links.map((link, index) => (
          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.card}>
            <h2>{link.title} &rarr;</h2>
            <p>{link.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DocsHub;
