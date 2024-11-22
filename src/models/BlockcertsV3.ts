import type { Issuer } from './Issuer';
import type { JsonLDContext } from './Blockcerts';
import type { CONTENT_MEDIA_TYPES } from './contentMediaTypes';

export interface VCProof {
  type: string;
  created: string;
  proofValue?: string;
  jws?: string;
  proofPurpose: string;
  verificationMethod: string;
  chainedProofType?: string;
  previousProof?: any;
  cryptosuite?: string; // DataIntegrityProof spec
}

export function getVCProofVerificationMethod (proof: VCProof | VCProof[]): string {
  if (Array.isArray(proof)) {
    const initialProof: VCProof = proof.find(p => p.type !== 'ChainedProof2021');
    return initialProof.verificationMethod;
  }
  return proof.verificationMethod;
}

export function isVerifiablePresentation (credential: BlockcertsV3 | VerifiablePresentation): credential is VerifiablePresentation {
  return credential.type.includes('VerifiablePresentation');
}

export interface MultilingualVcField {
  '@value': string;
  '@language': string;
  '@direction'?: string;
}

export interface VerifiablePresentation {
  '@context': JsonLDContext;
  id?: string;
  type: string[];
  verifiableCredential?: BlockcertsV3[];
  holder?: string;
}

export interface VerifiableCredential {
  '@context': JsonLDContext;
  id: string;
  type: string[];
  credentialStatus?: VCCredentialStatus | VCCredentialStatus[];
  credentialSchema?: VCCredentialSchema | VCCredentialSchema[];
  issuer: string | Issuer;
  credentialSubject?: any | any[];
  expirationDate?: string;
  evidence?: Array<{
    type: string[];
    id?: string;
    // more properties as defined per implementation
  }>;
  holder?: {
    type?: string;
    id?: string;
  };
  issued?: string;
  issuanceDate?: string;
  refreshService?: {
    type?: string;
    id?: string; // must be URI
  };
  termsOfUse?: Array<{
    type: string;
    id?: string;
    // more properties as defined per implementation
  }>;
  proof: VCProof | VCProof[];
  // VC V2
  validFrom?: string; // expect dateTime
  validUntil?: string; // expect dateTime
  name?: string | MultilingualVcField[];
  description?: string | MultilingualVcField[];
}

export interface BlockcertsV3Display {
  contentMediaType: CONTENT_MEDIA_TYPES;
  content: string;
  contentEncoding?: string;
}

export interface VCCredentialStatus {
  id: string;
  type: string;
  statusPurpose: string;
  statusListIndex: string;
  statusListCredential: string;
}

export interface VCCredentialSchema {
  type: string;
  id: string;
}

// CredentialSubject can technically be anything the issuer wants, but we define a basic structure
export interface BlockcertsV3BasicCredentialSubject {
  id?: string;
  publicKey?: string;
  name?: string;
  type?: string;
  claim?: {
    type?: string;
    id?: string;
    name?: string;
    description?: string;
    criteria?: string;
  };
}

export interface BlockcertsV3 extends VerifiableCredential {
  credentialSubject: BlockcertsV3BasicCredentialSubject | BlockcertsV3BasicCredentialSubject[];
  metadata?: string;
  display?: BlockcertsV3Display;
  nonce?: string;
  /**
   * @deprecated v3 alpha only
   */
  metadataJson?: string;
}

export type UnsignedBlockcertsV3 = Omit<BlockcertsV3, 'proof'>;
