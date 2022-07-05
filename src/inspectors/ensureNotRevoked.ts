import VerifierError from '../models/VerifierError.js';
import { SUB_STEPS } from '../constants/verificationSteps.js';
import domain from '../domain/index.js';
import { intersect } from '../helpers/array.js';
import type { RevokedAssertion } from '../models/RevokedAssertions.js';

export default function ensureNotRevoked (revokedAddresses?: RevokedAssertion[], keys?: string | string[]): void {
  if (!revokedAddresses || !keys) {
    // nothing to do
    return;
  }

  if (!Array.isArray(keys)) {
    keys = [keys];
  }

  keys = keys.filter(key => key != null);

  const matches = intersect(keys, revokedAddresses.map(assertion => assertion.id));

  if (matches.length > 0) {
    const indexOfMatch = revokedAddresses.findIndex(address => address.id === matches[0]);

    if (indexOfMatch > -1) {
      throw new VerifierError(
        SUB_STEPS.checkRevokedStatus,
        domain.certificates.generateRevocationReason(
          revokedAddresses[indexOfMatch].revocationReason
        )
      );
    }
  }
}
