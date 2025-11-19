import React from 'react';
import styles from '@/styles/home.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>&copy; {new Date().getFullYear()} Pact Community Organization. All rights reserved.</p>
        {/* TODO: Add final license text and social handles */}
        <div className={styles.footerLinks}>
          <a href="#">GitHub</a>
          <a href="#">License</a>
          <a href="#">Social</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
