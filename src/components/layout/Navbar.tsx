import React from 'react';
import Link from 'next/link';
import styles from '@/styles/navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">Kadena Pact Community Foundation</Link>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/mission-vision">Mission & Vision</Link>
        </li>
        <li>
          <Link href="/contracts">Smart Contracts</Link>
        </li>
        <li>
          <Link href="/docs">Docs</Link>
        </li>
        <li>
          <Link href="/community">Community</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
