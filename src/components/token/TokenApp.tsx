'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/styles/token.module.css';
import { CFG } from '@/lib/chain';
import {
  openRounds, alreadyClaimed, poolBalance, masterOpen,
  balance, openProposals, myBallot, claim, transfer, vote,
  voteAs, setVoteKey, clearVoteKey, voteKeyActive, rotate, lookupAllChains, kdaBalance,
  type Round, type Proposal, checkCode } from '@/lib/pco';
import {
  connectEcko, connectZelcore, connectLedger, eckoAvailable, zelcoreBlockedByBrowser,
  type ConnectedWallet,
} from '@/lib/wallets';

type Status = { msg: string; kind: 'info' | 'ok' | 'err' } | null;

// ONE active wallet at a time drives the whole page: the claim destination,
// balances, votes, transfers. There is no default wallet: the page generates
// (zero setup), and switching to Ledger/Ecko/Zelcore REPLACES it everywhere.
export default function TokenApp() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundId, setRoundId] = useState('');
  const [code, setCode] = useState('');
  const [pool, setPool] = useState(0);
  const [open, setOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [walletBal, setWalletBal] = useState(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myBallots, setMyBallots] = useState<Record<string, { ranking: number[]; weight: number } | null>>({});
  const [rankings, setRankings] = useState<Record<string, number[]>>({});   // in-progress ranking per question
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [vkActive, setVkActive] = useState(false);
  // A ref mirror of destAddr: refresh needs to READ it without DEPENDING on it.
  const destAddrRef = useRef('');
  const [vkHot, setVkHot] = useState('');
  const [vkCold, setVkCold] = useState('');          // cold account the connected wallet votes for
  const [voteMode, setVoteMode] = useState<'wallet' | 'hotkey'>('wallet');
  const [walletKda, setWalletKda] = useState(0);
  const [destAddr, setDestAddr] = useState('');
  const [destEdited, setDestEdited] = useState(false);   // user typed their own receiving address
  const [rotAccount, setRotAccount] = useState('');
  const [rotKey, setRotKey] = useState('');
  const [lookup, setLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<{ label: string; total?: number; perChain?: { chain: string; balance: number }[] } | null>(null);
  // THE DESTINATION'S OWN ON-CHAIN BALANCE, shown whether or not a wallet is
  // connected. A claim needs no wallet, so a user can (correctly) claim to a
  // pasted address while connected to nothing — and until now the page then
  // showed them NOTHING afterwards: the balance panel renders only for a
  // connected wallet, and no ordinary wallet lists a namespaced token like PCO.
  // A successful claim was therefore indistinguishable from a failed one, which
  // is exactly how one got reported as "the funds were not sent". null = no
  // valid address to read yet.
  const [destBal, setDestBal] = useState<number | null>(null);
  const [destNonce, setDestNonce] = useState(0);   // bump to force a re-read (e.g. after claiming)
  // A durable record of the last claim — deliberately NOT the transient status
  // line, which the next message overwrites. This is the user's evidence.
  const [receipt, setReceipt] = useState<{ reqKey: string; amount: number; account: string; round: string } | null>(null);
  // Detected after mount, never during render: reading navigator on the server
  // would render one thing and the client another (see the Ecko note above).
  const [safariZelcore, setSafariZelcore] = useState(false);

  const say = (msg: string, kind: Status extends null ? never : 'info' | 'ok' | 'err' = 'info') => setStatus({ msg, kind });

  // ECKO DETECTION MUST NOT HAPPEN DURING RENDER.
  //
  // eckoAvailable() reads window, so the server renders "not detected / disabled"
  // and a client with the extension renders "enabled" — a hydration mismatch that
  // React explicitly does NOT patch up for attributes. The server's disabled=""
  // could therefore stick, leaving the Ecko button permanently unclickable for
  // exactly the users who have Ecko. (Pre-existing; it has been live since launch.)
  //
  // null = still detecting, which is what BOTH the server and the first client
  // render produce, so they agree. The extension also injects asynchronously, so
  // one check on mount can miss it — re-check for a couple of seconds.
  const [eckoReady, setEckoReady] = useState<boolean | null>(null);
  useEffect(() => {
    let done = false;
    const check = () => { if (!done && eckoAvailable()) { setEckoReady(true); done = true; } };
    check();
    const timers = [200, 600, 1200, 2000].map((ms) => setTimeout(check, ms));
    const settle = setTimeout(() => { if (!done) setEckoReady(false); }, 2200);
    return () => { done = true; timers.forEach(clearTimeout); clearTimeout(settle); };
  }, []);

  const refresh = useCallback(async () => {
    try {
      // There is no default wallet any more: the page generates no keys, so
      // until the user connects one there is no identity to read balances for.
      // Round and pool state are public and load regardless.
      const w = wallet;
      const [op, pl, rs, props] = await Promise.all([
        masterOpen(), poolBalance(), openRounds(), openProposals(),
      ]);
      setOpen(op); setPool(pl);
      setRounds(op ? rs : []);
      setProposals(props);
      if (op && rs.length && !rs.some((r) => r.id === roundId)) setRoundId(rs[0].id);
      const sel = rs.find((r) => r.id === roundId) ?? rs[0];
      // the RECEIVING ADDRESS is an open field: it follows the active wallet
      // until the user types their own (e.g. a hardware wallet in a safe —
      // paste the public address and claim, nothing signs)
      if (!w) {
        // no wallet connected: show the public state, clear anything account-shaped
        setWalletBal(0); setWalletKda(0); setVkActive(false); setMyBallots({}); setClaimed(false);
        return;
      }
      const effDest = destEdited ? destAddrRef.current.trim() : w.account;
      // Functional update so `destAddr` does NOT have to be a dependency of
      // refresh. It used to be, and refresh SETS it — so every refresh recreated
      // refresh, which re-ran the effect. It settled after one extra cycle, but
      // it is a cascade and the linter is right to call it one.
      if (!destEdited) setDestAddr((prev) => (prev === w.account ? prev : w.account));
      setClaimed(sel && /^k:[0-9a-f]{64}$/.test(effDest) ? await alreadyClaimed(sel.id, effDest) : false);
      setWalletBal(await balance(w.account));
      setWalletKda(await kdaBalance(w.account));
      setVkActive(await voteKeyActive(w.account));
      const mv: Record<string, { ranking: number[]; weight: number } | null> = {};
      for (const p of props) mv[p.pid] = await myBallot(p.pid, w.account);
      setMyBallots(mv);
      const cold = localStorage.getItem('pco-votekey-cold') ?? '';
      setVkCold(cold && (await voteKeyActive(cold)) ? cold : '');
    } catch (e) {
      say(`Cannot reach the network: ${(e as Error).message}`, 'err');
    }
  }, [roundId, wallet, destEdited]);

  // refresh is re-created whenever key/roundId/wallet change (its useCallback
  // deps), so this effect re-runs with FRESH state — no manual refresh() calls
  // in onChange handlers (they would run a stale closure).
  // refresh() sets state, so calling it synchronously in the effect body is a
  // cascading render by definition. Defer the first run to a microtask-ish tick:
  // same behaviour to a user, but the effect body itself no longer sets state.
  useEffect(() => {
    let live = true;
    const tick = () => { if (live) void refresh(); };
    const first = setTimeout(tick, 0);
    const every = setInterval(tick, 30000);
    return () => { live = false; clearTimeout(first); clearInterval(every); };
  }, [refresh]);

  // Keep the ref in step with the state it mirrors. Cheap, and it means refresh
  // always reads the current value without listing it as a dependency.
  useEffect(() => { destAddrRef.current = destAddr; }, [destAddr]);

  // Deferred, not called in the effect body: setting state synchronously there
  // is a cascading render, which is the rule the first-refresh effect below
  // already dodges the same way.
  useEffect(() => {
    const t = setTimeout(() => setSafariZelcore(zelcoreBlockedByBrowser()), 0);
    return () => clearTimeout(t);
  }, []);

  // The destination balance gets its OWN effect rather than living in refresh().
  // refresh() *writes* destAddr, so depending on destAddr there is the cascade
  // that was removed earlier; this effect only READS destAddr and writes a
  // different piece of state, so it cannot feed itself. Debounced so typing an
  // address does not fire a request per keystroke.
  useEffect(() => {
    const a = destAddr.trim();
    const sel = rounds.find((r) => r.id === roundId) ?? rounds[0];
    let live = true;
    // Everything, including clearing the figure for a half-typed address, happens
    // inside the timer: no setState runs synchronously in the effect body.
    const t = setTimeout(() => {
      if (!live) return;
      if (!/^k:[0-9a-f]{64}$/.test(a)) { setDestBal(null); return; }
      // balance() already maps a not-yet-existing account to 0, so a fresh
      // address reads as 0 rather than throwing.
      balance(a).then((b) => { if (live) setDestBal(b); }).catch(() => { if (live) setDestBal(null); });
      // Settle "has this DESTINATION already claimed this round?" here too.
      // refresh() cannot answer it without a wallet — it has no identity to ask
      // about — so it left the button enabled for an address that had already
      // claimed. Clicking then spent gas-station float on a transaction that
      // could only fail, which is the very waste the local answer-check avoids.
      if (sel) alreadyClaimed(sel.id, a).then((c) => { if (live) setClaimed(c); }).catch(() => {});
    }, 400);
    return () => { live = false; clearTimeout(t); };
  }, [destAddr, destNonce, roundId, rounds]);

  const selectedRound = () => rounds.find((r) => r.id === roundId) ?? rounds[0];

  const doClaim = async () => {
    const round = selectedRound();
    if (!round) return say('No open round right now.', 'err');
    if (!code.trim()) return say('Enter the answer first.', 'err');
    // NO WALLET IS REQUIRED TO CLAIM. Claims carry no claimer signature — tokens
    // can only land in the account bound to the guard supplied with the claim —
    // and the station's fee is authorised by an ephemeral in-memory key. All the
    // page needs is a destination: the connected wallet if there is one, or an
    // address typed in by someone who has no wallet connected at all (a hardware
    // wallet in a safe, a friend's account, a fresh address).
    const a = (destEdited || !wallet) ? destAddr.trim() : wallet.account;
    if (!/^k:[0-9a-f]{64}$/.test(a)) {
      return say(wallet
        ? 'That is not a valid k: account — expected "k:" + 64 lowercase hex characters. Check for typos before claiming.'
        : 'Paste the k: address the tokens should go to — "k:" + 64 lowercase hex characters. No wallet needed to claim.', 'err');
    }
    const dest = { account: a, publicKey: a.slice(2) };
    const destLabel = wallet && !destEdited ? `your ${wallet.label} account` : `${a.slice(0, 14)}…`;
    // Check the answer BEFORE any spinner or network work. A wrong answer is
    // caught here for free; submitting it would spend the gas station's float on
    // a transaction that cannot succeed, and enough of those exhaust the daily
    // sponsorship budget for people whose answer IS right.
    if (!checkCode(round, code)) {
      return say("That answer doesn't match this round — nothing was submitted, so try again freely.", 'err');
    }
    setBusy(true); say(`Claiming "${round.id}" to ${destLabel} (the gas station pays the fee — nothing to sign)…`);
    try {
      // Keep the RESULT. It carries the request key — the transaction's
      // permanent on-chain identifier — and throwing it away left a user whose
      // claim had genuinely succeeded with no way to demonstrate that.
      const res = await claim(round, dest, code.trim().toLowerCase());
      const reqKey = String((res as { reqKey?: unknown }).reqKey ?? '');
      setReceipt({ reqKey, amount: round.amount, account: a, round: round.id });
      say(`Claimed ${round.amount} PCO to ${a.slice(0, 14)}…!`, 'ok');
      setCode('');
      setDestNonce((n) => n + 1);   // re-read the destination so the new balance shows
    }
    catch (e) { say(`Claim failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  // Switching wallets REPLACES the active identity everywhere — never two at
  // once. A failed or ended session leaves the page with no wallet, not a fallback.
  const connect = async (kind: 'ecko' | 'zelcore' | 'ledger') => {
    say(`Connecting ${kind}…`);
    wallet?.disconnect?.();
    try {
      let w: ConnectedWallet;
      if (kind === 'ecko') w = await connectEcko((reason) => { setWallet(null); say(`${reason} — wallet disconnected`, 'err'); });
      else if (kind === 'zelcore') w = await connectZelcore();
      else if (kind === 'ledger') w = await connectLedger();
      else return say('Unknown wallet type.', 'err');
      setWallet(w); say(`Active wallet: ${w.label} · ${w.account.slice(0, 16)}…`, 'ok');
    } catch (e) {
      setWallet(null);
      say(`${(e as Error).message}`, 'err');
    }
  };

  const AMOUNT_RE = /^\d+(\.\d{1,12})?$/;
  const validTo = /^k:[0-9a-f]{64}$/.test(to);

  const doTransfer = async () => {
    if (!wallet) return say('Choose your wallet first (step 1).', 'err');
    if (!validTo) return say('Recipient must be a k: account (k: + 64 hex).', 'err');
    if (!AMOUNT_RE.test(amount) || Number(amount) <= 0) return say('Amount must be a positive number.', 'err');
    const amt = amount.includes('.') ? amount : `${amount}.0`;
    setBusy(true); say(`Sending ${amt} PCO (your wallet pays the gas)…`);
    try {
      await transfer(wallet, to, amt); say(`Sent ${amt} PCO.`, 'ok');
      setTo(''); setAmount('');
    } catch (e) { say(`Transfer failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  const doVote = async (pid: string) => {
    const ranking = rankings[pid] ?? [];
    if (ranking.length === 0) return say('Build your ranking first — tap the options in order of preference.', 'err');
    if (voteMode === 'hotkey' && vkCold && wallet) {
      // the CONNECTED wallet is a registered VOTE KEY for the cold account: it
      // signs and pays its own gas, so the cold wallet never comes out to vote.
      // This used to be a key the page generated for you; registering a wallet
      // you already control is the same mechanism without us minting secrets.
      setBusy(true); say(`Submitting the ranked ballot as ${vkCold.slice(0, 14)}… with the registered vote key…`);
      try { await voteAs(wallet, vkCold, pid, ranking); say('Ballot submitted as the cold account (vote key signed).', 'ok'); }
      catch (e) { say(`Vote-key ballot failed: ${(e as Error).message}`, 'err'); }
      setBusy(false); void refresh(); return;
    }
    if (!wallet) return say('Choose your wallet first (step 1) — voting is self-paid.', 'err');
    setBusy(true); say(`Submitting your ranked ballot on question ${pid}…`);
    try { await vote(wallet, pid, ranking); say(`Ballot submitted on question ${pid}.`, 'ok'); }
    catch (e) { say(`Ballot failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  const doRegisterVoteKey = async () => {
    if (!wallet) return say('Connect your main wallet first.', 'err');
    const hot = vkHot.trim();
    // A vote key is ANOTHER ACCOUNT YOU CONTROL, identified by its PUBLIC key.
    // The page never sees a secret: the hot account signs its own ballots later.
    if (!/^[0-9a-f]{64}$/.test(hot)) return say('Enter the vote key\u2019s PUBLIC key (64 hex) — the account you want to vote with. Never paste a private key.', 'err');
    setBusy(true); say('Registering that public key as your vote key (your wallet signs)…');
    try {
      await setVoteKey(wallet, hot);
      localStorage.setItem('pco-votekey-cold', wallet.account);
      say('Vote key registered — this browser can now vote for your account (and ONLY vote).', 'ok');
    } catch (e) { say(`Registration failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };
  const doClearVoteKey = async () => {
    if (!wallet) return say('Connect your main wallet first.', 'err');
    setBusy(true); say('Clearing your vote key…');
    try {
      await clearVoteKey(wallet);
      if (localStorage.getItem('pco-votekey-cold') === wallet.account) localStorage.removeItem('pco-votekey-cold');
      say('Vote key cleared — only your main wallet can vote now.', 'ok');
    } catch (e) { say(`Clear failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  const doRotate = async () => {
    if (!wallet) return say('Choose your wallet first (step 1).', 'err');
    const acct = rotAccount.trim() || wallet.account;
    if (acct.startsWith('k:')) {
      return say('k: (principal) accounts cannot rotate — the protocol fixes their guard to their key. Rotation applies to NAMED accounts whose current guard your wallet satisfies.', 'err');
    }
    if (!/^[0-9a-f]{64}$/.test(rotKey.trim())) return say('New key must be 64 hex characters.', 'err');
    setBusy(true); say(`Rotating the guard of ${acct}…`);
    try { await rotate(wallet, acct, rotKey.trim()); say(`Guard of ${acct} rotated to the new key.`, 'ok'); setRotKey(''); }
    catch (e) { say(`Rotate failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  const doLookup = async () => {
    const a = lookup.trim(); if (!a) return;
    setLookupResult({ label: 'Reading all 20 chains…' });
    const r = await lookupAllChains(a);
    if (r.perChain.length === 0) {
      setLookupResult({ label: `${a.length > 24 ? a.slice(0, 24) + '…' : a} holds no PCO on any chain.` });
    } else {
      setLookupResult({
        label: `${a.length > 24 ? a.slice(0, 24) + '…' : a} holds ${r.total.toLocaleString()} PCO across ${r.perChain.length} chain${r.perChain.length > 1 ? 's' : ''}`,
        total: r.total, perChain: r.perChain,
      });
    }
  };


  const round = selectedRound();

  return (
    <div className={styles.app}>
      {status && <div className={`${styles.status} ${styles[status.kind]}`}>{status.msg}</div>}

      {/* ---- 1. Choose your wallet (ONE active identity for the whole page) ---- */}
      <section className={styles.card}>
        <h2>1 · Choose your wallet</h2>
        <p className={styles.muted}>
          Everything on this page — claiming, balances, votes, transfers — uses <b>one active
          wallet</b>: your own. Connect it and the page follows it.
          {' '}<b>Claiming stays gasless</b> — you need no KDA to claim; your wallet only
          authorises the gas station to pay, and the station covers the fee.
        </p>
        <p className={styles.walletButtons}>
          <button className={styles.btn} disabled={eckoReady !== true || wallet?.kind === 'ecko'} onClick={() => connect('ecko')}>
            EckoWallet{eckoReady === null ? ' (checking…)' : eckoReady === false ? ' (not detected)' : wallet?.kind === 'ecko' ? ' ✓' : ''}
          </button>
          <button className={styles.btn} disabled={wallet?.kind === 'zelcore'} onClick={() => connect('zelcore')}>
            Zelcore{wallet?.kind === 'zelcore' && ' ✓'}
          </button>
          <button className={styles.btn} disabled={wallet?.kind === 'ledger'} onClick={() => connect('ledger')}>
            Ledger{wallet?.kind === 'ledger' && ' ✓'}
          </button>
        </p>
        {safariZelcore && (
          <p className={styles.muted}>
            <b>Using Safari?</b> Safari blocks this page from reaching Zelcore — it is the only browser
            that stops an HTTPS page from calling a local app, so the connection fails even with Zelcore
            open and logged in. Connect Zelcore in Chrome, Brave or Edge instead — or simply{' '}
            <b>claim without a wallet</b>: claiming needs no signature, so paste your{' '}
            <span className={styles.mono}>k:</span> address in the receiving-address field below.
            (EckoWallet and Ledger are unaffected.)
          </p>
        )}
        {wallet && (
          <>
            <p>
              Active wallet: <b>{wallet.label}</b>
              <button className={styles.btn} onClick={() => { navigator.clipboard?.writeText(wallet.account).then(() => say('Address copied.', 'ok')).catch(() => say(wallet.account)); }}>copy address</button>
            </p>
            <p className={styles.mono}>{wallet.account}</p>
            <p>
              {/* Kadena balances are PER CHAIN. An unqualified "Holds: 0 KDA" reads as
                  "you have no KDA", when the user may hold plenty on another chain — and
                  then the advice to fund it is wrong. Name the chain. */}
              Holds on <b>chain {CFG.chain}</b>: <b>{walletBal.toLocaleString()} PCO</b> · <b>{walletKda.toLocaleString(undefined, { maximumFractionDigits: 4 })} KDA</b>
              {walletKda < 0.05 && <span className={styles.muted}> — self-paid actions (transfer/vote) need a little KDA <i>on this chain</i>; claiming does not. KDA held on another Kadena chain has to be moved here first.</span>}
            </p>
            <>
              <hr />
              <h3>Voting key {vkActive ? '— active' : '— none registered'}</h3>
              <p className={styles.muted}>
                Nominate <b>another account you control</b> as a dedicated <b>vote key</b> for this
                one: it can then vote on your behalf while your {wallet.label} stays cold. The vote
                key can <b>only vote</b> — it can never transfer, rotate, or re-point itself, and
                your main wallet always keeps its own voting power.{' '}
                <a href="/token/guide#voting-key">How this works →</a>
              </p>
              <p className={styles.muted}>
                Identify it by its <b>public key</b> (64 hex). Nothing secret is entered here, and
                nothing about the other account is stored — it signs its own ballots later.
              </p>
              <p>
                {!vkActive
                  ? <>
                      <input placeholder="vote key PUBLIC key (64 hex)" value={vkHot}
                             onChange={(e) => setVkHot(e.target.value)} style={{ width: '60%' }} />
                      <button className={styles.btn} disabled={busy || !vkHot.trim()} onClick={doRegisterVoteKey}>register vote key</button>
                    </>
                  : <button className={styles.btn} disabled={busy} onClick={doClearVoteKey}>clear vote key</button>}
              </p>
            </>
          </>
        )}
      </section>

      {/* ---- 2. Claim — to the active wallet, gasless ---- */}
      <section className={styles.card}>
        <h2>2 · Claim — {open ? (rounds.length ? `${rounds.length} open round${rounds.length > 1 ? 's' : ''}` : 'no open rounds') : 'CLOSED'}</h2>
        <p className={styles.muted}>
          The gas station pays the fee and the receiving account never signs — claiming is free.
          The station sponsors <b>only</b> claims; everything else is self-paid.
        </p>
        <p className={styles.muted}>
          <b>Receiving address</b> — pre-filled with your active wallet. Paste any{' '}
          <span className={styles.mono}>k:</span> address instead (a hardware wallet in a safe, a
          friend&apos;s account…) and claim straight to it: the receiving address never signs and
          needs no wallet here.
        </p>
        <p>
          <input placeholder="k:address that receives the claim" value={destAddr}
            onChange={(e) => { setDestAddr(e.target.value); setDestEdited(true); }}
            style={{ width: '100%' }} />
        </p>
        {destEdited && destAddr.trim() !== '' && !/^k:[0-9a-f]{64}$/.test(destAddr.trim()) && (
          <p className={styles.muted}>⚠ not a valid k: account yet — expected <span className={styles.mono}>k:</span> followed by exactly 64 lowercase hex characters ({destAddr.trim().startsWith('k:') ? `${destAddr.trim().length - 2}/64 after "k:"` : 'missing the "k:" prefix'}).</p>
        )}
        {destEdited && wallet && destAddr.trim() !== wallet.account && (
          <p className={styles.muted}>
            <button className={styles.btn} onClick={() => { setDestEdited(false); setDestAddr(wallet.account); }}>use my active wallet instead</button>
          </p>
        )}
        {/* The destination's OWN balance, read live from the chain, shown with or
            without a connected wallet. This is the only place a claimer without a
            wallet can see that their tokens exist. */}
        {destBal !== null && (
          <p>
            <span className={styles.mono}>{destAddr.trim().slice(0, 14)}…</span> holds{' '}
            <b>{destBal.toLocaleString()} PCO</b> on <b>chain {CFG.chain}</b>
            <span className={styles.muted}> — read from the chain just now, not from your wallet.</span>
          </p>
        )}
        <p className={styles.muted}>{pool.toLocaleString()} PCO left in the pool</p>
        <p className={styles.muted}>Pick a round and answer its community quest (published on the PCO channels with its round id):</p>
        <p>
          <select value={roundId} onChange={(e) => setRoundId(e.target.value)}>
            {rounds.map((r) => <option key={r.id} value={r.id}>{r.id} — {r.amount} PCO (until {r.closes.slice(0, 10)})</option>)}
          </select>
        </p>
        <p>
          <input placeholder="answer" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className={styles.btn}
            disabled={busy || !open || !round || claimed || ((destEdited || !wallet) && !/^k:[0-9a-f]{64}$/.test(destAddr.trim()))}
            onClick={doClaim}>
            {round ? `claim ${round.amount} PCO` : 'claim'}
          </button>
        </p>
        {/* CLAIM RECEIPT — durable, unlike the status line, which the next message
            overwrites. A claimer with no connected wallet previously got a
            momentary "Claimed…" and nothing else: no balance (that panel needs a
            wallet) and no transaction. Since ordinary wallets do not list a
            namespaced token like PCO, their wallet showed nothing either, so a
            successful claim looked exactly like a failed one. */}
        {receipt && (
          <div className={styles.info}>
            <h3>✓ Claimed {receipt.amount.toLocaleString()} PCO — round &quot;{receipt.round}&quot;</h3>
            <p>
              Sent to <span className={styles.mono}>{receipt.account}</span> on <b>chain {CFG.chain}</b>.
              <button className={styles.btn} onClick={() => { navigator.clipboard?.writeText(receipt.account).then(() => say('Address copied.', 'ok')).catch(() => say(receipt.account)); }}>copy address</button>
            </p>
            {receipt.reqKey && (
              <p>
                Transaction: <span className={styles.mono}>{receipt.reqKey}</span>
                <button className={styles.btn} onClick={() => { navigator.clipboard?.writeText(receipt.reqKey).then(() => say('Transaction id copied.', 'ok')).catch(() => say(receipt.reqKey)); }}>copy</button>
              </p>
            )}
            <p className={styles.muted}>
              This transaction is final on Kadena mainnet. Its id (the request key) is permanent — anyone
              can check it against any Kadena node or explorer, and it is proof independent of this page.
              If your wallet does not show the PCO, that is a wallet display limit: most wallets list only
              KDA and well-known tokens, not a namespaced one like PCO. The balance above comes from the
              chain itself.
            </p>
          </div>
        )}
        {/* Live feedback. The round's code hash is public chain data and the check
            is local, so we can tell the user their answer is right BEFORE they
            click — and a wrong one never becomes a transaction, so trying again
            costs nothing and takes nothing from the sponsorship budget. */}
        {round && code.trim() !== '' && (
          <p className={styles.muted}>
            {checkCode(round, code)
              ? '✓ that matches — click claim'
              : 'not a match yet. Answers are lowercase and trimmed for you; nothing is submitted until it matches, so guessing is free.'}
          </p>
        )}
        {claimed && (
          <p className={styles.muted}>
            {destEdited && destAddr.trim() !== wallet?.account ? `That address (${destAddr.trim().slice(0, 14)}…)` : `Your active wallet (${wallet?.account.slice(0, 14)}…)`}{' '}already
            claimed round &quot;{round?.id}&quot; — one claim per account per round; it holds those tokens.
            {rounds.length > 1 && ' Other open rounds are still claimable.'}
            {' '}A different destination can still claim this round.
          </p>
        )}
      </section>

      {/* ---- Send ---- */}
      <section className={styles.card}>
        <h2>Send PCO</h2>
        <p className={styles.muted}>Send to a k: account — double-check it, transfers are irreversible.</p>
        <p><input placeholder="k:recipient account" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: '100%' }} /></p>
        <p>
          <input placeholder="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button className={styles.btn} disabled={busy || !wallet} onClick={() => doTransfer()}>send</button>
        </p>
        {/* A cross-chain send is DELIBERATELY not offered. It is a two-step
            defpact: the first step debits the source chain, and the credit only
            lands when someone submits the continuation with an SPV proof on the
            target chain. Nothing does that — not this page, and not a relay we
            control — so offering the button would debit a holder and leave the
            tokens in a pending pact. Claiming, grants and governance are all
            hub-only besides, so PCO moved off the hub can do nothing and cannot
            return by any path this page offers. Do not wire it up again without
            a continuation that has been proven end to end on a real chain. */}
      </section>

      {/* ---- Open questions (ranked-choice) ---- */}
      <section className={styles.card}>
        <h2>Open questions — ranked-choice voting</h2>
        <p className={styles.muted}>
          Questions are put on-chain by the organization (suggest yours below). Tap the options
          in your order of preference — first tap = first choice — then submit. Scores are live
          Borda points (a ballot of K options gives its 1st choice K points per token, the 2nd
          K−1, …). Re-submitting replaces your ballot. <a href="/token/guide#voting">How voting works →</a>
        </p>
        {vkCold && (
          <p className={styles.muted}>
            Voting as:{' '}
            <select value={voteMode} onChange={(e) => setVoteMode(e.target.value as 'wallet' | 'hotkey')}>
              <option value="wallet">active wallet{wallet ? ` (${wallet.account.slice(0, 14)}…)` : ''}</option>
              <option value="hotkey">{vkCold.slice(0, 14)}… via this browser&apos;s vote key</option>
            </select>
          </p>
        )}
        {proposals.length === 0 ? <p className={styles.muted}>No open questions right now.</p> : proposals.map((p) => {
          const ranking = rankings[p.pid] ?? [];
          const mine = myBallots[p.pid];
          return (
            <div key={p.pid} className={styles.proposal}>
              <h3>#{p.pid} — {p.title}</h3>
              {/* THE RESULT: head-to-head. An option wins a duel when more
                  voting weight prefers it to the other, and how much of a
                  ballot a voter filled in cannot change their favourite's
                  duels — which is why this, and not the points row, is the
                  published outcome. */}
              {p.h2h.available ? (
                <>
                  <p>
                    <b>Head-to-head</b>{' '}
                    {p.h2h.condorcet
                      ? <>— <b>{p.h2h.condorcet}</b> beats every other option</>
                      : <>— no option beats every other (the community is split)</>}
                  </p>
                  <p className={styles.muted}>
                    {p.options.map((o, i) => `${o} beats ${p.h2h.wins[i] ?? 0} of ${p.options.length - 1}`).join(' · ')}
                    {' '}— turnout {p.turnout.toLocaleString()} PCO
                    {mine && <> — your ballot: <b>{mine.ranking.map((i) => p.options[i]).join(' › ')}</b> ({mine.weight})</>}
                  </p>
                  <details>
                    <summary className={styles.muted}>every pair, and the points row</summary>
                    <p className={styles.muted}>
                      {p.options.flatMap((a, i) => p.options.map((b, j) => (i === j ? null :
                        `${a} ${p.h2h.pairs[i * p.options.length + j] ?? 0} – ${p.h2h.pairs[j * p.options.length + i] ?? 0} ${b}`
                      ))).filter(Boolean).join(' · ')}
                    </p>
                    <p className={styles.muted}>
                      Borda points (a completeness diagnostic, not the result — ranking fewer
                      options inflates them):{' '}
                      {p.options.map((o, i) => `${o}: ${p.scores[i]?.toLocaleString() ?? 0}`).join(' · ')}
                    </p>
                  </details>
                </>
              ) : (
                <p className={styles.muted}>
                  {p.options.map((o, i) => `${o}: ${p.scores[i]?.toLocaleString() ?? 0} pts`).join(' · ')}
                  {' '}— turnout {p.turnout.toLocaleString()}
                  {mine && <> — your ballot: <b>{mine.ranking.map((i) => p.options[i]).join(' › ')}</b> ({mine.weight})</>}
                  <br />This question was opened before head-to-head results existed, so only the
                  points row is available for it.
                </p>
              )}
              <p>
                {p.options.map((o, i) => (
                  <button key={i} className={styles.btn}
                    disabled={busy || ranking.includes(i)}
                    onClick={() => setRankings({ ...rankings, [p.pid]: [...ranking, i] })}>
                    {ranking.includes(i) ? `${ranking.indexOf(i) + 1}. ${o}` : o}
                  </button>
                ))}
              </p>
              <p>
                {ranking.length > 0 && (
                  <span className={styles.muted}>Your ranking: <b>{ranking.map((i) => p.options[i]).join(' › ')}</b>{' '}</span>
                )}
                <button className={styles.btn} disabled={busy || ranking.length === 0}
                  onClick={() => setRankings({ ...rankings, [p.pid]: [] })}>clear</button>
                <button className={styles.btn}
                  disabled={busy || ranking.length === 0 || (voteMode === 'hotkey' ? !vkCold : !wallet)}
                  onClick={() => doVote(p.pid)}>submit ballot</button>
              </p>
            </div>
          );
        })}
      </section>

      {/* ---- Suggest a question (off-chain -> the org makes it official) ---- */}
      <section className={styles.card}>
        <h2>Suggest a question</h2>
        <p className={styles.muted}>
          On-chain questions are <b>admin-authored</b>: the community suggests them on the public
          channels and the organization puts them on-chain (this prevents anyone from squatting
          the limited proposal slots — <a href="/token/guide#governance-design">why it works this way →</a>).
          Suggest yours on <a href="https://t.me/PactCommunityOrg" target="_blank" rel="noopener noreferrer">Telegram</a> or{' '}
          <a href="https://x.com/PactCommOrg" target="_blank" rel="noopener noreferrer">X</a>.
        </p>
      </section>

      {/* ---- Rotate (named accounts) ---- */}
      <section className={styles.card}>
        <h2>Rotate an account guard</h2>
        <p className={styles.muted}>
          Point a <b>named</b> PCO account at a new key (your active wallet must satisfy its
          current guard). Protocol note: <b>k: accounts cannot rotate</b> — their guard is
          permanently bound to their key. <a href="/token/guide#rotate">Details →</a>
        </p>
        <p><input placeholder={`account (default: your wallet account)`} value={rotAccount} onChange={(e) => setRotAccount(e.target.value)} style={{ width: '100%' }} /></p>
        <p>
          <input placeholder="new public key (64 hex)" value={rotKey} onChange={(e) => setRotKey(e.target.value)} style={{ width: '70%' }} />
          <button className={styles.btn} disabled={busy || !wallet} onClick={doRotate}>rotate guard</button>
        </p>
      </section>

      {/* ---- Look up (read-only) ---- */}
      <section className={styles.card}>
        <h2>Look up any account</h2>
        <p className={styles.muted}>Read-only — no wallet, no signature. Balances and tallies are public chain state.</p>
        <p>
          <input placeholder="account (k:… or named)" value={lookup} onChange={(e) => setLookup(e.target.value)} style={{ width: '70%' }} />
          <button className={styles.btn} disabled={busy} onClick={doLookup}>look up</button>
        </p>
        {lookupResult && (
          <>
            <p className={styles.mono}>{lookupResult.label}</p>
            {lookupResult.perChain && (
              <p className={styles.muted}>
                Per chain:{' '}
                <select>
                  {lookupResult.perChain.map((c) => (
                    <option key={c.chain} value={c.chain}>chain {c.chain} — {c.balance.toLocaleString()} PCO</option>
                  ))}
                </select>
                {' '}<span>(only chains holding PCO; voting weight counts the hub — chain 0 — balance)</span>
              </p>
            )}
          </>
        )}
      </section>

      <p className={styles.muted}>network: <span className={styles.mono}>{CFG.networkId} · chain {CFG.chain} · {CFG.ns}</span></p>
    </div>
  );
}
