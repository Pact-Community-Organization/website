import React from 'react';
import styles from '@/styles/nft.module.css';
import PersonaNav from './PersonaNav';
import Flow from './Flow';

const CATALOG = 'https://github.com/Pact-Community-Organization/pact-contract-catalog';

const frameworkFlow = [
  {
    title: '1 · Create your revenue account',
    detail:
      'A principal account in the sale currency (e.g. coin). This is where your fees land. At listing time, always fetch its live guard from the chain — never hand-build one.',
  },
  {
    title: '2 · Build the listing flow',
    detail:
      'Your frontend assembles the seller’s offer with the quote: price, seller payout, and YOUR fee account + rate (up to 10%; charge less as policy). The seller signs; economics bind in state.',
  },
  {
    title: '3 · Build the buy flow',
    detail:
      'The buyer signs a transfer of the exact price into escrow plus the purchase continuation. The settlement engine pays your fee automatically — no marketplace code in the loop.',
  },
  {
    title: '4 · Optional: host auctions',
    detail:
      'Point listings at the governance-registered auction contracts and run the settlement crank as a service once auctions end (anyone may settle; your crank makes it a product).',
  },
  {
    title: '5 · Index the events',
    detail:
      'QUOTE and SETTLED from the settlement engine; TOKEN, SALE, TRANSFER, RECONCILE, SUPPLY from the ledger; ROYALTY from the royalty policy; AUCTION-CREATED / BID / BID-REFUNDED from the auctions. That is the complete data surface a catalog UI needs.',
  },
];

const standaloneFlow = [
  {
    title: '1 · Start from the reference implementation',
    detail:
      'Copy royalty-sale from the catalog library (MIT, audited) and adapt namespace, keysets, and fee policy.',
  },
  {
    title: '2 · Implement the standard, fully qualified',
    detail:
      'Your module implements nft-asset-v1 / nft-market-v1 (and nft-xchain-v1 if you support chain moves) from the PCO namespace. A private copy of the interfaces is a different type — it does not conform.',
  },
  {
    title: '3 · Pass the conformance suite',
    detail:
      'The suite drives your module through an interface reference with adversarial vectors — the same bar every conforming marketplace clears. Passing it is what “compatible” means.',
  },
  {
    title: '4 · Validate on devnet, then deploy',
    detail:
      'One class of node-side bug is invisible in the REPL — always run a devnet pass. Then deploy your module only; the interfaces are already published on-chain.',
  },
];

const NftMarketplaces = () => {
  return (
    <div className={styles.page}>
      <h1>Build your own marketplace</h1>
      <p className={styles.lede}>
        A business can open an NFT market on Kadena in two ways — and the most common one requires
        deploying no smart contract at all. Both rest on PCO-published, frozen on-chain interfaces,
        so what you build is compatible with the rest of the ecosystem from day one.
      </p>

      <PersonaNav current="/nft/marketplaces" />

      <section>
        <h2>Choosing your track</h2>
        <div className={styles.archGrid}>
          <div className={styles.archBox}>
            <h3>Framework marketplace — deploy nothing</h3>
            <p>
              Tokens live in the shared ledger; the framework&apos;s settlement engine runs every
              sale. Your marketplace is:
            </p>
            <ul>
              <li>a <strong>fee identity</strong> named in every seller-signed listing,</li>
              <li>optionally an <strong>auction venue</strong> with a settlement crank,</li>
              <li>a <strong>frontend</strong> that builds the transactions.</li>
            </ul>
          </div>
          <div className={styles.archBox}>
            <h3>Standalone marketplace — deploy one module</h3>
            <p>
              Your own module, your own ledger and custody, your own rules — conforming to the
              interface standard so wallets, indexers, and aggregators treat you like every other
              marketplace.
            </p>
            <ul>
              <li>Full control of custody and features</li>
              <li>Audited reference implementation to start from</li>
              <li>Conformance suite as your acceptance bar</li>
            </ul>
          </div>
        </div>
        <p>
          Pick the framework track if your product is the storefront. Pick the standalone track if
          your product needs its own contract logic. Nothing stops a company from doing both.
        </p>
      </section>

      <section>
        <h2>Track 1 · A marketplace on the framework</h2>
        <Flow steps={frameworkFlow} />
        <div className={styles.callout}>
          <p>
            <strong>You write no Pact and touch no settlement math.</strong> Conservation
            (money-in = money-out), creator royalties, and escrow discipline are the
            framework&apos;s job — enforced identically for every marketplace. Your fee arrives at
            your account on the chain where each sale happens.
          </p>
          <p>
            The step-by-step companion with the exact quote fields lives in the catalog:{' '}
            <a href={`${CATALOG}/blob/main/contracts/nft/QUICKSTART.md`} target="_blank" rel="noopener noreferrer">
              marketplace quickstart
            </a>{' '}
            · the field-by-field integration surface is section 10 of the{' '}
            <a href={`${CATALOG}/blob/main/contracts/nft/TECHNICAL.md`} target="_blank" rel="noopener noreferrer">
              technical reference
            </a>
            .
          </p>
        </div>
      </section>

      <section>
        <h2>Track 2 · A standalone marketplace on the standard</h2>
        <Flow steps={standaloneFlow} />
        <p>
          The{' '}
          <a href={`${CATALOG}/blob/main/contracts/standards/SPEC.md`} target="_blank" rel="noopener noreferrer">
            specification
          </a>{' '}
          defines the behavior your module must honor beyond the signatures — fail-closed inputs,
          one conservation-asserted settlement, on-chain economics, explicit sale-only royalty
          protection, and royalty-safe cross-chain moves. The{' '}
          <a href={`${CATALOG}/blob/main/contracts/standards/conformance/README.md`} target="_blank" rel="noopener noreferrer">
            conformance guide
          </a>{' '}
          shows how to run the suite against your module.
        </p>
      </section>

      <section>
        <h2>What you still build yourself</h2>
        <p>
          On either track, the on-chain layer does not ship a frontend, an indexer, wallet
          integration, or a minting UI — those are your product. The catalog&apos;s devnet
          campaigns are working end-to-end references for every transaction your frontend must
          build, including auction settlement by a third-party crank.
        </p>
      </section>

      <section>
        <h2>Why build on this instead of rolling your own</h2>
        <ul>
          <li>
            <strong>Trust you don&apos;t have to earn alone.</strong> Sellers and buyers get the
            standard&apos;s guarantees — checked settlement, unforgeable identity, enforced
            royalties — from your first day, verifiable on-chain with one{' '}
            <code>describe-module</code> call.
          </li>
          <li>
            <strong>Ecosystem compatibility.</strong> Conforming marketplaces share wallets,
            indexers, and aggregators; framework tokens listed with you can have been minted
            anywhere in the ecosystem.
          </li>
          <li>
            <strong>Creator alignment.</strong> Royalty enforcement is structural, not a policy
            page — the creators most worth hosting choose venues where their cut is real.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default NftMarketplaces;
