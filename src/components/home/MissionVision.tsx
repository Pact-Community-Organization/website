import React from 'react';
import Link from 'next/link';
import styles from '@/styles/mission-vision.module.css';

const MissionVision = () => {
  return (
    <section className={styles.missionVision}>
      <div className={styles.content}>
        <h2>Our Mission & Vision</h2>
        <p>
          To foster a thriving, secure, and innovative ecosystem around the Pact smart contract language. We empower developers by providing trusted resources, promoting open-source collaboration, and supporting community-driven governance.
        </p>
        <Link href="/mission-vision">Read our full Mission & Vision →</Link>
      </div>
    </section>
  );
};

export default MissionVision;
