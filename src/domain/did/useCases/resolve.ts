import { request } from '@blockcerts/explorer-lookup';
import type { IDidDocument } from '../../../models/DidDocument.js';
import DidResolver from '../valueObjects/didResolver.js';
import { isDidKey } from '../../verifier/useCases/getIssuerProfile.js';
import resolveDidKeyDocument from './resolveDidKeyDocument.js';

interface IUniversalResolverResponse {
  didResolutionMetadata?: any;
  didDocument: IDidDocument;
  didDocumentMetadata?: {
    method?: {
      published: boolean;
      recoveryMethod: string;
      updateCommitment: string;
    };
    canonicalId: string;
  };
}

export default async function resolve (didUri: string, didResolverUrl = DidResolver.url): Promise<IDidDocument> {
  if (isDidKey(didUri)) {
    const didDocument = await resolveDidKeyDocument(didUri);
    return didDocument;
  }
  const universalResolverResponse: string = await request({ url: `${didResolverUrl}/${didUri}` });
  const parsedUniversalResolverResponse: IUniversalResolverResponse = JSON.parse(universalResolverResponse);
  return parsedUniversalResolverResponse.didDocument;
}
