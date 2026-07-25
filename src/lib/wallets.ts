// wallets.ts — wallet adapters for the PCO token page. One interface, four ways
// to sign (the same set the Smart Pacts holder portal uses):
//
//   ecko     — EckoWallet browser extension (injected window.kadena API)
//   zelcore  — Zelcore desktop app (Kadena signing API on 127.0.0.1:9467)
//   ledger   — Ledger hardware via WebHID (hash signing, loaded on demand)
//   localkey — an in-browser throwaway test key (the gasless-claim key)
//
// The page keeps OUR command envelope as the single source of truth (chain.ts
// buildExec); wallets only contribute signatures over OUR hash. DEVNET PREVIEW:
// wallets must be pointed at the devnet network — adapters surface honest
// errors when they are not.
import { CFG, cmdHash, signHash, bytesToHex, type Cap } from './chain';
import { blake2b } from '@noble/hashes/blake2b';

const NETWORK_ID = CFG.networkId;
const API_BASE = CFG.host;

export type WalletKind = 'ecko' | 'zelcore' | 'ledger' | 'localkey';

export type ConnectedWallet = {
  kind: WalletKind;
  label: string;
  account: string;    // k: account
  publicKey: string;
  sign(cmd: string, hash: string, capsHint: Cap[]): Promise<string>;
  disconnect?(): void;
};

const enc = new TextEncoder();
const hashBytes = (cmd: string) => blake2b(enc.encode(cmd), { dkLen: 32 });

// ---------------- EckoWallet (extension) ----------------

type EckoProvider = {
  isKadena?: boolean;
  request(args: { method: string; networkId?: string; data?: unknown }): Promise<Record<string, unknown>>;
  on(name: string, cb: (event: unknown) => void): void;
};
function eckoProvider(): EckoProvider | null {
  const w = window as unknown as { kadena?: EckoProvider };
  return w.kadena?.isKadena && typeof w.kadena.request === 'function' ? w.kadena : null;
}
export function eckoAvailable(): boolean {
  return typeof window !== 'undefined' && eckoProvider() !== null;
}
async function waitForEcko(ms = 1500): Promise<EckoProvider | null> {
  const t0 = Date.now();
  let p = eckoProvider();
  while (!p && Date.now() - t0 < ms) {
    await new Promise((r) => setTimeout(r, 100));
    p = eckoProvider();
  }
  return p;
}
const ECKO_SILENT = Symbol('ecko-no-answer');
function eckoRequest(p: EckoProvider, args: Parameters<EckoProvider['request']>[0], ms: number): Promise<Record<string, unknown> | typeof ECKO_SILENT> {
  return Promise.race([
    p.request(args).catch((e: unknown) => ({ status: 'fail', message: e instanceof Error ? e.message : String(e) })),
    new Promise<typeof ECKO_SILENT>((r) => setTimeout(() => r(ECKO_SILENT), ms)),
  ]);
}
function eckoNetworkHelp(expected: string): string {
  return `EckoWallet must be on the devnet network. In EckoWallet: Settings → Networks → add one with Name: PCO devnet, URL: ${API_BASE}, Network ID: ${expected} — save it, select it as active, then reconnect. (This is a DEVNET preview; use test accounts only.)`;
}

