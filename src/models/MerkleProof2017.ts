import type { MerklePath } from './MerkleProof2019';
import type { BlockcertsV2 } from './BlockcertsV2';

export interface MerkleProof2017 {
  type: string[];
  merkleRoot: string;
  targetHash: string;
  proof: MerklePath[];
  anchors: MerkleProof2017Anchor[];
}

export interface MerkleProof2017Anchor {
  sourceId: string;
  type: string;
  chain?: string;
}

export function getMerkleProof2017ProofType (document: BlockcertsV2): string {
  return document.signature.type[0];
}
