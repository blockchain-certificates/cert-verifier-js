export interface MerkleProof2019 {
  type: string;
  created: string;
  proofValue: string;
  proofPurpose: string;
  verificationMethod: string;
}

interface MerklePath {
  left?: string;
  right?: string;
}

export interface ProofValue {
  path: MerklePath[];
  merkleRoot: string;
  targetHash: string;
  anchors: string[];
}
