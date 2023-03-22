import type { Issuer } from './Issuer';
import type { JsonLDContext } from './Blockcerts';

export interface VCProof {
  type: string;
  created: string;
  proofValue?: string;
  jws?: string;
  proofPurpose: string;
  verificationMethod: string;
  chainedProofType?: string;
  previousProof?: VCProof;
}

export function getVCProofVerificationMethod (proof: VCProof | VCProof[]): string {
  if (Array.isArray(proof)) {
    const initialProof: VCProof = proof.find(p => p.type !== 'ChainedProof2021');
    return initialProof.verificationMethod;
  }
  return proof.verificationMethod;
}

export interface VerifiableCredential {
  '@context': JsonLDContext;
  id: string;
  type: string[];
  credentialStatus?: {
    id: string;
    type: string;
    statusListIndex?: string;
    statusListCredential?: string;
  };
  credentialSubject?: any;
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
  validFrom?: string; // expect dateTime
  validUntil?: string; // expect dateTime
  proof: VCProof | VCProof[];
}

export interface BlockcertsV3Display {
  contentMediaType: string;
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

export interface BlockcertsV3 extends VerifiableCredential {
  issuer: string | Issuer;
  issuanceDate: string;
  credentialSubject: {
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
  };
  credentialStatus?: VCCredentialStatus;
  metadata?: string;
  display?: BlockcertsV3Display;
  nonce?: string;
  proof: VCProof | VCProof[];

  /**
   * @deprecated v3 alpha only
   */
  metadataJson?: string;
}

export type UnsignedBlockcertsV3 = Omit<BlockcertsV3, 'proof'>;
