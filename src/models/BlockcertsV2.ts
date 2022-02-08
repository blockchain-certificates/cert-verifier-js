import { JsonLDContext } from './Blockcerts';
import { MerkleProof2017 } from './MerkleProof2017';

export interface BlockcertsV2 {
  '@context': JsonLDContext;
  type: string;
  id: string;
  recipient: {
    type: string;
    identity: string;
    hashed: boolean;
  };
  recipientProfile: {
    type: string[];
    name: string;
    publicKey: string;
  };
  badge: {
    type: string;
    id: string;
    name: string;
    subtitle: string;
    description: string;
    image: string;
  };
  criteria?: any; // TODO: define criteria
  issuer: {
    type: string;
    id: string;
    name: string;
    url: string;
    image: string;
    email: string;
    revocationList: string;
  };
  signatureLines?: Array<{
    type: string[];
    jobTitle: string;
    image: string;
  }>;
  verification: {
    type: string[];
    publicKey: string;
  };
  issuedOn: string;
  metadataJson?: string;
  displayHtml: string;
  nonce?: string;
  universalIdentifier?: string;
  signature: MerkleProof2017;
}

export type UnsignedBlockcertsV2 = Omit<BlockcertsV2, 'signature'>;
