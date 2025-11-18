import React from 'react';
import styles from '@/styles/docs.module.css';

const links = [
  {
    title: 'Pact Documentation',
    url: 'https://pact-language.readthedocs.io/en/stable/',
    description: 'The official documentation for the Pact smart contract language.',
  },
  {
    title: 'Kadena Developer Portal',
    url: 'https://docs.kadena.io/',
    description: 'The official developer portal for the Kadena platform.',
  },
  {
    title: 'Foundation Documentation',
    url: '/docs',
    description: 'Documentation specific to the Kadena Pact Community Foundation.',
  },
  {
    title: 'Pact Tutorials',
    url: 'https://pactlang.org/tutorials',
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
