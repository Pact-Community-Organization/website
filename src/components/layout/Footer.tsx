import React from 'react';
import Link from 'next/link';
import styles from '@/styles/footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.logo}>
          <h3>Kadena Pact Community Foundation</h3>
          <p>&copy; {new Date().getFullYear()} Kadena Pact Community Foundation. Licensed under MIT.</p>
        </div>
        <div className={styles.links}>
          <div>
            <h4>Navigation</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/mission-vision">Mission & Vision</Link></li>
              <li><Link href="/contracts">Smart Contracts</Link></li>
              <li><Link href="/docs">Docs</Link></li>
              <li><Link href="/community">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4>Community</h4>
            <ul>
              <li><a href="https://github.com/Kadena-Pact-Community-Foundation" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="https://discord.gg/kadena" target="_blank" rel="noopener noreferrer">Discord</a></li>
              <li><a href="https://forum.kadena.io/" target="_blank" rel="noopener noreferrer">Forum</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
