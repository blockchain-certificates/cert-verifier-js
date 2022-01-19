import { Issuer } from './Issuer';
import { MerkleProof2019 } from './MerkleProof2019';

export interface BlockcertsV3 {
  '@context': string[];
  id: string;
  type: string[];
  issuanceDate: string;
  issuer: string | Issuer;
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

  /**
   * @deprecated v3 alpha only
   */
  expirationDate?: string;
}
