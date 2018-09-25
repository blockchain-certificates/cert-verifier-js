import { dateToUnixTimestamp } from '../helpers/date';
import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import { getText } from '../domain/i18n/useCases';

export default function ensureNotExpired (expires = null) {
  if (!expires) {
    return;
  }
  const expiryDate = dateToUnixTimestamp(expires);
  if (new Date() >= expiryDate) {
    throw new VerifierError(
      SUB_STEPS.checkExpiresDate,
      getText('errors', 'ensureNotExpired')
    );
  }
}
