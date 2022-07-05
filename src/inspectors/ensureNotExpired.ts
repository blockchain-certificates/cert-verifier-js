import VerifierError from '../models/VerifierError.js';
import { dateToUnixTimestamp } from '../helpers/date.js';
import { SUB_STEPS } from '../constants/verificationSteps.js';
import domain from '../domain/index.js';

export default function ensureNotExpired (expires = null): void {
  if (!expires) {
    return;
  }
  const expiryDate = dateToUnixTimestamp(expires);
  const today = new Date();
  if (today.getTime() >= expiryDate) {
    throw new VerifierError(
      SUB_STEPS.checkExpiresDate,
      domain.i18n.getText('errors', 'ensureNotExpired')
    );
  }
}
