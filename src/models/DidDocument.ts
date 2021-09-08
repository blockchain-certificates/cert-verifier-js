import { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

interface IDidContext {
  '@base': string;
}

export interface IServiceEndpoint {
  serviceEndpoint?: string;
  type?: string;
  id?: string;
}

export interface IDidDocument {
  id?: string;
  '@context'?: Array<string | IDidContext>;
  verificationMethod?: IDidDocumentPublicKey[];
  authentication?: Array<string | IDidDocumentPublicKey>;
  assertionMethod?: string[];
  service?: IServiceEndpoint[];
  capabilityDelegation?: string[];
  keyAgreement?: IDidDocumentPublicKey[];
  publicKey?: IDidDocumentPublicKey[];
}
