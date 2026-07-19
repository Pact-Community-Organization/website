import React from 'react';
import Roadmap from '@/components/roadmap/Roadmap';
import styles from '@/styles/roadmap.module.css';

export const metadata = {
  title: 'Roadmap',
  description:
    'What the Pact Community Organization has shipped, and the real, queued work that comes next.',
};

const RoadmapPage = () => {
  return (
    <div className={styles.container}>
      <Roadmap />
    </div>
  );
};

export default RoadmapPage;
