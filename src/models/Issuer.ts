import type { IDidDocument } from './DidDocument';

export interface IssuerPublicKeyList {
  [key: string]: ParsedKeyObjectV2;
}

export interface KeyObjectV1 {
  date: string;
  key: string;
  invalidated?: string;
}

export interface ParsedKeyObjectV2 {
  publicKey: string;
  created: number;
  expires?: number;
  revoked?: number;
}

export interface KeyObjectV2 {
  id: string;
  created: string;
  expires?: string;
  revoked?: string;
}

export interface Issuer {
  '@context'?: string[];
  type?: string;
  id?: string;
  name?: string;
  url?: string;
  image?: string;
  email?: string;
  revocationList?: string;
  publicKey?: string[] | KeyObjectV2[];
  introductionURL?: string;
  introductionAuthenticationMethod?: string;
  introductionSuccessURL?: string;
  introductionErrorURL?: string;
  analyticsURL?: string;
  issuingEstimateAuth?: string;
  issuingEstimateUrl?: string;
  // blockcerts v3
  didDocument?: IDidDocument;

  // blockcerts v2-alpha
  publicKeys?: string[] | KeyObjectV2[];

  // blockcerts v1
  // https://github.com/blockchain-certificates/cert-schema/blob/master/cert_schema/1.1/issuer-schema-v1-1.json
  issuer_key?: KeyObjectV1[];
  revocation_key?: KeyObjectV1[];
  // https://github.com/blockchain-certificates/cert-schema/blob/master/cert_schema/1.2/issuer-id-1.2.json
  issuerKeys?: KeyObjectV1[];
  revocationKeys?: KeyObjectV1[];
}
