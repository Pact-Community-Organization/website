// chain.ts — minimal Kadena client for the PCO token page, pointed at DEVNET.
//
// DEVNET PREVIEW BUILD: this targets the local devnet (recap-development,
// localhost:8090). The mainnet block is staged and commented — a launch build
// flips CFG. @noble-only crypto, direct fetch, no @kadena/client (keeps the
// static export small; same pattern as the token repo's web/ bundle).
import { ed25519 } from '@noble/curves/ed25519';
import { blake2b } from '@noble/hashes/blake2b';
import { bytesToHex as _hex, hexToBytes } from '@noble/hashes/utils';

export const CFG = {
  host: 'http://localhost:8090',
  networkId: 'recap-development',
  ns: 'user', // devnet: the v2 stack lives in `user`
  chain: '0',
  // --- MAINNET (staged; a launch build enables this) ---
  // host: 'https://api.chainweb-community.org',
  // networkId: 'mainnet01',
  // ns: 'n_<derived>',
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

export function cmdHash(cmd: string): string {
  return b64url(blake2b(new TextEncoder().encode(cmd), { dkLen: 32 }));
}

export function signHash(hashB64: string, privHex: string): string {
  const pad = hashB64.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(pad), (c) => c.charCodeAt(0));
  return bytesToHex(ed25519.sign(bytes, hexToBytes(privHex)));
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
  const rk = requestKeys[0];
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
