import React from 'react';
import Link from 'next/link';
import styles from '@/styles/token-banner.module.css';

// Top-of-home banner pointing to the PCO token page. Same theme as the site.
export default function TokenBanner() {
  return (
    <Link href="/token" className={styles.banner}>
      <span className={styles.badge}>NEW</span>
      <span className={styles.text}>
        The <b>PCO community token</b> is here — claim yours (free, no wallet needed), then transfer,
        vote, and propose.
      </span>
      <span className={styles.cta}>Open the token page →</span>
    </Link>
  );
}
