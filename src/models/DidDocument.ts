import { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

interface IDidContext {
  '@base': string;
}

export interface IDidDocument {
  id?: string;
  '@context'?: Array<string | IDidContext>;
  verificationMethod?: IDidDocumentPublicKey[];
  authentication?: Array<string | IDidDocumentPublicKey>;
  assertionMethod?: string[];
  service?: {
    serviceEndpoint?: string;
    type?: string;
    id?: string;
  };
  capabilityDelegation?: string[];
  keyAgreement?: IDidDocumentPublicKey[];
  publicKey?: IDidDocumentPublicKey[];
}
