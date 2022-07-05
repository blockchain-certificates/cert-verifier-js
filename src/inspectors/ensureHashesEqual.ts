import VerifierError from '../models/VerifierError.js';
import domain from '../domain/index.js';

export default function ensureHashesEqual (actual: string, expected: string): boolean {
  if (actual !== expected) {
    throw new VerifierError('compareHashes', domain.i18n.getText('errors', 'ensureHashesEqual'));
  }

  return true;
}
