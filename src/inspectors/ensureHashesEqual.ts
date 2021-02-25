import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import { getText } from '../domain/i18n/useCases';

export default function ensureHashesEqual (actual, expected): boolean {
  if (actual !== expected) {
    throw new VerifierError(SUB_STEPS.compareHashes, getText('errors', 'ensureHashesEqual'));
  }

  return true;
}
