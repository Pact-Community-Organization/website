import React from 'react';
import Community from '@/components/community/Community';

export const metadata = {
  title: 'Community & Contribution',
};
import styles from '@/styles/community.module.css';

const CommunityPage = () => {
  return (
    <div className={styles.container}>
      <Community />
    </div>
  );
};

export default CommunityPage;
