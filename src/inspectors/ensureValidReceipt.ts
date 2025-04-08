import sha256 from 'sha256';
import VerifierError from '../models/verifierError';
import { toByteArray } from '../helpers/data';
import { getText } from '../domain/i18n/useCases';
import type { Receipt } from '../models/Receipt';

export default function ensureValidReceipt (receipt: Receipt): void {
  let proofHash = receipt.targetHash;
  const merkleRoot = receipt.merkleRoot;

  try {
    const proof = receipt.proof ?? receipt.path;
    const isProof = !!proof;
    if (isProof) {
      for (const index in proof) {
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
            'checkReceipt',
            'Trigger catch error.'
          );
        }
      }
    }
  } catch (e) {
    throw new VerifierError(
      'checkReceipt',
      getText('errors', 'ensureValidReceipt')
    );
  }

  if (proofHash !== merkleRoot) {
    throw new VerifierError(
      'checkReceipt',
      getText('errors', 'invalidMerkleReceipt')
    );
  }
}
