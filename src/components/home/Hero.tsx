import React from 'react';
import Link from 'next/link';
import styles from '@/styles/hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>
          Building the Future of Pact, <span className={styles.gradientText}>Together</span>.
        </h1>
        <p>
          The Pact Community Organization is a neutral, community-driven hub for developers, contributors, and innovators building on the Pact network.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/contracts" passHref>
            <button className={`${styles.button} ${styles.buttonPrimary}`}>Explore Contracts</button>
          </Link>
          <Link href="/docs" passHref>
            <button className={`${styles.button} ${styles.buttonSecondary}`}>Read the Docs</button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
