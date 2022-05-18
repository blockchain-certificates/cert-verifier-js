import type { BlockcertsV3 } from './BlockcertsV3';

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

export function getMerkleProof2019VerificationMethod (document: BlockcertsV3): string {
  return document.proof.verificationMethod;
}
