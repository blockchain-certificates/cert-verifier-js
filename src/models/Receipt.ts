import type { MerkleProof2017Anchor } from './MerkleProof2017';
import type { MerklePath } from './MerkleProof2019';

export interface Receipt {
  path?: MerklePath[];
  merkleRoot?: string;
  targetHash?: string;
  anchors?: string[] | MerkleProof2017Anchor[];
  // below is merkle proof 2017
  type?: string;
  proof?: MerklePath[];
}
