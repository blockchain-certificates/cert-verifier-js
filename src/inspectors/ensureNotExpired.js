import { dateToUnixTimestamp } from '../helpers/date';
import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';

export default function ensureNotExpired (expires = null) {
  if (!expires) {
    return;
  }
  const expiryDate = dateToUnixTimestamp(expires);
  if (new Date() >= expiryDate) {
    throw new VerifierError(
      SUB_STEPS.checkExpiresDate,
      'This certificate has expired.'
    );
  }
}
