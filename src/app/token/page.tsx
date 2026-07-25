import React from 'react';
import TokenPage from '@/components/token/TokenPage';

export const metadata = {
  title: 'PCO Token',
  description:
    'The PCO community token: free, deliberately valueless, advisory-only governance — claim, transfer, vote, and propose, all verifiable on-chain.',
};

export default function Token() {
  return <TokenPage />;
}
