import React from 'react';
import NftOverview from '@/components/nft/NftOverview';
import styles from '@/styles/nft.module.css';

export const metadata = {
  title: 'NFTs on Pact',
  description: 'The PCO NFT standard and framework — documentation for creators, sellers, buyers, and marketplace builders.',
};

const Page = () => {
  return (
    <div className={styles.container}>
      <NftOverview />
    </div>
  );
};

export default Page;
