// pco.ts — the PCO token actions for the page.
//
//   claim   — GASLESS: the on-chain gas station pays (station-sponsored, the
//             ONLY sponsored action). Signed by the in-browser throwaway key.
//   others  — SELF-PAID: transfer / cross-chain / vote / propose. Signed by the
//             connected wallet, which pays its own coin.GAS.
import { CFG, T, C, G, local, buildExec, submitAndPoll, cmdHash, signHash } from './chain';
import { walletSign, type ConnectedWallet, type LocalAccount } from './wallets';

// ---------- reads ----------
export type Round = { id: string; amount: number; budget: number; claimed: number; opens: string; closes: string; active: boolean };
const ptime = (v: unknown): Date => new Date(v && typeof v === 'object' ? ((v as Record<string, string>).time ?? (v as Record<string, string>).timep) : String(v));
const dec = (v: unknown) => (v && typeof v === 'object' ? Number((v as Record<string, unknown>).decimal ?? (v as Record<string, unknown>).int ?? NaN) : Number(v));

export async function stationAccount(): Promise<string> {
  return String(await local(`(${G}.station-account)`));
}
export async function masterOpen(): Promise<boolean> {
  return Boolean(await local(`(at 'open (${C}.get-config))`));
}
export async function poolBalance(): Promise<number> {
  return dec(await local(`(${C}.pool-balance)`));
}
export async function balance(account: string): Promise<number> {
  return dec(await local(`(${T}.get-balance "${account}")`).catch(() => 0));
}
export async function openRounds(): Promise<Round[]> {
  const ids = (await local(`(${C}.round-ids)`)) as string[];
  const out: Round[] = [];
  const now = new Date();
  for (const id of ids) {
    const r = (await local(`(${C}.get-round "${id}")`)) as Record<string, unknown>;
    const amount = dec(r.amount), budget = dec(r.budget), claimed = dec(r.claimed);
    const opens = ptime(r.opens), closes = ptime(r.closes);
    if (r.active && now >= opens && now < closes && claimed + amount <= budget) {
      out.push({ id, amount, budget, claimed, opens: opens.toISOString(), closes: closes.toISOString(), active: true });
    }
  }
  return out;
}
export async function alreadyClaimed(roundId: string, account: string): Promise<boolean> {
  return Boolean(await local(`(${C}.claimed "${roundId}" "${account}")`));
}
export type Proposal = { pid: string; title: string; yes: number; no: number; abstain: number };
export async function openProposals(): Promise<Proposal[]> {
  const ids = (await local(`(${T}.open-ids)`)) as string[];
  const out: Proposal[] = [];
  for (const pid of ids) {
    const r = (await local(`(${T}.get-results "${pid}")`)) as Record<string, unknown>;
    out.push({ pid, title: String(r.title ?? ''), yes: dec(r.yes), no: dec(r.no), abstain: dec(r.abstain) });
  }
  return out;
}
export async function myVote(pid: string, account: string): Promise<{ choice: string; weight: number } | null> {
  const v = await local(`(${T}.get-vote "${pid}" "${account}")`).catch(() => null);
  if (!v) return null;
  const r = v as Record<string, unknown>;
  return { choice: String(r.choice), weight: dec(r.weight) };
}

// ---------- claim (GASLESS, station-sponsored) ----------
// dest may be the browser key OR any k: account (e.g. the connected wallet):
// claims need NO signature from the claimer by design — tokens can only land
// in the account canonically bound to the supplied guard. The browser key
// signs only the station's GAS_PAYER capability.
export async function claim(round: Round, dest: { account: string; publicKey: string }, signer: LocalAccount, code: string): Promise<Record<string, unknown>> {
  const station = await stationAccount();
  const { cmd, hash } = buildExec({
    code: `(${C}.claim "${round.id}" "${dest.account}" (read-keyset 'ks) "${code}")`,
    data: { ks: { keys: [dest.publicKey], pred: 'keys-all' } },
    sender: station,
    signers: [{ pubKey: signer.publicKey, caps: [{ name: `${G}.GAS_PAYER`, args: ['web', { int: 6000 }, { decimal: '0.0000001' }] }] }],
    gasLimit: 6000, gasPrice: 1e-8,
  });
  return submitAndPoll({ cmd, hash, sigs: [{ sig: signHash(hash, signer.secretKey) }] });
}

export async function kdaBalance(account: string): Promise<number> {
  return dec(await local(`(coin.get-balance "${account}")`).catch(() => 0)) || 0;
}

// ---------- self-paid actions (connected wallet pays its own gas) ----------
async function selfPaid(w: ConnectedWallet, code: string, caps: { name: string; args: unknown[] }[], data?: Record<string, unknown>): Promise<Record<string, unknown>> {
  const unsigned = buildExec({
    code, data,
    sender: w.account,
    signers: [{ pubKey: w.publicKey, caps: [{ name: 'coin.GAS', args: [] }, ...caps] }],
    gasLimit: 2500, gasPrice: 1e-7,
  });
  const signed = await walletSign(w, unsigned, caps);
  return submitAndPoll(signed);
}

