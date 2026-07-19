import React from 'react';
import Link from 'next/link';
import styles from '@/styles/footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.logo}>
          <h3>Pact Community Organization</h3>
          <p>&copy; {new Date().getFullYear()} Pact Community Organization. Licensed under MIT.</p>
        </div>
        <div className={styles.links}>
          <div>
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/mission-vision">Mission & Vision</Link></li>
              <li><Link href="/contracts">Smart Contracts</Link></li>
              <li><Link href="/docs">Docs</Link></li>
              <li><Link href="/roadmap">Roadmap</Link></li>
              <li><Link href="/community">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4>Community</h4>
            <ul>
              <li><a href="https://github.com/Pact-Community-Organization" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://github.com/Pact-Community-Organization/foundation/discussions" target="_blank" rel="noopener noreferrer">Discussions</a></li>
              <li><a href="https://github.com/Pact-Community-Organization/pact-contract-catalog" target="_blank" rel="noopener noreferrer">Contract Catalog</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
