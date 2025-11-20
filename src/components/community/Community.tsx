import React from 'react';
import styles from '@/styles/community.module.css';

const Community = () => {
  return (
    <div className={styles.community}>
      <h1>Community & Contribution</h1>
      <p>
        The Pact Community Organization is a community-driven organization.
        We welcome contributions from everyone.
      </p>
      <div className={styles.grid}>
        <a href="https://github.com/Pact-Community-Organization" target="_blank" rel="noopener noreferrer" className={styles.card}>
          <h2>GitHub &rarr;</h2>
          <p>Contribute to our projects on GitHub.</p>
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer" className={styles.card}>
          <h2>Discord &rarr;</h2>
          <p>Join the conversation on the official Pact Discord server.</p>
        </a>
        <a href="https://github.com/Pact-Community-Organization/foundation/discussions" target="_blank" rel="noopener noreferrer" className={styles.card}>
          <h2>Discussions &rarr;</h2>
          <p>Discuss ideas and proposals on the Foundation's GitHub Discussions.</p>
        </a>
      </div>
    </div>
  );
};

export default Community;
