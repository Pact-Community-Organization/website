import React from 'react';
import styles from '@/styles/devnet-banner.module.css';

// Site-wide banner for the DEVNET PREVIEW build. This build points every
// interactive surface at a local development network — nothing here is real,
// and this is NOT the production site.
export default function DevnetBanner() {
  return (
    <div className={styles.banner} role="alert">
      ⚠️ DEVNET PREVIEW — this build points at a local test network. All tokens are valueless test
      tokens; nothing here is real, live, or a production release.
    </div>
  );
}
