import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';

export default function ensureHashesEqual (actual, expected) {
  if (actual !== expected) {
    throw new VerifierError(
      SUB_STEPS.compareHashes,
      'Computed hash does not match remote hash'
    );
  }
}
