import ion from '../methods/ion';
import { IDidDocument } from '../../../models/DidDocument';
import { request } from '../../../services/request';

const supportedMethods = {
  ion
};

const universalResolverUrl = 'http://localhost:8080/1.0/identifiers';

export default async function resolve (didUri: string): Promise<IDidDocument> {
  // const method = didUri.split(':')[1];
  // if (!supportedMethods[method]) {
  //   throw new Error(`Unsupported did method: ${method} used with blockcerts document`);
  // }
  // const didDocument = await supportedMethods[method](didUri);
  const didDocument = await request({ url: `${universalResolverUrl}/${didUri}`, forceHttp: true });
  return didDocument;
}
