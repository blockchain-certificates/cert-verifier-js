import VerifierError from '../models/verifierError';
import { ProblemDetailsType } from '../models/ProblemDetails';
import { getText } from '../domain/i18n/useCases';

export default function ensureHashesEqual (actual: string, expected: string): boolean {
  if (actual !== expected) {
    throw new VerifierError('compareHashes', getText('errors', 'ensureHashesEqual'), ProblemDetailsType.CRYPTOGRAPHIC_SECURITY_ERROR);
  }

  return true;
}
