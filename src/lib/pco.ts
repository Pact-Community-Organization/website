// pco.ts — the PCO token actions for the page.
//
//   claim   — GASLESS and SIGNATURE-FREE for the user: the on-chain gas station
//             pays (the ONLY sponsored action), authorised by an ephemeral
//             in-memory key. No wallet prompt, no device, no KDA.
//   others  — SELF-PAID: transfer / cross-chain / vote / vote-key / rotate. Signed
//             by the connected wallet, which pays its own coin.GAS. (Proposals are
//             ADMIN-AUTHORED — PROPOSAL-OPS gates create/cancel to the gov or ops
//             keyset — so this library deliberately exposes no propose path.)
import { CFG, T, C, G, CHAINS, local, localOn, buildExec, submitAndPoll, cmdHash, pactHash, signHash, ephemeralGasSigner, supportsChainLocalVoting } from './chain';
import { walletSign, type ConnectedWallet } from './wallets';

// ---------- reads ----------
export type Round = { id: string; amount: number; budget: number; claimed: number; opens: string; closes: string; active: boolean; codeHash: string };
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
      out.push({
        id, amount, budget, claimed,
        opens: opens.toISOString(), closes: closes.toISOString(), active: true,
        // The round's code hash is PUBLIC chain data. Carrying it here is what
        // lets checkCode() reject a wrong answer without spending the station's
        // float — see the comment on that function.
        codeHash: String((r as Record<string, unknown>)['code-hash'] ?? ''),
      });
    }
  }
  return out;
}
export async function alreadyClaimed(roundId: string, account: string): Promise<boolean> {
  return Boolean(await local(`(${C}.claimed "${roundId}" "${account}")`));
}
// Ranked-choice questions: options + live Borda scores (a ballot ranking
// option i at position p contributes weight*(K-p) points).
// The AUTHORITATIVE result is the head-to-head record; the Borda `scores` are
// kept only as a truncation diagnostic (ranking fewer options inflates them).
export type Proposal = {
  pid: string; title: string; options: string[]; scores: number[]; turnout: number;
  h2h: { available: boolean; pairs: number[]; wins: number[]; condorcet: string };
  /** true once the deployed module tallies per chain rather than hub-only. */
  chainLocal: boolean;
  /** true when at least one chain could not be read, so the total is incomplete. */
  partial: boolean;
};

/**
 * Copeland count from a pairwise matrix — how many other options each one beats
 * head to head.
 *
 * THIS MUST AGREE EXACTLY WITH TWO OTHER IMPLEMENTATIONS: `h2h-wins` in
 * pco.pact and `copeland` in the token repo's ops/src/combine-votes.ts. All
 * three require a STRICT majority, so an exact pairwise tie credits neither
 * side. If they diverged, the page, the chain and the published result could
 * each name a different winner for the same ballots.
 */
function copeland(pairs: number[], k: number): number[] {
  return Array.from({ length: k }, (_, i) => {
    let w = 0;
    for (let j = 0; j < k; j++) if (i !== j && pairs[i * k + j] > pairs[j * k + i]) w++;
    return w;
  });
}

/**
 * SUM THE MATRICES, THEN DECIDE ONCE. Head-to-head is not additive through its
 * winner: combining per-chain winners can elect an option that loses the actual
 * head-to-head, which is why this adds the raw matrices and runs Copeland on the
 * total rather than asking each chain who won.
 *
 * REFUSES TO PRESENT A PARTIAL TOTAL AS A RESULT. A chain that does not answer is
 * not a zero — it is an unknown — so the count of chains read is carried out to
 * the UI as `partial`, and the caller says so rather than quietly showing a
 * smaller number. The authoritative published result comes from the token repo's
 * combine-votes, which additionally refuses to publish at all under nine
 * conditions; this is the live view, not the certificate.
 */
