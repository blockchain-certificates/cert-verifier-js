export interface MerkleProof2019 {
  type: string;
  created: string;
  proofValue: string;
  proofPurpose: string;
  verificationMethod: string;
}

export interface MerklePath {
  left?: string;
  right?: string;
}

export interface ProofValueMerkleProof2019 {
  path: MerklePath[];
  merkleRoot: string;
  targetHash: string;
  anchors: string[];
}
