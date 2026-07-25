'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/styles/token.module.css';
import { CFG } from '@/lib/chain';
import {
  loadOrCreateLocalKey, saveLocalKey, openRounds, alreadyClaimed, poolBalance, masterOpen,
  balance, openProposals, myVote, claim, transfer, transferCrossChain, vote, propose,
  voteAs, setVoteKey, clearVoteKey, voteKeyActive, rotate, lookupAccount,
  type Round, type Proposal,
} from '@/lib/pco';
import {
  connectEcko, connectZelcore, connectLedger, connectLocalKey, eckoAvailable,
  type ConnectedWallet, type LocalAccount,
} from '@/lib/wallets';

type Status = { msg: string; kind: 'info' | 'ok' | 'err' } | null;

export default function TokenApp() {
  const [key, setKey] = useState<LocalAccount | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundId, setRoundId] = useState('');
  const [code, setCode] = useState('');
  const [pool, setPool] = useState(0);
  const [open, setOpen] = useState(false);
  const [keyBal, setKeyBal] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [walletBal, setWalletBal] = useState(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, { choice: string; weight: number } | null>>({});
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [xchain, setXchain] = useState('');
  const [pTitle, setPTitle] = useState('');
  const [pBody, setPBody] = useState('');
  const [pDays, setPDays] = useState('7');
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [vkActive, setVkActive] = useState(false);
  const [vkCold, setVkCold] = useState('');          // cold account this browser's key votes for
  const [voteMode, setVoteMode] = useState<'wallet' | 'hotkey'>('wallet');
  const [rotAccount, setRotAccount] = useState('');
  const [rotKey, setRotKey] = useState('');
  const [lookup, setLookup] = useState('');
  const [lookupResult, setLookupResult] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const say = (msg: string, kind: Status extends null ? never : 'info' | 'ok' | 'err' = 'info') => setStatus({ msg, kind });

  const refresh = useCallback(async () => {
    try {
      const k = key ?? loadOrCreateLocalKey();
      if (!key) setKey(k);
      const [op, pl, kb, rs, props] = await Promise.all([
        masterOpen(), poolBalance(), balance(k.account), openRounds(), openProposals(),
      ]);
      setOpen(op); setPool(pl); setKeyBal(kb);
      setRounds(op ? rs : []);
      setProposals(props);
      if (op && rs.length && !rs.some((r) => r.id === roundId)) setRoundId(rs[0].id);
      const sel = rs.find((r) => r.id === roundId) ?? rs[0];
      setClaimed(sel ? await alreadyClaimed(sel.id, k.account) : false);
      if (wallet) {
        setWalletBal(await balance(wallet.account));
        setVkActive(await voteKeyActive(wallet.account));
        const mv: Record<string, { choice: string; weight: number } | null> = {};
        for (const p of props) mv[p.pid] = await myVote(p.pid, wallet.account);
        setMyVotes(mv);
      }
      const cold = localStorage.getItem('pco-votekey-cold') ?? '';
      setVkCold(cold && (await voteKeyActive(cold)) ? cold : '');
    } catch (e) {
      say(`Cannot reach devnet: ${(e as Error).message}`, 'err');
    }
  }, [key, roundId, wallet]);

  useEffect(() => { void refresh(); const t = setInterval(() => { void refresh(); }, 30000); return () => clearInterval(t); }, [refresh]);

  const selectedRound = () => rounds.find((r) => r.id === roundId) ?? rounds[0];

  const doClaim = async () => {
    const round = selectedRound(); const k = key!;
    if (!round) return say('No open round right now.', 'err');
    if (!code.trim()) return say('Enter the engagement code first.', 'err');
    setBusy(true); say(`Claiming "${round.id}" (the gas station pays the fee)…`);
    try { await claim(round, k, code.trim().toLowerCase()); say(`Claimed ${round.amount} PCO!`, 'ok'); setCode(''); }
    catch (e) { say(`Claim failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  const connect = async (kind: 'ecko' | 'zelcore' | 'ledger' | 'localkey') => {
    say(`Connecting ${kind}…`);
    try {
      let w: ConnectedWallet;
      if (kind === 'ecko') w = await connectEcko((reason) => { setWallet(null); say(reason, 'err'); });
      else if (kind === 'zelcore') w = await connectZelcore();
      else if (kind === 'ledger') w = await connectLedger();
      else w = connectLocalKey(key ?? loadOrCreateLocalKey());
      setWallet(w); say(`Connected: ${w.label} · ${w.account.slice(0, 16)}…`, 'ok'); void refresh();
    } catch (e) { say((e as Error).message, 'err'); }
  };

  const AMOUNT_RE = /^\d+(\.\d{1,12})?$/;
  const validTo = /^k:[0-9a-f]{64}$/.test(to);

  const doTransfer = async (direction: 'same' | 'x') => {
    if (!wallet) return say('Connect a wallet first.', 'err');
    if (!validTo) return say('Recipient must be a k: account (k: + 64 hex).', 'err');
    if (!AMOUNT_RE.test(amount) || Number(amount) <= 0) return say('Amount must be a positive number.', 'err');
    const amt = amount.includes('.') ? amount : `${amount}.0`;
    if (direction === 'x' && (!/^([0-9]|1[0-9])$/.test(xchain) || xchain === CFG.chain)) return say('Cross-chain: pick a chain 0–19 that is not the current chain.', 'err');
    setBusy(true); say(`Sending ${amt} PCO (your wallet pays the gas)…`);
    try {
      if (direction === 'x') { await transferCrossChain(wallet, to, xchain, amt); say(`Cross-chain send started to chain ${xchain}.`, 'ok'); }
      else { await transfer(wallet, to, amt); say(`Sent ${amt} PCO.`, 'ok'); }
      setTo(''); setAmount('');
    } catch (e) { say(`Transfer failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  const doVote = async (pid: string, choice: string) => {
    if (voteMode === 'hotkey' && vkCold && key) {
      // the browser key is a registered VOTE KEY for the cold account: it signs
      // and pays its own gas; the cold wallet never comes out for voting
      setBusy(true); say(`Casting ${choice} as ${vkCold.slice(0, 14)}… with the browser vote key…`);
      try { await voteAs(connectLocalKey(key), vkCold, pid, choice); say(`Voted ${choice} as the cold account (vote key signed).`, 'ok'); }
      catch (e) { say(`Vote-key vote failed: ${(e as Error).message}`, 'err'); }
      setBusy(false); void refresh(); return;
    }
    if (!wallet) return say('Connect a wallet to vote (you pay your own gas).', 'err');
    setBusy(true); say(`Casting ${choice} on ${pid}…`);
    try { await vote(wallet, pid, choice); say(`Voted ${choice} on ${pid}.`, 'ok'); }
    catch (e) { say(`Vote failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  const doRegisterVoteKey = async () => {
    if (!wallet || !key) return say('Connect your main wallet first.', 'err');
    setBusy(true); say("Registering this browser's key as your vote key (your wallet signs)…");
    try {
      await setVoteKey(wallet, key.publicKey);
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
    if (!wallet) return say('Connect a wallet first.', 'err');
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
    setLookupResult('…');
    const r = await lookupAccount(a);
    setLookupResult(r !== null ? `${a.length > 24 ? a.slice(0, 24) + '…' : a} holds ${r.balance.toLocaleString()} PCO` : 'No PCO account found under that name.');
  };

  const doPropose = async () => {
    if (!wallet) return say('Connect a wallet to propose.', 'err');
    if (!pTitle.trim() || !pBody.trim()) return say('Title and description are required.', 'err');
    const days = Number(pDays);
    if (!Number.isInteger(days) || days < 3 || days > 30) return say('Days open must be 3–30.', 'err');
    setBusy(true); say('Opening your advisory proposal…');
    try { await propose(wallet, pTitle, pBody, days); say(`Proposal opened: "${pTitle}".`, 'ok'); setPTitle(''); setPBody(''); }
    catch (e) { say(`Proposal failed: ${(e as Error).message}`, 'err'); }
    setBusy(false); void refresh();
  };

  const backup = () => {
    if (!key) return;
    const blob = new Blob([JSON.stringify(key, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pco-devnet-key.json'; a.click();
  };
  const restore = () => fileRef.current?.click();
  const onRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(String(r.result));
        if (!/^[0-9a-f]{64}$/.test(j.secretKey) || !/^[0-9a-f]{64}$/.test(j.publicKey)) throw new Error('not a PCO key backup');
        const acct: LocalAccount = { account: `k:${j.publicKey}`, publicKey: j.publicKey, secretKey: j.secretKey };
        saveLocalKey(acct); setKey(acct); say(`Restored ${acct.account.slice(0, 14)}…`, 'ok'); void refresh();
      } catch (err) { say(`Could not restore: ${(err as Error).message}`, 'err'); }
      if (fileRef.current) fileRef.current.value = '';
    };
    r.readAsText(f);
  };

  const round = selectedRound();
  const canPropose = !!wallet && walletBal >= 1000;

  return (
    <div className={styles.app}>
      {status && <div className={`${styles.status} ${styles[status.kind]}`}>{status.msg}</div>}

      {/* ---- 1. Claim (no wallet, gasless) ---- */}
      <section className={styles.card}>
        <h2>1 · Claim — no wallet, no fee</h2>
        <p className={styles.muted}>
          A key is generated in this browser and the on-chain gas station pays the fee, so claiming
          needs <b>no wallet and no KDA</b>. This is the only action the station sponsors.
        </p>
        <p className={styles.mono}>{key?.account ?? '…'}</p>
        <p className={styles.muted}>
          <b>This key lives only in this browser.</b> Keep the backup — clearing storage deletes it.
          <button className={styles.btn} onClick={backup}>download key backup</button>
          <button className={styles.btn} onClick={restore}>restore from backup</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={onRestore} />
        </p>
        <p>This browser key holds: <b>{keyBal.toLocaleString()} PCO</b></p>
        <hr />
        <h3>Claim — {open ? (rounds.length ? `${rounds.length} open round${rounds.length > 1 ? 's' : ''}` : 'no open rounds') : 'CLOSED'}</h3>
        <p className={styles.muted}>{pool.toLocaleString()} PCO left in the pool</p>
        <p className={styles.muted}>Pick a round and answer its community quest (published on the PCO channels with its round id):</p>
        <p>
          <select value={roundId} onChange={(e) => { setRoundId(e.target.value); void refresh(); }}>
            {rounds.map((r) => <option key={r.id} value={r.id}>{r.id} — {r.amount} PCO (until {r.closes.slice(0, 10)})</option>)}
          </select>
        </p>
        <p>
          <input placeholder="engagement code" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className={styles.btn} disabled={busy || !open || !round || claimed} onClick={doClaim}>
            {round ? `claim ${round.amount} PCO` : 'claim'}
          </button>
        </p>
        {claimed && <p className={styles.muted}>This key already claimed round &quot;{round?.id}&quot;. One claim per account per round.</p>}
      </section>

      {/* ---- 2. Do more — connect a wallet ---- */}
      <section className={styles.card}>
        <h2>2 · Do more — connect a wallet</h2>
        <p className={styles.muted}>
          Transferring, voting, and proposing are <b>not gas-sponsored</b> (only claiming is). Connect
          a wallet holding a little devnet KDA — it signs and pays. On this preview, the simplest is
          the <b>in-browser test key</b> (fund it from the devnet faucet or the seed script).
        </p>
        <p>
          Wallet: <b className={styles.mono}>{wallet ? wallet.account : 'not connected'}</b>
        </p>
        {!wallet ? (
          <p className={styles.walletButtons}>
            <button className={styles.btn} onClick={() => connect('localkey')}>use in-browser key</button>
            <button className={styles.btn} disabled={!eckoAvailable()} onClick={() => connect('ecko')}>
              EckoWallet{!eckoAvailable() && ' (not detected)'}
            </button>
            <button className={styles.btn} onClick={() => connect('zelcore')}>Zelcore</button>
            <button className={styles.btn} onClick={() => connect('ledger')}>Ledger</button>
          </p>
        ) : (
          <>
            <p>
              Wallet holds: <b>{walletBal.toLocaleString()} PCO</b>
              <button className={styles.btn} onClick={() => { wallet.disconnect?.(); setWallet(null); say('Wallet disconnected.'); }}>disconnect</button>
            </p>
            <hr />
            <h3>Voting key {vkActive ? '— active' : '— none registered'}</h3>
            <p className={styles.muted}>
              Register this browser&apos;s key as a dedicated <b>vote key</b> for your account: it can
              then vote on your behalf while your main wallet stays cold. The vote key can <b>only
              vote</b> — it can never transfer, rotate, or re-point itself. Your main wallet always
              keeps its own voting power and can clear the key at any time.{' '}
              <a href="/token/guide#voting-key">How this works →</a>
            </p>
            <p>
              {!vkActive
                ? <button className={styles.btn} disabled={busy} onClick={doRegisterVoteKey}>register browser key as vote key</button>
                : <button className={styles.btn} disabled={busy} onClick={doClearVoteKey}>clear vote key</button>}
            </p>
          </>
        )}
      </section>

      {/* ---- Send ---- */}
      <section className={styles.card}>
        <h2>Send PCO</h2>
        <p className={styles.muted}>Send to a k: account — double-check it, transfers are irreversible. Same-chain or cross-chain.</p>
        <p><input placeholder="k:recipient account" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: '100%' }} /></p>
        <p>
          <input placeholder="amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button className={styles.btn} disabled={busy || !wallet} onClick={() => doTransfer('same')}>send (this chain)</button>
        </p>
        <p>
          <label className={styles.muted}>cross-chain to chain <input placeholder="0–19" value={xchain} onChange={(e) => setXchain(e.target.value)} style={{ width: '4rem' }} /></label>
          <button className={styles.btn} disabled={busy || !wallet} onClick={() => doTransfer('x')}>send cross-chain</button>
        </p>
      </section>

      {/* ---- Proposals ---- */}
      <section className={styles.card}>
        <h2>Open advisory proposals</h2>
        {vkCold && (
          <p className={styles.muted}>
            Voting as:{' '}
            <select value={voteMode} onChange={(e) => setVoteMode(e.target.value as 'wallet' | 'hotkey')}>
              <option value="wallet">connected wallet{wallet ? ` (${wallet.account.slice(0, 14)}…)` : ''}</option>
              <option value="hotkey">{vkCold.slice(0, 14)}… via this browser&apos;s vote key</option>
            </select>
          </p>
        )}
        {proposals.length === 0 ? <p className={styles.muted}>No open proposals right now.</p> : proposals.map((p) => (
          <div key={p.pid} className={styles.proposal}>
            <h3>#{p.pid} — {p.title}</h3>
            <p className={styles.muted}>
              yes {p.yes.toLocaleString()} · no {p.no.toLocaleString()} · abstain {p.abstain.toLocaleString()}
              {myVotes[p.pid] && <> — your vote: <b>{myVotes[p.pid]!.choice}</b> ({myVotes[p.pid]!.weight})</>}
            </p>
            <p>
              {['yes', 'no', 'abstain'].map((ch) => (
                <button key={ch} className={styles.btn}
                  disabled={busy || (voteMode === 'hotkey' ? !vkCold : !wallet)}
                  onClick={() => doVote(p.pid, ch)}>vote {ch}</button>
              ))}
            </p>
          </div>
        ))}
      </section>

      {/* ---- Rotate (named accounts) ---- */}
      <section className={styles.card}>
        <h2>Rotate an account guard</h2>
        <p className={styles.muted}>
          Point a <b>named</b> PCO account at a new key (your connected wallet must satisfy its
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
        {lookupResult && <p className={styles.mono}>{lookupResult}</p>}
      </section>

      {/* ---- Propose ---- */}
      <section className={styles.card}>
        <h2>Open a proposal</h2>
        <p className={styles.muted}>
          {!wallet ? 'Connect a wallet to open a proposal (you pay your own gas).'
            : canPropose ? 'Advisory only — proposals signal, they never execute. Up to three may be open community-wide.'
              : `Opening a proposal needs 1,000 PCO (your wallet holds ${walletBal.toLocaleString()}).`}
        </p>
        <p><input placeholder="title" value={pTitle} maxLength={120} onChange={(e) => setPTitle(e.target.value)} style={{ width: '100%' }} /></p>
        <p><input placeholder="what should the community weigh in on?" value={pBody} maxLength={500} onChange={(e) => setPBody(e.target.value)} style={{ width: '100%' }} /></p>
        <p>
          <input placeholder="days (3–30)" value={pDays} onChange={(e) => setPDays(e.target.value)} style={{ width: '6rem' }} />
          <button className={styles.btn} disabled={busy || !canPropose} onClick={doPropose}>open proposal</button>
        </p>
      </section>

      <p className={styles.muted}>network: <span className={styles.mono}>{CFG.networkId} · chain {CFG.chain} · {CFG.ns}</span></p>
    </div>
  );
}
