import React from 'react';
import Link from 'next/link';
import styles from '@/styles/nft.module.css';

const pages = [
  { href: '/nft', label: 'Overview' },
  { href: '/nft/creators', label: 'Creators' },
  { href: '/nft/sellers', label: 'Sellers' },
  { href: '/nft/buyers', label: 'Buyers' },
  { href: '/nft/marketplaces', label: 'Build a marketplace' },
];

const PersonaNav = ({ current }: { current: string }) => {
  return (
    <nav className={styles.personaNav} aria-label="NFT documentation pages">
      {pages.map((page) => (
        <Link
          key={page.href}
          href={page.href}
          className={page.href === current ? styles.active : undefined}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
};

export default PersonaNav;
