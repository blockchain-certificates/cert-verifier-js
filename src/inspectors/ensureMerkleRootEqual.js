import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import { getText } from '../domain/i18n/useCases';

export default function ensureMerkleRootEqual (merkleRoot, remoteHash) {
  if (merkleRoot !== remoteHash) {
    throw new VerifierError(
      SUB_STEPS.checkMerkleRoot,
      getText('errors', 'ensureMerkleRootEqual')
    );
  }
}
