import { dateToUnixTimestamp } from '../helpers/date';
import VerifierError from '../models/verifierError';
import { SUB_STEPS } from '../domain/verifier/entities/verificationSteps';
import { getText } from '../domain/i18n/useCases';
import domain from '../domain';

export default function ensureNotExpired (expires = null): void {
  if (!expires) {
    return;
  }
  const expiryDate = dateToUnixTimestamp(expires);
  const today = new Date();
  if (today.getTime() >= expiryDate) {
    throw new VerifierError(
      SUB_STEPS.checkExpiresDate,
      `${getText('errors', 'ensureNotExpired')}${domain.i18n.getDateFormat(expires)}`
    );
  }
}
