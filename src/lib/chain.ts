// chain.ts — minimal Kadena client for the PCO token page, pointed at MAINNET.
//
// MAINNET BUILD (cut over 2026-07-31). PCO is deployed on mainnet01 across all
// 20 chains; the devnet block below is kept for local development only.
// @noble-only crypto, direct fetch, no @kadena/client (keeps the static export
// small; same pattern as the token repo's web/ bundle).
//
// The namespace is a PRINCIPAL namespace: its name is a hash of the governance
// keyset, so it is not an arbitrary string and cannot be typo'd into something
// that exists. Verify it against the deployment record before changing it.
import { ed25519 } from '@noble/curves/ed25519';
import { blake2b } from '@noble/hashes/blake2b';
import { bytesToHex as _hex, hexToBytes } from '@noble/hashes/utils';

export const CFG = {
  host: 'https://api.chainweb-community.org',
  networkId: 'mainnet01',
  ns: 'n_57fcd6f7b72e8949af51a8d6f17fe12cc7719d10',
  chain: '0',
  // --- DEVNET (local development only) ---
  // host: 'http://localhost:8090',
  // networkId: 'recap-development',
  // ns: 'user',
  // chain: '0',
};

export const T = `${CFG.ns}.pco`;
export const C = `${CFG.ns}.pco-claim`;
export const G = `${CFG.ns}.pco-gas-station`;
export const API = `${CFG.host}/chainweb/0.0/${CFG.networkId}/chain/${CFG.chain}/pact/api/v1`;
export const CHAINS = Array.from({ length: 20 }, (_, i) => String(i));

export type Cap = { name: string; args: unknown[] };

export const bytesToHex = _hex;

const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/**
 * Pact's `(hash x)` for a string: BLAKE2b-256, base64url, unpadded.
 *
 * Used for two unrelated things, which is why it is named for the operation
 * rather than for either caller: the transaction hash (= the request key), and
 * comparing a quest answer against a round's public `code-hash` without
 * submitting anything.
 */
export function pactHash(s: string): string {
  return b64url(blake2b(new TextEncoder().encode(s), { dkLen: 32 }));
}

export function cmdHash(cmd: string): string {
  return pactHash(cmd);
}

const b64urlBytes = (hashB64: string): Uint8Array => {
  const pad = hashB64.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));
};

/**
 * EPHEMERAL GAS-STATION SIGNER — in memory, one per page load, never persisted.
 *
 * A sponsored transaction still needs A signer: the node grants the station's
 * GAS_PAYER capability by scanning the signers' capability lists, so if nobody
 * declares it the station's guard never opens. But that signer does not have to
 * be the user — it authorises the station to pay a fee and nothing else, so any
 * throwaway key does.
 *
 * This is why a claim asks the user for NOTHING: no wallet popup, no device, no
 * KDA. They type an answer and click.
 *
 * What it deliberately is not:
 *   - not written to localStorage, so clearing storage loses nothing
 *   - not exported, downloadable, or importable, so there is no backup to lose
 *     and no field for a phishing clone to imitate
 *   - not an identity: it never receives, holds, or moves tokens, and it is a
 *     different key on every page load
 *
 * (PCO previously used a PERSISTED browser key for this, which is what created
 * the backup/restore/import surface. Same mechanism, without the liability.)
 */
let _ephemeral: { publicKey: string; secretKey: string } | null = null;
export function ephemeralGasSigner(): { publicKey: string; secretKey: string } {
  // Lazy, so it is never generated during SSR — where it would be pointless and
  // would differ from the client's.
  if (!_ephemeral) {
    const sk = ed25519.utils.randomPrivateKey();
    _ephemeral = { secretKey: bytesToHex(sk), publicKey: bytesToHex(ed25519.getPublicKey(sk)) };
  }
  return _ephemeral;
}

export function signHash(hashB64: string, privHex: string): string {
  return bytesToHex(ed25519.sign(b64urlBytes(hashB64), hexToBytes(privHex)));
}

