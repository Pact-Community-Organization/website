import React from 'react';
import styles from '@/styles/docs.module.css';

const links = [
  {
    title: 'NFT Documentation',
    url: '/nft',
    description:
      'The PCO NFT standard and framework — guides for creators, sellers, buyers, and businesses building their own marketplace.',
    internal: true,
  },
  {
    title: 'Pact Documentation',
    url: 'https://docs.kadena.io/smart-contract-dev',
    description: 'Writing smart contracts in the Pact language — the official Kadena documentation.',
  },
  {
    title: 'Kadena Developer Portal',
    url: 'https://docs.kadena.io/',
    description: 'The official Kadena developer documentation portal.',
  },
  {
    title: 'Foundation Documentation',
    url: 'https://github.com/Pact-Community-Organization/foundation/wiki',
    description: 'Documentation specific to the Pact Community Organization.',
  },
  {
    title: 'Pact Tutorials',
    url: 'https://docs.kadena.io/quickstart',
    description: 'Quickstart guides for building on Kadena with Pact.',
  },
];

const DocsHub = () => {
  return (
    <div className={styles.hub}>
      <h1>Documentation Hub</h1>
      <p>Everything you need to build with Pact, in one place.</p>
      <div className={styles.grid}>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target={link.internal ? undefined : '_blank'}
            rel={link.internal ? undefined : 'noopener noreferrer'}
            className={styles.card}
          >
            <h2>{link.title} &rarr;</h2>
            <p>{link.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DocsHub;
