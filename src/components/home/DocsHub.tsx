import React from 'react';
import Link from 'next/link';
import { Book, Code, Library } from 'lucide-react';
import styles from '@/styles/home-docs-hub.module.css';

const DocsHub = () => {
  const links = [
    { 
      name: 'Pact Language Docs', 
      href: 'https://docs.pact.io/reference',
      icon: <Book size={24} color="var(--primary)" />
    },
    { 
      name: 'Pact Dev Portal', 
      href: 'https://docs.pact.io/',
      icon: <Code size={24} color="var(--primary)" />
    },
    { 
      name: 'Foundation Wiki', 
      href: 'https://github.com/Pact-Community-Organization/foundation/wiki',
      icon: <Library size={24} color="var(--primary)" />
    },
  ];

  return (
    <section className={styles.docsHub}>
      <div className={styles.content}>
        <h2>Everything you need to build with Pact.</h2>
        <div className={styles.linksGrid}>
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={styles.linkCard}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocsHub;
