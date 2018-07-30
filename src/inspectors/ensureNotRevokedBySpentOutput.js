import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import domain from '../domain';

export default function ensureNotRevokedBySpentOutput (
  revokedAddresses,
  issuerRevocationKey,
  recipientRevocationKey
) {
  if (issuerRevocationKey) {
    const revokedAssertionId = revokedAddresses.findIndex(
      address => address === issuerRevocationKey
    );
    const isRevokedByIssuer = revokedAssertionId !== -1;
    if (isRevokedByIssuer) {
      throw new VerifierError(
        SUB_STEPS.checkRevokedStatus,
        domain.certificates.generateRevocationReason(
          revokedAddresses[revokedAssertionId].revocationReason
        )
      );
    }
  }
  if (recipientRevocationKey) {
    const revokedAssertionId = revokedAddresses.findIndex(
      address => address === recipientRevocationKey
    );
    const isRevokedByRecipient = revokedAssertionId !== -1;
    if (isRevokedByRecipient) {
      throw new VerifierError(
        SUB_STEPS.checkRevokedStatus,
        domain.certificates.generateRevocationReason(
          revokedAddresses[revokedAssertionId].revocationReason
        )
      );
    }
  }
}
