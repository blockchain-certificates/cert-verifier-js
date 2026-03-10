import bs58 from 'bs58';
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

const ECDSA_CURVE = {
  P256: 'P-256',
  P384: 'P-384',
  P521: 'P-521',
  // compatibility with @peculiar/webcrypto
  secp256k1: 'K-256',
}

function getSecretKeySize({ curve }: { curve: string }): number {
  if (curve === ECDSA_CURVE.P256 || curve === ECDSA_CURVE.secp256k1 || curve === 'secp256k1') {
    return 32
  }
  if (curve === ECDSA_CURVE.P384) {
    return 48
  }
  if (curve === ECDSA_CURVE.P521) {
    return 66
  }
  throw new TypeError(`Unsupported curve "${curve}".`)
}

function toPublicKeyBytes({ jwk } = {} as any): Uint8Array {
  if (jwk?.kty !== 'EC') {
    throw new TypeError('"jwk.kty" must be "EC".')
  }
  const { crv: curve } = jwk
  const secretKeySize = getSecretKeySize({ curve })
  // convert `x` coordinate to compressed public key
  const x = base64url.decode(jwk.x)
  const y = base64url.decode(jwk.y)
  // public key size is always secret key size + 1
  const publicKeySize = secretKeySize + 1
  const publicKey = new Uint8Array(publicKeySize)
  // use even / odd status of `y` coordinate for compressed header
  const even = y[y.length - 1] % 2 === 0
  publicKey[0] = even ? 2 : 3
  // write `x` coordinate at end of multikey buffer to zero-fill it
  publicKey.set(x, publicKey.length - x.length)
  return publicKey
}

/** convert jwk to hex encoded public key */
export const publicKeyHexFromJwkSecp256k1 = (jwk: IPublicKeyJwk): string => {
  return Buffer.from(toPublicKeyBytes({ jwk })).toString('hex');
};

/** convert publicKeyHex to base58 */
export const publicKeyBase58FromPublicKeyHex = (publicKeyHex: string): string => {
  return bs58.encode(buffer.from(publicKeyHex, 'hex'));
};

export const publicKeyBase58FromUint8Array = (publicKey: Uint8Array<any>): string => {
  return bs58.encode(publicKey);
}

export function jwkToPublicKeyBytesEd25519(jwk: IPublicKeyJwk) {
  const { kty, crv, x } = jwk;
  if (kty !== 'OKP') {
    throw new TypeError('"jwk.kty" must be "OKP".');
  }
  if (crv !== 'Ed25519') {
    throw new TypeError('"jwk.crv" must be "Ed25519".');
  }
  if (typeof x !== 'string') {
    throw new TypeError('"jwk.x" must be a string.');
  }
  const publicKey = base64url.decode(jwk.x);
  if (publicKey.length !== 32) {
    throw new Error(
      `Invalid public key size (${publicKey.length}); ` +
      `expected 32.`);
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
