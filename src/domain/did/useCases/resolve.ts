import { IDidDocument } from '../../../models/DidDocument';
import { request } from '../../../services/request';

const universalResolverUrl = 'http://localhost:8080/1.0/identifiers';

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

export default async function resolve (didUri: string): Promise<IDidDocument> {
  const universalResolverResponse: string = await request({ url: `${universalResolverUrl}/${didUri}`, forceHttp: true });
  const parsedUniversalResolverResponse: IUniversalResolverResponse = JSON.parse(universalResolverResponse);
  return parsedUniversalResolverResponse.didDocument;
}
