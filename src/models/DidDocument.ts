import { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

interface IDidContext {
  '@base': string;
}

export interface IDidDocument {
  'context': string;
  'didDocument': {
    'id': string;
    '@context': Array<string | IDidContext>;
    'verificationMethod': IDidDocumentPublicKey[];
    // eslint-disable-next-line @typescript-eslint/ban-types
    'authentication'?: Array<string | object>;
  };
  didDocumentMetadata?: {
    'method'?: {
      'published'?: boolean;
      'recoveryCommitment'?: string;
      'updateCommitment'?: string;
    };
    'canonicalId'?: string;
  };
}
