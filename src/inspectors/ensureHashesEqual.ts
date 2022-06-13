import VerifierError from '../models/verifierError';
import { getText } from '../domain/i18n/useCases';

export default function ensureHashesEqual (actual: string, expected: string): boolean {
  if (actual !== expected) {
    throw new VerifierError('compareHashes', getText('errors', 'ensureHashesEqual'));
  }

  return true;
}