async function combineAcrossChains(pid: string):
  Promise<{ h2h: Proposal['h2h']; turnout: number; partial: boolean } | null> {
  const reads = await Promise.all(CHAINS.map(async (ch) => {
    try {
      const h = (await localOn(ch, `(${T}.get-head-to-head "${pid}")`)) as Record<string, unknown>;
      return { ch, h };
    } catch { return null; }
  }));
  const good = reads.filter((x): x is { ch: string; h: Record<string, unknown> } => x !== null);
  if (!good.length) return null;

  const first = good[0].h;
  const k = ((first.options as string[]) ?? []).length;
  if (!k) return null;
  const pairs = new Array<number>(k * k).fill(0);
  let turnout = 0;
  let any = false;
  for (const { h } of good) {
    turnout += dec(h.turnout);
    if (!h.available || !Array.isArray(h.pairs) || (h.pairs as unknown[]).length !== k * k) continue;
    any = true;
    (h.pairs as unknown[]).forEach((v, i) => { pairs[i] += dec(v); });
  }
  const wins = copeland(pairs, k);
  const ci = wins.findIndex((w) => w === k - 1);
  return {
    turnout,
    partial: good.length !== CHAINS.length,
    h2h: { available: any, pairs, wins, condorcet: ci >= 0 ? (first.options as string[])[ci] : '' },
  };
}
export async function openProposals(): Promise<Proposal[]> {
  const ids = (await local(`(${T}.open-ids)`)) as string[];
  // The governance upgrade makes voting CHAIN-LOCAL: each chain tallies only its own
  // ballots, and the result is the sum of all 20. Until the upgrade lands this
  // page keeps reading the hub alone, which is correct there and only there —
  // under the new module chain 0's tally is ONE chain's tally, not the result.
  const chainLocal = await supportsChainLocalVoting(CFG.chain).catch(() => false);
  const out: Proposal[] = [];
  for (const pid of ids) {
    const r = (await local(`(${T}.get-results "${pid}")`)) as Record<string, unknown>;
    const h = (await local(`(${T}.get-head-to-head "${pid}")`).catch(() => null)) as Record<string, unknown> | null;
    const combined = chainLocal ? await combineAcrossChains(pid) : null;
    out.push({
      pid, title: String(r.title ?? ''),
      options: (r.options as string[]) ?? [],
      scores: ((r.scores as unknown[]) ?? []).map(dec),
      turnout: combined ? combined.turnout : dec(r.turnout),
      chainLocal,
      partial: combined ? combined.partial : false,
      h2h: combined ? combined.h2h : {
        available: Boolean(h?.available),
        pairs: ((h?.pairs as unknown[]) ?? []).map(dec),
        wins: ((h?.wins as unknown[]) ?? []).map(dec),
        condorcet: String(h?.condorcet ?? ''),
      },
    });
  }
  return out;
}
export async function myBallot(pid: string, account: string): Promise<{ ranking: number[]; weight: number } | null> {
  const v = await local(`(${T}.get-ballot "${pid}" "${account}")`).catch(() => null);
  if (!v) return null;
  const r = v as Record<string, unknown>;
  return { ranking: ((r.ranking as unknown[]) ?? []).map(dec), weight: dec(r.weight) };
}

