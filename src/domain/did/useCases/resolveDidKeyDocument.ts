import type { IDidDocument } from '../../../models/DidDocument';
import { DidKeyDriver } from '@digitalbazaar/did-method-key';

export default async function resolveDidKeyDocument (didKeyUri: string): Promise<IDidDocument> {
  const didKeyDriver = new DidKeyDriver();
  const didDocument = await didKeyDriver.get({ did: didKeyUri });
  return didDocument;
}
