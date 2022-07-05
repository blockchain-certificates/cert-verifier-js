import type { MerklePath } from './MerkleProof2019.js';

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
