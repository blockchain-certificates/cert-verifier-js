import type { JsonLDContext } from './Blockcerts';
import type { MerkleProof2017 } from './MerkleProof2017';

interface RecipientProfile {
  type: string[];
  name: string;
  publicKey: string;
}

export interface BlockcertsV2 {
  '@context': JsonLDContext;
  type: string;
  id: string;
  recipient?: {
    type: string;
    identity: string;
    hashed: boolean;
    /**
     * @deprecated v2 alpha only
     */
    recipientProfile?: RecipientProfile;
  };
  recipientProfile?: RecipientProfile;
  badge?: {
    type: string;
    id?: string;
    name?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    criteria?: any; // TODO: define criteria
    issuer: {
      type?: string;
      id?: string;
      name?: string;
      url?: string;
      image?: string;
      email?: string;
      revocationList?: string;
    };
    signatureLines?: Array<{
      type?: string[];
      jobTitle?: string;
      image?: string;
    }>;
  };
  verification?: {
    type: string[];
    publicKey?: string;
    /**
     * @deprecated v2 alpha only
     */
    creator?: string;
  };
  issuedOn?: string;
  metadataJson?: string;
  displayHtml?: string;
  expires?: string;
  nonce?: string;
  universalIdentifier?: string;
  signature: MerkleProof2017;
}

export type UnsignedBlockcertsV2 = Omit<BlockcertsV2, 'signature'>;