export async function connectEcko(onSessionEnd?: (reason: string) => void): Promise<ConnectedWallet> {
  const p = await waitForEcko();
  if (!p) throw new Error('EckoWallet not detected — install it from eckowallet.com and reload');
  const net = await eckoRequest(p, { method: 'kda_getNetwork' }, 3000);
  const activeNet = net !== ECKO_SILENT && typeof (net as Record<string, unknown>)?.networkId === 'string' ? (net as Record<string, string>).networkId : undefined;
  if (activeNet && activeNet !== NETWORK_ID) throw new Error(eckoNetworkHelp(NETWORK_ID));

  const res = await eckoRequest(p, { method: 'kda_connect', networkId: NETWORK_ID }, 120000);
  if (res === ECKO_SILENT) throw new Error('No answer from EckoWallet — the request may have been dismissed; try again');
  const r = res as Record<string, unknown>;
  if (r.status !== 'success') {
    const msg = String(r.message ?? '');
    if (/network invalid|invalid network/i.test(msg)) throw new Error(eckoNetworkHelp(NETWORK_ID));
    if (/connect fail|rejected/i.test(msg)) throw new Error('Connection declined in EckoWallet');
    throw new Error(`EckoWallet refused the connection${msg ? `: ${msg}` : ''}`);
  }
  let acct = r.account as { account?: string; publicKey?: string } | undefined;
  if (!acct?.account || !acct?.publicKey) {
    const st = await eckoRequest(p, { method: 'kda_checkStatus', networkId: NETWORK_ID }, 120000);
    const s = st as Record<string, unknown>;
    if (st === ECKO_SILENT || s.status !== 'success' || !(s.account as { account?: string })?.account) throw new Error('EckoWallet is locked — unlock it, then reconnect');
    acct = s.account as { account: string; publicKey: string };
  }
  const account = String(acct.account);
  const pub = String(acct.publicKey ?? (account.startsWith('k:') ? account.slice(2) : ''));
  if (!/^[0-9a-f]{64}$/.test(pub)) throw new Error(`EckoWallet returned no usable public key for ${account}`);

  let live = true;
  p.on('res_accountChange', () => { if (live) { live = false; onSessionEnd?.('EckoWallet switched account or network — reconnect to continue'); } });

  return {
    kind: 'ecko', label: 'EckoWallet', account, publicKey: pub,
    async sign(cmd, hash) {
      if (!live) throw new Error('EckoWallet session ended — reconnect first');
      const st = await eckoRequest(p, { method: 'kda_checkStatus', networkId: NETWORK_ID }, 120000);
      const s = st as Record<string, unknown>;
      if (st === ECKO_SILENT) throw new Error('No answer from EckoWallet — is it unlocked?');
      if (s.status !== 'success') {
        if (/invalid network|network invalid/i.test(String(s.message ?? ''))) throw new Error(eckoNetworkHelp(NETWORK_ID));
        throw new Error('EckoWallet session expired — reconnect and try again');
      }
      const r2 = await eckoRequest(p, { method: 'kda_requestQuickSign', data: { networkId: NETWORK_ID, commandSigDatas: [{ cmd, sigs: [{ pubKey: pub, sig: null }] }] } }, 180000);
      if (r2 === ECKO_SILENT) throw new Error('No answer from EckoWallet — the signing window may have been closed; try again');
      const rr = r2 as Record<string, unknown>;
      if (rr.status !== 'success') {
        const msg = String(rr.message ?? rr.error ?? '');
        if (/rejected/i.test(msg)) throw new Error('Signing declined in EckoWallet');
        throw new Error(`EckoWallet did not sign${msg ? `: ${msg}` : ''}`);
      }
      const entry = ((rr.responses ?? rr.quickSignData ?? []) as unknown[])[0] as Record<string, unknown> | undefined;
      const sigs = ((entry?.commandSigData as { sigs?: unknown[] })?.sigs ?? (entry?.sigs as unknown[]) ?? []) as { pubKey?: string; sig?: string }[];
      const sig = sigs.find((x) => x?.pubKey === pub)?.sig;
      if (typeof sig !== 'string' || !sig) throw new Error('EckoWallet returned no signature');
      const outcome = entry?.outcome as { hash?: string } | undefined;
      if (typeof outcome?.hash === 'string' && outcome.hash !== hash) throw new Error('EckoWallet signed a different command than requested');
      return sig;
    },
    disconnect() { live = false; p.request({ method: 'kda_disconnect', networkId: NETWORK_ID }).catch(() => {}); },
  };
}

// ---------------- Zelcore (localhost signing API) ----------------
const ZELCORE = 'http://127.0.0.1:9467';
export async function connectZelcore(): Promise<ConnectedWallet> {
  let accounts: string[];
  try {
    const res = await fetch(`${ZELCORE}/v1/accounts`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ asset: 'kadena' }) });
    const j = await res.json();
    accounts = (j?.data ?? []).filter((a: string) => typeof a === 'string' && a.startsWith('k:'));
  } catch {
    throw new Error('Zelcore not reachable — open the Zelcore app and log in, then try again');
  }
  if (accounts.length === 0) throw new Error('Zelcore returned no k: Kadena accounts');
  const account = accounts[0];
  const publicKey = account.slice(2);
  return {
    kind: 'zelcore', label: 'Zelcore', account, publicKey,
    async sign(cmd) {
      const res = await fetch(`${ZELCORE}/v1/quicksign`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cmdSigDatas: [{ cmd, sigs: [{ pubKey: publicKey, sig: null }] }] }) });
      if (!res.ok) throw new Error(`Zelcore signing failed (${res.status}) — approve the request in the app`);
      const j = await res.json();
      const sig = j?.responses?.[0]?.sigs?.[0]?.sig ?? j?.results?.[0]?.sigs?.[0]?.sig;
      if (!sig) throw new Error('Zelcore returned no signature (request rejected?)');
      return sig as string;
    },
  };
}

