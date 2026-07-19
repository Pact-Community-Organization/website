import React from 'react';
import styles from '@/styles/nft.module.css';
import PersonaNav from './PersonaNav';
import Flow from './Flow';

const buyFlow = [
  {
    title: '1 · You see a listing',
    detail:
      'Price, currency, and the token’s royalty terms are on-chain state — what your wallet shows can be checked against the chain, not taken on faith from a website.',
  },
  {
    title: '2 · You sign exactly two things',
    detail:
      'A transfer of the exact listed price into the sale’s escrow, and the purchase itself naming your account. That is your entire exposure — there is nothing else to sign.',
  },
  {
    title: '3 · The contract settles',
    detail:
      'In one step: royalty to the creator, fee to the marketplace, remainder to the seller, token to you. The contract asserts the amounts add up exactly before anything moves.',
  },
  {
    title: '4 · You own it',
    detail:
      'Ownership is a ledger row guarded by your key — not a marketplace database entry. Any conforming marketplace, wallet, or indexer sees the same fact.',
  },
];

const NftBuyers = () => {
  return (
    <div className={styles.page}>
      <h1>For buyers</h1>
      <p className={styles.lede}>
        You authorize the exact price and nothing else. A compromised website, a hostile seller, or
        a malicious marketplace cannot make you overpay, redirect your payment, or hand you a fake.
      </p>

      <PersonaNav current="/nft/buyers" />

      <section>
        <h2>What buying looks like</h2>
        <Flow steps={buyFlow} />
      </section>

      <section>
        <h2>Why you can&apos;t be cheated</h2>
        <ul>
          <li>
            <strong>Your signature is scoped.</strong> The payment you sign is for the exact listed
            price, to a specific escrow, for this one sale. It cannot be replayed, redirected, or
            stretched — if anything about the sale doesn&apos;t match, the whole transaction aborts
            and your money never leaves.
          </li>
          <li>
            <strong>The economics were fixed before you arrived.</strong> Price, royalty, and fee
            were bound to the listing when the seller signed it. Nothing in <em>your</em>{' '}
            transaction can change them — which also means nothing in a manipulated frontend can.
          </li>
          <li>
            <strong>The token is what it says it is.</strong> A token&apos;s id is derived from its
            creator&apos;s identity — a counterfeit &quot;same&quot; token cannot exist, on this
            chain or any other. Provenance is in the id, not in a checkmark.
          </li>
          <li>
            <strong>Settlement is all-or-nothing.</strong> One atomic step pays everyone and
            transfers the token. There is no state where your payment is gone and the token
            isn&apos;t yours.
          </li>
        </ul>
      </section>

      <section>
        <h2>Bidding in auctions</h2>
        <ul>
          <li>
            <strong>Your bid is escrowed by the contract</strong>, not by the marketplace. If
            someone outbids you, your full bid comes back automatically — no claims process.
          </li>
          <li>
            <strong>Winning is checked on-chain.</strong> Settlement validates the winner and the
            winning amount against the auction&apos;s own recorded state; a &quot;discovered
            price&quot; that doesn&apos;t match the real bidding history is rejected.
          </li>
          <li>
            <strong>Declining-price auctions</strong> sell to the first acceptance at the current
            scheduled price — you can compute that price yourself from the on-chain curve before
            you commit.
          </li>
        </ul>
      </section>

      <section>
        <h2>What ownership gets you</h2>
        <p>
          Your token is a row in a public ledger, guarded by your key. You can hold it, gift it (if
          the creator allowed free transfers), list it on any conforming marketplace, or move it to
          another chain in the same network — its rules travel with it. If the token is
          &quot;sale-only&quot;, that is the creator&apos;s enforced choice, visible before you buy:
          it can change hands only through a sale that pays the royalty.
        </p>
        <div className={styles.callout}>
          <p>
            <strong>One habit worth keeping:</strong> before a large purchase, verify the
            marketplace&apos;s contract hash against the published tables in the{' '}
            <a
              href="https://github.com/Pact-Community-Organization/pact-contract-catalog"
              target="_blank"
              rel="noopener noreferrer"
            >
              contract catalog
            </a>
            . One <code>describe-module</code> call tells you whether you are talking to the real,
            audited code — that is the point of an on-chain standard.
          </p>
        </div>
      </section>
    </div>
  );
};

export default NftBuyers;
