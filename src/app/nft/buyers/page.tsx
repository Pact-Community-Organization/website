import React from 'react';
import NftBuyers from '@/components/nft/NftBuyers';
import styles from '@/styles/nft.module.css';

export const metadata = {
  title: 'NFTs for buyers — Pact Community Organization',
  description: 'Sign the exact price and nothing else — settlement the contract proves.',
};

const Page = () => {
  return (
    <div className={styles.container}>
      <NftBuyers />
    </div>
  );
};

export default Page;
