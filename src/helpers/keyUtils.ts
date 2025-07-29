import keyto from '@trust/keyto';
import bs58 from 'bs58';
import secp256k1 from 'secp256k1';
import { Buffer as BufferPolyfill } from 'buffer';
// @ts-expect-error: not a typescript package
import * as base64url from 'base64url-universal';

const buffer = typeof Buffer === 'undefined' ? BufferPolyfill : Buffer;

/** Secp256k1 Public Key  */
export interface IPublicKeyJwk {
  /** key type */
  kty: string;

  /** curve */
  crv: string;

  /** public point */
  x: string;

  /** public point */
  y?: string;

  /** key id */
  kid?: string;
}

/** convert jwk to hex encoded public key */
export const publicKeyHexFromJwkSecp256k1 = (jwk: IPublicKeyJwk): string => {
  const uncompressedPublicKey = keyto
    .from(
      {
        ...jwk,
        crv: 'K-256'
      },
      'jwk'
    )
    .toString('blk', 'public');

  const compressed = secp256k1.publicKeyConvert(
    buffer.from(uncompressedPublicKey, 'hex'),
    true
  );
  return buffer.from(compressed).toString('hex');
};

/** convert publicKeyHex to base58 */
export const publicKeyBase58FromPublicKeyHex = (publicKeyHex: string): string => {
  return bs58.encode(buffer.from(publicKeyHex, 'hex'));
};

export const publicKeyBase58FromUint8Array = (publicKey: Uint8Array<any>): string => {
  return bs58.encode(publicKey);
}

export function jwkToPublicKeyBytesEd25519(jwk: IPublicKeyJwk) {
  const {kty, crv, x} = jwk;
  if(kty !== 'OKP') {
    throw new TypeError('"jwk.kty" must be "OKP".');
  }
  if(crv !== 'Ed25519') {
    throw new TypeError('"jwk.crv" must be "Ed25519".');
  }
  if(typeof x !== 'string') {
    throw new TypeError('"jwk.x" must be a string.');
  }
  const publicKey = base64url.decode(jwk.x);
  if(publicKey.length !== 32) {
    throw new Error(
      `Invalid public key size (${publicKey.length}); ` +
      `expected ${32}.`);
  }
  return publicKey;
}

export const jwkToMultibaseEd25519 = (jwk: IPublicKeyJwk): string => {
  // multicodec ed25519-pub header as varint
  const MULTICODEC_PUBLIC_HEADER = new Uint8Array([0xed, 0x01]);
  const publicKeyBytes = jwkToPublicKeyBytesEd25519(jwk);
  const uint8ArrayPublicKey = new Uint8Array(MULTICODEC_PUBLIC_HEADER.length + publicKeyBytes.length);
  uint8ArrayPublicKey.set(MULTICODEC_PUBLIC_HEADER);
  uint8ArrayPublicKey.set(publicKeyBytes, MULTICODEC_PUBLIC_HEADER.length);
  const publicKeyBase58 = publicKeyBase58FromUint8Array(uint8ArrayPublicKey);
  return `z${publicKeyBase58}`;
}
