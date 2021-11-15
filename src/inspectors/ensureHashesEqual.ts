import VerifierError from '../models/verifierError';
import { SUB_STEPS } from '../constants/verificationSubSteps';
import { getText } from '../domain/i18n/useCases';

export default function ensureHashesEqual (actual: string, expected: string): boolean {
  if (actual !== expected) {
    throw new VerifierError(SUB_STEPS.compareHashes, getText('errors', 'ensureHashesEqual'));
  }

  return true;
}
