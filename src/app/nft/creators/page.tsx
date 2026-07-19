import React from 'react';
import NftCreators from '@/components/nft/NftCreators';
import styles from '@/styles/nft.module.css';

export const metadata = {
  title: 'NFTs for creators — Pact Community Organization',
  description: 'Mint NFTs with chain-enforced royalties and unforgeable identity.',
};

const Page = () => {
  return (
    <div className={styles.container}>
      <NftCreators />
    </div>
  );
};

export default Page;
