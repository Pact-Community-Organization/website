import React from 'react';
import NftSellers from '@/components/nft/NftSellers';
import styles from '@/styles/nft.module.css';

export const metadata = {
  title: 'NFTs for sellers',
  description: 'Fixed-price sales and auctions with economics that cannot change after you sign.',
};

const Page = () => {
  return (
    <div className={styles.container}>
      <NftSellers />
    </div>
  );
};

export default Page;
