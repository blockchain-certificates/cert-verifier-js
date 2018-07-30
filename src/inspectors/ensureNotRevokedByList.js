import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import domain from '../domain';

export default function ensureNotRevokedByList (revokedAssertions, assertionUid) {
  if (!revokedAssertions) {
    // nothing to do
    return;
  }
  const revokedAddresses = revokedAssertions.map(output => output.id);
  const revokedAssertionId = revokedAddresses.findIndex(
    id => id === assertionUid
  );
  const isRevokedByIssuer = revokedAssertionId !== -1;

  if (isRevokedByIssuer) {
    throw new VerifierError(
      SUB_STEPS.checkRevokedStatus,
      domain.certificates.generateRevocationReason(
        revokedAssertions[revokedAssertionId].revocationReason
      )
    );
  }
}
