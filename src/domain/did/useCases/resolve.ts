import ion from '../methods/ion';
import { IDidDocument } from '../../../models/DidDocument';

const supportedMethods = {
  ion
};

export default async function resolve (didUri: string): Promise<IDidDocument> {
  const method = didUri.split(':')[1];
  if (!supportedMethods[method]) {
    throw new Error(`Unsupported did method: ${method} used with blockcerts document`);
  }
  const didDocument = await supportedMethods[method](didUri);
  return didDocument;
}
