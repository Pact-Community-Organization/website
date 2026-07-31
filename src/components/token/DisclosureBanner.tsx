import React from 'react';
import styles from '@/styles/disclosure-banner.module.css';

// Site-wide standing disclosure.
//
// This was the DEVNET PREVIEW warning. At the mainnet cutover (2026-07-31) that
// text became FALSE in the way that matters most: it told visitors they were on
// a test network holding test tokens. They are not — PCO is deployed on
// mainnet01 and the tokens are real tokens.
//
// It is repurposed rather than deleted because the valueless disclosure is
// required on every surface, permanently. "Valueless" was true before and stays
// true; "test network" was the part that had to go.
export default function DisclosureBanner() {
  return (
    <div className={styles.banner} role="note">
      PCO is a free, <b>deliberately valueless</b> community token. It confers no dividends, no
      revenue rights, and no claim on anyone or anything. Governance votes are <b>advisory</b> —
      they execute nothing on-chain.
    </div>
  );
}
