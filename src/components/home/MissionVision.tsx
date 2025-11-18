import React from 'react';
import styles from '@/styles/home.module.css';

const MissionVision = () => {
  return (
    <section className={styles.missionVision}>
      <h2>Our Mission & Vision</h2>
      <p>
        To make it easy and safe for businesses to start building on Kadena. We envision a trusted Kadena ecosystem with safe, audited Pact contracts.
      </p>
      <a href="#">Read full Mission & Vision →</a>
    </section>
  );
};

export default MissionVision;
