import type { MerkleProof2017Anchor } from './MerkleProof2017.js';
import type { MerklePath } from './MerkleProof2019.js';

export interface Receipt {
  path?: MerklePath[];
  merkleRoot?: string;
  targetHash?: string;
  anchors?: string[] | MerkleProof2017Anchor[];
  // below is merkle proof 2017
  type?: string[];
  proof?: MerklePath[];
}
