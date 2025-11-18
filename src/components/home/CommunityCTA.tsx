import React from 'react';
import styles from '@/styles/home.module.css';

const CommunityCTA = () => {
  return (
    <section className={styles.communityCTA}>
      <h2>Join Our Community</h2>
      <p>
        Contribute to the ecosystem, get support, and connect with other developers on our community platforms.
      </p>
      {/* TODO: Replace with actual community links */}
      <a href="#" className={styles.ctaButton}>Get Involved</a>
    </section>
  );
};

export default CommunityCTA;
