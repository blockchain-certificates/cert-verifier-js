import { Issuer } from './Issuer';
import { MerkleProof2019 } from './MerkleProof2019';

export interface VerifiableCredential {
  '@context': string[];
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
  proof: {
    type: string;
    created?: string;
    proofValue: string;
    proofPurpose?: string;
    verificationMethod?: string;
  };
}

export interface BlockcertsV3 extends VerifiableCredential{
  issuer: string | Issuer;
  issuanceDate: string;
  credentialSubject: {
    id: string;
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
  display: {
    contentMediaType: string;
    content: string;
    contentEncoding?: string;
  };
  nonce?: string;
  proof: MerkleProof2019;

  /**
   * @deprecated v3 alpha only
   */
  metadataJson?: string;
}
