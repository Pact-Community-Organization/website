import React from 'react';
import styles from '@/styles/nft.module.css';
import PersonaNav from './PersonaNav';
import Flow from './Flow';

const mintFlow = [
  {
    title: '1 · Choose the token’s rules (policies)',
    detail:
      'Royalty percentage and payout account, one-of-one or edition, collection membership, transfer rules, whether the artwork link can ever change. These choices are permanent.',
  },
  {
    title: '2 · Create the token',
    detail:
      'The ledger derives the token’s id from your guard (your on-chain identity) and the token’s details. Only you can create it, and it can only ever exist once.',
  },
  {
    title: '3 · Mint',
    detail: 'The token is written to its owner — you, or a buyer if the marketplace mints on sale.',
  },
  {
    title: '4 · It lives its life',
    detail:
      'Sold on any marketplace, auctioned, moved between chains — your royalty terms travel with it and are enforced at every sale, everywhere, forever.',
  },
];

const NftCreators = () => {
  return (
    <div className={styles.page}>
      <h1>For creators</h1>
      <p className={styles.lede}>
        You decide a token&apos;s rules once, at creation — and the chain enforces them for the rest
        of the token&apos;s life. No marketplace can opt out of your royalty, and nobody can mint a
        token pretending to be you.
      </p>

      <PersonaNav current="/nft/creators" />

      <section>
        <h2>From idea to minted token</h2>
        <Flow steps={mintFlow} />
      </section>

      <section>
        <h2>Your identity is the anchor</h2>
        <p>
          Every token id is <strong>derived from its creator&apos;s guard</strong> — the
          cryptographic identity that only you control. Two things follow:
        </p>
        <ul>
          <li>
            <strong>Forgery is impossible.</strong> Nobody can create a token whose id claims your
            authorship — the creation would fail because they cannot satisfy your guard.
          </li>
          <li>
            <strong>Double-minting is impossible.</strong> One id, one row, forever. The same token
            cannot be created again — on the same chain or any other.
          </li>
        </ul>
        <p>
          Collectors do not need to trust a marketplace&apos;s word about who made a token: the id
          itself proves it.
        </p>
      </section>

      <section>
        <h2>The policy menu — your rules, made permanent</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Policy</th>
                <th>What it gives you</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Royalty</strong>
                </td>
                <td>
                  A percentage of <em>every</em> sale (up to 50%), paid to the account you name, on
                  the chain where the sale happens. Enforced by the settlement engine itself — a
                  marketplace cannot skip it, and an auction cannot dodge it. Prices that would
                  round your royalty down to zero are rejected outright.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Sale-only</strong> (royalty opt-in)
                </td>
                <td>
                  The token can change owners <em>only through a sale</em>. Free transfers are
                  rejected, and a cross-chain move cannot change the owner — so there is no
                  royalty-free way out. Choose it for work where the royalty is the point; skip it
                  if you want owners to be able to gift freely.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>One-of-one</strong>
                </td>
                <td>A strict single edition: supply is one, minted once, ever.</td>
              </tr>
              <tr>
                <td>
                  <strong>Collection</strong>
                </td>
                <td>
                  Membership in an operator-gated collection with an optional size cap — provable
                  scarcity for a series.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Operation guards</strong>
                </td>
                <td>
                  Fine-grained control: separate guards for minting, burning, selling, and
                  transferring — for tokens that need custom authorization rules.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Artwork link (URI) rules</strong>
                </td>
                <td>
                  By default a token&apos;s metadata link is <strong>immutable</strong>. You can
                  attach a policy that allows guarded updates (you keep a key), or one that vetoes
                  updates unconditionally — a veto always wins over a permit.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.callout}>
          <p>
            <strong>Permanence works in your favor.</strong> The policy set is fixed when the token
            is created and canonically ordered — it cannot be extended, re-ordered, or composed away
            later. A rule you set at mint cannot be undone by a future marketplace, upgrade, or
            clever combination of policies.
          </p>
        </div>
      </section>

      <section>
        <h2>Your royalty travels</h2>
        <p>
          When a token moves to another chain, every policy packs its state — your royalty terms,
          the guards, the edition marker — into a <strong>passport</strong> that travels with the
          token and re-binds on arrival. A token that sells on another chain still pays you there.
          The royalty account you name should be one you control on every chain (a standard{' '}
          <code>k:</code> account works everywhere; the settlement creates it on a chain the first
          time a royalty arrives there).
        </p>
      </section>

      <section>
        <h2>What creators should double-check before minting</h2>
        <ol>
          <li>
            <strong>The royalty account and percentage</strong> — both are permanent for that token.
          </li>
          <li>
            <strong>Sale-only or freely transferable</strong> — permanent, and it changes what your
            collectors can do (gifts, private moves).
          </li>
          <li>
            <strong>The artwork link stance</strong> — if you attach no URI policy, the link is
            frozen forever; if your art is meant to evolve, attach the guarded-update policy at
            creation.
          </li>
        </ol>
      </section>
    </div>
  );
};

export default NftCreators;
