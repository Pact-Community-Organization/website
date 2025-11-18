import React from 'react';
import styles from '@/styles/home.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Kadena Pact Community Foundation</h1>
        <p>Your trusted resource for building on Kadena with Pact.</p>
        <div className={styles.ctaButtons}>
          <button>Explore Smart Contracts</button>
          <button>Learn Pact</button>
          <button>Join the Community</button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
