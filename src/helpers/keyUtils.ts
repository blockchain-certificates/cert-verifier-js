import keyto from '@trust/keyto';
import bs58 from 'bs58';
import secp256k1 from 'secp256k1';
import { Buffer as BufferPolyfill } from 'buffer';

const buffer = typeof Buffer === 'undefined' ? BufferPolyfill : Buffer;

/** Secp256k1 Public Key  */
export interface ISecp256k1PublicKeyJwk {
  /** key type */
  kty: string;

  /** curve */
  crv: string;

  /** public point */
  x: string;

  /** public point */
  y: string;

  /** key id */
  kid: string;
}

/** convert jwk to hex encoded public key */
export const publicKeyHexFromJwk = (jwk: ISecp256k1PublicKeyJwk): string => {
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
