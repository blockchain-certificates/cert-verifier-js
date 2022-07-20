import type { IDidDocument } from '../../../models/DidDocument';
import * as ed25519 from '@transmute/did-key-ed25519';
import * as secp256k1 from '@transmute/did-key-secp256k1';

const supportedSuiteMap = {
  'did:key:z6Mk': ed25519,
  'did:key:zQ3s': secp256k1
};

export default async function resolveDidKeyDocument (didKeyUri: string): Promise<IDidDocument> {
  const keyPrefix = didKeyUri.substring(0, 12);
  if (supportedSuiteMap[keyPrefix]) {
    const { didDocument } = await supportedSuiteMap[keyPrefix].resolve(didKeyUri, { accept: 'application/did+json' });
    return didDocument;
  }

  throw new Error('Unsupported did:key suite');
}
