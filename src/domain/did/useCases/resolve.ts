import { IDidDocument } from '../../../models/DidDocument';
import { request } from '@blockcerts/explorer-lookup';

export const universalResolverUrl = 'https://resolver.identity.foundation/1.0/identifiers';

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

export default async function resolve (didUri: string, didResolverUrl = universalResolverUrl): Promise<IDidDocument> {
  const universalResolverResponse: string = await request({ url: `${didResolverUrl}/${didUri}` });
  const parsedUniversalResolverResponse: IUniversalResolverResponse = JSON.parse(universalResolverResponse);
  return parsedUniversalResolverResponse.didDocument;
}
