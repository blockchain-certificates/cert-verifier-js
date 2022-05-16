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
