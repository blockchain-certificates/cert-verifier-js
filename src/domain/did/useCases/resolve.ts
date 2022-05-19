import type { IDidDocument } from '../../../models/DidDocument';
import { request } from '@blockcerts/explorer-lookup';
import DidResolver from '../valueObjects/didResolver';
import { isDidKey } from '../../verifier/useCases/getIssuerProfile';
import resolveDidKeyDocument from './resolveDidKeyDocument';

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
