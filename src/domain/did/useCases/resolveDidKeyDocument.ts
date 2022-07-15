import type { IDidDocument } from '../../../models/DidDocument';
import * as didKey from '@transmute/did-key.js';

export default async function resolveDidKeyDocument (didKeyUri: string): Promise<IDidDocument> {
  const { didDocument } = await didKey.resolve(didKeyUri, { accept: 'application/did+json' });
  return didDocument;
}