export function transfer(w: ConnectedWallet, to: string, amount: string) {
  return selfPaid(w,
    `(${T}.transfer-create "${w.account}" "${to}" (read-keyset 'rg) ${amount})`,
    [{ name: `${T}.TRANSFER`, args: [w.account, to, { decimal: amount }] }],
    { rg: { keys: [to.slice(2)], pred: 'keys-all' } });
}
export function transferCrossChain(w: ConnectedWallet, to: string, targetChain: string, amount: string) {
  return selfPaid(w,
    `(${T}.transfer-crosschain "${w.account}" "${to}" (read-keyset 'rg) "${targetChain}" ${amount})`,
    [{ name: `${T}.TRANSFER_XCHAIN`, args: [w.account, to, { decimal: amount }, targetChain] }],
    { rg: { keys: [to.slice(2)], pred: 'keys-all' } });
}
export function vote(w: ConnectedWallet, pid: string, choice: string) {
  return selfPaid(w, `(${T}.cast-vote "${pid}" "${w.account}" "${choice}")`, [{ name: `${T}.VOTE`, args: [pid, w.account] }]);
}
// Cast a vote FOR another account (the cold one) signed by its registered vote
// key — the signer w is the HOT key and pays its own gas.
export function voteAs(w: ConnectedWallet, coldAccount: string, pid: string, choice: string) {
  return selfPaid(w, `(${T}.cast-vote "${pid}" "${coldAccount}" "${choice}")`, [{ name: `${T}.VOTE`, args: [pid, coldAccount] }]);
}
// Register/replace the account's dedicated vote key (MAIN wallet signs, scoped
// to VOTE-KEY-ADMIN). The hot key can then ONLY vote — nothing else.
export function setVoteKey(w: ConnectedWallet, hotPubKey: string) {
  return selfPaid(w, `(${T}.set-vote-key "${w.account}" (read-keyset 'vk))`,
    [{ name: `${T}.VOTE-KEY-ADMIN`, args: [w.account] }],
    { vk: { keys: [hotPubKey], pred: 'keys-all' } });
}
export function clearVoteKey(w: ConnectedWallet) {
  return selfPaid(w, `(${T}.clear-vote-key "${w.account}")`,
    [{ name: `${T}.VOTE-KEY-ADMIN`, args: [w.account] }]);
}
export async function voteKeyActive(account: string): Promise<boolean> {
  return Boolean(await local(`(at 'active (${T}.get-vote-key "${account}"))`).catch(() => false));
}
// Rotate an account's guard (the wallet must satisfy the CURRENT guard;
// scoped ROTATE cap). NOTE: principal (k:) accounts cannot rotate away from
// their canonical guard — rotation is meaningful for NAMED accounts only;
// the UI enforces this before building the transaction.
export function rotate(w: ConnectedWallet, account: string, newPubKey: string) {
  return selfPaid(w, `(${T}.rotate "${account}" (read-keyset 'ng))`,
    [{ name: `${T}.ROTATE`, args: [account] }],
    { ng: { keys: [newPubKey], pred: 'keys-all' } });
}
// Read-only lookups — no wallet, no signature.
export async function lookupAccount(account: string): Promise<{ balance: number } | null> {
  try { return { balance: dec(await local(`(${T}.get-balance "${account}")`)) }; }
  catch { return null; }
}
export function propose(w: ConnectedWallet, title: string, body: string, days: number) {
  const clean = (s: string) => s.replace(/["\\]/g, '');
  return selfPaid(w, `(${T}.create-proposal "${w.account}" "${clean(title)}" "${clean(body)}" ${days * 24})`, [{ name: `${T}.PROPOSE`, args: [w.account] }]);
}

// ---------- in-browser test key (localStorage; the gasless-claim identity) ----------
const KEY = 'pco-devnet-key';
export function loadOrCreateLocalKey(): LocalAccount {
  if (typeof window === 'undefined') return { account: '', publicKey: '', secretKey: '' };
  const stored = localStorage.getItem(KEY);
  if (stored) return JSON.parse(stored);
  // generate via @noble in the browser
  const priv = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, '0')).join('');
  const pub = pubFromPriv(priv);
  const acct: LocalAccount = { account: `k:${pub}`, publicKey: pub, secretKey: priv };
  localStorage.setItem(KEY, JSON.stringify(acct));
  return acct;
}
export function saveLocalKey(acct: LocalAccount) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(acct));
}
// small helper so pco.ts stays self-contained
import { ed25519 } from '@noble/curves/ed25519';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
function pubFromPriv(privHex: string): string {
  return bytesToHex(ed25519.getPublicKey(hexToBytes(privHex)));
}

export { CFG, cmdHash };
