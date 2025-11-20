import React from 'react';
import styles from '@/styles/mission-vision.module.css';

const MissionVisionContent = () => {
  return (
    <div className={styles.content}>
      <h1>Mission & Vision</h1>
      <section>
        <h2>Our Mission</h2>
        <p>
          Make it easy and safe for businesses to start building with Pact.
        </p>
      </section>
      <section>
        <h2>Our Vision</h2>
        <p>
          A trusted Pact ecosystem where businesses can confidently start using audited, reliable open source Pact contracts.
        </p>
      </section>
    </div>
  );
};

export default MissionVisionContent;
