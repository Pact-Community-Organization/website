import React from 'react';
import styles from '@/styles/nft.module.css';

export type FlowStep = {
  title: string;
  detail: string;
  branch?: boolean;
};

const Flow = ({ steps }: { steps: FlowStep[] }) => {
  return (
    <div className={styles.flow}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <div className={styles.flowArrow} aria-hidden="true">
              ↓
            </div>
          )}
          <div className={step.branch ? `${styles.flowStep} ${styles.flowBranch}` : styles.flowStep}>
            <h4>{step.title}</h4>
            <p>{step.detail}</p>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Flow;