// ---------------- Ledger (WebHID, loaded on demand) ----------------
let ledgerApp: { transport?: { close?: () => Promise<void> }; getAddressAndPubKey: (p: string) => Promise<{ pubkey?: Uint8Array; publicKey?: Uint8Array }>; signHash: (p: string, h: string) => Promise<{ signature?: Uint8Array }> } | null = null;
export async function connectLedger(): Promise<ConnectedWallet> {
  if (!('hid' in navigator)) throw new Error('This browser has no WebHID (use Chrome/Edge/Brave) — Ledger unavailable');
  // Ledger libs are optional (heavy); load by name at runtime so the build
  // doesn't require them. Absent → honest error (this DEVNET preview leads with
  // the in-browser key and EckoWallet; Ledger is for the real launch build).
  let TransportWebHID: { create: () => Promise<{ close?: () => Promise<void> }> }, KadenaApp: new (t: unknown) => unknown, Buffer: unknown;
  try {
    const dyn = (m: string) => import(/* webpackIgnore: true */ m);
    ({ Buffer } = await dyn('buffer'));
    (globalThis as unknown as { Buffer?: unknown }).Buffer ??= Buffer;
    ({ default: TransportWebHID } = await dyn('@ledgerhq/hw-transport-webhid'));
    ({ KadenaApp } = await dyn('@zondax/ledger-kadena'));
  } catch {
    throw new Error('Ledger support is not built into this preview — use the in-browser key or EckoWallet');
  }
  const transport = await TransportWebHID.create();
  ledgerApp = new KadenaApp(transport) as unknown as typeof ledgerApp;
  const path = "m/44'/626'/0'/0/0";
  const addr = await ledgerApp!.getAddressAndPubKey(path);
  const pub = bytesToHex(new Uint8Array((addr.pubkey ?? addr.publicKey) as Uint8Array));
  if (!pub || pub.length !== 64) throw new Error('Ledger returned no public key — open the Kadena app on the device');
  return {
    kind: 'ledger', label: 'Ledger', account: `k:${pub}`, publicKey: pub,
    async sign(cmd) {
      const r = await ledgerApp!.signHash(path, bytesToHex(hashBytes(cmd)));
      const sig = r?.signature ? bytesToHex(new Uint8Array(r.signature)) : null;
      if (!sig) throw new Error('Ledger did not sign (rejected on device, or blind signing disabled)');
      return sig;
    },
    disconnect() { ledgerApp?.transport?.close?.().catch(() => {}); ledgerApp = null; },
  };
}

// ---------------- In-browser test key (the gasless-claim key) ----------------
export type LocalAccount = { account: string; publicKey: string; secretKey: string };
export function connectLocalKey(acct: LocalAccount): ConnectedWallet {
  return {
    kind: 'localkey', label: 'In-browser test key', account: acct.account, publicKey: acct.publicKey,
    async sign(cmd) { return signHash(cmdHash(cmd), acct.secretKey); },
  };
}

// Sign our unsigned command with the connected wallet; verify it covers OUR hash.
export async function walletSign(w: ConnectedWallet, unsigned: { cmd: string; hash: string }, capsHint: Cap[]): Promise<{ cmd: string; hash: string; sigs: { sig: string }[] }> {
  const sig = await w.sign(unsigned.cmd, unsigned.hash, capsHint);
  if (cmdHash(unsigned.cmd) !== unsigned.hash) throw new Error('internal: command changed after hashing');
  return { cmd: unsigned.cmd, hash: unsigned.hash, sigs: [{ sig }] };
}
