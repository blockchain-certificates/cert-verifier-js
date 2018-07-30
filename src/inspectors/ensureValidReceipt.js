import sha256 from 'sha256';
import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import { toByteArray } from '../helpers/data';

export default function ensureValidReceipt (receipt) {
  let proofHash = receipt.targetHash;
  const merkleRoot = receipt.merkleRoot;
  try {
    const proof = receipt.proof;
    const isProof = !!proof;
    if (isProof) {
      for (let index in proof) {
        const node = proof[index];
        let appendedBuffer;
        if (typeof node.left !== 'undefined') {
          appendedBuffer = toByteArray(`${node.left}${proofHash}`);
          proofHash = sha256(appendedBuffer);
        } else if (typeof node.right !== 'undefined') {
          appendedBuffer = toByteArray(`${proofHash}${node.right}`);
          proofHash = sha256(appendedBuffer);
        } else {
          throw new VerifierError(
            SUB_STEPS.checkReceipt,
            'We should never get here.'
          );
        }
      }
    }
  } catch (e) {
    throw new VerifierError(
      SUB_STEPS.checkReceipt,
      'The receipt is malformed. There was a problem navigating the merkle tree in the receipt.'
    );
  }

  if (proofHash !== merkleRoot) {
    throw new VerifierError(
      SUB_STEPS.checkReceipt,
      'Invalid Merkle Receipt. Proof hash did not match Merkle root'
    );
  }
}
