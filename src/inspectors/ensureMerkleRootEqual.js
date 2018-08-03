import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';

export default function ensureMerkleRootEqual (merkleRoot, remoteHash) {
  if (merkleRoot !== remoteHash) {
    throw new VerifierError(
      SUB_STEPS.checkMerkleRoot,
      'Merkle root does not match remote hash.'
    );
  }
}
