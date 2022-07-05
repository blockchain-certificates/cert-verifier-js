import { DidKeyDriver } from '@digitalbazaar/did-method-key';
import type { IDidDocument } from '../../../models/DidDocument.js';

export default async function resolveDidKeyDocument (didKeyUri: string): Promise<IDidDocument> {
  const didKeyDriver = new DidKeyDriver();
  const didDocument = await didKeyDriver.get({ did: didKeyUri });
  return didDocument;
}
