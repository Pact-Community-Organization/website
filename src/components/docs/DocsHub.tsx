import React from 'react';
import styles from '@/styles/docs.module.css';

const links = [
  {
    title: 'Pact Documentation (canonical)',
    url: 'https://github.com/kda-community/pact-5',
    description: 'Canonical Pact language documentation and examples (migrated).',
  },
  {
    title: 'Pact Developer Repository',
    url: 'https://github.com/kda-community/pact-5',
    description: 'Developer resources and examples hosted in the Pact-5 repository.',
  },
  {
    title: 'Foundation Documentation',
    url: 'https://github.com/Pact-Community-Organization/foundation/wiki',
    description: 'Documentation specific to the Pact Community Organization.',
  },
  {
    title: 'Pact Tutorials',
    url: 'https://github.com/kda-community/pact-5',
    description: 'Tutorials and quickstarts centralized in the Pact-5 repository.',
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
