import React from 'react';
import Link from 'next/link';
import styles from '@/styles/community-cta.module.css';

const CommunityCTA = () => {
  return (
    <section className={styles.communityCTA}>
      <div className={styles.content}>
        <h2>Ready to Build?</h2>
        <p>
          Connect with other developers, ask questions, and get involved in shaping the future of the Pact ecosystem.
        </p>
        <Link href="/community" passHref>
          <button className={styles.button}>Join the Community</button>
        </Link>
      </div>
    </section>
  );
};

export default CommunityCTA;
