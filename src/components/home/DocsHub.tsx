import React from 'react';
import styles from '@/styles/home.module.css';

const DocsHub = () => {
  // TODO: Replace with finalized URLs
  const links = [
    { name: 'Pact Documentation', href: '#' },
    { name: 'Kadena Developer Portal', href: '#' },
    { name: 'Foundation Documentation', href: '#' },
  ];

  return (
    <section className={styles.docsHub}>
      <h2>Everything you need to build with Pact, in one place.</h2>
      <div className={styles.linksGrid}>
        {links.map((link, index) => (
          <a key={index} href={link.href} className={styles.linkCard}>
            {link.name}
          </a>
        ))}
      </div>
    </section>
  );
};

export default DocsHub;
