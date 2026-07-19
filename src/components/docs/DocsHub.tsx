import React from 'react';
import styles from '@/styles/docs.module.css';

const links = [
  {
    title: 'NFT Documentation',
    url: '/nft',
    description:
      'The PCO NFT standard and framework — guides for creators, sellers, buyers, and businesses building their own marketplace.',
    internal: true,
  },
  {
    title: 'Pact Documentation',
    url: 'https://docs.kadena.io/smart-contract-dev',
    description: 'Writing smart contracts in the Pact language — the official Kadena documentation.',
  },
  {
    title: 'Kadena Developer Portal',
    url: 'https://docs.kadena.io/',
    description: 'The official Kadena developer documentation portal.',
  },
  {
    title: 'Foundation Documentation',
    url: 'https://github.com/Pact-Community-Organization/foundation/wiki',
    description: 'Documentation specific to the Pact Community Organization.',
  },
  {
    title: 'Pact Tutorials',
    url: 'https://docs.kadena.io/quickstart',
    description: 'Quickstart guides for building on Kadena with Pact.',
  },
];

const tools = [
  {
    title: 'pact-kit',
    description:
      'Domain knowledge and workflow automation for Pact 5 smart contract development — skills, guardrails, and commands packaged for AI coding agents (Claude Code, Codex, and Gemini CLI).',
    github: 'https://github.com/Pact-Community-Organization/pact-kit',
    npm: 'https://www.npmjs.com/package/@pact-community/pact-kit',
  },
  {
    title: 'Pact MCP Servers',
    description:
      'mcp-pact and mcp-chainweb — MCP servers that give AI agents safe, auditable access to Pact smart-contract development and Chainweb nodes.',
    github: 'https://github.com/Pact-Community-Organization/pact-mcp',
    npm: 'https://www.npmjs.com/package/@pact-community/mcp-pact',
  },
];

const DocsHub = () => {
  return (
    <div className={styles.hub}>
      <h1>Documentation Hub</h1>
      <p>Everything you need to build with Pact, in one place.</p>
      <div className={styles.grid}>
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target={link.internal ? undefined : '_blank'}
            rel={link.internal ? undefined : 'noopener noreferrer'}
            className={styles.card}
          >
            <h2>{link.title} &rarr;</h2>
            <p>{link.description}</p>
          </a>
        ))}
      </div>
      <h2 className={styles.sectionHeading}>Developer Tooling</h2>
      <div className={styles.grid}>
        {tools.map((tool, index) => (
          <div key={index} className={styles.card}>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <p className={styles.toolLinks}>
              <a href={tool.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={tool.npm} target="_blank" rel="noopener noreferrer">npm</a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocsHub;