// ---------- claim (GASLESS, station-sponsored, no user signature) ----------
/** Normalize an answer the way the round's code hash was computed: trim, lowercase. */
export function normalizeCode(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Does this answer match the round, WITHOUT touching the chain?
 *
 * WHY THIS EXISTS. A claim is station-sponsored, so the claimer pays no gas —
 * but the station does, and it pays for FAILED claims too. `charge-meter` runs
 * inside `GAS_PAYER`, i.e. in the buy-gas phase, which completes before the
 * payload is executed; a payload that then fails on the code check has already
 * cost the station its gas and consumed a slot in the daily epoch budget.
 *
 * So without this check, every wrong answer is a paid-for transaction that
 * accomplished nothing, and enough of them lock out people with the right
 * answer until the epoch rolls over.
 *
 * The round's `code-hash` is public chain data and the hash is plain BLAKE2b-256
 * over the normalized answer, so the comparison is exact and needs no network
 * round trip. A wrong answer never becomes a transaction.
 *
 * This is a COURTESY, not a security control: codes are engagement devices, not
 * secrets, and the contract enforces the real rule regardless of what any client
 * does. Never treat a client-side pass as authorization.
 */
export function checkCode(round: Round, raw: string): boolean {
  if (!round.codeHash) return true;   // unknown hash: let the chain decide rather than block a claim
  return pactHash(normalizeCode(raw)) === round.codeHash;
}

/**
 * Claim a round. THE USER SIGNS NOTHING.
 *
 * Claims carry no claimer signature by design: tokens can only land in the
 * account canonically bound to the guard supplied with the claim, so proving who
 * you are is unnecessary. What the transaction DOES need is a signer declaring
 * the station's GAS_PAYER capability — that is how the node knows to open the
 * station's guard and let it pay the fee.
 *
 * That signer is an EPHEMERAL key held only in memory (see ephemeralGasSigner).
 * It authorises a fee payment and nothing else, so it does not matter who holds
 * it, and it is gone when the tab closes.
 *
 * Result: no wallet popup, no device, no KDA. Type the answer and click.
 *
 * Two other designs were tried on the way here and both were worse. A PERSISTED
 * browser key did the same job but had to be backed up, restored and imported —
 * which is exactly the surface a phishing clone imitates. Making the connected
 * wallet sign removed that surface but put a prompt in front of every claim, for
 * a signature that only ever said "the station may pay this fee".
 *
 * `dest` may be any k: account: the connected wallet, or an address pasted from
 * a hardware wallet that never comes online.
 */
export async function claim(round: Round, dest: { account: string; publicKey: string }, code: string): Promise<Record<string, unknown>> {
  // Refuse locally before building anything. See checkCode().
  if (!checkCode(round, code)) {
    throw new Error("That answer doesn't match this round. Check it and try again — nothing was submitted.");
  }
  // SUBMIT THE NORMALIZED FORM, not the raw input. The contract does
  // `(enforce (= ch (hash code)))` on the string exactly as supplied — it does
  // not trim or lowercase — so sending the raw text after checking the
  // normalized one would pass here and fail on chain, which is worse than not
  // checking at all: it spends the station's gas on an answer we already knew
  // matched.
  const submitted = normalizeCode(code);
  const station = await stationAccount();
  const eph = ephemeralGasSigner();
  const { cmd, hash } = buildExec({
    code: `(${C}.claim "${round.id}" "${dest.account}" (read-keyset 'ks) "${submitted}")`,
    data: { ks: { keys: [dest.publicKey], pred: 'keys-all' } },
    sender: station,
    signers: [{ pubKey: eph.publicKey, caps: [{ name: `${G}.GAS_PAYER`, args: ['web', { int: 6000 }, { decimal: '0.0000001' }] }] }],
    gasLimit: 6000, gasPrice: 1e-8,
  });
  return submitAndPoll({ cmd, hash, sigs: [{ sig: signHash(hash, eph.secretKey) }] });
}

export async function kdaBalance(account: string): Promise<number> {
  return dec(await local(`(coin.get-balance "${account}")`).catch(() => 0)) || 0;
}

// ---------- self-paid actions (connected wallet pays its own gas) ----------
// `chainId` defaults to the hub, so every existing caller is unchanged. Only the
// vote path passes anything else, and only once the deployed module accepts it —
// the same value goes into the SIGNED payload and selects the endpoint, because
// a mismatch between the two is rejected by the node.
async function selfPaid(w: ConnectedWallet, code: string, caps: { name: string; args: unknown[] }[], data?: Record<string, unknown>, chainId: string = CFG.chain): Promise<Record<string, unknown>> {
  const unsigned = buildExec({
    code, data, chainId,
    sender: w.account,
    signers: [{ pubKey: w.publicKey, caps: [{ name: 'coin.GAS', args: [] }, ...caps] }],
    gasLimit: 2500, gasPrice: 1e-7,
  });
  const signed = await walletSign(w, unsigned, caps);
  return submitAndPoll(signed, chainId);
}

export function transfer(w: ConnectedWallet, to: string, amount: string) {
  return selfPaid(w,
    `(${T}.transfer-create "${w.account}" "${to}" (read-keyset 'rg) ${amount})`,
    [{ name: `${T}.TRANSFER`, args: [w.account, to, { decimal: amount }] }],
    { rg: { keys: [to.slice(2)], pred: 'keys-all' } });
}
// DELIBERATELY NOT WIRED INTO THE UI. This submits step 0 of a two-step defpact:
// it debits the source chain, and the credit only lands when someone submits the
// continuation with an SPV proof on the TARGET chain. Nothing does that — not this
// page, and not a relay we operate — so exposing it debits a holder and leaves the
// tokens in a pending pact. The guide used to promise the continuation "is finished
// automatically", which was false.
// Kept here, unexposed, because the call itself is correct and a real relay is a
// reasonable future feature: fetch the proof from the source chain's /spv endpoint
// and submit the continuation on the target chain with the public
// `kadena-xchain-gas` station as the gas payer (the holder will not have KDA
// there). Do not re-export this to the UI until that path is proven end to end on
// a real chain — a half-built relay strands funds more quietly than no relay.
export function transferCrossChain(w: ConnectedWallet, to: string, targetChain: string, amount: string) {
  return selfPaid(w,
    `(${T}.transfer-crosschain "${w.account}" "${to}" (read-keyset 'rg) "${targetChain}" ${amount})`,
    [{ name: `${T}.TRANSFER_XCHAIN`, args: [w.account, to, { decimal: amount }, targetChain] }],
    { rg: { keys: [to.slice(2)], pred: 'keys-all' } });
}
const rankStr = (ranking: number[]) => `[${ranking.join(' ')}]`;
// VOTING FROM A CHOSEN CHAIN. `chainId` is optional and defaults
// to the hub, so behaviour against the currently deployed hub-only module is
// unchanged. Callers must not offer a non-hub chain until
// supportsChainLocalVoting(chain) answers true for THAT chain — the deployed
// module aborts an off-hub ballot with "governance lives on the hub chain only",
// and a 20-transaction upgrade lands one chain at a time.
export function vote(w: ConnectedWallet, pid: string, ranking: number[], chainId?: string) {
  return selfPaid(w, `(${T}.cast-vote "${pid}" "${w.account}" ${rankStr(ranking)})`, [{ name: `${T}.VOTE`, args: [pid, w.account] }], undefined, chainId);
}
// Cast a ballot FOR another account (the cold one) signed by its registered
// vote key — the signer w is the HOT key and pays its own gas.
export function voteAs(w: ConnectedWallet, coldAccount: string, pid: string, ranking: number[], chainId?: string) {
  return selfPaid(w, `(${T}.cast-vote "${pid}" "${coldAccount}" ${rankStr(ranking)})`, [{ name: `${T}.VOTE`, args: [pid, coldAccount] }], undefined, chainId);
}
// Register/replace the account's dedicated vote key (MAIN wallet signs, scoped
// to VOTE-KEY-ADMIN). The hot key can then ONLY vote — nothing else.
export function setVoteKey(w: ConnectedWallet, hotPubKey: string) {
  return selfPaid(w, `(${T}.set-vote-key "${w.account}" (read-keyset 'vk))`,
    // the registered key's principal is IN the capability, so a substituted
    // key changes what the wallet displays (audit F-12)
    [{ name: `${T}.VOTE-KEY-ADMIN`, args: [w.account, `k:${hotPubKey}`] }],
    { vk: { keys: [hotPubKey], pred: 'keys-all' } });
}
export function clearVoteKey(w: ConnectedWallet) {
  return selfPaid(w, `(${T}.clear-vote-key "${w.account}")`,
    [{ name: `${T}.VOTE-KEY-ADMIN`, args: [w.account, ''] }]);
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
    // the DESTINATION guard's principal is IN the capability, so a hostile
    // page cannot swap the data block and install another key under a
    // signature the user verified (audit F-12)
    [{ name: `${T}.ROTATE`, args: [account, `k:${newPubKey}`] }],
    { ng: { keys: [newPubKey], pred: 'keys-all' } });
}
// Read-only lookups — no wallet, no signature.
export async function lookupAccount(account: string): Promise<{ balance: number } | null> {
  try { return { balance: dec(await local(`(${T}.get-balance "${account}")`)) }; }
  catch { return null; }
}
// PCO lives on all 20 chains — read every chain in parallel and keep the
// nonzero ones (nonexistent accounts on a chain simply read as absent).
export async function lookupAllChains(account: string): Promise<{ total: number; perChain: { chain: string; balance: number }[] }> {
  const balances = await Promise.all(CHAINS.map(async (ch) => ({
    chain: ch,
    balance: dec(await localOn(ch, `(${T}.get-balance "${account}")`).catch(() => 0)) || 0,
  })));
  const perChain = balances.filter((b) => b.balance > 0);
  return { total: perChain.reduce((s, b) => s + b.balance, 0), perChain };
}

// The in-browser key, its localStorage slot, its backup/restore and its import
// path were all REMOVED (2026-08-01). This page does not generate, store,
// import or sign with private keys of its own. The only key it ever creates is
// the ephemeral gas-station signer in chain.ts: in memory, authorises a fee and
// nothing else, gone when the tab closes.
// Do not reintroduce browser-held key material.

export { CFG, cmdHash };