// Verify that a signature returned by a wallet really covers OUR command hash under
// the public key of the account we believe is connected. Without this the page will
// happily POST any 128-hex string a wallet hands back and let the node reject it —
// which turns "the wallet signed something else" into an opaque server error instead
// of a precise local one.
export function verifyHashSig(hashB64: string, sigHex: string, pubHex: string): boolean {
  try {
    if (!/^[0-9a-f]{128}$/i.test(sigHex) || !/^[0-9a-f]{64}$/i.test(pubHex)) return false;
    return ed25519.verify(hexToBytes(sigHex), b64urlBytes(hashB64), hexToBytes(pubHex));
  } catch {
    return false;
  }
}

export const num = (v: unknown): number =>
  v && typeof v === 'object'
    ? Number((v as Record<string, unknown>).decimal ?? (v as Record<string, unknown>).int ?? NaN)
    : Number(v);

// Read-only /local call (hub chain by default; localOn targets any chain).
export function local(code: string): Promise<unknown> {
  return localOn(CFG.chain, code);
}
export async function localOn(chainId: string, code: string): Promise<unknown> {
  const cmd = JSON.stringify({
    networkId: CFG.networkId,
    payload: { exec: { code, data: {} } },
    signers: [],
    meta: { chainId, sender: 'reader', gasLimit: 150000, gasPrice: 1e-8, ttl: 600, creationTime: Math.floor(Date.now() / 1000) - 30 },
    nonce: `r:${Date.now()}:${Math.random()}`,
  });
  const api = `${CFG.host}/chainweb/0.0/${CFG.networkId}/chain/${chainId}/pact/api/v1`;
  const r = await fetch(`${api}/local`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd, hash: cmdHash(cmd), sigs: [] }),
  });
  const j = await r.json();
  if (j.result?.status !== 'success') throw new Error(JSON.stringify(j.result?.error?.message ?? j));
  return j.result.data;
}

// Build an unsigned exec command JSON + its hash, given signer pubkeys + caps.
export function buildExec(opts: {
  code: string;
  data?: Record<string, unknown>;
  sender: string;              // gas-paying account
  signers: { pubKey: string; caps: Cap[] }[];
  gasLimit?: number;
  gasPrice?: number;
}): { cmd: string; hash: string } {
  const cmd = JSON.stringify({
    networkId: CFG.networkId,
    payload: { exec: { code: opts.code, data: opts.data ?? {} } },
    signers: opts.signers.map((s) => ({
      pubKey: s.pubKey,
      clist: s.caps.map((c) => ({ name: c.name, args: c.args })),
    })),
    meta: {
      chainId: CFG.chain, sender: opts.sender,
      gasLimit: opts.gasLimit ?? 2500, gasPrice: opts.gasPrice ?? 1e-7,
      ttl: 1800, creationTime: Math.floor(Date.now() / 1000) - 30,
    },
    nonce: `pco-web:${Date.now()}`,
  });
  return { cmd, hash: cmdHash(cmd) };
}

export async function submitAndPoll(signed: { cmd: string; hash: string; sigs: { sig: string }[] }): Promise<Record<string, unknown>> {
  const send = await fetch(`${API}/send`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmds: [signed] }),
  });
  if (!send.ok) throw new Error(`send: ${send.status} ${await send.text()}`);
  const { requestKeys } = await send.json();
  const rk = requestKeys?.[0];
  // The request key IS the command hash. A node that returns anything else is either
  // broken or lying, and polling its key would report the outcome of a DIFFERENT
  // transaction back to the user as if it were theirs.
  if (rk !== signed.hash) {
    throw new Error(
      `node returned request key ${String(rk).slice(0, 16)}… for a transaction whose hash is ` +
      `${signed.hash.slice(0, 16)}… — refusing to report its result. Do not trust this endpoint.`,
    );
  }
  for (let i = 0; i < 60; i++) {
    await new Promise((res) => setTimeout(res, 3000));
    const r = await fetch(`${API}/poll`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestKeys: [rk] }),
    });
    const j = await r.json();
    if (j[rk]) {
      if (j[rk].result.status === 'success') return j[rk];
      throw new Error(j[rk].result.error?.message ?? 'transaction failed');
    }
  }
  throw new Error('timed out waiting for the transaction');
}
