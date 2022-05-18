import type { Issuer } from './Issuer';
import type { JsonLDContext } from './Blockcerts';

export interface VCProof {
  type: string;
  created?: string;
  proofValue: string;
  proofPurpose?: string;
  verificationMethod?: string;
  chainedProofType?: string;
  previousProof?: VCProof;
}

export function getVCProofVerificationMethod (document: BlockcertsV3): string {
  if (Array.isArray(document.proof)) {
    const initialProof: VCProof = document.proof.find(p => p.type !== 'ChainedProof2021');
    return initialProof.verificationMethod;
  }
  return document.proof.verificationMethod;
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

export interface BlockcertsV3 extends VerifiableCredential{
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
  metadata?: string;
  display?: BlockcertsV3Display;
  nonce?: string;
  proof: VCProof;

  /**
   * @deprecated v3 alpha only
   */
  metadataJson?: string;
}

export type UnsignedBlockcertsV3 = Omit<BlockcertsV3, 'proof'>;
