import React from 'react';
import styles from '@/styles/nft.module.css';
import PersonaNav from './PersonaNav';
import Flow from './Flow';

const listFlow = [
  {
    title: '1 · You sign the listing (the “quote”)',
    detail:
      'Price, currency, your payout account, and the marketplace’s fee are written into chain state, under your signature. This is the sale’s complete economics.',
  },
  {
    title: '2 · The token is held by the sale',
    detail:
      'While listed, the token cannot be quietly transferred or moved to another chain. You can withdraw (delist) any time before it sells.',
  },
  {
    title: '3 · A buyer pays the exact price into escrow',
    detail:
      'The buyer’s payment can only be the listed price — not a penny more or less reaches settlement.',
  },
  {
    title: '4 · One settlement pays everyone',
    detail:
      'Creator royalty, marketplace fee, and your remainder are paid in a single step that proves money-in equals money-out. Your proceeds arrive at the payout account you named.',
  },
];

const NftSellers = () => {
  return (
    <div className={styles.page}>
      <h1>For sellers</h1>
      <p className={styles.lede}>
        The deal you sign is the deal that settles. Once you list, no marketplace admin, no buyer,
        and no frontend can change the price, the fees, or where your money goes.
      </p>

      <PersonaNav current="/nft/sellers" />

      <section>
        <h2>How a fixed-price sale works</h2>
        <Flow steps={listFlow} />
        <div className={styles.callout}>
          <p>
            <strong>Why this matters:</strong> on some NFT platforms, fees and payees have been read
            from the <em>buyer&apos;s</em> transaction — meaning a hostile buyer could zero the fee,
            or a compromised frontend could redirect proceeds. Here, everything that moves money is
            bound to the listing you signed and read back from chain state at settlement. That rule
            is part of the standard itself.
          </p>
        </div>
      </section>

      <section>
        <h2>What you get, exactly</h2>
        <p>A worked example — you list at 100 KDA on a marketplace charging 2.5%, for a token with a 10% creator royalty:</p>
        <div className={styles.split}>
          <div className={styles.splitIn}>
            <h4>Buyer pays 100 KDA into escrow</h4>
          </div>
          <div className={styles.splitArrows} aria-hidden="true">
            ↓
          </div>
          <div className={styles.splitOut}>
            <div className={styles.splitLeg}>
              <h4>10 KDA</h4>
              <p>creator royalty</p>
            </div>
            <div className={styles.splitLeg}>
              <h4>2.5 KDA</h4>
              <p>marketplace fee</p>
            </div>
            <div className={styles.splitLeg}>
              <h4>87.5 KDA</h4>
              <p>you, the seller</p>
            </div>
          </div>
          <p className={styles.splitNote}>
            The contract asserts 10 + 2.5 + 87.5 = 100 to twelve decimal places — every sale, every
            time.
          </p>
        </div>
        <p>
          The royalty percentage is fixed on the token (set by its creator at mint); the fee is the
          marketplace&apos;s rate at the moment you list. Both are visible before you sign.
        </p>
      </section>

      <section>
        <h2>Auctions</h2>
        <p>
          Instead of a fixed price, your listing can hand price discovery to an{' '}
          <strong>auction contract</strong>. Two are built in:
        </p>
        <ul>
          <li>
            <strong>Ascending (conventional) auction</strong> — you set a reserve price, a minimum
            bid increment, and a schedule. Bids are held in escrow by the contract; every outbid
            bidder is refunded in full, automatically. When the auction ends, anyone can trigger
            settlement — the winning bid becomes the sale price.
          </li>
          <li>
            <strong>Declining-price (dutch) auction</strong> — you set a start price, a floor, and a
            step interval. The price walks down on schedule; the first buyer to accept wins at the
            current price, never below your floor.
          </li>
        </ul>
        <p>
          Royalty and marketplace fee are carved from the <em>final discovered price</em> — an
          auction is not a way around anyone&apos;s cut. Only auction contracts registered by the
          framework&apos;s governance can be used, so a listing can never point at a fake auction
          that steals the token.
        </p>
      </section>

      <section>
        <h2>Delisting and safety</h2>
        <ul>
          <li>
            <strong>You can withdraw an unsold listing at any time</strong> — the token returns to
            your full control. Nobody else can delist for you (or buy after you delist).
          </li>
          <li>
            <strong>A listed token cannot leave the chain.</strong> Cross-chain moves are blocked
            while a listing is live, so a sale you signed can never be stranded.
          </li>
          <li>
            <strong>Repricing means relisting.</strong> Withdrawing and listing again is the only
            way to change the price — there is no in-place edit a buyer could race against.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default NftSellers;
