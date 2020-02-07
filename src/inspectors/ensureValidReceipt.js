import sha256 from 'sha256';
import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import { isV3 } from '../constants/certificateVersions';
import { toByteArray } from '../helpers/data';
import { getText } from '../domain/i18n/useCases';

export default function ensureValidReceipt (receipt, version) {
  let proofHash = receipt.targetHash;
  const merkleRoot = receipt.merkleRoot;

  if (isV3(version) && !!receipt.proof) {
    throw new VerifierError(SUB_STEPS.checkReceipt, getText('errors', 'invalidMerkleVersion'));
  }

  try {
    const proof = receipt.proof || receipt.path;
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
            SUB_STEPS.checkReceipt,
            'Trigger catch error.'
          );
        }
      }
    }
  } catch (e) {
    throw new VerifierError(
      SUB_STEPS.checkReceipt,
      getText('errors', 'ensureValidReceipt')
    );
  }

  if (proofHash !== merkleRoot) {
    throw new VerifierError(
      SUB_STEPS.checkReceipt,
      getText('errors', 'invalidMerkleReceipt')
    );
  }
}
