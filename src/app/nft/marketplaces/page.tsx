import React from 'react';
import NftMarketplaces from '@/components/nft/NftMarketplaces';
import styles from '@/styles/nft.module.css';

export const metadata = {
  title: 'Build an NFT marketplace — Pact Community Organization',
  description: 'Launch a marketplace on the framework (deploy nothing) or implement the standard.',
};

const Page = () => {
  return (
    <div className={styles.container}>
      <NftMarketplaces />
    </div>
  );
};

export default Page;
